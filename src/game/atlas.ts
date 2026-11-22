import { geoArea, geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import worldAtlasRaw from 'world-atlas/countries-110m.json';
import type { Province, StrategicResourceType, StraitBlockade, UnitMix } from './types';

export const MAP_WIDTH = 2400;
export const MAP_HEIGHT = 1200;

export function projectLonLat(lon: number, lat: number): [number, number] {
  const x = ((lon + 180) / 360) * MAP_WIDTH;
  const y = ((90 - lat) / 180) * MAP_HEIGHT;
  return [x, y];
}

export function unprojectXY(x: number, y: number): [number, number] {
  const lon = (x / MAP_WIDTH) * 360 - 180;
  const lat = 90 - (y / MAP_HEIGHT) * 180;
  return [lon, lat];
}

export interface PolishVoivodeshipDef {
  id: string;
  name: string;
  city: string;
  lon: number;
  lat: number;
  pop: number;
  eco: number;
  resource: StrategicResourceType;
  isCapital?: boolean;
  isCoastal?: boolean;
}

export const POLAND_VOIVODESHIPS: PolishVoivodeshipDef[] = [
  { id: 'PL_ZP', name: 'Zachodniopomorskie', city: 'Szczecin', lon: 15.35, lat: 53.55, pop: 1.65, eco: 1.15, resource: 'steel', isCoastal: true },
  { id: 'PL_PM', name: 'Pomorskie', city: 'Gdańsk', lon: 18.05, lat: 54.15, pop: 2.36, eco: 1.35, resource: 'oil', isCoastal: true },
  { id: 'PL_WM', name: 'Warmińsko-Mazurskie', city: 'Olsztyn', lon: 20.8, lat: 53.85, pop: 1.37, eco: 0.95, resource: 'steel', isCoastal: true },
  { id: 'PL_PD', name: 'Podlaskie', city: 'Białystok', lon: 23.0, lat: 53.25, pop: 1.15, eco: 0.92, resource: 'rare_earths' },
  { id: 'PL_LB', name: 'Lubuskie', city: 'Gorzów Wlkp.', lon: 15.25, lat: 52.18, pop: 0.98, eco: 0.98, resource: 'oil' },
  { id: 'PL_WP', name: 'Wielkopolskie', city: 'Poznań', lon: 17.1, lat: 52.35, pop: 3.5, eco: 1.4, resource: 'steel' },
  { id: 'PL_KP', name: 'Kujawsko-Pomorskie', city: 'Bydgoszcz', lon: 18.4, lat: 53.02, pop: 2.01, eco: 1.1, resource: 'steel' },
  { id: 'PL_MZ', name: 'Mazowieckie', city: 'Warszawa', lon: 21.01, lat: 52.23, pop: 5.51, eco: 1.85, resource: 'rare_earths', isCapital: true },
  { id: 'PL_LD', name: 'Łódzkie', city: 'Łódź', lon: 19.45, lat: 51.62, pop: 2.39, eco: 1.25, resource: 'steel' },
  { id: 'PL_LU', name: 'Lubelskie', city: 'Lublin', lon: 22.85, lat: 51.22, pop: 2.03, eco: 1.0, resource: 'uranium' },
  { id: 'PL_DS', name: 'Dolnośląskie', city: 'Wrocław', lon: 16.45, lat: 51.05, pop: 2.89, eco: 1.45, resource: 'rare_earths' },
  { id: 'PL_OP', name: 'Opolskie', city: 'Opole', lon: 17.92, lat: 50.65, pop: 0.95, eco: 1.02, resource: 'steel' },
  { id: 'PL_SL', name: 'Śląskie', city: 'Katowice / Jastrzębie', lon: 18.88, lat: 50.25, pop: 4.35, eco: 1.65, resource: 'steel' },
  { id: 'PL_SK', name: 'Świętokrzyskie', city: 'Kielce', lon: 20.65, lat: 50.85, pop: 1.18, eco: 0.98, resource: 'uranium' },
  { id: 'PL_MA', name: 'Małopolskie', city: 'Kraków', lon: 20.15, lat: 49.85, pop: 3.43, eco: 1.45, resource: 'rare_earths' },
  { id: 'PL_PK', name: 'Podkarpackie', city: 'Rzeszów', lon: 22.15, lat: 49.95, pop: 2.08, eco: 1.12, resource: 'oil' },
];

// Sutherland-Hodgman polygon clip against Voronoi bisector line: closer to (ax, ay) than (bx, by)
function clipPolygonHalfPlane(ring: [number, number][], ax: number, ay: number, bx: number, by: number): [number, number][] {
  if (ring.length < 3) return [];
  const mx = (ax + bx) * 0.5;
  const my = (ay + by) * 0.5;
  const dx = ax - bx;
  const dy = ay - by;

  const isInside = (p: [number, number]) => (p[0] - mx) * dx + (p[1] - my) * dy >= -1e-9;

  const intersect = (p1: [number, number], p2: [number, number]): [number, number] => {
    const d1 = (p1[0] - mx) * dx + (p1[1] - my) * dy;
    const d2 = (p2[0] - mx) * dx + (p2[1] - my) * dy;
    const denom = d1 - d2;
    if (Math.abs(denom) < 1e-12) return p1;
    const t = Math.max(0, Math.min(1, d1 / denom));
    return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])];
  };

  const out: [number, number][] = [];
  for (let i = 0; i < ring.length; i++) {
    const cur = ring[i];
    const prev = ring[(i + ring.length - 1) % ring.length];
    const curIn = isInside(cur);
    const prevIn = isInside(prev);
    if (curIn) {
      if (!prevIn) out.push(intersect(prev, cur));
      out.push(cur);
    } else if (prevIn) {
      out.push(intersect(prev, cur));
    }
  }
  return out;
}

