"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar, ChevronRight, Repeat2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useSession } from "@/app/(main)/SessionProvider";
import LikeButton from "@/components/posts/LikeButton";
import Comments from "@/components/comments/Comments";

interface PostProps {
  post: {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    category?: string;
    user: {
      id: string;
      displayName: string;
      avatarUrl?: string;
      role?: string;
    };
    _count: {
      comments: number;
      likes: number;
    };
    attachments?: Array<{ url: string }>;
    likes?: Array<{ userId: string }>;
    isPrioritized?: boolean;
    isAnimating?: boolean;
    animationDelay?: string;
  };
  featured?: boolean;
  scrollDirection?: "up" | "down";
  isAnimating?: boolean;
  animationDelay?: string;
}

export default function Post({
  post,
  featured = false,
  scrollDirection,
  isAnimating,
  animationDelay,
}: PostProps) {
  const { user } = useSession();
  const [showComments, setShowComments] = useState(false);

  const authorName = post.user.displayName || "Anonymous";
  const avatarFallback = authorName.charAt(0).toUpperCase();
  const avatarSrc = post.user.avatarUrl || "/placeholder-user.jpg";
  const category = post.category || "Not known";

  // Skip rendering if this is a poll
  if (post.poll) {
    return null;
  }

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-lg ${isAnimating ? "transform transition-transform duration-1000" : ""} ${post.isPrioritized ? "border-primary/50" : "border-border"} bg-background`}
      style={isAnimating ? { animationDelay } : undefined}
    >
      {post.attachments?.[0]?.url && featured && (
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={post.attachments[0].url || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <Badge className="absolute left-4 top-4 bg-primary hover:bg-primary/90">
            {post.category}
          </Badge>
        </div>
      )}

      <CardHeader className="relative pb-2">
        {!post.attachments?.[0]?.url ||
          (!featured && (
            <Badge className="absolute right-4 top-4 bg-primary hover:bg-primary/90">
              {category}
            </Badge>
          ))}

        <div className="mb-3 flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarImage src={avatarSrc} />
            <AvatarFallback className="bg-primary/20 font-medium text-primary">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-primary">
              {authorName}
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/posts/${post.id}`}
          className="line-clamp-2 text-xl font-bold text-foreground transition-colors hover:text-primary"
        >
          {post.title}
        </Link>
      </CardHeader>

      <CardContent className="py-3">
        <p className="line-clamp-2 text-muted-foreground">{post.description}</p>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-border pt-3">
        <div className="flex items-center gap-4">
          <div
            className="flex cursor-pointer items-center gap-1.5 text-primary transition-colors hover:text-primary/80"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{post._count.comments}</span>
          </div>
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes || 0,
              isLikedByUser:
                post.likes?.some((like) => like.userId === user?.id) || false,
            }}
          />
          <div className="flex cursor-pointer items-center gap-1.5 text-primary transition-colors hover:text-primary/80">
            <Repeat2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">0</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="border-primary/20 bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-background"
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
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Please{" "}
                <Link href="/login" className="text-primary hover:underline">
                  sign in
                </Link>{" "}
                to leave a comment
              </p>
            </div>
          )}
        </div>
      )}

      {post.isPrioritized && (
        <Badge className="absolute left-4 top-4 bg-primary">
          Publisher Content
        </Badge>
      )}
    </Card>
  );
}
