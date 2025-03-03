"use client"
import { useState, useEffect } from 'react'
import bcrypt from 'bcrypt'

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