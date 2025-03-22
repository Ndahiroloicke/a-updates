import { validateRequest } from "@/auth";
import { NextResponse } from "next/server";
import { StreamChat } from 'stream-chat';

const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_KEY!,
    process.env.STREAM_SECRET!
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

        const token = serverClient.createToken(user.id);
        return NextResponse.json({ token });
    } catch (error) {
        console.error('Error generating stream token:', error);
        return NextResponse.json(
            { error: "Failed to generate token" },
            { status: 500 }
        );
    }
} 