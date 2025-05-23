import { validateRequest } from "@/auth"
import PollPageClient from "./PollPageClient"
import SessionProvider from "@/app/(main)/SessionProvider"
import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { cache } from "react"

interface PageProps {
  params: {
    pollId: string
  }
}

// Cache the poll fetching
const getPoll = cache(async (pollId: string) => {
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
        }
      },
      options: true,
    }
  })

  if (!poll) notFound()

  return poll
})

// Generate metadata for the poll page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const poll = await getPoll(params.pollId)
  
  return {
    title: `${poll.question} | Africa Updates Poll`,
    description: `Vote on "${poll.question}" - Join the discussion and share your opinion on Africa Updates`,
    openGraph: {
      title: `${poll.question} | Africa Updates Poll`,
      description: `Vote on "${poll.question}" - Join the discussion and share your opinion on Africa Updates`,
      type: 'website',
      url: `https://a-updates-alpha.vercel.app/polls/${params.pollId}`,
      siteName: 'Africa Updates',
    },
    twitter: {
      card: 'summary',
      title: `${poll.question} | Africa Updates Poll`,
      description: `Vote on "${poll.question}" - Join the discussion and share your opinion on Africa Updates`,
    }
  }
}

export default async function PollPage({ params }: PageProps) {
  const { user, session } = await validateRequest()
  const sessionData = { user, session: { user } }
  const poll = await getPoll(params.pollId)
  
  return (
    <>
      {/* Add structured data for the poll */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/VoteAction",
            "userInteractionCount": poll.options.reduce((acc, opt) => acc + opt.votes, 0),
            "name": poll.question,
            "author": {
              "@type": "Person",
              "name": poll.user.displayName,
              "url": `https://a-updates-alpha.vercel.app/users/${poll.user.username}`
            },
            "datePublished": poll.createdAt,
          })
        }}
      />
      <SessionProvider value={sessionData}>
        <PollPageClient />
      </SessionProvider>
    </>
  )
} 