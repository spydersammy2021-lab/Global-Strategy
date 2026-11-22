import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeTacticalSituation } from './advisor';
import {
  calculateWinChance,
  computeArmyPower,
  computeCountrySummaries,
  computeDetailedBudget,
  getExactCountryArmy,
  getTopCountries,
  getTotalUnits,
} from './combat';
import {
  adjustRelations,
  advanceDay,
  appointMinister,
  assimilateProvince,
  buildMegaproject,
  buildThermonuclearWarhead,
  cancelOrder,
  clearTechQueue,
  constructBuilding,
  continueEternalEmpire,
  createNewGame,
  deploySpy,
  designCustomUnit,
  developProvince,
  executeBlackOp,
  executeTurn,
  fundSpaceOceanColony,
  grantCommanderXp,
  issueArmyOrder,
  launchSpySatellite,
  launchStrategicStrike,
  planTechTreePath,
  plunderProvince,
  proposeDiplomacy,
  proposeExtendedDiplomacy,
  reconstructProvinceCity,
  recruitGeneral,
  recruitUnits,
  reformHistoricEmpire,
  repayLoan,
  researchTechNode,
  resolvePeaceConference,
  resolveRandomEvent,
  resolveWarPrompt,
  resurrectAncientFaith,
  sendMissionaries,
  setTaxRate,
  setVassalTribute,
  takeBankLoan,
  toggleAutoPilot,
  togglePeacefulStart,
  toggleStraitBlockade,
  tradeMarketResource,
  triggerAutoPilotAirliftNow,
  unlockLegacyPerk,
  updateBudgetSliders,
  voteWorldCouncil,
} from './engine';
import { AI_AGGRESSIVENESS_CONFIG, getDifficultyConfig } from '../data/scenarios';
import { runAutoPilotCommand } from './ai';
import {
  MAJOR_CITIES,
  getEsriTileUrl,
  getGoogleMapsStreetViewUrl,
  latLngToEsriTile,
} from '../data/cities';
import { buildWorldMapData, projectLonLat } from './mapGen';
import { getFpsCapIntervalMs, resolveEffectiveTier } from './performance';
import { getExtremeClimateAttrition, temperatureToHex } from './weather';

test('World map contains all 18 mandatory countries as clickable provinces', () => {
  const map = buildWorldMapData();
  const mandatoryIds = [
    '616', // Poland
    '276', // Germany
    '440', // Lithuania
    '428', // Latvia
    '233', // Estonia
    '112', // Belarus
    '804', // Ukraine
    '203', // Czechia
    '703', // Slovakia
    '250', // France
    '826', // United Kingdom
    '380', // Italy
    '643', // Russia
    '840', // USA
    '156', // China
    '356', // India
    '392', // Japan
    '076', // Brazil
  ];

  for (const id of mandatoryIds) {
    const provs = map.provinces.filter((p) => p.countryOrigId === id);
    assert.ok(provs.length >= 1, `Expected provinces for country ${id}`);
  }
  assert.ok(map.provinces.length > 190, 'Expected multi-province world map with 16 Polish voivodeships');
});

test('Poland 2026 has exact 16 voivodeships, Warszawa capital, ~312,696 km2, ~83k army, and exact army counter', () => {
  const state = createNewGame('2026', '616', 'normal', 'pl');
  const summaries = computeCountrySummaries(state);
  const poland = summaries['616'];
  const lithuania = summaries['440'];
  const germany = summaries['276'];
  const russia = summaries['643'];

  assert.ok(poland && lithuania && germany && russia);
  assert.ok(Math.abs(poland.areaKm2 - 312696) <= 20);
  assert.ok(Math.abs(poland.totalArmy - 83000) <= 1500);
  assert.equal(poland.totalArmy, getExactCountryArmy(state, '616'));
  assert.ok(Math.abs(lithuania.totalArmy - 22000) <= 500, `Lithuania army ~22k, got ${lithuania.totalArmy}`);
  assert.ok(Math.abs(germany.totalArmy - 140000) <= 500, `Germany army ~140k, got ${germany.totalArmy}`);
  assert.ok(Math.abs(russia.totalArmy - 350000) <= 1000, `Russia army ~350k, got ${russia.totalArmy}`);
  assert.equal(state.year, 2026);
  assert.equal(state.turn, 1);

  const polProvs = Object.values(state.provinces).filter((p) => p.ownerId === '616');
  assert.equal(polProvs.length, 16);

  const mazowieckie = state.provinces['616_p0'];
  assert.ok(mazowieckie);
  assert.equal(mazowieckie.name, 'Mazowieckie');
  assert.equal(mazowieckie.capitalCity, 'Warszawa');
  assert.equal(mazowieckie.isCapital, true);

  const expectedVoivodeships = [
    'Mazowieckie',
    'Śląskie',
    'Małopolskie',
    'Wielkopolskie',
    'Dolnośląskie',
    'Pomorskie',
    'Zachodniopomorskie',
    'Kujawsko-Pomorskie',
    'Łódzkie',
    'Lubelskie',
    'Podkarpackie',
    'Podlaskie',
    'Warmińsko-Mazurskie',
    'Lubuskie',
    'Opolskie',
    'Świętokrzyskie',
  ];
  const actualNames = polProvs.map((p) => p.name);
  for (const name of expectedVoivodeships) {
    assert.ok(actualNames.includes(name), `Missing voivodeship: ${name}`);
  }

  const bordersGermany = polProvs.some((p) =>
    p.neighbors.some((nId) => state.provinces[nId]?.ownerId === '276'),
  );
  assert.equal(bordersGermany, true);
});

test('Scenario 966 (Chrzest Polski) initializes Mieszko I, medieval year, and historical units', () => {
  const state = createNewGame('966', '616', 'normal', 'pl');
  assert.equal(state.year, 966);
  assert.equal(state.season, 'spring');
  assert.equal(state.countries['616'].displayName, 'Państwo Polan (Mieszko I)');
  const polProv = Object.values(state.provinces).find((p) => p.ownerId === '616')!;
  assert.ok((polProv.units.archers ?? 0) > 0);
  assert.ok((polProv.units.cavalry ?? 0) > 0);
  assert.equal(polProv.units.tanks ?? 0, 0);
});

test('8 Difficulty tiers scale player income/attack, AI defense/economy, and map legacy saves safely', () => {
  const extEasy = createNewGame('2026', '616', 'extremely_easy', 'en');
  const extEasyPlus = createNewGame('2026', '616', 'extremely_easy_plus', 'en');
  const normal = createNewGame('2026', '616', 'normal', 'en');
  const autoPilot = createNewGame('2026', '616', 'auto_pilot', 'en');

  assert.equal(autoPilot.autoPilotEnabled, true);
  assert.equal(normal.autoPilotEnabled, false);
  assert.equal(getDifficultyConfig('very_easy').id, 'very_easy');
  assert.equal(getDifficultyConfig('extremely_easy').id, 'extremely_easy');
  assert.equal(getFpsCapIntervalMs('unlimited'), 0);
  assert.ok(Math.abs(getFpsCapIntervalMs(144) - 1000 / 144) < 0.01);

  const eeBudget = computeDetailedBudget(extEasy, '616');
  const eepBudget = computeDetailedBudget(extEasyPlus, '616');
  const normBudget = computeDetailedBudget(normal, '616');
  assert.ok(eeBudget.taxIncome > normBudget.taxIncome * 1.9);
  assert.ok(eepBudget.taxIncome > normBudget.taxIncome * 2.1);

  const gerNormPower = computeArmyPower({ infantry: 10000 }, '2026', 'defense', 0, {
    difficulty: 'normal',
    isPlayerSide: false,
  });
  const gerExtPower = computeArmyPower({ infantry: 10000 }, '2026', 'defense', 0, {
    difficulty: 'extreme',
    isPlayerSide: false,
  });
  assert.ok(Math.abs(gerExtPower / gerNormPower - 1.35) < 0.01);

  const plEeAtk = computeArmyPower({ infantry: 10000 }, '2026', 'attack', 0, {
    difficulty: 'extremely_easy',
    isPlayerSide: true,
  });
  const plNormAtk = computeArmyPower({ infantry: 10000 }, '2026', 'attack', 0, {
    difficulty: 'normal',
    isPlayerSide: true,
  });
  assert.ok(Math.abs(plEeAtk / plNormAtk - 1.5) < 0.01);
});

