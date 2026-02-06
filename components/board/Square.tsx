'use client'

import { cn } from '@/lib/utils/cn'
import { WinnerBadge } from './WinnerBadge'

interface SquareProps {
  square: {
    id: string
    user_id: string | null
    profiles?: {
      full_name: string | null
      email: string
    } | null
  }
  onClick: () => void
  isOwner: boolean
  canClaim: boolean
  wonQuarters?: string[]
  isCurrentWinner?: boolean
}

export function Square({
  square,
  onClick,
  isOwner,
  canClaim,
  wonQuarters = [],
  isCurrentWinner = false
}: SquareProps) {
  const displayName = square.profiles?.full_name || square.profiles?.email?.split('@')[0] || ''

  return (
    <button
      onClick={onClick}
      disabled={!canClaim}
      className={cn(
        'w-14 h-14 border border-border flex items-center justify-center text-xs font-medium transition-all relative',
        {
          'bg-primary-blue/30 hover:bg-primary-blue/40 text-white': isOwner && !isCurrentWinner,
          'bg-primary-green/20 text-gray-300': square.user_id && !isOwner && !isCurrentWinner,
          'bg-card hover:bg-card-hover cursor-pointer hover:border-primary-green text-gray-400': canClaim,
          'bg-black/50 cursor-not-allowed text-gray-600': !canClaim && !square.user_id,
          'bg-yellow-400/30 border-2 border-yellow-500 animate-pulse text-white': isCurrentWinner,
        }
      )}
      title={square.user_id ? displayName : 'Available'}
    >
      <WinnerBadge quarters={wonQuarters} isCurrent={isCurrentWinner} />
      {displayName && (
        <span className="truncate px-1 font-bold">{displayName}</span>
      )}
    </button>
  )
}
