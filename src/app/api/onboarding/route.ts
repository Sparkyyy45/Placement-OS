import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { getServiceClient } from "@/lib/db/client"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { role, tier, timeline, hours } = body

  if (!role || !tier || !timeline || !hours) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const weeksMap: Record<string, number> = {
    "1mo": 4, "2mo": 8, "4mo": 16, "6mo": 24, "6plus": 30,
  }
  const placementDate = new Date()
  placementDate.setDate(placementDate.getDate() + (weeksMap[timeline] || 16) * 7)

  const db = getServiceClient()

  // Upsert user into our users table
  const { error } = await db.from("users").upsert(
    {
      supabase_user_id: user.id,
      email: user.email,
      target_role: role,
      target_company_tier: tier,
      placement_date: placementDate.toISOString(),
      daily_hours_available: hours,
      onboarding_complete: true,
    },
    { onConflict: "supabase_user_id" }
  )

  if (error) {
    console.error("Onboarding save error:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
