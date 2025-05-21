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

    // Increment share count
    const updatedVideo = await prisma.afroVideo.update({
      where: { id: videoId },
      data: {
        shares: {
          increment: 1,
        },
      },
    });

    // Get the destination where the video is being shared to (optional)
    const { destination } = await req.json();

    // You could record share analytics here if desired
    
    return new Response(
      JSON.stringify({
        message: "Video shared successfully",
        shares: updatedVideo.shares,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sharing video:", error);
    return new Response(JSON.stringify({ error: "Failed to share video" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 