test('Weather modifiers give +25% defense & extra march cost in snow, and -15% armor/air in rain', () => {
  const sunnyDef = computeArmyPower({ infantry: 10000 }, '2026', 'defense', 0, { weather: 'sunny' });
  const snowDef = computeArmyPower({ infantry: 10000 }, '2026', 'defense', 0, { weather: 'snow' });
  assert.ok(Math.abs(snowDef / sunnyDef - 1.25) < 0.01);

  const sunnyTanks = computeArmyPower({ tanks: 10000 }, '2026', 'attack', 0, { weather: 'sunny' });
  const rainTanks = computeArmyPower({ tanks: 10000 }, '2026', 'attack', 0, { weather: 'rain' });
  assert.ok(Math.abs(rainTanks / sunnyTanks - 0.85) < 0.01);

  let state = createNewGame('2026', '616', 'normal', 'pl');
  const polBorder = Object.values(state.provinces).find(
    (p) => p.ownerId === '616' && p.neighbors.some((nId) => state.provinces[nId]?.ownerId === '440'),
  )!;
  polBorder.weather = 'snow';
  const litTarget = polBorder.neighbors.map((id) => state.provinces[id]).find((p) => p.ownerId === '440')!;
  const startMp = state.countries['616'].movementPoints;
  const orderRes = issueArmyOrder(state, polBorder.id, litTarget.id, { infantry: 5000 });
  assert.equal(orderRes.error, undefined);
  assert.equal(orderRes.state.countries['616'].movementPoints, startMp - 2);
});

test('Poland can decisively conquer weaker Lithuania and compute accurate win chance', () => {
  let state = createNewGame('2026', '616', 'normal', 'pl');
  const polBorder = Object.values(state.provinces).find(
    (p) => p.ownerId === '616' && p.neighbors.some((nId) => state.provinces[nId]?.ownerId === '440'),
  )!;
  const litTarget = polBorder.neighbors.map((id) => state.provinces[id]).find((p) => p.ownerId === '440')!;
  litTarget.weather = 'sunny';

  const bigStack = { infantry: 28000, tanks: 10000 };
  polBorder.units = { ...polBorder.units, ...bigStack };
  const chance = calculateWinChance({
    state,
    attackerId: '616',
    attackerUnits: bigStack,
    defenderProvince: litTarget,
  });
  assert.ok(chance.chancePct >= 85, `Expected high win chance against Lithuania, got ${chance.chancePct}%`);

  const orderRes = issueArmyOrder(state, polBorder.id, litTarget.id, bigStack);
  assert.equal(orderRes.error, undefined);
  state = executeTurn(orderRes.state, 'pl');
  assert.equal(state.provinces[litTarget.id].ownerId, '616');
  assert.equal(state.provinces[litTarget.id].assimilated, false);

  const assimRes = assimilateProvince(state, litTarget.id);
  assert.equal(assimRes.error, undefined);
  assert.equal(assimRes.state.provinces[litTarget.id].assimilated, true);
});

test('Treasury tax rate, bank loans, universities, espionage, and vassalization work end-to-end', () => {
  let state = createNewGame('2026', '616', 'normal', 'pl');
  const polProv = Object.values(state.provinces).find((p) => p.ownerId === '616')!;

  const baseBudget = computeDetailedBudget(state, '616');
  state = setTaxRate(state, 32);
  const highTaxBudget = computeDetailedBudget(state, '616');
  assert.ok(highTaxBudget.taxIncome > baseBudget.taxIncome);

  // Build University -> boosts research next turn
  const uniRes = constructBuilding(state, polProv.id, 'university');
  assert.equal(uniRes.error, undefined);
  state = uniRes.state;
  const researchBefore = state.countries['616'].researchPoints;
  state = executeTurn(state, 'pl');
  assert.ok(state.countries['616'].researchPoints > researchBefore + 8);
  assert.ok(state.countries['616'].stability < 92, 'High taxes >25% should erode stability');

  // Take & repay bank loan
  const treasuryBeforeLoan = state.countries['616'].treasury;
  const loanRes = takeBankLoan(state, 60);
  assert.equal(loanRes.error, undefined);
  state = loanRes.state;
  assert.equal(state.countries['616'].loans.length, 1);
  assert.ok(state.countries['616'].treasury >= treasuryBeforeLoan + 59.9);
  const repayRes = repayLoan(state, state.countries['616'].loans[0].id);
  assert.equal(repayRes.error, undefined);
  state = repayRes.state;
  assert.equal(state.countries['616'].loans.length, 0);

  // Deploy spy
  const spyRes = deploySpy(state, '440', 'pl');
  assert.equal(spyRes.error, undefined);
  state = spyRes.state;
  assert.ok(state.countries['440'].spiedUntil >= state.turn + 4);

  // Vassalize a weak nation (e.g. Estonia '233' has ~8.5k vs Poland ~83k)
  const vasRes = proposeDiplomacy(state, '233', 'vassalize', 'pl');
  assert.equal(vasRes.error, undefined);
  state = vasRes.state;
  assert.equal(state.countries['233'].vassalOf, '616');
  assert.ok(state.countries['616'].vassals.includes('233'));
  const vasBudget = computeDetailedBudget(state, '616');
  assert.ok(vasBudget.vassalTributeIncome > 0);
});

test('Recruiting units and constructing buildings deduct treasury and MP correctly', () => {
  let state = createNewGame('2026', '616', 'normal', 'pl');
  const polProv = Object.values(state.provinces).find((p) => p.ownerId === '616')!;
  const startTreasury = state.countries['616'].treasury;
  const startArmy = getTotalUnits(polProv.units);

  const buildRes = constructBuilding(state, polProv.id, 'factory');
  assert.equal(buildRes.error, undefined);
  state = buildRes.state;
  assert.ok(state.provinces[polProv.id].buildings.includes('factory'));
  assert.ok(state.countries['616'].treasury < startTreasury);

  const recRes = recruitUnits(state, polProv.id, 'tanks', 5000);
  assert.equal(recRes.error, undefined);
  state = recRes.state;
  assert.equal(getTotalUnits(state.provinces[polProv.id].units), startArmy + 5000);
});

