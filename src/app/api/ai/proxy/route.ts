import { NextResponse } from "next/server"
import { generateText, streamText, createTextStreamResponse } from "ai"
import { createProviderClient, PROVIDER_CONFIGS } from "@/lib/ai/provider"
import type { Provider } from "@/lib/ai/provider"
import { createClient } from "@/lib/supabase-server"
import { getServiceClient } from "@/lib/db/client"

export const runtime = "nodejs"

import { TRIAL_LIMIT } from "@/lib/constants"

async function consumeTrial(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const db = getServiceClient()
  const { data: existing } = await db
    .from("trial_usage")
    .select("request_count, id")
    .eq("user_id", userId)
    .maybeSingle()

  const currentCount = existing?.request_count ?? 0
  if (currentCount >= TRIAL_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  if (existing?.id) {
    await db.from("trial_usage").update({ request_count: currentCount + 1 }).eq("id", existing.id)
  } else {
    await db.from("trial_usage").insert({ user_id: userId, request_count: 1 })
  }

  return { allowed: true, remaining: TRIAL_LIMIT - currentCount - 1 }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = request.headers.get("x-api-key")
  const provider = request.headers.get("x-provider") as Provider | null

  const body = await request.json()
  const { messages, prompt, stream = true, model: modelOverride } = body

  if (apiKey && provider && PROVIDER_CONFIGS[provider]) {
    try {
      const client = createProviderClient(provider, apiKey)
      const modelName = modelOverride || PROVIDER_CONFIGS[provider].models.default
      const model = client(modelName)

      if (stream) {
        const result = streamText({
          model,
          messages: messages || [{ role: "user", content: prompt }],
          maxOutputTokens: 2048,
        })
        return createTextStreamResponse({
          textStream: result.textStream,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        })
      }

      const result = await generateText({
          model,
          messages: messages || [{ role: "user", content: prompt }],
          maxOutputTokens: 2048,
        })
      return NextResponse.json({ text: result.text })
    } catch (err) {
      const message = err instanceof Error ? err.message : "AI request failed"
      console.error("AI proxy error:", message)
      return NextResponse.json({ error: message }, { status: 502 })
    }
  }

  // No API key — try trial quota with Groq default
  const trial = await consumeTrial(user.id)
  if (!trial.allowed) {
    return NextResponse.json(
      { error: "Trial quota exhausted. Add your API key in Settings.", remaining: 0 },
      { status: 402 }
    )
  }

  try {
    const defaultProvider = "groq"
    const defaultKey = process.env.GROQ_API_KEY
    if (!defaultKey) {
      return NextResponse.json({ error: "Server AI key not configured" }, { status: 500 })
    }

    const client = createProviderClient(defaultProvider, defaultKey)
    const model = client(PROVIDER_CONFIGS[defaultProvider].models.default)

    if (stream) {
      const result = streamText({
        model,
        messages: messages || [{ role: "user", content: prompt }],
        maxOutputTokens: 2048,
      })
      return createTextStreamResponse({
        textStream: result.textStream,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    }

    const result = await generateText({
      model,
      messages: messages || [{ role: "user", content: prompt }],
      maxOutputTokens: 2048,
    })
    return NextResponse.json({ text: result.text, trialRemaining: trial.remaining })
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed"
    console.error("AI proxy error:", message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
