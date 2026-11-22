import React from 'react';

export function BlocksRoyalEmblem({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="blkGold" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <radialGradient id="blkOrb" cx="42%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="65%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#030712" />
        </radialGradient>
      </defs>
      {/* Outer octagonal sovereign crest */}
      <polygon
        points="20,4 44,4 60,20 60,44 44,60 20,60 4,44 4,20"
        fill="url(#blkOrb)"
        stroke="url(#blkGold)"
        strokeWidth="2.2"
      />
      {/* Latitude/Longitude globe grid */}
      <circle cx="32" cy="34" r="17" stroke="rgba(251,191,36,0.35)" strokeWidth="1.2" />
      <ellipse cx="32" cy="34" rx="8.5" ry="17" stroke="rgba(251,191,36,0.28)" strokeWidth="1.1" />
      <line x1="15" y1="34" x2="49" y2="34" stroke="rgba(251,191,36,0.28)" strokeWidth="1.1" />
      {/* Crossed Imperial Blades */}
      <path d="M17 48 L47 18 M47 48 L17 18" stroke="url(#blkGold)" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M14 45 L20 51 M44 51 L50 45" stroke="#FDE68A" strokeWidth="2.2" strokeLinecap="round" />
      {/* Royal Apex Crown */}
      <path d="M21 17 L24 9 L32 14 L40 9 L43 17 Z" fill="url(#blkGold)" stroke="#FEF3C7" strokeWidth="1" />
      {/* Mars orbital dot */}
      <circle cx="49" cy="17" r="3" fill="#EF4444" stroke="#FCA5A5" strokeWidth="1" />
    </svg>
  );
}

const FLAG_COLORS: Record<string, { type: 'h2' | 'h3' | 'v3' | 'cross' | 'center' | 'canton'; colors: string[]; emblem?: string }> = {
  PL: { type: 'h2', colors: ['#FFFFFF', '#DC143C'] },
  DE: { type: 'h3', colors: ['#111827', '#DC2626', '#FBBF24'] },
  FR: { type: 'v3', colors: ['#1D4ED8', '#FFFFFF', '#DC2626'] },
  IT: { type: 'v3', colors: ['#16A34A', '#FFFFFF', '#DC2626'] },
  RU: { type: 'h3', colors: ['#FFFFFF', '#2563EB', '#DC2626'] },
  UA: { type: 'h2', colors: ['#2563EB', '#FACC15'] },
  BY: { type: 'h2', colors: ['#DC2626', '#16A34A'] },
  LT: { type: 'h3', colors: ['#FACC15', '#16A34A', '#DC2626'] },
  CZ: { type: 'h2', colors: ['#FFFFFF', '#DC2626'], emblem: 'triangle-blue' },
  SK: { type: 'h3', colors: ['#FFFFFF', '#2563EB', '#DC2626'] },
  US: { type: 'canton', colors: ['#B91C1C', '#FFFFFF', '#1E3A8A'] },
  GB: { type: 'cross', colors: ['#1E3A8A', '#FFFFFF', '#DC2626'] },
  CA: { type: 'v3', colors: ['#DC2626', '#FFFFFF', '#DC2626'], emblem: 'leaf' },
  JP: { type: 'center', colors: ['#FFFFFF', '#DC2626'] },
  CN: { type: 'center', colors: ['#DC2626', '#FACC15'] },
  IN: { type: 'h3', colors: ['#F97316', '#FFFFFF', '#16A34A'] },
  BR: { type: 'center', colors: ['#16A34A', '#FACC15'] },
  GL: { type: 'h2', colors: ['#FFFFFF', '#DC2626'], emblem: 'gl' },
  SE: { type: 'cross', colors: ['#0284C7', '#FACC15', '#FACC15'] },
  NO: { type: 'cross', colors: ['#DC2626', '#FFFFFF', '#1E3A8A'] },
  FI: { type: 'cross', colors: ['#FFFFFF', '#1D4ED8', '#1D4ED8'] },
  TR: { type: 'center', colors: ['#DC2626', '#FFFFFF'] },
  ES: { type: 'h3', colors: ['#DC2626', '#FACC15', '#DC2626'] },
  KR: { type: 'center', colors: ['#FFFFFF', '#2563EB'] },
  AU: { type: 'canton', colors: ['#1E3A8A', '#1E3A8A', '#FFFFFF'] },
  EG: { type: 'h3', colors: ['#DC2626', '#FFFFFF', '#111827'] },
  SA: { type: 'center', colors: ['#15803D', '#FFFFFF'] },
  ZA: { type: 'h3', colors: ['#DC2626', '#15803D', '#1D4ED8'] },
};

