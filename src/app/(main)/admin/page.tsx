"use client"

import { useSession } from "./SessionProvider"
import { redirect } from "next/navigation"
import Link from "next/link"

export default function AdminPage() {
  const { user } = useSession()

  if (!user || user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/ad-pricing"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Ad Pricing Management</h2>
          <p className="text-gray-600">
            Set and manage pricing rules for advertisements based on location, position, and duration.
          </p>
        </Link>
        {/* Add other admin panel links here */}
      </div>
    </div>
  )
} 