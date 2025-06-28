import { getCurrentUser } from "@/lib/auth"
import { AuthForm } from "@/components/auth-form"
import { UserHeader } from "@/components/user-header"
import { JournalForm } from "@/components/journal-form"
import { JournalTimeline } from "@/components/journal-timeline"
import { Separator } from "@/components/ui/separator"
import { BookOpen } from "lucide-react"

export const dynamic = "force-static" // let Next cache & re-validate
export const revalidate = 0 // always fresh for each user

export default async function Home() {
  const user = await getCurrentUser()

  /* -------------------------------- unauthenticated ---------------------- */
  if (!user) {
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
              Your personal AI-powered journaling companion. Each user gets their own private space.
            </p>
          </header>

          {/* AuthForm is a client component */}
          <AuthForm
            onSuccess={() => {
              /* router.refresh() inside AuthForm */
            }}
          />
        </div>
      </div>
    )
  }

  /* -------------------------------- authenticated ------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <header className="text-center">
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

        {/* server + client hybrid modules */}
        <UserHeader />
        <JournalForm />

        <div className="flex items-center justify-center">
          <Separator className="max-w-xs" />
        </div>

        <JournalTimeline />
      </div>
    </div>
  )
}