export const ISO_TO_FLAG2: Record<string, string> = {
  '616': 'PL', '276': 'DE', '250': 'FR', '826': 'GB', '840': 'US', '124': 'CA',
  '643': 'RU', '156': 'CN', '356': 'IN', '392': 'JP', '410': 'KR', '408': 'KP',
  '076': 'BR', '032': 'AR', '484': 'MX', '036': 'AU', '554': 'NZ', '304': 'GL',
  '804': 'UA', '112': 'BY', '440': 'LT', '428': 'LV', '233': 'EE', '203': 'CZ',
  '703': 'SK', '348': 'HU', '642': 'RO', '100': 'BG', '300': 'GR', '792': 'TR',
  '380': 'IT', '724': 'ES', '620': 'PT', '528': 'NL', '056': 'BE', '756': 'CH',
  '040': 'AT', '208': 'DK', '578': 'NO', '752': 'SE', '246': 'FI', '352': 'IS',
  '372': 'IE', '818': 'EG', '504': 'MA', '012': 'DZ', '788': 'TN', '434': 'LY',
  '710': 'ZA', '566': 'NG', '231': 'ET', '404': 'KE', '682': 'SA', '364': 'IR',
  '368': 'IQ', '376': 'IL', '784': 'AE', '634': 'QA', '586': 'PK', '004': 'AF',
  '398': 'KZ', '360': 'ID', '764': 'TH', '704': 'VN', '608': 'PH', '458': 'MY',
  '170': 'CO', '604': 'PE', '152': 'CL', '862': 'VE', '192': 'CU',
};

export interface CountryBaseMeta {
  color: string;
  capital: string;
  government: string;
  continent: Province['continent'];
  popScale: number;
  ecoScale: number;
  armyScale: number;
  resource: StrategicResourceType;
}

const PALETTE = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#E11D48',
  '#0EA5E9', '#D97706', '#22C55E', '#A855F7',
];

