import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import { getUserDataSelect } from "@/lib/types"

export async function GET() {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const suggestedUsers = await prisma.user.findMany({
      where: {
        NOT: {
          id: user.id,
        },
        OR: [
          { role: "USER" },
          { role: "PUBLISHER" }
        ],
        followers: {
          none: {
            followerId: user.id,
          },
        },
      },
      select: getUserDataSelect(user.id),
      take: 3,
      orderBy: {
        followers: {
          _count: 'desc'
        }
      }
    })

    return Response.json(suggestedUsers)
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
} 