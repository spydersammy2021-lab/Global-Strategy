import React from 'react';
import type { FlagEmblemKind, FlagPattern } from '../game/types';

function resolveNormalizedLayout(flag: FlagPattern): NonNullable<FlagPattern['layout']> {
  if (flag.layout) return flag.layout;
  switch (flag.type) {
    case 'h2':
      return 'bicolor_h';
    case 'h3':
      return 'tricolor_h';
    case 'v3':
      return 'tricolor_v';
    case 'cross':
      return 'cross';
    case 'canton':
      return 'stripes';
    case 'circle':
      return 'solid';
    case 'diagonal':
    case 'bicolor_star':
      return 'diagonal';
    default:
      return 'tricolor_h';
  }
}

function SvgEmblem({ kind, colors, borderHex }: { kind?: FlagEmblemKind; colors: string[]; borderHex?: string }) {
  if (!kind || kind === 'none') return null;

  switch (kind) {
    case 'czech_wedge':
      return <polygon points="0,0 11.5,8 0,16" fill={colors[2] ?? '#11457E'} />;
    case 'swiss_cross':
      return (
        <g fill="#FFFFFF">
          <rect x="10.2" y="3.2" width="3.6" height="9.6" />
          <rect x="7.2" y="6.2" width="9.6" height="3.6" />
        </g>
      );
    case 'greek_cross':
      return (
        <g>
          <rect x="0" y="0" width="9.5" height="8.5" fill={colors[0]} />
          <rect x="3.9" y="0" width="1.7" height="8.5" fill="#FFFFFF" />
          <rect x="0" y="3.4" width="9.5" height="1.7" fill="#FFFFFF" />
        </g>
      );
    case 'union_jack':
      return (
        <g>
          <rect x="0" y="0" width="11" height="8.5" fill="#012169" />
          <line x1="0" y1="0" x2="11" y2="8.5" stroke="#FFFFFF" strokeWidth="1.6" />
          <line x1="11" y1="0" x2="0" y2="8.5" stroke="#FFFFFF" strokeWidth="1.6" />
          <line x1="0" y1="0" x2="11" y2="8.5" stroke="#C8102E" strokeWidth="0.7" />
          <line x1="11" y1="0" x2="0" y2="8.5" stroke="#C8102E" strokeWidth="0.7" />
          <rect x="4.5" y="0" width="2" height="8.5" fill="#FFFFFF" />
          <rect x="0" y="3.25" width="11" height="2" fill="#FFFFFF" />
          <rect x="4.9" y="0" width="1.2" height="8.5" fill="#C8102E" />
          <rect x="0" y="3.65" width="11" height="1.2" fill="#C8102E" />
        </g>
      );
    case 'usa_stars':
      return (
        <g>
          <rect x="0" y="0" width="10.5" height="8.6" fill="#3C3B6E" />
          <circle cx="2.5" cy="2.1" r="0.6" fill="#FFF" />
          <circle cx="5.2" cy="2.1" r="0.6" fill="#FFF" />
          <circle cx="7.9" cy="2.1" r="0.6" fill="#FFF" />
          <circle cx="3.8" cy="4.3" r="0.6" fill="#FFF" />
          <circle cx="6.6" cy="4.3" r="0.6" fill="#FFF" />
          <circle cx="2.5" cy="6.5" r="0.6" fill="#FFF" />
          <circle cx="5.2" cy="6.5" r="0.6" fill="#FFF" />
          <circle cx="7.9" cy="6.5" r="0.6" fill="#FFF" />
        </g>
      );
    case 'montenegro_eagle':
      return (
        <g>
          {borderHex && (
            <rect x="0.7" y="0.7" width="22.6" height="14.6" fill="none" stroke={borderHex} strokeWidth="1.4" />
          )}
          {/* Golden Double-Headed Eagle + Blue/Green Escutcheon */}
          <path d="M12 3.2 L10.2 4.6 L8.2 4.1 L8.8 6.4 L7.2 8.2 L9.8 9.2 L10.3 12.2 L12 11.1 L13.7 12.2 L14.2 9.2 L16.8 8.2 L15.2 6.4 L15.8 4.1 L13.8 4.6 Z" fill="#FACC15" />
          <rect x="10.6" y="6.2" width="2.8" height="3.2" rx="0.5" fill="#1D4ED8" stroke="#FACC15" strokeWidth="0.4" />
          <rect x="10.6" y="8.2" width="2.8" height="1.2" fill="#16A34A" />
        </g>
      );
    case 'cyprus_island':
      return (
        <g>
          {/* Copper Cyprus Silhouette */}
          <path d="M7.2 7.2 L9.4 5.8 L13.2 5.9 L16.9 4.5 L14.8 7.1 L13.4 8.6 L10.2 8.9 L7.8 8.4 Z" fill="#D57800" />
          {/* Crossed Green Olive Branches */}
          <path d="M7.8 11.4 Q12 13.4 16.2 10.6" fill="none" stroke="#3E6B28" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M16.2 11.4 Q12 13.4 7.8 10.6" fill="none" stroke="#3E6B28" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );
    case 'albania_eagle':
      return (
        <path
          d="M12 3.2 L10.4 4.8 L8.4 4.2 L9 6.6 L7.5 8.4 L10.2 9.4 L10.6 12.6 L12 11.2 L13.4 12.6 L13.8 9.4 L16.5 8.4 L15 6.6 L15.6 4.2 L13.6 4.8 Z"
          fill="#0F172A"
        />
      );
    case 'serbia_eagle':
    case 'croatia_check':
    case 'spain_crest':
    case 'portugal_crest':
    case 'slovakia_cross':
    case 'slovenia_triglav':
    case 'eagle_crown': {
      const fillHex =
        kind === 'croatia_check'
          ? '#DC2626'
          : kind === 'portugal_crest'
          ? '#FACC15'
          : kind === 'spain_crest'
          ? '#991B1B'
          : '#FACC15';
      const xPos = kind === 'portugal_crest' || kind === 'slovakia_cross' || kind === 'spain_crest' ? 7.6 : 10.2;
      return (
        <g>
          <rect x={xPos} y="5.1" width="3.6" height="5.4" rx="1" fill={fillHex} stroke="#FFFFFF" strokeWidth="0.45" />
          <rect x={xPos + 1.1} y="6.1" width="1.4" height="3.2" fill="#FFFFFF" />
        </g>
      );
    }
    case 'kosovo_map':
      return (
        <g>
          <path d="M10.5 6.2 L12.8 5.6 L14.4 7.8 L12.4 10.5 L9.8 9.2 Z" fill="#D0A650" />
          <circle cx="9.2" cy="3.8" r="0.55" fill="#FFF" />
          <circle cx="10.8" cy="3.2" r="0.55" fill="#FFF" />
          <circle cx="12.5" cy="3.0" r="0.55" fill="#FFF" />
          <circle cx="14.2" cy="3.4" r="0.55" fill="#FFF" />
        </g>
      );
    case 'bosnia_triangle':
      return (
        <g>
          <polygon points="7.5,0 18.5,0 18.5,14" fill="#FECB00" />
          <circle cx="6.2" cy="2.6" r="0.7" fill="#FFF" />
          <circle cx="8.6" cy="5.5" r="0.7" fill="#FFF" />
          <circle cx="11.0" cy="8.4" r="0.7" fill="#FFF" />
          <circle cx="13.4" cy="11.3" r="0.7" fill="#FFF" />
        </g>
      );
    case 'maple':
      return (
        <polygon
          points="12,3.4 13.1,6.2 15.6,5.5 14.2,8.1 15.8,9.4 12.7,9.4 12.7,12.5 11.3,12.5 11.3,9.4 8.2,9.4 9.8,8.1 8.4,5.5 10.9,6.2"
          fill="#FF0000"
        />
      );
    case 'crescent_star':
    case 'crescent_star_left': {
      const cx = kind === 'crescent_star_left' ? 5.6 : 11.6;
      const cy = kind === 'crescent_star_left' ? 4.4 : 8;
      const r = kind === 'crescent_star_left' ? 2.1 : 3.2;
      return (
        <g fill={colors[1] === '#FFFFFF' || colors[1] === '#FFDE00' ? colors[1] : '#FFFFFF'}>
          <circle cx={cx} cy={cy} r={r} />
          <circle cx={cx + r * 0.4} cy={cy} r={r * 0.78} fill={colors[0]} />
          <circle cx={cx + r * 1.1} cy={cy} r={r * 0.35} />
        </g>
      );
    }
    case 'star_center':
      return <circle cx="12" cy="8" r="2.3" fill={colors[1] === '#000000' ? '#FACC15' : colors[1] ?? '#FACC15'} />;
    case 'star_canton':
      return (
        <g>
          <rect x="0" y="0" width="9" height="8" fill={colors[2] ?? colors[0]} />
          <circle cx="4.5" cy="4" r="1.9" fill="#FFDE00" />
        </g>
      );
    case 'sun_disc':
    case 'argentina_sun':
    case 'uruguay_sun':
    case 'kazakh_sun':
    case 'kyrgyz_sun':
      return (
        <circle
          cx={kind === 'uruguay_sun' ? 4.6 : 12}
          cy={kind === 'uruguay_sun' ? 4.4 : 8}
          r={kind === 'uruguay_sun' ? 2.1 : 3.7}
          fill={colors[1] ?? '#FACC15'}
        />
      );
    case 'taegeuk':
      return (
        <g>
          <circle cx="12" cy="8" r="3.6" fill="#CD2E3A" />
          <path d="M8.4 8 A3.6 3.6 0 0 0 15.6 8 Z" fill="#0047A0" />
        </g>
      );
    case 'taiwan_canton':
      return (
        <g>
          <rect x="0" y="0" width="11" height="8" fill="#000095" />
          <circle cx="5.5" cy="4" r="2.2" fill="#FFFFFF" />
        </g>
      );
    case 'israel_star':
      return (
        <g fill="none" stroke="#0038B8" strokeWidth="0.9">
          <polygon points="12,4.4 15.1,9.9 8.9,9.9" />
          <polygon points="12,11.6 8.9,6.1 15.1,6.1" />
        </g>
      );
    case 'cedar':
      return <polygon points="12,4.2 15.2,9.8 13,9.8 13,11.6 11,11.6 11,9.8 8.8,9.8" fill="#00A651" />;
    case 'chakra':
      return <circle cx="12" cy="8" r="2.2" fill="none" stroke="#000080" strokeWidth="0.9" />;
    case 'brazil_globe':
      return (
        <g>
          <polygon points="12,2.2 21,8 12,13.8 3,8" fill="#FFDF00" />
          <circle cx="12" cy="8" r="3.2" fill="#002776" />
        </g>
      );
    case 'mexico_eagle':
      return <circle cx="12" cy="8" r="2.2" fill="#8B5A2B" />;
    case 'antarctica_compass':
      return (
        <g>
          <polygon points="12,2.5 16.5,8.2 12,13.5 7.5,8.2" fill="#FFFFFF" opacity="0.95" />
          <circle cx="12" cy="8.2" r="1.4" fill="#1B4F9C" />
        </g>
      );
    case 'south_africa_y':
      return (
        <path
          d="M0,1.5 L8,8 L0,14.5 M8,8 L24,8"
          fill="none"
          stroke="#007749"
          strokeWidth="3.2"
        />
      );
    case 'kenya_shield':
      return <ellipse cx="12" cy="8" rx="1.8" ry="3.6" fill="#BB0000" stroke="#FFFFFF" strokeWidth="0.6" />;
    case 'saudi_sword':
      return <rect x="6" y="10.2" width="12" height="1.2" rx="0.5" fill="#FFFFFF" />;
    default:
      return <circle cx="12" cy="8" r="2.1" fill={colors[1] ?? '#FACC15'} />;
  }
}

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
  if (flag.customDataUrl) {
    return (
      <img
        src={flag.customDataUrl}
        alt={label ?? 'Custom nation flag'}
        width={width}
        height={height}
        style={{ width, height }}
        className={`inline-block shrink-0 rounded-[2px] border border-white/30 object-cover shadow-xs ${className}`}
      />
    );
  }

  const layout = resolveNormalizedLayout(flag);
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
      {layout === 'bicolor_h' && (
        <>
          <rect x="0" y="0" width="24" height="8" fill={c1} />
          <rect x="0" y="8" width="24" height="8" fill={c2} />
        </>
      )}
      {layout === 'bicolor_v' && (
        <>
          <rect x="0" y="0" width="9" height="16" fill={c1} />
          <rect x="9" y="0" width="15" height="16" fill={c2} />
        </>
      )}
      {layout === 'tricolor_h' && (
        <>
          <rect x="0" y="0" width="24" height="5.34" fill={c1} />
          <rect x="0" y="5.33" width="24" height="5.34" fill={c2} />
          <rect x="0" y="10.66" width="24" height="5.34" fill={c3 ?? c1} />
        </>
      )}
      {layout === 'tricolor_v' && (
        <>
          <rect x="0" y="0" width="8" height="16" fill={c1} />
          <rect x="8" y="0" width="8" height="16" fill={c2} />
          <rect x="16" y="0" width="8" height="16" fill={c3 ?? c1} />
        </>
      )}
      {(layout === 'nordic' || layout === 'cross') && (
        <>
          <rect x="0" y="0" width="24" height="16" fill={c1} />
          <rect x={layout === 'nordic' ? 7 : 10} y="0" width="3.2" height="16" fill={c3 ?? c2} />
          <rect x="0" y="6.4" width="24" height="3.2" fill={c3 ?? c2} />
          {c3 && (
            <>
              <rect x={layout === 'nordic' ? 7.8 : 10.8} y="0" width="1.6" height="16" fill={c2} />
              <rect x="0" y="7.2" width="24" height="1.6" fill={c2} />
            </>
          )}
        </>
      )}
      {layout === 'stripes' && (
        <>
          <rect x="0" y="0" width="24" height="16" fill={c1} />
          <rect x="0" y="2.6" width="24" height="2.4" fill={c2} />
          <rect x="0" y="7.0" width="24" height="2.4" fill={c2} />
          <rect x="0" y="11.4" width="24" height="2.4" fill={c2} />
        </>
      )}
      {layout === 'solid' && <rect x="0" y="0" width="24" height="16" fill={c1} />}
      {layout === 'diagonal' && (
        <>
          <rect x="0" y="0" width="24" height="16" fill={c1} />
          <polygon points="0,16 24,0 24,4.5 4.5,16" fill={c3 ?? c2} />
          <polygon points="0,13.5 21.5,0 24,0 24,2.5 2.5,16 0,16" fill={c2} />
        </>
      )}
      <SvgEmblem kind={flag.emblemKind} colors={flag.colors} borderHex={flag.borderHex} />
      {flag.emblemColor && !flag.emblemKind && <circle cx="12" cy="8" r="2.1" fill={flag.emblemColor} />}
    </svg>
  );
}

