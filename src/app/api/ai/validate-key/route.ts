import { NextResponse } from "next/server"
import { generateText } from "ai"
import { createProviderClient, PROVIDER_CONFIGS } from "@/lib/ai/provider"
import type { Provider } from "@/lib/ai/provider"

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key")
  const provider = request.headers.get("x-provider") as Provider | null

  if (!apiKey || !provider || !PROVIDER_CONFIGS[provider]) {
    return NextResponse.json({ valid: false, error: "Missing or invalid provider" }, { status: 400 })
  }

  try {
    const client = createProviderClient(provider, apiKey)
    const model = PROVIDER_CONFIGS[provider].models.fast

    await generateText({
      model: client(model),
      prompt: "Reply with exactly one word: OK",
      maxOutputTokens: 10,
    })

    return NextResponse.json({ valid: true, model })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Key validation failed"
    return NextResponse.json({ valid: false, error: message }, { status: 200 })
  }
}
