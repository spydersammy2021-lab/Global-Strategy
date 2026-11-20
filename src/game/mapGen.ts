import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import * as topojson from 'topojson-client';
import worldAtlas from 'world-atlas/countries-110m.json';
import { getCountryMeta, SEA_LANE_PAIRS } from '../data/countries';
import type { CountryMeta, ProvinceGeometry } from './types';

export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 1200;

type Point = [number, number];

interface VoivodeshipSpec {
  name: string;
  capitalCity?: string;
  lon: number;
  lat: number;
  areaKm2: number;
  popShare: number;
}

export const POLAND_VOIVODESHIPS: VoivodeshipSpec[] = [
  { name: 'Mazowieckie', capitalCity: 'Warszawa', lon: 21.01, lat: 52.23, areaKm2: 35558, popShare: 0.145 },
  { name: 'Śląskie', lon: 19.02, lat: 50.26, areaKm2: 12333, popShare: 0.115 },
  { name: 'Małopolskie', lon: 19.94, lat: 50.06, areaKm2: 15183, popShare: 0.091 },
  { name: 'Wielkopolskie', lon: 16.93, lat: 52.41, areaKm2: 29826, popShare: 0.092 },
  { name: 'Dolnośląskie', lon: 17.03, lat: 51.11, areaKm2: 19947, popShare: 0.077 },
  { name: 'Pomorskie', lon: 18.65, lat: 54.35, areaKm2: 18310, popShare: 0.063 },
  { name: 'Zachodniopomorskie', lon: 15.1, lat: 53.6, areaKm2: 22892, popShare: 0.044 },
  { name: 'Kujawsko-Pomorskie', lon: 18.2, lat: 53.05, areaKm2: 17972, popShare: 0.053 },
  { name: 'Łódzkie', lon: 19.46, lat: 51.76, areaKm2: 18219, popShare: 0.064 },
  { name: 'Lubelskie', lon: 22.75, lat: 51.25, areaKm2: 25122, popShare: 0.054 },
  { name: 'Podkarpackie', lon: 22.0, lat: 50.04, areaKm2: 17846, popShare: 0.055 },
  { name: 'Podlaskie', lon: 23.16, lat: 53.13, areaKm2: 20187, popShare: 0.03 },
  { name: 'Warmińsko-Mazurskie', lon: 20.6, lat: 53.8, areaKm2: 24173, popShare: 0.036 },
  { name: 'Lubuskie', lon: 15.51, lat: 52.05, areaKm2: 13988, popShare: 0.026 },
  { name: 'Opolskie', lon: 17.92, lat: 50.67, areaKm2: 9412, popShare: 0.025 },
  { name: 'Świętokrzyskie', lon: 20.63, lat: 50.87, areaKm2: 11710, popShare: 0.03 },
];

function polygonArea(ring: Point[]): number {
  let area = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) * 0.5;
}

function ringCentroid(ring: Point[]): Point {
  let cx = 0;
  let cy = 0;
  let areaSum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    const cross = x1 * y2 - x2 * y1;
    areaSum += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  if (Math.abs(areaSum) < 1e-6) {
    let sx = 0;
    let sy = 0;
    for (const [x, y] of ring) {
      sx += x;
      sy += y;
    }
    return [sx / Math.max(1, ring.length), sy / Math.max(1, ring.length)];
  }
  return [cx / (3 * areaSum), cy / (3 * areaSum)];
}

