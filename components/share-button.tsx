'use client'

import { useState } from 'react'
import { Check, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Primetime Parlay Board', url })
        return
      }
    } catch {
      // fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <Button
      type="button"
      onClick={share}
      variant="secondary"
      className="h-11 gap-2 rounded-full font-medium"
    >
      {copied ? <Check className="size-4 text-success" /> : <Link2 className="size-4" />}
      {copied ? 'Link copied' : 'Share'}
    </Button>
  )
}
