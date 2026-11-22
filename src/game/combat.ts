import { CABINET_MINISTERS, SPACE_OCEAN_NODES } from '../data/spaceSectors';
import { getDifficultyConfig, getUnitSpec } from '../data/scenarios';
import type {
  BattleEvent,
  BudgetBreakdown,
  CustomUnitBlueprint,
  DifficultyId,
  GameState,
  ProvinceState,
  ScenarioId,
  UnitBreakdown,
  UnitType,
  WeatherKind,
} from './types';
import { getExtremeClimateAttrition, WEATHER_EFFECTS } from './weather';

export function getTotalUnits(units: UnitBreakdown): number {
  let sum = 0;
  for (const val of Object.values(units)) {
    if (typeof val === 'number' && val > 0) sum += val;
  }
  return Math.round(sum);
}

// 100% exact sum of all soldiers/fleets across ALL provinces owned by a country + active orders in transit
export function getExactCountryArmy(state: GameState, countryId: string): number {
  let total = 0;
  for (const prov of Object.values(state.provinces)) {
    if (prov.ownerId === countryId) {
      total += getTotalUnits(prov.units);
    }
  }
  for (const ord of state.orders) {
    if (ord.countryId === countryId) {
      total += getTotalUnits(ord.units);
    }
  }
  return total;
}

export function addUnits(target: UnitBreakdown, delta: UnitBreakdown): UnitBreakdown {
  const next: UnitBreakdown = { ...target };
  for (const [k, v] of Object.entries(delta)) {
    const key = k as UnitType;
    const val = Math.round(v ?? 0);
    if (val > 0) {
      next[key] = (next[key] ?? 0) + val;
    }
  }
  return next;
}

export function subtractUnits(source: UnitBreakdown, sub: UnitBreakdown): UnitBreakdown {
  const next: UnitBreakdown = { ...source };
  for (const [k, v] of Object.entries(sub)) {
    const key = k as UnitType;
    const rem = Math.max(0, Math.round((next[key] ?? 0) - (v ?? 0)));
    if (rem > 0) next[key] = rem;
    else delete next[key];
  }
  return next;
}

export function splitUnitsByRatio(units: UnitBreakdown, ratio: number): UnitBreakdown {
  const clamped = Math.max(0.05, Math.min(1, ratio));
  const split: UnitBreakdown = {};
  for (const [k, v] of Object.entries(units)) {
    const count = Math.round((v ?? 0) * clamped);
    if (count > 0) {
      split[k as UnitType] = count;
    }
  }
  return split;
}

export function scaleUnits(units: UnitBreakdown, survivalRatio: number): UnitBreakdown {
  const ratio = Math.max(0, Math.min(1, survivalRatio));
  const out: UnitBreakdown = {};
  for (const [k, v] of Object.entries(units)) {
    const rem = Math.round((v ?? 0) * ratio);
    if (rem > 0) out[k as UnitType] = rem;
  }
  return out;
}

const HEAVY_WEATHER_UNITS: Set<UnitType> = new Set([
  'tanks',
  'rocket_artillery',
  'artillery',
  'aviation',
]);

export interface ArmyPowerOptions {
  hasFort?: boolean;
  hasCoastalDefense?: boolean;
  isNavalAssault?: boolean;
  hasWaterStorm?: boolean;
  weather?: WeatherKind;
  assimilated?: boolean;
  difficulty?: DifficultyId;
  isPlayerSide?: boolean;
  isSpectator?: boolean;
  ministerAttackBonus?: number;
  spacePowerBonus?: number;
  customBlueprints?: CustomUnitBlueprint[];
  temperatureC?: number;
  logisticsTechLevel?: number;
}

