"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia } from "@/auth";

export async function POST(req: Request) {
  const { paymentIntentId, userId } = await req.json();

  try {
    // Store the payment session in the database
    const session = await prisma.paymentSession.create({
      data: {
        paymentIntentId: paymentIntentId, 
        paymentMethod: "card", // Store the payment method
        status:"Success",// Store the paymentIntentId correctly
        userId: userId, // Use the userId from the request
      },
    });

    console.log("Payment session stored successfully.");

    // Optionally create a user session after payment
    const userSession = await lucia.createSession(userId, {}); // User ID after payment
    const sessionCookie = lucia.createSessionCookie(userSession.id);

    // Set the session cookie
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // You can optionally redirect the user after successful payment or session creation
    return redirect("/posts/create");

  } catch (error) {
    console.error("Error storing payment session:", error);
    return { error: "Internal Server Error" };
  }
}
