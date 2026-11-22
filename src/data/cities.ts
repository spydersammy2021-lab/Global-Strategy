export interface CityReconSpot {
  id: string;
  provinceIdMatch?: string;
  countryIso: string;
  city: string;
  countryName: string;
  lat: number;
  lon: number;
  populationLabel: string;
  landmarks: string[];
  tier: 'major' | 'capital' | 'tactical';
}

export const CITY_RECON_SPOTS: CityReconSpot[] = [
  {
    id: 'warsaw',
    provinceIdMatch: 'PL_MZ',
    countryIso: '616',
    city: 'Warsaw',
    countryName: 'Poland',
    lat: 52.2297,
    lon: 21.0122,
    populationLabel: '1.86M (Metro 3.1M)',
    landmarks: ['Royal Castle', 'Palace of Culture & Science', 'Vistula Boulevards'],
    tier: 'capital',
  },
  {
    id: 'jastrzebie_zdroj',
    provinceIdMatch: 'PL_SL',
    countryIso: '616',
    city: 'Jastrzębie-Zdrój',
    countryName: 'Poland',
    lat: 49.9489,
    lon: 18.5997,
    populationLabel: '84,000',
    landmarks: ['Spa Park (Park Zdrojowy)', 'Silesian Coal & Steel Hub', 'Southern Rail Gate'],
    tier: 'tactical',
  },
  {
    id: 'gdansk',
    provinceIdMatch: 'PL_PM',
    countryIso: '616',
    city: 'Gdańsk',
    countryName: 'Poland',
    lat: 54.352,
    lon: 18.6466,
    populationLabel: '486,000',
    landmarks: ['Baltic Deepwater Terminal', 'Long Market', 'Westerplatte'],
    tier: 'major',
  },
  {
    id: 'krakow',
    provinceIdMatch: 'PL_MA',
    countryIso: '616',
    city: 'Kraków',
    countryName: 'Poland',
    lat: 50.0647,
    lon: 19.945,
    populationLabel: '804,000',
    landmarks: ['Wawel Royal Castle', 'Main Market Square', 'Vistula Bend'],
    tier: 'major',
  },
  {
    id: 'wroclaw',
    provinceIdMatch: 'PL_DS',
    countryIso: '616',
    city: 'Wrocław',
    countryName: 'Poland',
    lat: 51.1079,
    lon: 17.0385,
    populationLabel: '674,000',
    landmarks: ['Centennial Hall', 'Ostrów Tumski', 'Odra Bridges'],
    tier: 'major',
  },
  {
    id: 'poznan',
    provinceIdMatch: 'PL_WP',
    countryIso: '616',
    city: 'Poznań',
    countryName: 'Poland',
    lat: 52.4064,
    lon: 16.9252,
    populationLabel: '541,000',
    landmarks: ['Imperial Castle', 'Old Market', 'Warta Crossing'],
    tier: 'major',
  },
  {
    id: 'nuuk',
    countryIso: '304',
    city: 'Nuuk',
    countryName: 'Greenland',
    lat: 64.1814,
    lon: -51.6941,
    populationLabel: '19,800',
    landmarks: ['Nuuk Deep Fjord Port', 'Arctic Air Strip', 'Rare-Earth Terminal'],
    tier: 'capital',
  },
  {
    id: 'berlin',
    countryIso: '276',
    city: 'Berlin',
    countryName: 'Germany',
    lat: 52.52,
    lon: 13.405,
    populationLabel: '3.75M',
    landmarks: ['Brandenburg Gate', 'Reichstag', 'Spree Rail Axis'],
    tier: 'capital',
  },
  {
    id: 'kyiv',
    countryIso: '804',
    city: 'Kyiv',
    countryName: 'Ukraine',
    lat: 50.4501,
    lon: 30.5234,
    populationLabel: '2.95M',
    landmarks: ['Dnieper Crossing', 'Independence Square', 'Kyiv Pechersk'],
    tier: 'capital',
  },
  {
    id: 'minsk',
    countryIso: '112',
    city: 'Minsk',
    countryName: 'Belarus',
    lat: 53.9006,
    lon: 27.559,
    populationLabel: '2.0M',
    landmarks: ['Independence Avenue', 'Svislach Junction'],
    tier: 'capital',
  },
  {
    id: 'paris',
    countryIso: '250',
    city: 'Paris',
    countryName: 'France',
    lat: 48.8566,
    lon: 2.3522,
    populationLabel: '2.1M (Metro 11M)',
    landmarks: ['Eiffel Tower', 'Seine Bridges', 'Île de la Cité'],
    tier: 'capital',
  },
  {
    id: 'london',
    countryIso: '826',
    city: 'London',
    countryName: 'United Kingdom',
    lat: 51.5072,
    lon: -0.1276,
    populationLabel: '8.9M',
    landmarks: ['Thames Estuary', 'Westminster', 'Tower Bridge'],
    tier: 'capital',
  },
  {
    id: 'washington',
    countryIso: '840',
    city: 'Washington, D.C.',
    countryName: 'United States',
    lat: 38.9072,
    lon: -77.0369,
    populationLabel: '678,000 (Metro 6.3M)',
    landmarks: ['National Mall', 'Potomac Command', 'Arlington'],
    tier: 'capital',
  },
  {
    id: 'new_york',
    countryIso: '840',
    city: 'New York',
    countryName: 'United States',
    lat: 40.7128,
    lon: -74.006,
    populationLabel: '8.3M',
    landmarks: ['Manhattan Harbor', 'Atlantic Sea Hub'],
    tier: 'major',
  },
  {
    id: 'tokyo',
    countryIso: '392',
    city: 'Tokyo',
    countryName: 'Japan',
    lat: 35.6762,
    lon: 139.6503,
    populationLabel: '14.0M',
    landmarks: ['Tokyo Bay', 'Imperial Palace', 'Shinkansen Hub'],
    tier: 'capital',
  },
  {
    id: 'beijing',
    countryIso: '156',
    city: 'Beijing',
    countryName: 'China',
    lat: 39.9042,
    lon: 116.4074,
    populationLabel: '21.8M',
    landmarks: ['Forbidden City', 'North China Rail Corridor'],
    tier: 'capital',
  },
  {
    id: 'new_delhi',
    countryIso: '356',
    city: 'New Delhi',
    countryName: 'India',
    lat: 28.6139,
    lon: 77.209,
    populationLabel: '32.9M Metro',
    landmarks: ['India Gate', 'Yamuna Corridor'],
    tier: 'capital',
  },
  {
    id: 'cairo',
    countryIso: '818',
    city: 'Cairo',
    countryName: 'Egypt',
    lat: 30.0444,
    lon: 31.2357,
    populationLabel: '22.1M Metro',
    landmarks: ['Giza Plateau', 'Nile Delta', 'Suez Gateway'],
    tier: 'capital',
  },
  {
    id: 'rio',
    countryIso: '076',
    city: 'Brasília / Rio',
    countryName: 'Brazil',
    lat: -22.9068,
    lon: -43.1729,
    populationLabel: '6.7M',
    landmarks: ['Guanabara Bay', 'South Atlantic Port'],
    tier: 'major',
  },
  {
    id: 'sydney',
    countryIso: '036',
    city: 'Sydney',
    countryName: 'Australia',
    lat: -33.8688,
    lon: 151.2093,
    populationLabel: '5.3M',
    landmarks: ['Sydney Harbour', 'Pacific Port'],
    tier: 'major',
  },
];

