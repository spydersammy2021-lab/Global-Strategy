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
