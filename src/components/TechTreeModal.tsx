import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  FlaskConical,
  Lock,
  Play,
  Route,
  Shield,
  Sparkles,
  Trash2,
  TrendingUp,
  Truck,
  X,
} from 'lucide-react';
import {
  TECH_NODE_MAP,
  TECH_TREE_NODES,
  canUnlockTechNode,
  planTechResearchPath,
} from '../data/techTree';
import { glassClass } from '../game/performance';
import type { EffectiveTier, GameState, Language, TechBranch, TechNodeId } from '../game/types';
import type { Translations } from '../i18n/translations';

const BRANCH_META: Array<{
  id: TechBranch;
  row: number;
  en: string;
  pl: string;
  accent: string;
  border: string;
  bg: string;
}> = [
  {
    id: 'military',
    row: 0,
    en: 'Military & Deterrence',
    pl: 'Wojsko i Odstraszanie',
    accent: '#FB7185',
    border: 'border-rose-500/45',
    bg: 'bg-rose-500/10',
  },
  {
    id: 'economy',
    row: 1,
    en: 'Economy & Industry',
    pl: 'Ekonomia i Przemysł',
    accent: '#FBBF24',
    border: 'border-amber-500/45',
    bg: 'bg-amber-500/10',
  },
  {
    id: 'logistics',
    row: 2,
    en: 'Logistics & Orbital Frontier',
    pl: 'Logistyka i Kosmos',
    accent: '#38BDF8',
    border: 'border-sky-500/45',
    bg: 'bg-sky-500/10',
  },
];

// Graph coordinate system (in SVG & CSS pixels inside scrollable canvas)
const COL_WIDTH = 154;
const ROW_HEIGHT = 124;
const NODE_W = 138;
const NODE_H = 88;
const PAD_X = 14;
const PAD_Y = 20;

function nodeCenter(branch: TechBranch, tier: number): { x: number; y: number } {
  const row = branch === 'military' ? 0 : branch === 'economy' ? 1 : 2;
  return {
    x: PAD_X + tier * COL_WIDTH + NODE_W / 2,
    y: PAD_Y + row * ROW_HEIGHT + NODE_H / 2,
  };
}

