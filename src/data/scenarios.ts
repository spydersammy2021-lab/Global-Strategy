import type { AiAggressiveness, DifficultyId, ScenarioId, UiMode, UnitType } from '../game/types';

export interface DifficultyConfig {
  id: DifficultyId;
  color: string;
  playerIncomeMult: number;
  playerAttackMult: number;
  aiBudgetMult: number;
  aiDefenseMult: number;
  aiEconomyMult: number;
  aiWarAggrMult: number;
  aiStartBudgetMult: number;
  antiPlayerCoalitionBias: number;
}

export const V4_DIFFICULTY_ORDER: DifficultyId[] = [
  'very_easy_plus',
  'very_easy',
  'easy',
  'normal',
  'hard',
  'extreme',
  'extreme_plus',
  'impossible',
  'extreme_ultra_impossible',
];

export const DIFFICULTIES: Record<DifficultyId, DifficultyConfig> = {
  very_easy_plus: {
    id: 'very_easy_plus',
    color: '#FBBF24',
    playerIncomeMult: 2.5,
    playerAttackMult: 1.8,
    aiBudgetMult: 0.6,
    aiDefenseMult: 0.72,
    aiEconomyMult: 0.6,
    aiWarAggrMult: 0.2,
    aiStartBudgetMult: 0.6,
    antiPlayerCoalitionBias: 0,
  },
  very_easy: {
    id: 'very_easy',
    color: '#34D399',
    playerIncomeMult: 2.0,
    playerAttackMult: 1.5,
    aiBudgetMult: 0.7,
    aiDefenseMult: 0.8,
    aiEconomyMult: 0.7,
    aiWarAggrMult: 0.35,
    aiStartBudgetMult: 0.7,
    antiPlayerCoalitionBias: 0,
  },
  easy: {
    id: 'easy',
    color: '#4ADE80',
    playerIncomeMult: 1.45,
    playerAttackMult: 1.25,
    aiBudgetMult: 0.85,
    aiDefenseMult: 0.9,
    aiEconomyMult: 0.85,
    aiWarAggrMult: 0.65,
    aiStartBudgetMult: 0.85,
    antiPlayerCoalitionBias: 0,
  },
  normal: {
    id: 'normal',
    color: '#38BDF8',
    playerIncomeMult: 1.0,
    playerAttackMult: 1.0,
    aiBudgetMult: 1.0,
    aiDefenseMult: 1.0,
    aiEconomyMult: 1.0,
    aiWarAggrMult: 1.0,
    aiStartBudgetMult: 1.0,
    antiPlayerCoalitionBias: 0,
  },
  hard: {
    id: 'hard',
    color: '#FB923C',
    playerIncomeMult: 0.88,
    playerAttackMult: 0.92,
    aiBudgetMult: 1.25,
    aiDefenseMult: 1.12,
    aiEconomyMult: 1.25,
    aiWarAggrMult: 1.35,
    aiStartBudgetMult: 1.25,
    antiPlayerCoalitionBias: 0.2,
  },
  extreme: {
    id: 'extreme',
    color: '#F43F5E',
    playerIncomeMult: 0.75,
    playerAttackMult: 0.85,
    aiBudgetMult: 1.5,
    aiDefenseMult: 1.35,
    aiEconomyMult: 1.5,
    aiWarAggrMult: 1.75,
    aiStartBudgetMult: 1.5,
    antiPlayerCoalitionBias: 0.55,
  },
  extreme_plus: {
    id: 'extreme_plus',
    color: '#C084FC',
    playerIncomeMult: 0.65,
    playerAttackMult: 0.78,
    aiBudgetMult: 1.85,
    aiDefenseMult: 1.55,
    aiEconomyMult: 1.85,
    aiWarAggrMult: 2.2,
    aiStartBudgetMult: 1.8,
    antiPlayerCoalitionBias: 1.0,
  },
  impossible: {
    id: 'impossible',
    color: '#DC2626',
    playerIncomeMult: 0.55,
    playerAttackMult: 0.72,
    aiBudgetMult: 2.2,
    aiDefenseMult: 1.75,
    aiEconomyMult: 2.15,
    aiWarAggrMult: 2.6,
    aiStartBudgetMult: 2.1,
    antiPlayerCoalitionBias: 1.25,
  },
  extreme_ultra_impossible: {
    id: 'extreme_ultra_impossible',
    color: '#9F1239',
    playerIncomeMult: 0.45,
    playerAttackMult: 0.65,
    aiBudgetMult: 2.65,
    aiDefenseMult: 2.0,
    aiEconomyMult: 2.6,
    aiWarAggrMult: 3.2,
    aiStartBudgetMult: 2.5,
    antiPlayerCoalitionBias: 1.65,
  },
  // Legacy V3.0 save-file compatibility aliases
  world_conquest: {
    id: 'world_conquest',
    color: '#F59E0B',
    playerIncomeMult: 4.0,
    playerAttackMult: 2.5,
    aiBudgetMult: 0.55,
    aiDefenseMult: 0.65,
    aiEconomyMult: 0.6,
    aiWarAggrMult: 0.3,
    aiStartBudgetMult: 0.6,
    antiPlayerCoalitionBias: 0,
  },
  auto_pilot: {
    id: 'auto_pilot',
    color: '#22D3EE',
    playerIncomeMult: 1.45,
    playerAttackMult: 1.25,
    aiBudgetMult: 0.9,
    aiDefenseMult: 0.95,
    aiEconomyMult: 0.9,
    aiWarAggrMult: 0.75,
    aiStartBudgetMult: 0.9,
    antiPlayerCoalitionBias: 0,
  },
  extremely_easy_plus: {
    id: 'extremely_easy_plus',
    color: '#FBBF24',
    playerIncomeMult: 2.2,
    playerAttackMult: 1.65,
    aiBudgetMult: 0.65,
    aiDefenseMult: 0.75,
    aiEconomyMult: 0.65,
    aiWarAggrMult: 0.25,
    aiStartBudgetMult: 0.65,
    antiPlayerCoalitionBias: 0,
  },
  extremely_easy: {
    id: 'extremely_easy',
    color: '#34D399',
    playerIncomeMult: 2.0,
    playerAttackMult: 1.5,
    aiBudgetMult: 0.7,
    aiDefenseMult: 0.8,
    aiEconomyMult: 0.7,
    aiWarAggrMult: 0.35,
    aiStartBudgetMult: 0.7,
    antiPlayerCoalitionBias: 0,
  },
};