test('Attacking stronger Germany unprepared fails, Germany counter-attacks and captures Polish territory', () => {
  let state = createNewGame('2026', '616', 'normal', 'pl');
  const initialPolArea = computeCountrySummaries(state)['616'].areaKm2;
  const initialGerArea = computeCountrySummaries(state)['276'].areaKm2;

  const warRes = proposeDiplomacy(state, '276', 'war', 'pl');
  assert.equal(warRes.error, undefined);
  state = warRes.state;
  assert.ok(state.countries['616'].atWarWith.includes('276'));

  const polBorder = Object.values(state.provinces).find(
    (p) => p.ownerId === '616' && p.neighbors.some((nId) => state.provinces[nId]?.ownerId === '276'),
  )!;
  const gerTarget = polBorder.neighbors.map((id) => state.provinces[id]).find((p) => p.ownerId === '276')!;

  const orderRes = issueArmyOrder(state, polBorder.id, gerTarget.id, { infantry: 4000 });
  assert.equal(orderRes.error, undefined);
  state = orderRes.state;

  for (let t = 0; t < 6 && state.outcome === 'ongoing'; t++) {
    state = executeTurn(state, 'pl');
  }

  const finalPolArea = computeCountrySummaries(state)['616'].areaKm2;
  const finalGerArea = computeCountrySummaries(state)['276'].areaKm2;

  assert.ok(finalGerArea > initialGerArea);
  assert.ok(finalPolArea < initialPolArea);
});

test('Top countries ranking reflects China, India, USA, and updates live', () => {
  const state = createNewGame('2026', '616', 'normal', 'pl');
  const top = getTopCountries(state, 5);
  assert.equal(top.length, 5);
  const topIds = top.map((t) => t.countryId);
  assert.ok(topIds.includes('156'));
  assert.ok(topIds.includes('356'));
  assert.ok(topIds.includes('840'));
});

test('Recruiting deducts manpower and enforces honest zero-cheat manpower limit', () => {
  let state = createNewGame('2026', '616', 'normal', 'pl');
  const polProv = Object.values(state.provinces).find((p) => p.ownerId === '616')!;
  const startManpower = state.countries['616'].manpower;

  const okRec = recruitUnits(state, polProv.id, 'infantry', 2000);
  assert.equal(okRec.error, undefined);
  state = okRec.state;
  assert.equal(state.countries['616'].manpower, startManpower - 2000);

  // Deplete manpower below 5,000 while having ample treasury -> recruitment must fail
  state = {
    ...state,
    countries: {
      ...state.countries,
      '616': {
        ...state.countries['616'],
        treasury: 9999,
        manpower: 1500,
      },
    },
  };
  const blocked = recruitUnits(state, polProv.id, 'infantry', 5000);
  assert.ok(blocked.error);
});

test('Bot Spectator Mode runs autonomous AI wars, diplomacy, and chronicle logging without a human player', () => {
  let state = createNewGame('2026', '616', 'normal', 'pl', 'bot_spectator');
  assert.equal(state.gameMode, 'bot_spectator');
  assert.equal(state.playerCountryId, '__SPECTATOR__');
  assert.equal(
    Object.values(state.countries).some((c) => c.isPlayer),
    false,
  );

  for (let i = 0; i < 6 && state.outcome === 'ongoing'; i++) {
    state = executeTurn(state, 'pl');
  }

  assert.equal(state.turn, 7);
  assert.ok(state.chronicle.length >= 2, 'Expected AI wars/events recorded in Chronicle');
});

test('Random Events trigger every 3rd turn in Player Mode and resolve cleanly', () => {
  let state = createNewGame('2026', '616', 'normal', 'pl', 'player');
  state = executeTurn(state, 'pl'); // turn -> 2
  assert.equal(state.pendingEvent, null);
  state = executeTurn(state, 'pl'); // turn -> 3 -> triggers event
  assert.ok(state.pendingEvent, 'Expected pending random event on turn 3');

  const firstChoice = state.pendingEvent!.choices[0];
  const resolved = resolveRandomEvent(state, firstChoice.id);
  assert.equal(resolved.pendingEvent, null);
  assert.ok(resolved.chronicle.some((c) => c.type === 'event'));
});

test('3-tier Auto Performance steps down cleanly Ultra -> Medium -> Light on low FPS', () => {
  const highEnd = { cores: 16, memoryGb: 16, reducedMotion: false, recommendedTier: 'ultra' as const };
  assert.equal(resolveEffectiveTier('auto', 0, highEnd), 'ultra');
  assert.equal(resolveEffectiveTier('auto', 1, highEnd), 'medium');
  assert.equal(resolveEffectiveTier('auto', 2, highEnd), 'light');
  assert.equal(resolveEffectiveTier('medium', 2, highEnd), 'medium');
  assert.equal(resolveEffectiveTier('light', 0, highEnd), 'light');
});

test('Real-time advanceDay progresses daily clock, interpolates march progress, and preserves army sum', () => {
  let state = createNewGame('2026', '616', 'normal', 'en', 'player');
  assert.equal(state.simPaused, true);
  assert.equal(state.day, 1);
  const startTotalDays = state.totalDays;

  const exactBefore = getExactCountryArmy(state, '616');
  const polBorder = Object.values(state.provinces).find(
    (p) => p.ownerId === '616' && p.neighbors.some((nId) => state.provinces[nId]?.ownerId === '440'),
  )!;
  const litTarget = polBorder.neighbors
    .map((id) => state.provinces[id])
    .find((p) => p.ownerId === '440')!;
  litTarget.weather = 'sunny';

  const bigStack = { infantry: 24000, tanks: 8000 };
  polBorder.units = { ...polBorder.units, infantry: (polBorder.units.infantry ?? 0) + 24000, tanks: (polBorder.units.tanks ?? 0) + 8000 };
  const exactAdded = getExactCountryArmy(state, '616');
  assert.equal(exactAdded, exactBefore + 32000);

  const orderRes = issueArmyOrder(state, polBorder.id, litTarget.id, bigStack);
  assert.equal(orderRes.error, undefined);
  state = orderRes.state;
  assert.equal(state.orders.length, 1);
  assert.equal(getExactCountryArmy(state, '616'), exactAdded);

  // Cancel & refund test
  const refunded = cancelOrder(state, state.orders[0].id);
  assert.equal(refunded.orders.length, 0);
  assert.equal(getExactCountryArmy(refunded, '616'), exactAdded);

  // Advance 1 day -> order progresses smoothly without resolving yet
  state = advanceDay(state, 'en');
  assert.equal(state.totalDays, startTotalDays + 1);
  assert.equal(state.day, 2);
  assert.ok(state.orders.length === 1);
  assert.ok(state.orders[0].progress > 0 && state.orders[0].progress < 1);

  // Advance enough days for arrival & conquest
  for (let d = 0; d < 6; d++) {
    state = advanceDay(state, 'en');
  }
  assert.equal(state.orders.length, 0);
  assert.equal(state.provinces[litTarget.id].ownerId, '616');
});

test('Interactive Visual Tech Tree plans prerequisite paths, unlocks nodes, and auto-advances queue', () => {
  let state = createNewGame('2026', '616', 'normal', 'en', 'player');
  state = {
    ...state,
    countries: {
      ...state.countries,
      '616': { ...state.countries['616'], researchPoints: 25 },
    },
  };

  // Tier 2 mil_armor requires Tier 1 mil_doctrine (cost 20 RP)
  const blocked = researchTechNode(state, 'mil_armor');
  assert.ok(blocked.error, 'Cannot jump directly to Tier 2 without prerequisite');

  // Plan path to mil_armor -> immediately unlocks mil_doctrine (20 RP) and queues mil_armor
  const planned = planTechTreePath(state, 'mil_armor');
  assert.deepEqual(planned.path, ['mil_doctrine', 'mil_armor']);
  state = planned.state;
  assert.ok(state.countries['616'].unlockedTechs.includes('mil_doctrine'));
  assert.ok(state.countries['616'].techQueue.includes('mil_armor'));

  // Clear queue works cleanly
  const cleared = clearTechQueue(state);
  assert.equal(cleared.countries['616'].techQueue.length, 0);
});

