import React from 'react';
import { Orbit, Rocket } from 'lucide-react';
import { SPACE_OCEAN_NODES } from '../data/spaceSectors';
import type { GameState } from '../game/types';
import type { Translations } from '../i18n/translations';

export function RightSpaceDock({
  state,
  onOpenSpaceOcean,
  t,
}: {
  state: GameState;
  onOpenSpaceOcean: () => void;
  t: Translations;
}) {
  if (state.gameMode === 'bot_spectator') return null;
  const player = state.countries[state.playerCountryId];
  const colonyCount = player?.spaceColonies.length ?? 0;
  const satCount = (state.activeSatellites ?? []).filter(
    (s) => s.ownerCountryId === state.playerCountryId && s.expiresDay >= state.totalDays,
  ).length;

  return (
    <aside
      data-testid="right-space-dock"
      aria-label={t.spaceOceanBtn}
      className="pointer-events-auto absolute top-48 right-2.5 md:right-3 z-20 hidden md:flex flex-col items-end gap-1.5"
    >
      <button
        type="button"
        data-testid="space-ocean-btn"
        onClick={onOpenSpaceOcean}
        title={t.spaceOceanBtn}
        aria-label={t.spaceOceanBtn}
        className="group flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-xl border border-orange-400/55 aoh-hud-panel hover:border-orange-300 shadow-[0_0_22px_rgba(251,146,60,0.22)] transition-colors cursor-pointer"
      >
        <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-orange-500/20 border border-orange-400/40 text-orange-300 group-hover:text-orange-200">
          <Rocket size={17} />
          {satCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-1 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-mono-num font-extrabold">
              {satCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-mono-num font-extrabold uppercase tracking-wider text-orange-200 leading-none">
          MARS
        </span>
        <span className="inline-flex items-center gap-0.5 text-[9px] font-mono-num text-sky-300 leading-none">
          <Orbit size={9} />
          {colonyCount}/{SPACE_OCEAN_NODES.length}
        </span>
      </button>
    </aside>
  );
}
