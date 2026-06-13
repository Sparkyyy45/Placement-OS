import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { getServiceClient } from "@/lib/db/client"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = getServiceClient()
  const { data, error } = await db
    .from("users")
    .select("name, email, college, degree, target_role, target_company_tier, daily_hours_available, onboarding_complete")
    .eq("id", user.id)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }

  return NextResponse.json(data || {})
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { name, college, degree } = body

  const updates: Record<string, string> = {}
  if (name !== undefined) updates.name = name
  if (college !== undefined) updates.college = college
  if (degree !== undefined) updates.degree = degree

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  const db = getServiceClient()
  const { error } = await db.from("users").upsert(
    { id: user.id, ...updates },
    { onConflict: "id" }
  )

  if (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
