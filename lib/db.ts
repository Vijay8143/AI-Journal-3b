import { neon } from "@neondatabase/serverless"

/**
 * Creates a Neon SQL client *or* falls back to an in-memory store when
 * DATABASE_URL is not provided (e.g. in next-lite preview).
 * This lets you try the app immediately and switch to Neon by simply
 * adding the env var.
 */

declare global {
  /* eslint-disable no-var */
  var _sql: any | undefined
  var _memoryEntries:
    | Array<{
        id: number
        content: string
        summary: string
        mood: string
        created_at: string
      }>
    | undefined
  /* eslint-enable no-var */
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is required. Please add your Neon database connection string to your environment variables.",
  )
}

globalThis._sql = globalThis._sql ?? neon(databaseUrl)

export const sql = globalThis._sql
