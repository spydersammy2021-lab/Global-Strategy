import React, { useMemo, useState } from 'react';
import {
  Bot,
  Crown,
  Flame,
  Flag,
  FolderOpen,
  Globe2,
  HelpCircle,
  Play,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Swords,
  Trophy,
  UserCheck,
} from 'lucide-react';
import {
  AI_AGGRESSIVENESS_CONFIG,
  DIFFICULTIES,
  SCENARIOS,
  V4_DIFFICULTY_ORDER,
} from '../data/scenarios';
import { buildWorldMapData } from '../game/mapGen';
import { type FpsCap, glassClass } from '../game/performance';
import type {
  AiAggressiveness,
  BlocksAccount,
  CustomNationConfig,
  DifficultyId,
  EffectiveTier,
  GameMode,
  Language,
  ScenarioId,
  UiMode,
} from '../game/types';
import {
  AI_AGGRESSIVENESS_TEXT,
  DIFFICULTY_TEXT,
  SCENARIO_TEXT,
  UI_MODE_TEXT,
  type Translations,
} from '../i18n/translations';
import { AnimatedMenuMapBg } from './AnimatedMenuMapBg';
import { AvatarIcon, GlobalStrategyTitleLockup } from './BlocksLogo';
import { FlagBadge } from './FlagBadge';

const SCENARIO_ORDER: ScenarioId[] = ['2026', 'sandbox', '1939', '1918', '1619', '1410', '966'];

const UI_MODE_ORDER: UiMode[] = ['very_easy', 'easy', 'hard', 'extended', 'ultra_realistic'];
const AI_AGGR_ORDER: AiAggressiveness[] = ['friendly', 'normal', 'aggressive', 'hyper'];

const FEATURED_ORDER = [
  '616', '276', '804', '840', '156', '643', '250', '826', '380',
  '304', '352', '203', '703', '440', '428', '233', '112', '356', '392', '076',
  '499', '196', '100', '010_arctowski',
];

