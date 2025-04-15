import { NextResponse } from "next/server"
import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    // Check authentication
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const data = await request.json()
    console.log("Received data in /api/ads/create:", JSON.stringify(data, null, 2))
    const {
      name,
      type,
      region,
      duration,
      durationType,
      startDate,
      targetUrl,
      mediaId,
      dimensions,
      price,
    } = data

    console.log("Extracted mediaId:", mediaId)

    if (!mediaId) {
      console.log("MediaId is missing from request")
      return NextResponse.json(
        { error: "Missing mediaId" },
        { status: 400 }
      )
    }

    // Create advertisement record
    const advertisement = await prisma.advertisement.create({
      data: {
        name,
        type,
        location: region === "LOCAL" ? "Single Country" : region === "MULTI_COUNTRY" ? "Multiple Countries" : "All Africa",
        region,
        status: "PENDING_PAYMENT",
        startDate: new Date(startDate),
        duration,
        durationType,
        targetUrl,
        dimensions,
        price,
        user: {
          connect: {
            id: user.id
          }
        },
        media: {
          connect: {
            id: mediaId
          }
        },
        isApproved: false,
        isPaid: false,
        virusScanStatus: "pending",
        endDate: new Date(startDate), // Will be updated after payment
      },
    })

    // Create Stripe payment session
    const paymentSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Advertisement: ${name}`,
              description: `${region} advertisement for ${duration} ${durationType.toLowerCase()}`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ads?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ads?canceled=true`,
      metadata: {
        advertisementId: advertisement.id,
      },
    })

    // Update advertisement with payment session ID
    await prisma.advertisement.update({
      where: { id: advertisement.id },
      data: {
        paymentId: paymentSession.id,
      },
    })

    return NextResponse.json({
      advertisementId: advertisement.id,
      paymentUrl: paymentSession.url,
    })
  } catch (error) {
    console.error("Create advertisement error:", error)
    return NextResponse.json(
      { error: "Failed to create advertisement", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 