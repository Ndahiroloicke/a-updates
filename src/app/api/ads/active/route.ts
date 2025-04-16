import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { AdPlacement, AdStatus } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get("position")

    if (!position || !Object.values(AdPlacement).includes(position as AdPlacement)) {
      console.error("Invalid position:", position)
      return NextResponse.json(
        { error: `Invalid position. Must be one of: ${Object.values(AdPlacement).join(", ")}` },
        { status: 400 }
      )
    }

    const now = new Date()
    console.log("Fetching ads for position:", position)
    console.log("Current time:", now)

    const ads = await prisma.advertisement.findMany({
      where: {
        AND: [
          { status: AdStatus.PENDING },
          { isApproved: true },
          { isPaid: true },
          { startDate: { lte: now } },
          { endDate: { gte: now } },
          { placement: position as AdPlacement },
        ],
      },
      include: {
        media: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    console.log("Found ads:", JSON.stringify(ads, null, 2))

    // Transform the ads into the format expected by the RotatingAdBanner
    const formattedAds = ads.map((ad) => ({
      id: ad.id,
      imageSrc: ad.media.url,
      link: ad.targetUrl || "#",
      alt: ad.name,
      position: ad.placement,
    }))

    console.log("Formatted ads:", JSON.stringify(formattedAds, null, 2))

    // Return empty array if no ads found (this is a valid state)
    return NextResponse.json(formattedAds)
  } catch (error) {
    console.error("Error fetching active ads:", error)
    return NextResponse.json(
      { error: "Failed to fetch advertisements" },
      { status: 500 }
    )
  }
} 