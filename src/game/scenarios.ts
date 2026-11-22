import type { DifficultyId, Language, ScenarioId } from './types';

export interface ScenarioMeta {
  id: ScenarioId;
  year: number;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  badge: string;
}

export const SCENARIOS: ScenarioMeta[] = [
  {
    id: '966',
    year: 966,
    badge: '966 AD',
    title: {
      en: '966 · Baptism of Poland',
      pl: '966 · Chrzest Polski',
      szl: '966 · Chrzest Polski',
      csb: '966 · Chrzest Pòlsczi',
    },
    subtitle: {
      en: 'Duke Mieszko I forges the Piast Crown across Europe.',
      pl: 'Książę Mieszko I buduje piastowską potęgę w Europie.',
      szl: 'Ksiōnżę Mieszko I buduje piastowsko potynga.',
      csb: 'Ksążã Mieszkò I bùdëje piastowską mòc.',
    },
  },
  {
    id: '1410',
    year: 1410,
    badge: '1410 AD',
    title: {
      en: '1410 · Grunwald Crossroads',
      pl: '1410 · Wielka Wojna i Grunwald',
      szl: '1410 · Grunwald',
      csb: '1410 · Grunwald',
    },
    subtitle: {
      en: 'Polish-Lithuanian Union vs Baltic Orders & European crowns.',
      pl: 'Unia Polsko-Litewska w epoce rycerstwa i wielkich bitew.',
      szl: 'Unijo Polsko-Litewsko we epoce rycerstwa.',
      csb: 'Ùniô Pòlskò-Litewskô w epoce rëcerzów.',
    },
  },
  {
    id: '1619',
    year: 1619,
    badge: '1619 AD',
    title: {
      en: '1619 · Commonwealth Zenith',
      pl: '1619 · Złoty Wiek Rzeczypospolitej',
      szl: '1619 · Złoty Wiek',
      csb: '1619 · Złoti Wiek',
    },
    subtitle: {
      en: 'Winged Hussars & transcontinental rivalries at peak territory.',
      pl: 'Husaria i szczyt potęgi Rzeczypospolitej Obojga Narodów.',
      szl: 'Husaryjo i szczyt potyngi.',
      csb: 'Hùsariô i szczyt mòcë.',
    },
  },
  {
    id: '1918',
    year: 1918,
    badge: '1918',
    title: {
      en: '1918 · Dawn of Rebirth',
      pl: '1918 · Odzyskanie Niepodległości',
      szl: '1918 · Niepodległość',
      csb: '1918 · Samòstójnosc',
    },
    subtitle: {
      en: 'Interwar borders, armored trains, and fragile treaties.',
      pl: 'II Rzeczpospolita, pociągi pancerne i walka o granice.',
      szl: 'II RP, cugi pancerne i granice.',
      csb: 'II RP, pancerné cągi i grańce.',
    },
  },
  {
    id: '1939',
    year: 1939,
    badge: '1939',
    title: {
      en: '1939 · Iron Storm',
      pl: '1939 · Żelazna Burza',
      szl: '1939 · Żelazno Burza',
      csb: '1939 · Żelaznô Bùrza',
    },
    subtitle: {
      en: 'Full global flashpoint — blitzkrieg armor, rail defense & alliances.',
      pl: 'Globalny konflikt — pancerne zagony, lotnictwo i sojusze.',
      szl: 'Globalny kōnflikt i pancerne zagōny.',
      csb: 'Globalny kònflikt i pancerné zagónë.',
    },
  },
  {
    id: '2026',
    year: 2026,
    badge: '2026',
    title: {
      en: '2026 · Royal Apex Horizon',
      pl: '2026 · Horyzont Royal Apex',
      szl: '2026 · Horyzont Royal Apex',
      csb: '2026 · Hòrizont Royal Apex',
    },
    subtitle: {
      en: 'Modern Earth, 16 Polish voivodeships, Arctic routes & Mars race.',
      pl: 'Współczesny świat, 16 województw Polski i wyścig na Marsa.',
      szl: 'Terazniejszy świat, 16 wojewōdztw i Mars.',
      csb: 'Dzysészi swiat, 16 wòjewództw i Mars.',
    },
  },
];

export interface DifficultyConfig {
  id: DifficultyId;
  badge: string;
  incomeMult: number;
  attackMult: number;
  aiIncomeMult: number;
  aiDefenseMult: number;
  aiAggression: number;
  climateImmunity: boolean;
  label: Record<Language, string>;
  desc: Record<Language, string>;
}

