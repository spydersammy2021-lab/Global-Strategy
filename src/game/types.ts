export type Language = 'en' | 'pl' | 'szl' | 'csb';

export type GameMode = 'player' | 'bot_spectator';

export type SimSpeed = 1 | 2 | 3 | 5;

export type SpectatorSpeed = 'paused' | '1x' | '2x' | '3x' | '5x';

export type ScenarioId = '966' | '1410' | '1619' | '1918' | '1939' | '2026' | 'sandbox';

export type DifficultyId =
  | 'auto_pilot'
  | 'extremely_easy_plus'
  | 'extremely_easy'
  | 'easy'
  | 'normal'
  | 'hard'
  | 'extreme'
  | 'extreme_plus';

export type UiMode = 'very_easy' | 'easy' | 'hard';

export type PerformanceMode = 'auto' | 'ultra' | 'medium' | 'light';

export type EffectiveTier = 'ultra' | 'medium' | 'light';

export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';

export type WeatherKind = 'sunny' | 'rain' | 'snow' | 'fog';

export type BuildingType =
  | 'factory'
  | 'farm'
  | 'barracks'
  | 'port'
  | 'fort'
  | 'university'
  | 'coastal_defense'
  | 'missile_silo'
  | 'spaceport';

export type UnitType =
  | 'infantry'
  | 'tanks'
  | 'rocket_artillery'
  | 'anti_air'
  | 'aviation'
  | 'naval_fleet'
  | 'archers'
  | 'cavalry'
  | 'artillery';

export type UnitBreakdown = Partial<Record<UnitType, number>>;

export interface FlagPattern {
  type: 'h2' | 'h3' | 'v3' | 'cross' | 'canton' | 'circle' | 'diagonal' | 'bicolor_star';
  colors: [string, string, string?];
  emblemColor?: string;
}

export interface CountryMeta {
  id: string;
  alpha2: string;
  name: Record<Language, string>;
  areaKm2: number;
  populationM: number;
  color: string;
  flag: FlagPattern;
  provinceNames?: string[];
  isCoastal?: boolean;
  startingArmy2026?: number;
  gdpFactor?: number;
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
  name: string;
  capitalCity?: string;
  ownerId: string;
  originalCountryId: string;
  areaKm2: number;
  population: number;
  economy: number;
  buildings: BuildingType[];
  units: UnitBreakdown;
  neighbors: string[];
  seaNeighbors: string[];
  centroid: [number, number];
  isCapital: boolean;
  assimilated: boolean;
  weather: WeatherKind;
  nuclearDevastation?: number; // 0..100
}

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

export interface TechLevels {
  military: number;
  economy: number;
  logistics: number;
}

