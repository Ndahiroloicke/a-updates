import prisma from "@/lib/prisma";

interface Params {
  params: {
    videoId: string;
  };
}

export async function POST(req: Request, { params: { videoId } }: Params) {
  try {
    // Increment the view count
    const video = await prisma.afroVideo.update({
      where: { id: videoId },
      data: {
        views: { increment: 1 }
      },
      select: { views: true }
    });

    return new Response(JSON.stringify({ views: video.views }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error tracking view:", error);
    return new Response(JSON.stringify({ error: "Failed to track view" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 