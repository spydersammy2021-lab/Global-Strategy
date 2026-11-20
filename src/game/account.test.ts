import test from 'node:test';
import assert from 'node:assert/strict';
import {
  exportAccountBundle,
  getRankForStats,
  importAccountBundle,
  loadHallOfFame,
  recordHallOfFameEntry,
  registerBlocksAccount,
  verifyAccountSecret,
} from './account';
import { createNewGame } from './engine';
import type { SaveSlot } from './types';

test('Blocks Account registration supports PIN (4 or 6 digits) and Password security', () => {
  const badPin = registerBlocksAccount({
    nickname: 'Mateusz',
    avatarId: 'shield',
    authMethod: 'pin',
    secret: '12',
  });
  assert.equal(badPin.ok, false);

  const okPin = registerBlocksAccount({
    nickname: 'Mateusz',
    email: 'mateusz@blocks.tech',
    avatarId: 'crown',
    authMethod: 'pin',
    secret: '2026',
  });
  assert.equal(okPin.ok, true);
  if (okPin.ok) {
    assert.ok(okPin.account.id.startsWith('BLK-'));
    assert.equal(verifyAccountSecret(okPin.account, '2026'), true);
    assert.equal(verifyAccountSecret(okPin.account, '9999'), false);
  }

  const okPass = registerBlocksAccount({
    nickname: 'Dowódca',
    avatarId: 'eagle',
    authMethod: 'password',
    secret: 'SuperTajneHaslo2026',
  });
  assert.equal(okPass.ok, true);
  if (okPass.ok) {
    assert.equal(verifyAccountSecret(okPass.account, 'SuperTajneHaslo2026'), true);
    assert.equal(verifyAccountSecret(okPass.account, 'zle'), false);
  }
});

test('Blocks Account Ranks progress from Rekrut to Marszałek Blocks', () => {
  assert.equal(
    getRankForStats({ turnsPlayed: 2, warsWon: 0, largestAreaKm2: 312696, campaignsCompleted: 0 }),
    'rekrut',
  );
  assert.equal(
    getRankForStats({ turnsPlayed: 12, warsWon: 1, largestAreaKm2: 450000, campaignsCompleted: 0 }),
    'kapitan',
  );
  assert.equal(
    getRankForStats({ turnsPlayed: 32, warsWon: 3, largestAreaKm2: 1300000, campaignsCompleted: 1 }),
    'general',
  );
  assert.equal(
    getRankForStats({ turnsPlayed: 65, warsWon: 7, largestAreaKm2: 4000000, campaignsCompleted: 2 }),
    'marszalek',
  );
});

test('Export and Import Blocks Account bundle enforces Password/PIN check and preserves saves', () => {
  const reg = registerBlocksAccount({
    nickname: 'Mateusz',
    avatarId: 'shield',
    authMethod: 'pin',
    secret: '202601',
  });
  assert.equal(reg.ok, true);
  if (!reg.ok) return;

  const gameState = createNewGame('2026', '616', 'pl');
  const save: SaveSlot = {
    id: 'save_1',
    accountId: reg.account.id,
    label: 'Polska 2026',
    scenarioId: '2026',
    playerCountryId: '616',
    turn: 1,
    year: 2026,
    areaKm2: 312696,
    savedAt: Date.now(),
    state: gameState,
  };

  // Wrong PIN fails export
  const badExport = exportAccountBundle(reg.account, [save], '000000');
  assert.equal(badExport.ok, false);

  // Correct PIN exports bundle
  const goodExport = exportAccountBundle(reg.account, [save], '202601');
  assert.equal(goodExport.ok, true);
  if (!goodExport.ok) return;

  // Wrong PIN fails import
  const badImport = importAccountBundle(goodExport.payload, '111111');
  assert.equal(badImport.ok, false);

  // Correct PIN restores account and saves
  const goodImport = importAccountBundle(goodExport.payload, '202601');
  assert.equal(goodImport.ok, true);
  if (goodImport.ok) {
    assert.equal(goodImport.account.nickname, 'Mateusz');
    assert.equal(goodImport.saves.length, 1);
    assert.equal(goodImport.saves[0].label, 'Polska 2026');
  }
});

test('Blocks Hall of Fame stores and sorts records cleanly in localStorage', () => {
  const store = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
  };
  const g = globalThis as unknown as { window?: unknown };
  const prevWindow = g.window;
  g.window = { localStorage: mockStorage };

  try {
    recordHallOfFameEntry({
      accountId: 'BLK-1001-PL',
      nickname: 'Mateusz',
      countryName: 'Polska',
      scenarioId: '2026',
      turn: 12,
      areaKm2: 410000,
      powerScore: 185000,
    });
    recordHallOfFameEntry({
      accountId: 'BLK-2002-PL',
      nickname: 'Dowódca',
      countryName: 'USA',
      scenarioId: '2026',
      turn: 8,
      areaKm2: 9833517,
      powerScore: 620000,
    });

    const entries = loadHallOfFame();
    assert.equal(entries.length, 2);
    assert.equal(entries[0].countryName, 'USA');
    assert.equal(entries[1].countryName, 'Polska');
  } finally {
    if (prevWindow === undefined) delete g.window;
    else g.window = prevWindow;
  }
});
