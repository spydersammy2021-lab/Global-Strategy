import React, { useState } from 'react';
import {
  Anchor,
  Building2,
  Camera,
  Factory,
  Moon,
  Plane,
  Radio,
  Rocket,
  Shield,
  ShieldAlert,
  Swords,
  TrainFront,
  Wheat,
  Wrench,
  X,
} from 'lucide-react';
import { isProvinceInNightZone } from '../game/combat';
import { BUILDING_COSTS, UNIT_COSTS_PER_1K } from '../game/engine';
import type { BuildingType, GameState, UnitType } from '../game/types';
import type { Translations } from '../i18n/translations';

const BUILDING_DEFS: { id: BuildingType; label: string; icon: React.ReactNode }[] = [
  { id: 'farm', label: 'Farm', icon: <Wheat size={13} /> },
  { id: 'factory', label: 'Factory', icon: <Factory size={13} /> },
  { id: 'barracks', label: 'Barracks', icon: <Building2 size={13} /> },
  { id: 'fort', label: 'Fort', icon: <Shield size={13} /> },
  { id: 'railway', label: 'Railway (3x)', icon: <TrainFront size={13} /> },
  { id: 'airfield', label: 'Airfield', icon: <Plane size={13} /> },
  { id: 'port', label: 'Naval Port', icon: <Anchor size={13} /> },
  { id: 'iron_dome', label: 'Iron Dome', icon: <ShieldAlert size={13} /> },
  { id: 'missile_silo', label: 'Missile Silo', icon: <Rocket size={13} /> },
];

