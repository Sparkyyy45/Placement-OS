// ─── User ───
export type Role =
  | "sde"
  | "data-analyst"
  | "business-analyst"
  | "consultant"
  | "core-engg"
  | "finance"
  | "pm"

export type CompanyTier =
  | "top-product"
  | "mid-product"
  | "service"
  | "startup"
  | "psu"
  | "open"

export type SkillLevel = "never" | "beginner" | "comfortable" | "strong"

export type AIProvider = "groq" | "openrouter" | "gemini"

// ─── Resume ───
export interface ResumeData {
  personal: PersonalInfo
  education: EducationInfo
  skills: SkillInfo
  projects: ProjectInfo[]
  experience: ExperienceInfo[]
  achievements: AchievementInfo[]
}

export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  linkedin: string
  github: string
  portfolio: string
  location: string
}

export interface EducationInfo {
  college: string
  degree: string
  field: string
  startYear: number
  endYear: number
  gpa: number
  coursework: string[]
}

export interface SkillInfo {
  languages: string[]
  frameworks: string[]
  databases: string[]
  tools: string[]
  cloud: string[]
  other: string[]
}

export interface ProjectInfo {
  name: string
  description: string
  bullets: string[]
  techStack: string[]
  url?: string
}

export interface ExperienceInfo {
  company: string
  role: string
  startDate: string
  endDate: string
  bullets: string[]
  location?: string
}

export interface AchievementInfo {
  type: "cp" | "hackathon" | "research" | "por" | "opensource"
  title: string
  description: string
}

export type ChatSection =
  | "greeting"
  | "personal"
  | "education"
  | "skills"
  | "projects"
  | "experience"
  | "achievements"
  | "review"

// ─── Interview ───
export type InterviewMode = "topic" | "role" | "jd"
export type InterviewPersona = "friendly" | "neutral" | "tough"

export interface InterviewConfig {
  mode: InterviewMode
  topic?: string
  role?: Role
  difficulty?: number
  duration: number
  persona: InterviewPersona
  jd?: string
}

export interface InterviewMetrics {
  eyeContactAvg: number
  paceAvg: number
  fillerWords: { word: string; count: number }[]
  confidenceAvg: number
}

export interface QAPair {
  question: string
  answer: string
  score: number
  feedback: string
  followUp?: string
  timestamp: number
}

// ─── Roadmap ───
export type RoadmapPhase = "foundation" | "building" | "placement"

export interface RoadmapWeek {
  weekNumber: number
  phase: RoadmapPhase
  theme: string
  totalHours: number
  tasks: RoadmapTask[]
}

export interface RoadmapTask {
  id: string
  topic: string
  type: "learn" | "practice" | "mock"
  resource: { title: string; url: string; type: string; estimatedMinutes: number }
  scheduledDays: string[]
  estimatedHours: number
  status: "pending" | "in-progress" | "complete"
}

// ─── Skill Graph ───
export interface SkillNode {
  id: string
  name: string
  category: string
  difficulty: number
  prerequisiteIds: string[]
}

export interface SkillGraphEntry {
  skillNodeId: string
  confidence: number
  source: string
  lastPracticed?: string
}