test('Covert Black Ops, Nuclear Strikes, Orbital Shield Interception, and Space & Ocean Colonies work end-to-end', () => {
  let state = createNewGame('2026', '616', 'normal', 'en', 'player');
  const polCap = state.provinces['616_p0'];
  const gerCap = Object.values(state.provinces).find((p) => p.ownerId === '276' && p.isCapital)!;

  state = {
    ...state,
    countries: {
      ...state.countries,
      '616': {
        ...state.countries['616'],
        treasury: 600,
        researchPoints: 300,
        unlockedTechs: [
          'mil_doctrine',
          'mil_armor',
          'mil_aerospace',
          'mil_missiles',
          'mil_thermonuclear',
          'eco_fusion',
          'log_supply',
          'log_naval_corridors',
          'log_orbital_shields',
        ],
      },
    },
  };

  // Black Op: Steal Tech (+18 RP)
  const rpBefore = state.countries['616'].researchPoints;
  const opRes = executeBlackOp(state, '276', 'steal_tech', 'en');
  assert.equal(opRes.error, undefined);
  state = opRes.state;
  assert.equal(state.countries['616'].researchPoints, rpBefore + 18);

  // Build Missile Silo & Spaceport
  const siloRes = constructBuilding(state, polCap.id, 'missile_silo');
  assert.equal(siloRes.error, undefined);
  state = siloRes.state;

  const spRes = constructBuilding(state, polCap.id, 'spaceport');
  assert.equal(spRes.error, undefined);
  state = spRes.state;

  // Assemble Thermonuclear Warhead
  const whRes = buildThermonuclearWarhead(state);
  assert.equal(whRes.error, undefined);
  state = whRes.state;
  assert.equal(state.countries['616'].nuclearWarheads, 1);

  // Unshielded nuclear strike triggers Nuclear Winter & devastation
  const strike1 = launchStrategicStrike(state, gerCap.id, true, 'en');
  assert.equal(strike1.error, undefined);
  state = strike1.state;
  assert.ok(state.nuclearWinterLevel > 0);
  assert.ok((state.provinces[gerCap.id].nuclearDevastation ?? 0) > 0);

  // Shielded nation intercepts strike via Orbital Laser Shield
  state = {
    ...state,
    countries: {
      ...state.countries,
      '616': { ...state.countries['616'], nuclearWarheads: 1 },
      '276': { ...state.countries['276'], orbitalShieldActive: true },
    },
  };
  const winterBefore = state.nuclearWinterLevel;
  const strike2 = launchStrategicStrike(state, gerCap.id, true, 'en');
  assert.equal(strike2.error, undefined);
  state = strike2.state;
  assert.equal(state.nuclearWinterLevel, winterBefore);
  assert.equal(state.recentMissiles[0].intercepted, true);

  // Fund Low Earth Orbit Station in Space & Ocean Agency -> boosts Space Income
  const colRes = fundSpaceOceanColony(state, 'leo_blocks_station', 'en');
  assert.equal(colRes.error, undefined);
  state = colRes.state;
  assert.ok(state.countries['616'].spaceColonies.includes('leo_blocks_station'));
  assert.ok(computeDetailedBudget(state, '616').spaceOceanIncome > 0);
});

test('Cabinet, Global Market, World Council, Megaprojects, Tactical Advisor, and Custom Scenario Editor work cleanly', () => {
  let state = createNewGame('2026', '616', 'normal', 'en', 'player', {
    id: 'cust_1',
    name: 'Test Custom Order',
    baseScenarioId: '2026',
    provinceOwnerOverrides: {},
    treasuryOverrides: { '616': 400 },
    armyMultipliers: { '616': 1.5 },
    wars: [['616', '276']],
    alliances: [['616', '250']],
    createdAt: Date.now(),
  });

  assert.equal(state.countries['616'].treasury, 400);
  assert.ok(state.countries['616'].atWarWith.includes('276'));
  assert.ok(state.countries['616'].allies.includes('250'));

  const advisor = analyzeTacticalSituation(state, 'en');
  assert.ok(advisor.headline.length > 0 && advisor.body.length > 0);

  // Appoint minister & trade market
  const minRes = appointMinister(state, 'finance', 'min_fin_growth');
  assert.equal(minRes.error, undefined);
  state = minRes.state;
  assert.equal(state.countries['616'].cabinet.finance, 'min_fin_growth');

  const buyRes = tradeMarketResource(state, 'steel', 'buy', 5);
  assert.equal(buyRes.error, undefined);
  state = buyRes.state;
  assert.ok(state.countries['616'].stockpiles.steel >= 5);

  const voted = voteWorldCouncil(state, 'yes');
  assert.equal(voted.worldCouncil.playerVoted, 'yes');

  // Unlock fusion tech -> build Fusion Core megaproject
  state = {
    ...voted,
    countries: {
      ...voted.countries,
      '616': {
        ...voted.countries['616'],
        treasury: 500,
        unlockedTechs: [...voted.countries['616'].unlockedTechs, 'eco_fusion'],
      },
    },
  };
  const megaRes = buildMegaproject(state, 'fusion_core');
  assert.equal(megaRes.error, undefined);
  assert.ok(megaRes.state.countries['616'].megaprojects.includes('fusion_core'));
});

test('EXTREME+ difficulty enforces +75% AI economy, +55% AI defense, and global anti-player coalitions', () => {
  const normal = createNewGame('2026', '616', 'normal', 'en');
  let extPlus = createNewGame('2026', '616', 'extreme_plus', 'en', 'player', null, {
    peacefulStartEnabled: false,
  });

  const gerNormPower = computeArmyPower({ infantry: 10000 }, '2026', 'defense', 0, {
    difficulty: 'normal',
    isPlayerSide: false,
  });
  const gerExtPlusPower = computeArmyPower({ infantry: 10000 }, '2026', 'defense', 0, {
    difficulty: 'extreme_plus',
    isPlayerSide: false,
  });
  assert.ok(Math.abs(gerExtPlusPower / gerNormPower - 1.55) < 0.01);

  const gerNormTax = computeDetailedBudget(normal, '276').taxIncome;
  const gerExtPlusTax = computeDetailedBudget(extPlus, '276').taxIncome;
  assert.ok(Math.abs(gerExtPlusTax / gerNormTax - 1.85) < 0.05);

  for (let d = 0; d < 12; d++) {
    extPlus = advanceDay(extPlus, 'en');
  }
  assert.ok(
    extPlus.countries['616'].atWarWith.length >= 1,
    'EXTREME+ AI should form a coalition against the player',
  );
  assert.ok(
    extPlus.chronicle.some((c) => c.title.includes('Coalition')),
    'Chronicle should record EXTREME+ Global Coalition formation',
  );
});

