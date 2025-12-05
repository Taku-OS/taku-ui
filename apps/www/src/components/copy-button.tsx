'use client'

import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

