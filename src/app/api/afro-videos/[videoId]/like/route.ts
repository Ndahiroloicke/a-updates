import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

interface Params {
  params: {
    videoId: string;
  };
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

    // Check if user has already liked this video
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: user.id,
        afroVideoId: videoId,
      },
    });

    if (existingLike) {
      // Unlike if already liked
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return new Response(
        JSON.stringify({ 
          message: "Video unliked successfully", 
          liked: false 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Create new like
      await prisma.like.create({
        data: {
          userId: user.id,
          afroVideoId: videoId,
        },
      });

      return new Response(
        JSON.stringify({ 
          message: "Video liked successfully", 
          liked: true 
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error liking video:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process like action" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
} 