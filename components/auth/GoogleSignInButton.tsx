'use client'

import { createClient } from '@/lib/supabase/client'
import { Chrome } from 'lucide-react'

export function GoogleSignInButton() {
  const supabase = createClient()

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-primary text-black rounded-xl hover:shadow-glow-primary transition-all font-bold text-lg transform hover:scale-105"
    >
      <Chrome className="w-6 h-6" />
      <span>Continue with Google</span>
    </button>
  )
}
