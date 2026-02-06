'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGroupAction } from '@/app/actions/groups'

export function CreateGroupDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [buyInAmount, setBuyInAmount] = useState('10')
  const [payoutQ1, setPayoutQ1] = useState('25')
  const [payoutQ2, setPayoutQ2] = useState('25')
  const [payoutQ3, setPayoutQ3] = useState('25')
  const [payoutFinal, setPayoutFinal] = useState('25')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await createGroupAction({
      name,
      description: description || undefined,
      buyInAmount: parseFloat(buyInAmount) || 0,
      payoutQ1: parseFloat(payoutQ1) || 25,
      payoutQ2: parseFloat(payoutQ2) || 25,
      payoutQ3: parseFloat(payoutQ3) || 25,
      payoutFinal: parseFloat(payoutFinal) || 25,
    })

    if (!result.success) {
      setError(result.error || 'Failed to create group')
      setLoading(false)
      return
    }

    setOpen(false)
    setName('')
    setDescription('')
    setBuyInAmount('10')
    setPayoutQ1('25')
    setPayoutQ2('25')
    setPayoutQ3('25')
    setPayoutFinal('25')
    router.push(`/groups/${result.groupId}`)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-6 py-3 bg-gradient-primary text-black rounded-xl hover:shadow-glow-primary transition-all font-bold transform hover:scale-105"
      >
        Create Group
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border-2 border-border rounded-2xl p-8 w-full max-w-md shadow-glow-primary">
            <h2 className="text-3xl font-bold gradient-text mb-6">Create New Group</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Group Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Super Bowl Pool"
                  required
                  className="w-full px-4 py-3 bg-black border-2 border-border rounded-lg focus:outline-none focus:border-primary-green text-white placeholder-gray-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Annual Super Bowl betting pool"
                  className="w-full px-4 py-3 bg-black border-2 border-border rounded-lg focus:outline-none focus:border-primary-blue text-white placeholder-gray-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="buyInAmount" className="block text-sm font-medium text-gray-300 mb-2">
                  Buy-In Per Square ($)
                </label>
                <input
                  id="buyInAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={buyInAmount}
                  onChange={(e) => setBuyInAmount(e.target.value)}
                  placeholder="10.00"
                  className="w-full px-4 py-3 bg-black border-2 border-border rounded-lg focus:outline-none focus:border-primary-green text-white placeholder-gray-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="payoutQ1" className="block text-xs font-medium text-gray-300 mb-2">
                    Q1 Payout (%)
                  </label>
                  <input
                    id="payoutQ1"
                    type="number"
                    min="0"
                    max="100"
                    value={payoutQ1}
                    onChange={(e) => setPayoutQ1(e.target.value)}
                    className="w-full px-3 py-2 bg-black border-2 border-border rounded-lg focus:outline-none focus:border-primary-green text-white text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="payoutQ2" className="block text-xs font-medium text-gray-300 mb-2">
                    Q2/Half (%)
                  </label>
                  <input
                    id="payoutQ2"
                    type="number"
                    min="0"
                    max="100"
                    value={payoutQ2}
                    onChange={(e) => setPayoutQ2(e.target.value)}
                    className="w-full px-3 py-2 bg-black border-2 border-border rounded-lg focus:outline-none focus:border-primary-green text-white text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="payoutQ3" className="block text-xs font-medium text-gray-300 mb-2">
                    Q3 Payout (%)
                  </label>
                  <input
                    id="payoutQ3"
                    type="number"
                    min="0"
                    max="100"
                    value={payoutQ3}
                    onChange={(e) => setPayoutQ3(e.target.value)}
                    className="w-full px-3 py-2 bg-black border-2 border-border rounded-lg focus:outline-none focus:border-primary-green text-white text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="payoutFinal" className="block text-xs font-medium text-gray-300 mb-2">
                    Final (%)
                  </label>
                  <input
                    id="payoutFinal"
                    type="number"
                    min="0"
                    max="100"
                    value={payoutFinal}
                    onChange={(e) => setPayoutFinal(e.target.value)}
                    className="w-full px-3 py-2 bg-black border-2 border-border rounded-lg focus:outline-none focus:border-primary-green text-white text-sm"
                  />
                </div>
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
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
