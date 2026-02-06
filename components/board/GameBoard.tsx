'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Square } from './Square'
import { NumberRow } from './NumberRow'
import { PresenceIndicator } from './PresenceIndicator'
import { useRealtimeSquares } from '@/lib/hooks/useRealtime'
import { useRealtimeGame } from '@/lib/hooks/useRealtimeGame'
// import { usePresence } from '@/lib/hooks/usePresence'
import { Database } from '@/types/database.types'

type SquareData = Database['public']['Tables']['squares']['Row'] & {
  profiles?: {
    full_name: string | null
    email: string
  } | null
}

type GameData = Database['public']['Tables']['games']['Row'] & {
  home_score?: number
  away_score?: number
}

interface QuarterWinner {
  square_id: string
  quarter: string
}

interface GameBoardProps {
  gameId: string
  userId: string
  userEmail: string
  userName?: string
}

export function GameBoard({ gameId, userId, userEmail, userName }: GameBoardProps) {
  const [squares, setSquares] = useState<SquareData[]>([])
  const [game, setGame] = useState<GameData | null>(null)
  const [quarterWinners, setQuarterWinners] = useState<QuarterWinner[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const [squaresResult, gameResult, winnersResult] = await Promise.all([
      supabase
        .from('squares')
        .select('*, profiles(full_name, email)')
        .eq('game_id', gameId)
        .order('row')
        .order('col'),
      supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single(),
      supabase
        .from('quarter_winners')
        .select('square_id, quarter')
        .eq('game_id', gameId)
    ])

    if (squaresResult.data) setSquares(squaresResult.data as any)
    if (gameResult.data) setGame(gameResult.data as any)
    if (winnersResult.data) setQuarterWinners(winnersResult.data)
    setLoading(false)
  }, [gameId, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Real-time updates
  useRealtimeSquares(gameId, fetchData)
  useRealtimeGame(gameId, fetchData) // Also listen for game score updates

  // Presence tracking - temporarily disabled due to build error
  // const { onlineUsers } = usePresence(gameId, {
  //   user_id: userId,
  //   email: userEmail,
  //   full_name: userName,
  // })
  const onlineUsers: any[] = []

  async function handleSquareClick(squareId: string, row: number, col: number, currentVersion: number) {
    if (game?.status !== 'open') {
      alert('Game is not open for square selection')
      return
    }

    // Optimistic update
    setSquares(prev => prev.map(sq =>
      sq.id === squareId
        ? { ...sq, user_id: userId, profiles: { full_name: userName || null, email: userEmail } }
        : sq
    ))

    // Call claim function
    const { data, error } = await supabase.rpc('claim_square', {
      p_square_id: squareId,
      p_user_id: userId,
      p_game_id: gameId,
      p_expected_version: currentVersion,
    })

    if (error || !data?.[0]?.success) {
      // Revert optimistic update
      await fetchData()
      alert(data?.[0]?.message || 'Failed to claim square')
      return
    }
  }

  // Calculate current winner based on live scores
  const getCurrentWinningSquare = useCallback(() => {
    if (!game?.home_numbers || !game?.away_numbers || !game.home_score !== undefined || !game.away_score !== undefined) {
      return null
    }

    const homeDigit = (game.home_score || 0) % 10
    const awayDigit = (game.away_score || 0) % 10

    const homeIndex = game.home_numbers.indexOf(homeDigit)
    const awayIndex = game.away_numbers.indexOf(awayDigit)

    if (homeIndex === -1 || awayIndex === -1) return null

    return squares.find(s => s.row === homeIndex && s.col === awayIndex)?.id
  }, [game, squares])

  const currentWinningSquareId = getCurrentWinningSquare()

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading game board...</div>
  }

  if (squares.length === 0) {
    return (
      <div className="bg-card p-8 rounded-xl border-2 border-border">
        <p className="text-gray-400 text-center">
          No squares found. The game board is being set up...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PresenceIndicator users={onlineUsers} />

      <div className="inline-block border-2 border-primary-green/30 rounded-xl overflow-hidden shadow-card-glow">
        {/* Top numbers */}
        <div className="flex">
          <div className="w-14 h-14 bg-card border border-border" />
          <NumberRow numbers={game?.away_numbers || null} teamName={game?.away_team} />
        </div>

        {/* Grid with side numbers */}
        {Array.from({ length: 10 }).map((_, row) => (
          <div key={row} className="flex">
            {/* Side number */}
            <div className="w-14 h-14 flex items-center justify-center bg-card text-primary-green font-bold border border-border text-lg">
              {game?.home_numbers?.[row] ?? '?'}
            </div>

            {/* Row of squares */}
            {Array.from({ length: 10 }).map((_, col) => {
              const square = squares.find(s => s.row === row && s.col === col)
              if (!square) return null

              const wonQuarters = quarterWinners
                .filter(w => w.square_id === square.id)
                .map(w => w.quarter)
              const isCurrent = currentWinningSquareId === square.id

              return (
                <Square
                  key={square.id}
                  square={square}
                  onClick={() => handleSquareClick(square.id, row, col, square.version)}
                  isOwner={square.user_id === userId}
                  canClaim={!square.user_id && game?.status === 'open'}
                  wonQuarters={wonQuarters}
                  isCurrentWinner={isCurrent}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Team labels */}
      <div className="flex items-center gap-8 text-sm">
        <div className="text-gray-300">
          <span className="font-medium text-primary-green">↓ Vertical:</span> {game?.home_team}
        </div>
        <div className="text-gray-300">
          <span className="font-medium text-primary-blue">→ Horizontal:</span> {game?.away_team}
        </div>
      </div>
    </div>
  )
}
