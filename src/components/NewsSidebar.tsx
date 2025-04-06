"use client"

import Image from "next/image"
import RotatingAdBanner from "@/components/RotatingAdBanner"
import { useQuery } from "@tanstack/react-query"
import kyInstance from "@/lib/ky"
import type { Story, PostsPage } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import UserAvatar from "./UserAvatar"
import FollowButton from "./FollowButton"
import UserTooltip from "./UserTooltip"
import { useSession } from "@/app/(main)/SessionProvider"
import { useEffect, useState } from "react"

interface NewsSidebarProps {
  ads: {
    id: string
    imageSrc: string
    link: string
    alt: string
  }[]
}

interface CollaboratorContent {
  id: string
  type: 'image' | 'text' | 'promotion'
  content: {
    title: string
    description?: string
    imageSrc?: string
    link?: string
    backgroundColor?: string
  }
}

const collaboratorContent: CollaboratorContent[] = [
  {
    id: "2",
    type: "promotion",
    content: {
      title: "General Electric",
      description: "Powering Africa's Future",
      imageSrc: "/general.jpg",
      link: "/corporate-media/general-electric",
      backgroundColor: "bg-blue-500"
    }
  },
  {
    id: "3",
    type: "promotion",
    content: {
      title: "Medical Kenya",
      description: "Leading Healthcare Innovation",
      imageSrc: "/medical.png",
      link: "/corporate-media/medical-kenya"
    }
  },
  {
    id: "4",
    type: "promotion",
    content: {
      title: "MTN",
      description: "Connecting Africa, Empowering Growth",
      imageSrc: "/mtn-mobile-money.jpg",
      link: "/corporate-media/mtn",
      backgroundColor: "bg-yellow-500"
    }
  },
  {
    id: "5",
    type: "promotion",
    content: {
      title: "SASOL",
      description: "Innovating for a Sustainable Future",
      imageSrc: "/sasol.jpg",
      link: "/corporate-media/sasol"
    }
  }
]

