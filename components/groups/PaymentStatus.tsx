'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, Check } from 'lucide-react'

interface Payment {
  id: string
  user_id: string
  amount_owed: number
  amount_paid: number
  is_paid: boolean
  profiles?: {
    full_name: string | null
    email: string
  }
}

interface PaymentStatusProps {
  groupId: string
  isAdmin: boolean
  buyInAmount: number
}

export function PaymentStatus({ groupId, isAdmin, buyInAmount }: PaymentStatusProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPayments()
  }, [groupId])

  async function fetchPayments() {
    const { data, error } = await supabase
      .from('user_payments')
      .select('*, profiles(full_name, email)')
      .eq('group_id', groupId)
      .order('amount_owed', { ascending: false })

    if (data) {
      setPayments(data as any)
    }
    setLoading(false)
  }

  async function markAsPaid(paymentId: string, amountOwed: number) {
    const { error } = await supabase
      .from('user_payments')
      .update({
        amount_paid: amountOwed,
        last_payment_date: new Date().toISOString(),
      })
      .eq('id', paymentId)

    if (!error) {
      fetchPayments()
    }
  }

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading payments...</div>
  }

  if (payments.length === 0) {
    return (
      <div className="bg-card p-6 rounded-xl border-2 border-border">
        <h3 className="text-lg font-bold text-primary-green mb-2">Payment Status</h3>
        <p className="text-gray-400 text-sm">No squares claimed yet</p>
      </div>
    )
  }

  const totalOwed = payments.reduce((sum, p) => sum + p.amount_owed, 0)
  const totalPaid = payments.reduce((sum, p) => sum + p.amount_paid, 0)

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
        {payments.map((payment) => {
          const squares = Math.round(payment.amount_owed / buyInAmount)
          const displayName = payment.profiles?.full_name || payment.profiles?.email?.split('@')[0] || 'Unknown'

          return (
            <div
              key={payment.id}
              className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                payment.is_paid
                  ? 'bg-primary-green/10 border-primary-green/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex-1">
                <div className="font-medium text-white">{displayName}</div>
                <div className="text-xs text-gray-400">
                  {squares} square{squares !== 1 ? 's' : ''} × ${buyInAmount.toFixed(2)} = ${payment.amount_owed.toFixed(2)}
                </div>
              </div>

              {payment.is_paid ? (
                <div className="flex items-center gap-2 text-primary-green font-bold text-sm">
                  <Check className="w-4 h-4" />
                  PAID
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold text-sm">OWES ${payment.amount_owed.toFixed(2)}</span>
                  {isAdmin && (
                    <button
                      onClick={() => markAsPaid(payment.id, payment.amount_owed)}
                      className="px-3 py-1 bg-primary-green text-black rounded-lg hover:shadow-glow-primary transition-all font-bold text-xs"
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
        <span className="text-gray-400">Collected:</span>
        <span className="font-bold text-primary-green">${totalPaid.toFixed(2)} / ${totalOwed.toFixed(2)}</span>
      </div>
    </div>
  )
}
