import { validateRequest } from "@/auth"
import PollPageClient from "./PollPageClient"
import SessionProvider from "@/app/(main)/SessionProvider"

export default async function PollPage() {
  const { user, session } = await validateRequest()
  const sessionData = { user, session: { user } }
  
  return (
    <SessionProvider value={sessionData}>
      <PollPageClient />
    </SessionProvider>
  )
} 