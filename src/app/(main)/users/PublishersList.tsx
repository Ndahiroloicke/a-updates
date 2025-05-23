"use client"
import { useEffect } from 'react';
import { User } from '@prisma/client';
import usePaginatedQuery from '@/hooks/usePaginatedQuery';
import UserTooltip from '@/components/UserTooltip';
import Link from 'next/link';
import UserAvatar from '@/components/UserAvatar';
import FollowButton from '@/components/FollowButton';

interface PublishersListProps {
  user: User;
}


function PublishersList() {
  const { data: users, nextPage, loading, fetchNextPage } = usePaginatedQuery<User>('/api/publishers/all');

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">All Publishers In The System</div>
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between gap-3">
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
        </div>
      ))}
      <div className="flex justify-center">
        {nextPage && !loading && (
          <button onClick={fetchNextPage} className="btn">
            Load More
          </button>
        )}
        {loading && <div>Loading...</div>}
      </div>
    </div>
  );
}

export default PublishersList;

