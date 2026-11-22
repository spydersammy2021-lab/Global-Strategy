import React, { useMemo, useState } from 'react';
import { Check, Flag, MapPin, Palette, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { CULTURE_LABELS, RELIGION_LABELS } from '../data/leadersAndDemographics';
import { buildWorldMapData } from '../game/mapGen';
import { glassClass } from '../game/performance';
import type {
  CultureId,
  CustomNationConfig,
  EffectiveTier,
  FlagEmblemKind,
  FlagPattern,
  IdeologyId,
  Language,
  ReligionId,
} from '../game/types';
import { IDEOLOGY_NAMES, type Translations } from '../i18n/translations';
import { FlagBadge } from './FlagBadge';

const PRESET_COLORS = [
  '#E11D48',
  '#F59E0B',
  '#10B981',
  '#0EA5E9',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
];

const LAYOUT_OPTIONS: Array<{ id: NonNullable<FlagPattern['layout']>; label: string }> = [
  { id: 'bicolor_h', label: 'Horizontal 2' },
  { id: 'bicolor_v', label: 'Vertical 2' },
  { id: 'tricolor_h', label: 'Tricolor H' },
  { id: 'tricolor_v', label: 'Tricolor V' },
  { id: 'nordic', label: 'Nordic Cross' },
  { id: 'cross', label: 'Cross' },
  { id: 'diagonal', label: 'Diagonal' },
  { id: 'stripes', label: 'Stripes' },
  { id: 'solid', label: 'Banner Solid' },
];

const EMBLEM_OPTIONS: Array<{ id: FlagEmblemKind; label: string }> = [
  { id: 'none', label: 'None' },
  { id: 'eagle_crown', label: 'Royal Crest' },
  { id: 'star_center', label: 'Solar Star' },
  { id: 'crescent_star', label: 'Crescent' },
  { id: 'swiss_cross', label: 'Civic Cross' },
  { id: 'ukraine_trident', label: 'Trident' },
  { id: 'antarctica_compass', label: 'Polar Star' },
];

const IDEOLOGY_LIST: IdeologyId[] = ['republic', 'democracy', 'monarchy', 'technocracy', 'autocracy'];

export function CustomNationModal({
  isOpen,
  onClose,
  initialValue,
  onSaveNation,
  t,
  lang,
  effectiveTier = 'ultra',
}: {
  isOpen: boolean;
  onClose: () => void;
  initialValue: CustomNationConfig | null;
  onSaveNation: (cfg: CustomNationConfig | null) => void;
  t: Translations;
  lang: Language;
  effectiveTier?: EffectiveTier;
}) {
  const mapData = useMemo(() => buildWorldMapData(), []);

  const [name, setName] = useState(initialValue?.name ?? 'Baltic-Vistula Union');
  const [capitalName, setCapitalName] = useState(initialValue?.capitalName ?? 'Gdynia');
  const [ideology, setIdeology] = useState<IdeologyId>(initialValue?.ideology ?? 'republic');
  const [colorHex, setColorHex] = useState(initialValue?.colorHex ?? '#06B6D4');
  const [religion, setReligion] = useState<ReligionId>(initialValue?.religion ?? 'catholic');
  const [culture, setCulture] = useState<CultureId>(initialValue?.culture ?? 'west_slavic');
  const [selectedProvs, setSelectedProvs] = useState<string[]>(
    initialValue?.provinceIds?.length ? initialValue.provinceIds : ['616_p10', '616_p13'],
  );
  const [provQuery, setProvQuery] = useState('');

  const [layout, setLayout] = useState<NonNullable<FlagPattern['layout']>>(
    initialValue?.flag.layout ?? 'tricolor_h',
  );
  const [c1, setC1] = useState(initialValue?.flag.colors[0] ?? '#0EA5E9');
  const [c2, setC2] = useState(initialValue?.flag.colors[1] ?? '#FFFFFF');
  const [c3, setC3] = useState(initialValue?.flag.colors[2] ?? '#0F172A');
  const [emblemKind, setEmblemKind] = useState<FlagEmblemKind>(
    initialValue?.flag.emblemKind ?? 'eagle_crown',
  );
  const [customDataUrl, setCustomDataUrl] = useState<string | undefined>(
    initialValue?.flag.customDataUrl,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  const filteredProvinces = useMemo(() => {
    const q = provQuery.trim().toLowerCase();
    const list = mapData.provinces;
    if (!q) return list.slice(0, 48);
    return list
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (p.capitalCity ?? '').toLowerCase().includes(q),
      )
      .slice(0, 60);
  }, [mapData.provinces, provQuery]);

  if (!isOpen) return null;

  const previewFlag: FlagPattern = {
    layout,
    colors: [c1, c2, c3],
    emblemKind,
    emblemColor: '#FACC15',
    customDataUrl,
  };

  const toggleProv = (pid: string) => {
    setSelectedProvs((prev) =>
      prev.includes(pid) ? (prev.length > 1 ? prev.filter((x) => x !== pid) : prev) : [...prev, pid],
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (file.size > 512 * 1024) {
      setUploadError('Image exceeds 512 KB limit — pick a smaller PNG, JPG, or SVG.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || 'Custom Republic';
    const cleanCap = capitalName.trim() || 'New Capital';
    const cfg: CustomNationConfig = {
      id: initialValue?.id ?? '999',
      name: cleanName,
      capitalName: cleanCap,
      ideology,
      colorHex,
      flag: previewFlag,
      provinceIds: selectedProvs.length > 0 ? selectedProvs : ['616_p10'],
      religion,
      culture,
    };
    onSaveNation(cfg);
    onClose();
  };

  return (
    <div
      data-testid="custom-nation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-nation-title"
    >
      <form
        onSubmit={handleSave}
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${glassClass(
          effectiveTier,
        )}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/75">
          <div className="flex items-center gap-2.5">
            <Flag size={18} className="text-amber-400" />
            <div>
              <h2 id="custom-nation-title" className="font-display text-base sm:text-lg font-extrabold text-white">
                {t.customNationBtn}
              </h2>
              <div className="text-[11px] text-slate-400">
                Design your custom sovereign state, flag emblem or PNG/JPG/SVG upload, and starting provinces.
              </div>
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

        <div className="p-5 overflow-y-auto gs-scroll grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
          {/* Left Column: Nation Identity & Flag Creator */}
          <div className="lg:col-span-6 space-y-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10.5px] font-bold uppercase text-slate-400 mb-1">
                  Nation Name
                </label>
                <input
                  type="text"
                  data-testid="custom-nation-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={32}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-bold uppercase text-slate-400 mb-1">
                  Capital City
                </label>
                <input
                  type="text"
                  data-testid="custom-nation-capital-input"
                  value={capitalName}
                  onChange={(e) => setCapitalName(e.target.value)}
                  maxLength={24}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10.5px] font-bold uppercase text-slate-400 mb-1">
                  Ideology
                </label>
                <select
                  value={ideology}
                  onChange={(e) => setIdeology(e.target.value as IdeologyId)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white focus:border-amber-400 focus:outline-none"
                >
                  {IDEOLOGY_LIST.map((idg) => (
                    <option key={idg} value={idg}>
                      {IDEOLOGY_NAMES[lang][idg]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10.5px] font-bold uppercase text-slate-400 mb-1">
                  Religion
                </label>
                <select
                  value={religion}
                  onChange={(e) => setReligion(e.target.value as ReligionId)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white focus:border-amber-400 focus:outline-none"
                >
                  {(Object.keys(RELIGION_LABELS) as ReligionId[]).map((rid) => (
                    <option key={rid} value={rid}>
                      {RELIGION_LABELS[rid].name[lang]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10.5px] font-bold uppercase text-slate-400 mb-1">
                  Culture
                </label>
                <select
                  value={culture}
                  onChange={(e) => setCulture(e.target.value as CultureId)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white focus:border-amber-400 focus:outline-none"
                >
                  {(Object.keys(CULTURE_LABELS) as CultureId[]).map((cid) => (
                    <option key={cid} value={cid}>
                      {CULTURE_LABELS[cid].name[lang]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Map Color Swatches */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Palette size={13} className="text-amber-400" /> Map Territory Color
                </span>
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  aria-label="Custom map color"
                  className="h-6 w-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColorHex(hex)}
                    style={{ backgroundColor: hex }}
                    aria-label={`Color ${hex}`}
                    className={`h-6 w-6 rounded-md border cursor-pointer ${
                      colorHex === hex ? 'border-white scale-110 ring-2 ring-amber-400' : 'border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Flag Studio & Upload */}
            <div className="rounded-xl border border-amber-500/35 bg-slate-950/70 p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FlagBadge flag={previewFlag} label={name} width={84} height={56} className="border-amber-400/50" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-400" /> Custom Flag Creator
                    </div>
                    <div className="text-[10.5px] text-slate-400">
                      Build vector flag or upload PNG / JPG / SVG
                    </div>
                  </div>
                </div>

                {customDataUrl && (
                  <button
                    type="button"
                    onClick={() => setCustomDataUrl(undefined)}
                    className="px-2 py-1 rounded border border-rose-500/40 bg-rose-500/15 text-[10px] font-bold text-rose-200 cursor-pointer"
                  >
                    Use Pattern
                  </button>
                )}
              </div>

              <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-dashed border-sky-400/55 bg-sky-500/10 hover:bg-sky-500/20 text-sky-200 font-bold cursor-pointer">
                <Upload size={14} />
                <span>Upload PNG / JPG / SVG Flag</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadError && <div className="text-[11px] text-rose-300 font-semibold">{uploadError}</div>}

              {!customDataUrl && (
                <div className="space-y-2.5 pt-1 border-t border-slate-800/80">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={layout}
                      onChange={(e) => setLayout(e.target.value as NonNullable<FlagPattern['layout']>)}
                      aria-label="Flag pattern"
                      className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-white"
                    >
                      {LAYOUT_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={emblemKind}
                      onChange={(e) => setEmblemKind(e.target.value as FlagEmblemKind)}
                      aria-label="Flag emblem"
                      className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-white"
                    >
                      {EMBLEM_OPTIONS.map((emb) => (
                        <option key={emb.id} value={emb.id}>
                          {emb.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center justify-between px-2 py-1 rounded border border-slate-800 bg-slate-900">
                      <span className="text-slate-300">Primary</span>
                      <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} className="h-5 w-7 cursor-pointer bg-transparent border-0" />
                    </label>
                    <label className="flex items-center justify-between px-2 py-1 rounded border border-slate-800 bg-slate-900">
                      <span className="text-slate-300">Band 2</span>
                      <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} className="h-5 w-7 cursor-pointer bg-transparent border-0" />
                    </label>
                    <label className="flex items-center justify-between px-2 py-1 rounded border border-slate-800 bg-slate-900">
                      <span className="text-slate-300">Band 3</span>
                      <input type="color" value={c3} onChange={(e) => setC3(e.target.value)} className="h-5 w-7 cursor-pointer bg-transparent border-0" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Starting Provinces Multi-Selector */}
          <div className="lg:col-span-6 flex flex-col gap-2.5 min-h-[280px]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <MapPin size={14} /> Claimed Starting Provinces ({selectedProvs.length})
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedProvs(['616_p10', '616_p13', '616_p14'])}
                  className="px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-[10px] text-slate-300 hover:text-white cursor-pointer"
                >
                  Pomerania
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProvs(['010_arctowski', '010_concordia'])}
                  className="px-2 py-0.5 rounded border border-sky-500/40 bg-sky-950/60 text-[10px] text-sky-200 hover:text-white cursor-pointer"
                >
                  Antarctica
                </button>
              </div>
            </div>

            <input
              type="text"
              value={provQuery}
              onChange={(e) => setProvQuery(e.target.value)}
              placeholder="Search province or city (e.g. Mazowieckie, Berlin, Arctowski)..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
            />

            <div className="flex-1 max-h-[265px] overflow-y-auto gs-scroll grid grid-cols-1 sm:grid-cols-2 gap-1.5 pr-1">
              {filteredProvinces.map((p) => {
                const picked = selectedProvs.includes(p.id);
                const origName = mapData.countryMetas[p.countryOrigId]?.name[lang] ?? p.countryOrigId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProv(p.id)}
                    className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border text-left cursor-pointer ${
                      picked
                        ? 'border-amber-400 bg-amber-500/20 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {origName} ·{' '}
                        {Math.round(
                          (p.explicitAreaKm2 ??
                            (mapData.countryMetas[p.countryOrigId]?.areaKm2 ?? 25000) * p.areaShare) /
                            1000,
                        )}
                        k km²
                      </div>
                    </div>
                    {picked && <Check size={14} className="text-amber-300 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-800/80 bg-slate-950/75">
          {initialValue ? (
            <button
              type="button"
              onClick={() => {
                onSaveNation(null);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/40 bg-rose-500/15 text-xs font-bold text-rose-200 cursor-pointer"
            >
              <Trash2 size={14} /> Clear Custom Nation
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">
              Launching with a Custom Nation puts your new state under direct command.
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              {t.close}
            </button>
            <button
              type="submit"
              data-testid="save-custom-nation-btn"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold cursor-pointer"
            >
              <Check size={14} /> Save & Activate Nation
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
