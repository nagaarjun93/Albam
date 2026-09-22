'use client';

import React, { useState, useRef } from 'react';
import { X, UploadCloud, Heart, Calendar, Tag, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { IPhoto } from '@/lib/types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newPhoto: IPhoto) => void;
  existingCategories: string[];
}

export default function UploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
  existingCategories,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Memories');
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      // Auto default title from file name without extension
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      if (!title) {
        setTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
      setPreviewUrl(URL.createObjectURL(droppedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a photo or video to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || 'Special Moment');
      formData.append('caption', caption);
      formData.append('category', category === 'Custom' ? customCategory || 'Memories' : category);
      formData.append('date', date);
      formData.append('notes', notes);
      formData.append('isPrivate', isPrivate ? 'true' : 'false');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload photo');
      }

      setSuccess(true);
      setTimeout(() => {
        onUploadSuccess(data.photo);
        onClose();
        // Reset state
        setFile(null);
        setPreviewUrl(null);
        setTitle('');
        setCaption('');
        setNotes('');
        setIsPrivate(false);
        setSuccess(false);
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please check network.');
    } finally {
      setIsUploading(false);
    }
  };

  const isVideo = file?.type.startsWith('video/') || file?.name.endsWith('.mp4');

  const categories = [
    'Memories',
    'Romantic Moments',
    'Trips & Travel',
    'Dates',
    'Weddings & Family',
    'Candid',
    'Custom',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-100 relative animate-scale-up my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isUploading}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Add A Cherished Memory
            </h2>
            <p className="text-xs text-stone-500">
              Save a new photo or video forever in our album
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Memory uploaded and saved to database successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File drop zone / picker */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden p-6 text-center ${
              previewUrl
                ? 'border-rose-400 bg-rose-50/20'
                : 'border-stone-300 hover:border-rose-400 bg-stone-50/50 hover:bg-rose-50/10'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/mp4"
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative aspect-video max-h-48 mx-auto flex items-center justify-center">
                {isVideo ? (
                  <video src={previewUrl} className="max-h-48 rounded-xl object-contain shadow-sm" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="max-h-48 rounded-xl object-contain shadow-sm" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-xs font-medium">
                  Click to change photo
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-stone-800">
                  Tap here to pick from phone or drag & drop
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Supports Photos, Videos (MP4) and GIFs
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Memory Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Our First Beach Sunset"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Album / Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                <Tag className="w-3 h-3 inline mr-1 text-rose-500" />
                Album Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {category === 'Custom' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category..."
                  className="mt-2 w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                <Calendar className="w-3 h-3 inline mr-1 text-rose-500" />
                Date of Memory
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
              />
            </div>
          </div>

          {/* Love Note */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              💌 Sweet Note For Her (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write a sweet message, what happened this day, or how you felt..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
          </div>

          {/* Secret Private Memory Toggle */}
          <div
            onClick={() => setIsPrivate(!isPrivate)}
            className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              isPrivate
                ? 'bg-rose-50 border-rose-300 shadow-sm'
                : 'bg-stone-50/70 hover:bg-stone-100/70 border-stone-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  isPrivate ? 'bg-rose-500 text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-stone-800 flex items-center gap-1">
                  <span>Save to Secret Private Vault</span>
                  {isPrivate && <span className="text-[10px] px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded-full">Hidden</span>}
                </p>
                <p className="text-[10px] text-stone-500">
                  Hidden from public album • Requires PIN 0702
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 text-rose-500 rounded border-stone-300 focus:ring-rose-400 cursor-pointer"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-medium shadow-md shadow-rose-500/25 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading to Album...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Save Memory</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

