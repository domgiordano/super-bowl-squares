'use client'

import { DollarSign, Trophy } from 'lucide-react'

interface GroupInfoProps {
  buyInAmount: number
  payoutQ1: number
  payoutQ2: number
  payoutQ3: number
  payoutFinal: number
  totalSquaresSold: number
}

export function GroupInfo({
  buyInAmount,
  payoutQ1,
  payoutQ2,
  payoutQ3,
  payoutFinal,
  totalSquaresSold
}: GroupInfoProps) {
  const totalPot = totalSquaresSold * buyInAmount

  const payouts = [
    { label: 'Q1', percentage: payoutQ1, amount: (totalPot * payoutQ1) / 100 },
    { label: 'Q2 (Halftime)', percentage: payoutQ2, amount: (totalPot * payoutQ2) / 100 },
    { label: 'Q3', percentage: payoutQ3, amount: (totalPot * payoutQ3) / 100 },
    { label: 'Final', percentage: payoutFinal, amount: (totalPot * payoutFinal) / 100 },
  ]

  return (
    <div className="bg-card p-6 rounded-xl border-2 border-border shadow-card-glow">
      <h3 className="font-bold text-lg text-primary-green mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5" />
        Group Info
      </h3>

      <div className="space-y-4">
        {/* Buy-in and pot */}
        <div className="pb-4 border-b border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Buy-in per square:</span>
            <span className="text-white font-bold text-lg">${buyInAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Squares sold:</span>
            <span className="text-white font-bold">{totalSquaresSold} / 100</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-border/50">
            <span className="text-primary-green font-bold">Total Pot:</span>
            <span className="text-primary-green font-bold text-xl">${totalPot.toFixed(2)}</span>
          </div>
        </div>

        {/* Payout breakdown */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-primary-blue" />
            <span className="text-primary-blue font-bold text-sm">Payout Breakdown</span>
          </div>
          <div className="space-y-2">
            {payouts.map(payout => (
              <div key={payout.label} className="flex justify-between items-center text-sm">
                <span className="text-gray-300">{payout.label}:</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{payout.percentage}%</span>
                  <span className="text-white font-bold min-w-[80px] text-right">
                    ${payout.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