test('Czechia 45k army decisively defeats Slovakia 20k army and captures territory', () => {
  let state = createNewGame('2026', '203', 'normal', 'en');
  const slovakProv = Object.values(state.provinces).find(
    (p) => p.ownerId === '703' && p.neighbors.some((nId) => state.provinces[nId]?.ownerId === '203'),
  ) ?? Object.values(state.provinces).find((p) => p.ownerId === '703')!;
  const czechProv = Object.values(state.provinces).find(
    (p) => p.ownerId === '203' && p.neighbors.includes(slovakProv.id),
  )!;
  assert.ok(czechProv && slovakProv);
  assert.ok(czechProv.neighbors.includes(slovakProv.id));

  czechProv.units = { infantry: 45000 };
  slovakProv.units = { infantry: 20000 };
  slovakProv.weather = 'sunny';

  const orderRes = issueArmyOrder(state, czechProv.id, slovakProv.id, { infantry: 45000 });
  assert.equal(orderRes.error, undefined);
  state = orderRes.state;

  for (let d = 0; d < 6; d++) {
    state = advanceDay(state, 'en');
  }
  assert.equal(state.provinces[slovakProv.id].ownerId, '203');
  assert.ok(state.battlesFought >= 1);
  assert.ok(state.recentBattles.length >= 1);
});

test('Automatic adjacent border reserve reinforcement transfers adjacent troops cleanly', () => {
  let state = createNewGame('2026', '276', 'normal', 'en');
  const gerBorder = Object.values(state.provinces).find(
    (p) => p.ownerId === '276' && p.neighbors.some((nId) => state.provinces[nId]?.ownerId === '616'),
  )!;
  const targetPolProv = gerBorder.neighbors
    .map((nId) => state.provinces[nId])
    .find((p) => p.ownerId === '616')!;
  const adjPolProv = targetPolProv.neighbors
    .map((nId) => state.provinces[nId])
    .find((p) => p.ownerId === '616' && p.id !== gerBorder.id)!;
  assert.ok(gerBorder && targetPolProv && adjPolProv);

  // Set clear reserve garrison on adjacent Polish province so reserves trigger cleanly
  adjPolProv.units = { infantry: 12000 };
  // Zero out other neighboring Polish garrisons except adjPolProv to assert exact transfer
  for (const nId of targetPolProv.neighbors) {
    const np = state.provinces[nId];
    if (np && np.ownerId === '616' && np.id !== adjPolProv.id) {
      np.units = { infantry: 1000 };
    }
  }
  targetPolProv.units = { infantry: 50000 };
  gerBorder.units = { infantry: 4000 };

  const orderRes = issueArmyOrder(state, gerBorder.id, targetPolProv.id, { infantry: 3000 });
  assert.equal(orderRes.error, undefined);
  state = orderRes.state;

  const adjBefore = getTotalUnits(state.provinces[adjPolProv.id].units);
  for (let d = 0; d < 6; d++) {
    state = advanceDay(state, 'en');
  }
  const adjAfter = getTotalUnits(state.provinces[adjPolProv.id].units);
  assert.equal(adjBefore, 12000);
  assert.equal(adjAfter, 9000, 'Expected 25% reserve dispatch (3,000) from adjacent border province');
});

test('City Recon dataset maps Warsaw and Jastrzębie-Zdrój accurately with zero-key Esri & Street View URLs', () => {
  const warsaw = MAJOR_CITIES.find((c) => c.id === 'warsaw');
  const jastrzebie = MAJOR_CITIES.find((c) => c.id === 'jastrzebie_zdroj');
  assert.ok(warsaw && jastrzebie);
  assert.equal(jastrzebie.provinceId, '616_p1');

  const pt = projectLonLat(jastrzebie.lng, jastrzebie.lat);
  assert.ok(pt && pt[0] > 0 && pt[1] > 0);

  const tile = latLngToEsriTile(jastrzebie.lat, jastrzebie.lng, 14);
  assert.equal(tile.z, 14);
  assert.ok(tile.x > 0 && tile.y > 0);
  const esriUrl = getEsriTileUrl(tile.z, tile.x, tile.y);
  assert.ok(esriUrl.startsWith('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery'));

  const streetUrl = getGoogleMapsStreetViewUrl(jastrzebie.lat, jastrzebie.lng);
  assert.ok(streetUrl.includes('map_action=pano'));
  assert.ok(!streetUrl.includes('key='));
});

test('Sandbox 2026 scenario has zero initial wars/alliances and Greenland (304) + Nuuk are playable', () => {
  const state = createNewGame('sandbox', '304', 'normal', 'en');
  assert.equal(state.scenarioId, 'sandbox');
  assert.ok(state.countries['304'], 'Greenland (304) must exist in world atlas');
  assert.ok(
    Object.values(state.provinces).some((p) => p.ownerId === '304'),
    'Greenland (304) must have clickable provinces',
  );
  assert.equal(
    Object.values(state.countries).some((c) => c.atWarWith.length > 0),
    false,
    'Sandbox should start with zero forced wars',
  );
  assert.equal(
    Object.values(state.countries).some((c) => c.allies.length > 0),
    false,
    'Sandbox should start with zero forced alliances',
  );
  const nuuk = MAJOR_CITIES.find((c) => c.id === 'nuuk');
  assert.ok(nuuk && nuuk.countryCode === '304', 'Nuuk should be mapped to Greenland 304');
});

test('Auto-Pilot mid-game toggle, 5-second rapid airlift unit conservation, and map pulses work cleanly', () => {
  let state = createNewGame('2026', '616', 'normal', 'en');
  assert.equal(state.autoPilotEnabled, false);
  state = toggleAutoPilot(state);
  assert.equal(state.autoPilotEnabled, true);

  // Give rear province large garrison & frontline province small garrison to verify honest airlift transfer
  const polProvs = Object.values(state.provinces).filter((p) => p.ownerId === '616');
  const rear = polProvs.find((p) =>
    p.neighbors.every((nId) => state.provinces[nId]?.ownerId === '616'),
  ) ?? polProvs[0];
  const front = polProvs.find(
    (p) => p.id !== rear.id && p.neighbors.some((nId) => state.provinces[nId]?.ownerId !== '616'),
  ) ?? polProvs[1];
  rear.units = { infantry: 30000 };
  front.units = { infantry: 2000 };

  const armyBefore = getExactCountryArmy(state, '616');
  const airliftRes = triggerAutoPilotAirliftNow(state, 'en');
  assert.equal(airliftRes.didAirlift, true);
  state = airliftRes.state;
  assert.ok((state.airliftVisuals?.length ?? 0) >= 1, 'Expected animated airlift visual vector');
  assert.ok(state.mapPulses.some((p) => p.kind === 'airlift'), 'Expected airlift map pulse');

  // Re-run command without recruitment to verify total units conserved during airlift
  const armyAfter = getExactCountryArmy(state, '616');
  assert.ok(armyAfter >= armyBefore, 'Conserved + any honestly recruited troops');

  // Verify manual recruit emits 'recruit' pulse
  const recRes = recruitUnits(state, front.id, 'infantry', 2000);
  assert.equal(recRes.error, undefined);
  assert.ok(recRes.state.mapPulses.some((p) => p.kind === 'recruit'));

  // Direct runAutoPilotCommand test when manpower=0 strictly blocks recruitment without cheating
  state.countries['616'].manpower = 0;
  const zeroRecBefore = getExactCountryArmy(state, '616');
  const cmdRes = runAutoPilotCommand(state, 'en', { allowAirlift: true });
  assert.equal(cmdRes.didRecruit, false);
  assert.equal(getExactCountryArmy(cmdRes.state, '616'), zeroRecBefore);
});

