import React, { useMemo, useState } from 'react';
import { Check, Lock, Play, Route, X } from 'lucide-react';
import { computeTechPath, TECH_TREE } from '../game/tech';
import type { Country, Language, TechBranch } from '../game/types';

export function TechTreeModal({
  isOpen,
  onClose,
  country,
  lang,
  onResearchTech,
  onPlanTechQueue,
}: {
  isOpen: boolean;
  onClose: () => void;
  country: Country | null;
  lang: Language;
  onResearchTech: (techId: string) => void;
  onPlanTechQueue: (queue: string[]) => void;
}) {
  const [selectedId, setSelectedId] = useState<string>('mil_2');

  const unlockedSet = useMemo(() => new Set(country?.unlockedTechIds ?? []), [country?.unlockedTechIds]);
  const plannedPath = useMemo(
    () => (country ? computeTechPath(selectedId, country.unlockedTechIds) : []),
    [country, selectedId],
  );

  if (!isOpen || !country) return null;

  const selectedNode = TECH_TREE.find((t) => t.id === selectedId) ?? TECH_TREE[0];
  const branches: { id: TechBranch; title: string; color: string; rowY: number }[] = [
    { id: 'military', title: 'Military & Night-Vision', color: '#F43F5E', rowY: 60 },
    { id: 'economy', title: 'Economy & Arms Trade', color: '#F59E0B', rowY: 185 },
    { id: 'logistics', title: 'Logistics, Rail & Orbit', color: '#38BDF8', rowY: 310 },
  ];

  const getPos = (branch: TechBranch, tier: number) => {
    const b = branches.find((br) => br.id === branch)!;
    const x = 18 + (tier - 1) * 165;
    return { x, y: b.rowY };
  };

  const canInstantUnlock =
    !unlockedSet.has(selectedNode.id) &&
    selectedNode.prerequisites.every((p) => unlockedSet.has(p)) &&
    country.researchPoints >= selectedNode.costRp;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Interactive Tech Tree"
    >
      <div className="w-full max-w-[1120px] royal-glass-modal rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/75">
          <div>
            <h2 className="font-display text-lg font-extrabold text-white">
              APEX R&amp;D MATRIX — Interactive Visual Tech Tree
            </h2>
            <p className="text-xs text-slate-300 font-mono-num">
              Mil Lv.{country.milLevel} · Eco Lv.{country.ecoLevel} · Log Lv.{country.logLevel} · {country.unlockedTechIds.length}/15 Researched
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-sky-500/20 border border-sky-400/50 font-mono-num text-sm font-bold text-sky-200">
              {Math.round(country.researchPoints)} RP
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto gs-scroll p-4 grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-4">
          {/* Visual Node Graph Canvas */}
          <div className="overflow-x-auto gs-scroll rounded-xl bg-slate-950/80 border border-slate-800 p-3">
            <div className="relative" style={{ width: 830, height: 400 }}>
              {/* SVG Connections */}
              <svg width={830} height={400} className="absolute inset-0 pointer-events-none">
                {TECH_TREE.map((node) => {
                  const endPos = getPos(node.branch, node.tier);
                  return node.prerequisites.map((preId) => {
                    const pre = TECH_TREE.find((t) => t.id === preId);
                    if (!pre) return null;
                    const startPos = getPos(pre.branch, pre.tier);
                    const x1 = startPos.x + 140;
                    const y1 = startPos.y + 34;
                    const x2 = endPos.x;
                    const y2 = endPos.y + 34;
                    const inPath = plannedPath.includes(node.id) && (plannedPath.includes(pre.id) || unlockedSet.has(pre.id));
                    const bothDone = unlockedSet.has(node.id) && unlockedSet.has(pre.id);
                    return (
                      <path
                        key={`${pre.id}_${node.id}`}
                        d={`M ${x1} ${y1} C ${x1 + 25} ${y1}, ${x2 - 25} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={bothDone ? '#10B981' : inPath ? '#FBBF24' : 'rgba(148,163,184,0.35)'}
                        strokeWidth={inPath || bothDone ? 2.6 : 1.6}
                      />
                    );
                  });
                })}
              </svg>

              {/* Branch Labels */}
              {branches.map((b) => (
                <div
                  key={b.id}
                  style={{ top: b.rowY - 26, left: 18, color: b.color }}
                  className="absolute text-xs font-bold uppercase tracking-wider"
                >
                  {b.title}
                </div>
              ))}

              {/* Nodes */}
              {TECH_TREE.map((node) => {
                const pos = getPos(node.branch, node.tier);
                const unlocked = unlockedSet.has(node.id);
                const avail = !unlocked && node.prerequisites.every((p) => unlockedSet.has(p));
                const isSelected = selectedId === node.id;
                const isQueued = country.plannedTechQueue.includes(node.id);
                return (
                  <button
                    key={node.id}
                    type="button"
                    data-testid={`tech-node-${node.id}`}
                    onClick={() => setSelectedId(node.id)}
                    style={{ left: pos.x, top: pos.y, width: 140, height: 68 }}
                    className={`absolute p-2 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      unlocked
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
                        : isSelected
                          ? 'bg-amber-500/25 border-amber-300 text-white'
                          : isQueued
                            ? 'bg-sky-500/20 border-sky-400 text-sky-100'
                            : avail
                              ? 'bg-slate-900 border-amber-400/50 text-slate-100'
                              : 'bg-slate-950/90 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[11px] font-bold leading-tight line-clamp-2">{node.name[lang]}</span>
                      {unlocked ? <Check size={12} className="text-emerald-300 shrink-0" /> : !avail && <Lock size={11} className="shrink-0" />}
                    </div>
                    <div className="flex justify-between items-center font-mono-num text-[10px]">
                      <span className="text-amber-300">{node.costRp} RP</span>
                      <span>T{node.tier}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Inspection & Path Planning Panel */}
          <div className="p-4 rounded-xl bg-slate-950/85 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="text-[11px] font-mono-num uppercase text-amber-300">
                {selectedNode.branch} · Tier {selectedNode.tier} · {selectedNode.costRp} RP
              </div>
              <h3 className="font-display text-base font-extrabold text-white">{selectedNode.name[lang]}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.summary[lang]}</p>
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-emerald-400/30 text-emerald-300 font-mono-num text-xs font-bold">
                {selectedNode.effectTag}
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-sky-300 flex items-center gap-1">
                  <Route size={13} /> Planned Path ({plannedPath.length} steps)
                </div>
                {plannedPath.length === 0 ? (
                  <div className="text-[11px] text-emerald-300">Already unlocked!</div>
                ) : (
                  plannedPath.map((pid, idx) => {
                    const pn = TECH_TREE.find((t) => t.id === pid);
                    return (
                      <div key={pid} className="flex justify-between text-[11px] text-slate-200">
                        <span>{idx + 1}. {pn?.name[lang]}</span>
                        <span className="font-mono-num text-amber-300">{pn?.costRp} RP</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                disabled={!canInstantUnlock}
                data-testid="tech-research-now-btn"
                onClick={() => onResearchTech(selectedNode.id)}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-extrabold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play size={13} fill="currentColor" /> Research Now ({selectedNode.costRp} RP)
              </button>
              <button
                type="button"
                disabled={plannedPath.length === 0}
                onClick={() => onPlanTechQueue(plannedPath)}
                className="w-full py-2 rounded-xl bg-sky-500/20 border border-sky-400/50 text-sky-200 font-bold text-xs disabled:opacity-40 cursor-pointer"
              >
                Auto-Queue Research Path ({plannedPath.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
