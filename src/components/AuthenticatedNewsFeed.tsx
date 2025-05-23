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
import { useState, useEffect } from "react"
import Comments from "@/components/comments/Comments"
import { useSession } from "@/app/(main)/SessionProvider"
import LikeButton from "@/components/posts/LikeButton"

interface PostUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
}

interface PostCount {
  comments: number;
  likes: number;
}

interface PostAttachment {
  url: string;
}

interface PostLike {
  userId: string;
}

interface PostData {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  category: string;
  user: PostUser;
  _count: PostCount;
  attachments?: PostAttachment[];
  likes?: PostLike[];
  poll?: any; // Add specific poll type if needed
}

function Post({ post, featured = false, scrollDirection, isAnimating, animationDelay }: { 
  post: PostData & { 
    isPrioritized?: boolean;
    isAnimating?: boolean;
    animationDelay?: string;
  }; 
  featured?: boolean;
  scrollDirection: 'up' | 'down';
  isAnimating: boolean;
  animationDelay: string;
}) {
  const { user } = useSession()
  const [showComments, setShowComments] = useState(false)

  const authorName = post.user.displayName || "Anonymous"
  const avatarFallback = authorName.charAt(0).toUpperCase()
  const avatarSrc = post.user.avatarUrl || "/placeholder-user.jpg"
  const category = post.category || "Not known"

  // Skip rendering if this is a poll
  if (post.poll) {
    return null;
  }

  return (
    <Card 
      className={`
        overflow-hidden transition-all hover:shadow-lg 
        ${isAnimating ? 'transform transition-transform duration-1000' : ''}
        ${post.isPrioritized ? 'border-primary/50' : 'border-border'}
        bg-background
      `}
      style={isAnimating ? { animationDelay } : undefined}
    >
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
        {!post.attachments?.[0]?.url || !featured && (
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
          href={`/posts/${post.id}`}
          className="font-bold text-xl text-foreground hover:text-primary transition-colors line-clamp-2"
        >
          {post.title}
        </Link>
      </CardHeader>

      <CardContent className="py-3">
        <p className="text-muted-foreground line-clamp-2">{post.description}</p>
      </CardContent>

      <CardFooter className="flex justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center text-primary gap-1.5 cursor-pointer hover:text-primary/80 transition-colors"
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
          className="bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-background transition-colors"
          asChild
        >
          <Link href={`/posts/${post.id}`}>
            Read more <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>

      {showComments && (
        <div className="border-t border-border p-4">
          <Comments post={post} />
          {!user && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Please <Link href="/login" className="text-primary hover:underline">sign in</Link> to leave a comment
              </p>
            </div>
          )}
        </div>
      )}

      {post.isPrioritized && (
        <Badge className="absolute left-4 top-4 bg-primary">Publisher Content</Badge>
      )}
    </Card>
  )
}

export default function NewsFeed() {
  const [topNewsPage, setTopNewsPage] = useState(1)
  const ITEMS_PER_PAGE = 5
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down')
  const [lastScrollPosition, setLastScrollPosition] = useState(0)
  const [publisherPostIndex, setPublisherPostIndex] = useState(0)

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["news-feed"],
    queryFn: ({ pageParam }) =>
      kyInstance.get("/api/posts/latest", pageParam ? { searchParams: { cursor: pageParam } } : {}).json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const allPosts = data?.pages.flatMap((page) => page.posts) || []
  const publisherPosts = allPosts.filter(post => post.user.role === "PUBLISHER")
  const regularPosts = allPosts.filter(post => post.user.role !== "PUBLISHER")

  useEffect(() => {
    // Loop publisher posts every 30 seconds
    const loopInterval = setInterval(() => {
      if (publisherPosts.length > 0) {
        setPublisherPostIndex(prev => (prev + 1) % publisherPosts.length)
      }
    }, 30000) // 30 seconds

    return () => clearInterval(loopInterval)
  }, [allPosts])

  const getInterleavedPosts = () => {
    const result = [];
    // Remove duplicate filter since we already have publisherPosts and regularPosts defined above
    // Use the existing filtered arrays instead

    // Create a rotating window for publisher posts
    const rotatedPublisherPosts = [
      ...publisherPosts.slice(publisherPostIndex),
      ...publisherPosts.slice(0, publisherPostIndex)
    ];

    // Interleave posts with proper spacing
    let regularIndex = 0;
    const postsPerSection = 3; // Number of regular posts between publisher posts

    rotatedPublisherPosts.forEach((publisherPost) => {
      // Add regular posts
      for (let i = 0; i < postsPerSection && regularIndex < regularPosts.length; i++) {
        result.push({
          ...regularPosts[regularIndex],
          isPrioritized: false,
          isAnimating: false
        });
        regularIndex++;
      }

      // Add publisher post with animation
      result.push({
        ...publisherPost,
        isPrioritized: true,
        isAnimating: true,
        animationDelay: `${result.length * 2}s` // Stagger the animations
      });
    });

    // Add remaining regular posts
    while (regularIndex < regularPosts.length) {
      result.push({
        ...regularPosts[regularIndex],
        isPrioritized: false,
        isAnimating: false
      });
      regularIndex++;
    }

    return result;
  };

  const interleavedPosts = getInterleavedPosts()
  
  const latestPosts = interleavedPosts.slice(0, Math.max(interleavedPosts.length / 2))
  const topNewsPosts = interleavedPosts.slice(Math.max(interleavedPosts.length / 2))

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollDirection(currentScroll > lastScrollPosition ? 'down' : 'up');
      setLastScrollPosition(currentScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollPosition]);

  const paginatedTopNews = topNewsPosts.slice((topNewsPage - 1) * ITEMS_PER_PAGE, topNewsPage * ITEMS_PER_PAGE)
  const totalTopNewsPages = Math.ceil(topNewsPosts.length / ITEMS_PER_PAGE)

  const generatePaginationItems = () => {
    const items = []
    const maxVisiblePages = 3

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

      if (topNewsPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }
    }

    const startPage = Math.max(
      1,
      Math.min(topNewsPage - Math.floor(maxVisiblePages / 2), totalTopNewsPages - maxVisiblePages + 1),
    )
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalTopNewsPages)

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

    if (endPage < totalTopNewsPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

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
      <div className="grid gap-6 w-full md:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className=" bg-gradient-to-t from-gray-200 to-gray-300 border-none animate-pulse">
            <div className="h-48 w-96" />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Latest Posts Column */}
        <div className="space-y-4 md:space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-primary">Latest Posts</h2>
          <InfiniteScrollContainer
            className="space-y-4 md:space-y-6"
            onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
          >
            {getInterleavedPosts().map((post) => (
              <Post 
                key={post.id} 
                post={post}
                scrollDirection={scrollDirection}
                isAnimating={post.isAnimating || false}
                animationDelay={post.animationDelay || '0s'}
              />
            ))}
          </InfiniteScrollContainer>
        </div>

        {/* Top News Column */}
        {topNewsPosts.length > 0 && (
          <div className={`space-y-6 ${latestPosts.length === 0 ? "md:col-span-2" : ""}`}>
            <h2 className="text-2xl font-bold text-primary">Top News</h2>
            <div className="space-y-6">
              {paginatedTopNews.map((post) => (
                <Post 
                  key={post.id} 
                  post={post} 
                  featured={true} 
                  scrollDirection={scrollDirection}
                  isAnimating={false}
                  animationDelay="0s"
                />
              ))}
            </div>

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

      {isFetchingNextPage && (
        <div className="flex justify-center mt-8">
          <Loader2 className="animate-spin text-primary" />
        </div>
      )}
    </div>
  )
}

