import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { validateRequest } from "@/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor")
    
    // Remove user validation temporarily to test
    // const { user } = await validateRequest()

    const take = 10

    // Simple query first to verify data exists
    const pollCount = await prisma.poll.count()
    console.log("Total polls in DB:", pollCount)

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
            // Temporarily remove user-specific votes
            // votes: user ? {
            //   where: {
            //     userId: user.id,
            //   },
            // } : false,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
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

    console.log("Raw polls from DB:", polls)

    let nextCursor: string | undefined = undefined
    if (polls.length > take) {
      const nextItem = polls.pop()
      nextCursor = nextItem!.id
    }

    const transformedPolls = polls.map(poll => ({
      id: poll.id,
      title: poll.title,
      createdAt: poll.createdAt,
      user: poll.user,
      options: poll.options.map(option => ({
        id: option.id,
        title: option.title,
        _count: {
          votes: option._count.votes
        }
      }))
    }))

    console.log("Transformed polls:", transformedPolls)

    return NextResponse.json({
      polls: transformedPolls,
      nextCursor,
    })
  } catch (error) {
    console.error("[POLLS_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    
    const poll = await prisma.poll.create({
      data: {
        title: body.title,
        description: body.description,
        userId: user.id,
        options: {
          createMany: {
            data: body.options.map((title: string) => ({
              title,
            })),
          },
        },
      },
      include: {
        options: true,
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            role: true,
          }
        }
      },
    })

    return NextResponse.json({ success: true, poll })
  } catch (error) {
    console.error("[CREATE_POLL_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 