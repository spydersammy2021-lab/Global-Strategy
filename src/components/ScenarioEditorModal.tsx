import React, { useMemo, useState } from 'react';
import { FolderPlus, Play, Plus, Save, Swords, Trash2, Users, X } from 'lucide-react';
import { buildWorldMapData } from '../game/mapGen';
import { glassClass } from '../game/performance';
import type {
  CustomScenarioConfig,
  EffectiveTier,
  Language,
  ScenarioId,
} from '../game/types';
import { SCENARIO_TEXT, type Translations } from '../i18n/translations';

const CUSTOM_SCENARIO_KEY = 'blocks_gs_custom_scenarios_v1';

export function loadCustomScenarios(): CustomScenarioConfig[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SCENARIO_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomScenario(cfg: CustomScenarioConfig): CustomScenarioConfig[] {
  const list = loadCustomScenarios().filter((s) => s.id !== cfg.id);
  const next = [cfg, ...list].slice(0, 12);
  try {
    localStorage.setItem(CUSTOM_SCENARIO_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function deleteCustomScenario(id: string): CustomScenarioConfig[] {
  const next = loadCustomScenarios().filter((s) => s.id !== id);
  try {
    localStorage.setItem(CUSTOM_SCENARIO_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function ScenarioEditorModal({
  isOpen,
  onClose,
  baseScenarioId,
  onLaunchCustom,
  t,
  lang,
  effectiveTier = 'ultra',
}: {
  isOpen: boolean;
  onClose: () => void;
  baseScenarioId: ScenarioId;
  onLaunchCustom: (cfg: CustomScenarioConfig) => void;
  t: Translations;
  lang: Language;
  effectiveTier?: EffectiveTier;
}) {
  const mapData = useMemo(() => buildWorldMapData(), []);
  const countryOptions = useMemo(
    () =>
      Object.values(mapData.countryMetas).sort((a, b) =>
        a.name[lang].localeCompare(b.name[lang]),
      ),
    [mapData, lang],
  );

  const [name, setName] = useState('Custom World Order 2026');
  const [baseId, setBaseId] = useState<ScenarioId>(baseScenarioId);
  const [selectedProvId, setSelectedProvId] = useState('616_p0');
  const [targetOwnerId, setTargetOwnerId] = useState('616');
  const [provOverrides, setProvOverrides] = useState<Record<string, string>>({});
  const [treasuryOverrides, setTreasuryOverrides] = useState<Record<string, number>>({});
  const [armyMultipliers, setArmyMultipliers] = useState<Record<string, number>>({});
  const [editCountryId, setEditCountryId] = useState('616');
  const [wars, setWars] = useState<Array<[string, string]>>([]);
  const [alliances, setAlliances] = useState<Array<[string, string]>>([]);
  const [pairA, setPairA] = useState('616');
  const [pairB, setPairB] = useState('276');
  const [savedList, setSavedList] = useState<CustomScenarioConfig[]>(() =>
    loadCustomScenarios(),
  );

  if (!isOpen) return null;

  const buildConfig = (): CustomScenarioConfig => ({
    id: `cust_${Date.now()}`,
    name: name.trim() || 'Custom Scenario',
    baseScenarioId: baseId,
    provinceOwnerOverrides: { ...provOverrides },
    treasuryOverrides: { ...treasuryOverrides },
    armyMultipliers: { ...armyMultipliers },
    wars: [...wars],
    alliances: [...alliances],
    createdAt: Date.now(),
  });

  const handleSave = () => {
    const cfg = buildConfig();
    setSavedList(saveCustomScenario(cfg));
  };

  return (
    <div
      data-testid="scenario-editor-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scenario-editor-title"
    >
      <div
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${glassClass(
          effectiveTier,
        )}`}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/75">
          <div className="flex items-center gap-2.5">
            <FolderPlus size={18} className="text-amber-400" />
            <h2 id="scenario-editor-title" className="font-display text-base sm:text-lg font-bold text-white">
              {t.scenarioEditorBtn} — Sandbox Creator
            </h2>
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

        <div className="p-5 overflow-y-auto gs-scroll grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Scenario Metadata & Territory Reassignment */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/65 p-3.5 space-y-2.5">
              <label className="block text-xs font-bold text-slate-300">
                Scenario Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </label>

              <label className="block text-xs font-bold text-slate-300">
                Base Historical Era
                <select
                  value={baseId}
                  onChange={(e) => setBaseId(e.target.value as ScenarioId)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white"
                >
                  {(['2026', '1939', '1918', '1619', '1410', '966'] as ScenarioId[]).map((sid) => (
                    <option key={sid} value={sid}>
                      {SCENARIO_TEXT[lang][sid].title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Reassign Province */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/65 p-3.5 space-y-2.5">
              <div className="text-xs font-bold text-sky-300">Reassign Province Ownership</div>
              <select
                value={selectedProvId}
                onChange={(e) => setSelectedProvId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
              >
                {mapData.provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({mapData.countryMetas[p.countryOrigId]?.name[lang]})
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <select
                  value={targetOwnerId}
                  onChange={(e) => setTargetOwnerId(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                >
                  {countryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name[lang]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setProvOverrides((prev) => ({ ...prev, [selectedProvId]: targetOwnerId }))
                  }
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Assign
                </button>
              </div>
              {Object.keys(provOverrides).length > 0 && (
                <div className="text-[11px] text-emerald-300 font-mono-num">
                  {Object.keys(provOverrides).length} custom border changes queued
                </div>
              )}
            </div>

            {/* Nation Treasury & Army Tuning */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/65 p-3.5 space-y-2.5">
              <div className="text-xs font-bold text-amber-300">Nation Treasury &amp; Army Multiplier</div>
              <select
                value={editCountryId}
                onChange={(e) => setEditCountryId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
              >
                {countryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name[lang]}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] text-slate-300">
                  Start Treasury (PLN)
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    value={treasuryOverrides[editCountryId] ?? 120}
                    onChange={(e) =>
                      setTreasuryOverrides((prev) => ({
                        ...prev,
                        [editCountryId]: Math.max(10, Number(e.target.value)),
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-white font-mono-num"
                  />
                </label>
                <label className="text-[11px] text-slate-300">
                  Army Scale (x)
                  <input
                    type="number"
                    min={0.2}
                    max={5}
                    step={0.2}
                    value={armyMultipliers[editCountryId] ?? 1}
                    onChange={(e) =>
                      setArmyMultipliers((prev) => ({
                        ...prev,
                        [editCountryId]: Math.max(0.2, Math.min(5, Number(e.target.value))),
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-white font-mono-num"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right: Initial Wars / Alliances & Saved Custom Scenarios */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/65 p-3.5 space-y-2.5">
              <div className="text-xs font-bold text-rose-300">Initial Wars &amp; Alliances</div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={pairA}
                  onChange={(e) => setPairA(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white"
                >
                  {countryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name[lang]}
                    </option>
                  ))}
                </select>
                <select
                  value={pairB}
                  onChange={(e) => setPairB(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white"
                >
                  {countryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name[lang]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={pairA === pairB}
                  onClick={() => setWars((w) => [...w, [pairA, pairB]])}
                  className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-xs font-bold text-white cursor-pointer"
                >
                  <Swords size={12} /> Add War
                </button>
                <button
                  type="button"
                  disabled={pairA === pairB}
                  onClick={() => setAlliances((a) => [...a, [pairA, pairB]])}
                  className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-bold text-white cursor-pointer"
                >
                  <Users size={12} /> Add Alliance
                </button>
              </div>
              <div className="text-[11px] text-slate-400 font-mono-num">
                Wars: {wars.length} · Alliances: {alliances.length}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/65 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Saved Custom Scenarios</span>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-[11px] font-bold cursor-pointer"
                >
                  <Save size={12} /> Save Preset
                </button>
              </div>

              {savedList.length === 0 ? (
                <div className="text-xs text-slate-400">No saved presets yet.</div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto gs-scroll">
                  {savedList.map((sc) => (
                    <div
                      key={sc.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{sc.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono-num">
                          Era {sc.baseScenarioId} · {Object.keys(sc.provinceOwnerOverrides).length} borders
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onLaunchCustom(sc)}
                          className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                        >
                          Play
                        </button>
                        <button
                          type="button"
                          onClick={() => setSavedList(deleteCustomScenario(sc.id))}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              data-testid="launch-custom-scenario-btn"
              onClick={() => onLaunchCustom(buildConfig())}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display text-sm font-extrabold cursor-pointer shadow-lg"
            >
              <Play size={16} fill="currentColor" />
              Launch Custom Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
