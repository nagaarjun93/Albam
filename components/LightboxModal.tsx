'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { IPhoto } from '@/lib/types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  Download,
  Trash2,
  Edit3,
  Save,
  Tag,
} from 'lucide-react';

interface LightboxModalProps {
  photo: IPhoto | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onDeletePhoto: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  currentIndex: number;
  totalCount: number;
}

export default function LightboxModal({
  photo,
  onClose,
  onNext,
  onPrev,
  onToggleFavorite,
  onDeletePhoto,
  onUpdateNote,
  currentIndex,
  totalCount,
}: LightboxModalProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    if (photo) {
      setNoteText(photo.notes || '');
      setIsEditingNote(false);
    }
  }, [photo]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    },
    [onClose, onNext, onPrev]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!photo) return null;

  // Touch swipe handling for mobile
  const minSwipeDistance = 50;

  const onTouchStartHandler = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMoveHandler = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) onNext();
    if (isRightSwipe) onPrev();
  };

  const isVideo = photo.mediaType === 'video';

  const handleSaveNote = async () => {
    if (!photo._id) return;
    setIsSavingNote(true);
    await onUpdateNote(photo._id, noteText);
    setIsSavingNote(false);
    setIsEditingNote(false);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = photo.fileName || `memory_${Date.now()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col justify-between animate-fade-in select-none"
      onTouchStart={onTouchStartHandler}
      onTouchMove={onTouchMoveHandler}
      onTouchEnd={onTouchEndHandler}
    >
      {/* Top action bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-white/80 z-10">
        <div className="text-xs sm:text-sm font-medium tracking-wide text-rose-300">
          Memory {currentIndex + 1} of {totalCount}
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite button */}
          <button
            onClick={() => photo._id && onToggleFavorite(photo._id, photo.isFavorite)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Heart memory"
          >
            <Heart
              className={`w-5 h-5 ${
                photo.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
              }`}
            />
          </button>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Download full quality"
          >
            <Download className="w-5 h-5 text-white" />
          </button>

          {/* Delete button */}
          <button
            onClick={() => {
              if (photo._id && confirm('Are you sure you want to delete this memory?')) {
                onDeletePhoto(photo._id);
                onClose();
              }
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors text-red-400"
            title="Delete photo"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors ml-2"
            title="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Main media display area */}
      <div className="relative flex-1 flex items-center justify-center px-2 sm:px-12 overflow-hidden">
        {/* Navigation arrows (desktop) */}
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 z-20 hidden sm:flex"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 z-20 hidden sm:flex"
          aria-label="Next photo"
        >
          <ChevronRight className="w-7 h-7" />
        </button>

        {/* Media */}
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          {isVideo ? (
            <video
              src={photo.url}
              controls
              autoPlay
              playsInline
              className="max-h-[75vh] max-w-[95vw] rounded-lg shadow-2xl object-contain"
            />
          ) : (
            <img
              src={photo.url}
              alt={photo.title || 'Memory'}
              className="max-h-[75vh] max-w-[95vw] rounded-lg shadow-2xl object-contain animate-scale-up"
            />
          )}
        </div>
      </div>

      {/* Bottom details & love note bar */}
      <div className="bg-black/70 backdrop-blur-xl border-t border-white/10 p-4 sm:px-8 sm:py-5 text-white z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white">
                {photo.title || 'Cherished Memory'}
              </h2>
              {photo.category && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {photo.category}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-white/60 mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                {photo.date || 'Memorable Day'}
              </span>
              {photo.fileName && (
                <span className="truncate max-w-[150px] text-white/40">
                  {photo.fileName}
                </span>
              )}
            </div>

            {/* Note display / editor */}
            {isEditingNote ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write a sweet note or memory for her..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-rose-400"
                />
                <button
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs flex items-center gap-1 font-medium"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingNote ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingNote(true)}
                className="group inline-flex items-center gap-1.5 text-xs text-rose-200/90 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1 rounded-lg border border-rose-500/20 cursor-pointer transition-colors"
              >
                <Edit3 className="w-3 h-3 text-rose-400" />
                <span>
                  {photo.notes
                    ? `💌 "${photo.notes}"`
                    : 'Click to add a sweet love note for her...'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

