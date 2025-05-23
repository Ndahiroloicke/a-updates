import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

interface Params {
  params: {
    videoId: string;
  };
}

export async function GET(req: Request, { params: { videoId } }: Params) {
  try {
    const { user } = await validateRequest();

    // Find the video
    const video = await prisma.afroVideo.findUnique({
      where: { id: videoId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: user ? {
          where: { userId: user.id },
          select: { userId: true }
        } : undefined,
      },
    });

    if (!video) {
      return new Response(JSON.stringify({ error: "Video not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(video), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch video" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 