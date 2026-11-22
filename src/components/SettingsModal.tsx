import React from 'react';
import {
  Bot,
  Flame,
  Gauge,
  Globe,
  Layout,
  Mic,
  Monitor,
  ShieldCheck,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AI_AGGRESSIVENESS_CONFIG } from '../data/scenarios';
import { type FpsCap, glassClass } from '../game/performance';
import type {
  AiAggressiveness,
  EffectiveTier,
  Language,
  PerformanceMode,
  UiMode,
} from '../game/types';
import {
  AI_AGGRESSIVENESS_TEXT,
  LANGUAGE_LABELS,
  UI_MODE_TEXT,
  type Translations,
} from '../i18n/translations';

const FPS_OPTIONS: FpsCap[] = [60, 120, 144, 'unlimited'];
const UI_MODES: UiMode[] = ['very_easy', 'easy', 'hard', 'extended', 'ultra_realistic'];
const AI_AGGRS: AiAggressiveness[] = ['friendly', 'normal', 'aggressive', 'hyper'];

export function SettingsModal({
  isOpen,
  onClose,
  lang,
  onChangeLang,
  perfMode,
  onChangePerfMode,
  fpsCap = 'unlimited',
  onChangeFpsCap,
  effectiveTier,
  muted,
  onToggleMute,
  advisorEnabled,
  onToggleAdvisor,
  voiceEnabled = true,
  onToggleVoice,
  uiMode,
  onChangeUiMode,
  peacefulStartEnabled = true,
  onTogglePeacefulStart,
  aiAggressiveness = 'normal',
  onChangeAiAggressiveness,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onChangeLang: (lang: Language) => void;
  perfMode: PerformanceMode;
  onChangePerfMode: (m: PerformanceMode) => void;
  fpsCap?: FpsCap;
  onChangeFpsCap?: (cap: FpsCap) => void;
  effectiveTier: EffectiveTier;
  muted: boolean;
  onToggleMute: () => void;
  advisorEnabled: boolean;
  onToggleAdvisor: () => void;
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
  uiMode: UiMode;
  onChangeUiMode: (mode: UiMode) => void;
  peacefulStartEnabled?: boolean;
  onTogglePeacefulStart?: () => void;
  aiAggressiveness?: AiAggressiveness;
  onChangeAiAggressiveness?: (aggr: AiAggressiveness) => void;
  t: Translations;
}) {
  if (!isOpen) return null;

  return (
    <div
      data-testid="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${glassClass(effectiveTier)}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <h2 id="settings-title" className="font-display text-base font-bold text-white">
            {t.settings} — VERSION 4.0
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto gs-scroll">
          {/* Peaceful Start & War Acceptance Toggle (ON by default) */}
          {onTogglePeacefulStart && (
            <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>{t.peacefulStartLabel}</span>
                </div>
                <button
                  type="button"
                  data-testid="settings-peaceful-start-toggle"
                  onClick={onTogglePeacefulStart}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer shrink-0 ${
                    peacefulStartEnabled
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {peacefulStartEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">{t.peacefulStartDesc}</p>
            </div>
          )}

          {/* AI Aggressiveness Control */}
          {onChangeAiAggressiveness && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
                <Flame size={14} className="text-rose-400" />
                {t.aiAggressivenessLabel}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {AI_AGGRS.map((aggr) => {
                  const active = aiAggressiveness === aggr;
                  const spec = AI_AGGRESSIVENESS_CONFIG[aggr];
                  return (
                    <button
                      key={aggr}
                      type="button"
                      data-testid={`settings-ai-aggr-${aggr}`}
                      onClick={() => onChangeAiAggressiveness(aggr)}
                      style={active ? { borderColor: spec.color } : undefined}
                      className={`py-2 px-2 rounded-lg border text-[11px] font-bold text-center transition-colors cursor-pointer ${
                        active
                          ? 'bg-slate-800 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {AI_AGGRESSIVENESS_TEXT[lang][aggr].label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Frame Rate Limit Selector */}
          {onChangeFpsCap && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
                <Gauge size={14} className="text-cyan-400" />
                {t.fpsLimitLabel}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {FPS_OPTIONS.map((cap) => {
                  const active = fpsCap === cap;
                  return (
                    <button
                      key={String(cap)}
                      type="button"
                      data-testid={`fps-cap-${String(cap)}`}
                      onClick={() => onChangeFpsCap(cap)}
                      className={`py-2 px-2 rounded-lg border text-[11px] font-mono-num font-bold text-center transition-colors cursor-pointer ${
                        active
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {cap === 'unlimited' ? `∞ ${t.fpsUnlimited}` : `${cap} FPS`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5-Tier Visual Interface Mode Switcher */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
              <Layout size={14} className="text-amber-400" />
              {t.uiModeLabel}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {UI_MODES.map((mId) => (
                <button
                  key={mId}
                  type="button"
                  data-testid={`settings-uimode-${mId}`}
                  onClick={() => onChangeUiMode(mId)}
                  className={`py-2 px-2 rounded-lg border text-[11px] font-bold text-center transition-colors cursor-pointer ${
                    uiMode === mId
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {UI_MODE_TEXT[lang][mId]}
                </button>
              ))}
            </div>
          </div>

          {/* Language Switcher */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
              <Globe size={14} className="text-sky-400" />
              {t.languageLabel}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(LANGUAGE_LABELS) as Language[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onChangeLang(code)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold text-left transition-colors cursor-pointer ${
                    lang === code
                      ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {LANGUAGE_LABELS[code]}
                </button>
              ))}
            </div>
          </div>

          {/* Performance Tier Switcher */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
              <Monitor size={14} className="text-emerald-400" />
              {t.performanceMode}
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {(
                [
                  { id: 'auto', label: t.perfAuto },
                  { id: 'ultra', label: t.perfUltra },
                  { id: 'medium', label: t.perfMedium },
                  { id: 'light', label: t.perfLight },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChangePerfMode(m.id)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold text-left transition-colors cursor-pointer ${
                    perfMode === m.id
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tactical AI Advisor Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Bot size={15} className="text-sky-400" />
              {t.advisorLabel}
            </div>
            <button
              type="button"
              onClick={onToggleAdvisor}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                advisorEnabled ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {advisorEnabled ? t.advisorOn : t.advisorOff}
            </button>
          </div>

          {/* Speaking Voice AI Toggle */}
          {onToggleVoice && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Mic size={15} className="text-cyan-400" />
                {t.voiceAiLabel}
              </div>
              <button
                type="button"
                data-testid="settings-voice-toggle"
                onClick={onToggleVoice}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  voiceEnabled ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {voiceEnabled ? t.voiceOn : t.voiceOff}
              </button>
            </div>
          )}

          {/* Sound Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              {muted ? (
                <VolumeX size={15} className="text-rose-400" />
              ) : (
                <Volume2 size={15} className="text-amber-400" />
              )}
              {t.soundLabel}
            </div>
            <button
              type="button"
              onClick={onToggleMute}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                muted ? 'bg-slate-800 text-slate-300' : 'bg-amber-500 text-slate-950'
              }`}
            >
              {muted ? t.soundOff : t.soundOn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
