'use client'

interface NumberRowProps {
  numbers: number[] | null
  teamName?: string
}

export function NumberRow({ numbers }: NumberRowProps) {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="w-14 h-14 flex items-center justify-center bg-card text-primary-blue font-bold border border-border text-lg"
        >
          {numbers?.[i] ?? '?'}
        </div>
      ))}
    </>
  )
}
