import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-2xl border-2 border-border shadow-glow-primary">
        <div className="text-center">
          <h1 className="text-4xl font-bold gradient-text">Super Bowl Squares</h1>
          <p className="mt-4 text-gray-300">Sign in to get started</p>
        </div>
        <div className="mt-8 flex justify-center">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  )
}
