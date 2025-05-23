import type { Metadata } from "next"
import Link from "next/link"
import LoginForm from "./LoginForm"
import GoogleSignInButton from "./google/GoogleSignInButton"

export const metadata: Metadata = {
  title: "Login",
}

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-5 dark:bg-gray-900">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-sm shadow-lg">
        <div className="flex-1 bg-white dark:bg-gray-800 p-8">
          <div className="w-full max-w-sm mx-auto space-y-6">
            <h1 className="text-3xl font-bold dark:text-white">
              SignIn to <span className="text-emerald-500">Africa Updates</span>
            </h1>
            <div className="space-y-6">
              <GoogleSignInButton />
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-muted dark:bg-gray-600" />
                <span className="text-sm text-muted-foreground dark:text-gray-400">OR</span>
                <div className="h-px flex-1 bg-muted dark:bg-gray-600" />
              </div>
              <LoginForm />

              {/* Mobile signup link - only visible on mobile */}
              <div className="md:hidden text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300">
                  Not registered yet?{" "}
                  <Link href="/signup" className="text-emerald-500 font-medium hover:text-emerald-600">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:flex flex-1 bg-emerald-500 items-center justify-center p-8">
          <div className="max-w-sm text-center text-white space-y-4">
            <h2 className="text-3xl font-bold">Welcome back!</h2>
            <p>
              Welcome back! We are so happy to have you here. Its great to see you again. We hope you had a safe and
              enjoyable time away.
            </p>
            <p>
              Not registered yet?{" "}
              <Link href="/signup" className="underline hover:text-emerald-100">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

