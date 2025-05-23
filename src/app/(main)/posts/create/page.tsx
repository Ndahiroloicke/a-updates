"use client"
import PostEditor from "@/components/posts/editor/PostEditor"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StoryEditor from "@/components/posts/editor/StoryEditor"
import { useSession } from "../../SessionProvider" // Assuming you have a user context
import ReminderPublisherDialog from "../../reminderPublisher"
import PollEditor from "@/components/posts/editor/PollEditor"

const Page = () => {
  const { user } = useSession() // Get the user from your context or authentication system
  const [showReminder, setShowReminder] = useState(false)

  useEffect(() => {
    // Check if the user role is "Publisher"
    if (user?.role === "PUBLISHER" && user.hasPaid === false) {
      setShowReminder(true)
    }
  }, [user])

  const handlePayNow = () => {
    // Redirect to payment page or handle payment logic
    console.log("Redirecting to payment page...")
    setShowReminder(false) // Hide the reminder after payment
  }

  const handleDoItLater = () => {
    // Hide the reminder
    setShowReminder(false)
  }

  return (
    <main className="flex w-full min-w-0 flex-col px-2 sm:px-5 gap-5">
      <div className="w-full min-w-0 space-y-5">
        {/* Reminder Toast or Div */}
        {showReminder && (
          <ReminderPublisherDialog
            open={showReminder}
            onOpenChange={setShowReminder}
            onPayNow={handlePayNow}
            onDoItLater={handleDoItLater}
          />
        )}

        <Tabs defaultValue="article" className="w-full">
          <TabsList className="w-full sm:w-auto mb-4">
            <TabsTrigger value="article" className="flex-1 sm:flex-none text-sm sm:text-base">
              Article
            </TabsTrigger>
            <TabsTrigger value="story" className="flex-1 sm:flex-none text-sm sm:text-base">
              Story
            </TabsTrigger>
            <TabsTrigger value="poll" className="flex-1 sm:flex-none text-sm sm:text-base">
              Poll
            </TabsTrigger>
          </TabsList>
          <TabsContent value="article">
            <PostEditor />
          </TabsContent>
          <TabsContent value="story">
            <StoryEditor />
          </TabsContent>
          <TabsContent value="poll">
            <PollEditor onPollChange={(poll) => console.log(poll)} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

export default Page

