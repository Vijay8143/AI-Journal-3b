"use server"

import { sql } from "./db"
import { cookies } from "next/headers"

// ─── tiny retry helper to mask Neon 429s ────────────────────────────
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
      const isRateLimit = msg.includes("Too Many") || msg.includes("429") || msg.includes("rate limit")
      if (!isRateLimit) throw err
      if (i === max - 1) {
        console.warn("Neon still rate-limiting after retries → using fallback")
        return fallback
      }
      await new Promise((r) => setTimeout(r, 500 * 2 ** i)) // exponential back-off
    }
  }
  // TS happiness – never reached
  return fallback
}

// --- ensure the auth tables/columns exist ------------------------------
async function ensureUserTableExists() {
  await execWithRetry(
    () => sql`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      login_id   VARCHAR(20)  UNIQUE NOT NULL,
      created_at TIMESTAMPTZ  DEFAULT NOW()
    );
  `,
    { fallback: undefined },
  )

  await execWithRetry(
    () => sql`
    ALTER TABLE journal_entries
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
  `,
    { fallback: undefined },
  )
}

// Generate a unique 6-character login ID
function generateLoginId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function createUser(name: string) {
  await ensureUserTableExists()
  try {
    // Generate unique login ID
    let loginId = generateLoginId()
    let attempts = 0

    // Ensure login ID is unique (retry up to 10 times)
    while (attempts < 10) {
      const existing = await execWithRetry(() => sql`SELECT id FROM users WHERE login_id = ${loginId}`, {
        fallback: [],
      })

      if (existing.length === 0) break

      loginId = generateLoginId()
      attempts++
    }

    if (attempts >= 10) {
      throw new Error("Unable to generate unique login ID")
    }

    // Create user
    const result = await execWithRetry(
      () =>
        sql`INSERT INTO users (name, login_id)
      VALUES (${name.trim()}, ${loginId})
      RETURNING id, name, login_id, created_at`,
      { fallback: [] },
    )

    const user = result[0]

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("user_id", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        loginId: user.login_id,
        createdAt: user.created_at,
      },
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return {
      success: false,
      error: "Failed to create user account",
    }
  }
}

export async function loginUser(loginId: string) {
  await ensureUserTableExists()
  try {
    const result = await execWithRetry(
      () =>
        sql`SELECT id, name, login_id, created_at 
      FROM users 
      WHERE login_id = ${loginId.toUpperCase().trim()}`,
      { fallback: [] },
    )

    if (result.length === 0) {
      return {
        success: false,
        error: "Invalid login ID. Please check and try again.",
      }
    }

    const user = result[0]

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("user_id", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        loginId: user.login_id,
        createdAt: user.created_at,
      },
    }
  } catch (error) {
    console.error("Error logging in user:", error)
    return {
      success: false,
      error: "Failed to log in",
    }
  }
}

// ─── CURRENT USER ───────────────────────────────────────────────────
export async function getCurrentUser() {
  // Always wrap everything so *no* error escapes
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return null

    const result = await execWithRetry(
      () =>
        sql`SELECT id, name, login_id, created_at
            FROM users
            WHERE id = ${Number.parseInt(userId)}`,
      { fallback: [] },
    )

    if (!Array.isArray(result) || result.length === 0) return null

    const u = result[0]
    return {
      id: u.id,
      name: u.name,
      loginId: u.login_id,
      createdAt: u.created_at,
    }
  } catch (err) {
    console.error("getCurrentUser swallowed DB error:", err)
    return null
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("user_id")

    return { success: true }
  } catch (error) {
    console.error("Error logging out user:", error)
    return {
      success: false,
      error: "Failed to log out",
    }
  }
}
