import React from 'react';
import {
  Bot,
  CloudFog,
  CloudRain,
  CloudSnow,
  Coins,
  FlaskConical,
  HelpCircle,
  Home,
  Map as MapIcon,
  Pause,
  Play,
  Radiation,
  Save,
  Settings,
  Shield,
  Sun,
  Swords,
  Trophy,
  UserPlus,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import type { CountrySummary } from '../game/combat';
import type {
  BlocksAccount,
  EffectiveTier,
  GameState,
  Language,
  SimSpeed,
  UiMode,
  WeatherKind,
} from '../game/types';
import { MONTHS, SEASON_NAMES, WEATHER_NAMES, type Translations } from '../i18n/translations';
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

export function TopHudBar({
  gameState,
  summaries,
  capitalWeather,
  account,
  t,
  lang,
  muted,
  effectiveTier,
  uiMode,
  onChangeUiMode,
  fpsDomRef,
  onToggleSimPause,
  onSetSimSpeed,
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
  uiMode: UiMode;
  onChangeUiMode: (mode: UiMode) => void;
  fpsDomRef: React.RefObject<HTMLSpanElement | null>;
  onToggleSimPause: () => void;
  onSetSimSpeed: (speed: SimSpeed) => void;
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

  return (
    <div className="pointer-events-auto relative z-30 flex flex-col">
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

      <header className="flex flex-wrap xl:flex-nowrap items-center justify-between gap-2 px-2.5 py-1.5 border-b aoh-hud-bar">
        {/* TOP-LEFT: Framed AoH3 National Flag + Compact Resource Strip */}
        <div className="flex items-center gap-2.5 min-w-0">
          {playerCountry && summary ? (
            <button
              type="button"
              onClick={onFocusCapital}
              title={playerCountry.displayName}
              className="group relative flex items-center justify-center p-1 rounded border border-amber-400/60 bg-slate-950/90 shadow-md hover:border-amber-300 transition-colors cursor-pointer shrink-0"
            >
              <FlagBadge flag={playerCountry.flag} label={playerCountry.displayName} width={48} height={31} />
            </button>
          ) : (
            <div className="flex items-center justify-center w-12 h-8 rounded border border-sky-400/50 bg-sky-950/80 text-sky-300 shrink-0">
              <Bot size={18} />
            </div>
          )}

          {playerCountry && summary ? (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-display text-xs sm:text-sm font-extrabold text-white truncate max-w-[160px]">
                  {playerCountry.displayName}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono-num text-slate-400 whitespace-nowrap">
                  <MapIcon size={10} className="text-amber-400" />
                  {summary.areaKm2.toLocaleString(numberLocale)} km²
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono-num text-rose-300 font-bold whitespace-nowrap">
                  <Swords size={10} className="text-rose-400" />
                  {summary.totalArmy.toLocaleString(numberLocale)}
                </span>
              </div>

              {/* Sleek AoH3 Resource Strip (no candy pills, crisp hairline dividers) */}
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] font-mono-num">
                <button
                  type="button"
                  data-testid="treasury-button"
                  onClick={onOpenBudgetDrawer}
                  title={`${t.treasuryModalTitle} (${t.taxRateLabel}: ${playerCountry.taxRate}%)`}
                  className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold cursor-pointer whitespace-nowrap"
                >
                  <Coins size={12} className="text-amber-400 shrink-0" />
                  <span>{playerCountry.treasury.toFixed(1)} PLN</span>
                  <span
                    className={`text-[10px] ${
                      summary.incomePerTurn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ({summary.incomePerTurn >= 0 ? '+' : ''}
                    {summary.incomePerTurn.toFixed(1)})
                  </span>
                </button>

                <span className="text-slate-700">|</span>

                <span className="inline-flex items-center gap-1 text-emerald-300 font-bold whitespace-nowrap" title={t.manpowerLabel}>
                  <UserPlus size={11} className="text-emerald-400 shrink-0" />
                  {Math.round(summary.manpower / 1000)}k
                </span>

                <span className="text-slate-700">|</span>

                <button
                  type="button"
                  data-testid="tech-tree-btn"
                  onClick={onOpenTechTree}
                  title={t.research}
                  className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-200 font-bold cursor-pointer whitespace-nowrap"
                >
                  <FlaskConical size={11} className="text-sky-400 shrink-0" />
                  <span>{Math.round(playerCountry.researchPoints)} RP</span>
                </button>

                {uiMode !== 'very_easy' && (
                  <>
                    <span className="text-slate-700 hidden sm:inline">|</span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-slate-200 font-bold whitespace-nowrap" title={t.stability}>
                      <Shield size={11} className="text-amber-400 shrink-0" />
                      {playerCountry.stability}%
                    </span>
                    <span className="text-slate-700 hidden lg:inline">|</span>
                    <span className="hidden lg:inline-flex items-center gap-2 text-[10px] text-slate-300 whitespace-nowrap">
                      <span className="text-sky-300 font-bold">
                        {t.diplomacyPts}: {playerCountry.diplomacyPoints}/{playerCountry.maxDiplomacyPoints}
                      </span>
                      <span className="text-amber-300 font-bold">
                        {t.movementPts}: {playerCountry.movementPoints}/{playerCountry.maxMovementPoints}
                      </span>
                    </span>
                  </>
                )}

                {uiMode === 'hard' && (
                  <>
                    <span className="text-slate-700 hidden xl:inline">|</span>
                    <span className="hidden xl:inline-flex items-center gap-1.5 text-[10px] text-emerald-300 font-bold whitespace-nowrap">
                      <span>
                        M{playerCountry.tech.military}/E{playerCountry.tech.economy}/L{playerCountry.tech.logistics}
                      </span>
                      {playerCountry.nuclearWarheads > 0 && (
                        <span className="text-rose-400">☢️{playerCountry.nuclearWarheads}</span>
                      )}
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

        {/* TOP-RIGHT: Real-Time Clock + Speed Bar + UI Mode + FPS & Tier + Compact Utility Icons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full xl:w-auto min-w-0 justify-between xl:justify-end">
          {/* Date & Speed Controls */}
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-slate-950/90 px-2.5 py-1">
            <div
              className="text-right pr-2 border-r border-slate-800 whitespace-nowrap"
              title={`${seasonName} · ${weatherLabel}`}
            >
              <div
                data-testid="sim-date-clock"
                className="text-xs font-bold text-white font-mono-num leading-tight"
              >
                {dayStr} {monthShort} {gameState.year}
              </div>
              <div className="text-[9.5px] text-amber-300 font-mono-num flex items-center justify-end gap-1">
                <WeatherIcon weather={capitalWeather} />
                <span>{seasonName}</span>
                {waterAlertCount > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-sky-300" title="Maritime Water Alerts">
                    <Waves size={10} />
                    {waterAlertCount}
                  </span>
                )}
                {gameState.nuclearWinterLevel > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-rose-400" title="Nuclear Winter">
                    <Radiation size={10} />
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
                <span className="hidden sm:inline">{t.speedPaused}</span>
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

          {/* Live UI Mode Cycler */}
          <button
            type="button"
            data-testid="hud-uimode-toggle"
            onClick={() => {
              const next: UiMode =
                uiMode === 'very_easy' ? 'easy' : uiMode === 'easy' ? 'hard' : 'very_easy';
              onChangeUiMode(next);
            }}
            title={t.uiModeLabel}
            className="hidden sm:inline-flex items-center px-2 py-1.5 rounded-lg border border-slate-800 bg-slate-950/90 hover:border-amber-400/60 text-[10px] font-bold text-slate-200 cursor-pointer whitespace-nowrap"
          >
            {uiMode === 'very_easy' ? t.uiVeryEasy : uiMode === 'easy' ? t.uiEasy : t.uiHard}
          </button>

          {/* Live FPS Counter + Hardware Tier */}
          <div
            data-testid="fps-counter"
            className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-800 bg-slate-950/90 text-[10.5px] font-mono-num font-bold text-emerald-400 whitespace-nowrap"
          >
            <span ref={fpsDomRef}>60 FPS</span>
            <span className="text-[9px] text-sky-300 border-l border-slate-800 pl-1.5">
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

          <button
            type="button"
            onClick={onOpenSaveLoad}
            aria-label={t.saveGame}
            title={t.saveGame}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/90 hover:border-slate-600 text-slate-300 hover:text-white cursor-pointer"
          >
            <Save size={14} />
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
            aria-label={t.settings}
            title={t.settings}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/90 hover:border-slate-600 text-slate-300 hover:text-white cursor-pointer"
          >
            <Settings size={14} />
          </button>

          <button
            type="button"
            onClick={onOpenAccount}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/35 bg-slate-950/90 hover:border-amber-400 text-xs font-semibold text-amber-200 whitespace-nowrap cursor-pointer"
          >
            <AvatarIcon avatarId={account.avatarId} size={13} />
            <span className="max-w-[115px] truncate">
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
