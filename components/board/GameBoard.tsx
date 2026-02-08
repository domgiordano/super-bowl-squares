'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Square } from './Square'
import { NumberRow } from './NumberRow'
import { PresenceIndicator } from './PresenceIndicator'
import { AdminSquareAssign } from './AdminSquareAssign'
import { useRealtimeSquares } from '@/lib/hooks/useRealtime'
import { useRealtimeGame } from '@/lib/hooks/useRealtimeGame'
import { claimSquareAction, unclaimSquareAction, adminAssignSquareAction } from '@/app/actions/squares'
// import { usePresence } from '@/lib/hooks/usePresence'
import { Database } from '@/types/database.types'
import { Settings } from 'lucide-react'

type SquareData = Database['public']['Tables']['squares']['Row'] & {
  display_name?: string | null
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

interface Member {
  id: string
  user_id: string
  profiles: {
    id: string
    email: string
    full_name: string | null
  }
}

interface GameBoardProps {
  gameId: string
  userId: string
  userEmail: string
  userName?: string
  initialGame?: GameData
  isAdmin?: boolean
  groupMembers?: Member[]
}

export function GameBoard({ gameId, userId, userEmail, userName, initialGame, isAdmin = false, groupMembers = [] }: GameBoardProps) {
  const [squares, setSquares] = useState<SquareData[]>([])
  const [game, setGame] = useState<GameData | null>(initialGame || null)
  const [quarterWinners, setQuarterWinners] = useState<QuarterWinner[]>([])
  const [loading, setLoading] = useState(true)
  const [adminMode, setAdminMode] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState<{ id: string; position: string; version: number } | null>(null)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const [squaresResult, gameResult, winnersResult] = await Promise.all([
      supabase
        .from('squares')
        .select('*, display_name, profiles(full_name, email)')
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

  // Update game state when initialGame prop changes (after router.refresh)
  useEffect(() => {
    if (initialGame) {
      setGame(initialGame)
    }
  }, [initialGame])

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

  async function handleSquareClick(squareId: string, row: number, col: number, currentVersion: number, isOwner: boolean) {
    if (game?.status !== 'open') {
      alert('Game is not open for square selection')
      return
    }

    // If in admin mode, show member selector
    if (adminMode && isAdmin) {
      setSelectedSquare({
        id: squareId,
        position: `${row},${col}`,
        version: currentVersion,
      })
      return
    }

    // Check if user is unclaiming their own square
    if (isOwner) {
      // Optimistic update - unclaim
      setSquares(prev => prev.map(sq =>
        sq.id === squareId
          ? { ...sq, user_id: null, profiles: null }
          : sq
      ))

      // Call unclaim function
      const result = await unclaimSquareAction({
        squareId,
        gameId,
      })

      if (!result.success) {
        // Revert optimistic update
        await fetchData()
        alert(result.message || 'Failed to unclaim square')
        return
      }
    } else {
      // Optimistic update - claim
      setSquares(prev => prev.map(sq =>
        sq.id === squareId
          ? { ...sq, user_id: userId, profiles: { full_name: userName || null, email: userEmail } }
          : sq
      ))

      // Call claim function via server action
      const result = await claimSquareAction({
        squareId,
        gameId,
        expectedVersion: currentVersion,
      })

      if (!result.success) {
        // Revert optimistic update
        await fetchData()
        alert(result.message || 'Failed to claim square')
        return
      }
    }
  }

  async function handleAdminAssign(targetMemberId: string) {
    if (!selectedSquare) return

    // Find target member for optimistic update
    const targetMember = groupMembers.find(m => m.id === targetMemberId)

    // Optimistic update
    setSquares(prev => prev.map(sq =>
      sq.id === selectedSquare.id
        ? {
            ...sq,
            user_id: targetMember?.user_id || null,
            display_name: (targetMember as any)?.display_name || null,
            profiles: targetMember?.profiles ? {
              full_name: targetMember.profiles.full_name,
              email: targetMember.profiles.email
            } : null
          }
        : sq
    ))

    const result = await adminAssignSquareAction({
      squareId: selectedSquare.id,
      gameId,
      targetMemberId,
      expectedVersion: selectedSquare.version,
    })

    if (!result.success) {
      // Revert optimistic update
      await fetchData()
      alert(result.message || 'Failed to assign square')
    }

    setSelectedSquare(null)
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
      {isAdmin && game?.status === 'open' && (
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border-2 border-border">
          <div>
            <h3 className="font-medium text-white">Admin Mode</h3>
            <p className="text-xs text-gray-400 mt-1">
              {adminMode ? 'Click any square to assign it to a member' : 'Toggle to assign squares to members'}
            </p>
          </div>
          <button
            onClick={() => setAdminMode(!adminMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              adminMode
                ? 'bg-primary-green/20 border-2 border-primary-green text-primary-green'
                : 'bg-card-hover border-2 border-border text-gray-300 hover:border-primary-blue'
            }`}
          >
            <Settings className="w-4 h-4" />
            {adminMode ? 'Exit Admin Mode' : 'Enter Admin Mode'}
          </button>
        </div>
      )}

      <PresenceIndicator users={onlineUsers} />

      <div className="overflow-x-auto">
        <div className="inline-block border-2 border-primary-green/30 rounded-xl overflow-hidden shadow-card-glow min-w-min">
          {/* Top numbers */}
          <div className="flex">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-card border border-border" />
            <NumberRow numbers={game?.away_numbers || null} teamName={game?.away_team} />
          </div>

          {/* Grid with side numbers */}
          {Array.from({ length: 10 }).map((_, row) => (
            <div key={row} className="flex">
              {/* Side number */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center bg-card text-primary-green font-bold border border-border text-sm sm:text-base md:text-lg">
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
                const isOwner = square.user_id === userId

                // In admin mode, any square is clickable
                const canClick = adminMode
                  ? game?.status === 'open'
                  : ((!square.user_id || isOwner) && game?.status === 'open')

                return (
                  <Square
                    key={square.id}
                    square={square}
                    onClick={() => handleSquareClick(square.id, row, col, square.version, isOwner)}
                    isOwner={isOwner}
                    canClaim={canClick}
                    wonQuarters={wonQuarters}
                    isCurrentWinner={isCurrent}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Team labels */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-sm">
        <div className="text-gray-300">
          <span className="font-medium text-primary-green">↓ Vertical:</span> {game?.home_team}
        </div>
        <div className="text-gray-300">
          <span className="font-medium text-primary-blue">→ Horizontal:</span> {game?.away_team}
        </div>
      </div>

      {/* Admin square assignment modal */}
      {selectedSquare && (
        <AdminSquareAssign
          members={groupMembers}
          onAssign={handleAdminAssign}
          onCancel={() => setSelectedSquare(null)}
          squarePosition={selectedSquare.position}
        />
      )}
    </div>
  )
}
