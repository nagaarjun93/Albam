'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Delete, RotateCcw } from 'lucide-react';

interface PasscodeLockProps {
  onUnlock: () => void;
}

export default function PasscodeLock({ onUnlock }: PasscodeLockProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const correctPin = process.env.NEXT_PUBLIC_ALBUM_PIN || '312005';

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      if (newPin.length === 6) {
        if (newPin === correctPin) {
          sessionStorage.setItem('album_session_unlocked', 'true');
          onUnlock();
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

  // Allow physical keyboard typing as well (for laptops)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div className="fixed inset-0 z-50 romantic-bg flex items-center justify-center p-4 select-none">
      <div className="max-w-xs sm:max-w-sm w-full glass rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-rose-200/80 animate-scale-up">
        {/* Heart Lock Icon */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/25">
          <Heart className="w-8 h-8 text-white fill-white animate-pulse" />
        </div>

        <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-800 mb-1">
          Our Private Album
        </h1>
        <p className="text-xs text-stone-500 mb-6 flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>Enter 6-digit PIN to open</span>
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
        </p>

        {/* 6-Digit PIN Indicator Dots */}
        <div className="flex justify-center gap-3 sm:gap-3.5 mb-8">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-200 ${
                error
                  ? 'bg-red-500 animate-bounce'
                  : pin.length > idx
                  ? 'bg-rose-500 scale-125 shadow-md shadow-rose-500/50'
                  : 'bg-stone-200 border border-stone-300'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium -mt-4 mb-4 animate-shake">
            Incorrect PIN. Try again ❤️
          </p>
        )}

        {/* Numeric keypad (responsive touch-friendly) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-[260px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-12 sm:h-14 rounded-2xl bg-white/90 hover:bg-rose-50 active:bg-rose-100 border border-rose-100/70 text-stone-800 text-lg sm:text-xl font-semibold shadow-sm hover:shadow transition-all active:scale-95 flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-12 sm:h-14 rounded-2xl bg-stone-50/80 hover:bg-stone-100 text-stone-600 text-xs font-semibold flex items-center justify-center transition-all active:scale-95"
            title="Clear all"
          >
            <RotateCcw className="w-4 h-4 mr-1 text-stone-400" />
            Clear
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-12 sm:h-14 rounded-2xl bg-white/90 hover:bg-rose-50 active:bg-rose-100 border border-rose-100/70 text-stone-800 text-lg sm:text-xl font-semibold shadow-sm hover:shadow transition-all active:scale-95 flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-12 sm:h-14 rounded-2xl bg-stone-50/80 hover:bg-stone-100 text-stone-600 text-xs font-semibold flex items-center justify-center transition-all active:scale-95"
            title="Delete last digit"
          >
            <Delete className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <p className="text-[11px] text-stone-400 mt-2">
          Protected with love for Naga Arjun & Wife
        </p>
      </div>
    </div>
  );
}
