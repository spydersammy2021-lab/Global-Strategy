import React, { useEffect, useMemo, useRef } from 'react';
import { Crosshair, Maximize2, Minus, Plus } from 'lucide-react';
import { MAJOR_CITIES } from '../data/cities';
import { STRATEGIC_STRAITS } from '../data/spaceSectors';
import { getExactCountryArmy, getTotalUnits } from '../game/combat';
import { WORLD_HEIGHT, WORLD_WIDTH, buildWorldMapData, projectLonLat } from '../game/mapGen';
import { type FpsCap, getFpsCapIntervalMs } from '../game/performance';
import type {
  BattleEvent,
  EffectiveTier,
  FlagPattern,
  GameState,
  Language,
  MapOverlayMode,
  PerformanceMode,
  StraitBlockadeId,
} from '../game/types';
import { temperatureToHex } from '../game/weather';
import { drawCanvasFlag } from './FlagBadge';

interface Camera {
  x: number;
  y: number;
  zoom: number;
}

const PARTICLE_COUNT = 44;
const PARTICLE_SEED = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  xFrac: ((i * 73 + 17) % 100) / 100,
  yFrac: ((i * 41 + 29) % 100) / 100,
  speed: 0.7 + ((i * 19) % 10) * 0.08,
  size: 1.5 + (i % 3) * 0.65,
}));

function formatCounterTroops(troops: number): string {
  if (troops >= 1_000_000) return `${(troops / 1_000_000).toFixed(2)}M`;
  if (troops >= 1000) return `${(troops / 1000).toFixed(1)}k`;
  return `${Math.round(troops)}`;
}

// Draw authentic Age of History III rectangular [Flag | Troop Count] counter
function drawRectangularArmyCounter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  flag: FlagPattern,
  label: string,
  borderColor: string,
  textColor: string,
  fontSize: number,
  baseScale: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const padX = 2.6 / baseScale;
  const flagW = fontSize * 1.42;
  const flagH = fontSize * 0.96;
  ctx.font = `800 ${fontSize}px "JetBrains Mono", monospace`;
  const textW = ctx.measureText(label).width;
  const gap = 2.2 / baseScale;
  const boxW = padX + flagW + gap + textW + padX;
  const boxH = Math.max(flagH + 2.6 / baseScale, fontSize * 1.38);
  const bx1 = cx - boxW * 0.5;
  const by1 = cy;

  ctx.fillStyle = 'rgba(2, 6, 16, 0.76)';
  ctx.fillRect(bx1 + 0.9 / baseScale, by1 + 0.9 / baseScale, boxW, boxH);

  ctx.fillStyle = 'rgba(6, 11, 24, 0.95)';
  ctx.fillRect(bx1, by1, boxW, boxH);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.fillRect(bx1, by1, boxW, boxH * 0.42);

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 0.85 / baseScale;
  ctx.strokeRect(bx1, by1, boxW, boxH);

  const fx = bx1 + padX;
  const fy = by1 + (boxH - flagH) * 0.5;
  drawCanvasFlag(ctx, flag, fx, fy, flagW, flagH);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.32)';
  ctx.lineWidth = 0.55 / baseScale;
  ctx.beginPath();
  ctx.moveTo(fx + flagW + gap * 0.5, by1 + 1.2 / baseScale);
  ctx.lineTo(fx + flagW + gap * 0.5, by1 + boxH - 1.2 / baseScale);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textColor;
  ctx.fillText(label, fx + flagW + gap, by1 + boxH * 0.53);

  return { x1: bx1, y1: by1, x2: bx1 + boxW, y2: by1 + boxH };
}

