import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
// Schema for validating post creation input
const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string(),
  attachments: z.array(z.object({
    url: z.string(),
    type: z.literal('IMAGE')
  })).optional()
})
export async function POST(req: Request) {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await req.json()
    const validatedData = createPostSchema.parse(body)
    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        content: validatedData.content,
        category: validatedData.category,
        userId: user.id,
        attachments: {
          create: validatedData.attachments || []
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            createdAt: true,
          },
        },
        attachments: true,
        likes: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })
    return Response.json(post)
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors[0].message }, { status: 400 })
    }
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}