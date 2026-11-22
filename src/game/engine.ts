import {
  CABINET_MINISTERS,
  COMMODITY_BASE_PRICES,
  MEGAPROJECTS,
  SPACE_OCEAN_NODES,
  STRATEGIC_STRAITS,
  WORLD_COUNCIL_RESOLUTIONS,
} from '../data/spaceSectors';
import {
  TECH_NODE_MAP,
  canUnlockTechNode,
  planTechResearchPath,
} from '../data/techTree';
import {
  SCENARIOS,
  getDifficultyConfig,
  getUnitSpec,
  isHardcoreGeopolitics,
} from '../data/scenarios';
import {
  ANCIENT_FAITH_DECISIONS,
  CIVILIZATION_LEGACY_PERKS,
  REFORMABLE_EMPIRES,
  generateGeneralForCountry,
  getCountryDemographics,
  getCountryGraffitiSlogan,
} from '../data/leadersAndDemographics';
import { generateAiOrdersAndActions, runAutoPilotCommand } from './ai';
import {
  addUnits,
  computeCountrySummaries,
  getTotalUnits,
  resolveProvinceBattle,
  scaleUnits,
  splitUnitsByRatio,
  subtractUnits,
} from './combat';
import { buildWorldMapData, projectLonLat } from './mapGen';
import type {
  AiAggressiveness,
  AirliftOrderVisual,
  ArmyOrder,
  BattleEvent,
  BudgetSliders,
  BuildingType,
  ChronicleEntry,
  CommanderRankId,
  CommodityId,
  CountryState,
  CustomNationConfig,
  CustomScenarioConfig,
  CustomUnitBlueprint,
  CustomUnitCategory,
  DifficultyId,
  GameMode,
  GameNotification,
  GameState,
  IdeologyId,
  Language,
  LoanRecord,
  MapPulseEvent,
  MegaprojectId,
  MilitaryGeneral,
  MinisterRole,
  MissileStrikeVisual,
  PeaceTreatyDraft,
  PendingRandomEvent,
  ProvinceState,
  ReligionId,
  ScenarioId,
  StraitBlockadeId,
  TechNodeId,
  UiMode,
  UnitBreakdown,
  UnitType,
  WeatherKind,
} from './types';
import {
  WEATHER_EFFECTS,
  computeProvinceTemperatureC,
  computeProvinceWeather,
  generateWaterAlerts,
  getExtremeClimateAttrition,
  getSeasonFromMonth,
} from './weather';

export const BUILDING_COSTS: Record<BuildingType, number> = {
  factory: 22,
  workshop: 14,
  farm: 18,
  barracks: 20,
  port: 24,
  fort: 26,
  castle: 34,
  university: 28,
  library: 16,
  railway: 20,
  coastal_defense: 25,
  airbase: 36,
  armory: 26,
  nuclear_reactor: 52,
  missile_silo: 44,
  spaceport: 65,
};

export function getCommanderRankForLevel(level: number): CommanderRankId {
  if (level >= 22) return 'galactic_sovereign';
  if (level >= 15) return 'world_emperor';
  if (level >= 10) return 'field_marshal';
  if (level >= 6) return 'general';
  if (level >= 3) return 'tactician';
  return 'cadet';
}

export function grantCommanderXp(state: GameState, rawAmount: number, reason: string): GameState {
  if (rawAmount <= 0 || state.gameMode === 'bot_spectator') return state;
  const player = state.countries[state.playerCountryId];
  const mult = player?.unlockedLegacyPerks?.includes('leg_orbital_ambition') ? 1.5 : 1.0;
  const amount = Math.max(1, Math.round(rawAmount * mult));
  const nextXp = (state.commanderXp ?? 0) + amount;
  const nextLevel = Math.max(1, Math.floor(Math.sqrt(nextXp / 55)) + 1);
  const nextRank = getCommanderRankForLevel(nextLevel);
  const now = Date.now();
  const popup = {
    id: `xp_${now}_${Math.random().toString(36).slice(2, 6)}`,
    amount,
    reason,
    createdAt: now,
  };
  return {
    ...state,
    commanderXp: nextXp,
    commanderLevel: nextLevel,
    commanderRankId: nextRank,
    xpPopups: [popup, ...(state.xpPopups ?? [])].slice(0, 8),
  };
}

function triggerArticle5AndBreakPacts(
  state: GameState,
  countries: Record<string, CountryState>,
  aggressorId: string,
  defenderId: string,
  lang: Language,
  chronicle: ChronicleEntry[],
  notifications: GameNotification[],
): void {
  const agg = countries[aggressorId];
  const def = countries[defenderId];
  if (!agg || !def) return;

  // Break all pacts and apply -25% stability penalty for treacherous aggression in hardcore geopolitics
  if (isHardcoreGeopolitics(state.difficulty, state.uiMode)) {
    agg.stability = Math.max(15, agg.stability - 25);
    agg.relations = { ...agg.relations, [defenderId]: -100 };
    def.relations = { ...def.relations, [aggressorId]: -100 };

    const calledAllies: string[] = [];
    for (const allyId of def.allies) {
      if (allyId === aggressorId || allyId === defenderId) continue;
      const ally = countries[allyId];
      if (!ally || ally.eliminated) continue;
      if (!ally.atWarWith.includes(aggressorId)) {
        ally.atWarWith = [...ally.atWarWith, aggressorId];
      }
      if (!agg.atWarWith.includes(allyId)) {
        agg.atWarWith = [...agg.atWarWith, allyId];
      }
      ally.allies = ally.allies.filter((id) => id !== aggressorId);
      agg.allies = agg.allies.filter((id) => id !== allyId);
      const nextNapAlly = { ...ally.nonAggressionWith };
      delete nextNapAlly[aggressorId];
      ally.nonAggressionWith = nextNapAlly;
      const nextNapAgg = { ...agg.nonAggressionWith };
      delete nextNapAgg[allyId];
      agg.nonAggressionWith = nextNapAgg;
      calledAllies.push(ally.displayName);
    }

    if (calledAllies.length > 0) {
      const now = Date.now();
      const msg =
        lang === 'pl'
          ? `Artykuł 5! Sojusznicy ${def.displayName} (${calledAllies.slice(0, 3).join(', ')}) przystąpili do wojny!`
          : `Article 5 Collective Defense! ${def.displayName}'s allies (${calledAllies.slice(0, 3).join(', ')}) joined the war!`;
      notifications.unshift({
        id: `notif_art5_${now}`,
        type: 'war',
        title: lang === 'pl' ? 'Obrona Zbiorowa (Art. 5)' : 'Article 5 Coalition Activated',
        message: msg,
        createdAt: now,
      });
      chronicle.unshift({
        id: `chr_art5_${state.totalDays}_${now}`,
        turn: state.turn,
        day: state.day,
        year: state.year,
        monthIndex: state.monthIndex,
        type: 'war',
        title: lang === 'pl' ? 'Sojusz Art. 5 Aktywowany' : 'Article 5 Collective Defense',
        detail: msg,
        countryIds: [aggressorId, defenderId],
      });
    }
  }
}

interface EventTemplate {
  id: string;
  isClimateEvent?: boolean;
  title: Record<'en' | 'pl', string>;
  description: Record<'en' | 'pl', string>;
  choices: Array<{
    id: string;
    label: Record<'en' | 'pl', string>;
    treasuryDelta?: number;
    stabilityDelta?: number;
    manpowerDelta?: number;
    researchDelta?: number;
    goldenAgeDays?: number;
    climateDelta?: number;
    provinceEconomyDelta?: number;
    weatherShift?: WeatherKind;
  }>;
}

const RANDOM_EVENTS_POOL: EventTemplate[] = [
  {
    id: 'boom',
    title: { en: 'Industrial Boom', pl: 'Boom Przemysłowy' },
    description: {
      en: 'New strategic investments accelerate your economy and treasury.',
      pl: 'Nowe inwestycje strategiczne przyspieszają wzrost gospodarki i skarbca.',
    },
    choices: [
      {
        id: 'tax_boost',
        label: { en: 'Fund Treasury (+24 PLN)', pl: 'Zasil Skarbiec (+24 PLN)' },
        treasuryDelta: 24,
      },
      {
        id: 'tech_grant',
        label: { en: 'Research Grant (+22 RP, +3% Stab.)', pl: 'Grant Badawczy (+22 PB, +3% Stab.)' },
        researchDelta: 22,
        stabilityDelta: 3,
      },
    ],
  },
  {
    id: 'golden_renaissance',
    title: { en: 'Scientific & Cultural Golden Age', pl: 'Złoty Wiek Nauki i Gospodarki' },
    description: {
      en: 'Citizen optimism and breakthroughs spark a national Golden Age.',
      pl: 'Optymizm obywateli i przełomy technologiczne otwierają Złoty Wiek.',
    },
    choices: [
      {
        id: 'proclaim_golden',
        label: { en: 'Proclaim Golden Age (90 days, +20% Eco)', pl: 'Ogłoś Złoty Wiek (90 dni, +20% Gosp.)' },
        goldenAgeDays: 90,
        stabilityDelta: 4,
      },
      {
        id: 'enlist',
        label: { en: 'Volunteer Surge (+15,000 Manpower)', pl: 'Fala Ochotników (+15 000 Zasobów)' },
        manpowerDelta: 15000,
      },
    ],
  },
  {
    id: 'diplomatic_summit',
    title: { en: 'APEX Technology Summit', pl: 'Szczyt Technologiczny APEX' },
    description: {
      en: 'An international innovation summit opens access to modern logistics.',
      pl: 'Międzynarodowe targi innowacji otwierają dostęp do nowej logistyki.',
    },
    choices: [
      {
        id: 'invest_rd',
        label: { en: 'Modernize R&D (-10 PLN, +32 RP)', pl: 'Modernizacja B+R (-10 PLN, +32 PB)' },
        treasuryDelta: -10,
        researchDelta: 32,
      },
      {
        id: 'trade_fair',
        label: { en: 'Trade Fair (+18 PLN, +6,000 Manpower)', pl: 'Targi Handlowe (+18 PLN, +6 000 Zasobów)' },
        treasuryDelta: 18,
        manpowerDelta: 6000,
      },
    ],
  },
  {
    id: 'harvest_crisis',
    title: { en: 'Global Market Volatility', pl: 'Wahania Rynkowe' },
    description: {
      en: 'Commodity market turbulence calls for decisive government action.',
      pl: 'Zawirowania na rynkach surowców wymagają interwencji rządu.',
    },
    choices: [
      {
        id: 'subsidize',
        label: { en: 'Relief Package (-12 PLN, +6% Stab.)', pl: 'Pakiet Osłonowy (-12 PLN, +6% Stab.)' },
        treasuryDelta: -12,
        stabilityDelta: 6,
      },
      {
        id: 'austerity',
        label: { en: 'Emergency Reserve (+12 PLN, -4% Stab.)', pl: 'Rezerwa Kryzysowa (+12 PLN, -4% Stab.)' },
        treasuryDelta: 12,
        stabilityDelta: -4,
      },
    ],
  },
];

const CLIMATE_EVENTS_POOL: EventTemplate[] = [
  {
    id: 'coastal_surge',
    isClimateEvent: true,
    title: { en: 'Climate Shock: Coastal Storm Surge', pl: 'Szok Klimatyczny: Sztormowe Wezbranie' },
    description: {
      en: 'Rising sea levels and warm ocean currents batter coastal logistics in {PROV}.',
      pl: 'Podnoszący się poziom mórz i gwałtowne prądy zagrażają infrastrukturze w prowincji {PROV}.',
    },
    choices: [
      {
        id: 'seawall',
        label: { en: 'Build Tide Barriers (-14 PLN, -4 Warming, +0.4 Eco)', pl: 'Zbuduj Wały (-14 PLN, -4 Ociepl., +0.4 Gosp.)' },
        treasuryDelta: -14,
        climateDelta: -4,
        provinceEconomyDelta: 0.4,
        weatherShift: 'rain',
      },
      {
        id: 'evacuate_coast',
        label: { en: 'Emergency Evacuation (+4 Warming, -0.5 Eco)', pl: 'Ewakuacja doraźna (+4 Ociepl., -0.5 Gosp.)' },
        climateDelta: 4,
        provinceEconomyDelta: -0.5,
        stabilityDelta: -2,
        weatherShift: 'rain',
      },
    ],
  },
  {
    id: 'mega_drought',
    isClimateEvent: true,
    title: { en: 'Climate Shock: Continental Heatwave & Drought', pl: 'Szok Klimatyczny: Susza Kontynentalna' },
    description: {
      en: 'Severe thermal anomalies strain water supply and harvests across {PROV}.',
      pl: 'Fala upałów i suszy uderza w plony oraz logistykę w prowincji {PROV}.',
    },
    choices: [
      {
        id: 'agri_desal',
        label: { en: 'Smart Irrigation Grid (-12 PLN, -3 Warming, +18 RP)', pl: 'Sieć Nawadniania (-12 PLN, -3 Ociepl., +18 PB)' },
        treasuryDelta: -12,
        climateDelta: -3,
        researchDelta: 18,
        weatherShift: 'sunny',
      },
      {
        id: 'ration_grain',
        label: { en: 'Coal Peaker Override (+10 PLN, +5 Warming, -0.4 Eco)', pl: 'Awaryjne Elektrownie (+10 PLN, +5 Ociepl., -0.4 Gosp.)' },
        treasuryDelta: 10,
        climateDelta: 5,
        provinceEconomyDelta: -0.4,
        weatherShift: 'fog',
      },
    ],
  },
  {
    id: 'clean_fusion_pact',
    isClimateEvent: true,
    title: { en: 'Green Grid Transition Initiative', pl: 'Inicjatywa Czystej Transformacji Energii' },
    description: {
      en: 'Scientists in {PROV} propose zero-carbon industrial retrofits to cool planetary warming.',
      pl: 'Inżynierowie z prowincji {PROV} proponują dekarbonizację przemysłu i obniżenie emisji.',
    },
    choices: [
      {
        id: 'fund_clean',
        label: { en: 'Deploy Zero-Carbon Grid (-15 PLN, -7 Warming, +24 RP)', pl: 'Wdróż Czystą Sieć (-15 PLN, -7 Ociepl., +24 PB)' },
        treasuryDelta: -15,
        climateDelta: -7,
        researchDelta: 24,
        provinceEconomyDelta: 0.6,
      },
      {
        id: 'heavy_industry',
        label: { en: 'Expand Heavy Industry (+20 PLN, +6 Warming)', pl: 'Rozbuduj Przemysł Ciężki (+20 PLN, +6 Ociepl.)' },
        treasuryDelta: 20,
        climateDelta: 6,
      },
    ],
  },
];

function buildPendingEvent(
  turn: number,
  lang: Language,
  targetProvince?: ProvinceState,
  forceClimate = false,
): PendingRandomEvent {
  const useClimate = forceClimate || (Boolean(targetProvince) && turn % 2 === 0);
  const pool = useClimate ? CLIMATE_EVENTS_POOL : RANDOM_EVENTS_POOL;
  const tpl = pool[((turn / 3) | 0) % pool.length];
  const lk: 'en' | 'pl' = lang === 'en' ? 'en' : 'pl';
  const provName = targetProvince?.name ?? 'Capital Sector';
  return {
    id: `${tpl.id}_${turn}`,
    title: tpl.title[lk],
    description: tpl.description[lk].replace('{PROV}', provName),
    isClimateEvent: Boolean(tpl.isClimateEvent),
    targetProvinceId: tpl.isClimateEvent ? targetProvince?.id : undefined,
    targetProvinceName: tpl.isClimateEvent ? provName : undefined,
    choices: tpl.choices.map((c) => ({
      id: c.id,
      label: c.label[lk],
      treasuryDelta: c.treasuryDelta,
      stabilityDelta: c.stabilityDelta,
      manpowerDelta: c.manpowerDelta,
      researchDelta: c.researchDelta,
      goldenAgeDays: c.goldenAgeDays,
      climateDelta: c.climateDelta,
      provinceEconomyDelta: c.provinceEconomyDelta,
      weatherShift: c.weatherShift,
    })),
  };
}

export interface NewGameV4Options {
  aiAggressiveness?: AiAggressiveness;
  uiMode?: UiMode;
  peacefulStartEnabled?: boolean;
  customNation?: CustomNationConfig | null;
}

