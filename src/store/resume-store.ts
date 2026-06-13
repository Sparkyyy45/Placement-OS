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
