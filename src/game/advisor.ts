import { TECH_TREE_NODES, canUnlockTechNode } from '../data/techTree';
import { computeCountrySummaries } from './combat';
import type { GameState, Language } from './types';

export interface TacticalAdvice {
  severity: 'critical' | 'warning' | 'opportunity' | 'steady';
  headline: string;
  body: string;
  suggestedAction?: string;
}

const REGION_NAMES: Record<Language, Record<'baltic' | 'atlantic' | 'mediterranean' | 'pacific', string>> = {
  en: { baltic: 'Baltic Sea', atlantic: 'North Atlantic', mediterranean: 'Mediterranean Sea', pacific: 'Pacific Rim' },
  pl: { baltic: 'Morzu Bałtyckim', atlantic: 'Północnym Atlantyku', mediterranean: 'Morzu Śródziemnym', pacific: 'Pacyfiku' },
  szl: { baltic: 'Bałtyku', atlantic: 'Atlantyku', mediterranean: 'Śrōdziymnym', pacific: 'Pacyfiku' },
  csb: { baltic: 'Bôłce', atlantic: 'Atlantëkù', mediterranean: 'Strzódzemnym', pacific: 'Pacyfikù' },
};

export function isSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.speechSynthesis !== 'undefined' &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

export function stopAdvisorSpeech(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore speech cancel errors
  }
}

export function speakAdvisorLine(
  text: string,
  opts: {
    lang: Language;
    voiceEnabled: boolean;
    muted?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
  },
): boolean {
  if (!opts.voiceEnabled || opts.muted || !text.trim() || !isSpeechSupported()) {
    return false;
  }
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = opts.lang === 'pl' || opts.lang === 'szl' || opts.lang === 'csb' ? 'pl-PL' : 'en-US';
    utt.rate = 1.04;
    utt.pitch = 0.98;
    utt.volume = 0.85;
    utt.onstart = () => opts.onStart?.();
    utt.onend = () => opts.onEnd?.();
    utt.onerror = () => opts.onEnd?.();
    synth.speak(utt);
    return true;
  } catch {
    opts.onEnd?.();
    return false;
  }
}

