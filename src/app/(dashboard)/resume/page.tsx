"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, Plus, Loader2, ChevronRight } from "lucide-react"

interface ResumeListItem {
  id: string
  name: string
  template_id: string
  current_section: string
  version: number
  created_at: string
  updated_at: string
}

export default function ResumeListPage() {
  const router = useRouter()
  const [resumes, setResumes] = useState<ResumeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  async function loadResumes() {
    try {
      const res = await fetch("/api/resume")
      if (res.ok) {
        const data = await res.json()
        setResumes(data)
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResumes()
  }, [])

  async function handleCreate() {
    setCreating(true)
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Resume ${resumes.length + 1}` }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/resume/${data.id}`)
      }
    } catch {
      // Silently fail
    } finally {
      setCreating(false)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Resumes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage your resume versions.
          </p>
        </div>
        <Button onClick={handleCreate} disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          New Resume
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : resumes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-lg mb-2">No resumes yet</CardTitle>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Build your first resume with our AI-powered builder. Have a
              conversation, get a professional ATS-optimized resume.
            </p>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Build your first resume
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <Card
              key={r.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/resume/${r.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{r.name}</CardTitle>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                </div>
                <CardDescription className="text-xs">
                  v{r.version} &middot; {formatDate(r.updated_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground capitalize">
                  Section: {r.current_section}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
