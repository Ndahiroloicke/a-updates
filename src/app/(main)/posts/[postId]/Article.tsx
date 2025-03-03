"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Comments from "@/components/comments/Comments"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { Calendar } from "lucide-react"
import type { PostData } from "@/lib/types"
import type { User } from "@prisma/client"
import LikeButton from "@/components/posts/LikeButton"

interface ArticleProps {
  post: PostData
  currentUser: User | null
}

export default function Article({ post, currentUser }: ArticleProps) {
  const authorName = post.user.displayName || "Anonymous"
  const avatarFallback = authorName.charAt(0).toUpperCase()
  const avatarSrc = post.user.avatarUrl || "/placeholder-user.jpg"

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarSrc} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <div>
            <Link 
              href={`/users/${post.user.username}`}
              className="font-medium hover:underline"
            >
              {authorName}
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.createdAt.toISOString()}>
                {formatDistanceToNow(post.createdAt, { addSuffix: true })}
              </time>
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold">{post.title}</h1>
        {post.category && (
          <Badge variant="secondary">{post.category}</Badge>
        )}
      </div>

      {/* Featured Image */}
      {post.attachments?.[0]?.url && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={post.attachments[0].url}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <p className="lead">{post.description}</p>
        <div dangerouslySetInnerHTML={{ __html: post.body || "" }} />
      </div>

      {/* Interactions */}
      <div className="flex items-center gap-4 py-6 border-t">
        <LikeButton
          postId={post.id}
          initialState={{
            likes: post._count.likes || 0,
            isLikedByUser: post.likes?.some((like) => like.userId === currentUser?.id) || false,
          }}
        />
      </div>

      {/* Comments Section */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Comments</h2>
        <Comments post={post} />
        {!currentUser && (
          <div className="text-center p-6 bg-muted/30 rounded-lg mt-4">
            <p className="text-muted-foreground">
              Please <Link href="/login" className="text-primary hover:underline">sign in</Link> to leave a comment
            </p>
          </div>
        )}
      </div>
    </article>
  )
} 