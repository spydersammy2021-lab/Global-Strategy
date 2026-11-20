import React, { useMemo, useState } from 'react';
import {
  Bot,
  FolderOpen,
  HelpCircle,
  Play,
  Search,
  Settings,
  SlidersHorizontal,
  Swords,
  Trophy,
  UserCheck,
} from 'lucide-react';
import { DIFFICULTIES, SCENARIOS } from '../data/scenarios';
import { buildWorldMapData } from '../game/mapGen';
import { glassClass } from '../game/performance';
import type {
  BlocksAccount,
  DifficultyId,
  EffectiveTier,
  GameMode,
  Language,
  ScenarioId,
  UiMode,
} from '../game/types';
import { DIFFICULTY_TEXT, SCENARIO_TEXT, type Translations } from '../i18n/translations';
import { AnimatedMenuMapBg } from './AnimatedMenuMapBg';
import { AvatarIcon, GlobalStrategyTitleLockup } from './BlocksLogo';
import { FlagBadge } from './FlagBadge';

const SCENARIO_ORDER: ScenarioId[] = ['2026', '1939', '1918', '1619', '1410', '966'];
const DIFFICULTY_ORDER: Array<{ id: DifficultyId; color: string }> = [
  { id: 'very_easy', color: '#22C55E' },
  { id: 'easy', color: '#38BDF8' },
  { id: 'normal', color: '#F59E0B' },
  { id: 'hard', color: '#F97316' },
  { id: 'extreme', color: '#EF4444' },
  { id: 'extreme_plus', color: '#DC2626' },
];
const FEATURED_ORDER = [
  '616', '276', '804', '840', '156', '643', '250', '826', '380',
  '203', '703', '440', '428', '233', '112', '356', '392', '076',
];

