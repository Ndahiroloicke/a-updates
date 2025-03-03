import { validateRequest } from "@/auth";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostData } from "@/lib/types";
import { Metadata } from "next";
import { cache } from "react";
import Article from "./Article";
import type { User } from "@prisma/client";

interface PageProps {
  params: {
    postId: string;
  };
}

const getPost = cache(async (postId: string, loggedInUserId?: string | null) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: getPostDataInclude(loggedInUserId || ""),
  });

  if (!post) notFound();

  return post;
});

export async function generateMetadata({
  params: { postId },
}: PageProps): Promise<Metadata> {
  const post = await getPost(postId);

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function Page({ params: { postId } }: PageProps) {
  const { user } = await validateRequest();
  const post = await getPost(postId, user?.id);

  return (
    <main className="container mx-auto px-4 py-8">
      <Article post={post} currentUser={user} />
    </main>
  );
}
