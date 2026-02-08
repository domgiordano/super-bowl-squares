'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
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

  // Shuffle 0-9 for each axis independently (done in JS instead of DB function
  // so we don't force status to 'locked')
  const shuffle = () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  const { error } = await adminClient
    .from('games')
    .update({
      home_numbers: shuffle(),
      away_numbers: shuffle(),
      numbers_assigned_at: new Date().toISOString(),
    })
    .eq('id', gameId)

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

function validateNumbersArray(numbers: number[]): boolean {
  if (numbers.length !== 10) return false
  const sorted = [...numbers].sort((a, b) => a - b)
  return sorted.every((n, i) => n === i)
}

export async function updateGameNumbersAction(
  gameId: string,
  groupId: string,
  homeNumbers: number[],
  awayNumbers: number[]
) {
  // Validate inputs
  if (!validateNumbersArray(homeNumbers)) {
    return { success: false, error: 'Home axis must contain exactly one of each digit 0-9' }
  }
  if (!validateNumbersArray(awayNumbers)) {
    return { success: false, error: 'Away axis must contain exactly one of each digit 0-9' }
  }

  // Verify caller is authenticated and is admin
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const adminClient = createAdminClient()

  const { data: membership } = await adminClient
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return { success: false, error: 'Only admins can edit axis numbers' }
  }

  // Update the game numbers
  const { error } = await adminClient
    .from('games')
    .update({
      home_numbers: homeNumbers,
      away_numbers: awayNumbers,
      numbers_assigned_at: new Date().toISOString(),
    })
    .eq('id', gameId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/groups/${groupId}/games/${gameId}`)
  return { success: true }
}
