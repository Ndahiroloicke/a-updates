import { NextResponse } from "next/server"
import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { pollId: string } }
) {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { optionId } = await req.json()
    if (!optionId) {
      return new NextResponse("Option ID is required", { status: 400 })
    }

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
    console.error("[POLL_VOTE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 