"use client"

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Heart, Brain } from "lucide-react"
import { TimelineRefreshButton } from "./timeline-refresh-button"

interface JournalEntry {
  id: number
  content: string
  summary: string
  mood: string
  created_at: string
  user_id: number
}

interface JournalTimelineProps {
  entries: JournalEntry[]
}

const moodColors = {
  happy: "bg-yellow-100 text-yellow-800 border-yellow-200",
  sad: "bg-blue-100 text-blue-800 border-blue-200",
  anxious: "bg-orange-100 text-orange-800 border-orange-200",
  excited: "bg-pink-100 text-pink-800 border-pink-200",
  calm: "bg-green-100 text-green-800 border-green-200",
  frustrated: "bg-red-100 text-red-800 border-red-200",
  grateful: "bg-purple-100 text-purple-800 border-purple-200",
  reflective: "bg-indigo-100 text-indigo-800 border-indigo-200",
  energetic: "bg-emerald-100 text-emerald-800 border-emerald-200",
  peaceful: "bg-teal-100 text-teal-800 border-teal-200",
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function JournalTimeline({ entries }: JournalTimelineProps) {
  console.log("📊 Timeline rendering with entries:", entries.length)

  if (entries.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto" data-timeline>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Your Journal Timeline</h2>
          </div>
          <TimelineRefreshButton />
        </div>

        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No entries yet</h3>
            <p>Start journaling to see your thoughts and moods over time.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6" data-timeline>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Your Journal Timeline</h2>
          <span className="text-sm text-muted-foreground">({entries.length} entries)</span>
        </div>
        <TimelineRefreshButton />
      </div>

      <div className="space-y-4">
        {entries.map((entry: JournalEntry, index: number) => (
          <Card key={`${entry.id}-${index}`} className="relative animate-in fade-in-50 duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(entry.created_at)}
                  <span className="text-xs opacity-50">ID: {entry.id}</span>
                </CardDescription>
                <Badge
                  variant="outline"
                  className={moodColors[entry.mood as keyof typeof moodColors] || "bg-gray-100 text-gray-800"}
                >
                  <Heart className="w-3 h-3 mr-1" />
                  {entry.mood}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Summary
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">{entry.summary}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Your Entry</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
