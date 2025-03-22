"use client"
import AdminPage from "./AdminPage"
import type { User } from "lucia"
import NewsSidebar from "./NewsSidebar"

const ads = [
  {
    id: "1",
    imageSrc: "/myad.webp",
    link: "https://example.com/ad1",
    alt: "Advertisement 1",
  },
  {
    id: "2",
    imageSrc: "/luka.jpg",
    link: "https://example.com/ad2",
    alt: "Special Offer Advertisement",
  },
  {
    id: "3",
    imageSrc: "/ad2.jpg",
    link: "https://example.com/ad3",
    alt: "Limited Time Deal Advertisement",
  },
]

interface UserDashboardProps {
  userInfo: User & { hasPaid: boolean }
}

export default function UserDashboard({ userInfo }: UserDashboardProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome, {userInfo.displayName || 'User'}</h1>
      {/* Add your dashboard content here */}
    </div>
  )
}

