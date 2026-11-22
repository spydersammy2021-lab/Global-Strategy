import React from 'react';
import {
  Award,
  Briefcase,
  Coins,
  Crown,
  FlaskConical,
  Globe2,
  Hammer,
  Rocket,
  ScrollText,
  Swords,
} from 'lucide-react';
import type { Translations } from '../i18n/translations';

export type DockSection =
  | 'budget'
  | 'military'
  | 'generals'
  | 'designer'
  | 'diplomacy'
  | 'arms_market'
  | 'space'
  | 'apex_premium'
  | 'chronicle';

export function LeftDock({
  activeSection,
  onToggleSection,
  onOpenTechTree,
  apexUnlocked,
  t,
}: {
  activeSection: DockSection | null;
  onToggleSection: (sec: DockSection) => void;
  onOpenTechTree: () => void;
  apexUnlocked: boolean;
  t: Translations;
}) {
  const items: { id: DockSection | 'tech'; label: string; icon: React.ReactNode; highlight?: boolean }[] = [
    { id: 'budget', label: t.dockBudget, icon: <Coins size={17} /> },
    { id: 'military', label: t.dockMilitary, icon: <Swords size={17} /> },
    { id: 'generals', label: t.dockGenerals, icon: <Award size={17} /> },
    { id: 'designer', label: t.dockDesigner, icon: <Hammer size={17} /> },
    { id: 'tech', label: t.dockTech, icon: <FlaskConical size={17} /> },
    { id: 'diplomacy', label: t.dockDiplomacy, icon: <Globe2 size={17} /> },
    { id: 'arms_market', label: t.dockArmsMarket, icon: <Briefcase size={17} /> },
    { id: 'space', label: t.dockSpace, icon: <Rocket size={17} /> },
    { id: 'apex_premium', label: t.dockApexPremium, icon: <Crown size={17} />, highlight: true },
    { id: 'chronicle', label: t.dockChronicle, icon: <ScrollText size={17} /> },
  ];

  return (
    <aside
      aria-label="Command Dock"
      className="hidden md:flex fixed left-3 top-[66px] z-30 flex-col gap-1 p-1.5 rounded-2xl royal-glass"
    >
      {items.map((it) => {
        const isActive = it.id !== 'tech' && activeSection === it.id;
        return (
          <button
            key={it.id}
            type="button"
            data-testid={`dock-${it.id}`}
            title={it.label}
            aria-label={it.label}
            onClick={() => {
              if (it.id === 'tech') onOpenTechTree();
              else onToggleSection(it.id);
            }}
            className={`w-11 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
              isActive
                ? 'bg-amber-400 text-slate-950 font-bold'
                : it.highlight
                  ? apexUnlocked
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-300/60'
                    : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            {it.icon}
            <span className="text-[8px] font-semibold leading-none truncate max-w-[40px]">{it.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
