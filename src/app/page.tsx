import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold text-lg">PlacementOS</span>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Your placement journey, one platform
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Build an ATS-optimized resume. Get a personalized roadmap.
              Practice with AI mock interviews. All connected. All free.
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-base px-8">
                Start Free — No credit card
              </Button>
            </Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Resume Builder</h3>
              <p className="text-sm text-muted-foreground">
                Have a conversation, get a professional ATS-optimized resume.
                AI probes for impact metrics you forgot.
              </p>
            </div>
            <div className="border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Roadmap Engine</h3>
              <p className="text-sm text-muted-foreground">
                Personalized to your role, timeline, and skill gaps. Adapts as
                you improve.
              </p>
            </div>
            <div className="border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Interview Coach</h3>
              <p className="text-sm text-muted-foreground">
                AI mock interviews with real-time feedback. Eye contact, pace,
                filler words — all tracked locally.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          Built by students for students. Privacy-first. Your data stays yours.
        </div>
      </footer>
    </div>
  )
}