export function FlagCrest({
  code,
  fallbackColor = '#3B82F6',
  name,
  width = 32,
  height = 22,
  vipCrown = false,
}: {
  code: string;
  fallbackColor?: string;
  name: string;
  width?: number;
  height?: number;
  vipCrown?: boolean;
}) {
  const spec = FLAG_COLORS[code.toUpperCase()];

  return (
    <div
      className={`relative inline-flex shrink-0 overflow-hidden rounded-[4px] border ${
        vipCrown ? 'border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.45)]' : 'border-amber-400/35'
      }`}
      style={{ width, height }}
      title={name}
    >
      <svg width={width} height={height} viewBox="0 0 32 22" role="img" aria-label={name}>
        {!spec && (
          <>
            <rect width="32" height="22" fill={fallbackColor} />
            <rect y="11" width="32" height="11" fill="rgba(0,0,0,0.22)" />
            <circle cx="16" cy="11" r="4.5" fill="rgba(255,255,255,0.25)" stroke="#FDE68A" strokeWidth="1" />
          </>
        )}
        {spec?.type === 'h2' && (
          <>
            <rect width="32" height="11" fill={spec.colors[0]} />
            <rect y="11" width="32" height="11" fill={spec.colors[1]} />
            {spec.emblem === 'triangle-blue' && <polygon points="0,0 15,11 0,22" fill="#1D4ED8" />}
            {spec.emblem === 'gl' && (
              <>
                <path d="M7,11 A5,5 0 0,1 17,11 Z" fill="#DC2626" />
                <path d="M7,11 A5,5 0 0,0 17,11 Z" fill="#FFFFFF" />
              </>
            )}
          </>
        )}
        {spec?.type === 'h3' && (
          <>
            <rect width="32" height="7.4" fill={spec.colors[0]} />
            <rect y="7.4" width="32" height="7.2" fill={spec.colors[1]} />
            <rect y="14.6" width="32" height="7.4" fill={spec.colors[2]} />
          </>
        )}
        {spec?.type === 'v3' && (
          <>
            <rect width="10.7" height="22" fill={spec.colors[0]} />
            <rect x="10.7" width="10.6" height="22" fill={spec.colors[1]} />
            <rect x="21.3" width="10.7" height="22" fill={spec.colors[2]} />
            {spec.emblem === 'leaf' && <circle cx="16" cy="11" r="3.4" fill="#DC2626" />}
          </>
        )}
        {spec?.type === 'cross' && (
          <>
            <rect width="32" height="22" fill={spec.colors[0]} />
            <rect x="8" width="5" height="22" fill={spec.colors[1]} />
            <rect y="8.5" width="32" height="5" fill={spec.colors[1]} />
            <rect x="9.5" width="2" height="22" fill={spec.colors[2]} />
            <rect y="10" width="32" height="2" fill={spec.colors[2]} />
          </>
        )}
        {spec?.type === 'center' && (
          <>
            <rect width="32" height="22" fill={spec.colors[0]} />
            <circle cx="16" cy="11" r="5" fill={spec.colors[1]} />
          </>
        )}
        {spec?.type === 'canton' && (
          <>
            <rect width="32" height="22" fill={spec.colors[0]} />
            <rect y="3" width="32" height="2.5" fill={spec.colors[1]} />
            <rect y="8" width="32" height="2.5" fill={spec.colors[1]} />
            <rect y="13" width="32" height="2.5" fill={spec.colors[1]} />
            <rect y="18" width="32" height="2.5" fill={spec.colors[1]} />
            <rect width="14" height="12" fill={spec.colors[2]} />
            <circle cx="5" cy="4" r="1.1" fill="#FFF" />
            <circle cx="9.5" cy="4" r="1.1" fill="#FFF" />
            <circle cx="7" cy="8" r="1.1" fill="#FFF" />
          </>
        )}
      </svg>
    </div>
  );
}