export function computeArmyPower(
  units: UnitBreakdown,
  scenarioId: ScenarioId,
  side: 'attack' | 'defense',
  militaryTechLevel: number,
  options: boolean | ArmyPowerOptions = false,
): number {
  const opts: ArmyPowerOptions =
    typeof options === 'boolean' ? { hasFort: options } : options;
  const weather: WeatherKind = opts.weather ?? 'sunny';
  const weatherSpec = WEATHER_EFFECTS[weather];
  const diffConfig = getDifficultyConfig(opts.difficulty);

  let power = 0;
  for (const [k, v] of Object.entries(units)) {
    if (!v || v <= 0) continue;
    const uType = k as UnitType;
    const spec = getUnitSpec(scenarioId, uType);
    const base = side === 'attack' ? spec.attack : spec.defense;
    const weatherUnitMult = HEAVY_WEATHER_UNITS.has(uType)
      ? weatherSpec.armorAirAttackMult
      : 1.0;
    const navalBonus = uType === 'naval_fleet' && opts.isNavalAssault ? 1.25 : 1.0;

    let blueprintBonus = 1.0;
    if (opts.customBlueprints && opts.customBlueprints.length > 0 && opts.isPlayerSide) {
      const matching = opts.customBlueprints.filter((bp) => bp.category === uType);
      if (matching.length > 0) {
        const best = matching[matching.length - 1];
        const statScore = side === 'attack' ? best.firepower * 0.025 + best.speed * 0.01 : best.armor * 0.025;
        blueprintBonus += statScore;
      }
    }

    power += v * base * weatherUnitMult * navalBonus * blueprintBonus;
  }

  const techBonus = 1 + militaryTechLevel * 0.08 + (opts.ministerAttackBonus ?? 0);
  const fortBonus = side === 'defense' && opts.hasFort ? 1.35 : 1.0;
  const coastalBonus =
    side === 'defense' && opts.hasCoastalDefense && opts.isNavalAssault ? 1.28 : 1.0;
  const stormPenalty = side === 'attack' && opts.isNavalAssault && opts.hasWaterStorm ? 0.78 : 1.0;
  const weatherDefBonus = side === 'defense' ? weatherSpec.defenseMult : 1.0;
  const assimFactor =
    side === 'defense' && opts.assimilated === false ? 0.75 : 1.0;

  let climateCombatMult = 1.0;
  if (side === 'attack' && typeof opts.temperatureC === 'number') {
    const attr = getExtremeClimateAttrition(
      opts.temperatureC,
      opts.logisticsTechLevel ?? 0,
      opts.difficulty === 'world_conquest' && Boolean(opts.isPlayerSide),
    );
    climateCombatMult = attr.combatMult;
  }

  let diffMult = 1.0;
  if (!opts.isSpectator) {
    if (side === 'attack' && opts.isPlayerSide) {
      diffMult = diffConfig.playerAttackMult;
    } else if (side === 'defense' && opts.isPlayerSide === false) {
      diffMult = diffConfig.aiDefenseMult;
    }
  }

  return power * techBonus * fortBonus * coastalBonus * stormPenalty * weatherDefBonus * assimFactor * climateCombatMult * diffMult;
}

function getDefenseMinisterBonus(state: GameState, countryId: string): number {
  const c = state.countries[countryId];
  let bonus = 0;
  if (c?.cabinet?.defense) {
    const min = CABINET_MINISTERS.find((m) => m.id === c.cabinet.defense);
    bonus += min?.attackBonus ?? 0;
  }
  if (c?.generals && c.generals.length > 0) {
    const bestGen = c.generals.reduce((b, g) => (g.attackBonus > b.attackBonus ? g : b), c.generals[0]);
    bonus += bestGen.attackBonus * (1 + (bestGen.level - 1) * 0.12);
  }
  if (c?.unlockedLegacyPerks?.includes('leg_iron_discipline')) bonus += 0.1;
  if (c?.resurrectedFaithId === 'roman_pantheon') bonus += 0.12;
  if (c?.reformedEmpireId === 'roman_empire') bonus += 0.2;
  if (c?.reformedEmpireId === 'great_lechia') bonus += 0.1;
  const milSlider = c?.budgetSliders?.militarySpending ?? 100;
  bonus += (milSlider - 100) * 0.0025;
  return bonus;
}

