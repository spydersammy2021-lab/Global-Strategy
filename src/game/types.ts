export type Language = 'en' | 'pl' | 'szl' | 'csb';

export type RankId = 'rekrut' | 'kapitan' | 'general' | 'marszalek';

export type CommanderRankId =
  | 'cadet'
  | 'tactician'
  | 'general'
  | 'field_marshal'
  | 'world_emperor'
  | 'galactic_sovereign';

export type GameMode = 'player' | 'bot_spectator';

export type UiMode = 'very_easy' | 'easy' | 'hard' | 'extended' | 'ultra_realistic';

export type PerformanceMode = 'auto' | 'ultra' | 'medium' | 'light';

export type EffectiveTier = 'ultra' | 'medium' | 'light';

export type SimSpeed = 1 | 2 | 3 | 5;

export type FpsLimit = 60 | 120 | 144 | 165 | 240 | 'unlimited';

export type AiAggressiveness = 'friendly' | 'normal' | 'aggressive' | 'hyper';

export type MapOverlayMode =
  | 'political'
  | 'thermal'
  | 'religions'
  | 'cultures'
  | 'economy'
  | 'resources'
  | 'diplomacy'
  | 'logistics';

export type DifficultyId =
  | 'very_easy_plus'
  | 'very_easy'
  | 'easy'
  | 'normal'
  | 'hard'
  | 'extreme'
  | 'extreme_plus'
  | 'impossible'
  | 'extreme_ultra_impossible'
  | 'extremely_easy_plus'
  | 'extremely_easy'
  | 'world_conquest'
  | 'auto_pilot';

export type ScenarioId = '2026' | 'sandbox' | '1939' | '1918' | '1619' | '1410' | '966';

export type IdeologyId = 'democracy' | 'republic' | 'monarchy' | 'technocracy' | 'autocracy';

export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';

export type WeatherKind = 'sunny' | 'rain' | 'snow' | 'fog';

export type ReligionId =
  | 'catholic'
  | 'protestant'
  | 'orthodox'
  | 'sunni'
  | 'shia'
  | 'hindu'
  | 'buddhist'
  | 'east_asian'
  | 'judaism'
  | 'secular'
  | 'slavic_rodzimowierstwo'
  | 'norse_asatru'
  | 'hellenic'
  | 'roman_pantheon';

export type CultureId =
  | 'west_slavic'
  | 'east_slavic'
  | 'south_slavic'
  | 'germanic'
  | 'romance'
  | 'anglo_celtic'
  | 'nordic'
  | 'baltic'
  | 'turkic'
  | 'arabic_semitic'
  | 'persian'
  | 'indic'
  | 'sinic'
  | 'japonic_korean'
  | 'sub_saharan'
  | 'latin_american'
  | 'oceanic'
  | 'arctic_research';

export type ResourceKind =
  | 'oil_gas'
  | 'coal_steel'
  | 'rare_earths'
  | 'grain_timber'
  | 'uranium'
  | 'hydro_tech';

export type UnitType =
  | 'infantry'
  | 'tanks'
  | 'rocket_artillery'
  | 'anti_air'
  | 'aviation'
  | 'naval_fleet'
  | 'armored_train'
  | 'archers'
  | 'cavalry'
  | 'artillery';

export type CustomUnitCategory = UnitType;

export type BuildingType =
  | 'factory'
  | 'workshop'
  | 'farm'
  | 'barracks'
  | 'port'
  | 'fort'
  | 'castle'
  | 'university'
  | 'library'
  | 'railway'
  | 'coastal_defense'
  | 'airbase'
  | 'armory'
  | 'nuclear_reactor'
  | 'missile_silo'
  | 'spaceport';

export type CommodityId = 'energy' | 'steel' | 'rare_earths' | 'grain';

export type CabinetRole = 'defense' | 'finance' | 'science' | 'intelligence';
export type MinisterRole = CabinetRole;

export type MegaprojectId =
  | 'transcontinental_rail'
  | 'orbital_defense_grid'
  | 'fusion_core'
  | 'deep_ocean_arcology';

