"use server"

import { sql } from "./db"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"

function fallbackSummary(text: string, max = 120) {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + "…"
}

function detectMoodFromText(text: string): string {
  const lowerText = text.toLowerCase()

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

async function execWithRetry<T>(
  fn: () => Promise<T>,
  {
    max = 3,
    fallback,
  }: {
    max?: number
    fallback: T
  },
): Promise<T> {
  for (let i = 0; i < max; i++) {
    try {
      return await fn()
    } catch (err: any) {
      const msg = String(err?.message ?? err)
      const isRateLimit = msg.includes("Too Many") || msg.includes("rate limit") || msg.includes("Unexpected token")
      if (!isRateLimit) throw err
      if (i === max - 1) {
        console.warn("Database still rate-limiting after retries → returning fallback")
        return fallback
      }
      await new Promise((r) => setTimeout(r, 500 * 2 ** i))
    }
  }
  return fallback
}

export async function saveJournalEntry(content: string) {
  console.log("🔄 Starting saveJournalEntry process...")

  try {
    // Step 1: Verify user authentication
    const user = await getCurrentUser()
    console.log("👤 Current user:", user ? `${user.name} (ID: ${user.id})` : "Not authenticated")

    if (!user) {
      console.error("❌ No authenticated user found")
      return {
        success: false,
        error: "You must be logged in to save journal entries",
      }
    }

    // Step 2: AI Analysis
    console.log("🤖 Starting AI analysis...")
    let analysis: { summary: string; mood: string }

    const buildFallback = () => ({
      summary: fallbackSummary(content),
      mood: detectMoodFromText(content),
    })

    if (!process.env.OPENAI_API_KEY) {
      console.log("⚠️ No OpenAI API key, using fallback analysis")
      analysis = buildFallback()
    } else {
      try {
        const { object } = await generateObject({
          model: openai("gpt-4o-mini"),
          schema: analysisSchema,
          prompt: `Analyze this journal entry and provide a brief summary and detect the primary mood:\n\n"${content}"\n\nBe empathetic and accurate in your analysis.`,
        })
        analysis = object
        console.log("✅ AI analysis completed:", analysis)
      } catch (aiErr) {
        console.error("⚠️ AI analysis failed, using fallback:", aiErr)
        analysis = buildFallback()
      }
    }

    // Step 3: Database insertion with detailed logging
    console.log("💾 Inserting into database...")
    console.log("📝 Entry details:", {
      contentLength: content.length,
      summary: analysis.summary,
      mood: analysis.mood,
      userId: user.id,
    })

    const result = await execWithRetry(
      async () => {
        const insertResult = await sql`
          INSERT INTO journal_entries (content, summary, mood, user_id, created_at)
          VALUES (${content}, ${analysis.summary}, ${analysis.mood}, ${user.id}, NOW())
          RETURNING id, created_at, user_id
        `
        console.log("📊 Raw database result:", insertResult)
        return insertResult
      },
      { fallback: [] },
    )

    if (!result || result.length === 0) {
      console.error("❌ Database insert failed - no result returned")
      throw new Error("Failed to insert journal entry - no result returned")
    }

    const savedEntry = result[0]
    console.log("✅ Database insert successful:", savedEntry)

    // Step 4: Verify the entry was saved by fetching it back
    console.log("🔍 Verifying entry was saved...")
    const verificationResult = await execWithRetry(
      () => sql`
        SELECT id, content, summary, mood, user_id, created_at
        FROM journal_entries
        WHERE id = ${savedEntry.id} AND user_id = ${user.id}
      `,
      { fallback: [] },
    )

    if (verificationResult.length === 0) {
      console.error("❌ Entry verification failed - entry not found after insert")
      throw new Error("Entry was not properly saved")
    }

    console.log("✅ Entry verification successful:", verificationResult[0])

    // Step 5: Check total entries for user
    const totalEntries = await execWithRetry(
      () => sql`
        SELECT COUNT(*) as count
        FROM journal_entries
        WHERE user_id = ${user.id}
      `,
      { fallback: [{ count: 0 }] },
    )

    console.log("📈 Total entries for user:", totalEntries[0]?.count || 0)

    // Step 6: Force cache invalidation
    console.log("🔄 Invalidating cache...")
    revalidatePath("/", "layout")
    revalidatePath("/", "page")

    console.log("🎉 saveJournalEntry completed successfully!")

    return {
      success: true,
      entry: {
        id: savedEntry.id,
        content,
        summary: analysis.summary,
        mood: analysis.mood,
        created_at: savedEntry.created_at,
        user_id: user.id,
      },
      debug: {
        userId: user.id,
        entryId: savedEntry.id,
        totalEntries: totalEntries[0]?.count || 0,
      },
    }
  } catch (error) {
    console.error("💥 Error in saveJournalEntry:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    return {
      success: false,
      error: `Failed to save journal entry: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function getJournalEntries() {
  console.log("📖 Starting getJournalEntries...")

  try {
    // Step 1: Verify user authentication
    const user = await getCurrentUser()
    console.log("👤 Current user for fetch:", user ? `${user.name} (ID: ${user.id})` : "Not authenticated")

    if (!user) {
      console.log("❌ No authenticated user found for fetching entries")
      return []
    }

    // Step 2: Fetch entries with detailed logging
    console.log("🔍 Fetching entries from database...")
    const entries = await execWithRetry(
      async () => {
        const result = await sql`
          SELECT id, content, summary, mood, created_at, user_id
          FROM journal_entries
          WHERE user_id = ${user.id}
          ORDER BY created_at DESC
          LIMIT 50
        `
        console.log("📊 Raw fetch result:", {
          resultType: typeof result,
          isArray: Array.isArray(result),
          length: result?.length || 0,
          firstEntry: result?.[0] || null,
        })
        return result
      },
      { fallback: [] },
    )

    // Step 3: Validate and process results
    if (!Array.isArray(entries)) {
      console.warn("⚠️ Database returned non-array result:", entries)
      return []
    }

    console.log(`✅ Successfully fetched ${entries.length} entries for user ${user.id}`)

    // Log first few entries for debugging
    if (entries.length > 0) {
      console.log(
        "📝 Sample entries:",
        entries.slice(0, 2).map((e) => ({
          id: e.id,
          mood: e.mood,
          created_at: e.created_at,
          contentPreview: e.content?.substring(0, 50) + "...",
        })),
      )
    }

    return entries
  } catch (error) {
    console.error("💥 Error in getJournalEntries:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    return []
  }
}

// New function to debug database state
export async function debugDatabaseState() {
  console.log("🔧 Starting database debug...")

  try {
    const user = await getCurrentUser()
    if (!user) {
      console.log("❌ No user for debug")
      return { error: "No authenticated user" }
    }

    // Check if tables exist
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'journal_entries')
    `
    console.log("📋 Available tables:", tablesResult)

    // Check user exists
    const userCheck = await sql`
      SELECT id, name, login_id 
      FROM users 
      WHERE id = ${user.id}
    `
    console.log("👤 User check:", userCheck)

    // Check all entries for user
    const allEntries = await sql`
      SELECT id, content, summary, mood, user_id, created_at
      FROM journal_entries
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `
    console.log("📚 All entries for user:", allEntries)

    // Check recent entries across all users (for debugging)
    const recentEntries = await sql`
      SELECT id, user_id, mood, created_at
      FROM journal_entries
      ORDER BY created_at DESC
      LIMIT 10
    `
    console.log("🕐 Recent entries (all users):", recentEntries)

    return {
      user: userCheck[0],
      userEntries: allEntries,
      recentEntries: recentEntries,
      tableCount: tablesResult.length,
    }
  } catch (error) {
    console.error("💥 Debug error:", error)
    return { error: error.message }
  }
}
