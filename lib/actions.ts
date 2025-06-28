"use server"

import { sql } from "./db"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { revalidatePath } from "next/cache"

function fallbackSummary(text: string, max = 120) {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + "…"
}

function detectMoodFromText(text: string): string {
  const lowerText = text.toLowerCase()

  // Simple keyword-based mood detection
  if (
    lowerText.includes("happy") ||
    lowerText.includes("joy") ||
    lowerText.includes("excited") ||
    lowerText.includes("great")
  ) {
    return "happy"
  }
  if (lowerText.includes("sad") || lowerText.includes("down") || lowerText.includes("depressed")) {
    return "sad"
  }
  if (lowerText.includes("anxious") || lowerText.includes("worried") || lowerText.includes("nervous")) {
    return "anxious"
  }
  if (lowerText.includes("grateful") || lowerText.includes("thankful") || lowerText.includes("blessed")) {
    return "grateful"
  }
  if (lowerText.includes("calm") || lowerText.includes("peaceful") || lowerText.includes("serene")) {
    return "calm"
  }
  if (lowerText.includes("frustrated") || lowerText.includes("angry") || lowerText.includes("annoyed")) {
    return "frustrated"
  }
  if (lowerText.includes("energy") || lowerText.includes("energetic") || lowerText.includes("pumped")) {
    return "energetic"
  }

  return "reflective"
}

const analysisSchema = z.object({
  summary: z.string().describe("A brief 1-2 sentence summary of the journal entry"),
  mood: z
    .enum([
      "happy",
      "sad",
      "anxious",
      "excited",
      "calm",
      "frustrated",
      "grateful",
      "reflective",
      "energetic",
      "peaceful",
    ])
    .describe("The primary mood detected in the journal entry"),
})

export async function saveJournalEntry(content: string) {
  try {
    console.log("Saving journal entry, content length:", content.length)

    // ── AI analysis ─────────────────────────────────────────────
    let analysis: { summary: string; mood: string }

    const buildFallback = () => ({
      summary: fallbackSummary(content),
      mood: detectMoodFromText(content),
    })

    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI API key, using fallback analysis")
      analysis = buildFallback()
    } else {
      try {
        console.log("Using OpenAI for analysis")
        const { object } = await generateObject({
          model: openai("gpt-4o-mini"),
          schema: analysisSchema,
          prompt: `Analyze this journal entry and provide a brief summary and detect the primary mood:\n\n"${content}"\n\nBe empathetic and accurate in your analysis.`,
        })
        analysis = object
        console.log("AI analysis completed:", analysis)
      } catch (aiErr) {
        console.error("AI analysis failed, using fallback:", aiErr)
        analysis = buildFallback()
      }
    }

    console.log("Inserting into database...")

    // Save to database
    const result = await sql`
      INSERT INTO journal_entries (content, summary, mood, created_at)
      VALUES (${content}, ${analysis.summary}, ${analysis.mood}, NOW())
      RETURNING id, created_at
    `

    console.log("Database insert successful:", result[0])

    revalidatePath("/")

    return {
      success: true,
      entry: {
        id: result[0].id,
        content,
        summary: analysis.summary,
        mood: analysis.mood,
        created_at: result[0].created_at,
      },
    }
  } catch (error) {
    console.error("Error saving journal entry:", error)
    return {
      success: false,
      error: `Failed to save journal entry: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function getJournalEntries() {
  try {
    console.log("Fetching journal entries...")

    const entries = await sql`
      SELECT id, content, summary, mood, created_at
      FROM journal_entries
      ORDER BY created_at DESC
      LIMIT 50
    `

    console.log(`Fetched ${entries.length} entries`)
    return entries
  } catch (error) {
    console.error("Error fetching journal entries:", error)
    return []
  }
}
