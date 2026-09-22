'use client';

import React from 'react';
import { Heart, Plus, Sparkles, Film, Image as ImageIcon } from 'lucide-react';

interface NavbarProps {
  onOpenUpload: () => void;
  stats: {
    total: number;
    imagesCount: number;
    videosCount: number;
    favoritesCount: number;
  } | null;
  onSelectCategory: (cat: string) => void;
  currentCategory: string;
}

export default function Navbar({
  onOpenUpload,
  stats,
  onSelectCategory,
  currentCategory,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-rose-100/50 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo / Title */}
        <div 
          onClick={() => onSelectCategory('All')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform duration-300">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg sm:text-2xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 bg-clip-text text-transparent">
                Our Memories
              </span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-rose-500/80 font-medium hidden sm:block">
              Naga Arjun & Wife • Forever & Always
            </p>
          </div>
        </div>

        {/* Live Counters */}
        {stats && (
          <div className="hidden md:flex items-center gap-2 bg-rose-50/70 border border-rose-100 rounded-full px-4 py-1.5 text-xs text-rose-800">
            <button 
              onClick={() => onSelectCategory('All')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
                currentCategory === 'All' ? 'bg-rose-500 text-white shadow-sm' : 'hover:bg-rose-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{stats.total} All</span>
            </button>
            <span className="text-rose-300">•</span>
            <button 
              onClick={() => onSelectCategory('Images')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
                currentCategory === 'Images' ? 'bg-rose-500 text-white shadow-sm' : 'hover:bg-rose-100'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{stats.imagesCount} Images</span>
            </button>
            <span className="text-rose-300">•</span>
            <button 
              onClick={() => onSelectCategory('Videos')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
                currentCategory === 'Videos' ? 'bg-rose-500 text-white shadow-sm' : 'hover:bg-rose-100'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>{stats.videosCount} Videos</span>
            </button>
            <span className="text-rose-300">•</span>
            <button 
              onClick={() => onSelectCategory('Favorites')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
                currentCategory === 'Favorites' ? 'bg-rose-500 text-white shadow-sm' : 'hover:bg-rose-100'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>{stats.favoritesCount} Loved</span>
            </button>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs sm:text-sm shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>
    </header>
  );
}

