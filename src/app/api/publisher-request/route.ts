import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, email, message } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const publisherRequest = await prisma.publisherRequest.create({
      data: {
        userId,
        email,
        status: "PENDING",
        message: message || null,
      },
    });

    return NextResponse.json(publisherRequest);
  } catch (error) {
    console.error("Error creating publisher request:", error);
    return NextResponse.json(
      { error: "Failed to create publisher request" },
      { status: 500 }
    );
  }
}

// GET endpoint remains the same
export async function GET() {
  try {
    const requests = await prisma.publisherRequest.findMany({
      include: {
        user: true,
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching publisher requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch publisher requests" },
      { status: 500 }
    );
  }
}