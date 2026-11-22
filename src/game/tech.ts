import type { TechNode } from './types';

export const TECH_TREE: TechNode[] = [
  // MILITARY & DETERRENCE
  {
    id: 'mil_1',
    branch: 'military',
    tier: 1,
    costRp: 20,
    prerequisites: [],
    name: {
      en: 'Combined Arms Doctrine',
      pl: 'Doktryna Połączonych Rodzajów Wojsk',
      szl: 'Doktryna Połōnczōnych Wojsk',
      csb: 'Doktrina Pòłączonëch Wòjsk',
    },
    summary: {
      en: '+10% combat strength across all armies.',
      pl: '+10% siły bojowej dla wszystkich armii.',
      szl: '+10% siyły bojowyj do wszyjskich armiji.',
      csb: '+10% bòjowi sëłë dlô wszëtczich armijów.',
    },
    effectTag: 'MIL +1',
  },
  {
    id: 'mil_2',
    branch: 'military',
    tier: 2,
    costRp: 32,
    prerequisites: ['mil_1'],
    name: {
      en: 'Night-Vision Optics',
      pl: 'Optyka Noktowizyjna',
      szl: 'Noktowizyjo Bojowo',
      csb: 'Noktowizëjô Bòjowô',
    },
    summary: {
      en: 'Eliminates the -22% Day/Night Terminator night combat penalty.',
      pl: 'Usuwa karę -22% do ataku w strefie nocnej globu.',
      szl: 'Usuwo kara -22% do ataku w nocy.',
      csb: 'Rëmi karã -22% do ataku w nocny conie.',
    },
    effectTag: 'NIGHT OPTICS',
  },
  {
    id: 'mil_3',
    branch: 'military',
    tier: 3,
    costRp: 48,
    prerequisites: ['mil_2'],
    name: {
      en: 'Airborne & Shock Divisions',
      pl: 'Dywizje Powietrznodesantowe',
      szl: 'Dywizyje Desantowe',
      csb: 'Dëwizje Pòwietrznodesantowé',
    },
    summary: {
      en: 'Unlocks Paratrooper drops behind enemy lines & +12% encirclement shock.',
      pl: 'Odblokowuje zrzuty Spadochroniarzy na tyły wroga i okrążenia.',
      szl: 'Ôdblokowuje skoki spadochronowe na tyły wroga.',
      csb: 'Òdblokòwëjë zrzëtë Spadochroniarzów za lëniã wroga.',
    },
    effectTag: 'AIRBORNE',
  },
  {
    id: 'mil_4',
    branch: 'military',
    tier: 4,
    costRp: 65,
    prerequisites: ['mil_3'],
    name: {
      en: 'Iron Dome & Precision Silos',
      pl: 'Żelazna Kopuła i Silosy Rakietowe',
      szl: 'Żelazno Kopuła i Rakiety',
      csb: 'Żelaznô Kòpùła i Rakietë',
    },
    summary: {
      en: 'Unlocks Iron Dome missile interception & strategic ballistic strikes.',
      pl: 'Odblokowuje Żelazną Kopułę oraz ataki rakietowe.',
      szl: 'Ôdblokowuje Żelazno Kopuła i silosy.',
      csb: 'Òdblokòwëjë Żelazną Kòpùłã i rakietowé silosë.',
    },
    effectTag: 'IRON DOME',
  },
  {
    id: 'mil_5',
    branch: 'military',
    tier: 5,
    costRp: 92,
    prerequisites: ['mil_4'],
    name: {
      en: 'Apex Hyper-Deterrence',
      pl: 'Hiper-Odstraszanie Apex',
      szl: 'Hiper-Ôdstraszanie Apex',
      csb: 'Hiper-Òdstraszanié Apex',
    },
    summary: {
      en: '+25% elite firepower and orbital strike readiness.',
      pl: '+25% elitarnej siły ognia i gotowości orbitalnej.',
      szl: '+25% elitarnyj siyły ôgnia.',
      csb: '+25% elitarnëj sëłë ògnia.',
    },
    effectTag: 'MIL +25%',
  },

  // ECONOMY & RESOURCES
  {
    id: 'eco_1',
    branch: 'economy',
    tier: 1,
    costRp: 20,
    prerequisites: [],
    name: {
      en: 'Industrial Resource Extraction',
      pl: 'Przemysłowe Wydobycie Surowców',
      szl: 'Przemysłowe Wydobycie',
      csb: 'Przemësłowé Wëdëbëcé',
    },
    summary: {
      en: '+12% tax/factory income & +25% Oil, Steel, Uranium output.',
      pl: '+12% dochodu oraz +25% wydobycia Ropy, Stali i Uranu.',
      szl: '+12% dochodu a +25% surowcōw.',
      csb: '+12% dochòdu a +25% surowców.',
    },
    effectTag: 'ECO +12%',
  },
  {
    id: 'eco_2',
    branch: 'economy',
    tier: 2,
    costRp: 32,
    prerequisites: ['eco_1'],
    name: {
      en: 'Global Arms Export Network',
      pl: 'Globalna Sieć Eksportu Broni',
      szl: 'Globalny Eksport Brōni',
      csb: 'Globalny Ekspòrt Broni',
    },
    summary: {
      en: '+30% Virtual PLN profit on Global Arms Market sales.',
      pl: '+30% zysku z eksportu czołgów i myśliwców na Rynku Broni.',
      szl: '+30% zysku na Rynku Brōni.',
      csb: '+30% zëskù na Rënku Broni.',
    },
    effectTag: 'ARMS +30%',
  },
  {
    id: 'eco_3',
    branch: 'economy',
    tier: 3,
    costRp: 48,
    prerequisites: ['eco_2'],
    name: {
      en: 'Automated Gigafactories',
      pl: 'Zautomatyzowane Gigafabryki',
      szl: 'Autōmatyczne Gigafabryki',
      csb: 'Aùtomatowóné Gigafabryki',
    },
    summary: {
      en: '+20% industrial output and faster city reconstruction.',
      pl: '+20% produkcji przemysłowej i szybsza odbudowa miast.',
      szl: '+20% produkcyji przemysłowyj.',
      csb: '+20% produkcëji przemësłowëj.',
    },
    effectTag: 'ECO +20%',
  },
  {
    id: 'eco_4',
    branch: 'economy',
    tier: 4,
    costRp: 68,
    prerequisites: ['eco_3'],
    name: {
      en: 'Compact Fusion & Rare-Earth Refining',
      pl: 'Fuzja Jądrowa i Rafinacja Metali Ziem Rzadkich',
      szl: 'Fuzyjo i Metale Rzadke',
      csb: 'Fuzjô i Rzadczé Metale',
    },
    summary: {
      en: 'Lowers Global Warming rise & triples Rare Earths yields.',
      pl: 'Hamuje ocieplenie klimatu i potraja wydobycie metali rzadkich.',
      szl: 'Hamuje ôcieplynie i potrajo metale rzadke.',
      csb: 'Hamëjë òceplenié i pòtrôjô metalë rzadczé.',
    },
    effectTag: 'CLEAN FUSION',
  },
  {
    id: 'eco_5',
    branch: 'economy',
    tier: 5,
    costRp: 95,
    prerequisites: ['eco_4'],
    name: {
      en: 'Asteroid Belt Helium-3 Economy',
      pl: 'Ekonomia Helu-3 z Pasa Asteroid',
      szl: 'Ekōnōmijo Helu-3 z Asteroid',
      csb: 'Ekònomiô Helu-3 z Asteroidów',
    },
    summary: {
      en: '+45 PLN/month orbital prosperity dividend.',
      pl: '+45 PLN/m-c kosmicznej dywidendy dobrobytu.',
      szl: '+45 PLN/m-c z orbity.',
      csb: '+45 PLN/m-c z òrbitë.',
    },
    effectTag: '+45 PLN/MO',
  },

  // LOGISTICS, RAIL & ORBITAL
  {
    id: 'log_1',
    branch: 'logistics',
    tier: 1,
    costRp: 20,
    prerequisites: [],
    name: {
      en: 'All-Weather Rail Logistics',
      pl: 'Logistyka Kolejowa i Termiczna',
      szl: 'Logistyka Kolejowo i Termiczno',
      csb: 'Logistika Kòlejowô i Termicznô',
    },
    summary: {
      en: '-50% frost/heat attrition & unlocks Armored Trains on Railways.',
      pl: '-50% strat klimatycznych oraz Pociągi Pancerne na torach.',
      szl: '-50% strat ôd mrozu/upału i Cugi Pancerne.',
      csb: '-50% strat òd mrozu/ùpału i Pancerné Cągi.',
    },
    effectTag: 'RAIL + CLIMATE',
  },
  {
    id: 'log_2',
    branch: 'logistics',
    tier: 2,
    costRp: 34,
    prerequisites: ['log_1'],
    name: {
      en: 'Maritime Convoy Escorts',
      pl: 'Eskorty Konwojów Morskich',
      szl: 'Ôchrōna Konwojōw Morskich',
      csb: 'Òchróna Mòrsczich Kònwòjów',
    },
    summary: {
      en: '+35% naval trade & faster amphibious landings.',
      pl: '+35% zysków morskich i szybsze desanty przez cieśniny.',
      szl: '+35% handlu morskego i szybsze desanty.',
      csb: '+35% mòrsczégò handlu i chùtczé desantë.',
    },
    effectTag: 'SEA +35%',
  },
  {
    id: 'log_3',
    branch: 'logistics',
    tier: 3,
    costRp: 52,
    prerequisites: ['log_2'],
    name: {
      en: 'Orbital Spy & Shield Grid',
      pl: 'Sieć Satelitów Szpiegowskich i Tarczy',
      szl: 'Satelity Szpiegowske i Tarcza',
      csb: 'Satelitë Szpiegòwsczé i Tarcza',
    },
    summary: {
      en: 'Activates Orbital Shield & discounts Spy Satellites by 40%.',
      pl: 'Aktywuje Tarczę Orbitalną i obniża koszt satelitów o 40%.',
      szl: 'Załōnczo Tarcza Orbitalno.',
      csb: 'Włączô Òrbitalną Tarczã.',
    },
    effectTag: 'ORBITAL SHIELD',
  },
  {
    id: 'log_4',
    branch: 'logistics',
    tier: 4,
    costRp: 72,
    prerequisites: ['log_3'],
    name: {
      en: 'Lunar & Mars Transfer Drives',
      pl: 'Napędy Transferowe Księżyc–Mars',
      szl: 'Napynndy na Ksiynżyc i Marsa',
      csb: 'Napãdë na Ksãżëc i Marsa',
    },
    summary: {
      en: 'Cuts Mars & Moon colony launch costs by 25%.',
      pl: 'Obniża koszt kolonizacji Księżyca i Marsa o 25%.',
      szl: 'Tōńszo kōlonizacyjo Marsa ô 25%.',
      csb: 'Tôńszô kòlonizacjô Marsa ò 25%.',
    },
    effectTag: 'MARS DRIVE',
  },
  {
    id: 'log_5',
    branch: 'logistics',
    tier: 5,
    costRp: 105,
    prerequisites: ['log_4'],
    name: {
      en: 'Jupiter & Europa Cryo-Habitats',
      pl: 'Krio-Habitaty Jowisza i Europy',
      szl: 'Krio-Bazy Jowisza i Europy',
      csb: 'Krio-Bazë Jowisza i Eùropë',
    },
    summary: {
      en: 'Enables outer solar system & deep-abyssal hegemony.',
      pl: 'Otwiera bazy w układzie Jowisza, Europy i na dnie oceanów.',
      szl: 'Ôtwiyro bazy na Jowiszu i Europie.',
      csb: 'Òtmëkô bazë na Jowiszu i Eùropie.',
    },
    effectTag: 'OUTER SYSTEM',
  },
];

export function computeTechPath(targetTechId: string, unlockedIds: string[]): string[] {
  const unlocked = new Set(unlockedIds);
  const visited = new Set<string>();
  const ordered: string[] = [];

  const visit = (id: string) => {
    if (visited.has(id) || unlocked.has(id)) return;
    visited.add(id);
    const node = TECH_TREE.find((t) => t.id === id);
    if (!node) return;
    for (const pre of node.prerequisites) {
      visit(pre);
    }
    ordered.push(id);
  };

  visit(targetTechId);
  return ordered;
}
