import React, { useEffect, useRef } from 'react';
import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import worldAtlasRaw from 'world-atlas/countries-110m.json';
import { CITY_RECON_SPOTS } from '../data/cities';

/**
 * Full-screen rotating dark-obsidian & gold 3D-like Earth globe for the Main Menu
 * featuring glowing borders, real-time solar terminator, and golden city lights in night zones.
 */
export function GlobeBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const topo = worldAtlasRaw as unknown as Topology<{
      countries: GeometryCollection<{ name: string }>;
    }>;
    const countriesGeo = feature(topo, topo.objects.countries);
    const graticule = geoGraticule10();

    const prefersReduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;
    let lonAngle = -18;
    let lastDrawMs = 0;

    const draw = (nowMs: number) => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(320, Math.floor(rect.width));
      const h = Math.max(320, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep space royal obsidian radial void
      const bgGrad = ctx.createRadialGradient(w * 0.66, h * 0.5, 40, w * 0.55, h * 0.5, Math.max(w, h) * 0.85);
      bgGrad.addColorStop(0, '#0E1B38');
      bgGrad.addColorStop(0.55, '#050914');
      bgGrad.addColorStop(1, '#02040A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Position globe toward right-center so left setup cards sit over calm negative space
      const cx = w >= 960 ? w * 0.67 : w * 0.5;
      const cy = h * 0.5;
      const radius = Math.min(w, h) * (w >= 960 ? 0.43 : 0.38);

      const projection = geoOrthographic()
        .scale(radius)
        .translate([cx, cy])
        .rotate([lonAngle, -24, 6])
        .clipAngle(90);

      const path = geoPath(projection, ctx);

      // Atmosphere outer halo
      const halo = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.18);
      halo.addColorStop(0, 'rgba(251, 191, 36, 0.22)');
      halo.addColorStop(0.55, 'rgba(56, 189, 248, 0.10)');
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // Ocean sphere fill
      const oceanGrad = ctx.createRadialGradient(cx - radius * 0.32, cy - radius * 0.28, radius * 0.08, cx, cy, radius);
      oceanGrad.addColorStop(0, '#0F2547');
      oceanGrad.addColorStop(0.6, '#071124');
      oceanGrad.addColorStop(1, '#030711');
      ctx.fillStyle = oceanGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Graticule lines
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.09)';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Landmasses & glowing golden borders
      ctx.beginPath();
      path(countriesGeo);
      ctx.fillStyle = '#0D172B';
      ctx.fill();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.48)';
      ctx.lineWidth = 0.85;
      ctx.stroke();

      // Solar Terminator shadow across eastern/night limb of the rotating globe
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      const nightGrad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
      nightGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      nightGrad.addColorStop(0.45, 'rgba(2, 5, 14, 0.15)');
      nightGrad.addColorStop(0.85, 'rgba(1, 3, 10, 0.72)');
      ctx.fillStyle = nightGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // Glowing golden city lights on visible hemisphere (strongest in night zone)
      for (const spot of CITY_RECON_SPOTS) {
        const pt = projection([spot.lon, spot.lat]);
        if (!pt) continue;
        const dx = pt[0] - cx;
        const isNightSide = dx > -radius * 0.15;
        ctx.fillStyle = isNightSide ? 'rgba(253, 224, 71, 0.92)' : 'rgba(251, 191, 36, 0.42)';
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], isNightSide ? 2.5 : 1.7, 0, Math.PI * 2);
        ctx.fill();
        if (isNightSide) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.24)';
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Rim specular highlight
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    };

    const tick = (now: number) => {
      if (!prefersReduced) {
        lonAngle = (lonAngle + 0.14) % 360;
      }
      // Software-friendly cadence while staying silky
      if (now - lastDrawMs >= 32) {
        lastDrawMs = now;
        draw(now);
      }
      if (!prefersReduced) {
        rafId = requestAnimationFrame(tick);
      }
    };

    draw(performance.now());
    if (!prefersReduced) {
      rafId = requestAnimationFrame(tick);
    }

    const onResize = () => draw(performance.now());
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" aria-hidden="true" />;
}
