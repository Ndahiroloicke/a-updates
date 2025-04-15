"use client"

import kyInstance from "@/lib/ky";
import { CommentsPage, PostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import Comment from "./Comment";
import CommentInput from "./CommentInput";
import { useSession } from "@/app/(main)/SessionProvider";
import { useTranslation } from "@/contexts/TranslationContext";

interface CommentsProps {
  post?: any;
  postId?: string;
}

export default function Comments({ post, postId }: CommentsProps) {
  const { user } = useSession();
  const { targetLanguage, translatedTexts, translateText } = useTranslation();
  const id = post?.id || postId;

  const { data, fetchNextPage, hasNextPage, isFetching, status } =
    useInfiniteQuery({
      queryKey: ["comments", id],
      queryFn: async ({ pageParam }) => {
        try {
          return await kyInstance
            .get(
              `/api/posts/${id}/comments`,
              pageParam ? { searchParams: { cursor: pageParam } } : {},
            )
            .json<CommentsPage>();
        } catch (error) {
          return { comments: [], previousCursor: null };
        }
      },
      initialPageParam: null as string | null,
      getNextPageParam: (firstPage) => firstPage.previousCursor,
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
    });

  const comments = data?.pages.flatMap((page) => page.comments) || [];

  // Translate load previous comments button text
  const loadPreviousKey = `load-previous-${id}`;
  const noCommentsKey = `no-comments-${id}`;

  if (targetLanguage) {
    translateText("Load previous comments", loadPreviousKey);
    translateText("No comments yet.", noCommentsKey);
  }

  const translatedLoadPrevious = translatedTexts[loadPreviousKey] || "Load previous comments";
  const translatedNoComments = translatedTexts[noCommentsKey] || "No comments yet.";

  return (
    <div className="space-y-3">
      {user && <CommentInput postId={id} />}
      {hasNextPage && (
        <Button
          variant="link"
          className="mx-auto block text-primary hover:text-primary/80"
          disabled={isFetching}
          onClick={() => fetchNextPage()}
        >
          {translatedLoadPrevious}
        </Button>
      )}
      {status === "pending" && <Loader2 className="mx-auto animate-spin text-primary h-6 w-6" />}
      {status === "success" && !comments.length && (
        <p className="text-center text-muted-foreground">{translatedNoComments}</p>
      )}
      <div className="divide-y">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
