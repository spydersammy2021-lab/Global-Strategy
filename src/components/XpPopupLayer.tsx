import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { XpPopupEvent } from '../game/types';

export function XpPopupLayer({ popups }: { popups: XpPopupEvent[] }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (popups.length === 0) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [popups.length]);

  const active = popups.filter((p) => now - p.createdAt < 2600).slice(0, 4);
  if (active.length === 0) return null;

  return (
    <div
      data-testid="xp-popup-layer"
      aria-live="polite"
      className="pointer-events-none fixed top-14 left-16 z-40 flex flex-col gap-1"
    >
      {active.map((p) => (
        <div
          key={p.id}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-400/75 bg-slate-950/90 text-amber-300 shadow-[0_0_16px_rgba(250,204,21,0.35)] text-[11px] font-mono-num font-extrabold animate-bounce"
        >
          <Sparkles size={11} className="text-yellow-300 shrink-0" />
          <span>+{p.amount} XP</span>
          <span className="text-slate-300 font-sans font-semibold text-[10px]">{p.reason}</span>
        </div>
      ))}
    </div>
  );
}
