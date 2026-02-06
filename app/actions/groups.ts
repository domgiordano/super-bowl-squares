'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

export async function createGroupAction(formData: {
  name: string
  description?: string
  buyInAmount?: number
  payoutQ1?: number
  payoutQ2?: number
  payoutQ3?: number
  payoutFinal?: number
}) {
  // Use regular client for auth
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  console.log('Server Action - User:', user?.id)
  console.log('Server Action - User error:', userError)

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Use admin client for database operations (bypasses RLS)
  const adminClient = createAdminClient()

  // Ensure user profile exists
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    // Create profile if it doesn't exist
    const { error: createProfileError } = await adminClient
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
      })

    if (createProfileError) {
      return { success: false, error: `Profile error: ${createProfileError.message}` }
    }
  }

  const inviteCode = nanoid(10)

  console.log('About to create group with user.id:', user.id)

  // Create group
  const { data: group, error: groupError } = await adminClient
    .from('groups')
    .insert({
      name: formData.name,
      description: formData.description,
      created_by: user.id,
      invite_code: inviteCode,
      buy_in_amount: formData.buyInAmount || 0,
      payout_q1: formData.payoutQ1 || 25,
      payout_q2: formData.payoutQ2 || 25,
      payout_q3: formData.payoutQ3 || 25,
      payout_final: formData.payoutFinal || 25,
    })
    .select()
    .single()

  if (groupError) {
    console.error('Group creation error:', groupError)
    return { success: false, error: `Group creation failed: ${groupError.message}` }
  }

  console.log('Group created successfully:', group.id)

  // Add creator as admin member
  const { error: memberError } = await adminClient
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: user.id,
      role: 'admin',
    })

  if (memberError) {
    return { success: false, error: `Failed to add member: ${memberError.message}` }
  }

  // Auto-create Super Bowl game
  const { data: game, error: gameError } = await adminClient
    .from('games')
    .insert({
      group_id: group.id,
      name: 'Super Bowl LX',
      home_team: 'Seahawks',
      away_team: 'Patriots',
      status: 'setup',
      max_squares_per_user: 100, // Allow users to claim multiple squares
      created_by: user.id,
    })
    .select()
    .single()

  if (gameError) {
    return { success: false, error: `Game creation failed: ${gameError.message}` }
  }

  // Initialize the 100 squares for the game
  const { error: initError } = await adminClient.rpc('initialize_game_squares', {
    p_game_id: game.id
  })

  if (initError) {
    return { success: false, error: `Failed to initialize squares: ${initError.message}` }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/groups/${group.id}`)

  return { success: true, groupId: group.id }
}