export type BlackOpType = 'sabotage' | 'foment_rebels' | 'steal_tech' | 'graffiti_vandalism';

export type StraitBlockadeId = 'baltic' | 'gibraltar' | 'suez' | 'malacca';

export type TechBranch = 'military' | 'economy' | 'logistics';

export type TechNodeId =
  | 'mil_doctrine'
  | 'mil_armor'
  | 'mil_aerospace'
  | 'mil_missiles'
  | 'mil_thermonuclear'
  | 'eco_guilds'
  | 'eco_banking'
  | 'eco_automation'
  | 'eco_fusion'
  | 'eco_offworld_mining'
  | 'log_supply'
  | 'log_naval_corridors'
  | 'log_orbital_shields'
  | 'log_lunar_mars'
  | 'log_europa_ocean';

export type FlagEmblemKind =
  | 'none'
  | 'eagle_crown'
  | 'montenegro_eagle'
  | 'cyprus_island'
  | 'albania_eagle'
  | 'serbia_eagle'
  | 'croatia_check'
  | 'bosnia_triangle'
  | 'kosovo_map'
  | 'slovenia_triglav'
  | 'slovakia_cross'
  | 'czech_wedge'
  | 'crescent_star'
  | 'crescent_star_left'
  | 'star_center'
  | 'star_canton'
  | 'usa_stars'
  | 'union_jack'
  | 'maple'
  | 'sun_disc'
  | 'taegeuk'
  | 'taiwan_canton'
  | 'israel_star'
  | 'cedar'
  | 'chakra'
  | 'brazil_globe'
  | 'argentina_sun'
  | 'uruguay_sun'
  | 'mexico_eagle'
  | 'spain_crest'
  | 'portugal_crest'
  | 'swiss_cross'
  | 'nordic_cross'
  | 'greek_cross'
  | 'kazakh_sun'
  | 'kyrgyz_sun'
  | 'sri_lanka_lion'
  | 'cambodia_angkor'
  | 'bhutan_dragon'
  | 'saudi_sword'
  | 'south_africa_y'
  | 'kenya_shield'
  | 'ukraine_trident'
  | 'antarctica_compass';

export interface FlagPattern {
  layout?:
    | 'bicolor_v'
    | 'bicolor_h'
    | 'tricolor_v'
    | 'tricolor_h'
    | 'nordic'
    | 'cross'
    | 'triangle_left'
    | 'stripes'
    | 'solid'
    | 'diagonal';
  type?: 'h2' | 'h3' | 'v3' | 'cross' | 'canton' | 'circle' | 'diagonal' | 'bicolor_star';
  colors: string[];
  emblem?: string;
  emblemColor?: string;
  emblemKind?: FlagEmblemKind;
  borderHex?: string;
  customDataUrl?: string;
}

export interface CountryMeta {
  id: string;
  alpha2: string;
  name: Record<Language, string>;
  areaKm2: number;
  populationM: number;
  color: string;
  flag: FlagPattern;
  startingArmy2026: number;
  provinceNames?: string[];
  gdpFactor: number;
}

export interface CustomNationConfig {
  id: string;
  name: string;
  capitalName: string;
  ideology: IdeologyId;
  colorHex: string;
  flag: FlagPattern;
  provinceIds: string[];
  religion: ReligionId;
  culture: CultureId;
}

export type UnitBreakdown = Partial<Record<UnitType, number>>;

export interface UnitSpec {
  id: UnitType;
  costPln: number;
  attack: number;
  defense: number;
  minEraScenario?: ScenarioId;
}

export interface BudgetSliders {
  taxRate: number; // 5..40
  goodsSpending: number; // 0..30
  investmentsSpending: number; // 0..30
  researchSpending: number; // 0..30
  militarySpending: number; // 50..150 %
}

export interface MilitaryGeneral {
  id: string;
  name: string;
  countryId: string;
  level: number;
  xp: number;
  specialty: 'infantry' | 'armor' | 'artillery' | 'logistics' | 'siege';
  attackBonus: number;
  defenseBonus: number;
  speedBonus: number;
}