export function MainMenu({
  account,
  gameMode,
  onSelectGameMode,
  selectedScenario,
  onSelectScenario,
  selectedDifficulty,
  onSelectDifficulty,
  selectedCountryId,
  onSelectCountryId,
  uiMode,
  onSelectUiMode,
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
}: {
  account: BlocksAccount;
  gameMode: GameMode;
  onSelectGameMode: (mode: GameMode) => void;
  selectedScenario: ScenarioId;
  onSelectScenario: (id: ScenarioId) => void;
  selectedDifficulty: DifficultyId;
  onSelectDifficulty: (id: DifficultyId) => void;
  selectedCountryId: string;
  onSelectCountryId: (id: string) => void;
  uiMode: UiMode;
  onSelectUiMode: (mode: UiMode) => void;
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
        c.alpha2.toLowerCase().includes(q)
      );
    });
  }, [playableCountries, search, scenario, lang]);

  const activeCountryId = playableCountries.some((c) => c.id === selectedCountryId)
    ? selectedCountryId
    : playableCountries[0]?.id ?? '616';

  const activeMeta = mapData.countryMetas[activeCountryId];
  const cardGlass = glassClass(effectiveTier);
  const isSpectator = gameMode === 'bot_spectator';

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#050914] text-slate-100 overflow-hidden">
      {/* Live Animated Political World Map Backdrop */}
      <AnimatedMenuMapBg effectiveTier={effectiveTier} />

      {/* Top Subtle Bar: Official Version 1.0 Plaque + Quick Account Status */}
      <div className="relative z-10 flex items-center justify-between px-5 sm:px-8 pt-3.5">
        <div
          className={`px-3 py-1 rounded border border-amber-400/50 text-[11px] font-mono-num font-bold tracking-wider text-amber-300 ${cardGlass}`}
        >
          {t.publicBeta}
        </div>

        <button
          type="button"
          onClick={onOpenAccount}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold text-amber-200 hover:border-amber-400/70 transition-colors cursor-pointer ${cardGlass}`}
        >
          {account.isGuest ? (
            <UserCheck size={14} className="text-amber-300" />
          ) : (
            <AvatarIcon avatarId={account.avatarId} size={14} />
          )}
          <span>{account.isGuest ? t.accountBtn : `${account.nickname} · ${account.id}`}</span>
        </button>
      </div>

      {/* Main Content: Authentic AoH3 Vertical Left Command Menu + Right Campaign Staging Panel */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-5 sm:px-8 py-3 overflow-y-auto gs-scroll">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* LEFT: AoH3 Vertical Command Menu */}
          <div className={`lg:col-span-4 rounded-xl border p-5 flex flex-col justify-between gap-4 ${cardGlass}`}>
            <div className="space-y-4">
              <GlobalStrategyTitleLockup />

              <div className="h-px bg-gradient-to-r from-amber-500/50 via-slate-700/60 to-transparent" />

              {/* Clean Vertical Action List */}
              <nav aria-label="Main Menu Navigation" className="flex flex-col gap-2">
                <button
                  type="button"
                  data-testid="mode-player-btn"
                  onClick={() => onSelectGameMode('player')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    !isSpectator
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                      : 'border-slate-800 bg-slate-950/75 text-slate-300 hover:border-amber-500/40 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Swords size={16} className={!isSpectator ? 'text-amber-300' : 'text-slate-400'} />
                    {t.playerModeLabel}
                  </span>
                  {!isSpectator && <span className="text-[10px] font-mono-num uppercase text-amber-300">ACTIVE</span>}
                </button>

                <button
                  type="button"
                  data-testid="mode-bot-btn"
                  onClick={() => onSelectGameMode('bot_spectator')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    isSpectator
                      ? 'border-sky-400 bg-sky-500/20 text-sky-200'
                      : 'border-slate-800 bg-slate-950/75 text-slate-300 hover:border-sky-500/40 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Bot size={16} className={isSpectator ? 'text-sky-300' : 'text-slate-400'} />
                    {t.botModeLabel}
                  </span>
                  {isSpectator && <span className="text-[10px] font-mono-num uppercase text-sky-300">ACTIVE</span>}
                </button>

                <button
                  type="button"
                  onClick={onOpenLoad}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/75 hover:border-amber-500/40 hover:bg-slate-900/90 text-sm font-semibold text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <FolderOpen size={16} className="text-sky-400" />
                  <span>{t.loadGame}</span>
                </button>

                <button
                  type="button"
                  data-testid="scenario-editor-btn"
                  onClick={onOpenScenarioEditor}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/75 hover:border-purple-400/50 hover:bg-slate-900/90 text-sm font-semibold text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <SlidersHorizontal size={16} className="text-purple-400" />
                  <span>{t.scenarioEditorBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenAccount}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/75 hover:border-amber-400/50 hover:bg-slate-900/90 text-sm font-semibold text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <UserCheck size={16} className="text-amber-400" />
                  <span>{t.accountBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenLeaderboard}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/75 hover:border-amber-400/50 hover:bg-slate-900/90 text-sm font-semibold text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Trophy size={16} className="text-amber-400" />
                  <span>{t.hallOfFameTab}</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950/75 hover:border-slate-600 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer whitespace-nowrap"
                  >
                    <Settings size={14} />
                    <span>{t.settings}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenTutorial}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950/75 hover:border-slate-600 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer whitespace-nowrap"
                  >
                    <HelpCircle size={14} className="text-emerald-400" />
                    <span>{t.tutorial}</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Primary Launch CTA */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                data-start="true"
                onClick={onStartCampaign}
                className={`w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-lg font-display text-base font-extrabold tracking-wide shadow-lg cursor-pointer transition-transform active:scale-[0.99] whitespace-nowrap ${
                  isSpectator
                    ? 'bg-sky-400 hover:bg-sky-300 text-slate-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {isSpectator ? <Bot size={18} /> : <Play size={18} fill="currentColor" />}
                <span>{isSpectator ? t.botModeLabel : t.startGame}</span>
              </button>
              <div className="text-center text-[10px] font-mono-num text-slate-400 whitespace-nowrap">
                Enter {t.startGame} · Space Pause · Drag Map
              </div>
            </div>
          </div>

          {/* RIGHT: Historical Scenarios, Difficulty & Nation Atlas Selector */}
          <div className={`lg:col-span-8 rounded-xl border p-5 flex flex-col gap-4 max-h-[610px] ${cardGlass}`}>
            {/* Historical Era Scenarios */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90 mb-2">
                {t.selectScenario}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {SCENARIO_ORDER.map((sId) => {
                  const sText = SCENARIO_TEXT[lang][sId];
                  const active = selectedScenario === sId;
                  return (
                    <button
                      key={sId}
                      type="button"
                      onClick={() => onSelectScenario(sId)}
                      className={`text-left px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                        active
                          ? 'border-amber-400 bg-amber-500/18'
                          : 'border-slate-800/90 bg-slate-950/65 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="text-xs font-bold text-white leading-snug">{sText.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{sText.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty + 3-Tier Visual Interface Mode */}
            {!isSpectator ? (
              <div className="space-y-2.5">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    <span>{t.selectDifficulty}</span>
                    <span className="text-[10px] font-semibold normal-case text-amber-300">
                      {DIFFICULTY_TEXT[lang][selectedDifficulty].desc}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {DIFFICULTY_ORDER.map((d) => {
                      const active = selectedDifficulty === d.id;
                      const dSpec = DIFFICULTIES[d.id];
                      return (
                        <button
                          key={d.id}
                          type="button"
                          data-testid={`difficulty-${d.id}`}
                          onClick={() => onSelectDifficulty(d.id)}
                          style={active ? { borderColor: dSpec.color } : undefined}
                          className={`px-2 py-2 rounded-lg border text-center transition-colors cursor-pointer ${
                            active
                              ? d.id === 'extreme_plus'
                                ? 'bg-rose-950/90 text-rose-100 shadow-[0_0_12px_rgba(220,38,38,0.35)]'
                                : 'bg-slate-800/95 text-white'
                              : 'border-slate-800 bg-slate-950/65 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span
                              className="inline-block w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: d.color }}
                            />
                            <span className="text-[10.5px] font-bold truncate">
                              {DIFFICULTY_TEXT[lang][d.id].label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3-Tier Visual Interface Complexity Selector */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/70">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                    {t.uiModeLabel}:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(
                      [
                        { id: 'very_easy', label: t.uiVeryEasy },
                        { id: 'easy', label: t.uiEasy },
                        { id: 'hard', label: t.uiHard },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        data-testid={`menu-uimode-${m.id}`}
                        onClick={() => onSelectUiMode(m.id)}
                        className={`px-2.5 py-1 rounded-lg border text-[10.5px] font-bold cursor-pointer transition-colors ${
                          uiMode === m.id
                            ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                            : 'border-slate-800 bg-slate-950/65 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m.label}
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

            {/* Nation Selection Grid */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {t.selectCountry}
                  </span>
                  {activeMeta && (
                    <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                      <FlagBadge flag={activeMeta.flag} width={24} height={16} />
                      <span className="text-xs font-bold text-amber-200">
                        {scenario.countryNameOverrides?.[activeMeta.id] ?? activeMeta.name[lang]}
                      </span>
                      <span className="text-[11px] font-mono-num text-slate-400">
                        {activeMeta.areaKm2.toLocaleString(lang === 'en' ? 'en-US' : 'pl-PL')} km²
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative w-full sm:w-56">
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

              <div className="flex-1 overflow-y-auto gs-scroll grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 pr-1">
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
                      onClick={() => onSelectCountryId(country.id)}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/18'
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
          </div>
        </div>
      </main>

      {/* Official Copyright Footer */}
      <footer className="relative z-10 px-6 py-2 border-t border-amber-500/20 bg-slate-950/85 text-center text-[11px] text-slate-400">
        {t.developedBy}
      </footer>
    </div>
  );
}
