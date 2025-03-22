// src/app/api/auth/mobile/signup/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateIdFromEntropySize } from "lucia";
import { z } from "zod";
import streamServerClient from "@/lib/stream";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const signupSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = signupSchema.parse(body);
    
    // Check if username already exists
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername) {
      return Response.json({ error: "Username already taken" }, { status: 400 });
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return Response.json({ error: "Email already taken" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate user ID
    const userId = generateIdFromEntropySize(10);

    // Create user in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: username,
          email,
          passwordHash: hashedPassword,
        },
      });
      
      // Also create user in Stream if needed
      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: username,
      });
    });

    // Create session
    const sessionId = generateIdFromEntropySize(10);
    await prisma.session.create({
      data: {
        id: sessionId,
        userId: userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userId,
        sessionId
      }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    // Return user data and token
    return Response.json({
      user: {
        id: userId,
        username,
        displayName: username,
        email,
        role: "user",
        createdAt: new Date()
      },
      sessionToken: token
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors[0].message }, { status: 400 });
    }
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}