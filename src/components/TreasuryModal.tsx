import React from 'react';
import { Coins, Landmark, Percent, TrendingDown, TrendingUp, X } from 'lucide-react';
import { computeDetailedBudget } from '../game/combat';
import { glassClass } from '../game/performance';
import type { EffectiveTier, GameState } from '../game/types';
import type { Translations } from '../i18n/translations';

export function TreasuryModal({
  isOpen,
  onClose,
  state,
  onSetTaxRate,
  onTakeLoan,
  onRepayLoan,
  t,
  effectiveTier = 'ultra',
}: {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
  onSetTaxRate: (taxRate: number) => void;
  onTakeLoan: (amount: 60 | 150) => void;
  onRepayLoan: (loanId: string) => void;
  t: Translations;
  effectiveTier?: EffectiveTier;
}) {
  if (!isOpen) return null;

  const player = state.countries[state.playerCountryId];
  if (!player) return null;
  const budget = computeDetailedBudget(state, state.playerCountryId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="treasury-modal-title"
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${glassClass(
          effectiveTier,
        )}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <Coins size={19} className="text-amber-400" />
            <h2 id="treasury-modal-title" className="font-display text-base font-bold text-white">
              {t.treasuryModalTitle}
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

        <div className="p-5 sm:p-6 overflow-y-auto gs-scroll space-y-5">
          {/* Summary Banner */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">{t.treasury}</div>
              <div className="text-2xl font-bold font-mono-num text-amber-300 mt-0.5">
                {player.treasury.toFixed(1)} PLN
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">{t.netBalanceLabel}</div>
              <div
                className={`text-2xl font-bold font-mono-num mt-0.5 ${
                  budget.netPerTurn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {budget.netPerTurn >= 0 ? '+' : ''}
                {budget.netPerTurn.toFixed(1)} PLN
              </div>
            </div>
          </div>

          {/* Revenues vs Expenses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <TrendingUp size={14} />
                {t.budgetRevenues}
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>{t.taxIncomeLabel}</span>
                <span className="font-mono-num font-bold text-emerald-300">+{budget.taxIncome.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>{t.factoryPortIncomeLabel}</span>
                <span className="font-mono-num font-bold text-emerald-300">+{budget.factoryAndPortIncome.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>{t.tradeIncomeLabel}</span>
                <span className="font-mono-num font-bold text-emerald-300">+{budget.tradeIncome.toFixed(1)}</span>
              </div>
              {budget.vassalTributeIncome > 0 && (
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{t.vassalIncomeLabel}</span>
                  <span className="font-mono-num font-bold text-emerald-300">+{budget.vassalTributeIncome.toFixed(1)}</span>
                </div>
              )}
              {budget.spaceOceanIncome > 0 && (
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{t.spaceIncomeLabel}</span>
                  <span className="font-mono-num font-bold text-cyan-300">+{budget.spaceOceanIncome.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400">
                <TrendingDown size={14} />
                {t.budgetExpenses}
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>{t.armyUpkeepLabel}</span>
                <span className="font-mono-num font-bold text-rose-300">-{budget.armyUpkeep.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>{t.buildingUpkeepLabel}</span>
                <span className="font-mono-num font-bold text-rose-300">-{budget.buildingUpkeep.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>{t.loanPaymentsLabel}</span>
                <span className="font-mono-num font-bold text-rose-300">-{budget.loanPayments.toFixed(1)}</span>
              </div>
              {budget.vassalTributePaid > 0 && (
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{t.vassalPaidLabel}</span>
                  <span className="font-mono-num font-bold text-rose-300">-{budget.vassalTributePaid.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tax Rate Slider */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Percent size={14} className="text-amber-400" />
                {t.taxRateLabel}
              </span>
              <span className="font-mono-num text-sm font-bold text-amber-300">{player.taxRate}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={45}
              step={1}
              value={player.taxRate}
              onChange={(e) => onSetTaxRate(Number(e.target.value))}
              aria-label={t.taxRateLabel}
              className="w-full accent-amber-500 cursor-pointer"
            />
            {player.taxRate > 25 ? (
              <div className="text-[11px] text-rose-300">{t.taxWarningHigh}</div>
            ) : player.taxRate <= 14 ? (
              <div className="text-[11px] text-emerald-300">{t.taxBonusLow}</div>
            ) : (
              <div className="text-[11px] text-slate-400">
                {t.stability}: {player.stability}%
              </div>
            )}
          </div>

          {/* State Bank Loans */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Landmark size={14} />
                {t.stateBankTitle}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={player.loans.length >= 3}
                  onClick={() => onTakeLoan(60)}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  {t.takeLoan60}
                </button>
                <button
                  type="button"
                  disabled={player.loans.length >= 3}
                  onClick={() => onTakeLoan(150)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  {t.takeLoan150}
                </button>
              </div>
            </div>

            {player.loans.length === 0 ? (
              <div className="text-xs text-slate-400">{t.noLoans}</div>
            ) : (
              <div className="space-y-1.5">
                {player.loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs"
                  >
                    <span className="font-mono-num text-slate-200">
                      -{loan.perTurnPayment.toFixed(1)} PLN/t · {loan.turnsLeft}t ({loan.remainingTotal.toFixed(1)} PLN)
                    </span>
                    <button
                      type="button"
                      disabled={player.treasury < loan.remainingTotal}
                      onClick={() => onRepayLoan(loan.id)}
                      className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-40 text-emerald-300 font-semibold cursor-pointer"
                    >
                      {t.repayLoan}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed">
            {t.tutorialDisclaimer}
          </div>
        </div>
      </div>
    </div>
  );
}
