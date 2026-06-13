import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { getServiceClient } from "@/lib/db/client"

const DEFAULT_SECTIONS = {
  personal: {},
  education: { entries: [] },
  skills: { languages: [], frameworks: [], databases: [], tools: [], cloud: [], other: [] },
  projects: { entries: [] },
  experience: { entries: [] },
  achievements: { entries: [] },
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = getServiceClient()
  const { data, error } = await db
    .from("resumes")
    .select("id, name, template_id, current_section, version, is_archived, created_at, updated_at")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Resume list error:", error)
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()

  const db = getServiceClient()
  const { data, error } = await db
    .from("resumes")
    .insert({
      user_id: user.id,
      name: body.name || "My Resume",
      template_id: body.template_id || "classic",
      sections: DEFAULT_SECTIONS,
    })
    .select()
    .single()

  if (error) {
    console.error("Resume create error:", error)
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 })
  }

  return NextResponse.json(data)
}
