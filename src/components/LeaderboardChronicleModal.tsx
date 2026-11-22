import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Award, Crown, Film, Globe2, Pause, Play, ScrollText, Swords, Trophy, X } from 'lucide-react';
import { loadHallOfFame } from '../game/account';
import { computeCountrySummaries } from '../game/combat';
import { WORLD_HEIGHT, WORLD_WIDTH, buildWorldMapData } from '../game/mapGen';
import { glassClass } from '../game/performance';
import type { EffectiveTier, GameState, Language } from '../game/types';
import { MONTHS, type Translations } from '../i18n/translations';
import { FlagBadge } from './FlagBadge';

type SortKey = 'power' | 'area' | 'army' | 'treasury';
export type ModalTab = 'powers' | 'chronicle' | 'timelapse' | 'hall_of_fame';

export function LeaderboardChronicleModal({
  isOpen,
  onClose,
  state,
  initialTab = 'powers',
  effectiveTier,
  lang,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  state: GameState | null;
  initialTab?: ModalTab;
  effectiveTier: EffectiveTier;
  lang: Language;
  t: Translations;
}) {
  const [tab, setTab] = useState<ModalTab>(initialTab);
  const [sortBy, setSortBy] = useState<SortKey>('power');
  const [snapIdx, setSnapIdx] = useState<number>(0);
  const [playingTimelapse, setPlayingTimelapse] = useState(false);
  const timelapseCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapData = useMemo(() => buildWorldMapData(), []);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setSnapIdx(0);
      setPlayingTimelapse(false);
    }
  }, [isOpen, initialTab]);

  const hallOfFame = useMemo(() => (isOpen ? loadHallOfFame() : []), [isOpen]);
  const snapshots = state?.timelapseSnapshots ?? [];
  const clampedIdx = Math.min(snapIdx, Math.max(0, snapshots.length - 1));

  useEffect(() => {
    if (!isOpen || tab !== 'timelapse' || !playingTimelapse || snapshots.length <= 1) return;
    const timer = window.setInterval(() => {
      setSnapIdx((prev) => {
        if (prev + 1 >= snapshots.length) {
          setPlayingTimelapse(false);
          return prev;
        }
        return prev + 1;
      });
    }, 650);
    return () => window.clearInterval(timer);
  }, [isOpen, tab, playingTimelapse, snapshots.length]);

  useEffect(() => {
    if (!isOpen || tab !== 'timelapse' || !state) return;
    const canvas = timelapseCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const snap = snapshots[clampedIdx];
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#060B16';
    ctx.fillRect(0, 0, w, h);

    const sx = w / WORLD_WIDTH;
    const sy = h / WORLD_HEIGHT;

    for (const geom of mapData.provinces) {
      const ownerId =
        snap?.owners[geom.id] ?? state.provinces[geom.id]?.ownerId ?? geom.countryOrigId;
      const color = state.countries[ownerId]?.color ?? '#64748B';
      ctx.fillStyle = color;
      ctx.beginPath();
      for (const ring of geom.rings) {
        if (ring.length < 3) continue;
        ctx.moveTo(ring[0][0] * sx, ring[0][1] * sy);
        for (let i = 1; i < ring.length; i++) {
          ctx.lineTo(ring[i][0] * sx, ring[i][1] * sy);
        }
        ctx.closePath();
      }
      ctx.fill();
      ctx.strokeStyle = '#070C17';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }, [isOpen, tab, state, snapshots, clampedIdx, mapData]);

  const rankedCountries = useMemo(() => {
    if (!state) return [];
    const summaries = computeCountrySummaries(state);
    const list = Object.values(summaries).filter((s) => s.provinceCount > 0);
    list.sort((a, b) => {
      if (sortBy === 'area') return b.areaKm2 - a.areaKm2;
      if (sortBy === 'army') return b.totalArmy - a.totalArmy;
      if (sortBy === 'treasury') return b.treasury - a.treasury;
      return b.powerScore - a.powerScore;
    });
    return list;
  }, [state, sortBy]);

  if (!isOpen) return null;

  const activeTab: ModalTab = !state && tab !== 'hall_of_fame' ? 'hall_of_fame' : tab;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-modal-title"
    >
      <div
        className={`w-full max-w-3xl rounded-2xl border overflow-hidden flex flex-col max-h-[88vh] ${glassClass(
          effectiveTier,
        )}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Trophy size={19} className="text-amber-400" />
            <h2 id="leaderboard-modal-title" className="font-display text-base font-bold text-white">
              {t.leaderboardTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={`grid ${
            state ? 'grid-cols-4' : 'grid-cols-1'
          } border-b border-slate-800/80 bg-slate-950/40 text-xs font-bold`}
        >
          {state && (
            <button
              type="button"
              onClick={() => setTab('powers')}
              className={`flex items-center justify-center gap-1.5 py-2.5 border-b-2 cursor-pointer ${
                activeTab === 'powers'
                  ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe2 size={14} />
              {t.powersTab}
            </button>
          )}
          {state && (
            <button
              type="button"
              onClick={() => setTab('chronicle')}
              className={`flex items-center justify-center gap-1.5 py-2.5 border-b-2 cursor-pointer ${
                activeTab === 'chronicle'
                  ? 'border-sky-400 text-sky-300 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ScrollText size={14} />
              {t.chronicleTab} ({state.chronicle.length})
            </button>
          )}
          {state && (
            <button
              type="button"
              onClick={() => setTab('timelapse')}
              className={`flex items-center justify-center gap-1.5 py-2.5 border-b-2 cursor-pointer ${
                activeTab === 'timelapse'
                  ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film size={14} />
              {t.timelapseTab} ({snapshots.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => setTab('hall_of_fame')}
            className={`flex items-center justify-center gap-1.5 py-2.5 border-b-2 cursor-pointer ${
              activeTab === 'hall_of_fame'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown size={14} />
            {t.hallOfFameTab}
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto gs-scroll flex-1">
          {activeTab === 'powers' && state && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    ['power', t.sortPower],
                    ['area', t.sortArea],
                    ['army', t.sortArmy],
                    ['treasury', t.sortTreasury],
                  ] as Array<[SortKey, string]>
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSortBy(key)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                      sortBy === key
                        ? 'border-amber-400/70 bg-amber-500/15 text-amber-200'
                        : 'border-slate-700/70 bg-slate-900/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                {rankedCountries.slice(0, 40).map((s, idx) => {
                  const country = state.countries[s.countryId];
                  if (!country) return null;
                  const isPlayer = s.countryId === state.playerCountryId;
                  return (
                    <div
                      key={s.countryId}
                      className={`grid grid-cols-12 items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                        isPlayer
                          ? 'border-amber-400/60 bg-amber-500/10'
                          : 'border-slate-800/80 bg-slate-950/50'
                      }`}
                    >
                      <div className="col-span-1 font-mono-num font-bold text-slate-400">
                        #{idx + 1}
                      </div>
                      <div className="col-span-4 flex items-center gap-2 min-w-0">
                        <FlagBadge
                          flag={country.flag}
                          label={country.displayName || country.name[lang]}
                          width={22}
                          height={14}
                        />
                        <span className="font-semibold text-white truncate">
                          {country.displayName || country.name[lang]}
                        </span>
                      </div>
                      <div className="col-span-2 text-right font-mono-num text-slate-300">
                        {s.areaKm2.toLocaleString(lang === 'en' ? 'en-US' : 'pl-PL')} km²
                      </div>
                      <div className="col-span-2 text-right font-mono-num text-emerald-300">
                        {s.totalArmy.toLocaleString(lang === 'en' ? 'en-US' : 'pl-PL')}
                      </div>
                      <div className="col-span-1 text-right font-mono-num text-amber-300">
                        {s.treasury.toFixed(0)}
                      </div>
                      <div className="col-span-2 text-right font-mono-num font-bold text-sky-300">
                        {Math.round(s.powerScore / 1000).toLocaleString(lang === 'en' ? 'en-US' : 'pl-PL')}k
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'chronicle' && state && (
            <div className="space-y-2">
              {state.chronicle.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-center text-xs text-slate-400">
                  {t.noChronicle}
                </div>
              ) : (
                state.chronicle.map((entry) => {
                  const badgeColor =
                    entry.type === 'war'
                      ? 'text-rose-300 border-rose-500/35 bg-rose-500/10'
                      : entry.type === 'peace'
                      ? 'text-emerald-300 border-emerald-500/35 bg-emerald-500/10'
                      : entry.type === 'conquest'
                      ? 'text-amber-300 border-amber-500/35 bg-amber-500/10'
                      : 'text-sky-300 border-sky-500/35 bg-sky-500/10';
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 text-xs"
                    >
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded border font-mono-num text-[10px] font-bold ${badgeColor}`}
                      >
                        T{entry.turn} · {MONTHS[lang][entry.monthIndex]?.slice(0, 3)} {entry.year}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Swords size={12} className="text-slate-400 shrink-0" />
                          {entry.title}
                        </div>
                        <div className="text-slate-300 mt-0.5">{entry.detail}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'timelapse' && state && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-800 bg-[#060B16] overflow-hidden">
                <canvas
                  ref={timelapseCanvasRef}
                  width={760}
                  height={380}
                  className="w-full h-auto block"
                />
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (clampedIdx >= snapshots.length - 1) setSnapIdx(0);
                    setPlayingTimelapse((p) => !p);
                  }}
                  disabled={snapshots.length <= 1}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 disabled:opacity-40 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  {playingTimelapse ? <Pause size={13} /> : <Play size={13} />}
                  <span>
                    {playingTimelapse
                      ? t.speedPaused
                      : lang === 'en'
                      ? 'Replay'
                      : 'Odtwórz'}
                  </span>
                </button>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, snapshots.length - 1)}
                  value={clampedIdx}
                  onChange={(e) => {
                    setPlayingTimelapse(false);
                    setSnapIdx(Number(e.target.value));
                  }}
                  className="flex-1 accent-purple-400 cursor-pointer"
                />
                <div className="text-xs font-mono-num font-bold text-purple-200 shrink-0">
                  {snapshots[clampedIdx]
                    ? `${MONTHS[lang][snapshots[clampedIdx].monthIndex]?.slice(0, 3)} ${
                        snapshots[clampedIdx].year
                      } (Day ${snapshots[clampedIdx].totalDays})`
                    : `${MONTHS[lang][state.monthIndex]?.slice(0, 3)} ${state.year}`}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hall_of_fame' && (
            <div className="space-y-2">
              {hallOfFame.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-center text-xs text-slate-400">
                  {t.noHallOfFame}
                </div>
              ) : (
                hallOfFame.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-950/55 px-4 py-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono-num font-bold text-amber-400">#{idx + 1}</span>
                      <Award size={16} className="text-sky-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">
                          {entry.nickname} · <span className="text-amber-300">{entry.countryName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono-num">
                          {entry.accountId} · {entry.scenarioId} · {t.turn} {entry.turns}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono-num">
                      <div className="font-bold text-emerald-300">
                        {entry.areaKm2.toLocaleString(lang === 'en' ? 'en-US' : 'pl-PL')} km²
                      </div>
                      <div className="text-[11px] text-sky-300">
                        {Math.round(entry.powerScore / 1000).toLocaleString(lang === 'en' ? 'en-US' : 'pl-PL')}k pts
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
