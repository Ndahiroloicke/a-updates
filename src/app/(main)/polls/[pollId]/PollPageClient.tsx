"use client"

import { useQuery } from "@tanstack/react-query"
import Poll from "@/components/poll-component"
import { useParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Users } from "lucide-react"
import NewsSidebar from "@/components/NewsSidebar"
import { useSession } from "@/app/(main)/SessionProvider"
import { useState } from "react"
import PostMoreButton from "@/components/posts/PostMoreButton"

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
  const [translatedTitle, setTranslatedTitle] = useState("")
  const [translatedVotes, setTranslatedVotes] = useState("")
  
  const { data: poll, isLoading, refetch } = useQuery({
    queryKey: ["poll", pollId],
    queryFn: async () => {
      const response = await fetch(`/api/polls/${pollId}`)
      if (!response.ok) throw new Error("Failed to fetch poll")
      return response.json()
    }
  })

  const handleTranslate = async (targetLang: string) => {
    try {
      // Translate title
      const titleResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: poll.title,
          targetLanguage: targetLang,
        }),
      })
      const titleData = await titleResponse.json()
      setTranslatedTitle(titleData.translatedText)

      // Translate votes text
      const votesText = `${poll.options.reduce((sum, option) => sum + option._count.votes, 0)} total votes`
      const votesResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: votesText,
          targetLanguage: targetLang,
        }),
      })
      const votesData = await votesResponse.json()
      setTranslatedVotes(votesData.translatedText)
    } catch (error) {
      console.error('Translation failed:', error)
    }
  }

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
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold">{translatedTitle || poll.title}</h1>
              <PostMoreButton 
                post={poll}
                className="text-primary"
                onTranslate={handleTranslate}
              />
            </div>
            <Poll
              question={translatedTitle || poll.title}
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
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {translatedVotes || `${poll.options.reduce((sum, option) => sum + option._count.votes, 0)} total votes`}
              </span>
            </div>
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