import React, { useState } from 'react';
import {
  Bot,
  Crown,
  FlaskConical,
  Globe2,
  MapPin,
  MoreHorizontal,
  Pause,
  Play,
  Settings,
  Swords,
  X,
} from 'lucide-react';
import { formatGameDate, getCountryTotalArmy } from '../game/engine';
import type { ApexPremiumState, GameState, MapOverlayMode } from '../game/types';
import type { Translations } from '../i18n/translations';
import { FlagCrest } from './BlocksRoyalEmblem';
import type { DockSection } from './LeftDock';

export function MobileHud({
  state,
  selectedProvinceId,
  apexPremium,
  overlayMode,
  t,
  onTogglePause,
  onToggleAutoPilot,
  onCycleOverlay,
  onOpenSettings,
  onOpenTechTree,
  onRecruitQuick,
  onToggleMarch,
  onOpenSection,
}: {
  state: GameState;
  selectedProvinceId: string | null;
  apexPremium: ApexPremiumState;
  overlayMode: MapOverlayMode;
  t: Translations;
  onTogglePause: () => void;
  onToggleAutoPilot: () => void;
  onCycleOverlay: () => void;
  onOpenSettings: () => void;
  onOpenTechTree: () => void;
  onRecruitQuick: (pid: string) => void;
  onToggleMarch: () => void;
  onOpenSection: (sec: DockSection) => void;
}) {
  const [sheetTab, setSheetTab] = useState<'empire' | 'province' | 'war' | null>(null);
  const player = state.countries[state.playerCountryId];
  if (!player) return null;
  const prov = selectedProvinceId ? state.provinces[selectedProvinceId] : null;
  const totalArmy = getCountryTotalArmy(state, player.id);

  return (
    <div className="md:hidden fixed inset-0 pointer-events-none z-30">
      {/* Compact Single-Row Mobile Top Bar (< 56px, staying within 15% sticky cap) */}
      <header className="pointer-events-auto h-[52px] mx-2 mt-2 px-2.5 rounded-xl royal-glass flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <FlagCrest code={player.flagCode} fallbackColor={player.color} name={player.name} width={26} height={18} vipCrown={apexPremium.unlocked} />
          <div className="leading-tight min-w-0">
            <div className="text-[11px] font-bold text-white truncate">{player.name}</div>
            <div className="font-mono-num text-[10px] text-amber-300 whitespace-nowrap">
              {Math.round(player.treasury)} PLN · {Math.round(totalArmy / 1000)}k
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onCycleOverlay}
            aria-label="Map overlay"
            className="min-h-[38px] min-w-[38px] px-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-200 flex items-center justify-center text-[10px] font-bold"
          >
            <Globe2 size={14} />
          </button>
          <button
            type="button"
            onClick={onToggleAutoPilot}
            aria-label={t.autoPilotToggle}
            className={`min-h-[38px] min-w-[38px] px-2 rounded-lg border flex items-center justify-center text-[10px] font-bold ${
              state.autoPilotEnabled || state.difficulty === 'world_conquest'
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            <Bot size={14} />
          </button>
          <button
            type="button"
            onClick={onTogglePause}
            aria-label={t.pauseHint}
            className={`min-h-[38px] min-w-[38px] rounded-lg flex items-center justify-center ${
              state.paused ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 border border-slate-700 text-white'
            }`}
          >
            {state.paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label={t.settings}
            className="min-h-[38px] min-w-[38px] rounded-lg bg-slate-900 border border-slate-700 text-slate-200 flex items-center justify-center"
          >
            <Settings size={14} />
          </button>
        </div>
      </header>

      {/* Slide-Up Thumb Drawer */}
      {sheetTab && (
        <div className="pointer-events-auto fixed left-2 right-2 bottom-[66px] max-h-[55vh] rounded-2xl royal-glass p-3.5 overflow-y-auto gs-scroll space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-display font-bold text-sm text-amber-300 uppercase">
              {sheetTab === 'empire' ? 'Empire Telemetry' : sheetTab === 'province' ? prov?.name ?? 'Province' : 'Warfare & Tech'}
            </span>
            <button type="button" onClick={() => setSheetTab(null)} aria-label={t.close} className="p-1 text-slate-400">
              <X size={16} />
            </button>
          </div>

          {sheetTab === 'empire' && (
            <div className="grid grid-cols-2 gap-2 text-xs font-mono-num">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">Date: {formatGameDate(state.startYear, state.day)}</div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">RP: {Math.round(player.researchPoints)}</div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">Stability: {player.stability}%</div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">Overlay: {overlayMode}</div>
              <button
                type="button"
                onClick={() => {
                  setSheetTab(null);
                  onOpenSection('apex_premium');
                }}
                className="col-span-2 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center gap-1.5"
              >
                <Crown size={14} /> Free Apex Premium Hub
              </button>
            </div>
          )}

          {sheetTab === 'province' && prov && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-mono-num">
                <span>{prov.cityName}</span>
                <span className="text-amber-300">⚔️ {prov.army.toLocaleString()} · 🌡️ {prov.currentTempC}°C</span>
              </div>
              {prov.ownerId === player.id && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onRecruitQuick(prov.id)}
                    className="py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold"
                  >
                    +3k Troops
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSheetTab(null);
                      onToggleMarch();
                    }}
                    className="py-2.5 rounded-xl bg-rose-600 text-white font-bold"
                  >
                    March / Attack
                  </button>
                </div>
              )}
            </div>
          )}

          {sheetTab === 'war' && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSheetTab(null);
                  onOpenTechTree();
                }}
                className="py-2.5 rounded-xl bg-sky-500/20 border border-sky-400/50 text-sky-200 font-bold flex items-center justify-center gap-1.5"
              >
                <FlaskConical size={14} /> Tech Tree
              </button>
              <button
                type="button"
                onClick={() => {
                  setSheetTab(null);
                  onToggleMarch();
                }}
                className="py-2.5 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center gap-1.5"
              >
                <Swords size={14} /> Attack Mode
              </button>
            </div>
          )}
        </div>
      )}

      {/* Thumb-Friendly Bottom Tab Bar (56px) */}
      <nav className="pointer-events-auto fixed bottom-0 left-0 right-0 h-[56px] bg-slate-950/95 border-t border-amber-400/25 grid grid-cols-4 items-center">
        <button
          type="button"
          onClick={() => setSheetTab(sheetTab === 'empire' ? null : 'empire')}
          className="h-full flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-200"
        >
          <Crown size={18} className="text-amber-300" />
          <span>Empire</span>
        </button>
        <button
          type="button"
          onClick={() => setSheetTab(sheetTab === 'province' ? null : 'province')}
          className="h-full flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-200"
        >
          <MapPin size={18} className="text-emerald-300" />
          <span>Province</span>
        </button>
        <button
          type="button"
          onClick={() => setSheetTab(sheetTab === 'war' ? null : 'war')}
          className="h-full flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-200"
        >
          <Swords size={18} className="text-rose-400" />
          <span>Warfare</span>
        </button>
        <button
          type="button"
          onClick={onOpenTechTree}
          className="h-full flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-200"
        >
          <MoreHorizontal size={18} className="text-sky-300" />
          <span>Tech Tree</span>
        </button>
      </nav>
    </div>
  );
}