export function calculateWinChance(params: {
  state: GameState;
  attackerId: string;
  attackerUnits: UnitBreakdown;
  defenderProvince: ProvinceState;
  isNavalAssault?: boolean;
}): {
  chancePct: number;
  attackerPower: number;
  defenderPower: number;
  ratio: number;
} {
  const { state, attackerId, attackerUnits, defenderProvince, isNavalAssault = false } = params;
  const isSpectator = state.gameMode === 'bot_spectator';
  const attackerCountry = state.countries[attackerId];
  const defenderCountry = state.countries[defenderProvince.ownerId];
  const hasWaterStorm = state.waterAlerts.some((w) =>
    w.affectedProvinceIds.includes(defenderProvince.id),
  );

  const attPower = computeArmyPower(
    attackerUnits,
    state.scenarioId,
    'attack',
    attackerCountry?.tech.military ?? 0,
    {
      weather: defenderProvince.weather,
      difficulty: state.difficulty,
      isPlayerSide: attackerId === state.playerCountryId,
      isSpectator,
      isNavalAssault,
      hasWaterStorm,
      ministerAttackBonus: getDefenseMinisterBonus(state, attackerId),
      customBlueprints: state.customBlueprints,
      temperatureC: defenderProvince.temperatureC,
      logisticsTechLevel: attackerCountry?.tech.logistics ?? 0,
    },
  );
  const defPower = computeArmyPower(
    defenderProvince.units,
    state.scenarioId,
    'defense',
    defenderCountry?.tech.military ?? 0,
    {
      hasFort: defenderProvince.buildings.includes('fort'),
      hasCoastalDefense: defenderProvince.buildings.includes('coastal_defense'),
      isNavalAssault,
      weather: defenderProvince.weather,
      assimilated: defenderProvince.assimilated,
      difficulty: state.difficulty,
      isPlayerSide: defenderProvince.ownerId === state.playerCountryId,
      isSpectator,
      customBlueprints: state.customBlueprints,
    },
  );

  if (defPower <= 0 || getTotalUnits(defenderProvince.units) <= 0) {
    return {
      chancePct: 99,
      attackerPower: Math.round(attPower),
      defenderPower: 0,
      ratio: 10,
    };
  }

  const ratio = attPower / Math.max(1, defPower);
  const raw = 100 / (1 + Math.exp(-5.4 * (ratio - 1.02)));
  const chancePct = Math.round(Math.max(3, Math.min(99, raw)));
  return {
    chancePct,
    attackerPower: Math.round(attPower),
    defenderPower: Math.round(defPower),
    ratio,
  };
}

