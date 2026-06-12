import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Map } from "lucide-react"

export default function RoadmapPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Roadmap</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your personalized placement preparation plan.
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Map className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg mb-2">No roadmap yet</CardTitle>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Complete the onboarding assessment to get a personalized roadmap
            tailored to your role, timeline, and skill level.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
