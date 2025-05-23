"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useSession } from "@/app/(main)/SessionProvider"
import Poll from "@/components/poll-component"
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer"
import kyInstance from "@/lib/ky"
import { Loader2 } from "lucide-react"

interface PollsResponse {
  polls: Array<{
    id: string
    title: string
    description?: string
    createdAt: string
    user: {
      id: string
      displayName: string
      avatarUrl?: string
      role?: string
    }
    options: Array<{
      id: string
      title: string
      _count: {
        votes: number
      }
      votes: Array<{
        userId: string
      }> | false
    }>
    _count: {
      votes: number
    }
  }>
  nextCursor: string | null
}

export default function PollsFeed() {
  const { user } = useSession()

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery<PollsResponse>({
    queryKey: ["polls"],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams()
      if (pageParam) searchParams.set("cursor", pageParam)
      
      return kyInstance
        .get(`/api/polls?${searchParams.toString()}`)
        .json<PollsResponse>()
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const allPolls = data?.pages.flatMap((page) => page.polls) || []

  if (status === "pending") {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="text-center text-destructive">
        Failed to load polls. Please try again later.
      </div>
    )
  }

  if (allPolls.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No polls found.
      </div>
    )
  }

  return (
    <InfiniteScrollContainer
      className="space-y-6"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {allPolls.map((poll) => (
        <Poll
          key={poll.id}
          question={poll.title}
          options={poll.options.map(opt => ({
            id: opt.id,
            text: opt.title,
            votes: opt._count.votes
          }))}
          userVoted={poll.options.find(opt => 
            opt.votes && opt.votes.some(vote => vote.userId === user?.id)
          )?.id}
        />
      ))}
      {isFetchingNextPage && (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </InfiniteScrollContainer>
  )
} 