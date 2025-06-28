"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function TimelineRefreshButton() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      console.log("🔄 Manual refresh triggered")
      router.refresh()

      // Also try a hard refresh as fallback
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } finally {
      setTimeout(() => setIsRefreshing(false), 2000)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
      <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
      Refresh
    </Button>
  )
}
