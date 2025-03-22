import UserAvatar from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import ApproveBecomePublisherButton from "./ApproveBecomePublisherButton";

import UserRequestItem from "./userRequestApproval";

async function getPublishersRequest(limit?: number) {
    return await prisma.publisherRequest.findMany({
        take: limit,
        include: { user: true },
        orderBy: {
            requestedAt: "desc",
        },
    });
}


export default async function PublishersRequests() {
  const headersList = headers();
  const url = headersList.get("referer") || "";
  const showAll = url.includes("/publishers-request");

  const requests = await getPublishersRequest(showAll ? undefined : 5);

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Publishers Requests</h2>
        {!showAll && (
          <Link
            href={"/users/publishers-request"}
            className="text-blue-500 underline"
          >
            View More
          </Link>
        )}
      </div>
      <div className="space-y-4">
        {requests.map((request) => (
          <UserRequestItem key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
}

