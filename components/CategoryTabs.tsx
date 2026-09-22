'use client';

import React from 'react';
import { Heart, Film, Sparkles, Layers, Image as ImageIcon } from 'lucide-react';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  favoritesCount?: number;
  videosCount?: number;
  imagesCount?: number;
}

export default function CategoryTabs({
  categories,
  activeCategory,
  onSelectCategory,
  favoritesCount = 0,
  videosCount = 0,
  imagesCount = 0,
}: CategoryTabsProps) {
  const getIcon = (cat: string) => {
    if (cat === 'Favorites') return <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />;
    if (cat === 'Videos') return <Film className="w-3.5 h-3.5 text-blue-500" />;
    if (cat === 'Images' || cat === 'Photos') return <ImageIcon className="w-3.5 h-3.5 text-rose-500" />;
    if (cat === 'All') return <Layers className="w-3.5 h-3.5" />;
    return <Sparkles className="w-3.5 h-3.5 text-pink-400" />;
  };

  const getBadge = (cat: string) => {
    if ((cat === 'Images' || cat === 'Photos') && imagesCount > 0) return imagesCount;
    if (cat === 'Favorites' && favoritesCount > 0) return favoritesCount;
    if (cat === 'Videos' && videosCount > 0) return videosCount;
    return null;
  };

  return (
    <div className="w-full overflow-x-auto py-2 px-4 no-scrollbar">
      <div className="flex items-center justify-center gap-2 min-w-max mx-auto">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const badge = getBadge(cat);

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-105'
                  : 'bg-white/80 hover:bg-white text-stone-600 hover:text-stone-900 border border-stone-200/60 shadow-sm'
              }`}
            >
              {getIcon(cat)}
              <span>{cat}</span>
              {badge !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

