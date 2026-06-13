import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { getServiceClient } from "@/lib/db/client"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = getServiceClient()
  const { data, error } = await db
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 })
  }

  // Fetch messages
  const { data: messages } = await db
    .from("resume_messages")
    .select("*")
    .eq("resume_id", id)
    .order("created_at", { ascending: true })

  return NextResponse.json({ ...data, messages: messages || [] })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const allowed = ["name", "template_id", "sections", "current_section", "target_jd", "jd_analysis", "ats_score", "is_archived"]
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }
  const currentVersion = (await getServiceClient().from("resumes").select("version").eq("id", id).eq("user_id", user.id).single()).data?.version
  if (typeof currentVersion === "number") {
    updates.version = currentVersion + 1
  }

  const db = getServiceClient()
  const { data, error } = await db
    .from("resumes")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Resume update error:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = getServiceClient()
  const { error } = await db
    .from("resumes")
    .update({ is_archived: true })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
