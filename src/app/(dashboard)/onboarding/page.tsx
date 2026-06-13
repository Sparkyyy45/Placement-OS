"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-browser"
import { useApiKey } from "@/hooks/use-api-key"
import { Check, X, ExternalLink } from "lucide-react"

type Provider = "groq" | "openrouter" | "gemini"

export default function OnboardingPage() {
  const router = useRouter()
  const { saveKey } = useApiKey()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Step 1-2 state
  const [role, setRole] = useState<string | null>(null)
  const [tier, setTier] = useState<string | null>(null)
  const [timeline, setTimeline] = useState<string | null>(null)
  const [hours, setHours] = useState<"1" | "2" | "3" | "4">("2")

  // Step 3 state
  const [keyProvider, setKeyProvider] = useState<Provider>("groq")
  const [keyValue, setKeyValue] = useState("")
  const [keyStatus, setKeyStatus] = useState<"idle" | "testing" | "valid" | "invalid">("idle")
  const [keyError, setKeyError] = useState("")
  const [useTrial, setUseTrial] = useState(false)

  async function testKey() {
    setKeyStatus("testing")
    setKeyError("")
    try {
      const res = await fetch("/api/ai/validate-key", {
        method: "POST",
        headers: { "x-api-key": keyValue, "x-provider": keyProvider },
      })
      const data = await res.json()
      if (data.valid) {
        setKeyStatus("valid")
      } else {
        setKeyStatus("invalid")
        setKeyError(data.error || "Key doesn't work")
      }
    } catch {
      setKeyStatus("invalid")
      setKeyError("Could not reach validation service")
    }
  }

  async function handleComplete() {
    setLoading(true)
    setKeyError("")
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setKeyError("Not authenticated — try reloading")
        setLoading(false)
        return
      }

      const body: Record<string, unknown> = { role, tier, timeline, hours: Number(hours) }

      if (!useTrial && keyStatus === "valid") {
        await saveKey(keyValue, keyProvider)
        body.preferredProvider = keyProvider
      }

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Save failed" }))
        setKeyError(err.error || "Failed to save onboarding data")
        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch {
      setKeyError("Network error — please try again")
      setLoading(false)
    }
  }

  const providerLinks: Record<Provider, { name: string; url: string; steps: string[] }> = {
    groq: {
      name: "Groq",
      url: "https://console.groq.com/keys",
      steps: ["Go to console.groq.com", "Sign up (free)", "Create API key", "Copy the key (starts with gsk_)"],
    },
    openrouter: {
      name: "OpenRouter",
      url: "https://openrouter.ai/keys",
      steps: ["Go to openrouter.ai", "Sign up (GitHub/Google)", "Create key", "Copy the key (starts with sk-or-)"],
    },
    gemini: {
      name: "Google AI Studio",
      url: "https://aistudio.google.com/app/apikey",
      steps: ["Go to aistudio.google.com", "Sign in with Google", "Get API key", "Copy the key (starts with AIza)"],
    },
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Set up your journey</CardTitle>
          <CardDescription>
            Step {step + 1} of 3 — this helps us personalize everything.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Target role</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "sde", label: "SDE" },
                    { value: "data-analyst", label: "Data Analyst" },
                    { value: "business-analyst", label: "Business Analyst" },
                    { value: "consultant", label: "Consultant" },
                    { value: "core-engg", label: "Core Engg" },
                    { value: "finance", label: "Finance" },
                    { value: "pm", label: "Product Manager" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      variant={role === opt.value ? "default" : "outline"}
                      onClick={() => setRole(opt.value)}
                      className="justify-start"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Company tier</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "top-product", label: "Top Product" },
                    { value: "mid-product", label: "Mid Product" },
                    { value: "service", label: "Service" },
                    { value: "startup", label: "Startup" },
                    { value: "psu", label: "PSU" },
                    { value: "open", label: "Open to anything" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      variant={tier === opt.value ? "default" : "outline"}
                      onClick={() => setTier(opt.value)}
                      className="justify-start"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Placement season starts in</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "1mo", label: "< 1 month" },
                    { value: "2mo", label: "1-2 months" },
                    { value: "4mo", label: "3-4 months" },
                    { value: "6mo", label: "5-6 months" },
                    { value: "6plus", label: "6+ months" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      variant={timeline === opt.value ? "default" : "outline"}
                      onClick={() => setTimeline(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button className="w-full" disabled={!role || !tier || !timeline} onClick={() => setStep(1)}>
                Continue
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Hours per day you can give</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "1", label: "< 1 hr" },
                    { value: "2", label: "1-2 hrs" },
                    { value: "3", label: "2-3 hrs" },
                    { value: "4", label: "3+ hrs" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      variant={hours === opt.value ? "default" : "outline"}
                      onClick={() => setHours(opt.value as typeof hours)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(2)}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground mb-2">
                {useTrial
                  ? "You're using the free trial (20 requests). Add a key anytime in Settings."
                  : "Set up AI features with your own API key. Your key stays in your browser."}
              </div>

              {!useTrial && (
                <>
                  <div className="flex gap-2">
                    {(["groq", "openrouter", "gemini"] as const).map((p) => (
                      <Button
                        key={p}
                        variant={keyProvider === p ? "default" : "outline"}
                        onClick={() => { setKeyProvider(p); setKeyStatus("idle"); setKeyError("") }}
                        size="sm"
                        className="flex-1"
                      >
                        {p === "groq" ? "Groq" : p === "openrouter" ? "OpenRouter" : "Gemini"}
                      </Button>
                    ))}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">How to get your key:</p>
                    {providerLinks[keyProvider].steps.map((s, i) => (
                      <p key={i}>{i + 1}. {s}</p>
                    ))}
                    <a
                      href={providerLinks[keyProvider].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline mt-1"
                    >
                      Open {providerLinks[keyProvider].name} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <Input
                    type="password"
                    placeholder="Paste your API key"
                    value={keyValue}
                    onChange={(e) => { setKeyValue(e.target.value); setKeyStatus("idle") }}
                  />

                  {keyStatus === "valid" && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="h-4 w-4" /> Key works!
                    </div>
                  )}
                  {keyStatus === "invalid" && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <X className="h-4 w-4" /> {keyError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={!keyValue || keyStatus === "testing"}
                      onClick={testKey}
                      className="flex-1"
                    >
                      {keyStatus === "testing" ? "Testing..." : "Test key"}
                    </Button>
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={loading || (!useTrial && keyStatus !== "valid")}
                  onClick={handleComplete}
                >
                  {loading ? "Saving..." : useTrial ? "Start with trial" : "Complete setup"}
                </Button>
              </div>

              {!useTrial && (
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground text-xs"
                  onClick={() => { setUseTrial(true); setKeyStatus("idle") }}
                >
                  Skip — use free trial (20 requests)
                </Button>
              )}
              {useTrial && (
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground text-xs"
                  onClick={() => setUseTrial(false)}
                >
                  I have an API key — set it up
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
