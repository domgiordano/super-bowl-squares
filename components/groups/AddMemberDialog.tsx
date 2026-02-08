'use client'

import { useState } from 'react'
import { addMemberToGroupAction } from '@/app/actions/groups'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'

interface AddMemberDialogProps {
  groupId: string
}

export function AddMemberDialog({ groupId }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [name, setName] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const result = await addMemberToGroupAction({
      groupId,
      name: name.trim(),
    })

    if (result.success) {
      setSuccess(result.message)
      setName('')
      setTimeout(() => {
        setOpen(false)
        setSuccess('')
        router.refresh()
      }, 1500)
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary-blue/20 border-2 border-primary-blue text-primary-blue rounded-lg hover:bg-primary-blue/30 transition-all font-medium text-sm"
      >
        <UserPlus className="w-4 h-4" />
        <span>Add Member</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border-2 border-border rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-glow-primary">
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-4 sm:mb-6">Add Member</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Member Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 bg-black border-2 border-border rounded-lg focus:outline-none focus:border-primary-blue text-white placeholder-gray-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the member's name. They can claim their squares once added.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    setError('')
                    setSuccess('')
                  }}
                  className="flex-1 px-4 py-3 border-2 border-border rounded-lg hover:bg-card-hover text-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-primary text-black rounded-lg hover:shadow-glow-primary disabled:opacity-50 font-bold transition-all"
                >
                  {loading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
