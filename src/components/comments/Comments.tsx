import kyInstance from "@/lib/ky";
import { CommentsPage, PostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import Comment from "./Comment";
import CommentInput from "./CommentInput";
import { useSession } from "@/app/(main)/SessionProvider";

interface CommentsProps {
  post?: any;
  postId?: string;
}

export default function Comments({ post, postId }: CommentsProps) {
  const { user } = useSession();
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
          Load previous comments
        </Button>
      )}
      {status === "pending" && <Loader2 className="mx-auto animate-spin text-primary h-6 w-6" />}
      {status === "success" && !comments.length && (
        <p className="text-center text-muted-foreground">No comments yet.</p>
      )}
      <div className="divide-y">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
