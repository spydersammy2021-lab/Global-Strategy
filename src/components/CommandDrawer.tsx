import React, { useMemo, useState } from 'react';
import {
  Award,
  Briefcase,
  CheckCircle2,
  Coins,
  Crown,
  Flame,
  Globe2,
  Hammer,
  Palette,
  Rocket,
  Satellite,
  ScrollText,
  Shield,
  Swords,
  X,
} from 'lucide-react';
import { APEX_PRESTIGE_COST, APEX_VIRTUAL_PLN_COST } from '../game/account';
import { relationKey } from '../game/ai';
import { computeCountryMonthlyBudget, getCountryProvinceCount, getCountryTotalArmy } from '../game/engine';
import { SPACE_DESTINATIONS } from '../game/scenarios';
import type {
  ApexPremiumState,
  CustomUnitBlueprint,
  GameState,
  GeneralTrait,
  Language,
  MapVisualTheme,
} from '../game/types';
import type { Translations } from '../i18n/translations';
import { FlagCrest } from './BlocksRoyalEmblem';
import type { DockSection } from './LeftDock';

export function CommandDrawer({
  section,
  state,
  selectedProvinceId,
  apexPremium,
  lang,
  t,
  onClose,
  onChangeTaxRate,
  onTakeLoan,
  onToggleBorderAutoDefense,
  onRecruitGeneral,
  onAssignGeneral,
  onDesignUnit,
  onSellArms,
  onDeclareWar,
  onProposePeace,
  onProposeAlliance,
  onLaunchSpySatellite,
  onLaunchMissile,
  onToggleStrait,
  onBuildSpaceColony,
  onRedeemApex,
  onSelectTheme,
}: {
  section: DockSection | null;
  state: GameState;
  selectedProvinceId: string | null;
  apexPremium: ApexPremiumState;
  lang: Language;
  t: Translations;
  onClose: () => void;
  onChangeTaxRate: (r: number) => void;
  onTakeLoan: () => void;
  onToggleBorderAutoDefense: () => void;
  onRecruitGeneral: (trait: GeneralTrait, name?: string) => void;
  onAssignGeneral: (genId: string, provId: string | null) => void;
  onDesignUnit: (spec: { name: string; chassis: CustomUnitBlueprint['chassis']; firepower: number; armor: number; speed: number; stealth: number }) => void;
  onSellArms: (buyerId: string, bpId: string, qty: number) => void;
  onDeclareWar: (targetId: string) => void;
  onProposePeace: (targetId: string) => void;
  onProposeAlliance: (targetId: string) => void;
  onLaunchSpySatellite: (targetId: string) => void;
  onLaunchMissile: (provId: string, isNuke: boolean) => void;
  onToggleStrait: (straitId: string) => void;
  onBuildSpaceColony: (destId: string) => void;
  onRedeemApex: (method: 'code' | 'prestige' | 'pln', code?: string) => { ok: boolean; error?: string };
  onSelectTheme: (theme: MapVisualTheme) => void;
}) {
  const [genTrait, setGenTrait] = useState<GeneralTrait>('blitzkrieg_master');
  const [bpName, setBpName] = useState('Royal Apex Mk-IV');
  const [bpChassis, setBpChassis] = useState<CustomUnitBlueprint['chassis']>('tank');
  const [bpFire, setBpFire] = useState(8);
  const [bpArmor, setBpArmor] = useState(7);
  const [bpSpeed, setBpSpeed] = useState(7);
  const [bpStealth, setBpStealth] = useState(4);
  const [giftCodeInput, setGiftCodeInput] = useState('');
  const [apexMsg, setApexMsg] = useState<string | null>(null);
  const [armsBuyerId, setArmsBuyerId] = useState<string>('C_250');
  const [armsQty, setArmsQty] = useState(2);
  const [diploTargetId, setDiploTargetId] = useState<string>('C_112');

  const player = state.countries[state.playerCountryId];
  const budget = useMemo(() => computeCountryMonthlyBudget(state, state.playerCountryId), [state]);
  const selectedProv = selectedProvinceId ? state.provinces[selectedProvinceId] : null;
  const effectiveDiploId =
    selectedProv && selectedProv.ownerId !== state.playerCountryId ? selectedProv.ownerId : diploTargetId;
  const diploTarget = state.countries[effectiveDiploId];
  const diploRel = diploTarget ? state.relations[relationKey(state.playerCountryId, diploTarget.id)] : undefined;

  const leaderboard = useMemo(() => {
    return Object.values(state.countries)
      .filter((c) => !c.eliminated)
      .map((c) => ({
        country: c,
        provs: getCountryProvinceCount(state, c.id),
        army: getCountryTotalArmy(state, c.id),
      }))
      .sort((a, b) => b.provs * 5000 + b.army - (a.provs * 5000 + a.army))
      .slice(0, 12);
  }, [state]);

  if (!section || !player) return null;

  const myGenerals = state.generals.filter((g) => g.countryId === player.id);
  const myBlueprints = state.customBlueprints.filter((b) => b.ownerId === player.id);
  const otherCountries = Object.values(state.countries).filter((c) => c.id !== player.id && !c.eliminated);

  return (
    <aside
      data-testid={`drawer-${section}`}
      className="hidden md:flex fixed left-[72px] top-[66px] bottom-[38px] w-[340px] z-30 flex-col rounded-2xl royal-glass overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/75">
        <div className="font-display font-bold text-sm text-amber-300 flex items-center gap-2 uppercase tracking-wide">
          {section === 'budget' && <><Coins size={15} /> {t.dockBudget} & Resources</>}
          {section === 'military' && <><Swords size={15} /> {t.dockMilitary} Command</>}
          {section === 'generals' && <><Award size={15} /> {t.dockGenerals}</>}
          {section === 'designer' && <><Hammer size={15} /> {t.dockDesigner}</>}
          {section === 'diplomacy' && <><Globe2 size={15} /> {t.dockDiplomacy} & Straits</>}
          {section === 'arms_market' && <><Briefcase size={15} /> {t.dockArmsMarket}</>}
          {section === 'space' && <><Rocket size={15} /> {t.dockSpace}</>}
          {section === 'apex_premium' && <><Crown size={15} /> Blocks™ Apex Premium</>}
          {section === 'chronicle' && <><ScrollText size={15} /> {t.dockChronicle}</>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto gs-scroll p-3.5 space-y-3 text-xs">
        {/* 1. BUDGET & STRATEGIC RESOURCES */}
        {section === 'budget' && (
          <>
            <div className="p-3 rounded-xl bg-slate-950/75 border border-slate-800 space-y-1.5 font-mono-num">
              <div className="flex justify-between"><span className="text-slate-400">Tax Income</span><span className="text-emerald-300">+{budget.taxes} PLN</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Industry & Farms</span><span className="text-emerald-300">+{budget.industry} PLN</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Maritime & Trade</span><span className="text-sky-300">+{budget.trade} PLN</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Space & Orbit</span><span className="text-amber-300">+{budget.spaceIncome} PLN</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Army Upkeep</span><span className="text-rose-300">-{budget.armyUpkeep} PLN</span></div>
              <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold text-sm">
                <span className="text-white">Net / Month</span>
                <span className={budget.net >= 0 ? 'text-emerald-300' : 'text-rose-400'}>
                  {budget.net >= 0 ? '+' : ''}{budget.net} PLN
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/75 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-200">Tax Rate</span>
                <span className="font-mono-num font-bold text-amber-300">{Math.round(player.taxRate * 100)}%</span>
              </div>
              <input
                type="range"
                min={6}
                max={36}
                value={Math.round(player.taxRate * 100)}
                onChange={(e) => onChangeTaxRate(Number(e.target.value) / 100)}
                className="w-full accent-amber-400"
              />
              <button
                type="button"
                onClick={onTakeLoan}
                className="w-full py-2 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-200 font-bold hover:bg-amber-500/30 cursor-pointer"
              >
                State Bank Virtual Bond (+60 PLN)
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/75 border border-slate-800 space-y-2">
              <div className="font-bold text-amber-300 uppercase text-[11px]">Strategic Resources</div>
              <div className="grid grid-cols-2 gap-2 font-mono-num">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">🛢️ Oil: {Math.round(player.resources.oil)}</div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">⚙️ Steel: {Math.round(player.resources.steel)}</div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">☢️ Uranium: {Math.round(player.resources.uranium)}</div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">💎 Rare Earths: {Math.round(player.resources.rare_earths)}</div>
              </div>
            </div>
          </>
        )}

        {/* 2. MILITARY COMMAND */}
        {section === 'military' && (
          <>
            <div className="p-3 rounded-xl bg-slate-950/75 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Reserve Border Auto-Defense</div>
                <div className="text-[11px] text-slate-400">Auto-reinforces threatened borders</div>
              </div>
              <button
                type="button"
                onClick={onToggleBorderAutoDefense}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                  state.borderAutoDefense ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {state.borderAutoDefense ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/75 border border-slate-800 space-y-2">
              <div className="font-bold text-amber-300">Active Marches & Airlifts ({state.marches.filter((m) => m.countryId === player.id).length})</div>
              {state.marches.filter((m) => m.countryId === player.id).length === 0 ? (
                <p className="text-slate-400">Select a friendly province below and click March or 🪂 Paradrop to issue orders.</p>
              ) : (
                state.marches
                  .filter((m) => m.countryId === player.id)
                  .map((m) => (
                    <div key={m.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <span>
                        {m.isParatroop ? '🪂 ' : m.isAirlift ? '✈️ ' : m.isArmoredTrain ? '🚆 ' : '⚔️ '}
                        {state.provinces[m.fromProvinceId]?.name} → {state.provinces[m.toProvinceId]?.name}
                      </span>
                      <span className="font-mono-num text-amber-300 font-bold">{(m.troops / 1000).toFixed(1)}k</span>
                    </div>
                  ))
              )}
            </div>
          </>
        )}

        {/* 3. GENERALS & COMMANDERS */}
        {section === 'generals' && (
          <>
            <div className="p-3 rounded-xl bg-slate-950/75 border border-slate-800 space-y-2">
              <div className="font-bold text-amber-300">Recruit Commander (24 PLN)</div>
              <select
                value={genTrait}
                onChange={(e) => setGenTrait(e.target.value as GeneralTrait)}
                className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
              >
                <option value="blitzkrieg_master">⚡ Blitzkrieg Master (+16% Attack)</option>
                <option value="fortress_defender">🛡️ Fortress Defender (+20% Defense)</option>
                <option value="winter_specialist">❄️ Winter Specialist (+25% Cold Defense)</option>
              </select>
              <button
                type="button"
                data-testid="recruit-general-btn"
                onClick={() => onRecruitGeneral(genTrait)}
                className="w-full py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold cursor-pointer"
              >
                Commission General (24 PLN)
              </button>
            </div>

            <div className="space-y-2">
              {myGenerals.map((g) => (
                <div key={g.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{g.name}</span>
                    <span className="font-mono-num text-amber-300 font-bold">Lv.{g.level}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Trait: <span className="text-sky-300">{g.trait.replace('_', ' ')}</span> · XP: {g.xp} · Wins: {g.battlesWon}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-300">
                      Post: {g.assignedProvinceId ? state.provinces[g.assignedProvinceId]?.name : 'Reserve HQ'}
                    </span>
                    {selectedProv && selectedProv.ownerId === player.id && (
                      <button
                        type="button"
                        onClick={() => onAssignGeneral(g.id, selectedProv.id)}
                        className="px-2 py-1 rounded bg-sky-500/20 border border-sky-400/50 text-sky-200 text-[10px] font-bold cursor-pointer"
                      >
                        Assign to {selectedProv.name}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 4. CUSTOM UNIT DESIGNER */}
        {section === 'designer' && (
          <>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="font-bold text-amber-300">Tank / Jet / Ship Blueprint (15 PLN)</div>
              <input
                type="text"
                value={bpName}
                onChange={(e) => setBpName(e.target.value)}
                placeholder="Model name"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
              />
              <div className="grid grid-cols-4 gap-1">
                {(['tank', 'jet', 'ship', 'mech'] as const).map((ch) => {
                  const locked = ch === 'mech' && !apexPremium.unlocked;
                  return (
                    <button
                      key={ch}
                      type="button"
                      disabled={locked}
                      onClick={() => setBpChassis(ch)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold uppercase cursor-pointer disabled:opacity-40 ${
                        bpChassis === ch ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                    >
                      {ch === 'mech' ? '👑 Mech' : ch}
                    </button>
                  );
                })}
              </div>

              {[
                { label: 'Firepower', val: bpFire, set: setBpFire },
                { label: 'Armor', val: bpArmor, set: setBpArmor },
                { label: 'Speed', val: bpSpeed, set: setBpSpeed },
                { label: 'Stealth', val: bpStealth, set: setBpStealth },
              ].map((stat) => (
                <div key={stat.label} className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">{stat.label}</span>
                    <span className="font-mono-num text-amber-300 font-bold">{stat.val}/10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={stat.val}
                    onChange={(e) => stat.set(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
              ))}

              <button
                type="button"
                data-testid="forge-unit-btn"
                onClick={() =>
                  onDesignUnit({
                    name: bpName,
                    chassis: bpChassis,
                    firepower: bpFire,
                    armor: bpArmor,
                    speed: bpSpeed,
                    stealth: bpStealth,
                  })
                }
                className="w-full py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold cursor-pointer"
              >
                Forge Blueprint (15 PLN)
              </button>
            </div>

            <div className="space-y-1.5">
              {myBlueprints.map((bp) => (
                <div key={bp.id} className="p-2.5 rounded-xl bg-slate-950/75 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">{bp.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase">{bp.chassis} · Export +{bp.exportPrice} PLN · Sold {bp.unitsSold}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 5. DIPLOMACY, SPY SATELLITES, MISSILES & STRAITS */}
        {section === 'diplomacy' && (
          <>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-amber-300 uppercase">Target Nation</div>
              <select
                value={effectiveDiploId}
                onChange={(e) => setDiploTargetId(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
              >
                {otherCountries.slice(0, 60).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({getCountryTotalArmy(state, c.id).toLocaleString()} troops)
                  </option>
                ))}
              </select>

              {diploTarget && (
                <>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <FlagCrest code={diploTarget.flagCode} fallbackColor={diploTarget.color} name={diploTarget.name} width={28} height={19} />
                      <div>
                        <div className="font-bold text-white">{diploTarget.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {diploRel?.atWar ? '⚔️ AT WAR' : diploRel?.alliance ? '🤝 ALLY' : 'Neutral'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {!diploRel?.atWar ? (
                      <button
                        type="button"
                        data-testid="declare-war-btn"
                        onClick={() => onDeclareWar(diploTarget.id)}
                        className="py-2 px-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                      >
                        Declare War
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onProposePeace(diploTarget.id)}
                        className="py-2 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                      >
                        Propose Peace
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onProposeAlliance(diploTarget.id)}
                      className="py-2 px-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer"
                    >
                      Form Alliance
                    </button>
                    <button
                      type="button"
                      data-testid="launch-spy-sat-btn"
                      onClick={() => onLaunchSpySatellite(diploTarget.id)}
                      className="py-2 px-2 rounded-lg bg-slate-900 border border-sky-400/40 text-sky-200 font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Satellite size={12} /> Spy Sat (22)
                    </button>
                    <button
                      type="button"
                      onClick={() => onLaunchMissile(diploTarget.capitalProvinceId, false)}
                      className="py-2 px-2 rounded-lg bg-slate-900 border border-rose-400/40 text-rose-200 font-bold cursor-pointer"
                    >
                      🚀 Missile (20)
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Shield size={13} /> Maritime Strait Blockades (15 PLN)
              </div>
              {state.straits.map((st) => {
                const blockedByMe = st.blockerCountryId === player.id;
                return (
                  <div key={st.id} className="flex items-center justify-between py-1 border-b border-slate-800/70 last:border-0">
                    <span className="text-[11px] text-slate-200">{st.name}</span>
                    <button
                      type="button"
                      onClick={() => onToggleStrait(st.id)}
                      className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                        blockedByMe
                          ? 'bg-rose-500 text-white'
                          : st.blockerCountryId
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-slate-900 border border-amber-400/40 text-amber-200'
                      }`}
                    >
                      {blockedByMe ? 'Lift Blockade' : st.blockerCountryId ? 'Blocked' : 'Blockade'}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* 6. GLOBAL ARMS EXPORT MARKET */}
        {section === 'arms_market' && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="font-bold text-amber-300">Global Arms Export Market</div>
            <p className="text-[11px] text-slate-300">
              Sell custom-forged Tanks, Jets & Ships to allied/neutral nations for Virtual PLN & Prestige!
            </p>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Buyer Nation</label>
              <select
                value={armsBuyerId}
                onChange={(e) => setArmsBuyerId(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
              >
                {otherCountries.slice(0, 40).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Export Batch Size</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 5].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setArmsQty(q)}
                    className={`py-1.5 rounded-lg border font-mono-num font-bold cursor-pointer ${
                      armsQty === q ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    {q}x Batch
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 pt-1">
              {myBlueprints.map((bp) => (
                <div key={bp.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-white">{bp.name}</div>
                    <div className="text-[10px] text-emerald-300 font-mono-num">
                      +{bp.exportPrice * armsQty} PLN · Steel -{armsQty * 2}
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid={`sell-arms-${bp.id}`}
                    onClick={() => onSellArms(armsBuyerId, bp.id, armsQty)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold cursor-pointer shrink-0"
                  >
                    Export
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. SPACE & OCEAN CONQUEST */}
        {section === 'space' && (
          <div className="space-y-2">
            {SPACE_DESTINATIONS.map((dest) => {
              const built = player.spaceColonies.includes(dest.id);
              const lockedVip = Boolean(dest.isPremiumExclusive && !apexPremium.unlocked);
              const lowTech = player.logLevel < dest.requiredLogLevel;
              return (
                <div key={dest.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{dest.name[lang]}</span>
                    <span className="font-mono-num text-amber-300 font-bold">{dest.costPln} PLN</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{dest.summary[lang]}</p>
                  <button
                    type="button"
                    disabled={built || lockedVip || lowTech}
                    onClick={() => onBuildSpaceColony(dest.id)}
                    className={`w-full py-1.5 rounded-lg font-bold text-xs cursor-pointer disabled:opacity-45 ${
                      built
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                    }`}
                  >
                    {built
                      ? 'Operational'
                      : lockedVip
                        ? 'Requires Free Apex Premium'
                        : lowTech
                          ? `Requires Logistics Lv.${dest.requiredLogLevel}`
                          : 'Launch Mission'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* 8. 100% FREE VIRTUAL BLOCKS™ APEX PREMIUM HUB */}
        {section === 'apex_premium' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/50 space-y-1.5">
              <div className="font-bold text-amber-200 flex items-center gap-1.5 text-sm">
                <Crown size={15} /> 100% Free Virtual Apex Premium
              </div>
              <p className="text-[11px] text-amber-100/90 leading-relaxed">{t.apexZeroRealMoneyNotice}</p>
            </div>

            {!apexPremium.unlocked ? (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="font-bold text-white">Unlock Immediately (Zero Payment Cards!):</div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={giftCodeInput}
                    onChange={(e) => setGiftCodeInput(e.target.value)}
                    placeholder="Gift code: BLOCKS2026 or APEXFREE"
                    data-testid="apex-code-input"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono-num text-xs"
                  />
                  <button
                    type="button"
                    data-testid="apex-redeem-code-btn"
                    onClick={() => {
                      const res = onRedeemApex('code', giftCodeInput);
                      setApexMsg(res.ok ? '👑 Apex Premium Unlocked!' : res.error ?? 'Invalid code');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold cursor-pointer"
                  >
                    Redeem
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const res = onRedeemApex('prestige');
                      setApexMsg(res.ok ? '👑 Unlocked with Prestige!' : res.error ?? 'Not enough Prestige');
                    }}
                    className="py-2 rounded-lg bg-slate-900 border border-amber-400/40 text-amber-200 font-bold cursor-pointer"
                  >
                    {APEX_PRESTIGE_COST} Prestige
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const res = onRedeemApex('pln');
                      setApexMsg(res.ok ? '👑 Unlocked with Virtual PLN!' : res.error ?? 'Not enough Virtual PLN');
                    }}
                    className="py-2 rounded-lg bg-slate-900 border border-emerald-400/40 text-emerald-200 font-bold cursor-pointer"
                  >
                    {APEX_VIRTUAL_PLN_COST} Virtual PLN
                  </button>
                </div>
                {apexMsg && <div className="text-[11px] font-semibold text-amber-300">{apexMsg}</div>}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/40 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <CheckCircle2 size={15} /> VIP Crown Active · ⚡ 10x Speed · Sci-Fi Units Unlocked
                </div>
                <div className="font-bold text-white text-[11px] flex items-center gap-1 pt-1">
                  <Palette size={13} className="text-amber-300" /> Select Exclusive Map Theme:
                </div>
                <div className="space-y-1">
                  {(
                    [
                      { id: 'royal_obsidian', label: 'Royal Obsidian & Gold' },
                      { id: 'cyber_neon', label: 'Cyber-Tactical Neon' },
                      { id: 'ancient_parchment', label: 'Ancient Parchment Atlas' },
                    ] as const
                  ).map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      data-testid={`theme-${th.id}`}
                      onClick={() => onSelectTheme(th.id)}
                      className={`w-full py-2 px-3 rounded-lg border text-left font-bold cursor-pointer ${
                        apexPremium.activeTheme === th.id
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-900 border-slate-700 text-slate-200'
                      }`}
                    >
                      {th.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 9. LIVING WORLD CHRONICLE & LEADERBOARD */}
        {section === 'chronicle' && (
          <>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Flame size={13} /> World Superpowers
              </div>
              {leaderboard.map((row, idx) => (
                <div key={row.country.id} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                  <span className="text-slate-200 truncate">
                    #{idx + 1} {row.country.isPlayer && apexPremium.unlocked ? '👑 ' : ''}{row.country.name}
                  </span>
                  <span className="font-mono-num text-[11px] text-amber-300 shrink-0">
                    {row.provs}P · {(row.army / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="font-bold text-sky-300">Living World Chronicle</div>
              {state.chronicle.slice(0, 12).map((ch) => (
                <div key={ch.id} className="text-[11px] border-b border-slate-800/60 pb-1 last:border-0">
                  <span className="font-mono-num text-amber-300 mr-1.5">{ch.dateLabel}</span>
                  <span className="text-slate-200">{ch.headline}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