export function buildZeroKeyCityUrls(lat: number, lon: number): {
  esriSatelliteUrl: string;
  streetViewUrl: string;
  osmUrl: string;
} {
  const esriSatelliteUrl = `https://www.arcgis.com/apps/mapviewer/index.html?center=${lon.toFixed(4)},${lat.toFixed(4)}&level=14&basemapUrl=https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer`;
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat.toFixed(4)},${lon.toFixed(4)}`;
  const osmUrl = `https://www.openstreetmap.org/#map=14/${lat.toFixed(4)}/${lon.toFixed(4)}`;
  return { esriSatelliteUrl, streetViewUrl, osmUrl };
}

export function getCityReconForProvince(provinceId: string, countryIso: string, fallbackName: string, lon: number, lat: number): CityReconSpot {
  const exact = CITY_RECON_SPOTS.find((c) => c.provinceIdMatch === provinceId || (c.countryIso === countryIso && c.tier === 'capital'));
  if (exact) return exact;
  return {
    id: `spot_${provinceId}`,
    countryIso,
    city: fallbackName,
    countryName: fallbackName,
    lat,
    lon,
    populationLabel: 'Regional Center',
    landmarks: ['Civic Citadel', 'Strategic Rail & Air Hub'],
    tier: 'tactical',
  };
}