export function createNewGame(
  scenarioId: ScenarioId,
  playerCountryId: string,
  difficultyOrLang: DifficultyId | Language = 'normal',
  langArg: Language = 'en',
  gameMode: GameMode = 'player',
  customScenario?: CustomScenarioConfig | null,
  v4Options?: NewGameV4Options,
): GameState {
  const isLangArg =
    difficultyOrLang === 'pl' ||
    difficultyOrLang === 'en' ||
    difficultyOrLang === 'szl' ||
    difficultyOrLang === 'csb';
  const difficulty: DifficultyId = isLangArg ? 'normal' : difficultyOrLang;
  const lang: Language = isLangArg ? difficultyOrLang : langArg;
  const customNation = gameMode === 'player' ? v4Options?.customNation ?? null : null;
  const effectivePlayerId =
    gameMode === 'bot_spectator'
      ? '__SPECTATOR__'
      : customNation
      ? customNation.id
      : playerCountryId;
  const aiAggressiveness: AiAggressiveness = v4Options?.aiAggressiveness ?? 'normal';
  const uiMode: UiMode = v4Options?.uiMode ?? 'extended';
  const peacefulStartEnabled = v4Options?.peacefulStartEnabled ?? true;

  const mapData = buildWorldMapData();
  const scenario = SCENARIOS[scenarioId];
  const diffConfig = getDifficultyConfig(difficulty);
  const initialSeason = getSeasonFromMonth(scenario.startMonthIndex);

  const countries: Record<string, CountryState> = {};
  const provinces: Record<string, ProvinceState> = {};

  const ownerForOrig = (origId: string): string => {
    return scenario.territoryTransfers?.[origId] ?? origId;
  };

  for (const [id, meta] of Object.entries(mapData.countryMetas)) {
    const absorbed = Boolean(
      scenario.territoryTransfers?.[id] && scenario.territoryTransfers[id] !== id,
    );
    const displayName = scenario.countryNameOverrides?.[id] ?? meta.name[lang];

    const estArmy =
      (scenario.strengthOverrides?.[id] ??
        Math.round((meta.startingArmy2026 ?? 15000) * scenario.armyScale)) *
      (customScenario?.armyMultipliers?.[id] ?? 1);
    const isPlayerNation = gameMode === 'player' && id === effectivePlayerId;
    const rawTreasury =
      customScenario?.treasuryOverrides?.[id] ??
      Math.max(
        22,
        Math.round(18 + (meta.gdpFactor ?? 1) * 18 + Math.min(75, estArmy / 2800)),
      );
    const baseTreasury =
      !isPlayerNation && gameMode === 'player'
        ? Math.max(12, Math.round(rawTreasury * diffConfig.aiStartBudgetMult))
        : rawTreasury;
    const isWorldConquestPlayer = isPlayerNation && difficulty === 'world_conquest';
    const finalStartTreasury = isWorldConquestPlayer ? Math.max(baseTreasury * 2.4, 240) : baseTreasury;
    const demo = getCountryDemographics(id);

    countries[id] = {
      id,
      name: meta.name,
      displayName,
      capitalName: meta.provinceNames?.[0] ?? meta.name[lang],
      color: meta.color,
      flag: meta.flag,
      treasury: Math.round(finalStartTreasury),
      manpower: Math.max(18000, Math.round(estArmy * (isWorldConquestPlayer ? 1.8 : 0.65))),
      maxManpower: Math.max(40000, Math.round(estArmy * (isWorldConquestPlayer ? 3.0 : 1.8))),
      researchPoints: isWorldConquestPlayer ? 75 : 25,
      stability: isWorldConquestPlayer ? 100 : 92,
      taxRate: 18,
      budgetSliders: {
        taxRate: 18,
        goodsSpending: 8,
        investmentsSpending: 6,
        researchSpending: 8,
        militarySpending: 100,
      },
      loans: [],
      movementPoints: isWorldConquestPlayer ? 16 : 8,
      maxMovementPoints: isWorldConquestPlayer ? 16 : 8,
      diplomacyPoints: isWorldConquestPlayer ? 8 : 5,
      maxDiplomacyPoints: isWorldConquestPlayer ? 8 : 5,
      tech: isWorldConquestPlayer ? { military: 2, economy: 2, logistics: 3 } : { military: 0, economy: 0, logistics: 0 },
      unlockedTechs: isWorldConquestPlayer ? ['log_supply'] : [],
      techQueue: [],
      ideology: scenario.isModern ? 'democracy' : 'monarchy',
      nextElectionDay: 360,
      cabinet: { defense: null, finance: null, science: null, intelligence: null },
      stockpiles: { energy: 10, steel: 10, rare_earths: 4, grain: 14 },
      nuclearWarheads: 0,
      orbitalShieldActive: false,
      goldenAgeDaysLeft: isWorldConquestPlayer ? 120 : 0,
      megaprojects: [],
      spaceColonies: [],
      allies: [],
      atWarWith: [],
      nonAggressionWith: {},
      militaryAccessWith: [],
      truceWith: {},
      relations: {},
      guarantees: [],
      sanctionedBy: [],
      lendLeaseTo: [],
      vassalOf: null,
      vassals: [],
      vassalTributePct: 22,
      spiedUntil: 0,
      isPlayer: gameMode === 'player' && id === effectivePlayerId,
      eliminated: absorbed,
      generals: [generateGeneralForCountry(id, 'infantry', 1)],
      religion: demo.religion,
      religionAdherence: demo.adherence,
      culture: demo.culture,
      legacyPoints: 20,
      unlockedLegacyPerks: [],
      reformedEmpireId: null,
      resurrectedFaithId: null,
    };
  }

  // Inject Custom Nation entry if configured
  if (customNation && customNation.provinceIds.length > 0) {
    const cId = customNation.id;
    countries[cId] = {
      id: cId,
      name: { en: customNation.name, pl: customNation.name, szl: customNation.name, csb: customNation.name },
      displayName: customNation.name,
      capitalName: customNation.capitalName,
      color: customNation.colorHex,
      flag: customNation.flag,
      treasury: 95,
      manpower: 65000,
      maxManpower: 180000,
      researchPoints: 35,
      stability: 94,
      taxRate: 18,
      budgetSliders: {
        taxRate: 18,
        goodsSpending: 8,
        investmentsSpending: 6,
        researchSpending: 8,
        militarySpending: 100,
      },
      loans: [],
      movementPoints: 10,
      maxMovementPoints: 10,
      diplomacyPoints: 6,
      maxDiplomacyPoints: 6,
      tech: { military: 1, economy: 1, logistics: 1 },
      unlockedTechs: [],
      techQueue: [],
      ideology: customNation.ideology,
      nextElectionDay: 360,
      cabinet: { defense: null, finance: null, science: null, intelligence: null },
      stockpiles: { energy: 14, steel: 14, rare_earths: 6, grain: 18 },
      nuclearWarheads: 0,
      orbitalShieldActive: false,
      goldenAgeDaysLeft: 0,
      megaprojects: [],
      spaceColonies: [],
      allies: [],
      atWarWith: [],
      nonAggressionWith: {},
      militaryAccessWith: [],
      truceWith: {},
      relations: {},
      guarantees: [],
      sanctionedBy: [],
      lendLeaseTo: [],
      vassalOf: null,
      vassals: [],
      vassalTributePct: 22,
      spiedUntil: 0,
      isPlayer: true,
      eliminated: false,
      generals: [generateGeneralForCountry(cId, 'armor', 1)],
      religion: customNation.religion,
      religionAdherence: 88,
      culture: customNation.culture,
      legacyPoints: 30,
      unlockedLegacyPerks: [],
      reformedEmpireId: null,
      resurrectedFaithId: null,
    };
  }

  const customProvSet = new Set(customNation?.provinceIds ?? []);

  const provsByOwner: Record<string, typeof mapData.provinces> = {};
  for (const geom of mapData.provinces) {
    const baseOwner = ownerForOrig(geom.countryOrigId);
    const finalOwner =
      customNation && customProvSet.has(geom.id)
        ? customNation.id
        : customScenario?.provinceOwnerOverrides?.[geom.id] ?? baseOwner;
    if (!provsByOwner[finalOwner]) provsByOwner[finalOwner] = [];
    provsByOwner[finalOwner].push(geom);
  }

  let provIdx = 0;
  const popByOwner: Record<string, number> = {};

  for (const geom of mapData.provinces) {
    const meta = mapData.countryMetas[geom.countryOrigId];
    const baseOwner = ownerForOrig(geom.countryOrigId);
    const ownerId =
      customNation && customProvSet.has(geom.id)
        ? customNation.id
        : customScenario?.provinceOwnerOverrides?.[geom.id] ?? baseOwner;
    const ownerMeta = mapData.countryMetas[ownerId] ?? meta;
    const ownerProvs = provsByOwner[ownerId] ?? [geom];
    const isCapital = ownerProvs[0]?.id === geom.id;

    if (countries[ownerId]) countries[ownerId].eliminated = false;

    const baselineArmy =
      customNation && ownerId === customNation.id
        ? Math.max(45000, customNation.provinceIds.length * 16000)
        : (scenario.strengthOverrides?.[ownerId] ??
            Math.round((ownerMeta.startingArmy2026 ?? 15000) * scenario.armyScale)) *
          (customScenario?.armyMultipliers?.[ownerId] ?? 1);

    const provWeight = isCapital ? 1.35 : 0.9;
    const totalWeight =
      ownerProvs.reduce((acc, _p, idx) => acc + (idx === 0 ? 1.35 : 0.9), 0) || 1;
    const provArmy = Math.max(1000, Math.round((baselineArmy * provWeight) / totalWeight));

    const units: UnitBreakdown = {};
    if (scenario.isModern) {
      units.infantry = Math.round(provArmy * 0.56);
      units.tanks = Math.round(provArmy * 0.18);
      units.rocket_artillery = Math.round(provArmy * 0.11);
      units.anti_air = Math.round(provArmy * 0.08);
      units.aviation = Math.max(
        0,
        provArmy - (units.infantry + units.tanks + units.rocket_artillery + units.anti_air),
      );
    } else {
      units.infantry = Math.round(provArmy * 0.55);
      units.archers = Math.round(provArmy * 0.22);
      units.cavalry = Math.round(provArmy * 0.15);
      units.artillery = Math.max(
        0,
        provArmy - (units.infantry + units.archers + units.cavalry),
      );
    }

    const ownerProvCount = Math.max(1, ownerProvs.length);
    const baseCountryIncome = 15.0 + (ownerMeta.gdpFactor ?? 1) * 6.5;
    const provEconomy = Number((baseCountryIncome / ownerProvCount).toFixed(2));
    const provArea = geom.explicitAreaKm2
      ? geom.explicitAreaKm2
      : Math.max(100, Math.round(meta.areaKm2 * geom.areaShare));
    const provPop = geom.popShare
      ? Math.max(20000, Math.round(meta.populationM * 1_000_000 * geom.popShare))
      : Math.max(20000, Math.round(meta.populationM * 1_000_000 * geom.areaShare));

    popByOwner[ownerId] = (popByOwner[ownerId] ?? 0) + provPop;

    const provWeather = computeProvinceWeather(geom.centroid, initialSeason, 1, provIdx);
    const initialWarming = scenario.isModern ? 28 : 8;
    const provTempC = computeProvinceTemperatureC({
      centroid: geom.centroid,
      season: initialSeason,
      weather: provWeather,
      globalWarmingIndex: initialWarming,
      nuclearWinterLevel: 0,
      provSeedIndex: provIdx,
      totalDays: 1,
    });
    provIdx++;

    const demo =
      customNation && ownerId === customNation.id
        ? {
            religion: customNation.religion,
            adherence: 88,
            culture: customNation.culture,
            resource: getCountryDemographics(geom.countryOrigId).resource,
          }
        : getCountryDemographics(geom.countryOrigId);

    const resolvedCapitalCity =
      customNation && ownerId === customNation.id && isCapital
        ? customNation.capitalName
        : geom.capitalCity ?? (isCapital ? meta.provinceNames?.[0] ?? ownerMeta.name[lang] : undefined);

    provinces[geom.id] = {
      id: geom.id,
      countryOrigId: geom.countryOrigId,
      name: geom.name,
      capitalCity: resolvedCapitalCity,
      ownerId,
      originalCountryId: geom.countryOrigId,
      areaKm2: provArea,
      population: provPop,
      economy: provEconomy,
      development: isCapital ? 2 : 1,
      happiness: 80,
      assimilationProgress: 100,
      religion: demo.religion,
      religionAdherence: demo.adherence,
      culture: demo.culture,
      resource: demo.resource,
      buildings: isCapital ? ['barracks'] : [],
      units,
      neighbors: mapData.neighbors[geom.id] ?? [],
      seaNeighbors: mapData.seaNeighbors[geom.id] ?? [],
      centroid: geom.centroid,
      isCapital,
      assimilated: true,
      weather: provWeather,
      temperatureC: provTempC,
      nuclearDevastation: 0,
      graffitiTag: null,
    };
  }

  // Eliminate any country left with 0 provinces after custom scenario/nation transfers
  for (const c of Object.values(countries)) {
    if ((provsByOwner[c.id]?.length ?? 0) === 0) c.eliminated = true;
  }

  for (const [cId, pop] of Object.entries(popByOwner)) {
    const c = countries[cId];
    if (!c || c.eliminated) continue;
    const estPopManpower = Math.round(pop * 0.015);
    const estPopMax = Math.round(pop * 0.045);
    c.manpower = Math.max(c.manpower, Math.min(2_500_000, estPopManpower));
    c.maxManpower = Math.max(c.manpower * 1.5, Math.min(6_000_000, estPopMax));
  }

  // Reconcile area rounding remainder on original country's first province so total km2 is exact
  if (!customScenario && !customNation) {
    const origGroups: Record<string, ProvinceState[]> = {};
    for (const p of Object.values(provinces)) {
      if (!origGroups[p.originalCountryId]) origGroups[p.originalCountryId] = [];
      origGroups[p.originalCountryId].push(p);
    }
    for (const [origId, list] of Object.entries(origGroups)) {
      const meta = mapData.countryMetas[origId];
      if (!meta || list.length === 0) continue;
      const sum = list.reduce((acc, p) => acc + p.areaKm2, 0);
      const diff = meta.areaKm2 - sum;
      if (diff !== 0) list[0].areaKm2 += diff;
    }
  }

  const alliancesToApply = customScenario ? customScenario.alliances : scenario.initialAlliances ?? [];
  const warsToApply = customScenario ? customScenario.wars : scenario.initialWars ?? [];

  for (const [a, b] of alliancesToApply) {
    if (countries[a] && countries[b] && !countries[a].eliminated && !countries[b].eliminated) {
      if (!countries[a].allies.includes(b)) countries[a].allies.push(b);
      if (!countries[b].allies.includes(a)) countries[b].allies.push(a);
      countries[a].relations[b] = 75;
      countries[b].relations[a] = 75;
    }
  }
  for (const [a, b] of warsToApply) {
    // Respect Peaceful Start & War Acceptance toggle for non-custom scenarios involving player
    if (
      !customScenario &&
      peacefulStartEnabled &&
      gameMode === 'player' &&
      (a === effectivePlayerId || b === effectivePlayerId)
    ) {
      continue;
    }
    if (countries[a] && countries[b] && !countries[a].eliminated && !countries[b].eliminated) {
      if (!countries[a].atWarWith.includes(b)) countries[a].atWarWith.push(b);
      if (!countries[b].atWarWith.includes(a)) countries[b].atWarWith.push(a);
      countries[a].relations[b] = -90;
      countries[b].relations[a] = -90;
    }
  }

  const startChronicle: ChronicleEntry = {
    id: `chr_init_${scenarioId}`,
    turn: 1,
    day: 1,
    year: scenario.startYear,
    monthIndex: scenario.startMonthIndex,
    type: 'event',
    title:
      lang === 'pl'
        ? `Początek epoki ${scenario.startYear}`
        : `Epoch ${scenario.startYear} Begins`,
    detail:
      gameMode === 'bot_spectator'
        ? lang === 'pl'
          ? 'Wszystkie państwa świata pod autonomicznym dowództwem AI.'
          : 'All world nations under autonomous AI command.'
        : `${countries[effectivePlayerId]?.displayName ?? ''} — ${
            lang === 'pl' ? 'kampania rozpoczęta.' : 'real-time campaign initiated.'
          }`,
    countryIds: gameMode === 'player' ? [effectivePlayerId] : [],
  };

  const waterAlerts = generateWaterAlerts(provinces, initialSeason, 1);
  const initialOwnersSnapshot: Record<string, string> = {};
  for (const p of Object.values(provinces)) initialOwnersSnapshot[p.id] = p.ownerId;

  const initialState: GameState = {
    gameMode,
    scenarioId,
    difficulty,
    aiAggressiveness,
    uiMode,
    peacefulStartEnabled,
    eternalEmpireMode: false,
    autoPilotEnabled: gameMode === 'player' && difficulty === 'auto_pilot',
    autoPilotLastAirliftAt: 0,
    autoPilotNextAirliftAt: gameMode === 'player' && difficulty === 'auto_pilot' ? Date.now() + 5000 : 0,
    comebackTriggeredCount: 0,
    lastComebackDay: -100,
    turn: 1,
    totalDays: 1,
    day: 1,
    monthIndex: scenario.startMonthIndex,
    year: scenario.startYear,
    season: initialSeason,
    simPaused: gameMode === 'player',
    simSpeed: 1,
    playerCountryId: effectivePlayerId,
    provinces,
    countries,
    orders: [],
    recentBattles: [],
    recentMissiles: [],
    mapPulses: [],
    airliftVisuals: [],
    graffitiVisuals: [],
    xpPopups: [],
    commanderXp: 0,
    commanderLevel: 1,
    commanderRankId: 'cadet',
    waterAlerts,
    nuclearWinterLevel: 0,
    globalWarmingIndex: scenario.isModern ? 28 : 8,
    customBlueprints: [],
    activeSatellites: [],
    blockadedStraits: {},
    worldCouncil: {
      activeResolutionId: WORLD_COUNCIL_RESOLUTIONS[0].id,
      yesVotes: 4,
      noVotes: 2,
      playerVoted: null,
      passedEffects: [],
      nextVoteDay: 60,
    },
    globalMarket: {
      prices: { ...COMMODITY_BASE_PRICES },
      trends: { energy: 'flat', steel: 'flat', rare_earths: 'up', grain: 'flat' },
    },
    timelapseSnapshots: [
      {
        totalDays: 1,
        year: scenario.startYear,
        monthIndex: scenario.startMonthIndex,
        owners: initialOwnersSnapshot,
      },
    ],
    chronicle: [startChronicle],
    pendingEvent: null,
    pendingWarPrompt: null,
    notifications: [],
    outcome: 'ongoing',
    peakAreaKm2: 0,
    warsWon: 0,
    battlesFought: 0,
    customNation,
  };

  const summaries = computeCountrySummaries(initialState);
  initialState.peakAreaKm2 = summaries[effectivePlayerId]?.areaKm2 ?? 0;

  return initialState;
}

export function getRecruitCost(
  state: GameState,
  provinceId: string,
  unitType: UnitType,
  count: number,
): number {
  const prov = state.provinces[provinceId];
  const country = prov ? state.countries[prov.ownerId] : undefined;
  const spec = getUnitSpec(state.scenarioId, unitType);
  const barracksDiscount = prov?.buildings.includes('barracks') ? 0.8 : 1.0;
  const logisticsDiscount = Math.max(0.65, 1 - (country?.tech.logistics ?? 0) * 0.08);
  return Number(((count / 1000) * spec.costPln * barracksDiscount * logisticsDiscount).toFixed(1));
}

export function recruitUnits(
  state: GameState,
  provinceId: string,
  unitType: UnitType,
  count: number,
): { state: GameState; error?: string } {
  const prov = state.provinces[provinceId];
  if (!prov || prov.ownerId !== state.playerCountryId) {
    return { state, error: 'Province is not under your command.' };
  }
  if (unitType === 'naval_fleet' && prov.seaNeighbors.length === 0 && !prov.buildings.includes('port')) {
    return { state, error: 'Naval Fleets require a coastal province or Port.' };
  }
  if (unitType === 'armored_train' && !prov.buildings.includes('railway')) {
    return { state, error: 'Armored Trains require a Strategic Railway in this province.' };
  }
  if (count < 500) {
    return { state, error: 'Minimum recruitment batch is 500 units.' };
  }
  const country = state.countries[state.playerCountryId];
  if (country.movementPoints < 1) {
    return { state, error: 'Not enough Movement Points (MP) — unpause to replenish.' };
  }
  if (country.manpower < count) {
    return {
      state,
      error: `Insufficient manpower reserves (${country.manpower.toLocaleString('en-US')}).`,
    };
  }
  const cost = getRecruitCost(state, provinceId, unitType, count);
  if (country.treasury < cost) {
    return { state, error: 'Insufficient treasury funds (PLN).' };
  }

  const nextCountry: CountryState = {
    ...country,
    treasury: Number((country.treasury - cost).toFixed(1)),
    manpower: Math.max(0, country.manpower - count),
    movementPoints: country.movementPoints - 1,
  };
  const nextProv: ProvinceState = {
    ...prov,
    units: {
      ...prov.units,
      [unitType]: (prov.units[unitType] ?? 0) + count,
    },
  };

  const now = Date.now();
  const pulse: MapPulseEvent = {
    id: `pulse_rec_${now}_${prov.id}`,
    kind: 'recruit',
    centroid: prov.centroid,
    color: '#22C55E',
    label: `+${count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}`,
    createdAt: now,
  };

  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: { ...state.countries, [country.id]: nextCountry },
        provinces: { ...state.provinces, [prov.id]: nextProv },
        mapPulses: [pulse, ...(state.mapPulses ?? [])].slice(0, 14),
      },
      6,
      'Unit Mobilization',
    ),
  };
}

