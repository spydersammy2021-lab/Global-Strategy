import React, { useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
import type { BattleEvent, GameNotification } from '../game/types';

function TimedNotificationItem({
  notif,
  onDismiss,
  pauseHint,
}: {
  notif: GameNotification;
  onDismiss: (id: string) => void;
  pauseHint: string;
}) {
  const [remainingMs, setRemainingMs] = useState(8500);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const onDismissRef = useRef(onDismiss);
  const dismissedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (pausedRef.current) return;
      setRemainingMs((prev) => Math.max(0, prev - 100));
    }, 100);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (remainingMs <= 0 && !dismissedRef.current) {
      dismissedRef.current = true;
      onDismissRef.current(notif.id);
    }
  }, [remainingMs, notif.id]);

  const borderStyle =
    notif.type === 'war' || notif.type === 'defeat'
      ? 'border-rose-500/60 bg-slate-950/95'
      : notif.type === 'alliance' || notif.type === 'conquest'
      ? 'border-emerald-500/60 bg-slate-950/95'
      : 'border-amber-500/60 bg-slate-950/95';

  const progressPct = Math.max(0, Math.min(100, (remainingMs / 8500) * 100));

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      title={pauseHint}
      className={`pointer-events-auto relative w-72 rounded-xl border p-3 shadow-xl transition-transform ${borderStyle}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
          <Bell size={13} className="text-amber-400 shrink-0" />
          <span>{notif.title}</span>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(notif.id)}
          aria-label="Dismiss notification"
          className="text-slate-400 hover:text-white cursor-pointer"
        >
          <X size={13} />
        </button>
      </div>
      <div className="mt-1 text-xs text-slate-300 leading-snug">{notif.message}</div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono-num">
        <span>{paused ? '⏸ Paused' : `${(remainingMs / 1000).toFixed(1)}s`}</span>
        <div className="w-32 h-1 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full w-full origin-left bg-amber-400"
            style={{ transform: `scaleX(${progressPct / 100})` }}
          />
        </div>
      </div>
    </div>
  );
}

// Crisp Battle Report Card (animated armored gauntlets + twin morale bars render live on Canvas2D map)
export function SwordClashWidget({ battle }: { battle: BattleEvent }) {
  return (
    <div className="pointer-events-none flex items-center gap-3 rounded-xl border border-rose-500/65 bg-slate-950/95 px-4 py-2.5 shadow-2xl">
      <svg width="46" height="38" viewBox="0 0 64 48" aria-hidden="true" className="shrink-0">
        <g transform="translate(8, 22) rotate(-25)">
          <rect x="0" y="0" width="12" height="6" rx="2" fill="#64748B" />
          <rect x="12" y="-3" width="3" height="12" rx="1" fill="#F59E0B" />
          <polygon points="15,0 38,-2 41,3 15,6" fill="#F1F5F9" />
        </g>
        <g transform="translate(56, 22) scale(-1, 1) rotate(-25)">
          <rect x="0" y="0" width="12" height="6" rx="2" fill="#475569" />
          <rect x="12" y="-3" width="3" height="12" rx="1" fill="#F59E0B" />
          <polygon points="15,0 38,-2 41,3 15,6" fill="#E2E8F0" />
        </g>
        <circle cx="32" cy="14" r="3" fill="#FDE047" />
      </svg>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
          Battle Report
        </div>
        <div className="text-xs font-bold text-white">{battle.provinceName}</div>
        <div className="text-[11px] text-slate-300 font-mono-num">
          {battle.captured ? 'Captured!' : 'Repelled'} · -{battle.attackerLosses.toLocaleString('en-US')} / -{battle.defenderLosses.toLocaleString('en-US')}
        </div>
      </div>
    </div>
  );
}

export function NotificationStack({
  notifications,
  activeBattles,
  onDismiss,
  pauseHint,
}: {
  notifications: GameNotification[];
  activeBattles: BattleEvent[];
  onDismiss: (id: string) => void;
  pauseHint: string;
}) {
  return (
    <div className="pointer-events-none fixed top-16 right-14 z-30 flex flex-col items-end gap-2 max-w-[calc(100vw-6rem)]">
      {activeBattles.slice(0, 1).map((b) => (
        <SwordClashWidget key={b.id} battle={b} />
      ))}
      {notifications.slice(0, 4).map((n) => (
        <TimedNotificationItem key={n.id} notif={n} onDismiss={onDismiss} pauseHint={pauseHint} />
      ))}
    </div>
  );
}
