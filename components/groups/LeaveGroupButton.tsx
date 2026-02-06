'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

interface LeaveGroupButtonProps {
  groupId: string
  groupName: string
  userId: string
}

export function LeaveGroupButton({ groupId, groupName, userId }: LeaveGroupButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLeave() {
    setLoading(true)
    setError('')

    // Remove user from group_members
    const { error: leaveError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)

    if (leaveError) {
      setError(`Failed to leave group: ${leaveError.message}`)
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
        className="px-4 py-2 border-2 border-yellow-500 text-yellow-500 rounded-lg hover:bg-yellow-500/10 transition-all font-medium text-sm flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Leave Group
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border-2 border-yellow-500 rounded-2xl p-8 w-full max-w-md shadow-glow-primary">
            <h2 className="text-3xl font-bold text-yellow-500 mb-4">Leave Group</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <p className="text-gray-300 mb-6">
              Are you sure you want to leave <span className="font-bold text-white">"{groupName}"</span>?
              You'll need an invite code to rejoin.
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
                onClick={handleLeave}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 disabled:opacity-50 font-bold transition-all"
              >
                {loading ? 'Leaving...' : 'Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
