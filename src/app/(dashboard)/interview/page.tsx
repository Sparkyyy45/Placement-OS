import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic } from "lucide-react"

export default function InterviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mock Interview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Practice with AI-powered mock interviews.
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Mic className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg mb-2">No interviews yet</CardTitle>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Practice with AI mock interviews. Get real-time feedback on your
            answers, communication, and confidence.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
