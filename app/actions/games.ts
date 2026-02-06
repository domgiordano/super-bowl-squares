'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function openGameAction(gameId: string, groupId: string) {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('games')
    .update({ status: 'open' })
    .eq('id', gameId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/groups/${groupId}/games/${gameId}`)
  return { success: true }
}

export async function randomizeGameNumbersAction(gameId: string, groupId: string) {
  const adminClient = createAdminClient()

  const { error } = await adminClient.rpc('randomize_game_numbers', {
    p_game_id: gameId,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/groups/${groupId}/games/${gameId}`)
  return { success: true }
}

export async function lockGameAction(gameId: string, groupId: string) {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('games')
    .update({ status: 'locked' })
    .eq('id', gameId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/groups/${groupId}/games/${gameId}`)
  return { success: true }
}
