import type { Language } from '../game/types';

export interface MajorCity {
  id: string;
  name: string;
  countryCode: string;
  provinceId: string;
  lat: number;
  lng: number;
  populationLabel: string;
  strategicRole: Record<Language, string>;
}

export const MAJOR_CITIES: MajorCity[] = [
  {
    id: 'warsaw',
    name: 'Warsaw',
    countryCode: '616',
    provinceId: '616_p0',
    lat: 52.2297,
    lng: 21.0122,
    populationLabel: '1.86M',
    strategicRole: {
      en: 'Capital Command & Central Vistula Hub',
      pl: 'Stolica Polski i Centralny Węzeł Wisły',
      szl: 'Stolica Polski i Głōwny Wynzeł',
      csb: 'Stolëca Pòlsczi i Przédny Wãzeł',
    },
  },
  {
    id: 'jastrzebie_zdroj',
    name: 'Jastrzębie-Zdrój',
    countryCode: '616',
    provinceId: '616_p1',
    lat: 49.9488,
    lng: 18.5996,
    populationLabel: '83K',
    strategicRole: {
      en: 'Upper Silesian Coking Coal & Moravian Gate Frontier',
      pl: 'Górnośląskie Zagłębie Węglowe i Brama Morawska',
      szl: 'Gōrnoślōnske Zagłymbje i Morawsko Brama',
      csb: 'Górnosląsczé Zôgłãbié i Mòrawskô Brama',
    },
  },
  {
    id: 'krakow',
    name: 'Kraków',
    countryCode: '616',
    provinceId: '616_p2',
    lat: 50.0647,
    lng: 19.945,
    populationLabel: '804K',
    strategicRole: {
      en: 'Historic Royal Capital & Southern Logistics',
      pl: 'Historyczna Stolica i Logistyka Południowa',
      szl: 'Historyczno Stolica i Połedniowo Logistyka',
      csb: 'Historëcznô Stolëca i Pôłniowô Logistika',
    },
  },
  {
    id: 'gdansk',
    name: 'Gdańsk',
    countryCode: '616',
    provinceId: '616_p5',
    lat: 54.352,
    lng: 18.6466,
    populationLabel: '487K',
    strategicRole: {
      en: 'Primary Baltic Naval Port & Shipyard Corridor',
      pl: 'Główny Port Bałtycki i Korytarz Morski',
      szl: 'Głōwny Port Bałtycki i Stocznia',
      csb: 'Przédny Pòrt Bôłtu i Mòrskô Kòrëtarz',
    },
  },
  {
    id: 'wroclaw',
    name: 'Wrocław',
    countryCode: '616',
    provinceId: '616_p4',
    lat: 51.1079,
    lng: 17.0385,
    populationLabel: '674K',
    strategicRole: {
      en: 'Oder River Industrial & Aerospace Fortress',
      pl: 'Odrzański Okręg Przemysłowy i Twierdza',
      szl: 'Ôdrzański Przemysł i Twierdza',
      csb: 'Òdrzansczi Przemësł i Cwiardza',
    },
  },
  {
    id: 'prague',
    name: 'Prague',
    countryCode: '203',
    provinceId: '203_p0',
    lat: 50.0755,
    lng: 14.4378,
    populationLabel: '1.38M',
    strategicRole: {
      en: 'Bohemian Plateau Command & Heavy Armor Arsenal',
      pl: 'Dowództwo Czeskie i Zakłady Pancerne',
      szl: 'Czeske Dowōdztwo i Pancyry',
      csb: 'Czesczé Dowództwò i Pancerz',
    },
  },
  {
    id: 'bratislava',
    name: 'Bratislava',
    countryCode: '703',
    provinceId: '703_p0',
    lat: 48.1486,
    lng: 17.1077,
    populationLabel: '476K',
    strategicRole: {
      en: 'Danube River Crossroads & Carpathian Approach',
      pl: 'Węzeł Naddunajski i Przedpole Karpat',
      szl: 'Dunajski Wynzeł i Karpaty',
      csb: 'Dunajsczi Wãzeł i Karpatë',
    },
  },
  {
    id: 'berlin',
    name: 'Berlin',
    countryCode: '276',
    provinceId: '276_p0',
    lat: 52.52,
    lng: 13.405,
    populationLabel: '3.78M',
    strategicRole: {
      en: 'Central European Metropolis & Rail Nexus',
      pl: 'Metropolia Europy Środkowej i Węzeł Kolejowy',
      szl: 'Metropolijo Ojropy i Wynzeł Kolejowy',
      csb: 'Metropòlia Eùropë i Wãzeł Kolejowi',
    },
  },
  {
    id: 'paris',
    name: 'Paris',
    countryCode: '250',
    provinceId: '250_p0',
    lat: 48.8566,
    lng: 2.3522,
    populationLabel: '2.10M',
    strategicRole: {
      en: 'Western European Diplomatic & Aerospace Capital',
      pl: 'Stolica Lotnicza i Dyplomatyczna Zachodu',
      szl: 'Dyplomatyczno i Lotniczo Stolica',
      csb: 'Diplòmaticznô i Lëtniczô Stolëca',
    },
  },
  {
    id: 'london',
    name: 'London',
    countryCode: '826',
    provinceId: '826_p0',
    lat: 51.5072,
    lng: -0.1276,
    populationLabel: '8.98M',
    strategicRole: {
      en: 'Global Maritime Finance & North Sea Command',
      pl: 'Globalne Centrum Morskie i Finansowe',
      szl: 'Morske i Finansowe Cyntrum',
      csb: 'Mòrsczé i Finansowé Centrum',
    },
  },
  {
    id: 'rome',
    name: 'Rome',
    countryCode: '380',
    provinceId: '380_p0',
    lat: 41.9028,
    lng: 12.4964,
    populationLabel: '2.76M',
    strategicRole: {
      en: 'Mediterranean Naval Bastion & Heritage Seat',
      pl: 'Śródziemnomorski Bastion Morski',
      szl: 'Śrōdziymnomorski Bastiōn',
      csb: 'Strzódzemnomòrsczi Bastion',
    },
  },
  {
    id: 'madrid',
    name: 'Madrid',
    countryCode: '724',
    provinceId: '724_p0',
    lat: 40.4168,
    lng: -3.7038,
    populationLabel: '3.33M',
    strategicRole: {
      en: 'Iberian Highland Hub & Atlantic Transit',
      pl: 'Iberyjski Węzeł Strategiczny',
      szl: 'Iberyjski Wynzeł',
      csb: 'Iberyjsczi Wãzeł',
    },
  },
  {
    id: 'vienna',
    name: 'Vienna',
    countryCode: '040',
    provinceId: '040_p0',
    lat: 48.2082,
    lng: 16.3738,
    populationLabel: '2.01M',
    strategicRole: {
      en: 'Alpine-Danube Summit & Diplomatic Gate',
      pl: 'Alpejsko-Dunajska Brama Dyplomatyczna',
      szl: 'Dunajsko Brama Dyplomatyczno',
      csb: 'Alpejskò-Dunajowô Brama',
    },
  },
  {
    id: 'kyiv',
    name: 'Kyiv',
    countryCode: '804',
    provinceId: '804_p0',
    lat: 50.4501,
    lng: 30.5234,
    populationLabel: '2.95M',
    strategicRole: {
      en: 'Dnieper Defense Citadel & Black Sea Corridor',
      pl: 'Cytadela nad Dnieprem i Korytarz Czarnomorski',
      szl: 'Cytadela nad Dnieprym',
      csb: 'Cwiardza nad Dnieprã',
    },
  },
  {
    id: 'stockholm',
    name: 'Stockholm',
    countryCode: '752',
    provinceId: '752_p0',
    lat: 59.3293,
    lng: 18.0686,
    populationLabel: '984K',
    strategicRole: {
      en: 'Baltic Archipelago Fleet & Arctic Radar',
      pl: 'Bałtycka Flota Archipelagu i Radar Arktyczny',
      szl: 'Bałtycko Flota i Radar',
      csb: 'Bôłtëckô Flota i Radar',
    },
  },
  {
    id: 'istanbul',
    name: 'Istanbul',
    countryCode: '792',
    provinceId: '792_p0',
    lat: 41.0082,
    lng: 28.9784,
    populationLabel: '15.9M',
    strategicRole: {
      en: 'Bosphorus Strait Choke Point & Transcontinental Bridge',
      pl: 'Cieśnina Bosfor i Most Międzykontynentalny',
      szl: 'Ciyśnina Bosfor',
      csb: 'Czesnina Bòsfòr',
    },
  },
  {
    id: 'cairo',
    name: 'Cairo',
    countryCode: '818',
    provinceId: '818_p0',
    lat: 30.0444,
    lng: 31.2357,
    populationLabel: '10.2M',
    strategicRole: {
      en: 'Suez Canal Lifeblood & Nile Delta Hub',
      pl: 'Kanał Sueski i Delta Nilu',
      szl: 'Kanał Sueski i Nil',
      csb: 'Kanał Suesczi i Nil',
    },
  },
  {
    id: 'new_delhi',
    name: 'New Delhi',
    countryCode: '356',
    provinceId: '356_p0',
    lat: 28.6139,
    lng: 77.209,
    populationLabel: '32.9M',
    strategicRole: {
      en: 'South Asian Command & Space Launch Directorate',
      pl: 'Dowództwo Azji Południowej i Program Kosmiczny',
      szl: 'Dowōdztwo Azyje i Kosmos',
      csb: 'Dowództwò Azji i Kòsmòs',
    },
  },
  {
    id: 'beijing',
    name: 'Beijing',
    countryCode: '156',
    provinceId: '156_p0',
    lat: 39.9042,
    lng: 116.4074,
    populationLabel: '21.9M',
    strategicRole: {
      en: 'East Asian Superpower Command & Rare Earths Network',
      pl: 'Centrum Przemysłowe i Ziem Rzadkich',
      szl: 'Cyntrum Przemysłu i Zym Rzadkich',
      csb: 'Centrum Przemësłu i Rzadczich Zemiów',
    },
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    countryCode: '392',
    provinceId: '392_p0',
    lat: 35.6762,
    lng: 139.6503,
    populationLabel: '14.1M',
    strategicRole: {
      en: 'Pacific Robotics & Carrier Task Force HQ',
      pl: 'Pacyficzne Centrum Robotyki i Floty',
      szl: 'Pacyficzne Cyntrum Robotyki',
      csb: 'Pacyficzné Centrum Robòticzi',
    },
  },
  {
    id: 'seoul',
    name: 'Seoul',
    countryCode: '410',
    provinceId: '410_p0',
    lat: 37.5665,
    lng: 126.978,
    populationLabel: '9.6M',
    strategicRole: {
      en: 'High-Tech Semiconductor & Missile Shield Nexus',
      pl: 'Hub Półprzewodników i Tarczy Antyrakietowej',
      szl: 'Cyntrum Technologije i Rakiet',
      csb: 'Centrum Technòlogii i Tarczë',
    },
  },
  {
    id: 'washington',
    name: 'Washington, D.C.',
    countryCode: '840',
    provinceId: '840_p0',
    lat: 38.9072,
    lng: -77.0369,
    populationLabel: '689K',
    strategicRole: {
      en: 'North American Strategic Command & Orbital Defense',
      pl: 'Dowództwo Strategiczne i Tarcza Orbitalna',
      szl: 'Strategiczne Dowōdztwo i Ôrbita',
      csb: 'Strategiczné Dowództwò i Òrbita',
    },
  },
  {
    id: 'brasilia',
    name: 'Brasília',
    countryCode: '076',
    provinceId: '076_p0',
    lat: -15.7975,
    lng: -47.8919,
    populationLabel: '2.82M',
    strategicRole: {
      en: 'South American Interior Command & Aerospace Hub',
      pl: 'Centrum Ameryki Południowej i Zasoby',
      szl: 'Cyntrum Ameryki Połedniowyj',
      csb: 'Centrum Americzi Pôłniowë',
    },
  },
  {
    id: 'nuuk',
    name: 'Nuuk',
    countryCode: '304',
    provinceId: '304_p0',
    lat: 64.1814,
    lng: -51.6941,
    populationLabel: '20K',
    strategicRole: {
      en: 'Greenlandic Arctic Command & North Atlantic Gateway',
      pl: 'Arktyczne Dowództwo Grenlandii i Brama Północna',
      szl: 'Arktyczne Dowōdztwo Grynlandyje',
      csb: 'Arkticzné Dowództwò Grenlandii',
    },
  },
  {
    id: 'canberra',
    name: 'Canberra',
    countryCode: '036',
    provinceId: '036_p0',
    lat: -35.2809,
    lng: 149.13,
    populationLabel: '466K',
    strategicRole: {
      en: 'Indo-Pacific Deep-Space Telemetry & Naval Anchor',
      pl: 'Telemetria Głębokiego Kosmosu i Pacyfik',
      szl: 'Telemetrijo Kosmosu i Pacyfik',
      csb: 'Telemetriô Kòsmòsu i Pacyfik',
    },
  },
];

