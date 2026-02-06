'use client'

import { useEffect, useRef } from 'react'

interface UseAutoScoreUpdateProps {
  gameId: string
  enabled: boolean // Only poll when game is in progress
  interval?: number // Polling interval in milliseconds (default: 30 seconds)
  externalGameKey?: string // Optional external API game identifier
}

export function useAutoScoreUpdate({
  gameId,
  enabled,
  interval = 30000, // 30 seconds default
  externalGameKey
}: UseAutoScoreUpdateProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    async function updateScore() {
      try {
        const response = await fetch('/api/scores/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gameId,
            externalGameKey
          }),
        })

        if (!response.ok) {
          console.error('Failed to update score:', response.status)
          return
        }

        const data = await response.json()
        console.log('Score updated:', data)
      } catch (error) {
        console.error('Error updating score:', error)
      }
    }

    // Update immediately on mount
    updateScore()

    // Then poll at interval
    intervalRef.current = setInterval(updateScore, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [gameId, enabled, interval, externalGameKey])
}
