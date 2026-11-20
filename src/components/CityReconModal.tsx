import React, { useEffect, useState } from 'react';
import { Crosshair, ExternalLink, MapPin, Satellite, Users, X, ZoomIn, ZoomOut } from 'lucide-react';
import {
  type MajorCity,
  getEsriTileUrl,
  getGoogleMapsStreetViewUrl,
  latLngToEsriTile,
} from '../data/cities';
import { glassClass } from '../game/performance';
import type { EffectiveTier, Language } from '../game/types';
import type { Translations } from '../i18n/translations';

export function CityReconModal({
  city,
  onClose,
  lang,
  t,
  effectiveTier,
}: {
  city: MajorCity | null;
  onClose: () => void;
  lang: Language;
  t: Translations;
  effectiveTier: EffectiveTier;
}) {
  const [zoom, setZoom] = useState<12 | 14>(14);
  const [failedTiles, setFailedTiles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setFailedTiles({});
  }, [city?.id, zoom]);

  if (!city) return null;

  const centerTile = latLngToEsriTile(city.lat, city.lng, zoom);
  const streetViewUrl = getGoogleMapsStreetViewUrl(city.lat, city.lng);

  // 3x2 Esri World Imagery mosaic around centerTile
  const cols = [-1, 0, 1];
  const rows = [0, 1];

  return (
    <div
      data-testid="city-recon-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-recon-title"
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${glassClass(effectiveTier)}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/90 bg-slate-950/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg border border-sky-400/50 bg-sky-500/15 flex items-center justify-center text-sky-300 shrink-0">
              <Satellite size={18} />
            </div>
            <div className="min-w-0">
              <h2
                id="city-recon-title"
                className="font-display text-base sm:text-lg font-extrabold text-white truncate flex items-center gap-2"
              >
                <span>{city.name}</span>
                <span className="text-[10px] font-mono-num font-bold px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-300">
                  {city.lat.toFixed(4)}°, {city.lng.toFixed(4)}°
                </span>
              </h2>
              <p className="text-xs text-slate-300 truncate">{city.strategicRole[lang]}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto gs-scroll">
          {/* Option 1: Built-in Satellite Recon View (100% Free Esri World Imagery XYZ) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 border-b border-slate-800/80 bg-slate-900/70 text-xs">
              <div className="flex items-center gap-2 font-bold text-sky-300">
                <Satellite size={14} />
                <span>
                  {lang === 'pl'
                    ? 'Opcja 1 · Zwiad Satelitarny (Esri World Imagery)'
                    : 'Option 1 · Live Satellite Recon (Esri World Imagery)'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoom(12)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10.5px] font-mono-num font-bold cursor-pointer ${
                    zoom === 12
                      ? 'bg-sky-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <ZoomOut size={11} />
                  Sector (z12)
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(14)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10.5px] font-mono-num font-bold cursor-pointer ${
                    zoom === 14
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <ZoomIn size={11} />
                  Urban (z14)
                </button>
              </div>
            </div>

            <div className="relative w-full aspect-[3/2] bg-[#070E1D] overflow-hidden select-none">
              <div className="grid grid-cols-3 grid-rows-2 w-full h-full">
                {rows.map((dy) =>
                  cols.map((dx) => {
                    const tx = centerTile.x + dx;
                    const ty = centerTile.y + dy;
                    const key = `${zoom}_${tx}_${ty}`;
                    const url = getEsriTileUrl(zoom, tx, ty);
                    const hasFailed = failedTiles[key];
                    return (
                      <div key={key} className="relative w-full h-full border border-slate-800/20 overflow-hidden">
                        {!hasFailed ? (
                          <img
                            src={url}
                            alt={`${city.name} aerial tile ${tx},${ty}`}
                            className="w-full h-full object-cover"
                            loading="eager"
                            onError={() =>
                              setFailedTiles((prev) => ({
                                ...prev,
                                [key]: true,
                              }))
                            }
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12),rgba(5,9,20,0.95))] text-[10px] font-mono-num text-slate-400">
                            <MapPin size={14} className="text-sky-400/70 mb-1" />
                            <span>SECTOR {tx}:{ty}</span>
                          </div>
                        )}
                      </div>
                    );
                  }),
                )}
              </div>

              {/* Tactical Crosshair Reticle Overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative flex items-center justify-center -translate-y-8">
                  <div className="h-14 w-14 rounded-full border border-amber-400/70 bg-amber-400/5" />
                  <Crosshair size={22} className="absolute text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
                </div>
              </div>

              {/* Bottom Telemetry Strip */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 px-3 py-1.5 bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-transparent flex items-center justify-between text-[10.5px] font-mono-num text-slate-200">
                <span className="inline-flex items-center gap-1.5">
                  <Users size={11} className="text-emerald-400" />
                  Metro Pop: {city.populationLabel}
                </span>
                <span className="text-sky-300">FREE PUBLIC IMAGERY · ZERO API KEY</span>
              </div>
            </div>
          </div>

          {/* Option 2: Direct External Google Maps Live Street View Deep-Link (<a> tag, zero window.open) */}
          <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-200 space-y-0.5">
              <div className="font-bold text-emerald-300">
                {lang === 'pl'
                  ? 'Opcja 2 · Podgląd Uliczny 360° (Google Maps Street View)'
                  : 'Option 2 · Interactive 360° Ground Recon (Google Maps Street View)'}
              </div>
              <div className="text-[11px] text-slate-300">
                {lang === 'pl'
                  ? `Otwiera bezpośrednią panoramę Street View dla miasta ${city.name} bez klucza API.`
                  : `Opens free live Street View panorama centered on ${city.name} with zero API key or watermarks.`}
              </div>
            </div>

            <a
              data-testid="street-view-link"
              href={streetViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold whitespace-nowrap shadow-md transition-colors shrink-0"
            >
              <span>🌍 Open Live Street View (Google Maps)</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
