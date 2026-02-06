import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// API Response types for different providers
interface SportsDataScore {
  GameKey: string
  Status: string // 'Scheduled', 'InProgress', 'Final'
  Quarter: string // 'Pregame', '1', '2', '3', '4', 'Final'
  HomeScore: number
  AwayScore: number
  HomeTeam: string
  AwayTeam: string
}

interface ApiFootballScore {
  fixture: {
    status: {
      short: string // '1H', '2H', 'HT', 'FT'
    }
  }
  goals: {
    home: number
    away: number
  }
  teams: {
    home: { name: string }
    away: { name: string }
  }
}

// Configuration - choose your API provider
const API_PROVIDER = process.env.SCORE_API_PROVIDER || 'sportsdata' // 'sportsdata', 'apify', 'sportradar'

async function fetchScoreFromSportsData(gameKey: string): Promise<SportsDataScore | null> {
  const apiKey = process.env.SPORTSDATA_API_KEY
  if (!apiKey) {
    console.error('SPORTSDATA_API_KEY not set')
    return null
  }

  try {
    // SportsData.io NFL Scores endpoint
    const response = await fetch(
      `https://api.sportsdata.io/v3/nfl/scores/json/ScoresByWeek/2026/POST/1?key=${apiKey}`,
      { next: { revalidate: 30 } } // Cache for 30 seconds
    )

    if (!response.ok) {
      console.error('SportsData API error:', response.status)
      return null
    }

    const games: SportsDataScore[] = await response.json()

    // Find the Super Bowl game (usually the only playoff game in this week)
    const superBowl = games.find(g =>
      g.Status === 'InProgress' || g.Status === 'Final'
    )

    return superBowl || null
  } catch (error) {
    console.error('Error fetching from SportsData:', error)
    return null
  }
}

async function fetchScoreFromApify(): Promise<any> {
  const apiToken = process.env.APIFY_API_TOKEN
  if (!apiToken) {
    console.error('APIFY_API_TOKEN not set')
    return null
  }

  try {
    // Apify NFL Scores API
    const response = await fetch(
      `https://api.apify.com/v2/acts/fresh_cliff~nfl-scores-api/runs/last/dataset/items?token=${apiToken}`,
      { next: { revalidate: 30 } }
    )

    if (!response.ok) {
      console.error('Apify API error:', response.status)
      return null
    }

    const data = await response.json()
    // Find Super Bowl game in the results
    const superBowl = data.find((game: any) =>
      game.status === 'live' || game.status === 'final'
    )

    return superBowl
  } catch (error) {
    console.error('Error fetching from Apify:', error)
    return null
  }
}

async function fetchScoreFromSportradar(gameId: string): Promise<any> {
  const apiKey = process.env.SPORTRADAR_API_KEY
  if (!apiKey) {
    console.error('SPORTRADAR_API_KEY not set')
    return null
  }

  try {
    // Sportradar NFL Game Summary
    const response = await fetch(
      `https://api.sportradar.us/nfl/official/trial/v7/en/games/${gameId}/summary.json?api_key=${apiKey}`,
      { next: { revalidate: 30 } }
    )

    if (!response.ok) {
      console.error('Sportradar API error:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching from Sportradar:', error)
    return null
  }
}

function mapQuarterToStatus(quarter: string, status: string): string {
  if (status === 'Final' || status === 'Closed') return 'final'
  if (status === 'Scheduled' || status === 'Pregame') return 'pregame'

  // Map quarter numbers
  const quarterMap: { [key: string]: string } = {
    '1': 'Q1',
    '2': 'Q2',
    '3': 'Q3',
    '4': 'Q4',
    'Halftime': 'Q2',
    'Half': 'Q2',
  }

  return quarterMap[quarter] || 'Q1'
}

export async function POST(request: Request) {
  try {
    const { gameId, externalGameKey } = await request.json()

    if (!gameId) {
      return NextResponse.json({ error: 'gameId required' }, { status: 400 })
    }

    // Fetch score from chosen API provider
    let scoreData: any = null

    switch (API_PROVIDER) {
      case 'sportsdata':
        scoreData = await fetchScoreFromSportsData(externalGameKey || 'LATEST')
        break
      case 'apify':
        scoreData = await fetchScoreFromApify()
        break
      case 'sportradar':
        scoreData = await fetchScoreFromSportradar(externalGameKey)
        break
      default:
        return NextResponse.json({ error: 'Invalid API provider' }, { status: 400 })
    }

    if (!scoreData) {
      return NextResponse.json({ error: 'No score data available' }, { status: 404 })
    }

    // Map API response to our format
    let homeScore: number
    let awayScore: number
    let currentQuarter: string

    if (API_PROVIDER === 'sportsdata') {
      homeScore = scoreData.HomeScore || 0
      awayScore = scoreData.AwayScore || 0
      currentQuarter = mapQuarterToStatus(scoreData.Quarter, scoreData.Status)
    } else if (API_PROVIDER === 'apify') {
      homeScore = scoreData.homeScore || 0
      awayScore = scoreData.awayScore || 0
      currentQuarter = scoreData.quarter || 'Q1'
    } else {
      // Sportradar format
      homeScore = scoreData.summary?.home?.points || 0
      awayScore = scoreData.summary?.away?.points || 0
      currentQuarter = mapQuarterToStatus(scoreData.quarter || '1', scoreData.status)
    }

    // Update game in Supabase
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('games')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        current_quarter: currentQuarter,
        last_score_update: new Date().toISOString(),
      })
      .eq('id', gameId)

    if (error) {
      console.error('Error updating game:', error)
      return NextResponse.json({ error: 'Failed to update game' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      homeScore,
      awayScore,
      currentQuarter,
      provider: API_PROVIDER
    })

  } catch (error) {
    console.error('Error in score update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint for manual testing
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get('gameId')
  const externalGameKey = searchParams.get('externalGameKey')

  if (!gameId) {
    return NextResponse.json({ error: 'gameId required' }, { status: 400 })
  }

  return POST(new Request(request.url, {
    method: 'POST',
    body: JSON.stringify({ gameId, externalGameKey })
  }))
}
