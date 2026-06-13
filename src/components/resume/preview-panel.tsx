"use client"

import type { ResumeSections } from "@/types/resume"
import { FileText } from "lucide-react"

interface PreviewPanelProps {
  sections: ResumeSections
}

export function PreviewPanel({ sections }: PreviewPanelProps) {
  const { personal, education, skills, projects, experience, achievements } = sections
  const hasData = personal.fullName || education.entries.length > 0 || skills.languages.length > 0

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Live Preview</h3>
        <p className="text-xs text-muted-foreground max-w-[200px]">
          Your resume will appear here as you fill in details through the chat.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-[600px] mx-auto bg-white border border-border shadow-sm rounded-lg p-8 text-sm leading-relaxed">
        {personal.fullName && (
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-900">{personal.fullName}</h1>
            <div className="text-xs text-gray-500 mt-1 space-x-3">
              {personal.email && <span>{personal.email}</span>}
              {personal.phone && <span>{personal.phone}</span>}
              {personal.location && <span>{personal.location}</span>}
            </div>
            <div className="text-xs text-gray-500 mt-1 space-x-3">
              {personal.github && <span>GitHub: {personal.github}</span>}
              {personal.linkedin && <span>LinkedIn: {personal.linkedin}</span>}
              {personal.portfolio && <span>{personal.portfolio}</span>}
            </div>
          </div>
        )}

        {education.entries.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">Education</h2>
            {education.entries.map((e, i) => (
              <div key={i} className="mb-2">
                <p className="font-medium text-gray-800">{e.college || "College"}</p>
                <p className="text-xs text-gray-600">{e.degree}{e.field ? ` — ${e.field}` : ""}</p>
                <p className="text-xs text-gray-500">
                  {e.startYear}{e.endYear ? ` - ${e.endYear}` : ""}{e.gpa ? ` | GPA: ${e.gpa}` : ""}
                </p>
                {e.coursework && e.coursework.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Relevant Coursework: {e.coursework.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {(skills.languages.length > 0 || skills.frameworks.length > 0) && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">Skills</h2>
            {skills.languages.length > 0 && (
              <p className="text-xs mb-1"><span className="font-medium">Languages:</span> {skills.languages.join(", ")}</p>
            )}
            {skills.frameworks.length > 0 && (
              <p className="text-xs mb-1"><span className="font-medium">Frameworks:</span> {skills.frameworks.join(", ")}</p>
            )}
            {skills.databases.length > 0 && (
              <p className="text-xs mb-1"><span className="font-medium">Databases:</span> {skills.databases.join(", ")}</p>
            )}
            {skills.tools.length > 0 && (
              <p className="text-xs mb-1"><span className="font-medium">Tools:</span> {skills.tools.join(", ")}</p>
            )}
            {skills.cloud.length > 0 && (
              <p className="text-xs mb-1"><span className="font-medium">Cloud:</span> {skills.cloud.join(", ")}</p>
            )}
          </div>
        )}

        {projects.entries.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">Projects</h2>
            {projects.entries.map((p, i) => (
              <div key={i} className="mb-3">
                <p className="font-medium text-gray-800">{p.name || "Project"}</p>
                {p.techStack.length > 0 && (
                  <p className="text-xs text-gray-500">{p.techStack.join(" · ")}</p>
                )}
                {p.bullets.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-gray-700 mt-1 space-y-0.5">
                    {p.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {experience.entries.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">Experience</h2>
            {experience.entries.map((e, i) => (
              <div key={i} className="mb-3">
                <p className="font-medium text-gray-800">{e.company || "Company"}</p>
                <p className="text-xs text-gray-600">{e.role}{e.location ? ` — ${e.location}` : ""}</p>
                <p className="text-xs text-gray-500">{e.startDate}{e.endDate ? ` - ${e.endDate}` : ""}</p>
                {e.bullets.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-gray-700 mt-1 space-y-0.5">
                    {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {achievements.entries.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">Achievements</h2>
            {achievements.entries.map((a, i) => (
              <p key={i} className="text-xs text-gray-700 mb-1">
                <span className="font-medium capitalize">{a.type}:</span> {a.title || a.description}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
