import React from 'react';
import {
  Coins,
  FlaskConical,
  Globe,
  Landmark,
  Scale,
  Swords,
} from 'lucide-react';
import type { Translations } from '../i18n/translations';

export type LeftDrawerId = 'budget' | 'military' | 'diplomacy' | 'government' | null;

export function LeftToolbar({
  activeDrawer,
  isSpectator,
  onToggleDrawer,
  onOpenTechTree,
  onOpenCouncilModal,
  t,
}: {
  activeDrawer: LeftDrawerId;
  isSpectator: boolean;
  onToggleDrawer: (drawer: Exclude<LeftDrawerId, null>) => void;
  onOpenTechTree: () => void;
  onOpenCouncilModal: () => void;
  t: Translations;
}) {
  const buttons: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    hiddenInSpectator?: boolean;
    testId?: string;
    onClick: () => void;
  }> = [
    {
      id: 'budget',
      label: t.treasuryModalTitle,
      icon: <Coins size={18} className="text-amber-400" />,
      active: activeDrawer === 'budget',
      hiddenInSpectator: true,
      testId: 'rail-budget-btn',
      onClick: () => onToggleDrawer('budget'),
    },
    {
      id: 'military',
      label: t.army,
      icon: <Swords size={18} className="text-rose-400" />,
      active: activeDrawer === 'military',
      hiddenInSpectator: true,
      testId: 'rail-military-btn',
      onClick: () => onToggleDrawer('military'),
    },
    {
      id: 'tech',
      label: t.techTreeBtn,
      icon: <FlaskConical size={18} className="text-sky-400" />,
      active: false,
      hiddenInSpectator: true,
      testId: 'rail-tech-btn',
      onClick: onOpenTechTree,
    },
    {
      id: 'diplomacy',
      label: t.diplomacyTab,
      icon: <Globe size={18} className="text-emerald-400" />,
      active: activeDrawer === 'diplomacy',
      testId: 'rail-diplomacy-btn',
      onClick: () => onToggleDrawer('diplomacy'),
    },
    {
      id: 'government',
      label: 'Cabinet, Faiths & Legacy',
      icon: <Landmark size={18} className="text-purple-400" />,
      active: activeDrawer === 'government',
      hiddenInSpectator: true,
      testId: 'rail-government-btn',
      onClick: () => onToggleDrawer('government'),
    },
    {
      id: 'council',
      label: t.councilMarketBtn,
      icon: <Scale size={18} className="text-cyan-400" />,
      active: false,
      hiddenInSpectator: true,
      testId: 'council-market-btn',
      onClick: onOpenCouncilModal,
    },
  ];

  return (
    <aside
      aria-label="Grand Strategy Command Rail"
      className="pointer-events-auto absolute top-4 left-2.5 z-20 hidden md:flex flex-col gap-1.5"
    >
      {buttons
        .filter((b) => !(isSpectator && b.hiddenInSpectator))
        .map((btn) => (
          <button
            key={btn.id}
            type="button"
            data-testid={btn.testId}
            onClick={btn.onClick}
            title={btn.label}
            aria-label={btn.label}
            className={`relative h-10 w-10 flex items-center justify-center rounded-lg border transition-colors cursor-pointer aoh-hud-panel ${
              btn.active
                ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_16px_rgba(245,158,11,0.35)]'
                : 'hover:border-amber-400/60 hover:bg-slate-900'
            }`}
          >
            {btn.active && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-amber-400" />
            )}
            {btn.icon}
          </button>
        ))}
    </aside>
  );
}
