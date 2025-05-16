"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const { user } = useSession();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Admin Panel</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/ad-pricing"
          className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
        >
          <h2 className="mb-2 text-xl font-semibold">Ad Pricing Management</h2>
          <p className="text-gray-600">
            Set and manage pricing rules for advertisements based on location,
            position, and duration.
          </p>
        </Link>
        {/* Add other admin panel links here */}
      </div>
    </div>
  );
}
