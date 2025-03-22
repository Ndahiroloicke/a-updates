"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

interface Ad {
  id: string
  imageSrc: string
  link: string
  alt: string
}

interface RotatingAdBannerProps {
  /**
   * List of ad images to rotate through
   */
  ads?: Ad[]

  /**
   * Time in milliseconds between ad rotations
   * @default 30000 (30 seconds)
   */
  rotationInterval?: number

  /**
   * Width of the ad image
   * @default 1200
   */
  width?: number

  /**
   * Height of the ad image
   * @default 90
   */
  height?: number

  /**
   * CSS class names to apply to the container
   */
  className?: string

  /**
   * Whether to fetch ads from an external source
   * @default false
   */
  useExternalAds?: boolean

  /**
   * External ad provider API URL
   */
  externalAdApiUrl?: string
}

export default function RotatingAdBanner({
  ads = [],
  rotationInterval = 30000,
  width = 1200,
  height = 90,
  className = "",
  useExternalAds = false,
  externalAdApiUrl = "",
}: RotatingAdBannerProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [adList, setAdList] = useState<Ad[]>(ads)
  const [isLoading, setIsLoading] = useState(useExternalAds)
  const [error, setError] = useState<string | null>(null)

  // Default ads if none provided or while loading external ads
  const defaultAds: Ad[] = [
    {
      id: "1",
      imageSrc: "/myad.webp",
      link: "https://example.com/ad1",
      alt: "Advertisement 1",
    },
    {
      id: "2",
      imageSrc: "/placeholder.svg?height=90&width=1200&text=Ad+Space+Available",
      link: "https://example.com/ad2",
      alt: "Advertisement 2",
    },
    {
      id: "3",
      imageSrc: "/placeholder.svg?height=90&width=1200&text=Your+Ad+Here",
      link: "https://example.com/ad3",
      alt: "Advertisement 3",
    },
  ]

  // Fetch external ads if enabled
  useEffect(() => {
    if (useExternalAds && externalAdApiUrl) {
      setIsLoading(true)
      fetch(externalAdApiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch ads")
          }
          return response.json()
        })
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setAdList(data)
          } else {
            // Fallback to default ads if API returns empty array
            setAdList(defaultAds)
          }
        })
        .catch((err) => {
          console.error("Error fetching ads:", err)
          setError("Failed to load advertisements")
          // Fallback to default ads on error
          setAdList(defaultAds)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else if (ads.length === 0) {
      // Use default ads if none provided
      setAdList(defaultAds)
    }
  }, [useExternalAds, externalAdApiUrl, ads])

  // Rotate ads at the specified interval
  useEffect(() => {
    if (adList.length <= 1) return

    const intervalId = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % adList.length)
    }, rotationInterval)

    return () => clearInterval(intervalId)
  }, [adList.length, rotationInterval])

  // If there are no ads or still loading, show a placeholder
  if ((adList.length === 0 && !isLoading) || error) {
    return (
      <div
        className={`relative w-full h-[150px] bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center ${className}`}
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm">{error || "No advertisements available"}</p>
      </div>
    )
  }

  const currentAd = adList[currentAdIndex] || defaultAds[0]

  return (
    <div className={`relative w-full ${className}`}>
      {isLoading ? (
        <div className="w-full h-[100px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md" />
      ) : (
        <Link href={currentAd.link} target="_blank" rel="noopener noreferrer" className="block">
          <div className="relative w-full h-[100px] overflow-hidden rounded-md">
            <Image
              src={currentAd.imageSrc || "/placeholder.svg"}
              alt={currentAd.alt}
              width={width}
              height={height}
              className="w-full h-full object-cover object-center transition-opacity duration-500"
              priority
            />
            <div className="absolute top-1 right-1 bg-black/30 text-white text-[12px] px-1 rounded">Ad</div>
          </div>
        </Link>
      )}

    
    </div>
  )
}

