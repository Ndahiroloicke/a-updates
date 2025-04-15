"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const type = searchParams.get('type');

  useEffect(() => {
    // Store the payment session
    const storePaymentSession = async () => {
      try {
        await fetch('/api/payment/store-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
          }),
        });

        // Redirect based on payment type
        if (type === 'advertiser') {
          router.push('/upload-ad');
        } else {
          router.push('/posts/create');
        }
      } catch (error) {
        console.error('Error storing payment session:', error);
      }
    };

    if (sessionId) {
      storePaymentSession();
    }
  }, [sessionId, type, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-16 h-16 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
        Payment Successful!
      </h1>

      <p className="text-lg text-gray-600 text-center">
        Your payment has been successfully processed.
      </p>

      <p className="mt-6 text-gray-500 text-sm text-center">
        Redirecting you to {type === 'advertiser' ? 'upload your ad' : 'create your post'}...
      </p>
    </div>
  );
} 