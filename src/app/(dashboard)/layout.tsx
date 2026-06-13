"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Map,
  Mic,
  Settings,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/ui-store"
import { TrialBanner } from "@/components/shared/trial-banner"
import { UserMenu } from "@/components/shared/user-menu"

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/interview", label: "Interview", icon: Mic },
  { href: "/settings", label: "Settings", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <div className="flex h-screen">
      <aside
        className={cn(
          "border-r border-border bg-sidebar flex-shrink-0 transition-all duration-200 flex flex-col",
          sidebarOpen ? "w-56" : "w-14"
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-border">
          <button onClick={toggleSidebar} className="shrink-0">
            {sidebarOpen ? (
              <X className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          {sidebarOpen && (
            <span className="ml-3 font-semibold text-sm">PlacementOS</span>
          )}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {sidebarLinks.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href || pathname.startsWith(link.href + "/")
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <UserMenu />
            {sidebarOpen && (
              <span className="text-xs text-muted-foreground">Student</span>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto flex flex-col">
        <TrialBanner />
        <div className="max-w-6xl mx-auto p-6 flex-1">{children}</div>
      </main>
    </div>
  )
}