export function ProvinceDock({
  state,
  selectedProvinceId,
  hasDrawerOpen,
  marchMode,
  paradropMode,
  apexUnlocked,
  t,
  onCloseProvince,
  onConstructBuilding,
  onRecruit,
  onToggleMarchMode,
  onToggleParadropMode,
  onAssimilate,
  onRebuildCity,
  onOpenCityRecon,
}: {
  state: GameState;
  selectedProvinceId: string | null;
  hasDrawerOpen: boolean;
  marchMode: boolean;
  paradropMode: boolean;
  apexUnlocked: boolean;
  t: Translations;
  onCloseProvince: () => void;
  onConstructBuilding: (pid: string, b: BuildingType) => void;
  onRecruit: (pid: string, unitType: UnitType, amount: number) => void;
  onToggleMarchMode: () => void;
  onToggleParadropMode: () => void;
  onAssimilate: (pid: string) => void;
  onRebuildCity: (pid: string) => void;
  onOpenCityRecon: (pid: string) => void;
}) {
  const [unitType, setUnitType] = useState<UnitType>('infantry');
  const [batchAmount, setBatchAmount] = useState<number>(3000);

  const prov = selectedProvinceId ? state.provinces[selectedProvinceId] : null;
  const isOwned = prov?.ownerId === state.playerCountryId;
  const owner = prov ? state.countries[prov.ownerId] : null;
  const inNight = prov ? isProvinceInNightZone(prov.lonLat[0], state.solarLongitudeDeg) : false;

  const latestNews = state.newsTicker[0]?.text ?? 'Royal Apex Command telemetry active.';

  return (
    <div className="hidden md:block fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
      {/* Province Inspector & Buildings Dock */}
      {prov && (
        <div
          className={`pointer-events-auto mb-8 mx-auto rounded-2xl royal-glass px-4 py-2.5 transition-all ${
            hasDrawerOpen ? 'ml-[424px] mr-[292px]' : 'ml-[80px] mr-[292px]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-white text-sm">
                {prov.name} · {prov.isCapital ? '👑 ' : ''}{prov.cityName}
              </span>
              <span className="text-slate-400">({owner?.name})</span>
              <span className="font-mono-num text-amber-300 font-bold">⚔️ {prov.army.toLocaleString()}</span>
              <span className="font-mono-num text-cyan-200">🌡️ {prov.currentTempC}°C</span>
              <span className="text-emerald-300 uppercase text-[10px] font-bold">{prov.resource.replace('_', ' ')}</span>
              {inNight && (
                <span className="inline-flex items-center gap-1 text-[10px] text-indigo-300 font-semibold">
                  <Moon size={11} /> Night Zone
                </span>
              )}
              {prov.encircled && (
                <span className="text-[10px] text-rose-400 font-bold">⚠️ Encircled (-30% Def)</span>
              )}
              {isOwned && !prov.assimilated && (
                <button
                  type="button"
                  onClick={() => onAssimilate(prov.id)}
                  className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-200 text-[10px] font-bold cursor-pointer"
                >
                  {t.assimilateBtn}
                </button>
              )}
              {isOwned && prov.cityDamaged && (
                <button
                  type="button"
                  data-testid="rebuild-city-btn"
                  onClick={() => onRebuildCity(prov.id)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-[10px] font-bold cursor-pointer"
                >
                  <Wrench size={11} />
                  {t.rebuildCityBtn}
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-testid="city-recon-btn"
                onClick={() => onOpenCityRecon(prov.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-400/40 text-sky-200 text-[11px] font-semibold cursor-pointer whitespace-nowrap"
              >
                <Camera size={12} />
                {t.cityReconBtn}
              </button>
              <button
                type="button"
                onClick={onCloseProvince}
                aria-label={t.close}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {isOwned && (
            <div className={`pt-2 flex ${hasDrawerOpen ? 'flex-col gap-2' : 'flex-wrap items-center justify-between gap-2'}`}>
              {/* 9 Building Slots */}
              <div className="flex flex-wrap items-center gap-1">
                {BUILDING_DEFS.map((b) => {
                  const built = prov.buildings.includes(b.id);
                  const disabled = built || (b.id === 'port' && !prov.isCoastal);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      disabled={disabled}
                      data-testid={`build-${b.id}`}
                      title={`${b.label} (${BUILDING_COSTS[b.id]} PLN)`}
                      onClick={() => onConstructBuilding(prov.id, b.id)}
                      className={`h-8 px-2 rounded-lg border text-[10px] font-mono-num inline-flex items-center gap-1 cursor-pointer disabled:cursor-default ${
                        built
                          ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                          : disabled
                            ? 'bg-slate-950/40 border-slate-800/50 text-slate-600'
                            : 'bg-slate-950/85 border-slate-700 text-slate-200 hover:border-amber-400'
                      }`}
                    >
                      {b.icon}
                      <span className="hidden xl:inline">{b.label}</span>
                      {!built && <span className="text-amber-300">{BUILDING_COSTS[b.id]}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Unit Recruitment + March / Paradrop Controls */}
              <div className="flex flex-wrap items-center gap-1.5">
                <select
                  aria-label="Unit Type"
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value as UnitType)}
                  className="h-8 px-2 rounded-lg bg-slate-950/90 border border-slate-700 text-xs text-white"
                >
                  <option value="infantry">Infantry ({UNIT_COSTS_PER_1K.infantry}/1k)</option>
                  <option value="tank">Main Battle Tanks ({UNIT_COSTS_PER_1K.tank}/1k)</option>
                  <option value="artillery">Rocket Artillery ({UNIT_COSTS_PER_1K.artillery}/1k)</option>
                  <option value="armored_train">Armored Train ({UNIT_COSTS_PER_1K.armored_train}/1k)</option>
                  <option value="paratrooper">Paratroopers ({UNIT_COSTS_PER_1K.paratrooper}/1k)</option>
                  {apexUnlocked && (
                    <>
                      <option value="combat_mech">👑 Combat Mechs ({UNIT_COSTS_PER_1K.combat_mech}/1k)</option>
                      <option value="orbital_bomber">👑 Orbital Bomber ({UNIT_COSTS_PER_1K.orbital_bomber}/1k)</option>
                      <option value="titan_outpost">👑 Titan Outpost ({UNIT_COSTS_PER_1K.titan_outpost}/1k)</option>
                    </>
                  )}
                </select>

                {[1000, 3000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBatchAmount(amt)}
                    className={`h-8 px-2 rounded-lg border text-[11px] font-mono-num font-bold cursor-pointer ${
                      batchAmount === amt
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-slate-950/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    {amt / 1000}k
                  </button>
                ))}

                <button
                  type="button"
                  data-testid="recruit-unit-btn"
                  onClick={() => onRecruit(prov.id, unitType, batchAmount)}
                  className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold cursor-pointer whitespace-nowrap"
                >
                  + {t.recruitBtn}
                </button>

                <button
                  type="button"
                  data-testid="march-mode-btn"
                  onClick={onToggleMarchMode}
                  className={`h-8 px-3 rounded-lg border text-xs font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                    marchMode
                      ? 'bg-rose-500 text-white border-rose-300'
                      : 'bg-slate-900 border-amber-400/50 text-amber-200 hover:bg-slate-800'
                  }`}
                >
                  <Swords size={13} />
                  {marchMode ? 'Select Target' : t.marchBtn}
                </button>

                <button
                  type="button"
                  data-testid="paradrop-mode-btn"
                  onClick={onToggleParadropMode}
                  className={`h-8 px-2.5 rounded-lg border text-xs font-bold cursor-pointer whitespace-nowrap ${
                    paradropMode
                      ? 'bg-sky-500 text-slate-950 border-sky-300'
                      : 'bg-slate-900 border-sky-400/40 text-sky-300 hover:bg-slate-800'
                  }`}
                >
                  🪂 {t.paradropBtn}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pinned Global News Ticker along bottom edge */}
      <div className="pointer-events-auto h-7 bg-slate-950/92 border-t border-amber-400/20 px-4 flex items-center gap-3 text-[11px] text-slate-200">
        <span className="inline-flex items-center gap-1 font-mono-num text-[10px] font-bold text-amber-300 uppercase shrink-0">
          <Radio size={11} /> World Wire
        </span>
        <span className="truncate">{latestNews}</span>
      </div>
    </div>
  );
}
