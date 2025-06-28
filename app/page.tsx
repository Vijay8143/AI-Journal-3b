import { getCurrentUser } from "@/lib/auth"
import { getJournalEntries } from "@/lib/actions"
import { AuthForm } from "@/components/auth-form"
import { UserHeader } from "@/components/user-header"
import { JournalApp } from "@/components/journal-app"
import { BookOpen } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

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

          <AuthForm
            onSuccess={() => {
              window.location.reload()
            }}
          />
        </div>
      </div>
    )
  }

  /* -------------------------------- authenticated ------------------------ */
  // Fetch initial entries on server
  const initialEntries = await getJournalEntries()

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

        <UserHeader />

        {/* Client component that manages entries state */}
        <JournalApp initialEntries={initialEntries} />
      </div>
    </div>
  )
}
