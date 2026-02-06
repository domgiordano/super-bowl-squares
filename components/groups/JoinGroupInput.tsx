'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function JoinGroupInput() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    // Ensure user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // Create profile if it doesn't exist
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url,
        })

      if (createProfileError) {
        setError(`Profile error: ${createProfileError.message}`)
        setLoading(false)
        return
      }
    }

    const trimmedCode = code.trim()

    // Use the function to find group by invite code (bypasses RLS)
    const { data: groups, error: groupError } = await supabase
      .rpc('get_group_by_invite_code', { code: trimmedCode })

    if (groupError) {
      console.error('Group lookup error:', groupError)
      setError(`Database error: ${groupError.message}`)
      setLoading(false)
      return
    }

    const group = groups?.[0]

    if (!group) {
      setError(`Invalid invite code: "${trimmedCode}". No group found with this code.`)
      setLoading(false)
      return
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      setError('You are already a member of this group')
      setLoading(false)
      return
    }

    // Add user to group
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'member',
      })

    if (memberError) {
      setError(`Failed to join group: ${memberError.message}`)
      setLoading(false)
      return
    }

    setOpen(false)
    setCode('')
    router.push(`/groups/${group.id}`)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto px-6 py-3 border-2 border-primary-blue text-primary-blue rounded-xl hover:bg-primary-blue/10 transition-all font-bold text-sm sm:text-base"
      >
        Join Group
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border-2 border-border rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-glow-primary">
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-4 sm:mb-6">Join Group</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                  Invite Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 10-character code"
                  required
                  className="w-full px-4 py-3 bg-black border-2 border-border rounded-lg focus:outline-none focus:border-primary-blue text-white placeholder-gray-500 transition-colors font-mono"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-3 border-2 border-border rounded-lg hover:bg-card-hover text-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-primary text-black rounded-lg hover:shadow-glow-primary disabled:opacity-50 font-bold transition-all"
                >
                  {loading ? 'Joining...' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
