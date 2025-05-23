import { validateRequest } from "@/auth"
import SessionProvider from "../SessionProvider"

// This layout should reset the standard (main) layout and provide a full screen video experience
export const metadata = {
  title: 'Afro Shorts',
  description: 'Short video experience',
}

// Use this option to create a layout that replaces the main layout instead of nesting inside it
export const dynamic = 'force-dynamic'

export default async function AfroVideosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await validateRequest()

  return (
    <SessionProvider value={{ user } as any}>
      <div className="h-screen w-full bg-black overflow-hidden">
        {children}
      </div>
    </SessionProvider>
  )
} 