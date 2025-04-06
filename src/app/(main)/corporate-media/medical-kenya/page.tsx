"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MedicalKenyaRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.push("/corporate-media/medical-kenya/partnership")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Redirecting to Medical Kenya Partnership Details...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you to the full partnership information.</p>
      </div>
    </div>
  )
}