import {
  useMutation,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import prisma from "@/lib/prisma";
import { useToast } from "../ui/use-toast";
import { UserData } from "@/lib/types";
import { becomePublisher } from "./actions";

export function useBecomePublisherMutation() {
  const router = useRouter();
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: async ({ user }: { user: UserData }) => {
      return Promise.all([
        becomePublisher(),
      ]);
    },
    onSuccess: () => {
      router.refresh()
      toast({
        description: "You have successfully submitted your publisher request. We will review it shortly.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: `Failed to submit request. Please try again. Error: ${error.message}`,
      });
    },
  });
  return mutation;
}


