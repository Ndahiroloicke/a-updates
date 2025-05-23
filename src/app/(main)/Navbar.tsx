import { validateRequest } from "@/auth"
import SearchField from "@/components/SearchField"
import UserButton from "@/components/UserButton"
import prisma from "@/lib/prisma"
import Link from "next/link"
import RotatingAdBanner from "@/components/RotatingAdBanner"
import NotificationBell from "@/components/NotificationBell"

interface NavbarProps {
  /**
   * Hide the login button when user is not authenticated
   * @default false
   */
  hideLoginButton?: boolean

  /**
   * Show advertisement instead of login button when user is not authenticated
   * @default false
   */
  showAdvert?: boolean
}

export default async function Navbar({ hideLoginButton = false, showAdvert = false }: NavbarProps = {}) {
  const session = await validateRequest()
  const userInfo = await prisma.user.findUnique({
    where: { id: session.user?.id || "" },
  })

  // Define your ads array
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

  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm dark:bg-gray-900">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-3">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary">
          Africa Updates
        </Link>

        {/* Search Field */}
        <div className="order-last w-full sm:order-none sm:w-auto">
          <SearchField />
        </div>

        {/* User Actions */}
        <div className="flex flex-wrap items-center gap-4 sm:ms-auto">
          {session.user ? (
            <>
              {(userInfo?.role === "PUBLISHER" || userInfo?.role === "ADMIN") && (
                <Link
                  href={"/posts/create"}
                  className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground sm:px-10"
                >
                  Create Post
                </Link>
              )}
              {/* Notification Bell for admins and sub-admins */}
              {userInfo && (userInfo.role === "ADMIN" || userInfo.role === "SUB_ADMIN") && (
                <NotificationBell role={userInfo.role} />
              )}
              <UserButton />
            </>
          ) : (
            <div className="w-full sm:w-auto sm:ms-auto">
              {showAdvert ? (
                <div className="w-[200px] sm:w-[250px] md:w-[300px]">
                  <RotatingAdBanner
                    position="IN_FEED"
                    rotationInterval={5000}
                    className="rounded-lg overflow-hidden shadow-md"
                  />
                </div>
              ) : !hideLoginButton ? (
                <Link
                  href={"/login"}
                  className="block w-full rounded-full bg-primary px-6 py-2 text-center text-sm font-bold text-primary-foreground sm:w-auto sm:px-10"
                >
                  Login
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

