"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useResumeStore } from "@/store/resume-store"
import { ChatPanel } from "@/components/resume/chat-panel"
import { PreviewPanel } from "@/components/resume/preview-panel"
import { SectionIndicator } from "@/components/resume/section-indicator"
import { useApiKey } from "@/hooks/use-api-key"
import { useTrialQuota } from "@/hooks/use-trial-quota"
import { Loader2, ArrowLeft, Save, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SectionName, ResumeMessage } from "@/types/resume"

export default function ResumeBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const store = useResumeStore()
  const { getKey } = useApiKey()
  const { quota } = useTrialQuota()

  const [loading, setLoading] = useState(true)
  const [streaming, setStreaming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load resume
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/resume/${id}`)
        if (!res.ok) {
          router.push("/resume")
          return
        }
        const data = await res.json()
        store.setResume(data.id, data.name, data.sections, data.current_section)
        if (data.messages) {
          store.setMessages(data.messages)
        }
      } catch {
        router.push("/resume")
      } finally {
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Auto-save
  const triggerSave = useCallback(async () => {
    setSaving(true)
    try {
      await fetch(`/api/resume/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: store.sections,
          current_section: store.currentSection,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // Silently fail
    } finally {
      setSaving(false)
    }
  }, [id, store.sections, store.currentSection])

  const debouncedSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(triggerSave, 30000)
  }, [triggerSave])

  // Schedule auto-save when sections change
  useEffect(() => {
    if (!loading) debouncedSave()
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [store.sections, loading, debouncedSave])

  // Save assistant message to DB
  const saveAssistantMessage = useCallback(async (content: string) => {
    const msg: ResumeMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content,
      section: store.currentSection,
      created_at: new Date().toISOString(),
    }
    store.addMessage(msg)

    try {
      await fetch(`/api/resume/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: store.sections,
          current_section: store.currentSection,
        }),
      })
    } catch {
      // Silently fail
    }
  }, [id, store])

  async function handleSend(message: string) {
    const keyData = await getKey()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (keyData) {
      headers["x-api-key"] = keyData.key
      headers["x-provider"] = keyData.provider
    }

    // Add user message
    const userMsg: ResumeMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      section: store.currentSection,
      created_at: new Date().toISOString(),
    }
    store.addMessage(userMsg)

    setStreaming(true)
    let fullResponse = ""

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          section: store.currentSection,
          message,
          resumeState: store.sections,
          messages: store.messages.map((m) => ({ role: m.role, content: m.content })),
          resumeId: id,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Request failed" }))
        const errorMsg = errData.error || "Request failed"
        store.setError(errorMsg)
        await saveAssistantMessage(`Error: ${errorMsg}`)
        setStreaming(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        setStreaming(false)
        return
      }

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullResponse += decoder.decode(value, { stream: true })
      }

      store.setError(null)

      // Try to extract resume data from response
      try {
        const parsed = JSON.parse(fullResponse)
        if (parsed.sections) {
          store.setSections(parsed.sections)
        }
        if (parsed.currentSection) {
          store.setCurrentSection(parsed.currentSection)
        }
      } catch {
        // Response is plain text — that's fine
      }

      await saveAssistantMessage(fullResponse)
    } catch {
      store.setError("Network error")
      await saveAssistantMessage("Error: Network error")
    } finally {
      setStreaming(false)
    }
  }

  function handleSectionClick(s: SectionName) {
    store.setCurrentSection(s)
  }

  const completedSections = new Set<SectionName>()
  const sections = store.sections
  if (sections.personal?.fullName) completedSections.add("personal")
  if (sections.education?.entries?.length > 0) completedSections.add("education")
  if (sections.skills?.languages?.length > 0) completedSections.add("skills")
  if (sections.projects?.entries?.length > 0) completedSections.add("projects")
  if (sections.experience?.entries?.length > 0) completedSections.add("experience")
  if (sections.achievements?.entries?.length > 0) completedSections.add("achievements")

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/resume")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-sm font-medium">{store.name}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">Section: {store.currentSection}</span>
              {saving && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Save className="h-3 w-3" /> Saving...
                </span>
              )}
              {saved && (
                <span className="flex items-center gap-1 text-green-600">
                  <Check className="h-3 w-3" /> Saved
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {store.error && <span className="text-destructive">{store.error}</span>}
        </div>
      </div>

      {/* Section indicator */}
      <SectionIndicator
        currentSection={store.currentSection}
        completedSections={completedSections}
        onSectionClick={handleSectionClick}
      />

      {/* Split panel */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[40%] min-w-[320px] border-r border-border">
          <ChatPanel
            messages={store.messages}
            isLoading={streaming}
            onSend={handleSend}
          />
        </div>
        <div className="flex-1 bg-muted/10">
          <PreviewPanel sections={store.sections} />
        </div>
      </div>
    </div>
  )
}
