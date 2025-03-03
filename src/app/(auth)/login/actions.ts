"use server"

import { lucia } from "@/auth"
import prisma from "@/lib/prisma"
import { loginSchema, type LoginValues } from "@/lib/validation"
import { verify } from "@node-rs/argon2"
import { isRedirectError } from "next/dist/client/components/redirect"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from 'bcrypt'

export async function login(credentials: LoginValues): Promise<{ error: string }> {
  try {
    const { username, email, password } = loginSchema.parse(credentials)

    const existingUser = await prisma.user.findFirst({
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
    })

    if (!existingUser || !existingUser.passwordHash) {
      return {
        error: "Incorrect credentials",
      }
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.passwordHash)

    if (!passwordMatch) {
      return {
        error: "Incorrect credentials",
      }
    }

    const session = await lucia.createSession(existingUser.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    return redirect("/")
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error(error)
    return {
      error: "Something went wrong. Please try again.",
    }
  }
}

