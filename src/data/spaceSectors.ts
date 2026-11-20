import type { CommodityId, Language, MegaprojectId, MinisterChoice, TechNodeId } from '../game/types';

export type SpaceOceanStageId =
  | 'earth_orbit'
  | 'moon'
  | 'mars'
  | 'asteroid_jupiter'
  | 'deep_ocean_europa';

export interface SpaceOceanNodeDef {
  id: string;
  stage: SpaceOceanStageId;
  name: Record<Language, string>;
  subtitle: Record<Language, string>;
  costPln: number;
  costRp: number;
  requiredTech: TechNodeId;
  incomePerMonth: number;
  researchPerMonth: number;
  powerBonus: number;
  xPct: number;
  yPct: number;
}

export const SPACE_OCEAN_STAGES: Array<{
  id: SpaceOceanStageId;
  label: Record<Language, string>;
  accent: string;
  description: Record<Language, string>;
}> = [
  {
    id: 'earth_orbit',
    label: { en: 'Earth Orbit', pl: 'Orbita Ziemi', szl: 'Orbita Zymie', csb: 'Òrbita Zemi' },
    accent: '#38BDF8',
    description: {
      en: 'Low-Earth orbital stations, solar relays, and laser defense satellites.',
      pl: 'Stacje na niskiej orbicie, przekaźniki energii i satelity tarczy laserowej.',
      szl: 'Stacyje orbitalne i satelity ôbrōnne.',
      csb: 'Òrbitalné stacje i laserowé satelitë.',
    },
  },
  {
    id: 'moon',
    label: { en: 'Moon', pl: 'Księżyc', szl: 'Ksiynżyc', csb: 'Miesądz' },
    accent: '#E2E8F0',
    description: {
      en: 'Lunar south-pole ice mines and low-gravity shipyard platforms.',
      pl: 'Kopalnie lodu na biegunie południowym i stocznie niskiej grawitacji.',
      szl: 'Kopalnie lodu na Ksiynżycu.',
      csb: 'Kòpalnie lodu na Miesądzu.',
    },
  },
  {
    id: 'mars',
    label: { en: 'Mars', pl: 'Mars', szl: 'Mars', csb: 'Mars' },
    accent: '#F97316',
    description: {
      en: 'Red Planet domes, Jezero terraforming labs, and Olympus spaceport.',
      pl: 'Kopuły Czerwonej Planety, laboratoria Jezero i port kosmiczny Olympus.',
      szl: 'Kopuły na Marsie i port Olympus.',
      csb: 'Kòpułë na Marsie i pòrt Olympus.',
    },
  },
  {
    id: 'asteroid_jupiter',
    label: { en: 'Belt & Jupiter', pl: 'Pas Asteroid & Jowisz', szl: 'Pas Asteroid i Jowisz', csb: 'Pas Asteroidów i Jowisz' },
    accent: '#FACC15',
    description: {
      en: 'Ceres precious-metal refineries and Jupiter orbital Helium-3 harvesters.',
      pl: 'Rafinerie metali na Ceres i stacje pozyskiwania Helu-3 na orbicie Jowisza.',
      szl: 'Rafineryje na Ceres i stacyje Jowisza.',
      csb: 'Rafinerie na Ceres i stacje Jowisza.',
    },
  },
  {
    id: 'deep_ocean_europa',
    label: { en: 'Deep Ocean & Europa', pl: 'Głębiny & Europa', szl: 'Głymbiny i Europa', csb: 'Głąbinë i Eùropa' },
    accent: '#2DD4BF',
    description: {
      en: 'Earth Mariana Trench abyssal arcologies and Jupiter-Europa cryo-ocean bases.',
      pl: 'Bazy w Rowie Mariańskim na Ziemi oraz podlodowe bazy oceaniczne Europy.',
      szl: 'Bazy na dnie oceanōw i pod lodym Europy.',
      csb: 'Bazë na dnie òceanów i pòd lodã Eùropë.',
    },
  },
];

