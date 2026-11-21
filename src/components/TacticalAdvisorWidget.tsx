import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Mic,
  MicOff,
  Power,
  ShieldCheck,
  Sparkles,
  Volume2,
  Waves,
} from 'lucide-react';
import { analyzeTacticalSituation, isSpeechSupported, speakAdvisorLine, stopAdvisorSpeech } from '../game/advisor';
import type { EffectiveTier, GameState, Language } from '../game/types';
import type { Translations } from '../i18n/translations';

export function TacticalAdvisorWidget({
  state,
  enabled,
  onToggle,
  voiceEnabled = true,
  onToggleVoice,
  muted = false,
  lang,
  t,
}: {
  state: GameState;
  enabled: boolean;
  onToggle: () => void;
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
  muted?: boolean;
  lang: Language;
  t: Translations;
  effectiveTier: EffectiveTier;
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastSpokenRef = useRef<string>('');
  const advice = enabled ? analyzeTacticalSituation(state, lang) : null;
  const speechOk = isSpeechSupported();

  const speakCurrent = (headline: string, body: string) => {
    const line = `${headline}. ${body}`;
    speakAdvisorLine(line, {
      lang,
      voiceEnabled,
      muted,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  useEffect(() => {
    if (!enabled || !voiceEnabled || muted || !advice) {
      stopAdvisorSpeech();
      setIsSpeaking(false);
      return;
    }
    const key = `${advice.severity}:${advice.headline}`;
    if (key !== lastSpokenRef.current && (advice.severity === 'critical' || advice.severity === 'warning' || state.autoPilotEnabled)) {
      lastSpokenRef.current = key;
      speakCurrent(advice.headline, advice.body);
    }
    return () => {
      // keep clean unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, voiceEnabled, muted, advice?.headline, advice?.severity, state.autoPilotEnabled]);

  useEffect(() => {
    return () => stopAdvisorSpeech();
  }, []);

  if (!enabled) {
    return (
      <div className="pointer-events-auto absolute bottom-3 right-3 z-20 hidden lg:block">
        <button
          type="button"
          data-testid="advisor-toggle-btn"
          onClick={onToggle}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border aoh-hud-panel text-xs font-bold text-slate-300 hover:text-white hover:border-sky-400/60 cursor-pointer shadow-lg"
        >
          <Bot size={14} className="text-slate-400" />
          <span>{t.advisorTitle}: {t.advisorOff}</span>
          <Power size={12} className="text-sky-400" />
        </button>
      </div>
    );
  }

  const accentBorder =
    advice?.severity === 'critical'
      ? 'border-rose-500/65'
      : advice?.severity === 'warning'
      ? 'border-amber-400/65'
      : advice?.severity === 'opportunity'
      ? 'border-emerald-400/65'
      : 'border-sky-400/45';

  const Icon =
    advice?.severity === 'critical'
      ? AlertTriangle
      : advice?.severity === 'warning'
      ? Waves
      : advice?.severity === 'opportunity'
      ? Sparkles
      : ShieldCheck;

  const iconColor =
    advice?.severity === 'critical'
      ? 'text-rose-400'
      : advice?.severity === 'warning'
      ? 'text-amber-300'
      : advice?.severity === 'opportunity'
      ? 'text-emerald-400'
      : 'text-sky-400';

  return (
    <div
      data-testid="tactical-advisor"
      className={`pointer-events-auto absolute bottom-3 right-3 z-20 hidden xl:block w-72 rounded-xl border p-3 shadow-2xl aoh-hud-panel ${accentBorder}`}
    >
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider text-sky-300">
          <Bot size={13} />
          <span>{t.advisorTitle}</span>
          {/* Animated Soundwave Equalizer */}
          <div
            data-testid="advisor-waveform"
            aria-hidden="true"
            className="flex items-end gap-[2px] h-3.5 px-1"
          >
            {[0, 0.14, 0.28, 0.08].map((delay, idx) => (
              <span
                key={idx}
                className={`w-[2.5px] rounded-full ${
                  isSpeaking
                    ? 'bg-cyan-300 gs-voice-bar h-3.5'
                    : voiceEnabled
                    ? 'bg-sky-500/45 h-1.5'
                    : 'bg-slate-600 h-1'
                }`}
                style={isSpeaking ? { animationDelay: `${delay}s` } : undefined}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onToggleVoice && (
            <button
              type="button"
              data-testid="advisor-voice-toggle"
              onClick={() => {
                if (voiceEnabled) {
                  stopAdvisorSpeech();
                  setIsSpeaking(false);
                }
                onToggleVoice();
              }}
              title={voiceEnabled ? t.voiceOn : t.voiceOff}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9.5px] font-bold cursor-pointer ${
                voiceEnabled && speechOk
                  ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200'
                  : 'border-slate-700 bg-slate-900 text-slate-400'
              }`}
            >
              {voiceEnabled ? <Mic size={9} /> : <MicOff size={9} />}
              <span>{voiceEnabled ? t.voiceOn : t.voiceOff}</span>
            </button>
          )}
          <button
            type="button"
            data-testid="advisor-toggle-btn"
            onClick={onToggle}
            title={t.advisorOff}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-sky-400/40 bg-sky-500/15 hover:bg-sky-500/25 text-[9.5px] font-bold text-sky-200 cursor-pointer"
          >
            <Power size={9} />
            <span>ON</span>
          </button>
        </div>
      </div>

      {advice && (
        <div className="mt-2 space-y-2">
          <div className="flex items-start gap-2">
            <Icon size={14} className={`${iconColor} shrink-0 mt-0.5`} />
            <div className="min-w-0">
              <div className="text-[11.5px] font-bold text-white leading-snug">{advice.headline}</div>
              <p className="text-[10.5px] text-slate-300 leading-snug mt-0.5 line-clamp-3">{advice.body}</p>
            </div>
          </div>

          <button
            type="button"
            data-testid="advisor-speak-btn"
            onClick={() => speakCurrent(advice.headline, advice.body)}
            className="w-full flex items-center justify-center gap-1.5 py-1 rounded border border-sky-500/35 bg-sky-500/10 hover:bg-sky-500/20 text-[10px] font-bold text-sky-200 cursor-pointer"
          >
            <Volume2 size={11} />
            <span>{t.speakBriefing}</span>
          </button>
        </div>
      )}
    </div>
  );
}
