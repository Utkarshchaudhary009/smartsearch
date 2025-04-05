'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin dashboard error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 flex flex-col items-center justify-center min-h-[60vh]">
      <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Something went wrong
      </h2>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8 text-center max-w-lg">
        We encountered an error while loading the admin dashboard. 
        Please try again or contact support if the problem persists.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={reset}
          className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
        >
          Try again
        </button>
        
        <Link
          href="/"
          className="px-6 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition text-center"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}