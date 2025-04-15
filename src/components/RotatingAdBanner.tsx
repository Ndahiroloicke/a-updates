"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { AdPlacement } from "@prisma/client"

interface RotatingAdBannerProps {
  position: AdPlacement
  rotationInterval?: number
  className?: string
}

export default function RotatingAdBanner({
  position,
  rotationInterval = 30000,
  className = "",
}: RotatingAdBannerProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0)

  // Static advertisement images
  const staticAds = [
    {
      imageSrc: "/sasol1.jpg",
      link: "https://www.sasol.com",
      alt: "Sasol Advertisement",
    },
    {
      imageSrc: "/mtn1.jpeg",
      link: "https://www.mtn.com",
      alt: "MTN Advertisement",
    },
    {
      imageSrc: "/medical1.jpg",
      link: "https://www.medical.com",
      alt: "Medical Advertisement",
    },
    {
      imageSrc: "/electric1.jpg",
      link: "https://www.electric.com",
      alt: "Electric Advertisement",
    },
  ]

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % staticAds.length)
    }, rotationInterval)

    return () => clearInterval(intervalId)
  }, [rotationInterval])

  const currentAd = staticAds[currentAdIndex]

  return (
    <div className={`relative w-full ${className}`}>
      {/* Fixed aspect ratio container - using 5:1 for a shorter banner-like appearance */}
      <div className="relative w-full aspect-[5/1]">
        <Link href={currentAd.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
          <div className="absolute inset-0 rounded-md overflow-hidden">
            <Image
              src={currentAd.imageSrc}
              alt={currentAd.alt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-1 right-1 bg-black/30 text-white text-[12px] px-1 rounded">Ad</div>
          </div>
        </Link>
      </div>
    </div>
  )
}

