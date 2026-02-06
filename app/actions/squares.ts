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
