import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  if (!params.userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const publisherProfile = await prisma.publisherProfile.findUnique({
      where: {
        userId: params.userId,
      },
    })

    return NextResponse.json({ exists: !!publisherProfile })
  } catch (error) {
    console.error("Error checking publisher profile:", error)
    return NextResponse.json(
      { error: "Failed to check publisher profile" },
      { status: 500 }
    )
  }
} 