export const AI_AGGRESSIVENESS_CONFIG: Record<
  AiAggressiveness,
  { id: AiAggressiveness; warFreqMult: number; attackRatioMult: number; graffitiChance: number; color: string }
> = {
  friendly: { id: 'friendly', warFreqMult: 0.25, attackRatioMult: 0.65, graffitiChance: 0.04, color: '#34D399' },
  normal: { id: 'normal', warFreqMult: 1.0, attackRatioMult: 1.0, graffitiChance: 0.14, color: '#38BDF8' },
  aggressive: { id: 'aggressive', warFreqMult: 2.1, attackRatioMult: 1.45, graffitiChance: 0.3, color: '#FB923C' },
  hyper: { id: 'hyper', warFreqMult: 3.8, attackRatioMult: 2.1, graffitiChance: 0.55, color: '#F43F5E' },
};

export function isHardcoreGeopolitics(difficulty: DifficultyId, uiMode?: UiMode): boolean {
  return (
    difficulty === 'extreme' ||
    difficulty === 'extreme_plus' ||
    difficulty === 'impossible' ||
    difficulty === 'extreme_ultra_impossible' ||
    uiMode === 'ultra_realistic'
  );
}

export function getDifficultyConfig(diff?: DifficultyId | string): DifficultyConfig {
  if (!diff) return DIFFICULTIES.normal;
  return DIFFICULTIES[diff as DifficultyId] ?? DIFFICULTIES.normal;
}

export interface UnitSpec {
  id: UnitType;
  costPln: number;
  attack: number;
  defense: number;
  speedWeight: number;
  icon: 'infantry' | 'tank' | 'rocket' | 'antiair' | 'air' | 'naval' | 'train' | 'archer' | 'cavalry' | 'cannon';
}

export interface ScenarioConfig {
  id: ScenarioId;
  startYear: number;
  startMonthIndex: number; // 0..11 (10 = November)
  monthsPerTurn: number;
  isModern: boolean;
  unitRoster: UnitSpec[];
  territoryTransfers?: Record<string, string>;
  countryNameOverrides?: Record<string, string>;
  initialWars?: Array<[string, string]>;
  initialAlliances?: Array<[string, string]>;
  armyScale: number;
  strengthOverrides?: Record<string, number>;
}

