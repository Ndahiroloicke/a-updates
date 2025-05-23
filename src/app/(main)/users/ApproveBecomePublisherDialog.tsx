  import { useState } from "react";
  import { useToast } from "@/components/ui/use-toast";
  import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import LoadingButton from "@/components/LoadingButton";
  import { PublisherRequest } from "@prisma/client";
  import { useApproveBecomePublisherMutation } from "./mutations";
  import { UserData } from "@/lib/types";

  interface ApproveBecomePublisherDialogProps {
    request: PublisherRequest & {
      user: UserData;
    };
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  export default function ApproveBecomePublisherDialog({
    request,
    open,
    onOpenChange,
  }: ApproveBecomePublisherDialogProps) {
    const { toast } = useToast();
    const mutation = useApproveBecomePublisherMutation();

    // Default message
    const defaultMessage = "Your application has been processed.";
    const [message, setMessage] = useState(defaultMessage);
    const [isEditing, setIsEditing] = useState(false);

    async function handleAction(action: "approve" | "reject") {
      mutation.mutate(
        { request, action, message }, // Ensure message is included
        {
          onSuccess: () => {
            onOpenChange(false);
            toast({
              description: `The request has been successfully ${
                action === "approve" ? "approved" : "rejected"
              } with message: "${message}".`,
            });
          },
          onError: (error) => {
            toast({
              variant: "destructive",
              description: `Failed to ${action} the request. Please try again. Error: ${error.message}`,
            });
          },
        }
      );
    }
    

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>  
            <DialogTitle>Approve or Reject Publisher Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[80vh] max-w-[40vw] overflow-y-auto">
            <p className="text-lg">
              Are you sure you want to process the following request?
            </p>

            <div className="border rounded-lg p-4">
              <p className="text-sm">
                <strong>User:</strong> {request.user.displayName || "Unknown"}
              </p>
              <p className="text-sm">
                <strong>Requested At:</strong>{" "}
                {new Date(request.requestedAt).toLocaleString()}
              </p>
              <p className="text-sm">
                <strong>Status:</strong>{" "}
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </p>
            </div>

            {/* Message Section */}
            <div className="border rounded-lg p-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isEditing}
                  onChange={(e) => setIsEditing(e.target.checked)}
                />
                <span>Edit Message</span>
              </label>
              <textarea
                className="w-full p-2 border rounded mt-2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                readOnly={!isEditing}
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => onOpenChange(false)}
              className="mr-3 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <LoadingButton  
              onClick={() => handleAction("reject")}
              loading={mutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              Reject
            </LoadingButton>
            <LoadingButton
              onClick={() => handleAction("approve")}
              loading={mutation.isPending}
            >
              Approve
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
