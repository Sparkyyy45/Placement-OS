import { create } from "zustand"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

interface UIStore {
  sidebarOpen: boolean
  activeModal: string | null
  toasts: Toast[]
  toggleSidebar: () => void
  setActiveModal: (id: string | null) => void
  addToast: (toast: Omit<Toast, "id">) => void
  dismissToast: (id: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  activeModal: null,
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveModal: (id) => set({ activeModal: id }),
  addToast: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
