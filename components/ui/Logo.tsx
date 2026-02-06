import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center font-bold text-black text-lg shadow-glow-primary">
        SB
      </div>
      <span className="text-xl font-bold gradient-text hidden sm:block">
        Super Bowl Squares
      </span>
    </Link>
  )
}
