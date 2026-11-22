import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Bot,
  Crown,
  Edit3,
  FolderOpen,
  HelpCircle,
  Play,
  Search,
  Settings,
  UserCheck,
} from 'lucide-react';
import { buildWorldAtlas } from '../game/atlas';
import { DIFFICULTIES, SCENARIOS } from '../game/scenarios';
import type {
  ApexPremiumState,
  BlocksAccount,
  DifficultyId,
  Language,
  ScenarioId,
  UiMode,
} from '../game/types';
import type { Translations } from '../i18n/translations';
import { BlocksRoyalEmblem, FlagCrest } from './BlocksRoyalEmblem';
import { GlobeBackdrop } from './GlobeBackdrop';

export function MainMenuScreen({
  lang,
  t,
  selectedScenario,
  onSelectScenario,
  selectedCountryId,
  onSelectCountryId,
  selectedDifficulty,
  onSelectDifficulty,
  uiMode,
  onSelectUiMode,
  botSpectatorMode,
  onToggleBotMode,
  account,
  apexPremium,
  onStartCampaign,
  onOpenLoad,
  onOpenEditor,
  onOpenSettings,
  onOpenTutorial,
  onOpenAccount,
  onOpenApexPremium,
}: {
  lang: Language;
  t: Translations;
  selectedScenario: ScenarioId;
  onSelectScenario: (id: ScenarioId) => void;
  selectedCountryId: string;
  onSelectCountryId: (id: string) => void;
  selectedDifficulty: DifficultyId;
  onSelectDifficulty: (id: DifficultyId) => void;
  uiMode: UiMode;
  onSelectUiMode: (m: UiMode) => void;
  botSpectatorMode: boolean;
  onToggleBotMode: (v: boolean) => void;
  account: BlocksAccount | null;
  apexPremium: ApexPremiumState;
  onStartCampaign: () => void;
  onOpenLoad: () => void;
  onOpenEditor: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onOpenAccount: () => void;
  onOpenApexPremium: () => void;
}) {
  const [search, setSearch] = useState('');

  const countryList = useMemo(() => {
    const atlas = buildWorldAtlas();
    const featured = ['C_616', 'C_840', 'C_276', 'C_250', 'C_826', 'C_156', 'C_356', 'C_804', 'C_304', 'C_392', 'C_076', 'C_643'];
    return Object.values(atlas.countryMetas).sort((a, b) => {
      const ia = featured.indexOf(a.id);
      const ib = featured.indexOf(b.id);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countryList.slice(0, 36);
    return countryList.filter((c) => c.name.toLowerCase().includes(q) || c.flagCode.toLowerCase().includes(q)).slice(0, 40);
  }, [countryList, search]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStartCampaign();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onStartCampaign]);

  const activeCountry = countryList.find((c) => c.id === selectedCountryId) ?? countryList[0];

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-between">
      <GlobeBackdrop />

      {/* Top Subtle Command Utility Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 md:px-8 pt-4">
        <div className="flex items-center gap-3">
          <BlocksRoyalEmblem size={44} />
          <div>
            <div className="text-[10px] font-mono-num tracking-[0.22em] text-amber-300/90 uppercase">
              {t.ecosystemBadge}
            </div>
            <h1 className="font-royal text-xl md:text-2xl font-extrabold tracking-wide text-white leading-tight">
              {t.titleMain}: <span className="text-amber-300">APEX EDITION</span>
            </h1>
            <div className="text-[11px] font-mono-num text-slate-300">{t.versionBadge}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="menu-apex-premium-btn"
            onClick={onOpenApexPremium}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
              apexPremium.unlocked
                ? 'bg-amber-500/20 border-amber-300 text-amber-200 vip-crown-frame'
                : 'bg-amber-500/10 border-amber-400/40 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <Crown size={14} />
            {apexPremium.unlocked ? 'VIP Apex Unlocked' : t.apexPremiumBtn}
          </button>
          <button
            type="button"
            data-testid="menu-account-btn"
            onClick={onOpenAccount}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold royal-glass text-slate-200 hover:border-amber-400/60 cursor-pointer whitespace-nowrap"
          >
            <UserCheck size={14} className="text-amber-300" />
            {account ? `${apexPremium.unlocked ? '👑 ' : ''}${account.nickname}` : t.accountBtn}
          </button>
          <button
            type="button"
            onClick={onOpenLoad}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold royal-glass text-slate-200 hover:border-amber-400/60 cursor-pointer whitespace-nowrap"
          >
            <FolderOpen size={14} className="text-sky-300" />
            {t.loadCampaign}
          </button>
          <button
            type="button"
            onClick={onOpenEditor}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold royal-glass text-slate-200 hover:border-amber-400/60 cursor-pointer whitespace-nowrap hidden sm:inline-flex"
          >
            <Edit3 size={14} className="text-emerald-300" />
            {t.scenarioEditor}
          </button>
          <button
            type="button"
            onClick={onOpenTutorial}
            aria-label={t.tutorial}
            className="p-2 rounded-xl royal-glass text-slate-200 hover:border-amber-400/60 cursor-pointer"
          >
            <HelpCircle size={16} />
          </button>
          <button
            type="button"
            data-testid="menu-settings-btn"
            onClick={onOpenSettings}
            aria-label={t.settings}
            className="p-2 rounded-xl royal-glass text-slate-200 hover:border-amber-400/60 cursor-pointer"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Main Left-Anchored Liquid Obsidian Setup Panel over Rotating Globe */}
      <div className="relative z-10 flex-1 overflow-y-auto gs-scroll px-4 md:px-8 py-4 flex items-center">
        <div className="w-full max-w-[780px] royal-glass rounded-2xl p-4 md:p-5 space-y-4">
          {/* Scenario Selector + Mode Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <div className="text-[11px] font-semibold text-amber-300/90 uppercase tracking-wider mb-1.5">
                {t.selectScenario}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {SCENARIOS.map((sc) => {
                  const active = selectedScenario === sc.id;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      data-testid={`scenario-${sc.id}`}
                      onClick={() => onSelectScenario(sc.id)}
                      className={`px-2 py-2 rounded-lg border text-center transition-colors cursor-pointer ${
                        active
                          ? 'bg-amber-500/25 border-amber-300 text-amber-100'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-mono-num text-xs font-bold">{sc.badge}</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5">
                {(SCENARIOS.find((s) => s.id === selectedScenario) ?? SCENARIOS[5]).title[lang]} —{' '}
                {(SCENARIOS.find((s) => s.id === selectedScenario) ?? SCENARIOS[5]).subtitle[lang]}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-amber-300/90 uppercase tracking-wider mb-1.5">
                {t.gameModeLabel}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onToggleBotMode(false)}
                  className={`py-2 px-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                    !botSpectatorMode
                      ? 'bg-amber-500/20 border-amber-300 text-amber-100'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300'
                  }`}
                >
                  {t.playerMode}
                </button>
                <button
                  type="button"
                  data-testid="bot-spectator-btn"
                  onClick={() => onToggleBotMode(true)}
                  className={`py-2 px-2 rounded-lg border text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer ${
                    botSpectatorMode
                      ? 'bg-sky-500/20 border-sky-300 text-sky-100'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300'
                  }`}
                >
                  <Bot size={13} />
                  {t.botSpectatorMode}
                </button>
              </div>

              {/* 3-Tier UI Mode Switcher */}
              <div className="text-[11px] font-semibold text-amber-300/90 uppercase tracking-wider mt-2.5 mb-1">
                {t.uiModeLabel}
              </div>
              <div className="grid grid-cols-3 gap-1">
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
                    onClick={() => onSelectUiMode(m.id)}
                    className={`py-1.5 px-1 rounded-lg border text-[10px] font-bold truncate cursor-pointer ${
                      uiMode === m.id
                        ? 'bg-amber-500/20 border-amber-300 text-amber-100'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Country Selector + Difficulty Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 border-t border-slate-800/80">
            {/* Nation Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-amber-300/90 uppercase tracking-wider">
                  {t.selectCountry}
                </span>
                {activeCountry && (
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <FlagCrest code={activeCountry.flagCode} fallbackColor={activeCountry.color} name={activeCountry.name} width={22} height={15} />
                    {activeCountry.name}
                  </span>
                )}
              </div>
              <div className="relative mb-2">
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.searchCountry}
                  aria-label={t.searchCountry}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950/85 border border-slate-700/80 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[168px] overflow-y-auto gs-scroll pr-1">
                {filteredCountries.map((c) => {
                  const active = c.id === selectedCountryId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      data-testid={`nation-${c.id}`}
                      onClick={() => onSelectCountryId(c.id)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-left text-[11px] font-medium truncate cursor-pointer ${
                        active
                          ? 'bg-amber-500/20 border-amber-300 text-white'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <FlagCrest code={c.flagCode} fallbackColor={c.color} name={c.name} width={18} height={13} />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 9 Difficulty Tiers */}
            <div>
              <div className="text-[11px] font-semibold text-amber-300/90 uppercase tracking-wider mb-1.5">
                {t.selectDifficulty}
              </div>
              <div className="space-y-1 max-h-[205px] overflow-y-auto gs-scroll pr-1">
                {DIFFICULTIES.map((d) => {
                  const active = selectedDifficulty === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      data-testid={`diff-${d.id}`}
                      onClick={() => onSelectDifficulty(d.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        active
                          ? 'bg-amber-500/20 border-amber-300 text-white'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-[11px] font-bold flex items-center justify-between gap-2">
                        <span>{d.label[lang]}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">{d.desc[lang]}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Primary Start Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <div className="text-[11px] text-slate-300 flex items-center gap-2">
              <Award size={14} className="text-amber-300 shrink-0" />
              <span>16 Polish Voivodeships · Real-Time Day/Night Cycle · Enter / Space to Launch</span>
            </div>
            <button
              type="button"
              data-start="true"
              data-testid="start-campaign-btn"
              onClick={onStartCampaign}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-extrabold text-sm shadow-lg shadow-amber-500/20 cursor-pointer whitespace-nowrap"
            >
              <Play size={16} fill="currentColor" />
              {t.startCampaign}
            </button>
          </div>
        </div>
      </div>

      {/* Official Copyright Footer */}
      <footer className="relative z-10 px-4 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 bg-slate-950/70 border-t border-amber-400/15">
        <span>{t.copyrightFooter}</span>
        <span className="font-mono-num text-amber-300/80">Steam PC · Web PWA · Android · iOS</span>
      </footer>
    </div>
  );
}
