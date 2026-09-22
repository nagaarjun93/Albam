'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { IPhoto } from '@/lib/types';
import { parseVideoUrl } from '@/lib/mediaUtils';
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
  Lock,
  Unlock,
  Film,
  Link2,
  ExternalLink,
  Check,
  AlertCircle,
} from 'lucide-react';

interface LightboxModalProps {
  photo: IPhoto | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onDeletePhoto: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onTogglePrivate?: (id: string, current: boolean) => void;
  onUpdateUrl?: (id: string, newUrl: string) => Promise<void> | void;
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
  onTogglePrivate,
  onUpdateUrl,
  currentIndex,
  totalCount,
}: LightboxModalProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Link Editor State
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [customLink, setCustomLink] = useState('');
  const [isSavingLink, setIsSavingLink] = useState(false);
  const [linkSavedSuccess, setLinkSavedSuccess] = useState(false);

  useEffect(() => {
    if (photo) {
      setNoteText(photo.notes || '');
      setIsEditingNote(false);
      setVideoError(false);
      setIsEditingLink(false);
      setLinkSavedSuccess(false);
      // Prepopulate custom link if it is not a local /api/media url
      if (photo.url && !photo.url.startsWith('/api/media/')) {
        setCustomLink(photo.url);
      } else {
        setCustomLink('');
      }
    }
  }, [photo]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditingLink) {
          setIsEditingLink(false);
        } else {
          onClose();
        }
      }
      if (!isEditingNote && !isEditingLink) {
        if (e.key === 'ArrowRight') onNext();
        if (e.key === 'ArrowLeft') onPrev();
      }
    },
    [onClose, onNext, onPrev, isEditingNote, isEditingLink]
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
    if (!touchStart || !touchEnd || isEditingLink) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) onNext();
    if (isRightSwipe) onPrev();
  };

  const isVideo = photo.mediaType === 'video';
  const videoInfo = isVideo ? parseVideoUrl(photo.url) : null;

  const handleSaveNote = async () => {
    if (!photo._id) return;
    setIsSavingNote(true);
    await onUpdateNote(photo._id, noteText);
    setIsSavingNote(false);
    setIsEditingNote(false);
  };

  const handleSaveLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!photo._id || !customLink.trim() || !onUpdateUrl) return;

    setIsSavingLink(true);
    try {
      await onUpdateUrl(photo._id, customLink.trim());
      setVideoError(false);
      setLinkSavedSuccess(true);
      setTimeout(() => {
        setIsEditingLink(false);
        setLinkSavedSuccess(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to save link:', err);
    } finally {
      setIsSavingLink(false);
    }
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
      className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xl flex flex-col justify-between animate-fade-in select-none"
      onTouchStart={onTouchStartHandler}
      onTouchMove={onTouchMoveHandler}
      onTouchEnd={onTouchEndHandler}
    >
      {/* Top action bar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3.5 text-white/80 z-20">
        <div className="flex items-center gap-2">
          <div className="text-xs sm:text-sm font-medium tracking-wide text-rose-300">
            Memory {currentIndex + 1} of {totalCount}
          </div>

          {/* Quick link button for videos */}
          {isVideo && onUpdateUrl && (
            <button
              onClick={() => setIsEditingLink(true)}
              className="px-2.5 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-medium flex items-center gap-1 transition-colors"
              title="Add or Change Video Link (Google Drive / YouTube / Cloud)"
            >
              <Link2 className="w-3 h-3 text-rose-400" />
              <span>Link Video</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Favorite button */}
          <button
            onClick={() => photo._id && onToggleFavorite(photo._id, photo.isFavorite)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Heart memory"
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                photo.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
              }`}
            />
          </button>

          {/* Secret Vault Lock / Unlock toggle button */}
          {onTogglePrivate && (
            <button
              onClick={() => photo._id && onTogglePrivate(photo._id, !!photo.isPrivate)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                photo.isPrivate
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={photo.isPrivate ? 'Unhide / Move to Public Album' : 'Move to Secret Private Vault'}
            >
              {photo.isPrivate ? (
                <Unlock className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Download full quality"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>

          {/* Delete button */}
          <button
            onClick={() => {
              if (photo._id && confirm('Are you sure you want to delete this memory?')) {
                onDeletePhoto(photo._id);
                onClose();
              }
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors text-red-400"
            title="Delete photo"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors ml-1"
            title="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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

        {/* Media Container */}
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          {isVideo && videoInfo ? (
            <div className="relative flex flex-col items-center justify-center w-full max-w-4xl">
              {/* 1. Google Drive Player */}
              {videoInfo.type === 'gdrive' && (
                <div className="w-[94vw] max-w-4xl h-[65vh] sm:h-[75vh] relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                  <iframe
                    src={videoInfo.embedUrl}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                </div>
              )}

              {/* 2. YouTube Player */}
              {videoInfo.type === 'youtube' && (
                <div className="w-[94vw] max-w-4xl h-[55vh] sm:h-[70vh] relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                  <iframe
                    src={videoInfo.embedUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* 3. Direct or Local Video */}
              {(videoInfo.type === 'direct' || videoInfo.type === 'local') && (
                <>
                  {!videoError ? (
                    <video
                      src={photo.url}
                      controls
                      autoPlay
                      playsInline
                      onError={() => setVideoError(true)}
                      className="max-h-[75vh] max-w-[95vw] rounded-lg shadow-2xl object-contain"
                    />
                  ) : (
                    /* Fallback when video is stored locally on G:\MY */
                    <div className="max-w-md w-full mx-auto p-6 sm:p-7 rounded-2xl bg-stone-900/95 border border-rose-500/30 text-center flex flex-col items-center backdrop-blur-md shadow-2xl animate-scale-up">
                      <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-3">
                        <Film className="w-7 h-7 text-rose-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-serif font-bold text-white mb-1">
                        {photo.title || 'Video Memory'}
                      </h3>
                      <p className="text-xs text-rose-200/90 mb-4 leading-relaxed">
                        This video file is safely saved on your local computer ({photo.fileName || 'G:\\MY'}).
                      </p>

                      {/* Prominent Add Link Button */}
                      {onUpdateUrl ? (
                        <button
                          onClick={() => setIsEditingLink(true)}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.02] mb-3"
                        >
                          <Link2 className="w-4 h-4" />
                          <span>Link to Google Drive or YouTube</span>
                        </button>
                      ) : null}

                      <div className="text-[11px] text-stone-300 bg-black/40 rounded-xl p-3 border border-white/5 space-y-1.5 text-left w-full">
                        <p className="font-semibold text-rose-300 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                          How to play on mobile / cloud:
                        </p>
                        <p>
                          1. <strong>Google Drive:</strong> Upload video to Drive &rarr; Share (Anyone with link) &rarr; Paste link here.
                        </p>
                        <p>
                          2. <strong>YouTube:</strong> Upload as Unlisted &rarr; Paste link here.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <img
              src={photo.url}
              alt={photo.title || 'Memory'}
              className="max-h-[75vh] max-w-[95vw] rounded-lg shadow-2xl object-contain animate-scale-up"
            />
          )}
        </div>
      </div>

      {/* Video Link Connect Modal / Popover */}
      {isEditingLink && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-stone-900 border border-rose-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl text-white animate-scale-up">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-rose-400" />
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg">
                  Link Video Stream
                </h3>
              </div>
              <button
                onClick={() => setIsEditingLink(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 mb-3">
              Google Drive, YouTube, அல்லது direct cloud video link-ஐ paste செய்யவும். உடனே இந்த வீடியோ போனில் play ஆகும்!
            </p>

            <form onSubmit={handleSaveLink} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-rose-300 mb-1">
                  Video URL / Link:
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/... or https://youtu.be/..."
                  value={customLink}
                  onChange={(e) => setCustomLink(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder-stone-500"
                />
              </div>

              <div className="bg-black/40 rounded-xl p-3 border border-white/5 text-[11px] text-stone-400 space-y-1">
                <p className="text-rose-300 font-semibold">Supported Links:</p>
                <p>• <strong>Google Drive:</strong> Share &rarr; General Access: <em>Anyone with the link</em></p>
                <p>• <strong>YouTube:</strong> Unlisted or public video link</p>
                <p>• <strong>Direct Video:</strong> Cloudinary, Supabase, Dropbox, .mp4 URL</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingLink(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-stone-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingLink || !customLink.trim()}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-rose-500/25 transition-all"
                >
                  {isSavingLink ? (
                    'Saving...'
                  ) : linkSavedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" /> Saved!
                    </>
                  ) : (
                    'Save & Play Video'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom details & love note bar */}
      <div className="bg-black/75 backdrop-blur-xl border-t border-white/10 p-3.5 sm:px-8 sm:py-4 text-white z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-base sm:text-lg font-serif font-bold text-white truncate">
                {photo.title || 'Cherished Memory'}
              </h2>
              {photo.category && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {photo.category}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-[11px] text-white/60 mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-rose-400" />
                {photo.date || 'Memorable Day'}
              </span>
              {photo.fileName && (
                <span className="truncate max-w-[150px] text-white/40">
                  {photo.fileName}
                </span>
              )}
              {photo.url && !photo.url.startsWith('/api/media/') && (
                <a
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Link</span>
                </a>
              )}
            </div>

            {/* Note display or edit */}
            {isEditingNote ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write a sweet note for this memory..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-rose-400"
                />
                <button
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Save className="w-3 h-3" /> {isSavingNote ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                {photo.notes ? (
                  <p className="text-rose-200 italic line-clamp-2">💌 &ldquo;{photo.notes}&rdquo;</p>
                ) : (
                  <p className="text-white/40 italic">No love note attached yet...</p>
                )}
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="text-white/40 hover:text-rose-300 p-1 transition-colors"
                  title="Edit note"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