export const SPACE_OCEAN_NODES: SpaceOceanNodeDef[] = [
  {
    id: 'leo_blocks_station',
    stage: 'earth_orbit',
    name: { en: 'APEX Orbital Hub', pl: 'Węzeł Orbitalny APEX', szl: 'Stacyjo Orbitalno APEX', csb: 'Òrbitalny Wãzeł APEX' },
    subtitle: { en: 'Zero-G command & telemetry array', pl: 'Centrum dowodzenia na orbicie', szl: 'Cyntrum na orbicie', csb: 'Centrum na òrbicie' },
    costPln: 45,
    costRp: 0,
    requiredTech: 'eco_fusion',
    incomePerMonth: 9,
    researchPerMonth: 6,
    powerBonus: 18000,
    xPct: 32,
    yPct: 44,
  },
  {
    id: 'leo_solar_array',
    stage: 'earth_orbit',
    name: { en: 'Helios Orbital Array', pl: 'Kolektor Słoneczny Helios', szl: 'Kolektor Helios', csb: 'Kòlektor Helios' },
    subtitle: { en: 'Microwave clean power beaming', pl: 'Przesył czystej energii na Ziemię', szl: 'Czysto energijo z orbity', csb: 'Czëstô energia z òrbitë' },
    costPln: 55,
    costRp: 0,
    requiredTech: 'log_orbital_shields',
    incomePerMonth: 14,
    researchPerMonth: 5,
    powerBonus: 24000,
    xPct: 68,
    yPct: 58,
  },
  {
    id: 'moon_shackleton',
    stage: 'moon',
    name: { en: 'Shackleton Crater Base', pl: 'Baza Krater Shackleton', szl: 'Baza Shackleton', csb: 'Baza Shackleton' },
    subtitle: { en: 'Propellant & water-ice refinery', pl: 'Rafineria lodu i paliwa rakietowego', szl: 'Rafineryjo paliwa', csb: 'Rafineriô paliwa' },
    costPln: 70,
    costRp: 0,
    requiredTech: 'log_lunar_mars',
    incomePerMonth: 15,
    researchPerMonth: 10,
    powerBonus: 32000,
    xPct: 36,
    yPct: 62,
  },
  {
    id: 'moon_tycho_foundry',
    stage: 'moon',
    name: { en: 'Tycho Lunar Shipyard', pl: 'Stocznia Księżycowa Tycho', szl: 'Stocznia Tycho', csb: 'Stochnia Tycho' },
    subtitle: { en: 'Low-gravity orbital vessel construction', pl: 'Budowa ciężkich statków głębokiego kosmosu', szl: 'Budowa statkōw kosmicznych', csb: 'Bùdowa kòsmicznych statków' },
    costPln: 85,
    costRp: 0,
    requiredTech: 'log_lunar_mars',
    incomePerMonth: 18,
    researchPerMonth: 12,
    powerBonus: 42000,
    xPct: 66,
    yPct: 38,
  },
  {
    id: 'mars_jezero',
    stage: 'mars',
    name: { en: 'Jezero Bio-Dome', pl: 'Biokopuła Jezero', szl: 'Biokopuła Jezero', csb: 'Biòkòpuła Jezero' },
    subtitle: { en: 'Pressurized Martian agricultural city', pl: 'Pierwsze samowystarczalne miasto na Marsie', szl: 'Miasto na Marsie', csb: 'Miasto na Marsie' },
    costPln: 95,
    costRp: 0,
    requiredTech: 'log_lunar_mars',
    incomePerMonth: 22,
    researchPerMonth: 15,
    powerBonus: 55000,
    xPct: 35,
    yPct: 48,
  },
  {
    id: 'mars_olympus_port',
    stage: 'mars',
    name: { en: 'Olympus Mons Mass-Driver', pl: 'Katapulta Orbitalna Olympus', szl: 'Port Olympus Mons', csb: 'Pòrt Olympus Mons' },
    subtitle: { en: 'Interplanetary logistics anchor', pl: 'Brama transportowa zewnętrznego Układu', szl: 'Brama kosmiczno', csb: 'Kòsmicznô brama' },
    costPln: 120,
    costRp: 0,
    requiredTech: 'eco_offworld_mining',
    incomePerMonth: 28,
    researchPerMonth: 18,
    powerBonus: 72000,
    xPct: 68,
    yPct: 52,
  },
  {
    id: 'belt_ceres_core',
    stage: 'asteroid_jupiter',
    name: { en: 'Ceres Rare-Earth Foundry', pl: 'Huta Metali Ceres', szl: 'Huta Ceres', csb: 'Hùta Ceres' },
    subtitle: { en: 'Platinum & rare-earth asteroid harvesting', pl: 'Wydobycie platyny i ziem rzadkich z asteroid', szl: 'Wydobycie metali z asteroid', csb: 'Wëdobëcé metalów z asteroidów' },
    costPln: 135,
    costRp: 0,
    requiredTech: 'eco_offworld_mining',
    incomePerMonth: 38,
    researchPerMonth: 16,
    powerBonus: 82000,
    xPct: 34,
    yPct: 54,
  },
  {
    id: 'jupiter_he3_ring',
    stage: 'asteroid_jupiter',
    name: { en: 'Jovian Helium-3 Skimmer', pl: 'Zbieracz Helu-3 Jowisz', szl: 'Stacyjo Hel-3 Jowisz', csb: 'Stacjô Hel-3 Jowisz' },
    subtitle: { en: 'Upper-atmosphere fusion fuel extraction', pl: 'Paliwo fuzyjne z atmosfery Jowisza', szl: 'Paliwo fuzyjne z Jowisza', csb: 'Fuzijné paliwò z Jowisza' },
    costPln: 155,
    costRp: 0,
    requiredTech: 'eco_offworld_mining',
    incomePerMonth: 46,
    researchPerMonth: 22,
    powerBonus: 95000,
    xPct: 68,
    yPct: 42,
  },
  {
    id: 'earth_mariana_habitat',
    stage: 'deep_ocean_europa',
    name: { en: 'Mariana Abyssal Arcology', pl: 'Arka Głębinowa Mariana', szl: 'Arka Głymbinowo Mariana', csb: 'Głąbòkòmòrskô Arka Mariana' },
    subtitle: { en: 'Earth deep-sea geothermal dome', pl: 'Głębinowa kolonia geotermalna na Ziemi', szl: 'Kolōnijo na dnie oceanu', csb: 'Kòloniô na dnie òceanu' },
    costPln: 110,
    costRp: 0,
    requiredTech: 'log_europa_ocean',
    incomePerMonth: 32,
    researchPerMonth: 24,
    powerBonus: 78000,
    xPct: 32,
    yPct: 60,
  },
  {
    id: 'europa_subsurface_lab',
    stage: 'deep_ocean_europa',
    name: { en: 'Europa Cryo-Ocean Bastion', pl: 'Bastion Podlodowy Europa', szl: 'Bastion Podlodowy Europa', csb: 'Pòdlodowi Bastion Eùropa' },
    subtitle: { en: 'Subsurface alien-ocean research citadel', pl: 'Podlodowa cytadela badawcza księżyca Europa', szl: 'Cytadela pod lodym Europy', csb: 'Cytadela pòd lodã Eùropë' },
    costPln: 175,
    costRp: 0,
    requiredTech: 'log_europa_ocean',
    incomePerMonth: 52,
    researchPerMonth: 36,
    powerBonus: 120000,
    xPct: 68,
    yPct: 44,
  },
];

