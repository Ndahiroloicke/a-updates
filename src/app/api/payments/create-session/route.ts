import { validateRequest } from "@/auth";
import { NextResponse } from "next/server";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const PUBLISHER_PRICES = {
  oneTime: process.env.STRIPE_PUBLISHER_ONE_TIME_PRICE_ID,
  subscription: process.env.STRIPE_PUBLISHER_SUBSCRIPTION_PRICE_ID,
};

export async function POST(request: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { type, paymentType } = data;
    
    // Get price ID based on payment type and user type
    let priceId;
    if (type === 'publisher') {
      priceId = PUBLISHER_PRICES[paymentType as keyof typeof PUBLISHER_PRICES];
      if (!priceId) {
        return NextResponse.json(
          { error: "Invalid payment type for publisher" },
          { status: 400 }
        );
      }
    } else {
      priceId = data.priceId;
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
      mode: paymentType === 'subscription' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&type=${type}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      customer_email: loggedInUser.email,
      client_reference_id: loggedInUser.id,
      metadata: {
        userId: loggedInUser.id,
        type,
        paymentType
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