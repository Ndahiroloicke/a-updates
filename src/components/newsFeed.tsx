"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { Loader2, MessageCircle, ChevronRight, Calendar, Eye, Heart } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import Image from "next/image"
import Link from "next/link"
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer"
import { formatDistanceToNow } from "date-fns"
import kyInstance from "@/lib/ky"
import type { PostData, PostsPage } from "@/lib/types"
import { useState } from "react"
import Comments from "@/components/comments/Comments"
import { useSession } from "@/app/(main)/SessionProvider"
import LikeButton from "@/components/posts/LikeButton"

export default function NewsFeed() {
  const [topNewsPage, setTopNewsPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["news-feed"],
    queryFn: ({ pageParam }) =>
      kyInstance.get("/api/posts/latest", pageParam ? { searchParams: { cursor: pageParam } } : {}).json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const allPosts = data?.pages.flatMap((page) => page.posts) || []

  // Split posts for the two columns
  const latestPosts = allPosts.slice(0, Math.max(allPosts.length / 2))

  // For top news, implement pagination
  const topNewsPosts = allPosts.slice(Math.max(allPosts.length / 2))
  const paginatedTopNews = topNewsPosts.slice((topNewsPage - 1) * ITEMS_PER_PAGE, topNewsPage * ITEMS_PER_PAGE)
  const totalTopNewsPages = Math.ceil(topNewsPosts.length / ITEMS_PER_PAGE)

  // Generate pagination numbers
  const generatePaginationItems = () => {
    const items = []
    const maxVisiblePages = 3

    // Always show first page
    if (topNewsPage > 2) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setTopNewsPage(1)
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      )

      // Show ellipsis if needed
      if (topNewsPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }
    }

    // Calculate range of visible page numbers
    const startPage = Math.max(
      1,
      Math.min(topNewsPage - Math.floor(maxVisiblePages / 2), totalTopNewsPages - maxVisiblePages + 1),
    )
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalTopNewsPages)

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={i === topNewsPage}
            onClick={(e) => {
              e.preventDefault()
              setTopNewsPage(i)
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Show ellipsis if needed
    if (endPage < totalTopNewsPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Always show last page if not already included
    if (endPage < totalTopNewsPages) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setTopNewsPage(totalTopNewsPages)
            }}
          >
            {totalTopNewsPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return items
  }

  if (status === "pending") {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className=" bg-gradient-to-t from-gray-200 to-gray-300 border-none animate-pulse">
            <div className="h-48" />
            <CardContent className="h-32 mt-4" />
          </Card>
        ))}
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="text-center p-8">
        <p className="text-destructive">Failed to load news articles.</p>
      </div>
    )
  }

  if (status === "success" && !allPosts.length && !hasNextPage) {
    return <p className="text-center text-muted-foreground">No news articles available.</p>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest Posts Column */}
        {latestPosts.length > 0 && (
          <div className={`space-y-6 ${topNewsPosts.length === 0 ? "md:col-span-2" : ""}`}>
            <h2 className="text-2xl font-bold text-primary">Latest Posts</h2>
            <InfiniteScrollContainer
              className="space-y-6"
              onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
            >
              {latestPosts.map((post) => (
                <Post key={post.id} post={post} />
              ))}
            </InfiniteScrollContainer>
          </div>
        )}

        {/* Top News Column */}
        {topNewsPosts.length > 0 && (
          <div className={`space-y-6 ${latestPosts.length === 0 ? "md:col-span-2" : ""}`}>
            <h2 className="text-2xl font-bold text-primary">Top News</h2>
            <div className="space-y-6">
              {paginatedTopNews.map((post) => (
                <Post key={post.id} post={post} featured={true} />
              ))}
            </div>

            {/* Enhanced Pagination for Top News */}
            {totalTopNewsPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (topNewsPage > 1) {
                          setTopNewsPage((prev) => prev - 1)
                        }
                      }}
                      className={topNewsPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {generatePaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (topNewsPage < totalTopNewsPages) {
                          setTopNewsPage((prev) => prev + 1)
                        }
                      }}
                      className={topNewsPage >= totalTopNewsPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>

      {/* Loading indicator for infinite scroll */}
      {isFetchingNextPage && (
        <div className="flex justify-center mt-8">
          <Loader2 className="animate-spin text-primary" />
        </div>
      )}
    </div>
  )
}

function Post({ post, featured = false }: { post: PostData; featured?: boolean }) {
  const { user } = useSession()
  const [showComments, setShowComments] = useState(false)

  // Extract author name from post data, fallback to "Anonymous" if not available
  const authorName = post.user.displayName || "Anonymous"

  // Get first letter of author name for avatar fallback
  const avatarFallback = authorName.charAt(0).toUpperCase()

  // Get author avatar if available
  const avatarSrc = post.user.avatarUrl || "/placeholder-user.jpg"

  // Generate a random category for visual interest
  const category = post.category || "Not known"

  // Generate random view count for visual interest
  // const viewCount = post.viewCount || Math.floor(Math.random() * 1000) + 100

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-blue-100 dark:border-blue-900 rounded-xl">
      {/* Featured Image with Category Badge */}
      {post.attachments?.[0]?.url && featured && (
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={post.attachments[0].url || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover transition-transform hover:scale-105 duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <Badge className="absolute top-4 left-4 bg-primary hover:bg-primary/90">{post.category}</Badge>
        </div>
      )}

      <CardHeader className="pb-2 relative">
        {/* If no featured image but we still want to show category */}
        {(!post.attachments?.[0]?.url || !featured) && (
          <Badge className="absolute right-4 top-4 bg-primary hover:bg-primary/90">{category}</Badge>
        )}

        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarImage src={avatarSrc} />
            <AvatarFallback className="bg-primary/20 text-primary font-medium">{avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-primary">{authorName}</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        <Link
          href={`/article/${post.id}`}
          className="font-bold text-xl text-slate-800 dark:text-slate-100 hover:text-primary transition-colors line-clamp-2"
        >
          {post.title}
        </Link>
      </CardHeader>

      <CardContent className="py-3">
        <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{post.description}</p>
      </CardContent>

      <CardFooter className="flex justify-between pt-3 border-t border-blue-100 dark:border-blue-900/50">
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center text-primary gap-1.5 cursor-pointer hover:text-primary transition-colors"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{post._count.comments}</span>
          </div>
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes || 0,
              isLikedByUser: post.likes?.some((like) => like.userId === user?.id) || false,
            }}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white transition-colors"
          asChild
        >
          <Link href={`/posts/${post.id}`}>
            Read more <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>

      {showComments && (
        <div className="border-t border-blue-100 dark:border-blue-900/50 p-4">
          <Comments post={post} />
          {!user && (
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Please <Link href="/login" className="text-primary hover:underline">sign in</Link> to leave a comment
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

