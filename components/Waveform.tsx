'use client';

import { useEffect, useRef } from 'react';

type WaveformProps = {
  intensity: number;
  excited?: boolean;
  className?: string;
};

const drawStar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number
) => {
  const spikes = 5;
  const step = Math.PI / spikes;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  for (let i = 0; i < spikes; i += 1) {
    ctx.rotate(step);
    ctx.lineTo(radius * 0.4, 0);
    ctx.rotate(step);
    ctx.lineTo(radius, 0);
  }
  ctx.closePath();
  ctx.restore();
};

const Waveform = ({ intensity, excited = false, className = '' }: WaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intensityRef = useRef(intensity);
  const energyRef = useRef(excited);

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    energyRef.current = excited;
  }, [excited]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    let animationFrameId: number;
    let time = 0;
    const glints = Array.from({ length: 9 }).map((_, index) => ({
      angle: (index / 9) * Math.PI * 2,
      offset: Math.random() * Math.PI * 2,
      radiusFactor: 0.3 + Math.random() * 0.5
    }));

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const { clientWidth: width, clientHeight: height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const minSide = Math.min(width, height);
      const baseRadius = minSide * 0.18;
      const amp = baseRadius * (0.4 + intensityRef.current * 0.6);

      ctx.globalCompositeOperation = 'lighter';
      const energyBoost = energyRef.current ? 1.45 : 1;

      for (let ring = 0; ring < 4; ring += 1) {
        const pulse =
          Math.sin(time * (0.8 + ring * 0.15) + ring) * amp * (0.4 + ring * 0.2);
        const radius = baseRadius + ring * (minSide * 0.06) + pulse;
        const gradient = ctx.createRadialGradient(cx, cy, radius * 0.35, cx, cy, radius);
        const opacity = (0.12 + ring * 0.05) * energyBoost;

        gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
        gradient.addColorStop(0.6, `rgba(167, 139, 250, ${opacity * 0.4})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(10, radius), 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      if (energyRef.current) {
        const rainbow = ctx.createRadialGradient(
          cx,
          cy,
          baseRadius * 0.2,
          cx,
          cy,
          minSide * 0.55
        );
        const hueShift = Math.sin(time * 0.6) * 20;
        const coolHue = clamp(180 + hueShift, 0, 255);
        const warmHue = clamp(255 - hueShift, 0, 255);
        rainbow.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
        rainbow.addColorStop(0.25, `rgba(${coolHue}, 207, 255, 0.12)`);
        rainbow.addColorStop(0.5, `rgba(${warmHue}, 178, 255, 0.1)`);
        rainbow.addColorStop(0.75, 'rgba(167, 139, 250, 0.08)');
        rainbow.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.arc(cx, cy, minSide * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = rainbow;
        ctx.fill();
      }

      glints.forEach((glint) => {
        const flicker = 0.5 + Math.sin(time * 1.5 + glint.offset) * 0.4;
        const radius = (minSide * glint.radiusFactor) / 2;
        const angle = glint.angle + Math.sin(time * 0.4 + glint.offset) * 0.2;
        const x = cx + Math.cos(angle) * (radius + intensityRef.current * 8);
        const y = cy + Math.sin(angle) * (radius + intensityRef.current * 8);
        const size = 1.5 + intensityRef.current * 1.8;

        const sparkle = energyRef.current ? 0.3 : 0.2;
        const hueBlend = energyRef.current
          ? `rgba(${140 + Math.sin(time + glint.offset) * 30}, ${120 + Math.cos(
              time * 1.2 + glint.offset
            ) * 20}, 255, ${sparkle + flicker * 0.25})`
          : `rgba(167, 139, 250, ${sparkle + flicker * 0.25})`;

        if (energyRef.current) {
          drawStar(ctx, x, y, size * 1.6, time * 0.8 + glint.offset);
          ctx.fillStyle = hueBlend;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = hueBlend;
          ctx.fill();
        }
      });

      ctx.globalCompositeOperation = 'source-over';

      time += 0.015 + intensityRef.current * 0.03;
      animationFrameId = window.requestAnimationFrame(draw);
    };

    animationFrameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      className={`relative aspect-square w-24 overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-white/10 via-white/[0.05] to-white/10 shadow-inner shadow-black/50 sm:w-32 ${className}`}
      style={
        excited
          ? {
              boxShadow: '0 0 35px rgba(167,139,250,0.35)',
              filter: 'drop-shadow(0 0 15px rgba(125,211,252,0.35))'
            }
          : undefined
      }
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ filter: excited ? 'brightness(1.3) saturate(1.15)' : 'none' }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/15 via-transparent to-black/70" />
    </div>
  );
};

export default Waveform;