export function MainMenu({
  account,
  gameMode,
  onSelectGameMode,
  selectedScenario,
  onSelectScenario,
  selectedDifficulty,
  onSelectDifficulty,
  aiAggressiveness,
  onSelectAiAggressiveness,
  selectedCountryId,
  onSelectCountryId,
  uiMode,
  onSelectUiMode,
  peacefulStartEnabled,
  onTogglePeacefulStart,
  customNation,
  onOpenCustomNation,
  onStartCampaign,
  onOpenAccount,
  onOpenLoad,
  onOpenScenarioEditor,
  onOpenLeaderboard,
  onOpenSettings,
  onOpenTutorial,
  t,
  lang,
  effectiveTier,
  fpsCap = 'unlimited',
  bgPaused = false,
}: {
  account: BlocksAccount;
  gameMode: GameMode;
  onSelectGameMode: (mode: GameMode) => void;
  selectedScenario: ScenarioId;
  onSelectScenario: (id: ScenarioId) => void;
  selectedDifficulty: DifficultyId;
  onSelectDifficulty: (id: DifficultyId) => void;
  aiAggressiveness: AiAggressiveness;
  onSelectAiAggressiveness: (aggr: AiAggressiveness) => void;
  selectedCountryId: string;
  onSelectCountryId: (id: string) => void;
  uiMode: UiMode;
  onSelectUiMode: (mode: UiMode) => void;
  peacefulStartEnabled: boolean;
  onTogglePeacefulStart: () => void;
  customNation: CustomNationConfig | null;
  onOpenCustomNation: () => void;
  onStartCampaign: () => void;
  onOpenAccount: () => void;
  onOpenLoad: () => void;
  onOpenScenarioEditor: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  t: Translations;
  lang: Language;
  effectiveTier: EffectiveTier;
  fpsCap?: FpsCap;
  bgPaused?: boolean;
}) {
  const [search, setSearch] = useState('');
  const mapData = useMemo(() => buildWorldMapData(), []);
  const scenario = SCENARIOS[selectedScenario];

  const playableCountries = useMemo(() => {
    const list = Object.values(mapData.countryMetas).filter((meta) => {
      const absorbed = Boolean(
        scenario.territoryTransfers?.[meta.id] && scenario.territoryTransfers[meta.id] !== meta.id,
      );
      return !absorbed;
    });

    list.sort((a, b) => {
      const ia = FEATURED_ORDER.indexOf(a.id);
      const ib = FEATURED_ORDER.indexOf(b.id);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.name[lang].localeCompare(b.name[lang]);
    });

    return list;
  }, [mapData, scenario, lang]);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return playableCountries;
    return playableCountries.filter((c) => {
      const display = (scenario.countryNameOverrides?.[c.id] ?? c.name[lang]).toLowerCase();
      return (
        display.includes(q) ||
        c.name.pl.toLowerCase().includes(q) ||
        c.name.en.toLowerCase().includes(q) ||
        c.alpha2.toLowerCase().includes(q) ||
        c.id === q
      );
    });
  }, [playableCountries, search, scenario, lang]);

  const activeCountryId = playableCountries.some((c) => c.id === selectedCountryId)
    ? selectedCountryId
    : playableCountries[0]?.id ?? '616';

  const activeMeta = mapData.countryMetas[activeCountryId];
  const cardGlass = glassClass(effectiveTier);
  const isSpectator = gameMode === 'bot_spectator';
  const activeDiffText = DIFFICULTY_TEXT[lang][selectedDifficulty] ?? DIFFICULTY_TEXT.en.normal;

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#03060E] text-slate-100 overflow-hidden">
      <AnimatedMenuMapBg effectiveTier={effectiveTier} fpsCap={fpsCap} paused={bgPaused} />

      {/* Top Sovereign Telemetry Strip */}
      <header className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-8 pt-3">
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-md border border-amber-400/55 text-[11px] font-mono-num font-bold tracking-wider text-amber-300 ${cardGlass}`}
          >
            {t.publicBeta}
          </div>
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-sky-400/35 text-[10.5px] font-mono-num font-bold text-sky-300 ${cardGlass}`}
          >
            <span>{fpsCap === 'unlimited' ? '∞ Hz NATIVE' : `${fpsCap} FPS`}</span>
            <span className="text-slate-600">|</span>
            <span>{playableCountries.length} NATIONS & POLAR SECTORS</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAccount}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-400/40 text-xs font-bold text-amber-200 hover:border-amber-300 transition-colors cursor-pointer ${cardGlass}`}
        >
          {account.isGuest ? (
            <UserCheck size={14} className="text-amber-300" />
          ) : (
            <AvatarIcon avatarId={account.avatarId} size={14} />
          )}
          <span>{account.isGuest ? t.accountBtn : `${account.nickname} · ${account.id}`}</span>
        </button>
      </header>

      {/* Main Layout: VERSION 4.0 Command Bridge */}
      <main className="relative z-10 flex-1 flex items-start lg:items-center justify-center px-4 sm:px-8 py-2.5 overflow-y-auto gs-scroll">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch my-auto">
          {/* LEFT SOVEREIGN DECK */}
          <div className={`lg:col-span-4 rounded-2xl border p-4 sm:p-5 flex flex-col justify-between gap-3.5 ${cardGlass}`}>
            <div className="space-y-3">
              <GlobalStrategyTitleLockup />

              <div className="h-px bg-gradient-to-r from-amber-400/65 via-sky-400/35 to-transparent" />

              <nav aria-label="Main Menu Navigation" className="flex flex-col gap-1.5">
                <button
                  type="button"
                  data-testid="mode-player-btn"
                  onClick={() => onSelectGameMode('player')}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg border text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    !isSpectator
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_18px_-4px_rgba(234,179,8,0.4)]'
                      : 'border-slate-800 bg-slate-950/75 text-slate-300 hover:border-amber-500/40 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Swords size={15} className={!isSpectator ? 'text-amber-300' : 'text-slate-400'} />
                    {t.playerModeLabel}
                  </span>
                  {!isSpectator && <span className="text-[10px] font-mono-num uppercase text-amber-300">ACTIVE</span>}
                </button>

                <button
                  type="button"
                  data-testid="mode-bot-btn"
                  onClick={() => onSelectGameMode('bot_spectator')}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg border text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    isSpectator
                      ? 'border-sky-400 bg-sky-500/20 text-sky-200 shadow-[0_0_18px_-4px_rgba(56,189,248,0.4)]'
                      : 'border-slate-800 bg-slate-950/75 text-slate-300 hover:border-sky-500/40 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Bot size={15} className={isSpectator ? 'text-sky-300' : 'text-slate-400'} />
                    {t.botModeLabel}
                  </span>
                  {isSpectator && <span className="text-[10px] font-mono-num uppercase text-sky-300">ACTIVE</span>}
                </button>

                {/* Prominent LOAD GAME button */}
                <button
                  type="button"
                  data-testid="menu-load-game-btn"
                  onClick={onOpenLoad}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-lg border border-sky-400/55 bg-sky-500/15 hover:bg-sky-500/25 text-xs sm:text-sm font-extrabold text-sky-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen size={15} className="text-sky-300" />
                    <span className="uppercase tracking-wide">{t.loadGame}</span>
                  </span>
                  <span className="text-[10px] font-mono-num text-sky-300">SLOTS</span>
                </button>

                {/* Custom Nation Creator button */}
                <button
                  type="button"
                  data-testid="custom-nation-btn"
                  onClick={onOpenCustomNation}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-lg border text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    customNation
                      ? 'border-emerald-400/70 bg-emerald-500/15 text-emerald-100'
                      : 'border-slate-800 bg-slate-950/75 hover:border-amber-400/50 text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {customNation ? (
                      <FlagBadge flag={customNation.flag} width={18} height={12} />
                    ) : (
                      <Flag size={15} className="text-amber-400 shrink-0" />
                    )}
                    <span className="truncate">{customNation ? customNation.name : t.customNationBtn}</span>
                  </span>
                  <span className="text-[10px] font-mono-num text-amber-300 shrink-0">
                    {customNation ? 'READY' : 'CREATE'}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="scenario-editor-btn"
                  onClick={onOpenScenarioEditor}
                  className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-800 bg-slate-950/75 hover:border-purple-400/50 hover:bg-slate-900/90 text-xs sm:text-sm font-semibold text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <SlidersHorizontal size={15} className="text-purple-400" />
                  <span>{t.scenarioEditorBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenLeaderboard}
                  className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-800 bg-slate-950/75 hover:border-amber-400/50 hover:bg-slate-900/90 text-xs sm:text-sm font-semibold text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Trophy size={15} className="text-amber-400" />
                  <span>{t.hallOfFameTab}</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    data-testid="menu-settings-btn"
                    onClick={onOpenSettings}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950/75 hover:border-amber-400/50 text-xs font-semibold text-slate-200 hover:text-white cursor-pointer whitespace-nowrap"
                  >
                    <Settings size={14} className="text-sky-300" />
                    <span>{t.settings}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenTutorial}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950/75 hover:border-emerald-400/50 text-xs font-semibold text-slate-200 hover:text-white cursor-pointer whitespace-nowrap"
                  >
                    <HelpCircle size={14} className="text-emerald-400" />
                    <span>{t.tutorial}</span>
                  </button>
                </div>

                {/* Quick Peaceful Start Indicator & Toggle */}
                {!isSpectator && (
                  <button
                    type="button"
                    data-testid="menu-peaceful-start-toggle"
                    onClick={onTogglePeacefulStart}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer ${
                      peacefulStartEnabled
                        ? 'border-emerald-500/45 bg-emerald-500/12 text-emerald-200'
                        : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <ShieldCheck size={13} className={peacefulStartEnabled ? 'text-emerald-400' : 'text-rose-400'} />
                      <span className="truncate">{t.peacefulStartLabel}</span>
                    </span>
                    <span className="font-mono-num shrink-0">{peacefulStartEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                )}
              </nav>
            </div>

            {/* Primary Launch CTA */}
            <div className="space-y-1.5 pt-2.5 border-t border-slate-800/80">
              <button
                type="button"
                data-start="true"
                onClick={onStartCampaign}
                className={`w-full flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl font-display text-base font-extrabold tracking-wide shadow-lg cursor-pointer transition-transform active:scale-[0.99] whitespace-nowrap ${
                  isSpectator
                    ? 'bg-sky-400 hover:bg-sky-300 text-slate-950'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950'
                }`}
              >
                {isSpectator ? <Bot size={18} /> : <Play size={18} fill="currentColor" />}
                <span>{isSpectator ? t.botModeLabel : t.startGame}</span>
              </button>
              <div className="text-center text-[10px] font-mono-num text-slate-400 whitespace-nowrap">
                Enter {t.startGame} · Space Pause · Scroll Zoom
              </div>
            </div>
          </div>

          {/* RIGHT STAGING MATRIX: 7 Scenarios, 9 V4.0 Difficulties, AI Aggressiveness (BOTH Modes), 5 UI Modes & World Atlas */}
          <div className={`lg:col-span-8 rounded-2xl border p-4 sm:p-5 flex flex-col gap-3 lg:max-h-[710px] ${cardGlass}`}>
            {/* 7 Scenarios Grid */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300/95 flex items-center gap-1.5">
                  <Globe2 size={13} className="text-amber-400" />
                  {t.selectScenario}
                </span>
                <span className="text-[10px] font-mono-num text-slate-400">
                  {SCENARIO_ORDER.length} ERAS
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-1.5">
                {SCENARIO_ORDER.map((sId) => {
                  const sText = SCENARIO_TEXT[lang][sId];
                  const active = selectedScenario === sId;
                  const isSandbox = sId === 'sandbox';
                  return (
                    <button
                      key={sId}
                      type="button"
                      data-testid={`scenario-${sId}`}
                      onClick={() => onSelectScenario(sId)}
                      className={`text-left px-2 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        active
                          ? isSandbox
                            ? 'border-cyan-400 bg-cyan-500/20'
                            : 'border-amber-400 bg-amber-500/20'
                          : 'border-slate-800/90 bg-slate-950/65 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-white leading-snug truncate">
                        {sText.title}
                      </div>
                      <div className="text-[9.5px] text-slate-400 line-clamp-1">{sText.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Aggressiveness Control — ACTIVE IN BOTH PLAYER & BOT SPECTATOR MODES */}
            <div className="rounded-xl border border-slate-800/90 bg-slate-950/55 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                <Flame size={12} className="text-rose-400" />
                {t.aiAggressivenessLabel}:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {AI_AGGR_ORDER.map((aggr) => {
                  const active = aiAggressiveness === aggr;
                  const spec = AI_AGGRESSIVENESS_CONFIG[aggr];
                  const label = AI_AGGRESSIVENESS_TEXT[lang][aggr];
                  return (
                    <button
                      key={aggr}
                      type="button"
                      data-testid={`ai-aggr-${aggr}`}
                      onClick={() => onSelectAiAggressiveness(aggr)}
                      style={active ? { borderColor: spec.color } : undefined}
                      className={`px-2.5 py-1 rounded-md border text-[10.5px] font-bold cursor-pointer transition-colors ${
                        active
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-950/75 text-slate-400 hover:text-white'
                      }`}
                    >
                      {label.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 9-Tier V4.0 Difficulty Selector + 5 UI Complexity Modes */}
            {!isSpectator ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-400" />
                    {t.selectDifficulty}
                  </span>
                  <span className="text-[10px] font-semibold normal-case text-amber-200 truncate max-w-[360px]">
                    {activeDiffText.desc}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {V4_DIFFICULTY_ORDER.map((dId) => {
                    const active = selectedDifficulty === dId;
                    const dSpec = DIFFICULTIES[dId];
                    const dText = DIFFICULTY_TEXT[lang][dId];
                    const isTopImpossible = dId === 'extreme_ultra_impossible';

                    return (
                      <button
                        key={dId}
                        type="button"
                        data-testid={`difficulty-${dId}`}
                        onClick={() => onSelectDifficulty(dId)}
                        style={active ? { borderColor: dSpec.color } : undefined}
                        className={`px-2.5 py-1.5 rounded-lg border text-left transition-colors cursor-pointer ${
                          active
                            ? isTopImpossible
                              ? 'bg-gradient-to-r from-rose-950 to-red-900/80 text-rose-100 shadow-[0_0_16px_rgba(225,29,72,0.45)]'
                              : 'bg-slate-800/95 text-white shadow-sm'
                            : 'border-slate-800 bg-slate-950/65 text-slate-300 hover:border-slate-600 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isTopImpossible ? (
                            <Crown size={12} className="text-rose-400 shrink-0" />
                          ) : (
                            <span
                              className="inline-block w-2 h-2 rounded-sm shrink-0"
                              style={{ backgroundColor: dSpec.color }}
                            />
                          )}
                          <span className="text-[10.5px] font-extrabold truncate">{dText.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 5-Tier Visual Interface Mode */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-800/70">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                    {t.uiModeLabel}:
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {UI_MODE_ORDER.map((mId) => (
                      <button
                        key={mId}
                        type="button"
                        data-testid={`menu-uimode-${mId}`}
                        onClick={() => onSelectUiMode(mId)}
                        className={`px-2 py-1 rounded border text-[10px] font-bold cursor-pointer transition-colors ${
                          uiMode === mId
                            ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                            : 'border-slate-800 bg-slate-950/65 text-slate-400 hover:text-white'
                        }`}
                      >
                        {UI_MODE_TEXT[lang][mId]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-sky-400/40 bg-sky-500/12 px-3.5 py-2.5 text-xs text-sky-100 leading-relaxed flex items-center gap-2.5">
                <Bot size={17} className="text-sky-300 shrink-0" />
                <span>{t.botModeDesc}</span>
              </div>
            )}

            {/* Complete World Nation Selector */}
            {!customNation ? (
              <div className="flex-1 flex flex-col min-h-[165px]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {t.selectCountry}
                    </span>
                    {activeMeta && (
                      <div className="flex items-center gap-2 pl-3 border-l border-slate-800 min-w-0">
                        <FlagBadge flag={activeMeta.flag} width={24} height={16} />
                        <span className="text-xs font-bold text-amber-200 truncate">
                          {scenario.countryNameOverrides?.[activeMeta.id] ?? activeMeta.name[lang]}
                        </span>
                        <span className="text-[11px] font-mono-num text-slate-400 shrink-0">
                          {activeMeta.areaKm2.toLocaleString(lang === 'en' ? 'en-US' : 'pl-PL')} km²
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="relative w-full sm:w-52">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t.searchCountry}
                      aria-label={t.searchCountry}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/90 pl-8 pr-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto gs-scroll grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1.5 pr-1">
                  {filteredCountries.map((country) => {
                    const isSelected = activeCountryId === country.id;
                    const displayName = scenario.countryNameOverrides?.[country.id] ?? country.name[lang];
                    const estArmy = Math.round(
                      (scenario.strengthOverrides?.[country.id] ??
                        (country.startingArmy2026 ?? 15000) * scenario.armyScale) / 1000,
                    );
                    return (
                      <button
                        key={country.id}
                        type="button"
                        data-testid={`country-card-${country.id}`}
                        onClick={() => onSelectCountryId(country.id)}
                        className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/20'
                            : 'border-slate-800/85 bg-slate-950/60 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FlagBadge flag={country.flag} width={22} height={15} />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{displayName}</div>
                            <div className="text-[10px] text-slate-400 font-mono-num">
                              {country.areaKm2.toLocaleString(lang === 'en' ? 'en-US' : 'pl-PL')} km²
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono-num font-bold text-amber-300 shrink-0">
                          {estArmy}k
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 rounded-xl border border-emerald-500/45 bg-emerald-950/20 p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FlagBadge flag={customNation.flag} label={customNation.name} width={54} height={36} />
                    <div>
                      <div className="text-sm font-extrabold text-white">{customNation.name}</div>
                      <div className="text-xs text-emerald-300">
                        Capital: {customNation.capitalName} · {customNation.provinceIds.length} starting provinces
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenCustomNation}
                    className="px-3 py-1.5 rounded-lg border border-emerald-400/50 bg-emerald-500/20 text-xs font-bold text-emerald-100 cursor-pointer"
                  >
                    Edit Nation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Official Copyright Footer */}
      <footer className="relative z-10 px-6 py-2 border-t border-amber-500/25 bg-slate-950/92 text-center text-[11px] text-slate-400">
        {t.developedBy}
      </footer>
    </div>
  );
}
