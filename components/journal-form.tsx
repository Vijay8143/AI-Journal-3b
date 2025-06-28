"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { saveJournalEntry, debugDatabaseState } from "@/lib/actions"
import { Loader2, PenTool, AlertCircle, Bug } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function JournalForm() {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDebugging, setIsDebugging] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({
        title: "Empty entry",
        description: "Please write something before saving your journal entry.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log("🚀 Form submitting journal entry...")
      const result = await saveJournalEntry(content.trim())

      if (result.success) {
        console.log("✅ Form received success result:", result)

        setContent("")
        toast({
          title: "Entry saved! ✨",
          description: `Your journal entry has been saved and analyzed. Entry ID: ${result.entry?.id}`,
        })

        // Multiple refresh strategies
        console.log("🔄 Refreshing page...")
        router.refresh()

        // Force a hard refresh after a delay as fallback
        setTimeout(() => {
          console.log("🔄 Hard refresh fallback...")
          window.location.reload()
        }, 2000)
      } else {
        console.error("❌ Form received error result:", result.error)
        toast({
          title: "Error",
          description: result.error || "Failed to save your journal entry.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("💥 Form submission error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDebug = async () => {
    setIsDebugging(true)
    try {
      const debugResult = await debugDatabaseState()
      console.log("🔧 Debug result:", debugResult)

      toast({
        title: "Debug Complete",
        description: "Check the browser console for detailed debug information.",
      })
    } catch (error) {
      console.error("Debug error:", error)
      toast({
        title: "Debug Error",
        description: "Failed to run debug. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setIsDebugging(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="w-5 h-5" />
          Write Your Thoughts
        </CardTitle>
        <CardDescription>
          Share what's on your mind. AI will analyze your entry and detect your mood.
          {!process.env.NEXT_PUBLIC_OPENAI_AVAILABLE && (
            <span className="flex items-center gap-1 mt-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              Using basic analysis (OpenAI not configured)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Dear journal, today I..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{content.length} characters</p>
              <Button type="button" variant="outline" size="sm" onClick={handleDebug} disabled={isDebugging}>
                {isDebugging ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Debug
                  </>
                ) : (
                  <>
                    <Bug className="w-3 h-3 mr-1" />
                    Debug
                  </>
                )}
              </Button>
            </div>
            <Button type="submit" disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Entry"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