// Draw two armored gauntleted warrior hands clashing steel blades + twin morale bars
function drawArmoredBattleClash(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  battle: BattleEvent,
  now: number,
  baseScale: number,
) {
  const phase = (now % 900) / 900;
  const strike = Math.abs(Math.sin(phase * Math.PI * 3));
  const swingAngle = (1 - strike) * 0.52;
  const s = 18 / baseScale;

  ctx.save();
  ctx.translate(bx, by);

  const glow = ctx.createRadialGradient(0, 0, s * 0.15, 0, 0, s * 1.65);
  glow.addColorStop(0, 'rgba(245, 158, 11, 0.42)');
  glow.addColorStop(0.5, 'rgba(239, 68, 68, 0.25)');
  glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, s * 1.65, 0, Math.PI * 2);
  ctx.fill();

  const totalPow = Math.max(1, battle.attackerPower + battle.defenderPower);
  const attFrac = Math.max(0.14, Math.min(0.86, battle.attackerPower / totalPow));
  const barW = s * 2.55;
  const barH = s * 0.3;
  const barX = -barW * 0.5;
  const barY = -s * 1.38;

  ctx.fillStyle = 'rgba(5, 9, 20, 0.94)';
  ctx.fillRect(barX - 1.5 / baseScale, barY - 1.5 / baseScale, barW + 3 / baseScale, barH + 3 / baseScale);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 0.7 / baseScale;
  ctx.strokeRect(barX - 1.5 / baseScale, barY - 1.5 / baseScale, barW + 3 / baseScale, barH + 3 / baseScale);

  ctx.fillStyle = '#10B981';
  ctx.fillRect(barX, barY, barW * attFrac, barH);
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(barX + barW * attFrac, barY, barW * (1 - attFrac), barH);
  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(barX + barW * attFrac - 0.8 / baseScale, barY - 0.8 / baseScale, 1.6 / baseScale, barH + 1.6 / baseScale);

  // Left Armored Gauntlet + Steel Sword
  ctx.save();
  ctx.translate(-s * 0.58, s * 0.24);
  ctx.rotate(-0.56 + swingAngle);
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 0.8 / baseScale;
  ctx.fillRect(-s * 0.72, -s * 0.16, s * 0.45, s * 0.32);
  ctx.strokeRect(-s * 0.72, -s * 0.16, s * 0.45, s * 0.32);
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(-s * 0.28, -s * 0.18, s * 0.28, s * 0.36);
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(0, -s * 0.26, s * 0.11, s * 0.52);
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.moveTo(s * 0.11, -s * 0.085);
  ctx.lineTo(s * 1.12, -s * 0.04);
  ctx.lineTo(s * 1.24, 0);
  ctx.lineTo(s * 1.12, s * 0.04);
  ctx.lineTo(s * 0.11, s * 0.085);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Right Armored Gauntlet + Steel Sword
  ctx.save();
  ctx.translate(s * 0.58, s * 0.24);
  ctx.rotate(0.56 - swingAngle);
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 0.8 / baseScale;
  ctx.fillRect(s * 0.27, -s * 0.16, s * 0.45, s * 0.32);
  ctx.strokeRect(s * 0.27, -s * 0.16, s * 0.45, s * 0.32);
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(0, -s * 0.18, s * 0.28, s * 0.36);
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(-s * 0.11, -s * 0.26, s * 0.11, s * 0.52);
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.moveTo(-s * 0.11, -s * 0.085);
  ctx.lineTo(-s * 1.12, -s * 0.04);
  ctx.lineTo(-s * 1.24, 0);
  ctx.lineTo(-s * 1.12, s * 0.04);
  ctx.lineTo(-s * 0.11, s * 0.085);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  if (strike > 0.68) {
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 1.3 / baseScale;
    for (let sp = 0; sp < 7; sp++) {
      const ang = (sp / 7) * Math.PI * 2 + phase * 5;
      const r1 = s * 0.18;
      const r2 = s * (0.45 + (strike - 0.68) * 2.1);
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * r1, -s * 0.25 + Math.sin(ang) * r1);
      ctx.lineTo(Math.cos(ang) * r2, -s * 0.25 + Math.sin(ang) * r2);
      ctx.stroke();
    }
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, -s * 0.25, s * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function WorldMapCanvas({
  state,
  lang,
  selectedProvinceId,
  marchSourceProvinceId,
  mapOverlayMode = 'political',
  onSelectProvince,
  onSelectCity,
  onToggleStraitBlockade,
  activeBattles,
  perfMode,
  effectiveTier,
  onLowFpsDetected,
  focusTarget,
  fpsDomRef,
  fpsCap = 'unlimited',
  modalOpen = false,
}: {
  state: GameState;
  lang: Language;
  selectedProvinceId: string | null;
  marchSourceProvinceId: string | null;
  mapOverlayMode?: MapOverlayMode;
  onSelectProvince: (provinceId: string) => void;
  onSelectCity?: (cityId: string) => void;
  onToggleStraitBlockade?: (straitId: StraitBlockadeId) => void;
  activeBattles: BattleEvent[];
  perfMode: PerformanceMode;
  effectiveTier: EffectiveTier;
  onLowFpsDetected?: () => void;
  focusTarget?: [number, number] | null;
  fpsDomRef?: React.RefObject<HTMLSpanElement | null>;
  fpsCap?: FpsCap;
  modalOpen?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const localFpsRef = useRef<HTMLSpanElement>(null);

  const mapData = useMemo(() => buildWorldMapData(), []);
  const projectedCities = useMemo(
    () =>
      MAJOR_CITIES.map((c) => {
        const pt = projectLonLat(c.lng, c.lat);
        return pt ? { city: c, wx: pt[0], wy: pt[1] } : null;
      }).filter((item): item is { city: (typeof MAJOR_CITIES)[number]; wx: number; wy: number } => item !== null),
    [],
  );
  const projectedStraits = useMemo(
    () =>
      STRATEGIC_STRAITS.map((s) => {
        const pt = projectLonLat(s.lon, s.lat);
        return pt ? { strait: s, wx: pt[0], wy: pt[1] } : null;
      }).filter(
        (item): item is { strait: (typeof STRATEGIC_STRAITS)[number]; wx: number; wy: number } =>
          item !== null,
      ),
    [],
  );

  const cityHitBoxesRef = useRef<Array<{ id: string; wx: number; wy: number; radius: number }>>([]);
  const straitHitBoxesRef = useRef<Array<{ id: StraitBlockadeId; wx: number; wy: number; radius: number }>>([]);
  const hoveredCityIdRef = useRef<string | null>(null);

  const terrainPattern = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 96;
    pCanvas.height = 96;
    const pCtx = pCanvas.getContext('2d');
    if (!pCtx) return null;

    pCtx.clearRect(0, 0, 96, 96);
    for (let y = 0; y < 96; y += 3) {
      for (let x = 0; x < 96; x += 3) {
        const hash = ((x * 37 + y * 91) % 29) / 29;
        if (hash > 0.55) {
          pCtx.fillStyle = hash > 0.8 ? 'rgba(255,255,255,0.045)' : 'rgba(2,6,23,0.08)';
          pCtx.fillRect(x, y, 2, 2);
        }
      }
    }
    return pCanvas;
  }, []);

  const cachedPaths = useMemo(() => {
    const provPaths = new Map<string, Path2D>();
    const provBBoxes = new Map<string, { minX: number; maxX: number; minY: number; maxY: number }>();

    if (typeof Path2D === 'undefined') {
      return { provPaths, provBBoxes, antarcticaPath: null as Path2D | null };
    }

    for (const geom of mapData.provinces) {
      const p = new Path2D();
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      for (const ring of geom.rings) {
        if (ring.length < 3) continue;
        p.moveTo(ring[0][0], ring[0][1]);
        for (let i = 0; i < ring.length; i++) {
          const [rx, ry] = ring[i];
          if (i > 0) p.lineTo(rx, ry);
          if (rx < minX) minX = rx;
          if (rx > maxX) maxX = rx;
          if (ry < minY) minY = ry;
          if (ry > maxY) maxY = ry;
        }
        p.closePath();
      }
      provPaths.set(geom.id, p);
      provBBoxes.set(geom.id, { minX, maxX, minY, maxY });
    }

    const antPath = new Path2D();
    for (const ring of mapData.antarcticaRings) {
      if (ring.length < 3) continue;
      antPath.moveTo(ring[0][0], ring[0][1]);
      for (let i = 1; i < ring.length; i++) antPath.lineTo(ring[i][0], ring[i][1]);
      antPath.closePath();
    }

    return { provPaths, provBBoxes, antarcticaPath: antPath };
  }, [mapData]);

  const initialCam = useMemo<Camera>(() => {
    if (state.gameMode === 'bot_spectator') {
      const warsaw = state.provinces['616_p0'];
      if (warsaw) return { x: warsaw.centroid[0], y: warsaw.centroid[1], zoom: 2.35 };
      return { x: WORLD_WIDTH * 0.52, y: WORLD_HEIGHT * 0.34, zoom: 2.2 };
    }
    const cap = Object.values(state.provinces).find(
      (p) => p.ownerId === state.playerCountryId && p.isCapital,
    );
    const anyOwned = Object.values(state.provinces).find((p) => p.ownerId === state.playerCountryId);
    const target = cap ?? anyOwned;
    if (target) {
      return { x: target.centroid[0], y: target.centroid[1], zoom: 5.0 };
    }
    return { x: WORLD_WIDTH * 0.5, y: WORLD_HEIGHT * 0.45, zoom: 1.0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.scenarioId, state.playerCountryId, state.gameMode]);

  const camRef = useRef<Camera>(initialCam);
  const hoveredIdRef = useRef<string | null>(null);
  const dragRef = useRef<{
    active: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    camX: number;
    camY: number;
  }>({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    camX: 0,
    camY: 0,
  });
  const dirtyRef = useRef<boolean>(true);
  const stateRef = useRef(state);
  const selectedRef = useRef(selectedProvinceId);
  const marchSrcRef = useRef(marchSourceProvinceId);
  const overlayRef = useRef<MapOverlayMode>(mapOverlayMode);
  const battlesRef = useRef(activeBattles);
  const langRef = useRef(lang);
  const effectiveTierRef = useRef(effectiveTier);
  const fpsCapRef = useRef(fpsCap);
  const modalOpenRef = useRef(modalOpen);

  stateRef.current = state;
  selectedRef.current = selectedProvinceId;
  marchSrcRef.current = marchSourceProvinceId;
  overlayRef.current = mapOverlayMode;
  battlesRef.current = activeBattles;
  langRef.current = lang;
  effectiveTierRef.current = effectiveTier;
  fpsCapRef.current = fpsCap;
  modalOpenRef.current = modalOpen;
  dirtyRef.current = true;

  useEffect(() => {
    if (focusTarget) {
      camRef.current = {
        x: focusTarget[0],
        y: focusTarget[1],
        zoom: Math.max(camRef.current.zoom, 3.6),
      };
      dirtyRef.current = true;
    }
  }, [focusTarget]);

  useEffect(() => {
    camRef.current = initialCam;
    dirtyRef.current = true;
  }, [initialCam]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const patternObj = terrainPattern ? ctx.createPattern(terrainPattern, 'repeat') : null;

    let animId = 0;
    let width = container.clientWidth || 1280;
    let height = container.clientHeight || 720;

    const updateCanvasSize = () => {
      const tierNow = effectiveTierRef.current;
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        tierNow === 'light' ? 1 : tierNow === 'medium' ? 1.5 : 2,
      );
      width = container.clientWidth || 1280;
      height = container.clientHeight || 720;
      const nextW = Math.floor(width * dpr);
      const nextH = Math.floor(height * dpr);
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
      }
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      dirtyRef.current = true;
    };

    updateCanvasSize();
    const ro = new ResizeObserver(updateCanvasSize);
    ro.observe(container);

    let frameCount = 0;
    let lastFpsTick = performance.now();
    let lastAnimDraw = 0;
    let lastDrawDuration = 0;
    let lowFpsStrike = 0;

    const renderFrame = (now: number) => {
      animId = requestAnimationFrame(renderFrame);

      frameCount += 1;
      const elapsed = now - lastFpsTick;
      if (elapsed >= 500) {
        const currentFps = Math.max(1, Math.round((frameCount * 1000) / elapsed));
        const fpsLabel = `${currentFps} FPS`;
        if (fpsDomRef?.current && frameCount >= 2) {
          fpsDomRef.current.textContent = fpsLabel;
        }
        if (localFpsRef.current && frameCount >= 2) {
          localFpsRef.current.textContent = fpsLabel;
        }
        if (currentFps < 28 && perfMode === 'auto') {
          lowFpsStrike += 1;
          if (lowFpsStrike >= 3) {
            lowFpsStrike = 0;
            onLowFpsDetected?.();
          }
        } else {
          lowFpsStrike = 0;
        }
        frameCount = 0;
        lastFpsTick = now;
      }

      if (modalOpenRef.current && !dirtyRef.current) {
        return;
      }

      const st = stateRef.current;
      const activeTier = effectiveTierRef.current;
      const overlay = overlayRef.current;
      const nowMs = Date.now();
      const activeMissiles = st.recentMissiles.filter((m) => nowMs - m.createdAt < 4500);
      const activePulses = (st.mapPulses ?? []).filter((p) => nowMs - p.createdAt < 4600);
      const activeAirlifts = (st.airliftVisuals ?? []).filter((a) => nowMs - a.createdAt < 4800);
      const activeSats = (st.activeSatellites ?? []).filter((s) => s.expiresDay >= st.totalDays);

      const hasContinuousEffects =
        battlesRef.current.length > 0 ||
        st.orders.length > 0 ||
        activeMissiles.length > 0 ||
        activePulses.length > 0 ||
        activeAirlifts.length > 0 ||
        activeSats.length > 0 ||
        overlay === 'logistics' ||
        !st.simPaused;
      const hasActiveWars =
        activeTier !== 'light' &&
        Object.values(st.countries).some((c) => !c.eliminated && c.atWarWith.length > 0);
      const hasWaterAlerts = st.waterAlerts.length > 0;
      const capMs = getFpsCapIntervalMs(fpsCapRef.current);
      // On GPU/fast hardware drawMs <= 6ms -> effectiveCap = capMs (0 = uncapped native Hz).
      // On software CPU rasterizers where a single draw takes > 6ms, yield briefly so UI & compositor stay responsive.
      const cpuYieldMs =
        capMs === 0 && lastDrawDuration > 6
          ? Math.min(100, Math.max(80, lastDrawDuration * 3))
          : capMs;

      if (!dirtyRef.current) {
        if (hasContinuousEffects) {
          if (cpuYieldMs > 0 && now - lastAnimDraw < cpuYieldMs - 0.5) return;
        } else if (hasActiveWars || hasWaterAlerts) {
          const ambientStep = cpuYieldMs > 0 ? Math.max(120, cpuYieldMs) : 120;
          if (now - lastAnimDraw < ambientStep) return;
        } else {
          return;
        }
      }
      lastAnimDraw = now;
      dirtyRef.current = false;
      const frameStartPerf = performance.now();

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        activeTier === 'light' ? 1 : activeTier === 'medium' ? 1.5 : 2,
      );
      const cam = camRef.current;
      const baseScale = Math.min(width / WORLD_WIDTH, height / WORLD_HEIGHT) * cam.zoom;
      const isSpectator = st.gameMode === 'bot_spectator';

      // Zero-lag Viewport Culling Bounds in world space
      const halfW = (width * 0.5) / baseScale;
      const halfH = (height * 0.5) / baseScale;
      const cullMargin = 48 / baseScale;
      const viewMinX = cam.x - halfW - cullMargin;
      const viewMaxX = cam.x + halfW + cullMargin;
      const viewMinY = cam.y - halfH - cullMargin;
      const viewMaxY = cam.y + halfH + cullMargin;
      const inView = (x: number, y: number) =>
        x >= viewMinX && x <= viewMaxX && y >= viewMinY && y <= viewMaxY;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 1. Bathymetric Imperial Deep Ocean (#03060E -> #0B1933)
      const oceanGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        40,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.78,
      );
      oceanGrad.addColorStop(0, overlay === 'thermal' ? '#091426' : '#0B1932');
      oceanGrad.addColorStop(0.7, '#050C1B');
      oceanGrad.addColorStop(1, '#03060E');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.translate(width * 0.5, height * 0.5);
      ctx.scale(baseScale, baseScale);
      ctx.translate(-cam.x, -cam.y);

      // Subtle Bronze Meridian Graticule Grid (Viewport-clamped)
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.055)';
      ctx.lineWidth = 0.9 / baseScale;
      ctx.beginPath();
      const gxStart = Math.max(0, Math.floor(viewMinX / 200) * 200);
      const gxEnd = Math.min(WORLD_WIDTH, Math.ceil(viewMaxX / 200) * 200);
      const gyStart = Math.max(0, Math.floor(viewMinY / 200) * 200);
      const gyEnd = Math.min(WORLD_HEIGHT, Math.ceil(viewMaxY / 200) * 200);
      for (let gx = gxStart; gx <= gxEnd; gx += 200) {
        ctx.moveTo(gx, gyStart);
        ctx.lineTo(gx, gyEnd);
      }
      for (let gy = gyStart; gy <= gyEnd; gy += 200) {
        ctx.moveTo(gxStart, gy);
        ctx.lineTo(gxEnd, gy);
      }
      ctx.stroke();

      if (cachedPaths.antarcticaPath && viewMaxY > WORLD_HEIGHT * 0.78) {
        ctx.fillStyle = overlay === 'thermal' ? '#1E3A8A' : '#131F36';
        ctx.fill(cachedPaths.antarcticaPath);
      }

      const selId = selectedRef.current;
      const hoverId = hoveredIdRef.current;
      const marchSrc = marchSrcRef.current ? st.provinces[marchSrcRef.current] : null;
      const selProv = selId ? st.provinces[selId] : null;
      const highlightSrc =
        marchSrc ??
        (st.gameMode === 'player' && selProv && selProv.ownerId === st.playerCountryId
          ? selProv
          : null);
      const reachableSet = new Set<string>(
        highlightSrc ? [...highlightSrc.neighbors, ...highlightSrc.seaNeighbors] : [],
      );
      const battleProvSet = new Set<string>(battlesRef.current.map((b) => b.provinceId));

      // 2. Luminous Sea Lanes / Naval Corridors (Viewport culled)
      if (highlightSrc || cam.zoom >= 1.4 || overlay === 'logistics') {
        ctx.save();
        ctx.setLineDash([6 / baseScale, 6 / baseScale]);
        ctx.strokeStyle = marchSrc
          ? 'rgba(125, 211, 252, 0.85)'
          : overlay === 'logistics'
          ? 'rgba(56, 189, 248, 0.45)'
          : 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = (marchSrc ? 1.85 : overlay === 'logistics' ? 1.3 : 0.95) / baseScale;
        ctx.beginPath();
        for (const p of Object.values(st.provinces)) {
          if (!inView(p.centroid[0], p.centroid[1])) continue;
          for (const sId of p.seaNeighbors) {
            if (p.id < sId) {
              const target = st.provinces[sId];
              if (target && Math.abs(p.centroid[0] - target.centroid[0]) < 950) {
                ctx.moveTo(p.centroid[0], p.centroid[1]);
                ctx.lineTo(target.centroid[0], target.centroid[1]);
              }
            }
          }
        }
        ctx.stroke();
        ctx.restore();
      }

      // 3. Viewport-Culled Provinces (Political / Thermal °C / Logistics & Rail)
      const frontPulse = 0.55 + 0.45 * Math.sin(now * 0.005);
      const provList = mapData.provinces;
      const visibleProvs: Array<(typeof st.provinces)[string]> = [];

      for (let i = 0; i < provList.length; i++) {
        const geom = provList[i];
        const bb = cachedPaths.provBBoxes.get(geom.id);
        if (
          bb &&
          (bb.maxX < viewMinX || bb.minX > viewMaxX || bb.maxY < viewMinY || bb.minY > viewMaxY)
        ) {
          continue; // Viewport culling: skip off-screen provinces!
        }

        const path = cachedPaths.provPaths.get(geom.id);
        const provState = st.provinces[geom.id];
        if (!path || !provState) continue;
        visibleProvs.push(provState);

        const owner = st.countries[provState.ownerId];
        const tempC = provState.temperatureC ?? 14;
        const hasRail = provState.buildings.includes('railway');
        const hasPort = provState.buildings.includes('port');

        if (overlay === 'thermal') {
          ctx.fillStyle = temperatureToHex(tempC);
          ctx.globalAlpha = 0.88;
        } else if (overlay === 'logistics') {
          ctx.fillStyle = hasRail
            ? '#B45309'
            : hasPort
            ? '#0369A1'
            : provState.ownerId === st.playerCountryId
            ? '#1E293B'
            : '#0F172A';
          ctx.globalAlpha = 0.9;
        } else {
          ctx.fillStyle = owner?.color ?? '#64748B';
          ctx.globalAlpha = 0.87;
        }
        ctx.fill(path);
        ctx.globalAlpha = 1;

        if (overlay === 'political') {
          if (i % 2 === 1) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.fill(path);
          }
          if (patternObj && activeTier !== 'light' && cam.zoom >= 1.8) {
            ctx.fillStyle = patternObj;
            ctx.fill(path);
          }
        }

        // Nuclear devastation crater scorched tint
        if ((provState.nuclearDevastation ?? 0) > 0) {
          ctx.fillStyle = 'rgba(249, 115, 22, 0.24)';
          ctx.fill(path);
        }

        if (activeTier === 'ultra' && overlay !== 'thermal') {
          if (provState.weather === 'snow') {
            ctx.fillStyle = 'rgba(224, 242, 254, 0.19)';
            ctx.fill(path);
          } else if (provState.weather === 'rain') {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
            ctx.fill(path);
          } else if (provState.weather === 'fog') {
            ctx.fillStyle = 'rgba(203, 213, 225, 0.11)';
            ctx.fill(path);
          }
        }

        const isReachable = reachableSet.has(geom.id);
        const isReachableHostile = isReachable && provState.ownerId !== st.playerCountryId;
        if (isReachable) {
          ctx.fillStyle = isReachableHostile
            ? marchSrc
              ? 'rgba(239, 68, 68, 0.4)'
              : 'rgba(239, 68, 68, 0.26)'
            : marchSrc
            ? 'rgba(16, 185, 129, 0.38)'
            : 'rgba(16, 185, 129, 0.24)';
          ctx.fill(path);
        }
        if (geom.id === hoverId && geom.id !== selId) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
          ctx.fill(path);
        }
        if (geom.id === selId) {
          ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
          ctx.fill(path);
        }

        let hostileNeighborCount = 0;
        if (owner && owner.atWarWith.length > 0) {
          for (const nId of provState.neighbors) {
            const np = st.provinces[nId];
            if (np && owner.atWarWith.includes(np.ownerId)) {
              hostileNeighborCount += 1;
            }
          }
        }
        const isEncircled = hostileNeighborCount >= 2 || battleProvSet.has(geom.id);
        const isWarFront = activeTier === 'ultra' && hostileNeighborCount > 0;

        if (isEncircled) {
          ctx.save();
          ctx.setLineDash([4.5 / baseScale, 3 / baseScale]);
          ctx.lineDashOffset = -(now * 0.014) / baseScale;
          ctx.strokeStyle = `rgba(244, 63, 94, ${0.65 + 0.35 * frontPulse})`;
          ctx.lineWidth = 2.4 / baseScale;
          ctx.stroke(path);
          ctx.restore();
        } else if (isReachable) {
          ctx.strokeStyle = isReachableHostile
            ? 'rgba(248, 113, 113, 0.92)'
            : 'rgba(52, 211, 153, 0.92)';
          ctx.lineWidth = (marchSrc ? 2.1 : 1.55) / baseScale;
          ctx.stroke(path);
        } else if (isWarFront) {
          ctx.strokeStyle = `rgba(244, 63, 94, ${0.48 + 0.42 * frontPulse})`;
          ctx.lineWidth = 2.0 / baseScale;
          ctx.stroke(path);
        } else {
          ctx.strokeStyle = overlay === 'thermal' ? 'rgba(5, 9, 20, 0.72)' : '#050914';
          ctx.lineWidth = Math.max(0.55, 1.25 / Math.sqrt(cam.zoom));
          ctx.stroke(path);
        }
      }

      if (selId) {
        const selPath = cachedPaths.provPaths.get(selId);
        if (selPath) {
          ctx.strokeStyle = '#FACC15';
          ctx.lineWidth = 2.6 / baseScale;
          ctx.stroke(selPath);
        }
      }

      // 3b. Strategic Railways Track Network (always shown in Logistics view or when zoomed >= 2.2)
      if (overlay === 'logistics' || cam.zoom >= 2.2) {
        ctx.save();
        for (const prov of visibleProvs) {
          if (!prov.buildings.includes('railway')) continue;
          for (const nId of prov.neighbors) {
            if (prov.id >= nId) continue;
            const np = st.provinces[nId];
            if (!np || !np.buildings.includes('railway')) continue;
            const [x1, y1] = prov.centroid;
            const [x2, y2] = np.centroid;
            ctx.strokeStyle = '#050914';
            ctx.lineWidth = 3.6 / baseScale;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            ctx.strokeStyle = '#FACC15';
            ctx.lineWidth = 1.6 / baseScale;
            ctx.setLineDash([4 / baseScale, 3.5 / baseScale]);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        ctx.restore();
      }

      // 3c. Animated Maritime Cargo Convoys (Logistics View or Sea Lanes zoomed >= 1.5)
      if (overlay === 'logistics' || (activeTier !== 'light' && cam.zoom >= 1.5)) {
        const convoyPulse = (now * 0.00028) % 1;
        let convoyDrawn = 0;
        for (const p of visibleProvs) {
          if (!p.buildings.includes('port') && overlay !== 'logistics') continue;
          if (convoyDrawn >= 14) break;
          for (const sId of p.seaNeighbors) {
            if (p.id >= sId) continue;
            const target = st.provinces[sId];
            if (!target || Math.abs(p.centroid[0] - target.centroid[0]) >= 900) continue;
            convoyDrawn += 1;
            const phase = (convoyPulse + convoyDrawn * 0.19) % 1;
            const sx = p.centroid[0] + (target.centroid[0] - p.centroid[0]) * phase;
            const sy = p.centroid[1] + (target.centroid[1] - p.centroid[1]) * phase;
            if (!inView(sx, sy)) continue;
            const sz = 4.2 / baseScale;
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(Math.atan2(target.centroid[1] - p.centroid[1], target.centroid[0] - p.centroid[0]));
            ctx.fillStyle = '#38BDF8';
            ctx.strokeStyle = '#050914';
            ctx.lineWidth = 0.8 / baseScale;
            ctx.beginPath();
            ctx.moveTo(sz, 0);
            ctx.lineTo(-sz * 0.7, -sz * 0.45);
            ctx.lineTo(-sz * 0.7, sz * 0.45);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            break;
          }
        }
      }

      // 3d. Strategic Maritime Strait Blockade Nodes (clickable when in Logistics overlay)
      straitHitBoxesRef.current = [];
      const blockadedEntries = Object.keys(st.blockadedStraits ?? {});
      if (overlay === 'logistics' || blockadedEntries.length > 0) {
        for (const item of projectedStraits) {
          const blockerId = st.blockadedStraits?.[item.strait.id];
          const isBlockaded = Boolean(blockerId);
          if (overlay !== 'logistics' && !isBlockaded) continue;
          if (!inView(item.wx, item.wy)) continue;

          const r = Math.max(3.5, 9 / baseScale);
          straitHitBoxesRef.current.push({
            id: item.strait.id,
            wx: item.wx,
            wy: item.wy,
            radius: Math.max(6, 13 / baseScale),
          });

          ctx.save();
          ctx.strokeStyle = isBlockaded ? '#F43F5E' : '#38BDF8';
          ctx.lineWidth = 1.6 / baseScale;
          ctx.setLineDash([3.5 / baseScale, 2.5 / baseScale]);
          ctx.beginPath();
          ctx.arc(item.wx, item.wy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = isBlockaded ? 'rgba(244, 63, 94, 0.25)' : 'rgba(56, 189, 248, 0.16)';
          ctx.beginPath();
          ctx.arc(item.wx, item.wy, r, 0, Math.PI * 2);
          ctx.fill();

          if (cam.zoom >= 1.25 || overlay === 'logistics') {
            const sFont = Math.max(2.8, 6.4 / Math.pow(cam.zoom, 0.75));
            ctx.font = `800 ${sFont}px "JetBrains Mono", monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            const lbl = isBlockaded
              ? `⛔ ${item.strait.name[langRef.current]}`
              : `⚓ ${item.strait.name[langRef.current]}`;
            ctx.lineWidth = Math.max(0.6, 1.5 / baseScale);
            ctx.strokeStyle = 'rgba(4, 8, 18, 0.95)';
            ctx.strokeText(lbl, item.wx, item.wy + r + 1.5 / baseScale);
            ctx.fillStyle = isBlockaded ? '#FDA4AF' : '#7DD3FC';
            ctx.fillText(lbl, item.wx, item.wy + r + 1.5 / baseScale);
          }
          ctx.restore();
        }
      }

      // 4. Country Center Names & Strategic Rectangular Army Counters when zoomed out
      const placedBoxes: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
      const overlapsPlaced = (x1: number, y1: number, x2: number, y2: number): boolean => {
        for (const b of placedBoxes) {
          if (x1 < b.x2 && x2 > b.x1 && y1 < b.y2 && y2 > b.y1) return true;
        }
        return false;
      };

      const countryCenters: Record<
        string,
        { x: number; y: number; count: number; capital?: [number, number]; area: number }
      > = {};
      for (const prov of Object.values(st.provinces)) {
        const entry = countryCenters[prov.ownerId] ?? { x: 0, y: 0, count: 0, area: 0 };
        entry.x += prov.centroid[0];
        entry.y += prov.centroid[1];
        entry.count += 1;
        entry.area += prov.areaKm2;
        if (prov.isCapital) entry.capital = prov.centroid;
        countryCenters[prov.ownerId] = entry;
      }

      const sortedCountries = Object.entries(countryCenters).sort(([idA, a], [idB, b]) => {
        if (idA === st.playerCountryId) return -1;
        if (idB === st.playerCountryId) return 1;
        return b.area - a.area;
      });

      const labelFontSize = Math.max(3.4, 10.2 / Math.pow(cam.zoom, 0.78));
      ctx.font = `800 ${labelFontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      if (cam.zoom < 5.6) {
        for (const [cId, info] of sortedCountries) {
          const country = st.countries[cId];
          if (!country || country.eliminated) continue;
          const isImportant = cId === st.playerCountryId || info.area >= 40000;
          if (cam.zoom < 1.45 && info.area < 95000 && cId !== st.playerCountryId) continue;
          if (cam.zoom < 2.0 && !isImportant) continue;

          const cx =
            info.count > 1 && cId !== '643'
              ? info.x / info.count
              : info.capital?.[0] ?? info.x / info.count;
          const cy =
            info.count > 1 && cId !== '643'
              ? info.y / info.count
              : info.capital?.[1] ?? info.y / info.count;
          if (!inView(cx, cy)) continue;

          const labelText = (country.displayName || country.name[langRef.current]).toUpperCase();
          const flagW = labelFontSize * 1.42;
          const flagH = labelFontSize * 0.94;
          const textW = ctx.measureText(labelText).width;
          const totalW = flagW + 3 / baseScale + textW;
          const startX = cx - totalW * 0.5;
          const labelY = cy;

          const pad = 2.5 / baseScale;
          const bx1 = startX - pad;
          const by1 = labelY - flagH * 0.65 - pad;
          const bx2 = startX + totalW + pad;
          const by2 = labelY + flagH * 0.65 + pad;

          if (cId !== st.playerCountryId && overlapsPlaced(bx1, by1, bx2, by2)) continue;
          placedBoxes.push({ x1: bx1, y1: by1, x2: bx2, y2: by2 });

          drawCanvasFlag(ctx, country.flag, startX, labelY - flagH * 0.5, flagW, flagH);

          ctx.lineWidth = Math.max(0.9, 2.4 / baseScale);
          ctx.strokeStyle = 'rgba(5, 9, 20, 0.94)';
          ctx.strokeText(labelText, startX + flagW + 3 / baseScale, labelY);
          ctx.fillStyle = cId === st.playerCountryId ? '#FEF08A' : '#FFFFFF';
          ctx.fillText(labelText, startX + flagW + 3 / baseScale, labelY);

          if (cam.zoom < 2.0 && overlay !== 'thermal') {
            const totalArmy = getExactCountryArmy(st, cId);
            if (totalArmy > 0) {
              const isMe = cId === st.playerCountryId;
              const isWar = st.countries[st.playerCountryId]?.atWarWith.includes(cId);
              const isAlly = st.countries[st.playerCountryId]?.allies.includes(cId);
              const isSpied = country.spiedUntil >= st.turn;
              const borderCol = isMe
                ? '#EAB308'
                : isWar
                ? '#EF4444'
                : isAlly
                ? '#10B981'
                : isSpied
                ? '#38BDF8'
                : 'rgba(203, 213, 225, 0.55)';
              const txtCol = isMe ? '#FDE68A' : '#F8FAFC';
              const cBox = drawRectangularArmyCounter(
                ctx,
                cx,
                labelY + flagH * 0.85,
                country.flag,
                formatCounterTroops(totalArmy),
                borderCol,
                txtCol,
                Math.max(3.6, labelFontSize * 0.72),
                baseScale,
              );
              placedBoxes.push(cBox);
            }
          }
        }
      }

      // 5. Capital Golden Crowns, Province Labels, °C Thermal Badges & Rectangular Counters
      if (cam.zoom >= 1.9) {
        const fontSize = Math.max(2.0, Math.min(7.8, 7.2 / Math.pow(cam.zoom, 0.84)));

        const sortedProvs = [...visibleProvs].sort((a, b) => {
          if (a.id === selId) return -1;
          if (b.id === selId) return 1;
          if (a.ownerId === st.playerCountryId && a.isCapital) return -1;
          if (b.ownerId === st.playerCountryId && b.isCapital) return 1;
          if (a.isCapital && !b.isCapital) return -1;
          if (b.isCapital && !a.isCapital) return 1;
          if (a.ownerId === st.playerCountryId && b.ownerId !== st.playerCountryId) return -1;
          if (b.ownerId === st.playerCountryId && a.ownerId !== st.playerCountryId) return 1;
          return getTotalUnits(b.units) - getTotalUnits(a.units);
        });

        for (const prov of sortedProvs) {
          const [cx, cy] = prov.centroid;
          const ownerCountry = st.countries[prov.ownerId];

          if (prov.isCapital) {
            const r = Math.max(1.4, 4.3 / baseScale);
            ctx.save();
            ctx.fillStyle = '#FACC15';
            ctx.strokeStyle = '#050914';
            ctx.lineWidth = 1.1 / baseScale;
            ctx.beginPath();
            for (let k = 0; k < 5; k++) {
              const outerAngle = (k * 2 * Math.PI) / 5 - Math.PI / 2;
              const innerAngle = outerAngle + Math.PI / 5;
              const ox = cx + Math.cos(outerAngle) * r;
              const oy = cy - 3.6 / baseScale + Math.sin(outerAngle) * r;
              const ix = cx + Math.cos(innerAngle) * (r * 0.46);
              const iy = cy - 3.6 / baseScale + Math.sin(innerAngle) * (r * 0.46);
              if (k === 0) ctx.moveTo(ox, oy);
              else ctx.lineTo(ox, oy);
              ctx.lineTo(ix, iy);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            if (cam.zoom >= 3.0 && prov.capitalCity) {
              ctx.font = `800 ${fontSize * 0.92}px "Plus Jakarta Sans", sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              const capTxt = `👑 ${prov.capitalCity}`;
              const cw = ctx.measureText(capTxt).width;
              const ch = fontSize * 1.05;
              const capY = cy - 9.2 / baseScale;
              const cx1 = cx - cw * 0.5;
              const cy1 = capY - ch * 0.5;
              const isOwnCap = prov.ownerId === st.playerCountryId;
              if (isOwnCap || !overlapsPlaced(cx1, cy1, cx1 + cw, cy1 + ch)) {
                placedBoxes.push({ x1: cx1, y1: cy1, x2: cx1 + cw, y2: cy1 + ch });
                ctx.lineWidth = Math.max(0.6, 1.8 / baseScale);
                ctx.strokeStyle = 'rgba(5, 9, 20, 0.95)';
                ctx.strokeText(capTxt, cx, capY);
                ctx.fillStyle = '#FEF08A';
                ctx.fillText(capTxt, cx, capY);
              }
            }
            ctx.restore();
          } else if (cam.zoom >= 4.7) {
            const pbb = cachedPaths.provBBoxes.get(prov.id);
            const screenProvW = pbb ? (pbb.maxX - pbb.minX) * baseScale : 60;
            if (prov.id === selId || screenProvW >= 42) {
              ctx.font = `600 ${fontSize * 0.8}px "Plus Jakarta Sans", sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              const pw = ctx.measureText(prov.name).width;
              const ph = fontSize * 0.95;
              const pad = 3.2 / baseScale;
              const py = cy - 5.8 / baseScale;
              const px1 = cx - pw * 0.5 - pad;
              const py1 = py - ph * 0.5 - pad * 0.5;
              if (prov.id === selId || !overlapsPlaced(px1, py1, px1 + pw + pad * 2, py1 + ph + pad)) {
                placedBoxes.push({ x1: px1, y1: py1, x2: px1 + pw + pad * 2, y2: py1 + ph + pad });
                ctx.lineWidth = Math.max(0.5, 1.4 / baseScale);
                ctx.strokeStyle = 'rgba(5, 9, 20, 0.94)';
                ctx.strokeText(prov.name, cx, py);
                ctx.fillStyle = '#E2E8F0';
                ctx.fillText(prov.name, cx, py);
              }
            }
          }

          if (overlay === 'thermal') {
            const tC = Math.round(prov.temperatureC ?? 14);
            const tLabel = `${tC}°C`;
            const tFont = Math.max(2.3, fontSize * 0.92);
            ctx.font = `800 ${tFont}px "JetBrains Mono", monospace`;
            const tw = ctx.measureText(tLabel).width;
            const th = tFont * 1.2;
            const ty = cy + 3.5 / baseScale;
            if (prov.id === selId || !overlapsPlaced(cx - tw * 0.5, ty, cx + tw * 0.5, ty + th)) {
              placedBoxes.push({ x1: cx - tw * 0.5, y1: ty, x2: cx + tw * 0.5, y2: ty + th });
              ctx.lineWidth = Math.max(0.6, 1.6 / baseScale);
              ctx.strokeStyle = 'rgba(4, 8, 18, 0.96)';
              ctx.strokeText(tLabel, cx, ty + th * 0.5);
              ctx.fillStyle = tC <= -15 ? '#7DD3FC' : tC >= 38 ? '#FCA5A5' : '#FEF08A';
              ctx.fillText(tLabel, cx, ty + th * 0.5);
            }
            continue;
          }

          // Rectangular AoH3 Army Counters [Mini Flag | 14.2k]
          const troops = getTotalUnits(prov.units);
          const isPlayerProv = prov.ownerId === st.playerCountryId;
          const isAllyProv = st.countries[st.playerCountryId]?.allies.includes(prov.ownerId);
          const isWarProv = st.countries[st.playerCountryId]?.atWarWith.includes(prov.ownerId);
          const isSpied = Boolean(ownerCountry && ownerCountry.spiedUntil >= st.turn);
          const isRevealed = isSpectator || isPlayerProv || isAllyProv || isSpied;

          if (troops > 0 && ownerCountry) {
            const label =
              isRevealed || cam.zoom >= 2.5 ? formatCounterTroops(troops) : '?';
            const counterFont = Math.max(2.1, fontSize * 0.92);
            const estW = label.length * counterFont * 0.65 + counterFont * 1.6 + 7 / baseScale;
            const estH = counterFont * 1.45;
            const badgeY = cy + 3.8 / baseScale;
            const bx1 = cx - estW * 0.5;
            const bx2 = cx + estW * 0.5;

            if (prov.id === selId || !overlapsPlaced(bx1, badgeY, bx2, badgeY + estH)) {
              const borderCol = isPlayerProv
                ? '#EAB308'
                : isWarProv
                ? '#EF4444'
                : isAllyProv
                ? '#10B981'
                : isSpied
                ? '#38BDF8'
                : 'rgba(148, 163, 184, 0.6)';
              const textCol = isPlayerProv ? '#FDE68A' : '#F8FAFC';
              const box = drawRectangularArmyCounter(
                ctx,
                cx,
                badgeY,
                ownerCountry.flag,
                label,
                borderCol,
                textCol,
                counterFont,
                baseScale,
              );
              placedBoxes.push(box);
            }
          }

          // Tiny crisp building pip strip on zoomed provinces
          if (prov.buildings.length > 0 && cam.zoom >= 3.2) {
            const iconSz = 4.6 / baseScale;
            const totalW = prov.buildings.length * (iconSz + 1.1 / baseScale);
            let bx = cx - totalW * 0.5;
            const by = cy - 1.4 / baseScale;
            for (const b of prov.buildings) {
              ctx.fillStyle =
                b === 'factory'
                  ? '#F59E0B'
                  : b === 'farm'
                  ? '#22C55E'
                  : b === 'barracks'
                  ? '#EF4444'
                  : b === 'port'
                  ? '#38BDF8'
                  : b === 'university'
                  ? '#818CF8'
                  : b === 'railway'
                  ? '#FACC15'
                  : b === 'coastal_defense'
                  ? '#22D3EE'
                  : b === 'missile_silo'
                  ? '#F43F5E'
                  : b === 'spaceport'
                  ? '#FB923C'
                  : '#A855F7';
              ctx.fillRect(bx, by, iconSz, iconSz);
              ctx.strokeStyle = '#050914';
              ctx.lineWidth = 0.5 / baseScale;
              ctx.strokeRect(bx, by, iconSz, iconSz);
              bx += iconSz + 1.1 / baseScale;
            }
          }
        }
      }

      // 6. Real-Time Marching Armies, Armored Rail Trains & Naval Fleets
      const pulse = (now % 1200) / 1200;
      for (const order of st.orders) {
        const from = st.provinces[order.fromProvinceId];
        const to = st.provinces[order.toProvinceId];
        if (!from || !to) continue;
        const [x1, y1] = from.centroid;
        const [x2, y2] = to.centroid;
        if (!inView(x1, y1) && !inView(x2, y2)) continue;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;

        const color = order.isRail
          ? '#FACC15'
          : order.isAttack
          ? '#EF4444'
          : order.isNaval
          ? '#38BDF8'
          : '#10B981';

        ctx.save();
        ctx.strokeStyle = 'rgba(5, 9, 20, 0.92)';
        ctx.lineWidth = 4.8 / baseScale;
        ctx.setLineDash(order.isNaval ? [5 / baseScale, 4 / baseScale] : []);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2.4 / baseScale;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);

        const headSize = 8.5 / baseScale;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
          x2 - ux * headSize - uy * headSize * 0.55,
          y2 - uy * headSize + ux * headSize * 0.55,
        );
        ctx.lineTo(
          x2 - ux * headSize + uy * headSize * 0.55,
          y2 - uy * headSize - ux * headSize * 0.55,
        );
        ctx.closePath();
        ctx.fill();

        const frac = Math.max(0.06, Math.min(0.95, order.progress || pulse * 0.5));
        const mx = x1 + dx * frac;
        const my = y1 + dy * frac;
        const angle = Math.atan2(dy, dx);
        const tokenSz = 7.6 / baseScale;

        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(angle);
        if (order.isRail) {
          // Armored Train Locomotive Silhouette
          ctx.fillStyle = '#FACC15';
          ctx.strokeStyle = '#050914';
          ctx.lineWidth = 1.1 / baseScale;
          ctx.fillRect(-tokenSz * 1.1, -tokenSz * 0.42, tokenSz * 2.1, tokenSz * 0.84);
          ctx.strokeRect(-tokenSz * 1.1, -tokenSz * 0.42, tokenSz * 2.1, tokenSz * 0.84);
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(-tokenSz * 0.55, -tokenSz * 0.24, tokenSz * 0.9, tokenSz * 0.48);
        } else if (order.isNaval) {
          ctx.strokeStyle = 'rgba(186, 230, 253, 0.72)';
          ctx.lineWidth = 1.4 / baseScale;
          ctx.beginPath();
          ctx.moveTo(-tokenSz * 1.4, -tokenSz * 0.55);
          ctx.lineTo(-tokenSz * 0.2, 0);
          ctx.lineTo(-tokenSz * 1.4, tokenSz * 0.55);
          ctx.stroke();

          ctx.fillStyle = '#E0F2FE';
          ctx.strokeStyle = '#050914';
          ctx.lineWidth = 1.1 / baseScale;
          ctx.beginPath();
          ctx.moveTo(tokenSz * 1.15, 0);
          ctx.lineTo(-tokenSz * 0.8, -tokenSz * 0.5);
          ctx.lineTo(-tokenSz * 0.5, 0);
          ctx.lineTo(-tokenSz * 0.8, tokenSz * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillStyle = order.isAttack ? '#FCA5A5' : '#A7F3D0';
          ctx.strokeStyle = '#050914';
          ctx.lineWidth = 1.2 / baseScale;
          ctx.beginPath();
          ctx.arc(0, 0, tokenSz * 0.65, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(tokenSz * 0.9, 0);
          ctx.lineTo(-tokenSz * 0.25, -tokenSz * 0.45);
          ctx.lineTo(-tokenSz * 0.25, tokenSz * 0.45);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        const ordCountry = st.countries[order.countryId];
        const ordTroops = getTotalUnits(order.units);
        if (ordCountry && ordTroops > 0) {
          drawRectangularArmyCounter(
            ctx,
            mx,
            my + 7.5 / baseScale,
            ordCountry.flag,
            formatCounterTroops(ordTroops),
            order.isRail ? '#FACC15' : order.isAttack ? '#EF4444' : '#EAB308',
            '#FFFFFF',
            Math.max(2.6, 5.2 / Math.pow(cam.zoom, 0.78)),
            baseScale,
          );
        }
        ctx.restore();
      }

      // 6b. Active Maritime Water Alerts
      for (const alert of st.waterAlerts) {
        const [wx, wy] = alert.centroid;
        if (!inView(wx, wy)) continue;
        const stormPhase = (now * 0.0022) % (Math.PI * 2);
        const r = (24 + 6 * Math.sin(now * 0.004)) / Math.sqrt(cam.zoom);
        ctx.save();
        ctx.translate(wx, wy);
        ctx.strokeStyle =
          alert.severity === 'storm' ? 'rgba(56, 189, 248, 0.72)' : 'rgba(34, 211, 238, 0.65)';
        ctx.lineWidth = 1.8 / baseScale;
        ctx.beginPath();
        ctx.arc(0, 0, r, stormPhase, stormPhase + Math.PI * 1.35);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.62, -stormPhase, -stormPhase + Math.PI * 1.25);
        ctx.stroke();
        ctx.fillStyle = 'rgba(14, 165, 233, 0.14)';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6c. Orbital Spy Satellites (Sapphire Orbit & Radar Cone)
      for (const sat of activeSats) {
        const [tx, ty] = sat.centroid;
        if (!inView(tx, ty)) continue;
        const orbitAng = now * 0.0018;
        const orbitR = 24 / baseScale;
        const sx = tx + Math.cos(orbitAng) * orbitR;
        const sy = ty - 14 / baseScale + Math.sin(orbitAng) * orbitR * 0.42;

        ctx.save();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx - 16 / baseScale, ty);
        ctx.lineTo(tx + 16 / baseScale, ty);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 0.9 / baseScale;
        ctx.beginPath();
        ctx.ellipse(tx, ty - 14 / baseScale, orbitR, orbitR * 0.42, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Satellite solar wing body
        const sz = 4.2 / baseScale;
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(sx - sz * 1.8, sy - sz * 0.35, sz * 1.1, sz * 0.7);
        ctx.fillRect(sx + sz * 0.7, sy - sz * 0.35, sz * 1.1, sz * 0.7);
        ctx.fillStyle = '#FACC15';
        ctx.fillRect(sx - sz * 0.5, sy - sz * 0.5, sz, sz);
        ctx.restore();
      }

      // 6d. Ballistic & Nuclear Missile Trajectories
      for (const m of activeMissiles) {
        const age = Math.min(1, (nowMs - m.createdAt) / 3600);
        const [fx, fy] = m.fromCentroid;
        const [tx, ty] = m.toCentroid;
        const midX = (fx + tx) * 0.5;
        const midY = (fy + ty) * 0.5 - Math.max(40, Math.hypot(tx - fx, ty - fy) * 0.38);
        const flightT = Math.min(1, age * 1.45);
        const invT = 1 - flightT;
        const curX = invT * invT * fx + 2 * invT * flightT * midX + flightT * flightT * tx;
        const curY = invT * invT * fy + 2 * invT * flightT * midY + flightT * flightT * ty;

        ctx.save();
        ctx.strokeStyle = m.isNuclear
          ? `rgba(251, 146, 60, ${1 - age * 0.65})`
          : `rgba(244, 63, 94, ${1 - age * 0.65})`;
        ctx.lineWidth = (m.isNuclear ? 3 : 2) / baseScale;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(midX, midY, curX, curY);
        ctx.stroke();

        if (flightT < 1) {
          ctx.fillStyle = m.isNuclear ? '#FDE047' : '#FDA4AF';
          ctx.beginPath();
          ctx.arc(curX, curY, 4.5 / baseScale, 0, Math.PI * 2);
          ctx.fill();
        } else if (m.intercepted) {
          const sr = (18 + age * 16) / baseScale;
          ctx.strokeStyle = `rgba(34, 211, 238, ${1 - age * 0.8})`;
          ctx.lineWidth = 2.4 / baseScale;
          ctx.beginPath();
          ctx.arc(tx, ty, sr, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          const er = ((m.isNuclear ? 34 : 18) * (0.4 + age * 0.8)) / baseScale;
          ctx.fillStyle = m.isNuclear
            ? `rgba(249, 115, 22, ${0.45 * (1 - age)})`
            : `rgba(239, 68, 68, ${0.38 * (1 - age)})`;
          ctx.beginPath();
          ctx.arc(tx, ty, er, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 6e. Auto-Pilot 5-Second Strategic Airlift Vectors
      for (const al of activeAirlifts) {
        const age = Math.min(1, (nowMs - al.createdAt) / 4200);
        const [fx, fy] = al.fromCentroid;
        const [tx, ty] = al.toCentroid;
        const dist = Math.hypot(tx - fx, ty - fy);
        const midX = (fx + tx) * 0.5;
        const midY = (fy + ty) * 0.5 - Math.max(24, dist * 0.28);
        const flightT = Math.min(1, age * 1.45);
        const invT = 1 - flightT;
        const px = invT * invT * fx + 2 * invT * flightT * midX + flightT * flightT * tx;
        const py = invT * invT * fy + 2 * invT * flightT * midY + flightT * flightT * ty;

        ctx.save();
        ctx.setLineDash([4.5 / baseScale, 4.5 / baseScale]);
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.85 * (1 - age * 0.6)})`;
        ctx.lineWidth = 2.0 / baseScale;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(midX, midY, tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);

        if (flightT < 1) {
          const dxdt = 2 * invT * (midX - fx) + 2 * flightT * (tx - midX);
          const dydt = 2 * invT * (midY - fy) + 2 * flightT * (ty - midY);
          const ang = Math.atan2(dydt, dxdt);
          const js = 9.5 / baseScale;

          ctx.translate(px, py);
          ctx.rotate(ang);
          ctx.fillStyle = '#22D3EE';
          ctx.strokeStyle = '#050914';
          ctx.lineWidth = 1.1 / baseScale;
          ctx.beginPath();
          ctx.moveTo(js * 1.15, 0);
          ctx.lineTo(-js * 0.2, -js * 0.9);
          ctx.lineTo(-js * 0.5, -js * 0.22);
          ctx.lineTo(-js * 0.95, -js * 0.42);
          ctx.lineTo(-js * 0.75, 0);
          ctx.lineTo(-js * 0.95, js * 0.42);
          ctx.lineTo(-js * 0.5, js * 0.22);
          ctx.lineTo(-js * 0.2, js * 0.9);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }

      // 7. Battle Clash Animation
      for (const battle of battlesRef.current) {
        const [bx, by] = battle.centroid;
        if (!inView(bx, by)) continue;
        const ringPhase = (now % 900) / 900;
        const ringRadius = (14 + ringPhase * 28) / baseScale;
        ctx.save();
        ctx.strokeStyle = `rgba(251, 146, 60, ${0.75 * (1 - ringPhase)})`;
        ctx.lineWidth = 2.2 / baseScale;
        ctx.beginPath();
        ctx.arc(bx, by, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        drawArmoredBattleClash(ctx, bx, by, battle, now, baseScale);
      }

      // 7a. Expanding Map Event Pulses
      for (const pulseItem of activePulses) {
        const [px, py] = pulseItem.centroid;
        if (!inView(px, py)) continue;
        const age = Math.min(1, (nowMs - pulseItem.createdAt) / 4200);
        const alpha = Math.max(0, 1 - age);
        const rgb =
          pulseItem.kind === 'recruit'
            ? '16, 185, 129'
            : pulseItem.kind === 'airlift'
            ? '34, 211, 238'
            : pulseItem.kind === 'climate'
            ? '251, 146, 60'
            : pulseItem.kind === 'nuclear'
            ? '249, 115, 22'
            : pulseItem.kind === 'comeback'
            ? '250, 204, 21'
            : '244, 63, 94';

        const r1 = (10 + age * 46) / baseScale;
        const r2 = (4 + ((age * 1.45) % 1) * 32) / baseScale;

        ctx.save();
        ctx.fillStyle = `rgba(${rgb}, ${alpha * 0.16})`;
        ctx.beginPath();
        ctx.arc(px, py, r1 * 0.55, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(${rgb}, ${alpha * 0.92})`;
        ctx.lineWidth = 2.3 / baseScale;
        ctx.beginPath();
        ctx.arc(px, py, r1, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${rgb}, ${alpha * 0.65})`;
        ctx.lineWidth = 1.4 / baseScale;
        ctx.beginPath();
        ctx.arc(px, py, r2, 0, Math.PI * 2);
        ctx.stroke();

        if (pulseItem.label && cam.zoom >= 1.5) {
          const pFont = Math.max(3.2, 7.6 / Math.pow(cam.zoom, 0.75));
          ctx.font = `800 ${pFont}px "JetBrains Mono", monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          const ly = py - (10 + age * 14) / baseScale;
          ctx.lineWidth = Math.max(0.7, 1.8 / baseScale);
          ctx.strokeStyle = `rgba(4, 8, 18, ${alpha * 0.95})`;
          ctx.strokeText(pulseItem.label, px, ly);
          ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
          ctx.fillText(pulseItem.label, px, ly);
        }
        ctx.restore();
      }

      // 7b. Interactive Major City Pins
      cityHitBoxesRef.current = [];
      if (cam.zoom >= 2.1) {
        const hoveredCity = hoveredCityIdRef.current;
        const pinFont = Math.max(2.1, Math.min(7.2, 6.2 / Math.pow(cam.zoom, 0.8)));
        const r = Math.max(1.5, 4.4 / baseScale);
        for (const item of projectedCities) {
          if (!inView(item.wx, item.wy)) continue;
          const isHovered = item.city.id === hoveredCity;
          const pinX = item.wx;
          const pinY = item.wy;

          cityHitBoxesRef.current.push({
            id: item.city.id,
            wx: pinX,
            wy: pinY,
            radius: Math.max(4.5, 10.5 / baseScale),
          });

          ctx.save();
          ctx.strokeStyle = isHovered ? '#FDE047' : 'rgba(56, 189, 248, 0.85)';
          ctx.lineWidth = (isHovered ? 1.5 : 0.95) / baseScale;
          ctx.beginPath();
          ctx.arc(pinX, pinY, r * (isHovered ? 1.45 : 1.15), 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = isHovered ? '#EAB308' : '#0EA5E9';
          ctx.strokeStyle = '#050914';
          ctx.lineWidth = 0.8 / baseScale;
          ctx.beginPath();
          ctx.moveTo(pinX, pinY - r * 0.82);
          ctx.lineTo(pinX + r * 0.82, pinY);
          ctx.lineTo(pinX, pinY + r * 0.82);
          ctx.lineTo(pinX - r * 0.82, pinY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          if (cam.zoom >= 2.8 || isHovered) {
            ctx.font = `700 ${pinFont * 0.82}px "Plus Jakarta Sans", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            const cityLabel = item.city.name;
            ctx.lineWidth = Math.max(0.5, 1.4 / baseScale);
            ctx.strokeStyle = 'rgba(5, 9, 20, 0.96)';
            ctx.strokeText(cityLabel, pinX, pinY + r * 1.15);
            ctx.fillStyle = isHovered ? '#FDE047' : '#BAE6FD';
            ctx.fillText(cityLabel, pinX, pinY + r * 1.15);
          }
          ctx.restore();
        }
      }

      ctx.restore();

      // 8. Ultra Weather Screen-Space Particles
      if (activeTier === 'ultra') {
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const centerProv = selId ? st.provinces[selId] : st.provinces['616_p0'];
        const viewWeather = centerProv?.weather ?? (st.season === 'winter' ? 'snow' : 'sunny');
        const tSec = now * 0.001;

        if (viewWeather === 'snow' || viewWeather === 'rain') {
          const isSnow = viewWeather === 'snow';
          ctx.fillStyle = isSnow ? 'rgba(241, 245, 249, 0.52)' : 'rgba(125, 211, 252, 0.38)';
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const p = PARTICLE_SEED[i];
            const px =
              ((p.xFrac * width + tSec * (isSnow ? 18 : 34) * p.speed) % width + width) % width;
            const py =
              ((p.yFrac * height + tSec * (isSnow ? 42 : 185) * p.speed) % height + height) %
              height;
            if (isSnow) {
              ctx.fillRect(px, py, p.size, p.size);
            } else {
              ctx.fillRect(px, py, 1.2, 9);
            }
          }
        }
        ctx.restore();
      }
      lastDrawDuration = performance.now() - frameStartPerf;
    };

    animId = requestAnimationFrame(renderFrame);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [cachedPaths, mapData, terrainPattern, perfMode, onLowFpsDetected, fpsDomRef, projectedCities, projectedStraits]);

  const screenToWorld = (clientX: number, clientY: number): [number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    const cam = camRef.current;
    const baseScale = Math.min(rect.width / WORLD_WIDTH, rect.height / WORLD_HEIGHT) * cam.zoom;
    const wx = (sx - rect.width * 0.5) / baseScale + cam.x;
    const wy = (sy - rect.height * 0.5) / baseScale + cam.y;
    return [wx, wy];
  };

  const hitTestProvince = (wx: number, wy: number): string | null => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return null;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const geom of mapData.provinces) {
      const bb = cachedPaths.provBBoxes.get(geom.id);
      if (!bb || wx < bb.minX || wx > bb.maxX || wy < bb.minY || wy > bb.maxY) continue;
      const path = cachedPaths.provPaths.get(geom.id);
      if (path && ctx.isPointInPath(path, wx, wy)) {
        ctx.restore();
        return geom.id;
      }
    }
    ctx.restore();
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      camX: camRef.current.x,
      camY: camRef.current.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (drag.active) {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        drag.moved = true;
      }
      if (drag.moved && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const baseScale =
          Math.min(rect.width / WORLD_WIDTH, rect.height / WORLD_HEIGHT) * camRef.current.zoom;
        camRef.current = {
          ...camRef.current,
          x: Math.max(0, Math.min(WORLD_WIDTH, drag.camX - dx / baseScale)),
          y: Math.max(0, Math.min(WORLD_HEIGHT, drag.camY - dy / baseScale)),
        };
        dirtyRef.current = true;
      }
      return;
    }

    const pt = screenToWorld(e.clientX, e.clientY);
    if (!pt) return;
    let hitCity: string | null = null;
    if (camRef.current.zoom >= 2.1) {
      for (const cHit of cityHitBoxesRef.current) {
        if (Math.hypot(pt[0] - cHit.wx, pt[1] - cHit.wy) <= cHit.radius * 1.35) {
          hitCity = cHit.id;
          break;
        }
      }
    }
    if (hitCity !== hoveredCityIdRef.current) {
      hoveredCityIdRef.current = hitCity;
      dirtyRef.current = true;
    }
    const hit = hitTestProvince(pt[0], pt[1]);
    if (hit !== hoveredIdRef.current) {
      hoveredIdRef.current = hit;
      dirtyRef.current = true;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    drag.active = false;
    if (!drag.moved) {
      const pt = screenToWorld(e.clientX, e.clientY);
      if (pt) {
        if (overlayRef.current === 'logistics' && onToggleStraitBlockade) {
          for (const sHit of straitHitBoxesRef.current) {
            if (Math.hypot(pt[0] - sHit.wx, pt[1] - sHit.wy) <= sHit.radius * 1.5) {
              onToggleStraitBlockade(sHit.id);
              return;
            }
          }
        }
        if (camRef.current.zoom >= 2.1 && onSelectCity) {
          for (const cHit of cityHitBoxesRef.current) {
            if (Math.hypot(pt[0] - cHit.wx, pt[1] - cHit.wy) <= cHit.radius * 1.45) {
              onSelectCity(cHit.id);
              return;
            }
          }
        }
        const hit = hitTestProvince(pt[0], pt[1]);
        if (hit) {
          onSelectProvince(hit);
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const factor = e.deltaY < 0 ? 1.18 : 0.85;
    const nextZoom = Math.max(0.65, Math.min(22, camRef.current.zoom * factor));
    const ptBefore = screenToWorld(e.clientX, e.clientY);
    camRef.current = { ...camRef.current, zoom: nextZoom };
    if (ptBefore && canvasRef.current) {
      const ptAfter = screenToWorld(e.clientX, e.clientY);
      if (ptAfter) {
        camRef.current.x = Math.max(
          0,
          Math.min(WORLD_WIDTH, camRef.current.x + (ptBefore[0] - ptAfter[0])),
        );
        camRef.current.y = Math.max(
          0,
          Math.min(WORLD_HEIGHT, camRef.current.y + (ptBefore[1] - ptAfter[1])),
        );
      }
    }
    dirtyRef.current = true;
  };

  const adjustZoom = (mult: number) => {
    camRef.current = {
      ...camRef.current,
      zoom: Math.max(0.65, Math.min(22, camRef.current.zoom * mult)),
    };
    dirtyRef.current = true;
  };

  const resetWorldView = () => {
    camRef.current = { x: WORLD_WIDTH * 0.5, y: WORLD_HEIGHT * 0.45, zoom: 1.0 };
    dirtyRef.current = true;
  };

  const centerOnCapital = () => {
    const cap =
      Object.values(state.provinces).find((p) => p.ownerId === state.playerCountryId && p.isCapital) ??
      Object.values(state.provinces).find((p) => p.ownerId === state.playerCountryId) ??
      state.provinces['616_p0'];
    if (cap) {
      camRef.current = { x: cap.centroid[0], y: cap.centroid[1], zoom: 5.5 };
      dirtyRef.current = true;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#03060E] select-none">
      <canvas
        ref={canvasRef}
        data-testid="world-map-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="block w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {!fpsDomRef && <span ref={localFpsRef} className="sr-only">60 FPS</span>}

      {/* Right-Edge Compact Camera & Zoom Cluster */}
      <div className="pointer-events-auto absolute top-16 md:top-4 right-2.5 md:right-3 flex flex-col gap-1.5 z-10">
        <button
          type="button"
          onClick={() => adjustZoom(1.4)}
          aria-label={lang === 'en' ? 'Zoom in map' : 'Przybliż mapę'}
          className="h-8 w-8 flex items-center justify-center rounded-lg border aoh-hud-panel text-slate-200 hover:border-amber-400/70 hover:text-white cursor-pointer"
        >
          <Plus size={15} />
        </button>
        <button
          type="button"
          onClick={() => adjustZoom(0.72)}
          aria-label={lang === 'en' ? 'Zoom out map' : 'Oddal mapę'}
          className="h-8 w-8 flex items-center justify-center rounded-lg border aoh-hud-panel text-slate-200 hover:border-amber-400/70 hover:text-white cursor-pointer"
        >
          <Minus size={15} />
        </button>
        <button
          type="button"
          onClick={centerOnCapital}
          aria-label={lang === 'en' ? 'Center on your capital' : 'Wyśrodkuj na swoim kraju'}
          title={lang === 'en' ? 'Center on capital' : 'Wyśrodkuj na stolicy'}
          className="h-8 w-8 flex items-center justify-center rounded-lg border aoh-hud-panel text-amber-400 hover:border-amber-400 cursor-pointer"
        >
          <Crosshair size={14} />
        </button>
        <button
          type="button"
          onClick={resetWorldView}
          aria-label={lang === 'en' ? 'Reset world view' : 'Widok całego świata'}
          title={lang === 'en' ? 'Whole world view' : 'Cały świat'}
          className="h-8 w-8 flex items-center justify-center rounded-lg border aoh-hud-panel text-sky-400 hover:border-sky-400 cursor-pointer"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
}
