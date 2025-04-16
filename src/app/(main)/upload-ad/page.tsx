"use client"

import AdUploadForm from "@/components/ads/AdUploadForm"
import { useSession } from "@/app/(main)/SessionProvider"
import { redirect } from "next/navigation"

export default function UploadAdPage() {
  const { user } = useSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Upload Advertisement</h2>
      </div>
      <div className="grid gap-4 md:gap-8 lg:gap-12">
        <div className="bg-card rounded-lg shadow-md">
          <div className="p-6">
            <AdUploadForm />
          </div>
        </div>
      </div>
    </div>
  )
} 