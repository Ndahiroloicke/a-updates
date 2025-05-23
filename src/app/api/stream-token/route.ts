import { validateRequest } from "@/auth";
import { NextResponse } from "next/server";
import { StreamChat } from 'stream-chat';

if (!process.env.NEXT_PUBLIC_STREAM_KEY) {
    throw new Error("NEXT_PUBLIC_STREAM_KEY is not set");
}

if (!process.env.STREAM_SECRET) {
    throw new Error("STREAM_SECRET is not set");
}

const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_KEY,
    process.env.STREAM_SECRET
);

export async function GET() {
    try {
        const { user } = await validateRequest();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Generate token with expiration
        const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now
        const issuedAt = Math.floor(Date.now() / 1000) - 60; // 1 minute ago

        const token = serverClient.createToken(user.id, expirationTime, issuedAt);
        
        return NextResponse.json({ token });
    } catch (error) {
        console.error('Error generating stream token:', error);
        return NextResponse.json(
            { error: "Failed to generate token" },
            { status: 500 }
        );
    }
} 