test('EXTREMELY EASY+ Emergency Comeback Protocol rescues player at war after severe territorial loss', () => {
  let state = createNewGame('2026', '616', 'extremely_easy_plus', 'en');
  const polProvs = Object.values(state.provinces).filter((p) => p.ownerId === '616');
  // Simulate player losing 14 of 16 provinces while at war with Germany
  for (let i = 2; i < polProvs.length; i++) {
    state.provinces[polProvs[i].id].ownerId = '276';
  }
  state.countries['616'].atWarWith = ['276'];
  state.countries['276'].atWarWith = ['616'];
  state.countries['616'].treasury = 5;
  polProvs[0].units = { infantry: 1500 };

  const rescued = advanceDay(state, 'en');
  assert.equal(rescued.comebackTriggeredCount, 1);
  assert.ok(rescued.countries['616'].treasury >= 140);
  assert.ok(getTotalUnits(rescued.provinces[polProvs[0].id].units) >= 15500);
  assert.ok(rescued.mapPulses.some((p) => p.kind === 'comeback'));
});

test('Global Warming Index evolves dynamically and climate random events update target province & index', () => {
  let state = createNewGame('2026', '616', 'normal', 'en');
  const baseWarming = state.globalWarmingIndex;
  assert.ok(baseWarming >= 20);

  // Advance until first climate/random event (turn 3 or 6)
  for (let t = 0; t < 5 && !state.pendingEvent?.isClimateEvent; t++) {
    if (state.pendingEvent && !state.pendingEvent.isClimateEvent) {
      state = resolveRandomEvent(state, state.pendingEvent.choices[0].id);
    }
    state = executeTurn(state, 'en');
  }
  assert.ok(state.pendingEvent?.isClimateEvent, 'Expected a province-specific climate event');
  assert.ok(state.pendingEvent?.targetProvinceId, 'Expected target province on climate event');

  const warmBeforeChoice = state.globalWarmingIndex;
  const resolved = resolveRandomEvent(state, state.pendingEvent!.choices[0].id);
  assert.equal(resolved.pendingEvent, null);
  assert.notEqual(resolved.globalWarmingIndex, warmBeforeChoice);
  assert.ok(resolved.mapPulses.some((p) => p.kind === 'climate'));
});

test('VERSION 3.0 World Conquest mode grants +300% income (4.0x), +150% attack (2.5x), logistics lv.3 & extreme climate immunity', () => {
  const wc = createNewGame('2026', '616', 'world_conquest', 'en');
  const norm = createNewGame('2026', '616', 'normal', 'en');
  assert.equal(wc.countries['616'].tech.logistics, 3);
  assert.ok(wc.countries['616'].treasury >= 240);

  const wcBudget = computeDetailedBudget(wc, '616');
  const normBudget = computeDetailedBudget(norm, '616');
  assert.ok(wcBudget.taxIncome > normBudget.taxIncome * 3.8);

  const wcAtk = computeArmyPower({ infantry: 10000 }, '2026', 'attack', 0, {
    difficulty: 'world_conquest',
    isPlayerSide: true,
    temperatureC: -30,
    logisticsTechLevel: 0,
  });
  const normColdAtk = computeArmyPower({ infantry: 10000 }, '2026', 'attack', 0, {
    difficulty: 'normal',
    isPlayerSide: true,
    temperatureC: -30,
    logisticsTechLevel: 0,
  });
  assert.ok(wcAtk / normColdAtk > 2.5);
});

test('Regional Celsius temperatures & thermal colors respond to latitude and Logistics mitigates cold/heat attrition', () => {
  const state = createNewGame('2026', '616', 'normal', 'en');
  const greenland = Object.values(state.provinces).find((p) => p.ownerId === '304')!;
  const nigeria = Object.values(state.provinces).find((p) => p.ownerId === '566') ?? Object.values(state.provinces).find((p) => p.ownerId === '818')!;
  assert.ok(typeof greenland.temperatureC === 'number');
  assert.ok(greenland.temperatureC < nigeria.temperatureC, 'Arctic Greenland should be colder than tropical Africa');
  assert.equal(temperatureToHex(-25), '#1D4ED8');
  assert.equal(temperatureToHex(40), '#DC2626');

  const noTech = getExtremeClimateAttrition(-22, 0, false);
  const withLog = getExtremeClimateAttrition(-22, 1, false);
  assert.ok(noTech.isExtreme && noTech.attritionRate > 0);
  assert.equal(withLog.attritionRate, 0);
});

test('Instant War Auto-Pilot triggers border mobilization & 5s countdown, and Railways triple speed & unlock Armored Trains', () => {
  let state = createNewGame('sandbox', '616', 'normal', 'en');
  state = toggleAutoPilot(state);
  const armyBeforeWar = getExactCountryArmy(state, '616');

  const warRes = proposeDiplomacy(state, '112', 'war', 'en');
  assert.equal(warRes.error, undefined);
  state = warRes.state;
  assert.ok(state.autoPilotNextAirliftAt > Date.now() - 1000, 'Expected 5-second airlift countdown scheduled on war declaration');
  assert.ok(getExactCountryArmy(state, '616') > armyBeforeWar, 'Expected immediate Auto-Pilot border mobilization');

  // Railway enables Armored Trains & 3x speed marches
  const polBorder = Object.values(state.provinces).find(
    (p) => p.ownerId === '616' && p.neighbors.some((nId) => state.provinces[nId]?.ownerId === '112'),
  )!;
  const target = polBorder.neighbors.map((id) => state.provinces[id]).find((p) => p.ownerId === '112')!;

  const blockedTrain = recruitUnits(state, polBorder.id, 'armored_train', 1000);
  assert.ok(blockedTrain.error, 'Armored Train should require Railway building');

  const railBuild = constructBuilding(state, polBorder.id, 'railway');
  assert.equal(railBuild.error, undefined);
  state = railBuild.state;

  const trainOk = recruitUnits(state, polBorder.id, 'armored_train', 1000);
  assert.equal(trainOk.error, undefined);
  state = trainOk.state;

  const railMarch = issueArmyOrder(state, polBorder.id, target.id, { armored_train: 1000, infantry: 1000 });
  assert.equal(railMarch.error, undefined);
  const order = railMarch.state.orders[railMarch.state.orders.length - 1];
  assert.equal(order.isRail, true);
  assert.ok(order.durationDays <= 2, `Railway should triple march speed (durationDays=${order.durationDays})`);
});

