import { validateRequest } from "@/auth"
import { redirect } from "next/navigation"
import AuthenticatedNewsFeed from "@/components/AuthenticatedNewsFeed"
import NewsSidebar from "@/components/NewsSidebar"

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

export default async function HomePage() {
  const { user } = await validateRequest()

  if (!user) {
    redirect("/")
  }

  return (
    <main className="flex w-full min-w-0 flex-col lg:flex-row gap-5">
      <div className="w-full min-w-0 flex flex-col lg:flex-row gap-6 space-y-5">
        <div>
          <AuthenticatedNewsFeed />
        </div>
        <NewsSidebar ads={ads} />
      </div>
    </main>
  )
}