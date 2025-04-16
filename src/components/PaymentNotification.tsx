"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";

export default function PaymentNotification() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get('payment_success');
  const paymentCanceled = searchParams.get('payment_canceled');

  useEffect(() => {
    if (paymentSuccess === 'true') {
      toast({
        title: "Payment Successful",
        description: "Your advertisement has been successfully submitted and will be reviewed shortly.",
        duration: 5000,
      });
    } else if (paymentCanceled === 'true') {
      toast({
        title: "Payment Canceled",
        description: "Your advertisement payment was canceled. You can try again anytime.",
        duration: 5000,
        variant: "destructive",
      });
    }
  }, [paymentSuccess, paymentCanceled, toast]);

  return null;
} 