test('Custom Unit Designer, Orbital Spy Satellites, Maritime Strait Blockades, and City Reconstruction work cleanly', () => {
  let state = createNewGame('sandbox', '616', 'en');
  state.countries['616'].treasury = 300;

  // Custom Unit Designer
  const bpRes = designCustomUnit(state, { name: 'PL-01 Apex', category: 'tanks', armor: 9, speed: 8, firepower: 10 }, 'en');
  assert.equal(bpRes.error, undefined);
  state = bpRes.state;
  assert.equal(state.customBlueprints.length, 1);
  const boostedTankAtk = computeArmyPower({ tanks: 10000 }, '2026', 'attack', 0, {
    isPlayerSide: true,
    customBlueprints: state.customBlueprints,
  });
  const baseTankAtk = computeArmyPower({ tanks: 10000 }, '2026', 'attack', 0, { isPlayerSide: true });
  assert.ok(boostedTankAtk > baseTankAtk, 'Custom tank blueprint must boost tank combat power');

  // Orbital Spy Satellite
  const satRes = launchSpySatellite(state, '643', 'en');
  assert.equal(satRes.error, undefined);
  state = satRes.state;
  assert.equal(state.activeSatellites.length, 1);
  assert.ok(state.countries['643'].spiedUntil >= state.turn + 8);

  // Strait Blockade requires Naval Port or Fleet first, then reduces wartime enemy trade by 35%
  const warRes = proposeDiplomacy(state, '643', 'war', 'en');
  state = warRes.state;
  const blockedEarly = toggleStraitBlockade(state, 'baltic', 'en');
  assert.ok(blockedEarly.error, 'Strait blockade should require Port or Naval Fleet');
  const coastProv = Object.values(state.provinces).find((p) => p.ownerId === '616' && p.seaNeighbors.length > 0)!;
  const portBuild = constructBuilding(state, coastProv.id, 'port');
  assert.equal(portBuild.error, undefined);
  state = portBuild.state;
  const rusTradeBefore = computeDetailedBudget(state, '643').tradeIncome;
  const blkRes = toggleStraitBlockade(state, 'baltic', 'en');
  assert.equal(blkRes.error, undefined);
  state = blkRes.state;
  const rusTradeAfter = computeDetailedBudget(state, '643').tradeIncome;
  assert.ok(Math.abs(rusTradeAfter / rusTradeBefore - 0.65) < 0.05);

  // City Reconstruction repairs devastation & boosts province economy
  const cap = state.provinces['616_p0'];
  cap.nuclearDevastation = 45;
  const ecoBefore = cap.economy;
  const recCity = reconstructProvinceCity(state, cap.id, 'en');
  assert.equal(recCity.error, undefined);
  assert.equal(recCity.state.provinces[cap.id].nuclearDevastation, 0);
  assert.ok(recCity.state.provinces[cap.id].economy > ecoBefore);
});

test('V4.0 World Atlas includes Polar Antarctica sectors, Svalbard, Greenland, and Singapore', () => {
  const state = createNewGame('2026', '616', 'normal', 'en');
  for (const id of ['010_arctowski', '010_amundsen', '010_vostok', '010_concordia', '744', '304', '702']) {
    assert.ok(state.countries[id], `Expected country ${id} in 2026 world atlas`);
    const provs = Object.values(state.provinces).filter((p) => p.ownerId === id);
    assert.ok(provs.length >= 1, `Expected clickable province for ${id}`);
  }
});

test('V4.0 True 100% World Conquest victory triggers only at 100% ownership and Eternal Empire continues', () => {
  let state = createNewGame('2026', '616', 'normal', 'en', 'player', null, {
    peacefulStartEnabled: false,
  });
  const allProvIds = Object.keys(state.provinces);
  // 99% ownership must NOT trigger victory
  for (let i = 0; i < allProvIds.length - 1; i++) {
    state.provinces[allProvIds[i]].ownerId = '616';
  }
  state = advanceDay(state, 'en');
  assert.equal(state.outcome, 'ongoing', 'Must not trigger victory below 100% world conquest');

  // 100% ownership triggers victory
  state.provinces[allProvIds[allProvIds.length - 1]].ownerId = '616';
  state = advanceDay(state, 'en');
  assert.equal(state.outcome, 'victory', '100% world conquest must trigger victory');

  // Eternal Empire continues sandbox play
  const eternal = continueEternalEmpire(state);
  assert.equal(eternal.outcome, 'ongoing');
  assert.equal(eternal.eternalEmpireMode, true);
  const nextEternal = advanceDay(eternal, 'en');
  assert.equal(nextEternal.outcome, 'ongoing', 'Eternal Empire mode stays ongoing after victory');
});

test('V4.0 Commander XP leveling, ranks, and animated XP popups update cleanly', () => {
  let state = createNewGame('2026', '616', 'normal', 'en');
  assert.equal(state.commanderLevel, 1);
  assert.equal(state.commanderRankId, 'cadet');

  state = grantCommanderXp(state, 500, 'Campaign Victory');
  assert.ok(state.commanderLevel >= 4);
  assert.notEqual(state.commanderRankId, 'cadet');
  assert.ok(state.xpPopups.length >= 1);
  assert.equal(state.xpPopups[0].amount, 500);
});

test('V4.0 Peaceful Start suppresses Turn-1 wars & War Acceptance Modal handles Veto vs Accept (and locks veto on Extreme Ultra Impossible)', () => {
  let state = createNewGame('1939', '616', 'normal', 'en', 'player', null, {
    peacefulStartEnabled: true,
    aiAggressiveness: 'hyper',
  });
  // Peaceful Start suppresses Turn-1 initial war in 1939 scenario
  assert.equal(state.countries['616'].atWarWith.length, 0, 'Peaceful Start should prevent Turn-1 wars on campaign start');

  const noPeaceState = createNewGame('1939', '616', 'normal', 'en', 'player', null, {
    peacefulStartEnabled: false,
  });
  assert.ok(noPeaceState.countries['616'].atWarWith.length > 0, '1939 scenario starts at war when Peaceful Start is OFF');

  // Can toggle Peaceful Start off mid-game
  state = togglePeacefulStart(state, false);
  assert.equal(state.peacefulStartEnabled, false);

  // Pending War Prompt can be vetoed if DP is sufficient
  state = {
    ...state,
    countries: {
      ...state.countries,
      '616': { ...state.countries['616'], diplomacyPoints: 6 },
    },
    pendingWarPrompt: {
      id: 'wp_test',
      attackerId: '643',
      attackerName: 'Russia',
      reason: 'Border mobilization',
      totalAttackerArmy: 120000,
      vetoDpCost: 3,
      vetoAllowed: true,
      coalitionAllies: [],
    },
  };
  const vetoed = resolveWarPrompt(state, false, 'en');
  assert.equal(vetoed.error, undefined);
  assert.equal(vetoed.state.pendingWarPrompt, null);
  assert.ok(!vetoed.state.countries['616'].atWarWith.includes('643'));
  assert.ok((vetoed.state.countries['616'].truceWith['643'] ?? 0) >= 4);

  // Veto blocked in EXTREME ULTRA IMPOSSIBLE
  const euiState = {
    ...createNewGame('2026', '616', 'extreme_ultra_impossible', 'en'),
    pendingWarPrompt: {
      id: 'wp_eui',
      attackerId: '643',
      attackerName: 'Russia',
      reason: 'Global Coalition',
      totalAttackerArmy: 250000,
      vetoDpCost: 3,
      vetoAllowed: false,
      coalitionAllies: ['112'],
    },
  };
  const blockedVeto = resolveWarPrompt(euiState, false, 'en');
  assert.ok(blockedVeto.error, 'Veto must be rejected on extreme_ultra_impossible');
  const accepted = resolveWarPrompt(euiState, true, 'en');
  assert.equal(accepted.error, undefined);
  assert.ok(accepted.state.countries['616'].atWarWith.includes('643'));
});

