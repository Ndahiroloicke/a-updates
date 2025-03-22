import type { Metadata } from "next"
import Link from "next/link"
import GoogleSignInButton from "./google/GoogleSignup"
import SignUpForm from "./SignUpForm"

export const metadata: Metadata = {
  title: "Sign Up",
}

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-5 dark:bg-gray-900">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-lg shadow-lg">
        <div className="hidden md:flex flex-1 bg-emerald-500 items-center justify-center p-12 text-white">
          <div className="max-w-sm text-center space-y-6">
            <h2 className="text-3xl font-bold">Come join us!</h2>
            <p className="text-lg">
              We are so excited to have you here. If you have not already, create an account to get access to exclusive
              assignments, rewards, and skills.
            </p>
            <p className="text-emerald-100">
              <Link href="/login" className="hover:underline">
                Already have an account? Sign in.
              </Link>
            </p>
          </div>
        </div>
        <div className="flex-1 bg-white dark:bg-gray-800 p-8">
          <div className="w-full max-w-sm mx-auto space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold dark:text-white">
                Sign up to <span className="text-emerald-500">Africa Updates</span>
              </h1>
              <p className="text-muted-foreground dark:text-gray-400">
                A place where even <span className="italic">you</span> can find a friend.
              </p>
            </div>
            <div className="space-y-6">
              <GoogleSignInButton />
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-muted dark:bg-gray-600" />
                <span className="text-sm text-muted-foreground dark:text-gray-400">OR</span>
                <div className="h-px flex-1 bg-muted dark:bg-gray-600" />
              </div>
              <SignUpForm />
              <div className="md:hidden text-center">
                <Link href="/login" className="text-sm hover:underline dark:text-gray-300">
                  Already have an account? Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

