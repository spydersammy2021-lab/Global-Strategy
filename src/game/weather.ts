import { WORLD_HEIGHT, WORLD_WIDTH } from './mapGen';
import type { ProvinceState, SeasonId, WaterAlert, WeatherKind } from './types';

export function getSeasonFromMonth(monthIndex: number): SeasonId {
  if (monthIndex >= 2 && monthIndex <= 4) return 'spring';
  if (monthIndex >= 5 && monthIndex <= 7) return 'summer';
  if (monthIndex >= 8 && monthIndex <= 10) return 'autumn';
  return 'winter';
}

function deterministicHash(seed: number): number {
  const x = Math.sin(seed * 19.37 + 41.13) * 43758.5453;
  return x - Math.floor(x);
}

// Compute realistic regional weather based on season, latitude (centroid Y), and simulation tick
export function computeProvinceWeather(
  centroid: [number, number],
  season: SeasonId,
  tickSeed: number,
  provSeedIndex: number,
): WeatherKind {
  const latNorm = centroid[1] / WORLD_HEIGHT;
  const isFarNorth = latNorm < 0.34;
  const isTemperateNorth = latNorm >= 0.34 && latNorm < 0.48;
  const isEquatorial = latNorm >= 0.48 && latNorm <= 0.65;
  const r = deterministicHash(tickSeed * 131 + provSeedIndex * 17);

  if (season === 'winter') {
    if (isFarNorth && r < 0.72) return 'snow';
    if (isTemperateNorth && r < 0.38) return 'snow';
    if (r < 0.68) return 'rain';
    if (r < 0.84) return 'fog';
    return 'sunny';
  }

  if (season === 'autumn') {
    if (isFarNorth && r < 0.25) return 'snow';
    if (r < 0.48) return 'rain';
    if (r < 0.72) return 'fog';
    return 'sunny';
  }

  if (season === 'spring') {
    if (isFarNorth && r < 0.15) return 'snow';
    if (r < 0.32) return 'rain';
    if (r < 0.45) return 'fog';
    return 'sunny';
  }

  if (isEquatorial && r < 0.36) return 'rain';
  if (r < 0.18) return 'rain';
  if (r < 0.26) return 'fog';
  return 'sunny';
}

/**
 * VERSION 3.0 Live Regional Temperature Engine (°C)
 * Calculates province temperature from equirectangular latitude, continental interior offset,
 * season (hemisphere-aware!), Global Warming Index, Nuclear Winter cooling, and weather.
 */
export function computeProvinceTemperatureC(params: {
  centroid: [number, number];
  season: SeasonId;
  weather: WeatherKind;
  globalWarmingIndex?: number;
  nuclearWinterLevel?: number;
  provSeedIndex?: number;
  totalDays?: number;
}): number {
  const {
    centroid,
    season,
    weather,
    globalWarmingIndex = 28,
    nuclearWinterLevel = 0,
    provSeedIndex = 0,
    totalDays = 0,
  } = params;

  const lonFrac = centroid[0] / WORLD_WIDTH;
  const latFrac = centroid[1] / WORLD_HEIGHT; // 0 = 90N, 0.5 = Equator, 1 = 90S
  const approxLatDeg = (0.5 - latFrac) * 180; // +90N .. -90S
  const absLat = Math.abs(approxLatDeg);

  // Mean annual baseline from equator (~29°C) toward poles (~ -24°C)
  let temp = 30 - (absLat / 90) * 56;

  // Northern/Southern Hemisphere seasonal swing (stronger inland & higher latitudes)
  const isNorth = approxLatDeg >= 0;
  const latSwingScale = Math.min(1.45, absLat / 42);
  let seasonDelta = 0;
  if (season === 'summer') seasonDelta = (isNorth ? 14 : -13) * latSwingScale;
  else if (season === 'winter') seasonDelta = (isNorth ? -18 : 13) * latSwingScale;
  else if (season === 'spring') seasonDelta = (isNorth ? 1 : -1) * latSwingScale;
  else seasonDelta = (isNorth ? 0 : 1) * latSwingScale;

  // Subtropical arid belt boost (Sahara / Arabia / Australian Outback)
  const isSaharaBelt = approxLatDeg >= 15 && approxLatDeg <= 32 && lonFrac >= 0.44 && lonFrac <= 0.67;
  if (isSaharaBelt) temp += 10;

  // Siberian / Arctic continental chill
  const isSiberia = approxLatDeg >= 53 && lonFrac >= 0.66;
  if (isSiberia && season === 'winter') temp -= 13;

  // Weather micro-shift
  if (weather === 'snow') temp -= 6;
  else if (weather === 'rain') temp -= 2;
  else if (weather === 'sunny') temp += 2.5;

  // Global Warming anomaly & Nuclear Winter drop
  const warmingDelta = ((globalWarmingIndex - 24) / 76) * 4.8;
  const winterDrop = -(nuclearWinterLevel / 100) * 16;

  // Subtle daily local variance (-1.5 .. +1.5)
  const dailyVar = (deterministicHash(totalDays * 13 + provSeedIndex * 29) - 0.5) * 3;

  const finalTemp = temp + seasonDelta + warmingDelta + winterDrop + dailyVar;
  return Math.max(-42, Math.min(48, Math.round(finalTemp)));
}

