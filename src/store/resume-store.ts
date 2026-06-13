import { create } from "zustand"
import type { SectionName, ResumeMessage, ResumeSections } from "@/types/resume"
import { SECTION_ORDER } from "@/types/resume"

const EMPTY_SECTIONS: ResumeSections = {
  personal: {},
  education: { entries: [] },
  skills: { languages: [], frameworks: [], databases: [], tools: [], cloud: [], other: [] },
  projects: { entries: [] },
  experience: { entries: [] },
  achievements: { entries: [] },
}

interface ResumeStore {
  resumeId: string | null
  name: string
  sections: ResumeSections
  messages: ResumeMessage[]
  currentSection: SectionName
  isSaving: boolean
  lastSaved: string | null
  error: string | null

  setResume: (id: string, name: string, sections: ResumeSections, currentSection: SectionName) => void
  setSections: (sections: ResumeSections) => void
  mergeSectionData: (section: SectionName, data: Record<string, unknown>) => void
  addMessage: (msg: ResumeMessage) => void
  setMessages: (msgs: ResumeMessage[]) => void
  setCurrentSection: (s: SectionName) => void
  nextSection: () => void
  prevSection: () => void
  setIsSaving: (v: boolean) => void
  setLastSaved: (t: string) => void
  setError: (e: string | null) => void
  reset: () => void
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  resumeId: null,
  name: "My Resume",
  sections: EMPTY_SECTIONS,
  messages: [],
  currentSection: "personal",
  isSaving: false,
  lastSaved: null,
  error: null,

  setResume: (id, name, sections, currentSection) =>
    set({ resumeId: id, name, sections, currentSection }),

  setSections: (sections) => set({ sections }),

  mergeSectionData: (section, data) =>
    set((state) => {
      const updated = { ...state.sections }

      if (section === "personal") {
        const personal = data as Partial<typeof updated.personal>
        updated.personal = { ...updated.personal, ...personal }
      }

      if (section === "education") {
        const eduData = data as { entries?: unknown[] }
        if (eduData.entries) {
          const merged = [...updated.education.entries]
          for (const raw of eduData.entries) {
            const entry = raw as typeof merged[number]
            const idx = merged.findIndex(
              (e) => e.college && entry.college === e.college
            )
            if (idx >= 0) merged[idx] = { ...merged[idx], ...entry }
            else merged.push(entry)
          }
          updated.education = { entries: merged }
        }
      }

      if (section === "skills") {
        const skills = data as Partial<typeof updated.skills>
        updated.skills = { ...updated.skills, ...skills }
      }

      if (section === "projects") {
        const projData = data as { entries?: unknown[] }
        if (projData.entries) {
          const merged = [...updated.projects.entries]
          for (const raw of projData.entries) {
            const entry = raw as typeof merged[number]
            const idx = merged.findIndex(
              (e) => e.name && entry.name === e.name
            )
            if (idx >= 0) merged[idx] = { ...merged[idx], ...entry }
            else merged.push(entry)
          }
          updated.projects = { entries: merged }
        }
      }

      if (section === "experience") {
        const expData = data as { entries?: unknown[] }
        if (expData.entries) {
          const merged = [...updated.experience.entries]
          for (const raw of expData.entries) {
            const entry = raw as typeof merged[number]
            const idx = merged.findIndex(
              (e) => e.company && entry.company === e.company
            )
            if (idx >= 0) merged[idx] = { ...merged[idx], ...entry }
            else merged.push(entry)
          }
          updated.experience = { entries: merged }
        }
      }

      if (section === "achievements") {
        const achData = data as { entries?: unknown[] }
        if (achData.entries) {
          const merged = [...updated.achievements.entries]
          for (const raw of achData.entries) {
            const entry = raw as typeof merged[number]
            if (entry.type) {
              const exists = merged.some(
                (e) => e.type === entry.type && e.title === entry.title
              )
              if (!exists) merged.push(entry)
            }
          }
          updated.achievements = { entries: merged }
        }
      }

      return { sections: updated }
    }),

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  setMessages: (messages) => set({ messages }),

  setCurrentSection: (s) => set({ currentSection: s }),

  nextSection: () => {
    const { currentSection } = get()
    const idx = SECTION_ORDER.indexOf(currentSection)
    if (idx < SECTION_ORDER.length - 1) {
      set({ currentSection: SECTION_ORDER[idx + 1] })
    }
  },

  prevSection: () => {
    const { currentSection } = get()
    const idx = SECTION_ORDER.indexOf(currentSection)
    if (idx > 0) {
      set({ currentSection: SECTION_ORDER[idx - 1] })
    }
  },

  setIsSaving: (v) => set({ isSaving: v }),
  setLastSaved: (t) => set({ lastSaved: t }),
  setError: (e) => set({ error: e }),

  reset: () =>
    set({
      resumeId: null,
      name: "My Resume",
      sections: EMPTY_SECTIONS,
      messages: [],
      currentSection: "personal",
      isSaving: false,
      lastSaved: null,
      error: null,
    }),
}))
