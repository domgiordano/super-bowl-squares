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
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center bg-card text-primary-blue font-bold border border-border text-sm sm:text-base md:text-lg"
        >
          {numbers?.[i] ?? '?'}
        </div>
      ))}
    </>
  )
}
