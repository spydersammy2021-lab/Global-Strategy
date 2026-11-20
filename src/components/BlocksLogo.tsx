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
      <rect x="4" y="4" width="56" height="56" rx="14" fill="#090F1E" stroke="#38BDF8" strokeOpacity="0.4" strokeWidth="1.5" />
      <path d="M32 13L48 22V32L32 41L16 32V22L32 13Z" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
      <path d="M32 13L48 22L32 31L16 22L32 13Z" fill="#FBBF24" fillOpacity="0.95" />
      <path d="M16 22L32 31V41L16 32V22Z" fill="#D97706" />
      <path d="M48 22L32 31V41L48 32V22Z" fill="#92400E" />
      <path d="M22 39L32 45L42 39V47L32 53L22 47V39Z" fill="#38BDF8" fillOpacity="0.9" />
    </svg>
  );
}

// Bespoke Vector SVG Emblem v1.0 APEX EDITION: Earth & Mars planetary lockup, orbital ring, gold & steel tactical blades
export function GlobalStrategyLogo({ size = 60, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gsGold" x1="12" y1="8" x2="68" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="gsAzure" x1="18" y1="20" x2="54" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#091124" />
        </linearGradient>
        <linearGradient id="gsMars" x1="48" y1="16" x2="64" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="55%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#7C2D12" />
        </linearGradient>
      </defs>

      <circle cx="40" cy="40" r="35" fill="#38BDF8" fillOpacity="0.08" />

      {/* Crossed Tactical Blades */}
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 66L63 15L67 12L65 17L16 66Z" fill="#E2E8F0" stroke="url(#gsGold)" strokeWidth="1.2" />
        <path d="M13 58L22 67" stroke="url(#gsGold)" strokeWidth="3.2" />
        <circle cx="12" cy="67" r="2.5" fill="url(#gsGold)" />
        <path d="M68 66L17 15L13 12L15 17L64 66Z" fill="#CBD5E1" stroke="url(#gsGold)" strokeWidth="1.2" />
        <path d="M67 58L58 67" stroke="url(#gsGold)" strokeWidth="3.2" />
        <circle cx="68" cy="67" r="2.5" fill="url(#gsGold)" />
      </g>

      {/* Outer Tactical Shield */}
      <path
        d="M40 8L64 17V38C64 53.5 53.8 65.8 40 71C26.2 65.8 16 53.5 16 38V17L40 8Z"
        fill="#070D1B"
        stroke="url(#gsGold)"
        strokeWidth="2.8"
      />

      {/* Orbital Trajectory Ring */}
      <ellipse
        cx="40"
        cy="39"
        rx="22"
        ry="9"
        transform="rotate(-24 40 39)"
        stroke="#38BDF8"
        strokeOpacity="0.7"
        strokeWidth="1.3"
        strokeDasharray="3 2"
      />

      {/* Earth Globe */}
      <circle cx="36" cy="41" r="13.5" fill="url(#gsAzure)" stroke="url(#gsGold)" strokeWidth="1.8" />
      <ellipse cx="36" cy="41" rx="6.2" ry="13.5" stroke="#E0F2FE" strokeOpacity="0.65" strokeWidth="1" />
      <path d="M23 41H49" stroke="#FDE047" strokeOpacity="0.85" strokeWidth="1.1" />
      <path
        d="M30 33C33 32 36 34 35 37C34 39 37 40 36 43C34 45 30 44 29 40C28 37 28 34 30 33Z"
        fill="#FEF08A"
        fillOpacity="0.5"
      />

      {/* Mars Frontier Sphere */}
      <circle cx="53" cy="25" r="6.8" fill="url(#gsMars)" stroke="#FED7AA" strokeWidth="1.3" />
      <path d="M48 25C50 23.5 54 23.5 58 25" stroke="#FFEDD5" strokeOpacity="0.55" strokeWidth="0.9" />
    </svg>
  );
}

export function GlobalStrategyTitleLockup() {
  return (
    <div className="flex items-center gap-3.5">
      <GlobalStrategyLogo size={58} className="shrink-0 drop-shadow-[0_0_18px_rgba(56,189,248,0.28)]" />
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300">
          Blocks™ Real-Time Grand Strategy
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none mt-1">
          GLOBAL STRATEGY
        </h1>
        <div className="text-[10px] font-mono-num font-bold tracking-[0.22em] text-amber-300 mt-1">
          APEX EDITION · VERSION 1.0
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
