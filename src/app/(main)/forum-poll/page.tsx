"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import NewsSidebar from "@/components/NewsSidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MessageCircle, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import kyInstance from "@/lib/ky"

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
    }>
    _count: {
      votes: number
    }
  }>
  nextCursor: string | null
}

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


export default function ForumPollPage() {
  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["forum-polls"],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam = null }) => {
      const searchParams = new URLSearchParams()
      if (pageParam) searchParams.set("cursor", pageParam as string)
      const response = await kyInstance.get(`/api/polls?${searchParams.toString()}`).json() as PollsResponse
      console.log("Fetched polls:", response) // Debug log
      return response
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const allPolls = data?.pages.flatMap((page) => page.polls) || []
  console.log("All polls:", allPolls) // Debug log

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6">
        <div className="flex-1">
          <Card className="bg-white text-zinc-900">
            <CardHeader className="border-b border-zinc-200">
              <div className="flex items-center gap-4 pb-4 overflow-x-auto">
                <Button asChild variant="default" className="bg-green-600 hover:bg-green-700">
                  <Link href="/create-poll" className="text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Create a Poll
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-zinc-300 text-zinc-700 hover:bg-zinc-100">
                  <Link href="/hot-polls">Hot Polls</Link>
                </Button>
                <Button asChild variant="outline" className="border-zinc-300 text-zinc-700 hover:bg-zinc-100">
                  <Link href="/latest-forums">Latest Forums</Link>
                </Button>
                <Button asChild variant="outline" className="border-zinc-300 text-zinc-700 hover:bg-zinc-100">
                  <Link href="/latest-polls">Latest Polls</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-200">
                    <TableHead className="w-[60%] text-zinc-700">Poll</TableHead>
                    <TableHead className="text-zinc-700">Created</TableHead>
                    <TableHead className="text-zinc-700">Created by</TableHead>
                    <TableHead className="text-center text-zinc-700">Votes</TableHead>
                    <TableHead className="text-center text-zinc-700">Options</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPolls?.map((poll) => (
                    <TableRow key={poll.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <TableCell className="font-medium text-zinc-900">
                        <Link 
                          href={`/polls/${poll.id}`}
                          className="hover:text-green-600 transition-colors"
                        >
                          {poll.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-zinc-600 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-600 text-sm">
                        {poll.user.displayName}
                      </TableCell>
                      <TableCell className="text-center text-zinc-600">
                        {poll.options.reduce((sum, option) => sum + option._count.votes, 0)}
                      </TableCell>
                      <TableCell className="text-center text-zinc-600">
                        {poll.options.length}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="hidden lg:block w-80 flex-shrink-0">
          <NewsSidebar ads={ads} />
        </div>
      </div>
    </div>
  )
} 