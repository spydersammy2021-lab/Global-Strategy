import { TECH_TREE_NODES, canUnlockTechNode } from '../data/techTree';
import { SCENARIOS, getDifficultyConfig } from '../data/scenarios';
import {
  addUnits,
  computeCountrySummaries,
  getTotalUnits,
  splitUnitsByRatio,
  subtractUnits,
} from './combat';
import type {
  ArmyOrder,
  ChronicleEntry,
  GameState,
  Language,
  ProvinceState,
} from './types';

function seededRand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Honest, zero-cheat AI: recruits strictly from real treasury & manpower,
// maneuvers armies with timed marches, unlocks real Tech Tree nodes, and logs chronicle events.
export function generateAiOrdersAndActions(
  state: GameState,
  lang: Language = 'en',
): { orders: ArmyOrder[]; chronicleEntries: ChronicleEntry[] } {
  const aiOrders: ArmyOrder[] = [];
  const chronicleEntries: ChronicleEntry[] = [];
  const summaries = computeCountrySummaries(state);
  const scenario = SCENARIOS[state.scenarioId];
  const isSpectator = state.gameMode === 'bot_spectator';
  const diff = getDifficultyConfig(state.difficulty);
  const isExtremePlus = !isSpectator && state.difficulty === 'extreme_plus';
  const budgetMult = isSpectator ? 1.0 : diff.aiBudgetMult;
  const aggrMult = isSpectator ? 1.0 : diff.aiWarAggrMult;

  const provsByCountry: Record<string, ProvinceState[]> = {};
  for (const prov of Object.values(state.provinces)) {
    if (!provsByCountry[prov.ownerId]) provsByCountry[prov.ownerId] = [];
    provsByCountry[prov.ownerId].push(prov);
  }

  let orderCounter = 0;

  for (const country of Object.values(state.countries)) {
    if (country.isPlayer || country.eliminated) continue;
    const ownedProvs = provsByCountry[country.id];
    if (!ownedProvs || ownedProvs.length === 0) continue;

    const countryLabel = country.displayName || country.name[lang];

    // 0. Honest AI Tech Tree research using real researchPoints (EXTREME+ prioritizes missiles & space faster)
    const techUnlocksPerCycle = isExtremePlus ? 2 : 1;
    const priorityOrder = isExtremePlus
      ? ['mil_doctrine', 'mil_armor', 'mil_aerospace', 'mil_missiles', 'log_orbital_shields', 'eco_fusion']
      : [];
    for (let t = 0; t < techUnlocksPerCycle; t++) {
      const nextNode =
        TECH_TREE_NODES.find(
          (n) =>
            priorityOrder.includes(n.id) &&
            canUnlockTechNode(country.unlockedTechs, n.id) &&
            country.researchPoints >= n.costRp,
        ) ??
        TECH_TREE_NODES.find(
          (n) => canUnlockTechNode(country.unlockedTechs, n.id) && country.researchPoints >= n.costRp,
        );
      if (!nextNode) break;
      country.researchPoints = Number((country.researchPoints - nextNode.costRp).toFixed(1));
      country.unlockedTechs = [...country.unlockedTechs, nextNode.id];
      if (nextNode.militaryLevelGain) country.tech.military += nextNode.militaryLevelGain;
      if (nextNode.economyLevelGain) country.tech.economy += nextNode.economyLevelGain;
      if (nextNode.logisticsLevelGain) {
        country.tech.logistics += nextNode.logisticsLevelGain;
        country.maxMovementPoints += nextNode.logisticsLevelGain;
      }
      if (nextNode.id === 'log_orbital_shields') country.orbitalShieldActive = true;
    }

    // 1. Honest AI Recruitment: requires BOTH real treasury AND real manpower reserves
    const isAtWar = country.atWarWith.length > 0;
    const reserveThreshold = isAtWar ? 4 : 24;

    if (country.treasury > reserveThreshold && country.manpower >= 1000) {
      const baseFraction = isAtWar ? 0.7 : 0.32;
      const spendBudget = country.treasury * Math.min(0.9, baseFraction * budgetMult);

      let targetProv = ownedProvs[0];
      if (isAtWar) {
        const front = ownedProvs.find((p) =>
          [...p.neighbors, ...p.seaNeighbors].some((nId) => {
            const np = state.provinces[nId];
            return np && country.atWarWith.includes(np.ownerId);
          }),
        );
        if (front) targetProv = front;
      }

      const primaryUnit = scenario.unitRoster[0];
      const eliteUnit = scenario.unitRoster[1] ?? primaryUnit;
      const hasBarracks = targetProv.buildings.includes('barracks');
      const costDiscount = hasBarracks ? 0.8 : 1.0;

      const myArmyTotal = summaries[country.id]?.totalArmy ?? 10000;
      const maxMonthlyRecruit = Math.min(
        Math.floor(country.manpower / 1000) * 1000,
        Math.max(6000, Math.round(myArmyTotal * 0.32 * budgetMult)),
      );

      const rawInf = Math.floor((spendBudget * 0.65) / (primaryUnit.costPln * costDiscount)) * 1000;
      const rawElite = Math.floor((spendBudget * 0.35) / (eliteUnit.costPln * costDiscount)) * 1000;

      const infCap = Math.min(maxMonthlyRecruit, Math.floor((maxMonthlyRecruit * 0.65) / 1000) * 1000);
      const infCount = Math.min(rawInf, infCap, Math.floor(country.manpower / 1000) * 1000);

      if (infCount >= 1000 && country.manpower >= infCount) {
        const actualCost = Number(((infCount / 1000) * primaryUnit.costPln * costDiscount).toFixed(1));
        if (country.treasury >= actualCost) {
          country.treasury = Number((country.treasury - actualCost).toFixed(1));
          country.manpower -= infCount;
          targetProv.units[primaryUnit.id] = (targetProv.units[primaryUnit.id] ?? 0) + infCount;
        }
      }

      const eliteCap = Math.min(
        Math.floor(country.manpower / 1000) * 1000,
        Math.floor((maxMonthlyRecruit * 0.35) / 1000) * 1000,
      );
      const eliteCount = Math.min(rawElite, eliteCap);

      if (eliteCount >= 1000 && country.manpower >= eliteCount) {
        const actualCost = Number(((eliteCount / 1000) * eliteUnit.costPln * costDiscount).toFixed(1));
        if (country.treasury >= actualCost) {
          country.treasury = Number((country.treasury - actualCost).toFixed(1));
          country.manpower -= eliteCount;
          targetProv.units[eliteUnit.id] = (targetProv.units[eliteUnit.id] ?? 0) + eliteCount;
        }
      }
    }

    // 2. AI Economic & Research building when peaceful and solvent
    if (!isAtWar && country.treasury >= 28) {
      const candidateFactory = ownedProvs.find((p) => !p.buildings.includes('factory'));
      if (candidateFactory) {
        country.treasury = Number((country.treasury - 22).toFixed(1));
        candidateFactory.buildings.push('factory');
      } else if (country.treasury >= 34) {
        const candidateUni = ownedProvs.find((p) => !p.buildings.includes('university'));
        if (candidateUni) {
          country.treasury = Number((country.treasury - 28).toFixed(1));
          candidateUni.buildings.push('university');
        }
      }
    }

    // 3. AI War & Counter-attack Maneuvers
    if (isAtWar) {
      for (const prov of ownedProvs) {
        const localTroops = getTotalUnits(prov.units);
        if (localTroops < 3500) continue;

        const allReachable = [...prov.neighbors, ...prov.seaNeighbors];
        const enemyAdjacent = allReachable
          .map((id) => state.provinces[id])
          .filter(
            (np) =>
              np &&
              country.atWarWith.includes(np.ownerId) &&
              !country.nonAggressionWith[np.ownerId] &&
              country.vassalOf !== np.ownerId,
          );

        if (enemyAdjacent.length > 0) {
          enemyAdjacent.sort((a, b) => getTotalUnits(a.units) - getTotalUnits(b.units));
          const target = enemyAdjacent[0];
          const targetTroops = getTotalUnits(target.units);

          const myTotal = summaries[country.id]?.totalArmy ?? localTroops;
          const enemyTotal = summaries[target.ownerId]?.totalArmy ?? targetTroops;
          const winterFactor = target.weather === 'snow' ? 1.15 : 0.92;
          const shouldAttack =
            localTroops > targetTroops * winterFactor || myTotal > enemyTotal * 1.16;

          if (shouldAttack) {
            const sendRatio = targetTroops === 0 ? 0.55 : 0.72;
            const split = splitUnitsByRatio(prov.units, sendRatio);
            if (getTotalUnits(split) >= 1200) {
              const isNaval = !prov.neighbors.includes(target.id) && prov.seaNeighbors.includes(target.id);
              const stormExtra = isNaval && state.waterAlerts.some((w) => w.affectedProvinceIds.includes(target.id)) ? 3 : 0;
              prov.units = subtractUnits(prov.units, split);
              aiOrders.push({
                id: `ai_${state.totalDays}_${country.id}_${orderCounter++}`,
                countryId: country.id,
                fromProvinceId: prov.id,
                toProvinceId: target.id,
                units: split,
                isAttack: true,
                isNaval,
                startDay: state.totalDays,
                durationDays: (isNaval ? 7 : 5) + stormExtra,
                progress: 0,
              });
            }
          }
        } else if (ownedProvs.length > 1) {
          const borderProv = ownedProvs.find((p) =>
            [...p.neighbors, ...p.seaNeighbors].some((nId) => {
              const np = state.provinces[nId];
              return np && country.atWarWith.includes(np.ownerId);
            }),
          );
          if (borderProv && prov.neighbors.includes(borderProv.id) && localTroops >= 6000) {
            const split = splitUnitsByRatio(prov.units, 0.65);
            prov.units = subtractUnits(prov.units, split);
            aiOrders.push({
              id: `ai_reinf_${state.totalDays}_${country.id}_${orderCounter++}`,
              countryId: country.id,
              fromProvinceId: prov.id,
              toProvinceId: borderProv.id,
              units: split,
              isAttack: false,
              isNaval: false,
              startDay: state.totalDays,
              durationDays: 4,
              progress: 0,
            });
          }
        }
      }

      if (isSpectator && state.turn % 5 === 0) {
        const myStrength = summaries[country.id]?.totalArmy ?? 0;
        for (const enemyId of [...country.atWarWith]) {
          const enemy = state.countries[enemyId];
          if (!enemy || enemy.eliminated || enemy.isPlayer) continue;
          const enemyStrength = summaries[enemyId]?.totalArmy ?? 0;
          if (
            myStrength > 0 &&
            myStrength < enemyStrength * 0.35 &&
            seededRand(state.turn * 17 + country.id.charCodeAt(0) + enemyId.charCodeAt(0)) > 0.65
          ) {
            country.atWarWith = country.atWarWith.filter((id) => id !== enemyId);
            enemy.atWarWith = enemy.atWarWith.filter((id) => id !== country.id);
            country.truceWith[enemyId] = 4;
            enemy.truceWith[country.id] = 4;
            const enemyLabel = enemy.displayName || enemy.name[lang];
            chronicleEntries.push({
              id: `chr_peace_${state.totalDays}_${country.id}_${enemyId}`,
              turn: state.turn,
              day: state.day,
              year: state.year,
              monthIndex: state.monthIndex,
              type: 'peace',
              title: lang === 'pl' ? 'Traktat pokojowy' : 'AI Peace Treaty',
              detail: `${countryLabel} 🕊️ ${enemyLabel}`,
              countryIds: [country.id, enemyId],
            });
          }
        }
      }
    } else {
      const warFreq = isSpectator ? 2 : 7;
      const warThreshold = isSpectator
        ? 0.8
        : aggrMult < 0.5
        ? 0.992
        : aggrMult > 1.5
        ? 0.86
        : 0.94;
      const myStrength = summaries[country.id]?.totalArmy ?? 0;

      if (
        state.turn % warFreq === 0 &&
        myStrength > (isSpectator ? 24000 : 75000) &&
        seededRand(state.turn * 13 + country.id.charCodeAt(0) * 7) > warThreshold
      ) {
        for (const prov of ownedProvs) {
          const reachableForeign = [...prov.neighbors, ...(isSpectator ? prov.seaNeighbors : [])]
            .map((id) => state.provinces[id])
            .find(
              (np) =>
                np &&
                np.ownerId !== country.id &&
                !state.countries[np.ownerId]?.isPlayer &&
                !country.allies.includes(np.ownerId) &&
                !country.nonAggressionWith[np.ownerId] &&
                !country.truceWith[np.ownerId] &&
                country.vassalOf !== np.ownerId &&
                (summaries[np.ownerId]?.totalArmy ?? 0) < myStrength * (isSpectator ? 0.85 : 0.45),
            );
          if (reachableForeign) {
            const targetCountry = state.countries[reachableForeign.ownerId];
            if (targetCountry && !targetCountry.eliminated) {
              country.atWarWith.push(targetCountry.id);
              targetCountry.atWarWith.push(country.id);
              const targetLabel = targetCountry.displayName || targetCountry.name[lang];
              chronicleEntries.push({
                id: `chr_war_${state.totalDays}_${country.id}_${targetCountry.id}`,
                turn: state.turn,
                day: state.day,
                year: state.year,
                monthIndex: state.monthIndex,
                type: 'war',
                title: lang === 'pl' ? 'Wybuch wojny' : 'War Declared',
                detail: `${countryLabel} ⚔️ ${targetLabel}`,
                countryIds: [country.id, targetCountry.id],
              });
            }
            break;
          }
        }
      } else if (
        isSpectator &&
        state.turn % 4 === 0 &&
        country.allies.length < 2 &&
        seededRand(state.turn * 19 + country.id.charCodeAt(0) * 3) > 0.91
      ) {
        for (const prov of ownedProvs) {
          const cand = prov.neighbors
            .map((id) => state.provinces[id])
            .find(
              (np) =>
                np &&
                np.ownerId !== country.id &&
                !country.allies.includes(np.ownerId) &&
                !country.atWarWith.includes(np.ownerId),
            );
          if (cand) {
            const partner = state.countries[cand.ownerId];
            if (partner && !partner.eliminated && partner.allies.length < 3) {
              country.allies.push(partner.id);
              partner.allies.push(country.id);
              const partnerLabel = partner.displayName || partner.name[lang];
              chronicleEntries.push({
                id: `chr_ally_${state.totalDays}_${country.id}_${partner.id}`,
                turn: state.turn,
                day: state.day,
                year: state.year,
                monthIndex: state.monthIndex,
                type: 'alliance',
                title: lang === 'pl' ? 'Nowy sojusz' : 'Alliance Signed',
                detail: `${countryLabel} 🤝 ${partnerLabel}`,
                countryIds: [country.id, partner.id],
              });
            }
            break;
          }
        }
      }
    }
  }

  // 4. EXTREME+ Ruthless Grand-Master AI: Global Anti-Player Coalitions & Missile Tech Rush
  if (isExtremePlus && state.totalDays >= 10) {
    const player = state.countries[state.playerCountryId];
    if (player && !player.eliminated) {
      const strongAis = Object.values(state.countries).filter(
        (c) =>
          !c.isPlayer &&
          !c.eliminated &&
          (provsByCountry[c.id]?.length ?? 0) > 0 &&
          !c.allies.includes(player.id) &&
          !c.nonAggressionWith[player.id] &&
          !c.truceWith[player.id] &&
          c.vassalOf !== player.id &&
          (summaries[c.id]?.totalArmy ?? 0) >= 30000,
      );

      const coalitionCore = strongAis.slice(0, 3);
      for (const aiNation of coalitionCore) {
        if (!aiNation.atWarWith.includes(player.id)) {
          aiNation.atWarWith.push(player.id);
          if (!player.atWarWith.includes(aiNation.id)) {
            player.atWarWith.push(aiNation.id);
          }
          const aiLabel = aiNation.displayName || aiNation.name[lang];
          chronicleEntries.push({
            id: `chr_coal_${state.totalDays}_${aiNation.id}`,
            turn: state.turn,
            day: state.day,
            year: state.year,
            monthIndex: state.monthIndex,
            type: 'war',
            title: lang === 'pl' ? 'Globalna Koalicja EXTREME+' : 'EXTREME+ Global Coalition',
            detail: `${aiLabel} ☠️⚔️ ${player.displayName}`,
            countryIds: [aiNation.id, player.id],
          });
        }
        for (const partner of coalitionCore) {
          if (partner.id === aiNation.id) continue;
          if (!aiNation.allies.includes(partner.id)) aiNation.allies.push(partner.id);
          if (!partner.allies.includes(aiNation.id)) partner.allies.push(aiNation.id);
        }
      }
    }
  }

  return { orders: aiOrders, chronicleEntries };
}

