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
import { MessageCircle, Calendar, Globe, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import kyInstance from "@/lib/ky"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
]

// Add the ads array
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
    alt: "Advertisement 2",
  },
]

export default function ForumPollPage() {
  const [isTranslating, setIsTranslating] = useState(false)
  const [translations, setTranslations] = useState<{
    columns: {[key: string]: string},
    polls: {[key: string]: string},
    times: {[key: string]: string}
  }>({
    columns: {},
    polls: {},
    times: {}
  })

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["forum-polls"],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam = null }) => {
      const searchParams = new URLSearchParams()
      if (pageParam) searchParams.set("cursor", pageParam as string)
      const response = await kyInstance.get(`/api/polls?${searchParams.toString()}`).json()
      return response
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const handleTranslate = async (targetLang: string) => {
    setIsTranslating(true)
    try {
      const columns = {
        poll: "Poll",
        created: "Created",
        createdBy: "Created by",
        votes: "Votes",
        options: "Options"
      }

      // Prepare all translation promises
      const columnPromises = Object.entries(columns).map(async ([key, value]) => {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: value,
            targetLanguage: targetLang,
          }),
        })
        const data = await response.json()
        return [key, data.translatedText]
      })

      const pollPromises = (data?.pages || []).flatMap(page => 
        page.polls.map(async poll => {
          // Title translation
          const titleResponse = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: poll.title,
              targetLanguage: targetLang,
            }),
          })
          const titleData = await titleResponse.json()

          // Time translation
          const timeText = formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })
          const timeResponse = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: timeText,
              targetLanguage: targetLang,
            }),
          })
          const timeData = await timeResponse.json()

          return {
            id: poll.id,
            title: titleData.translatedText,
            time: timeData.translatedText
          }
        })
      )

      // Wait for all translations to complete
      const [columnResults, pollResults] = await Promise.all([
        Promise.all(columnPromises),
        Promise.all(pollPromises)
      ])

      // Process results
      const newTranslations = {
        columns: Object.fromEntries(columnResults),
        polls: {},
        times: {}
      }

      pollResults.forEach(result => {
        newTranslations.polls[result.id] = result.title
        newTranslations.times[result.id] = result.time
      })

      // Update all translations at once
      setTranslations(newTranslations)
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  const allPolls = data?.pages.flatMap((page) => page.polls) || []

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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                      disabled={isTranslating}
                    >
                      {isTranslating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Translating...
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 mr-2" />
                          Translate
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {LANGUAGES.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleTranslate(lang.code)}
                        disabled={isTranslating}
                      >
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isTranslating ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-zinc-200">
                      <TableHead className="w-[60%] text-zinc-700">
                        {translations.columns.poll || "Poll"}
                      </TableHead>
                      <TableHead className="text-zinc-700">
                        {translations.columns.created || "Created"}
                      </TableHead>
                      <TableHead className="text-zinc-700">
                        {translations.columns.createdBy || "Created by"}
                      </TableHead>
                      <TableHead className="text-center text-zinc-700">
                        {translations.columns.votes || "Votes"}
                      </TableHead>
                      <TableHead className="text-center text-zinc-700">
                        {translations.columns.options || "Options"}
                      </TableHead>
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
                            {translations.polls[poll.id] || poll.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-zinc-600 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {translations.times[poll.id] || formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}
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
              )}
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