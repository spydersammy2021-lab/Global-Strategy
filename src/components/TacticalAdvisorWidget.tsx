import React from 'react';
import { AlertTriangle, Bot, Power, ShieldCheck, Sparkles, Waves } from 'lucide-react';
import { analyzeTacticalSituation } from '../game/advisor';
import type { EffectiveTier, GameState, Language } from '../game/types';
import type { Translations } from '../i18n/translations';

export function TacticalAdvisorWidget({
  state,
  enabled,
  onToggle,
  lang,
  t,
}: {
  state: GameState;
  enabled: boolean;
  onToggle: () => void;
  lang: Language;
  t: Translations;
  effectiveTier: EffectiveTier;
}) {
  const advice = enabled ? analyzeTacticalSituation(state, lang) : null;

  if (!enabled) {
    return (
      <div className="pointer-events-auto absolute bottom-3 right-3 z-20 hidden lg:block">
        <button
          type="button"
          data-testid="advisor-toggle-btn"
          onClick={onToggle}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border aoh-hud-panel text-xs font-bold text-slate-300 hover:text-white hover:border-sky-400/60 cursor-pointer shadow-lg"
        >
          <Bot size={14} className="text-slate-400" />
          <span>{t.advisorTitle}: {t.advisorOff}</span>
          <Power size={12} className="text-sky-400" />
        </button>
      </div>
    );
  }

  const accentBorder =
    advice?.severity === 'critical'
      ? 'border-rose-500/65'
      : advice?.severity === 'warning'
      ? 'border-amber-400/65'
      : advice?.severity === 'opportunity'
      ? 'border-emerald-400/65'
      : 'border-sky-400/45';

  const Icon =
    advice?.severity === 'critical'
      ? AlertTriangle
      : advice?.severity === 'warning'
      ? Waves
      : advice?.severity === 'opportunity'
      ? Sparkles
      : ShieldCheck;

  const iconColor =
    advice?.severity === 'critical'
      ? 'text-rose-400'
      : advice?.severity === 'warning'
      ? 'text-amber-300'
      : advice?.severity === 'opportunity'
      ? 'text-emerald-400'
      : 'text-sky-400';

  return (
    <div
      data-testid="tactical-advisor"
      className={`pointer-events-auto absolute bottom-3 right-3 z-20 hidden xl:block w-64 rounded-xl border p-2.5 shadow-2xl aoh-hud-panel ${accentBorder}`}
    >
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-sky-300">
          <Bot size={12} />
          <span>{t.advisorTitle}</span>
        </div>
        <button
          type="button"
          data-testid="advisor-toggle-btn"
          onClick={onToggle}
          title={t.advisorOff}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-sky-400/40 bg-sky-500/15 hover:bg-sky-500/25 text-[9.5px] font-bold text-sky-200 cursor-pointer"
        >
          <Power size={9} />
          <span>ON</span>
        </button>
      </div>

      {advice && (
        <div className="mt-1.5 flex items-start gap-2">
          <Icon size={14} className={`${iconColor} shrink-0 mt-0.5`} />
          <div className="min-w-0">
            <div className="text-[11.5px] font-bold text-white leading-snug">{advice.headline}</div>
            <p className="text-[10.5px] text-slate-300 leading-snug mt-0.5 line-clamp-3">{advice.body}</p>
          </div>
        </div>
      )}
    </div>
  );
}