export function TechTreeModal({
  isOpen,
  onClose,
  state,
  onResearchNode,
  onPlanPath,
  onClearQueue,
  t,
  lang,
  effectiveTier = 'ultra',
}: {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
  onResearchNode: (nodeId: TechNodeId) => void;
  onPlanPath: (nodeId: TechNodeId) => void;
  onClearQueue: () => void;
  t: Translations;
  lang: Language;
  effectiveTier?: EffectiveTier;
}) {
  const [selectedId, setSelectedId] = useState<TechNodeId>('mil_doctrine');

  const player = state.countries[state.playerCountryId];
  const unlocked = useMemo(() => player?.unlockedTechs ?? [], [player?.unlockedTechs]);
  const queue = useMemo(() => player?.techQueue ?? [], [player?.techQueue]);

  const previewPath = useMemo(() => {
    return planTechResearchPath(unlocked, selectedId);
  }, [unlocked, selectedId]);

  if (!isOpen || !player) return null;

  const selectedDef = TECH_NODE_MAP[selectedId] ?? TECH_TREE_NODES[0];
  const isUnlocked = unlocked.includes(selectedDef.id);
  const canUnlockNow = canUnlockTechNode(unlocked, selectedDef.id);
  const canAffordNow = player.researchPoints >= selectedDef.costRp;
  const pathTotalRp = previewPath.reduce((s, id) => s + (TECH_NODE_MAP[id]?.costRp ?? 0), 0);

  const boardW = PAD_X * 2 + 4 * COL_WIDTH + NODE_W;
  const boardH = PAD_Y * 2 + 2 * ROW_HEIGHT + NODE_H;

  return (
    <div
      data-testid="tech-tree-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tech-tree-title"
    >
      <div
        className={`w-full max-w-6xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${glassClass(
          effectiveTier,
        )}`}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/75">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/15 border border-sky-400/35 text-sky-300">
              <FlaskConical size={18} />
            </div>
            <div>
              <h2 id="tech-tree-title" className="font-display text-base sm:text-lg font-bold text-white">
                {t.techTreeBtn} — APEX R&amp;D Matrix
              </h2>
              <div className="text-[11px] text-slate-400 font-mono-num">
                Mil Lv.{player.tech.military} · Eco Lv.{player.tech.economy} · Log Lv.{player.tech.logistics} · {unlocked.length}/{TECH_TREE_NODES.length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 font-mono-num text-xs font-bold text-sky-200">
              {Math.floor(player.researchPoints)} RP
            </div>
            {queue.length > 0 && (
              <button
                type="button"
                onClick={onClearQueue}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-200 cursor-pointer"
              >
                <Trash2 size={13} />
                Clear Queue ({queue.length})
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Body: Interactive Node Graph + Right Inspector */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* Interactive Graph Viewport */}
          <div className="flex-1 min-w-0 overflow-auto gs-scroll bg-[#050914] p-4">
            {/* Branch Legend Row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {BRANCH_META.map((bm) => (
                <div
                  key={bm.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold text-slate-200 ${bm.border} ${bm.bg}`}
                >
                  {bm.id === 'military' ? (
                    <Shield size={12} className="text-rose-400" />
                  ) : bm.id === 'economy' ? (
                    <TrendingUp size={12} className="text-amber-400" />
                  ) : (
                    <Truck size={12} className="text-sky-400" />
                  )}
                  <span>{lang === 'pl' ? bm.pl : bm.en}</span>
                </div>
              ))}
              <span className="text-[11px] text-slate-400 ml-auto">
                Click any node to inspect or plan an automatic prerequisite path.
              </span>
            </div>

            <div
              className="relative rounded-xl border border-slate-800/80 bg-[#070D1D]"
              style={{ width: `${boardW}px`, height: `${boardH}px` }}
            >
              {/* SVG Connections Layer */}
              <svg
                width={boardW}
                height={boardH}
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
              >
                <defs>
                  <marker
                    id="techArrowMuted"
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L6,3 L0,6 Z" fill="#475569" />
                  </marker>
                  <marker
                    id="techArrowActive"
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L6,3 L0,6 Z" fill="#38BDF8" />
                  </marker>
                  <marker
                    id="techArrowDone"
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L6,3 L0,6 Z" fill="#10B981" />
                  </marker>
                </defs>

                {TECH_TREE_NODES.map((node) =>
                  node.prerequisites.map((preId) => {
                    const pre = TECH_NODE_MAP[preId];
                    if (!pre) return null;
                    const c1 = nodeCenter(pre.branch, pre.tier);
                    const c2 = nodeCenter(node.branch, node.tier);
                    const x1 = c1.x + NODE_W / 2;
                    const y1 = c1.y;
                    const x2 = c2.x - NODE_W / 2 - 4;
                    const y2 = c2.y;
                    const mx = (x1 + x2) / 2;

                    const bothDone = unlocked.includes(pre.id) && unlocked.includes(node.id);
                    const inPath =
                      (previewPath.includes(node.id) &&
                        (previewPath.includes(pre.id) || unlocked.includes(pre.id))) ||
                      (queue.includes(node.id) &&
                        (queue.includes(pre.id) || unlocked.includes(pre.id)));

                    const stroke = bothDone
                      ? '#10B981'
                      : inPath
                      ? '#38BDF8'
                      : '#334155';
                    const marker = bothDone
                      ? 'url(#techArrowDone)'
                      : inPath
                      ? 'url(#techArrowActive)'
                      : 'url(#techArrowMuted)';

                    return (
                      <path
                        key={`${pre.id}->${node.id}`}
                        d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={bothDone || inPath ? 2.5 : 1.6}
                        strokeDasharray={inPath && !bothDone ? '5 4' : undefined}
                        markerEnd={marker}
                      />
                    );
                  }),
                )}
              </svg>

              {/* Interactive Tech Nodes */}
              {TECH_TREE_NODES.map((node) => {
                const row = node.branch === 'military' ? 0 : node.branch === 'economy' ? 1 : 2;
                const left = PAD_X + node.tier * COL_WIDTH;
                const top = PAD_Y + row * ROW_HEIGHT;

                const done = unlocked.includes(node.id);
                const ready = canUnlockTechNode(unlocked, node.id);
                const affordable = player.researchPoints >= node.costRp;
                const queueIdx = queue.indexOf(node.id);
                const inPreview = !done && previewPath.includes(node.id);
                const isSelected = selectedId === node.id;

                const borderCls = done
                  ? 'border-emerald-400/80 bg-emerald-950/55'
                  : ready && affordable
                  ? 'border-amber-400 bg-amber-950/45'
                  : queueIdx !== -1 || inPreview
                  ? 'border-sky-400 bg-sky-950/55'
                  : ready
                  ? 'border-slate-500 bg-slate-900/90'
                  : 'border-slate-800 bg-slate-950/85 opacity-80';

                return (
                  <button
                    key={node.id}
                    type="button"
                    data-testid={`tech-node-${node.id}`}
                    onClick={() => setSelectedId(node.id)}
                    style={{ left: `${left}px`, top: `${top}px`, width: `${NODE_W}px`, height: `${NODE_H}px` }}
                    className={`absolute rounded-xl border p-2.5 text-left transition-all cursor-pointer flex flex-col justify-between ${borderCls} ${
                      isSelected ? 'ring-2 ring-white/80 shadow-lg' : 'hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-[11px] font-bold text-white leading-tight line-clamp-2">
                        {node.title[lang]}
                      </span>
                      {done ? (
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      ) : queueIdx !== -1 ? (
                        <span className="px-1.5 py-0.5 rounded bg-sky-400 text-slate-950 font-mono-num text-[9px] font-extrabold shrink-0">
                          #{queueIdx + 1}
                        </span>
                      ) : !ready ? (
                        <Lock size={12} className="text-slate-500 shrink-0" />
                      ) : (
                        <Sparkles size={12} className="text-amber-300 shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono-num pt-1 border-t border-white/10">
                      <span className={done ? 'text-emerald-300' : affordable ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                        {done ? 'UNLOCKED' : `${node.costRp} RP`}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">
                        T{node.tier + 1}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Node Detail & Research Path Planner */}
          <aside className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800/80 bg-slate-950/60 p-4 flex flex-col justify-between gap-4 overflow-y-auto gs-scroll">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-num uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-sky-300">
                  {selectedDef.branch.toUpperCase()} · TIER {selectedDef.tier + 1}
                </span>
                <span className="text-xs font-mono-num font-bold text-amber-300">
                  {selectedDef.costRp} RP
                </span>
              </div>

              <h3 className="font-display text-base font-bold text-white leading-snug">
                {selectedDef.title[lang]}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedDef.summary[lang]}
              </p>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-200 font-semibold">
                {selectedDef.unlocks[lang]}
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Prerequisites
                </div>
                {selectedDef.prerequisites.length === 0 ? (
                  <div className="text-xs text-slate-400">Root node (no prerequisites)</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDef.prerequisites.map((preId) => {
                      const pre = TECH_NODE_MAP[preId];
                      const preDone = unlocked.includes(preId);
                      return (
                        <button
                          key={preId}
                          type="button"
                          onClick={() => setSelectedId(preId)}
                          className={`px-2 py-1 rounded-md border text-[11px] font-semibold cursor-pointer ${
                            preDone
                              ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                              : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-sky-400'
                          }`}
                        >
                          {preDone ? '✓ ' : ''}
                          {pre?.title[lang]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {!isUnlocked && previewPath.length > 0 && (
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-sky-200">
                    <span className="flex items-center gap-1">
                      <Route size={13} /> Planned Path ({previewPath.length} nodes)
                    </span>
                    <span className="font-mono-num">{pathTotalRp} RP</span>
                  </div>
                  <div className="space-y-1">
                    {previewPath.map((pid, idx) => (
                      <div key={pid} className="text-[11px] text-slate-200 flex justify-between font-mono-num">
                        <span className="truncate">
                          {idx + 1}. {TECH_NODE_MAP[pid]?.title[lang]}
                        </span>
                        <span className="text-sky-300 ml-2">{TECH_NODE_MAP[pid]?.costRp} RP</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              {isUnlocked ? (
                <div className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-xs font-bold text-center">
                  ✓ Technology Researched
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    data-testid="research-now-btn"
                    disabled={!canUnlockNow || !canAffordNow}
                    onClick={() => onResearchNode(selectedDef.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-extrabold cursor-pointer"
                  >
                    <Play size={14} fill="currentColor" />
                    Research Now ({selectedDef.costRp} RP)
                  </button>

                  <button
                    type="button"
                    data-testid="plan-path-btn"
                    onClick={() => onPlanPath(selectedDef.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-sky-400/60 bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 text-xs font-bold cursor-pointer"
                  >
                    <Route size={14} />
                    Plan Research Path ({previewPath.length} steps)
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
