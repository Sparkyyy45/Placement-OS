import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { getServiceClient } from "@/lib/db/client"
import { TRIAL_LIMIT } from "@/lib/constants"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = getServiceClient()

  const { data, error } = await db
    .from("trial_usage")
    .select("request_count")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.error("Trial fetch error:", error)
  }

  const used = data?.request_count ?? 0
  const remaining = Math.max(0, TRIAL_LIMIT - used)

  return NextResponse.json({ used, remaining, exhausted: remaining <= 0 })
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = getServiceClient()

  const { data: existing } = await db
    .from("trial_usage")
    .select("request_count, id")
    .eq("user_id", user.id)
    .maybeSingle()

  const currentCount = existing?.request_count ?? 0

  if (currentCount >= TRIAL_LIMIT) {
    return NextResponse.json(
      { error: "Trial quota exhausted", used: TRIAL_LIMIT, remaining: 0 },
      { status: 402 }
    )
  }

  if (existing?.id) {
    await db
      .from("trial_usage")
      .update({ request_count: currentCount + 1 })
      .eq("id", existing.id)
  } else {
    await db
      .from("trial_usage")
      .insert({ user_id: user.id, request_count: 1 })
  }

  const newCount = currentCount + 1
  const remaining = Math.max(0, TRIAL_LIMIT - newCount)

  return NextResponse.json({ used: newCount, remaining, exhausted: remaining <= 0 })
}
