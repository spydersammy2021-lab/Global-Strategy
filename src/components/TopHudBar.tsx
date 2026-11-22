import React from 'react';
import {
  Award,
  Bot,
  CloudFog,
  CloudRain,
  CloudSnow,
  Coins,
  Cpu,
  Flame,
  FlaskConical,
  FolderOpen,
  Globe2,
  HelpCircle,
  Home,
  Layers,
  Map as MapIcon,
  Pause,
  Plane,
  Play,
  Radiation,
  Save,
  Settings,
  Shield,
  Sun,
  Swords,
  Thermometer,
  Trophy,
  UserPlus,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import type { CountrySummary } from '../game/combat';
import type { FpsCap } from '../game/performance';
import type {
  BlocksAccount,
  EffectiveTier,
  GameState,
  Language,
  MapOverlayMode,
  SimSpeed,
  UiMode,
  WeatherKind,
} from '../game/types';
import {
  COMMANDER_RANK_NAMES,
  MONTHS,
  SEASON_NAMES,
  UI_MODE_TEXT,
  WEATHER_NAMES,
  type Translations,
} from '../i18n/translations';
import { AvatarIcon } from './BlocksLogo';
import { FlagBadge } from './FlagBadge';

function WeatherIcon({ weather }: { weather: WeatherKind }) {
  switch (weather) {
    case 'snow':
      return <CloudSnow size={12} className="text-sky-300" />;
    case 'rain':
      return <CloudRain size={12} className="text-blue-400" />;
    case 'fog':
      return <CloudFog size={12} className="text-slate-300" />;
    default:
      return <Sun size={12} className="text-amber-300" />;
  }
}

const SPEED_OPTIONS: SimSpeed[] = [1, 2, 3, 5];
const UI_MODE_ORDER: UiMode[] = ['very_easy', 'easy', 'hard', 'extended', 'ultra_realistic'];

export function TopHudBar({
  gameState,
  summaries,
  capitalWeather,
  account,
  t,
  lang,
  muted,
  effectiveTier,
  fpsCap = 'unlimited',
  uiMode,
  mapOverlayMode = 'political',
  autoPilotCountdownSec = null,
  onChangeMapOverlay,
  onChangeUiMode,
  fpsDomRef,
  onToggleSimPause,
  onSetSimSpeed,
  onToggleAutoPilot,
  onOpenBudgetDrawer,
  onOpenTechTree,
  onOpenLeaderboard,
  onFocusCapital,
  onToggleMute,
  onOpenAccount,
  onOpenSaveLoad,
  onOpenSettings,
  onOpenTutorial,
  onBackToMenu,
}: {
  gameState: GameState;
  summaries: Record<string, CountrySummary>;
  capitalWeather: WeatherKind;
  account: BlocksAccount;
  t: Translations;
  lang: Language;
  muted: boolean;
  effectiveTier: EffectiveTier;
  fpsCap?: FpsCap;
  uiMode: UiMode;
  mapOverlayMode?: MapOverlayMode;
  autoPilotCountdownSec?: number | null;
  onChangeMapOverlay?: (mode: MapOverlayMode) => void;
  onChangeUiMode: (mode: UiMode) => void;
  fpsDomRef: React.RefObject<HTMLSpanElement | null>;
  onToggleSimPause: () => void;
  onSetSimSpeed: (speed: SimSpeed) => void;
  onToggleAutoPilot: () => void;
  onOpenBudgetDrawer: () => void;
  onOpenTechTree: () => void;
  onOpenLeaderboard: () => void;
  onFocusCapital: () => void;
  onToggleMute: () => void;
  onOpenAccount: () => void;
  onOpenSaveLoad: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onBackToMenu: () => void;
}) {
  const isSpectator = gameState.gameMode === 'bot_spectator';
  const playerCountry = !isSpectator ? gameState.countries[gameState.playerCountryId] : undefined;
  const summary = !isSpectator ? summaries[gameState.playerCountryId] : undefined;
  const monthShort = (MONTHS[lang][gameState.monthIndex] ?? MONTHS.en[0]).slice(0, 3);
  const dayStr = String(gameState.day).padStart(2, '0');
  const seasonName = SEASON_NAMES[lang][gameState.season];
  const weatherLabel = WEATHER_NAMES[lang][capitalWeather].label;
  const numberLocale = lang === 'en' ? 'en-US' : 'pl-PL';

  const activeNationsCount = Object.values(gameState.countries).filter((c) => !c.eliminated).length;
  const activeWarsCount =
    Object.values(gameState.countries).reduce((acc, c) => acc + c.atWarWith.length, 0) >> 1;
  const waterAlertCount = gameState.waterAlerts.length;
  const warming = Math.round(gameState.globalWarmingIndex ?? 24);
  const warmingColor =
    warming >= 70
      ? 'border-rose-500/55 bg-rose-950/75 text-rose-300'
      : warming >= 42
      ? 'border-amber-500/50 bg-amber-950/60 text-amber-300'
      : 'border-sky-500/40 bg-slate-950/85 text-sky-300';

  const commanderLevel = gameState.commanderLevel ?? 1;
  const commanderXp = gameState.commanderXp ?? 0;
  const rankId = gameState.commanderRankId ?? 'cadet';
  const rankLabel = COMMANDER_RANK_NAMES[lang][rankId];
  const curBaseXp = Math.pow(commanderLevel - 1, 2) * 55;
  const nextLvlXp = Math.pow(commanderLevel, 2) * 55;
  const xpProgressPct = Math.min(
    100,
    Math.max(6, Math.round(((commanderXp - curBaseXp) / Math.max(1, nextLvlXp - curBaseXp)) * 100)),
  );

  const totalPlayableProvs = Object.keys(gameState.provinces).length;
  const ownedProvsCount = summary?.provinceCount ?? 0;
  const conquestPct =
    totalPlayableProvs > 0 ? ((ownedProvsCount / totalPlayableProvs) * 100).toFixed(1) : '0.0';

  const tierLabel =
    effectiveTier === 'ultra'
      ? 'ULTRA'
      : effectiveTier === 'medium'
      ? lang === 'en'
        ? 'MED'
        : 'ŚR'
      : lang === 'en'
      ? 'LOW'
      : 'LEK';

  const mapModes: Array<{ id: MapOverlayMode; label: string }> = [
    { id: 'political', label: `🌍 ${t.politicalView}` },
    { id: 'thermal', label: `🌡️ ${t.thermalView}` },
    { id: 'religions', label: `🛐 ${t.mapModeReligions}` },
    { id: 'cultures', label: `🎭 ${t.mapModeCultures}` },
    { id: 'economy', label: `💰 ${t.mapModeEconomy}` },
    { id: 'resources', label: `⛏️ ${t.mapModeResources}` },
    { id: 'diplomacy', label: `🤝 ${t.mapModeDiplomacy}` },
    { id: 'logistics', label: `🚆 ${t.logisticsView}` },
  ];

  return (
    <div className="pointer-events-auto relative z-30 hidden md:flex flex-col">
      {isSpectator && (
        <div
          data-testid="bot-spectator-banner"
          className="flex flex-wrap items-center justify-between gap-2 px-4 py-1 border-b border-sky-400/40 bg-sky-950/95 text-xs"
        >
          <div className="flex items-center gap-2 text-sky-100 font-semibold">
            <Bot size={14} className="text-sky-300 shrink-0" />
            <span>🤖 {t.botModeBanner}</span>
          </div>
          <div className="text-[11px] font-mono-num text-sky-300">
            {activeNationsCount} nations · {activeWarsCount} active wars
          </div>
        </div>
      )}

      <header className="flex flex-nowrap items-center justify-between gap-1.5 px-2 py-1 border-b aoh-hud-bar overflow-hidden">
        {/* TOP-LEFT: Imperial Framed Flag + Commander XP + Conquest% + Telemetry */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          {playerCountry && summary ? (
            <button
              type="button"
              onClick={onFocusCapital}
              title={playerCountry.displayName}
              className="group relative flex items-center justify-center p-0.5 rounded border border-amber-400/70 bg-slate-950/95 shadow-md hover:border-amber-300 transition-colors cursor-pointer shrink-0"
            >
              <FlagBadge flag={playerCountry.flag} label={playerCountry.displayName} width={42} height={27} />
            </button>
          ) : (
            <div className="flex items-center justify-center w-11 h-7 rounded border border-sky-400/50 bg-sky-950/80 text-sky-300 shrink-0">
              <Bot size={16} />
            </div>
          )}

          {playerCountry && summary ? (
            <div className="flex flex-col min-w-0 shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-display text-xs font-extrabold text-white truncate max-w-[105px]">
                  {playerCountry.displayName}
                </span>
                <span
                  data-testid="commander-rank-badge"
                  title={`${t.commanderXpLabel}: ${commanderXp} XP (${rankLabel})`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-amber-400/45 bg-amber-500/15 text-[9.5px] font-mono-num font-bold text-amber-200 whitespace-nowrap"
                >
                  <Award size={9} className="text-amber-300 shrink-0" />
                  <span>Lv.{commanderLevel}</span>
                  <span className="hidden 2xl:inline text-amber-300/90">· {rankLabel}</span>
                  <span className="hidden 2xl:inline-block w-7 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <span
                      className="block h-full bg-amber-400"
                      style={{ width: `${xpProgressPct}%` }}
                    />
                  </span>
                </span>
                <span
                  data-testid="world-conquest-progress"
                  title={`${t.worldConquestProgressLabel}: ${ownedProvsCount}/${totalPlayableProvs}`}
                  className="inline-flex items-center gap-0.5 text-[10px] font-mono-num font-bold text-cyan-300 whitespace-nowrap"
                >
                  <Globe2 size={10} className="text-cyan-400" />
                  {conquestPct}%
                </span>
                <span className="hidden 2xl:inline-flex items-center gap-1 text-[10px] font-mono-num text-slate-400 whitespace-nowrap">
                  <MapIcon size={10} className="text-amber-400" />
                  {summary.areaKm2.toLocaleString(numberLocale)} km²
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono-num text-rose-300 font-bold whitespace-nowrap">
                  <Swords size={10} className="text-rose-400" />
                  {summary.totalArmy.toLocaleString(numberLocale)}
                </span>
              </div>

              <div className="mt-0.5 flex flex-nowrap items-center gap-x-1.5 text-[10.5px] font-mono-num whitespace-nowrap">
                <button
                  type="button"
                  data-testid="treasury-button"
                  onClick={onOpenBudgetDrawer}
                  title={`${t.treasuryModalTitle} (${t.taxRateLabel}: ${playerCountry.taxRate}%)`}
                  className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold cursor-pointer whitespace-nowrap"
                >
                  <Coins size={11} className="text-amber-400 shrink-0" />
                  <span>{playerCountry.treasury.toFixed(1)} PLN</span>
                  <span className={summary.incomePerTurn >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    ({summary.incomePerTurn >= 0 ? '+' : ''}
                    {summary.incomePerTurn.toFixed(1)})
                  </span>
                </button>

                <span className="text-slate-700">|</span>

                <span className="inline-flex items-center gap-0.5 text-emerald-300 font-bold whitespace-nowrap" title={t.manpowerLabel}>
                  <UserPlus size={11} className="text-emerald-400 shrink-0" />
                  {Math.round(summary.manpower / 1000)}k
                </span>

                <span className="text-slate-700">|</span>

                <button
                  type="button"
                  data-testid="tech-tree-btn"
                  onClick={onOpenTechTree}
                  title={t.research}
                  className="inline-flex items-center gap-0.5 text-sky-300 hover:text-sky-200 font-bold cursor-pointer whitespace-nowrap"
                >
                  <FlaskConical size={11} className="text-sky-400 shrink-0" />
                  <span>{Math.round(playerCountry.researchPoints)} RP</span>
                </button>

                {uiMode !== 'very_easy' && (
                  <>
                    <span className="text-slate-700">|</span>
                    <span
                      data-testid="stability-stat"
                      className="inline-flex items-center gap-0.5 text-slate-100 font-bold whitespace-nowrap"
                      title={t.stability}
                    >
                      <Shield size={11} className="text-amber-400 shrink-0" />
                      {playerCountry.stability}%
                    </span>
                    <span className="text-slate-700 hidden 2xl:inline">|</span>
                    <span className="hidden 2xl:inline-flex items-center gap-1.5 text-[10px] text-slate-300 whitespace-nowrap">
                      <span className="text-sky-300 font-bold">
                        {t.diplomacyPts}:{playerCountry.diplomacyPoints}/{playerCountry.maxDiplomacyPoints}
                      </span>
                      <span className="text-amber-300 font-bold">
                        {t.movementPts}:{playerCountry.movementPoints}/{playerCountry.maxMovementPoints}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="font-display text-xs sm:text-sm font-extrabold text-white">
                {t.botModeLabel}
              </div>
              <div className="text-[11px] font-mono-num text-sky-300">
                {activeNationsCount} active states · {activeWarsCount} wars
              </div>
            </div>
          )}
        </div>

        {/* TOP-RIGHT: 8 Map Views + Warming + Smart Auto-Pilot + Clock + Uncapped FPS + Load/Save + Tools */}
        <div className="flex flex-nowrap items-center gap-1 shrink-0 justify-end">
          {/* 8-Mode Map Overlay Selector + Quick Thermal Toggle */}
          {onChangeMapOverlay && (
            <div className="flex items-center gap-0.5 rounded-lg border border-slate-800 bg-slate-950/95 p-0.5">
              <Layers size={11} className="text-amber-400 ml-1 shrink-0" />
              <select
                data-testid="map-overlay-select"
                aria-label="Map View Mode"
                value={mapOverlayMode}
                onChange={(e) => onChangeMapOverlay(e.target.value as MapOverlayMode)}
                className="bg-transparent text-[10px] font-bold text-slate-100 px-1 py-0.5 focus:outline-none cursor-pointer"
              >
                {mapModes.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-950 text-slate-100">
                    {m.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                data-testid="map-overlay-thermal"
                onClick={() => onChangeMapOverlay(mapOverlayMode === 'thermal' ? 'political' : 'thermal')}
                title={t.thermalView}
                className={`p-1 rounded cursor-pointer ${
                  mapOverlayMode === 'thermal'
                    ? 'bg-orange-400 text-slate-950'
                    : 'text-orange-300 hover:bg-slate-800'
                }`}
              >
                <Flame size={11} />
              </button>
            </div>
          )}

          {/* Global Warming Index Gauge */}
          <div
            data-testid="global-warming-index"
            title={`${t.globalWarmingLabel}: ${warming}/100`}
            className={`inline-flex items-center gap-1 px-1.5 py-1 rounded border text-[10px] font-mono-num font-bold whitespace-nowrap ${warmingColor}`}
          >
            <Thermometer size={11} className="shrink-0" />
            <span>{warming}</span>
          </div>

          {/* 1-Click Smart Auto-Pilot + 5s War Airlift Countdown */}
          {!isSpectator && (
            <button
              type="button"
              data-testid="autopilot-toggle-btn"
              onClick={onToggleAutoPilot}
              title={t.autoPilotToggle}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                gameState.autoPilotEnabled
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                  : 'border-slate-700 bg-slate-950/90 text-slate-300 hover:border-cyan-400/60 hover:text-white'
              }`}
            >
              <Cpu size={12} className={gameState.autoPilotEnabled ? 'text-cyan-300' : 'text-slate-400'} />
              <span className="2xl:hidden">{gameState.autoPilotEnabled ? 'AI ON' : 'Auto'}</span>
              <span className="hidden 2xl:inline">
                {gameState.autoPilotEnabled ? t.autoPilotActive : t.autoPilotToggle}
              </span>
            </button>
          )}

          {gameState.autoPilotEnabled && autoPilotCountdownSec !== null && autoPilotCountdownSec > 0 && (
            <div
              data-testid="autopilot-countdown"
              className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg border border-cyan-400/60 bg-cyan-950/85 text-[10px] font-mono-num font-bold text-cyan-200 whitespace-nowrap animate-pulse"
            >
              <Plane size={10} className="text-cyan-300 shrink-0" />
              <span>{t.autoPilotAirliftingCountdown.replace('{s}', String(autoPilotCountdownSec))}</span>
            </div>
          )}

          {/* Date & Speed Controls */}
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/35 bg-slate-950/95 px-2 py-1">
            <div
              className="text-right pr-1.5 border-r border-slate-800 whitespace-nowrap"
              title={`${seasonName} · ${weatherLabel}`}
            >
              <div
                data-testid="sim-date-clock"
                className="text-[11px] font-bold text-white font-mono-num leading-tight"
              >
                {dayStr} {monthShort} {gameState.year}
              </div>
              <div className="text-[9px] text-amber-300 font-mono-num flex items-center justify-end gap-1">
                <WeatherIcon weather={capitalWeather} />
                <span>{seasonName}</span>
                {waterAlertCount > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-sky-300" title="Maritime Water Alerts">
                    <Waves size={9} />
                    {waterAlertCount}
                  </span>
                )}
                {gameState.nuclearWinterLevel > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-rose-400" title="Nuclear Winter">
                    <Radiation size={9} />
                    {gameState.nuclearWinterLevel}%
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                data-testid="speed-paused"
                onClick={onToggleSimPause}
                title="Active Pause (Space)"
                className={`inline-flex items-center gap-0.5 px-1.5 py-1 rounded text-[10px] font-mono-num font-bold cursor-pointer transition-colors ${
                  gameState.simPaused
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                <Pause size={10} />
                <span className="hidden 2xl:inline">{t.speedPaused}</span>
              </button>

              {SPEED_OPTIONS.map((sp) => {
                const active = !gameState.simPaused && gameState.simSpeed === sp;
                return (
                  <button
                    key={sp}
                    type="button"
                    data-testid={`speed-${sp}x`}
                    onClick={() => onSetSimSpeed(sp)}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-1 rounded text-[10px] font-mono-num font-bold cursor-pointer transition-colors ${
                      active
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white'
                    }`}
                  >
                    {sp === 1 && <Play size={9} />}
                    {sp}x
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5-Mode UI Cycler */}
          <button
            type="button"
            data-testid="hud-uimode-toggle"
            onClick={() => {
              const idx = UI_MODE_ORDER.indexOf(uiMode);
              onChangeUiMode(UI_MODE_ORDER[(idx + 1) % UI_MODE_ORDER.length]);
            }}
            title={t.uiModeLabel}
            className="hidden 2xl:inline-flex items-center px-2 py-1 rounded-lg border border-slate-800 bg-slate-950/90 hover:border-amber-400/60 text-[10px] font-bold text-slate-200 cursor-pointer whitespace-nowrap"
          >
            {UI_MODE_TEXT[lang][uiMode]}
          </button>

          {/* Live Uncapped FPS Counter + Cap Readout */}
          <div
            data-testid="fps-counter"
            className="flex items-center gap-1 px-1.5 py-1 rounded-lg border border-slate-800 bg-slate-950/90 text-[10px] font-mono-num font-bold text-emerald-400 whitespace-nowrap"
          >
            <span ref={fpsDomRef}>60 FPS</span>
            <span className="text-[9px] text-cyan-300 border-l border-slate-800 pl-1">
              {fpsCap === 'unlimited' ? '∞ Hz' : `${fpsCap}`}
            </span>
            <span className="hidden 2xl:inline text-[9px] text-sky-300 border-l border-slate-800 pl-1">
              {tierLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenLeaderboard}
            data-testid="leaderboard-btn"
            aria-label={t.leaderboardBtn}
            title={t.leaderboardBtn}
            className="p-1.5 rounded-lg border border-amber-500/35 bg-slate-950/90 hover:border-amber-400 text-amber-300 cursor-pointer"
          >
            <Trophy size={14} />
          </button>

          {/* Prominent Load & Save Campaign Pills */}
          <button
            type="button"
            data-testid="hud-load-btn"
            onClick={onOpenSaveLoad}
            aria-label={t.loadGame}
            title={t.loadGame}
            className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg border border-sky-500/40 bg-sky-950/75 hover:border-sky-400 text-[10px] font-bold text-sky-200 cursor-pointer whitespace-nowrap"
          >
            <FolderOpen size={12} className="text-sky-300 shrink-0" />
            <span className="hidden xl:inline">{t.loadSlot}</span>
          </button>

          <button
            type="button"
            data-testid="hud-save-btn"
            onClick={onOpenSaveLoad}
            aria-label={t.saveGame}
            title={t.saveGame}
            className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg border border-emerald-500/40 bg-emerald-950/75 hover:border-emerald-400 text-[10px] font-bold text-emerald-200 cursor-pointer whitespace-nowrap"
          >
            <Save size={12} className="text-emerald-300 shrink-0" />
            <span className="hidden xl:inline">SAVE</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={t.soundLabel}
            title={muted ? t.soundOff : t.soundOn}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/90 hover:border-slate-600 text-slate-300 hover:text-white cursor-pointer"
          >
            {muted ? <VolumeX size={14} className="text-rose-400" /> : <Volume2 size={14} />}
          </button>

          <button
            type="button"
            onClick={onOpenTutorial}
            aria-label={t.tutorial}
            title={t.tutorial}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/90 hover:border-slate-600 text-slate-300 hover:text-white cursor-pointer"
          >
            <HelpCircle size={14} />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            data-testid="hud-settings-btn"
            aria-label={t.settings}
            title={t.settings}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/90 hover:border-amber-400/50 text-slate-300 hover:text-white cursor-pointer"
          >
            <Settings size={14} />
          </button>

          <button
            type="button"
            onClick={onOpenAccount}
            aria-label={account.isGuest ? t.accountBtn : account.nickname}
            title={account.isGuest ? t.accountBtn : account.nickname}
            className="hidden 2xl:inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-amber-500/35 bg-slate-950/90 hover:border-amber-400 text-xs font-semibold text-amber-200 whitespace-nowrap cursor-pointer"
          >
            <AvatarIcon avatarId={account.avatarId} size={13} />
            <span className="max-w-[95px] truncate">
              {account.isGuest ? t.accountBtn : account.nickname}
            </span>
          </button>

          <button
            type="button"
            onClick={onBackToMenu}
            title={t.backToMenu}
            aria-label={t.backToMenu}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/90 hover:border-rose-400/50 text-slate-300 hover:text-white cursor-pointer"
          >
            <Home size={14} />
          </button>
        </div>
      </header>
    </div>
  );
}