export function getCityById(id: string | null): MajorCity | null {
  if (!id) return null;
  return MAJOR_CITIES.find((c) => c.id === id) ?? null;
}

export function getCitiesForProvince(provinceId: string, countryCode?: string): MajorCity[] {
  const exact = MAJOR_CITIES.filter((c) => c.provinceId === provinceId);
  if (exact.length > 0) return exact;
  if (countryCode) {
    return MAJOR_CITIES.filter((c) => c.countryCode === countryCode);
  }
  return [];
}

/**
 * Convert geographic coordinates (WGS84 lat/lng) to slippy-map Web Mercator XYZ tile indices.
 */
export function latLngToEsriTile(lat: number, lng: number, zoom: number): { x: number; y: number; z: number } {
  const n = Math.pow(2, zoom);
  const clampedLat = Math.max(-85.0511, Math.min(85.0511, lat));
  const latRad = (clampedLat * Math.PI) / 180;
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return {
    x: ((x % n) + n) % n,
    y: Math.max(0, Math.min(n - 1, y)),
    z: zoom,
  };
}

/**
 * 100% Free Esri World Imagery XYZ tile URL (no API key, no watermarks).
 */
export function getEsriTileUrl(z: number, x: number, y: number): string {
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
}

/**
 * Direct Google Maps Street View panorama external URL (no API key required).
 */
export function getGoogleMapsStreetViewUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat.toFixed(4)},${lng.toFixed(4)}`;
}
