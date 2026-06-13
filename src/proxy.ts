import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase-middleware"
import { checkRateLimit } from "@/lib/rate-limit"

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/ai/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const result = await checkRateLimit(`ip:${ip}`, { limit: 30, window: 60 })

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter: result.resetAt - Math.floor(Date.now() / 1000) },
        { status: 429 }
      )
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
