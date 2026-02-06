'use client'

import { useState } from 'react'
import { openGameAction, randomizeGameNumbersAction, lockGameAction } from '@/app/actions/games'
import { useRouter } from 'next/navigation'

interface AdminControlsProps {
  gameId: string
  groupId: string
  gameStatus: string
}

export function AdminControls({ gameId, groupId, gameStatus }: AdminControlsProps) {
  const [loading, setLoading] = useState(false)
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
            Randomize Numbers & Lock
          </button>
        </>
      )}

      {gameStatus === 'locked' && (
        <button
          onClick={handleOpenGame}
          disabled={loading}
          className="px-6 py-3 bg-primary-green text-black rounded-xl hover:shadow-glow-primary transition-all font-bold disabled:opacity-50"
        >
          Unlock Game
        </button>
      )}
    </div>
  )
}
