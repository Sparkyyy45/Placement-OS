"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"

interface RateLimitErrorProps {
  retryAfter: number
  onDismiss: () => void
}

export function RateLimitError({ retryAfter, onDismiss }: RateLimitErrorProps) {
  const [remaining, setRemaining] = useState(retryAfter)

  useEffect(() => {
    if (remaining <= 0) {
      onDismiss()
      return
    }
    const timer = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(timer)
  }, [remaining, onDismiss])

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-md text-sm">
      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
      <span className="text-amber-800">
        Too many requests. Try again in {remaining}s.
      </span>
    </div>
  )
}
