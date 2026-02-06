'use client'

import { Users } from 'lucide-react'

interface PresenceUser {
  user_id: string
  email: string
  full_name?: string
}

interface PresenceIndicatorProps {
  users: PresenceUser[]
}

export function PresenceIndicator({ users }: PresenceIndicatorProps) {
  if (users.length === 0) return null

  return (
    <div className="bg-white p-3 rounded-lg shadow border border-gray-200 inline-flex items-center gap-2">
      <Users className="w-4 h-4 text-gray-600" />
      <span className="text-sm text-gray-600">
        {users.length} {users.length === 1 ? 'person' : 'people'} viewing
      </span>
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((user) => (
          <div
            key={user.user_id}
            className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium border-2 border-white"
            title={user.full_name || user.email}
          >
            {(user.full_name || user.email)[0].toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  )
}
