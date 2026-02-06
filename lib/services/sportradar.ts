// SportsRadar API integration for live NFL scores
// API Docs: https://developer.sportradar.com/docs/read/american_football/NFL_v7

const SPORTRADAR_API_KEY = process.env.SPORTRADAR_API_KEY
const BASE_URL = 'https://api.sportradar.us/nfl/official/trial/v7/en'

interface SportsRadarGame {
  id: string
  status: 'scheduled' | 'inprogress' | 'halftime' | 'complete' | 'closed'
  home: {
    name: string
    alias: string
    points: number
  }
  away: {
    name: string
    alias: string
    points: number
  }
  quarter?: number
  clock?: string
}

interface SportsRadarSchedule {
  week: {
    games: SportsRadarGame[]
  }[]
}

export async function fetchSuperbowlScore() {
  if (!SPORTRADAR_API_KEY) {
    throw new Error('SPORTRADAR_API_KEY is not configured')
  }

  try {
    // For Super Bowl, we'll fetch the current season's playoff schedule
    // Super Bowl is typically the last game of the postseason
    const currentYear = new Date().getFullYear()
    const season = currentYear - (new Date().getMonth() < 6 ? 1 : 0) // NFL season year

    const response = await fetch(
      `${BASE_URL}/games/${season}/PST/schedule.json?api_key=${SPORTRADAR_API_KEY}`,
      { next: { revalidate: 30 } } // Cache for 30 seconds
    )

    if (!response.ok) {
      throw new Error(`SportsRadar API error: ${response.status}`)
    }

    const data: SportsRadarSchedule = await response.json()

    // Find Super Bowl game (last game in playoffs, typically "Super Bowl" in title)
    let superBowlGame: SportsRadarGame | null = null

    // Iterate through playoff weeks to find Super Bowl
    for (const week of data.week || []) {
      for (const game of week.games || []) {
        // Super Bowl games typically have specific naming
        // For now, we'll get the most recent playoff game
        if (game.status === 'inprogress' || game.status === 'halftime' || game.status === 'complete') {
          superBowlGame = game
        }
      }
    }

    if (!superBowlGame && data.week?.length) {
      // If no game in progress, get the latest scheduled Super Bowl game
      const lastWeek = data.week[data.week.length - 1]
      superBowlGame = lastWeek.games?.[0] || null
    }

    if (!superBowlGame) {
      return null
    }

    // Map quarter number to display string
    const getQuarter = (status: string, quarter?: number): string => {
      if (status === 'scheduled') return 'pregame'
      if (status === 'halftime') return 'Q2'
      if (status === 'complete' || status === 'closed') return 'final'
      return `Q${quarter || 1}`
    }

    return {
      homeTeam: superBowlGame.home.alias,
      awayTeam: superBowlGame.away.alias,
      homeScore: superBowlGame.home.points || 0,
      awayScore: superBowlGame.away.points || 0,
      quarter: getQuarter(superBowlGame.status, superBowlGame.quarter),
      status: superBowlGame.status,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Failed to fetch SportsRadar score:', error)
    return null
  }
}

// Alternative: Fetch specific game by ID if you know the Super Bowl game ID
export async function fetchGameScore(gameId: string) {
  if (!SPORTRADAR_API_KEY) {
    throw new Error('SPORTRADAR_API_KEY is not configured')
  }

  try {
    const response = await fetch(
      `${BASE_URL}/games/${gameId}/boxscore.json?api_key=${SPORTRADAR_API_KEY}`,
      { next: { revalidate: 30 } }
    )

    if (!response.ok) {
      throw new Error(`SportsRadar API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch game score:', error)
    return null
  }
}
