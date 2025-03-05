import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import UserDashboard from "@/components/UserDashboard"
import NewsFeed from "@/components/newsFeed"
import NewsSidebar from "@/components/NewsSidebar"

export default async function Home() {
  const session = await validateRequest()
  const userInfo = await prisma.user.findUnique({
    where: { id: session.user?.id || "" },
  })

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
        {userInfo?.role === "ADMIN" ? (
          userWithDefaultValues && <UserDashboard userInfo={userWithDefaultValues} />
        ) : session.user ? (
          <Tabs defaultValue="latest">
            {userWithDefaultValues && <UserDashboard userInfo={userWithDefaultValues} />}
          </Tabs>
        ) : (
          <Tabs defaultValue="latest" className="max-w-7xl mx-auto">
            <TabsList className="mb-4">
              <TabsTrigger value="latest">
                <span className="text-xl sm:text-2xl md:text-3xl">Latest News</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="latest">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Main content first on all screen sizes */}
                <div className="w-full lg:w-2/3 order-1">
                  <NewsFeed />
                </div>

                {/* Sidebar below main content on mobile, side by side on larger screens */}
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

