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

export async function addMemberToGroupAction(params: {
  groupId: string
  name: string
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Not authenticated' }
  }

  // Verify user is admin of this group
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', params.groupId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return { success: false, message: 'Only admins can add members' }
  }

  const adminClient = createAdminClient()
  const trimmedName = params.name.trim()

  if (!trimmedName) {
    return { success: false, message: 'Name cannot be empty' }
  }

  // Check if a member with this display name already exists in the group
  const { data: existingMember } = await adminClient
    .from('group_members')
    .select('id')
    .eq('group_id', params.groupId)
    .eq('display_name', trimmedName)
    .single()

  if (existingMember) {
    return { success: false, message: 'A member with this name already exists in the group' }
  }

  // Add name-only member to group (no user_id)
  const { error: insertError } = await adminClient
    .from('group_members')
    .insert({
      group_id: params.groupId,
      user_id: null,
      display_name: trimmedName,
      role: 'member',
    })

  if (insertError) {
    console.error('Add member error:', insertError)
    return { success: false, message: insertError.message }
  }

  revalidatePath(`/groups/${params.groupId}`)
  return {
    success: true,
    message: `${trimmedName} added to group`
  }
}

export async function claimIdentityAction(params: {
  groupId: string
  memberId: string
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Not authenticated' }
  }

  const adminClient = createAdminClient()

  // Get the target unclaimed member
  const { data: targetMember } = await adminClient
    .from('group_members')
    .select('id, display_name, user_id')
    .eq('id', params.memberId)
    .eq('group_id', params.groupId)
    .single()

  if (!targetMember) {
    return { success: false, message: 'Member not found in this group' }
  }

  if (targetMember.user_id) {
    return { success: false, message: 'This identity has already been claimed' }
  }

  const displayName = targetMember.display_name

  // Check if the user already has their own membership in this group
  const { data: existingMembership } = await adminClient
    .from('group_members')
    .select('id')
    .eq('group_id', params.groupId)
    .eq('user_id', user.id)
    .single()

  if (existingMembership) {
    // User is already a member — merge: transfer squares/payments, then delete the unclaimed record
  } else {
    // User is not a member yet — link the unclaimed record to them
    const { error: memberError } = await adminClient
      .from('group_members')
      .update({ user_id: user.id })
      .eq('id', params.memberId)

    if (memberError) {
      console.error('Claim identity - member update error:', memberError)
      return { success: false, message: memberError.message }
    }
  }

  // Transfer all squares with this display_name in the group's games
  const { data: games } = await adminClient
    .from('games')
    .select('id')
    .eq('group_id', params.groupId)

  if (games && games.length > 0) {
    const gameIds = games.map(g => g.id)
    const { error: squaresError } = await adminClient
      .from('squares')
      .update({ user_id: user.id })
      .in('game_id', gameIds)
      .eq('display_name', displayName)

    if (squaresError) {
      console.error('Claim identity - squares transfer error:', squaresError)
    }
  }

  // Transfer payment records (delete display_name record since user may already have one)
  if (existingMembership) {
    // User already has a membership — just delete the orphaned display_name payment record
    await adminClient
      .from('user_payments')
      .delete()
      .eq('group_id', params.groupId)
      .eq('display_name', displayName)

    // Delete the unclaimed member record (user already has their own)
    await adminClient
      .from('group_members')
      .delete()
      .eq('id', params.memberId)
  } else {
    // User claimed the record — update payment to their user_id
    const { error: paymentError } = await adminClient
      .from('user_payments')
      .update({ user_id: user.id })
      .eq('group_id', params.groupId)
      .eq('display_name', displayName)

    if (paymentError) {
      console.error('Claim identity - payment transfer error:', paymentError)
    }
  }

  revalidatePath(`/groups/${params.groupId}`)
  revalidatePath('/dashboard')
  return { success: true, message: 'Identity claimed successfully' }
}

export async function joinGroupAsNewMemberAction(params: {
  groupId: string
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Not authenticated' }
  }

  const adminClient = createAdminClient()

  // Check the user isn't already a member
  const { data: existingMembership } = await adminClient
    .from('group_members')
    .select('id')
    .eq('group_id', params.groupId)
    .eq('user_id', user.id)
    .single()

  if (existingMembership) {
    return { success: false, message: 'You are already a member of this group' }
  }

  const { error } = await adminClient
    .from('group_members')
    .insert({
      group_id: params.groupId,
      user_id: user.id,
      role: 'member',
    })

  if (error) {
    console.error('Join group error:', error)
    return { success: false, message: error.message }
  }

  revalidatePath(`/groups/${params.groupId}`)
  revalidatePath('/dashboard')
  return { success: true, message: 'Joined group successfully' }
}
