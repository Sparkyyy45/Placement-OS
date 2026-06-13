import type { ResumeSections, SkillInfo } from "@/types/resume"
import type { AtsScore, AtsCategoryScore, JdAnalysis } from "@/types/ats"

const COMMON_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "are", "was", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can", "need",
  "use", "used", "using", "able", "ability", "experience", "work",
  "working", "including", "including", "within", "without", "about",
  "between", "under", "over", "after", "before", "during", "through",
  "all", "any", "each", "every", "both", "few", "more", "most", "other",
  "some", "such", "no", "nor", "not", "only", "own", "same", "so",
  "than", "too", "very", "just", "also", "well", "good", "great", "new",
  "first", "last", "long", "high", "low", "large", "small", "different",
  "much", "many", "per", "etc"
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !COMMON_WORDS.has(t))
}

export function extractJdAnalysis(jdText: string): JdAnalysis {
  const lines = jdText.split("\n").map((l) => l.trim()).filter(Boolean)
  const allTokens = tokenize(jdText)

  const allWords = jdText.toLowerCase().split(/\s+/)
  const yearMatches = allWords
    .map((w, i) => (/\d+/.test(w) ? parseInt(w) : null))
    .filter((y): y is number => y !== null && y > 0 && y < 30)

  return {
    keywords: [...new Set(allTokens)],
    requiredSkills: [],
    preferredSkills: [],
    responsibilities: lines.filter((l) => l.length > 20),
    yearsExperience: yearMatches.length > 0 ? Math.max(...yearMatches) : undefined,
  }
}

function scoreSkills(skills: SkillInfo, jdKeywords: string[]): AtsCategoryScore {
  const allSkills = [
    ...skills.languages.map((s) => s.toLowerCase()),
    ...skills.frameworks.map((s) => s.toLowerCase()),
    ...skills.databases.map((s) => s.toLowerCase()),
    ...skills.tools.map((s) => s.toLowerCase()),
    ...skills.cloud.map((s) => s.toLowerCase()),
    ...skills.other.map((s) => s.toLowerCase()),
  ]

  const matched: string[] = []
  const missing: string[] = []

  for (const kw of jdKeywords) {
    const found = allSkills.some((s) => s.includes(kw) || kw.includes(s))
    if (found) matched.push(kw)
    else missing.push(kw)
  }

  const maxTech = jdKeywords.length
  const score = maxTech > 0 ? Math.round((matched.length / maxTech) * 50) : 0

  const suggestions: string[] = []
  if (missing.length > 0) {
    suggestions.push(`Consider adding: ${missing.slice(0, 5).join(", ")}`)
  }
  if (allSkills.length === 0) {
    suggestions.push("Add technical skills to your resume")
  }

  return { score, max: 50, label: "Skills Match", suggestions }
}

function scoreExperience(sections: ResumeSections): AtsCategoryScore {
  const exp = sections.experience.entries
  const projects = sections.projects.entries
  let score = 0
  const suggestions: string[] = []

  if (exp.length > 0) {
    score += 10
    for (const e of exp) {
      if (e.bullets.length >= 3) score += 4
      if (e.bullets.some((b) => /\d+/.test(b))) score += 3
    }
  }

  if (projects.length > 0) {
    score += 5
    for (const p of projects) {
      if (p.bullets.length >= 3) score += 3
      if (p.techStack.length > 0) score += 3
    }
  }

  if (exp.length === 0 && projects.length === 0) {
    suggestions.push("Add internships or projects with measurable impact")
  } else {
    const hasMetrics = [...exp, ...projects].some((e) =>
      "bullets" in e && Array.isArray(e.bullets) && e.bullets.some((b: string) => /\d+/.test(b))
    )
    if (!hasMetrics) {
      suggestions.push("Use numbers to show impact (e.g., 'improved performance by 40%')")
    }
    const hasActionVerbs = [...exp, ...projects].some((e) =>
      "bullets" in e && Array.isArray(e.bullets) && e.bullets.some((b: string) =>
        /^(developed|built|designed|implemented|led|managed|created|optimized|reduced|increased)/i.test(b)
      )
    )
    if (!hasActionVerbs) {
      suggestions.push("Start bullet points with strong action verbs")
    }
  }

  return { score: Math.min(score, 25), max: 25, label: "Experience & Impact", suggestions }
}

function scoreEducation(sections: ResumeSections): AtsCategoryScore {
  const entries = sections.education.entries
  let score = 0
  const suggestions: string[] = []

  if (entries.length > 0) {
    score += 5
    const e = entries[0]
    if (e.gpa) score += 3
    if (e.coursework && e.coursework.length >= 3) score += 3
    if (e.degree) score += 2
    if (e.college) score += 2
  } else {
    suggestions.push("Add education details")
  }

  return { score: Math.min(score, 15), max: 15, label: "Education", suggestions }
}

function scoreFormat(sections: ResumeSections): AtsCategoryScore {
  let score = 0
  const suggestions: string[] = []

  if (sections.personal.fullName) score += 2
  if (sections.personal.email) score += 2
  if (sections.personal.phone) score += 1
  if (sections.personal.linkedin) score += 1
  if (sections.personal.github) score += 1

  const totalBullets = [
    ...sections.experience.entries.flatMap((e) => e.bullets),
    ...sections.projects.entries.flatMap((p) => p.bullets),
    ...sections.achievements.entries.flatMap((a) => a.description ? [a.description] : []),
  ]

  if (totalBullets.length >= 10) score += 5
  else if (totalBullets.length >= 5) score += 3
  else suggestions.push("Add more bullet points (aim for 10+)")

  if (sections.education.entries.length > 0) score += 1
  if (sections.skills.languages.length > 0) score += 1
  if (Object.values(sections.skills).some((arr) => Array.isArray(arr) && arr.length > 0)) score += 1

  return { score: Math.min(score, 10), max: 10, label: "Format & Completeness", suggestions }
}

export function calculateAtsScore(sections: ResumeSections, jdText: string): AtsScore {
  const analysis = extractJdAnalysis(jdText)
  const jdKeywords = analysis.keywords

  const skillsScore = scoreSkills(sections.skills, jdKeywords)
  const expScore = scoreExperience(sections)
  const eduScore = scoreEducation(sections)
  const formatScore = scoreFormat(sections)

  const categories = [skillsScore, expScore, eduScore, formatScore]
  const totalScore = categories.reduce((sum, c) => sum + c.score, 0)

  const allMatched: string[] = []
  const allMissing: string[] = []

  const allResumeSkills = [
    ...sections.skills.languages.map((s) => s.toLowerCase()),
    ...sections.skills.frameworks.map((s) => s.toLowerCase()),
    ...sections.skills.databases.map((s) => s.toLowerCase()),
    ...sections.skills.tools.map((s) => s.toLowerCase()),
    ...sections.skills.cloud.map((s) => s.toLowerCase()),
    ...sections.skills.other.map((s) => s.toLowerCase()),
  ]

  for (const kw of jdKeywords) {
    const found = allResumeSkills.some((s) => s.includes(kw) || kw.includes(s))
    if (found) allMatched.push(kw)
    else allMissing.push(kw)
  }

  const allSuggestions = categories.flatMap((c) => c.suggestions)

  if (totalScore < 50) {
    allSuggestions.push("Your resume may be filtered out by ATS — consider a template with standard section headings")
  }

  return {
    overall: totalScore,
    categories,
    matchedKeywords: [...new Set(allMatched)],
    missingKeywords: [...new Set(allMissing)].slice(0, 20),
    suggestions: allSuggestions,
  }
}