export function constructBuilding(
  state: GameState,
  provinceId: string,
  buildingType: BuildingType,
): { state: GameState; error?: string } {
  const prov = state.provinces[provinceId];
  if (!prov || prov.ownerId !== state.playerCountryId) {
    return { state, error: 'Province does not belong to you.' };
  }
  if (prov.buildings.includes(buildingType)) {
    return { state, error: 'This building is already constructed here.' };
  }
  const country = state.countries[state.playerCountryId];
  if (buildingType === 'coastal_defense' && prov.seaNeighbors.length === 0) {
    return { state, error: 'Coastal Defense requires a coastal province.' };
  }
  if (buildingType === 'missile_silo' && !country.unlockedTechs.includes('mil_missiles')) {
    return { state, error: 'Research "Precision Ballistic Silos" in the Tech Tree first.' };
  }
  if (buildingType === 'spaceport' && !country.unlockedTechs.includes('eco_fusion')) {
    return { state, error: 'Research "Compact Fusion Reactors" in the Tech Tree first.' };
  }
  if (buildingType === 'nuclear_reactor' && !country.unlockedTechs.includes('eco_fusion')) {
    return { state, error: 'Research "Compact Fusion Reactors" in the Tech Tree first.' };
  }

  const cost = BUILDING_COSTS[buildingType];
  if (country.treasury < cost) {
    return { state, error: 'Insufficient treasury funds (PLN).' };
  }
  if (country.movementPoints < 1) {
    return { state, error: 'Not enough Movement Points (MP).' };
  }

  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: {
          ...state.countries,
          [country.id]: {
            ...country,
            treasury: Number((country.treasury - cost).toFixed(1)),
            movementPoints: country.movementPoints - 1,
          },
        },
        provinces: {
          ...state.provinces,
          [prov.id]: {
            ...prov,
            buildings: [...prov.buildings, buildingType],
          },
        },
      },
      10,
      `Constructed ${buildingType}`,
    ),
  };
}

export function assimilateProvince(
  state: GameState,
  provinceId: string,
): { state: GameState; error?: string } {
  const prov = state.provinces[provinceId];
  if (!prov || prov.ownerId !== state.playerCountryId) {
    return { state, error: 'Province does not belong to you.' };
  }
  if (prov.assimilated) {
    return { state, error: 'Province is already assimilated.' };
  }
  const player = state.countries[state.playerCountryId];
  const cost = 10;
  if (player.treasury < cost) {
    return { state, error: 'Assimilation requires 10 PLN.' };
  }

  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: {
          ...state.countries,
          [player.id]: {
            ...player,
            treasury: Number((player.treasury - cost).toFixed(1)),
            stability: Math.min(100, player.stability + 1),
          },
        },
        provinces: {
          ...state.provinces,
          [prov.id]: {
            ...prov,
            assimilated: true,
            assimilationProgress: 100,
          },
        },
      },
      12,
      `Assimilated ${prov.name}`,
    ),
  };
}

export function setTaxRate(state: GameState, taxRate: number): GameState {
  const player = state.countries[state.playerCountryId];
  if (!player) return state;
  const clamped = Math.max(5, Math.min(45, Math.round(taxRate)));
  return {
    ...state,
    countries: {
      ...state.countries,
      [player.id]: {
        ...player,
        taxRate: clamped,
        budgetSliders: { ...player.budgetSliders, taxRate: clamped },
      },
    },
  };
}

export function takeBankLoan(
  state: GameState,
  principal: 60 | 150,
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };
  if (player.loans.length >= 3) {
    return { state, error: 'Maximum active loan limit (3) reached.' };
  }
  const totalRepay = Number((principal * 1.15).toFixed(1));
  const turns = 10;
  const perTurnPayment = Number((totalRepay / turns).toFixed(1));
  const newLoan: LoanRecord = {
    id: `loan_${state.totalDays}_${Date.now()}`,
    principal,
    remainingTotal: totalRepay,
    perTurnPayment,
    turnsLeft: turns,
  };

  return {
    state: {
      ...state,
      countries: {
        ...state.countries,
        [player.id]: {
          ...player,
          treasury: Number((player.treasury + principal).toFixed(1)),
          loans: [...player.loans, newLoan],
        },
      },
    },
  };
}

export function repayLoan(
  state: GameState,
  loanId: string,
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };
  const loan = player.loans.find((l) => l.id === loanId);
  if (!loan) return { state, error: 'Loan not found.' };
  if (player.treasury < loan.remainingTotal) {
    return { state, error: 'Insufficient treasury to repay loan.' };
  }
  return {
    state: {
      ...state,
      countries: {
        ...state.countries,
        [player.id]: {
          ...player,
          treasury: Number((player.treasury - loan.remainingTotal).toFixed(1)),
          loans: player.loans.filter((l) => l.id !== loanId),
        },
      },
    },
  };
}

export function deploySpy(
  state: GameState,
  targetCountryId: string,
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  const target = state.countries[targetCountryId];
  if (!player || !target || target.id === player.id || target.eliminated) {
    return { state, error: 'Invalid espionage target.' };
  }
  const cost = player.cabinet.intelligence === 'min_int_shadow' ? 8 : 12;
  if (player.treasury < cost) {
    return { state, error: `Spy network costs ${cost} PLN.` };
  }
  if (player.diplomacyPoints < 1) {
    return { state, error: 'Not enough Diplomacy Points (DP).' };
  }
  const targetLabel = target.displayName || target.name[lang];
  const now = Date.now();
  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: {
          ...state.countries,
          [player.id]: {
            ...player,
            treasury: Number((player.treasury - cost).toFixed(1)),
            diplomacyPoints: player.diplomacyPoints - 1,
          },
          [target.id]: {
            ...target,
            spiedUntil: state.turn + 5,
          },
        },
        notifications: [
          {
            id: `notif_spy_${now}`,
            type: 'intel' as const,
            title: lang === 'pl' ? 'Szpieg wysłany' : 'Spy Network Active',
            message:
              lang === 'pl'
                ? `Ujawniono garnizony państwa ${targetLabel} na 5 m-cy.`
                : `Garrisons of ${targetLabel} revealed for 5 months.`,
            createdAt: now,
          },
          ...state.notifications,
        ].slice(0, 10),
      },
      12,
      `Spy Deployed (${targetLabel})`,
    ),
  };
}

export type BlackOpType = 'sabotage' | 'foment_rebels' | 'steal_tech' | 'graffiti_vandalism';

export function executeBlackOp(
  state: GameState,
  targetCountryId: string,
  op: BlackOpType,
  lang: Language = 'en',
  options?: { targetProvinceId?: string; customSlogan?: string },
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  const target = state.countries[targetCountryId];
  if (!player || !target || target.id === player.id || target.eliminated) {
    return { state, error: 'Invalid target nation.' };
  }
  const cost = op === 'steal_tech' ? 24 : op === 'graffiti_vandalism' ? 14 : 18;
  if (player.treasury < cost) return { state, error: `Black Op requires ${cost} PLN.` };
  if (player.diplomacyPoints < 1) return { state, error: 'Requires 1 Diplomacy Point (DP).' };

  const targetProvs = Object.values(state.provinces).filter((p) => p.ownerId === target.id);
  if (targetProvs.length === 0) return { state, error: 'Target has no provinces.' };

  const nextCountries = { ...state.countries };
  const nextProvs = { ...state.provinces };
  const nextPulses = [...(state.mapPulses ?? [])];
  const nextGraffiti = [...(state.graffitiVisuals ?? [])];
  const nextChronicle = [...state.chronicle];
  const now = Date.now();
  let message = '';

  if (op === 'sabotage') {
    const p = targetProvs[0];
    nextProvs[p.id] = {
      ...p,
      buildings: p.buildings.filter((b) => b !== 'fort'),
      units: scaleUnits(p.units, 0.88),
    };
    message =
      lang === 'pl'
        ? `Sabotaż w ${p.name} zniszczył umocnienia i 12% garnizonu.`
        : `Covert sabotage in ${p.name} disabled fortifications and weakened garrison by 12%.`;
  } else if (op === 'foment_rebels') {
    nextCountries[target.id] = {
      ...target,
      stability: Math.max(15, target.stability - 14),
    };
    const p = targetProvs[targetProvs.length - 1];
    nextProvs[p.id] = { ...p, assimilated: false, assimilationProgress: 40 };
    message =
      lang === 'pl'
        ? `Powstanie w ${p.name}: stabilność ${target.displayName} spadła o 14%.`
        : `Insurgency sparked in ${p.name}: ${target.displayName} stability dropped -14%.`;
  } else if (op === 'graffiti_vandalism') {
    const capProv =
      (options?.targetProvinceId && nextProvs[options.targetProvinceId]?.ownerId === target.id
        ? nextProvs[options.targetProvinceId]
        : undefined) ??
      targetProvs.find((p) => p.isCapital) ??
      targetProvs[0];
    const slogan = getCountryGraffitiSlogan(player.id, player.displayName, options?.customSlogan);
    const cityName = capProv.capitalCity || capProv.name;
    nextProvs[capProv.id] = {
      ...capProv,
      happiness: Math.max(20, (capProv.happiness ?? 80) - 10),
      graffitiTag: {
        slogan,
        attackerId: player.id,
        timestamp: now,
      },
    };
    const curRel = target.relations?.[player.id] ?? 0;
    nextCountries[target.id] = {
      ...target,
      stability: Math.max(15, target.stability - 8),
      relations: { ...target.relations, [player.id]: Math.max(-100, curRel - 25) },
    };
    nextGraffiti.unshift({
      id: `graf_${now}_${capProv.id}`,
      provinceId: capProv.id,
      cityName,
      attackerId: player.id,
      slogan,
      centroid: capProv.centroid,
      createdAt: now,
    });
    nextPulses.unshift({
      id: `pulse_graf_${now}`,
      kind: 'graffiti',
      centroid: capProv.centroid,
      color: player.color,
      label: slogan,
      createdAt: now,
    });
    message =
      lang === 'pl'
        ? `Tajna ekipa zostawiła napis „${slogan}” na murach w ${cityName} (-8% Stabilności ${target.displayName})!`
        : `Covert operatives painted "${slogan}" across ${cityName} walls (-8% ${target.displayName} Stability)!`;
    nextChronicle.unshift({
      id: `chr_graf_${state.totalDays}_${now}`,
      turn: state.turn,
      day: state.day,
      year: state.year,
      monthIndex: state.monthIndex,
      type: 'graffiti',
      title: lang === 'pl' ? 'Akcja Specjalna: Graffiti' : 'Covert Graffiti Operation',
      detail: `${player.displayName} → ${cityName}: "${slogan}"`,
      countryIds: [player.id, target.id],
    });
  } else {
    nextCountries[player.id] = {
      ...player,
      researchPoints: Number((player.researchPoints + 18).toFixed(1)),
    };
    message =
      lang === 'pl'
        ? `Wykradziono plany technologiczne (+18 PB).`
        : `Classified schematics extracted (+18 Research Points).`;
  }

  nextCountries[player.id] = {
    ...(nextCountries[player.id] ?? player),
    treasury: Number(((nextCountries[player.id] ?? player).treasury - cost).toFixed(1)),
    diplomacyPoints: (nextCountries[player.id] ?? player).diplomacyPoints - 1,
  };

  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: nextCountries,
        provinces: nextProvs,
        mapPulses: nextPulses.slice(0, 14),
        graffitiVisuals: nextGraffiti.slice(0, 16),
        chronicle: nextChronicle.slice(0, 120),
        notifications: [
          {
            id: `notif_blackop_${now}`,
            type: 'intel' as const,
            title:
              op === 'graffiti_vandalism'
                ? lang === 'pl'
                  ? 'Operacja Graffiti!'
                  : 'Covert Graffiti Strike!'
                : lang === 'pl'
                ? 'Operacja Specjalna'
                : 'Black Ops Executed',
            message,
            createdAt: now,
          },
          ...state.notifications,
        ].slice(0, 10),
      },
      op === 'graffiti_vandalism' ? 22 : 18,
      op === 'graffiti_vandalism' ? 'Covert Graffiti Raid' : 'Black Op Executed',
    ),
  };
}

