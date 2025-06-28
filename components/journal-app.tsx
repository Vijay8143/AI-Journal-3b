"use client"

import { useState } from "react"
import { JournalForm } from "@/components/journal-form"
import { JournalTimeline } from "@/components/journal-timeline"
import { Separator } from "@/components/ui/separator"

interface JournalEntry {
  id: number
  content: string
  summary: string
  mood: string
  created_at: string
  user_id: number
}

interface JournalAppProps {
  initialEntries: JournalEntry[]
}

export function JournalApp({ initialEntries }: JournalAppProps) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries)

  const handleNewEntry = (newEntry: JournalEntry) => {
    console.log("✨ Adding new entry to timeline:", newEntry)
    // Add new entry to the beginning of the list (most recent first)
    setEntries((prev) => [newEntry, ...prev])
  }

  return (
    <>
      <JournalForm onEntryAdded={handleNewEntry} />

      <div className="flex items-center justify-center">
        <Separator className="max-w-xs" />
      </div>

      <JournalTimeline entries={entries} />
    </>
  )
}
