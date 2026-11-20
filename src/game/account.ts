import type {
  AccountStats,
  AuthMethod,
  BlocksAccount,
  HallOfFameEntry,
  RankId,
  SaveSlot,
} from './types';

const ACCOUNTS_KEY = 'blocks_gs_accounts_v1';
const ACTIVE_ACCOUNT_KEY = 'blocks_gs_active_account_v1';
const SAVES_KEY = 'blocks_gs_saves_v1';
const HALL_OF_FAME_KEY = 'blocks_gs_hall_of_fame_v3';

// Pure deterministic hash (works identically in browser & Node unit tests)
export function hashSecret(secret: string, salt = 'BLOCKS_2026'): string {
  const input = `${salt}:${secret}`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function validatePin(pin: string): boolean {
  return /^(\d{4}|\d{6})$/.test(pin.trim());
}

export function generateBlocksId(nickname: string): string {
  const clean = nickname.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 2) || 'PL';
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BLK-${rand}-${clean}`;
}

export function getRankForStats(stats: AccountStats): RankId {
  if (stats.turnsPlayed >= 60 || stats.warsWon >= 6 || stats.largestAreaKm2 >= 3500000) {
    return 'marszalek';
  }
  if (stats.turnsPlayed >= 30 || stats.warsWon >= 3 || stats.largestAreaKm2 >= 1200000) {
    return 'general';
  }
  if (stats.turnsPlayed >= 10 || stats.warsWon >= 1 || stats.largestAreaKm2 >= 400000) {
    return 'kapitan';
  }
  return 'rekrut';
}

export function createGuestAccount(): BlocksAccount {
  return {
    id: 'BLK-GUEST',
    nickname: 'Gość',
    avatarId: 'shield',
    authMethod: 'pin',
    secretHash: '',
    createdAt: Date.now(),
    stats: {
      turnsPlayed: 0,
      warsWon: 0,
      largestAreaKm2: 0,
      campaignsCompleted: 0,
    },
    isGuest: true,
  };
}

export function registerBlocksAccount(params: {
  nickname: string;
  email?: string;
  avatarId: string;
  authMethod: AuthMethod;
  secret: string;
}): { ok: true; account: BlocksAccount } | { ok: false; error: string } {
  const nickname = params.nickname.trim();
  if (nickname.length < 2) {
    return { ok: false, error: 'Nick musi mieć co najmniej 2 znaki.' };
  }
  if (params.authMethod === 'pin') {
    if (!validatePin(params.secret)) {
      return { ok: false, error: 'Kod PIN musi składać się z 4 lub 6 cyfr.' };
    }
  } else {
    if (params.secret.trim().length < 4) {
      return { ok: false, error: 'Hasło musi mieć co najmniej 4 znaki.' };
    }
  }

  const account: BlocksAccount = {
    id: generateBlocksId(nickname),
    nickname,
    email: params.email?.trim() || undefined,
    avatarId: params.avatarId || 'shield',
    authMethod: params.authMethod,
    secretHash: hashSecret(params.secret.trim()),
    createdAt: Date.now(),
    stats: {
      turnsPlayed: 0,
      warsWon: 0,
      largestAreaKm2: 0,
      campaignsCompleted: 0,
    },
    isGuest: false,
  };
  return { ok: true, account };
}

export function verifyAccountSecret(account: BlocksAccount, secret: string): boolean {
  if (account.isGuest) return true;
  return account.secretHash === hashSecret(secret.trim());
}

export interface ExportedAccountBundle {
  version: 'BLOCKS-ACC-V1';
  account: BlocksAccount;
  saves: SaveSlot[];
  exportedAt: number;
}

export function exportAccountBundle(
  account: BlocksAccount,
  saves: SaveSlot[],
  secret: string,
): { ok: true; payload: string } | { ok: false; error: string } {
  if (!verifyAccountSecret(account, secret)) {
    return { ok: false, error: 'Nieprawidłowe Hasło lub Kod PIN.' };
  }
  const bundle: ExportedAccountBundle = {
    version: 'BLOCKS-ACC-V1',
    account,
    saves: saves.filter((s) => s.accountId === account.id),
    exportedAt: Date.now(),
  };
  const json = JSON.stringify(bundle);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 =
    typeof btoa === 'function' ? btoa(bin) : Buffer.from(json, 'utf8').toString('base64');
  return { ok: true, payload: `BLOCKS-ACC-V1.${b64}` };
}

export function importAccountBundle(
  payload: string,
  secret: string,
): { ok: true; account: BlocksAccount; saves: SaveSlot[] } | { ok: false; error: string } {
  try {
    const trimmed = payload.trim();
    const rawB64 = trimmed.startsWith('BLOCKS-ACC-V1.')
      ? trimmed.slice('BLOCKS-ACC-V1.'.length)
      : trimmed;
    let json = '';
    if (typeof atob === 'function') {
      const bin = atob(rawB64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      json = new TextDecoder().decode(bytes);
    } else {
      json = Buffer.from(rawB64, 'base64').toString('utf8');
    }
    const parsed = JSON.parse(json) as ExportedAccountBundle;
    if (parsed.version !== 'BLOCKS-ACC-V1' || !parsed.account?.id) {
      return { ok: false, error: 'Nieprawidłowy format pliku Konta Blocks™.' };
    }
    if (!verifyAccountSecret(parsed.account, secret)) {
      return { ok: false, error: 'Błędne Hasło lub Kod PIN dla tego Konta Blocks™.' };
    }
    return { ok: true, account: parsed.account, saves: parsed.saves ?? [] };
  } catch {
    return { ok: false, error: 'Nie udało się odczytać danych Konta Blocks™.' };
  }
}

function getStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function loadStoredAccounts(): BlocksAccount[] {
  const s = getStorage();
  if (!s) return [];
  try {
    const raw = s.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as BlocksAccount[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredAccount(account: BlocksAccount): void {
  const s = getStorage();
  if (!s || account.isGuest) return;
  const list = loadStoredAccounts().filter((a) => a.id !== account.id);
  list.push(account);
  s.setItem(ACCOUNTS_KEY, JSON.stringify(list));
  s.setItem(ACTIVE_ACCOUNT_KEY, account.id);
}

export function loadActiveAccount(): BlocksAccount | null {
  const s = getStorage();
  if (!s) return null;
  const activeId = s.getItem(ACTIVE_ACCOUNT_KEY);
  if (!activeId) return null;
  const list = loadStoredAccounts();
  return list.find((a) => a.id === activeId) ?? null;
}

export function setActiveAccountId(id: string | null): void {
  const s = getStorage();
  if (!s) return;
  if (id) s.setItem(ACTIVE_ACCOUNT_KEY, id);
  else s.removeItem(ACTIVE_ACCOUNT_KEY);
}

export function loadSavesForAccount(accountId: string): SaveSlot[] {
  const s = getStorage();
  if (!s) return [];
  try {
    const raw = s.getItem(SAVES_KEY);
    const all = raw ? (JSON.parse(raw) as SaveSlot[]) : [];
    return all
      .filter((slot) => slot.accountId === accountId)
      .sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  }
}

export function saveGameSlot(slot: SaveSlot): void {
  const s = getStorage();
  if (!s) return;
  try {
    const raw = s.getItem(SAVES_KEY);
    const all = raw ? (JSON.parse(raw) as SaveSlot[]) : [];
    const next = all.filter((x) => x.id !== slot.id);
    next.unshift(slot);
    s.setItem(SAVES_KEY, JSON.stringify(next.slice(0, 30)));
  } catch {
    // ignore storage quota errors gracefully
  }
}

export function deleteGameSlot(slotId: string): void {
  const s = getStorage();
  if (!s) return;
  try {
    const raw = s.getItem(SAVES_KEY);
    const all = raw ? (JSON.parse(raw) as SaveSlot[]) : [];
    s.setItem(SAVES_KEY, JSON.stringify(all.filter((x) => x.id !== slotId)));
  } catch {
    // ignore
  }
}

export function loadHallOfFame(): HallOfFameEntry[] {
  const s = getStorage();
  if (!s) return [];
  try {
    const raw = s.getItem(HALL_OF_FAME_KEY);
    const list = raw ? (JSON.parse(raw) as HallOfFameEntry[]) : [];
    return list.sort((a, b) => b.powerScore - a.powerScore);
  } catch {
    return [];
  }
}

export function recordHallOfFameEntry(
  entry: Omit<HallOfFameEntry, 'id' | 'recordedAt'>,
): HallOfFameEntry[] {
  const current = loadHallOfFame();
  const nextEntry: HallOfFameEntry = {
    ...entry,
    id: `hof_${entry.accountId}_${entry.scenarioId}_${entry.countryName}`,
    recordedAt: Date.now(),
  };
  const merged = current.filter(
    (e) =>
      !(
        e.accountId === nextEntry.accountId &&
        e.scenarioId === nextEntry.scenarioId &&
        e.countryName === nextEntry.countryName
      ),
  );
  merged.push(nextEntry);
  merged.sort((a, b) => b.powerScore - a.powerScore);
  const trimmed = merged.slice(0, 25);
  const s = getStorage();
  if (s) {
    try {
      s.setItem(HALL_OF_FAME_KEY, JSON.stringify(trimmed));
    } catch {
      // ignore
    }
  }
  return trimmed;
}
