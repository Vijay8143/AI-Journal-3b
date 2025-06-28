import { JournalForm } from "@/components/journal-form"
import { JournalTimeline } from "@/components/journal-timeline"
import { Separator } from "@/components/ui/separator"
import { BookOpen } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Journal
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Capture your daily thoughts and let AI help you understand your emotions and patterns over time.
          </p>
        </header>

        <div className="space-y-12">
          <JournalForm />

          <div className="flex items-center justify-center">
            <Separator className="max-w-xs" />
          </div>

          <JournalTimeline />
        </div>
      </div>
    </div>
  )
}
