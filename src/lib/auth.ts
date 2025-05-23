"use client"
import { useState, useEffect } from 'react'
import bcrypt from 'bcrypt'
import { lucia } from "lucia"
import { nextjs_future } from "lucia/middleware"
import { prisma } from "@lucia-auth/adapter-prisma"
import { PrismaClient } from "@prisma/client"

interface User {
  username?: string
  // Add other user properties as needed
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  
  // Add actual authentication logic here
  return { user }
}

// Replace argon2 hash function with bcrypt
export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Replace argon2 verify function with bcrypt
export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

const client = new PrismaClient()

export const auth = lucia({
  env: process.env.NODE_ENV === "development" ? "DEV" : "PROD",
  middleware: nextjs_future(),
  sessionCookie: {
    expires: false
  },
  adapter: prisma(client, {
    user: "user",
    session: "session",
    key: "key"
  })
})

export type Auth = typeof auth

export const authOptions = {
  auth,
  session: {
    strategy: "jwt"
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development"
} 