import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import type { Translations } from '../i18n/translations';
import { GlobalStrategyLogo } from './BlocksLogo';

export function SplashScreen({
  t,
  onContinue,
}: {
  t: Translations;
  onContinue: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onContinue();
      }
    };
    window.addEventListener('keydown', onKey);
    const timer = window.setTimeout(() => {
      onContinue();
    }, 2200);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(timer);
    };
  }, [onContinue]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050914] text-white select-none">
      <button
        type="button"
        onClick={onContinue}
        aria-label="Skip intro screen"
        className="absolute inset-0 w-full h-full cursor-pointer bg-transparent border-0 p-0 focus:outline-none"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(245, 158, 11, 0.14) 0%, rgba(56, 189, 248, 0.08) 38%, rgba(5, 9, 20, 1) 78%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none relative z-10 flex flex-col items-center text-center px-6"
      >
        <div className="font-display text-5xl sm:text-6xl font-extrabold tracking-[0.28em] text-white">
          BLOCKS™
        </div>
        <div className="mt-2.5 text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase text-amber-300">
          {t.ecosystemSubtitle}
        </div>

        <div className="my-7 h-px w-64 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        <div className="flex items-center gap-4 rounded-xl border border-amber-400/35 bg-[#090F1D]/95 px-6 py-3.5 shadow-2xl">
          <GlobalStrategyLogo size={54} />
          <div className="text-left">
            <div className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              GLOBAL STRATEGY: APEX EDITION
            </div>
            <div className="text-[11px] font-mono-num font-bold tracking-[0.18em] text-amber-300 mt-0.5">
              {t.publicBeta}
            </div>
          </div>
        </div>
      </motion.div>

      <button
        type="button"
        onClick={onContinue}
        className="relative z-10 mt-10 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-slate-200 hover:text-amber-200 border border-amber-400/35 hover:border-amber-400/75 rounded-lg bg-slate-900/80 transition-colors cursor-pointer"
      >
        {t.splashContinue}
      </button>
    </div>
  );
}
