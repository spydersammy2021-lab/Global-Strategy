import React from 'react';
import {
  Bot,
  Flame,
  HelpCircle,
  Home,
  Pause,
  Play,
  Save,
  Settings,
  UserCheck,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { getSeasonFromDay } from '../game/combat';
import { formatGameDate, getCountryAvgTempC, getCountryTotalArmy } from '../game/engine';
import type {
  ApexPremiumState,
  FpsCap,
  GameState,
  MapOverlayMode,
  SimSpeed,
} from '../game/types';
import type { Translations } from '../i18n/translations';
import { FlagCrest } from './BlocksRoyalEmblem';

export function TopBar({
  state,
  t,
  fps,
  fpsCap,
  muted,
  apexPremium,
  overlayMode,
  onChangeOverlay,
  onSetSpeed,
  onTogglePause,
  onToggleAutoPilot,
  onToggleMute,
  onOpenTreasury,
  onOpenSave,
  onOpenTutorial,
  onOpenSettings,
  onOpenAccount,
  onBackToMenu,
}: {
  state: GameState;
  t: Translations;
  fps: number;
  fpsCap: FpsCap;
  muted: boolean;
  apexPremium: ApexPremiumState;
  overlayMode: MapOverlayMode;
  onChangeOverlay: (m: MapOverlayMode) => void;
  onSetSpeed: (s: SimSpeed) => void;
  onTogglePause: () => void;
  onToggleAutoPilot: () => void;
  onToggleMute: () => void;
  onOpenTreasury: () => void;
  onOpenSave: () => void;
  onOpenTutorial: () => void;
  onOpenSettings: () => void;
  onOpenAccount: () => void;
  onBackToMenu: () => void;
}) {
  const player = state.countries[state.playerCountryId];
  if (!player) return null;
  const totalArmy = getCountryTotalArmy(state, player.id);
  const avgTemp = getCountryAvgTempC(state, player.id);
  const dateLabel = formatGameDate(state.startYear, state.day);
  const season = getSeasonFromDay(state.day);
  const speeds: SimSpeed[] = apexPremium.unlocked ? [1, 2, 3, 5, 10] : [1, 2, 3, 5];

  return (
    <div className="hidden md:block fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <header className="pointer-events-auto mx-3 mt-2 px-3 py-1.5 rounded-xl royal-glass flex items-center justify-between gap-2">
        {/* Left: Framed National Flag + Resource Counters */}
        <div className="flex items-center gap-2.5 min-w-0">
          <FlagCrest
            code={player.flagCode}
            fallbackColor={player.color}
            name={player.name}
            width={34}
            height={23}
            vipCrown={apexPremium.unlocked}
          />
          <div className="leading-tight shrink-0">
            <div className="text-xs font-bold text-white flex items-center gap-1 whitespace-nowrap">
              {apexPremium.unlocked && <span title="Blocks™ Apex VIP Crown">👑</span>}
              <span>{player.name}</span>
            </div>
            <div className="font-mono-num text-[10px] text-amber-300 font-bold whitespace-nowrap">
              ⚔️ {totalArmy.toLocaleString()}
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700/70 mx-0.5 shrink-0" />

          <div className="flex items-center gap-2 text-[11px] font-mono-num whitespace-nowrap">
            <button
              type="button"
              onClick={onOpenTreasury}
              data-testid="hud-treasury-btn"
              className="px-2 py-1 rounded-lg bg-slate-900/90 border border-amber-400/25 hover:border-amber-300 text-amber-200 font-bold cursor-pointer"
              title="Virtual PLN (In-game currency only)"
            >
              💰 {player.treasury.toFixed(1)} PLN
            </button>
            <span className="text-slate-200" title={t.manpower}>
              👥 {Math.round(player.manpower / 1000)}k
            </span>
            <span className="text-sky-300" title={t.research}>
              🔬 {Math.round(player.researchPoints)} RP
            </span>
            <span className="text-emerald-300" data-testid="hud-stability" title={t.stability}>
              ⚖️ {player.stability}%
            </span>
            <span className="text-cyan-200 hidden xl:inline" title={t.avgTemp}>
              🌡️ {avgTemp}°C
            </span>
            <span className="text-amber-300 hidden 2xl:inline" title={t.prestige}>
              👑 {player.prestige}
            </span>
          </div>
        </div>

        {/* Center: Map Overlay Switcher + Warming + Auto-Pilot */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center p-0.5 rounded-lg bg-slate-950/85 border border-slate-800">
            {(
              [
                { id: 'political', label: t.politicalOverlay },
                { id: 'thermal', label: t.thermalOverlay },
                { id: 'day_night_logistics', label: t.dayNightOverlay },
              ] as const
            ).map((ov) => (
              <button
                key={ov.id}
                type="button"
                data-testid={`overlay-${ov.id}`}
                onClick={() => onChangeOverlay(ov.id)}
                className={`px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer whitespace-nowrap ${
                  overlayMode === ov.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {ov.label}
              </button>
            ))}
          </div>

          <span
            className="px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800 font-mono-num text-[10px] text-orange-300 whitespace-nowrap"
            title="Global Warming Index"
          >
            <Flame size={11} className="inline mr-1" />
            {state.globalWarmingIndex.toFixed(0)}
          </span>

          <button
            type="button"
            data-testid="hud-autopilot-btn"
            onClick={onToggleAutoPilot}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              state.autoPilotEnabled || state.difficulty === 'world_conquest'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-600'
            }`}
          >
            <Bot size={12} />
            {t.autoPilotToggle}
          </button>
        </div>

        {/* Right: Clock, Speeds, Live FPS, Utility Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="px-2 py-1 rounded-lg bg-slate-950/85 border border-slate-800 text-[10px] leading-tight whitespace-nowrap">
            <div className="font-mono-num font-bold text-white">{dateLabel}</div>
            <div className="text-[9px] text-amber-300/90">
              {season} · 🌊 {state.activeWaterAlerts} Alerts
            </div>
          </div>

          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-950/85 border border-slate-800">
            <button
              type="button"
              data-testid="speed-pause"
              onClick={onTogglePause}
              title={t.pauseHint}
              aria-label={t.pauseHint}
              className={`p-1.5 rounded-md cursor-pointer ${
                state.paused ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              {state.paused ? <Play size={12} /> : <Pause size={12} />}
            </button>
            {speeds.map((sp) => (
              <button
                key={sp}
                type="button"
                data-testid={`speed-${sp}x`}
                onClick={() => onSetSpeed(sp)}
                className={`px-1.5 py-1 rounded-md font-mono-num text-[10px] font-bold cursor-pointer ${
                  !state.paused && state.simSpeed === sp
                    ? sp === 10
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-sky-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {sp === 10 ? (
                  <span className="inline-flex items-center">
                    <Zap size={10} className="mr-0.5" />
                    10x
                  </span>
                ) : (
                  `${sp}x`
                )}
              </button>
            ))}
          </div>

          <div className="px-1.5 py-1 rounded-lg bg-slate-950/85 border border-slate-800 font-mono-num text-[10px] text-emerald-300 whitespace-nowrap hidden lg:block">
            {fps} FPS · {fpsCap === 'unlimited' ? '∞ Hz' : `${fpsCap}Hz`}
          </div>

          <button type="button" onClick={onOpenSave} aria-label="Save Campaign" className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 hover:border-amber-400/50 cursor-pointer">
            <Save size={13} />
          </button>
          <button type="button" onClick={onToggleMute} aria-label={t.soundLabel} className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 hover:border-amber-400/50 cursor-pointer">
            {muted ? <VolumeX size={13} className="text-rose-400" /> : <Volume2 size={13} className="text-amber-300" />}
          </button>
          <button type="button" onClick={onOpenTutorial} aria-label={t.tutorial} className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 hover:border-amber-400/50 cursor-pointer">
            <HelpCircle size={13} />
          </button>
          <button type="button" data-testid="hud-settings-btn" onClick={onOpenSettings} aria-label={t.settings} className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 hover:border-amber-400/50 cursor-pointer">
            <Settings size={13} />
          </button>
          <button type="button" data-testid="hud-account-btn" onClick={onOpenAccount} aria-label={t.accountBtn} className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-amber-300 hover:border-amber-400/50 cursor-pointer">
            <UserCheck size={13} />
          </button>
          <button type="button" onClick={onBackToMenu} aria-label={t.backToMenu} className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 hover:border-rose-400/50 cursor-pointer">
            <Home size={13} />
          </button>
        </div>
      </header>

      {/* World Conquest / Auto-Pilot Autonomous Banner */}
      {(state.worldConquestBanner || state.autoPilotBanner) && (
        <div className="mx-auto mt-1.5 w-fit max-w-[90vw] px-4 py-1 rounded-full bg-slate-950/95 border border-amber-400/60 text-amber-200 text-xs font-bold shadow-lg pointer-events-auto flex items-center gap-2">
          <span>{state.worldConquestBanner ?? state.autoPilotBanner}</span>
          {(state.worldConquestCountdownSec > 0 || state.autoPilotCountdownSec > 0) && (
            <span data-testid="airlift-countdown-badge" className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono-num text-[11px]">
              Airlift {state.worldConquestCountdownSec || state.autoPilotCountdownSec}s
            </span>
          )}
        </div>
      )}
    </div>
  );
}