// Deterministic local Tactical AI Advisor (zero external API keys required)
export function analyzeTacticalSituation(state: GameState, lang: Language = 'en'): TacticalAdvice {
  if (state.gameMode === 'bot_spectator') {
    const activeWars = Object.values(state.countries).reduce((s, c) => s + c.atWarWith.length, 0) >> 1;
    const top = Object.values(computeCountrySummaries(state))
      .filter((s) => s.provinceCount > 0)
      .sort((a, b) => b.powerScore - a.powerScore)[0];
    const topName = top ? state.countries[top.countryId]?.displayName ?? 'Leader' : 'Global AI';
    return {
      severity: 'steady',
      headline: lang === 'pl' ? 'Analiza Obserwatora AI' : 'Global Bot Telemetry',
      body:
        lang === 'pl'
          ? `Aktywne wojny: ${activeWars}. Obecny lider potęgi: ${topName} (${top?.provinceCount ?? 0} prowincji).`
          : `${activeWars} active conflicts tracked. Current hegemony leader: ${topName} (${top?.provinceCount ?? 0} provinces).`,
    };
  }

  const player = state.countries[state.playerCountryId];
  if (!player) {
    return {
      severity: 'steady',
      headline: 'Command Standby',
      body: 'Select a province to inspect frontlines and reserves.',
    };
  }

  const sums = computeCountrySummaries(state);
  const mySum = sums[player.id];
  const myProvs = Object.values(state.provinces).filter((p) => p.ownerId === player.id);

  // 0. Auto-Pilot Command Briefing
  if (state.autoPilotEnabled) {
    return {
      severity: 'opportunity',
      headline: lang === 'pl' ? 'Auto-Pilot Dowództwa Aktywny' : 'AI Supreme Commander Online',
      body:
        lang === 'pl'
          ? `Auto-Pilot zarządza rekrutacją, technologią i mostami powietrznymi dla ${player.displayName}. Skarbiec: ${player.treasury.toFixed(1)} PLN.`
          : `Auto-Pilot is actively managing economy, tech, and 5-second emergency airlifts for ${player.displayName}. Treasury: ${player.treasury.toFixed(1)} PLN.`,
    };
  }

  // 1. Critical Global Warming Warning
  if ((state.globalWarmingIndex ?? 0) >= 65) {
    return {
      severity: 'warning',
      headline: lang === 'pl' ? 'Alert Klimatyczny Planety' : 'Climate Thermal Threshold Alert',
      body:
        lang === 'pl'
          ? `Indeks Globalnego Ocieplenia osiągnął ${Math.round(state.globalWarmingIndex)}/100. Spodziewaj się susz i sztormów — uchwal Czyste Traktaty w Radzie Świata.`
          : `Global Warming Index reached ${Math.round(state.globalWarmingIndex)}/100. Coastal surges and droughts threaten provincial output.`,
    };
  }

  // 2. Check critical maritime Water Alert affecting player coastal provinces
  const localAlert = state.waterAlerts.find((wa) =>
    wa.affectedProvinceIds.some((pid) => state.provinces[pid]?.ownerId === player.id),
  );
  if (localAlert) {
    const region = REGION_NAMES[lang][localAlert.regionKey];
    return {
      severity: 'warning',
      headline: lang === 'pl' ? 'ALERT WODNY na Wybrzeżu' : 'WATER ALERT: Maritime Storm',
      body:
        lang === 'pl'
          ? `Sztorm na ${region} opóźnia desanty morskie (+40% czasu) i osłabia ataki z morza. Rozważ budowę Obrony Wybrzeża.`
          : `Severe storm in the ${region} delays naval landings and reduces amphibious strength. Reinforce Coastal Defense before crossing.`,
    };
  }

  // 3. Check active war balance
  if (player.atWarWith.length > 0) {
    const strongestEnemyId = [...player.atWarWith].sort(
      (a, b) => (sums[b]?.totalArmy ?? 0) - (sums[a]?.totalArmy ?? 0),
    )[0];
    const enemySum = sums[strongestEnemyId];
    const enemyName = state.countries[strongestEnemyId]?.displayName ?? 'Rival';

    if (enemySum && mySum && enemySum.totalArmy > mySum.totalArmy * 1.18) {
      return {
        severity: 'critical',
        headline: lang === 'pl' ? `Przewaga wroga: ${enemyName}` : `Outnumbered by ${enemyName}`,
        body:
          lang === 'pl'
            ? `Wróg ma ${enemySum.totalArmy.toLocaleString('en-US')} wojsk wobec Twoich ${mySum.totalArmy.toLocaleString('en-US')}. Buduj forty i rekrutuj w prowincjach przyfrontowych!`
            : `Enemy fields ${enemySum.totalArmy.toLocaleString('en-US')} vs your ${mySum.totalArmy.toLocaleString('en-US')}. Build Fortresses on border provinces or enable Auto-Pilot!`,
      };
    }

    return {
      severity: 'opportunity',
      headline: lang === 'pl' ? `Front przeciw ${enemyName}` : `Active Front: ${enemyName}`,
      body:
        lang === 'pl'
          ? `Twoje oddziały utrzymują inicjatywę (${mySum?.totalArmy.toLocaleString('en-US') ?? 0} żołnierzy). Użyj kalkulatora szans w zakładce Marsz przed uderzeniem.`
          : `Your armed forces hold initiative (${mySum?.totalArmy.toLocaleString('en-US') ?? 0} active). Check Win Chance before launching synchronized assaults.`,
    };
  }

  // 4. Check unassimilated provinces
  const unassimilated = myProvs.find((p) => !p.assimilated);
  if (unassimilated && player.treasury >= 10) {
    return {
      severity: 'warning',
      headline: lang === 'pl' ? `Asymiluj: ${unassimilated.name}` : `Stabilize ${unassimilated.name}`,
      body:
        lang === 'pl'
          ? `${unassimilated.name} nie jest zasymilowana (-25% podatków i obrony). Wydaj 10 PLN na asymilację.`
          : `${unassimilated.name} is unassimilated (-25% tax & defense). Assimilate it from the Province Dock for 10 PLN.`,
    };
  }

  // 5. Check Research Opportunity in Visual Tech Tree
  const unlockable = TECH_TREE_NODES.find(
    (n) => canUnlockTechNode(player.unlockedTechs, n.id) && player.researchPoints >= n.costRp,
  );
  if (unlockable) {
    return {
      severity: 'opportunity',
      headline: lang === 'pl' ? 'Nowa Technologia Gotowa' : 'Tech Breakthrough Ready',
      body:
        lang === 'pl'
          ? `Masz ${Math.floor(player.researchPoints)} PB! Otwórz Drzewko Technologii i odblokuj „${unlockable.title[lang]}”.`
          : `You have ${Math.floor(player.researchPoints)} RP ready! Open the Tech Tree to research "${unlockable.title[lang]}".`,
    };
  }

  // 6. Check Nuclear Winter or Negative Treasury
  if (state.nuclearWinterLevel >= 20) {
    return {
      severity: 'critical',
      headline: lang === 'pl' ? 'Zima Nuklearna Aktywna' : 'Nuclear Winter Impact',
      body:
        lang === 'pl'
          ? `Globalne ochłodzenie obniża plony. Głosuj za traktatami pokojowymi w Radzie Świata lub inwestuj w Arki Głębinowe.`
          : `Fallout cools global output by ${Math.round(state.nuclearWinterLevel * 0.4)}%. Pass World Council restraint treaties to recover.`,
    };
  }

  if (mySum && mySum.incomePerTurn < 0) {
    return {
      severity: 'warning',
      headline: lang === 'pl' ? 'Deficyt Budżetowy' : 'Budget Deficit Detected',
      body:
        lang === 'pl'
          ? `Bilans wynosi ${mySum.incomePerTurn.toFixed(1)} PLN/m-c. Zbuduj Fabryki, wyznacz Ministra Finansów lub dostosuj podatki w Skarbcu.`
          : `Monthly balance is ${mySum.incomePerTurn.toFixed(1)} PLN. Construct Factories, appoint an Industrialist Minister, or adjust Treasury taxes.`,
    };
  }

  // 7. Default growth advice
  return {
    severity: 'steady',
    headline: lang === 'pl' ? 'Sytuacja Stabilna — Rozbudowa' : 'Strategic Readiness Nominal',
    body:
      lang === 'pl'
        ? `Skarbiec: ${player.treasury.toFixed(1)} PLN · Wojska: ${mySum?.totalArmy.toLocaleString('en-US') ?? 0}. Rozwijaj Fabryki, Flotę i Drzewko Technologii.`
        : `Treasury stands at ${player.treasury.toFixed(1)} PLN with ${mySum?.totalArmy.toLocaleString('en-US') ?? 0} troops. Expand Factories, Research, or Space & Ocean hubs.`,
  };
}
