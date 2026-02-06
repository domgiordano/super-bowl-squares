'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateGameScores } from '@/app/actions/scores'
import { RefreshCw, Trophy } from 'lucide-react'

interface ScoreBoardProps {
  gameId: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  currentQuarter: string
  isCreator: boolean
  lastUpdate?: string
}

export function ScoreBoard({
  gameId,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  currentQuarter,
  isCreator,
  lastUpdate
}: ScoreBoardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRefreshScores() {
    setLoading(true)
    const result = await updateGameScores(gameId)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to fetch live scores')
    }

    setLoading(false)
  }

  const formatQuarter = (q: string) => {
    if (q === 'pregame') return 'Pre-Game'
    if (q === 'final') return 'Final'
    if (q === 'Q2') return 'Q2 (Halftime)'
    return q
  }

  const formatLastUpdate = (timestamp?: string) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="bg-card rounded-xl shadow-card-glow p-6 border-2 border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-primary-green flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Live Score
        </h2>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-primary-green/20 text-primary-green rounded-lg text-sm font-bold border border-primary-green/50">
            {formatQuarter(currentQuarter)}
          </span>
          {isCreator && (
            <button
              onClick={handleRefreshScores}
              disabled={loading}
              className="px-3 py-2 bg-primary-blue text-white rounded-lg hover:shadow-glow-blue transition-all font-bold text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-4">
        <div className="text-center p-4 bg-black rounded-lg border-2 border-primary-green/30">
          <div className="text-primary-green text-sm font-medium mb-2">{homeTeam}</div>
          <div className="text-6xl font-bold text-white">{homeScore}</div>
        </div>
        <div className="text-center p-4 bg-black rounded-lg border-2 border-primary-blue/30">
          <div className="text-primary-blue text-sm font-medium mb-2">{awayTeam}</div>
          <div className="text-6xl font-bold text-white">{awayScore}</div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400">
        Last updated: {formatLastUpdate(lastUpdate)}
      </div>

      {currentQuarter === 'final' && (
        <div className="mt-4 p-3 bg-primary-green/10 border border-primary-green/30 rounded-lg text-center">
          <span className="text-primary-green font-bold">🏆 Game Final</span>
        </div>
      )}
    </div>
  )
}