export interface LoanRecord {
  id: string;
  remainingTotal: number;
  perTurnPayment: number;
  turnsLeft: number;
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

export type IdeologyId = 'democracy' | 'republic' | 'monarchy' | 'technocracy' | 'autocracy';

export type MinisterRole = 'defense' | 'finance' | 'science' | 'intelligence';

export interface MinisterChoice {
  id: string;
  role: MinisterRole;
  name: Record<Language, string>;
  bonusText: Record<Language, string>;
  attackBonus?: number;
  economyBonus?: number;
  researchBonus?: number;
  spyBonus?: number;
}

export type CommodityId = 'energy' | 'steel' | 'rare_earths' | 'grain';

export type MegaprojectId =
  | 'transcontinental_rail'
  | 'orbital_defense_grid'
  | 'fusion_core'
  | 'deep_ocean_arcology';

export interface CountryState {
  id: string;
  name: Record<Language, string>;
  displayName: string;
  color: string;
  flag: FlagPattern;
  treasury: number;
  manpower: number;
  maxManpower: number;
  researchPoints: number;
  stability: number; // 0-100
  taxRate: number; // 5-45 (%)
  loans: LoanRecord[];
  movementPoints: number;
  maxMovementPoints: number;
  diplomacyPoints: number;
  maxDiplomacyPoints: number;
  tech: TechLevels;
  unlockedTechs: TechNodeId[];
  techQueue: TechNodeId[];
  ideology: IdeologyId;
  nextElectionDay: number;
  cabinet: Record<MinisterRole, string | null>;
  stockpiles: Record<CommodityId, number>;
  nuclearWarheads: number;
  orbitalShieldActive: boolean;
  goldenAgeDaysLeft: number;
  megaprojects: MegaprojectId[];
  spaceColonies: string[]; // SpaceOceanNodeId[]
  allies: string[];
  atWarWith: string[];
  nonAggressionWith: Record<string, number>;
  militaryAccessWith: string[];
  truceWith: Record<string, number>;
  vassalOf: string | null;
  vassals: string[];
  spiedUntil: number;
  isPlayer: boolean;
  eliminated: boolean;
}

export interface ArmyOrder {
  id: string;
  countryId: string;
  fromProvinceId: string;
  toProvinceId: string;
  units: UnitBreakdown;
  isAttack: boolean;
  isNaval: boolean;
  startDay: number;
  durationDays: number;
  progress: number; // 0..1
}

export interface MissileStrikeVisual {
  id: string;
  fromCentroid: [number, number];
  toCentroid: [number, number];
  isNuclear: boolean;
  intercepted: boolean;
  createdAt: number;
}

export type MapPulseKind = 'recruit' | 'battle' | 'airlift' | 'climate' | 'nuclear' | 'comeback';

export interface MapPulseEvent {
  id: string;
  kind: MapPulseKind;
  centroid: [number, number];
  color: string;
  createdAt: number;
  label?: string;
}

export interface AirliftOrderVisual {
  id: string;
  countryId: string;
  fromProvinceId: string;
  toProvinceId: string;
  fromCentroid: [number, number];
  toCentroid: [number, number];
  troops: number;
  createdAt: number;
}

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

export interface WaterAlert {
  id: string;
  regionKey: 'baltic' | 'atlantic' | 'mediterranean' | 'pacific';
  severity: 'storm' | 'coastal_flood';
  affectedProvinceIds: string[];
  expiresDay: number;
  centroid: [number, number];
}

export interface ChronicleEntry {
  id: string;
  turn: number;
  day: number;
  year: number;
  monthIndex: number;
  type: 'war' | 'peace' | 'conquest' | 'alliance' | 'vassal' | 'event' | 'nuclear' | 'space' | 'council';
  title: string;
  detail: string;
  countryIds: string[];
}

export interface RandomEventChoice {
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
  choices: RandomEventChoice[];
}

export interface GameNotification {
  id: string;
  type: 'war' | 'peace' | 'alliance' | 'conquest' | 'defeat' | 'aid' | 'info' | 'intel' | 'alert';
  title: string;
  message: string;
  createdAt: number;
}

export interface WorldCouncilState {
  activeResolutionId: string;
  yesVotes: number;
  noVotes: number;
  playerVoted: 'yes' | 'no' | null;
  passedEffects: string[];
  nextVoteDay: number;
}

export interface GlobalMarketState {
  prices: Record<CommodityId, number>;
  trends: Record<CommodityId, 'up' | 'down' | 'flat'>;
}

export interface TimelapseSnapshot {
  totalDays: number;
  year: number;
  monthIndex: number;
  owners: Record<string, string>; // provinceId -> ownerId
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

export interface GameState {
  gameMode: GameMode;
  scenarioId: ScenarioId;
  difficulty: DifficultyId;
  autoPilotEnabled: boolean;
  autoPilotLastAirliftAt: number;
  comebackTriggeredCount: number;
  lastComebackDay: number;
  turn: number; // Monthly economy cycles completed (starts at 1)
  totalDays: number; // Continuous real-time simulation days elapsed
  day: number; // Day of month 1..30
  monthIndex: number; // 0-11
  year: number;
  season: SeasonId;
  simPaused: boolean;
  simSpeed: SimSpeed;
  playerCountryId: string;
  provinces: Record<string, ProvinceState>;
  countries: Record<string, CountryState>;
  orders: ArmyOrder[];
  recentBattles: BattleEvent[];
  recentMissiles: MissileStrikeVisual[];
  mapPulses: MapPulseEvent[];
  airliftVisuals: AirliftOrderVisual[];
  waterAlerts: WaterAlert[];
  nuclearWinterLevel: number; // 0..100
  globalWarmingIndex: number; // 0..100
  worldCouncil: WorldCouncilState;
  globalMarket: GlobalMarketState;
  timelapseSnapshots: TimelapseSnapshot[];
  chronicle: ChronicleEntry[];
  pendingEvent: PendingRandomEvent | null;
  notifications: GameNotification[];
  outcome: 'ongoing' | 'victory' | 'defeat';
  peakAreaKm2: number;
  warsWon: number;
  battlesFought: number;
}

export type AuthMethod = 'password' | 'pin';

export type RankId = 'rekrut' | 'kapitan' | 'general' | 'marszalek';

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

export interface HallOfFameEntry {
  id: string;
  nickname: string;
  accountId: string;
  countryName: string;
  scenarioId: ScenarioId;
  turn: number;
  areaKm2: number;
  powerScore: number;
  recordedAt: number;
}

export interface SaveSlot {
  id: string;
  accountId: string;
  label: string;
  scenarioId: ScenarioId;
  playerCountryId: string;
  turn: number;
  year: number;
  areaKm2: number;
  savedAt: number;
  state: GameState;
}
