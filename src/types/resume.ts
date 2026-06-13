export type SectionName = "personal" | "education" | "skills" | "projects" | "experience" | "achievements" | "review"

export type ChatRole = "user" | "assistant" | "system"

export interface ResumeMessage {
  id: string
  role: ChatRole
  content: string
  section: SectionName
  created_at: string
}

export interface PersonalInfo {
  fullName?: string
  email?: string
  phone?: string
  linkedin?: string
  github?: string
  portfolio?: string
  location?: string
}

export interface EducationEntry {
  college?: string
  degree?: string
  field?: string
  startYear?: string
  endYear?: string
  gpa?: string
  coursework?: string[]
}

export interface SkillInfo {
  languages: string[]
  frameworks: string[]
  databases: string[]
  tools: string[]
  cloud: string[]
  other: string[]
}

export interface ProjectEntry {
  name?: string
  description?: string
  bullets: string[]
  techStack: string[]
  url?: string
}

export interface ExperienceEntry {
  company?: string
  role?: string
  startDate?: string
  endDate?: string
  bullets: string[]
  location?: string
}

export interface AchievementEntry {
  type: "cp" | "hackathon" | "research" | "por" | "opensource"
  title?: string
  description?: string
}

export interface ResumeSections {
  personal: PersonalInfo
  education: { entries: EducationEntry[] }
  skills: SkillInfo
  projects: { entries: ProjectEntry[] }
  experience: { entries: ExperienceEntry[] }
  achievements: { entries: AchievementEntry[] }
}

export interface Resume {
  id: string
  user_id: string
  name: string
  template_id: string
  sections: ResumeSections
  target_jd: string | null
  jd_analysis: Record<string, unknown> | null
  ats_score: Record<string, unknown> | null
  current_section: SectionName
  section_order: SectionName[]
  version: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

export const SECTION_LABELS: Record<SectionName, string> = {
  personal: "Personal Info",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  experience: "Experience",
  achievements: "Achievements",
  review: "Review",
}

export const SECTION_ORDER: SectionName[] = [
  "personal",
  "education",
  "skills",
  "projects",
  "experience",
  "achievements",
  "review",
]
