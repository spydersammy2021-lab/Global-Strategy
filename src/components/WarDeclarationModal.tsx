import React from 'react';
import { ShieldBan, ShieldCheck, Swords } from 'lucide-react';
import { glassClass } from '../game/performance';
import type { EffectiveTier, GameState } from '../game/types';
import { FlagBadge } from './FlagBadge';

export function WarDeclarationModal({
  state,
  onResolve,
  effectiveTier = 'ultra',
}: {
  state: GameState;
  onResolve: (acceptWar: boolean) => void;
  effectiveTier?: EffectiveTier;
}) {
  const prompt = state.pendingWarPrompt;
  if (!prompt) return null;

  const attacker = state.countries[prompt.attackerId];
  const player = state.countries[state.playerCountryId];
  if (!attacker || !player) return null;

  const canVeto = prompt.vetoAllowed && player.diplomacyPoints >= prompt.vetoDpCost;

  return (
    <div
      data-testid="war-declaration-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="war-prompt-title"
    >
      <div className={`w-full max-w-md rounded-2xl border border-rose-500/60 shadow-2xl overflow-hidden ${glassClass(effectiveTier)}`}>
        <div className="px-6 py-4 border-b border-rose-500/35 bg-rose-950/45 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl border border-rose-400/50 bg-rose-500/20 flex items-center justify-center text-rose-300 shrink-0">
            <Swords size={20} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono-num uppercase tracking-widest text-rose-300 font-bold">
              Peaceful Start & War Acceptance Protocol
            </div>
            <h2 id="war-prompt-title" className="font-display text-base font-extrabold text-white truncate">
              War Ultimatum from {prompt.attackerName}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <FlagBadge flag={attacker.flag} width={32} height={21} />
              <div className="min-w-0">
                <div className="font-bold text-white truncate">{prompt.attackerName}</div>
                <div className="text-[11px] font-mono-num text-rose-300">
                  {prompt.totalAttackerArmy.toLocaleString()} Mobilized Troops
                </div>
              </div>
            </div>
            <div className="text-right font-mono-num text-[11px] text-slate-400">
              DP Available: <span className="text-sky-300 font-bold">{player.diplomacyPoints}</span>
            </div>
          </div>

          <p className="text-slate-200 leading-relaxed">{prompt.reason}</p>

          {prompt.coalitionAllies.length > 0 && (
            <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
              Co-Belligerent Allies: {prompt.coalitionAllies.map((id) => state.countries[id]?.displayName ?? id).join(', ')}
            </div>
          )}

          {!prompt.vetoAllowed && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/50 bg-rose-950/60 px-3 py-2 text-[11px] text-rose-200 font-bold">
              <ShieldBan size={14} className="text-rose-400 shrink-0" />
              <span>Diplomatic Veto is locked in EXTREME ULTRA IMPOSSIBLE difficulty!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              data-testid="accept-war-btn"
              onClick={() => onResolve(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold cursor-pointer"
            >
              <Swords size={15} /> Accept War
            </button>
            <button
              type="button"
              data-testid="veto-war-btn"
              disabled={!canVeto}
              onClick={() => onResolve(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-emerald-400/60 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-40 text-emerald-100 font-extrabold cursor-pointer disabled:cursor-not-allowed"
            >
              <ShieldCheck size={15} /> Diplomatic Veto (-{prompt.vetoDpCost} DP)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
