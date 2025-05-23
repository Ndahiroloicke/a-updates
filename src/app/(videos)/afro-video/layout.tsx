import { validateRequest } from "@/auth"
import SessionProvider from "../../(main)/SessionProvider"

export const metadata = {
  title: 'Afro Shorts',
  description: 'Short video experience',
}

export const dynamic = 'force-dynamic'

export default async function AfroVideoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await validateRequest()

  return (
    <SessionProvider value={{ user } as any}>
      <div className="h-screen w-full bg-white overflow-hidden">
        {children}
      </div>
    </SessionProvider>
  )
} 