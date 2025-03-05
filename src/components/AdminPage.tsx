"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Mail,
  Settings,
  Users,
  MessageSquare,
  BookOpen,
  History,
  Send,
  ExternalLink,
  Grid2X2,
  Home,
  Bookmark,
} from "lucide-react"
import type { User } from "lucia"

export default function AdminPage({ userInfo }: { userInfo: User }) {
  const router = useRouter()
  // Remove these lines
  // const [isDarkMode, setIsDarkMode] = useState(false)

  // const toggleDarkMode = () => {
  //   setIsDarkMode(!isDarkMode)
  //   document.documentElement.classList.toggle("dark")
  // }

  const handlePublisherSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      router.push("/publisher-registration")
    }
  }

  const handleAdvertiserSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      router.push("/advertiser-registration")
    }
  }

  return (
    <div className={`min-h-screen bg-background transition-colors duration-300`}>
      <div className="container mx-auto space-y-6 md:space-y-9 px-4 py-6 md:py-8 pb-20 md:pb-8">
        <div className="flex justify-between items-center px-4 sm:px-8 md:px-12 mt-6 md:mt-10">
          <header className="border-b-2 border-primary w-fit text-xl sm:text-2xl md:text-3xl font-bold py-3 md:py-6">
            <h1>
              Welcome: <span className="text-primary">{userInfo.username || "Laulan"}</span>
            </h1>
          </header>
          {/* Remove these lines */}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className="hidden md:flex items-center gap-2"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="h-4 w-4 mr-1" /> : <Moon className="h-4 w-4 mr-1" />}
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="flex md:hidden"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button> */}
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {/* Left Box */}
          <Card className="bg-card dark:text-white text-black border-border hover:shadow-lg transition-shadow">
            <CardContent className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
              {userInfo.role === "ADMIN" && (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
                  >
                    <Link href="/admin-panel">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
                  >
                    <Link href="/admin-email">
                      <Mail className="w-4 h-4 mr-2" />
                      Admin Email
                    </Link>
                  </Button>
                </>
              )}
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href={`/users/${userInfo?.username}`}>
                  <Users className="w-4 h-4 mr-2" />
                  My Profile
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href={`/users/${userInfo?.username}/followers`}>
                  <Users className="w-4 h-4 mr-2" />
                  Followers
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href={`/users/${userInfo?.username}/following`}>
                  <Users className="w-4 h-4 mr-2" />
                  Following
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/stories">
                  <Grid2X2 className="w-4 h-4 mr-2" />
                  Push wall
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/forum">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Go to Forum
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Right Box */}
          <Card className="bg-card dark:text-white text-black border-border hover:shadow-lg transition-shadow">
            <CardContent className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/messages">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message[Inbox]
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/my-posts">
                  <History className="w-4 h-4 mr-2" />
                  Post history
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/posts/create">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Post a new story
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/safari">
                  <BookOpen className="w-4 h-4 mr-2" />
                  My Safari
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/email-all">
                  <Send className="w-4 h-4 mr-2" />
                  Send Email to all
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Publisher and Advertiser Section */}
        <div className="space-y-4 md:space-y-6 mt-6 md:mt-8">
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-semibold">Publisher</h2>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="publishCheckbox"
                className="h-4 w-4 rounded border-gray-300"
                onChange={handlePublisherSelect}
              />
              <label htmlFor="publishCheckbox" className="text-xs sm:text-sm">
                Select if you want to Publish on website, our Corporate Media Hub, or Push wall.
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-semibold">Advertiser</h2>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="advertiseCheckbox"
                className="h-4 w-4 rounded border-gray-300"
                onChange={handleAdvertiserSelect}
              />
              <label htmlFor="advertiseCheckbox" className="text-xs sm:text-sm">
                Select if you want to advertise on website
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-10">
        <div className="grid grid-cols-5 gap-1 p-2">
          <Button variant="ghost" size="icon" asChild className="flex flex-col items-center justify-center p-1">
            <Link href="/stories">
              <Home className="h-5 w-5" />
              <span className="text-[10px] mt-1">Home</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="flex flex-col items-center justify-center p-1">
            <Link href="/messages">
              <MessageSquare className="h-5 w-5" />
              <span className="text-[10px] mt-1">Messages</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="flex flex-col items-center justify-center p-1">
            <Link href="/posts/create">
              <Send className="h-5 w-5" />
              <span className="text-[10px] mt-1">Post</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="flex flex-col items-center justify-center p-1">
            <Link href="/safari">
              <Bookmark className="h-5 w-5" />
              <span className="text-[10px] mt-1">Safari</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="flex flex-col items-center justify-center p-1">
            <Link href={`/users/${userInfo?.username}`}>
              <Users className="h-5 w-5" />
              <span className="text-[10px] mt-1">Profile</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

