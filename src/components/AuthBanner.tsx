"use client"

import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function AuthBanner() {
  const { data: session } = useSession()

  if (session) return null

  return (
    <div className="bg-primary/5 border-b">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Sign in to personalize your news feed and join the discussion</p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/register">Register</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