const CUSTOM_FLAG_IMAGE_CACHE = new Map<string, HTMLImageElement>();

function getCachedCustomImage(url: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  let img = CUSTOM_FLAG_IMAGE_CACHE.get(url);
  if (!img) {
    img = new Image();
    img.src = url;
    CUSTOM_FLAG_IMAGE_CACHE.set(url, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

// Direct Canvas2D flag renderer for high-refresh-rate world map labels
export function drawCanvasFlag(
  ctx: CanvasRenderingContext2D,
  flag: FlagPattern,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  if (flag.customDataUrl) {
    const img = getCachedCustomImage(flag.customDataUrl);
    if (img) {
      ctx.save();
      ctx.drawImage(img, x, y, w, h);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(x, y, w, h);
      return;
    }
  }

  const layout = resolveNormalizedLayout(flag);
  const [c1, c2, c3] = flag.colors;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  if (layout === 'bicolor_h') {
    ctx.fillStyle = c1;
    ctx.fillRect(x, y, w, h * 0.5);
    ctx.fillStyle = c2;
    ctx.fillRect(x, y + h * 0.5, w, h * 0.5);
  } else if (layout === 'bicolor_v') {
    ctx.fillStyle = c1;
    ctx.fillRect(x, y, w * 0.38, h);
    ctx.fillStyle = c2;
    ctx.fillRect(x + w * 0.38, y, w * 0.62, h);
  } else if (layout === 'tricolor_h') {
    ctx.fillStyle = c1;
    ctx.fillRect(x, y, w, h / 3);
    ctx.fillStyle = c2;
    ctx.fillRect(x, y + h / 3, w, h / 3);
    ctx.fillStyle = c3 ?? c1;
    ctx.fillRect(x, y + (h * 2) / 3, w, h / 3);
  } else if (layout === 'tricolor_v') {
    ctx.fillStyle = c1;
    ctx.fillRect(x, y, w / 3, h);
    ctx.fillStyle = c2;
    ctx.fillRect(x + w / 3, y, w / 3, h);
    ctx.fillStyle = c3 ?? c1;
    ctx.fillRect(x + (w * 2) / 3, y, w / 3, h);
  } else if (layout === 'nordic' || layout === 'cross') {
    const cx = layout === 'nordic' ? 0.3 : 0.42;
    ctx.fillStyle = c1;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = c3 ?? c2;
    ctx.fillRect(x + w * cx, y, w * 0.14, h);
    ctx.fillRect(x, y + h * 0.4, w, h * 0.2);
    if (c3) {
      ctx.fillStyle = c2;
      ctx.fillRect(x + w * (cx + 0.03), y, w * 0.08, h);
      ctx.fillRect(x, y + h * 0.45, w, h * 0.1);
    }
  } else if (layout === 'stripes') {
    ctx.fillStyle = c1;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = c2;
    ctx.fillRect(x, y + h * 0.18, w, h * 0.16);
    ctx.fillRect(x, y + h * 0.48, w, h * 0.16);
    ctx.fillRect(x, y + h * 0.78, w, h * 0.16);
  } else if (layout === 'solid') {
    ctx.fillStyle = c1;
    ctx.fillRect(x, y, w, h);
  } else {
    ctx.fillStyle = c1;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = c2;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h * 0.25);
    ctx.lineTo(x + w * 0.25, y + h);
    ctx.closePath();
    ctx.fill();
  }

  // Canvas2D authentic miniature emblem rendering
  const ek = flag.emblemKind;
  if (ek === 'czech_wedge') {
    ctx.fillStyle = c3 ?? '#11457E';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w * 0.48, y + h * 0.5);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
  } else if (ek === 'montenegro_eagle') {
    if (flag.borderHex) {
      ctx.strokeStyle = flag.borderHex;
      ctx.lineWidth = 1.3;
      ctx.strokeRect(x + 0.6, y + 0.6, w - 1.2, h - 1.2);
    }
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.26, 0, Math.PI * 2);
    ctx.fill();
  } else if (ek === 'cyprus_island') {
    ctx.fillStyle = '#D57800';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.45, w * 0.2, h * 0.16, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3E6B28';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.34, y + h * 0.72);
    ctx.lineTo(x + w * 0.66, y + h * 0.72);
    ctx.stroke();
  } else if (ek === 'usa_stars' || ek === 'union_jack' || ek === 'greek_cross' || ek === 'taiwan_canton') {
    ctx.fillStyle = ek === 'greek_cross' ? c1 : ek === 'usa_stars' ? '#3C3B6E' : '#012169';
    ctx.fillRect(x, y, w * 0.44, h * 0.52);
    if (ek === 'union_jack' || ek === 'greek_cross') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + w * 0.18, y, w * 0.08, h * 0.52);
      ctx.fillRect(x, y + h * 0.22, w * 0.44, h * 0.08);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x + w * 0.22, y + h * 0.26, h * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ek === 'sun_disc' || ek === 'argentina_sun' || ek === 'brazil_globe' || ek === 'antarctica_compass') {
    ctx.fillStyle = c2 ?? '#FACC15';
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.24, 0, Math.PI * 2);
    ctx.fill();
  } else if (ek && ek !== 'none') {
    ctx.fillStyle = flag.emblemColor ?? c2 ?? '#FACC15';
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.17, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  ctx.strokeStyle = flag.borderHex ?? 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x, y, w, h);
}