export function issueArmyOrder(
  state: GameState,
  fromProvinceId: string,
  toProvinceId: string,
  units: UnitBreakdown,
): { state: GameState; error?: string } {
  const from = state.provinces[fromProvinceId];
  const to = state.provinces[toProvinceId];
  if (!from || !to) return { state, error: 'Invalid province.' };
  if (from.ownerId !== state.playerCountryId) return { state, error: 'You do not command this province.' };

  const isLandNeighbor = from.neighbors.includes(toProvinceId);
  const isSeaNeighbor = from.seaNeighbors.includes(toProvinceId);
  if (!isLandNeighbor && !isSeaNeighbor) {
    return { state, error: 'Destination must be an adjacent land or sea-lane province.' };
  }

  const player = state.countries[state.playerCountryId];
  const mpCost = 1 + WEATHER_EFFECTS[from.weather ?? 'sunny'].marchCostExtra;
  if (player.movementPoints < mpCost) {
    return {
      state,
      error:
        mpCost > 1
          ? `Blizzard in province requires ${mpCost} MP to march!`
          : 'Not enough Movement Points (MP).',
    };
  }

  const isSameOwner = to.ownerId === state.playerCountryId;
  const hasMilitaryAccess = player.militaryAccessWith.includes(to.ownerId);

  if (!isSameOwner && !hasMilitaryAccess && player.nonAggressionWith[to.ownerId]) {
    return {
      state,
      error: 'Non-Aggression Pact active with this nation!',
    };
  }

  const requestedTotal = getTotalUnits(units);
  if (requestedTotal <= 0) return { state, error: 'Select at least 1 unit.' };

  const clamped: UnitBreakdown = {};
  for (const [k, v] of Object.entries(units)) {
    const key = k as UnitType;
    const avail = from.units[key] ?? 0;
    const val = Math.min(avail, Math.round(v ?? 0));
    if (val > 0) clamped[key] = val;
  }
  if (getTotalUnits(clamped) <= 0) {
    return { state, error: 'No available units in this province.' };
  }

  const isAttack = !isSameOwner && !hasMilitaryAccess;
  const isNaval = !isLandNeighbor && isSeaNeighbor;
  const hasStormDelay =
    isNaval && state.waterAlerts.some((w) => w.affectedProvinceIds.includes(to.id));
  const isRail = !isNaval && (from.buildings.includes('railway') || to.buildings.includes('railway'));
  const baseDuration = Math.max(
    2,
    (isNaval ? 6 : 4) + (hasStormDelay ? 3 : 0) - Math.min(2, Math.floor(player.tech.logistics / 2)),
  );
  const durationDays = isRail ? Math.max(1, Math.ceil(baseDuration / 3)) : baseDuration;

  const nextCountries = { ...state.countries };
  const nextChronicle = [...state.chronicle];
  const nextNotifications = [...state.notifications];

  if (isAttack && !player.atWarWith.includes(to.ownerId)) {
    const targetCountry = nextCountries[to.ownerId];
    if (targetCountry) {
      nextCountries[player.id] = {
        ...player,
        movementPoints: player.movementPoints - mpCost,
        allies: player.allies.filter((id) => id !== targetCountry.id),
        atWarWith: [...player.atWarWith, targetCountry.id],
      };
      nextCountries[targetCountry.id] = {
        ...targetCountry,
        allies: targetCountry.allies.filter((id) => id !== player.id),
        atWarWith: targetCountry.atWarWith.includes(player.id)
          ? targetCountry.atWarWith
          : [...targetCountry.atWarWith, player.id],
      };
      triggerArticle5AndBreakPacts(
        state,
        nextCountries,
        player.id,
        targetCountry.id,
        'en',
        nextChronicle,
        nextNotifications,
      );
      nextChronicle.unshift({
        id: `chr_war_ord_${state.totalDays}_${Date.now()}`,
        turn: state.turn,
        day: state.day,
        year: state.year,
        monthIndex: state.monthIndex,
        type: 'war',
        title: 'War Outbreak',
        detail: `${player.displayName} ⚔️ ${targetCountry.displayName}`,
        countryIds: [player.id, targetCountry.id],
      });
    }
  } else {
    nextCountries[player.id] = {
      ...player,
      movementPoints: player.movementPoints - mpCost,
    };
  }

  const order: ArmyOrder = {
    id: `ord_${state.totalDays}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    countryId: state.playerCountryId,
    fromProvinceId,
    toProvinceId,
    units: clamped,
    isAttack,
    isNaval,
    isRail,
    startDay: state.totalDays,
    durationDays,
    progress: 0,
  };

  return {
    state: {
      ...state,
      countries: nextCountries,
      provinces: {
        ...state.provinces,
        [fromProvinceId]: {
          ...from,
          units: subtractUnits(from.units, clamped),
        },
      },
      orders: [...state.orders, order],
      notifications: nextNotifications.slice(0, 10),
      chronicle: nextChronicle.slice(0, 120),
    },
  };
}

export function cancelOrder(state: GameState, orderId: string): GameState {
  const target = state.orders.find((o) => o.id === orderId);
  if (!target) return state;
  const from = state.provinces[target.fromProvinceId];
  const mpRefund = 1 + (from ? WEATHER_EFFECTS[from.weather ?? 'sunny'].marchCostExtra : 0);
  const player = state.countries[state.playerCountryId];
  if (!player) return state;

  const nextProvs = { ...state.provinces };
  if (from && from.ownerId === target.countryId) {
    nextProvs[from.id] = {
      ...from,
      units: addUnits(from.units, target.units),
    };
  }

  return {
    ...state,
    provinces: nextProvs,
    countries: {
      ...state.countries,
      [player.id]: {
        ...player,
        movementPoints: Math.min(player.maxMovementPoints, player.movementPoints + mpRefund),
      },
    },
    orders: state.orders.filter((o) => o.id !== orderId),
  };
}

// Legacy simple branch upgrade (still supported cleanly from ProvinceDock quick research)
export function spendResearch(
  state: GameState,
  branch: 'military' | 'economy' | 'logistics',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };
  const cost = 25;
  if (player.researchPoints < cost) {
    return { state, error: 'Requires 25 Research Points.' };
  }
  const nextTech = { ...player.tech, [branch]: player.tech[branch] + 1 };
  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: {
          ...state.countries,
          [player.id]: {
            ...player,
            researchPoints: player.researchPoints - cost,
            tech: nextTech,
            maxMovementPoints: 8 + nextTech.logistics,
          },
        },
      },
      20,
      `Research ${branch}`,
    ),
  };
}

// Visual Tech Tree Node Unlock
export function researchTechNode(
  state: GameState,
  nodeId: TechNodeId,
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };
  const def = TECH_NODE_MAP[nodeId];
  if (!def) return { state, error: 'Unknown technology node.' };
  if (player.unlockedTechs.includes(nodeId)) {
    return { state, error: 'Technology already unlocked.' };
  }
  if (!canUnlockTechNode(player.unlockedTechs, nodeId)) {
    return { state, error: 'Prerequisites not met yet — use Plan Path to queue them.' };
  }
  if (player.researchPoints < def.costRp) {
    return { state, error: `Requires ${def.costRp} Research Points.` };
  }

  const nextTech = {
    military: player.tech.military + (def.militaryLevelGain ?? 0),
    economy: player.tech.economy + (def.economyLevelGain ?? 0),
    logistics: player.tech.logistics + (def.logisticsLevelGain ?? 0),
  };

  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: {
          ...state.countries,
          [player.id]: {
            ...player,
            researchPoints: Number((player.researchPoints - def.costRp).toFixed(1)),
            tech: nextTech,
            maxMovementPoints: 8 + nextTech.logistics,
            unlockedTechs: [...player.unlockedTechs, nodeId],
            techQueue: player.techQueue.filter((q) => q !== nodeId),
            orbitalShieldActive:
              player.orbitalShieldActive || nodeId === 'log_orbital_shields',
          },
        },
      },
      25,
      `Researched ${def.title.en}`,
    ),
  };
}

export function planTechTreePath(
  state: GameState,
  targetNodeId: TechNodeId,
): { state: GameState; path: TechNodeId[] } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, path: [] };
  const chain = planTechResearchPath(player.unlockedTechs, targetNodeId);
  if (chain.length === 0) return { state, path: [] };

  let nextState: GameState = {
    ...state,
    countries: {
      ...state.countries,
      [player.id]: {
        ...player,
        techQueue: chain,
      },
    },
  };

  // Immediately unlock head of queue if affordable
  while (true) {
    const p = nextState.countries[nextState.playerCountryId];
    const nextId = p.techQueue[0];
    if (!nextId) break;
    const def = TECH_NODE_MAP[nextId];
    if (!def || !canUnlockTechNode(p.unlockedTechs, nextId) || p.researchPoints < def.costRp) {
      break;
    }
    const res = researchTechNode(nextState, nextId);
    if (res.error) break;
    nextState = res.state;
  }

  return { state: nextState, path: chain };
}

export function clearTechQueue(state: GameState): GameState {
  const player = state.countries[state.playerCountryId];
  if (!player) return state;
  return {
    ...state,
    countries: {
      ...state.countries,
      [player.id]: { ...player, techQueue: [] },
    },
  };
}

// Strategic Arsenal & Strikes
export function buildThermonuclearWarhead(
  state: GameState,
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };
  if (!player.unlockedTechs.includes('mil_thermonuclear')) {
    return { state, error: 'Research "Thermonuclear Deterrence" in the Tech Tree first.' };
  }
  const hasSilo = Object.values(state.provinces).some(
    (p) => p.ownerId === player.id && p.buildings.includes('missile_silo'),
  );
  if (!hasSilo) {
    return { state, error: 'Build a Missile Silo in any province first.' };
  }
  const cost = 55;
  if (player.treasury < cost) return { state, error: 'Requires 55 PLN.' };

  return {
    state: {
      ...state,
      countries: {
        ...state.countries,
        [player.id]: {
          ...player,
          treasury: Number((player.treasury - cost).toFixed(1)),
          nuclearWarheads: player.nuclearWarheads + 1,
        },
      },
    },
  };
}

export function launchStrategicStrike(
  state: GameState,
  targetProvinceId: string,
  isNuclear: boolean,
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  const target = state.provinces[targetProvinceId];
  if (!player || !target) return { state, error: 'Invalid target province.' };
  if (target.ownerId === player.id) return { state, error: 'Cannot strike own territory.' };

  const siloProv = Object.values(state.provinces).find(
    (p) => p.ownerId === player.id && p.buildings.includes('missile_silo'),
  );
  if (!siloProv) return { state, error: 'Requires at least one Missile Silo.' };

  if (isNuclear) {
    if (player.nuclearWarheads < 1) return { state, error: 'No Thermonuclear Warheads in arsenal.' };
  } else {
    if (player.treasury < 18) return { state, error: 'Cruise missile strike costs 18 PLN.' };
  }

  const targetOwner = state.countries[target.ownerId];
  const intercepted = Boolean(
    targetOwner?.orbitalShieldActive || targetOwner?.megaprojects?.includes('orbital_defense_grid'),
  );

  const nextCountries = { ...state.countries };
  const nextProvs = { ...state.provinces };

  nextCountries[player.id] = {
    ...player,
    treasury: isNuclear ? player.treasury : Number((player.treasury - 18).toFixed(1)),
    nuclearWarheads: isNuclear ? player.nuclearWarheads - 1 : player.nuclearWarheads,
    atWarWith: player.atWarWith.includes(target.ownerId)
      ? player.atWarWith
      : [...player.atWarWith, target.ownerId],
  };

  if (targetOwner && !targetOwner.atWarWith.includes(player.id)) {
    nextCountries[targetOwner.id] = {
      ...targetOwner,
      atWarWith: [...targetOwner.atWarWith, player.id],
    };
  }

  let nextWinter = state.nuclearWinterLevel;
  const now = Date.now();
  const visual: MissileStrikeVisual = {
    id: `msl_${now}`,
    fromCentroid: siloProv.centroid,
    toCentroid: target.centroid,
    isNuclear,
    intercepted,
    createdAt: now,
  };

  if (!intercepted) {
    nextProvs[target.id] = {
      ...target,
      units: scaleUnits(target.units, isNuclear ? 0.35 : 0.72),
      nuclearDevastation: isNuclear
        ? Math.min(100, (target.nuclearDevastation ?? 0) + 45)
        : target.nuclearDevastation,
    };
    if (isNuclear) {
      nextWinter = Math.min(100, state.nuclearWinterLevel + 18);
    }
  }

  const title = intercepted
    ? lang === 'pl'
      ? 'Tarcza Orbitalna Przechwyciła Atak!'
      : 'Orbital Shield Intercepted Strike!'
    : isNuclear
    ? lang === 'pl'
      ? 'Uderzenie Termojądrowe!'
      : 'Thermonuclear Impact!'
    : lang === 'pl'
    ? 'Uderzenie Rakietowe'
    : 'Ballistic Strike Hit';

  const detail = `${player.displayName} → ${target.name} (${intercepted ? 'INTERCEPTED' : 'HIT'})`;

  const strikePulse: MapPulseEvent = {
    id: `pulse_msl_${now}`,
    kind: 'nuclear',
    centroid: target.centroid,
    color: intercepted ? '#38BDF8' : isNuclear ? '#EF4444' : '#F97316',
    label: intercepted ? 'SHIELD' : isNuclear ? 'NUCLEAR' : 'STRIKE',
    createdAt: now,
  };

  return {
    state: {
      ...state,
      countries: nextCountries,
      provinces: nextProvs,
      nuclearWinterLevel: nextWinter,
      globalWarmingIndex: isNuclear && !intercepted ? Math.min(100, (state.globalWarmingIndex ?? 20) + 5) : state.globalWarmingIndex,
      recentMissiles: [visual, ...state.recentMissiles].slice(0, 6),
      mapPulses: [strikePulse, ...(state.mapPulses ?? [])].slice(0, 14),
      chronicle: [
        {
          id: `chr_msl_${now}`,
          turn: state.turn,
          day: state.day,
          year: state.year,
          monthIndex: state.monthIndex,
          type: 'nuclear' as const,
          title,
          detail,
          countryIds: [player.id, target.ownerId],
        },
        ...state.chronicle,
      ].slice(0, 120),
      notifications: [
        {
          id: `notif_msl_${now}`,
          type: (intercepted ? 'info' : 'war') as GameNotification['type'],
          title,
          message: detail,
          createdAt: now,
        },
        ...state.notifications,
      ].slice(0, 10),
    },
  };
}

// Cabinet, Ideology, World Council, Market, Megaprojects, Space & Ocean Agency
export function appointMinister(
  state: GameState,
  role: MinisterRole,
  ministerId: string,
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };
  const min = CABINET_MINISTERS.find((m) => m.id === ministerId && m.role === role);
  if (!min) return { state, error: 'Invalid minister.' };
  if (player.treasury < 8) return { state, error: 'Appointing a minister costs 8 PLN.' };

  return {
    state: {
      ...state,
      countries: {
        ...state.countries,
        [player.id]: {
          ...player,
          treasury: Number((player.treasury - 8).toFixed(1)),
          cabinet: { ...player.cabinet, [role]: ministerId },
        },
      },
    },
  };
}

export function changeIdeology(
  state: GameState,
  ideology: IdeologyId,
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };
  if (player.ideology === ideology) return { state };
  if (player.treasury < 15) return { state, error: 'Reform costs 15 PLN.' };

  return {
    state: {
      ...state,
      countries: {
        ...state.countries,
        [player.id]: {
          ...player,
          treasury: Number((player.treasury - 15).toFixed(1)),
          ideology,
          stability: Math.max(30, player.stability - 4),
        },
      },
    },
  };
}

export function voteWorldCouncil(
  state: GameState,
  vote: 'yes' | 'no',
): GameState {
  if (state.worldCouncil.playerVoted) return state;
  const resId = state.worldCouncil.activeResolutionId;
  const nextYes = state.worldCouncil.yesVotes + (vote === 'yes' ? 2 : 0);
  const nextNo = state.worldCouncil.noVotes + (vote === 'no' ? 2 : 0);
  const passed = nextYes > nextNo;

  const player = state.countries[state.playerCountryId];
  const nextCountries = { ...state.countries };
  let nextWinter = state.nuclearWinterLevel;

  if (passed && player) {
    if (resId === 'res_green_maritime') {
      nextCountries[player.id] = { ...player, stability: Math.min(100, player.stability + 4) };
    } else if (resId === 'res_nuclear_restraint') {
      nextWinter = Math.max(0, state.nuclearWinterLevel - 15);
      nextCountries[player.id] = { ...player, researchPoints: player.researchPoints + 10 };
    } else if (resId === 'res_space_charter') {
      nextCountries[player.id] = {
        ...player,
        researchPoints: player.researchPoints + 18,
        treasury: Number((player.treasury + 12).toFixed(1)),
      };
    }
  }

  return {
    ...state,
    countries: nextCountries,
    nuclearWinterLevel: nextWinter,
    worldCouncil: {
      ...state.worldCouncil,
      yesVotes: nextYes,
      noVotes: nextNo,
      playerVoted: vote,
      passedEffects: passed
        ? [...new Set([...state.worldCouncil.passedEffects, resId])]
        : state.worldCouncil.passedEffects,
    },
  };
}

export function tradeMarketResource(
  state: GameState,
  commodity: CommodityId,
  side: 'buy' | 'sell',
  qty = 5,
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };
  const unitPrice = state.globalMarket.prices[commodity];
  const totalValue = Number((unitPrice * qty).toFixed(1));

  if (side === 'buy') {
    if (player.treasury < totalValue) {
      return { state, error: `Requires ${totalValue} PLN.` };
    }
    return {
      state: {
        ...state,
        countries: {
          ...state.countries,
          [player.id]: {
            ...player,
            treasury: Number((player.treasury - totalValue).toFixed(1)),
            stockpiles: {
              ...player.stockpiles,
              [commodity]: (player.stockpiles[commodity] ?? 0) + qty,
            },
          },
        },
        globalMarket: {
          ...state.globalMarket,
          prices: {
            ...state.globalMarket.prices,
            [commodity]: Number(Math.min(45, unitPrice * 1.04).toFixed(2)),
          },
          trends: { ...state.globalMarket.trends, [commodity]: 'up' },
        },
      },
    };
  }

  if ((player.stockpiles[commodity] ?? 0) < qty) {
    return { state, error: `Not enough ${commodity} stockpile.` };
  }
  return {
    state: {
      ...state,
      countries: {
        ...state.countries,
        [player.id]: {
          ...player,
          treasury: Number((player.treasury + totalValue).toFixed(1)),
          stockpiles: {
            ...player.stockpiles,
            [commodity]: (player.stockpiles[commodity] ?? 0) - qty,
          },
        },
      },
      globalMarket: {
        ...state.globalMarket,
        prices: {
          ...state.globalMarket.prices,
          [commodity]: Number(Math.max(2, unitPrice * 0.96).toFixed(2)),
        },
        trends: { ...state.globalMarket.trends, [commodity]: 'down' },
      },
    },
  };
}

export function buildMegaproject(
  state: GameState,
  megaprojectId: MegaprojectId,
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };
  const def = MEGAPROJECTS.find((m) => m.id === megaprojectId);
  if (!def) return { state, error: 'Unknown megaproject.' };
  if (player.megaprojects.includes(megaprojectId)) return { state, error: 'Already constructed.' };
  if (!player.unlockedTechs.includes(def.requiredTech)) {
    return { state, error: `Requires Tech Tree node: ${TECH_NODE_MAP[def.requiredTech].title.en}` };
  }
  if (player.treasury < def.costPln) return { state, error: `Requires ${def.costPln} PLN.` };

  return {
    state: {
      ...state,
      countries: {
        ...state.countries,
        [player.id]: {
          ...player,
          treasury: Number((player.treasury - def.costPln).toFixed(1)),
          megaprojects: [...player.megaprojects, megaprojectId],
          maxMovementPoints:
            player.maxMovementPoints + (megaprojectId === 'transcontinental_rail' ? 2 : 0),
          orbitalShieldActive:
            player.orbitalShieldActive || megaprojectId === 'orbital_defense_grid',
        },
      },
    },
  };
}

export function fundSpaceOceanColony(
  state: GameState,
  nodeId: string,
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };
  const node = SPACE_OCEAN_NODES.find((n) => n.id === nodeId);
  if (!node) return { state, error: 'Unknown frontier node.' };
  if (player.spaceColonies.includes(nodeId)) return { state, error: 'Colony already operational.' };
  if (!player.unlockedTechs.includes(node.requiredTech)) {
    return {
      state,
      error: `Unlock "${TECH_NODE_MAP[node.requiredTech].title[lang]}" in the Tech Tree first.`,
    };
  }
  const hasSpaceport = Object.values(state.provinces).some(
    (p) => p.ownerId === player.id && p.buildings.includes('spaceport'),
  );
  if (!hasSpaceport && node.stage !== 'deep_ocean_europa') {
    return { state, error: 'Construct a Spaceport in one of your provinces first.' };
  }
  if (player.treasury < node.costPln) return { state, error: `Requires ${node.costPln} PLN.` };

  const now = Date.now();
  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: {
          ...state.countries,
          [player.id]: {
            ...player,
            treasury: Number((player.treasury - node.costPln).toFixed(1)),
            spaceColonies: [...player.spaceColonies, nodeId],
          },
        },
        chronicle: [
          {
            id: `chr_space_${now}`,
            turn: state.turn,
            day: state.day,
            year: state.year,
            monthIndex: state.monthIndex,
            type: 'space' as const,
            title: lang === 'pl' ? 'Ekspansja Kosmosu i Oceanów' : 'Frontier Colony Established',
            detail: `${player.displayName}: ${node.name[lang]}`,
            countryIds: [player.id],
          },
          ...state.chronicle,
        ].slice(0, 120),
      },
      50,
      `Colony: ${node.name.en}`,
    ),
  };
}

export type DiplomacyAction =
  | 'war'
  | 'alliance'
  | 'nap'
  | 'access'
  | 'ultimatum'
  | 'vassalize'
  | 'aid25'
  | 'aid50'
  | 'peace';

export function proposeDiplomacy(
  state: GameState,
  targetCountryId: string,
  action: DiplomacyAction,
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  const target = state.countries[targetCountryId];
  if (!player || !target || target.id === player.id || target.eliminated) {
    return { state, error: 'Invalid target nation.' };
  }
  if (player.diplomacyPoints < 1) {
    return { state, error: 'Not enough Diplomacy Points (DP).' };
  }

  const nextCountries = { ...state.countries };
  const nextNotifications: GameNotification[] = [...state.notifications];
  const nextChronicle: ChronicleEntry[] = [...state.chronicle];
  const now = Date.now();
  const targetLabel = target.displayName || target.name[lang];
  let xpGain = 0;
  let xpReason = '';

  if (action === 'war') {
    if (player.atWarWith.includes(target.id)) return { state, error: 'Already at war with this nation.' };
    const nextNapPlayer = { ...player.nonAggressionWith };
    delete nextNapPlayer[target.id];
    const nextNapTarget = { ...target.nonAggressionWith };
    delete nextNapTarget[player.id];

    nextCountries[player.id] = {
      ...player,
      diplomacyPoints: player.diplomacyPoints - 1,
      allies: player.allies.filter((id) => id !== target.id),
      militaryAccessWith: player.militaryAccessWith.filter((id) => id !== target.id),
      nonAggressionWith: nextNapPlayer,
      atWarWith: [...player.atWarWith, target.id],
    };
    nextCountries[target.id] = {
      ...target,
      allies: target.allies.filter((id) => id !== player.id),
      militaryAccessWith: target.militaryAccessWith.filter((id) => id !== player.id),
      nonAggressionWith: nextNapTarget,
      atWarWith: [...target.atWarWith, player.id],
    };
    triggerArticle5AndBreakPacts(
      state,
      nextCountries,
      player.id,
      target.id,
      lang,
      nextChronicle,
      nextNotifications,
    );
    nextNotifications.unshift({
      id: `notif_war_${now}`,
      type: 'war',
      title: lang === 'pl' ? 'Wypowiedziano wojnę' : 'War Declared',
      message: `${player.displayName} ⚔️ ${targetLabel}`,
      createdAt: now,
    });
    nextChronicle.unshift({
      id: `chr_war_${state.totalDays}_${now}`,
      turn: state.turn,
      day: state.day,
      year: state.year,
      monthIndex: state.monthIndex,
      type: 'war',
      title: lang === 'pl' ? 'Wypowiedziano wojnę' : 'War Declared',
      detail: `${player.displayName} ⚔️ ${targetLabel}`,
      countryIds: [player.id, target.id],
    });
    xpGain = 15;
    xpReason = `War Declared (${targetLabel})`;
  } else if (action === 'alliance') {
    if (player.atWarWith.includes(target.id)) {
      return { state, error: 'Cannot form an alliance while at war.' };
    }
    if (player.allies.includes(target.id)) {
      return { state, error: 'Already allied with this nation.' };
    }
    const summaries = computeCountrySummaries(state);
    const myArmy = summaries[player.id]?.totalArmy ?? 0;
    const targetArmy = summaries[target.id]?.totalArmy ?? 0;
    const accepted =
      player.stability >= 65 && (myArmy >= targetArmy * 0.25 || player.treasury >= 25);
    if (!accepted) {
      return {
        state,
        error: `${targetLabel} declined alliance (strengthen army or stability).`,
      };
    }
    nextCountries[player.id] = {
      ...player,
      diplomacyPoints: player.diplomacyPoints - 1,
      allies: [...player.allies, target.id],
      relations: { ...player.relations, [target.id]: Math.min(100, (player.relations?.[target.id] ?? 0) + 35) },
    };
    nextCountries[target.id] = {
      ...target,
      allies: [...target.allies, player.id],
      relations: { ...target.relations, [player.id]: Math.min(100, (target.relations?.[player.id] ?? 0) + 35) },
    };
    nextNotifications.unshift({
      id: `notif_ally_${now}`,
      type: 'alliance',
      title: lang === 'pl' ? 'Zawarto sojusz' : 'Alliance Signed',
      message: `${player.displayName} 🤝 ${targetLabel}`,
      createdAt: now,
    });
    nextChronicle.unshift({
      id: `chr_ally_${state.totalDays}_${now}`,
      turn: state.turn,
      day: state.day,
      year: state.year,
      monthIndex: state.monthIndex,
      type: 'alliance',
      title: lang === 'pl' ? 'Zawarto sojusz' : 'Alliance Signed',
      detail: `${player.displayName} 🤝 ${targetLabel}`,
      countryIds: [player.id, target.id],
    });
    xpGain = 24;
    xpReason = `Alliance Signed (${targetLabel})`;
  } else if (action === 'nap') {
    if (player.atWarWith.includes(target.id)) {
      return { state, error: 'Sign a peace treaty before signing a Non-Aggression Pact.' };
    }
    nextCountries[player.id] = {
      ...player,
      diplomacyPoints: player.diplomacyPoints - 1,
      nonAggressionWith: { ...player.nonAggressionWith, [target.id]: 8 },
    };
    nextCountries[target.id] = {
      ...target,
      nonAggressionWith: { ...target.nonAggressionWith, [player.id]: 8 },
    };
    nextNotifications.unshift({
      id: `notif_nap_${now}`,
      type: 'peace',
      title: lang === 'pl' ? 'Pakt o nieagresji (8 m-cy)' : 'Non-Aggression Pact (8 mo)',
      message: `${player.displayName} 🛡️ ${targetLabel}`,
      createdAt: now,
    });
    xpGain = 15;
    xpReason = 'Non-Aggression Pact';
  } else if (action === 'access') {
    if (player.atWarWith.includes(target.id)) {
      return { state, error: 'Cannot request military access during war.' };
    }
    if (player.militaryAccessWith.includes(target.id)) {
      return { state, error: 'Military access already active.' };
    }
    const accepted = player.allies.includes(target.id) || player.stability >= 70;
    if (!accepted) {
      return { state, error: `${targetLabel} declined military access.` };
    }
    nextCountries[player.id] = {
      ...player,
      diplomacyPoints: player.diplomacyPoints - 1,
      militaryAccessWith: [...player.militaryAccessWith, target.id],
    };
    nextNotifications.unshift({
      id: `notif_acc_${now}`,
      type: 'info',
      title: lang === 'pl' ? 'Dostęp wojskowy' : 'Military Access Granted',
      message: `${player.displayName} 🥾 ${targetLabel}`,
      createdAt: now,
    });
    xpGain = 10;
    xpReason = 'Military Access';
  } else if (action === 'ultimatum' || action === 'vassalize') {
    if (target.vassalOf === player.id) {
      return { state, error: `${targetLabel} is already your vassal.` };
    }
    const summaries = computeCountrySummaries(state);
    const myArmy = summaries[player.id]?.totalArmy ?? 0;
    const targetArmy = summaries[target.id]?.totalArmy ?? 0;
    const requiredRatio = action === 'ultimatum' ? 2.1 : 1.75;

    if (myArmy < targetArmy * requiredRatio) {
      if (action === 'ultimatum' && !player.atWarWith.includes(target.id)) {
        nextCountries[player.id] = {
          ...player,
          diplomacyPoints: player.diplomacyPoints - 1,
          atWarWith: [...player.atWarWith, target.id],
        };
        nextCountries[target.id] = {
          ...target,
          atWarWith: [...target.atWarWith, player.id],
        };
        triggerArticle5AndBreakPacts(
          state,
          nextCountries,
          player.id,
          target.id,
          lang,
          nextChronicle,
          nextNotifications,
        );
        nextNotifications.unshift({
          id: `notif_ult_war_${now}`,
          type: 'war',
          title: lang === 'pl' ? 'Ultimatum odrzucone — Wojna!' : 'Ultimatum Rejected — War!',
          message: `${targetLabel} refused to yield to ${player.displayName}!`,
          createdAt: now,
        });
        nextChronicle.unshift({
          id: `chr_ult_${state.totalDays}_${now}`,
          turn: state.turn,
          day: state.day,
          year: state.year,
          monthIndex: state.monthIndex,
          type: 'war',
          title: lang === 'pl' ? 'Wojna po ultimatum' : 'Ultimatum War',
          detail: `${player.displayName} ⚔️ ${targetLabel}`,
          countryIds: [player.id, target.id],
        });
      } else {
        return {
          state,
          error: `${targetLabel} refused — you need ~${requiredRatio}x military superiority.`,
        };
      }
    } else {
      nextCountries[player.id] = {
        ...player,
        diplomacyPoints: player.diplomacyPoints - 1,
        atWarWith: player.atWarWith.filter((id) => id !== target.id),
        vassals: player.vassals.includes(target.id)
          ? player.vassals
          : [...player.vassals, target.id],
      };
      nextCountries[target.id] = {
        ...target,
        atWarWith: target.atWarWith.filter((id) => id !== player.id),
        vassalOf: player.id,
      };
      nextNotifications.unshift({
        id: `notif_vas_${now}`,
        type: 'alliance',
        title: lang === 'pl' ? 'Nowy Wasal!' : 'Vassal Subjugated!',
        message: `${targetLabel} now pays ${target.vassalTributePct ?? 22}% tribute to ${player.displayName}.`,
        createdAt: now,
      });
      nextChronicle.unshift({
        id: `chr_vas_${state.totalDays}_${now}`,
        turn: state.turn,
        day: state.day,
        year: state.year,
        monthIndex: state.monthIndex,
        type: 'vassal',
        title: lang === 'pl' ? 'Hołd lenny' : 'Vassalization',
        detail: `${targetLabel} became a vassal of ${player.displayName}.`,
        countryIds: [player.id, target.id],
      });
      xpGain = 35;
      xpReason = `Vassal Subjugated (${targetLabel})`;
    }
  } else if (action === 'aid25' || action === 'aid50') {
    const fraction = action === 'aid25' ? 0.25 : 0.5;
    const amount = Number((player.treasury * fraction).toFixed(1));
    if (amount < 1) return { state, error: 'Treasury too low for financial aid.' };
    nextCountries[player.id] = {
      ...player,
      diplomacyPoints: player.diplomacyPoints - 1,
      treasury: Number((player.treasury - amount).toFixed(1)),
      relations: { ...player.relations, [target.id]: Math.min(100, (player.relations?.[target.id] ?? 0) + 20) },
    };
    nextCountries[target.id] = {
      ...target,
      treasury: Number((target.treasury + amount).toFixed(1)),
      relations: { ...target.relations, [player.id]: Math.min(100, (target.relations?.[player.id] ?? 0) + 20) },
    };
    nextNotifications.unshift({
      id: `notif_aid_${now}`,
      type: 'aid',
      title: lang === 'pl' ? 'Wysłano wsparcie' : 'Economic Aid Sent',
      message: `${amount} PLN → ${targetLabel}`,
      createdAt: now,
    });
    xpGain = 10;
    xpReason = 'Foreign Aid';
  } else if (action === 'peace') {
    if (!player.atWarWith.includes(target.id)) {
      return { state, error: 'Not at war with this nation.' };
    }
    const summaries = computeCountrySummaries(state);
    const myArmy = summaries[player.id]?.totalArmy ?? 0;
    const enemyArmy = summaries[target.id]?.totalArmy ?? 0;
    const peaceAccepted = myArmy >= enemyArmy * 0.45 || player.treasury >= 25;
    if (!peaceAccepted) {
      return {
        state,
        error: `${targetLabel} rejected peace — enemy advantage is too high!`,
      };
    }
    const indemnity = myArmy < enemyArmy ? Math.min(player.treasury, 18) : 0;
    nextCountries[player.id] = {
      ...player,
      diplomacyPoints: player.diplomacyPoints - 1,
      treasury: Number((player.treasury - indemnity).toFixed(1)),
      atWarWith: player.atWarWith.filter((id) => id !== target.id),
      truceWith: { ...player.truceWith, [target.id]: 4 },
    };
    nextCountries[target.id] = {
      ...target,
      treasury: Number((target.treasury + indemnity).toFixed(1)),
      atWarWith: target.atWarWith.filter((id) => id !== player.id),
      truceWith: { ...target.truceWith, [player.id]: 4 },
    };
    nextNotifications.unshift({
      id: `notif_peace_${now}`,
      type: 'peace',
      title: lang === 'pl' ? 'Podpisano pokój' : 'Peace Treaty Signed',
      message: `${player.displayName} 🕊️ ${targetLabel}`,
      createdAt: now,
    });
    nextChronicle.unshift({
      id: `chr_peace_${state.totalDays}_${now}`,
      turn: state.turn,
      day: state.day,
      year: state.year,
      monthIndex: state.monthIndex,
      type: 'peace',
      title: lang === 'pl' ? 'Traktat pokojowy' : 'Peace Treaty',
      detail: `${player.displayName} 🕊️ ${targetLabel}`,
      countryIds: [player.id, target.id],
    });
    xpGain = 25;
    xpReason = `Peace Treaty (${targetLabel})`;
  }

  let resultState: GameState = grantCommanderXp(
    {
      ...state,
      countries: nextCountries,
      notifications: nextNotifications.slice(0, 10),
      chronicle: nextChronicle.slice(0, 120),
    },
    xpGain,
    xpReason,
  );

  // Instant Auto-Pilot War Mobilization & Immediate 5-second Airlift Countdown!
  if (action === 'war' && resultState.autoPilotEnabled && resultState.gameMode === 'player') {
    const mob = runAutoPilotCommand(resultState, lang, { allowAirlift: false });
    resultState = {
      ...mob.state,
      autoPilotNextAirliftAt: Date.now() + 5000,
    };
  }

  return { state: resultState };
}

export function toggleAutoPilot(state: GameState): GameState {
  if (state.gameMode !== 'player') return state;
  const enabling = !state.autoPilotEnabled;
  return {
    ...state,
    autoPilotEnabled: enabling,
    autoPilotNextAirliftAt: enabling ? Date.now() + 5000 : 0,
  };
}

export function triggerAutoPilotAirliftNow(
  state: GameState,
  lang: Language = 'en',
): { state: GameState; summaryAction?: string; didAirlift: boolean } {
  if (!state.autoPilotEnabled || state.gameMode !== 'player' || state.outcome !== 'ongoing') {
    return { state, didAirlift: false };
  }
  const res = runAutoPilotCommand(state, lang, { allowAirlift: true });
  return {
    state: {
      ...res.state,
      autoPilotNextAirliftAt: Date.now() + 5000,
    },
    summaryAction: res.summaryAction,
    didAirlift: res.didAirlift,
  };
}

// VERSION 3.0 Custom Military Unit Designer
export function designCustomUnit(
  state: GameState,
  params: { name: string; category: CustomUnitCategory; armor: number; speed: number; firepower: number },
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };
  const cost = 18;
  if (player.treasury < cost) {
    return { state, error: `Designing a custom blueprint requires ${cost} PLN.` };
  }
  const trimmedName = params.name.trim().slice(0, 32) || 'APEX Prototype Mk.I';
  const bp: CustomUnitBlueprint = {
    id: `bp_${Date.now()}`,
    name: trimmedName,
    category: params.category,
    armor: Math.max(1, Math.min(10, Math.round(params.armor))),
    speed: Math.max(1, Math.min(10, Math.round(params.speed))),
    firepower: Math.max(1, Math.min(10, Math.round(params.firepower))),
    createdAt: Date.now(),
  };

  return {
    state: {
      ...state,
      countries: {
        ...state.countries,
        [player.id]: {
          ...player,
          treasury: Number((player.treasury - cost).toFixed(1)),
        },
      },
      customBlueprints: [bp, ...(state.customBlueprints ?? [])].slice(0, 8),
      notifications: [
        {
          id: `notif_bp_${bp.id}`,
          type: 'info' as const,
          title: lang === 'pl' ? 'Nowy Projekt Wojskowy' : 'Custom Blueprint Commissioned',
          message: `${bp.name} (ATK ${bp.firepower} · ARM ${bp.armor} · SPD ${bp.speed})`,
          createdAt: Date.now(),
        },
        ...state.notifications,
      ].slice(0, 10),
    },
  };
}

// VERSION 3.0 Orbital Spy Satellites (Reveals Fog of War & Orbits Target Nation)
export function launchSpySatellite(
  state: GameState,
  targetCountryId: string,
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  const target = state.countries[targetCountryId];
  if (!player || !target || target.eliminated || target.id === player.id) {
    return { state, error: 'Invalid satellite target nation.' };
  }
  const cost = 22;
  if (player.treasury < cost) {
    return { state, error: `Orbital Spy Satellite launch costs ${cost} PLN.` };
  }
  const targetCap =
    Object.values(state.provinces).find((p) => p.ownerId === target.id && p.isCapital) ??
    Object.values(state.provinces).find((p) => p.ownerId === target.id);
  if (!targetCap) return { state, error: 'Target nation controls no territory.' };

  const now = Date.now();
  const sat = {
    id: `sat_${now}_${target.id}`,
    ownerCountryId: player.id,
    targetCountryId: target.id,
    centroid: targetCap.centroid,
    expiresDay: state.totalDays + 90,
  };

  return {
    state: {
      ...state,
      countries: {
        ...state.countries,
        [player.id]: {
          ...player,
          treasury: Number((player.treasury - cost).toFixed(1)),
        },
        [target.id]: {
          ...target,
          spiedUntil: Math.max(target.spiedUntil, state.turn + 8),
        },
      },
      activeSatellites: [
        sat,
        ...(state.activeSatellites ?? []).filter((s) => s.targetCountryId !== target.id),
      ].slice(0, 10),
      mapPulses: [
        {
          id: `pulse_sat_${now}`,
          kind: 'airlift' as const,
          centroid: targetCap.centroid,
          color: '#38BDF8',
          label: '🛰️ ORBITAL SCAN',
          createdAt: now,
        },
        ...(state.mapPulses ?? []),
      ].slice(0, 14),
      notifications: [
        {
          id: `notif_sat_${now}`,
          type: 'intel' as const,
          title: lang === 'pl' ? 'Satelita Szpiegowski na Orbicie!' : 'Orbital Spy Satellite Active!',
          message:
            lang === 'pl'
              ? `Stały zwiad satelitarny nad ${target.displayName} (90 dni).`
              : `Continuous orbital reconnaissance sweeping ${target.displayName} (90 days).`,
          createdAt: now,
        },
        ...state.notifications,
      ].slice(0, 10),
    },
  };
}

// VERSION 3.0 Maritime Strait Blockades
export function toggleStraitBlockade(
  state: GameState,
  straitId: StraitBlockadeId,
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };

  const existingBlocker = state.blockadedStraits?.[straitId];
  if (existingBlocker === player.id) {
    const nextStraits = { ...(state.blockadedStraits ?? {}) };
    delete nextStraits[straitId];
    return {
      state: {
        ...state,
        blockadedStraits: nextStraits,
      },
    };
  }

  const hasFleetOrPort = Object.values(state.provinces).some(
    (p) =>
      p.ownerId === player.id &&
      ((p.units.naval_fleet ?? 0) >= 500 || p.buildings.includes('port')),
  );
  if (!hasFleetOrPort) {
    return { state, error: 'Blockading a strategic strait requires a Naval Port or Naval Fleet.' };
  }
  if (player.treasury < 15) {
    return { state, error: 'Deploying naval blockade squadron requires 15 PLN.' };
  }

  const strait = STRATEGIC_STRAITS.find((s) => s.id === straitId);
  const now = Date.now();
  const pt: [number, number] =
    (strait ? projectLonLat(strait.lon, strait.lat) : null) ?? [1200, 500];

  return {
    state: {
      ...state,
      countries: {
        ...state.countries,
        [player.id]: {
          ...player,
          treasury: Number((player.treasury - 15).toFixed(1)),
        },
      },
      blockadedStraits: {
        ...(state.blockadedStraits ?? {}),
        [straitId]: player.id,
      },
      mapPulses: [
        {
          id: `pulse_blk_${now}`,
          kind: 'battle' as const,
          centroid: pt,
          color: '#38BDF8',
          label: '⚓ BLOCKADE',
          createdAt: now,
        },
        ...(state.mapPulses ?? []),
      ].slice(0, 14),
      notifications: [
        {
          id: `notif_blk_${now}`,
          type: 'war' as const,
          title: lang === 'pl' ? 'Blokada Morska Cieśniny!' : 'Maritime Strait Blockaded!',
          message:
            lang === 'pl'
              ? `Flota zablokowała ${strait?.name.pl ?? straitId} (-35% handlu wrogów).`
              : `Navy sealed ${strait?.name.en ?? straitId} (-35% enemy wartime trade).`,
          createdAt: now,
        },
        ...state.notifications,
      ].slice(0, 10),
    },
  };
}

// VERSION 3.0 City & Province Reconstruction
export function reconstructProvinceCity(
  state: GameState,
  provinceId: string,
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  const prov = state.provinces[provinceId];
  if (!player || !prov || prov.ownerId !== player.id) {
    return { state, error: 'Province is not under your command.' };
  }
  const cost = 14;
  if (player.treasury < cost) {
    return { state, error: `City Reconstruction requires ${cost} PLN.` };
  }

  const now = Date.now();
  return {
    state: {
      ...state,
      countries: {
        ...state.countries,
        [player.id]: {
          ...player,
          treasury: Number((player.treasury - cost).toFixed(1)),
          stability: Math.min(100, player.stability + 2),
        },
      },
      provinces: {
        ...state.provinces,
        [prov.id]: {
          ...prov,
          nuclearDevastation: 0,
          assimilated: true,
          economy: Number((prov.economy + 0.85).toFixed(2)),
        },
      },
      mapPulses: [
        {
          id: `pulse_recity_${now}`,
          kind: 'recruit' as const,
          centroid: prov.centroid,
          color: '#FBBF24',
          label: '🏙️ REBUILT',
          createdAt: now,
        },
        ...(state.mapPulses ?? []),
      ].slice(0, 14),
      chronicle: [
        {
          id: `chr_rebuilt_${state.totalDays}_${now}`,
          turn: state.turn,
          day: state.day,
          year: state.year,
          monthIndex: state.monthIndex,
          type: 'event' as const,
          title: lang === 'pl' ? 'Odbudowa Miasta' : 'City Reconstruction',
          detail: `${player.displayName}: ${prov.name} (+0.85 Eco, +2% Stab.)`,
          countryIds: [player.id],
        },
        ...state.chronicle,
      ].slice(0, 120),
    },
  };
}

export function resolveRandomEvent(state: GameState, choiceId: string): GameState {
  const evt = state.pendingEvent;
  if (!evt) return state;
  const choice = evt.choices.find((c) => c.id === choiceId) ?? evt.choices[0];
  const player = state.countries[state.playerCountryId];
  if (!choice || !player) {
    return { ...state, pendingEvent: null };
  }

  const nextCountry: CountryState = {
    ...player,
    treasury: Math.max(0, Number((player.treasury + (choice.treasuryDelta ?? 0)).toFixed(1))),
    stability: Math.max(15, Math.min(100, player.stability + (choice.stabilityDelta ?? 0))),
    manpower: Math.max(0, Math.min(player.maxManpower, player.manpower + (choice.manpowerDelta ?? 0))),
    researchPoints: Math.max(0, Number((player.researchPoints + (choice.researchDelta ?? 0)).toFixed(1))),
    goldenAgeDaysLeft: player.goldenAgeDaysLeft + (choice.goldenAgeDays ?? 0),
  };

  let nextProvs = state.provinces;
  const nextPulses = [...(state.mapPulses ?? [])];
  if (evt.targetProvinceId && state.provinces[evt.targetProvinceId]) {
    const tp = state.provinces[evt.targetProvinceId];
    nextProvs = {
      ...state.provinces,
      [tp.id]: {
        ...tp,
        economy: Math.max(0.5, Number((tp.economy + (choice.provinceEconomyDelta ?? 0)).toFixed(2))),
        weather: choice.weatherShift ?? tp.weather,
      },
    };
    if (evt.isClimateEvent) {
      nextPulses.unshift({
        id: `pulse_clim_${Date.now()}_${tp.id}`,
        kind: 'climate',
        centroid: tp.centroid,
        color: '#F59E0B',
        label: tp.name,
        createdAt: Date.now(),
      });
    }
  }

  const nextWarming = Math.max(
    0,
    Math.min(100, Number(((state.globalWarmingIndex ?? 24) + (choice.climateDelta ?? 0)).toFixed(1))),
  );

  const entry: ChronicleEntry = {
    id: `chr_evt_${state.totalDays}_${evt.id}`,
    turn: state.turn,
    day: state.day,
    year: state.year,
    monthIndex: state.monthIndex,
    type: 'event',
    title: evt.title,
    detail: `${player.displayName}: ${choice.label}`,
    countryIds: [player.id],
  };

  return {
    ...state,
    provinces: nextProvs,
    countries: {
      ...state.countries,
      [player.id]: nextCountry,
    },
    globalWarmingIndex: nextWarming,
    mapPulses: nextPulses.slice(0, 14),
    pendingEvent: null,
    chronicle: [entry, ...state.chronicle].slice(0, 120),
  };
}

function cloneState(prevState: GameState): GameState {
  const now = Date.now();
  return {
    ...prevState,
    provinces: Object.fromEntries(
      Object.entries(prevState.provinces).map(([k, p]) => [
        k,
        {
          ...p,
          buildings: [...p.buildings],
          units: { ...p.units },
          graffitiTag: p.graffitiTag ? { ...p.graffitiTag } : null,
        },
      ]),
    ),
    countries: Object.fromEntries(
      Object.entries(prevState.countries).map(([k, c]) => [
        k,
        {
          ...c,
          allies: [...c.allies],
          atWarWith: [...c.atWarWith],
          nonAggressionWith: { ...c.nonAggressionWith },
          militaryAccessWith: [...c.militaryAccessWith],
          truceWith: { ...c.truceWith },
          relations: { ...(c.relations ?? {}) },
          guarantees: [...(c.guarantees ?? [])],
          sanctionedBy: [...(c.sanctionedBy ?? [])],
          lendLeaseTo: [...(c.lendLeaseTo ?? [])],
          vassals: [...c.vassals],
          loans: c.loans.map((l) => ({ ...l })),
          tech: { ...c.tech },
          unlockedTechs: [...c.unlockedTechs],
          techQueue: [...c.techQueue],
          budgetSliders: { ...(c.budgetSliders ?? { taxRate: c.taxRate, goodsSpending: 8, investmentsSpending: 6, researchSpending: 8, militarySpending: 100 }) },
          cabinet: { ...c.cabinet },
          stockpiles: { ...c.stockpiles },
          megaprojects: [...c.megaprojects],
          spaceColonies: [...c.spaceColonies],
          generals: (c.generals ?? []).map((g) => ({ ...g })),
          unlockedLegacyPerks: [...(c.unlockedLegacyPerks ?? [])],
        },
      ]),
    ),
    orders: prevState.orders.map((o) => ({ ...o, units: { ...o.units } })),
    recentBattles: [...prevState.recentBattles].slice(0, 24),
    recentMissiles: prevState.recentMissiles.filter((m) => now - m.createdAt < 3500),
    mapPulses: (prevState.mapPulses ?? []).filter((p) => now - p.createdAt < 4600),
    airliftVisuals: (prevState.airliftVisuals ?? []).filter((a: AirliftOrderVisual) => now - a.createdAt < 4800),
    graffitiVisuals: (prevState.graffitiVisuals ?? []).filter((g) => now - g.createdAt < 9000),
    xpPopups: (prevState.xpPopups ?? []).filter((x) => now - x.createdAt < 4500),
    customBlueprints: [...(prevState.customBlueprints ?? [])],
    activeSatellites: (prevState.activeSatellites ?? []).filter((s) => s.expiresDay >= prevState.totalDays),
    blockadedStraits: { ...(prevState.blockadedStraits ?? {}) },
    chronicle: [...prevState.chronicle],
    notifications: [...prevState.notifications],
    timelapseSnapshots: [...prevState.timelapseSnapshots],
  };
}

// Real-Time Daily Simulation Tick (Age of History III style continuous real-time with active pause)
export function advanceDay(prevState: GameState, lang: Language = 'en'): GameState {
  if (prevState.outcome !== 'ongoing') return prevState;

  const isSpectator = prevState.gameMode === 'bot_spectator';
  let state = cloneState(prevState);
  const hardcore = isHardcoreGeopolitics(state.difficulty, state.uiMode);

  state.totalDays += 1;
  state.day += 1;

  // 1. Advance active marching orders & resolve arrivals/battles smoothly
  const remainingOrders: ArmyOrder[] = [];
  const battles: BattleEvent[] = [];
  let warsWonDelta = 0;
  let pendingXpAmount = 0;
  let pendingXpReason = '';

  for (const order of state.orders) {
    const elapsed = state.totalDays - order.startDay;
    const progress = Math.min(1, elapsed / Math.max(1, order.durationDays));
    if (progress < 1) {
      remainingOrders.push({ ...order, progress });
      continue;
    }

    const from = state.provinces[order.fromProvinceId];
    const to = state.provinces[order.toProvinceId];
    if (!to) continue;

    const attackerCountry = state.countries[order.countryId];
    if (
      to.ownerId === order.countryId ||
      (!order.isAttack && attackerCountry?.militaryAccessWith.includes(to.ownerId))
    ) {
      if (to.ownerId === order.countryId) {
        to.units = addUnits(to.units, order.units);
      } else if (from && from.ownerId === order.countryId) {
        from.units = addUnits(from.units, order.units);
      }
    } else {
      const defenderCountry = state.countries[to.ownerId];
      if (!attackerCountry || !defenderCountry) continue;

      // Automatic Adjacent Border Reserve Reinforcement:
      let reserveTotal = 0;
      let reinforcingNeighbors = 0;
      for (const nId of to.neighbors) {
        if (reinforcingNeighbors >= 2) break;
        const adj = state.provinces[nId];
        if (!adj || adj.id === from?.id || adj.ownerId !== to.ownerId) continue;
        if (getTotalUnits(adj.units) < 3000) continue;
        const reserve = splitUnitsByRatio(adj.units, 0.25);
        const rCount = getTotalUnits(reserve);
        if (rCount >= 500) {
          adj.units = subtractUnits(adj.units, reserve);
          to.units = addUnits(to.units, reserve);
          reserveTotal += rCount;
          reinforcingNeighbors += 1;
        }
      }
      if (reserveTotal > 0 && (to.ownerId === state.playerCountryId || order.countryId === state.playerCountryId)) {
        state.chronicle.unshift({
          id: `chr_res_${state.totalDays}_${to.id}_${battles.length}`,
          turn: state.turn,
          day: state.day,
          year: state.year,
          monthIndex: state.monthIndex,
          type: 'war',
          title: lang === 'pl' ? 'Posiłki przygraniczne' : 'Border Reserve Reinforcement',
          detail: `${defenderCountry.displayName}: +${reserveTotal.toLocaleString()} → ${to.name}`,
          countryIds: [to.ownerId],
        });
      }

      const attMinBonus = attackerCountry.cabinet.defense
        ? CABINET_MINISTERS.find((m) => m.id === attackerCountry.cabinet.defense)?.attackBonus ?? 0
        : 0;
      const genBonus =
        attackerCountry.generals && attackerCountry.generals.length > 0
          ? attackerCountry.generals.reduce((b, g) => Math.max(b, g.attackBonus * (1 + (g.level - 1) * 0.12)), 0)
          : 0;
      const hasWaterStorm = state.waterAlerts.some((w) =>
        w.affectedProvinceIds.includes(to.id),
      );

      const battleResult = resolveProvinceBattle({
        scenarioId: state.scenarioId,
        difficulty: state.difficulty,
        playerCountryId: state.playerCountryId,
        isSpectator,
        attackerId: order.countryId,
        attackerUnits: order.units,
        attackerMilTech: attackerCountry.tech.military,
        attackerLogTech: attackerCountry.tech.logistics,
        defenderProvince: to,
        defenderMilTech: defenderCountry.tech.military,
        battleId: `btl_${state.totalDays}_${order.fromProvinceId}_${to.id}_${battles.length}`,
        isNavalAssault: order.isNaval,
        hasWaterStorm,
        attackerMinisterBonus: attMinBonus + genBonus,
        customBlueprints: state.customBlueprints,
      });

      battles.push(battleResult.event);
      state.mapPulses = [
        {
          id: `pulse_btl_${battleResult.event.id}`,
          kind: 'battle' as const,
          centroid: battleResult.event.centroid,
          color: battleResult.captured ? '#F59E0B' : '#EF4444',
          label: to.name,
          createdAt: Date.now(),
        },
        ...(state.mapPulses ?? []),
      ].slice(0, 14);

      if (battleResult.captured) {
        const oldOwnerId = to.ownerId;
        const origAlly =
          hardcore &&
          to.originalCountryId !== order.countryId &&
          attackerCountry.allies.includes(to.originalCountryId) &&
          state.countries[to.originalCountryId] &&
          !state.countries[to.originalCountryId].eliminated
            ? state.countries[to.originalCountryId]
            : null;

        if (origAlly) {
          // Allied Liberation Transfer: returning liberated core territory to living allied owner
          to.ownerId = origAlly.id;
          to.assimilated = true;
          to.assimilationProgress = 100;
          if (from && from.ownerId === order.countryId) {
            from.units = addUnits(from.units, battleResult.survivingAttackers);
          } else {
            to.units = battleResult.survivingAttackers;
          }
          state.chronicle.unshift({
            id: `chr_lib_${state.totalDays}_${to.id}_${battles.length}`,
            turn: state.turn,
            day: state.day,
            year: state.year,
            monthIndex: state.monthIndex,
            type: 'alliance',
            title: lang === 'pl' ? 'Wyzwolenie Terytorium Sojusznika' : 'Allied Liberation Transfer',
            detail: `${attackerCountry.displayName} → ${to.name} returned to ${origAlly.displayName}`,
            countryIds: [order.countryId, origAlly.id],
          });
        } else {
          to.ownerId = order.countryId;
          to.units = battleResult.survivingAttackers;
          to.assimilated = to.originalCountryId === order.countryId;
          to.assimilationProgress = to.assimilated ? 100 : 12;
        }

        // General leveling on victory
        if (attackerCountry.generals && attackerCountry.generals.length > 0) {
          const gen = attackerCountry.generals[0];
          gen.xp += 15;
          if (gen.xp >= gen.level * 60) {
            gen.xp -= gen.level * 60;
            gen.level += 1;
            gen.attackBonus = Number((gen.attackBonus + 0.02).toFixed(2));
            gen.defenseBonus = Number((gen.defenseBonus + 0.02).toFixed(2));
          }
        }

        if (order.countryId === state.playerCountryId) {
          pendingXpAmount += 35;
          pendingXpReason = `Captured ${to.name}`;
          attackerCountry.legacyPoints = (attackerCountry.legacyPoints ?? 0) + 5;
        }

        const attName = attackerCountry.displayName || attackerCountry.name[lang];
        const defName = defenderCountry.displayName || defenderCountry.name[lang];

        if (order.countryId === state.playerCountryId || oldOwnerId === state.playerCountryId) {
          const now = Date.now();
          state.notifications.unshift({
            id: `notif_cap_${now}_${battles.length}`,
            type: oldOwnerId === state.playerCountryId ? 'defeat' : 'conquest',
            title:
              oldOwnerId === state.playerCountryId
                ? lang === 'pl'
                  ? 'Utracono prowincję!'
                  : 'Province Lost!'
                : origAlly
                ? lang === 'pl'
                  ? 'Wyzwolono Sojusznika!'
                  : 'Allied Territory Liberated!'
                : lang === 'pl'
                ? 'Zdobyto prowincję!'
                : 'Province Captured!',
            message: origAlly ? `${to.name} → ${origAlly.displayName}` : `${attName} → ${to.name} (${defName})`,
            createdAt: now,
          });
        }

        if (
          order.countryId === state.playerCountryId ||
          oldOwnerId === state.playerCountryId ||
          isSpectator ||
          battles.length <= 4
        ) {
          state.chronicle.unshift({
            id: `chr_cap_${state.totalDays}_${to.id}_${battles.length}`,
            turn: state.turn,
            day: state.day,
            year: state.year,
            monthIndex: state.monthIndex,
            type: 'conquest',
            title: lang === 'pl' ? 'Podbój prowincji' : 'Province Captured',
            detail: `${attName} → ${to.name} (${defName})`,
            countryIds: [order.countryId, oldOwnerId],
          });
        }
      } else {
        to.units = battleResult.survivingDefenders;
        if (from && from.ownerId === order.countryId) {
          from.units = addUnits(from.units, battleResult.survivingAttackers);
        }
        if (to.ownerId === state.playerCountryId && !battleResult.event.attackerWon) {
          pendingXpAmount += 18;
          pendingXpReason = `Defended ${to.name}`;
        }
        if (order.countryId === state.playerCountryId) {
          const defName = defenderCountry.displayName || defenderCountry.name[lang];
          state.notifications.unshift({
            id: `notif_repel_${Date.now()}_${battles.length}`,
            type: 'war',
            title: lang === 'pl' ? 'Atak odparty!' : 'Attack Repelled!',
            message: `${defName} defended ${to.name} (-${battleResult.event.attackerLosses.toLocaleString()} troops)`,
            createdAt: Date.now(),
          });
        }
      }
    }
  }

  state.orders = remainingOrders;
  if (pendingXpAmount > 0) {
    state = grantCommanderXp(state, pendingXpAmount, pendingXpReason);
  }

  // Daily passive MP recharge, Golden Age countdown, & queued Tech Tree auto-unlock
  for (const c of Object.values(state.countries)) {
    if (c.eliminated) continue;
    if (c.goldenAgeDaysLeft > 0) c.goldenAgeDaysLeft -= 1;
    if (state.totalDays % 6 === 0 && c.movementPoints < c.maxMovementPoints) {
      c.movementPoints = Math.min(c.maxMovementPoints, c.movementPoints + 1);
    }
    if (c.isPlayer && c.techQueue.length > 0) {
      const nextId = c.techQueue[0];
      const def = TECH_NODE_MAP[nextId];
      if (def && canUnlockTechNode(c.unlockedTechs, nextId) && c.researchPoints >= def.costRp) {
        c.researchPoints = Number((c.researchPoints - def.costRp).toFixed(1));
        c.unlockedTechs.push(nextId);
        c.techQueue.shift();
        if (def.militaryLevelGain) c.tech.military += def.militaryLevelGain;
        if (def.economyLevelGain) c.tech.economy += def.economyLevelGain;
        if (def.logisticsLevelGain) {
          c.tech.logistics += def.logisticsLevelGain;
          c.maxMovementPoints = 8 + c.tech.logistics + (c.megaprojects.includes('transcontinental_rail') ? 2 : 0);
        }
        if (nextId === 'log_orbital_shields') c.orbitalShieldActive = true;
      }
    }
  }

  // Periodic AI operations (every 10 days)
  if (state.totalDays % 10 === 0) {
    const aiResult = generateAiOrdersAndActions(state, lang);
    for (let i = aiResult.chronicleEntries.length - 1; i >= 0; i--) {
      state.chronicle.unshift(aiResult.chronicleEntries[i]);
    }
    state.orders.push(...aiResult.orders);
    if (aiResult.pendingWarPrompt && state.peacefulStartEnabled && state.gameMode === 'player' && !state.pendingWarPrompt) {
      state.pendingWarPrompt = aiResult.pendingWarPrompt;
      state.simPaused = true;
    }
  }

  // Periodic Smart Auto-Pilot daily strategic oversight (every 6 days)
  if (state.autoPilotEnabled && state.gameMode === 'player' && state.totalDays % 6 === 0) {
    const apRes = runAutoPilotCommand(state, lang, { allowAirlift: false });
    Object.assign(state, apRes.state);
  }

  // Periodic Maritime Water Alerts update (every 18 days)
  if (state.totalDays % 18 === 0) {
    state.waterAlerts = generateWaterAlerts(state.provinces, state.season, state.totalDays);
    const playerAffected = state.waterAlerts.some((wa) =>
      wa.affectedProvinceIds.some((pid) => state.provinces[pid]?.ownerId === state.playerCountryId),
    );
    if (playerAffected && state.gameMode === 'player') {
      state.notifications.unshift({
        id: `notif_walert_${Date.now()}`,
        type: 'alert',
        title: lang === 'pl' ? 'ALERT WODNY' : 'WATER ALERT: Storm Warning',
        message:
          lang === 'pl'
            ? 'Silny sztorm na wybrzeżu opóźnia operacje morskie!'
            : 'Severe maritime storm delays coastal & amphibious operations!',
        createdAt: Date.now(),
      });
    }
  }

  // 2. Monthly economy, Budget Sliders, Research, Assimilation, Manpower, Loans, Weather & Date rollover
  let nextPendingEvent = state.pendingEvent;
  if (state.day > 30) {
    state.day = 1;
    const scenario = SCENARIOS[state.scenarioId];
    const totalMonths = state.monthIndex + scenario.monthsPerTurn;
    state.year = state.year + Math.floor(totalMonths / 12);
    state.monthIndex = totalMonths % 12;
    state.season = getSeasonFromMonth(state.monthIndex);
    state.turn += 1;

    const summaries = computeCountrySummaries(state);
    const uniCountByCountry: Record<string, number> = {};
    const libCountByCountry: Record<string, number> = {};
    for (const prov of Object.values(state.provinces)) {
      if (prov.buildings.includes('university')) {
        uniCountByCountry[prov.ownerId] = (uniCountByCountry[prov.ownerId] ?? 0) + 1;
      }
      if (prov.buildings.includes('library')) {
        libCountByCountry[prov.ownerId] = (libCountByCountry[prov.ownerId] ?? 0) + 1;
      }
    }

    for (const country of Object.values(state.countries)) {
      const sum = summaries[country.id];
      if (!sum || sum.provinceCount === 0) {
        if (!country.eliminated && country.id !== state.playerCountryId) {
          if (state.countries[state.playerCountryId]?.atWarWith.includes(country.id)) {
            warsWonDelta += 1;
          }
          state.chronicle.unshift({
            id: `chr_elim_${state.totalDays}_${country.id}`,
            turn: state.turn,
            day: state.day,
            year: state.year,
            monthIndex: state.monthIndex,
            type: 'conquest',
            title: lang === 'pl' ? 'Upadek państwa' : 'Nation Fallen',
            detail: `${country.displayName || country.name[lang]} lost its final provinces.`,
            countryIds: [country.id],
          });
        }
        country.eliminated = true;
        country.manpower = 0;
        continue;
      }

      country.treasury = Math.max(0, Number((country.treasury + sum.incomePerTurn).toFixed(1)));
      country.legacyPoints = (country.legacyPoints ?? 0) + 4;

      const sciMin = country.cabinet.science
        ? CABINET_MINISTERS.find((m) => m.id === country.cabinet.science)?.researchBonus ?? 0
        : 0;
      const legacyRpMult = country.unlockedLegacyPerks?.includes('leg_academy_patron') ? 1.25 : 1.0;
      const faithRpMult = country.resurrectedFaithId === 'hellenic' ? 1.15 : 1.0;
      const sliderRpMult = 1 + ((country.budgetSliders?.researchSpending ?? 8) - 8) * 0.025;
      const spaceRp = country.spaceColonies.reduce((acc, nid) => {
        const sn = SPACE_OCEAN_NODES.find((x) => x.id === nid);
        return acc + (sn?.researchPerMonth ?? 0);
      }, 0);
      const megaRp = country.megaprojects.includes('fusion_core') ? 12 : 0;
      const uniResearch = (uniCountByCountry[country.id] ?? 0) * 3.5 + (libCountByCountry[country.id] ?? 0) * 1.8;
      const rawRp =
        (6 + Math.floor(sum.provinceCount * 1.5) + uniResearch + spaceRp + megaRp) *
        (1 + sciMin) *
        legacyRpMult *
        faithRpMult *
        sliderRpMult;
      country.researchPoints = Number((country.researchPoints + rawRp).toFixed(1));

      country.maxMovementPoints =
        8 + country.tech.logistics + (country.megaprojects.includes('transcontinental_rail') ? 2 : 0);
      country.movementPoints = country.maxMovementPoints;
      country.diplomacyPoints = country.maxDiplomacyPoints;

      const manpowerRecovery = Math.max(1100, Math.round(sum.population * 0.0008));
      country.maxManpower = Math.max(35000, Math.min(6_500_000, Math.round(sum.population * 0.045)));
      country.manpower = Math.min(country.maxManpower, country.manpower + manpowerRecovery);

      const effTax = country.budgetSliders?.taxRate ?? country.taxRate;
      const goodsSlider = country.budgetSliders?.goodsSpending ?? 8;
      let stabDelta = 0;
      if (effTax > 25) stabDelta -= Math.ceil((effTax - 25) / 5);
      else if (effTax <= 14) stabDelta += 1;
      if (goodsSlider >= 14) stabDelta += goodsSlider >= 22 ? 2 : 1;
      country.stability = Math.max(20, Math.min(100, country.stability + stabDelta));

      country.loans = country.loans
        .map((l) => ({
          ...l,
          remainingTotal: Math.max(0, Number((l.remainingTotal - l.perTurnPayment).toFixed(1))),
          turnsLeft: l.turnsLeft - 1,
        }))
        .filter((l) => l.turnsLeft > 0 && l.remainingTotal > 0.1);

      for (const [otherId, rem] of Object.entries(country.truceWith)) {
        if (rem <= 1) delete country.truceWith[otherId];
        else country.truceWith[otherId] = rem - 1;
      }
      for (const [otherId, rem] of Object.entries(country.nonAggressionWith)) {
        if (rem <= 1) delete country.nonAggressionWith[otherId];
        else country.nonAggressionWith[otherId] = rem - 1;
      }
    }

    // Commodity price drift
    for (const key of Object.keys(state.globalMarket.prices) as CommodityId[]) {
      const wave = Math.sin(state.turn * 1.3 + key.length * 2.1);
      const nextPrice = Number(
        Math.max(2.5, Math.min(35, state.globalMarket.prices[key] * (1 + wave * 0.07))).toFixed(2),
      );
      state.globalMarket.trends[key] =
        nextPrice > state.globalMarket.prices[key]
          ? 'up'
          : nextPrice < state.globalMarket.prices[key]
          ? 'down'
          : 'flat';
      state.globalMarket.prices[key] = nextPrice;
    }

    // Rotate World Council resolution every 2 months
    if (state.turn % 2 === 0) {
      const nextRes = WORLD_COUNCIL_RESOLUTIONS[state.turn % WORLD_COUNCIL_RESOLUTIONS.length];
      state.worldCouncil = {
        ...state.worldCouncil,
        activeResolutionId: nextRes.id,
        yesVotes: 3 + (state.turn % 4),
        noVotes: 2 + (state.turn % 3),
        playerVoted: null,
        nextVoteDay: state.totalDays + 60,
      };
    }

    // Natural nuclear winter cooling & Global Warming Index update + province Happiness / Assimilation / Dev
    if (state.nuclearWinterLevel > 0) {
      state.nuclearWinterLevel = Math.max(0, state.nuclearWinterLevel - 2);
    }

    let factoryCount = 0;
    let ecoWarmingOffset = 0;
    let idx = 0;
    for (const prov of Object.values(state.provinces)) {
      if (prov.buildings.includes('factory')) factoryCount += 1;
      if (prov.buildings.includes('nuclear_reactor')) ecoWarmingOffset += 0.12;
      const growth = prov.buildings.includes('farm') ? 1.008 : 1.002;
      prov.population = Math.round(prov.population * growth);
      prov.weather = computeProvinceWeather(prov.centroid, state.season, state.turn, idx);
      prov.temperatureC = computeProvinceTemperatureC({
        centroid: prov.centroid,
        season: state.season,
        weather: prov.weather,
        globalWarmingIndex: state.globalWarmingIndex,
        nuclearWinterLevel: state.nuclearWinterLevel,
        provSeedIndex: idx,
        totalDays: state.totalDays,
      });
      idx++;
      if (prov.nuclearDevastation && prov.nuclearDevastation > 0) {
        prov.nuclearDevastation = Math.max(0, prov.nuclearDevastation - 4);
      }

      const owner = state.countries[prov.ownerId];
      if (owner) {
        // Assimilation progress & happiness drift
        if (!prov.assimilated) {
          const step = owner.unlockedLegacyPerks?.includes('leg_civic_harmony') ? 18 : 9;
          prov.assimilationProgress = Math.min(100, (prov.assimilationProgress ?? 10) + step);
          if (prov.assimilationProgress >= 100) prov.assimilated = true;
        }
        const targetHappy = Math.max(
          25,
          Math.min(
            99,
            Math.round(64 + (owner.budgetSliders?.goodsSpending ?? 8) * 1.4 - (owner.budgetSliders?.taxRate ?? owner.taxRate) * 0.45),
          ),
        );
        prov.happiness = Math.round(((prov.happiness ?? 75) * 0.7 + targetHappy * 0.3));
        if ((owner.budgetSliders?.investmentsSpending ?? 6) >= 12 && prov.isCapital) {
          prov.economy = Number((prov.economy + 0.04).toFixed(2));
        }

        // Extreme Cold or Extreme Heat attrition
        if (owner.atWarWith.length > 0 && !prov.assimilated && owner.resurrectedFaithId !== 'norse_asatru') {
          const attr = getExtremeClimateAttrition(
            prov.temperatureC,
            owner.tech.logistics,
            owner.isPlayer && (state.difficulty === 'world_conquest' || state.difficulty === 'very_easy_plus'),
          );
          if (attr.attritionRate > 0 && getTotalUnits(prov.units) > 1200) {
            prov.units = scaleUnits(prov.units, 1 - attr.attritionRate * 0.45);
          }
        }
      }
    }
    for (const c of Object.values(state.countries)) {
      if (c.eliminated) continue;
      if (c.unlockedTechs.includes('eco_fusion')) ecoWarmingOffset += 0.35;
      if (c.megaprojects.includes('fusion_core')) ecoWarmingOffset += 0.45;
      if (c.megaprojects.includes('deep_ocean_arcology')) ecoWarmingOffset += 0.3;
    }
    const greenCouncil = state.worldCouncil.passedEffects.includes('res_green_maritime') ? 0.5 : 0;
    const rawWarmDelta = factoryCount * 0.045 - ecoWarmingOffset - greenCouncil + (state.nuclearWinterLevel > 20 ? -0.4 : 0.15);
    state.globalWarmingIndex = Math.max(
      0,
      Math.min(100, Number(((state.globalWarmingIndex ?? 24) + rawWarmDelta).toFixed(1))),
    );

    // Record Timelapse Snapshot
    const owners: Record<string, string> = {};
    for (const p of Object.values(state.provinces)) owners[p.id] = p.ownerId;
    state.timelapseSnapshots.push({
      totalDays: state.totalDays,
      year: state.year,
      monthIndex: state.monthIndex,
      owners,
    });
    if (state.timelapseSnapshots.length > 60) {
      state.timelapseSnapshots.shift();
    }

    // Random & Climate Events every 3 months
    if (state.turn % 3 === 0) {
      const playerOwnedList = Object.values(state.provinces).filter(
        (p) => p.ownerId === state.playerCountryId,
      );
      const eventTargetProv =
        playerOwnedList[state.turn % Math.max(1, playerOwnedList.length)] ??
        Object.values(state.provinces)[state.turn % Object.keys(state.provinces).length];
      const forceClimate = (state.globalWarmingIndex ?? 0) >= 34 && state.turn % 6 === 0;
      if (isSpectator) {
        const evt = buildPendingEvent(state.turn, lang, eventTargetProv, forceClimate);
        state.chronicle.unshift({
          id: `chr_gevt_${state.turn}`,
          turn: state.turn,
          day: state.day,
          year: state.year,
          monthIndex: state.monthIndex,
          type: 'event',
          title: evt.title,
          detail: evt.description,
          countryIds: [],
        });
      } else if (!nextPendingEvent) {
        nextPendingEvent = buildPendingEvent(state.turn, lang, eventTargetProv, forceClimate);
      }
    }
  }

  // 3. Check Victory / Defeat conditions & VERY EASY+ / EXTREMELY EASY+ Comeback Protocol
  let summariesNow = computeCountrySummaries(state);
  const totalProvs = Object.keys(state.provinces).length;
  let outcome: GameState['outcome'] = 'ongoing';
  let peakAreaKm2 = prevState.peakAreaKm2;

  if (!isSpectator && (state.difficulty === 'very_easy_plus' || state.difficulty === 'extremely_easy_plus')) {
    const player = state.countries[state.playerCountryId];
    const playerSum = summariesNow[state.playerCountryId];
    const playerProvs = Object.values(state.provinces).filter((p) => p.ownerId === state.playerCountryId);
    const originalCount = Math.max(
      1,
      Object.values(state.provinces).filter((p) => p.originalCountryId === state.playerCountryId).length,
    );
    const lostThreshold = Math.max(2, Math.floor(originalCount * 0.15));
    const severelyReduced =
      playerProvs.length > 0 &&
      (playerProvs.length <= lostThreshold || (playerSum?.totalArmy ?? 0) < 4000);

    if (
      player &&
      !player.eliminated &&
      player.atWarWith.length > 0 &&
      severelyReduced &&
      state.totalDays - (state.lastComebackDay ?? -100) >= 30
    ) {
      const bastion = playerProvs.find((p) => p.isCapital) ?? playerProvs[0];
      const scenario = SCENARIOS[state.scenarioId];
      const primaryUnit = scenario.unitRoster[0]?.id ?? 'infantry';
      const armorUnit = scenario.unitRoster[1]?.id ?? primaryUnit;
      bastion.units[primaryUnit] = (bastion.units[primaryUnit] ?? 0) + 10000;
      bastion.units[armorUnit] = (bastion.units[armorUnit] ?? 0) + 4000;

      player.treasury = Number((player.treasury + 140).toFixed(1));
      player.manpower = Math.min(player.maxManpower, player.manpower + 35000);
      player.stability = Math.min(100, player.stability + 20);
      player.movementPoints = player.maxMovementPoints;

      state.comebackTriggeredCount = (state.comebackTriggeredCount ?? 0) + 1;
      state.lastComebackDay = state.totalDays;
      const now = Date.now();
      state.mapPulses = [
        {
          id: `pulse_comeback_${now}`,
          kind: 'comeback' as const,
          centroid: bastion.centroid,
          color: '#34D399',
          label: 'COMEBACK +14K',
          createdAt: now,
        },
        ...(state.mapPulses ?? []),
      ].slice(0, 14);
      state.notifications.unshift({
        id: `notif_comeback_${now}`,
        type: 'conquest',
        title: lang === 'pl' ? 'Protokół Ratunkowy VERY EASY+!' : 'Emergency Comeback Protocol Activated!',
        message:
          lang === 'pl'
            ? `+140 PLN, +35 000 rezerw oraz 14 000 elitarnych jednostek w ${bastion.name}!`
            : `+140 PLN, +35,000 Manpower & 14,000 Elite Divisions deployed in ${bastion.name}!`,
        createdAt: now,
      });
      state.chronicle.unshift({
        id: `chr_comeback_${state.totalDays}`,
        turn: state.turn,
        day: state.day,
        year: state.year,
        monthIndex: state.monthIndex,
        type: 'event',
        title: lang === 'pl' ? 'Kontrofensywa Ratunkowa' : 'Emergency Comeback Protocol',
        detail: `${player.displayName}: +14,000 elite troops & +140 PLN in ${bastion.name}`,
        countryIds: [player.id],
      });
      summariesNow = computeCountrySummaries(state);
    }
  }

  if (isSpectator) {
    const leader = Object.values(summariesNow)
      .filter((s) => s.provinceCount > 0)
      .sort((a, b) => b.provinceCount - a.provinceCount)[0];
    if (leader && leader.provinceCount === totalProvs && !state.eternalEmpireMode) {
      outcome = 'victory';
    }
    peakAreaKm2 = Math.max(prevState.peakAreaKm2, leader?.areaKm2 ?? 0);
  } else {
    const playerSum = summariesNow[state.playerCountryId];
    const playerProvs = playerSum?.provinceCount ?? 0;
    if (playerProvs === 0) {
      outcome = 'defeat';
    } else if (totalProvs > 0 && playerProvs === totalProvs && !state.eternalEmpireMode) {
      // True 100% World Conquest requirement!
      outcome = 'victory';
    }
    peakAreaKm2 = Math.max(prevState.peakAreaKm2, playerSum?.areaKm2 ?? 0);
  }

  return {
    ...state,
    recentBattles: [...battles, ...state.recentBattles].slice(0, 24),
    chronicle: state.chronicle.slice(0, 120),
    pendingEvent: outcome === 'ongoing' ? nextPendingEvent : null,
    notifications: state.notifications.slice(0, 10),
    outcome,
    peakAreaKm2,
    warsWon: prevState.warsWon + warsWonDelta,
    battlesFought: prevState.battlesFought + battles.length,
  };
}

export function advanceDays(prevState: GameState, days: number, lang: Language = 'en'): GameState {
  let curr = prevState;
  for (let i = 0; i < days; i++) {
    if (curr.outcome !== 'ongoing') break;
    curr = advanceDay(curr, lang);
  }
  return curr;
}

// Execute a full 30-day economic & military simulation cycle
export function executeTurn(prevState: GameState, lang: Language = 'en'): GameState {
  return advanceDays(prevState, 30, lang);
}

// ============================================================
// VERSION 4.0 GAMEPLAY & DIPLOMACY ACTIONS
// ============================================================

export function continueEternalEmpire(state: GameState): GameState {
  return {
    ...state,
    outcome: 'ongoing',
    eternalEmpireMode: true,
    simPaused: false,
  };
}

export function togglePeacefulStart(state: GameState, enabled: boolean): GameState {
  return {
    ...state,
    peacefulStartEnabled: enabled,
  };
}

export function resolveWarPrompt(
  state: GameState,
  acceptWar: boolean,
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const prompt = state.pendingWarPrompt;
  if (!prompt) return { state };
  const player = state.countries[state.playerCountryId];
  const attacker = state.countries[prompt.attackerId];
  if (!player || !attacker) {
    return { state: { ...state, pendingWarPrompt: null } };
  }

  if (!acceptWar) {
    if (!prompt.vetoAllowed) {
      return {
        state,
        error:
          lang === 'pl'
            ? 'W trybie EXTREME ULTRA IMPOSSIBLE weta dyplomatyczne są zablokowane!'
            : 'Diplomatic Veto is disabled in EXTREME ULTRA IMPOSSIBLE mode!',
      };
    }
    if (player.diplomacyPoints < prompt.vetoDpCost) {
      return {
        state,
        error: `Diplomatic Veto requires ${prompt.vetoDpCost} Diplomacy Points (DP).`,
      };
    }
    const nextCountries = { ...state.countries };
    nextCountries[player.id] = {
      ...player,
      diplomacyPoints: player.diplomacyPoints - prompt.vetoDpCost,
      truceWith: { ...player.truceWith, [attacker.id]: 4 },
    };
    nextCountries[attacker.id] = {
      ...attacker,
      truceWith: { ...attacker.truceWith, [player.id]: 4 },
    };
    return {
      state: grantCommanderXp(
        {
          ...state,
          countries: nextCountries,
          pendingWarPrompt: null,
          chronicle: [
            {
              id: `chr_veto_${state.totalDays}_${Date.now()}`,
              turn: state.turn,
              day: state.day,
              year: state.year,
              monthIndex: state.monthIndex,
              type: 'peace' as const,
              title: lang === 'pl' ? 'Weto Dyplomatyczne' : 'Diplomatic Veto Enforced',
              detail: `${player.displayName} averted war with ${attacker.displayName} (4-mo truce).`,
              countryIds: [player.id, attacker.id],
            },
            ...state.chronicle,
          ].slice(0, 120),
        },
        15,
        'Diplomatic Veto',
      ),
    };
  }

  // Player accepted war: formalize state of war & trigger Article 5 collective defense for defender's allies
  const nextCountries = cloneState(state).countries;
  const p = nextCountries[player.id];
  const a = nextCountries[attacker.id];
  const nextChronicle = [...state.chronicle];
  const nextNotifications = [...state.notifications];

  if (!p.atWarWith.includes(a.id)) p.atWarWith.push(a.id);
  if (!a.atWarWith.includes(p.id)) a.atWarWith.push(p.id);
  p.relations = { ...p.relations, [a.id]: -100 };
  a.relations = { ...a.relations, [p.id]: -100 };

  triggerArticle5AndBreakPacts(state, nextCountries, a.id, p.id, lang, nextChronicle, nextNotifications);

  nextChronicle.unshift({
    id: `chr_war_acc_${state.totalDays}_${Date.now()}`,
    turn: state.turn,
    day: state.day,
    year: state.year,
    monthIndex: state.monthIndex,
    type: 'war',
    title: lang === 'pl' ? 'Wybuch Wojny' : 'War Accepted',
    detail: `${a.displayName} ⚔️ ${p.displayName}`,
    countryIds: [a.id, p.id],
  });

  return {
    state: {
      ...state,
      countries: nextCountries,
      pendingWarPrompt: null,
      chronicle: nextChronicle.slice(0, 120),
      notifications: nextNotifications.slice(0, 10),
    },
  };
}

export function adjustRelations(
  state: GameState,
  targetCountryId: string,
  direction: 'improve' | 'insult',
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  const target = state.countries[targetCountryId];
  if (!player || !target || target.id === player.id) {
    return { state, error: 'Invalid target nation.' };
  }
  if (player.diplomacyPoints < 1) {
    return { state, error: 'Requires 1 Diplomacy Point (DP).' };
  }

  const delta = direction === 'improve' ? 18 : -24;
  const curRel = player.relations?.[target.id] ?? 0;
  const nextRel = Math.max(-100, Math.min(100, curRel + delta));

  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: {
          ...state.countries,
          [player.id]: {
            ...player,
            diplomacyPoints: player.diplomacyPoints - 1,
            relations: { ...player.relations, [target.id]: nextRel },
          },
          [target.id]: {
            ...target,
            relations: { ...target.relations, [player.id]: nextRel },
          },
        },
        notifications: [
          {
            id: `notif_rel_${Date.now()}`,
            type: direction === 'improve' ? ('alliance' as const) : ('war' as const),
            title:
              direction === 'improve'
                ? lang === 'pl'
                  ? 'Poprawiono Relacje'
                  : 'Relations Improved'
                : lang === 'pl'
                ? 'Zniewaga Dyplomatyczna'
                : 'Diplomatic Insult Sent',
            message: `${target.displayName}: ${curRel} → ${nextRel}`,
            createdAt: Date.now(),
          },
          ...state.notifications,
        ].slice(0, 10),
      },
      10,
      direction === 'improve' ? 'Improved Relations' : 'Diplomatic Insult',
    ),
  };
}

export function proposeExtendedDiplomacy(
  state: GameState,
  targetCountryId: string,
  action: 'guarantee' | 'sanctions' | 'lend_lease',
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  const target = state.countries[targetCountryId];
  if (!player || !target || target.id === player.id || target.eliminated) {
    return { state, error: 'Invalid target nation.' };
  }
  if (player.diplomacyPoints < 1) return { state, error: 'Requires 1 Diplomacy Point (DP).' };

  const now = Date.now();
  const nextCountries = { ...state.countries };

  if (action === 'guarantee') {
    const active = player.guarantees?.includes(target.id);
    nextCountries[player.id] = {
      ...player,
      diplomacyPoints: player.diplomacyPoints - 1,
      guarantees: active
        ? player.guarantees.filter((id) => id !== target.id)
        : [...(player.guarantees ?? []), target.id],
      relations: { ...player.relations, [target.id]: Math.min(100, (player.relations?.[target.id] ?? 0) + (active ? -10 : 20)) },
    };
  } else if (action === 'sanctions') {
    const already = target.sanctionedBy?.includes(player.id);
    nextCountries[player.id] = {
      ...player,
      diplomacyPoints: player.diplomacyPoints - 1,
      relations: { ...player.relations, [target.id]: Math.max(-100, (player.relations?.[target.id] ?? 0) - 25) },
    };
    nextCountries[target.id] = {
      ...target,
      sanctionedBy: already
        ? target.sanctionedBy.filter((id) => id !== player.id)
        : [...(target.sanctionedBy ?? []), player.id],
    };
  } else if (action === 'lend_lease') {
    if (player.treasury < 20) return { state, error: 'Lend-Lease package requires 20 PLN.' };
    nextCountries[player.id] = {
      ...player,
      diplomacyPoints: player.diplomacyPoints - 1,
      treasury: Number((player.treasury - 20).toFixed(1)),
      lendLeaseTo: player.lendLeaseTo?.includes(target.id)
        ? player.lendLeaseTo
        : [...(player.lendLeaseTo ?? []), target.id],
      relations: { ...player.relations, [target.id]: Math.min(100, (player.relations?.[target.id] ?? 0) + 25) },
    };
    nextCountries[target.id] = {
      ...target,
      treasury: Number((target.treasury + 20).toFixed(1)),
      manpower: Math.min(target.maxManpower, target.manpower + 8000),
      relations: { ...target.relations, [player.id]: Math.min(100, (target.relations?.[player.id] ?? 0) + 25) },
    };
  }

  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: nextCountries,
        notifications: [
          {
            id: `notif_ext_${now}`,
            type: 'info' as const,
            title:
              action === 'guarantee'
                ? lang === 'pl'
                  ? 'Gwarancja Niepodległości'
                  : 'Independence Guaranteed'
                : action === 'sanctions'
                ? lang === 'pl'
                  ? 'Nałożono Sankcje'
                  : 'Economic Sanctions Enacted'
                : lang === 'pl'
                ? 'Pakiet Lend-Lease'
                : 'Lend-Lease Delivered',
            message: `${target.displayName}`,
            createdAt: now,
          },
          ...state.notifications,
        ].slice(0, 10),
      },
      15,
      `Diplomacy: ${action}`,
    ),
  };
}

export function setVassalTribute(
  state: GameState,
  vassalId: string,
  tributePct: number,
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  const vassal = state.countries[vassalId];
  if (!player || !vassal || vassal.vassalOf !== player.id) {
    return { state, error: 'Target nation is not your vassal.' };
  }
  const clamped = Math.max(0, Math.min(45, Math.round(tributePct)));
  return {
    state: {
      ...state,
      countries: {
        ...state.countries,
        [vassal.id]: {
          ...vassal,
          vassalTributePct: clamped,
        },
      },
    },
  };
}

export function resolvePeaceConference(
  state: GameState,
  draft: PeaceTreatyDraft,
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  const enemy = state.countries[draft.enemyId];
  if (!player || !enemy || !player.atWarWith.includes(enemy.id)) {
    return { state, error: 'You are not at war with this nation.' };
  }
  if (player.diplomacyPoints < 1) {
    return { state, error: 'Requires 1 Diplomacy Point (DP).' };
  }

  const summaries = computeCountrySummaries(state);
  const myScore = summaries[player.id]?.powerScore ?? 1000;
  const enemyScore = Math.max(1000, summaries[enemy.id]?.powerScore ?? 1000);
  const scoreRatio = myScore / enemyScore;

  const treatyCost =
    draft.demandedProvinceIds.length * 0.45 +
    (draft.warReparations ? 0.5 : 0) +
    (draft.demilitarize ? 0.5 : 0) +
    (draft.forceVassalize ? 1.4 : 0);

  if (treatyCost > scoreRatio * 1.45 && treatyCost > 0.6) {
    return {
      state,
      error: `${enemy.displayName} rejected peace conference demands — reduce territorial claims or defeat more armies.`,
    };
  }

  const nextProvs = { ...state.provinces };
  for (const pid of draft.demandedProvinceIds) {
    const prov = nextProvs[pid];
    if (prov && prov.ownerId === enemy.id) {
      nextProvs[pid] = {
        ...prov,
        ownerId: player.id,
        assimilated: prov.originalCountryId === player.id,
        assimilationProgress: prov.originalCountryId === player.id ? 100 : 18,
      };
    }
  }

  const repAmount = draft.warReparations ? Math.min(enemy.treasury, Math.round(25 + draft.demandedProvinceIds.length * 4)) : 0;
  if (draft.demilitarize) {
    for (const p of Object.values(nextProvs)) {
      if (p.ownerId === enemy.id) {
        nextProvs[p.id] = { ...p, units: scaleUnits(p.units, 0.35) };
      }
    }
  }

  const nextCountries = { ...state.countries };
  nextCountries[player.id] = {
    ...player,
    diplomacyPoints: player.diplomacyPoints - 1,
    treasury: Number((player.treasury + repAmount).toFixed(1)),
    atWarWith: player.atWarWith.filter((id) => id !== enemy.id),
    truceWith: { ...player.truceWith, [enemy.id]: 6 },
    vassals: draft.forceVassalize && !player.vassals.includes(enemy.id) ? [...player.vassals, enemy.id] : player.vassals,
    legacyPoints: (player.legacyPoints ?? 0) + 20,
  };
  nextCountries[enemy.id] = {
    ...enemy,
    treasury: Math.max(0, Number((enemy.treasury - repAmount).toFixed(1))),
    atWarWith: enemy.atWarWith.filter((id) => id !== player.id),
    truceWith: { ...enemy.truceWith, [player.id]: 6 },
    vassalOf: draft.forceVassalize ? player.id : enemy.vassalOf,
  };

  const now = Date.now();
  return {
    state: grantCommanderXp(
      {
        ...state,
        provinces: nextProvs,
        countries: nextCountries,
        chronicle: [
          {
            id: `chr_pconf_${state.totalDays}_${now}`,
            turn: state.turn,
            day: state.day,
            year: state.year,
            monthIndex: state.monthIndex,
            type: 'peace' as const,
            title: lang === 'pl' ? 'Konferencja Pokojowa' : 'Peace Conference Signed',
            detail: `${player.displayName} 🕊️ ${enemy.displayName} (+${draft.demandedProvinceIds.length} provs)`,
            countryIds: [player.id, enemy.id],
          },
          ...state.chronicle,
        ].slice(0, 120),
        notifications: [
          {
            id: `notif_pconf_${now}`,
            type: 'peace' as const,
            title: lang === 'pl' ? 'Traktat Konferencji Pokojowej' : 'Peace Conference Concluded',
            message: `${enemy.displayName} signed treaty (${draft.demandedProvinceIds.length} provinces ceded).`,
            createdAt: now,
          },
          ...state.notifications,
        ].slice(0, 10),
      },
      45,
      'Peace Conference Treaty',
    ),
  };
}

export function updateBudgetSliders(
  state: GameState,
  sliders: Partial<BudgetSliders>,
): GameState {
  const player = state.countries[state.playerCountryId];
  if (!player) return state;
  const cur = player.budgetSliders ?? {
    taxRate: player.taxRate,
    goodsSpending: 8,
    investmentsSpending: 6,
    researchSpending: 8,
    militarySpending: 100,
  };
  const next: BudgetSliders = {
    taxRate: Math.max(5, Math.min(40, Math.round(sliders.taxRate ?? cur.taxRate))),
    goodsSpending: Math.max(0, Math.min(30, Math.round(sliders.goodsSpending ?? cur.goodsSpending))),
    investmentsSpending: Math.max(0, Math.min(30, Math.round(sliders.investmentsSpending ?? cur.investmentsSpending))),
    researchSpending: Math.max(0, Math.min(30, Math.round(sliders.researchSpending ?? cur.researchSpending))),
    militarySpending: Math.max(50, Math.min(150, Math.round(sliders.militarySpending ?? cur.militarySpending))),
  };
  return {
    ...state,
    countries: {
      ...state.countries,
      [player.id]: {
        ...player,
        taxRate: next.taxRate,
        budgetSliders: next,
      },
    },
  };
}

export function developProvince(
  state: GameState,
  provinceId: string,
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  const prov = state.provinces[provinceId];
  if (!player || !prov || prov.ownerId !== player.id) {
    return { state, error: 'You do not control this province.' };
  }
  const cost = 12;
  if (player.treasury < cost) return { state, error: `Requires ${cost} PLN.` };
  if (player.movementPoints < 1) return { state, error: 'Requires 1 Movement Point.' };

  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: {
          ...state.countries,
          [player.id]: {
            ...player,
            treasury: Number((player.treasury - cost).toFixed(1)),
            movementPoints: player.movementPoints - 1,
          },
        },
        provinces: {
          ...state.provinces,
          [prov.id]: {
            ...prov,
            development: Number(((prov.development ?? 1) + 0.5).toFixed(2)),
            economy: Number((prov.economy + 0.45).toFixed(2)),
            happiness: Math.min(100, (prov.happiness ?? 75) + 4),
          },
        },
        mapPulses: [
          {
            id: `pulse_dev_${Date.now()}`,
            kind: 'recruit' as const,
            centroid: prov.centroid,
            color: '#FBBF24',
            label: lang === 'pl' ? '+ROZWÓJ' : '+DEV',
            createdAt: Date.now(),
          },
          ...(state.mapPulses ?? []),
        ].slice(0, 14),
      },
      15,
      `Developed ${prov.name}`,
    ),
  };
}

export function plunderProvince(
  state: GameState,
  provinceId: string,
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  const prov = state.provinces[provinceId];
  if (!player || !prov || prov.ownerId !== player.id) {
    return { state, error: 'Occupy the province before plundering it.' };
  }
  if (prov.assimilated) {
    return { state, error: 'Cannot plunder assimilated core territory!' };
  }
  if ((prov.plunderCooldownDay ?? -100) + 30 > state.totalDays) {
    return { state, error: 'Province was recently plundered.' };
  }

  const loot = Number(Math.max(8, Math.min(45, prov.economy * 5.2)).toFixed(1));
  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: {
          ...state.countries,
          [player.id]: {
            ...player,
            treasury: Number((player.treasury + loot).toFixed(1)),
            stability: Math.max(15, player.stability - 2),
          },
        },
        provinces: {
          ...state.provinces,
          [prov.id]: {
            ...prov,
            economy: Math.max(0.5, Number((prov.economy * 0.78).toFixed(2))),
            happiness: Math.max(10, (prov.happiness ?? 65) - 25),
            plunderCooldownDay: state.totalDays,
          },
        },
        chronicle: [
          {
            id: `chr_plunder_${state.totalDays}_${Date.now()}`,
            turn: state.turn,
            day: state.day,
            year: state.year,
            monthIndex: state.monthIndex,
            type: 'war' as const,
            title: lang === 'pl' ? 'Złupiono Prowincję' : 'Province Plundered',
            detail: `${player.displayName} seized ${loot} PLN from ${prov.name}.`,
            countryIds: [player.id],
          },
          ...state.chronicle,
        ].slice(0, 120),
      },
      12,
      `Plundered ${prov.name}`,
    ),
  };
}

export function sendMissionaries(
  state: GameState,
  provinceId: string,
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  const prov = state.provinces[provinceId];
  if (!player || !prov || prov.ownerId !== player.id) {
    return { state, error: 'You do not control this province.' };
  }
  if (player.treasury < 10) return { state, error: 'Requires 10 PLN.' };

  const nextAdh = prov.religion === player.religion ? Math.min(100, (prov.religionAdherence ?? 60) + 25) : 55;
  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: {
          ...state.countries,
          [player.id]: {
            ...player,
            treasury: Number((player.treasury - 10).toFixed(1)),
          },
        },
        provinces: {
          ...state.provinces,
          [prov.id]: {
            ...prov,
            religion: player.religion,
            religionAdherence: nextAdh,
            happiness: Math.min(100, (prov.happiness ?? 70) + 3),
          },
        },
        notifications: [
          {
            id: `notif_miss_${Date.now()}`,
            type: 'info' as const,
            title: lang === 'pl' ? 'Misjonarze Wysłani' : 'Missionaries Deployed',
            message: `${prov.name}: ${nextAdh}% conversion progress.`,
            createdAt: Date.now(),
          },
          ...state.notifications,
        ].slice(0, 10),
      },
      12,
      `Missionaries in ${prov.name}`,
    ),
  };
}

export function resurrectAncientFaith(
  state: GameState,
  religionId: ReligionId,
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };
  const decision = ANCIENT_FAITH_DECISIONS.find((d) => d.religionId === religionId);
  if (!decision) return { state, error: 'Unknown ancient faith.' };
  if (player.resurrectedFaithId === religionId) return { state, error: 'Ancient faith already adopted!' };
  if (player.treasury < decision.costPln) return { state, error: `Requires ${decision.costPln} PLN.` };
  if (player.diplomacyPoints < decision.costDp) return { state, error: `Requires ${decision.costDp} DP.` };

  const nextProvs = { ...state.provinces };
  for (const p of Object.values(nextProvs)) {
    if (p.ownerId === player.id) {
      nextProvs[p.id] = {
        ...p,
        religion: religionId,
        religionAdherence: p.isCapital ? 92 : 76,
      };
    }
  }

  return {
    state: grantCommanderXp(
      {
        ...state,
        provinces: nextProvs,
        countries: {
          ...state.countries,
          [player.id]: {
            ...player,
            treasury: Number((player.treasury - decision.costPln).toFixed(1)),
            diplomacyPoints: player.diplomacyPoints - decision.costDp,
            religion: religionId,
            religionAdherence: 88,
            resurrectedFaithId: religionId,
            stability: Math.min(100, player.stability + 8),
            legacyPoints: (player.legacyPoints ?? 0) + (religionId === 'roman_pantheon' ? 50 : 25),
          },
        },
        chronicle: [
          {
            id: `chr_faith_${state.totalDays}_${Date.now()}`,
            turn: state.turn,
            day: state.day,
            year: state.year,
            monthIndex: state.monthIndex,
            type: 'event' as const,
            title: decision.name[lang],
            detail: `${player.displayName} revived an ancient civilization faith!`,
            countryIds: [player.id],
          },
          ...state.chronicle,
        ].slice(0, 120),
      },
      60,
      decision.name.en,
    ),
  };
}

export function reformHistoricEmpire(
  state: GameState,
  empireId: string,
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };
  const def = REFORMABLE_EMPIRES.find((e) => e.id === empireId);
  if (!def) return { state, error: 'Unknown historic empire.' };
  if (player.reformedEmpireId === empireId) return { state, error: 'Empire already proclaimed!' };
  const ownedCount = Object.values(state.provinces).filter((p) => p.ownerId === player.id).length;
  if (ownedCount < def.requiredProvincesOwned) {
    return {
      state,
      error: `Requires controlling at least ${def.requiredProvincesOwned} provinces (you have ${ownedCount}).`,
    };
  }
  if (player.treasury < def.costPln) return { state, error: `Requires ${def.costPln} PLN.` };
  if (player.diplomacyPoints < def.costDp) return { state, error: `Requires ${def.costDp} DP.` };

  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: {
          ...state.countries,
          [player.id]: {
            ...player,
            displayName: def.name[lang].replace(/^(Form|Restore|Reform|Unite|Proclaim|Odtwórz|Ogłoś|Przywróć|Zjednocz)\s+/i, ''),
            color: def.newColorHex,
            treasury: Number((player.treasury - def.costPln).toFixed(1)),
            diplomacyPoints: player.diplomacyPoints - def.costDp,
            stability: Math.min(100, player.stability + 15),
            manpower: Math.min(player.maxManpower, player.manpower + 55000),
            legacyPoints: (player.legacyPoints ?? 0) + 100,
            reformedEmpireId: empireId,
          },
        },
        chronicle: [
          {
            id: `chr_emp_${state.totalDays}_${Date.now()}`,
            turn: state.turn,
            day: state.day,
            year: state.year,
            monthIndex: state.monthIndex,
            type: 'event' as const,
            title: def.name[lang],
            detail: `${player.displayName} proclaimed a grand historic empire!`,
            countryIds: [player.id],
          },
          ...state.chronicle,
        ].slice(0, 120),
      },
      120,
      def.name.en,
    ),
  };
}

export function recruitGeneral(
  state: GameState,
  specialty: MilitaryGeneral['specialty'],
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };
  const cost = 22;
  if (player.treasury < cost) return { state, error: `Commissioning a general requires ${cost} PLN.` };

  const gen = generateGeneralForCountry(player.id, specialty, (player.generals?.length ?? 0) + state.turn);
  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: {
          ...state.countries,
          [player.id]: {
            ...player,
            treasury: Number((player.treasury - cost).toFixed(1)),
            generals: [...(player.generals ?? []), gen],
          },
        },
        notifications: [
          {
            id: `notif_gen_${Date.now()}`,
            type: 'info' as const,
            title: lang === 'pl' ? 'Mianowano Generała' : 'General Commissioned',
            message: `${gen.name} (${specialty.toUpperCase()} Lv.1)`,
            createdAt: Date.now(),
          },
          ...state.notifications,
        ].slice(0, 10),
      },
      18,
      `Commissioned ${gen.name}`,
    ),
  };
}

export function unlockLegacyPerk(
  state: GameState,
  perkId: string,
  lang: Language = 'en',
): { state: GameState; error?: string } {
  const player = state.countries[state.playerCountryId];
  if (!player) return { state, error: 'No active player nation.' };
  const def = CIVILIZATION_LEGACY_PERKS.find((p) => p.id === perkId);
  if (!def) return { state, error: 'Unknown legacy perk.' };
  if (player.unlockedLegacyPerks?.includes(perkId)) return { state, error: 'Legacy perk already unlocked.' };
  if ((player.legacyPoints ?? 0) < def.costLegacy) {
    return { state, error: `Requires ${def.costLegacy} Civilization Legacy Points.` };
  }

  return {
    state: grantCommanderXp(
      {
        ...state,
        countries: {
          ...state.countries,
          [player.id]: {
            ...player,
            legacyPoints: (player.legacyPoints ?? 0) - def.costLegacy,
            unlockedLegacyPerks: [...(player.unlockedLegacyPerks ?? []), perkId],
            stability: perkId === 'leg_civic_harmony' ? Math.min(100, player.stability + 6) : player.stability,
          },
        },
        notifications: [
          {
            id: `notif_leg_${Date.now()}`,
            type: 'info' as const,
            title: lang === 'pl' ? 'Odblokowano Dziedzictwo' : 'Legacy Perk Unlocked',
            message: def.name[lang],
            createdAt: Date.now(),
          },
          ...state.notifications,
        ].slice(0, 10),
      },
      30,
      `Legacy: ${def.name.en}`,
    ),
  };
}
