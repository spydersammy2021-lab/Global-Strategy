import React, { useState } from 'react';
import {
  Anchor,
  ArrowRight,
  Building2,
  Castle,
  Check,
  CheckCircle2,
  Factory,
  Flame,
  GraduationCap,
  Rocket,
  Satellite,
  Shield,
  ShieldAlert,
  Swords,
  Thermometer,
  TrainFront,
  Trash2,
  UserPlus,
  Waves,
  Wheat,
  X,
} from 'lucide-react';
import { getCitiesForProvince } from '../data/cities';
import { SCENARIOS } from '../data/scenarios';
import { calculateWinChance, getTotalUnits, splitUnitsByRatio } from '../game/combat';
import { BUILDING_COSTS, getRecruitCost } from '../game/engine';
import type { BuildingType, GameState, Language, UiMode, UnitType } from '../game/types';
import { BUILDING_NAMES, UNIT_NAMES, WEATHER_NAMES, type Translations } from '../i18n/translations';
import { FlagBadge } from './FlagBadge';

const BUILDING_LIST: BuildingType[] = [
  'farm',
  'factory',
  'barracks',
  'fort',
  'university',
  'railway',
  'port',
  'coastal_defense',
  'missile_silo',
  'spaceport',
];

function BuildingSlotIcon({ type }: { type: BuildingType }) {
  switch (type) {
    case 'factory':
      return <Factory size={16} className="text-amber-400" />;
    case 'farm':
      return <Wheat size={16} className="text-emerald-400" />;
    case 'barracks':
      return <Swords size={16} className="text-rose-400" />;
    case 'port':
      return <Anchor size={16} className="text-sky-400" />;
    case 'fort':
      return <Castle size={16} className="text-purple-400" />;
    case 'university':
      return <GraduationCap size={16} className="text-indigo-400" />;
    case 'railway':
      return <TrainFront size={16} className="text-yellow-400" />;
    case 'coastal_defense':
      return <Waves size={16} className="text-cyan-400" />;
    case 'missile_silo':
      return <ShieldAlert size={16} className="text-rose-500" />;
    case 'spaceport':
      return <Rocket size={16} className="text-orange-400" />;
  }
}

