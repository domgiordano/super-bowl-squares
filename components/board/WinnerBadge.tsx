'use client'

interface WinnerBadgeProps {
  quarters: string[] // e.g., ['Q1', 'Q3']
  isCurrent: boolean
}

export function WinnerBadge({ quarters, isCurrent }: WinnerBadgeProps) {
  if (quarters.length === 0 && !isCurrent) return null

  return (
    <div className="absolute top-0 right-0 flex gap-0.5 p-0.5">
      {quarters.map((q) => (
        <div
          key={q}
          className="w-5 h-5 flex items-center justify-center bg-green-600 text-white text-[10px] font-bold rounded-sm"
          title={`Won ${q}`}
        >
          {q.replace('Q', '')}
        </div>
      ))}
      {isCurrent && (
        <div
          className="w-5 h-5 flex items-center justify-center bg-yellow-500 text-white text-[10px] font-bold rounded-sm animate-pulse"
          title="Currently Winning"
        >
          ★
        </div>
      )}
    </div>
  )
}
