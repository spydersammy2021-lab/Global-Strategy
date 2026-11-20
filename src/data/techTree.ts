import type { Language, TechBranch, TechNodeId } from '../game/types';

export interface TechNodeDef {
  id: TechNodeId;
  branch: TechBranch;
  tier: number; // 0..4 (column position in visual graph)
  costRp: number;
  prerequisites: TechNodeId[];
  title: Record<Language, string>;
  summary: Record<Language, string>;
  unlocks: Record<Language, string>;
  militaryLevelGain?: number;
  economyLevelGain?: number;
  logisticsLevelGain?: number;
}

export const TECH_TREE_NODES: TechNodeDef[] = [
  // MILITARY BRANCH (row 0)
  {
    id: 'mil_doctrine',
    branch: 'military',
    tier: 0,
    costRp: 20,
    prerequisites: [],
    title: {
      en: 'Combined Arms Doctrine',
      pl: 'Doktryna Połączonych Sił',
      szl: 'Doktryna Połōnczōnych Siył',
      csb: 'Doktrina Pòłączonëch Sëł',
    },
    summary: {
      en: '+8% combat strength across all land & air units.',
      pl: '+8% siły bojowej wszystkich jednostek lądowych i lotniczych.',
      szl: '+8% siyły bojowyj wszyjskich ôddziałōw.',
      csb: '+8% bòjowi sëłë wszëtczich òddziałów.',
    },
    unlocks: {
      en: 'Military Tech +1',
      pl: 'Technologia Wojskowa +1',
      szl: 'Technologijo Wojskowo +1',
      csb: 'Wòjskòwô Technologiô +1',
    },
    militaryLevelGain: 1,
  },
  {
    id: 'mil_armor',
    branch: 'military',
    tier: 1,
    costRp: 32,
    prerequisites: ['mil_doctrine'],
    title: {
      en: 'Composite Armor & Fire Control',
      pl: 'Pancerz Kompozytowy i Kierowanie Ogniem',
      szl: 'Kōmpozytowy Pancyrz',
      csb: 'Kòmpòzytowi Pancerz',
    },
    summary: {
      en: '+10% offensive & defensive armor performance.',
      pl: '+10% skuteczności pancernej w ataku i obronie.',
      szl: '+10% siyły pancyrnyj.',
      csb: '+10% sëłë pancerny.',
    },
    unlocks: {
      en: 'Military Tech +1 · Heavy Breakthroughs',
      pl: 'Technologia Wojskowa +1 · Przełamania',
      szl: 'Wojsko +1 · Przełamanie',
      csb: 'Wòjskò +1 · Przełamanié',
    },
    militaryLevelGain: 1,
  },
  {
    id: 'mil_aerospace',
    branch: 'military',
    tier: 2,
    costRp: 48,
    prerequisites: ['mil_armor', 'eco_banking'],
    title: {
      en: 'Supersonic Air & Radar Grid',
      pl: 'Lotnictwo Naddźwiękowe i Sieć Radarowa',
      szl: 'Naddźwiynkowe Lotnictwo',
      csb: 'Naddzwãkòwé Lëtnictwò',
    },
    summary: {
      en: '+10% combat rating & faster air recon.',
      pl: '+10% siły bojowej i szybsze wsparcie lotnicze.',
      szl: '+10% siyły i wsparcie z luftu.',
      csb: '+10% sëłë i wsparcé z lëftu.',
    },
    unlocks: {
      en: 'Military Tech +1 · Stealth Jet Sorties',
      pl: 'Technologia Wojskowa +1 · Loty Bojowe',
      szl: 'Wojsko +1 · Loty Bojowe',
      csb: 'Wòjskò +1 · Bòjowé Lòtë',
    },
    militaryLevelGain: 1,
  },
  {
    id: 'mil_missiles',
    branch: 'military',
    tier: 3,
    costRp: 65,
    prerequisites: ['mil_aerospace', 'log_supply'],
    title: {
      en: 'Precision Ballistic Silos',
      pl: 'Precyzyjne Silosy Rakietowe',
      szl: 'Precyzyjne Silosy Rakietowe',
      csb: 'Precyzijné Rakietowé Silosë',
    },
    summary: {
      en: 'Unlocks Missile Silos & Tactical Cruise Strikes.',
      pl: 'Odblokowuje Silosy Rakietowe i uderzenia taktyczne.',
      szl: 'Ôdblokowuje Silosy Rakietowe.',
      csb: 'Òdblokòwùje Rakietowé Silosë.',
    },
    unlocks: {
      en: 'Unlocks Missile Silo Building',
      pl: 'Odblokowuje budowę Silosu Rakietowego',
      szl: 'Budowa Silosu Rakietowego',
      csb: 'Bùdowa Rakietowégò Silosa',
    },
    militaryLevelGain: 1,
  },
  {
    id: 'mil_thermonuclear',
    branch: 'military',
    tier: 4,
    costRp: 95,
    prerequisites: ['mil_missiles', 'eco_fusion'],
    title: {
      en: 'Thermonuclear Deterrence',
      pl: 'Odstraszanie Termojądrowe',
      szl: 'Głowice Termojōndrowe',
      csb: 'Termojądrowé Głowice',
    },
    summary: {
      en: 'Enables strategic thermonuclear warhead production.',
      pl: 'Pozwala produkować strategiczne głowice termojądrowe.',
      szl: 'Pozwolo produkować głowice jōndrowe.',
      csb: 'Pòzwôlô prodëkòwac jądrowé głowice.',
    },
    unlocks: {
      en: 'Unlocks Thermonuclear Warheads',
      pl: 'Odblokowuje Głowice Termojądrowe',
      szl: 'Głowice Termojōndrowe',
      csb: 'Termojądrowé Głowice',
    },
    militaryLevelGain: 2,
  },

  // ECONOMIC BRANCH (row 1)
  {
    id: 'eco_guilds',
    branch: 'economy',
    tier: 0,
    costRp: 20,
    prerequisites: [],
    title: {
      en: 'Industrial Workshops',
      pl: 'Warsztaty i Przemysł',
      szl: 'Warksztaty i Przemysł',
      csb: 'Wôrstatë i Przemësł',
    },
    summary: {
      en: '+10% national tax & industrial income.',
      pl: '+10% dochodów z podatków i przemysłu.',
      szl: '+10% dochodu z podatków i przemysłu.',
      csb: '+10% dochòdu z pòdatków i przemësłu.',
    },
    unlocks: {
      en: 'Economy Tech +1',
      pl: 'Technologia Ekonomiczna +1',
      szl: 'Ekōnōmijo +1',
      csb: 'Ekònomiô +1',
    },
    economyLevelGain: 1,
  },
  {
    id: 'eco_banking',
    branch: 'economy',
    tier: 1,
    costRp: 32,
    prerequisites: ['eco_guilds'],
    title: {
      en: 'Central Reserve & Trade',
      pl: 'Bank Centralny i Handel Światowy',
      szl: 'Bank Cyntralny i Handel',
      csb: 'Centralny Bank i Handel',
    },
    summary: {
      en: '+12% trade efficiency & market capacity.',
      pl: '+12% wydajności handlu i rezerw rynkowych.',
      szl: '+12% handlu i rezerw.',
      csb: '+12% handlu i rezerwów.',
    },
    unlocks: {
      en: 'Economy Tech +1 · Lower Tariff Friction',
      pl: 'Ekonomia +1 · Tańsze transakcje',
      szl: 'Ekōnōmijo +1',
      csb: 'Ekònomiô +1',
    },
    economyLevelGain: 1,
  },
  {
    id: 'eco_automation',
    branch: 'economy',
    tier: 2,
    costRp: 48,
    prerequisites: ['eco_banking'],
    title: {
      en: 'Automated Gigafactories',
      pl: 'Zautomatyzowane Gigafabryki',
      szl: 'Automatyzacyjo Fabryk',
      csb: 'Aùtomatizacjô Fabrików',
    },
    summary: {
      en: '+12% production output & unlocks megaprojects.',
      pl: '+12% produkcji oraz megaprojekty narodowe.',
      szl: '+12% produkcyje i megaprojekty.',
      csb: '+12% prodëkcji i megaprójektë.',
    },
    unlocks: {
      en: 'Economy Tech +1 · National Megaprojects',
      pl: 'Ekonomia +1 · Megaprojekty',
      szl: 'Ekōnōmijo +1 · Megaprojekty',
      csb: 'Ekònomiô +1 · Megaprójektë',
    },
    economyLevelGain: 1,
  },
  {
    id: 'eco_fusion',
    branch: 'economy',
    tier: 3,
    costRp: 68,
    prerequisites: ['eco_automation'],
    title: {
      en: 'Compact Fusion Reactors',
      pl: 'Reaktory Syntezy Jądrowej',
      szl: 'Reaktory Fuzyjne',
      csb: 'Fuzijné Reaktorë',
    },
    summary: {
      en: 'Unlocks Spaceports & Fusion Core Megaproject.',
      pl: 'Odblokowuje Kosmodromy i Rdzeń Fuzyjny.',
      szl: 'Ôdblokowuje Kosmodromy i Fuzyjo.',
      csb: 'Òdblokòwùje Kòsmòdromë i Fuzjã.',
    },
    unlocks: {
      en: 'Unlocks Spaceport Building & Orbit Stage',
      pl: 'Odblokowuje Kosmodrom i Orbitę',
      szl: 'Ôdblokowuje Kosmodrom',
      csb: 'Òdblokòwùje Kòsmòdróm',
    },
    economyLevelGain: 1,
  },
  {
    id: 'eco_offworld_mining',
    branch: 'economy',
    tier: 4,
    costRp: 95,
    prerequisites: ['eco_fusion', 'log_lunar_mars'],
    title: {
      en: 'Asteroid Belt Helium-3 Mining',
      pl: 'Górnictwo Pasa Asteroid (Hel-3)',
      szl: 'Gōrnictwo w Kosmosie',
      csb: 'Kòsmiczné Gòrnictwò',
    },
    summary: {
      en: 'Enables Asteroid Belt & Jupiter Orbital Stations.',
      pl: 'Odblokowuje Stacje Orbitalne Pasa Asteroid i Jowisza.',
      szl: 'Stacyje Pasa Asteroid i Jowisza.',
      csb: 'Stacje Pasa Asteroidów i Jowisza.',
    },
    unlocks: {
      en: 'Unlocks Asteroid & Jupiter Colonies',
      pl: 'Kolonie Pasa Asteroid i Jowisza',
      szl: 'Kolōnije Asteroid i Jowisza',
      csb: 'Kòlonie Asteroidów i Jowisza',
    },
    economyLevelGain: 2,
  },

  // LOGISTICS BRANCH (row 2)
  {
    id: 'log_supply',
    branch: 'logistics',
    tier: 0,
    costRp: 20,
    prerequisites: [],
    title: {
      en: 'Motorized Supply Chains',
      pl: 'Zmotoryzowane Łańcuchy Dostaw',
      szl: 'Logistyka i Zaopatrzenie',
      csb: 'Zmotoryzowónô Logistika',
    },
    summary: {
      en: '+1 Max MP, -8% unit recruitment & upkeep cost.',
      pl: '+1 Maks. PR, -8% koszt rekrutacji i utrzymania.',
      szl: '+1 PR, -8% kosztu wojska.',
      csb: '+1 PR, -8% kòsztu wòjska.',
    },
    unlocks: {
      en: 'Logistics Tech +1',
      pl: 'Logistyka +1',
      szl: 'Logistyka +1',
      csb: 'Logistika +1',
    },
    logisticsLevelGain: 1,
  },
  {
    id: 'log_naval_corridors',
    branch: 'logistics',
    tier: 1,
    costRp: 32,
    prerequisites: ['log_supply'],
    title: {
      en: 'Blue-Water Naval Corridors',
      pl: 'Korytarze Morskie i Flota Oceaniczna',
      szl: 'Flota Morska i Korytarze',
      csb: 'Mòrskô Flota i Kòritarze',
    },
    summary: {
      en: '+15% Naval Fleet power & unlocks Coastal Defense.',
      pl: '+15% siły Floty Morskiej i Obrona Wybrzeża.',
      szl: '+15% Floty i Ôbrōna Brzegu.',
      csb: '+15% Flotë i Òbrona Brzegu.',
    },
    unlocks: {
      en: 'Logistics +1 · Coastal Defense Building',
      pl: 'Logistyka +1 · Obrona Wybrzeża',
      szl: 'Logistyka +1 · Ôbrōna Wybrzeża',
      csb: 'Logistika +1 · Òbrona Brzegu',
    },
    logisticsLevelGain: 1,
  },
  {
    id: 'log_orbital_shields',
    branch: 'logistics',
    tier: 2,
    costRp: 52,
    prerequisites: ['log_naval_corridors', 'mil_aerospace'],
    title: {
      en: 'Orbital Laser Shield Grid',
      pl: 'Orbitalna Tarcza Laserowa',
      szl: 'Orbitalno Tarcza Laserowo',
      csb: 'Orbitalnô Laserowô Tarcza',
    },
    summary: {
      en: 'Enables orbital interception against ballistic & nuclear strikes.',
      pl: 'Przechwytuje wrogie rakiety balistyczne i głowice jądrowe.',
      szl: 'Niszczy wroge rakiety z orbity.',
      csb: 'Zestrzélëwô wrëgòwé rakietë z òrbitë.',
    },
    unlocks: {
      en: 'Unlocks Orbital Laser Shield',
      pl: 'Odblokowuje Tarczę Orbitalną',
      szl: 'Tarcza Orbitalno',
      csb: 'Orbitalnô Tarcza',
    },
    logisticsLevelGain: 1,
  },
  {
    id: 'log_lunar_mars',
    branch: 'logistics',
    tier: 3,
    costRp: 72,
    prerequisites: ['log_orbital_shields', 'eco_fusion'],
    title: {
      en: 'Lunar & Martian Transfer Drives',
      pl: 'Napędy Księżycowo-Marsjańskie',
      szl: 'Loty na Ksiynżyc i Marsa',
      csb: 'Lòtë na Miesądz i Marsa',
    },
    summary: {
      en: 'Opens Moon & Mars surface colonization in Space Agency.',
      pl: 'Otwiera kolonizację Księżyca i Marsa w Agencji Kosmicznej.',
      szl: 'Ôtwiyro kolōnizacyjo Ksiynżyca i Marsa.',
      csb: 'Òtmëkô kòlonizacjã Miesądza i Marsa.',
    },
    unlocks: {
      en: 'Unlocks Moon & Mars Colonization',
      pl: 'Kolonizacja Księżyca i Marsa',
      szl: 'Kolōnizacyjo Ksiynżyca i Marsa',
      csb: 'Kòlonizacjô Miesądza i Marsa',
    },
    logisticsLevelGain: 1,
  },
  {
    id: 'log_europa_ocean',
    branch: 'logistics',
    tier: 4,
    costRp: 105,
    prerequisites: ['log_lunar_mars', 'eco_offworld_mining'],
    title: {
      en: 'Abyssal & Europa Cryo-Habitats',
      pl: 'Bazy Głębinowe i Podlodowe Europy',
      szl: 'Bazy Głymbinowe i Europa',
      csb: 'Głąbòkòmòrsczé Bazë i Eùropa',
    },
    summary: {
      en: 'Final frontier: Deep Ocean Arcologies & Jupiter-Europa Subsurface Bases.',
      pl: 'Ostatnia granica: Bazy Głębinowe Ziemi i podlodowy ocean Europy.',
      szl: 'Bazy na dnie oceanōw i na Europie.',
      csb: 'Bazë na dnie òceanów i na Eùropie.',
    },
    unlocks: {
      en: 'Unlocks Deep Ocean & Europa Sector',
      pl: 'Sektor Głębinowy i Europa',
      szl: 'Sektor Głymbinowy i Europa',
      csb: 'Głąbòkòmòrsczi Sektor i Eùropa',
    },
    logisticsLevelGain: 2,
  },
];

export const TECH_NODE_MAP: Record<TechNodeId, TechNodeDef> = Object.fromEntries(
  TECH_TREE_NODES.map((n) => [n.id, n]),
) as Record<TechNodeId, TechNodeDef>;

export function canUnlockTechNode(unlocked: TechNodeId[], nodeId: TechNodeId): boolean {
  if (unlocked.includes(nodeId)) return false;
  const def = TECH_NODE_MAP[nodeId];
  if (!def) return false;
  return def.prerequisites.every((req) => unlocked.includes(req));
}

// Compute ordered research path (ancestors first, deduplicated) to reach target node
export function planTechResearchPath(unlocked: TechNodeId[], targetId: TechNodeId): TechNodeId[] {
  const visited = new Set<TechNodeId>();
  const path: TechNodeId[] = [];

  const visit = (id: TechNodeId) => {
    if (visited.has(id) || unlocked.includes(id)) return;
    visited.add(id);
    const def = TECH_NODE_MAP[id];
    if (!def) return;
    for (const pre of def.prerequisites) {
      visit(pre);
    }
    path.push(id);
  };

  visit(targetId);
  return path;
}
