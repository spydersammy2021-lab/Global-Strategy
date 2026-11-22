import type {
  ApexPremiumState,
  BlocksAccount,
  HallOfFameEntry,
  MapVisualTheme,
  SavedCampaignSlot,
} from './types';

const STORAGE_ACCOUNT_KEY = 'blocks_gs_v45_account';
const STORAGE_SAVES_KEY = 'blocks_gs_v45_saves';
const STORAGE_HOF_KEY = 'blocks_gs_v45_hof';
const STORAGE_PREMIUM_KEY = 'blocks_gs_v45_premium';

export const FREE_APEX_CODES = ['BLOCKS2026', 'APEXFREE', 'ROYAL45'];
export const APEX_PRESTIGE_COST = 80;
export const APEX_VIRTUAL_PLN_COST = 150;

export function hashSecret(raw: string): string {
  let h = 2166136261;
  const normalized = raw.trim();
  for (let i = 0; i < normalized.length; i++) {
    h ^= normalized.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `blk_${(h >>> 0).toString(16)}`;
}

export function getBlocksRank(account: BlocksAccount | null): string {
  if (!account) return 'Guest Commander';
  const score = account.turnsPlayed + account.warsWon * 15 + account.largestTerritory * 4;
  if (score >= 450) return 'Marszałek Blocks';
  if (score >= 220) return 'Supreme Admiral';
  if (score >= 90) return 'Grand General';
  if (score >= 30) return 'Field Officer';
  return 'Rekrut Blocks';
}

export function loadStoredAccount(): BlocksAccount | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNT_KEY);
    return raw ? (JSON.parse(raw) as BlocksAccount) : null;
  } catch {
    return null;
  }
}

export function saveStoredAccount(acc: BlocksAccount | null): void {
  if (typeof localStorage === 'undefined') return;
  if (!acc) localStorage.removeItem(STORAGE_ACCOUNT_KEY);
  else localStorage.setItem(STORAGE_ACCOUNT_KEY, JSON.stringify(acc));
}

export function loadApexPremiumState(): ApexPremiumState {
  if (typeof localStorage === 'undefined') {
    return { unlocked: false, unlockedBy: null, redeemedCode: null, activeTheme: 'royal_obsidian' };
  }
  try {
    const raw = localStorage.getItem(STORAGE_PREMIUM_KEY);
    if (!raw) return { unlocked: false, unlockedBy: null, redeemedCode: null, activeTheme: 'royal_obsidian' };
    return JSON.parse(raw) as ApexPremiumState;
  } catch {
    return { unlocked: false, unlockedBy: null, redeemedCode: null, activeTheme: 'royal_obsidian' };
  }
}

export function saveApexPremiumState(p: ApexPremiumState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_PREMIUM_KEY, JSON.stringify(p));
}

export function isValidFreeGiftCode(code: string): boolean {
  return FREE_APEX_CODES.includes(code.trim().toUpperCase());
}

export function setApexTheme(current: ApexPremiumState, theme: MapVisualTheme): ApexPremiumState {
  const next: ApexPremiumState = { ...current, activeTheme: theme };
  saveApexPremiumState(next);
  return next;
}

export function loadSavedCampaigns(): SavedCampaignSlot[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_SAVES_KEY);
    return raw ? (JSON.parse(raw) as SavedCampaignSlot[]) : [];
  } catch {
    return [];
  }
}

export function persistSavedCampaigns(slots: SavedCampaignSlot[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_SAVES_KEY, JSON.stringify(slots));
}

export function loadHallOfFame(): HallOfFameEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_HOF_KEY);
    return raw ? (JSON.parse(raw) as HallOfFameEntry[]) : [];
  } catch {
    return [];
  }
}

export function recordHallOfFame(entry: HallOfFameEntry): HallOfFameEntry[] {
  const existing = loadHallOfFame();
  const next = [entry, ...existing]
    .sort((a, b) => b.provincesControlled - a.provincesControlled || b.prestige - a.prestige)
    .slice(0, 20);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_HOF_KEY, JSON.stringify(next));
  }
  return next;
}

export function exportBlocksBundle(account: BlocksAccount, secret: string, saves: SavedCampaignSlot[]): string | null {
  if (hashSecret(secret) !== account.secretHash) return null;
  return JSON.stringify({ version: '4.5', account, saves });
}

export function importBlocksBundle(
  bundleJson: string,
  secret: string,
): { account: BlocksAccount; saves: SavedCampaignSlot[] } | null {
  try {
    const parsed = JSON.parse(bundleJson) as { account?: BlocksAccount; saves?: SavedCampaignSlot[] };
    if (!parsed.account) return null;
    if (hashSecret(secret) !== parsed.account.secretHash) return null;
    return { account: parsed.account, saves: parsed.saves ?? [] };
  } catch {
    return null;
  }
}