export interface ProvinceGeometry {
  id: string;
  countryOrigId: string;
  name: string;
  capitalCity?: string;
  rings: Array<Array<[number, number]>>;
  centroid: [number, number];
  areaShare: number;
  popShare?: number;
  explicitAreaKm2?: number;
  isCoastal: boolean;
}

export interface ProvinceState {
  id: string;
  countryOrigId?: string;
  originalCountryId: string;
  name: string;
  capitalCity?: string;
  isCapital: boolean;
  ownerId: string;
  population: number;
  economy: number;
  development: number;
  happiness: number;
  assimilationProgress: number;
  religion: ReligionId;
  religionAdherence: number; // 0..100
  culture: CultureId;
  resource: ResourceKind;
  areaKm2: number;
  assimilated: boolean;
  weather: WeatherKind;
  temperatureC: number;
  buildings: BuildingType[];
  units: UnitBreakdown;
  neighbors: string[];
  seaNeighbors: string[];
  centroid: [number, number];
  nuclearDevastation?: number;
  plunderCooldownDay?: number;
  graffitiTag?: {
    slogan: string;
    attackerId: string;
    timestamp: number;
  } | null;
}

export interface LoanRecord {
  id: string;
  principal?: number;
  remainingTotal: number;
  perTurnPayment: number;
  turnsLeft: number;
}

export interface MarketState {
  prices: Record<CommodityId, number>;
  trends: Record<CommodityId, 'up' | 'down' | 'flat'>;
}

export interface MinisterChoice {
  id: string;
  role: CabinetRole;
  name: Record<Language, string>;
  bonusText: Record<Language, string>;
  attackBonus?: number;
  economyBonus?: number;
  researchBonus?: number;
  spyBonus?: number;
}

export interface CustomUnitBlueprint {
  id: string;
  name: string;
  category: UnitType;
  armor: number;
  speed: number;
  firepower: number;
  createdAt?: number;
}

export interface CountryState {
  id: string;
  name: Record<Language, string>;
  displayName: string;
  capitalName?: string;
  color: string;
  ideology: IdeologyId;
  flag: FlagPattern;
  isPlayer: boolean;
  treasury: number;
  manpower: number;
  maxManpower: number;
  researchPoints: number;
  stability: number;
  taxRate: number;
  budgetSliders: BudgetSliders;
  movementPoints: number;
  maxMovementPoints: number;
  diplomacyPoints: number;
  maxDiplomacyPoints: number;
  tech: {
    military: number;
    economy: number;
    logistics: number;
  };
  unlockedTechs: TechNodeId[];
  techQueue: TechNodeId[];
  loans: LoanRecord[];
  spiedUntil: number;
  atWarWith: string[];
  allies: string[];
  truceWith: Record<string, number>;
  nonAggressionWith: Record<string, number>;
  militaryAccessWith: string[];
  relations: Record<string, number>; // -100..+100
  guarantees: string[];
  sanctionedBy: string[];
  lendLeaseTo: string[];
  vassalOf: string | null;
  vassals: string[];
  vassalTributePct: number;
  eliminated: boolean;
  nextElectionDay?: number;
  nuclearWarheads: number;
  orbitalShieldActive: boolean;
  spaceColonies: string[];
  megaprojects: MegaprojectId[];
  cabinet: Record<CabinetRole, string | null>;
  stockpiles: Record<CommodityId, number>;
  goldenAgeDaysLeft: number;
  generals: MilitaryGeneral[];
  religion: ReligionId;
  religionAdherence: number;
  culture: CultureId;
  legacyPoints: number;
  unlockedLegacyPerks: string[];
  reformedEmpireId?: string | null;
  resurrectedFaithId?: ReligionId | null;
}

