import { NextResponse } from "next/server"
import { streamText, createTextStreamResponse } from "ai"
import { createProviderClient, PROVIDER_CONFIGS } from "@/lib/ai/provider"
import type { Provider } from "@/lib/ai/provider"
import { createClient } from "@/lib/supabase-server"
import { getServiceClient } from "@/lib/db/client"
import { buildSectionPrompt } from "@/lib/ai/prompts"
import { TRIAL_LIMIT } from "@/lib/constants"
import type { SectionName, ResumeSections } from "@/types/resume"

async function consumeTrial(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const db = getServiceClient()
  const { data: existing } = await db
    .from("trial_usage")
    .select("request_count, id")
    .eq("user_id", userId)
    .maybeSingle()

  const currentCount = existing?.request_count ?? 0
  if (currentCount >= TRIAL_LIMIT) return { allowed: false, remaining: 0 }

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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { section, message, resumeState, messages: history, resumeId, targetJd } = body as {
    section: SectionName
    message: string
    resumeState: ResumeSections
    messages: { role: string; content: string }[]
    resumeId?: string
    targetJd?: string
  }

  const apiKey = request.headers.get("x-api-key")
  const provider = request.headers.get("x-provider") as Provider | null

  const historyText = (history || [])
    .map((m) => `${m.role === "user" ? "Student" : "AI"}: ${m.content}`)
    .join("\n")

  const systemPrompt = buildSectionPrompt(section, resumeState, historyText, targetJd)

  // Save user message to DB
  if (resumeId) {
    const db = getServiceClient()
    await db.from("resume_messages").insert({
      resume_id: resumeId,
      role: "user",
      content: message,
      section,
    })
  }

  if (apiKey && provider && PROVIDER_CONFIGS[provider]) {
    try {
      const client = createProviderClient(provider, apiKey)
      const modelName = PROVIDER_CONFIGS[provider].models.default
      const model = client(modelName)

      const result = streamText({
        model,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
        maxOutputTokens: 1024,
      })

      return createTextStreamResponse({
        textStream: result.textStream,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI request failed"
      return NextResponse.json({ error: msg }, { status: 502 })
    }
  }

  // Trial fallback
  const trial = await consumeTrial(user.id)
  if (!trial.allowed) {
    return NextResponse.json(
      { error: "Trial quota exhausted. Add your API key in Settings.", remaining: 0 },
      { status: 402 }
    )
  }

  try {
    const defaultKey = process.env.GROQ_API_KEY
    if (!defaultKey) {
      return NextResponse.json({ error: "Server AI key not configured" }, { status: 500 })
    }

    const client = createProviderClient("groq", defaultKey)
    const model = client(PROVIDER_CONFIGS.groq.models.default)

    const result = streamText({
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
      maxOutputTokens: 1024,
    })

    return createTextStreamResponse({
      textStream: result.textStream,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI request failed"
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
