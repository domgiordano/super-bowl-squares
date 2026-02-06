'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { fetchSuperbowlScore } from '@/lib/services/sportradar'

export async function updateGameScores(gameId: string) {
  const scoreData = await fetchSuperbowlScore()

  if (!scoreData) {
    return { success: false, error: 'Failed to fetch live scores' }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('games')
    .update({
      home_score: scoreData.homeScore,
      away_score: scoreData.awayScore,
      current_quarter: scoreData.quarter,
      last_score_update: scoreData.lastUpdated,
    })
    .eq('id', gameId)

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    data: scoreData,
  }
}