export interface ArmyOrder {
  id: string;
  countryId: string;
  fromProvinceId: string;
  toProvinceId: string;
  units: UnitBreakdown;
  progress: number;
  startDay: number;
  durationDays: number;
  isAttack: boolean;
  isNaval: boolean;
  isRail?: boolean;
  isAirlift?: boolean;
}

export interface AirliftOrderVisual {
  id: string;
  countryId: string;
  fromProvinceId?: string;
  toProvinceId?: string;
  fromCentroid: [number, number];
  toCentroid: [number, number];
  troops: number;
  createdAt: number;
}
export type AirliftVisual = AirliftOrderVisual;

export interface MapPulseEvent {
  id: string;
  centroid: [number, number];
  kind: 'recruit' | 'battle' | 'airlift' | 'climate' | 'comeback' | 'nuclear' | 'graffiti';
  color: string;
  label?: string;
  createdAt: number;
}
export type MapPulse = MapPulseEvent;

export interface GraffitiMissionVisual {
  id: string;
  provinceId: string;
  cityName: string;
  attackerId: string;
  slogan: string;
  centroid: [number, number];
  createdAt: number;
}

export interface XpPopupEvent {
  id: string;
  amount: number;
  reason: string;
  createdAt: number;
}

export interface PendingWarPrompt {
  id: string;
  attackerId: string;
  attackerName: string;
  totalAttackerArmy: number;
  coalitionAllies: string[];
  vetoDpCost: number;
  vetoAllowed: boolean;
  reason: string;
}

export interface PeaceTreatyDraft {
  enemyId: string;
  demandedProvinceIds: string[];
  warReparations: boolean;
  demilitarize: boolean;
  forceVassalize: boolean;
}

export interface WaterAlert {
  id: string;
  regionKey: 'baltic' | 'atlantic' | 'mediterranean' | 'pacific';
  severity: 'storm' | 'coastal_flood';
  affectedProvinceIds: string[];
  expiresDay: number;
  centroid: [number, number];
}

export interface MissileStrikeVisual {
  id: string;
  fromCentroid: [number, number];
  toCentroid: [number, number];
  isNuclear: boolean;
  intercepted: boolean;
  createdAt: number;
}
export type MissileVisual = MissileStrikeVisual;

export interface BattleEvent {
  id: string;
  provinceId: string;
  provinceName: string;
  attackerId: string;
  defenderId: string;
  attackerPower: number;
  defenderPower: number;
  attackerLosses: number;
  defenderLosses: number;
  attackerWon: boolean;
  captured: boolean;
  centroid: [number, number];
  timestamp: number;
}

export interface PendingRandomEventChoice {
  id: string;
  label: string;
  treasuryDelta?: number;
  stabilityDelta?: number;
  manpowerDelta?: number;
  researchDelta?: number;
  goldenAgeDays?: number;
  climateDelta?: number;
  provinceEconomyDelta?: number;
  weatherShift?: WeatherKind;
}

export interface PendingRandomEvent {
  id: string;
  title: string;
  description: string;
  isClimateEvent?: boolean;
  targetProvinceId?: string;
  targetProvinceName?: string;
  choices: PendingRandomEventChoice[];
}
export type RandomEvent = PendingRandomEvent;

export interface WorldCouncilState {
  activeResolutionId: string;
  yesVotes: number;
  noVotes: number;
  playerVoted: 'yes' | 'no' | null;
  passedEffects: string[];
  nextVoteDay: number;
}

export interface TimelapseFrame {
  totalDays: number;
  year: number;
  monthIndex: number;
  owners: Record<string, string>;
}

export interface SpySatelliteMission {
  id: string;
  ownerCountryId: string;
  targetCountryId: string;
  expiresDay: number;
  centroid: [number, number];
}

export interface CustomScenarioConfig {
  id: string;
  name: string;
  baseScenarioId: ScenarioId;
  provinceOwnerOverrides: Record<string, string>;
  treasuryOverrides: Record<string, number>;
  armyMultipliers: Record<string, number>;
  wars: Array<[string, string]>;
  alliances: Array<[string, string]>;
  createdAt: number;
}

