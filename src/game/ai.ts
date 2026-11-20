import { TECH_TREE_NODES, canUnlockTechNode } from '../data/techTree';
import { DIFFICULTIES, SCENARIOS } from '../data/scenarios';
import { computeCountrySummaries, getTotalUnits, splitUnitsByRatio, subtractUnits } from './combat';
import type { ArmyOrder, ChronicleEntry, GameState, Language, ProvinceState } from './types';

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
  const diff = DIFFICULTIES[state.difficulty ?? 'normal'];
  const isExtremePlus = !isSpectator && state.difficulty === 'extreme_plus';
  const budgetMult = isSpectator ? 1.0 : diff.aiBudgetMult;

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

    // 3. AI War & Counter-attack Maneuvers (respecting NAP & Vassalage, deducting from province immediately on march launch)
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
      const warThreshold = isSpectator ? 0.8 : 0.94;
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

      // Coalition members forge mutual pacts & declare coordinated war on the player
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
