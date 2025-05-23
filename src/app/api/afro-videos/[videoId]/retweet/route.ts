import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function POST(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videoId = params.videoId;
    console.log("Processing retweet for video:", videoId, "by user:", user.id);

    // First check if video exists
    const video = await prisma.afroVideo.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      console.log("Video not found:", videoId);
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    console.log("Found video:", video.id, "with title:", video.title);

    // Check if user has already retweeted using a simpler query
    const existingRetweet = await prisma.$queryRaw`
      SELECT id FROM "AfroVideoRetweet"
      WHERE "userId" = ${user.id} AND "videoId" = ${videoId}
      LIMIT 1
    `;
    
    if (existingRetweet && existingRetweet.length > 0) {
      console.log("Removing existing retweet");
      // If already retweeted, remove the retweet using raw query
      await prisma.$executeRaw`
        DELETE FROM "AfroVideoRetweet"
        WHERE "userId" = ${user.id} AND "videoId" = ${videoId}
      `;

      // Update repost count
      const updatedVideo = await prisma.afroVideo.update({
        where: { id: videoId },
        data: {
          reposts: {
            decrement: 1
          }
        }
      });
      
      return NextResponse.json({ 
        message: "Retweet removed", 
        retweeted: false,
        retweets: updatedVideo.reposts
      });
    }

    console.log("Creating new retweet");
    // Create new retweet using raw query
    await prisma.$executeRaw`
      INSERT INTO "AfroVideoRetweet" ("id", "userId", "videoId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${user.id}, ${videoId}, NOW(), NOW())
    `;

    // Update repost count
    const updatedVideo = await prisma.afroVideo.update({
      where: { id: videoId },
      data: {
        reposts: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ 
      message: "Video retweeted", 
      retweeted: true,
      retweets: updatedVideo.reposts
    });
  } catch (error) {
    console.error("Error handling retweet:", error);
    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to process retweet" },
      { status: 500 }
    );
  }
} 