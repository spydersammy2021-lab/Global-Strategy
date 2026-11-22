import React from 'react';
import { Bot, Minus, Plus, Crosshair, Maximize2, Volume2 } from 'lucide-react';
import type { GameState } from '../game/types';
import type { Translations } from '../i18n/translations';

export function RightAdvisorPanel({
  state,
  voiceEnabled,
  onToggleVoice,
  onSpeakBriefing,
  onZoomIn,
  onZoomOut,
  onCenterCapital,
  onResetWorld,
  t,
}: {
  state: GameState;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onSpeakBriefing: (msg: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterCapital: () => void;
  onResetWorld: () => void;
  t: Translations;
}) {
  const player = state.countries[state.playerCountryId];
  const atWarCount = Object.values(state.relations).filter((r) => r.atWar).length;

  const tipTitle =
    state.difficulty === 'world_conquest'
      ? 'World Conquest Active'
      : atWarCount > 0
        ? 'Active Frontlines'
        : player && player.researchPoints >= 20
          ? 'Tech Breakthrough Ready'
          : 'Day/Night Tactical Intel';

  const tipBody =
    state.difficulty === 'world_conquest'
      ? 'Autonomous Conquest AI is mobilizing border forces and airlifting troops every 5 seconds.'
      : atWarCount > 0
        ? 'Use Paratroopers behind enemy lines for -30% encirclement bonus, or unlock Night-Vision Optics for night strikes!'
        : player && player.researchPoints >= 20
          ? 'Open the Tech Tree to research Combined Arms or Night-Vision Optics.'
          : 'Build Railways for 3x Armored Train speed or export custom tanks on the Global Arms Market.';

  return (
    <div className="hidden md:flex fixed right-3 top-[66px] bottom-[38px] w-[264px] z-20 flex-col justify-between items-end pointer-events-none">
      {/* Map Camera Zoom Controls */}
      <div className="pointer-events-auto flex flex-col gap-1 p-1 rounded-xl royal-glass">
        <button type="button" onClick={onZoomIn} aria-label="Zoom in" className="p-2 rounded-lg text-slate-200 hover:bg-slate-800 cursor-pointer">
          <Plus size={15} />
        </button>
        <button type="button" onClick={onZoomOut} aria-label="Zoom out" className="p-2 rounded-lg text-slate-200 hover:bg-slate-800 cursor-pointer">
          <Minus size={15} />
        </button>
        <button type="button" onClick={onCenterCapital} aria-label="Center capital" className="p-2 rounded-lg text-amber-300 hover:bg-slate-800 cursor-pointer">
          <Crosshair size={15} />
        </button>
        <button type="button" onClick={onResetWorld} aria-label="Reset world view" className="p-2 rounded-lg text-slate-200 hover:bg-slate-800 cursor-pointer">
          <Maximize2 size={15} />
        </button>
      </div>

      {/* Speaking Tactical AI Advisor Card */}
      <div className="pointer-events-auto w-full rounded-2xl royal-glass p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] font-bold text-sky-300 flex items-center gap-1.5">
            <Bot size={14} /> Blocks™ Tactical AI
          </div>
          <button
            type="button"
            data-testid="advisor-voice-toggle"
            onClick={onToggleVoice}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
              voiceEnabled ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {voiceEnabled ? t.voiceOn : t.voiceOff}
          </button>
        </div>

        <div className="text-xs font-bold text-white">{tipTitle}</div>
        <p className="text-[11px] text-slate-300 leading-relaxed">{tipBody}</p>

        <button
          type="button"
          data-testid="speak-briefing-btn"
          onClick={() => onSpeakBriefing(`${tipTitle}. ${tipBody}`)}
          className="w-full py-1.5 rounded-lg bg-slate-900 border border-sky-400/40 text-sky-200 text-[11px] font-bold inline-flex items-center justify-center gap-1.5 hover:bg-slate-800 cursor-pointer"
        >
          <Volume2 size={13} />
          {t.speakBriefing}
        </button>
      </div>
    </div>
  );
}
