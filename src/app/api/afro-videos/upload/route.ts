import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Validate user and ensure they are an admin
    const { user } = await validateRequest();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user is an admin
    if (user.role !== 'ADMIN' && user.role !== 'SUB_ADMIN') {
      return new Response(JSON.stringify({ error: "Only admins can upload AfroVideos" }), {
        status: 403, 
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { title, description, videoUrl, thumbnailUrl, category, duration } = await req.json();

    // Validate required fields
    if (!title || !description || !videoUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields (title, description, videoUrl)" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create new AfroVideo
    const newVideo = await prisma.afroVideo.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        userId: user.id,
        category: category || undefined,
        duration: duration ? parseInt(duration) : null,
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

    return new Response(JSON.stringify(newVideo), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error uploading AfroVideo:", error);
    return new Response(JSON.stringify({ error: "Failed to upload video" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 