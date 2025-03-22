"use client"; // This line is important to mark it as a Client Component

import Link from "next/link";
import ApproveBecomePublisherButton from "./ApproveBecomePublisherButton";
import UserAvatar from "@/components/UserAvatar";
import { PublisherRequest } from "@prisma/client";
import { UserData } from "@/lib/types";

interface UserRequestItemProps {
  request: PublisherRequest & {
    user: UserData;
  };
}

export default function UserRequestItem({ request }: UserRequestItemProps) {
  return (
    <div key={request.id} className="border-b pb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar avatarUrl={request.user.avatarUrl} className="flex-none" />
          <div>
            <Link
              href={`/users/${request.user.username}`}
              className="line-clamp-1 break-all font-semibold hover:underline"
            >
              {request.user.displayName}
            </Link>
            <p className="line-clamp-1 break-all text-muted-foreground">
              @{request.user.username}
            </p>
          </div>
        </div>
        <ApproveBecomePublisherButton request={request as any} />
      </div>
    </div>
  );
}
