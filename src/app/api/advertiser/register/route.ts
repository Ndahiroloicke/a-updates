import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import { z } from "zod";

// Validation schema for advertiser registration
const advertiserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  workPhone: z.string().min(1, "Work phone is required"),
  cellPhone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  stateProvince: z.string().min(1, "State/Province is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  organization: z.string().min(1, "Organization is required"),
  socialMedia: z.string().optional(),
  advertisementType: z.string().min(1, "Advertisement type is required"),
  advertisementLocation: z.array(z.string()).min(1, "At least one advertisement location is required"),
  bestTimeToReach: z.string().optional(),
  additionalInfo: z.string().optional(),
  paymentType: z.enum(["free", "oneTime", "subscription"], {
    required_error: "Payment type is required",
    invalid_type_error: "Invalid payment type",
  }),
});

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    console.log("Received registration data:", data);
    
    // Validate request data
    const validationResult = advertiserSchema.safeParse(data);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      console.error("Validation errors:", errors);
      return NextResponse.json({ 
        error: "Validation failed", 
        errors,
        receivedData: data 
      }, { status: 400 });
    }

    // Check if user already has an advertiser profile
    const existingProfile = await prisma.advertiserProfile.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Advertiser profile already exists" },
        { status: 400 }
      );
    }

    try {
      const advertiser = await prisma.advertiserProfile.create({
        data: {
          userId: user.id,
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
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { 
          error: "Database error", 
          details: dbError instanceof Error ? dbError.message : "Unknown database error",
          schema: advertiserSchema.shape,
          receivedData: data
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Advertiser registration error:", error);
    return NextResponse.json(
      { 
        error: "Failed to register advertiser", 
        details: error instanceof Error ? error.message : "Unknown error",
        schema: advertiserSchema.shape,
      },
      { status: 500 }
    );
  }
} 