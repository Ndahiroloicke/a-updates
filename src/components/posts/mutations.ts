import { PostsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import { useSession } from "@/app/(main)/SessionProvider";

export function useVoteMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useSession();

  return useMutation({
    mutationFn: async ({ optionId }: { optionId: string }) => {
      const response = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to vote');
      }
      return response.json();
    },
    onSuccess: async () => {
      const queryFilter: QueryFilters = {
        queryKey: ["news-feed"],
        exact: true
      };

      await queryClient.invalidateQueries(queryFilter);
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to submit vote. Please try again.",
      });
    }
  });
}

export function useDeletePostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete post');
      }
      return response.json();
    },
    onSuccess: async (_, postId) => {
      const queryFilter: QueryFilters = {
        queryKey: ["news-feed"],
        exact: true
      };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage>>(
        { queryKey: ["news-feed"], exact: true },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              posts: page.posts.filter(post => post.id !== postId)
            }))
          };
        }
      );

      toast({
        description: "Post deleted",
      });

      if (pathname === `/posts/${postId}`) {
        router.push('/');
      }
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to delete post. Please try again.",
      });
    },
  });
}
