'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check } from 'lucide-react'

interface MemberOwnership {
  key: string
  userId: string | null
  displayName: string | null
  label: string
  squareCount: number
  amountOwed: number
  amountPaid: number
  isPaid: boolean
  paymentId: string | null
}

interface PaymentStatusProps {
  groupId: string
  gameIds: string[]
  isAdmin: boolean
  buyInAmount: number
}

export function PaymentStatus({ groupId, gameIds, isAdmin, buyInAmount }: PaymentStatusProps) {
  const [members, setMembers] = useState<MemberOwnership[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [groupId, gameIds.join(',')])

  async function fetchData() {
    if (gameIds.length === 0) {
      setLoading(false)
      return
    }

    // Fetch all claimed squares directly — this is the source of truth
    const { data: squares } = await supabase
      .from('squares')
      .select('user_id, display_name, profiles(full_name, email)')
      .in('game_id', gameIds)
      .or('user_id.not.is.null,display_name.not.is.null')

    // Fetch payment records for paid status
    const { data: payments } = await supabase
      .from('user_payments')
      .select('id, user_id, display_name, amount_paid')
      .eq('group_id', groupId)

    if (!squares) {
      setLoading(false)
      return
    }

    // Count squares per owner
    const ownerMap = new Map<string, {
      userId: string | null
      displayName: string | null
      label: string
      count: number
    }>()

    for (const sq of squares) {
      let key: string
      let label: string
      const profile = sq.profiles as any

      if (sq.user_id) {
        key = `user:${sq.user_id}`
        label = profile?.full_name || profile?.email?.split('@')[0] || 'Unknown'
      } else if (sq.display_name) {
        key = `name:${sq.display_name}`
        label = sq.display_name
      } else {
        continue
      }

      const existing = ownerMap.get(key)
      if (existing) {
        existing.count++
      } else {
        ownerMap.set(key, {
          userId: sq.user_id,
          displayName: sq.display_name,
          label,
          count: 1,
        })
      }
    }

    // Merge with payment records for paid status
    const result: MemberOwnership[] = []
    for (const [key, owner] of ownerMap) {
      const amountOwed = owner.count * buyInAmount
      // Find matching payment record
      const payment = payments?.find(p =>
        owner.userId
          ? p.user_id === owner.userId
          : p.display_name === owner.displayName
      )

      result.push({
        key,
        userId: owner.userId,
        displayName: owner.displayName,
        label: owner.label,
        squareCount: owner.count,
        amountOwed,
        amountPaid: payment?.amount_paid || 0,
        isPaid: (payment?.amount_paid || 0) >= amountOwed,
        paymentId: payment?.id || null,
      })
    }

    result.sort((a, b) => b.squareCount - a.squareCount)
    setMembers(result)
    setLoading(false)
  }

  async function markAsPaid(member: MemberOwnership) {
    if (member.paymentId) {
      // Update existing payment record
      await supabase
        .from('user_payments')
        .update({
          amount_paid: member.amountOwed,
          amount_owed: member.amountOwed,
          last_payment_date: new Date().toISOString(),
        })
        .eq('id', member.paymentId)
    } else {
      // Create payment record if none exists
      await supabase
        .from('user_payments')
        .insert({
          group_id: groupId,
          user_id: member.userId,
          display_name: member.displayName,
          amount_owed: member.amountOwed,
          amount_paid: member.amountOwed,
          last_payment_date: new Date().toISOString(),
        })
    }
    fetchData()
  }

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading payments...</div>
  }

  if (members.length === 0) {
    return (
      <div className="bg-card p-6 rounded-xl border-2 border-border">
        <h3 className="text-lg font-bold text-primary-green mb-2">Payment Status</h3>
        <p className="text-gray-400 text-sm">No squares claimed yet</p>
      </div>
    )
  }

  const totalOwed = members.reduce((sum, m) => sum + m.amountOwed, 0)
  const totalPaid = members.reduce((sum, m) => sum + m.amountPaid, 0)

  return (
    <div className="bg-card p-6 rounded-xl border-2 border-border shadow-card-glow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-primary-green">Payment Status</h3>
        <div className="text-right">
          <div className="text-xs text-gray-400">Total Pot</div>
          <div className="text-xl font-bold text-primary-green">${totalOwed.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.key}
            className={`flex items-center justify-between p-3 rounded-lg border-2 ${
              member.isPaid
                ? 'bg-primary-green/10 border-primary-green/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex-1">
              <div className="font-medium text-white">
                {member.label}
                {!member.userId && member.displayName && (
                  <span className="text-xs text-yellow-400 ml-2">(unclaimed)</span>
                )}
              </div>
              <div className="text-xs text-gray-400">
                {member.squareCount} square{member.squareCount !== 1 ? 's' : ''} × ${buyInAmount.toFixed(2)} = ${member.amountOwed.toFixed(2)}
              </div>
            </div>

            {member.isPaid ? (
              <div className="flex items-center gap-2 text-primary-green font-bold text-sm">
                <Check className="w-4 h-4" />
                PAID
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold text-sm">OWES ${member.amountOwed.toFixed(2)}</span>
                {isAdmin && (
                  <button
                    onClick={() => markAsPaid(member)}
                    className="px-3 py-1 bg-primary-green text-black rounded-lg hover:shadow-glow-primary transition-all font-bold text-xs"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
        <span className="text-gray-400">Collected:</span>
        <span className="font-bold text-primary-green">${totalPaid.toFixed(2)} / ${totalOwed.toFixed(2)}</span>
      </div>
    </div>
  )
}
