'use client';

import React, { useState } from 'react';
import { IPhoto } from '@/lib/types';
import { Heart, Play, Calendar, Eye, Film } from 'lucide-react';

interface PhotoCardProps {
  photo: IPhoto;
  onOpen: (photo: IPhoto) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
}

export default function PhotoCard({ photo, onOpen, onToggleFavorite }: PhotoCardProps) {
  const displayUrl = photo.thumbnailUrl || photo.url;
  const isVideo = photo.mediaType === 'video';
  const hasImageThumbnail = !!(
    displayUrl &&
    (displayUrl.startsWith('data:image') ||
      displayUrl.startsWith('http://') ||
      displayUrl.startsWith('https://'))
  );
  const isDataUri = !!(displayUrl && displayUrl.startsWith('data:'));

  // If it's a video or data URI, mark loaded immediately to avoid skeleton hanging
  const [imageLoaded, setImageLoaded] = useState(isVideo || isDataUri);
  const [hasError, setHasError] = useState(false);

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

  return (
    <div
      onClick={() => onOpen(photo)}
      className="group relative rounded-2xl overflow-hidden bg-white/70 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 cursor-pointer border border-rose-100/50 flex flex-col justify-between"
    >
      {/* Media container */}
      <div className="relative w-full aspect-[4/5] sm:aspect-square overflow-hidden bg-stone-100">
        {/* Placeholder skeleton while loading */}
        {!imageLoaded && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-50 to-pink-50 animate-pulse" />
        )}

        {isVideo ? (
          hasImageThumbnail ? (
            /* Video with image thumbnail */
            <div className="w-full h-full relative">
              <img
                src={displayUrl}
                alt={photo.title || 'Video Memory'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/15 transition-all">
                <div className="w-12 h-12 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-medium tracking-wide flex items-center gap-1">
                <Film className="w-3 h-3 text-rose-400" /> VIDEO
              </span>
            </div>
          ) : (
            /* Video without local file: Romantic card display (never freezes mobile browser) */
            <div className="w-full h-full relative flex flex-col items-center justify-center p-4 bg-gradient-to-br from-stone-900 via-rose-950/70 to-stone-900 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="w-13 h-13 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform mb-2 z-10">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>

              <p className="text-white/90 text-xs font-medium text-center line-clamp-1 z-10 px-2">
                {photo.title || 'Video Memory'}
              </p>

              <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-rose-300 text-[10px] px-2 py-0.5 rounded-md font-medium tracking-wide flex items-center gap-1">
                <Film className="w-3 h-3 text-rose-400" /> VIDEO
              </span>
            </div>
          )
        ) : (
          /* Normal Image */
          <img
            src={displayUrl}
            alt={photo.title || 'Memory Photo'}
            loading={isDataUri ? undefined : 'lazy'}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(true);
              setHasError(true);
            }}
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
          <span className="absolute top-2.5 left-2.5 bg-white/85 backdrop-blur-sm text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm z-10">
            {photo.category}
          </span>
        )}

        {/* Quick view hover icon on desktop */}
        <div className="absolute inset-0 bg-rose-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10">
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
