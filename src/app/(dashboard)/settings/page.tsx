"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("")
  const [provider, setProvider] = useState("groq")

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
          <CardTitle className="text-lg">AI Provider</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {["groq", "openrouter", "gemini"].map((p) => (
              <Button
                key={p}
                variant={provider === p ? "default" : "outline"}
                onClick={() => setProvider(p)}
                size="sm"
              >
                {p === "groq" ? "Groq" : p === "openrouter" ? "OpenRouter" : "Gemini"}
              </Button>
            ))}
          </div>
          <Input
            type="password"
            placeholder="Paste your API key here"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <div className="flex gap-2">
            <Button disabled={!apiKey}>Save key</Button>
            <Button variant="outline" disabled={!apiKey}>
              Test connection
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your key is stored in your browser and never sent to our servers.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
