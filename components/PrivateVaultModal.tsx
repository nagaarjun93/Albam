'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { IPhoto } from '@/lib/types';
import PhotoCard from './PhotoCard';
import LightboxModal from './LightboxModal';
import {
  Lock,
  Unlock,
  X,
  Sparkles,
  Heart,
  Delete,
  RotateCcw,
  Loader2,
  ShieldCheck,
  Plus,
} from 'lucide-react';

interface PrivateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUploadPrivate: () => void;
  onRefreshPublicPhotos: () => void;
}

export default function PrivateVaultModal({
  isOpen,
  onClose,
  onOpenUploadPrivate,
  onRefreshPublicPhotos,
}: PrivateVaultModalProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePhoto, setActivePhoto] = useState<IPhoto | null>(null);

  const correctPin =
    process.env.NEXT_PUBLIC_PRIVATE_VAULT_PIN ||
    process.env.NEXT_PUBLIC_PRIVATE_PIN ||
    '0702';

  // Fetch private photos
  const fetchPrivatePhotos = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/photos?isPrivate=true&limit=1000');
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch (err) {
      console.error('Failed to load private photos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && isUnlocked) {
      fetchPrivatePhotos();
    }
  }, [isOpen, isUnlocked, fetchPrivatePhotos]);

  // Reset lock when closed
  useEffect(() => {
    if (!isOpen) {
      setIsUnlocked(false);
      setPin('');
      setError(false);
      setActivePhoto(null);
    }
  }, [isOpen]);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        if (newPin === correctPin) {
          setIsUnlocked(true);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 700);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  // Keyboard typing support
  useEffect(() => {
    if (!isOpen || isUnlocked) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isUnlocked, pin]);

  // Unhide a photo (move back to public)
  const handleUnhidePhoto = async (id: string) => {
    setPhotos((prev) => prev.filter((p) => p._id !== id));
    try {
      await fetch(`/api/photos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrivate: false }),
      });
      onRefreshPublicPhotos();
      if (activePhoto && activePhoto._id === id) {
        setActivePhoto(null);
      }
    } catch (err) {
      console.error('Failed to unhide photo:', err);
    }
  };

  // Toggle favorite inside vault
  const handleToggleFavorite = async (id: string, current: boolean) => {
    const newStatus = !current;
    setPhotos((prev) =>
      prev.map((p) => (p._id === id ? { ...p, isFavorite: newStatus } : p))
    );
    try {
      await fetch(`/api/photos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update favorite:', err);
    }
  };

  // Delete photo inside vault
  const handleDeletePhoto = async (id: string) => {
    setPhotos((prev) => prev.filter((p) => p._id !== id));
    try {
      await fetch(`/api/photos/${id}`, {
        method: 'DELETE',
      });
      onRefreshPublicPhotos();
    } catch (err) {
      console.error('Failed to delete photo:', err);
    }
  };

  // Update note
  const handleUpdateNote = async (id: string, note: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p._id === id ? { ...p, notes: note } : p))
    );
    try {
      await fetch(`/api/photos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: note }),
      });
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  };

  if (!isOpen) return null;

  // STEP 1: Secret 4-digit PIN verification screen (0702)
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
        <div className="max-w-xs sm:max-w-sm w-full bg-stone-900/90 text-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-rose-500/30 relative animate-scale-up">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Secret Shield Lock */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-600/30">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-1">
            Secret Private Vault
          </h2>
          <p className="text-xs text-stone-400 mb-6 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Enter 4-digit Private PIN</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </p>

          {/* 4 PIN Dots */}
          <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-red-500 animate-bounce'
                    : pin.length > idx
                    ? 'bg-rose-500 scale-125 shadow-md shadow-rose-500/50'
                    : 'bg-stone-700 border border-stone-600'
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs text-red-400 font-medium -mt-4 mb-4">
              Incorrect Private PIN. Try again 🔒
            </p>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-[240px] mx-auto mb-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handleDigit(num)}
                className="h-12 sm:h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-rose-500/30 border border-white/10 text-white text-lg font-semibold shadow-sm transition-all active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="h-12 sm:h-14 rounded-2xl bg-white/5 hover:bg-white/15 text-stone-400 hover:text-white text-xs font-semibold flex items-center justify-center transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="h-12 sm:h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-rose-500/30 border border-white/10 text-white text-lg font-semibold shadow-sm transition-all active:scale-95"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-12 sm:h-14 rounded-2xl bg-white/5 hover:bg-white/15 text-stone-400 hover:text-white text-xs font-semibold flex items-center justify-center transition-all active:scale-95"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[10px] text-stone-500 mt-2">
            Top Secret Memories for Your Eyes Only
          </p>
        </div>
      </div>
    );
  }

  // STEP 2: Secret Private Vault Gallery Screen
  const currentPhotoIndex = activePhoto
    ? photos.findIndex((p) => p._id === activePhoto._id)
    : -1;

  const handleNextPhoto = () => {
    if (currentPhotoIndex !== -1 && currentPhotoIndex < photos.length - 1) {
      setActivePhoto(photos[currentPhotoIndex + 1]);
    } else if (photos.length > 0) {
      setActivePhoto(photos[0]);
    }
  };

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setActivePhoto(photos[currentPhotoIndex - 1]);
    } else if (photos.length > 0) {
      setActivePhoto(photos[photos.length - 1]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col justify-between overflow-y-auto animate-fade-in text-white">
      {/* Vault Header Bar */}
      <div className="sticky top-0 z-40 bg-stone-900/90 border-b border-rose-500/20 px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-500/10">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-xl font-serif font-bold text-white">
                Secret Private Vault
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold">
                PIN: 0702
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              {photos.length} hidden {photos.length === 1 ? 'memory' : 'memories'} stored safely
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Upload directly to vault */}
          <button
            onClick={() => {
              onClose();
              onOpenUploadPrivate();
            }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-semibold shadow-md shadow-rose-500/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Private Photo</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* Close & Lock Vault */}
          <button
            onClick={onClose}
            className="p-2 sm:px-3 sm:py-2 rounded-full bg-white/10 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-stone-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Lock Vault and Exit"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Lock & Exit</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1920px] mx-auto w-full px-3 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-rose-400">
            <Loader2 className="w-10 h-10 animate-spin mb-3" />
            <p className="text-sm font-medium text-stone-300">
              Opening secret vault...
            </p>
          </div>
        ) : photos.length === 0 ? (
          <div className="py-20 text-center bg-stone-900/60 rounded-3xl p-8 max-w-md mx-auto border border-stone-800">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white mb-1">
              Vault is Empty
            </h3>
            <p className="text-xs text-stone-400 mb-6">
              No private photos or videos yet. You can upload new private memories or lock any existing photo from the main album into this vault!
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenUploadPrivate();
              }}
              className="px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/25"
            >
              Add First Private Memory
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {photos.map((photo, index) => (
                <div key={photo._id || index} className="relative group">
                  <PhotoCard
                    photo={photo}
                    onOpen={setActivePhoto}
                    onToggleFavorite={handleToggleFavorite}
                  />
                  {/* Unhide badge button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (photo._id && confirm('Move this memory back to public album?')) {
                        handleUnhidePhoto(photo._id);
                      }
                    }}
                    className="absolute bottom-12 right-2 z-20 bg-stone-900/90 hover:bg-rose-600 text-stone-300 hover:text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-md border border-stone-700 transition-all opacity-0 group-hover:opacity-100"
                    title="Unhide / Move to Public Album"
                  >
                    <Unlock className="w-3 h-3" />
                    <span>Unhide</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal inside Vault */}
      <LightboxModal
        photo={activePhoto}
        onClose={() => setActivePhoto(null)}
        onNext={handleNextPhoto}
        onPrev={handlePrevPhoto}
        onToggleFavorite={handleToggleFavorite}
        onDeletePhoto={handleDeletePhoto}
        onUpdateNote={handleUpdateNote}
        onTogglePrivate={async (id, current) => {
          await handleUnhidePhoto(id);
          setActivePhoto(null);
        }}
        currentIndex={currentPhotoIndex}
        totalCount={photos.length}
      />
    </div>
  );
}

