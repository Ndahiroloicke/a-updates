import { useToast } from "@/components/ui/use-toast";
import { useBecomePublisherMutation } from "./mutations";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoadingButton from "@/components/LoadingButton";
import { UserData } from "@/lib/types";

interface BecomePublisherDialogProps {
  user: UserData
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BecomePublisherDialog({
  user,
  open,
  onOpenChange,
}: BecomePublisherDialogProps) {
  const { toast } = useToast();
  const mutation = useBecomePublisherMutation();

  async function handleBecomePublisher() {
    mutation.mutate({ user }, {
      onSuccess: () => {
        onOpenChange(false);
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
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request to Become a Publisher</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[80vh] max-w-[40vw] overflow-y-auto">
          <p className="text-lg">
            Becoming a publisher on our platform comes with numerous benefits, but it also involves a commitment to maintaining
            high-quality content and adhering to our community guidelines. As a publisher, you will be responsible for creating,
            managing, and promoting content across the platform. You will have access to exclusive tools to enhance your content,
            gain insights into audience engagement, and be part of a vibrant community of creators.

            The process to become a publisher involves the following steps:
            <ul className="list-disc pl-5 mt-2">
              <li>Fill out the necessary profile information and submit your application.</li>
              <li>Your application will be reviewed by our team to ensure it meets our guidelines.</li>
              <li>If your application is approved, you will receive a confirmation notification, and your status will be updated to &quot; Publisher &quot; .</li>
              <li>If your application is rejected, we will notify you with an explanation and you will have the opportunity to reapply.</li>
            </ul>
          </p>

          <p className="mt-4 text-lg">
            As a publisher, you are expected to:
            <ul className="list-disc pl-5 mt-2">
              <li>Ensure that your content follows our community guidelines.</li>
              <li>Maintain a high standard of creativity and originality in your posts.</li>
              <li>Engage with your audience in a positive and professional manner.</li>
              <li>Keep your profile up to date, including your bio and contact information.</li>
            </ul>
          </p>

          <p className="mt-4 text-lg">
            If you&apos;re ready to take the next step and become a publisher, click the &quot; Become Publisher &quot; button below to submit your request.
          </p>
        </div>
        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="mr-3 text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <LoadingButton onClick={handleBecomePublisher} loading={mutation.isPending}>
            Become Publisher
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
