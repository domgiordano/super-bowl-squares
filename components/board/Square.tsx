'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { WinnerBadge } from './WinnerBadge'

interface SquareProps {
  square: {
    id: string
    user_id: string | null
    display_name?: string | null
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

function getInitials(fullName: string | null, email: string | null, displayName?: string | null): string {
  // First try to get initials from full name
  if (fullName) {
    const nameParts = fullName.trim().split(' ').filter(Boolean)
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    }
    return nameParts[0][0].toUpperCase()
  }

  // Then try display name (for name-only members)
  if (displayName) {
    const nameParts = displayName.trim().split(' ').filter(Boolean)
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    }
    return nameParts[0][0].toUpperCase()
  }

  // Finally fall back to email if available
  if (email) {
    return email[0].toUpperCase()
  }

  return '?'
}

export function Square({
  square,
  onClick,
  isOwner,
  canClaim,
  wonQuarters = [],
  isCurrentWinner = false
}: SquareProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  // Display name: use profile full_name, or display_name, or email
  const displayName = square.profiles?.full_name || square.display_name || square.profiles?.email?.split('@')[0] || ''

  // Get initials from any available name source
  const initials = (square.profiles || square.display_name)
    ? getInitials(square.profiles?.full_name || null, square.profiles?.email || null, square.display_name)
    : ''

  // Tooltip text: show full name/email for authenticated users, display_name for name-only members
  const tooltipText = square.user_id
    ? `${square.profiles?.full_name || square.profiles?.email || 'Unknown'}`
    : square.display_name || ''

  // Square has an owner if either user_id or display_name is set
  const hasOwner = square.user_id !== null || !!square.display_name

  function handleClick(e: React.MouseEvent) {
    if (canClaim) {
      onClick()
    } else if (hasOwner) {
      // Toggle tooltip on click for claimed squares (useful on mobile)
      e.stopPropagation()
      setShowTooltip(!showTooltip)
      // Auto-hide after 3 seconds
      setTimeout(() => setShowTooltip(false), 3000)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        onMouseEnter={() => hasOwner && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={!canClaim && !hasOwner}
        className={cn(
          'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 border border-border flex items-center justify-center text-xs font-medium transition-all relative',
          {
            'bg-primary-blue/30 hover:bg-primary-blue/40 text-white': isOwner && !isCurrentWinner,
            'bg-primary-green/20 text-gray-300': square.user_id && !isOwner && !isCurrentWinner,
            'bg-card hover:bg-card-hover cursor-pointer hover:border-primary-green text-gray-400': canClaim,
            'bg-black/50 cursor-not-allowed text-gray-600': !canClaim && !square.user_id,
            'bg-yellow-400/30 border-2 border-yellow-500 animate-pulse text-white': isCurrentWinner,
            'cursor-pointer': hasOwner && !canClaim, // Make claimed squares clickable for tooltip
          }
        )}
      >
        <WinnerBadge quarters={wonQuarters} isCurrent={isCurrentWinner} />
        {initials && (
          <span className="font-bold text-sm sm:text-base">{initials}</span>
        )}
      </button>

      {/* Custom tooltip */}
      {showTooltip && tooltipText && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg border border-primary-green/50 whitespace-nowrap">
            {tooltipText}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
              <div className="border-[6px] border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
