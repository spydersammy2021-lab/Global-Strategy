import React from 'react';
import { Award, Compass, Crown, Shield, Star, Swords } from 'lucide-react';

export function BlocksLogo({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="14"
        fill="#050914"
        stroke="#EAB308"
        strokeOpacity="0.52"
        strokeWidth="1.5"
      />
      <path d="M32 12L49 21.5V32.5L32 42L15 32.5V21.5L32 12Z" fill="#0F172A" stroke="#FACC15" strokeWidth="1.8" />
      <path d="M32 12L49 21.5L32 31L15 21.5L32 12Z" fill="#FDE047" fillOpacity="0.92" />
      <path d="M15 21.5L32 31V42L15 32.5V21.5Z" fill="#CA8A04" />
      <path d="M49 21.5L32 31V42L49 32.5V21.5Z" fill="#78350F" />
      <path d="M21 39.5L32 46L43 39.5V48L32 54.5L21 48V39.5Z" fill="#38BDF8" fillOpacity="0.94" />
    </svg>
  );
}

// Bespoke Vector SVG Emblem VERSION 3.0: Imperial Obsidian-Bronze Hex Crest, Celestial Globe, Mars & Sabers
export function GlobalStrategyLogo({ size = 64, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gsV3Bronze" x1="12" y1="8" x2="84" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <linearGradient id="gsV3Sapphire" x1="26" y1="24" x2="66" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="52%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#050C1D" />
        </linearGradient>
        <linearGradient id="gsV3Mars" x1="58" y1="16" x2="74" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="55%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#7C2D12" />
        </linearGradient>
      </defs>

      {/* Outer Meridian Compass Ring */}
      <circle
        cx="48"
        cy="48"
        r="43"
        fill="#0284C7"
        fillOpacity="0.06"
        stroke="url(#gsV3Bronze)"
        strokeOpacity="0.32"
        strokeWidth="1"
      />
      <circle
        cx="48"
        cy="48"
        r="38"
        stroke="#38BDF8"
        strokeOpacity="0.28"
        strokeWidth="1"
        strokeDasharray="3 4"
      />

      {/* Crossed Imperial Sabers */}
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 80L76 18L82 14L79 21L18 80Z" fill="#E2E8F0" stroke="url(#gsV3Bronze)" strokeWidth="1.2" />
        <path d="M15 69L27 81" stroke="url(#gsV3Bronze)" strokeWidth="3.2" />
        <circle cx="14" cy="81" r="2.8" fill="url(#gsV3Bronze)" />
        <path d="M82 80L20 18L14 14L17 21L78 80Z" fill="#CBD5E1" stroke="url(#gsV3Bronze)" strokeWidth="1.2" />
        <path d="M81 69L69 81" stroke="url(#gsV3Bronze)" strokeWidth="3.2" />
        <circle cx="82" cy="81" r="2.8" fill="url(#gsV3Bronze)" />
      </g>

      {/* Imperial Hexagonal Obsidian Crest */}
      <path
        d="M48 10L77 24V52L48 86L19 52V24L48 10Z"
        fill="#040813"
        stroke="url(#gsV3Bronze)"
        strokeWidth="2.8"
      />
      <path
        d="M48 15L72 26.8V50.5L48 80L24 50.5V26.8L48 15Z"
        stroke="#38BDF8"
        strokeOpacity="0.34"
        strokeWidth="1"
      />

      {/* Celestial Orbital Arc */}
      <ellipse
        cx="48"
        cy="47"
        rx="26"
        ry="10.5"
        transform="rotate(-24 48 47)"
        stroke="#38BDF8"
        strokeOpacity="0.78"
        strokeWidth="1.4"
        strokeDasharray="4 2.5"
      />

      {/* Earth Globe */}
      <circle cx="44" cy="49" r="15.5" fill="url(#gsV3Sapphire)" stroke="url(#gsV3Bronze)" strokeWidth="1.8" />
      <ellipse cx="44" cy="49" rx="7" ry="15.5" stroke="#E0F2FE" strokeOpacity="0.62" strokeWidth="1" />
      <path d="M28.8 49H59.2" stroke="#FDE047" strokeOpacity="0.82" strokeWidth="1.1" />
      <path
        d="M36 40C39.8 38.6 44 41 42.5 44.6C40.8 47.4 44.5 49 43 52.4C40.8 54.4 36 52.8 34.8 48.4C33.8 44.8 34 41.2 36 40Z"
        fill="#FEF08A"
        fillOpacity="0.56"
      />

      {/* Mars Frontier Orb */}
      <circle cx="64.5" cy="28" r="7.4" fill="url(#gsV3Mars)" stroke="#FED7AA" strokeWidth="1.3" />
      <path d="M59.5 28C62 26.2 66.5 26.2 69.5 28" stroke="#FFEDD5" strokeOpacity="0.6" strokeWidth="1" />
    </svg>
  );
}

export function GlobalStrategyTitleLockup() {
  return (
    <div className="flex items-center gap-3.5">
      <GlobalStrategyLogo size={62} className="shrink-0 drop-shadow-[0_0_24px_rgba(234,179,8,0.34)]" />
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-sky-300 truncate">
          BLOCKS™ · OFFICIAL SOFTWARE
        </div>
        <h1 className="font-display text-2xl sm:text-[27px] font-extrabold tracking-tight text-white leading-none mt-1">
          GLOBAL STRATEGY
        </h1>
        <div className="text-[10px] font-mono-num font-bold tracking-[0.2em] text-amber-300 mt-1.5">
          VERSION 3.0 · APEX EDITION
        </div>
      </div>
    </div>
  );
}

export const AVATAR_OPTIONS = [
  { id: 'shield', label: 'Shield' },
  { id: 'crown', label: 'Crown' },
  { id: 'sword', label: 'Blades' },
  { id: 'compass', label: 'Compass' },
  { id: 'star', label: 'Star' },
  { id: 'award', label: 'Order' },
] as const;

export function AvatarIcon({ avatarId, size = 18 }: { avatarId: string; size?: number }) {
  switch (avatarId) {
    case 'crown':
      return <Crown size={size} className="text-amber-400" />;
    case 'sword':
      return <Swords size={size} className="text-rose-400" />;
    case 'compass':
      return <Compass size={size} className="text-sky-400" />;
    case 'star':
      return <Star size={size} className="text-yellow-400" />;
    case 'award':
      return <Award size={size} className="text-emerald-400" />;
    default:
      return <Shield size={size} className="text-amber-300" />;
  }
}
