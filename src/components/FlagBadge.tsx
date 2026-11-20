import React from 'react';
import type { FlagPattern } from '../game/types';

export function FlagBadge({
  flag,
  label,
  width = 24,
  height = 16,
  className = '',
}: {
  flag: FlagPattern;
  label?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const [c1, c2, c3] = flag.colors;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 16"
      className={`inline-block shrink-0 rounded-[2px] border border-white/25 shadow-xs ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={!label}
    >
      {flag.type === 'h2' && (
        <>
          <rect x="0" y="0" width="24" height="8" fill={c1} />
          <rect x="0" y="8" width="24" height="8" fill={c2} />
        </>
      )}
      {flag.type === 'h3' && (
        <>
          <rect x="0" y="0" width="24" height="5.34" fill={c1} />
          <rect x="0" y="5.33" width="24" height="5.34" fill={c2} />
          <rect x="0" y="10.66" width="24" height="5.34" fill={c3 ?? c1} />
        </>
      )}
      {flag.type === 'v3' && (
        <>
          <rect x="0" y="0" width="8" height="16" fill={c1} />
          <rect x="8" y="0" width="8" height="16" fill={c2} />
          <rect x="16" y="0" width="8" height="16" fill={c3 ?? c1} />
        </>
      )}
      {flag.type === 'cross' && (
        <>
          <rect x="0" y="0" width="24" height="16" fill={c1} />
          <rect x="7" y="0" width="3.2" height="16" fill={c3 ?? c2} />
          <rect x="0" y="6.4" width="24" height="3.2" fill={c3 ?? c2} />
          {c3 && (
            <>
              <rect x="7.8" y="0" width="1.6" height="16" fill={c2} />
              <rect x="0" y="7.2" width="24" height="1.6" fill={c2} />
            </>
          )}
        </>
      )}
      {flag.type === 'canton' && (
        flag.colors[0] === '#FFFFFF' && flag.colors[1] === '#DC2626' && flag.colors[2] === '#1D4ED8' && !flag.emblemColor ? (
          <>
            <rect x="0" y="0" width="24" height="8" fill={c1} />
            <rect x="0" y="8" width="24" height="8" fill={c2} />
            <polygon points="0,0 12,8 0,16" fill={c3 ?? '#1D4ED8'} />
          </>
        ) : (
          <>
            <rect x="0" y="0" width="24" height="16" fill={c1} />
            <rect x="0" y="3.2" width="24" height="2.6" fill={c2} />
            <rect x="0" y="8.4" width="24" height="2.6" fill={c2} />
            <rect x="0" y="13.4" width="24" height="2.6" fill={c2} />
            <rect x="0" y="0" width="11" height="8.5" fill={c3 ?? c1} />
            <circle cx="5.5" cy="4.25" r="2" fill={c2 === c1 ? '#FACC15' : '#FFFFFF'} />
          </>
        )
      )}
      {flag.type === 'circle' && (
        <>
          <rect x="0" y="0" width="24" height="16" fill={c1} />
          <circle cx="12" cy="8" r="4.2" fill={c2} />
        </>
      )}
      {(flag.type === 'diagonal' || flag.type === 'bicolor_star') && (
        <>
          <rect x="0" y="0" width="24" height="16" fill={c1} />
          <polygon points="0,16 24,0 24,4 0,16" fill={c2} />
          <polygon points="0,13 20,0 24,0 24,3 4,16 0,16" fill={c3 ?? c2} />
        </>
      )}
      {flag.emblemColor && flag.type !== 'circle' && (
        <circle cx="12" cy="8" r="2.1" fill={flag.emblemColor} />
      )}
    </svg>
  );
}

// Direct Canvas2D flag renderer for 60 FPS world map labels
export function drawCanvasFlag(
  ctx: CanvasRenderingContext2D,
  flag: FlagPattern,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const [c1, c2, c3] = flag.colors;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  if (flag.type === 'h2') {
    ctx.fillStyle = c1;
    ctx.fillRect(x, y, w, h * 0.5);
    ctx.fillStyle = c2;
    ctx.fillRect(x, y + h * 0.5, w, h * 0.5);
  } else if (flag.type === 'h3') {
    ctx.fillStyle = c1;
    ctx.fillRect(x, y, w, h / 3);
    ctx.fillStyle = c2;
    ctx.fillRect(x, y + h / 3, w, h / 3);
    ctx.fillStyle = c3 ?? c1;
    ctx.fillRect(x, y + (h * 2) / 3, w, h / 3);
  } else if (flag.type === 'v3') {
    ctx.fillStyle = c1;
    ctx.fillRect(x, y, w / 3, h);
    ctx.fillStyle = c2;
    ctx.fillRect(x + w / 3, y, w / 3, h);
    ctx.fillStyle = c3 ?? c1;
    ctx.fillRect(x + (w * 2) / 3, y, w / 3, h);
  } else if (flag.type === 'cross') {
    ctx.fillStyle = c1;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = c3 ?? c2;
    ctx.fillRect(x + w * 0.28, y, w * 0.16, h);
    ctx.fillRect(x, y + h * 0.4, w, h * 0.2);
    if (c3) {
      ctx.fillStyle = c2;
      ctx.fillRect(x + w * 0.32, y, w * 0.08, h);
      ctx.fillRect(x, y + h * 0.45, w, h * 0.1);
    }
  } else if (flag.type === 'canton') {
    if (c1 === '#FFFFFF' && c2 === '#DC2626' && c3 === '#1D4ED8' && !flag.emblemColor) {
      ctx.fillStyle = c1;
      ctx.fillRect(x, y, w, h * 0.5);
      ctx.fillStyle = c2;
      ctx.fillRect(x, y + h * 0.5, w, h * 0.5);
      ctx.fillStyle = c3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w * 0.5, y + h * 0.5);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = c1;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = c2;
      ctx.fillRect(x, y + h * 0.22, w, h * 0.16);
      ctx.fillRect(x, y + h * 0.54, w, h * 0.16);
      ctx.fillStyle = c3 ?? c1;
      ctx.fillRect(x, y, w * 0.46, h * 0.54);
    }
  } else if (flag.type === 'circle') {
    ctx.fillStyle = c1;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = c2;
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.28, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = c1;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = c2;
    ctx.fillRect(x, y + h * 0.35, w, h * 0.3);
  }

  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x, y, w, h);
}
