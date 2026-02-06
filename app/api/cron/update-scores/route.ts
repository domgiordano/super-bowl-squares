import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Vercel Cron Job endpoint
// Runs automatically every 30 seconds during game time
// Configure in vercel.json

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createServerSupabaseClient()

    // Find all games that are currently in progress
    const { data: activeGames } = await supabase
      .from('games')
      .select('id, external_game_key, current_quarter')
      .in('current_quarter', ['Q1', 'Q2', 'Q3', 'Q4']) // Only update active games
      .eq('status', 'locked') // Games with numbers assigned

    if (!activeGames || activeGames.length === 0) {
      return NextResponse.json({
        message: 'No active games to update',
        updated: 0
      })
    }

    // Update each game
    const results = await Promise.all(
      activeGames.map(async (game) => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/scores/update`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                gameId: game.id,
                externalGameKey: game.external_game_key
              })
            }
          )

          return {
            gameId: game.id,
            success: response.ok,
            status: response.status
          }
        } catch (error) {
          return {
            gameId: game.id,
            success: false,
            error: String(error)
          }
        }
      })
    )

    const successCount = results.filter(r => r.success).length

    return NextResponse.json({
      message: 'Score update complete',
      updated: successCount,
      total: activeGames.length,
      results
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: String(error)
    }, { status: 500 })
  }
}
