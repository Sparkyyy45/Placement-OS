"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Target, CheckCircle2, XCircle, Lightbulb } from "lucide-react"
import type { AtsScore, JdAnalysis } from "@/types/ats"

interface JdAnalyzerProps {
  resumeId: string
  initialJd?: string | null
  onJdUpdate?: (jd: string) => void
}

export function JdAnalyzer({ resumeId, initialJd, onJdUpdate }: JdAnalyzerProps) {
  const [open, setOpen] = useState(false)
  const [jdText, setJdText] = useState(initialJd || "")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ atsScore: AtsScore; analysis: JdAnalysis } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    if (jdText.trim().length < 20) {
      setError("Job description must be at least 20 characters")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/resume/${resumeId}/analyze-jd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetJd: jdText }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Analysis failed")
        return
      }
      const data = await res.json()
      setResult(data)
      onJdUpdate?.(jdText)
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 70) return "text-green-600"
    if (score >= 40) return "text-amber-600"
    return "text-red-600"
  }

  function getScoreBg(score: number): string {
    if (score >= 70) return "bg-green-50 border-green-200"
    if (score >= 40) return "bg-amber-50 border-amber-200"
    return "bg-red-50 border-red-200"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Target className="h-4 w-4" />
          ATS Score
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            JD Analyzer & ATS Score
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Paste Job Description</label>
            <Textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the job description here to analyze how well your resume matches..."
              rows={6}
              className="text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button onClick={handleAnalyze} disabled={loading || !jdText.trim()} className="w-full gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Match
              </>
            )}
          </Button>

          {result && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${getScoreBg(result.atsScore.overall)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ATS Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(result.atsScore.overall)}`}>
                    {result.atsScore.overall}/100
                  </span>
                </div>
                <div className="mt-2 h-2 bg-white/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      result.atsScore.overall >= 70 ? "bg-green-500" :
                      result.atsScore.overall >= 40 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${result.atsScore.overall}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {result.atsScore.categories.map((cat, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">{cat.label}</span>
                      <span className={`text-sm font-semibold ${getScoreColor(cat.score)}`}>
                        {cat.score}/{cat.max}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          cat.score / cat.max >= 0.7 ? "bg-green-500" :
                          cat.score / cat.max >= 0.4 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${(cat.score / cat.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {result.atsScore.matchedKeywords.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Matched Keywords ({result.atsScore.matchedKeywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.atsScore.matchedKeywords.map((kw, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-green-50 text-green-700 hover:bg-green-100">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.atsScore.missingKeywords.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                    <XCircle className="h-4 w-4 text-amber-600" />
                    Missing Keywords ({result.atsScore.missingKeywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.atsScore.missingKeywords.map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-amber-700 border-amber-300">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.atsScore.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    Suggestions
                  </h4>
                  <ul className="space-y-1">
                    {result.atsScore.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="mt-0.5 block w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
