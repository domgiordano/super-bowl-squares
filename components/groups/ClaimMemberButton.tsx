'use client'

import { useState } from 'react'
import { claimIdentityAction } from '@/app/actions/groups'
import { useRouter } from 'next/navigation'

interface ClaimMemberButtonProps {
  groupId: string
  memberId: string
  displayName: string
}

export function ClaimMemberButton({ groupId, memberId, displayName }: ClaimMemberButtonProps) {
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  async function handleClaim() {
    setLoading(true)
    const result = await claimIdentityAction({ groupId, memberId })

    if (result.success) {
      router.refresh()
    } else {
      alert(result.message || 'Failed to claim identity')
    }
    setLoading(false)
    setConfirming(false)
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Claim as you?</span>
        <button
          onClick={handleClaim}
          disabled={loading}
          className="px-2 py-1 bg-primary-green text-black rounded text-xs font-bold hover:shadow-glow-primary transition-all disabled:opacity-50"
        >
          {loading ? '...' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2 py-1 border border-border rounded text-xs text-gray-400 hover:bg-card-hover transition-colors"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1 bg-primary-blue/20 border border-primary-blue text-primary-blue rounded-lg text-xs font-medium hover:bg-primary-blue/30 transition-all"
    >
      Claim
    </button>
  )
}
