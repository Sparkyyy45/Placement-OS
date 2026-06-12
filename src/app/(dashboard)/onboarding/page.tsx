"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-browser"

type Role = "sde" | "data-analyst" | "business-analyst" | "consultant" | "core-engg" | "finance" | "pm"
type Tier = "top-product" | "mid-product" | "service" | "startup" | "psu" | "open"
type Timeline = "1mo" | "2mo" | "4mo" | "6mo" | "6plus"
type SkillLevel = "never" | "beginner" | "comfortable" | "strong"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [role, setRole] = useState<Role | null>(null)
  const [tier, setTier] = useState<Tier | null>(null)
  const [timeline, setTimeline] = useState<Timeline | null>(null)
  const [hours, setHours] = useState<"1" | "2" | "3" | "4">("2")

  async function handleComplete() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, tier, timeline, hours: Number(hours) }),
    })

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Set up your journey</CardTitle>
          <CardDescription>
            Step {step + 1} of 2 — this helps us personalize everything.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Target role</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "sde", label: "SDE" },
                    { value: "data-analyst", label: "Data Analyst" },
                    { value: "business-analyst", label: "Business Analyst" },
                    { value: "consultant", label: "Consultant" },
                    { value: "core-engg", label: "Core Engg" },
                    { value: "finance", label: "Finance" },
                    { value: "pm", label: "Product Manager" },
                  ] as const).map((opt) => (
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
                  {([
                    { value: "top-product", label: "Top Product" },
                    { value: "mid-product", label: "Mid Product" },
                    { value: "service", label: "Service" },
                    { value: "startup", label: "Startup" },
                    { value: "psu", label: "PSU" },
                    { value: "open", label: "Open to anything" },
                  ] as const).map((opt) => (
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
                  {([
                    { value: "1mo", label: "< 1 month" },
                    { value: "2mo", label: "1-2 months" },
                    { value: "4mo", label: "3-4 months" },
                    { value: "6mo", label: "5-6 months" },
                    { value: "6plus", label: "6+ months" },
                  ] as const).map((opt) => (
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

              <Button
                className="w-full"
                disabled={!role || !tier || !timeline}
                onClick={() => setStep(1)}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Hours per day you can give
                </label>
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

              <Button
                className="w-full"
                disabled={loading}
                onClick={handleComplete}
              >
                {loading ? "Saving..." : "Complete setup"}
              </Button>

              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => router.push("/resume")}
              >
                Skip — go to resume builder
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
