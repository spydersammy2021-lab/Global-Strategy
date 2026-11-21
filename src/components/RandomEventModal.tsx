import React from 'react';
import { Sparkles, Thermometer } from 'lucide-react';
import { glassClass } from '../game/performance';
import type { EffectiveTier, PendingRandomEvent } from '../game/types';
import type { Translations } from '../i18n/translations';

export function RandomEventModal({
  event,
  effectiveTier,
  onChoose,
  t,
}: {
  event: PendingRandomEvent | null;
  effectiveTier: EffectiveTier;
  onChoose: (choiceId: string) => void;
  t: Translations;
}) {
  if (!event) return null;

  const isClimate = Boolean(event.isClimateEvent);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="random-event-title"
    >
      <div
        className={`w-full max-w-md rounded-2xl border overflow-hidden ${glassClass(effectiveTier)} ${
          isClimate ? 'border-orange-400/60' : ''
        }`}
      >
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center gap-2.5">
          {isClimate ? (
            <Thermometer size={18} className="text-orange-400 shrink-0" />
          ) : (
            <Sparkles size={18} className="text-amber-400 shrink-0" />
          )}
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isClimate ? 'text-orange-300' : 'text-sky-300'}`}>
              {isClimate ? `${t.globalWarmingLabel} · ${event.targetProvinceName ?? ''}` : t.randomEventPrompt}
            </div>
            <h2 id="random-event-title" className="font-display text-base font-bold text-white">
              {event.title}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{event.description}</p>

          <div className="space-y-2.5">
            {event.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => onChoose(choice.id)}
                className="w-full text-left rounded-xl border border-sky-400/35 bg-slate-900/75 hover:bg-sky-500/15 hover:border-amber-400/70 px-4 py-3 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                {choice.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
