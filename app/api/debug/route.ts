import { debugDatabaseState } from "@/lib/actions"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const debugResult = await debugDatabaseState()
    return NextResponse.json(debugResult)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
