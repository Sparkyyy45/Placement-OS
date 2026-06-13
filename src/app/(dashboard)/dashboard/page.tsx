"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Map, Mic, BarChart3, CheckCircle2, BookOpen, ListChecks, Target } from "lucide-react"
import { createClient } from "@/lib/supabase-browser"
import { useTrialQuota } from "@/hooks/use-trial-quota"
import { useApiKey } from "@/hooks/use-api-key"

interface Profile {
  name: string | null
  target_role: string | null
  target_company_tier: string | null
  daily_hours_available: number | null
  onboarding_complete: boolean | null
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { quota } = useTrialQuota()
  const { provider } = useApiKey()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      try {
        const { data } = await supabase
          .from("users")
          .select("name, target_role, target_company_tier, daily_hours_available, onboarding_complete")
          .maybeSingle()
        if (data) {
          setProfile(data as Profile)
        }
      } catch {
        // Profile not found — user hasn't completed onboarding
      }
      setLoading(false)
    }
    load()
  }, [])

  const aiReady = !!provider || (quota.remaining > 0)
  const onboarded = profile?.onboarding_complete

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {profile?.name ? `Welcome back, ${profile.name}` : "Your placement readiness at a glance."}
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
              {onboarded ? "Your roadmap is being prepared" : "Complete assessment to begin"}
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
            <div className="text-2xl font-bold">{onboarded ? "0" : "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {aiReady ? "Take a mock interview to get scored" : "Add AI key or use trial to begin"}
            </p>
          </CardContent>
        </Card>
      </div>

      {!onboarded && !loading && (
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

      {onboarded && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Skill Gaps</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Complete a mock interview to discover your skill gaps.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Tasks</CardTitle>
                <ListChecks className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <ListChecks className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Your roadmap tasks will appear here once generated.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Readiness Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Complete more modules to calculate your readiness score.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Role</span>
                  <p className="font-medium capitalize">
                    {profile?.target_role ? profile.target_role.replace("-", " ") : "Not set"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tier</span>
                  <p className="font-medium capitalize">
                    {profile?.target_company_tier ? profile.target_company_tier.replace("-", " ") : "Not set"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Daily hours</span>
                  <p className="font-medium">
                    {profile?.daily_hours_available ? `${profile.daily_hours_available} hrs` : "Not set"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Name</span>
                  <p className="font-medium">{profile?.name || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
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
