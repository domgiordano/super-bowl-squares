'use client'

import { useState } from 'react'
import { claimIdentityAction, joinGroupAsNewMemberAction } from '@/app/actions/groups'
import { useRouter } from 'next/navigation'

interface UnclaimedMember {
  id: string
  display_name: string
}

interface ClaimIdentityDialogProps {
  groupId: string
  groupName: string
  unclaimedMembers: UnclaimedMember[]
}

export function ClaimIdentityDialog({ groupId, groupName, unclaimedMembers }: ClaimIdentityDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleClaim() {
    if (!selectedId) return
    setLoading(true)
    setError('')

    const result = await claimIdentityAction({ groupId, memberId: selectedId })

    if (result.success) {
      router.push(`/groups/${groupId}`)
    } else {
      setError(result.message || 'Failed to claim identity')
      setLoading(false)
    }
  }

  async function handleJoinAsNew() {
    setLoading(true)
    setError('')

    const result = await joinGroupAsNewMemberAction({ groupId })

    if (result.success) {
      router.push(`/groups/${groupId}`)
    } else {
      setError(result.message || 'Failed to join group')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-card border-2 border-border rounded-2xl p-6 sm:p-8 shadow-glow-primary">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Join {groupName}</h1>
        <p className="text-gray-400 text-sm mb-6">
          We found existing members in this group. Were you already added by the admin?
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2 mb-6">
          {unclaimedMembers.map(member => (
            <button
              key={member.id}
              onClick={() => setSelectedId(member.id)}
              disabled={loading}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedId === member.id
                  ? 'border-primary-green bg-primary-green/10'
                  : 'border-border hover:border-primary-blue hover:bg-card-hover'
              }`}
            >
              <div className="font-medium text-white text-lg">{member.display_name}</div>
              <div className="text-xs text-gray-400 mt-1">Click to claim this identity</div>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleClaim}
            disabled={!selectedId || loading}
            className="w-full px-4 py-3 bg-gradient-primary text-black rounded-lg hover:shadow-glow-primary disabled:opacity-50 font-bold transition-all"
          >
            {loading ? 'Claiming...' : 'Yes, This Is Me'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-gray-500">or</span>
            </div>
          </div>

          <button
            onClick={handleJoinAsNew}
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-border rounded-lg hover:bg-card-hover text-gray-300 font-medium transition-colors"
          >
            {loading ? 'Joining...' : "I'm Not Listed — Join as New Member"}
          </button>
        </div>
      </div>
    </div>
  )
}
