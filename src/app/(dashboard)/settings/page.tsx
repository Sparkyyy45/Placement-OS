"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { useApiKey } from "@/hooks/use-api-key"
import { Check, X, Trash2, ExternalLink, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"

export default function SettingsPage() {
  const router = useRouter()
  const { provider, saveKey, removeKey } = useApiKey()
  const [apiKey, setApiKey] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<"groq" | "openrouter" | "gemini">("groq")
  const [keyStatus, setKeyStatus] = useState<"idle" | "testing" | "valid" | "invalid">("idle")
  const [keyError, setKeyError] = useState("")

  const [name, setName] = useState("")
  const [college, setCollege] = useState("")
  const [degree, setDegree] = useState("")
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile")
        if (res.ok) {
          const data = await res.json()
          if (data.name) setName(data.name)
          if (data.college) setCollege(data.college)
          if (data.degree) setDegree(data.degree)
        }
      } catch {
        // Silently fail
      } finally {
        setProfileLoading(false)
      }
    }
    loadProfile()
  }, [])

  async function handleTest() {
    setKeyStatus("testing")
    setKeyError("")
    try {
      const res = await fetch("/api/ai/validate-key", {
        method: "POST",
        headers: { "x-api-key": apiKey, "x-provider": selectedProvider },
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

  async function handleSave() {
    if (keyStatus !== "valid") return
    await saveKey(apiKey, selectedProvider)
    setApiKey("")
    setKeyStatus("idle")
  }

  function handleRemove() {
    removeKey()
  }

  async function handleSaveProfile() {
    setProfileSaving(true)
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, college, degree }),
      })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } catch {
      // Silently fail
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your profile and API key.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>Your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Input
                  id="college"
                  placeholder="Your college or university"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="degree">Degree</Label>
                <Input
                  id="degree"
                  placeholder="B.Tech CSE, B.Sc Statistics, etc."
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSaveProfile} disabled={profileSaving}>
                  {profileSaving ? "Saving..." : <><Save className="h-4 w-4 mr-1" /> Save</>}
                </Button>
                {profileSaved && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="h-4 w-4" /> Saved
                  </span>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Provider</CardTitle>
          <CardDescription>
            Your key is stored encrypted in your browser and never sent to our servers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {provider ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    Connected: {provider === "groq" ? "Groq" : provider === "openrouter" ? "OpenRouter" : "Gemini"}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRemove}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                To switch providers, remove the current key first, then add a new one.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                {(["groq", "openrouter", "gemini"] as const).map((p) => (
                  <Button
                    key={p}
                    variant={selectedProvider === p ? "default" : "outline"}
                    onClick={() => { setSelectedProvider(p); setKeyStatus("idle") }}
                    size="sm"
                    className="flex-1"
                  >
                    {p === "groq" ? "Groq" : p === "openrouter" ? "OpenRouter" : "Gemini"}
                  </Button>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                <a
                  href={
                    selectedProvider === "groq"
                      ? "https://console.groq.com/keys"
                      : selectedProvider === "openrouter"
                        ? "https://openrouter.ai/keys"
                        : "https://aistudio.google.com/app/apikey"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Get your {selectedProvider === "groq" ? "Groq" : selectedProvider === "openrouter" ? "OpenRouter" : "Gemini"} key <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <Input
                type="password"
                placeholder="Paste your API key"
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setKeyStatus("idle") }}
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
                <Button variant="outline" disabled={!apiKey || keyStatus === "testing"} onClick={handleTest}>
                  {keyStatus === "testing" ? "Testing..." : "Test connection"}
                </Button>
                <Button disabled={keyStatus !== "valid"} onClick={handleSave}>
                  Save key
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="text-destructive" onClick={handleLogout}>
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