export const MODERN_UNITS: UnitSpec[] = [
  { id: 'infantry', costPln: 1.0, attack: 1.0, defense: 1.15, speedWeight: 1, icon: 'infantry' },
  { id: 'tanks', costPln: 2.2, attack: 2.6, defense: 1.9, speedWeight: 1.2, icon: 'tank' },
  { id: 'rocket_artillery', costPln: 2.5, attack: 3.1, defense: 1.4, speedWeight: 1, icon: 'rocket' },
  { id: 'anti_air', costPln: 1.8, attack: 1.4, defense: 2.7, speedWeight: 1, icon: 'antiair' },
  { id: 'aviation', costPln: 3.2, attack: 3.8, defense: 2.1, speedWeight: 1.4, icon: 'air' },
  { id: 'naval_fleet', costPln: 3.0, attack: 3.4, defense: 2.9, speedWeight: 1.3, icon: 'naval' },
  { id: 'armored_train', costPln: 3.4, attack: 4.1, defense: 3.6, speedWeight: 2.6, icon: 'train' },
];

export const HISTORICAL_UNITS: UnitSpec[] = [
  { id: 'infantry', costPln: 0.9, attack: 1.0, defense: 1.2, speedWeight: 1, icon: 'infantry' },
  { id: 'archers', costPln: 1.2, attack: 1.4, defense: 1.6, speedWeight: 1, icon: 'archer' },
  { id: 'cavalry', costPln: 2.0, attack: 2.6, defense: 1.5, speedWeight: 1.3, icon: 'cavalry' },
  { id: 'artillery', costPln: 2.4, attack: 2.9, defense: 1.7, speedWeight: 0.9, icon: 'cannon' },
  { id: 'naval_fleet', costPln: 2.5, attack: 2.6, defense: 2.4, speedWeight: 1.2, icon: 'naval' },
];

