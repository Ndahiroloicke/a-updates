import { NextResponse } from "next/server"
import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const rules = await prisma.adPricingRule.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(rules)
  } catch (error) {
    console.error("Error fetching pricing rules:", error)
    return NextResponse.json(
      { error: "Failed to fetch pricing rules" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const rule = await prisma.adPricingRule.create({
      data: {
        region: data.region,
        position: data.position,
        durationType: data.durationType,
        basePrice: data.basePrice,
        multiplier: data.multiplier,
      },
    })

    return NextResponse.json(rule)
  } catch (error) {
    console.error("Error creating pricing rule:", error)
    return NextResponse.json(
      { error: "Failed to create pricing rule" },
      { status: 500 }
    )
  }
} 