test('V4.0 Article 5 Collective Defense & Allied Liberation Territory Transfer work deterministically', () => {
  let state = createNewGame('2026', '616', 'normal', 'en', 'player', null, {
    peacefulStartEnabled: false,
    uiMode: 'ultra_realistic',
  });
  // Form alliance between Poland (616) and Lithuania (440)
  state.countries['616'].allies = ['440'];
  state.countries['440'].allies = ['616'];
  // Russia (643) accepts war prompt against Poland -> Lithuania must auto-join via Article 5
  state.pendingWarPrompt = {
    id: 'wp_art5',
    attackerId: '643',
    attackerName: 'Russia',
    reason: 'Invasion',
    totalAttackerArmy: 100000,
    vetoDpCost: 3,
    vetoAllowed: true,
    coalitionAllies: [],
  };
  const warRes = resolveWarPrompt(state, true, 'en');
  state = warRes.state;
  assert.ok(state.countries['440'].atWarWith.includes('643'), 'Ally Lithuania must auto-join via Article 5');

  // Allied Liberation: Russia occupies a Lithuanian province, Poland reconquers it -> auto-transfers back to Lithuania
  const litProv = Object.values(state.provinces).find((p) => p.originalCountryId === '440')!;
  const polProv = Object.values(state.provinces).find(
    (p) => p.ownerId === '616' && p.neighbors.includes(litProv.id),
  )!;
  assert.ok(litProv && polProv);
  litProv.ownerId = '643';
  litProv.units = { infantry: 500 };
  polProv.units = { infantry: 35000 };
  const marchRes = issueArmyOrder(state, polProv.id, litProv.id, { infantry: 30000 });
  assert.equal(marchRes.error, undefined);
  state = marchRes.state;
  for (let d = 0; d < 6; d++) {
    state = advanceDay(state, 'en');
  }
  assert.equal(
    state.provinces[litProv.id].ownerId,
    '440',
    'Liberated allied core province must return to ally 440',
  );
});

test('V4.0 Dynamic Country-Aware Covert Graffiti writes slogan & pulses onto province', () => {
  let state = createNewGame('2026', '616', 'normal', 'en');
  state.countries['616'].treasury = 300;
  state.countries['276'].spiedUntil = state.turn + 5;
  const berlin = Object.values(state.provinces).find((p) => p.ownerId === '276')!;
  const opRes = executeBlackOp(state, '276', 'graffiti_vandalism', 'en', {
    targetProvinceId: berlin.id,
    customSlogan: 'SOLIDARITY FOREVER!',
  });
  assert.equal(opRes.error, undefined);
  state = opRes.state;
  assert.equal(state.provinces[berlin.id].graffitiTag?.slogan, 'SOLIDARITY FOREVER!');
  assert.ok(state.graffitiVisuals.some((g) => g.provinceId === berlin.id && g.slogan === 'SOLIDARITY FOREVER!'));
  assert.ok(state.mapPulses.some((p) => p.kind === 'graffiti'));
});

test('V4.0 Custom Nation, Budget Sliders, Province Actions, Ancient Faiths, Historic Empires, Generals, Legacy Perks, Peace Conference & AI Aggressiveness', () => {
  const customCfg = {
    id: '999',
    name: 'Baltic Republic',
    capitalName: 'Gdynia',
    colorHex: '#06B6D4',
    ideology: 'republic' as const,
    religion: 'catholic' as const,
    culture: 'west_slavic' as const,
    provinceIds: ['616_p10', '616_p13'],
    flag: { layout: 'bicolor_h' as const, colors: ['#06B6D4', '#FFFFFF'] as [string, string], emblem: 'star_center' as const },
  };
  let state = createNewGame('2026', '616', 'normal', 'en', 'player', null, {
    aiAggressiveness: 'hyper',
    uiMode: 'ultra_realistic',
    customNation: customCfg,
  });
  assert.equal(state.playerCountryId, '999');
  assert.equal(state.countries['999'].displayName, 'Baltic Republic');
  assert.equal(state.aiAggressiveness, 'hyper');
  assert.ok(AI_AGGRESSIVENESS_CONFIG.hyper.warFreqMult > AI_AGGRESSIVENESS_CONFIG.friendly.warFreqMult);

  state.countries['999'].treasury = 500;
  state.countries['999'].diplomacyPoints = 20;
  state.countries['999'].legacyPoints = 120;
  const provId = '616_p10';

  // Budget Sliders
  state = updateBudgetSliders(state, { taxRate: 18, goodsSpending: 15, researchSpending: 16 });
  assert.equal(state.countries['999'].budgetSliders?.goodsSpending, 15);
  assert.equal(state.countries['999'].taxRate, 18);

  // Develop & Missionaries
  const devRes = developProvince(state, provId, 'en');
  assert.equal(devRes.error, undefined);
  state = devRes.state;
  assert.ok(state.provinces[provId].development > 1);

  const misRes = sendMissionaries(state, provId, 'en');
  assert.equal(misRes.error, undefined);
  state = misRes.state;

  // Ancient Faith Resurrection
  const faithRes = resurrectAncientFaith(state, 'slavic_rodzimowierstwo', 'en');
  assert.equal(faithRes.error, undefined);
  state = faithRes.state;
  assert.equal(state.countries['999'].religion, 'slavic_rodzimowierstwo');

  // Generals & Legacy Perks
  const beforeGens = state.countries['999'].generals.length;
  const genRes = recruitGeneral(state, 'armor', 'en');
  assert.equal(genRes.error, undefined);
  state = genRes.state;
  assert.equal(state.countries['999'].generals.length, beforeGens + 1);

  const legRes = unlockLegacyPerk(state, 'leg_iron_discipline', 'en');
  assert.equal(legRes.error, undefined);
  state = legRes.state;
  assert.ok(state.countries['999'].unlockedLegacyPerks.includes('leg_iron_discipline'));

  // Relations, Extended Diplomacy & Peace Conference
  const relRes = adjustRelations(state, '112', 'improve', 'en');
  assert.equal(relRes.error, undefined);
  state = relRes.state;
  assert.ok((state.countries['999'].relations['112'] ?? 0) > 0);

  const extRes = proposeExtendedDiplomacy(state, '112', 'guarantee', 'en');
  assert.equal(extRes.error, undefined);
  state = extRes.state;
  assert.ok(state.countries['999'].guarantees.includes('112'));

  // Historic Empire Reformation (give 20 provinces)
  const extraProvs = Object.keys(state.provinces).slice(0, 20);
  for (const pid of extraProvs) state.provinces[pid].ownerId = '999';
  const empRes = reformHistoricEmpire(state, 'polish_lithuanian_commonwealth', 'en');
  assert.equal(empRes.error, undefined);
  state = empRes.state;
  assert.equal(state.countries['999'].reformedEmpireId, 'polish_lithuanian_commonwealth');

  // Peace Conference
  state.countries['999'].atWarWith = ['643'];
  state.countries['643'].atWarWith = ['999'];
  const rusProv = Object.values(state.provinces).find((p) => p.ownerId === '643')!;
  const peaceRes = resolvePeaceConference(
    state,
    {
      enemyId: '643',
      demandedProvinceIds: [rusProv.id],
      warReparations: true,
      demilitarize: false,
      forceVassalize: false,
    },
    'en',
  );
  assert.equal(peaceRes.error, undefined);
  assert.equal(peaceRes.state.provinces[rusProv.id].ownerId, '999');
  assert.ok(!peaceRes.state.countries['999'].atWarWith.includes('643'));

  // Vassal Tribute & Plunder on non-core
  peaceRes.state.countries['999'].vassals = ['440'];
  peaceRes.state.countries['440'].vassalOf = '999';
  const tribRes = setVassalTribute(peaceRes.state, '440', 30);
  assert.equal(tribRes.error, undefined);
  assert.equal(tribRes.state.countries['440'].vassalTributePct, 30);

  const plunderRes = plunderProvince(peaceRes.state, rusProv.id, 'en');
  assert.equal(plunderRes.error, undefined);
});

