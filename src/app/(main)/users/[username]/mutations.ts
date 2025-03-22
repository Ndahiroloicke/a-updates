import { useToast } from "@/components/ui/use-toast";
import { PostsPage } from "@/lib/types";
import { useUploadThing } from "@/lib/uploadthing";
import { UpdateUserProfileValues } from "@/lib/validation";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "./actions"; // Ensure this updates Prisma DB

export function useUpdateProfileMutation() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { startUpload: startAvatarUpload } = useUploadThing("avatar");

  const mutation = useMutation({
    mutationFn: async ({
      values,
      avatar,
    }: {
      values: UpdateUserProfileValues;
      avatar?: File;
    }) => {
      const uploadResult = avatar ? await startAvatarUpload([avatar]) : null;
      const avatarUrl = uploadResult?.[0]?.serverData?.avatarUrl || "";

      return updateUserProfile({ ...values, avatarUrl });
    },
    onSuccess: async (updatedUser) => {
      const queryFilter = { queryKey: ["post-feed"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData(queryFilter, (oldData: InfiniteData<PostsPage, string | null>) => {
        if (!oldData) return;

        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) => ({
            nextCursor: page.nextCursor,
            posts: page.posts.map((post) => {
              if (post.user.id === updatedUser.id) {
                return {
                  ...post,
                  user: {
                    ...updatedUser,
                    avatarUrl: updatedUser.avatarUrl,
                  },
                };
              }
              return post;
            }),
          })),
        };
      });

      router.refresh();

      toast({ description: "Profile updated" });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to update profile. Please try again.",
      });
    },
  });

  return mutation;
}
