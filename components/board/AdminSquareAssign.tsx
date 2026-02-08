'use client'

import { useState } from 'react'

interface Member {
  id: string
  user_id: string | null
  display_name?: string | null
  profiles?: {
    id: string
    email: string
    full_name: string | null
  } | null
}

interface AdminSquareAssignProps {
  members: Member[]
  onAssign: (memberId: string) => void
  onCancel: () => void
  squarePosition: string
}

export function AdminSquareAssign({ members, onAssign, onCancel, squarePosition }: AdminSquareAssignProps) {
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter members based on search term
  const filteredMembers = members.filter(member => {
    const displayName = member.display_name || member.profiles?.full_name || member.profiles?.email || ''
    const email = member.profiles?.email || ''
    const searchLower = searchTerm.toLowerCase()

    return displayName.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower)
  })

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border-2 border-border rounded-2xl p-6 w-full max-w-md shadow-glow-primary">
        <h3 className="text-xl font-bold gradient-text mb-2">Assign Square {squarePosition}</h3>
        <p className="text-gray-400 text-sm mb-4">Search and select a member to assign this square to:</p>

        {/* Search input */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search members..."
            autoFocus
            className="w-full px-4 py-3 bg-black border-2 border-border rounded-lg focus:outline-none focus:border-primary-blue text-white placeholder-gray-500 transition-colors"
          />
          {filteredMembers.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Members list */}
        <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
          {filteredMembers.length > 0 ? (
            filteredMembers.map(member => {
              const displayName = member.display_name || member.profiles?.full_name || member.profiles?.email || 'Unknown'
              const secondaryInfo = member.profiles?.full_name ? member.profiles.email : null

              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedMemberId === member.id
                      ? 'border-primary-green bg-primary-green/10'
                      : 'border-border hover:border-primary-blue hover:bg-card-hover'
                  }`}
                >
                  <div className="font-medium text-white">
                    {displayName}
                  </div>
                  {secondaryInfo && (
                    <div className="text-xs text-gray-400">{secondaryInfo}</div>
                  )}
                </button>
              )
            })
          ) : (
            <div className="text-center py-8 text-gray-400">
              No members found matching "{searchTerm}"
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border-2 border-border rounded-lg hover:bg-card-hover text-gray-300 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedMemberId && onAssign(selectedMemberId)}
            disabled={!selectedMemberId}
            className="flex-1 px-4 py-3 bg-gradient-primary text-black rounded-lg hover:shadow-glow-primary disabled:opacity-50 font-bold transition-all"
          >
            Assign Square
          </button>
        </div>
      </div>
    </div>
  )
}
