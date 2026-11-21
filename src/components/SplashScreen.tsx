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
    }, 1900);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(timer);
    };
  }, [onContinue]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#03060E] text-white select-none overflow-hidden">
      <button
        type="button"
        onClick={onContinue}
        aria-label="Skip intro screen"
        className="absolute inset-0 w-full h-full cursor-pointer bg-transparent border-0 p-0 focus:outline-none"
      />

      {/* Celestial Sapphire & Imperial Bronze Orbital Backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(234, 179, 8, 0.14) 0%, rgba(14, 165, 233, 0.12) 34%, rgba(3, 6, 14, 1) 74%)',
        }}
      />
      <div className="pointer-events-none absolute w-[460px] h-[460px] rounded-full border border-sky-400/15 v3-meridian-ring" />
      <div className="pointer-events-none absolute w-[560px] h-[560px] rounded-full border border-amber-400/10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none relative z-10 flex flex-col items-center text-center px-6 max-w-2xl"
      >
        <div className="text-[11px] font-mono-num font-bold tracking-[0.34em] uppercase text-sky-300 mb-3">
          {t.ecosystemSubtitle}
        </div>
        <div className="font-display text-5xl sm:text-7xl font-extrabold tracking-[0.26em] text-white drop-shadow-[0_6px_28px_rgba(234,179,8,0.22)]">
          BLOCKS™
        </div>

        <div className="my-6 h-px w-80 bg-gradient-to-r from-transparent via-amber-400/75 to-transparent" />

        <div className="flex items-center gap-4 sm:gap-5 rounded-2xl border border-amber-400/45 bg-[#070D1D]/92 px-6 py-4 shadow-[0_26px_64px_-15px_rgba(2,6,23,0.96),inset_0_1px_0_rgba(255,255,255,0.16)]">
          <GlobalStrategyLogo size={64} />
          <div className="text-left">
            <div className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              GLOBAL STRATEGY: APEX EDITION
            </div>
            <div className="text-[11px] font-mono-num font-bold tracking-[0.22em] text-amber-300 mt-1">
              {t.publicBeta}
            </div>
          </div>
        </div>
      </motion.div>

      <button
        type="button"
        onClick={onContinue}
        className="relative z-10 mt-10 px-6 py-2.5 text-xs font-bold tracking-widest uppercase text-amber-200 hover:text-slate-950 border border-amber-400/45 hover:bg-amber-400 rounded-lg bg-slate-950/85 transition-colors cursor-pointer"
      >
        {t.splashContinue}
      </button>

      <div className="pointer-events-none absolute bottom-4 inset-x-4 text-center text-[11px] text-slate-400">
        {t.developedBy}
      </div>
    </div>
  );
}
