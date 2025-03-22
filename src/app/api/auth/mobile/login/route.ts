// src/app/api/auth/mobile/login/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateIdFromEntropySize } from "lucia";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const loginSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = loginSchema.parse(body);
    
    // Find user by username and email
    const user = await prisma.user.findFirst({
      where: {
        AND: [
          {
            username: {
              equals: username,
              mode: "insensitive",
            },
          },
          {
            email: {
              equals: email,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    if (!user || !user.passwordHash) {
      return Response.json({ error: "Incorrect credentials" }, { status: 401 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return Response.json({ error: "Incorrect credentials" }, { status: 401 });
    }

    // Create session
    const sessionId = generateIdFromEntropySize(10);
    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        sessionId
      }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    // Return user data and token
    return Response.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      sessionToken: token
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors[0].message }, { status: 400 });
    }
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}