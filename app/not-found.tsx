import React from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen romantic-bg flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full glass rounded-3xl p-8 border border-rose-200/80 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 fill-rose-500" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
          Memory Not Found
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          The page or memory you are looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-500 text-white text-xs font-semibold shadow-md hover:bg-rose-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Our Album</span>
        </Link>
      </div>
    </div>
  );
}

