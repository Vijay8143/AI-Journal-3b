import { getCurrentUser, logoutUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, LogOut } from "lucide-react"
import { revalidatePath } from "next/cache"

export async function UserHeader() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const handleLogout = async () => {
    "use server"
    await logoutUser()
    revalidatePath("/")
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">
              Login ID: <code className="font-mono bg-muted px-1 rounded">{user.loginId}</code>
            </p>
          </div>
        </div>
        <form action={handleLogout}>
          <Button variant="outline" size="sm" type="submit">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
