"use client"

import type { SectionName } from "@/types/resume"
import { SECTION_LABELS, SECTION_ORDER } from "@/types/resume"
import { cn } from "@/lib/utils"

interface SectionIndicatorProps {
  currentSection: SectionName
  completedSections: Set<SectionName>
  onSectionClick?: (s: SectionName) => void
}

export function SectionIndicator({ currentSection, completedSections, onSectionClick }: SectionIndicatorProps) {
  const visibleSections = SECTION_ORDER.filter((s) => s !== "review")

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-muted/20 overflow-x-auto">
      {visibleSections.map((s, i) => {
        const isCurrent = s === currentSection
        const isCompleted = completedSections.has(s)
        return (
          <button
            key={s}
            onClick={() => onSectionClick?.(s)}
            disabled={!isCompleted && !isCurrent}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors whitespace-nowrap",
              isCurrent && "bg-primary text-primary-foreground font-medium",
              isCompleted && !isCurrent && "text-green-600 hover:bg-green-50",
              !isCompleted && !isCurrent && "text-muted-foreground cursor-default"
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold",
                isCurrent && "bg-primary-foreground/20",
                isCompleted && "bg-green-100 text-green-700",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? "✓" : i + 1}
            </span>
            <span className="hidden sm:inline">{SECTION_LABELS[s]}</span>
          </button>
        )
      })}
    </div>
  )
}
