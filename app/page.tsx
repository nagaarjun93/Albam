'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import CategoryTabs from '@/components/CategoryTabs';
import PhotoCard from '@/components/PhotoCard';
import LightboxModal from '@/components/LightboxModal';
import UploadModal from '@/components/UploadModal';
import PasscodeLock from '@/components/PasscodeLock';
import { IPhoto } from '@/lib/types';
import { Loader2, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [categories, setCategories] = useState<string[]>(['All', 'Images', 'Videos', 'Favorites']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [totalPhotos, setTotalPhotos] = useState(0);

  // Modals & Lock state
  const [activePhoto, setActivePhoto] = useState<IPhoto | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(true); // Mandatory lock on every new visit

  // Stats
  const [stats, setStats] = useState<{
    total: number;
    imagesCount: number;
    videosCount: number;
    favoritesCount: number;
  } | null>(null);

  // Check passcode lock: Session-based so closing tab or leaving website requires PIN again!
  useEffect(() => {
    const isSessionUnlocked = sessionStorage.getItem('album_session_unlocked');
    if (isSessionUnlocked === 'true') {
      setIsLocked(false);
    } else {
      setIsLocked(true);
    }
  }, []);

  const handleManualLock = () => {
    sessionStorage.removeItem('album_session_unlocked');
    setIsLocked(true);
  };

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch ALL photos automatically without stopping (No pagination buttons required)
  const fetchPhotos = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '3000', // Load all 1131+ photos in one continuous stream
        category: activeCategory,
        search: debouncedSearch,
      });

      if (activeCategory === 'Favorites') {
        params.set('favorites', 'true');
      }

      const res = await fetch(`/api/photos?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch photos');

      const data = await res.json();

      setPhotos(data.photos || []);
      setTotalPhotos(data.total);
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, debouncedSearch]);

  // Re-fetch on category or search change
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Toggle favorite with optimistic update
  const handleToggleFavorite = async (id: string, current: boolean) => {
    const newStatus = !current;

    // Optimistic UI update
    setPhotos((prev) =>
      prev.map((p) => (p._id === id ? { ...p, isFavorite: newStatus } : p))
    );
    if (activePhoto && activePhoto._id === id) {
      setActivePhoto((prev) => (prev ? { ...prev, isFavorite: newStatus } : null));
    }
    setStats((prev) =>
      prev
        ? {
            ...prev,
            favoritesCount: newStatus
              ? prev.favoritesCount + 1
              : Math.max(0, prev.favoritesCount - 1),
          }
        : null
    );

    try {
      await fetch(`/api/photos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update favorite status:', err);
    }
  };

  // Update note
  const handleUpdateNote = async (id: string, note: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p._id === id ? { ...p, notes: note } : p))
    );
    if (activePhoto && activePhoto._id === id) {
      setActivePhoto((prev) => (prev ? { ...prev, notes: note } : null));
    }

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

  // Delete photo
  const handleDeletePhoto = async (id: string) => {
    setPhotos((prev) => prev.filter((p) => p._id !== id));
    fetchStats();

    try {
      await fetch(`/api/photos/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete photo:', err);
    }
  };

  // Upload success
  const handleUploadSuccess = (newPhoto: IPhoto) => {
    setPhotos((prev) => [newPhoto, ...prev]);
    setTotalPhotos((prev) => prev + 1);
    fetchStats();
  };

  // Lightbox Next & Prev
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
    <div className="min-h-screen flex flex-col justify-between">
      {/* 6-Digit Passcode Lock (312005) */}
      {isLocked && <PasscodeLock onUnlock={() => setIsLocked(false)} />}

      {/* Navigation Bar */}
      <Navbar
        onOpenUpload={() => setIsUploadOpen(true)}
        stats={stats}
        onSelectCategory={setActiveCategory}
        currentCategory={activeCategory}
        onLock={handleManualLock}
      />

      {/* Main Full-Width Responsive Container (Mobile to 4K Laptop/Desktop) */}
      <main className="flex-1 max-w-[1920px] mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 pb-16">
        {/* Romantic Hero Banner with Search */}
        <HeroBanner
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={totalPhotos}
        />

        {/* Category Tabs */}
        <div className="mb-6 sm:mb-8">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            favoritesCount={stats?.favoritesCount}
            videosCount={stats?.videosCount}
            imagesCount={stats?.imagesCount}
          />
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-rose-500">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-rose-500" />
            <p className="text-sm font-medium text-stone-600">
              Loading all {totalPhotos > 0 ? totalPhotos : '1100+'} memories, please wait a moment...
            </p>
          </div>
        ) : photos.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center glass rounded-3xl p-8 max-w-md mx-auto border border-rose-100">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-800 mb-1">
              No Memories Found
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              {searchQuery
                ? `No photos matched "${searchQuery}". Try a different keyword.`
                : 'Tap "Add Memory" to upload a new memory.'}
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium shadow-md shadow-rose-500/20"
            >
              Add First Memory
            </button>
          </div>
        ) : (
          /* Fully Responsive Masonry Grid (Mobile to Laptop) */
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2.5 sm:gap-3.5 md:gap-4">
              {photos.map((photo, index) => (
                <PhotoCard
                  key={photo._id || index}
                  photo={photo}
                  onOpen={setActivePhoto}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>

            {/* Seamless All Loaded Indicator (No Stop / No Load More button) */}
            <div className="mt-12 text-center text-xs text-rose-600/80 font-medium flex items-center justify-center gap-2 py-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>All {photos.length} Cherished Memories Loaded Completely</span>
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            </div>
          </>
        )}
      </main>

      {/* Fullscreen Lightbox Modal */}
      <LightboxModal
        photo={activePhoto}
        onClose={() => setActivePhoto(null)}
        onNext={handleNextPhoto}
        onPrev={handlePrevPhoto}
        onToggleFavorite={handleToggleFavorite}
        onDeletePhoto={handleDeletePhoto}
        onUpdateNote={handleUpdateNote}
        currentIndex={currentPhotoIndex}
        totalCount={photos.length}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        existingCategories={categories}
      />

      {/* Romantic Footer */}
      <footer className="w-full glass border-t border-rose-100 py-6 text-center text-xs text-stone-500">
        <div className="max-w-[1920px] mx-auto px-4 flex flex-col items-center justify-center gap-2">
          <p className="flex items-center gap-1.5 font-medium text-stone-700">
            <span>Made with endless love</span>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
            <span>for my wonderful wife</span>
          </p>
          <p className="text-[11px] text-stone-400">
            Naga Arjun & Family • Every picture tells our story
          </p>
        </div>
      </footer>
    </div>
  );
}