export function resolveProvinceBattle(params: {
  scenarioId: ScenarioId;
  difficulty?: DifficultyId;
  playerCountryId?: string;
  isSpectator?: boolean;
  attackerId: string;
  attackerUnits: UnitBreakdown;
  attackerMilTech: number;
  attackerLogTech?: number;
  defenderProvince: ProvinceState;
  defenderMilTech: number;
  battleId: string;
  isNavalAssault?: boolean;
  hasWaterStorm?: boolean;
  attackerMinisterBonus?: number;
  customBlueprints?: CustomUnitBlueprint[];
}): {
  event: BattleEvent;
  survivingAttackers: UnitBreakdown;
  survivingDefenders: UnitBreakdown;
  captured: boolean;
} {
  const {
    scenarioId,
    difficulty = 'normal',
    playerCountryId,
    isSpectator = false,
    attackerId,
    attackerUnits,
    attackerMilTech,
    attackerLogTech = 0,
    defenderProvince,
    defenderMilTech,
    battleId,
    isNavalAssault = false,
    hasWaterStorm = false,
    attackerMinisterBonus = 0,
    customBlueprints,
  } = params;
  const defenderId = defenderProvince.ownerId;
  const hasFort = defenderProvince.buildings.includes('fort');
  const hasCoastalDefense = defenderProvince.buildings.includes('coastal_defense');

  const attTotal = getTotalUnits(attackerUnits);
  const defTotal = getTotalUnits(defenderProvince.units);

  const attPower = computeArmyPower(attackerUnits, scenarioId, 'attack', attackerMilTech, {
    weather: defenderProvince.weather,
    difficulty,
    isPlayerSide: playerCountryId ? attackerId === playerCountryId : undefined,
    isSpectator,
    isNavalAssault,
    hasWaterStorm,
    ministerAttackBonus: attackerMinisterBonus,
    customBlueprints,
    temperatureC: defenderProvince.temperatureC,
    logisticsTechLevel: attackerLogTech,
  });
  const defPower = computeArmyPower(
    defenderProvince.units,
    scenarioId,
    'defense',
    defenderMilTech,
    {
      hasFort: hasFort || defenderProvince.buildings.includes('castle'),
      hasCoastalDefense,
      isNavalAssault,
      weather: defenderProvince.weather,
      assimilated: defenderProvince.assimilated,
      difficulty,
      isPlayerSide: playerCountryId ? defenderId === playerCountryId : undefined,
      isSpectator,
      customBlueprints,
    },
  );

  if (defPower <= 0 || defTotal <= 0) {
    return {
      event: {
        id: battleId,
        provinceId: defenderProvince.id,
        provinceName: defenderProvince.name,
        attackerId,
        defenderId,
        attackerPower: Math.round(attPower),
        defenderPower: 0,
        attackerLosses: 0,
        defenderLosses: 0,
        attackerWon: true,
        captured: true,
        centroid: defenderProvince.centroid,
        timestamp: Date.now(),
      },
      survivingAttackers: attackerUnits,
      survivingDefenders: {},
      captured: true,
    };
  }

  const ratio = attPower / Math.max(1, defPower);
  const attackerWon = ratio > 1.02;

  if (attackerWon) {
    const attLossRatio = Math.min(0.75, 0.22 + 0.45 / Math.max(1.02, ratio));
    const survivingAttackers = scaleUnits(attackerUnits, 1 - attLossRatio);
    const attSurvivedCount = getTotalUnits(survivingAttackers);
    const finalAttackers =
      attSurvivedCount > 0
        ? survivingAttackers
        : { infantry: Math.max(100, Math.round(attTotal * 0.1)) };

    return {
      event: {
        id: battleId,
        provinceId: defenderProvince.id,
        provinceName: defenderProvince.name,
        attackerId,
        defenderId,
        attackerPower: Math.round(attPower),
        defenderPower: Math.round(defPower),
        attackerLosses: Math.max(0, attTotal - getTotalUnits(finalAttackers)),
        defenderLosses: defTotal,
        attackerWon: true,
        captured: true,
        centroid: defenderProvince.centroid,
        timestamp: Date.now(),
      },
      survivingAttackers: finalAttackers,
      survivingDefenders: {},
      captured: true,
    };
  }

  const defLossRatio = Math.min(0.68, 0.18 + 0.48 * ratio);
  const survivingDefenders = scaleUnits(defenderProvince.units, 1 - defLossRatio);
  const attLossRatio = Math.min(0.92, 0.65 + (1 - ratio) * 0.3);
  const survivingAttackers = scaleUnits(attackerUnits, 1 - attLossRatio);

  return {
    event: {
      id: battleId,
      provinceId: defenderProvince.id,
      provinceName: defenderProvince.name,
      attackerId,
      defenderId,
      attackerPower: Math.round(attPower),
      defenderPower: Math.round(defPower),
      attackerLosses: Math.max(0, attTotal - getTotalUnits(survivingAttackers)),
      defenderLosses: Math.max(0, defTotal - getTotalUnits(survivingDefenders)),
      attackerWon: false,
      captured: false,
      centroid: defenderProvince.centroid,
      timestamp: Date.now(),
    },
    survivingAttackers,
    survivingDefenders,
    captured: false,
  };
}

const BUILDING_UPKEEP: Record<string, number> = {
  factory: 0.4,
  workshop: 0.2,
  farm: 0.2,
  barracks: 0.5,
  port: 0.4,
  fort: 0.6,
  castle: 0.75,
  university: 0.7,
  library: 0.3,
  railway: 0.35,
  coastal_defense: 0.5,
  airbase: 0.8,
  armory: 0.55,
  nuclear_reactor: 1.2,
  missile_silo: 1.1,
  spaceport: 1.6,
};

