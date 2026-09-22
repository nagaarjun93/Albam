'use client';

import React, { useState } from 'react';
import { IPhoto } from '@/lib/types';
import { Heart, Play, Calendar, Eye } from 'lucide-react';

interface PhotoCardProps {
  photo: IPhoto;
  onOpen: (photo: IPhoto) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
}

export default function PhotoCard({ photo, onOpen, onToggleFavorite }: PhotoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isVideo = photo.mediaType === 'video';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photo._id) {
      onToggleFavorite(photo._id, photo.isFavorite);
    }
  };

  // Format date display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const displayUrl = photo.thumbnailUrl || photo.url;

  return (
    <div
      onClick={() => onOpen(photo)}
      className="group relative rounded-2xl overflow-hidden bg-white/70 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 cursor-pointer border border-rose-100/50 flex flex-col justify-between"
    >
      {/* Media container */}
      <div className="relative w-full aspect-[4/5] sm:aspect-square overflow-hidden bg-stone-100">
        {/* Placeholder skeleton while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-50 to-pink-50 animate-pulse" />
        )}

        {isVideo ? (
          <div className="w-full h-full relative flex items-center justify-center bg-stone-900">
            <video
              src={photo.url}
              className="w-full h-full object-cover"
              preload="metadata"
              onLoadedData={() => setImageLoaded(true)}
            />
            {/* Play overlay button */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-all">
              <div className="w-12 h-12 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
            </div>
            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md font-medium tracking-wide">
              VIDEO
            </span>
          </div>
        ) : (
          <img
            src={displayUrl}
            alt={photo.title || 'Memory Photo'}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label="Favorite photo"
          className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center shadow-md text-stone-600 hover:text-rose-500 hover:scale-110 transition-all duration-200 z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              photo.isFavorite
                ? 'fill-rose-500 text-rose-500 animate-scale-up'
                : 'text-stone-600 hover:text-rose-500'
            }`}
          />
        </button>

        {/* Category Badge */}
        {photo.category && photo.category !== 'All' && (
          <span className="absolute top-2.5 left-2.5 bg-white/85 backdrop-blur-sm text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
            {photo.category}
          </span>
        )}

        {/* Quick view hover icon on desktop */}
        <div className="absolute inset-0 bg-rose-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/90 backdrop-blur-md text-rose-700 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" /> View Memory
          </span>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-3 bg-white/90">
        <h3 className="font-medium text-xs sm:text-sm text-stone-900 truncate">
          {photo.title || 'Special Moment'}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(photo.date)}</span>
          </div>
          {photo.notes && (
            <span className="text-rose-500 font-medium truncate max-w-[100px]">
              💌 Note
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

