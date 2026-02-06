'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeSquares(gameId: string, onUpdate: () => void) {
  const supabase = createClient()

  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'squares',
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