export const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: 'world_conquest',
    badge: '👑 WORLD CONQUEST',
    incomeMult: 4.0, // +300% income
    attackMult: 2.5, // +150% attack
    aiIncomeMult: 0.7,
    aiDefenseMult: 0.72,
    aiAggression: 0.35,
    climateImmunity: true,
    label: {
      en: '👑 WORLD CONQUEST MODE (EXTREMELY EASY++)',
      pl: '👑 TRYB PODBOJU ŚWIATA (BARDZO ŁATWY++)',
      szl: '👑 PODBIJANIE ŚWIATA (FEST ŁATWY++)',
      csb: '👑 PÒDBÓJ SWIATA (BARO LETCZI++)',
    },
    desc: {
      en: '+300% income, +150% attack, autonomous 2s Conquest AI & 5s front airlifts!',
      pl: '+300% dochodu, +150% ataku, autonomiczny AI Podboju co 2s i desanty w 5s!',
      szl: '+300% dochodu, +150% ataku i samoczynny AI Podboju!',
      csb: '+300% dochòdu, +150% ataku i aùtonomiczné AI Pòdbòju!',
    },
  },
  {
    id: 'auto_pilot',
    badge: '🤖 AUTO-PILOT',
    incomeMult: 2.2,
    attackMult: 1.5,
    aiIncomeMult: 0.9,
    aiDefenseMult: 0.9,
    aiAggression: 0.55,
    climateImmunity: false,
    label: {
      en: '🤖 AUTO-PILOT MODE',
      pl: '🤖 TRYB AUTO-PILOT',
      szl: '🤖 TRYB AUTO-PILOT',
      csb: '🤖 TRIB AÙTO-PILOT',
    },
    desc: {
      en: 'Auto-Commander recruits border divisions & airlifts to war fronts in 5s.',
      pl: 'Naczelny Auto-Pilot rekrutuje na granicy i przerzuca wojska na front w 5s.',
      szl: 'Auto-Pilot werbuje na granicy i ciepie wojsko na frōnt w 5s.',
      csb: 'Aùto-Pilot rekrùtëje na grańce i przerzëcô na frónt w 5s.',
    },
  },
  {
    id: 'extremely_easy_plus',
    badge: '🌟 EXTREMELY EASY+',
    incomeMult: 2.0,
    attackMult: 1.45,
    aiIncomeMult: 0.75,
    aiDefenseMult: 0.8,
    aiAggression: 0.45,
    climateImmunity: true,
    label: {
      en: '🌟 EXTREMELY EASY+ (Unbeatable Comeback)',
      pl: '🌟 EKSTREMALNIE ŁATWY+ (Niezawodny Powrót)',
      szl: '🌟 FEST ŁATWY+ (Protokōł Powrotu)',
      csb: '🌟 EKSTREMALNO LETCZI+ (Protokół Pòwrotu)',
    },
    desc: {
      en: 'Emergency Comeback Protocol rescues your empire if territory drops.',
      pl: 'Protokół Ratunkowy wspiera Cię posiłkami, gdy utracisz prowincje.',
      szl: 'Protokōł Ratōnkowy dowo posiłki w kryzysie.',
      csb: 'Protokół Ratënkòwi dôwô pòsëłczi w krëzësu.',
    },
  },
  {
    id: 'extremely_easy',
    badge: '🟢 EXTREMELY EASY',
    incomeMult: 1.7,
    attackMult: 1.3,
    aiIncomeMult: 0.82,
    aiDefenseMult: 0.85,
    aiAggression: 0.5,
    climateImmunity: false,
    label: {
      en: '🟢 EXTREMELY EASY',
      pl: '🟢 BARDZO ŁATWY',
      szl: '🟢 FEST ŁATWY',
      csb: '🟢 BARO LETCZI',
    },
    desc: {
      en: 'Generous treasury flow and forgiving border resistance.',
      pl: 'Wysoki dochód skarbu i łagodny opór sąsiadów.',
      szl: 'Srogi dochōd i łagodne granice.',
      csb: 'Wësoczi dochód i letczi òpór.',
    },
  },
  {
    id: 'easy',
    badge: '🔵 EASY',
    incomeMult: 1.3,
    attackMult: 1.15,
    aiIncomeMult: 0.92,
    aiDefenseMult: 0.94,
    aiAggression: 0.65,
    climateImmunity: false,
    label: {
      en: '🔵 EASY',
      pl: '🔵 ŁATWY',
      szl: '🔵 ŁATWY',
      csb: '🔵 LETCZI',
    },
    desc: {
      en: 'Smooth economic advantage while keeping diplomacy authentic.',
      pl: 'Komfortowa przewaga ekonomiczna i realistyczna dyplomacja.',
      szl: 'Lekko przewoga ekōnōmiczno.',
      csb: 'Letkô ekònomicznô przëwôga.',
    },
  },
  {
    id: 'normal',
    badge: '🟡 NORMAL',
    incomeMult: 1.0,
    attackMult: 1.0,
    aiIncomeMult: 1.0,
    aiDefenseMult: 1.0,
    aiAggression: 0.85,
    climateImmunity: false,
    label: {
      en: '🟡 NORMAL',
      pl: '🟡 NORMALNY',
      szl: '🟡 NORMALNY',
      csb: '🟡 NORMALNY',
    },
    desc: {
      en: 'Zero-cheat symmetrical simulation — skill, generals & supply decide.',
      pl: 'Uczciwa symulacja 1:1 — decydują generałowie, zaopatrzenie i technologia.',
      szl: 'Rōwno symulacyjo 1:1 bez oszustw.',
      csb: 'Symetricznô symulacjô 1:1 bez òszëstwa.',
    },
  },
  {
    id: 'hard',
    badge: '🟠 HARD',
    incomeMult: 0.92,
    attackMult: 0.95,
    aiIncomeMult: 1.18,
    aiDefenseMult: 1.12,
    aiAggression: 1.1,
    climateImmunity: false,
    label: {
      en: '🟠 HARD',
      pl: '🟠 TRUDNY',
      szl: '🟠 TRUDNY',
      csb: '🟠 TRUDNY',
    },
    desc: {
      en: 'Coordinated AI coalitions, sharper fortifications & tighter budgets.',
      pl: 'Aktywne koalicje AI, mocne forty i wymagający budżet.',
      szl: 'Mocne koalicyje AI i twarde forty.',
      csb: 'Mòcné kòalicëje AI i cãżczi budżet.',
    },
  },
  {
    id: 'extreme',
    badge: '🔴 EXTREME',
    incomeMult: 0.85,
    attackMult: 0.9,
    aiIncomeMult: 1.42,
    aiDefenseMult: 1.28,
    aiAggression: 1.35,
    climateImmunity: false,
    label: {
      en: '🔴 EXTREME',
      pl: '🔴 EKSTREMALNY',
      szl: '🔴 EKSTREMALNY',
      csb: '🔴 EKSTREMALNY',
    },
    desc: {
      en: 'Aggressive superpowers and fierce attrition on extended fronts.',
      pl: 'Agresywne supermocarstwa i bezlitosne wojny na wielu frontach.',
      szl: 'Sroge mocarstwa i ciynżko wojna.',
      csb: 'Agresywné mòcarstwa i cãżkô wòjna.',
    },
  },
  {
    id: 'extreme_plus',
    badge: '☠️ EXTREME+',
    incomeMult: 0.78,
    attackMult: 0.85,
    aiIncomeMult: 1.75,
    aiDefenseMult: 1.55,
    aiAggression: 1.65,
    climateImmunity: false,
    label: {
      en: '☠️ EXTREME+ (Impossible)',
      pl: '☠️ EKSTREMALNY+ (Niemożliwy)',
      szl: '☠️ EKSTREMALNY+ (Niymożliwy)',
      csb: '☠️ EKSTREMALNY+ (Niemòżlëwi)',
    },
    desc: {
      en: '+75% AI economy, +55% AI defense, relentless global coalitions.',
      pl: '+75% gospodarki AI, +55% obrony AI i globalne koalicje przeciw Tobie.',
      szl: '+75% ekōnōmiji AI, +55% ôbrōny AI.',
      csb: '+75% ekònomi AI, +55% òbronë AI.',
    },
  },
];

