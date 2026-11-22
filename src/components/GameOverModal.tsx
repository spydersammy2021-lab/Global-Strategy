import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Award, Flag, Pause, Play, RotateCcw, ShieldAlert, Trophy } from 'lucide-react';
import { computeCountrySummaries } from '../game/combat';
import { WORLD_HEIGHT, WORLD_WIDTH, buildWorldMapData } from '../game/mapGen';
import { glassClass } from '../game/performance';
import type { EffectiveTier, GameState, Language } from '../game/types';
import { MONTHS, type Translations } from '../i18n/translations';

// Vector Honorary Grand Strategist Medal (Victory only, zero skulls anywhere)
function GrandStrategistMedalSvg() {
  return (
    <svg width="78" height="78" viewBox="0 0 84 84" fill="none" aria-hidden="true" className="mx-auto drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
      <defs>
        <linearGradient id="medalGold" x1="18" y1="22" x2="66" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      {/* Ribbon */}
      <path d="M27 6H57L51 30H33L27 6Z" fill="#0EA5E9" stroke="#F59E0B" strokeWidth="1.5" />
      <path d="M36 6H48L46 30H38L36 6Z" fill="#FBBF24" />
      {/* Laurel Wreath */}
      <circle cx="42" cy="52" r="24" fill="#091124" stroke="url(#medalGold)" strokeWidth="3.2" />
      <circle cx="42" cy="52" r="19" fill="#0F172A" stroke="#FEF08A" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 2" />
      {/* Center Star & Crossed Sabers */}
      <path
        d="M42 36L46.2 46.2L57 47L48.7 54L51.3 64.6L42 58.8L32.7 64.6L35.3 54L27 47L37.8 46.2L42 36Z"
        fill="url(#medalGold)"
        stroke="#78350F"
        strokeWidth="1"
      />
    </svg>
  );
}

