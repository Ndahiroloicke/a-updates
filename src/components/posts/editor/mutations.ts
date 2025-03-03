import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/components/ui/use-toast";
import { PostsPage, StoriesPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPoll, submitPost, submitStory, submitAdvertisement } from "./actions";
import { Query } from "@tanstack/react-query";

export function useSubmitPostMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const { user } = useSession();

  const mutation = useMutation({
    mutationFn: ({ type, input }: { type: "post" | "poll"; input: any }) => {
      if (type === "post") {
        return submitPost(input);
      } else {
        return submitPoll(input);
      }
    },
    onSuccess: async (newPost) => {
      const queryFilter: QueryFilters<InfiniteData<PostsPage, string | null>, Error, InfiniteData<PostsPage, string | null>, readonly unknown[]> = {
        queryKey: ["post-feed"],
        predicate: (query) =>
          query.queryKey.includes("for-you") ||
          (query.queryKey.includes("user-posts") &&
            query.queryKey.includes(user.id)),
      };
      await queryClient.cancelQueries(queryFilter);
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return oldData; 

          const firstPage = oldData.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }

          return oldData;
        }
      );


      toast({
        description: "Post created successfully!",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to create post. Please try again.",
      });
    },
  });


  return mutation;
}


export function useSubmitStoryMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useSession();

  const mutation = useMutation({
    mutationFn: submitStory,
    onSuccess: async (newStory) => {
      const queryFilter: QueryFilters<InfiniteData<StoriesPage, string | null>, Error, InfiniteData<StoriesPage, string | null>, readonly unknown[]> = {
        queryKey: ["story-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            (query.queryKey.includes("user-stories") &&
              query.queryKey.includes(user.id))
          );
        },
      };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<StoriesPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  stories: [newStory, ...firstPage.stories],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
          return oldData; // Ensure a return value
        },
      );

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return !!(queryFilter.predicate && queryFilter.predicate(query as Query<InfiniteData<StoriesPage, string | null>, Error, InfiniteData<StoriesPage, string | null>, readonly unknown[]>) && !query.state.data);
        },
      });

      toast({
        description: "Story created",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to post story. Please try again.",
      });
    },
  });

  return mutation;
}

export function useSubmitAdvertisementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAdvertisement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
    },
  });
}