export function BottomProvinceBar({
  state,
  selectedProvinceId,
  marchTargetId,
  marchMode,
  hasLeftDrawerOpen = false,
  uiMode = 'easy',
  onSetMarchMode,
  onOpenCityRecon,
  onClose,
  onBuild,
  onRecruit,
  onAssimilate,
  onReconstructCity,
  onIssueOrder,
  onCancelOrder,
  t,
  lang,
}: {
  state: GameState;
  selectedProvinceId: string;
  marchTargetId: string | null;
  marchMode: boolean;
  hasLeftDrawerOpen?: boolean;
  uiMode?: UiMode;
  onSetMarchMode: (active: boolean) => void;
  onOpenCityRecon: (cityId: string) => void;
  onClose: () => void;
  onBuild: (provId: string, b: BuildingType) => void;
  onRecruit: (provId: string, u: UnitType, count: number) => void;
  onAssimilate: (provId: string) => void;
  onReconstructCity?: (provId: string) => void;
  onIssueOrder: (fromId: string, toId: string, ratio: number) => void;
  onCancelOrder: (orderId: string) => void;
  t: Translations;
  lang: Language;
}) {
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType>('infantry');
  const [recruitPreset, setRecruitPreset] = useState<number | 'max'>(3000);
  const [splitPercent, setSplitPercent] = useState<number>(75);
  const [chosenTarget, setChosenTarget] = useState<string>('');
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingType | null>(null);

  const prov = state.provinces[selectedProvinceId];
  if (!prov || prov.ownerId !== state.playerCountryId) return null;

  const player = state.countries[state.playerCountryId];
  if (!player) return null;

  const scenario = SCENARIOS[state.scenarioId];
  const totalGarrison = getTotalUnits(prov.units);
  const numLocale = lang === 'en' ? 'en-US' : 'pl-PL';
  const reachableIds = [...prov.neighbors, ...prov.seaNeighbors];
  const effectiveTarget =
    marchTargetId && reachableIds.includes(marchTargetId)
      ? marchTargetId
      : chosenTarget || reachableIds[0] || '';
  const targetProv = effectiveTarget ? state.provinces[effectiveTarget] : null;
  const splitUnits = splitUnitsByRatio(prov.units, splitPercent / 100);
  const splitPreview = getTotalUnits(splitUnits);

  const isNavalRoute = Boolean(
    targetProv && !prov.neighbors.includes(targetProv.id) && prov.seaNeighbors.includes(targetProv.id),
  );
  const isRailRoute = Boolean(
    !isNavalRoute &&
      targetProv &&
      prov.buildings.includes('railway') &&
      targetProv.buildings.includes('railway'),
  );
  const hasStormDelay = Boolean(
    isNavalRoute &&
      targetProv &&
      state.waterAlerts.some((w) => w.affectedProvinceIds.includes(targetProv.id)),
  );
  const baseDays = Math.max(
    2,
    (isNavalRoute ? 6 : 4) + (hasStormDelay ? 3 : 0) - Math.min(2, Math.floor(player.tech.logistics / 2)),
  );
  const estDays = isRailRoute ? Math.max(1, Math.ceil(baseDays / 3)) : baseDays;

  const winChance =
    targetProv && targetProv.ownerId !== state.playerCountryId && splitPreview > 0
      ? calculateWinChance({
          state,
          attackerId: state.playerCountryId,
          attackerUnits: splitUnits,
          defenderProvince: targetProv,
          isNavalAssault: isNavalRoute,
        })
      : null;

  const provOrders = state.orders.filter((o) => o.fromProvinceId === prov.id);
  const weatherInfo = WEATHER_NAMES[lang][prov.weather];
  const tempC = Math.round(prov.temperatureC ?? 14);
  const hasExtremeClimateRisk =
    (tempC <= -15 || tempC >= 38) &&
    player.tech.logistics < 1 &&
    state.difficulty !== 'world_conquest';

  const canNavalRecruit = prov.seaNeighbors.length > 0 || prov.buildings.includes('port');
  const hasRailway = prov.buildings.includes('railway');

  const availableUnits = scenario.unitRoster.filter(
    (spec) =>
      !(spec.id === 'naval_fleet' && !canNavalRecruit) &&
      !(spec.id === 'armored_train' && !hasRailway),
  );
  const activeUnitSpec =
    availableUnits.find((u) => u.id === selectedUnitType) ?? availableUnits[0];

  const costPer1k = activeUnitSpec
    ? getRecruitCost(state, prov.id, activeUnitSpec.id, 1000)
    : 10;
  const maxByBudget = Math.floor(player.treasury / Math.max(0.1, costPer1k)) * 1000;
  const maxByManpower = Math.floor(player.manpower / 1000) * 1000;
  const maxAffordable = Math.max(1000, Math.min(maxByBudget, maxByManpower));
  const actualCount = recruitPreset === 'max' ? maxAffordable : recruitPreset;
  const recruitCost = activeUnitSpec
    ? getRecruitCost(state, prov.id, activeUnitSpec.id, actualCount)
    : 10;
  const canRecruit =
    Boolean(activeUnitSpec) &&
    player.treasury >= recruitCost &&
    player.manpower >= actualCount &&
    player.movementPoints >= 1;

  const defenseRating =
    (prov.buildings.includes('fort') ? 35 : 0) +
    (prov.buildings.includes('coastal_defense') ? 28 : 0);
  const provinceCities = getCitiesForProvince(prov.id, prov.ownerId);

  return (
    <div
      data-testid="bottom-province-bar"
      className={`pointer-events-auto absolute bottom-3 z-20 hidden md:flex flex-col gap-2 transition-all duration-150 ${
        hasLeftDrawerOpen
          ? 'left-[414px] right-[282px]'
          : 'left-[64px] right-[282px] max-w-[840px] mx-auto'
      }`}
    >
      {/* Expandable March & Battle Odds Tray */}
      {marchMode && (
        <div className="rounded-xl border aoh-hud-panel p-3 shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <ArrowRight size={14} />
              {t.marchTab}: {prov.name}
              {isRailRoute && (
                <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-500/20 border border-yellow-400/50 text-[10px] text-yellow-200">
                  <TrainFront size={10} /> 3x RAIL
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => onSetMarchMode(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
            <div className="sm:col-span-4">
              <select
                id="march-target-select"
                value={effectiveTarget}
                onChange={(e) => setChosenTarget(e.target.value)}
                aria-label={t.selectTargetProvince}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                {reachableIds.map((nid) => {
                  const np = state.provinces[nid];
                  if (!np) return null;
                  const owner = state.countries[np.ownerId];
                  const isEnemy = np.ownerId !== state.playerCountryId;
                  const viaSea = prov.seaNeighbors.includes(nid) && !prov.neighbors.includes(nid);
                  return (
                    <option key={nid} value={nid}>
                      {isEnemy ? '⚔️ ' : '🛡️ '}
                      {np.name} ({owner?.displayName}) {viaSea ? `[${t.seaLandingTag}]` : ''} —{' '}
                      {getTotalUnits(np.units).toLocaleString(numLocale)}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="sm:col-span-4">
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="text-slate-300">{t.armySplit}:</span>
                <span className="font-mono-num font-bold text-amber-300">
                  {splitPercent}% ({splitPreview.toLocaleString(numLocale)}) · ~{estDays}d
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={splitPercent}
                onChange={(e) => setSplitPercent(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="sm:col-span-4">
              <button
                type="button"
                disabled={!effectiveTarget || totalGarrison <= 0 || player.movementPoints < 1}
                onClick={() => onIssueOrder(prov.id, effectiveTarget, splitPercent / 100)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-[11px] font-extrabold cursor-pointer whitespace-nowrap"
              >
                <ArrowRight size={13} />
                {t.issueOrder} ({estDays}d)
              </button>
            </div>
          </div>

          {hasStormDelay && (
            <div className="rounded border border-sky-400/40 bg-sky-500/15 px-2.5 py-1 text-[11px] text-sky-200 flex items-center gap-1.5">
              <Waves size={12} className="text-sky-300 shrink-0" />
              <span>Water Alert Storm: +3 days transit &amp; -22% naval attack!</span>
            </div>
          )}

          {winChance && targetProv && (
            <div
              data-testid="win-chance-box"
              className="rounded-lg border border-slate-700/80 bg-slate-950/90 px-3 py-2 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-300 font-semibold">{t.winChanceLabel}:</span>
                <span
                  className={`font-mono-num font-extrabold ${
                    winChance.chancePct >= 65
                      ? 'text-emerald-400'
                      : winChance.chancePct >= 40
                      ? 'text-amber-300'
                      : 'text-rose-400'
                  }`}
                >
                  {winChance.chancePct}%
                </span>
              </div>
              <div className="flex-1 min-w-[120px] h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full ${
                    winChance.chancePct >= 65
                      ? 'bg-emerald-500'
                      : winChance.chancePct >= 40
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${winChance.chancePct}%` }}
                />
              </div>
              <div className="text-[10.5px] font-mono-num text-slate-400">
                Atk {winChance.attackerPower.toLocaleString(numLocale)} vs Def {winChance.defenderPower.toLocaleString(numLocale)}
              </div>
            </div>
          )}

          {provOrders.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800">
              {provOrders.map((ord) => (
                <div key={ord.id} className="inline-flex items-center gap-1.5 text-[10.5px] bg-slate-900 border border-slate-800 rounded px-2 py-0.5">
                  <span className={ord.isAttack ? 'text-rose-300' : 'text-emerald-300'}>
                    → {state.provinces[ord.toProvinceId]?.name} ({Math.round(ord.progress * 100)}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => onCancelOrder(ord.id)}
                    aria-label={t.cancelOrder}
                    className="text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Compact V3.0 Bottom Province Inspector Bar */}
      <div className="rounded-xl border aoh-hud-panel shadow-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 border-b border-amber-500/20 bg-slate-950/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <FlagBadge flag={player.flag} width={26} height={17} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-white">
                <span className="truncate">{prov.name}</span>
                {prov.isCapital && (
                  <span className="text-[11px] font-bold text-amber-400 whitespace-nowrap">
                    👑 {prov.capitalCity ?? t.capitalPrefix}
                  </span>
                )}
                {prov.assimilated ? (
                  <span className="text-emerald-400 inline-flex items-center gap-0.5 text-[10px] font-semibold">
                    <CheckCircle2 size={10} /> {t.assimilatedBadge}
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={player.treasury < 10}
                    onClick={() => onAssimilate(prov.id)}
                    className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-[10px] font-bold cursor-pointer"
                  >
                    {t.assimilateBtn}
                  </button>
                )}
                {onReconstructCity && (
                  <button
                    type="button"
                    data-testid="reconstruct-city-btn"
                    disabled={player.treasury < 14}
                    onClick={() => onReconstructCity(prov.id)}
                    title="Reconstruct City & Infrastructure (+0.85 Eco, +2% Stability)"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-[10px] font-bold cursor-pointer whitespace-nowrap"
                  >
                    <Building2 size={10} />
                    <span>{t.reconstructCityBtn}</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-2.5 text-[10.5px] font-mono-num text-slate-300">
                <span>{(prov.population / 1_000_000).toFixed(2)}M pop</span>
                <span className="text-slate-600">·</span>
                <span className="text-amber-300">Eco {prov.economy.toFixed(1)}</span>
                <span className="text-slate-600">·</span>
                <span className="inline-flex items-center gap-0.5 text-purple-300">
                  <Shield size={10} /> +{defenseRating}%
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-rose-300 font-bold">⚔️ {totalGarrison.toLocaleString(numLocale)}</span>
                <span className="text-slate-600">·</span>
                <span className="inline-flex items-center gap-1 text-sky-300">
                  <Thermometer size={10} />
                  {weatherInfo.label} · {tempC}°C
                </span>
                {hasExtremeClimateRisk && (
                  <span
                    data-testid="climate-attrition-warn"
                    className="inline-flex items-center gap-0.5 text-orange-300 font-bold"
                  >
                    <Flame size={10} /> {t.climateAttritionWarn}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {provinceCities.length > 0 && (
              <button
                type="button"
                data-testid="city-recon-btn"
                onClick={() => onOpenCityRecon(provinceCities[0].id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-sky-400/50 bg-sky-500/15 hover:bg-sky-500/25 text-[10.5px] font-bold text-sky-200 cursor-pointer whitespace-nowrap"
              >
                <Satellite size={12} />
                <span>
                  {t.cityReconBtn}: {provinceCities[0].name}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onSetMarchMode(false);
                onClose();
              }}
              aria-label={t.close}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {uiMode === 'very_easy' && (
          <div
            data-testid="very-easy-guided-bar"
            className="px-3.5 py-1 bg-emerald-500/15 border-b border-emerald-500/30 text-[11px] font-bold text-emerald-200 flex flex-wrap items-center justify-between gap-2"
          >
            <span>{t.guidedAttackTip}</span>
            <span className="text-amber-300">{t.guidedRecruitTip}</span>
          </div>
        )}

        {/* Bottom Body: Horizontal Row of Square Building Slots + Quick Recruitment & March Actions */}
        <div
          className={`p-2.5 sm:px-3 sm:py-2 flex gap-2.5 ${
            hasLeftDrawerOpen
              ? 'flex-col'
              : 'flex-col xl:flex-row xl:items-center xl:justify-between'
          }`}
        >
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-bold uppercase tracking-wider text-slate-400">
                {t.buildingsTab}
              </span>
              {hoveredBuilding && (
                <span className="text-amber-200 font-semibold truncate pl-2">
                  {BUILDING_NAMES[lang][hoveredBuilding].name} — {BUILDING_NAMES[lang][hoveredBuilding].desc}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {BUILDING_LIST.map((bType) => {
                const info = BUILDING_NAMES[lang][bType];
                const isBuilt = prov.buildings.includes(bType);
                const cost = BUILDING_COSTS[bType];
                const blockedByCoast = bType === 'coastal_defense' && prov.seaNeighbors.length === 0;
                const blockedByTech =
                  (bType === 'missile_silo' && !player.unlockedTechs.includes('mil_missiles')) ||
                  (bType === 'spaceport' && !player.unlockedTechs.includes('eco_fusion'));
                const canBuild =
                  !isBuilt &&
                  !blockedByCoast &&
                  !blockedByTech &&
                  player.treasury >= cost &&
                  player.movementPoints >= 1;

                return (
                  <button
                    key={bType}
                    type="button"
                    data-testid={`build-slot-${bType}`}
                    disabled={isBuilt || !canBuild}
                    onMouseEnter={() => setHoveredBuilding(bType)}
                    onMouseLeave={() => setHoveredBuilding(null)}
                    onClick={() => onBuild(prov.id, bType)}
                    title={`${info.name} (${isBuilt ? t.built : `${cost} PLN`}) — ${info.desc}`}
                    aria-label={`${info.name} ${isBuilt ? t.built : `${cost} PLN`}`}
                    className={`relative h-8 w-8 shrink-0 rounded-lg border flex flex-col items-center justify-center transition-colors ${
                      isBuilt
                        ? 'border-emerald-500/65 bg-emerald-950/35 cursor-default'
                        : canBuild
                        ? 'border-slate-700 bg-slate-900/90 hover:border-amber-400 cursor-pointer'
                        : 'border-slate-800/80 bg-slate-950/70 opacity-45 cursor-not-allowed'
                    }`}
                  >
                    <BuildingSlotIcon type={bType} />
                    {isBuilt ? (
                      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                        <Check size={9} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono-num font-bold text-amber-300 leading-none mt-0.5">
                        {cost}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`flex flex-wrap items-center gap-1.5 shrink-0 ${
              hasLeftDrawerOpen
                ? 'border-t border-slate-800/80 pt-2'
                : 'border-t xl:border-t-0 xl:border-l border-slate-800/80 pt-2 xl:pt-0 xl:pl-2.5'
            }`}
          >
            <select
              value={activeUnitSpec?.id ?? 'infantry'}
              onChange={(e) => setSelectedUnitType(e.target.value as UnitType)}
              aria-label={t.recruitTab}
              className="rounded-lg border border-slate-700 bg-slate-950 px-1.5 py-1.5 text-[11px] font-semibold text-white focus:border-amber-400 focus:outline-none max-w-[110px]"
            >
              {availableUnits.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {UNIT_NAMES[lang][spec.id]}
                </option>
              ))}
            </select>

            <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
              {([1000, 3000, 10000] as const).map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setRecruitPreset(amt)}
                  className={`px-1.5 py-1 rounded text-[10px] font-mono-num font-bold cursor-pointer ${
                    recruitPreset === amt ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {amt / 1000}k
                </button>
              ))}
              <button
                type="button"
                onClick={() => setRecruitPreset('max')}
                className={`px-1.5 py-1 rounded text-[10px] font-mono-num font-bold cursor-pointer ${
                  recruitPreset === 'max' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-300 hover:text-white'
                }`}
              >
                {t.recruitMax}
              </button>
            </div>

            <button
              type="button"
              disabled={!canRecruit}
              onClick={() => activeUnitSpec && onRecruit(prov.id, activeUnitSpec.id, actualCount)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-[11px] font-extrabold font-mono-num cursor-pointer whitespace-nowrap"
            >
              <UserPlus size={12} />
              {uiMode === 'very_easy' ? t.guidedRecruitTip : `+${(actualCount / 1000).toFixed(0)}k (${recruitCost})`}
            </button>

            <button
              type="button"
              data-testid="march-toggle-btn"
              onClick={() => onSetMarchMode(!marchMode)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-extrabold cursor-pointer whitespace-nowrap ${
                marchMode
                  ? 'border-rose-400 bg-rose-600 text-white'
                  : 'border-sky-400/50 bg-sky-500/15 hover:bg-sky-500/25 text-sky-200'
              }`}
            >
              <ArrowRight size={12} />
              <span>{t.marchTab}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
