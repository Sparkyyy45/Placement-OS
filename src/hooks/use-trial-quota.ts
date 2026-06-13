"use client"

import { useCallback, useEffect, useState } from "react"
import { TRIAL_LIMIT } from "@/lib/constants"

interface TrialQuota {
  used: number
  remaining: number
  exhausted: boolean
}

export function useTrialQuota() {
  const [quota, setQuota] = useState<TrialQuota>({
    used: 0,
    remaining: TRIAL_LIMIT,
    exhausted: false,
  })
  const [loading, setLoading] = useState(true)

  const fetchQuota = useCallback(async () => {
    try {
      const res = await fetch("/api/trial")
      if (!res.ok) return
      const data = await res.json()
      setQuota(data)
    } catch {
      // Silently fail — trial is a bonus feature
    } finally {
      setLoading(false)
    }
  }, [])

  const consume = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/trial", { method: "POST" })
      const data = await res.json()
      if (!res.ok) return false
      setQuota((prev) => ({
        used: data.used,
        remaining: data.remaining,
        exhausted: data.remaining <= 0,
      }))
      return true
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    fetchQuota()
  }, [fetchQuota])

  return { quota, loading, consume, refetch: fetchQuota }
}