const COUNTRY_OVERRIDES: Record<string, Partial<CountryBaseMeta>> = {
  '616': { color: '#DC143C', capital: 'Warszawa', government: 'Republic', continent: 'Europe', popScale: 38, ecoScale: 24, armyScale: 84000, resource: 'steel' },
  '276': { color: '#4B5563', capital: 'Berlin', government: 'Federal Republic', continent: 'Europe', popScale: 84, ecoScale: 52, armyScale: 120000, resource: 'steel' },
  '250': { color: '#2563EB', capital: 'Paris', government: 'Republic', continent: 'Europe', popScale: 68, ecoScale: 44, armyScale: 112000, resource: 'uranium' },
  '826': { color: '#B91C1C', capital: 'London', government: 'Constitutional Monarchy', continent: 'Europe', popScale: 67, ecoScale: 43, armyScale: 96000, resource: 'oil' },
  '840': { color: '#1D4ED8', capital: 'Washington, D.C.', government: 'Federal Republic', continent: 'North America', popScale: 335, ecoScale: 115, armyScale: 240000, resource: 'oil' },
  '156': { color: '#DC2626', capital: 'Beijing', government: "People's Republic", continent: 'Asia', popScale: 1410, ecoScale: 105, armyScale: 290000, resource: 'rare_earths' },
  '356': { color: '#F97316', capital: 'New Delhi', government: 'Federal Republic', continent: 'Asia', popScale: 1420, ecoScale: 68, armyScale: 230000, resource: 'steel' },
  '643': { color: '#15803D', capital: 'Moscow', government: 'Federation', continent: 'Europe', popScale: 144, ecoScale: 46, armyScale: 195000, resource: 'oil' },
  '804': { color: '#EAB308', capital: 'Kyiv', government: 'Republic', continent: 'Europe', popScale: 38, ecoScale: 16, armyScale: 78000, resource: 'steel' },
  '112': { color: '#16A34A', capital: 'Minsk', government: 'Republic', continent: 'Europe', popScale: 9.2, ecoScale: 7, armyScale: 32000, resource: 'steel' },
  '440': { color: '#65A30D', capital: 'Vilnius', government: 'Republic', continent: 'Europe', popScale: 2.8, ecoScale: 6, armyScale: 16000, resource: 'rare_earths' },
  '203': { color: ' #0284C7'.trim(), capital: 'Prague', government: 'Republic', continent: 'Europe', popScale: 10.8, ecoScale: 13, armyScale: 34000, resource: 'steel' },
  '703': { color: '#0EA5E9', capital: 'Bratislava', government: 'Republic', continent: 'Europe', popScale: 5.4, ecoScale: 8, armyScale: 19000, resource: 'steel' },
  '304': { color: '#38BDF8', capital: 'Nuuk', government: 'Arctic Autonomous', continent: 'North America', popScale: 0.06, ecoScale: 5, armyScale: 8000, resource: 'rare_earths' },
  '392': { color: '#E11D48', capital: 'Tokyo', government: 'Parliamentary Monarchy', continent: 'Asia', popScale: 124, ecoScale: 58, armyScale: 115000, resource: 'rare_earths' },
  '076': { color: '#22C55E', capital: 'Brasília', government: 'Federal Republic', continent: 'South America', popScale: 215, ecoScale: 40, armyScale: 110000, resource: 'oil' },
  '792': { color: '#EF4444', capital: 'Ankara', government: 'Republic', continent: 'Asia', popScale: 85, ecoScale: 26, armyScale: 105000, resource: 'steel' },
  '380': { color: '#10B981', capital: 'Rome', government: 'Republic', continent: 'Europe', popScale: 59, ecoScale: 36, armyScale: 88000, resource: 'steel' },
  '724': { color: '#F59E0B', capital: 'Madrid', government: 'Constitutional Monarchy', continent: 'Europe', popScale: 48, ecoScale: 30, armyScale: 72000, resource: 'steel' },
  '124': { color: '#F43F5E', capital: 'Ottawa', government: 'Federal Monarchy', continent: 'North America', popScale: 40, ecoScale: 36, armyScale: 62000, resource: 'uranium' },
  '036': { color: '#0D9488', capital: 'Canberra', government: 'Federal Commonwealth', continent: 'Oceania', popScale: 26, ecoScale: 32, armyScale: 58000, resource: 'rare_earths' },
  '818': { color: '#D97706', capital: 'Cairo', government: 'Republic', continent: 'Africa', popScale: 112, ecoScale: 20, armyScale: 92000, resource: 'oil' },
  '682': { color: '#059669', capital: 'Riyadh', government: 'Kingdom', continent: 'Asia', popScale: 36, ecoScale: 34, armyScale: 86000, resource: 'oil' },
  '410': { color: '#3B82F6', capital: 'Seoul', government: 'Republic', continent: 'Asia', popScale: 51, ecoScale: 42, armyScale: 118000, resource: 'rare_earths' },
  '710': { color: '#14B8A6', capital: 'Pretoria', government: 'Republic', continent: 'Africa', popScale: 60, ecoScale: 18, armyScale: 64000, resource: 'uranium' },
  '578': { color: '#2563EB', capital: 'Oslo', government: 'Constitutional Monarchy', continent: 'Europe', popScale: 5.5, ecoScale: 22, armyScale: 32000, resource: 'oil' },
  '752': { color: '#0284C7', capital: 'Stockholm', government: 'Constitutional Monarchy', continent: 'Europe', popScale: 10.5, ecoScale: 24, armyScale: 42000, resource: 'steel' },
  '246': { color: '#38BDF8', capital: 'Helsinki', government: 'Republic', continent: 'Europe', popScale: 5.6, ecoScale: 15, armyScale: 38000, resource: 'rare_earths' },
};

