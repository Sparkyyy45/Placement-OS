"use client"

import { Key, AlertTriangle } from "lucide-react"
import { useApiKey } from "@/hooks/use-api-key"
import { useTrialQuota } from "@/hooks/use-trial-quota"
import { cn } from "@/lib/utils"

export function TrialBanner() {
  const { provider } = useApiKey()
  const { quota, loading } = useTrialQuota()

  if (loading) return <div className="h-8" />

  if (provider) {
    return (
      <div className="h-8 px-4 flex items-center justify-end gap-2 border-b border-border bg-muted/30">
        <Key className="h-3 w-3 text-green-600" />
        <span className="text-xs text-muted-foreground">
          Connected: {provider === "groq" ? "Groq" : provider === "openrouter" ? "OpenRouter" : "Gemini"}
        </span>
      </div>
    )
  }

  if (quota.exhausted) {
    return (
      <div className="h-8 px-4 flex items-center justify-end gap-2 border-b border-border bg-amber-50">
        <AlertTriangle className="h-3 w-3 text-amber-600" />
        <span className="text-xs text-amber-700 font-medium">
          Trial exhausted — add your API key in Settings
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "h-8 px-4 flex items-center justify-end gap-2 border-b border-border",
        quota.remaining <= 5 ? "bg-amber-50" : "bg-muted/30"
      )}
    >
      <Key className="h-3 w-3 text-muted-foreground" />
      <span
        className={cn(
          "text-xs",
          quota.remaining <= 5 ? "text-amber-700 font-medium" : "text-muted-foreground"
        )}
      >
        Trial: {quota.remaining}/{quota.used + quota.remaining}
      </span>
    </div>
  )
}
