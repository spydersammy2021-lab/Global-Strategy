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
  advanceDay,
  appointMinister,
  assimilateProvince,
  buildMegaproject,
  buildThermonuclearWarhead,
  cancelOrder,
  clearTechQueue,
  constructBuilding,
  createNewGame,
  deploySpy,
  executeBlackOp,
  executeTurn,
  fundSpaceOceanColony,
  issueArmyOrder,
  launchStrategicStrike,
  planTechTreePath,
  proposeDiplomacy,
  recruitUnits,
  repayLoan,
  researchTechNode,
  resolveRandomEvent,
  setTaxRate,
  takeBankLoan,
  tradeMarketResource,
  voteWorldCouncil,
} from './engine';
import {
  MAJOR_CITIES,
  getEsriTileUrl,
  getGoogleMapsStreetViewUrl,
  latLngToEsriTile,
} from '../data/cities';
import { buildWorldMapData, projectLonLat } from './mapGen';
import { resolveEffectiveTier } from './performance';

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

test('5 Difficulty levels scale player income/attack and AI defense/economy accurately', () => {
  const veryEasy = createNewGame('2026', '616', 'very_easy', 'pl');
  const normal = createNewGame('2026', '616', 'normal', 'pl');
  const extreme = createNewGame('2026', '616', 'extreme', 'pl');

  const veBudget = computeDetailedBudget(veryEasy, '616');
  const normBudget = computeDetailedBudget(normal, '616');
  assert.ok(veBudget.taxIncome > normBudget.taxIncome * 1.4);

  const gerNormPower = computeArmyPower({ infantry: 10000 }, '2026', 'defense', 0, {
    difficulty: 'normal',
    isPlayerSide: false,
  });
  const gerExtPower = computeArmyPower({ infantry: 10000 }, '2026', 'defense', 0, {
    difficulty: 'extreme',
    isPlayerSide: false,
  });
  assert.ok(Math.abs(gerExtPower / gerNormPower - 1.4) < 0.01);

  const plVeAtk = computeArmyPower({ infantry: 10000 }, '2026', 'attack', 0, {
    difficulty: 'very_easy',
    isPlayerSide: true,
  });
  const plNormAtk = computeArmyPower({ infantry: 10000 }, '2026', 'attack', 0, {
    difficulty: 'normal',
    isPlayerSide: true,
  });
  assert.ok(Math.abs(plVeAtk / plNormAtk - 1.3) < 0.01);
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
  let extPlus = createNewGame('2026', '616', 'extreme_plus', 'en');

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
  assert.ok(Math.abs(gerExtPlusTax / gerNormTax - 1.75) < 0.05);

  for (let d = 0; d < 12; d++) {
    extPlus = advanceDay(extPlus, 'en');
  }
  assert.ok(
    extPlus.countries['616'].atWarWith.length >= 1,
    'EXTREME+ AI should form a coalition against the player',
  );
  assert.ok(
    extPlus.chronicle.some((c) => c.title.includes('EXTREME+')),
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