// Note: Strictly ZERO skull icons anywhere on Defeat screen per user specification
export function GameOverModal({
  state,
  t,
  lang = 'en',
  effectiveTier = 'ultra',
  onContinueEternal,
  onPlayAgain,
  onBackToMenu,
}: {
  state: GameState;
  t: Translations;
  lang?: Language;
  effectiveTier?: EffectiveTier;
  onContinueEternal?: () => void;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}) {
  const snapshots = state.timelapseSnapshots ?? [];
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState<1 | 2 | 4>(2);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapData = useMemo(() => buildWorldMapData(), []);

  useEffect(() => {
    setFrameIdx(Math.max(0, snapshots.length - 1));
    setPlaying(false);
  }, [state.outcome, snapshots.length]);

  useEffect(() => {
    if (!playing || snapshots.length <= 1) return;
    const ms = replaySpeed === 4 ? 120 : replaySpeed === 2 ? 260 : 520;
    const timer = window.setInterval(() => {
      setFrameIdx((prev) => {
        if (prev >= snapshots.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, ms);
    return () => window.clearInterval(timer);
  }, [playing, replaySpeed, snapshots.length]);

  useEffect(() => {
    if (state.outcome === 'ongoing' || snapshots.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const snap = snapshots[Math.min(frameIdx, snapshots.length - 1)];
    if (!snap) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#060E1F';
    ctx.fillRect(0, 0, w, h);

    const sx = w / WORLD_WIDTH;
    const sy = h / WORLD_HEIGHT;
    ctx.save();
    ctx.scale(sx, sy);
    for (const geom of mapData.provinces) {
      const ownerId = snap.owners[geom.id] ?? geom.countryOrigId;
      ctx.fillStyle = state.countries[ownerId]?.color ?? '#475569';
      ctx.beginPath();
      for (const ring of geom.rings) {
        if (ring.length < 3) continue;
        ctx.moveTo(ring[0][0], ring[0][1]);
        for (let i = 1; i < ring.length; i++) ctx.lineTo(ring[i][0], ring[i][1]);
        ctx.closePath();
      }
      ctx.fill();
    }
    ctx.restore();
  }, [state.outcome, state.countries, snapshots, frameIdx, mapData]);

  if (state.outcome === 'ongoing') return null;

  const isSpectator = state.gameMode === 'bot_spectator';
  const isVictory = state.outcome === 'victory';
  const leader = isSpectator
    ? Object.values(computeCountrySummaries(state))
        .filter((s) => s.provinceCount > 0)
        .sort((a, b) => b.provinceCount - a.provinceCount)[0]
    : null;
  const leaderName = leader ? state.countries[leader.countryId]?.displayName : null;
  const snap = snapshots[Math.min(frameIdx, Math.max(0, snapshots.length - 1))];

  return (
    <div
      data-testid="gameover-modal"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isVictory ? 'bg-slate-950/85' : 'bg-rose-950/85'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-title"
    >
      <div
        className={`w-full max-w-xl rounded-2xl border p-6 text-center shadow-2xl max-h-[92vh] overflow-y-auto gs-scroll ${
          isVictory
            ? `${glassClass(effectiveTier)} border-amber-500/60`
            : 'border-rose-500/70 bg-[#2A090F]/95'
        }`}
      >
        {isVictory ? (
          <div className="mb-3 space-y-2">
            <GrandStrategistMedalSvg />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-amber-400/50 bg-amber-500/15 text-[11px] font-bold text-amber-200">
              <Award size={13} className="text-amber-400" />
              <span>{t.grandStrategistMedalTitle}</span>
            </div>
            <div className="text-xs font-semibold text-amber-300/90">{t.grandStrategistMedalDesc}</div>
          </div>
        ) : (
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-400/60 bg-rose-500/20 text-rose-300">
            <ShieldAlert size={32} />
          </div>
        )}

        <h2
          id="gameover-title"
          className={`font-display text-2xl font-extrabold tracking-tight ${
            isVictory ? 'text-amber-300' : 'text-rose-200'
          }`}
        >
          {isSpectator && leaderName ? leaderName : isVictory ? t.victoryTitle : t.defeatTitle}
        </h2>
        <p className="mt-1.5 text-sm text-slate-200/90">
          {isSpectator
            ? `${t.botModeLabel} — ${leaderName ?? ''} (${leader?.provinceCount ?? 0})`
            : isVictory
            ? t.victorySubtitle
            : t.defeatSubtitle}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2.5 text-left">
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">{t.turn}</div>
            <div className="mt-1 text-lg font-bold text-white font-mono-num">{state.turn}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">{t.largestTerritory}</div>
            <div className="mt-1 text-sm font-bold text-sky-300 font-mono-num">
              {(state.peakAreaKm2 / 1000).toFixed(0)}k km²
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">{t.battlesLabel}</div>
            <div className="mt-1 text-lg font-bold text-amber-300 font-mono-num">
              {state.battlesFought}
            </div>
          </div>
        </div>

        {/* Interactive Campaign Timelapse Replay Scrubber */}
        {snapshots.length > 0 && (
          <div className="mt-5 rounded-xl border border-white/15 bg-black/35 p-3 text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Trophy size={13} />
                {t.timelapseReplayLabel}
              </span>
              {snap && (
                <span className="font-mono-num text-[11px] text-slate-300">
                  {MONTHS[lang][snap.monthIndex]?.slice(0, 3)} {snap.year} · Day {snap.totalDays}
                </span>
              )}
            </div>

            <canvas
              ref={canvasRef}
              width={480}
              height={210}
              className="w-full h-auto rounded-lg border border-slate-800 bg-[#060E1F]"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (frameIdx >= snapshots.length - 1) setFrameIdx(0);
                  setPlaying((p) => !p);
                }}
                aria-label={playing ? 'Pause Timelapse' : 'Play Timelapse'}
                className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
              >
                {playing ? <Pause size={13} /> : <Play size={13} />}
              </button>

              <input
                type="range"
                min={0}
                max={Math.max(0, snapshots.length - 1)}
                value={frameIdx}
                onChange={(e) => {
                  setPlaying(false);
                  setFrameIdx(Number(e.target.value));
                }}
                aria-label={t.timelapseReplayLabel}
                className="flex-1 accent-amber-500 cursor-pointer"
              />

              <div className="flex items-center gap-1">
                {([1, 2, 4] as const).map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => setReplaySpeed(sp)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono-num font-bold cursor-pointer ${
                      replaySpeed === sp ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {sp}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isVictory && onContinueEternal && (
          <button
            type="button"
            data-testid="continue-eternal-empire-btn"
            onClick={onContinueEternal}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-slate-950 text-xs font-extrabold tracking-wide shadow-lg cursor-pointer"
          >
            <Play size={14} fill="currentColor" />
            {t.continueEternalEmpireBtn}
          </button>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onBackToMenu}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/20 bg-black/30 hover:bg-black/50 text-xs font-bold text-white cursor-pointer"
          >
            <Flag size={14} />
            {t.backToMenu}
          </button>
          <button
            type="button"
            data-start="true"
            onClick={onPlayAgain}
            className={`inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer ${
              isVictory
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-rose-500 hover:bg-rose-400 text-white'
            }`}
          >
            <RotateCcw size={14} />
            {t.playAgain}
          </button>
        </div>
      </div>
    </div>
  );
}
