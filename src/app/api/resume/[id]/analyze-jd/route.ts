import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { calculateAtsScore, extractJdAnalysis } from "@/lib/ats/scorer"
import type { ResumeSections } from "@/types/resume"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: resume } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    const body = await request.json()
    const { targetJd } = body as { targetJd: string }
    if (!targetJd || targetJd.trim().length < 20) {
      return NextResponse.json({ error: "Provide a job description (at least 20 characters)" }, { status: 400 })
    }

    const sections = resume.sections as unknown as ResumeSections
    const atsScore = calculateAtsScore(sections, targetJd)
    const analysis = extractJdAnalysis(targetJd)

    // Save analysis to resume record
    await supabase
      .from("resumes")
      .update({
        target_jd: targetJd,
        jd_analysis: analysis as unknown as Record<string, unknown>,
        ats_score: atsScore as unknown as Record<string, unknown>,
      })
      .eq("id", id)

    return NextResponse.json({ atsScore, analysis, resumeId: id })
  } catch (error) {
    console.error("JD analysis error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
