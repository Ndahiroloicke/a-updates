import { validateRequest } from "@/auth";
import { NextResponse } from "next/server";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    // Set price based on payment type
    const priceId = data.paymentType === 'subscription' 
      ? process.env.STRIPE_SUBSCRIPTION_PRICE_ID 
      : process.env.STRIPE_ONETIME_PRICE_ID;

    if (!priceId) {
      throw new Error('Price ID not configured');
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: data.paymentType === 'subscription' ? 'subscription' : 'payment',
      success_url: `${APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/payment-failed`,
      customer_email: loggedInUser.email,
      client_reference_id: loggedInUser.id,
      metadata: {
        userId: loggedInUser.id,
        paymentType: data.paymentType
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Payment session creation error:', error);
    return NextResponse.json(
      { error: "Failed to create payment session" },
      { status: 500 }
    );
  }
}