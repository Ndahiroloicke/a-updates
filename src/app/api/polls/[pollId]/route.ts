import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { validateRequest } from "@/auth"

export async function GET(
  request: Request,
  { params: { pollId } }: { params: { pollId: string } }
) {
  try {
    const { user } = await validateRequest()

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            _count: {
              select: {
                votes: true,
              },
            },
            votes: user ? {
              where: {
                userId: user.id,
              },
            } : false,
          },
        },
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            role: true,
          }
        },
      },
    })

    if (!poll) {
      return new NextResponse("Poll not found", { status: 404 })
    }

    return NextResponse.json(poll)
  } catch (error) {
    console.error("[POLL_GET_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 