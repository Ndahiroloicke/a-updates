"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Comments from "@/components/comments/Comments"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { Calendar } from "lucide-react"
import LikeButton from "@/components/posts/LikeButton"

// Update the PostData type to include all required fields
interface PostData {
  id: string;
  title: string;
  description: string;
  body: string;
  createdAt: Date;
  category?: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  attachments?: {
    url: string;
  }[];
  _count: {
    likes: number;
  };
  likes?: {
    userId: string;
  }[];
}

interface ArticleProps {
  post: PostData;
  currentUser: {
    id: string;
  } | null;
}

export default function Article({ post, currentUser }: ArticleProps) {
  const authorName = post.user.displayName || "Anonymous"
  const avatarFallback = authorName.charAt(0).toUpperCase()
  const avatarSrc = post.user.avatarUrl || "/placeholder-user.jpg"

  return (
    <article className="max-w-4xl mx-auto space-y-8" itemScope itemType="https://schema.org/Article">
      <header className="space-y-4">
        {/* Author info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarSrc} alt={authorName} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <div>
            <Link 
              href={`/users/${post.user.username}`}
              className="font-medium hover:underline"
              itemProp="author"
            >
              {authorName}
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.createdAt.toISOString()} itemProp="datePublished">
                {formatDistanceToNow(post.createdAt, { addSuffix: true })}
              </time>
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold" itemProp="headline">{post.title}</h1>
        {post.category && (
          <Badge variant="secondary" itemProp="articleSection">{post.category}</Badge>
        )}
      </header>

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