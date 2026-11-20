import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Coins,
  Globe,
  Landmark,
  Scale,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  CABINET_MINISTERS,
  MEGAPROJECTS,
  WORLD_COUNCIL_RESOLUTIONS,
} from '../data/spaceSectors';
import { TECH_NODE_MAP } from '../data/techTree';
import { glassClass } from '../game/performance';
import type {
  CommodityId,
  EffectiveTier,
  GameState,
  IdeologyId,
  Language,
  MegaprojectId,
  MinisterRole,
} from '../game/types';
import { COMMODITY_NAMES, IDEOLOGY_NAMES, type Translations } from '../i18n/translations';

type TabId = 'cabinet' | 'ideology' | 'council' | 'market' | 'megaprojects';

const IDEOLOGIES: Array<{ id: IdeologyId; desc: Record<'en' | 'pl', string> }> = [
  {
    id: 'democracy',
    desc: { en: '+5% Economy, steady stability & diplomatic trust.', pl: '+5% Gospodarki i wysoka stabilność.' },
  },
  {
    id: 'republic',
    desc: { en: 'Balanced governance and coalition readiness.', pl: 'Zrównoważone rządy i dyplomacja.' },
  },
  {
    id: 'monarchy',
    desc: { en: '+3% Economy & royal legitimacy.', pl: '+3% Gospodarki i legitymacja korony.' },
  },
  {
    id: 'technocracy',
    desc: { en: '+8% Economy & rapid modernization.', pl: '+8% Gospodarki i szybka modernizacja.' },
  },
  {
    id: 'autocracy',
    desc: { en: 'Centralized military command authority.', pl: 'Scentralizowane dowództwo wojskowe.' },
  },
];

const ROLES: Array<{ id: MinisterRole; label: Record<'en' | 'pl', string> }> = [
  { id: 'defense', label: { en: 'Minister of Defense', pl: 'Minister Obrony' } },
  { id: 'finance', label: { en: 'Minister of Finance', pl: 'Minister Finansów' } },
  { id: 'science', label: { en: 'Minister of Science', pl: 'Minister Nauki' } },
  { id: 'intelligence', label: { en: 'Director of Intelligence', pl: 'Szef Wywiadu' } },
];

