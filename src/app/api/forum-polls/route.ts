import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { validateRequest } from "@/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor")
    const { user } = await validateRequest()

    const take = 10

    const polls = await prisma.poll.findMany({
      take: take + 1,
      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor,
        },
      }),
      include: {
        options: {
          include: {
            _count: {
              select: {
                votes: true,
              },
            },
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
      orderBy: {
        createdAt: "desc",
      },
    })

    let nextCursor: string | undefined = undefined
    if (polls.length > take) {
      const nextItem = polls.pop()
      nextCursor = nextItem!.id
    }

    // Transform to include total votes calculation
    const transformedPolls = polls.map(poll => ({
      id: poll.id,
      title: poll.title,
      createdAt: poll.createdAt,
      user: poll.user,
      options: poll.options,
      _count: {
        votes: poll.options.reduce((sum, option) => sum + option._count.votes, 0)
      }
    }))

    return NextResponse.json({
      polls: transformedPolls,
      nextCursor,
    })
  } catch (error) {
    console.error("[FORUM_POLLS_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 