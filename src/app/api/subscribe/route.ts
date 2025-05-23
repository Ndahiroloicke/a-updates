import { NextResponse } from "next/server"
import { Resend } from 'resend'
import prisma from "@/lib/prisma"

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined")
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Send welcome email
    await resend.emails.send({
      from: 'Africa Updates <onboarding@resend.dev>', // Use this during testing
      to: email,
      subject: 'Welcome to Africa Updates Newsletter',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #3b82f6;">Welcome to Africa Updates Newsletter!</h2>
          <p>Thank you for subscribing to Africa Updates!</p>
          <p>You'll now receive our latest news, articles, and updates directly to your inbox.</p>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            If you didn't subscribe to our newsletter, please ignore this email.
          </p>
          <p style="margin-top: 30px;">
            Best regards,<br>
            The Africa Updates Team
          </p>
        </div>
      `
    })

    // Store subscriber in database
    await prisma.subscriber.create({
      data: {
        email,
        subscribedAt: new Date(),
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json({ error: "Failed to process subscription" }, { status: 500 })
  }
}