export interface SpaceDestination {
  id: string;
  name: Record<Language, string>;
  domain: 'orbit' | 'moon' | 'mars' | 'asteroid' | 'jupiter' | 'ocean';
  costPln: number;
  requiredLogLevel: number;
  incomeBonusPln: number;
  prestigeReward: number;
  isPremiumExclusive?: boolean;
  summary: Record<Language, string>;
}

export const SPACE_DESTINATIONS: SpaceDestination[] = [
  {
    id: 'orbital_shield',
    name: { en: 'Orbital Defense Ring', pl: 'Orbitalny Pierścień Obrony', szl: 'Orbitalny Rynk Ôbrōny', csb: 'Òrbitalny Pierscéń Òbronë' },
    domain: 'orbit',
    costPln: 55,
    requiredLogLevel: 2,
    incomeBonusPln: 6,
    prestigeReward: 25,
    summary: { en: 'Intercepts ballistic/nuclear strikes & +6 PLN/mo.', pl: 'Przechwytuje rakiety i daje +6 PLN/m-c.', szl: 'Łapie rakiety i +6 PLN/m-c.', csb: 'Chwëtô rakietë i +6 PLN/m-c.' },
  },
  {
    id: 'lunar_base',
    name: { en: 'Lunar South-Pole Citadel', pl: 'Cytadela na Księżycu', szl: 'Cytadela na Ksiynżycu', csb: 'Cëtadela na Ksãżëcu' },
    domain: 'moon',
    costPln: 80,
    requiredLogLevel: 3,
    incomeBonusPln: 12,
    prestigeReward: 45,
    summary: { en: 'Helium-3 refinery & +12 PLN/mo.', pl: 'Rafineria Helu-3 oraz +12 PLN/m-c.', szl: 'Rafineryjo Helu-3 i +12 PLN/m-c.', csb: 'Rafineriô Helu-3 i +12 PLN/m-c.' },
  },
  {
    id: 'mars_colony',
    name: { en: 'Mars Terraforming Colony', pl: 'Kolonia Marsjańska (Terraforming)', szl: 'Kōlonijo na Marsie', csb: 'Kòloniô na Marsu' },
    domain: 'mars',
    costPln: 125,
    requiredLogLevel: 4,
    incomeBonusPln: 22,
    prestigeReward: 85,
    summary: { en: 'Red Planet flagship dome & +22 PLN/mo.', pl: 'Flagowa baza na Marsie oraz +22 PLN/m-c.', szl: 'Srogo baza na Marsie i +22 PLN/m-c.', csb: 'Wiôlgô baza na Marsu i +22 PLN/m-c.' },
  },
  {
    id: 'asteroid_belt',
    name: { en: 'Asteroid Belt Mining Fleet', pl: 'Flota Górnicza Pasa Asteroid', szl: 'Flota na Asteroidach', csb: 'Flota na Asteroidach' },
    domain: 'asteroid',
    costPln: 145,
    requiredLogLevel: 4,
    incomeBonusPln: 28,
    prestigeReward: 100,
    summary: { en: 'Rare-earth & orbital steel mega-yield +28 PLN/mo.', pl: 'Surowce kosmiczne +28 PLN/m-c.', szl: 'Surowce z kosmosu +28 PLN/m-c.', csb: 'Kòsmiczné surowcë +28 PLN/m-c.' },
  },
  {
    id: 'jupiter_orbit',
    name: { en: 'Jupiter Sovereign Array', pl: 'Orbitalna Stacja Jowisza', szl: 'Stacyjo Jowisza', csb: 'Stacëjô Jowisza' },
    domain: 'jupiter',
    costPln: 175,
    requiredLogLevel: 5,
    incomeBonusPln: 36,
    prestigeReward: 130,
    summary: { en: 'Deep-space fusion relay & +36 PLN/mo.', pl: 'Przekaźnik fuzyjny Jowisza +36 PLN/m-c.', szl: 'Baza Jowisza +36 PLN/m-c.', csb: 'Baza Jowisza +36 PLN/m-c.' },
  },
  {
    id: 'europa_ocean',
    name: { en: 'Europa Sub-Glacial Habitat', pl: 'Podlodowy Habitat Europy', szl: 'Podlodowo Baza Europy', csb: 'Pòdlodowô Baza Eùropë' },
    domain: 'ocean',
    costPln: 195,
    requiredLogLevel: 5,
    incomeBonusPln: 42,
    prestigeReward: 155,
    summary: { en: 'Abyssal cryosphere science & +42 PLN/mo.', pl: 'Ocean pod lodem Europy +42 PLN/m-c.', szl: 'Ocean pod lōdym +42 PLN/m-c.', csb: 'Òcean pòd lodã +42 PLN/m-c.' },
  },
  {
    id: 'titan_outpost',
    name: { en: '👑 Titan Sovereign Outpost (Apex VIP)', pl: '👑 Bastion Tytana (Apex VIP)', szl: '👑 Baza Tytan (Apex VIP)', csb: '👑 Baza Tytan (Apex VIP)' },
    domain: 'jupiter',
    costPln: 160,
    requiredLogLevel: 3,
    incomeBonusPln: 50,
    prestigeReward: 200,
    isPremiumExclusive: true,
    summary: { en: 'Free Apex Premium Orbital Titan Outpost (+50 PLN/mo).', pl: 'Ekskluzywny Bastion Tytana z darmowego Apex Premium (+50 PLN/m-c).', szl: 'Bastion Tytana z darmowego Apex Premium.', csb: 'Bastion Tytana z darmòwégò Apex Premium.' },
  },
];

export function getDifficultyConfig(id: DifficultyId): DifficultyConfig {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[5];
}
