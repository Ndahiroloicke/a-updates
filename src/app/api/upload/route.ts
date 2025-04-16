"use server";

  import { NextResponse } from "next/server"
import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { MediaType, AdRegion, AdDurationType, AdStatus, AdPlacement, AdFormat } from "@prisma/client"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
})

// Base prices for different placements (in USD)
const PLACEMENT_PRICES = {
  RIGHT_COLUMN_TOP: 100,
  RIGHT_COLUMN_MIDDLE: 80,
  RIGHT_COLUMN_BOTTOM: 60,
  BELOW_FOOTER: 40,
  IN_FEED: 120,
  FULL_PAGE_TAKEOVER: 200,
} as const;

// Format multipliers
const FORMAT_MULTIPLIERS = {
  BANNER: 1,
  SIDEBAR: 1.2,
  IN_FEED: 1.5,
  FULL_PAGE: 2,
  MOBILE: 0.8,
} as const;

// Region multipliers
const REGION_MULTIPLIERS = {
  LOCAL: 1,
  MULTI_COUNTRY: 1.5,
  ALL_AFRICA: 2,
} as const;

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    console.log("Form data entries:", Array.from(formData.entries()))
    
    // Get file and ad data from form
    const file = formData.get("file") as File
    const name = formData.get("name") as string || ""
    const type = formData.get("type") as string || ""
    const description = formData.get("description") as string || ""
    const region = formData.get("region") as AdRegion || AdRegion.LOCAL
    const placement = formData.get("placement") as AdPlacement || AdPlacement.RIGHT_COLUMN_TOP
    const format = formData.get("format") as AdFormat || AdFormat.BANNER
    const durationStr = formData.get("duration") as string || "0"
    const duration = parseInt(durationStr)
    const durationType = formData.get("durationType") as AdDurationType || AdDurationType.DAYS
    const startDateStr = formData.get("startDate") as string
    const startDate = startDateStr ? new Date(startDateStr) : new Date()
    const targetUrl = formData.get("targetUrl") as string | null
    const priceStr = formData.get("price") as string || "0"
    const price = parseFloat(priceStr)

    // Validate required fields
    if (!name || !type || !region || !durationType || isNaN(duration) || duration <= 0 || isNaN(price) || price <= 0) {
      console.log("Validation failed:", { name, type, region, duration, durationType, price })
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      )
    }

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: "Missing file" },
        { status: 400 }
      )
    }

    console.log("Validated ad data:", {
      name, type, region, duration, durationType, startDate, targetUrl, price
    })

    // Calculate price
    const basePrice = PLACEMENT_PRICES[placement] || 100;
    const formatMultiplier = FORMAT_MULTIPLIERS[format] || 1;
    const regionMultiplier = REGION_MULTIPLIERS[region] || 1;
    const totalPrice = basePrice * formatMultiplier * regionMultiplier;

    // Generate unique filename and ensure upload directory exists
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uniqueFilename = `${uuidv4()}-${file.name}`
    const uploadDir = join(process.cwd(), "public", "uploads")
    
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error("Failed to create upload directory:", error)
    }

    const filePath = join(uploadDir, uniqueFilename)
    await writeFile(filePath, buffer)
    const fileUrl = `/uploads/${uniqueFilename}`

    // Create media record
    const mediaType = file.type.startsWith("image/") ? MediaType.IMAGE : MediaType.VIDEO
    const media = await prisma.media.create({
      data: {
        type: mediaType,
        url: fileUrl,
        postId: null,
      },
    })

    console.log("Created media record:", media)

    // Calculate end date based on duration and type
    const endDate = new Date(startDate)
    switch (durationType) {
      case AdDurationType.MINUTES:
        endDate.setMinutes(endDate.getMinutes() + duration)
        break
      case AdDurationType.HOURS:
        endDate.setHours(endDate.getHours() + duration)
        break
      case AdDurationType.DAYS:
        endDate.setDate(endDate.getDate() + duration)
        break
      case AdDurationType.WEEKS:
        endDate.setDate(endDate.getDate() + (duration * 7))
        break
      case AdDurationType.MONTHS:
        endDate.setMonth(endDate.getMonth() + duration)
        break
    }

    // Create advertisement record first
    const advertisement = await prisma.advertisement.create({
      data: {
        name,
        type,
        location: region === AdRegion.LOCAL ? "Single Country" : region === AdRegion.MULTI_COUNTRY ? "Multiple Countries" : "All Africa",
        region,
        placement,
        format,
        status: AdStatus.PENDING,
        startDate,
        endDate,
        duration,
        durationType,
        targetUrl: targetUrl || undefined,
        dimensions: { width: 0, height: 0 },
        price: totalPrice,
        user: {
          connect: {
            id: user.id
          }
        },
        media: {
          connect: {
            id: media.id
          }
        },
        isApproved: false,
        isPaid: false,
        virusScanStatus: "pending"
      },
    })

    console.log("Created advertisement:", advertisement)

    // Create Stripe payment session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${process.env.NEXT_PUBLIC_PROTOCOL || 'http'}://${process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL || 'localhost:3000'}`;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Advertisement: ${name}`,
              description: `${placement.replace(/_/g, " ")} placement for ${duration} ${durationType.toLowerCase()}`,
            },
            unit_amount: Math.round(totalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/home?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/home?payment_canceled=true`,
      metadata: {
        advertisementId: advertisement.id,
      },
    });

    // Create payment session record
    await prisma.paymentSession.create({
      data: {
        paymentIntentId: session.id,
        status: session.status ?? "pending",
        paymentMethod: "card",
        userId: user.id,
        Advertisement: {
          connect: {
            id: advertisement.id
          }
        }
      },
    });

    return NextResponse.json({
      advertisementId: advertisement.id,
      paymentUrl: session.url,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to process upload", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 