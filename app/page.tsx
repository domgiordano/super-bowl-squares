import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="text-center max-w-3xl w-full">
        <h1 className="text-6xl font-bold mb-6 gradient-text">Super Bowl Squares</h1>
        <p className="text-xl text-gray-300 mb-12">
          Create betting pools, invite friends, and track winners in real-time
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Create Group */}
          <div className="bg-card p-8 rounded-2xl border-2 border-border shadow-card-glow">
            <h2 className="text-2xl font-bold text-primary-green mb-3">Create Group</h2>
            <p className="text-gray-400 text-sm mb-6">Start a new Super Bowl pool and invite your friends</p>
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-gradient-primary text-black rounded-xl hover:shadow-glow-primary transition-all font-bold w-full"
            >
              Get Started
            </Link>
          </div>

          {/* Join Group */}
          <div className="bg-card p-8 rounded-2xl border-2 border-border shadow-card-glow">
            <h2 className="text-2xl font-bold text-primary-blue mb-3">Join Group</h2>
            <p className="text-gray-400 text-sm mb-6">Have an invite code? Join an existing pool</p>
            <Link
              href="/login?action=join"
              className="inline-block px-8 py-3 border-2 border-primary-blue text-primary-blue rounded-xl hover:bg-primary-blue/10 transition-all font-bold w-full"
            >
              Join Now
            </Link>
          </div>
        </div>

        <div className="text-sm text-gray-400 mt-8">
          Sign in with Google to get started
        </div>
      </div>
    </div>
  )
}
