import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import FollowButton from "./FollowButton";
import UserAvatar from "./UserAvatar";
import UserTooltip from "./UserTooltip";

export default async function TrendsSidebar() {
  const {user} = await validateRequest()
  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        {user && <WhoToFollow />}
        <TrendingTopics />
        <LinksSidebar />
      </Suspense>
    </div>
  );
}

async function WhoToFollow() {
  const { user } = await validateRequest();

  if (!user) return null;

  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: user.id,
      },
      OR: [
        { role: "USER" },
        { role: "PUBLISHER" }
      ],
      followers: {
        none: {
          followerId: user.id,
        },
      },
    },
    select: getUserDataSelect(user.id),
    take: 5,
  });


  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Who to follow</div>
      {usersToFollow.map((user) => (
        <div key={user.id} className="flex items-center justify-between gap-3">
          <UserTooltip user={user}>
            <Link
              href={`/users/${user.username}`}
              className="flex items-center gap-3"
            >
              <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
              <div>
                <p className="line-clamp-1 break-all font-semibold hover:underline">
                  {user.displayName}
                </p>
                <p className="line-clamp-1 break-all text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </Link>
          </UserTooltip>
          <FollowButton
            userId={user.id}
            initialState={{
              followers: user._count.followers,
              isFollowedByUser: user.followers.some(
                ({ followerId }) => followerId === user.id,
              ),
            }}
          />
        </div>
      ))}
    </div>
  );
}

const getTrendingTopics = unstable_cache(
  async () => {
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
    WITH hashtags AS (
        SELECT LOWER(unnest(regexp_matches(title, '#[[:alnum:]_]+', 'g'))) AS hashtag
        FROM posts
        UNION ALL
        SELECT LOWER(unnest(regexp_matches(description, '#[[:alnum:]_]+', 'g'))) AS hashtag
        FROM posts
        UNION ALL
        SELECT LOWER(unnest(regexp_matches(body, '#[[:alnum:]_]+', 'g'))) AS hashtag
        FROM posts
    )
    SELECT hashtag, COUNT(*) AS count
    FROM hashtags
    GROUP BY hashtag
    ORDER BY count DESC, hashtag ASC
    LIMIT 5;
`;


    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
  },
  ["trending_topics"],
  {
    revalidate: 3 * 60 * 60,
  },
);


export async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Trending topics</div>
      {trendingTopics.map(({ hashtag, count }) => {
        const title = hashtag.split("#")[1];

        return (
          <Link key={title} href={`/hashtag/${title}`} className="block">
            <p
              className="line-clamp-1 break-all font-semibold hover:underline"
              title={hashtag}
            >
              {hashtag}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatNumber(count)} {count === 1 ? "post" : "posts"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}


const getLinks = unstable_cache(
  async () => {
    const result = await prisma.link.findMany()
    return result;
  },
  ["links"],
  {
    revalidate: 3 * 60 * 60,
  },
);

export async function LinksSidebar() {
  const links = await getLinks();
  function getRandomBackgroundColorAndTextColor() {
    const colorPairs = [
      { bg: 'bg-red-100', text: 'text-red-800' },
      { bg: 'bg-blue-100', text: 'text-blue-800' },
      { bg: 'bg-green-100', text: 'text-green-800' },
      { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      { bg: 'bg-purple-100', text: 'text-purple-800' },
    ];
    const randomIndex = Math.floor(Math.random() * colorPairs.length);
    return colorPairs[randomIndex];
  }

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Links</div>
      <div className="flex flex-wrap gap-4">
        {links.map((link) => {
          const { bg, text } = getRandomBackgroundColorAndTextColor();
          return (
            <a
              key={link.title}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block ${bg} ${text} px-2 py-1 rounded-lg w-fit`}
            >
              <p
                className="line-clamp-1 break-all font-semibold hover:underline"
                title={link.title}
              >
                {link.title}
              </p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
