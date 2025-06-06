// src/app/api/auth/mobile/validate-session/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, sessionId: string };

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: {
        id: decoded.sessionId,
        userId: decoded.userId,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!session) {
      return Response.json({ error: 'Session expired or invalid' }, { status: 401 });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        bio: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 401 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error('Validate session error:', error);
    return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}