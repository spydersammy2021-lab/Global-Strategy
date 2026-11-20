import React, { useState } from 'react';
import {
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  ShieldCheck,
  Upload,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import {
  createGuestAccount,
  exportAccountBundle,
  getRankForStats,
  importAccountBundle,
  loadSavesForAccount,
  loadStoredAccounts,
  registerBlocksAccount,
  saveGameSlot,
  saveStoredAccount,
  setActiveAccountId,
  verifyAccountSecret,
} from '../game/account';
import { glassClass } from '../game/performance';
import type { AuthMethod, BlocksAccount, EffectiveTier, Language } from '../game/types';
import { RANK_NAMES, type Translations } from '../i18n/translations';
import { AVATAR_OPTIONS, AvatarIcon } from './BlocksLogo';

export function AccountModal({
  isOpen,
  onClose,
  account,
  onAccountChange,
  t,
  lang,
  effectiveTier = 'ultra',
}: {
  isOpen: boolean;
  onClose: () => void;
  account: BlocksAccount;
  onAccountChange: (acc: BlocksAccount) => void;
  t: Translations;
  lang: Language;
  effectiveTier?: EffectiveTier;
}) {
  const [tab, setTab] = useState<'profile' | 'register' | 'login' | 'transfer'>(
    account.isGuest ? 'register' : 'profile',
  );
  const [storedAccounts, setStoredAccounts] = useState<BlocksAccount[]>(() => loadStoredAccounts());

  // Registration state
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [avatarId, setAvatarId] = useState<string>('shield');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('pin');
  const [secret, setSecret] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [selectedLoginId, setSelectedLoginId] = useState<string>(storedAccounts[0]?.id ?? '');
  const [loginSecret, setLoginSecret] = useState('');

  // Export / Import state
  const [transferSecret, setTransferSecret] = useState('');
  const [exportedCode, setExportedCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [importSecret, setImportSecret] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const clearFeedback = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handlePinDigit = (digit: string, target: 'register' | 'login' | 'transfer' | 'import') => {
    const setter =
      target === 'register'
        ? setSecret
        : target === 'login'
        ? setLoginSecret
        : target === 'transfer'
        ? setTransferSecret
        : setImportSecret;
    setter((prev) => (prev.length < 6 ? prev + digit : prev));
  };

  const handlePinBackspace = (target: 'register' | 'login' | 'transfer' | 'import') => {
    const setter =
      target === 'register'
        ? setSecret
        : target === 'login'
        ? setLoginSecret
        : target === 'transfer'
        ? setTransferSecret
        : setImportSecret;
    setter((prev) => prev.slice(0, -1));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    const res = registerBlocksAccount({
      nickname,
      email,
      avatarId,
      authMethod,
      secret,
    });
    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }
    saveStoredAccount(res.account);
    setStoredAccounts(loadStoredAccounts());
    onAccountChange(res.account);
    setSecret('');
    setSuccessMsg(`Utworzono konto ${res.account.nickname} (${res.account.id})`);
    setTab('profile');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    const target = storedAccounts.find((a) => a.id === selectedLoginId);
    if (!target) {
      setErrorMsg('Wybierz konto z listy.');
      return;
    }
    if (!verifyAccountSecret(target, loginSecret)) {
      setErrorMsg('Nieprawidłowe Hasło lub Kod PIN.');
      return;
    }
    setActiveAccountId(target.id);
    onAccountChange(target);
    setLoginSecret('');
    setSuccessMsg(`Zalogowano jako ${target.nickname}`);
    setTab('profile');
  };

  const handleGuest = () => {
    clearFeedback();
    const guest = createGuestAccount();
    setActiveAccountId(null);
    onAccountChange(guest);
    onClose();
  };

  const handleExport = () => {
    clearFeedback();
    const saves = loadSavesForAccount(account.id);
    const res = exportAccountBundle(account, saves, transferSecret);
    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }
    setExportedCode(res.payload);
    setSuccessMsg('Konto Blocks™ wyeksportowane! Skopiuj kod lub pobierz plik.');

    // Trigger clean file download
    try {
      const blob = new Blob([res.payload], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${account.id}.blocks`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // clipboard fallback still shown in textarea
    }
  };

  const handleImport = () => {
    clearFeedback();
    const res = importAccountBundle(importCode, importSecret);
    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }
    saveStoredAccount(res.account);
    for (const s of res.saves) {
      saveGameSlot(s);
    }
    setStoredAccounts(loadStoredAccounts());
    onAccountChange(res.account);
    setImportCode('');
    setImportSecret('');
    setSuccessMsg(`Wczytano konto ${res.account.nickname} (${res.saves.length} zapisów)!`);
    setTab('profile');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImportCode(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const rankId = getRankForStats(account.stats);
  const rankName = RANK_NAMES[lang][rankId];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="blocks-account-heading"
    >
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${glassClass(
          effectiveTier,
        )}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30">
              <AvatarIcon avatarId={account.avatarId} size={20} />
            </div>
            <div>
              <h2 id="blocks-account-heading" className="font-display text-lg font-bold text-white">
                {t.accountTitle}
              </h2>
              <div className="text-xs text-slate-400 font-mono-num">
                {account.isGuest ? 'Sesja Gościa' : `${account.nickname} · ${account.id}`}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-800 bg-slate-900/50">
          <button
            type="button"
            onClick={() => {
              clearFeedback();
              setTab('profile');
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              tab === 'profile'
                ? 'border-amber-400 text-amber-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.profileTab}
          </button>
          <button
            type="button"
            onClick={() => {
              clearFeedback();
              setTab('register');
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              tab === 'register'
                ? 'border-amber-400 text-amber-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.registerTab}
          </button>
          <button
            type="button"
            onClick={() => {
              clearFeedback();
              setTab('login');
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              tab === 'login'
                ? 'border-amber-400 text-amber-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.loginTab} ({storedAccounts.length})
          </button>
          <button
            type="button"
            onClick={() => {
              clearFeedback();
              setTab('transfer');
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              tab === 'transfer'
                ? 'border-amber-400 text-amber-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            PC ↔ Mobile
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto gs-scroll space-y-4">
          {errorMsg && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-medium text-rose-200">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-200">
              {successMsg}
            </div>
          )}

          {/* PROFILE TAB */}
          {tab === 'profile' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30">
                    <AvatarIcon avatarId={account.avatarId} size={26} />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">{account.nickname}</div>
                    <div className="text-xs text-slate-400 font-mono-num">
                      {account.id} · {account.authMethod === 'pin' ? 'PIN' : t.passwordMethod}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400">{t.rankLabel}</div>
                  <div className="text-sm font-bold text-amber-400">{rankName}</div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  {t.careerStats}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                    <div className="text-[11px] text-slate-400">{t.turnsPlayed}</div>
                    <div className="mt-1 text-xl font-bold text-white font-mono-num">
                      {account.stats.turnsPlayed}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                    <div className="text-[11px] text-slate-400">{t.warsWon}</div>
                    <div className="mt-1 text-xl font-bold text-emerald-400 font-mono-num">
                      {account.stats.warsWon}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                    <div className="text-[11px] text-slate-400">{t.largestTerritory}</div>
                    <div className="mt-1 text-base font-bold text-sky-300 font-mono-num">
                      {account.stats.largestAreaKm2.toLocaleString()} km²
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleGuest}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  <LogOut size={14} />
                  {account.isGuest ? t.playAsGuest : t.logout}
                </button>
                <button
                  type="button"
                  onClick={() => setTab('transfer')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
                >
                  <Upload size={14} />
                  {t.exportAccount}
                </button>
              </div>
            </div>
          )}

          {/* REGISTER TAB */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="blk-nick" className="block text-xs font-medium text-slate-300 mb-1.5">
                    {t.nickname} *
                  </label>
                  <input
                    id="blk-nick"
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="np. Mateusz"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="blk-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                    {t.emailOptional}
                  </label>
                  <input
                    id="blk-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nick@blocks.tech"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Avatar Picker */}
              <div>
                <div className="text-xs font-medium text-slate-300 mb-2">{t.chooseAvatar}</div>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarId(av.id)}
                      aria-label={av.label}
                      className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                        avatarId === av.id
                          ? 'border-amber-400 bg-amber-500/15'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <AvatarIcon avatarId={av.id} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Security Switcher: Password vs PIN */}
              <div>
                <div className="text-xs font-medium text-slate-300 mb-2">{t.securityMethodPrompt}</div>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('password');
                      setSecret('');
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      authMethod === 'password'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <KeyRound size={14} />
                    {t.passwordMethod}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('pin');
                      setSecret('');
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      authMethod === 'pin'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Lock size={14} />
                    {t.pinMethod}
                  </button>
                </div>
              </div>

              {authMethod === 'password' ? (
                <div>
                  <label htmlFor="blk-pass" className="block text-xs font-medium text-slate-300 mb-1.5">
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="blk-pass"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      placeholder="Min. 4 znaki"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 pr-10 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label="Pokaż/ukryj hasło"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="blk-pin" className="text-xs font-medium text-slate-300">
                      {t.pinLabel}
                    </label>
                    <span className="text-[11px] text-slate-400">{t.pinLengthHint}</span>
                  </div>
                  <input
                    id="blk-pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••"
                    className="w-full text-center tracking-[0.6em] font-mono-num text-lg rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-amber-300 focus:border-amber-400 focus:outline-none"
                  />
                  {/* Numeric Keypad */}
                  <div className="grid grid-cols-6 gap-1.5 pt-1">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handlePinDigit(d, 'register')}
                        className="py-2 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-sm font-mono-num font-bold text-white cursor-pointer"
                      >
                        {d}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handlePinBackspace('register')}
                      className="col-span-2 py-2 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-300 cursor-pointer"
                    >
                      ⌫ Usuń
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleGuest}
                  className="px-4 py-2.5 text-xs font-semibold rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  {t.playAsGuest}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
                >
                  <UserPlus size={15} />
                  {t.createAccount}
                </button>
              </div>
            </form>
          )}

          {/* LOGIN TAB */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {storedAccounts.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 text-center text-sm text-slate-400">
                  Brak zapisanych kont na tym urządzeniu. Utwórz nowe Konto Blocks™ lub graj jako Gość.
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {storedAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setSelectedLoginId(acc.id);
                          setLoginSecret('');
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                          selectedLoginId === acc.id
                            ? 'border-amber-400 bg-amber-500/10'
                            : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <AvatarIcon avatarId={acc.avatarId} size={20} />
                          <div>
                            <div className="text-sm font-semibold text-white">{acc.nickname}</div>
                            <div className="text-xs text-slate-400 font-mono-num">{acc.id}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">
                          {acc.authMethod === 'pin' ? 'Kod PIN' : 'Hasło'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label htmlFor="login-secret" className="block text-xs font-medium text-slate-300 mb-1.5">
                      Hasło lub Kod PIN
                    </label>
                    <input
                      id="login-secret"
                      type="password"
                      required
                      value={loginSecret}
                      onChange={(e) => setLoginSecret(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
                  >
                    <UserCheck size={15} />
                    {t.loginAccount}
                  </button>
                </>
              )}
            </form>
          )}

          {/* TRANSFER (EXPORT / IMPORT) TAB */}
          {tab === 'transfer' && (
            <div className="space-y-5">
              {/* Export */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Upload size={16} className="text-amber-400" />
                  {t.exportAccount}
                </div>
                <p className="text-xs text-slate-400">{t.verifySecretToUnlock}</p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={transferSecret}
                    onChange={(e) => setTransferSecret(e.target.value)}
                    placeholder={account.isGuest ? 'Gość (bez hasła)' : 'Hasło lub PIN'}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleExport}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold whitespace-nowrap cursor-pointer"
                  >
                    {t.exportAccount}
                  </button>
                </div>
                {exportedCode && (
                  <textarea
                    readOnly
                    value={exportedCode}
                    rows={3}
                    onClick={(e) => e.currentTarget.select()}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-[11px] font-mono text-emerald-300"
                  />
                )}
              </div>

              {/* Import */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Download size={16} className="text-sky-400" />
                    {t.importAccount}
                  </div>
                  <label className="text-xs font-semibold text-sky-400 hover:text-sky-300 cursor-pointer">
                    Wybierz plik .blocks
                    <input type="file" accept=".blocks,.txt" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                <textarea
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  rows={2}
                  placeholder="Wklej kod BLOCKS-ACC-V1... lub wgraj plik"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs font-mono text-slate-200 focus:border-sky-400 focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={importSecret}
                    onChange={(e) => setImportSecret(e.target.value)}
                    placeholder="Hasło lub PIN konta"
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleImport}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold whitespace-nowrap cursor-pointer"
                  >
                    <ShieldCheck size={14} />
                    {t.importAccount}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
