'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeGame(gameId: string, onUpdate: () => void) {
  const supabase = createClient()

  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel(`game-updates-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        () => {
          onUpdate()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quarter_winners',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          onUpdate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId, onUpdate, supabase])
}
