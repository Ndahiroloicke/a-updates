import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

interface Params {
  params: {
    videoId: string;
  };
}

export async function GET(req: Request, { params: { videoId } }: Params) {
  try {
    // Get comments for the specified video
    const comments = await prisma.comment.findMany({
      where: {
        afroVideoId: videoId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return new Response(JSON.stringify(comments), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch comments" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: Request, { params: { videoId } }: Params) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if video exists
    const video = await prisma.afroVideo.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return new Response(JSON.stringify({ error: "Video not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { content } = await req.json();

    if (!content || content.trim() === "") {
      return new Response(JSON.stringify({ error: "Comment content cannot be empty" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create new comment
    const newComment = await prisma.comment.create({
      data: {
        content,
        userId: user.id,
        afroVideoId: videoId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(newComment), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return new Response(JSON.stringify({ error: "Failed to create comment" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 