function pointInRing(pt: Point, ring: Point[]): boolean {
  let inside = false;
  const [px, py] = pt;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Clip polygon ring by half-plane: closer to seedA than seedB
function clipRingByBisector(ring: Point[], seedA: Point, seedB: Point): Point[] {
  if (ring.length < 3) return [];
  const mx = (seedA[0] + seedB[0]) * 0.5;
  const my = (seedA[1] + seedB[1]) * 0.5;
  const nx = seedA[0] - seedB[0];
  const ny = seedA[1] - seedB[1];

  const isInside = (p: Point) => (p[0] - mx) * nx + (p[1] - my) * ny >= -1e-6;

  const intersect = (a: Point, b: Point): Point => {
    const da = (a[0] - mx) * nx + (a[1] - my) * ny;
    const db = (b[0] - mx) * nx + (b[1] - my) * ny;
    const denom = da - db;
    if (Math.abs(denom) < 1e-9) return a;
    const t = da / denom;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };

  const out: Point[] = [];
  for (let i = 0; i < ring.length; i++) {
    const curr = ring[i];
    const prev = ring[(i + ring.length - 1) % ring.length];
    const currIn = isInside(curr);
    const prevIn = isInside(prev);
    if (currIn) {
      if (!prevIn) out.push(intersect(prev, curr));
      out.push(curr);
    } else if (prevIn) {
      out.push(intersect(prev, curr));
    }
  }
  return out;
}

function generateSeedsForRings(rings: Point[][], count: number): Point[] {
  if (count <= 1 || rings.length === 0) return [];
  let mainRing = rings[0];
  let maxA = 0;
  for (const r of rings) {
    const a = polygonArea(r);
    if (a > maxA) {
      maxA = a;
      mainRing = r;
    }
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of mainRing) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const samples: Point[] = [];
  const cols = 10;
  const rows = 8;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const pt: Point = [
        minX + ((c + 0.5) / cols) * (maxX - minX),
        minY + ((r + 0.5) / rows) * (maxY - minY),
      ];
      if (pointInRing(pt, mainRing)) {
        samples.push(pt);
      }
    }
  }

  if (samples.length < count) {
    const center = ringCentroid(mainRing);
    samples.push(center);
    for (
      let i = 0;
      i < mainRing.length && samples.length < count * 2;
      i += Math.max(1, Math.floor(mainRing.length / count))
    ) {
      samples.push([(mainRing[i][0] + center[0]) * 0.5, (mainRing[i][1] + center[1]) * 0.5]);
    }
  }

  if (samples.length === 0) return [ringCentroid(mainRing)];

  const seeds: Point[] = [samples[Math.floor(samples.length / 2)]];
  while (seeds.length < count && seeds.length < samples.length) {
    let bestPt = samples[0];
    let bestDist = -1;
    for (const s of samples) {
      let minD = Infinity;
      for (const chosen of seeds) {
        const dx = s[0] - chosen[0];
        const dy = s[1] - chosen[1];
        const d = dx * dx + dy * dy;
        if (d < minD) minD = d;
      }
      if (minD > bestDist) {
        bestDist = minD;
        bestPt = s;
      }
    }
    seeds.push(bestPt);
  }
  return seeds;
}

function pointToSegmentDistSq(p: Point, a: Point, b: Point): number {
  const vx = b[0] - a[0];
  const vy = b[1] - a[1];
  const wx = p[0] - a[0];
  const wy = p[1] - a[1];
  const lenSq = vx * vx + vy * vy;
  if (lenSq < 1e-8) return wx * wx + wy * wy;
  const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / lenSq));
  const px = a[0] + t * vx - p[0];
  const py = a[1] + t * vy - p[1];
  return px * px + py * py;
}