export default function NewsSidebar({ ads }: NewsSidebarProps) {
  const { user } = useSession()
  const [showCollaborators, setShowCollaborators] = useState(true)

  // Toggle visibility every 8 seconds
  useEffect(() => {
    const visibilityInterval = setInterval(() => {
      setShowCollaborators(prev => !prev)
    }, 8000) // Show for 8 seconds, hide for 8 seconds

    return () => clearInterval(visibilityInterval)
  }, [])

  const { data: suggestedUsers = [] } = useQuery({
    queryKey: ["suggested-users"],
    queryFn: () => kyInstance.get("/api/users/suggested").json<any[]>(),
    enabled: !!user,
  })

  const { data: stories = [] } = useQuery({
    queryKey: ["stories"],
    queryFn: () => kyInstance.get("/api/stories").json<Story[]>(),
  })

  const { data: latestPosts = [] } = useQuery({
    queryKey: ["latest-posts"],
    queryFn: async () => {
      const response = await kyInstance.get("/api/posts/latest").json<PostsPage>()
      // Filter posts to only include those with attachments
      return response.posts.filter((post) => post.attachments?.length > 0).slice(0, 2) // Get only the first 2 posts with images
    },
  })

  const { data: popularPosts = [] } = useQuery({
    queryKey: ["popular-posts"],
    queryFn: async () => {
      const response = await kyInstance.get("/api/posts/oldest").json<PostsPage>()
      return response // Return the posts array instead of the whole response
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  })

  const renderCollaboratorContent = (content: CollaboratorContent) => {
    switch (content.type) {
      case 'image':
        return (
          <Link href={content.content.link || "#"}>
            <div className="relative h-40 w-full overflow-hidden rounded-lg">
              <Image
                src={content.content.imageSrc || '/placeholder.jpg'}
                alt={content.content.title}
                fill
                className="object-cover"
              />
            </div>
          </Link>
        )
      
      case 'text':
        return (
          <Link href={content.content.link || "#"}>
            <div className={`p-6 rounded-lg ${content.content.backgroundColor || 'bg-primary/10'} text-center`}>
              <h4 className="text-lg font-bold mb-2">{content.content.title}</h4>
              {content.content.description && (
                <p className="text-sm opacity-90">{content.content.description}</p>
              )}
            </div>
          </Link>
        )
      
      case 'promotion':
        return (
          <Link href={content.content.link || "#"}>
            <div className="space-y-3">
              {content.content.imageSrc && (
                <div className="relative h-32 w-full overflow-hidden rounded-lg">
                  <Image
                    src={content.content.imageSrc}
                    alt={content.content.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="text-center">
                <h4 className="text-lg font-bold mb-1">{content.content.title}</h4>
                {content.content.description && (
                  <p className="text-sm text-muted-foreground">{content.content.description}</p>
                )}
              </div>
            </div>
          </Link>
        )
    }
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Advertisement Card */}
      <div className="bg-card rounded-lg p-3 sm:p-4 md:p-6 shadow-sm dark:shadow-none">
        <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">Advertisement</h3>
        <RotatingAdBanner
          ads={ads}
          rotationInterval={8000}
          width={500}
          height={300}
          className="w-full rounded-md overflow-hidden"
        />
      </div>

      {/* Collaborator Card - Toggles visibility */}
      {showCollaborators && (
        <div className="bg-card rounded-lg p-3 sm:p-4 md:p-6 shadow-sm dark:shadow-none transition-opacity duration-500">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">Our Collaborators</h3>
          <div className="space-y-4">
            {collaboratorContent.map((collaborator) => (
              <div key={collaborator.id} className="transition-all duration-500 ease-in-out">
                {renderCollaboratorContent(collaborator)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Push Card - Shows when collaborators are hidden */}
      {!showCollaborators && (
        <div className="bg-card rounded-lg p-3 sm:p-4 md:p-6 shadow-sm dark:shadow-none">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 md:mb-6">Push</h3>
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {stories.slice(0, 2).map((story) => (
              <NewsItem
                key={story.id}
                imageSrc={story.attachments?.url || ""}
                title={story.title}
                description={story.description}
                date={story.createdAt}
              />
            ))}
          </div>
        </div>
      )}

      {/* Who to Follow Card - Shows when collaborators are hidden */}
      {!showCollaborators && user && suggestedUsers.length > 0 && (
        <div className="bg-card rounded-lg p-3 sm:p-4 md:p-6 shadow-sm dark:shadow-none">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 md:mb-6">Who to Follow</h3>
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {suggestedUsers.slice(0, 3).map((suggestedUser) => (
              <div key={suggestedUser.id} className="flex items-center justify-between gap-3">
                <UserTooltip user={suggestedUser}>
                  <Link href={`/users/${suggestedUser.username}`} className="flex items-center gap-3">
                    <UserAvatar avatarUrl={suggestedUser.avatarUrl} className="flex-none" />
                    <div>
                      <p className="line-clamp-1 break-all text-sm sm:text-base font-semibold hover:underline">
                        {suggestedUser.displayName}
                      </p>
                      <p className="line-clamp-1 break-all text-xs sm:text-sm text-muted-foreground">
                        @{suggestedUser.username}
                      </p>
                    </div>
                  </Link>
                </UserTooltip>
                <FollowButton
                  userId={suggestedUser.id}
                  initialState={{
                    followers: suggestedUser._count.followers,
                    isFollowedByUser: suggestedUser.followers.some(
                      ({ followerId }: { followerId: string }) => followerId === user.id,
                    ),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WhatsUp Card */}
      <div className="bg-card rounded-lg p-3 sm:p-4 md:p-6 shadow-sm dark:shadow-none">
        <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 md:mb-6">WhatsUp</h3>
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {latestPosts.map((post) => (
            <NewsItem
              key={post.id}
              imageSrc={post.attachments?.[0]?.url || "/placeholder.jpg"}
              title={post.title}
              description={post.description}
              date={post.createdAt.toISOString()}
            />
          ))}
        </div>
      </div>

      {/* Most Popular Card */}
      <div className="bg-card rounded-lg p-3 sm:p-4 md:p-6 shadow-sm dark:shadow-none">
        <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 md:mb-6">Most Popular</h3>
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {popularPosts ? (
            popularPosts.map((post: any) => (
              <NewsItem
                key={post.id}
                imageSrc={post.attachments?.[0]?.url || "/placeholder.jpg"}
                title={post.title}
                description={post.description}
                date={post.createdAt.toISOString()}
              />
            ))
          ) : (
            <p className="text-muted-foreground text-xs sm:text-sm">No popular posts yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

interface NewsItemProps {
  imageSrc: string
  title: string
  description: string
  alt?: string
  date?: string
}

function NewsItem({ imageSrc, title, description, alt, date }: NewsItemProps) {
  // Strip HTML tags from description
  const cleanDescription = description?.replace(/<[^>]*>/g, "") || ""

  return (
    <div className="flex gap-2 sm:gap-3 md:gap-4">
      <div className="flex-shrink-0">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={alt || title}
          width={80}
          height={80}
          className="rounded-lg w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover"
        />
      </div>
      <div className="min-w-0">
        <h4 className="font-medium text-sm sm:text-base md:text-lg mb-1 line-clamp-2">{title}</h4>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground line-clamp-2 mb-1">{cleanDescription}</p>
        {date && (
          <time className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(date), { addSuffix: true })}
          </time>
        )}
      </div>
    </div>
  )
}

