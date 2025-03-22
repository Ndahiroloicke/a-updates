import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    // Check both publisher profile and request status
    const [profile, request] = await Promise.all([
      prisma.publisherProfile.findUnique({
        where: { userId },
        select: { id: true }
      }),
      prisma.publisherRequest.findFirst({
        where: { userId },
        orderBy: { requestedAt: 'desc' },
        select: { status: true }
      })
    ]);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      isPublisher: user.role === "PUBLISHER",
      hasProfile: !!profile,
      requestStatus: request?.status || null
    });

  } catch (error) {
    console.error("Error checking publisher status:", error)
    return NextResponse.json(
      { error: "Failed to check publisher status" },
      { status: 500 }
    )
  }
} 