import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import HomePage from "./HomePage"
import { Suspense } from "react"
import CategoryFeed from "@/components/CategoryFeed"
import NewsSidebar from "@/components/NewsSidebar"

// Define ads for sidebar
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

export default async function Page({
  searchParams,
}: {
  searchParams: { category?: string; subcategory?: string }
}) {
  const session = await validateRequest()
  const userInfo = session.user ? await prisma.user.findUnique({
    where: { id: session.user.id },
  }) : null

  // Check if a category filter is applied
  const hasCategory = !!searchParams.category

  return (
    <main className="container mx-auto px-4 py-6">
      {hasCategory ? (
        // Show category-filtered feed when category is present
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3 order-1">
            <Suspense fallback={<div>Loading...</div>}>
              <CategoryFeed />
            </Suspense>
          </div>
          <div className="w-full lg:w-1/3 order-2">
            <NewsSidebar ads={ads} />
          </div>
        </div>
      ) : (
        // Show regular homepage when no category filter
        <HomePage userInfo={userInfo} session={session} />
      )}
    </main>
  )
}