export interface ChronicleEntry {
  id: string;
  turn: number;
  day: number;
  year: number;
  monthIndex: number;
  type: 'war' | 'peace' | 'alliance' | 'conquest' | 'vassal' | 'tech' | 'event' | 'nuclear' | 'space' | 'graffiti';
  title: string;
  detail: string;
  countryIds: string[];
}

export interface GameNotification {
  id: string;
  type: 'war' | 'peace' | 'alliance' | 'conquest' | 'defeat' | 'aid' | 'intel' | 'info' | 'alert' | 'xp';
  title: string;
  message: string;
  createdAt: number;
}

export interface BudgetBreakdown {
  taxIncome: number;
  factoryAndPortIncome: number;
  tradeIncome: number;
  vassalTributeIncome: number;
  spaceOceanIncome: number;
  armyUpkeep: number;
  buildingUpkeep: number;
  loanPayments: number;
  vassalTributePaid: number;
  netPerTurn: number;
}

export interface GameState {
  gameMode: GameMode;
  scenarioId: ScenarioId;
  difficulty: DifficultyId;
  aiAggressiveness: AiAggressiveness;
  uiMode: UiMode;
  peacefulStartEnabled: boolean;
  eternalEmpireMode: boolean;
  autoPilotEnabled: boolean;
  autoPilotLastAirliftAt: number;
  autoPilotNextAirliftAt: number;
  comebackTriggeredCount: number;
  lastComebackDay: number;
  turn: number;
  totalDays: number;
  day: number;
  monthIndex: number;
  year: number;
  season: SeasonId;
  simPaused: boolean;
  simSpeed: SimSpeed;
  globalWarmingIndex: number;
  playerCountryId: string;
  provinces: Record<string, ProvinceState>;
  countries: Record<string, CountryState>;
  orders: ArmyOrder[];
  recentBattles: BattleEvent[];
  recentMissiles: MissileStrikeVisual[];
  mapPulses: MapPulseEvent[];
  airliftVisuals: AirliftOrderVisual[];
  graffitiVisuals: GraffitiMissionVisual[];
  xpPopups: XpPopupEvent[];
  commanderXp: number;
  commanderLevel: number;
  commanderRankId: CommanderRankId;
  waterAlerts: WaterAlert[];
  nuclearWinterLevel: number;
  customBlueprints: CustomUnitBlueprint[];
  activeSatellites: SpySatelliteMission[];
  blockadedStraits: Partial<Record<StraitBlockadeId, string>>;
  worldCouncil: WorldCouncilState;
  globalMarket: MarketState;
  timelapseSnapshots: TimelapseFrame[];
  chronicle: ChronicleEntry[];
  pendingEvent: PendingRandomEvent | null;
  pendingWarPrompt: PendingWarPrompt | null;
  notifications: GameNotification[];
  outcome: 'ongoing' | 'victory' | 'defeat';
  peakAreaKm2: number;
  warsWon: number;
  battlesFought: number;
  customNation?: CustomNationConfig | null;
}

export type AuthMethod = 'password' | 'pin';

export interface AccountStats {
  turnsPlayed: number;
  warsWon: number;
  largestAreaKm2: number;
  campaignsCompleted: number;
}

export interface BlocksAccount {
  id: string;
  nickname: string;
  email?: string;
  avatarId: string;
  authMethod: AuthMethod;
  secretHash: string;
  createdAt: number;
  stats: AccountStats;
  isGuest?: boolean;
}

export interface SaveSlot {
  id: string;
  accountId: string;
  label: string;
  scenarioId: ScenarioId;
  countryId: string;
  turn: number;
  year: number;
  areaKm2: number;
  savedAt: number;
  state: GameState;
}

export interface HallOfFameEntry {
  id: string;
  accountId: string;
  nickname: string;
  avatarId?: string;
  scenarioId: ScenarioId;
  countryId?: string;
  countryName: string;
  difficulty?: DifficultyId;
  powerScore: number;
  areaKm2: number;
  turns: number;
  recordedAt: number;
}
