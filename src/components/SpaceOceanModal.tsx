import React, { useState } from 'react';
import { CheckCircle2, Lock, Orbit, Rocket, Waves, X } from 'lucide-react';
import {
  SPACE_OCEAN_NODES,
  SPACE_OCEAN_STAGES,
  type SpaceOceanStageId,
} from '../data/spaceSectors';
import { TECH_NODE_MAP } from '../data/techTree';
import { glassClass } from '../game/performance';
import type { EffectiveTier, GameState, Language } from '../game/types';
import type { Translations } from '../i18n/translations';

export function SpaceOceanModal({
  isOpen,
  onClose,
  state,
  onFundColony,
  t,
  lang,
  effectiveTier = 'ultra',
}: {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
  onFundColony: (nodeId: string) => void;
  t: Translations;
  lang: Language;
  effectiveTier?: EffectiveTier;
}) {
  const [stage, setStage] = useState<SpaceOceanStageId>('earth_orbit');
  if (!isOpen) return null;

  const player = state.countries[state.playerCountryId];
  if (!player) return null;

  const activeStageMeta = SPACE_OCEAN_STAGES.find((s) => s.id === stage) ?? SPACE_OCEAN_STAGES[0];
  const stageNodes = SPACE_OCEAN_NODES.filter((n) => n.stage === stage);
  const hasSpaceport = Object.values(state.provinces).some(
    (p) => p.ownerId === player.id && p.buildings.includes('spaceport'),
  );

  return (
    <div
      data-testid="space-ocean-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="space-ocean-title"
    >
      <div
        className={`w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${glassClass(
          effectiveTier,
        )}`}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/75">
          <div className="flex items-center gap-2.5">
            <Rocket size={18} className="text-orange-400" />
            <div>
              <h2 id="space-ocean-title" className="font-display text-base sm:text-lg font-bold text-white">
                Blocks™ {t.spaceOceanBtn} Agency
              </h2>
              <div className="text-[11px] text-slate-400 font-mono-num">
                Active Colonies: {player.spaceColonies.length}/{SPACE_OCEAN_NODES.length} · Spaceport:{' '}
                {hasSpaceport ? 'READY' : 'Required for orbital/planetary launches'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stage Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-slate-800/80 bg-slate-950/50 text-xs font-bold">
          {SPACE_OCEAN_STAGES.map((st) => {
            const count = SPACE_OCEAN_NODES.filter(
              (n) => n.stage === st.id && player.spaceColonies.includes(n.id),
            ).length;
            const total = SPACE_OCEAN_NODES.filter((n) => n.stage === st.id).length;
            const active = stage === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setStage(st.id)}
                className={`py-2.5 px-2 flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
                  active
                    ? 'border-amber-400 bg-slate-900/80 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.id === 'deep_ocean_europa' ? (
                  <Waves size={13} style={{ color: st.accent }} />
                ) : (
                  <Orbit size={13} style={{ color: st.accent }} />
                )}
                <span className="truncate">{st.label[lang]}</span>
                <span className="text-[10px] font-mono-num text-slate-400">
                  {count}/{total}
                </span>
              </button>
            );
          })}
        </div>

        {/* Frontier Canvas + Cards */}
        <div className="p-5 overflow-y-auto gs-scroll space-y-4">
          {/* Stylized Planetary/Oceanic SVG Diorama */}
          <div className="relative h-52 rounded-2xl border border-slate-800 bg-[#040812] overflow-hidden">
            <svg viewBox="0 0 800 220" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="planetGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={activeStageMeta.accent} stopOpacity="0.34" />
                  <stop offset="100%" stopColor="#040812" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="800" height="220" fill="#040812" />
              {/* Starfield */}
              {[45, 110, 190, 260, 340, 420, 510, 595, 675, 745].map((sx, idx) => (
                <circle
                  key={sx}
                  cx={sx}
                  cy={24 + ((idx * 37) % 160)}
                  r={idx % 3 === 0 ? 1.8 : 1.1}
                  fill="#E2E8F0"
                  fillOpacity="0.45"
                />
              ))}
              {/* Central celestial / abyssal body */}
              <circle cx="400" cy="110" r="145" fill="url(#planetGlow)" />
              <ellipse
                cx="400"
                cy="115"
                rx="280"
                ry="54"
                fill="none"
                stroke={activeStageMeta.accent}
                strokeOpacity="0.35"
                strokeDasharray="6 4"
              />
              <circle
                cx="400"
                cy="112"
                r="64"
                fill="#0B1328"
                stroke={activeStageMeta.accent}
                strokeWidth="2.5"
              />
              <path
                d="M348 100 Q400 72 452 108 M352 128 Q402 146 446 122"
                fill="none"
                stroke={activeStageMeta.accent}
                strokeOpacity="0.45"
                strokeWidth="2"
              />
            </svg>

            {/* Plotted colony beacons */}
            {stageNodes.map((node) => {
              const built = player.spaceColonies.includes(node.id);
              return (
                <div
                  key={node.id}
                  style={{ left: `${node.xPct}%`, top: `${node.yPct}%` }}
                  className="-translate-x-1/2 -translate-y-1/2 absolute px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-950/90 text-[11px] font-bold text-white shadow-lg flex items-center gap-1.5"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: built ? '#10B981' : activeStageMeta.accent }}
                  />
                  <span>{node.name[lang]}</span>
                </div>
              );
            })}

            <div className="absolute bottom-2.5 left-3 right-3 text-center text-xs text-slate-300">
              {activeStageMeta.description[lang]}
            </div>
          </div>

          {/* Colony Construction Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {stageNodes.map((node) => {
              const built = player.spaceColonies.includes(node.id);
              const techMet = player.unlockedTechs.includes(node.requiredTech);
              const portOk = node.stage === 'deep_ocean_europa' || hasSpaceport;
              const canBuild = !built && techMet && portOk && player.treasury >= node.costPln;
              const reqTitle = TECH_NODE_MAP[node.requiredTech]?.title[lang] ?? node.requiredTech;

              return (
                <div
                  key={node.id}
                  className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${
                    built
                      ? 'border-emerald-500/50 bg-emerald-950/25'
                      : 'border-slate-800 bg-slate-950/70'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-sm font-bold text-white">{node.name[lang]}</h3>
                      {built ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 size={14} /> Operational
                        </span>
                      ) : (
                        <span className="font-mono-num text-xs font-bold text-amber-300">
                          {node.costPln} PLN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">{node.subtitle[lang]}</p>
                    <div className="flex flex-wrap gap-2 text-[11px] font-mono-num pt-1">
                      <span className="text-emerald-300">+{node.incomePerMonth} PLN/mo</span>
                      <span className="text-sky-300">+{node.researchPerMonth} RP/mo</span>
                      <span className="text-amber-300">+{Math.round(node.powerBonus / 1000)}k Power</span>
                    </div>
                    {!built && (
                      <div className="text-[11px] text-slate-400 pt-1">
                        Requires Tech: <span className={techMet ? 'text-emerald-300' : 'text-rose-300'}>{reqTitle}</span>
                        {node.stage !== 'deep_ocean_europa' && (
                          <span>
                            {' '}
                            · Spaceport:{' '}
                            <span className={hasSpaceport ? 'text-emerald-300' : 'text-rose-300'}>
                              {hasSpaceport ? 'Built' : 'Missing'}
                            </span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {!built && (
                    <button
                      type="button"
                      disabled={!canBuild}
                      onClick={() => onFundColony(node.id)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-extrabold cursor-pointer"
                    >
                      {!techMet || !portOk ? <Lock size={13} /> : <Rocket size={13} />}
                      Establish Colony ({node.costPln} PLN)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
