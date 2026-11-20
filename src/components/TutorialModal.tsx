import React, { useState } from 'react';
import { BookOpen, Info, X } from 'lucide-react';
import { glassClass } from '../game/performance';
import type { EffectiveTier } from '../game/types';
import type { Translations } from '../i18n/translations';

export function TutorialModal({
  isOpen,
  onClose,
  t,
  effectiveTier = 'ultra',
}: {
  isOpen: boolean;
  onClose: () => void;
  t: Translations;
  effectiveTier?: EffectiveTier;
}) {
  const [step, setStep] = useState(0);
  if (!isOpen) return null;

  const steps = t.tutorialSteps;
  const current = steps[step] ?? steps[0];
  const isLast = step >= steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${glassClass(effectiveTier)}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <BookOpen size={18} className="text-amber-400" />
            <h2 id="tutorial-title" className="font-display text-base font-bold text-white">
              {t.tutorialTitle}
            </h2>
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

        <div className="p-6 space-y-5">
          {/* Progress indicator */}
          <div className="flex gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full ${
                  idx <= step ? 'bg-amber-400' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          <div className="min-h-[110px] space-y-2">
            <h3 className="font-display text-lg font-bold text-amber-300">{current.title}</h3>
            <p className="text-sm text-slate-200 leading-relaxed">{current.body}</p>
          </div>

          {/* Mandatory Virtual Currency Disclaimer */}
          <div className="flex items-start gap-2.5 rounded-xl border border-sky-500/40 bg-sky-500/10 p-3.5 text-xs text-sky-100 leading-relaxed">
            <Info size={16} className="text-sky-400 shrink-0 mt-0.5" />
            <span>{t.tutorialDisclaimer}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              {t.tutorialPrev}
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
              >
                {t.tutorialFinish}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
              >
                {t.tutorialNext}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