export interface AutoPilotCommandResult {
  state: GameState;
  didAirlift: boolean;
  didRecruit: boolean;
  summaryAction?: string;
}

// Honest, zero-cheat AI Supreme Commander for Player Nation (Auto-Pilot Mode / mid-game toggle)
export function runAutoPilotCommand(
  prevState: GameState,
  lang: Language = 'en',
  opts: { allowAirlift?: boolean } = {},
): AutoPilotCommandResult {
  if (prevState.gameMode !== 'player' || prevState.outcome !== 'ongoing') {
    return { state: prevState, didAirlift: false, didRecruit: false };
  }
  const player = prevState.countries[prevState.playerCountryId];
  if (!player || player.eliminated) {
    return { state: prevState, didAirlift: false, didRecruit: false };
  }

  const nextCountries = { ...prevState.countries };
  const nextProvs = { ...prevState.provinces };
  const myCountry = {
    ...player,
    unlockedTechs: [...player.unlockedTechs],
    techQueue: [...player.techQueue],
    tech: { ...player.tech },
  };
  nextCountries[myCountry.id] = myCountry;

  const ownedProvs = Object.values(nextProvs)
    .filter((p) => p.ownerId === myCountry.id)
    .map((p) => ({ ...p, buildings: [...p.buildings], units: { ...p.units } }));
  if (ownedProvs.length === 0) {
    return { state: prevState, didAirlift: false, didRecruit: false };
  }
  for (const p of ownedProvs) nextProvs[p.id] = p;

  const nextPulses = [...(prevState.mapPulses ?? [])];
  const nextAirlifts = [...(prevState.airliftVisuals ?? [])];
  const nextOrders = [...prevState.orders];
  const nextChronicle = [...prevState.chronicle];
  const nextNotifications = [...prevState.notifications];

  const scenario = SCENARIOS[prevState.scenarioId];
  const now = Date.now();
  let didAirlift = false;
  let didRecruit = false;
  let summaryAction: string | undefined;
  let nextLastAirlift = prevState.autoPilotLastAirliftAt ?? 0;

  // 1. Tech Tree Auto-Research from real RP
  const queuedId = myCountry.techQueue[0];
  const nextTechNode =
    (queuedId &&
    canUnlockTechNode(myCountry.unlockedTechs, queuedId) &&
    myCountry.researchPoints >= (TECH_NODE_MAP_LOOKUP(queuedId)?.costRp ?? 9999)
      ? TECH_NODE_MAP_LOOKUP(queuedId)
      : undefined) ??
    TECH_TREE_NODES.find(
      (n) => canUnlockTechNode(myCountry.unlockedTechs, n.id) && myCountry.researchPoints >= n.costRp,
    );
  if (nextTechNode) {
    myCountry.researchPoints = Number((myCountry.researchPoints - nextTechNode.costRp).toFixed(1));
    myCountry.unlockedTechs.push(nextTechNode.id);
    myCountry.techQueue = myCountry.techQueue.filter((q) => q !== nextTechNode.id);
    if (nextTechNode.militaryLevelGain) myCountry.tech.military += nextTechNode.militaryLevelGain;
    if (nextTechNode.economyLevelGain) myCountry.tech.economy += nextTechNode.economyLevelGain;
    if (nextTechNode.logisticsLevelGain) {
      myCountry.tech.logistics += nextTechNode.logisticsLevelGain;
      myCountry.maxMovementPoints += nextTechNode.logisticsLevelGain;
    }
    if (nextTechNode.id === 'log_orbital_shields') myCountry.orbitalShieldActive = true;
    summaryAction =
      lang === 'pl'
        ? `Auto-Pilot odblokował technologię: ${nextTechNode.title.pl}.`
        : `Auto-Pilot unlocked technology: ${nextTechNode.title.en}.`;
  }

  // Classify frontlines vs safe rear provinces
  const isAtWar = myCountry.atWarWith.length > 0;
  const frontProvs = ownedProvs.filter((p) =>
    [...p.neighbors, ...p.seaNeighbors].some((nId) => {
      const np = nextProvs[nId];
      if (!np || np.ownerId === myCountry.id) return false;
      return isAtWar ? myCountry.atWarWith.includes(np.ownerId) : !myCountry.allies.includes(np.ownerId);
    }),
  );
  const endangeredProvs = [...(frontProvs.length > 0 ? frontProvs : ownedProvs)].sort(
    (a, b) => getTotalUnits(a.units) - getTotalUnits(b.units),
  );
  const rearProvs = ownedProvs
    .filter((p) => !frontProvs.some((fp) => fp.id === p.id))
    .sort((a, b) => getTotalUnits(b.units) - getTotalUnits(a.units));

  // 2. Strategic Infrastructure (Factories on richest province or Forts on threatened frontline)
  if (isAtWar && myCountry.treasury >= 34 && myCountry.movementPoints >= 1) {
    const unfortifiedFront = endangeredProvs.find((p) => !p.buildings.includes('fort'));
    if (unfortifiedFront) {
      myCountry.treasury = Number((myCountry.treasury - 26).toFixed(1));
      myCountry.movementPoints -= 1;
      unfortifiedFront.buildings.push('fort');
    }
  } else if (!isAtWar && myCountry.treasury >= 30 && myCountry.movementPoints >= 1) {
    const richProv = [...ownedProvs]
      .filter((p) => !p.buildings.includes('factory'))
      .sort((a, b) => b.economy - a.economy)[0];
    if (richProv) {
      myCountry.treasury = Number((myCountry.treasury - 22).toFixed(1));
      myCountry.movementPoints -= 1;
      richProv.buildings.push('factory');
    }
  }

  // 3. Honest Crisis Recruitment from Real Treasury & Manpower -> emits 'recruit' pulse
  const recruitTarget = endangeredProvs[0];
  if (
    recruitTarget &&
    myCountry.treasury >= (isAtWar ? 4 : 12) &&
    myCountry.manpower >= 1000 &&
    myCountry.movementPoints >= 1
  ) {
    const primaryUnit = scenario.unitRoster[0];
    const costPerBatch = primaryUnit.costPln * (recruitTarget.buildings.includes('barracks') ? 0.8 : 1.0);
    const budgetFrac = isAtWar ? 0.65 : 0.45;
    const affordableThousands = Math.floor((myCountry.treasury * budgetFrac) / costPerBatch);
    const recruitCount = Math.min(
      Math.max(1000, affordableThousands * 1000),
      Math.floor(myCountry.manpower / 1000) * 1000,
      isAtWar ? 12000 : 8000,
    );
    const totalCost = Number(((recruitCount / 1000) * costPerBatch).toFixed(1));
    if (recruitCount >= 1000 && myCountry.treasury >= totalCost && myCountry.manpower >= recruitCount) {
      myCountry.treasury = Number((myCountry.treasury - totalCost).toFixed(1));
      myCountry.manpower -= recruitCount;
      myCountry.movementPoints -= 1;
      recruitTarget.units[primaryUnit.id] = (recruitTarget.units[primaryUnit.id] ?? 0) + recruitCount;
      didRecruit = true;
      nextPulses.unshift({
        id: `pulse_ap_rec_${now}`,
        kind: 'recruit',
        centroid: recruitTarget.centroid,
        color: '#22C55E',
        label: `+${(recruitCount / 1000).toFixed(0)}k`,
        createdAt: now,
      });
    }
  }

  // 4. Rapid 5-Second Strategic Airlift (Honest conservation: transfers 40% from strongest reserve/rear hub to weakest front)
  const allowAirlift = opts.allowAirlift !== false;
  let nextUpcomingAirlift = prevState.autoPilotNextAirliftAt ?? 0;
  if (allowAirlift && ownedProvs.length > 1) {
    const postRecruitEndangered = [...(frontProvs.length > 0 ? frontProvs : ownedProvs)].sort(
      (a, b) => getTotalUnits(a.units) - getTotalUnits(b.units),
    );
    const dest = postRecruitEndangered[0];
    const destTotal = getTotalUnits(dest.units);
    const qualifiesAsDonor = (p: ProvinceState) =>
      p.id !== dest.id &&
      getTotalUnits(p.units) >= 4500 &&
      getTotalUnits(p.units) > destTotal * 1.15;
    const eligibleRear = rearProvs.filter(qualifiesAsDonor);
    const sourcePool = eligibleRear.length > 0 ? eligibleRear : ownedProvs.filter(qualifiesAsDonor);
    const src = sourcePool.sort((a, b) => getTotalUnits(b.units) - getTotalUnits(a.units))[0];
    if (src && dest) {
      const airliftUnits = splitUnitsByRatio(src.units, 0.4);
      const count = getTotalUnits(airliftUnits);
      if (count >= 1200) {
        src.units = subtractUnits(src.units, airliftUnits);
        dest.units = addUnits(dest.units, airliftUnits);
        didAirlift = true;
        nextLastAirlift = now;
        nextUpcomingAirlift = now + 5000;
        nextAirlifts.unshift({
          id: `airlift_${now}`,
          countryId: myCountry.id,
          fromProvinceId: src.id,
          toProvinceId: dest.id,
          fromCentroid: src.centroid,
          toCentroid: dest.centroid,
          troops: count,
          createdAt: now,
        });
        nextPulses.unshift({
          id: `pulse_air_${now}`,
          kind: 'airlift',
          centroid: dest.centroid,
          color: '#38BDF8',
          label: `✈ ${count.toLocaleString('en-US')}`,
          createdAt: now,
        });
        const msg =
          lang === 'pl'
            ? `Most powietrzny Auto-Pilota: ${count.toLocaleString('en-US')} wojsk z ${src.name} do ${dest.name}!`
            : `Auto-Pilot Airlift: Deployed ${count.toLocaleString('en-US')} troops from ${src.name} to ${dest.name}!`;
        summaryAction = msg;
        nextNotifications.unshift({
          id: `notif_air_${now}`,
          type: 'info',
          title: lang === 'pl' ? 'Szybki Desant Auto-Pilota' : 'Auto-Pilot Rapid Airlift',
          message: msg,
          createdAt: now,
        });
        nextChronicle.unshift({
          id: `chr_air_${prevState.totalDays}_${now}`,
          turn: prevState.turn,
          day: prevState.day,
          year: prevState.year,
          monthIndex: prevState.monthIndex,
          type: 'event',
          title: lang === 'pl' ? 'Most Powietrzny AI' : 'AI Rapid Airlift',
          detail: `${src.name} ✈️ ${dest.name} (${count.toLocaleString('en-US')})`,
          countryIds: [myCountry.id],
        });
      }
    }
  }

  // 5. Launch multi-front coordinated counter-offensives when at war and locally superior
  if (isAtWar && myCountry.movementPoints >= 1) {
    let launched = 0;
    for (const fp of frontProvs) {
      if (myCountry.movementPoints < 1 || launched >= 2) break;
      const localTroops = getTotalUnits(fp.units);
      if (localTroops < 5000) continue;
      const weakEnemy = [...fp.neighbors, ...fp.seaNeighbors]
        .map((id) => nextProvs[id])
        .filter((np) => np && myCountry.atWarWith.includes(np.ownerId))
        .sort((a, b) => getTotalUnits(a.units) - getTotalUnits(b.units))[0];
      if (weakEnemy && localTroops >= Math.max(4000, getTotalUnits(weakEnemy.units) * 1.15)) {
        const send = splitUnitsByRatio(fp.units, 0.65);
        const sendCount = getTotalUnits(send);
        if (sendCount >= 1500) {
          const isNaval = !fp.neighbors.includes(weakEnemy.id) && fp.seaNeighbors.includes(weakEnemy.id);
          const isRail = !isNaval && (fp.buildings.includes('railway') || weakEnemy.buildings.includes('railway'));
          const baseDur = isNaval ? 6 : 4;
          fp.units = subtractUnits(fp.units, send);
          myCountry.movementPoints -= 1;
          launched += 1;
          nextOrders.push({
            id: `ap_ord_${prevState.totalDays}_${now}_${launched}`,
            countryId: myCountry.id,
            fromProvinceId: fp.id,
            toProvinceId: weakEnemy.id,
            units: send,
            isAttack: true,
            isNaval,
            isRail,
            startDay: prevState.totalDays,
            durationDays: isRail ? Math.max(1, Math.ceil(baseDur / 3)) : baseDur,
            progress: 0,
          });
          summaryAction =
            summaryAction ??
            (lang === 'pl'
              ? `Auto-Pilot wyprowadza skoordynowany atak na ${weakEnemy.name}.`
              : `Auto-Pilot launched coordinated offensive toward ${weakEnemy.name}.`);
        }
      }
    }
  }

  return {
    didAirlift,
    didRecruit,
    summaryAction,
    state: {
      ...prevState,
      autoPilotLastAirliftAt: nextLastAirlift,
      autoPilotNextAirliftAt: nextUpcomingAirlift,
      countries: nextCountries,
      provinces: nextProvs,
      orders: nextOrders,
      mapPulses: nextPulses.slice(0, 14),
      airliftVisuals: nextAirlifts.slice(0, 8),
      notifications: nextNotifications.slice(0, 10),
      chronicle: nextChronicle.slice(0, 120),
    },
  };
}

function TECH_NODE_MAP_LOOKUP(id: string) {
  return TECH_TREE_NODES.find((n) => n.id === id);
}
