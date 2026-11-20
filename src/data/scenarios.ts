import type { DifficultyId, ScenarioId, UnitType } from '../game/types';

export interface DifficultyConfig {
  id: DifficultyId;
  color: string;
  playerIncomeMult: number;
  playerAttackMult: number;
  aiBudgetMult: number;
  aiDefenseMult: number;
  aiEconomyMult: number;
}

export const DIFFICULTIES: Record<DifficultyId, DifficultyConfig> = {
  very_easy: {
    id: 'very_easy',
    color: '#22C55E',
    playerIncomeMult: 1.5,
    playerAttackMult: 1.3,
    aiBudgetMult: 0.85,
    aiDefenseMult: 0.9,
    aiEconomyMult: 0.9,
  },
  easy: {
    id: 'easy',
    color: '#3B82F6',
    playerIncomeMult: 1.25,
    playerAttackMult: 1.0,
    aiBudgetMult: 0.95,
    aiDefenseMult: 1.0,
    aiEconomyMult: 1.0,
  },
  normal: {
    id: 'normal',
    color: '#EAB308',
    playerIncomeMult: 1.0,
    playerAttackMult: 1.0,
    aiBudgetMult: 1.0,
    aiDefenseMult: 1.0,
    aiEconomyMult: 1.0,
  },
  hard: {
    id: 'hard',
    color: '#F97316',
    playerIncomeMult: 1.0,
    playerAttackMult: 1.0,
    aiBudgetMult: 1.2,
    aiDefenseMult: 1.08,
    aiEconomyMult: 1.15,
  },
  extreme: {
    id: 'extreme',
    color: '#EF4444',
    playerIncomeMult: 1.0,
    playerAttackMult: 1.0,
    aiBudgetMult: 1.4,
    aiDefenseMult: 1.4,
    aiEconomyMult: 1.4,
  },
  extreme_plus: {
    id: 'extreme_plus',
    color: '#DC2626',
    playerIncomeMult: 1.0,
    playerAttackMult: 1.0,
    aiBudgetMult: 1.75,
    aiDefenseMult: 1.55,
    aiEconomyMult: 1.75,
  },
};

export interface UnitSpec {
  id: UnitType;
  costPln: number;
  attack: number;
  defense: number;
  speedWeight: number;
  icon: 'infantry' | 'tank' | 'rocket' | 'antiair' | 'air' | 'naval' | 'archer' | 'cavalry' | 'cannon';
}

export interface ScenarioConfig {
  id: ScenarioId;
  startYear: number;
  startMonthIndex: number; // 0..11 (10 = November)
  monthsPerTurn: number;
  isModern: boolean;
  unitRoster: UnitSpec[];
  // Optional overrides for territory owners: [countryOrigId -> newOwnerId]
  territoryTransfers?: Record<string, string>;
  // Optional scenario-specific name overrides
  countryNameOverrides?: Record<string, string>;
  // Initial wars: pairs of countryIds
  initialWars?: Array<[string, string]>;
  // Initial alliances: pairs of countryIds
  initialAlliances?: Array<[string, string]>;
  // Army scale multiplier vs 2026 baseline
  armyScale: number;
  // Country-specific strength multipliers
  strengthOverrides?: Record<string, number>;
}

export const MODERN_UNITS: UnitSpec[] = [
  { id: 'infantry', costPln: 1.0, attack: 1.0, defense: 1.15, speedWeight: 1, icon: 'infantry' },
  { id: 'tanks', costPln: 2.2, attack: 2.6, defense: 1.9, speedWeight: 1.2, icon: 'tank' },
  { id: 'rocket_artillery', costPln: 2.5, attack: 3.1, defense: 1.4, speedWeight: 1, icon: 'rocket' },
  { id: 'anti_air', costPln: 1.8, attack: 1.4, defense: 2.7, speedWeight: 1, icon: 'antiair' },
  { id: 'aviation', costPln: 3.2, attack: 3.8, defense: 2.1, speedWeight: 1.4, icon: 'air' },
  { id: 'naval_fleet', costPln: 3.0, attack: 3.4, defense: 2.9, speedWeight: 1.3, icon: 'naval' },
];

export const HISTORICAL_UNITS: UnitSpec[] = [
  { id: 'infantry', costPln: 0.9, attack: 1.0, defense: 1.2, speedWeight: 1, icon: 'infantry' },
  { id: 'archers', costPln: 1.2, attack: 1.4, defense: 1.6, speedWeight: 1, icon: 'archer' },
  { id: 'cavalry', costPln: 2.0, attack: 2.6, defense: 1.5, speedWeight: 1.3, icon: 'cavalry' },
  { id: 'artillery', costPln: 2.4, attack: 2.9, defense: 1.7, speedWeight: 0.9, icon: 'cannon' },
  { id: 'naval_fleet', costPln: 2.5, attack: 2.6, defense: 2.4, speedWeight: 1.2, icon: 'naval' },
];

export const SCENARIOS: Record<ScenarioId, ScenarioConfig> = {
  '966': {
    id: '966',
    startYear: 966,
    startMonthIndex: 3, // Kwiecień 966 (Chrzest Polski)
    monthsPerTurn: 6,
    isModern: false,
    unitRoster: HISTORICAL_UNITS,
    armyScale: 0.09,
    territoryTransfers: {
      '112': '804', // Ruś Kijowska
      '643': '804', // Ziemie Rusi
      '703': '348', // Słowacja w granicach Węgier
      '040': '276', // Marchia Wschodnia pod Cesarstwem
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
      ['616', '203'], // Sojusz Mieszka I i Dobrawy (Czechy)
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
  '1410': {
    id: '1410',
    startYear: 1410,
    startMonthIndex: 6, // Lipiec 1410
    monthsPerTurn: 3,
    isModern: false,
    unitRoster: HISTORICAL_UNITS,
    armyScale: 0.14,
    territoryTransfers: {
      '112': '440', // Belarus part of Grand Duchy of Lithuania
      '804': '440', // Ukraine under Lithuania/Poland sphere
      '703': '348', // Slovakia part of Kingdom of Hungary
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
      ['616', '440'], // Polish-Lithuanian Union
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
  '1918': {
    id: '1918',
    startYear: 1918,
    startMonthIndex: 10, // Listopad 1918
    monthsPerTurn: 2,
    isModern: false,
    unitRoster: HISTORICAL_UNITS,
    armyScale: 0.65,
    territoryTransfers: {
      '703': '203', // Czechoslovakia
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
  '1939': {
    id: '1939',
    startYear: 1939,
    startMonthIndex: 8, // Wrzesień 1939
    monthsPerTurn: 1,
    isModern: false,
    unitRoster: HISTORICAL_UNITS,
    armyScale: 1.0,
    territoryTransfers: {
      '040': '276', // Anschluss
      '203': '276', // Protectorate
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
  '2026': {
    id: '2026',
    startYear: 2026,
    startMonthIndex: 10, // Listopad 2026
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
};

export function getUnitSpec(scenarioId: ScenarioId, unitType: UnitType): UnitSpec {
  const roster = SCENARIOS[scenarioId].unitRoster;
  return roster.find((u) => u.id === unitType) ?? roster[0];
}
