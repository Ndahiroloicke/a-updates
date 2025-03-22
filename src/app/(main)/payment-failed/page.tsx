"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PaymentFailed = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen p-4">
      <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-6">
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
        Payment Failed
      </h1>

      <p className="text-lg text-gray-600 text-center">
        Your payment could not be processed. Please try again.
      </p>

      <p className="mt-6 text-gray-500 text-sm text-center">
        Redirecting to home page in 5 seconds...
      </p>
    </div>
  );
};

export default PaymentFailed; 