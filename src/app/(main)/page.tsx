import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import HomePage from "./HomePage"

export default async function Page() {
  const session = await validateRequest()
  const userInfo = session.user ? await prisma.user.findUnique({
    where: { id: session.user.id },
  }) : null

  return <HomePage userInfo={userInfo} session={session} />
}

