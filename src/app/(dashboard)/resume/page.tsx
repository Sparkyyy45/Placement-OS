import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus } from "lucide-react"

export default function ResumeListPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Resumes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage your resume versions.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Resume
        </Button>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg mb-2">No resumes yet</CardTitle>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Build your first resume with our AI-powered builder. Have a
            conversation, get a professional ATS-optimized resume.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Build your first resume
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
