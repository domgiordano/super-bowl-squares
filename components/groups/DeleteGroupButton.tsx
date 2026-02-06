'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface DeleteGroupButtonProps {
  groupId: string
  groupName: string
}

export function DeleteGroupButton({ groupId, groupName }: DeleteGroupButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    setLoading(true)
    setError('')

    // Delete group (cascades to members, games, squares via DB)
    const { error: deleteError } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId)

    if (deleteError) {
      setError(`Failed to delete group: ${deleteError.message}`)
      setLoading(false)
      return
    }

    setOpen(false)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-all font-medium text-sm flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Delete Group
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border-2 border-red-500 rounded-2xl p-8 w-full max-w-md shadow-glow-primary">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Delete Group</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-bold text-white">"{groupName}"</span>?
              This will permanently delete the group, all games, and all square selections. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 border-2 border-border rounded-lg hover:bg-card-hover text-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-bold transition-all"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
