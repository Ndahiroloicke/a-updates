"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import kyInstance from "@/lib/ky"
import type { Story } from "@/lib/types"
import StoryViewer from "@/components/stories/StoryViewer"
import MiniNav from "../MiniNav"

export default function StoryWall() {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const { data: stories = [] } = useQuery({
    queryKey: ["stories"],
    queryFn: () => kyInstance.get("/api/stories").json<Story[]>(),
  })

  useEffect(() => {
    if (!isPlaying || !stories.length) return

    const timer = setTimeout(() => {
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex((prev) => prev + 1)
      } else {
        setIsPlaying(false)
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [currentStoryIndex, isPlaying, stories.length])

  if (!stories.length) {
    return <div>No stories available</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="flex flex-row bg-card p-4 space-x-8 justify-center border-b w-full">
        <MiniNav/>
      </nav>
      {/* Story Viewer Container */}
      <div className="h-[calc(100vh-64px)] rounded-2xl p-4">
        <div className="mx-auto h-full max-w-[540px]">
          <StoryViewer
            story={stories[currentStoryIndex]}
            onNext={() => setCurrentStoryIndex((i) => Math.min(i + 1, stories.length - 1))}
            onPrevious={() => setCurrentStoryIndex((i) => Math.max(i - 1, 0))}
            duration={10000}
          />
        </div>
      </div>
    </div>
  )
}

