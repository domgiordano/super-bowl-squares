'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface InviteLinkProps {
  inviteCode: string
}

export function InviteLink({ inviteCode }: InviteLinkProps) {
  const [copied, setCopied] = useState(false)

  async function copyCodeToClipboard() {
    await navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-card p-6 rounded-xl border-2 border-border shadow-card-glow">
      <h3 className="text-lg font-bold text-primary-green mb-4">Invite Code</h3>
      <p className="text-xs text-gray-400 mb-3">Share this code with others to join the group:</p>
      <div className="flex gap-3 items-center">
        <div className="flex-1 bg-black px-6 py-4 rounded-xl border-2 border-primary-green/30">
          <p className="text-primary-green font-mono font-bold text-2xl text-center tracking-widest">{inviteCode}</p>
        </div>
        <button
          onClick={copyCodeToClipboard}
          className="px-5 py-4 bg-gradient-primary text-black rounded-xl hover:shadow-glow-primary transition-all font-bold flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              <span className="hidden sm:inline">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