export const CABINET_MINISTERS: MinisterChoice[] = [
  {
    id: 'min_def_marshal',
    role: 'defense',
    name: { en: 'Gen. A. Kowalski (Offensive)', pl: 'Gen. A. Kowalski (Ofensywny)', szl: 'Gyneroł A. Kowalski', csb: 'Gen. A. Kòwôlsczi' },
    bonusText: { en: '+10% Land & Air Attack', pl: '+10% Ataku Wojsk', szl: '+10% Ataku', csb: '+10% Ataku' },
    attackBonus: 0.1,
  },
  {
    id: 'min_def_bastion',
    role: 'defense',
    name: { en: 'Adm. H. Vance (Naval & Bastion)', pl: 'Adm. H. Vance (Flota i Obrona)', szl: 'Adm. H. Vance (Flota)', csb: 'Adm. H. Vance (Flota)' },
    bonusText: { en: '+8% Attack & Coastal Resilience', pl: '+8% Siły i Obrony Wybrzeża', szl: '+8% Siyły', csb: '+8% Sëłë' },
    attackBonus: 0.08,
  },
  {
    id: 'min_fin_growth',
    role: 'finance',
    name: { en: 'Dr. E. Nowak (Industrialist)', pl: 'Dr E. Nowak (Przemysłowiec)', szl: 'Dr E. Nowak (Przemysł)', csb: 'Dr E. Nowôk (Przemësł)' },
    bonusText: { en: '+14% National Tax & Factory Yield', pl: '+14% Dochodów z Podatków i Fabryk', szl: '+14% Dochodōw', csb: '+14% Dochòdów' },
    economyBonus: 0.14,
  },
  {
    id: 'min_fin_austerity',
    role: 'finance',
    name: { en: 'M. Lindqvist (Reserve Chief)', pl: 'M. Lindqvist (Bankier)', szl: 'M. Lindqvist (Bankiyr)', csb: 'M. Lindqvist (Bankier)' },
    bonusText: { en: '+10% Economy & Stability Guard', pl: '+10% Gospodarki i Stabilności', szl: '+10% Gospodarki', csb: '+10% Gòspòdarczi' },
    economyBonus: 0.1,
  },
  {
    id: 'min_sci_quantum',
    role: 'science',
    name: { en: 'Prof. S. Takahashi (Quantum R&D)', pl: 'Prof. S. Takahashi (B+R)', szl: 'Prof. S. Takahashi', csb: 'Prof. S. Takahashi' },
    bonusText: { en: '+35% Monthly Research Points', pl: '+35% Punktów Badań', szl: '+35% Badań', csb: '+35% Badérowaniô' },
    researchBonus: 0.35,
  },
  {
    id: 'min_int_shadow',
    role: 'intelligence',
    name: { en: 'Dir. V. Mercer (Black Ops)', pl: 'Dyr. V. Mercer (Wywiad)', szl: 'Dyr. V. Mercer', csb: 'Dir. V. Mercer' },
    bonusText: { en: '+25% Black Ops Success & Cheaper Spies', pl: '+25% Skuteczności Wywiadu', szl: '+25% Wywiadu', csb: '+25% Wëwiadu' },
    spyBonus: 0.25,
  },
];

