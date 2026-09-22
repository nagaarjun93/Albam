'use client';

import React, { useState } from 'react';
import { Lock, Heart, KeyRound, Sparkles } from 'lucide-react';

interface PasscodeLockProps {
  onUnlock: () => void;
}

export default function PasscodeLock({ onUnlock }: PasscodeLockProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const correctPin = process.env.NEXT_PUBLIC_ALBUM_PIN || '1432';

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        if (newPin === correctPin) {
          localStorage.setItem('album_unlocked', 'true');
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 800);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 romantic-bg flex items-center justify-center p-4">
      <div className="max-w-sm w-full glass rounded-3xl p-8 text-center shadow-2xl border border-rose-200/80 animate-scale-up">
        {/* Heart Lock Icon */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/25">
          <Heart className="w-8 h-8 text-white fill-white animate-pulse" />
        </div>

        <h1 className="text-2xl font-serif font-bold text-stone-800 mb-1">
          Our Secret Album
        </h1>
        <p className="text-xs text-stone-500 mb-6 flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>Enter 4-digit passcode for my wife</span>
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
        </p>

        {/* PIN Dots */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
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
          <p className="text-xs text-red-500 font-medium -mt-4 mb-4">
            Incorrect passcode. Try again ❤️
          </p>
        )}

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl bg-white hover:bg-rose-50 border border-rose-100/70 text-stone-800 text-xl font-medium shadow-sm hover:shadow transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => onUnlock()}
            className="h-14 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium flex items-center justify-center transition-all"
            title="Skip Lock"
          >
            Skip
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-white hover:bg-rose-50 border border-rose-100/70 text-stone-800 text-xl font-medium shadow-sm hover:shadow transition-all active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-medium flex items-center justify-center transition-all active:scale-95"
          >
            Del
          </button>
        </div>

        <p className="text-[11px] text-stone-400">
          Default PIN is <span className="font-semibold text-rose-500">1432</span> (or tap Skip)
        </p>
      </div>
    </div>
  );
}

