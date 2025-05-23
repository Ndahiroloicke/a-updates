import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { optionId } = await req.json()

    const vote = await prisma.vote.upsert({
      where: {
        userId_optionId: {
          userId: user.id,
          optionId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        optionId,
      },
    })

    return NextResponse.json(vote)
  } catch (error) {
    console.error("Vote error:", error)
    return NextResponse.json(
      { error: "Failed to submit vote" },
      { status: 500 }
    )
  }
} 