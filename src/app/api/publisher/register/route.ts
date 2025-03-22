import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Create everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if publisher profile already exists
      const existingProfile = await tx.publisherProfile.findUnique({
        where: { userId: loggedInUser.id },
      });

      if (existingProfile) {
        throw new Error("Publisher profile already exists");
      }

      // Create publisher profile
      const profile = await tx.publisherProfile.create({
        data: {
          userId: loggedInUser.id,
          firstName: data.firstName,
          lastName: data.lastName,
          workPhone: data.workPhone,
          cellPhone: data.cellPhone,
          address: data.address,
          city: data.city,
          stateProvince: data.stateProvince,
          country: data.country,
          postalCode: data.postalCode,
          companyName: data.organization,
          socialMedia: data.socialMedia,
          pressReleaseFrequency: data.pressReleaseFrequency,
          productsOfInterest: data.productsOfInterest,
          bestTimeToReach: data.bestTimeToReach,
          additionalInfo: data.additionalInfo,
          paymentType: data.paymentType,
        },
      });

      // Create approved publisher request
      await tx.publisherRequest.create({
        data: {
          userId: loggedInUser.id,
          status: "APPROVED",
        },
      });

      // Update user role to PUBLISHER
      await tx.user.update({
        where: { id: loggedInUser.id },
        data: { role: "PUBLISHER" },
      });

      return profile;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Publisher registration error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to register publisher" 
      },
      { status: 400 }
    );
  }
}