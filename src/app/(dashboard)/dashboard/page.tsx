"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Map, Mic, BarChart3, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase-browser"
import { useTrialQuota } from "@/hooks/use-trial-quota"
import { useApiKey } from "@/hooks/use-api-key"

interface Assessment {
  role: string
  tier: string
  timeline: string
  hours: number
}

export default function DashboardPage() {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const { quota } = useTrialQuota()
  const { provider } = useApiKey()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from("users").select("onboarding_assessment").single()
      if (data?.onboarding_assessment) {
        setAssessment(data.onboarding_assessment as Assessment)
      }
      setLoading(false)
    }
    load()
  }, [])

  const aiReady = !!provider || (quota.remaining > 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your placement readiness at a glance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resume</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-1">
              Create a resume to see your score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Roadmap</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-1">
              {assessment ? "Your roadmap is being prepared" : "Complete assessment to begin"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Take your first mock interview
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Readiness</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-1">
              {aiReady ? "Take a mock interview to get scored" : "Add AI key or use trial to begin"}
            </p>
          </CardContent>
        </Card>
      </div>

      {!assessment && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Welcome! Let&apos;s get started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Complete your onboarding assessment to unlock your personalized
              roadmap and placement readiness score.
            </p>
            <a
              href="/onboarding"
              className="inline-flex items-center text-sm text-primary hover:underline font-medium"
            >
              Start onboarding →
            </a>
          </CardContent>
        </Card>
      )}

      {assessment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Role</span>
                <p className="font-medium capitalize">{assessment.role.replace("-", " ")}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tier</span>
                <p className="font-medium capitalize">{assessment.tier.replace("-", " ")}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Timeline</span>
                <p className="font-medium">{assessment.timeline}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Daily hours</span>
                <p className="font-medium">{assessment.hours} hrs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {aiReady && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          AI ready &mdash; {provider ? `using ${provider}` : `${quota.remaining} trial requests left`}
        </div>
      )}
    </div>
  )
}
