import { validateRequest } from "@/auth"
import PollsFeed from "./PollsFeed"

export default async function PollsPage() {
  const { user } = await validateRequest()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Polls</h1>
      <PollsFeed />
    </div>
  )
} 