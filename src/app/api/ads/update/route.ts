import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: "Advertisement ID is required" },
        { status: 400 }
      )
    }

    const updatedAd = await prisma.advertisement.update({
      where: {
        id: id
      },
      data: {
        isApproved: true,
        isPaid: true
      }
    })

    return NextResponse.json(updatedAd)
  } catch (error) {
    console.error("Error updating advertisement:", error)
    return NextResponse.json(
      { error: "Failed to update advertisement" },
      { status: 500 }
    )
  }
} 