import { StreamChat } from 'stream-chat';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_KEY!,
    process.env.STREAM_SECRET!
);

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const token = serverClient.createToken(userId);

    return new Response(JSON.stringify({
        token,
        userId,
    }), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
} 