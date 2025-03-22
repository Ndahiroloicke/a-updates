import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${(err as Error).message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId || session.client_reference_id;
        
        if (!userId) {
          throw new Error('No userId found in session metadata or client_reference_id');
        }

        // Use a transaction to ensure both operations succeed or fail together
        await prisma.$transaction(async (tx) => {
          // Create payment session
          await tx.paymentSession.create({
            data: {
              paymentIntentId: session.payment_intent as string,
              userId: userId,
              status: 'completed',
              paymentMethod: session.payment_method_types?.[0] || 'card',
            },
          });

          // Update user hasPaid status
          await tx.user.update({
            where: { id: userId },
            data: { 
              hasPaid: true,
              role: 'PUBLISHER' // Optionally update role to PUBLISHER if needed
            },
          });
        });

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}