function computePreTributeBudget(
  state: GameState,
  countryId: string,
  ownedProvs: ProvinceState[],
): Omit<BudgetBreakdown, 'vassalTributeIncome' | 'vassalTributePaid' | 'netPerTurn'> & {
  grossPositive: number;
} {
  const country = state.countries[countryId];
  const isSpectator = state.gameMode === 'bot_spectator';
  const diff = getDifficultyConfig(state.difficulty);
  const diffMult = isSpectator
    ? 1.0
    : country?.isPlayer
    ? diff.playerIncomeMult
    : diff.aiEconomyMult;

  const techMult = 1 + (country?.tech.economy ?? 0) * 0.1;
  const effectiveTaxRate = country?.budgetSliders?.taxRate ?? country?.taxRate ?? 18;
  const taxMult = effectiveTaxRate / 18;
  const finMin = country?.cabinet?.finance
    ? CABINET_MINISTERS.find((m) => m.id === country.cabinet.finance)
    : undefined;
  const legacyEcoMult = country?.unlockedLegacyPerks?.includes('leg_merchant_guild') ? 1.15 : 1.0;
  const empireEcoMult = country?.reformedEmpireId === 'great_lechia' ? 1.2 : 1.0;
  const ministerEconMult = (1 + (finMin?.economyBonus ?? 0)) * legacyEcoMult * empireEcoMult;
  const ideologyEcoMult =
    country?.ideology === 'technocracy'
      ? 1.08
      : country?.ideology === 'democracy'
      ? 1.05
      : country?.ideology === 'monarchy'
      ? 1.03
      : 1.0;
  const goldenMult = (country?.goldenAgeDaysLeft ?? 0) > 0 ? 1.2 : 1.0;
  const hasArcology = country?.megaprojects?.includes('deep_ocean_arcology') ?? false;
  const winterPenalty = hasArcology ? 1.0 : Math.max(0.55, 1 - (state.nuclearWinterLevel ?? 0) * 0.004);

  let taxIncome = 0;
  let factoryAndPortIncome = 0;
  let buildingUpkeep = 0;
  let totalArmy = 0;
  let portCount = 0;

  for (const prov of ownedProvs) {
    const assimMult = prov.assimilated ? 1.0 : 0.75;
    const devMult = 1 + Math.max(0, (prov.development ?? 1) - 1) * 0.12;
    const devastationMult = Math.max(0.3, 1 - (prov.nuclearDevastation ?? 0) * 0.007);
    const weatherFarmMult = WEATHER_EFFECTS[prov.weather ?? 'sunny'].farmIncomeMult;

    taxIncome +=
      prov.economy *
      devMult *
      techMult *
      taxMult *
      assimMult *
      diffMult *
      ministerEconMult *
      ideologyEcoMult *
      goldenMult *
      winterPenalty *
      devastationMult;

    if (prov.buildings.includes('factory'))
      factoryAndPortIncome += 4.5 * assimMult * diffMult * ministerEconMult * devastationMult;
    if (prov.buildings.includes('workshop'))
      factoryAndPortIncome += 2.6 * assimMult * diffMult * ministerEconMult * devastationMult;
    if (prov.buildings.includes('nuclear_reactor'))
      factoryAndPortIncome += 7.2 * assimMult * diffMult * ministerEconMult * devastationMult;
    if (prov.buildings.includes('port')) {
      factoryAndPortIncome += 3.0 * assimMult * diffMult;
      portCount += 1;
    }
    if (prov.buildings.includes('railway')) {
      factoryAndPortIncome += 1.6 * assimMult * diffMult;
    }
    if (prov.buildings.includes('farm')) {
      factoryAndPortIncome += 1.4 * weatherFarmMult * assimMult * diffMult * winterPenalty;
    }

    for (const b of prov.buildings) {
      buildingUpkeep += BUILDING_UPKEEP[b] ?? 0.3;
    }

    totalArmy += getTotalUnits(prov.units);
  }

  for (const ord of state.orders) {
    if (ord.countryId === countryId) totalArmy += getTotalUnits(ord.units);
  }

  let spaceOceanIncome = 0;
  const legacySpaceMult = country?.unlockedLegacyPerks?.includes('leg_orbital_ambition') ? 1.3 : 1.0;
  for (const nodeId of country?.spaceColonies ?? []) {
    const node = SPACE_OCEAN_NODES.find((n) => n.id === nodeId);
    if (node) spaceOceanIncome += node.incomePerMonth * legacySpaceMult;
  }
  if (country?.megaprojects?.includes('transcontinental_rail')) spaceOceanIncome += 18;
  if (country?.megaprojects?.includes('fusion_core')) spaceOceanIncome += 25;
  if (country?.megaprojects?.includes('deep_ocean_arcology')) spaceOceanIncome += 30;

  const councilTradeBonus = state.worldCouncil?.passedEffects.includes('res_green_maritime') ? 1.15 : 1.0;
  const faithTradeBonus = country?.resurrectedFaithId === 'hellenic' ? 1.1 : 1.0;
  const allyBonus = 1 + (country?.allies.length ?? 0) * 0.12;
  const enemyBlockading = Object.values(state.blockadedStraits ?? {}).some(
    (blockerId) => blockerId && blockerId !== countryId && country?.atWarWith.includes(blockerId),
  );
  const sanctionPenalty = (country?.sanctionedBy?.length ?? 0) > 0 ? 0.78 : 1.0;
  const blockadeMult = (enemyBlockading ? 0.65 : 1.0) * sanctionPenalty;
  const convoyBonus = portCount * 1.1;
  const tradeIncome =
    (ownedProvs.length * 0.45 + convoyBonus) *
    allyBonus *
    diffMult *
    councilTradeBonus *
    faithTradeBonus *
    legacyEcoMult *
    blockadeMult;

  const logisticsSave = Math.max(0.75, 1 - (country?.tech.logistics ?? 0) * 0.05);
  const milBudgetMult = (country?.budgetSliders?.militarySpending ?? 100) / 100;
  const armyUpkeep = totalArmy * 0.00018 * logisticsSave * milBudgetMult;
  const sliderSpendingUpkeep =
    ownedProvs.length *
    (((country?.budgetSliders?.goodsSpending ?? 8) +
      (country?.budgetSliders?.investmentsSpending ?? 6) +
      (country?.budgetSliders?.researchSpending ?? 8)) *
      0.035);
  const loanPayments = (country?.loans ?? []).reduce((s, l) => s + l.perTurnPayment, 0);
  const grossPositive = taxIncome + factoryAndPortIncome + tradeIncome + spaceOceanIncome;

  return {
    taxIncome: Number(taxIncome.toFixed(1)),
    factoryAndPortIncome: Number(factoryAndPortIncome.toFixed(1)),
    tradeIncome: Number(tradeIncome.toFixed(1)),
    spaceOceanIncome: Number(spaceOceanIncome.toFixed(1)),
    armyUpkeep: Number(armyUpkeep.toFixed(1)),
    buildingUpkeep: Number((buildingUpkeep + sliderSpendingUpkeep).toFixed(1)),
    loanPayments: Number(loanPayments.toFixed(1)),
    grossPositive,
  };
}

