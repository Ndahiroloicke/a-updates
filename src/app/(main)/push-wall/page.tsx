"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import NewsSidebar from "@/components/NewsSidebar"
import AdminSidebar from "@/components/AdminSidebar"
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer"
import kyInstance from "@/lib/ky"
import type { PostsPage } from "@/lib/types"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Calendar, Globe, MessageCircle, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import PostMoreButton from "@/components/posts/PostMoreButton"
import { useSession } from "../SessionProvider"
import LikeButton from "@/components/posts/LikeButton"
import Comments from "@/components/comments/Comments"
import { Button } from "@/components/ui/button"
import { TranslationProvider } from "@/contexts/TranslationContext"
import TranslationButton from "@/components/TranslationButton"
import { useTranslation } from "@/contexts/TranslationContext"

// Import Post component and its interfaces
interface PostUser {
  id: string
  displayName: string
  avatarUrl?: string
  role: string
}

interface PostCount {
  comments: number
  likes: number
}

interface PostAttachment {
  url: string
}

interface PostLike {
  userId: string
}

interface PostData {
  id: string
  title: string
  description: string
  createdAt: string
  category: string
  user: PostUser
  _count: PostCount
  attachments?: PostAttachment[]
  likes?: PostLike[]
  poll?: any
}

// Post component from AuthenticatedNewsFeed
function Post({ post }: { post: PostData & { isPrioritized?: boolean } }) {
  const { user } = useSession()
  const [showComments, setShowComments] = useState(false)
  const { targetLanguage, translatedTexts, translateText } = useTranslation()
  
  const authorName = post.user.displayName || "Anonymous"
  const avatarFallback = authorName.charAt(0).toUpperCase()
  const avatarSrc = post.user.avatarUrl || "/placeholder-user.jpg"
  const category = post.category || "Not known"

  useEffect(() => {
    if (targetLanguage) {
      // Translate all text elements when language changes
      translateText(post.description, `desc-${post.id}`)
      translateText(post.title, `title-${post.id}`)
      translateText(category, `category-${post.id}`)
      translateText("Read more", `readmore-${post.id}`)
      const timeText = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
      translateText(timeText, `time-${post.id}`)
      translateText("Please sign in to leave a comment", `signin-${post.id}`)
    }
  }, [targetLanguage, post.id, post.description, post.title, category, post.createdAt])

  const translatedDescription = translatedTexts[`desc-${post.id}`] || post.description
  const translatedTitle = translatedTexts[`title-${post.id}`] || post.title
  const translatedCategory = translatedTexts[`category-${post.id}`] || category
  const translatedReadMore = translatedTexts[`readmore-${post.id}`] || "Read more"
  const translatedTime = translatedTexts[`time-${post.id}`] || formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
  const translatedSignIn = translatedTexts[`signin-${post.id}`] || "Please sign in to leave a comment"

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${
      post.isPrioritized ? 'border-primary/50' : 'border-border'
    } bg-background`}>
      {post.attachments?.[0]?.url && (
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={post.attachments[0].url || "/placeholder.svg"}
            alt={translatedTitle}
            fill
            className="object-cover transition-transform hover:scale-105 duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <Badge className="absolute top-4 left-4 bg-primary hover:bg-primary/90">{translatedCategory}</Badge>
          <PostMoreButton 
            post={post}
            className="absolute top-4 right-4 text-primary"
          />
        </div>
      )}

      <CardHeader className="pb-2 relative">
        {!post.attachments?.[0]?.url && (
          <>
            <Badge className="absolute top-4 left-4 bg-primary hover:bg-primary/90">{translatedCategory}</Badge>
            <PostMoreButton 
              post={post}
              className="absolute top-4 right-4 text-primary"
            />
          </>
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
              <span>{translatedTime}</span>
            </div>
          </div>
        </div>

        <Link href={`/posts/${post.id}`} className="font-bold text-xl text-foreground hover:text-primary transition-colors line-clamp-2">
          {translatedTitle}
        </Link>
      </CardHeader>

      <CardContent className="py-3">
        <p className="text-muted-foreground line-clamp-2">
          {translatedDescription}
        </p>
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
            {translatedReadMore} <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>

      {showComments && (
        <div className="border-t border-border p-4">
          <Comments postId={post.id} targetLanguage={targetLanguage} />
          {!user && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {translatedSignIn} <Link href="/login" className="text-primary hover:underline">sign in</Link>
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

const ads = [
  {
    id: "1",
    imageSrc: "/myad.webp",
    link: "https://example.com/ad1",
    alt: "Advertisement 1",
  },
  // ... other ads
]

// Move the main content to a separate component
function PushWallContent() {
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["push-wall-feed"],
    queryFn: ({ pageParam }) =>
      kyInstance.get("/api/posts/latest", pageParam ? { searchParams: { cursor: pageParam } } : {}).json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const allPosts = data?.pages.flatMap((page) => page.posts) || []

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Admin Sidebar - Left */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <AdminSidebar />
        </div>

        {/* Main Content - Center */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Push Wall</h1>
            <TranslationButton />
          </div>
          
          {status === "pending" ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : status === "error" ? (
            <div className="text-center p-8">
              <p className="text-destructive">Failed to load posts.</p>
            </div>
          ) : (
            <InfiniteScrollContainer
              className="space-y-6"
              onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
            >
              {allPosts.map((post) => (
                <Post key={post.id} post={post as unknown as PostData & { isPrioritized?: boolean }} />
              ))}
              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              )}
            </InfiniteScrollContainer>
          )}
        </div>

        {/* News Sidebar - Right */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <NewsSidebar ads={ads} />
        </div>
      </div>
    </div>
  )
}

// Wrap the PushWallPage component with TranslationProvider
export default function PushWallPage() {
  return (
    <TranslationProvider>
      <PushWallContent />
    </TranslationProvider>
  )
} 