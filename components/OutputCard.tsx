'use client';

import { useEffect, useMemo, useState } from 'react';

type OracleResult = {
  symbols: string[];
  interpretation: string;
  guidance: string;
};

type OutputCardLabels = {
  cardTitle: string;
  dreamLabel: string;
  symbolsLabel: string;
  interpretationLabel: string;
  guidanceLabel: string;
};

type OutputCardProps = {
  dream: string;
  result: OracleResult | null;
  labels: OutputCardLabels;
};

const OutputCard = ({ dream, result, labels }: OutputCardProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame: number | null = null;
    if (result) {
      frame = requestAnimationFrame(() => setVisible(true));
    } else {
      frame = requestAnimationFrame(() => setVisible(false));
    }
    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [result]);

  const interpretationBlocks = useMemo(() => {
    if (!result?.interpretation) {
      return [];
    }
    return result.interpretation
      .split(/\n+/)
      .map((chunk) => chunk.trim())
      .filter(Boolean);
  }, [result]);

  if (!result) {
    return null;
  }

  return (
    <section
      id="oracle-output"
      className={`mx-auto mt-20 max-w-3xl px-6 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <div className="rounded-[32px] border border-transparent bg-black/40 p-[2px]">
        <div className="rounded-[30px] border border-white/5 bg-gradient-to-br from-black/60 via-black/40 to-black/60 p-8 text-left shadow-aurora">
          <div className="mb-4 text-xs uppercase tracking-[0.4em] text-white/40">
            {labels.cardTitle}
          </div>
          <p className="text-sm text-white/55">
            {labels.dreamLabel}: {dream}
          </p>

          <div className="my-6 h-px bg-gradient-to-r from-violetAura/40 via-white/20 to-cyanWhisper/40" />

          <div className="space-y-8">
            {result.symbols.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                  {labels.symbolsLabel}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {result.symbols.map((symbol, index) => (
                    <span
                      key={`${symbol}-${index}`}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-white/80"
                    >
                      {symbol}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {interpretationBlocks.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/35">
                  {labels.interpretationLabel}
                </p>
                <div className="mt-3 space-y-4 text-lg leading-relaxed text-white/90">
                  {interpretationBlocks.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {result.guidance && (
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/35">
                  {labels.guidanceLabel}
                </p>
                <p className="mt-3 text-base text-white/75">{result.guidance}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OutputCard;