export function computeDetailedBudget(state: GameState, countryId: string): BudgetBreakdown {
  const ownedProvs = Object.values(state.provinces).filter((p) => p.ownerId === countryId);
  const base = computePreTributeBudget(state, countryId, ownedProvs);
  const country = state.countries[countryId];

  let vassalTributeIncome = 0;
  if (country && country.vassals.length > 0) {
    for (const vId of country.vassals) {
      const vProvs = Object.values(state.provinces).filter((p) => p.ownerId === vId);
      if (vProvs.length === 0) continue;
      const vBase = computePreTributeBudget(state, vId, vProvs);
      const pct = (state.countries[vId]?.vassalTributePct ?? 22) / 100;
      vassalTributeIncome += Math.max(0, vBase.grossPositive * pct);
    }
  }

  const paidPct = (country?.vassalTributePct ?? 22) / 100;
  const vassalTributePaid = country?.vassalOf ? Math.max(0, base.grossPositive * paidPct) : 0;

  const netPerTurn =
    base.taxIncome +
    base.factoryAndPortIncome +
    base.tradeIncome +
    base.spaceOceanIncome +
    vassalTributeIncome -
    base.armyUpkeep -
    base.buildingUpkeep -
    base.loanPayments -
    vassalTributePaid;

  return {
    taxIncome: base.taxIncome,
    factoryAndPortIncome: base.factoryAndPortIncome,
    tradeIncome: base.tradeIncome,
    vassalTributeIncome: Number(vassalTributeIncome.toFixed(1)),
    spaceOceanIncome: base.spaceOceanIncome,
    armyUpkeep: base.armyUpkeep,
    buildingUpkeep: base.buildingUpkeep,
    loanPayments: base.loanPayments,
    vassalTributePaid: Number(vassalTributePaid.toFixed(1)),
    netPerTurn: Number(netPerTurn.toFixed(1)),
  };
}

