'use client';

import React from 'react';
import { Heart, RefreshCw } from 'lucide-react';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen romantic-bg flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full glass rounded-3xl p-8 border border-rose-200/80 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 fill-rose-500 animate-pulse" />
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-800 mb-2">
          Something went wrong
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          {error.message || 'An unexpected error occurred while loading memories.'}
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold shadow-md flex items-center gap-2 mx-auto hover:opacity-95 transition-opacity"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}

