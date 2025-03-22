import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { validateRequest } from "@/auth";

export async function POST(req: Request) {
  try {
    const {session} = await validateRequest();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    // Check if user already has an advertiser profile
    const existingProfile = await prisma.advertiserProfile.findUnique({
      where: { userId: session.userId },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Advertiser profile already exists" },
        { status: 400 }
      );
    }

    const advertiser = await prisma.advertiserProfile.create({
      data: {
        userId: session.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        workPhone: data.workPhone,
        cellPhone: data.cellPhone,
        address: data.address,
        city: data.city,
        stateProvince: data.stateProvince,
        country: data.country,
        postalCode: data.postalCode,
        organization: data.organization,
        socialMedia: data.socialMedia || null,
        advertisementType: data.advertisementType,
        advertisementLocation: data.advertisementLocation,
        bestTimeToReach: data.bestTimeToReach || null,
        additionalInfo: data.additionalInfo || null,
        paymentType: data.paymentType,
      },
    });

    return NextResponse.json(advertiser);
  } catch (error) {
    console.error("Advertiser registration error:", error);
    return NextResponse.json(
      { error: "Failed to register advertiser" },
      { status: 500 }
    );
  }
} 