export interface CountrySummary {
  countryId: string;
  areaKm2: number;
  population: number;
  totalArmy: number;
  provinceCount: number;
  incomePerTurn: number;
  treasury: number;
  manpower: number;
  maxManpower: number;
  powerScore: number;
}

export function computeCountrySummaries(state: GameState): Record<string, CountrySummary> {
  const summaries: Record<string, CountrySummary> = {};
  const provsByOwner: Record<string, ProvinceState[]> = {};

  for (const [cId, country] of Object.entries(state.countries)) {
    summaries[cId] = {
      countryId: cId,
      areaKm2: 0,
      population: 0,
      totalArmy: 0,
      provinceCount: 0,
      incomePerTurn: 0,
      treasury: Number(country.treasury.toFixed(1)),
      manpower: Math.round(country.manpower),
      maxManpower: Math.round(country.maxManpower),
      powerScore: 0,
    };
    provsByOwner[cId] = [];
  }

  for (const prov of Object.values(state.provinces)) {
    const sum = summaries[prov.ownerId];
    if (!sum) continue;
    provsByOwner[prov.ownerId].push(prov);
    sum.provinceCount += 1;
    sum.areaKm2 += prov.areaKm2;
    sum.population += prov.population;
    sum.totalArmy += getTotalUnits(prov.units);
  }

  for (const ord of state.orders) {
    const sum = summaries[ord.countryId];
    if (sum) sum.totalArmy += getTotalUnits(ord.units);
  }

  const preBudgets: Record<string, ReturnType<typeof computePreTributeBudget>> = {};
  for (const cId of Object.keys(state.countries)) {
    if (provsByOwner[cId].length > 0) {
      preBudgets[cId] = computePreTributeBudget(state, cId, provsByOwner[cId]);
    }
  }

  for (const sum of Object.values(summaries)) {
    if (sum.provinceCount === 0) continue;
    const country = state.countries[sum.countryId];
    const base = preBudgets[sum.countryId];
    let vassalIncome = 0;
    for (const vId of country?.vassals ?? []) {
      const vb = preBudgets[vId];
      const pct = (state.countries[vId]?.vassalTributePct ?? 22) / 100;
      if (vb) vassalIncome += Math.max(0, vb.grossPositive * pct);
    }
    const paidPct = (country?.vassalTributePct ?? 22) / 100;
    const vassalPaid = country?.vassalOf ? Math.max(0, base.grossPositive * paidPct) : 0;

    const net =
      base.taxIncome +
      base.factoryAndPortIncome +
      base.tradeIncome +
      base.spaceOceanIncome +
      vassalIncome -
      base.armyUpkeep -
      base.buildingUpkeep -
      base.loanPayments -
      vassalPaid;

    let spaceBonus = 0;
    for (const nodeId of country?.spaceColonies ?? []) {
      const n = SPACE_OCEAN_NODES.find((sn) => sn.id === nodeId);
      if (n) spaceBonus += n.powerBonus;
    }

    sum.incomePerTurn = Number(net.toFixed(1));
    sum.areaKm2 = Math.round(sum.areaKm2);
    sum.powerScore = Math.round(
      sum.totalArmy * 0.85 +
        sum.areaKm2 * 0.09 +
        sum.population * 0.002 +
        Math.max(0, base.grossPositive) * 18000 +
        sum.provinceCount * 22000 +
        spaceBonus,
    );
  }

  return summaries;
}

export function getTopCountries(state: GameState, limit = 12): CountrySummary[] {
  const summaries = computeCountrySummaries(state);
  return Object.values(summaries)
    .filter((s) => s.provinceCount > 0)
    .sort((a, b) => b.powerScore - a.powerScore)
    .slice(0, limit);
}
