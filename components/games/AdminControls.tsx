'use client'

import { useState } from 'react'
import { openGameAction, randomizeGameNumbersAction, lockGameAction } from '@/app/actions/games'
import { AxisNumberEditor } from '@/components/board/AxisNumberEditor'
import { useRouter } from 'next/navigation'

interface AdminControlsProps {
  gameId: string
  groupId: string
  gameStatus: string
  homeTeam: string
  awayTeam: string
  homeNumbers: number[] | null
  awayNumbers: number[] | null
}

export function AdminControls({ gameId, groupId, gameStatus, homeTeam, awayTeam, homeNumbers, awayNumbers }: AdminControlsProps) {
  const [loading, setLoading] = useState(false)
  const [showNumberEditor, setShowNumberEditor] = useState(false)
  const router = useRouter()

  async function handleOpenGame() {
    setLoading(true)
    const result = await openGameAction(gameId, groupId)
    if (!result.success) {
      alert(result.error || 'Failed to open game')
    }
    router.refresh()
    setLoading(false)
  }

  async function handleRandomizeNumbers() {
    setLoading(true)
    const result = await randomizeGameNumbersAction(gameId, groupId)
    if (!result.success) {
      alert(result.error || 'Failed to randomize numbers')
    }
    router.refresh()
    setLoading(false)
  }

  async function handleLockGame() {
    setLoading(true)
    const result = await lockGameAction(gameId, groupId)
    if (!result.success) {
      alert(result.error || 'Failed to lock game')
    }
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      <div className="mt-6 flex gap-3 flex-wrap">
        {gameStatus === 'setup' && (
          <button
            onClick={handleOpenGame}
            disabled={loading}
            className="px-6 py-3 bg-gradient-primary text-black rounded-xl hover:shadow-glow-primary transition-all font-bold disabled:opacity-50"
          >
            Open for Selection
          </button>
        )}

        {gameStatus === 'open' && (
          <>
            <button
              onClick={handleRandomizeNumbers}
              disabled={loading}
              className="px-6 py-3 bg-primary-blue text-white rounded-xl hover:shadow-glow-blue transition-all font-bold disabled:opacity-50"
            >
              Randomize Numbers
            </button>
            <button
              onClick={() => setShowNumberEditor(true)}
              disabled={loading}
              className="px-6 py-3 bg-card border-2 border-primary-blue text-primary-blue rounded-xl hover:bg-primary-blue/10 transition-all font-bold disabled:opacity-50"
            >
              Set Numbers Manually
            </button>
            <button
              onClick={handleLockGame}
              disabled={loading}
              className="px-6 py-3 bg-red-500/80 text-white rounded-xl hover:bg-red-500 transition-all font-bold disabled:opacity-50"
            >
              Lock Game
            </button>
          </>
        )}

        {gameStatus === 'locked' && (
          <>
            <button
              onClick={handleOpenGame}
              disabled={loading}
              className="px-6 py-3 bg-primary-green text-black rounded-xl hover:shadow-glow-primary transition-all font-bold disabled:opacity-50"
            >
              Unlock Game
            </button>
            <button
              onClick={handleRandomizeNumbers}
              disabled={loading}
              className="px-6 py-3 bg-primary-blue text-white rounded-xl hover:shadow-glow-blue transition-all font-bold disabled:opacity-50"
            >
              Randomize Numbers
            </button>
            <button
              onClick={() => setShowNumberEditor(true)}
              disabled={loading}
              className="px-6 py-3 bg-card border-2 border-primary-green text-primary-green rounded-xl hover:bg-primary-green/10 transition-all font-bold disabled:opacity-50"
            >
              Edit Numbers
            </button>
          </>
        )}
      </div>

      {showNumberEditor && (
        <AxisNumberEditor
          gameId={gameId}
          groupId={groupId}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          currentHomeNumbers={homeNumbers}
          currentAwayNumbers={awayNumbers}
          onClose={() => setShowNumberEditor(false)}
        />
      )}
    </>
  )
}
