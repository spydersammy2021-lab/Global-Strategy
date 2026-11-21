import React, { useState } from 'react';
import {
  ArrowRight,
  Bot,
  ChevronDown,
  Coins,
  Cpu,
  Flame,
  FlaskConical,
  Globe,
  HelpCircle,
  Home,
  MapPin,
  MoreHorizontal,
  Pause,
  Plane,
  Play,
  Rocket,
  Save,
  Settings,
  Swords,
  Thermometer,
  TrainFront,
  Trophy,
  UserCheck,
  UserPlus,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { CountrySummary } from '../game/combat';
import { getTotalUnits } from '../game/combat';
import { BUILDING_COSTS, type DiplomacyAction, getRecruitCost } from '../game/engine';
import type { BuildingType, GameState, Language, MapOverlayMode, SimSpeed, UnitType } from '../game/types';
import { BUILDING_NAMES, MONTHS, UNIT_NAMES, type Translations } from '../i18n/translations';
import { FlagBadge } from './FlagBadge';

type MobileSheet = 'empire' | 'province' | 'warfare' | 'more' | null;

const MOBILE_BUILDINGS: BuildingType[] = ['farm', 'factory', 'barracks', 'fort', 'university', 'railway'];

export function MobileCommandHud({
  gameState,
  summaries,
  selectedProvinceId,
  marchMode,
  muted,
  mapOverlayMode = 'political',
  autoPilotCountdownSec = null,
  onChangeMapOverlay,
  onToggleSimPause,
  onSetSimSpeed,
  onToggleAutoPilot,
  onSetMarchMode,
  onRecruit,
  onBuild,
  onAssimilate,
  onIssueOrder,
  onDiplomacy,
  onOpenTechTree,
  onOpenSpaceOcean,
  onOpenCouncil,
  onOpenBudgetDrawer,
  onOpenLeaderboard,
  onOpenSaveLoad,
  onOpenSettings,
  onOpenTutorial,
  onOpenAccount,
  onToggleMute,
  onBackToMenu,
  t,
  lang,
}: {
  gameState: GameState;
  summaries: Record<string, CountrySummary>;
  selectedProvinceId: string | null;
  marchMode: boolean;
  muted: boolean;
  mapOverlayMode?: MapOverlayMode;
  autoPilotCountdownSec?: number | null;
  onChangeMapOverlay?: (mode: MapOverlayMode) => void;
  onToggleSimPause: () => void;
  onSetSimSpeed: (speed: SimSpeed) => void;
  onToggleAutoPilot: () => void;
  onSetMarchMode: (active: boolean) => void;
  onRecruit: (provId: string, unit: UnitType, count: number) => void;
  onBuild: (provId: string, b: BuildingType) => void;
  onAssimilate: (provId: string) => void;
  onIssueOrder: (fromId: string, toId: string, ratio: number) => void;
  onDiplomacy: (targetId: string, action: DiplomacyAction) => void;
  onOpenTechTree: () => void;
  onOpenSpaceOcean: () => void;
  onOpenCouncil: () => void;
  onOpenBudgetDrawer: () => void;
  onOpenLeaderboard: () => void;
  onOpenSaveLoad: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onOpenAccount: () => void;
  onToggleMute: () => void;
  onBackToMenu: () => void;
  t: Translations;
  lang: Language;
}) {
  const [openSheet, setOpenSheet] = useState<MobileSheet>(null);
  const [selectedTargetProv, setSelectedTargetProv] = useState<string>('');
  const [selectedDipCountry, setSelectedDipCountry] = useState<string>('276');

  const isSpectator = gameState.gameMode === 'bot_spectator';
  const player = !isSpectator ? gameState.countries[gameState.playerCountryId] : undefined;
  const summary = !isSpectator ? summaries[gameState.playerCountryId] : undefined;
  const prov = selectedProvinceId ? gameState.provinces[selectedProvinceId] : undefined;
  const monthShort = (MONTHS[lang][gameState.monthIndex] ?? MONTHS.en[0]).slice(0, 3);
  const warming = Math.round(gameState.globalWarmingIndex ?? 24);

  const toggleSheet = (sheet: Exclude<MobileSheet, null>) => {
    setOpenSheet((prev) => (prev === sheet ? null : sheet));
  };

  const neighbors = prov ? [...prov.neighbors, ...prov.seaNeighbors] : [];
  const targetId = selectedTargetProv && neighbors.includes(selectedTargetProv) ? selectedTargetProv : neighbors[0] ?? '';

  const foreignCountries = Object.values(gameState.countries)
    .filter((c) => !c.eliminated && c.id !== gameState.playerCountryId)
    .slice(0, 12);

  return (
    <div data-testid="mobile-command-hud" className="md:hidden pointer-events-none fixed inset-0 z-30 flex flex-col justify-between">
      {/* Compact Top Header Bar */}
      <header className="pointer-events-auto flex items-center justify-between gap-1.5 px-2.5 py-1.5 border-b aoh-hud-bar">
        <div className="flex items-center gap-2 min-w-0">
          {player ? (
            <FlagBadge flag={player.flag} width={30} height={20} />
          ) : (
            <Bot size={18} className="text-sky-300 shrink-0" />
          )}
          {player && summary ? (
            <div className="min-w-0 leading-tight">
              <div className="text-[11px] font-bold text-white truncate max-w-[90px]">
                {player.displayName}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono-num whitespace-nowrap">
                <span className="text-amber-300 font-bold whitespace-nowrap">{player.treasury.toFixed(0)} PLN</span>
                <span className="text-sky-300 flex items-center gap-0.5 whitespace-nowrap">
                  <Thermometer size={10} />
                  {warming}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs font-bold text-sky-200">{t.botModeLabel}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onChangeMapOverlay && (
            <button
              type="button"
              onClick={() => {
                const next: MapOverlayMode =
                  mapOverlayMode === 'political'
                    ? 'thermal'
                    : mapOverlayMode === 'thermal'
                    ? 'logistics'
                    : 'political';
                onChangeMapOverlay(next);
              }}
              aria-label="Map View Mode"
              className="min-h-[38px] min-w-[38px] px-1.5 flex items-center justify-center rounded-lg border border-slate-700 bg-slate-950/90 text-amber-300 cursor-pointer"
            >
              {mapOverlayMode === 'thermal' ? (
                <Flame size={14} className="text-orange-400" />
              ) : mapOverlayMode === 'logistics' ? (
                <TrainFront size={14} className="text-sky-400" />
              ) : (
                <Globe size={14} />
              )}
            </button>
          )}

          {!isSpectator && (
            <button
              type="button"
              onClick={onToggleAutoPilot}
              aria-label={t.autoPilotToggle}
              className={`min-h-[38px] min-w-[38px] px-2 flex items-center justify-center gap-1 rounded-lg border text-[10px] font-bold cursor-pointer ${
                gameState.autoPilotEnabled
                  ? 'border-cyan-400 bg-cyan-500/25 text-cyan-200'
                  : 'border-slate-700 bg-slate-950/90 text-slate-300'
              }`}
            >
              <Cpu size={14} />
              <span>AI</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleSimPause}
            aria-label="Toggle Pause"
            className={`min-h-[38px] min-w-[38px] px-2 flex items-center justify-center rounded-lg border text-[10px] font-mono-num font-bold cursor-pointer ${
              gameState.simPaused
                ? 'border-amber-400 bg-amber-400 text-slate-950'
                : 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
            }`}
          >
            {gameState.simPaused ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <button
            type="button"
            onClick={() => {
              const speeds: SimSpeed[] = [1, 2, 3, 5];
              const idx = speeds.indexOf(gameState.simSpeed);
              onSetSimSpeed(speeds[(idx + 1) % speeds.length]);
            }}
            className="min-h-[38px] px-2 rounded-lg border border-slate-700 bg-slate-950/90 text-[10px] font-mono-num font-bold text-white cursor-pointer"
          >
            {dayStr(gameState.day)} {monthShort} · {gameState.simSpeed}x
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label={t.settings}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg border border-slate-700 bg-slate-950/90 text-slate-200 cursor-pointer"
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {gameState.autoPilotEnabled && autoPilotCountdownSec !== null && autoPilotCountdownSec > 0 && (
        <div className="mx-auto mt-1.5 px-3 py-1 rounded-full border border-cyan-400/60 bg-cyan-950/90 text-[10px] font-mono-num font-bold text-cyan-200 flex items-center gap-1.5 shadow-lg">
          <Plane size={11} className="text-cyan-300" />
          <span>{t.autoPilotAirliftingCountdown.replace('{s}', String(autoPilotCountdownSec))}</span>
        </div>
      )}

      {/* Slide-Up Collapsible Mobile Sheet + Bottom Dock */}
      <div className="pointer-events-auto flex flex-col mt-auto">
        {openSheet && (
          <div className="mx-2 mb-2 rounded-xl border aoh-hud-panel p-3 max-h-[54vh] overflow-y-auto gs-scroll space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                {openSheet === 'empire'
                  ? t.mobileTabCommand
                  : openSheet === 'province'
                  ? prov?.name ?? t.mobileTabProvince
                  : openSheet === 'warfare'
                  ? t.mobileTabWar
                  : lang === 'pl'
                  ? 'Więcej'
                  : 'More'}
              </span>
              <button
                type="button"
                onClick={() => setOpenSheet(null)}
                aria-label={t.close}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-slate-700 text-slate-300 cursor-pointer"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {openSheet === 'empire' && (
              <div className="grid grid-cols-2 gap-2">
                {!isSpectator && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenSheet(null);
                        onOpenBudgetDrawer();
                      }}
                      className="min-h-[44px] px-3 rounded-lg border border-amber-500/40 bg-slate-950/80 text-xs font-bold text-amber-200 flex items-center gap-2 cursor-pointer"
                    >
                      <Coins size={15} className="text-amber-400" />
                      {t.treasuryModalTitle}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenSheet(null);
                        onOpenTechTree();
                      }}
                      className="min-h-[44px] px-3 rounded-lg border border-sky-500/40 bg-slate-950/80 text-xs font-bold text-sky-200 flex items-center gap-2 cursor-pointer"
                    >
                      <FlaskConical size={15} className="text-sky-400" />
                      {t.techTreeBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenSheet(null);
                        onOpenSpaceOcean();
                      }}
                      className="min-h-[44px] px-3 rounded-lg border border-orange-500/40 bg-slate-950/80 text-xs font-bold text-orange-200 flex items-center gap-2 cursor-pointer"
                    >
                      <Rocket size={15} className="text-orange-400" />
                      {t.spaceOceanBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenSheet(null);
                        onOpenCouncil();
                      }}
                      className="min-h-[44px] px-3 rounded-lg border border-cyan-500/40 bg-slate-950/80 text-xs font-bold text-cyan-200 flex items-center gap-2 cursor-pointer"
                    >
                      <Globe size={15} className="text-cyan-400" />
                      {t.councilMarketBtn}
                    </button>
                  </>
                )}
              </div>
            )}

            {openSheet === 'province' && (
              <div className="space-y-2.5 text-xs">
                {prov && player && prov.ownerId === player.id ? (
                  <>
                    <div className="flex items-center justify-between text-slate-300 font-mono-num">
                      <span>⚔️ {getTotalUnits(prov.units).toLocaleString()}</span>
                      <span>{Math.round(prov.temperatureC ?? 14)}°C</span>
                      <span>Eco {prov.economy.toFixed(1)}</span>
                      {!prov.assimilated && (
                        <button
                          type="button"
                          onClick={() => onAssimilate(prov.id)}
                          className="min-h-[36px] px-2.5 rounded bg-amber-500 text-slate-950 font-bold cursor-pointer"
                        >
                          {t.assimilateBtn}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {MOBILE_BUILDINGS.map((b) => {
                        const built = prov.buildings.includes(b);
                        return (
                          <button
                            key={b}
                            type="button"
                            disabled={built || player.treasury < BUILDING_COSTS[b]}
                            onClick={() => onBuild(prov.id, b)}
                            className={`min-h-[44px] px-2 py-1.5 rounded-lg border text-[10.5px] font-bold cursor-pointer ${
                              built
                                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                                : 'border-slate-700 bg-slate-950 text-slate-200 disabled:opacity-40'
                            }`}
                          >
                            {BUILDING_NAMES[lang][b].name}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onRecruit(prov.id, 'infantry', 2000)}
                        className="flex-1 min-h-[44px] px-3 rounded-lg bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus size={14} />
                        +2k {UNIT_NAMES[lang].infantry} ({getRecruitCost(gameState, prov.id, 'infantry', 2000)} PLN)
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400 text-xs">
                    {lang === 'pl'
                      ? 'Dotknij swoją prowincję na mapie, aby rekrutować i budować.'
                      : 'Tap one of your provinces on the map to recruit and build.'}
                  </p>
                )}
              </div>
            )}

            {openSheet === 'warfare' && (
              <div className="space-y-2.5 text-xs">
                {prov && player && prov.ownerId === player.id && neighbors.length > 0 && (
                  <div className="space-y-2 border-b border-slate-800 pb-2.5">
                    <select
                      value={targetId}
                      onChange={(e) => setSelectedTargetProv(e.target.value)}
                      className="w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-950 px-2.5 text-white"
                    >
                      {neighbors.map((nid) => {
                        const np = gameState.provinces[nid];
                        return np ? (
                          <option key={nid} value={nid}>
                            {np.name} ({gameState.countries[np.ownerId]?.displayName})
                          </option>
                        ) : null;
                      })}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onSetMarchMode(!marchMode)}
                        className={`min-h-[44px] rounded-lg border font-bold cursor-pointer ${
                          marchMode ? 'border-rose-400 bg-rose-600 text-white' : 'border-slate-700 text-slate-200'
                        }`}
                      >
                        {t.marchTab}
                      </button>
                      <button
                        type="button"
                        disabled={!targetId}
                        onClick={() => targetId && onIssueOrder(prov.id, targetId, 0.75)}
                        className="min-h-[44px] rounded-lg bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ArrowRight size={14} />
                        75% {t.issueOrder}
                      </button>
                    </div>
                  </div>
                )}

                {!isSpectator && foreignCountries.length > 0 && (
                  <div className="space-y-2">
                    <select
                      value={selectedDipCountry}
                      onChange={(e) => setSelectedDipCountry(e.target.value)}
                      className="w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-950 px-2.5 text-white"
                    >
                      {foreignCountries.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.displayName}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onDiplomacy(selectedDipCountry, 'war')}
                        className="min-h-[44px] rounded-lg bg-rose-600 text-white font-bold cursor-pointer"
                      >
                        {t.declareWar}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDiplomacy(selectedDipCountry, 'alliance')}
                        className="min-h-[44px] rounded-lg border border-emerald-500/50 bg-emerald-500/20 text-emerald-200 font-bold cursor-pointer"
                      >
                        {t.proposeAlliance}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {openSheet === 'more' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenSheet(null);
                    onOpenSaveLoad();
                  }}
                  className="min-h-[44px] px-3 rounded-lg border border-slate-700 bg-slate-950 text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Save size={15} className="text-sky-400" />
                  {t.saveGame}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenSheet(null);
                    onOpenLeaderboard();
                  }}
                  className="min-h-[44px] px-3 rounded-lg border border-slate-700 bg-slate-950 text-xs font-bold text-amber-200 flex items-center gap-2 cursor-pointer"
                >
                  <Trophy size={15} className="text-amber-400" />
                  {t.leaderboardBtn}
                </button>
                <button
                  type="button"
                  onClick={onToggleMute}
                  className="min-h-[44px] px-3 rounded-lg border border-slate-700 bg-slate-950 text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  {muted ? <VolumeX size={15} className="text-rose-400" /> : <Volume2 size={15} className="text-amber-400" />}
                  {muted ? t.soundOff : t.soundOn}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenSheet(null);
                    onOpenTutorial();
                  }}
                  className="min-h-[44px] px-3 rounded-lg border border-slate-700 bg-slate-950 text-xs font-bold text-emerald-200 flex items-center gap-2 cursor-pointer"
                >
                  <HelpCircle size={15} className="text-emerald-400" />
                  {t.tutorial}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenSheet(null);
                    onOpenAccount();
                  }}
                  className="min-h-[44px] px-3 rounded-lg border border-slate-700 bg-slate-950 text-xs font-bold text-amber-200 flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck size={15} className="text-amber-300" />
                  {t.accountBtn}
                </button>
                <button
                  type="button"
                  onClick={onBackToMenu}
                  className="min-h-[44px] px-3 rounded-lg border border-rose-500/40 bg-rose-950/60 text-xs font-bold text-rose-200 flex items-center gap-2 cursor-pointer"
                >
                  <Home size={15} />
                  {t.backToMenu}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Bottom Tab Dock */}
        <nav aria-label="Mobile Command Tabs" className="grid grid-cols-4 border-t aoh-hud-bar">
          {(
            [
              { id: 'empire', label: t.mobileTabCommand, icon: <Coins size={16} /> },
              { id: 'province', label: t.mobileTabProvince, icon: <MapPin size={16} /> },
              { id: 'warfare', label: t.mobileTabWar, icon: <Swords size={16} /> },
              { id: 'more', label: lang === 'pl' ? 'Więcej' : 'More', icon: <MoreHorizontal size={16} /> },
            ] as const
          ).map((tab) => {
            const active = openSheet === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => toggleSheet(tab.id)}
                className={`min-h-[50px] flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-bold cursor-pointer transition-colors ${
                  active ? 'text-amber-300 bg-amber-500/15' : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function dayStr(d: number) {
  return String(d).padStart(2, '0');
}
