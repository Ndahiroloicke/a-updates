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

export default function DashboardLayout({ userInfo }: { userInfo: User }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 py-6">
          {/* Main Content - AdminPage appears first on all screen sizes */}
          <div className="w-full lg:w-2/3 order-1">
            <AdminPage userInfo={userInfo} />
          </div>

          {/* Right Sidebar - Appears below AdminPage on mobile, to the right on desktop */}
          <div className="w-full lg:w-1/3 order-2">
            <NewsSidebar ads={ads} />
          </div>
        </div>
      </div>
    </div>
  )
}

