'use client'

import Link from 'next/link'

interface Group {
  id: string
  name: string
  description: string | null
  created_at: string
}

export function GroupList({ groups }: { groups: Group[] }) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">No groups yet. Create your first group to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <Link
          key={group.id}
          href={`/groups/${group.id}`}
          className="block p-6 bg-card rounded-xl shadow-card-glow hover:bg-card-hover border-2 border-border hover:border-primary-green transition-all transform hover:scale-105"
        >
          <h3 className="text-2xl font-bold mb-2 text-white">{group.name}</h3>
          {group.description && (
            <p className="text-gray-300 text-sm">{group.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-4">
            Created {new Date(group.created_at).toLocaleDateString()}
          </p>
        </Link>
      ))}
    </div>
  )
}
