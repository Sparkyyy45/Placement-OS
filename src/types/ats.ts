export interface AtsCategoryScore {
  score: number
  max: number
  label: string
  suggestions: string[]
}

export interface AtsScore {
  overall: number
  categories: AtsCategoryScore[]
  missingKeywords: string[]
  matchedKeywords: string[]
  suggestions: string[]
}

export interface JdAnalysis {
  keywords: string[]
  requiredSkills: string[]
  preferredSkills: string[]
  responsibilities: string[]
  yearsExperience?: number
}

export interface JdAnalyzeRequest {
  targetJd: string
}

export interface JdAnalyzeResponse {
  atsScore: AtsScore
  analysis: JdAnalysis
  resumeId: string
}
