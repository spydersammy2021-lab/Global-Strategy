import React, { useState } from 'react';
import { FolderOpen, Save, Trash2, X } from 'lucide-react';
import { deleteGameSlot, loadSavesForAccount, saveGameSlot } from '../game/account';
import { computeCountrySummaries } from '../game/combat';
import { glassClass } from '../game/performance';
import type { BlocksAccount, EffectiveTier, GameState, SaveSlot } from '../game/types';
import type { Translations } from '../i18n/translations';

export function SaveLoadModal({
  isOpen,
  onClose,
  account,
  currentState,
  onLoadState,
  t,
  effectiveTier = 'ultra',
}: {
  isOpen: boolean;
  onClose: () => void;
  account: BlocksAccount;
  currentState: GameState | null;
  onLoadState: (loaded: GameState) => void;
  t: Translations;
  effectiveTier?: EffectiveTier;
}) {
  const [saves, setSaves] = useState<SaveSlot[]>(() => loadSavesForAccount(account.id));
  const [saveLabel, setSaveLabel] = useState('');

  if (!isOpen) return null;

  const refresh = () => setSaves(loadSavesForAccount(account.id));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentState) return;
    const allSums = computeCountrySummaries(currentState);
    const sum = allSums[currentState.playerCountryId];
    const topLeader = Object.values(allSums).sort((a, b) => b.areaKm2 - a.areaKm2)[0];
    const isSpectator = currentState.gameMode === 'bot_spectator';
    const countryName = isSpectator
      ? t.botModeLabel
      : currentState.countries[currentState.playerCountryId]?.displayName ?? 'Campaign';
    const label = saveLabel.trim() || `${countryName} · ${currentState.year} (T${currentState.turn})`;

    const slot: SaveSlot = {
      id: `save_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      accountId: account.id,
      label,
      scenarioId: currentState.scenarioId,
      playerCountryId: currentState.playerCountryId,
      turn: currentState.turn,
      year: currentState.year,
      areaKm2: sum?.areaKm2 ?? topLeader?.areaKm2 ?? 0,
      savedAt: Date.now(),
      state: currentState,
    };
    saveGameSlot(slot);
    setSaveLabel('');
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteGameSlot(id);
    refresh();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saveload-title"
    >
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${glassClass(
          effectiveTier,
        )}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div>
            <h2 id="saveload-title" className="font-display text-base font-bold text-white">
              {currentState ? t.saveGame : t.loadGame}
            </h2>
            <div className="text-[11px] text-slate-400 font-mono-num">
              {account.nickname} ({account.id})
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto gs-scroll">
          {currentState && (
            <form onSubmit={handleSave} className="flex gap-2">
              <input
                type="text"
                value={saveLabel}
                onChange={(e) => setSaveLabel(e.target.value)}
                placeholder={t.saveLabelPlaceholder}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                <Save size={14} />
                {t.saveGame}
              </button>
            </form>
          )}

          {saves.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-center text-xs text-slate-400">
              {t.noSaves}
            </div>
          ) : (
            <div className="space-y-2">
              {saves.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{slot.label}</div>
                    <div className="text-[11px] text-slate-400 font-mono-num">
                      {slot.scenarioId} · {t.turn} {slot.turn} · {slot.areaKm2.toLocaleString('pl-PL')} km²
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadState(slot.state);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold cursor-pointer"
                    >
                      <FolderOpen size={13} />
                      {t.loadSlot}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(slot.id)}
                      aria-label={`${t.deleteSlot} ${slot.label}`}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-900 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
