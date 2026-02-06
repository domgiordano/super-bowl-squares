'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function claimSquareAction(params: {
  squareId: string
  gameId: string
  expectedVersion: number
}) {
  // Get authenticated user
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Not authenticated' }
  }

  // Use admin client to bypass RLS
  const adminClient = createAdminClient()

  const { data, error } = await adminClient.rpc('claim_square', {
    p_square_id: params.squareId,
    p_user_id: user.id,
    p_game_id: params.gameId,
    p_expected_version: params.expectedVersion,
  })

  if (error) {
    console.error('Claim square error:', error)
    return { success: false, message: error.message }
  }

  if (!data || data.length === 0 || !data[0].success) {
    return { success: false, message: data?.[0]?.message || 'Failed to claim square' }
  }

  return { success: true, message: data[0].message }
}

export async function unclaimSquareAction(params: {
  squareId: string
  gameId: string
}) {
  // Get authenticated user
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Not authenticated' }
  }

  // Use admin client to bypass RLS
  const adminClient = createAdminClient()

  // Verify the game is still open
  const { data: game } = await adminClient
    .from('games')
    .select('status')
    .eq('id', params.gameId)
    .single()

  if (game?.status !== 'open') {
    return { success: false, message: 'Game is not open for unclaiming' }
  }

  // Verify the user owns this square
  const { data: square } = await adminClient
    .from('squares')
    .select('user_id')
    .eq('id', params.squareId)
    .single()

  if (square?.user_id !== user.id) {
    return { success: false, message: 'You do not own this square' }
  }

  // Unclaim the square
  const { error } = await adminClient
    .from('squares')
    .update({
      user_id: null,
      version: (square as any).version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.squareId)

  if (error) {
    console.error('Unclaim square error:', error)
    return { success: false, message: error.message }
  }

  return { success: true, message: 'Square unclaimed successfully' }
}
