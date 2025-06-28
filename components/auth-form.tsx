"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createUser, loginUser } from "@/lib/auth"
import { Loader2, UserPlus, LogIn, Copy, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AuthFormProps {
  onSuccess: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [newUserName, setNewUserName] = useState("")
  const [loginId, setLoginId] = useState("")
  const [generatedLoginId, setGeneratedLoginId] = useState("")
  const [copied, setCopied] = useState(false)

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newUserName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to create an account.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await createUser(newUserName)

      if (result.success && result.user) {
        setGeneratedLoginId(result.user.loginId)
        toast({
          title: "Account created! 🎉",
          description: `Welcome ${result.user.name}! Your unique login ID is ${result.user.loginId}`,
        })

        // Auto-redirect after showing the login ID for a moment
        setTimeout(() => {
          onSuccess()
        }, 3000)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create account.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!loginId.trim()) {
      toast({
        title: "Login ID required",
        description: "Please enter your login ID.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await loginUser(loginId)

      if (result.success && result.user) {
        toast({
          title: "Welcome back! 👋",
          description: `Hello ${result.user.name}!`,
        })
        onSuccess()
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Invalid login ID.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyLoginId = async () => {
    if (generatedLoginId) {
      await navigator.clipboard.writeText(generatedLoginId)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Login ID copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (generatedLoginId) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">Account Created! 🎉</CardTitle>
          <CardDescription>Save your unique login ID - you'll need it to access your journal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Login ID:</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-2xl font-bold tracking-wider bg-background px-3 py-2 rounded border">
                {generatedLoginId}
              </code>
              <Button variant="outline" size="icon" onClick={copyLoginId} className="h-10 w-10 bg-transparent">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>⚠️ Keep this ID safe! You'll need it to log in.</p>
            <p className="mt-2">Redirecting to your journal in a moment...</p>
          </div>
          <Button onClick={onSuccess} className="w-full">
            Continue to Journal
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome to AI Journal</CardTitle>
        <CardDescription>Create a new account or log in with your unique ID</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="signup">New User</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="loginId" className="text-sm font-medium">
                  Login ID
                </label>
                <Input
                  id="loginId"
                  placeholder="Enter your 6-character login ID"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center text-lg tracking-wider font-mono"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Log In
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Your Name
                </label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
            <div className="text-xs text-muted-foreground text-center">
              You'll receive a unique 6-character login ID that you'll use to access your journal.
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