export const SCENARIOS: Record<ScenarioId, ScenarioConfig> = {
  '2026': {
    id: '2026',
    startYear: 2026,
    startMonthIndex: 10,
    monthsPerTurn: 1,
    isModern: true,
    unitRoster: MODERN_UNITS,
    armyScale: 1.0,
    initialAlliances: [
      ['616', '276'],
      ['616', '440'],
      ['616', '250'],
      ['616', '826'],
      ['616', '840'],
      ['616', '203'],
      ['276', '250'],
      ['840', '826'],
    ],
    initialWars: [
      ['643', '804'],
    ],
  },
  sandbox: {
    id: 'sandbox',
    startYear: 2026,
    startMonthIndex: 0, // January 2026 Open Sandbox
    monthsPerTurn: 1,
    isModern: true,
    unitRoster: MODERN_UNITS,
    armyScale: 1.0,
    initialAlliances: [],
    initialWars: [],
  },
  '1939': {
    id: '1939',
    startYear: 1939,
    startMonthIndex: 8,
    monthsPerTurn: 1,
    isModern: false,
    unitRoster: HISTORICAL_UNITS,
    armyScale: 1.0,
    territoryTransfers: {
      '040': '276',
      '203': '276',
      '112': '643',
      '804': '643',
      '398': '643',
      '860': '643',
    },
    countryNameOverrides: {
      '616': 'II Rzeczpospolita',
      '276': 'III Rzesza',
      '643': 'ZSRR',
      '380': 'Królestwo Włoch',
      '392': 'Cesarstwo Japonii',
    },
    initialAlliances: [
      ['616', '250'],
      ['616', '826'],
      ['250', '826'],
      ['276', '380'],
    ],
    initialWars: [
      ['276', '616'],
      ['276', '250'],
      ['276', '826'],
    ],
    strengthOverrides: {
      '616': 340000,
      '276': 1250000,
      '643': 1850000,
      '250': 820000,
      '826': 680000,
      '840': 900000,
      '392': 850000,
      '380': 520000,
    },
  },
  '1918': {
    id: '1918',
    startYear: 1918,
    startMonthIndex: 10,
    monthsPerTurn: 2,
    isModern: false,
    unitRoster: HISTORICAL_UNITS,
    armyScale: 0.65,
    territoryTransfers: {
      '703': '203',
    },
    countryNameOverrides: {
      '616': 'II Rzeczpospolita',
      '276': 'Republika Weimarska',
      '643': 'Rosja Radziecka',
      '203': 'Czechosłowacja',
    },
    initialAlliances: [
      ['616', '250'],
      ['250', '826'],
      ['826', '840'],
    ],
    strengthOverrides: {
      '616': 160000,
      '276': 220000,
      '643': 650000,
      '250': 540000,
      '826': 480000,
      '840': 620000,
    },
  },
  '1619': {
    id: '1619',
    startYear: 1619,
    startMonthIndex: 4,
    monthsPerTurn: 3,
    isModern: false,
    unitRoster: HISTORICAL_UNITS,
    armyScale: 0.22,
    territoryTransfers: {
      '440': '616',
      '112': '616',
      '804': '616',
      '428': '616',
      '233': '752',
      '246': '752',
      '703': '348',
    },
    countryNameOverrides: {
      '616': 'Rzeczpospolita Obojga Narodów',
      '643': 'Carstwo Rosyjskie',
      '792': 'Imperium Osmańskie',
      '276': 'Święte Cesarstwo',
      '752': 'Królestwo Szwecji',
      '724': 'Imperium Hiszpańskie',
    },
    initialAlliances: [
      ['616', '040'],
    ],
    initialWars: [
      ['616', '792'],
    ],
    strengthOverrides: {
      '616': 78000,
      '792': 110000,
      '752': 52000,
      '643': 82000,
      '250': 85000,
      '724': 90000,
      '156': 210000,
    },
  },
  '1410': {
    id: '1410',
    startYear: 1410,
    startMonthIndex: 6,
    monthsPerTurn: 3,
    isModern: false,
    unitRoster: HISTORICAL_UNITS,
    armyScale: 0.14,
    territoryTransfers: {
      '112': '440',
      '804': '440',
      '703': '348',
    },
    countryNameOverrides: {
      '616': 'Korona Polska',
      '440': 'W. Ks. Litewskie',
      '276': 'Zakon Krzyżacki / Rzesza',
      '643': 'W. Ks. Moskiewskie',
      '792': 'Imperium Osmańskie',
      '826': 'Królestwo Anglii',
      '250': 'Królestwo Francji',
      '156': 'Dynastia Ming',
    },
    initialAlliances: [
      ['616', '440'],
      ['203', '616'],
    ],
    initialWars: [
      ['616', '276'],
      ['440', '276'],
    ],
    strengthOverrides: {
      '616': 32000,
      '440': 28000,
      '276': 34000,
      '250': 42000,
      '826': 36000,
      '792': 65000,
      '156': 160000,
    },
  },
  '966': {
    id: '966',
    startYear: 966,
    startMonthIndex: 3,
    monthsPerTurn: 6,
    isModern: false,
    unitRoster: HISTORICAL_UNITS,
    armyScale: 0.09,
    territoryTransfers: {
      '112': '804',
      '643': '804',
      '703': '348',
      '040': '276',
    },
    countryNameOverrides: {
      '616': 'Państwo Polan (Mieszko I)',
      '276': 'Święte Cesarstwo Rzymskie',
      '203': 'Księstwo Czech',
      '804': 'Ruś Kijowska',
      '348': 'Księstwo Węgier',
      '208': 'Królestwo Danii',
      '752': 'Królestwo Szwecji',
      '792': 'Cesarstwo Bizantyńskie',
      '250': 'Królestwo Francji',
      '826': 'Królestwo Anglii',
      '156': 'Dynastia Song',
    },
    initialAlliances: [
      ['616', '203'],
    ],
    initialWars: [],
    strengthOverrides: {
      '616': 16000,
      '203': 11000,
      '276': 26000,
      '804': 24000,
      '348': 14000,
      '208': 10000,
      '752': 11000,
      '792': 38000,
      '250': 22000,
      '826': 18000,
      '156': 95000,
    },
  },
};

export function getUnitSpec(scenarioId: ScenarioId, unitType: UnitType): UnitSpec {
  const roster = SCENARIOS[scenarioId].unitRoster;
  return roster.find((u) => u.id === unitType) ?? roster[0];
}