function ringsTouch(ringsA: Point[][], ringsB: Point[][], thresholdSq: number): boolean {
  for (const rA of ringsA) {
    for (const rB of ringsB) {
      for (let i = 0; i < rA.length; i++) {
        const p = rA[i];
        for (let j = 0; j < rB.length; j++) {
          const b1 = rB[j];
          const b2 = rB[(j + 1) % rB.length];
          if (pointToSegmentDistSq(p, b1, b2) <= thresholdSq) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export interface WorldMapData {
  provinces: ProvinceGeometry[];
  provinceById: Record<string, ProvinceGeometry>;
  neighbors: Record<string, string[]>;
  seaNeighbors: Record<string, string[]>;
  countryMetas: Record<string, CountryMeta>;
  antarcticaRings: Point[][];
}

let cachedWorldMap: WorldMapData | null = null;
let cachedProjection: ReturnType<typeof geoNaturalEarth1> | null = null;

export function projectLonLat(lon: number, lat: number): [number, number] | null {
  if (!cachedWorldMap) buildWorldMapData();
  if (!cachedProjection) return null;
  const pt = cachedProjection([lon, lat]);
  return pt ? [pt[0], pt[1]] : null;
}

export function buildWorldMapData(): WorldMapData {
  if (cachedWorldMap) return cachedWorldMap;

  const topo = worldAtlas as unknown as Parameters<typeof topojson.feature>[0];
  const countriesObj = (
    worldAtlas as unknown as { objects: { countries: Parameters<typeof topojson.feature>[1] } }
  ).objects.countries;
  const geo = topojson.feature(topo, countriesObj) as unknown as GeoJSON.FeatureCollection;

  const playableFeatures = geo.features.filter((f) => String(f.id ?? f.properties?.name) !== '010');
  const playableCollection: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: playableFeatures,
  };

  const projection = geoNaturalEarth1().fitExtent(
    [
      [40, 36],
      [WORLD_WIDTH - 40, WORLD_HEIGHT - 36],
    ],
    playableCollection,
  );
  cachedProjection = projection;

  const extractRings = (featureOrGeom: GeoJSON.Feature | GeoJSON.Geometry | null): Point[][] => {
    if (!featureOrGeom) return [];
    const rings: Point[][] = [];
    let current: Point[] = [];
    const ctx = {
      beginPath() {},
      moveTo(x: number, y: number) {
        if (current.length >= 3) rings.push(current);
        current = [[x, y]];
      },
      lineTo(x: number, y: number) {
        current.push([x, y]);
      },
      closePath() {
        if (current.length >= 3) rings.push(current);
        current = [];
      },
      arc() {},
      rect() {},
    };
    geoPath(projection, ctx as unknown as CanvasRenderingContext2D)(
      featureOrGeom as GeoPermissibleObjects,
    );
    if (current.length >= 3) rings.push(current);
    return rings.filter((r) => polygonArea(r) > 0.05);
  };

  const antarcticaFeature = geo.features.find((f) => String(f.id ?? '') === '010');
  const antarcticaRings = antarcticaFeature ? extractRings(antarcticaFeature) : [];

  const provinces: ProvinceGeometry[] = [];
  const countryMetas: Record<string, CountryMeta> = {};

  for (const feature of playableFeatures) {
    const rawId = String(feature.id ?? feature.properties?.name ?? '');
    if (!rawId) continue;
    const rawName = String(feature.properties?.name ?? rawId);
    const meta = getCountryMeta(rawId, rawName);
    countryMetas[rawId] = meta;

    const validRings = extractRings(feature);
    if (validRings.length === 0) continue;

    const totalCountryArea = validRings.reduce((acc, r) => acc + polygonArea(r), 0);

    // Special exact geographic 16-voivodeship partitioning for Poland ('616')
    if (rawId === '616') {
      let mainRing = validRings[0];
      let maxA = 0;
      for (const r of validRings) {
        const a = polygonArea(r);
        if (a > maxA) {
          maxA = a;
          mainRing = r;
        }
      }
      const fallbackCenter = ringCentroid(mainRing);
      const heartProj = projection([19.15, 52.05]);
      const polCenter: Point =
        heartProj && pointInRing([heartProj[0], heartProj[1]], mainRing)
          ? [heartProj[0], heartProj[1]]
          : fallbackCenter;

      const polSeeds: Point[] = POLAND_VOIVODESHIPS.map((v, idx) => {
        const rawProj = projection([v.lon, v.lat]);
        let pt: Point = rawProj ? [rawProj[0], rawProj[1]] : [polCenter[0], polCenter[1]];
        if (!validRings.some((r) => pointInRing(pt, r))) {
          for (let step = 1; step <= 18; step++) {
            const t = step * 0.05;
            const cand: Point = [
              pt[0] + (polCenter[0] - pt[0]) * t,
              pt[1] + (polCenter[1] - pt[1]) * t,
            ];
            if (validRings.some((r) => pointInRing(cand, r))) {
              pt = cand;
              break;
            }
          }
        }
        // Subtle deterministic offset if too close to an earlier seed
        for (let k = 0; k < idx; k++) {
          const prev = POLAND_VOIVODESHIPS[k];
          const pRaw = projection([prev.lon, prev.lat]);
          if (pRaw && Math.hypot(pt[0] - pRaw[0], pt[1] - pRaw[1]) < 0.4) {
            pt = [pt[0] + 0.45, pt[1] - 0.35];
          }
        }
        return pt;
      });

      const polCells: Array<{ rings: Point[][]; area: number; centroid: Point; idx: number }> = [];
      for (let sIdx = 0; sIdx < polSeeds.length; sIdx++) {
        const seedA = polSeeds[sIdx];
        const clippedRings: Point[][] = [];
        for (const ring of validRings) {
          let current = ring;
          for (let j = 0; j < polSeeds.length; j++) {
            if (j === sIdx) continue;
            current = clipRingByBisector(current, seedA, polSeeds[j]);
            if (current.length < 3) break;
          }
          if (current.length >= 3 && polygonArea(current) > 0.02) {
            clippedRings.push(current);
          }
        }
        if (clippedRings.length > 0) {
          const area = clippedRings.reduce((acc, r) => acc + polygonArea(r), 0);
          let mainR = clippedRings[0];
          let maxRA = 0;
          for (const r of clippedRings) {
            const a = polygonArea(r);
            if (a > maxRA) {
              maxRA = a;
              mainR = r;
            }
          }
          polCells.push({
            rings: clippedRings,
            area,
            centroid: ringCentroid(mainR),
            idx: sIdx,
          });
        }
      }

      if (polCells.length === POLAND_VOIVODESHIPS.length) {
        const sumArea = polCells.reduce((acc, cr) => acc + cr.area, 0) || 1;
        // Preserve index order 0..15 so 616_p0 is ALWAYS Mazowieckie (Warszawa capital)
        for (const cr of polCells) {
          const spec = POLAND_VOIVODESHIPS[cr.idx];
          provinces.push({
            id: `616_p${cr.idx}`,
            countryOrigId: '616',
            name: spec.name,
            capitalCity: spec.capitalCity,
            rings: cr.rings,
            centroid: cr.centroid,
            areaShare: cr.area / sumArea,
            popShare: spec.popShare,
            explicitAreaKm2: spec.areaKm2,
            isCoastal: spec.name === 'Pomorskie' || spec.name === 'Zachodniopomorskie' || spec.name === 'Warmińsko-Mazurskie',
          });
        }
        continue;
      }
    }

    const desiredCount =
      meta.provinceNames?.length ?? (meta.areaKm2 > 600000 ? 3 : meta.areaKm2 > 220000 ? 2 : 1);

    if (desiredCount <= 1 || totalCountryArea < 120) {
      let biggestRing = validRings[0];
      let maxA = 0;
      for (const r of validRings) {
        const a = polygonArea(r);
        if (a > maxA) {
          maxA = a;
          biggestRing = r;
        }
      }
      provinces.push({
        id: `${rawId}_p0`,
        countryOrigId: rawId,
        name: meta.provinceNames?.[0] ?? meta.name.pl,
        rings: validRings,
        centroid: ringCentroid(biggestRing),
        areaShare: 1,
        isCoastal: true,
      });
    } else {
      const seeds = generateSeedsForRings(validRings, desiredCount);
      const cellResults: Array<{ rings: Point[][]; area: number; centroid: Point }> = [];

      for (let sIdx = 0; sIdx < seeds.length; sIdx++) {
        const seedA = seeds[sIdx];
        const clippedRings: Point[][] = [];
        for (const ring of validRings) {
          let current = ring;
          for (let j = 0; j < seeds.length; j++) {
            if (j === sIdx) continue;
            current = clipRingByBisector(current, seedA, seeds[j]);
            if (current.length < 3) break;
          }
          if (current.length >= 3 && polygonArea(current) > 1.5) {
            clippedRings.push(current);
          }
        }
        if (clippedRings.length > 0) {
          const area = clippedRings.reduce((acc, r) => acc + polygonArea(r), 0);
          let mainR = clippedRings[0];
          let maxRA = 0;
          for (const r of clippedRings) {
            const a = polygonArea(r);
            if (a > maxRA) {
              maxRA = a;
              mainR = r;
            }
          }
          cellResults.push({
            rings: clippedRings,
            area,
            centroid: ringCentroid(mainR),
          });
        }
      }

      if (cellResults.length === 0) {
        let biggestRing = validRings[0];
        let maxA = 0;
        for (const r of validRings) {
          const a = polygonArea(r);
          if (a > maxA) {
            maxA = a;
            biggestRing = r;
          }
        }
        provinces.push({
          id: `${rawId}_p0`,
          countryOrigId: rawId,
          name: meta.provinceNames?.[0] ?? meta.name.pl,
          rings: validRings,
          centroid: ringCentroid(biggestRing),
          areaShare: 1,
          isCoastal: true,
        });
      } else {
        cellResults.sort((a, b) => {
          if (rawId === '643') {
            const aWest = a.centroid[0] < 1420 && a.area > 800 ? 1 : 0;
            const bWest = b.centroid[0] < 1420 && b.area > 800 ? 1 : 0;
            if (aWest !== bWest) return bWest - aWest;
          }
          if (rawId === '208') {
            return b.centroid[0] - a.centroid[0]; // Zelandia (Kopenhaga) east, Jutlandia west
          }
          if (rawId === '752') {
            return b.centroid[1] - a.centroid[1]; // Götaland south, Norrland north
          }
          return b.area - a.area;
        });
        const sumArea = cellResults.reduce((acc, cr) => acc + cr.area, 0) || 1;
        cellResults.forEach((cr, idx) => {
          const pName = meta.provinceNames?.[idx] ?? `${meta.name.pl} ${idx + 1}`;
          provinces.push({
            id: `${rawId}_p${idx}`,
            countryOrigId: rawId,
            name: pName,
            rings: cr.rings,
            centroid: cr.centroid,
            areaShare: cr.area / sumArea,
            isCoastal: true,
          });
        });
      }
    }
  }

  const bboxes = provinces.map((p) => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const r of p.rings) {
      for (const [x, y] of r) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    return { minX, maxX, minY, maxY };
  });

  const neighbors: Record<string, string[]> = {};
  const seaNeighbors: Record<string, string[]> = {};
  for (const p of provinces) {
    neighbors[p.id] = [];
    seaNeighbors[p.id] = [];
  }

  const TOUCH_TOLERANCE = 8;
  const TOUCH_TOLERANCE_SQ = TOUCH_TOLERANCE * TOUCH_TOLERANCE;

  for (let i = 0; i < provinces.length; i++) {
    const a = provinces[i];
    const ba = bboxes[i];
    for (let j = i + 1; j < provinces.length; j++) {
      const b = provinces[j];
      const bb = bboxes[j];
      if (
        ba.maxX + TOUCH_TOLERANCE < bb.minX ||
        bb.maxX + TOUCH_TOLERANCE < ba.minX ||
        ba.maxY + TOUCH_TOLERANCE < bb.minY ||
        bb.maxY + TOUCH_TOLERANCE < ba.minY
      ) {
        continue;
      }
      if (ringsTouch(a.rings, b.rings, TOUCH_TOLERANCE_SQ)) {
        neighbors[a.id].push(b.id);
        neighbors[b.id].push(a.id);
      }
    }
  }

  const provsByCountry: Record<string, ProvinceGeometry[]> = {};
  for (const p of provinces) {
    if (!provsByCountry[p.countryOrigId]) provsByCountry[p.countryOrigId] = [];
    provsByCountry[p.countryOrigId].push(p);
  }

  for (const [cA, cB] of SEA_LANE_PAIRS) {
    const listA = provsByCountry[cA];
    const listB = provsByCountry[cB];
    if (!listA?.length || !listB?.length) continue;

    let bestA = listA[0];
    let bestB = listB[0];
    let minD = Infinity;
    for (const pa of listA) {
      for (const pb of listB) {
        const dx = pa.centroid[0] - pb.centroid[0];
        const dy = pa.centroid[1] - pb.centroid[1];
        const d = dx * dx + dy * dy;
        if (d < minD) {
          minD = d;
          bestA = pa;
          bestB = pb;
        }
      }
    }
    if (!seaNeighbors[bestA.id].includes(bestB.id) && !neighbors[bestA.id].includes(bestB.id)) {
      seaNeighbors[bestA.id].push(bestB.id);
      seaNeighbors[bestB.id].push(bestA.id);
    }
  }

  const provinceById: Record<string, ProvinceGeometry> = {};
  for (const p of provinces) provinceById[p.id] = p;

  cachedWorldMap = {
    provinces,
    provinceById,
    neighbors,
    seaNeighbors,
    countryMetas,
    antarcticaRings,
  };
  return cachedWorldMap;
}
