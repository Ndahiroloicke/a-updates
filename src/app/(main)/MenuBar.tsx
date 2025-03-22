import { validateRequest } from "@/auth";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { Bookmark, Home, UsersRound, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";
import { ShoppingBag } from "lucide-react";
import { Role } from "@prisma/client";

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
  const { user } = await validateRequest();

  const userInfo = await prisma.user.findUnique({
    where: { id: user?.id || "" },
  })


  const [unreadNotificationsCount, unreadMessagesCount] = user
    ? await Promise.all([
      prisma.notification.count({
        where: {
          recipientId: user.id,
          read: false,
        },
      }),
      (await streamServerClient.getUnreadCount(user.id)).total_unread_count,
    ])
    : [0, 0];

  return (
    <div>
      {userInfo?.role != "ADMIN" && (
    <div className={className}>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Home"
        asChild
      >
        <Link href="/">
          <Home />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      {userInfo?.role == "ADMIN" ?
        (<>
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-3"
            title="USERS"
            asChild
          >
            <Link href="/users">
              <UsersRound />
              <span className="hidden lg:inline">Users</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-3"
            title="Links"
            asChild
          >
            <Link href="/links">
              <LinkIcon />
              <span className="hidden lg:inline">Links</span>
            </Link>
          </Button>
          <NotificationsButton
            initialState={{ unreadCount: unreadNotificationsCount }}
          />
          <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-3"
            title="Bookmarks"
            asChild
          >
            <Link href="/bookmarks">
              <Bookmark />
              <span className="hidden lg:inline">Bookmarks</span>
            </Link>
          </Button>
        </>
        ) : (
          <>
            {userInfo && <> <NotificationsButton
              initialState={{ unreadCount: unreadNotificationsCount }}
            />
              <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} /></>}
            {userInfo?.role == "PUBLISHER" && (<Button
              variant="ghost"
              className="flex items-center justify-start gap-3"
              title="My Posts"
              asChild
            >
              <Link href="/my-posts">
                <Bookmark />
                <span className="hidden lg:inline">My Posts</span>
              </Link>
            </Button>)}
            {userInfo?.role == "PUBLISHER" && (<Button
              variant="ghost"
              className="flex items-center justify-start gap-3"
              title="My Subscription"
              asChild
            >
              <Link href="/my-Subscription">
                <ShoppingBag />
                <span className="hidden lg:inline">My Subscription</span>
              </Link>
            </Button>)}
            {userInfo && <Button
              variant="ghost"
              className="flex items-center justify-start gap-3"
              title="Bookmarks"
              asChild
            >
              <Link href="/bookmarks">
                <Bookmark />
                <span className="hidden lg:inline">Bookmarks</span>
              </Link>
            </Button>}
          </>
        )}
    </div>
)}
    </div>
  );
}
