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
import { useSession } from "./SessionProvider";

interface ReminderPublisherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayNow: () => void; // Callback for "Pay Now" action
  onDoItLater: () => void; // Callback for "I'll Do It Later" action
}

export default function ReminderPublisherDialog({
  open,
  onOpenChange,
  onPayNow,
  onDoItLater,
}: ReminderPublisherDialogProps) {
  const { toast } = useToast();

  const {user} = useSession();

  const handlePayment = async () => {
    const response = await fetch("/api/payment/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }), // Pass the user's ID
    });
  
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url; // Redirect to Stripe Checkout
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reminder to Post as a Publisher</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[80vh] max-w-[40vw] overflow-y-auto">
          <p className="text-lg">
            To post as a publisher, you must pay. Please complete the payment to
            proceed.
          </p>

          {/* Additional Information Section */}
          <div className="border rounded-lg p-4">
            <p className="text-sm">
              <strong>Note:</strong> Payment is required to unlock publisher
              features.
            </p>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => {
              onDoItLater();
              onOpenChange(false);
              toast({
                description: "You can complete the payment later.",
              });
            }}
            className="mr-3 text-gray-500 hover:text-gray-700"
          >
            I will Do It Later
          </button>
          <LoadingButton
            onClick={() => {
            handlePayment();
              onPayNow();
              onOpenChange(false);
              toast({
                description: "Redirecting to payment page...",
              });
            }}
            loading={false} // Set to true if payment processing is in progress
          >
            Pay Now
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}