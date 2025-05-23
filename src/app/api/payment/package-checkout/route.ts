import { validateRequest } from "@/auth";
import { NextResponse } from "next/server";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Define package prices and details
const PACKAGES = {
  basic: {
    name: "Basic Publisher",
    price: 4999, // $49.99 in cents
    priceDisplay: "$49.99",
    description: "Basic publishing features including article creation and basic analytics"
  },
  professional: {
    name: "Professional Publisher",
    price: 9999, // $99.99 in cents
    priceDisplay: "$99.99",
    description: "Advanced publishing features including scheduled posting and priority support"
  },
  enterprise: {
    name: "Enterprise Publisher",
    price: 19999, // $199.99 in cents
    priceDisplay: "$199.99",
    description: "Full suite of publishing features including team collaboration and API access"
  }
};

export async function POST(request: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { packageType, paymentType = "payment" } = data;
    
    // Validate package type
    if (!packageType || !PACKAGES[packageType as keyof typeof PACKAGES]) {
      return NextResponse.json({ error: "Invalid package type" }, { status: 400 });
    }
    
    const selectedPackage = PACKAGES[packageType as keyof typeof PACKAGES];

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPackage.name,
              description: selectedPackage.description,
            },
            unit_amount: selectedPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: paymentType === 'subscription' ? 'subscription' : 'payment',
      success_url: `${APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&type=publisher&package=${packageType}`,
      cancel_url: `${APP_URL}/admin?canceled=true`,
      customer_email: loggedInUser.email,
      client_reference_id: loggedInUser.id,
      metadata: {
        userId: loggedInUser.id,
        packageType,
        paymentType,
        isAdvertiser: 'false'
      }
    });

    return NextResponse.json({ 
      url: session.url,
      package: selectedPackage
    });
  } catch (error) {
    console.error('Payment session creation error:', error);
    return NextResponse.json(
      { error: "Failed to create payment session" },
      { status: 500 }
    );
  }
} 