export function GeopoliticsCouncilModal({
  isOpen,
  onClose,
  state,
  onAppointMinister,
  onChangeIdeology,
  onVoteCouncil,
  onTradeResource,
  onBuildMegaproject,
  t,
  lang,
  effectiveTier = 'ultra',
}: {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
  onAppointMinister: (role: MinisterRole, ministerId: string) => void;
  onChangeIdeology: (ideology: IdeologyId) => void;
  onVoteCouncil: (vote: 'yes' | 'no') => void;
  onTradeResource: (commodity: CommodityId, side: 'buy' | 'sell', qty?: number) => void;
  onBuildMegaproject: (id: MegaprojectId) => void;
  t: Translations;
  lang: Language;
  effectiveTier?: EffectiveTier;
}) {
  const [tab, setTab] = useState<TabId>('cabinet');
  if (!isOpen) return null;

  const player = state.countries[state.playerCountryId];
  if (!player) return null;

  const lk: 'en' | 'pl' = lang === 'pl' ? 'pl' : 'en';
  const activeRes =
    WORLD_COUNCIL_RESOLUTIONS.find((r) => r.id === state.worldCouncil.activeResolutionId) ??
    WORLD_COUNCIL_RESOLUTIONS[0];

  return (
    <div
      data-testid="council-market-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="council-market-title"
    >
      <div
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${glassClass(
          effectiveTier,
        )}`}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/75">
          <div className="flex items-center gap-2.5">
            <Landmark size={18} className="text-amber-400" />
            <h2 id="council-market-title" className="font-display text-base sm:text-lg font-bold text-white">
              {t.councilMarketBtn} — Governance &amp; Economy
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-num font-bold text-amber-300">
              {player.treasury.toFixed(1)} PLN
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-5 border-b border-slate-800/80 bg-slate-950/50 text-[11px] font-bold">
          {(
            [
              { id: 'cabinet', label: 'Cabinet', icon: Briefcase },
              { id: 'ideology', label: 'Ideology', icon: Scale },
              { id: 'council', label: 'World Council', icon: Globe },
              { id: 'market', label: 'Global Market', icon: Coins },
              { id: 'megaprojects', label: 'Megaprojects', icon: Building2 },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`py-2.5 px-2 flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
                  tab === item.id
                    ? 'border-amber-400 bg-slate-900/80 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={13} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto gs-scroll flex-1">
          {tab === 'cabinet' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {ROLES.map((roleObj) => {
                const currentId = player.cabinet[roleObj.id];
                const candidates = CABINET_MINISTERS.filter((m) => m.role === roleObj.id);
                return (
                  <div
                    key={roleObj.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-2.5"
                  >
                    <div className="text-xs font-bold uppercase tracking-wider text-sky-300">
                      {roleObj.label[lk]}
                    </div>
                    <div className="space-y-2">
                      {candidates.map((cand) => {
                        const active = currentId === cand.id;
                        return (
                          <div
                            key={cand.id}
                            className={`flex items-center justify-between gap-2 rounded-lg border p-2.5 ${
                              active
                                ? 'border-emerald-500/60 bg-emerald-500/10'
                                : 'border-slate-800 bg-slate-900/70'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">
                                {cand.name[lang]}
                              </div>
                              <div className="text-[11px] text-emerald-300">{cand.bonusText[lang]}</div>
                            </div>
                            {active ? (
                              <span className="text-[10px] font-bold text-emerald-400 shrink-0">
                                ACTIVE
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={player.treasury < 8}
                                onClick={() => onAppointMinister(roleObj.id, cand.id)}
                                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-[11px] font-bold cursor-pointer shrink-0"
                              >
                                Appoint (8 PLN)
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'ideology' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-300">
                Current Government:{' '}
                <span className="font-bold text-amber-300">{IDEOLOGY_NAMES[lang][player.ideology]}</span>
                {' · '}Next Scheduled Election Day: {player.nextElectionDay}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {IDEOLOGIES.map((idg) => {
                  const active = player.ideology === idg.id;
                  return (
                    <div
                      key={idg.id}
                      className={`rounded-xl border p-3.5 flex items-center justify-between gap-3 ${
                        active
                          ? 'border-amber-400 bg-amber-500/15'
                          : 'border-slate-800 bg-slate-950/65'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold text-white">{IDEOLOGY_NAMES[lang][idg.id]}</div>
                        <div className="text-xs text-slate-300 mt-0.5">{idg.desc[lk]}</div>
                      </div>
                      {active ? (
                        <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                      ) : (
                        <button
                          type="button"
                          disabled={player.treasury < 15}
                          onClick={() => onChangeIdeology(idg.id)}
                          className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 text-xs font-bold cursor-pointer shrink-0"
                        >
                          Reform (15 PLN)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'council' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                    Active World Council Resolution
                  </span>
                  <span className="text-xs font-mono-num text-slate-300">
                    YES: {state.worldCouncil.yesVotes} · NO: {state.worldCouncil.noVotes}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-white">
                  {activeRes.title[lang]}
                </h3>
                <p className="text-xs text-slate-200">{activeRes.effect[lang]}</p>
                {state.worldCouncil.playerVoted ? (
                  <div className="text-xs font-bold text-emerald-300">
                    ✓ Vote Cast: {state.worldCouncil.playerVoted.toUpperCase()}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onVoteCouncil('yes')}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer"
                    >
                      Vote YES
                    </button>
                    <button
                      type="button"
                      onClick={() => onVoteCouncil('no')}
                      className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Vote NO
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-xs font-bold text-slate-300 mb-1.5">
                  Passed Global Treaties ({state.worldCouncil.passedEffects.length})
                </div>
                {state.worldCouncil.passedEffects.length === 0 ? (
                  <div className="text-xs text-slate-400">No active global treaties ratified yet.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {state.worldCouncil.passedEffects.map((eid) => {
                      const r = WORLD_COUNCIL_RESOLUTIONS.find((x) => x.id === eid);
                      return (
                        <span
                          key={eid}
                          className="px-2.5 py-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-200"
                        >
                          ✓ {r?.title[lang] ?? eid}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'market' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(state.globalMarket.prices) as CommodityId[]).map((cid) => {
                  const price = state.globalMarket.prices[cid];
                  const trend = state.globalMarket.trends[cid];
                  const stock = player.stockpiles[cid] ?? 0;
                  const batchCost = Number((price * 5).toFixed(1));
                  return (
                    <div
                      key={cid}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">
                          {COMMODITY_NAMES[lang][cid]}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono-num text-xs font-bold text-amber-300">
                          {trend === 'up' ? (
                            <TrendingUp size={13} className="text-emerald-400" />
                          ) : trend === 'down' ? (
                            <TrendingDown size={13} className="text-rose-400" />
                          ) : null}
                          {price.toFixed(2)} PLN/u
                        </span>
                      </div>
                      <div className="text-xs font-mono-num text-slate-300">
                        Stockpile: <span className="text-sky-300 font-bold">{stock} units</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={player.treasury < batchCost}
                          onClick={() => onTradeResource(cid, 'buy', 5)}
                          className="py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-bold cursor-pointer"
                        >
                          Buy 5 ({batchCost} PLN)
                        </button>
                        <button
                          type="button"
                          disabled={stock < 5}
                          onClick={() => onTradeResource(cid, 'sell', 5)}
                          className="py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-bold cursor-pointer"
                        >
                          Sell 5 (+{batchCost} PLN)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-[11px] text-slate-400">{t.tutorialDisclaimer}</div>
            </div>
          )}

          {tab === 'megaprojects' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {MEGAPROJECTS.map((mp) => {
                const built = player.megaprojects.includes(mp.id);
                const techOk = player.unlockedTechs.includes(mp.requiredTech);
                const reqName = TECH_NODE_MAP[mp.requiredTech]?.title[lang] ?? mp.requiredTech;
                return (
                  <div
                    key={mp.id}
                    className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${
                      built
                        ? 'border-emerald-500/50 bg-emerald-950/25'
                        : 'border-slate-800 bg-slate-950/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-bold text-white">{mp.name[lang]}</div>
                        <span className="text-xs font-mono-num font-bold text-amber-300">
                          {built ? 'BUILT' : `${mp.costPln} PLN`}
                        </span>
                      </div>
                      <div className="text-xs text-emerald-300 mt-1">{mp.effect[lang]}</div>
                      {!built && (
                        <div className="text-[11px] text-slate-400 mt-1.5">
                          Requires Tech:{' '}
                          <span className={techOk ? 'text-emerald-300' : 'text-rose-300'}>
                            {reqName}
                          </span>
                        </div>
                      )}
                    </div>
                    {!built && (
                      <button
                        type="button"
                        disabled={!techOk || player.treasury < mp.costPln}
                        onClick={() => onBuildMegaproject(mp.id)}
                        className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-extrabold cursor-pointer"
                      >
                        Construct Megaproject ({mp.costPln} PLN)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
