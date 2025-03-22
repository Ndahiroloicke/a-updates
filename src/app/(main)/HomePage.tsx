"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserDashboard from "@/components/UserDashboard"
import NewsFeed from "@/components/newsFeed"
import NewsSidebar from "@/components/NewsSidebar"
import { useAd } from "@/contexts/AdContext"
import { useEffect } from "react"
import type { User } from "lucia"
import AdminPage from "@/components/AdminPage"

interface HomePageProps {
  userInfo: User | null;
  session: any;
}

export default function HomePage({ userInfo, session }: HomePageProps) {
  const { showAd } = useAd()

  useEffect(() => {
    // Example of showing an MTN ad
    const mtnAd = {
      imageUrl: "/ads/mtn-ad.jpg",
      backgroundColor: "#FFD700", // MTN yellow
      duration: 5000, // 5 seconds
    }

    showAd(mtnAd)
  }, [])

  const userWithDefaultValues = userInfo
    ? {
        ...userInfo,
        hasPaid: userInfo.hasPaid ?? false,
      }
    : null

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
      link: "",
      alt: "Special Offer Advertisement",
    },
    {
      id: "3",
      imageSrc: "/ad2.jpg",
      link: "",
      alt: "Limited Time Deal Advertisement",
    },
  ]

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="w-full min-w-0 space-y-5">
        {session?.user ? (
          // Show AdminPage and NewsSidebar in parallel for authenticated users
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-2/3 order-1">
              <AdminPage userInfo={userWithDefaultValues} />
            </div>
            <div className="w-full lg:w-1/3 order-2">
              <NewsSidebar ads={ads} />
            </div>
          </div>
        ) : (
          // Show default content for non-authenticated users
          <Tabs defaultValue="latest" className="max-w-7xl mx-auto">
            <TabsContent value="latest">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-2/3 order-1">
                  <NewsFeed />
                </div>
                <div className="w-full lg:w-1/3 order-2">
                  <NewsSidebar ads={ads} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  )
} 