// Smooth thermal color ramp from Icy Arctic Blue (-32°C) to Desert Crimson (+44°C)
export function temperatureToHex(tempC: number): string {
  if (tempC <= -20) return '#1D4ED8'; // Deep Arctic Cobalt
  if (tempC <= -10) return '#0284C7'; // Glacial Blue
  if (tempC <= 0) return '#06B6D4'; // Frost Cyan
  if (tempC <= 10) return '#0D9488'; // Cool Teal
  if (tempC <= 20) return '#16A34A'; // Temperate Emerald
  if (tempC <= 28) return '#CA8A04'; // Warm Ochre
  if (tempC <= 36) return '#EA580C'; // Torrid Orange
  return '#DC2626'; // Extreme Desert Crimson
}

// Extreme Climate Attrition: < -15°C or > +38°C penalizes forces lacking Logistics Tech >= 1
export function getExtremeClimateAttrition(
  tempC: number,
  logisticsTech: number,
  isWorldConquest = false,
): { isExtreme: boolean; label: 'cold' | 'heat' | 'mild'; attritionRate: number; combatMult: number } {
  if (isWorldConquest || logisticsTech >= 1) {
    return {
      isExtreme: tempC < -15 || tempC > 38,
      label: tempC < -15 ? 'cold' : tempC > 38 ? 'heat' : 'mild',
      attritionRate: 0,
      combatMult: 1.0,
    };
  }
  if (tempC < -15) {
    return { isExtreme: true, label: 'cold', attritionRate: 0.06, combatMult: 0.88 };
  }
  if (tempC > 38) {
    return { isExtreme: true, label: 'heat', attritionRate: 0.055, combatMult: 0.89 };
  }
  return { isExtreme: false, label: 'mild', attritionRate: 0, combatMult: 1.0 };
}

// Generate dynamic Maritime Water Alerts (severe sea storms & coastal floods)
export function generateWaterAlerts(
  provinces: Record<string, ProvinceState>,
  season: SeasonId,
  totalDays: number,
): WaterAlert[] {
  const regions: Array<{
    key: WaterAlert['regionKey'];
    bounds: [number, number, number, number]; // xMinFrac, xMaxFrac, yMinFrac, yMaxFrac
    centroid: [number, number];
  }> = [
    {
      key: 'baltic',
      bounds: [0.51, 0.58, 0.24, 0.32],
      centroid: [WORLD_WIDTH * 0.545, WORLD_HEIGHT * 0.28],
    },
    {
      key: 'atlantic',
      bounds: [0.36, 0.49, 0.25, 0.42],
      centroid: [WORLD_WIDTH * 0.42, WORLD_HEIGHT * 0.33],
    },
    {
      key: 'mediterranean',
      bounds: [0.49, 0.59, 0.34, 0.42],
      centroid: [WORLD_WIDTH * 0.54, WORLD_HEIGHT * 0.38],
    },
    {
      key: 'pacific',
      bounds: [0.82, 0.94, 0.32, 0.54],
      centroid: [WORLD_WIDTH * 0.88, WORLD_HEIGHT * 0.43],
    },
  ];

  const seasonIndex = season === 'autumn' || season === 'winter' ? 0 : 1;
  const pick = regions[(Math.floor(totalDays / 18) + seasonIndex) % regions.length];
  const [x1, x2, y1, y2] = pick.bounds;

  const affected = Object.values(provinces)
    .filter((p) => {
      const fx = p.centroid[0] / WORLD_WIDTH;
      const fy = p.centroid[1] / WORLD_HEIGHT;
      return fx >= x1 && fx <= x2 && fy >= y1 && fy <= y2 && p.seaNeighbors.length > 0;
    })
    .map((p) => p.id);

  const severity: WaterAlert['severity'] =
    deterministicHash(totalDays * 17) > 0.45 ? 'storm' : 'coastal_flood';

  return [
    {
      id: `walert_${pick.key}_${totalDays}`,
      regionKey: pick.key,
      severity,
      affectedProvinceIds: affected,
      expiresDay: totalDays + 18,
      centroid: pick.centroid,
    },
  ];
}

export const WEATHER_EFFECTS: Record<
  WeatherKind,
  {
    defenseMult: number;
    armorAirAttackMult: number;
    farmIncomeMult: number;
    marchCostExtra: number;
  }
> = {
  sunny: { defenseMult: 1.0, armorAirAttackMult: 1.0, farmIncomeMult: 1.15, marchCostExtra: 0 },
  rain: { defenseMult: 1.05, armorAirAttackMult: 0.85, farmIncomeMult: 1.0, marchCostExtra: 0 },
  snow: { defenseMult: 1.25, armorAirAttackMult: 0.9, farmIncomeMult: 0.85, marchCostExtra: 1 },
  fog: { defenseMult: 1.1, armorAirAttackMult: 0.92, farmIncomeMult: 1.0, marchCostExtra: 0 },
};
