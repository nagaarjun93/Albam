'use client';

import React from 'react';
import { Search, Sparkles, Heart } from 'lucide-react';

interface HeroBannerProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
}

export default function HeroBanner({
  searchQuery,
  onSearchChange,
  totalCount,
}: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden pt-8 pb-6 sm:pt-12 sm:pb-8 text-center px-4">
      {/* Decorative blurred glowing spots */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-pink-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 bg-rose-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Floating tag */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium mb-4 shadow-sm animate-float">
        <Sparkles className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        <span>For My Beloved Wife</span>
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight text-stone-900 mb-3 sm:mb-4">
        Every Moment With You Is A{' '}
        <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 bg-clip-text text-transparent italic">
          Treasure
        </span>
      </h1>

      <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-600 mb-6 font-normal">
        Capturing our timeless smiles, unforgettable adventures, and every sweet smile in between.
        {totalCount > 0 && ` Celebrating over ${totalCount.toLocaleString()} cherished memories.`}
      </p>

      {/* Search Input */}
      <div className="max-w-md mx-auto relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-stone-400 group-focus-within:text-rose-500 transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by year, month, caption or album..."
          className="w-full pl-11 pr-4 py-3 rounded-full bg-white/90 border border-rose-100 shadow-md shadow-rose-900/5 text-sm placeholder:text-stone-400 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 backdrop-blur-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-stone-400 hover:text-stone-600"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

