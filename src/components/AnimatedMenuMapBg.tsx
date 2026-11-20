import React, { useEffect, useMemo, useRef } from 'react';
import { WORLD_HEIGHT, WORLD_WIDTH, buildWorldMapData } from '../game/mapGen';
import type { EffectiveTier } from '../game/types';

// Animated Grand Strategy World Map Backdrop for the Main Menu
export function AnimatedMenuMapBg({ effectiveTier }: { effectiveTier: EffectiveTier }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapData = useMemo(() => buildWorldMapData(), []);

  const cachedPaths = useMemo(() => {
    const paths: Array<{ path: Path2D; color: string; isHighlight: boolean }> = [];
    if (typeof Path2D === 'undefined') return paths;

    for (const geom of mapData.provinces) {
      const p = new Path2D();
      for (const ring of geom.rings) {
        if (ring.length < 3) continue;
        p.moveTo(ring[0][0], ring[0][1]);
        for (let i = 1; i < ring.length; i++) {
          p.lineTo(ring[i][0], ring[i][1]);
        }
        p.closePath();
      }
      const meta = mapData.countryMetas[geom.countryOrigId];
      paths.push({
        path: p,
        color: meta?.color ?? '#334155',
        isHighlight: geom.countryOrigId === '616',
      });
    }
    return paths;
  }, [mapData]);

  const capitalPoints = useMemo(() => {
    return mapData.provinces
      .filter((p) => p.capitalCity || p.id.endsWith('_p0'))
      .slice(0, 28)
      .map((p) => p.centroid);
  }, [mapData]);

  const offscreenMap = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const scale = 1.6;
    const off = document.createElement('canvas');
    off.width = Math.round(WORLD_WIDTH * scale);
    off.height = Math.round(WORLD_HEIGHT * scale);
    const octx = off.getContext('2d');
    if (!octx) return null;

    octx.scale(scale, scale);

    // Subtle latitude/longitude grid lines
    octx.strokeStyle = 'rgba(245, 158, 11, 0.06)';
    octx.lineWidth = 0.65;
    octx.beginPath();
    for (let gx = 0; gx <= WORLD_WIDTH; gx += 160) {
      octx.moveTo(gx, 0);
      octx.lineTo(gx, WORLD_HEIGHT);
    }
    for (let gy = 0; gy <= WORLD_HEIGHT; gy += 160) {
      octx.moveTo(0, gy);
      octx.lineTo(WORLD_WIDTH, gy);
    }
    octx.stroke();

    for (const item of cachedPaths) {
      octx.fillStyle = item.color;
      octx.globalAlpha = item.isHighlight ? 0.44 : 0.24;
      octx.fill(item.path);
      octx.globalAlpha = 1;
      octx.strokeStyle = item.isHighlight
        ? 'rgba(251, 191, 36, 0.62)'
        : 'rgba(245, 158, 11, 0.2)';
      octx.lineWidth = item.isHighlight ? 0.95 : 0.5;
      octx.stroke(item.path);
    }

    return off;
  }, [cachedPaths]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId = 0;
    let width = window.innerWidth || 1440;
    let height = window.innerHeight || 900;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, effectiveTier === 'light' ? 1 : 1.5);
      width = canvas.parentElement?.clientWidth || window.innerWidth || 1440;
      height = canvas.parentElement?.clientHeight || window.innerHeight || 900;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    let lastDraw = 0;
    const render = (now: number) => {
      animId = requestAnimationFrame(render);
      const minStep = effectiveTier === 'light' ? 140 : 48;
      if (now - lastDraw < minStep) return;
      lastDraw = now;

      const dpr = Math.min(window.devicePixelRatio || 1, effectiveTier === 'light' ? 1 : 1.5);
      const t = now * 0.00014;
      const panX = WORLD_WIDTH * 0.52 + Math.sin(t) * 140;
      const panY = WORLD_HEIGHT * 0.39 + Math.cos(t * 0.8) * 42;
      const zoom = 1.65 + Math.sin(t * 0.6) * 0.12;
      const baseScale = Math.min(width / WORLD_WIDTH, height / WORLD_HEIGHT) * zoom;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Deep grand-strategy ocean gradient
      const oceanGrad = ctx.createRadialGradient(
        width * 0.55,
        height * 0.45,
        40,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.75,
      );
      oceanGrad.addColorStop(0, '#0C1A33');
      oceanGrad.addColorStop(0.6, '#060D1E');
      oceanGrad.addColorStop(1, '#040710');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.translate(width * 0.5, height * 0.5);
      ctx.scale(baseScale, baseScale);
      ctx.translate(-panX, -panY);

      if (offscreenMap) {
        ctx.drawImage(offscreenMap, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      }

      // Golden capital beacons + strategic sea/air trajectory arcs
      if (effectiveTier !== 'light') {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.22)';
        ctx.lineWidth = 1.1 / baseScale;
        ctx.setLineDash([5 / baseScale, 5 / baseScale]);
        ctx.beginPath();
        for (let i = 0; i < Math.min(capitalPoints.length - 1, 10); i++) {
          const a = capitalPoints[i];
          const b = capitalPoints[(i + 3) % capitalPoints.length];
          ctx.moveTo(a[0], a[1]);
          ctx.quadraticCurveTo((a[0] + b[0]) * 0.5, Math.min(a[1], b[1]) - 35, b[0], b[1]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        for (let i = 0; i < capitalPoints.length; i++) {
          const [cx, cy] = capitalPoints[i];
          const pulse = 0.5 + 0.5 * Math.sin(now * 0.0025 + i);
          ctx.fillStyle = `rgba(251, 191, 36, ${0.4 + pulse * 0.45})`;
          ctx.beginPath();
          ctx.arc(cx, cy, (2.2 + pulse * 1.1) / baseScale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      // Vignette overlay for crisp foreground readability over negative space
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const vignette = ctx.createLinearGradient(0, 0, width, 0);
      vignette.addColorStop(0, 'rgba(5, 9, 20, 0.86)');
      vignette.addColorStop(0.38, 'rgba(5, 9, 20, 0.48)');
      vignette.addColorStop(1, 'rgba(5, 9, 20, 0.72)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [offscreenMap, capitalPoints, effectiveTier]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full block"
    />
  );
}
