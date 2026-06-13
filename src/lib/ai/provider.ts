import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

export type Provider = "groq" | "openrouter" | "gemini"

export const PROVIDER_CONFIGS: Record<
  Provider,
  { name: string; displayName: string; models: { default: string; fast: string }; setupGuideUrl: string }
> = {
  groq: {
    name: "groq",
    displayName: "Groq",
    models: { default: "llama-3.3-70b-versatile", fast: "llama-3.1-8b-instant" },
    setupGuideUrl: "https://console.groq.com/keys",
  },
  openrouter: {
    name: "openrouter",
    displayName: "OpenRouter",
    models: { default: "mistralai/mixtral-8x22b-instruct", fast: "mistralai/mistral-7b-instruct" },
    setupGuideUrl: "https://openrouter.ai/keys",
  },
  gemini: {
    name: "gemini",
    displayName: "Google AI Studio",
    models: { default: "gemini-2.0-flash", fast: "gemini-2.0-flash-lite" },
    setupGuideUrl: "https://aistudio.google.com/app/apikey",
  },
}

export function createProviderClient(provider: Provider, apiKey: string) {
  switch (provider) {
    case "groq":
      return createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey,
      })
    case "openrouter":
      return createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey,
      })
    case "gemini":
      return createGoogleGenerativeAI({ apiKey })
  }
}
