import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const now = new Date()
    
    // Get all ads
    const ads = await prisma.advertisement.findMany({
      include: {
        media: true,
      },
    })

    // Check each ad's status
    const adStatus = ads.map(ad => ({
      id: ad.id,
      name: ad.name,
      status: {
        isPending: ad.status === "PENDING",
        isApproved: ad.isApproved,
        isPaid: ad.isPaid,
        isWithinDateRange: now >= new Date(ad.startDate) && now <= new Date(ad.endDate),
        placement: ad.placement,
        mediaUrl: ad.media.url,
      },
      dates: {
        startDate: ad.startDate,
        endDate: ad.endDate,
        currentTime: now,
      }
    }))

    return NextResponse.json(adStatus)
  } catch (error) {
    console.error("Error checking ads:", error)
    return NextResponse.json(
      { error: "Failed to check advertisements" },
      { status: 500 }
    )
  }
} 