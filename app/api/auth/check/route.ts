import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()

    return NextResponse.json({
      authenticated: !!user,
      user: user
        ? {
            id: user.id,
            name: user.name,
            loginId: user.loginId,
          }
        : null,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({
      authenticated: false,
      user: null,
    })
  }
}