export const MEGAPROJECTS: Array<{
  id: MegaprojectId;
  costPln: number;
  requiredTech: TechNodeId;
  name: Record<Language, string>;
  effect: Record<Language, string>;
}> = [
  {
    id: 'transcontinental_rail',
    costPln: 75,
    requiredTech: 'eco_automation',
    name: { en: 'High-Speed Maglev Corridor', pl: 'Korytarz Maglev', szl: 'Kolej Maglev', csb: 'Kòlej Maglev' },
    effect: { en: '+18 PLN/mo & +2 Max MP', pl: '+18 PLN/m-c i +2 Maks. PR', szl: '+18 PLN i +2 PR', csb: '+18 PLN i +2 PR' },
  },
  {
    id: 'orbital_defense_grid',
    costPln: 95,
    requiredTech: 'log_orbital_shields',
    name: { en: 'Aegis Orbital Laser Shield', pl: 'Orbitalna Tarcza Aegis', szl: 'Tarcza Aegis', csb: 'Òrbitalnô Tarcza Aegis' },
    effect: { en: 'Intercepts incoming Nuclear & Ballistic strikes', pl: 'Przechwytuje ataki rakietowe i jądrowe', szl: 'Chroni przed rakietami', csb: 'Chroni przed rakietama' },
  },
  {
    id: 'fusion_core',
    costPln: 110,
    requiredTech: 'eco_fusion',
    name: { en: 'National Fusion Power Core', pl: 'Narodowy Reaktor Fuzyjny', szl: 'Reaktor Fuzyjny', csb: 'Nôrodny Fuzijny Reaktor' },
    effect: { en: '+25 PLN/mo & +12 RP/mo', pl: '+25 PLN/m-c i +12 PB/m-c', szl: '+25 PLN i +12 PB', csb: '+25 PLN i +12 PB' },
  },
  {
    id: 'deep_ocean_arcology',
    costPln: 130,
    requiredTech: 'log_europa_ocean',
    name: { en: 'Abyssal Seed-Vault Arcology', pl: 'Arka Głębinowa Oceanu', szl: 'Arka Oceanu', csb: 'Głąbòkòmòrskô Arka' },
    effect: { en: 'Immunity to Nuclear Winter & +30 PLN/mo', pl: 'Odporność na zimę nuklearną i +30 PLN/m-c', szl: 'Ôdporność na zima atomowo', csb: 'Òdpornosc na atomòwą zëmã' },
  },
];

export const COMMODITY_BASE_PRICES: Record<CommodityId, number> = {
  energy: 6.5,
  steel: 8.0,
  rare_earths: 14.0,
  grain: 4.5,
};

export const WORLD_COUNCIL_RESOLUTIONS: Array<{
  id: string;
  title: Record<Language, string>;
  effect: Record<Language, string>;
}> = [
  {
    id: 'res_green_maritime',
    title: {
      en: 'Maritime Trade & Storm Relief Accord',
      pl: 'Pakt Bezpieczeństwa Morskiego',
      szl: 'Pakt Morski',
      csb: 'Mòrsczi Pakt',
    },
    effect: {
      en: '+15% global trade revenue & +4 Stability for voters',
      pl: '+15% handlu morskiego i +4% Stabilności',
      szl: '+15% handlu i +4% Stabilności',
      csb: '+15% handlu i +4% Stabilnoscë',
    },
  },
  {
    id: 'res_nuclear_restraint',
    title: {
      en: 'Non-Proliferation & Orbital Peace Treaty',
      pl: 'Traktat o Redukcji Zagrożeń Atomowych',
      szl: 'Traktat Pokoju Jōndrowego',
      csb: 'Traktat ò Atomòwim Pòkòju',
    },
    effect: {
      en: 'Reduces Nuclear Winter by -15% & +10 RP',
      pl: 'Redukuje zimę nuklearną o 15% i daje +10 PB',
      szl: 'Mniyj zimy atomowyj i +10 PB',
      csb: 'Mni atomòwi zëmë i +10 PB',
    },
  },
  {
    id: 'res_space_charter',
    title: {
      en: 'Moon & Mars Open Science Charter',
      pl: 'Karta Badań Księżyca i Marsa',
      szl: 'Karta Kosmiczno',
      csb: 'Kòsmicznô Kôrta',
    },
    effect: {
      en: '+18 Research Points & +12 PLN science grant',
      pl: '+18 PB i grant naukowy +12 PLN',
      szl: '+18 PB i +12 PLN',
      csb: '+18 PB i +12 PLN',
    },
  },
];
