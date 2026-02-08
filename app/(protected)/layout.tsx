import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { Home } from 'lucide-react'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <nav className="bg-card border-b-2 border-border shadow-glow-primary">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-primary-green hover:text-primary-blue transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <span className="text-sm text-gray-300 hidden md:inline">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-primary-green hover:text-primary-blue transition-colors font-medium">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
