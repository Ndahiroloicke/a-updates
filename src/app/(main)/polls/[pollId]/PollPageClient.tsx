"use client"

import { useQuery } from "@tanstack/react-query"
import Poll from "@/components/poll-component"
import { useParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import NewsSidebar from "@/components/NewsSidebar"
import { useSession } from "@/app/(main)/SessionProvider"

// Sample ads for NewsSidebar
const sidebarAds = [
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
    alt: "Advertisement 2",
  },
]

export default function PollPageClient() {
  const { pollId } = useParams()
  const { toast } = useToast()
  const { user } = useSession()
  
  const { data: poll, isLoading, refetch } = useQuery({
    queryKey: ["poll", pollId],
    queryFn: async () => {
      const response = await fetch(`/api/polls/${pollId}`)
      if (!response.ok) throw new Error("Failed to fetch poll")
      return response.json()
    }
  })

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="container mx-auto p-4 text-center text-muted-foreground">
        Poll not found
      </div>
    )
  }

  const formattedOptions = poll.options.map((option) => ({
    id: option.id,
    text: option.title,
    votes: option._count.votes
  }))

  const userVoted = poll.options.find((option) => 
    option.votes?.length > 0
  )?.id || null

  return (
    <main className="container mx-auto px-4 py-6 flex-grow">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="w-full lg:w-2/3">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-6">{poll.title}</h1>
            <Poll
              question={poll.title}
              options={formattedOptions}
              userVoted={userVoted}
              onVote={async (optionId) => {
                try {
                  await fetch(`/api/polls/${pollId}/vote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ optionId })
                  })
                  await refetch()
                  toast({
                    description: "Vote submitted successfully!",
                  })
                } catch (error) {
                  toast({
                    variant: "destructive",
                    description: "Failed to submit vote. Please try again.",
                  })
                }
              }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-1/3">
          <NewsSidebar ads={sidebarAds} />
        </div>
      </div>
    </main>
  )
} 