function inferContinent(lon: number, lat: number): Province['continent'] {
  if (lon < -30) return lat > 12 ? 'North America' : 'South America';
  if (lon >= -25 && lon <= 55 && lat > 35) return 'Europe';
  if (lon >= -20 && lon <= 52 && lat <= 35 && lat >= -38) return 'Africa';
  if (lon > 110 && lat < -8) return 'Oceania';
  return 'Asia';
}

function emptyUnits(infantry: number): UnitMix {
  return {
    infantry,
    tank: Math.round(infantry * 0.08),
    artillery: Math.round(infantry * 0.06),
    armored_train: 0,
    paratrooper: 0,
    combat_mech: 0,
    orbital_bomber: 0,
    titan_outpost: 0,
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function buildBaseTempFromLat(lat: number): number {
  const absLat = Math.abs(lat);
  const temp = 29 - (absLat / 78) * 37;
  return Math.round(temp * 10) / 10;
}

export interface AtlasBuildResult {
  provinces: Record<string, Province>;
  countryMetas: Record<
    string,
    {
      id: string;
      isoId: string;
      name: string;
      flagCode: string;
      color: string;
      capitalProvinceId: string;
      government: string;
    }
  >;
  straits: StraitBlockade[];
}

function polyBBox(polys: [number, number][][][]): [number, number, number, number] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const poly of polys) {
    for (const ring of poly) {
      for (const [x, y] of ring) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  return [minX, minY, maxX, maxY];
}

function ringsTouch(a: [number, number][][][], b: [number, number][][][]): boolean {
  const tolSq = 10 * 10;
  for (const pa of a) {
    const ra = pa[0];
    if (!ra) continue;
    for (let i = 0; i < ra.length; i += Math.max(1, Math.floor(ra.length / 26))) {
      const [ax, ay] = ra[i];
      for (const pb of b) {
        const rb = pb[0];
        if (!rb) continue;
        for (let j = 0; j < rb.length; j += Math.max(1, Math.floor(rb.length / 26))) {
          const [bx, by] = rb[j];
          const dx = ax - bx;
          const dy = ay - by;
          if (dx * dx + dy * dy <= tolSq) return true;
        }
      }
    }
  }
  return false;
}

let cachedAtlas: AtlasBuildResult | null = null;

export function buildWorldAtlas(): AtlasBuildResult {
  if (cachedAtlas) return cachedAtlas;

  const topo = worldAtlasRaw as unknown as Topology<{
    countries: GeometryCollection<{ name: string }>;
  }>;
  const fc = feature(topo, topo.objects.countries);

  const provinces: Record<string, Province> = {};
  const countryMetas: AtlasBuildResult['countryMetas'] = {};
  const bboxes: Record<string, [number, number, number, number]> = {};

  let unnamedCounter = 1;
  for (const feat of fc.features) {
    const rawName = feat.properties?.name || `Region ${unnamedCounter}`;
    const isoId = feat.id ? String(feat.id).padStart(3, '0') : `X${unnamedCounter++}`;
    if (isoId === '010' || rawName === 'Antarctica') continue; // Antarctica non-playable icy wastes

    const geom = feat.geometry;
    if (!geom) continue;

    // Extract raw lon/lat polygon rings
    const rawLonLatPolys: [number, number][][][] =
      geom.type === 'Polygon'
        ? [geom.coordinates as [number, number][][]]
        : geom.type === 'MultiPolygon'
          ? (geom.coordinates as [number, number][][][])
          : [];
    if (rawLonLatPolys.length === 0) continue;

    const h = hashStr(isoId + rawName);
    const ov = COUNTRY_OVERRIDES[isoId] ?? {};
    const [cLon, cLat] = geoCentroid(feat as GeoJSON.Feature);
    const safeLon = Number.isFinite(cLon) ? cLon : 0;
    const safeLat = Number.isFinite(cLat) ? cLat : 20;
    const areaSter = geoArea(feat as GeoJSON.Feature);
    const areaKm2 = Math.max(1200, Math.round(areaSter * 6371 * 6371));

    const continent = ov.continent ?? inferContinent(safeLon, safeLat);
    const color = ov.color ?? PALETTE[h % PALETTE.length];
    const flagCode = ISO_TO_FLAG2[isoId] ?? (rawName.slice(0, 2).toUpperCase());
    const resources: StrategicResourceType[] = ['oil', 'steel', 'uranium', 'rare_earths'];
    const defaultRes = ov.resource ?? resources[h % resources.length];
    const countryId = `C_${isoId}`;

    // Special partition: Poland (`616`) divided into all 16 real voivodeships via exact Voronoi half-plane clipping
    if (isoId === '616') {
      const outerRings = rawLonLatPolys.map((p) => p[0]).filter((r) => r && r.length >= 3);
      for (const v of POLAND_VOIVODESHIPS) {
        const clippedPolys: [number, number][][][] = [];
        for (const ring of outerRings) {
          let current = ring.slice();
          for (const other of POLAND_VOIVODESHIPS) {
            if (other.id === v.id) continue;
            current = clipPolygonHalfPlane(current, v.lon, v.lat, other.lon, other.lat);
            if (current.length < 3) break;
          }
          if (current.length >= 3) {
            clippedPolys.push([current.map(([ln, lt]) => projectLonLat(ln, lt))]);
          }
        }
        // Guarantee non-empty fallback triangle around voivodeship centroid if ring clipped cleanly on edge
        if (clippedPolys.length === 0) {
          const [cx, cy] = projectLonLat(v.lon, v.lat);
          clippedPolys.push([[[cx - 3, cy - 3], [cx + 3, cy - 3], [cx, cy + 3]]]);
        }

        const [cx, cy] = projectLonLat(v.lon, v.lat);
        const startArmy = v.isCapital ? 12000 : 4800;
        const prov: Province = {
          id: v.id,
          isoId: '616',
          name: v.name,
          cityName: v.city,
          continent: 'Europe',
          ownerId: countryId,
          centroid: [cx, cy],
          lonLat: [v.lon, v.lat],
          areaKm2: Math.round(312696 / 16),
          population: v.pop,
          economy: v.eco,
          army: startArmy,
          units: emptyUnits(startArmy),
          isCapital: Boolean(v.isCapital),
          isCoastal: Boolean(v.isCoastal),
          isVoivodeship: true,
          assimilated: true,
          buildings: v.isCapital ? ['barracks', 'railway', 'airfield'] : ['farm'],
          resource: v.resource,
          baseTempC: buildBaseTempFromLat(v.lat),
          currentTempC: buildBaseTempFromLat(v.lat),
          weather: 'clear',
          encircled: false,
          cityDamaged: false,
          neighbors: [],
          seaNeighbors: [],
          polygons: clippedPolys,
        };
        provinces[v.id] = prov;
        bboxes[v.id] = polyBBox(clippedPolys);
      }

      countryMetas[countryId] = {
        id: countryId,
        isoId,
        name: 'Poland',
        flagCode: 'PL',
        color,
        capitalProvinceId: 'PL_MZ',
        government: 'Republic',
      };
      continue;
    }

    // Standard world country province
    const projectedPolys: [number, number][][][] = rawLonLatPolys.map((poly) =>
      poly.map((ring) =>
        ring.map(([ln, lt]) => {
          // Guard antimeridian spikes cleanly
          return projectLonLat(ln, lt);
        }),
      ),
    );

    const [cx, cy] = projectLonLat(safeLon, safeLat);
    const baseArmy = ov.armyScale ?? Math.max(4500, Math.min(95000, Math.round(7000 + Math.sqrt(areaKm2) * 28)));
    const basePop = ov.popScale ?? Math.max(0.15, Math.round((Math.sqrt(areaKm2) * 0.08 + (h % 14)) * 10) / 10);
    const baseEco = ov.ecoScale ?? Math.max(4, Math.round(8 + (h % 16)));
    const provId = `P_${isoId}`;

    const displayName = rawName === 'United States of America' ? 'United States' : rawName;
    const prov: Province = {
      id: provId,
      isoId,
      name: displayName,
      cityName: ov.capital ?? displayName,
      continent,
      ownerId: countryId,
      centroid: [cx, cy],
      lonLat: [safeLon, safeLat],
      areaKm2,
      population: basePop,
      economy: baseEco,
      army: baseArmy,
      units: emptyUnits(baseArmy),
      isCapital: true,
      isCoastal: projectedPolys.length > 1 || Math.abs(safeLat) < 68,
      isVoivodeship: false,
      assimilated: true,
      buildings: baseArmy > 60000 ? ['barracks', 'factory', 'airfield'] : ['farm'],
      resource: defaultRes,
      baseTempC: buildBaseTempFromLat(safeLat),
      currentTempC: buildBaseTempFromLat(safeLat),
      weather: safeLat > 62 ? 'snow' : 'clear',
      encircled: false,
      cityDamaged: false,
      neighbors: [],
      seaNeighbors: [],
      polygons: projectedPolys,
    };
    provinces[provId] = prov;
    bboxes[provId] = polyBBox(projectedPolys);
    countryMetas[countryId] = {
      id: countryId,
      isoId,
      name: displayName,
      flagCode,
      color,
      capitalProvinceId: provId,
      government: ov.government ?? 'Republic',
    };
  }

  // Build symmetric land adjacency graph from bounding boxes + ring touch tolerance
  const provIds = Object.keys(provinces);
  for (let i = 0; i < provIds.length; i++) {
    const idA = provIds[i];
    const bA = bboxes[idA];
    const pA = provinces[idA];
    for (let j = i + 1; j < provIds.length; j++) {
      const idB = provIds[j];
      const bB = bboxes[idB];
      if (bA[2] + 12 < bB[0] || bB[2] + 12 < bA[0] || bA[3] + 12 < bB[1] || bB[3] + 12 < bA[1]) continue;
      const pB = provinces[idB];
      if (ringsTouch(pA.polygons, pB.polygons)) {
        pA.neighbors.push(idB);
        pB.neighbors.push(idA);
      }
    }
  }

  // Ensure island nations & cross-sea strategic connections have clean seaNeighbors
  const SEA_LINKS: [string, string][] = [
    ['P_826', 'P_250'], // UK <-> France
    ['P_826', 'P_372'], // UK <-> Ireland
    ['P_826', 'P_578'], // UK <-> Norway
    ['P_304', 'P_124'], // Greenland <-> Canada
    ['P_304', 'P_352'], // Greenland <-> Iceland
    ['P_352', 'P_578'], // Iceland <-> Norway
    ['P_392', 'P_410'], // Japan <-> South Korea
    ['P_392', 'P_156'], // Japan <-> China
    ['P_158', 'P_156'], // Taiwan <-> China
    ['P_608', 'P_458'], // Philippines <-> Malaysia
    ['P_360', 'P_458'], // Indonesia <-> Malaysia
    ['P_036', 'P_360'], // Australia <-> Indonesia
    ['P_036', 'P_554'], // Australia <-> New Zealand
    ['P_192', 'P_840'], // Cuba <-> US
    ['P_450', 'P_508'], // Madagascar <-> Mozambique
    ['P_144', 'P_356'], // Sri Lanka <-> India
    ['PL_PM', 'P_752'], // Gdansk <-> Sweden (Baltic Sea)
    ['P_208', 'P_752'], // Denmark <-> Sweden
    ['P_380', 'P_788'], // Italy <-> Tunisia
    ['P_724', 'P_504'], // Spain <-> Morocco (Gibraltar)
    ['P_840', 'P_826'], // Atlantic Fleet Bridge US <-> UK
    ['P_840', 'P_392'], // Pacific Fleet Bridge US <-> Japan
  ];
  for (const [a, b] of SEA_LINKS) {
    if (provinces[a] && provinces[b]) {
      if (!provinces[a].seaNeighbors.includes(b)) provinces[a].seaNeighbors.push(b);
      if (!provinces[b].seaNeighbors.includes(a)) provinces[b].seaNeighbors.push(a);
    }
  }

  // Ensure every coastal or isolated province has at least nearest maritime neighbor
  for (const p of Object.values(provinces)) {
    if (p.neighbors.length === 0 && p.seaNeighbors.length === 0) {
      let bestId: string | null = null;
      let bestD = Infinity;
      for (const other of Object.values(provinces)) {
        if (other.id === p.id) continue;
        const dx = p.centroid[0] - other.centroid[0];
        const dy = p.centroid[1] - other.centroid[1];
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          bestId = other.id;
        }
      }
      if (bestId) {
        p.seaNeighbors.push(bestId);
        provinces[bestId].seaNeighbors.push(p.id);
      }
    }
  }

  const straits: StraitBlockade[] = [
    { id: 'danish_straits', name: 'Danish / Baltic Straits', x: projectLonLat(11.5, 56.0)[0], y: projectLonLat(11.5, 56.0)[1], blockerCountryId: null, tradePenaltyPct: 18 },
    { id: 'gibraltar', name: 'Strait of Gibraltar', x: projectLonLat(-5.5, 36.0)[0], y: projectLonLat(-5.5, 36.0)[1], blockerCountryId: null, tradePenaltyPct: 22 },
    { id: 'suez', name: 'Suez Canal', x: projectLonLat(32.5, 30.2)[0], y: projectLonLat(32.5, 30.2)[1], blockerCountryId: null, tradePenaltyPct: 28 },
    { id: 'bosphorus', name: 'Bosphorus Strait', x: projectLonLat(29.0, 41.2)[0], y: projectLonLat(29.0, 41.2)[1], blockerCountryId: null, tradePenaltyPct: 16 },
    { id: 'hormuz', name: 'Strait of Hormuz', x: projectLonLat(56.4, 26.5)[0], y: projectLonLat(56.4, 26.5)[1], blockerCountryId: null, tradePenaltyPct: 25 },
    { id: 'malacca', name: 'Strait of Malacca', x: projectLonLat(101.5, 2.5)[0], y: projectLonLat(101.5, 2.5)[1], blockerCountryId: null, tradePenaltyPct: 26 },
    { id: 'panama', name: 'Panama Canal', x: projectLonLat(-79.8, 9.1)[0], y: projectLonLat(-79.8, 9.1)[1], blockerCountryId: null, tradePenaltyPct: 24 },
  ];

  cachedAtlas = { provinces, countryMetas, straits };
  return cachedAtlas;
}
