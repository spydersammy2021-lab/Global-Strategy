import React, { useEffect, useState } from 'react';
import { Check, Handshake, Scale, ShieldAlert, X } from 'lucide-react';
import { computeCountrySummaries } from '../game/combat';
import { glassClass } from '../game/performance';
import type { EffectiveTier, GameState, PeaceTreatyDraft } from '../game/types';
import type { Translations } from '../i18n/translations';
import { FlagBadge } from './FlagBadge';

export function PeaceConferenceModal({
  isOpen,
  enemyId,
  state,
  onClose,
  onSignTreaty,
  t,
  effectiveTier = 'ultra',
}: {
  isOpen: boolean;
  enemyId: string | null;
  state: GameState;
  onClose: () => void;
  onSignTreaty: (draft: PeaceTreatyDraft) => void;
  t: Translations;
  effectiveTier?: EffectiveTier;
}) {
  const [demandedIds, setDemandedIds] = useState<string[]>([]);
  const [warReparations, setWarReparations] = useState(true);
  const [demilitarize, setDemilitarize] = useState(false);
  const [forceVassalize, setForceVassalize] = useState(false);

  useEffect(() => {
    setDemandedIds([]);
    setWarReparations(true);
    setDemilitarize(false);
    setForceVassalize(false);
  }, [enemyId, isOpen]);

  if (!isOpen || !enemyId) return null;

  const player = state.countries[state.playerCountryId];
  const enemy = state.countries[enemyId];
  if (!player || !enemy) return null;

  const enemyProvs = Object.values(state.provinces).filter((p) => p.ownerId === enemy.id);
  const summaries = computeCountrySummaries(state);
  const myPower = summaries[player.id]?.powerScore ?? 1000;
  const enemyPower = Math.max(1, summaries[enemy.id]?.powerScore ?? 1000);
  const warScore = Math.min(100, Math.max(18, Math.round((myPower / (myPower + enemyPower)) * 115)));

  const demandedCost =
    demandedIds.length * 14 +
    (warReparations ? 10 : 0) +
    (demilitarize ? 18 : 0) +
    (forceVassalize ? 38 : 0);

  const overBudget = demandedCost > warScore;

  const toggleProv = (pid: string) => {
    setDemandedIds((prev) => (prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]));
  };

  return (
    <div
      data-testid="peace-conference-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="peace-conference-title"
    >
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] ${glassClass(effectiveTier)}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/75">
          <div className="flex items-center gap-3">
            <Scale size={18} className="text-amber-400" />
            <div>
              <h2 id="peace-conference-title" className="font-display text-base font-extrabold text-white flex items-center gap-2">
                <span>{t.peaceConferenceBtn}</span>
                <FlagBadge flag={enemy.flag} width={22} height={15} />
                <span className="text-amber-300">{enemy.displayName}</span>
              </h2>
              <div className="text-[11px] font-mono-num text-slate-400">
                Available Warscore: <span className="text-emerald-300 font-bold">{warScore} pts</span> · Treaty Demand:{' '}
                <span className={overBudget ? 'text-rose-400 font-bold' : 'text-amber-300 font-bold'}>
                  {demandedCost} pts
                </span>
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

        <div className="p-5 overflow-y-auto gs-scroll space-y-4 text-xs">
          {/* Warscore Progress Bar */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1.5">
            <div className="flex justify-between font-mono-num text-[11px]">
              <span className="text-slate-300">Treaty Leverage Meter</span>
              <span className={overBudget ? 'text-rose-400 font-bold' : 'text-emerald-300 font-bold'}>
                {demandedCost} / {warScore} Warscore
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all ${overBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (demandedCost / Math.max(1, warScore)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Diplomatic Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setWarReparations((v) => !v)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                warReparations
                  ? 'border-amber-400 bg-amber-500/20 text-amber-100'
                  : 'border-slate-800 bg-slate-950/60 text-slate-300'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>War Reparations</span>
                <span className="font-mono-num text-[10px]">10 pts</span>
              </div>
              <div className="text-[10.5px] text-slate-300 mt-0.5">Seize treasury transfer immediately</div>
            </button>

            <button
              type="button"
              onClick={() => setDemilitarize((v) => !v)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                demilitarize
                  ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                  : 'border-slate-800 bg-slate-950/60 text-slate-300'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>Demilitarize Borders</span>
                <span className="font-mono-num text-[10px]">18 pts</span>
              </div>
              <div className="text-[10.5px] text-slate-300 mt-0.5">Halve enemy standing garrisons</div>
            </button>

            <button
              type="button"
              onClick={() => setForceVassalize((v) => !v)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                forceVassalize
                  ? 'border-purple-400 bg-purple-500/20 text-purple-100'
                  : 'border-slate-800 bg-slate-950/60 text-slate-300'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>Force Vassalization</span>
                <span className="font-mono-num text-[10px]">38 pts</span>
              </div>
              <div className="text-[10.5px] text-slate-300 mt-0.5">Subjugate as tributary vassal</div>
            </button>
          </div>

          {/* Territorial Claims */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Annex Enemy Provinces ({demandedIds.length} / {enemyProvs.length} selected · 14 pts each)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto gs-scroll pr-1">
              {enemyProvs.map((p) => {
                const picked = demandedIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProv(p.id)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left cursor-pointer ${
                      picked
                        ? 'border-emerald-400 bg-emerald-500/20 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold truncate">
                        {p.isCapital ? '👑 ' : ''}
                        {p.name}
                      </div>
                      <div className="text-[10px] font-mono-num text-slate-400">
                        Eco {p.economy.toFixed(1)} · {(p.population / 1_000_000).toFixed(2)}M
                      </div>
                    </div>
                    {picked && <Check size={14} className="text-emerald-300 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {overBudget && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-rose-200">
              <ShieldAlert size={15} className="text-rose-400 shrink-0" />
              <span>Your demands exceed current warscore leverage — enemy will reject overly harsh terms.</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800/80 bg-slate-950/75">
          <span className="text-[11px] text-slate-400 font-mono-num">Cost: 1 Diplomacy Point (DP)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              {t.close}
            </button>
            <button
              type="button"
              data-testid="sign-peace-treaty-btn"
              disabled={player.diplomacyPoints < 1 || overBudget}
              onClick={() => {
                onSignTreaty({
                  enemyId: enemy.id,
                  demandedProvinceIds: demandedIds,
                  warReparations,
                  demilitarize,
                  forceVassalize,
                });
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-extrabold cursor-pointer"
            >
              <Handshake size={14} /> Sign Peace Treaty
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
