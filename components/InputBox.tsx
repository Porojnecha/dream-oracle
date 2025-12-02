'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Waveform from './Waveform';

type InputBoxProps = {
  onDecode: (dream: string) => Promise<void>;
  isLoading: boolean;
  placeholder: string;
  srLabel: string;
  buttonLabel: string;
};

const InputBox = ({ onDecode, isLoading, placeholder, srLabel, buttonLabel }: InputBoxProps) => {
  const [dream, setDream] = useState('');
  const [intensity, setIntensity] = useState(0.2);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const idleDrop = window.setInterval(() => {
      setIntensity((prev) => {
        const target = dream.trim().length > 0 ? 0.35 : 0.15;
        const next = prev + (target - prev) * 0.1;
        return Number(next.toFixed(3));
      });
    }, 120);

    return () => window.clearInterval(idleDrop);
  }, [dream]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = dream.trim();
    if (!trimmed || isLoading) {
      return;
    }

    await onDecode(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-3xl flex-col items-center space-y-7 px-6 text-center sm:space-y-8"
    >
      <label className="w-full">
        <span className="sr-only">{srLabel}</span>
        <input
          ref={inputRef}
          type="text"
          value={dream}
          autoFocus
          onChange={(event) => {
            setDream(event.target.value);
            setIntensity((prev) =>
              Math.min(1, Math.max(prev, 0.25 + event.target.value.length / 160))
            );
          }}
          onKeyDown={() => setIntensity((prev) => Math.min(1, prev + 0.12))}
          placeholder={placeholder}
          className={`glass-field w-full rounded-2xl border border-white/15 bg-black/40 px-6 py-3 text-lg font-normal tracking-wide text-white/70 placeholder:text-white/35 focus:text-white focus:outline-none ${isLoading ? 'typing-illumination' : ''}`}
        />
      </label>

      <Waveform
        intensity={intensity}
        excited={isLoading}
        className="mt-6 w-full max-w-xs sm:mt-8 sm:max-w-sm"
      />

      <div className="flex justify-center">
        <button
          type="submit"
          className="decode-button flex items-center gap-2"
          disabled={isLoading || !dream.trim()}
        >
          <span>{buttonLabel}</span>
          {isLoading && <span className="ring-loader" />}
        </button>
      </div>
    </form>
  );
};

export default InputBox;

