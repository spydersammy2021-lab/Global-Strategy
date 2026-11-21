import React, { useState } from 'react';
import {
  AlertTriangle,
  Anchor,
  Banknote,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Coins,
  Crosshair,
  Crown,
  Eye,
  Flame,
  Globe,
  Hammer,
  Handshake,
  Landmark,
  Percent,
  Radiation,
  Satellite,
  Scale,
  Shield,
  ShieldCheck,
  Swords,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { getCountryEncyclopedia } from '../data/encyclopedia';
import {
  CABINET_MINISTERS,
  MEGAPROJECTS,
  STRATEGIC_STRAITS,
  WORLD_COUNCIL_RESOLUTIONS,
} from '../data/spaceSectors';
import { TECH_NODE_MAP } from '../data/techTree';
import {
  type CountrySummary,
  computeDetailedBudget,
  getTopCountries,
  getTotalUnits,
} from '../game/combat';
import type { BlackOpType, DiplomacyAction } from '../game/engine';
import type {
  CommodityId,
  GameState,
  IdeologyId,
  Language,
  MegaprojectId,
  MinisterRole,
  StraitBlockadeId,
  UnitType,
} from '../game/types';
import {
  COMMODITY_NAMES,
  IDEOLOGY_NAMES,
  UNIT_NAMES,
  WEATHER_NAMES,
  type Translations,
} from '../i18n/translations';
import { FlagBadge } from './FlagBadge';
import type { LeftDrawerId } from './LeftToolbar';

const IDEOLOGIES: Array<{ id: IdeologyId; desc: Record<'en' | 'pl', string> }> = [
  { id: 'democracy', desc: { en: '+5% Economy & diplomatic stability.', pl: '+5% Gospodarki i stabilność.' } },
  { id: 'republic', desc: { en: 'Balanced coalition governance.', pl: 'Zrównoważone rządy i dyplomacja.' } },
  { id: 'monarchy', desc: { en: '+3% Economy & royal legitimacy.', pl: '+3% Gospodarki i korona.' } },
  { id: 'technocracy', desc: { en: '+8% Economy & rapid R&D.', pl: '+8% Gospodarki i nauka.' } },
  { id: 'autocracy', desc: { en: 'Centralized military command.', pl: 'Scentralizowane dowództwo.' } },
];

const ROLES: Array<{ id: MinisterRole; label: Record<'en' | 'pl', string> }> = [
  { id: 'defense', label: { en: 'Minister of Defense', pl: 'Minister Obrony' } },
  { id: 'finance', label: { en: 'Minister of Finance', pl: 'Minister Finansów' } },
  { id: 'science', label: { en: 'Minister of Science', pl: 'Minister Nauki' } },
  { id: 'intelligence', label: { en: 'Director of Intel', pl: 'Szef Wywiadu' } },
];

export function LeftSlideDrawer({
  activeDrawer,
  onClose,
  state,
  summaries,
  inspectedCountryId,
  onSelectCountry,
  onDiplomacy,
  onDeploySpy,
  onLaunchSpySatellite,
  onBlackOp,
  onStrategicStrike,
  onDesignCustomUnit,
  onToggleStraitBlockade,
  onOpenLeaderboard,
  onSetTaxRate,
  onTakeLoan,
  onRepayLoan,
  onTradeMarket,
  onBuildMegaproject,
  onAppointMinister,
  onChangeIdeology,
  onVoteCouncil,
  onCancelOrder,
  onBuildWarhead,
  t,
  lang,
}: {
  activeDrawer: LeftDrawerId;
  onClose: () => void;
  state: GameState;
  summaries: Record<string, CountrySummary>;
  inspectedCountryId: string | null;
  onSelectCountry: (countryId: string) => void;
  onDiplomacy: (targetId: string, action: DiplomacyAction) => void;
  onDeploySpy: (targetId: string) => void;
  onLaunchSpySatellite?: (targetId: string) => void;
  onBlackOp: (targetId: string, op: BlackOpType) => void;
  onStrategicStrike: (targetProvinceId: string, isNuclear: boolean) => void;
  onDesignCustomUnit?: (unitType: 'tanks' | 'aviation' | 'naval_fleet', name: string) => void;
  onToggleStraitBlockade?: (straitId: StraitBlockadeId) => void;
  onOpenLeaderboard: () => void;
  onSetTaxRate: (rate: number) => void;
  onTakeLoan: (amount: 60 | 150) => void;
  onRepayLoan: (loanId: string) => void;
  onTradeMarket: (commodity: CommodityId, side: 'buy' | 'sell', qty?: number) => void;
  onBuildMegaproject: (id: MegaprojectId) => void;
  onAppointMinister: (role: MinisterRole, ministerId: string) => void;
  onChangeIdeology: (ideology: IdeologyId) => void;
  onVoteCouncil: (vote: 'yes' | 'no') => void;
  onCancelOrder: (orderId: string) => void;
  onBuildWarhead: () => void;
  t: Translations;
  lang: Language;
}) {
  const [dipSubTab, setDipSubTab] = useState<'diplomacy' | 'info'>('diplomacy');
  const [budgetTab, setBudgetTab] = useState<'treasury' | 'market' | 'megaprojects'>('treasury');
  const [forgeClass, setForgeClass] = useState<'tanks' | 'aviation' | 'naval_fleet'>('tanks');
  const [forgeName, setForgeName] = useState('Blocks™ Apex Mk-III');

  if (!activeDrawer) return null;

  const isSpectator = state.gameMode === 'bot_spectator';
  const player = !isSpectator ? state.countries[state.playerCountryId] : undefined;
  const playerSummary = !isSpectator ? summaries[state.playerCountryId] : undefined;
  const topCountries = getTopCountries(state, 8);
  const inspected = inspectedCountryId ? state.countries[inspectedCountryId] : null;
  const inspectedSum = inspectedCountryId ? summaries[inspectedCountryId] : null;
  const numLocale = lang === 'en' ? 'en-US' : 'pl-PL';
  const lk: 'en' | 'pl' = lang === 'pl' ? 'pl' : 'en';
  const formatCompact = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`);

  const titleMap: Record<Exclude<LeftDrawerId, null>, string> = {
    budget: t.treasuryModalTitle,
    military: t.army,
    diplomacy: t.diplomacyTab,
    government: 'Government & World Council',
  };

  const budget = player ? computeDetailedBudget(state, player.id) : null;

  const isAlly = player && inspected ? player.allies.includes(inspected.id) : false;
  const isAtWar = player && inspected ? player.atWarWith.includes(inspected.id) : false;
  const truceTurns = player && inspected ? player.truceWith[inspected.id] ?? 0 : 0;
  const napTurns = player && inspected ? player.nonAggressionWith[inspected.id] ?? 0 : 0;
  const hasAccess = player && inspected ? player.militaryAccessWith.includes(inspected.id) : false;
  const isVassal = player && inspected ? inspected.vassalOf === player.id : false;
  const isSpied = inspected ? isSpectator || inspected.spiedUntil >= state.turn : false;

  const inspectedProvs = inspected
    ? Object.values(state.provinces).filter((p) => p.ownerId === inspected.id)
    : [];
  const inspectedCapital = inspectedProvs.find((p) => p.isCapital) ?? inspectedProvs[0];

  const playerHasSilo = player
    ? Object.values(state.provinces).some(
        (p) => p.ownerId === player.id && p.buildings.includes('missile_silo'),
      )
    : false;

  const encyclopedia =
    inspected && inspectedSum
      ? getCountryEncyclopedia(
          inspected.id,
          inspected.displayName || inspected.name[lang],
          inspectedSum.areaKm2,
          inspectedSum.population,
          lang,
        )
      : null;

  const armyByType: Partial<Record<UnitType, number>> = {};
  if (player) {
    for (const p of Object.values(state.provinces)) {
      if (p.ownerId === player.id) {
        for (const [k, v] of Object.entries(p.units)) {
          if (v && v > 0) armyByType[k as UnitType] = (armyByType[k as UnitType] ?? 0) + v;
        }
      }
    }
  }
  const activePlayerOrders = player
    ? state.orders.filter((o) => o.countryId === player.id)
    : [];

  const activeRes =
    WORLD_COUNCIL_RESOLUTIONS.find((r) => r.id === state.worldCouncil.activeResolutionId) ??
    WORLD_COUNCIL_RESOLUTIONS[0];

  return (
    <section
      data-testid={`left-drawer-${activeDrawer}`}
      aria-label={titleMap[activeDrawer]}
      className="pointer-events-auto absolute top-14 md:top-4 left-2 right-2 md:left-14 md:right-auto z-20 md:w-[378px] max-h-[calc(100vh-11rem)] lg:max-h-[calc(100vh-7rem)] rounded-xl border aoh-hud-panel flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-500/25 bg-slate-950/80 shrink-0">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-300">
          {activeDrawer === 'budget' && <Coins size={14} />}
          {activeDrawer === 'military' && <Swords size={14} className="text-rose-400" />}
          {activeDrawer === 'diplomacy' && <Globe size={14} className="text-emerald-400" />}
          {activeDrawer === 'government' && <Landmark size={14} className="text-purple-400" />}
          <span>{titleMap[activeDrawer]}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto gs-scroll p-3.5 space-y-3 text-xs">
        {/* 1. BUDGET & ECONOMY DRAWER */}
        {activeDrawer === 'budget' && player && budget && (
          <>
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-800 bg-slate-950/75 p-0.5 text-[11px] font-bold">
              {(
                [
                  { id: 'treasury', label: 'Budget' },
                  { id: 'market', label: 'Market' },
                  { id: 'megaprojects', label: 'Megaprojects' },
                ] as const
              ).map((tabItem) => (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => setBudgetTab(tabItem.id)}
                  className={`py-1.5 rounded-md cursor-pointer ${
                    budgetTab === tabItem.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tabItem.label}
                </button>
              ))}
            </div>

            {budgetTab === 'treasury' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
                    <div className="text-[10px] uppercase text-slate-400">{t.treasury}</div>
                    <div className="text-lg font-bold font-mono-num text-amber-300">
                      {player.treasury.toFixed(1)} PLN
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
                    <div className="text-[10px] uppercase text-slate-400">{t.netBalanceLabel}</div>
                    <div
                      className={`text-lg font-bold font-mono-num ${
                        budget.netPerTurn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {budget.netPerTurn >= 0 ? '+' : ''}
                      {budget.netPerTurn.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase">
                    <TrendingUp size={13} />
                    {t.budgetRevenues}
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{t.taxIncomeLabel}</span>
                    <span className="font-mono-num font-bold text-emerald-300">+{budget.taxIncome.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{t.factoryPortIncomeLabel}</span>
                    <span className="font-mono-num font-bold text-emerald-300">+{budget.factoryAndPortIncome.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{t.tradeIncomeLabel}</span>
                    <span className="font-mono-num font-bold text-emerald-300">+{budget.tradeIncome.toFixed(1)}</span>
                  </div>
                  {budget.spaceOceanIncome > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>{t.spaceIncomeLabel}</span>
                      <span className="font-mono-num font-bold text-cyan-300">+{budget.spaceOceanIncome.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-rose-500/25 bg-rose-500/5 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 uppercase">
                    <TrendingDown size={13} />
                    {t.budgetExpenses}
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{t.armyUpkeepLabel}</span>
                    <span className="font-mono-num font-bold text-rose-300">-{budget.armyUpkeep.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{t.buildingUpkeepLabel}</span>
                    <span className="font-mono-num font-bold text-rose-300">-{budget.buildingUpkeep.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{t.loanPaymentsLabel}</span>
                    <span className="font-mono-num font-bold text-rose-300">-{budget.loanPayments.toFixed(1)}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Percent size={13} className="text-amber-400" />
                      {t.taxRateLabel}
                    </span>
                    <span className="font-mono-num font-bold text-amber-300">{player.taxRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={45}
                    step={1}
                    value={player.taxRate}
                    onChange={(e) => onSetTaxRate(Number(e.target.value))}
                    aria-label={t.taxRateLabel}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="text-[10.5px] text-slate-400">
                    {player.taxRate > 25
                      ? t.taxWarningHigh
                      : player.taxRate <= 14
                      ? t.taxBonusLow
                      : `${t.stability}: ${player.stability}%`}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sky-300">{t.stateBankTitle}</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={player.loans.length >= 3}
                        onClick={() => onTakeLoan(60)}
                        className="px-2 py-1 rounded bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 text-[10px] font-bold cursor-pointer"
                      >
                        +60 PLN
                      </button>
                      <button
                        type="button"
                        disabled={player.loans.length >= 3}
                        onClick={() => onTakeLoan(150)}
                        className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-[10px] font-bold cursor-pointer"
                      >
                        +150 PLN
                      </button>
                    </div>
                  </div>
                  {player.loans.length === 0 ? (
                    <div className="text-[11px] text-slate-400">{t.noLoans}</div>
                  ) : (
                    player.loans.map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between text-[11px] bg-slate-900 rounded px-2 py-1.5">
                        <span className="font-mono-num text-slate-200">
                          -{loan.perTurnPayment.toFixed(1)}/mo · {loan.remainingTotal.toFixed(1)} PLN
                        </span>
                        <button
                          type="button"
                          disabled={player.treasury < loan.remainingTotal}
                          onClick={() => onRepayLoan(loan.id)}
                          className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold disabled:opacity-40 cursor-pointer"
                        >
                          {t.repayLoan}
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="text-[10px] text-slate-400 leading-snug">{t.tutorialDisclaimer}</div>
              </div>
            )}

            {budgetTab === 'market' && (
              <div className="space-y-2">
                {(Object.keys(state.globalMarket.prices) as CommodityId[]).map((cid) => {
                  const price = state.globalMarket.prices[cid];
                  const trend = state.globalMarket.trends[cid];
                  const stock = player.stockpiles[cid] ?? 0;
                  const batchCost = Number((price * 5).toFixed(1));
                  return (
                    <div key={cid} className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{COMMODITY_NAMES[lang][cid]}</span>
                        <span className="inline-flex items-center gap-1 font-mono-num font-bold text-amber-300">
                          {trend === 'up' && <TrendingUp size={12} className="text-emerald-400" />}
                          {trend === 'down' && <TrendingDown size={12} className="text-rose-400" />}
                          {price.toFixed(2)} PLN
                        </span>
                      </div>
                      <div className="text-[11px] font-mono-num text-slate-400">
                        Stockpile: <span className="text-sky-300 font-bold">{stock}u</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          disabled={player.treasury < batchCost}
                          onClick={() => onTradeMarket(cid, 'buy', 5)}
                          className="py-1 rounded bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-[11px] font-bold cursor-pointer"
                        >
                          Buy 5 ({batchCost} PLN)
                        </button>
                        <button
                          type="button"
                          disabled={stock < 5}
                          onClick={() => onTradeMarket(cid, 'sell', 5)}
                          className="py-1 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-[11px] font-bold cursor-pointer"
                        >
                          Sell 5 (+{batchCost} PLN)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {budgetTab === 'megaprojects' && (
              <div className="space-y-2.5">
                {MEGAPROJECTS.map((mp) => {
                  const built = player.megaprojects.includes(mp.id);
                  const techOk = player.unlockedTechs.includes(mp.requiredTech);
                  const reqName = TECH_NODE_MAP[mp.requiredTech]?.title[lang] ?? mp.requiredTech;
                  return (
                    <div
                      key={mp.id}
                      className={`rounded-lg border p-3 space-y-2 ${
                        built ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-800 bg-slate-950/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white">{mp.name[lang]}</span>
                        <span className="font-mono-num font-bold text-amber-300">
                          {built ? 'BUILT' : `${mp.costPln} PLN`}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-300">{mp.effect[lang]}</div>
                      {!built && (
                        <>
                          <div className="text-[10px] text-slate-400">
                            Requires: <span className={techOk ? 'text-emerald-300' : 'text-rose-300'}>{reqName}</span>
                          </div>
                          <button
                            type="button"
                            disabled={!techOk || player.treasury < mp.costPln}
                            onClick={() => onBuildMegaproject(mp.id)}
                            className="w-full py-1.5 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-[11px] font-bold cursor-pointer"
                          >
                            Construct ({mp.costPln} PLN)
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* 2. MILITARY, CUSTOM UNIT FORGE & MARITIME STRAITS DRAWER */}
        {activeDrawer === 'military' && player && playerSummary && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
                <div className="text-[10px] uppercase text-slate-400">{t.yourArmy}</div>
                <div className="text-lg font-bold font-mono-num text-amber-300">
                  {playerSummary.totalArmy.toLocaleString(numLocale)}
                </div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
                <div className="text-[10px] uppercase text-slate-400">{t.manpowerLabel}</div>
                <div className="text-lg font-bold font-mono-num text-emerald-300">
                  {player.manpower.toLocaleString(numLocale)}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Standing Armed Forces
              </div>
              {Object.entries(armyByType).length === 0 ? (
                <div className="text-slate-400 text-[11px]">No stationed divisions.</div>
              ) : (
                Object.entries(armyByType).map(([uType, count]) => (
                  <div key={uType} className="flex justify-between text-[11px]">
                    <span className="text-slate-200">{UNIT_NAMES[lang][uType as UnitType]}</span>
                    <span className="font-mono-num font-bold text-amber-300">
                      {(count ?? 0).toLocaleString(numLocale)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Custom Unit Designer / Blueprint Forge */}
            {onDesignCustomUnit && (
              <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-200 flex items-center gap-1.5">
                    <Hammer size={13} className="text-amber-400" />
                    {t.unitDesignerTitle}
                  </span>
                  <span className="text-[10px] font-mono-num text-amber-300">
                    {(state.customBlueprints ?? []).length} MK
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['tanks', 'aviation', 'naval_fleet'] as const).map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setForgeClass(cls)}
                      className={`py-1 px-1.5 rounded border text-[10px] font-bold cursor-pointer truncate ${
                        forgeClass === cls
                          ? 'border-amber-400 bg-amber-400 text-slate-950'
                          : 'border-slate-700 bg-slate-950/80 text-slate-300'
                      }`}
                    >
                      {UNIT_NAMES[lang][cls]}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={forgeName}
                  onChange={(e) => setForgeName(e.target.value)}
                  maxLength={28}
                  aria-label={t.unitDesignerTitle}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-white focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  data-testid="forge-unit-btn"
                  disabled={player.treasury < 18 || !forgeName.trim()}
                  onClick={() => onDesignCustomUnit(forgeClass, forgeName.trim())}
                  className="w-full py-1.5 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-[11px] font-extrabold cursor-pointer"
                >
                  Forge Custom Blueprint (18 PLN)
                </button>
                {(state.customBlueprints ?? []).length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-amber-500/20">
                    {(state.customBlueprints ?? []).map((bp) => (
                      <div key={bp.id} className="flex justify-between text-[10px] font-mono-num text-amber-100">
                        <span className="truncate">{bp.name}</span>
                        <span className="text-emerald-300">
                          ATK{bp.firepower} ARM{bp.armor} SPD{bp.speed}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Maritime Strait Blockades */}
            {onToggleStraitBlockade && (
              <div className="rounded-lg border border-sky-500/35 bg-sky-500/10 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-200 flex items-center gap-1.5">
                    <Anchor size={13} className="text-sky-400" />
                    {t.straitBlockadeTitle}
                  </span>
                  <span className="text-[10px] font-mono-num text-sky-300">
                    {Object.keys(state.blockadedStraits ?? {}).length}/{STRATEGIC_STRAITS.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {STRATEGIC_STRAITS.map((strait) => {
                    const active = Boolean(state.blockadedStraits?.[strait.id]);
                    return (
                      <button
                        key={strait.id}
                        type="button"
                        data-testid={`strait-toggle-${strait.id}`}
                        onClick={() => onToggleStraitBlockade(strait.id)}
                        className={`py-1.5 px-2 rounded border text-[10px] font-bold text-left cursor-pointer truncate ${
                          active
                            ? 'border-rose-400 bg-rose-600/30 text-rose-100'
                            : 'border-slate-700 bg-slate-950/80 text-slate-300 hover:border-sky-400'
                        }`}
                      >
                        {active ? '⛔ ' : '⚓ '}
                        {strait.name[lang]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-rose-500/35 bg-rose-500/10 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Radiation size={14} className="text-rose-400" />
                  Strategic Deterrence
                </span>
                <span className="font-mono-num font-bold text-amber-300">
                  {player.nuclearWarheads} Warheads
                </span>
              </div>
              <div className="text-[10.5px] text-slate-300">
                Orbital Shield:{' '}
                <span className={player.orbitalShieldActive ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                  {player.orbitalShieldActive ? 'ACTIVE' : 'OFFLINE'}
                </span>
              </div>
              <button
                type="button"
                disabled={
                  !player.unlockedTechs.includes('mil_thermonuclear') ||
                  !playerHasSilo ||
                  player.treasury < 55
                }
                onClick={onBuildWarhead}
                className="w-full py-1.5 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-[11px] font-bold cursor-pointer"
              >
                Assemble Warhead (55 PLN)
              </button>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.queuedOrders} ({activePlayerOrders.length})
              </div>
              {activePlayerOrders.length === 0 ? (
                <div className="text-[11px] text-slate-400">
                  Select a province on the map to launch land or naval marches.
                </div>
              ) : (
                activePlayerOrders.map((ord) => (
                  <div key={ord.id} className="flex items-center justify-between bg-slate-900 rounded px-2 py-1.5 text-[11px]">
                    <span className={ord.isAttack ? 'text-rose-300' : 'text-emerald-300'}>
                      {state.provinces[ord.fromProvinceId]?.name} → {state.provinces[ord.toProvinceId]?.name} (
                      {Math.round(ord.progress * 100)}%)
                    </span>
                    <button
                      type="button"
                      onClick={() => onCancelOrder(ord.id)}
                      aria-label={t.cancelOrder}
                      className="text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Live Battle Log Feed */}
            <div data-testid="live-battle-log" className="rounded-lg border border-rose-500/30 bg-slate-950/75 p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-rose-300">
                <span className="flex items-center gap-1.5">
                  <Swords size={12} />
                  {t.liveBattleLogLabel}
                </span>
                <span className="font-mono-num text-slate-400">{state.battlesFought}</span>
              </div>
              {state.recentBattles.length === 0 ? (
                <div className="text-[11px] text-slate-400">{t.noBattlesYet}</div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto gs-scroll pr-0.5">
                  {state.recentBattles.slice(0, 12).map((btl) => {
                    const attName = state.countries[btl.attackerId]?.displayName ?? btl.attackerId;
                    const defName = state.countries[btl.defenderId]?.displayName ?? btl.defenderId;
                    return (
                      <div
                        key={btl.id}
                        className="rounded border border-slate-800/90 bg-slate-900/75 px-2.5 py-1.5 text-[10.5px] space-y-0.5"
                      >
                        <div className="flex items-center justify-between gap-2 font-bold">
                          <span className={btl.attackerWon ? 'text-emerald-300 truncate' : 'text-rose-300 truncate'}>
                            {btl.provinceName}
                          </span>
                          <span className="font-mono-num text-[9.5px] text-amber-300 shrink-0">
                            {btl.captured ? 'CAPTURED' : 'REPELLED'}
                          </span>
                        </div>
                        <div className="text-slate-300 truncate">
                          {attName} ⚔️ {defName}
                        </div>
                        <div className="font-mono-num text-[9.5px] text-slate-400">
                          Losses: -{btl.attackerLosses.toLocaleString(numLocale)} / -{btl.defenderLosses.toLocaleString(numLocale)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. DIPLOMACY, WORLD POWERS & INTEL DRAWER */}
        {activeDrawer === 'diplomacy' && (
          <div className="space-y-3">
            {player && (
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1.5">
                  <Handshake size={12} />
                  {t.allies} ({player.allies.length})
                </div>
                {player.allies.length === 0 ? (
                  <div className="text-[11px] text-slate-400">{t.noAllies}</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {player.allies.map((allyId) => {
                      const ally = state.countries[allyId];
                      if (!ally || ally.eliminated) return null;
                      return (
                        <button
                          key={allyId}
                          type="button"
                          onClick={() => onSelectCountry(allyId)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-slate-700 bg-slate-900 hover:border-emerald-400/60 text-[11px] text-slate-200 cursor-pointer"
                        >
                          <FlagBadge flag={ally.flag} width={15} height={10} />
                          <span className="truncate max-w-[90px]">{ally.displayName || ally.name[lang]}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Trophy size={12} />
                  {t.topCountries}
                </span>
                <button
                  type="button"
                  onClick={onOpenLeaderboard}
                  className="text-[10px] font-bold text-sky-300 hover:text-sky-200 cursor-pointer"
                >
                  {t.chronicleTab} →
                </button>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto gs-scroll pr-0.5">
                {topCountries.map((entry, idx) => {
                  const c = state.countries[entry.countryId];
                  if (!c) return null;
                  const isMe = entry.countryId === state.playerCountryId;
                  return (
                    <button
                      key={entry.countryId}
                      type="button"
                      onClick={() => onSelectCountry(entry.countryId)}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-[11px] cursor-pointer ${
                        isMe
                          ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200'
                          : 'hover:bg-slate-900 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-4 text-left font-mono-num text-slate-400">{idx + 1}.</span>
                        <FlagBadge flag={c.flag} width={16} height={11} />
                        <span className="truncate font-medium">{c.displayName || c.name[lang]}</span>
                      </div>
                      <span className="font-mono-num text-slate-400 shrink-0 pl-2">
                        {formatCompact(entry.totalArmy)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {inspected && inspectedSum && (
              <div className="rounded-lg border border-amber-500/30 bg-slate-950/80 p-3 space-y-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FlagBadge flag={inspected.flag} label={inspected.displayName} width={28} height={18} />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {inspected.displayName || inspected.name[lang]}
                    </div>
                    <div className="text-[10.5px] text-slate-400 font-mono-num">
                      {inspectedSum.areaKm2.toLocaleString(numLocale)} km² ·{' '}
                      {(inspectedSum.population / 1_000_000).toFixed(1)}M · {inspectedProvs.length} prov.
                    </div>
                  </div>
                </div>

                {player && (isAtWar || isAlly || truceTurns > 0 || napTurns > 0 || hasAccess || isVassal) && (
                  <div className="flex flex-wrap gap-1">
                    {isAtWar && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-[10px] font-bold text-rose-300">
                        {t.atWarBadge}
                      </span>
                    )}
                    {isAlly && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                        {t.allyBadge}
                      </span>
                    )}
                    {isVassal && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-[10px] font-bold text-purple-300">
                        {t.vassalBadge}
                      </span>
                    )}
                    {napTurns > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/20 border border-sky-500/40 text-[10px] font-bold text-sky-300">
                        {t.napBadge} ({napTurns})
                      </span>
                    )}
                    {hasAccess && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                        {t.accessBadge}
                      </span>
                    )}
                    {truceTurns > 0 && !isAtWar && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-700/60 border border-slate-600 text-[10px] font-bold text-slate-300">
                        {t.truceBadge} ({truceTurns})
                      </span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 rounded-lg border border-slate-800 bg-slate-900/70 p-0.5 text-[10.5px] font-bold">
                  <button
                    type="button"
                    onClick={() => setDipSubTab('diplomacy')}
                    className={`py-1 px-1.5 rounded flex items-center justify-center gap-1 cursor-pointer ${
                      dipSubTab === 'diplomacy' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Swords size={11} className="shrink-0" />
                    <span className="leading-tight">{t.diplomacyTab}</span>
                  </button>
                  <button
                    type="button"
                    data-testid="encyclopedia-tab-btn"
                    onClick={() => setDipSubTab('info')}
                    className={`py-1 px-1.5 rounded flex items-center justify-center gap-1 cursor-pointer ${
                      dipSubTab === 'info' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BookOpen size={11} className="shrink-0" />
                    <span className="leading-tight">{t.encyclopediaTab}</span>
                  </button>
                </div>

                {dipSubTab === 'info' && encyclopedia && (
                  <div className="space-y-2 text-[11px]">
                    <div className="rounded border border-slate-800 bg-slate-900/70 p-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t.capitalLabel}:</span>
                        <span className="font-bold text-white">{encyclopedia.capital}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t.governmentLabel}:</span>
                        <span className="font-semibold text-sky-300">{IDEOLOGY_NAMES[lang][inspected.ideology]}</span>
                      </div>
                      {inspectedCapital && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Climate:</span>
                          <span className="font-semibold text-amber-300">
                            {WEATHER_NAMES[lang][inspectedCapital.weather].label} ·{' '}
                            {Math.round(inspectedCapital.temperatureC ?? 14)}°C
                          </span>
                        </div>
                      )}
                    </div>
                    <ul className="space-y-1 text-slate-300 list-disc pl-4">
                      {encyclopedia.facts.map((fact, idx) => (
                        <li key={idx}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {dipSubTab === 'diplomacy' && inspected.id !== state.playerCountryId && (
                  <div className="space-y-2">
                    <div className="rounded border border-slate-800 bg-slate-900/75 p-2 grid grid-cols-2 gap-2">
                      {playerSummary && (
                        <div className="min-w-0">
                          <div className="text-[9.5px] uppercase leading-tight text-slate-400">{t.yourArmy}</div>
                          <div data-testid="player-exact-army" className="text-sm font-bold text-amber-300 font-mono-num">
                            {playerSummary.totalArmy.toLocaleString(numLocale)}
                          </div>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-[9.5px] uppercase leading-tight text-slate-400">{t.enemyArmy}</div>
                        <div data-testid="inspected-exact-army" className="text-sm font-bold text-rose-300 font-mono-num">
                          {inspectedSum.totalArmy.toLocaleString(numLocale)}
                        </div>
                      </div>
                    </div>

                    {playerSummary && (
                      inspectedSum.totalArmy > playerSummary.totalArmy * 1.15 ? (
                        <div className="flex items-start gap-1.5 rounded border border-rose-500/40 bg-rose-500/10 p-2 text-[10.5px] text-rose-200">
                          <AlertTriangle size={13} className="text-rose-400 shrink-0 mt-0.5" />
                          <span>{t.tacticalWarningStronger}</span>
                        </div>
                      ) : playerSummary.totalArmy > inspectedSum.totalArmy * 1.2 ? (
                        <div className="flex items-start gap-1.5 rounded border border-emerald-500/35 bg-emerald-500/10 p-2 text-[10.5px] text-emerald-200">
                          <ShieldCheck size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{t.tacticalAdvantage}</span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-1.5 rounded border border-amber-500/35 bg-amber-500/10 p-2 text-[10.5px] text-amber-200">
                          <Users size={13} className="text-amber-400 shrink-0 mt-0.5" />
                          <span>{t.tacticalBalanced}</span>
                        </div>
                      )
                    )}

                    {isSpied && (
                      <div className="rounded border border-sky-500/40 bg-sky-500/10 p-2 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-sky-300 flex items-center gap-1">
                          <Eye size={11} /> Intel ({inspectedProvs.length} prov.)
                        </div>
                        <div className="space-y-0.5 max-h-20 overflow-y-auto gs-scroll">
                          {inspectedProvs.map((ip) => (
                            <div key={ip.id} className="flex justify-between text-[10px] text-slate-200 font-mono-num">
                              <span className="truncate">{ip.name}</span>
                              <span className="text-sky-300">{getTotalUnits(ip.units).toLocaleString(numLocale)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {player && (
                      <div className="space-y-1.5">
                        {!isAtWar ? (
                          <button
                            type="button"
                            data-testid="declare-war-btn"
                            onClick={() => onDiplomacy(inspected.id, 'war')}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer"
                          >
                            <Swords size={13} />
                            {t.declareWar}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onDiplomacy(inspected.id, 'peace')}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white cursor-pointer"
                          >
                            <Handshake size={13} />
                            {t.proposePeace}
                          </button>
                        )}

                        {!isAtWar && (
                          <div className="grid grid-cols-2 gap-1.5">
                            {!isAlly && (
                              <button
                                type="button"
                                onClick={() => onDiplomacy(inspected.id, 'alliance')}
                                className="flex items-center justify-center gap-1 py-1 px-2 rounded border border-emerald-500/50 bg-emerald-500/15 text-[10.5px] font-semibold text-emerald-200 cursor-pointer"
                              >
                                <Handshake size={11} />
                                {t.proposeAlliance}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onDiplomacy(inspected.id, 'nap')}
                              className="flex items-center justify-center gap-1 py-1 px-2 rounded border border-sky-500/40 bg-sky-500/15 text-[10.5px] font-semibold text-sky-200 cursor-pointer"
                            >
                              <Shield size={11} />
                              <span className="truncate">{t.proposeNap}</span>
                            </button>
                            {!hasAccess && (
                              <button
                                type="button"
                                onClick={() => onDiplomacy(inspected.id, 'access')}
                                className="py-1 px-2 rounded border border-slate-700 bg-slate-900 text-[10.5px] font-semibold text-slate-200 cursor-pointer truncate"
                              >
                                {t.proposeAccess}
                              </button>
                            )}
                            {!isVassal && (
                              <button
                                type="button"
                                onClick={() => onDiplomacy(inspected.id, 'vassalize')}
                                className="flex items-center justify-center gap-1 py-1 px-2 rounded border border-purple-500/40 bg-purple-500/15 text-[10.5px] font-semibold text-purple-200 cursor-pointer"
                              >
                                <Crown size={11} />
                                <span className="truncate">{t.proposeVassal}</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onDiplomacy(inspected.id, 'ultimatum')}
                              className="flex items-center justify-center gap-1 py-1 px-2 rounded border border-rose-500/40 bg-rose-500/15 text-[10.5px] font-semibold text-rose-200 cursor-pointer"
                            >
                              <AlertTriangle size={11} />
                              {t.sendUltimatum}
                            </button>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => onDeploySpy(inspected.id)}
                            className="flex items-center justify-center gap-1 py-1.5 rounded border border-sky-500/40 bg-slate-900 hover:bg-slate-800 text-[10.5px] font-semibold text-sky-300 cursor-pointer truncate px-1.5"
                          >
                            <Eye size={12} className="shrink-0" />
                            <span className="truncate">{t.sendSpy}</span>
                          </button>

                          {onLaunchSpySatellite && (
                            <button
                              type="button"
                              data-testid="launch-spy-satellite-btn"
                              disabled={player.treasury < 22}
                              onClick={() => onLaunchSpySatellite(inspected.id)}
                              className="flex items-center justify-center gap-1 py-1.5 rounded border border-cyan-400/50 bg-cyan-950/60 hover:bg-cyan-900/70 disabled:opacity-40 text-[10.5px] font-bold text-cyan-200 cursor-pointer truncate px-1.5"
                            >
                              <Satellite size={12} className="shrink-0" />
                              <span className="truncate">{t.spySatelliteBtn}</span>
                            </button>
                          )}
                        </div>

                        <div className="rounded border border-slate-800 bg-slate-900/75 p-2 space-y-1">
                          <div className="text-[10px] font-bold uppercase text-purple-300 flex items-center gap-1">
                            <Flame size={11} /> {t.blackOpsLabel}
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              type="button"
                              onClick={() => onBlackOp(inspected.id, 'sabotage')}
                              className="py-1 px-1 rounded border border-purple-500/40 bg-purple-500/10 text-[10px] font-semibold text-purple-200 cursor-pointer truncate"
                            >
                              {t.sabotageOp}
                            </button>
                            <button
                              type="button"
                              onClick={() => onBlackOp(inspected.id, 'foment_rebels')}
                              className="py-1 px-1 rounded border border-purple-500/40 bg-purple-500/10 text-[10px] font-semibold text-purple-200 cursor-pointer truncate"
                            >
                              {t.rebelsOp}
                            </button>
                            <button
                              type="button"
                              onClick={() => onBlackOp(inspected.id, 'steal_tech')}
                              className="py-1 px-1 rounded border border-purple-500/40 bg-purple-500/10 text-[10px] font-semibold text-purple-200 cursor-pointer truncate"
                            >
                              {t.stealTechOp}
                            </button>
                          </div>
                        </div>

                        {playerHasSilo && inspectedCapital && (
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => onStrategicStrike(inspectedCapital.id, false)}
                              className="flex items-center justify-center gap-1 py-1.5 rounded border border-orange-500/50 bg-orange-500/15 text-[10.5px] font-bold text-orange-200 cursor-pointer"
                            >
                              <Crosshair size={11} />
                              <span className="truncate">{t.strategicStrikeOp}</span>
                            </button>
                            <button
                              type="button"
                              disabled={player.nuclearWarheads < 1}
                              onClick={() => onStrategicStrike(inspectedCapital.id, true)}
                              className="flex items-center justify-center gap-1 py-1.5 rounded border border-rose-500/60 bg-rose-600/25 disabled:opacity-40 text-[10.5px] font-bold text-rose-200 cursor-pointer"
                            >
                              <Radiation size={11} />
                              <span className="truncate">{t.nuclearStrikeOp} ({player.nuclearWarheads})</span>
                            </button>
                          </div>
                        )}

                        {!isAtWar && (
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => onDiplomacy(inspected.id, 'aid25')}
                              className="flex items-center justify-center gap-1 py-1 rounded border border-slate-700 bg-slate-900 text-[10.5px] font-semibold text-amber-300 cursor-pointer"
                            >
                              <Banknote size={11} />
                              {t.sendAid25}
                            </button>
                            <button
                              type="button"
                              onClick={() => onDiplomacy(inspected.id, 'aid50')}
                              className="flex items-center justify-center gap-1 py-1 rounded border border-slate-700 bg-slate-900 text-[10.5px] font-semibold text-amber-300 cursor-pointer"
                            >
                              <Banknote size={11} />
                              {t.sendAid50}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. GOVERNMENT, CABINET, IDEOLOGY & WORLD COUNCIL DRAWER */}
        {activeDrawer === 'government' && player && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                <Briefcase size={12} /> Cabinet of Ministers
              </div>
              {ROLES.map((roleObj) => {
                const currentId = player.cabinet[roleObj.id];
                const candidates = CABINET_MINISTERS.filter((m) => m.role === roleObj.id);
                return (
                  <div key={roleObj.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-amber-300">{roleObj.label[lk]}</div>
                    {candidates.map((cand) => {
                      const active = currentId === cand.id;
                      return (
                        <div key={cand.id} className="flex items-center justify-between gap-2 text-[11px]">
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate">{cand.name[lang]}</div>
                            <div className="text-[10px] text-emerald-300">{cand.bonusText[lang]}</div>
                          </div>
                          {active ? (
                            <span className="text-[10px] font-bold text-emerald-400 shrink-0">ACTIVE</span>
                          ) : (
                            <button
                              type="button"
                              disabled={player.treasury < 8}
                              onClick={() => onAppointMinister(roleObj.id, cand.id)}
                              className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-[10px] font-bold cursor-pointer shrink-0"
                            >
                              8 PLN
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Scale size={12} /> Ideology · Next Election Day {player.nextElectionDay}
              </div>
              {IDEOLOGIES.map((idg) => {
                const active = player.ideology === idg.id;
                return (
                  <div key={idg.id} className="flex items-center justify-between gap-2 py-1 border-b border-slate-800/60 last:border-0">
                    <div>
                      <div className="font-bold text-white text-[11px]">{IDEOLOGY_NAMES[lang][idg.id]}</div>
                      <div className="text-[10px] text-slate-400">{idg.desc[lk]}</div>
                    </div>
                    {active ? (
                      <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                    ) : (
                      <button
                        type="button"
                        disabled={player.treasury < 15}
                        onClick={() => onChangeIdeology(idg.id)}
                        className="px-2 py-1 rounded bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 text-[10px] font-bold cursor-pointer shrink-0"
                      >
                        15 PLN
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg border border-sky-500/35 bg-sky-500/10 p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-sky-300">
                <span>World Council</span>
                <span className="font-mono-num">
                  YES {state.worldCouncil.yesVotes} · NO {state.worldCouncil.noVotes}
                </span>
              </div>
              <div className="font-bold text-white text-xs">{activeRes.title[lang]}</div>
              <div className="text-[11px] text-slate-300">{activeRes.effect[lang]}</div>
              {state.worldCouncil.playerVoted ? (
                <div className="text-[11px] font-bold text-emerald-300">
                  ✓ Vote Cast: {state.worldCouncil.playerVoted.toUpperCase()}
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onVoteCouncil('yes')}
                    className="flex-1 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold cursor-pointer"
                  >
                    Vote YES
                  </button>
                  <button
                    type="button"
                    onClick={() => onVoteCouncil('no')}
                    className="flex-1 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Vote NO
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
