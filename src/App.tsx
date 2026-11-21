import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccountModal } from './components/AccountModal';
import { BottomProvinceBar } from './components/BottomProvinceBar';
import { CityReconModal } from './components/CityReconModal';
import { GameOverModal } from './components/GameOverModal';
import { GeopoliticsCouncilModal } from './components/GeopoliticsCouncilModal';
import { LeaderboardChronicleModal, type ModalTab } from './components/LeaderboardChronicleModal';
import { LeftSlideDrawer } from './components/LeftSlideDrawer';
import { type LeftDrawerId, LeftToolbar } from './components/LeftToolbar';
import { MainMenu } from './components/MainMenu';
import { MobileCommandHud } from './components/MobileCommandHud';
import { NotificationStack } from './components/NotificationStack';
import { RandomEventModal } from './components/RandomEventModal';
import { SaveLoadModal } from './components/SaveLoadModal';
import { ScenarioEditorModal } from './components/ScenarioEditorModal';
import { SettingsModal } from './components/SettingsModal';
import { SpaceOceanModal } from './components/SpaceOceanModal';
import { SplashScreen } from './components/SplashScreen';
import { TacticalAdvisorWidget } from './components/TacticalAdvisorWidget';
import { TechTreeModal } from './components/TechTreeModal';
import { TopHudBar } from './components/TopHudBar';
import { TreasuryModal } from './components/TreasuryModal';
import { TutorialModal } from './components/TutorialModal';
import { WorldMapCanvas } from './components/WorldMapCanvas';
import { getCityById } from './data/cities';
import {
  createGuestAccount,
  loadActiveAccount,
  recordHallOfFameEntry,
  saveStoredAccount,
} from './game/account';
import { speakAdvisorLine } from './game/advisor';
import { soundEngine } from './game/audio';
import { computeCountrySummaries, splitUnitsByRatio } from './game/combat';
import {
  type BlackOpType,
  type DiplomacyAction,
  advanceDay,
  appointMinister,
  assimilateProvince,
  buildMegaproject,
  buildThermonuclearWarhead,
  cancelOrder,
  changeIdeology,
  clearTechQueue,
  constructBuilding,
  createNewGame,
  deploySpy,
  designCustomUnit,
  executeBlackOp,
  fundSpaceOceanColony,
  issueArmyOrder,
  launchSpySatellite,
  launchStrategicStrike,
  planTechTreePath,
  proposeDiplomacy,
  reconstructProvinceCity,
  recruitUnits,
  repayLoan,
  researchTechNode,
  resolveRandomEvent,
  setTaxRate,
  takeBankLoan,
  toggleAutoPilot,
  toggleStraitBlockade,
  tradeMarketResource,
  triggerAutoPilotAirliftNow,
  voteWorldCouncil,
} from './game/engine';
import { type FpsCap, detectHardwareProfile, resolveEffectiveTier } from './game/performance';
import type {
  BattleEvent,
  BlocksAccount,
  BuildingType,
  CommodityId,
  CustomScenarioConfig,
  CustomUnitCategory,
  DifficultyId,
  GameMode,
  GameState,
  IdeologyId,
  Language,
  MapOverlayMode,
  MegaprojectId,
  MinisterRole,
  PerformanceMode,
  ScenarioId,
  SimSpeed,
  StraitBlockadeId,
  TechNodeId,
  UiMode,
  UnitType,
} from './game/types';
import { TRANSLATIONS } from './i18n/translations';

type ShellScreen = 'splash' | 'menu' | 'playing';

const TUTORIAL_SEEN_KEY = 'blocks_gs_tutorial_seen_v1';
const LANG_KEY = 'blocks_gs_lang_v1';
const ADVISOR_KEY = 'blocks_gs_advisor_enabled_v1';
const VOICE_KEY = 'gs_apex_voice_enabled';
const FPS_CAP_KEY = 'gs_apex_fps_cap';
const UI_MODE_KEY = 'gs_ui_mode_v1';

const SIM_DELAY_MS: Record<SimSpeed, number> = {
  1: 650,
  2: 320,
  3: 190,
  5: 95,
};

export default function App() {
  const isAutostart = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('autostart') === '1';
  }, []);

  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY) as Language | null;
      return saved && TRANSLATIONS[saved] ? saved : 'en';
    } catch {
      return 'en';
    }
  });
  const t = TRANSLATIONS[lang];

  const hwProfile = useMemo(() => detectHardwareProfile(), []);
  const [perfMode, setPerfMode] = useState<PerformanceMode>('auto');
  const [autoDowngradeSteps, setAutoDowngradeSteps] = useState<number>(0);
  const effectiveTier = resolveEffectiveTier(perfMode, autoDowngradeSteps, hwProfile);

  const [muted, setMuted] = useState(false);
  const [uiMode, setUiMode] = useState<UiMode>(() => {
    try {
      const saved = localStorage.getItem(UI_MODE_KEY) as UiMode | null;
      return saved === 'very_easy' || saved === 'easy' || saved === 'hard' ? saved : 'easy';
    } catch {
      return 'easy';
    }
  });
  const [advisorEnabled, setAdvisorEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADVISOR_KEY) !== '0';
    } catch {
      return true;
    }
  });
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(VOICE_KEY) !== '0';
    } catch {
      return true;
    }
  });
  const [fpsCap, setFpsCap] = useState<FpsCap>(() => {
    try {
      const saved = localStorage.getItem(FPS_CAP_KEY);
      if (saved === '60') return 60;
      if (saved === '120') return 120;
      if (saved === '144') return 144;
      return 'unlimited';
    } catch {
      return 'unlimited';
    }
  });
  const [account, setAccount] = useState<BlocksAccount>(
    () => loadActiveAccount() ?? createGuestAccount(),
  );

  const [screen, setScreen] = useState<ShellScreen>(isAutostart ? 'playing' : 'splash');
  const screenEnteredAtRef = useRef<number>(Date.now());
  const fpsDomRef = useRef<HTMLSpanElement | null>(null);

  const transitionScreen = useCallback((next: ShellScreen) => {
    screenEnteredAtRef.current = Date.now();
    setScreen(next);
  }, []);

  const [gameMode, setGameMode] = useState<GameMode>('player');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>('2026');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId>('normal');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('616');

  const [gameState, setGameState] = useState<GameState | null>(() =>
    isAutostart ? createNewGame('2026', '616', 'normal', 'en', 'player') : null,
  );
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(() =>
    isAutostart ? '616_p0' : null,
  );
  const [inspectedCountryId, setInspectedCountryId] = useState<string | null>('276');
  const [activeDrawer, setActiveDrawer] = useState<LeftDrawerId>(null);
  const [marchMode, setMarchMode] = useState(false);
  const [marchTargetId, setMarchTargetId] = useState<string | null>(null);
  const [activeBattles, setActiveBattles] = useState<BattleEvent[]>([]);
  const [focusTarget, setFocusTarget] = useState<[number, number] | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [mapOverlayMode, setMapOverlayMode] = useState<MapOverlayMode>('political');
  const [autoPilotCountdownSec, setAutoPilotCountdownSec] = useState<number | null>(null);

  // Modals
  const [accountOpen, setAccountOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveLoadOpen, setSaveLoadOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [treasuryOpen, setTreasuryOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboardInitialTab, setLeaderboardInitialTab] = useState<ModalTab>('powers');
  const [techTreeOpen, setTechTreeOpen] = useState(false);
  const [spaceOceanOpen, setSpaceOceanOpen] = useState(false);
  const [councilOpen, setCouncilOpen] = useState(false);
  const [scenarioEditorOpen, setScenarioEditorOpen] = useState(false);

  const anyBlockingModalOpen =
    accountOpen ||
    settingsOpen ||
    saveLoadOpen ||
    tutorialOpen ||
    treasuryOpen ||
    leaderboardOpen ||
    techTreeOpen ||
    spaceOceanOpen ||
    councilOpen ||
    scenarioEditorOpen ||
    selectedCityId !== null ||
    Boolean(gameState?.pendingEvent);

  useEffect(() => {
    if (screen === 'playing' && gameState) {
      if (gameState.outcome !== 'ongoing') {
        document.body.dataset.state = 'gameover';
      } else if (gameState.simPaused) {
        document.body.dataset.state = 'paused';
      } else {
        document.body.dataset.state = 'playing';
      }
    } else {
      document.body.dataset.state = screen;
    }
  }, [screen, gameState]);

  const handleChangeLang = (next: Language) => {
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // ignore
    }
  };

  const handleToggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  };

  const handleToggleAdvisor = () => {
    setAdvisorEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(ADVISOR_KEY, next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleToggleVoice = () => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(VOICE_KEY, next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleChangeFpsCap = (nextCap: FpsCap) => {
    setFpsCap(nextCap);
    try {
      localStorage.setItem(FPS_CAP_KEY, String(nextCap));
    } catch {
      // ignore
    }
  };

  const handleChangePerfMode = (nextMode: PerformanceMode) => {
    setPerfMode(nextMode);
    if (nextMode !== 'auto') {
      setAutoDowngradeSteps(0);
    }
  };

  const handleChangeUiMode = (nextMode: UiMode) => {
    setUiMode(nextMode);
    try {
      localStorage.setItem(UI_MODE_KEY, nextMode);
    } catch {
      // ignore
    }
  };

  const startCampaign = useCallback(
    (
      scenarioId: ScenarioId = selectedScenario,
      countryId: string = selectedCountryId,
      difficulty: DifficultyId = selectedDifficulty,
      mode: GameMode = gameMode,
      customScenario?: CustomScenarioConfig,
    ) => {
      soundEngine.playClick();
      const fresh = createNewGame(scenarioId, countryId, difficulty, lang, mode, customScenario);
      const isSpectator = mode === 'bot_spectator';
      const cap = isSpectator
        ? null
        : Object.values(fresh.provinces).find((p) => p.ownerId === countryId && p.isCapital) ??
          Object.values(fresh.provinces).find((p) => p.ownerId === countryId) ??
          null;
      setGameState(fresh);
      setSelectedProvinceId(cap?.id ?? null);
      setInspectedCountryId(isSpectator ? '616' : countryId === '616' ? '276' : '616');
      setActiveDrawer(null);
      setMarchMode(false);
      setMarchTargetId(null);
      setActiveBattles([]);
      setScenarioEditorOpen(false);
      setScreen('playing');

      try {
        if (!isAutostart && !isSpectator && localStorage.getItem(TUTORIAL_SEEN_KEY) !== '1') {
          setTutorialOpen(true);
          localStorage.setItem(TUTORIAL_SEEN_KEY, '1');
        }
      } catch {
        // ignore
      }
    },
    [selectedScenario, selectedCountryId, selectedDifficulty, gameMode, lang, isAutostart],
  );

  // Enter shortcut in Main Menu
  useEffect(() => {
    if (
      screen !== 'menu' ||
      accountOpen ||
      settingsOpen ||
      saveLoadOpen ||
      tutorialOpen ||
      leaderboardOpen ||
      scenarioEditorOpen
    ) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.repeat && Date.now() - screenEnteredAtRef.current > 350) {
        e.preventDefault();
        startCampaign();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    screen,
    accountOpen,
    settingsOpen,
    saveLoadOpen,
    tutorialOpen,
    leaderboardOpen,
    scenarioEditorOpen,
    startCampaign,
  ]);

  // Spacebar Active Pause & Escape modal/drawer dismissal during live gameplay
  useEffect(() => {
    if (screen !== 'playing' || !gameState) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.repeat) {
        if (selectedCityId) {
          setSelectedCityId(null);
          return;
        }
        if (techTreeOpen) {
          setTechTreeOpen(false);
          return;
        }
        if (spaceOceanOpen) {
          setSpaceOceanOpen(false);
          return;
        }
        if (councilOpen) {
          setCouncilOpen(false);
          return;
        }
        if (treasuryOpen) {
          setTreasuryOpen(false);
          return;
        }
        if (leaderboardOpen) {
          setLeaderboardOpen(false);
          return;
        }
        if (saveLoadOpen) {
          setSaveLoadOpen(false);
          return;
        }
        if (settingsOpen) {
          setSettingsOpen(false);
          return;
        }
        if (accountOpen) {
          setAccountOpen(false);
          return;
        }
        if (tutorialOpen) {
          setTutorialOpen(false);
          return;
        }
        if (marchMode) {
          setMarchMode(false);
          return;
        }
        if (activeDrawer) {
          setActiveDrawer(null);
          return;
        }
      }

      if (anyBlockingModalOpen) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        soundEngine.playClick();
        setGameState((prev) => (prev ? { ...prev, simPaused: !prev.simPaused } : prev));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    screen,
    gameState,
    anyBlockingModalOpen,
    selectedCityId,
    techTreeOpen,
    spaceOceanOpen,
    councilOpen,
    treasuryOpen,
    leaderboardOpen,
    saveLoadOpen,
    settingsOpen,
    accountOpen,
    tutorialOpen,
    marchMode,
    activeDrawer,
  ]);

  // Real-time continuous simulation loop (Age of History III style)
  const prevStateRef = useRef<GameState | null>(null);
  useEffect(() => {
    if (
      screen !== 'playing' ||
      !gameState ||
      gameState.outcome !== 'ongoing' ||
      gameState.simPaused ||
      anyBlockingModalOpen
    ) {
      return;
    }

    const delayMs = SIM_DELAY_MS[gameState.simSpeed] ?? 650;
    const timer = window.setInterval(() => {
      setGameState((prev) => {
        if (!prev || prev.outcome !== 'ongoing' || prev.simPaused) return prev;
        prevStateRef.current = prev;
        return advanceDay(prev, lang);
      });
    }, delayMs);

    return () => window.clearInterval(timer);
  }, [screen, gameState?.simPaused, gameState?.simSpeed, gameState?.outcome, anyBlockingModalOpen, lang]);

  // Post-transition audio, battle banners, and Blocks™ account stats sync
  useEffect(() => {
    const prev = prevStateRef.current;
    const next = gameState;
    if (!prev || !next || prev === next) return;
    prevStateRef.current = null;

    let clearTimer: number | null = null;
    if (next.battlesFought > prev.battlesFought && next.recentBattles.length > 0) {
      if (next.gameMode === 'player') {
        soundEngine.playSwordClash();
      }
      setActiveBattles(next.recentBattles.slice(0, 6));
      clearTimer = window.setTimeout(() => {
        setActiveBattles([]);
      }, 2600);
    } else if (next.turn > prev.turn && next.gameMode === 'player') {
      soundEngine.playTurnAdvance();
    }

    if (
      next.gameMode === 'player' &&
      (next.turn > prev.turn || next.outcome !== prev.outcome)
    ) {
      const sums = computeCountrySummaries(next);
      const mySum = sums[next.playerCountryId];
      const myArea = mySum?.areaKm2 ?? 0;
      const myCountry = next.countries[next.playerCountryId];
      setAccount((prevAcc) => {
        const updatedAcc: BlocksAccount = {
          ...prevAcc,
          stats: {
            turnsPlayed: prevAcc.stats.turnsPlayed + Math.max(0, next.turn - prev.turn),
            warsWon: prevAcc.stats.warsWon + Math.max(0, next.warsWon - prev.warsWon),
            largestAreaKm2: Math.max(prevAcc.stats.largestAreaKm2, myArea),
            campaignsCompleted:
              prevAcc.stats.campaignsCompleted + (next.outcome === 'victory' ? 1 : 0),
          },
        };
        if (!updatedAcc.isGuest) {
          saveStoredAccount(updatedAcc);
          if (myCountry && mySum) {
            recordHallOfFameEntry({
              accountId: updatedAcc.id,
              nickname: updatedAcc.nickname,
              countryName: myCountry.displayName,
              scenarioId: next.scenarioId,
              turn: next.turn,
              areaKm2: mySum.areaKm2,
              powerScore: mySum.powerScore,
            });
          }
        }
        return updatedAcc;
      });
    }

    return clearTimer !== null ? () => window.clearTimeout(clearTimer!) : undefined;
  }, [gameState]);

  // 5-Second Rapid Auto-Pilot Emergency Airlift & Strategic Command Interval
  useEffect(() => {
    if (
      screen !== 'playing' ||
      !gameState ||
      !gameState.autoPilotEnabled ||
      gameState.gameMode !== 'player' ||
      gameState.outcome !== 'ongoing' ||
      gameState.simPaused ||
      anyBlockingModalOpen
    ) {
      return;
    }

    const runAirliftCycle = () => {
      setGameState((prev) => {
        if (!prev || !prev.autoPilotEnabled || prev.simPaused || prev.outcome !== 'ongoing') {
          return prev;
        }
        const res = triggerAutoPilotAirliftNow(prev, lang);
        if (res.didAirlift) {
          soundEngine.playAirliftJet();
          if (advisorEnabled && voiceEnabled && res.summaryAction) {
            speakAdvisorLine(res.summaryAction, {
              lang,
              voiceEnabled,
              muted,
            });
          }
        }
        return res.state;
      });
    };

    const airliftTimer = window.setInterval(runAirliftCycle, 5000);
    return () => window.clearInterval(airliftTimer);
  }, [
    screen,
    gameState?.autoPilotEnabled,
    gameState?.gameMode,
    gameState?.outcome,
    gameState?.simPaused,
    anyBlockingModalOpen,
    lang,
    advisorEnabled,
    voiceEnabled,
    muted,
  ]);

  // Live 5s Emergency Airlift Countdown Ticker (VERSION 3.0)
  useEffect(() => {
    if (
      screen !== 'playing' ||
      !gameState ||
      !gameState.autoPilotEnabled ||
      gameState.gameMode !== 'player' ||
      gameState.outcome !== 'ongoing' ||
      gameState.simPaused ||
      anyBlockingModalOpen ||
      !gameState.autoPilotNextAirliftAt
    ) {
      setAutoPilotCountdownSec(null);
      return;
    }

    const syncCountdown = () => {
      const targetAt = gameState.autoPilotNextAirliftAt ?? 0;
      if (!targetAt) {
        setAutoPilotCountdownSec(null);
        return;
      }
      const rem = Math.max(1, Math.min(5, Math.ceil((targetAt - Date.now()) / 1000)));
      setAutoPilotCountdownSec(rem);
    };

    syncCountdown();
    const ticker = window.setInterval(syncCountdown, 250);
    return () => window.clearInterval(ticker);
  }, [
    screen,
    gameState?.autoPilotEnabled,
    gameState?.autoPilotNextAirliftAt,
    gameState?.gameMode,
    gameState?.outcome,
    gameState?.simPaused,
    anyBlockingModalOpen,
  ]);

  const pushToastError = (msg: string) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: [
          {
            id: `err_${Date.now()}`,
            type: 'info' as const,
            title: lang === 'en' ? 'High Command' : 'Dowództwo',
            message: msg,
            createdAt: Date.now(),
          },
          ...prev.notifications,
        ].slice(0, 10),
      };
    });
  };

  const handleToggleSimPause = () => {
    soundEngine.playClick();
    setGameState((prev) => (prev ? { ...prev, simPaused: !prev.simPaused } : prev));
  };

  const handleSetSimSpeed = (speed: SimSpeed) => {
    soundEngine.playClick();
    setGameState((prev) => (prev ? { ...prev, simSpeed: speed, simPaused: false } : prev));
  };

  const handleToggleAutoPilot = () => {
    soundEngine.playClick();
    setGameState((prev) => {
      if (!prev) return prev;
      const toggled = toggleAutoPilot(prev);
      if (toggled.autoPilotEnabled && advisorEnabled && voiceEnabled) {
        speakAdvisorLine(t.autoPilotActive, { lang, voiceEnabled, muted });
      }
      return toggled;
    });
  };

  const handleToggleDrawer = (drawer: Exclude<LeftDrawerId, null>) => {
    soundEngine.playClick();
    setActiveDrawer((prev) => (prev === drawer ? null : drawer));
  };

  const handleSelectProvince = (provId: string) => {
    if (!gameState) return;
    const prov = gameState.provinces[provId];
    if (!prov) return;

    soundEngine.playClick();

    if (gameState.gameMode === 'bot_spectator') {
      setInspectedCountryId(prov.ownerId);
      setActiveDrawer('diplomacy');
      return;
    }

    if (marchMode && selectedProvinceId) {
      const src = gameState.provinces[selectedProvinceId];
      if (src && (src.neighbors.includes(provId) || src.seaNeighbors.includes(provId))) {
        setMarchTargetId(provId);
        return;
      }
    }

    if (prov.ownerId === gameState.playerCountryId) {
      setSelectedProvinceId(provId);
      setMarchTargetId(null);
    } else {
      setInspectedCountryId(prov.ownerId);
      setActiveDrawer('diplomacy');
    }
  };

  const handleSelectCountryFromPanel = (countryId: string) => {
    if (!gameState) return;
    setInspectedCountryId(countryId);
    const cap =
      Object.values(gameState.provinces).find((p) => p.ownerId === countryId && p.isCapital) ??
      Object.values(gameState.provinces).find((p) => p.ownerId === countryId);
    if (cap) setFocusTarget(cap.centroid);
  };

  const handleFocusPlayerCapital = () => {
    if (!gameState) return;
    const cap =
      Object.values(gameState.provinces).find(
        (p) => p.ownerId === gameState.playerCountryId && p.isCapital,
      ) ?? Object.values(gameState.provinces).find((p) => p.ownerId === gameState.playerCountryId);
    if (cap) {
      setFocusTarget(cap.centroid);
      setSelectedProvinceId(cap.id);
    }
  };

  const handleBuild = (provId: string, building: BuildingType) => {
    if (!gameState) return;
    const res = constructBuilding(gameState, provId, building);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handleRecruit = (provId: string, unitType: UnitType, count: number) => {
    if (!gameState) return;
    const res = recruitUnits(gameState, provId, unitType, count);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handleAssimilate = (provId: string) => {
    if (!gameState) return;
    const res = assimilateProvince(gameState, provId);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handleIssueOrder = (fromId: string, toId: string, ratio: number) => {
    if (!gameState) return;
    const src = gameState.provinces[fromId];
    if (!src) return;
    const units = splitUnitsByRatio(src.units, ratio);
    const res = issueArmyOrder(gameState, fromId, toId, units);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playClick();
    setGameState(res.state);
    setMarchMode(false);
    setMarchTargetId(null);
  };

  const handleCancelOrder = (orderId: string) => {
    if (!gameState) return;
    setGameState(cancelOrder(gameState, orderId));
  };

  const handleResearchTechNode = (nodeId: TechNodeId) => {
    if (!gameState) return;
    const res = researchTechNode(gameState, nodeId);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handlePlanTechPath = (nodeId: TechNodeId) => {
    if (!gameState) return;
    const res = planTechTreePath(gameState, nodeId);
    soundEngine.playClick();
    setGameState(res.state);
  };

  const handleClearTechQueue = () => {
    if (!gameState) return;
    soundEngine.playClick();
    setGameState(clearTechQueue(gameState));
  };

  const handleBuildWarhead = () => {
    if (!gameState) return;
    const res = buildThermonuclearWarhead(gameState);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handleStrategicStrike = (targetProvinceId: string, isNuclear: boolean) => {
    if (!gameState) return;
    const res = launchStrategicStrike(gameState, targetProvinceId, isNuclear, lang);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playCannonSalvo();
    setGameState(res.state);
  };

  const handleDiplomacy = (targetId: string, action: DiplomacyAction) => {
    if (!gameState) return;
    const res = proposeDiplomacy(gameState, targetId, action, lang);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    if (action === 'war') soundEngine.playWarDeclaration();
    else soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handleDeploySpy = (targetId: string) => {
    if (!gameState) return;
    const res = deploySpy(gameState, targetId, lang);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playClick();
    setGameState(res.state);
  };

  const handleBlackOp = (targetId: string, op: BlackOpType) => {
    if (!gameState) return;
    const res = executeBlackOp(gameState, targetId, op, lang);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playClick();
    setGameState(res.state);
  };

  const handleDesignCustomUnit = (category: CustomUnitCategory, name: string) => {
    if (!gameState) return;
    const res = designCustomUnit(
      gameState,
      { name, category, armor: 8, speed: 7, firepower: 9 },
      lang,
    );
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handleLaunchSpySatellite = (targetId: string) => {
    if (!gameState) return;
    const res = launchSpySatellite(gameState, targetId, lang);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playAirliftJet();
    setGameState(res.state);
  };

  const handleToggleStraitBlockade = (straitId: StraitBlockadeId) => {
    if (!gameState) return;
    const res = toggleStraitBlockade(gameState, straitId, lang);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handleReconstructCity = (provId: string) => {
    if (!gameState) return;
    const res = reconstructProvinceCity(gameState, provId, lang);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handleAppointMinister = (role: MinisterRole, ministerId: string) => {
    if (!gameState) return;
    const res = appointMinister(gameState, role, ministerId);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handleChangeIdeology = (ideology: IdeologyId) => {
    if (!gameState) return;
    const res = changeIdeology(gameState, ideology);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handleVoteCouncil = (vote: 'yes' | 'no') => {
    if (!gameState) return;
    soundEngine.playClick();
    setGameState(voteWorldCouncil(gameState, vote));
  };

  const handleTradeMarket = (commodity: CommodityId, side: 'buy' | 'sell', qty = 5) => {
    if (!gameState) return;
    const res = tradeMarketResource(gameState, commodity, side, qty);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handleBuildMegaproject = (id: MegaprojectId) => {
    if (!gameState) return;
    const res = buildMegaproject(gameState, id);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handleFundColony = (nodeId: string) => {
    if (!gameState) return;
    const res = fundSpaceOceanColony(gameState, nodeId, lang);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handleSetTaxRate = (rate: number) => {
    if (!gameState) return;
    setGameState(setTaxRate(gameState, rate));
  };

  const handleTakeLoan = (amount: 60 | 150) => {
    if (!gameState) return;
    const res = takeBankLoan(gameState, amount);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handleRepayLoan = (loanId: string) => {
    if (!gameState) return;
    const res = repayLoan(gameState, loanId);
    if (res.error) {
      pushToastError(res.error);
      return;
    }
    soundEngine.playBuildOrRecruit();
    setGameState(res.state);
  };

  const handleResolveEvent = (choiceId: string) => {
    if (!gameState) return;
    soundEngine.playClick();
    setGameState(resolveRandomEvent(gameState, choiceId));
  };

  const handleDismissNotification = useCallback((id: string) => {
    setGameState((prev) =>
      prev ? { ...prev, notifications: prev.notifications.filter((n) => n.id !== id) } : prev,
    );
  }, []);

  const handleLoadSavedGame = (loaded: GameState) => {
    const isSpec = loaded.gameMode === 'bot_spectator';
    setGameMode(loaded.gameMode ?? 'player');
    setGameState({ ...loaded, simPaused: true });
    const cap = isSpec
      ? null
      : Object.values(loaded.provinces).find((p) => p.ownerId === loaded.playerCountryId) ?? null;
    setSelectedProvinceId(cap?.id ?? null);
    setInspectedCountryId(isSpec ? '616' : loaded.playerCountryId === '616' ? '276' : '616');
    setActiveDrawer(null);
    setScreen('playing');
  };

  const summaries = useMemo(
    () => (gameState ? computeCountrySummaries(gameState) : {}),
    [gameState],
  );

  const playerCapitalWeather = useMemo(() => {
    if (!gameState) return 'sunny' as const;
    const targetOwner =
      gameState.gameMode === 'bot_spectator' ? '616' : gameState.playerCountryId;
    const cap =
      Object.values(gameState.provinces).find(
        (p) => p.ownerId === targetOwner && p.isCapital,
      ) ?? Object.values(gameState.provinces).find((p) => p.ownerId === targetOwner);
    return cap?.weather ?? 'sunny';
  }, [gameState]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#050914]">
      {screen === 'splash' && (
        <SplashScreen t={t} onContinue={() => transitionScreen('menu')} />
      )}

      {screen === 'menu' && (
        <MainMenu
          account={account}
          gameMode={gameMode}
          onSelectGameMode={setGameMode}
          selectedScenario={selectedScenario}
          onSelectScenario={setSelectedScenario}
          selectedDifficulty={selectedDifficulty}
          onSelectDifficulty={setSelectedDifficulty}
          selectedCountryId={selectedCountryId}
          onSelectCountryId={setSelectedCountryId}
          uiMode={uiMode}
          onSelectUiMode={handleChangeUiMode}
          onStartCampaign={() => startCampaign()}
          onOpenAccount={() => setAccountOpen(true)}
          onOpenLoad={() => setSaveLoadOpen(true)}
          onOpenScenarioEditor={() => setScenarioEditorOpen(true)}
          onOpenLeaderboard={() => {
            setLeaderboardInitialTab('hall_of_fame');
            setLeaderboardOpen(true);
          }}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenTutorial={() => setTutorialOpen(true)}
          t={t}
          lang={lang}
          effectiveTier={effectiveTier}
          fpsCap={fpsCap}
        />
      )}

      {screen === 'playing' && gameState && (
        <div className="relative w-full h-full flex flex-col overflow-hidden">
          <TopHudBar
            gameState={gameState}
            summaries={summaries}
            capitalWeather={playerCapitalWeather}
            account={account}
            t={t}
            lang={lang}
            muted={muted}
            effectiveTier={effectiveTier}
            fpsCap={fpsCap}
            uiMode={uiMode}
            mapOverlayMode={mapOverlayMode}
            autoPilotCountdownSec={autoPilotCountdownSec}
            onChangeMapOverlay={setMapOverlayMode}
            onChangeUiMode={handleChangeUiMode}
            fpsDomRef={fpsDomRef}
            onToggleSimPause={handleToggleSimPause}
            onSetSimSpeed={handleSetSimSpeed}
            onToggleAutoPilot={handleToggleAutoPilot}
            onOpenBudgetDrawer={() => handleToggleDrawer('budget')}
            onOpenTechTree={() => setTechTreeOpen(true)}
            onOpenLeaderboard={() => {
              setLeaderboardInitialTab('powers');
              setLeaderboardOpen(true);
            }}
            onFocusCapital={handleFocusPlayerCapital}
            onToggleMute={handleToggleMute}
            onOpenAccount={() => setAccountOpen(true)}
            onOpenSaveLoad={() => setSaveLoadOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenTutorial={() => setTutorialOpen(true)}
            onBackToMenu={() => setScreen('menu')}
          />

          <MobileCommandHud
            gameState={gameState}
            summaries={summaries}
            selectedProvinceId={selectedProvinceId}
            marchMode={marchMode}
            muted={muted}
            mapOverlayMode={mapOverlayMode}
            autoPilotCountdownSec={autoPilotCountdownSec}
            onChangeMapOverlay={setMapOverlayMode}
            onToggleSimPause={handleToggleSimPause}
            onSetSimSpeed={handleSetSimSpeed}
            onToggleAutoPilot={handleToggleAutoPilot}
            onSetMarchMode={setMarchMode}
            onRecruit={handleRecruit}
            onBuild={handleBuild}
            onAssimilate={handleAssimilate}
            onIssueOrder={handleIssueOrder}
            onDiplomacy={handleDiplomacy}
            onOpenTechTree={() => setTechTreeOpen(true)}
            onOpenSpaceOcean={() => setSpaceOceanOpen(true)}
            onOpenCouncil={() => setCouncilOpen(true)}
            onOpenBudgetDrawer={() => handleToggleDrawer('budget')}
            onOpenLeaderboard={() => {
              setLeaderboardInitialTab('powers');
              setLeaderboardOpen(true);
            }}
            onOpenSaveLoad={() => setSaveLoadOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenTutorial={() => setTutorialOpen(true)}
            onOpenAccount={() => setAccountOpen(true)}
            onToggleMute={handleToggleMute}
            onBackToMenu={() => setScreen('menu')}
            t={t}
            lang={lang}
          />

          {/* Full-Bleed Edge-to-Edge AoH3 World Map Viewport */}
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <WorldMapCanvas
              state={gameState}
              lang={lang}
              selectedProvinceId={selectedProvinceId}
              marchSourceProvinceId={marchMode ? selectedProvinceId : null}
              mapOverlayMode={mapOverlayMode}
              onSelectProvince={handleSelectProvince}
              onSelectCity={(cityId) => setSelectedCityId(cityId)}
              onToggleStraitBlockade={handleToggleStraitBlockade}
              activeBattles={activeBattles}
              perfMode={perfMode}
              effectiveTier={effectiveTier}
              fpsCap={fpsCap}
              onLowFpsDetected={() => setAutoDowngradeSteps((s) => Math.min(2, s + 1))}
              focusTarget={focusTarget}
              fpsDomRef={fpsDomRef}
              modalOpen={anyBlockingModalOpen}
            />

            {/* Left Vertical AoH3 Command Rail */}
            <LeftToolbar
              activeDrawer={activeDrawer}
              isSpectator={gameState.gameMode === 'bot_spectator'}
              onToggleDrawer={handleToggleDrawer}
              onOpenTechTree={() => setTechTreeOpen(true)}
              onOpenSpaceOcean={() => setSpaceOceanOpen(true)}
              onOpenCouncilModal={() => setCouncilOpen(true)}
              t={t}
            />

            {/* Left Slide-Out Management Drawer */}
            <LeftSlideDrawer
              activeDrawer={activeDrawer}
              onClose={() => setActiveDrawer(null)}
              state={gameState}
              summaries={summaries}
              inspectedCountryId={inspectedCountryId}
              onSelectCountry={handleSelectCountryFromPanel}
              onDiplomacy={handleDiplomacy}
              onDeploySpy={handleDeploySpy}
              onLaunchSpySatellite={handleLaunchSpySatellite}
              onBlackOp={handleBlackOp}
              onStrategicStrike={handleStrategicStrike}
              onDesignCustomUnit={handleDesignCustomUnit}
              onToggleStraitBlockade={handleToggleStraitBlockade}
              onOpenLeaderboard={() => {
                setLeaderboardInitialTab('chronicle');
                setLeaderboardOpen(true);
              }}
              onSetTaxRate={handleSetTaxRate}
              onTakeLoan={handleTakeLoan}
              onRepayLoan={handleRepayLoan}
              onTradeMarket={handleTradeMarket}
              onBuildMegaproject={handleBuildMegaproject}
              onAppointMinister={handleAppointMinister}
              onChangeIdeology={handleChangeIdeology}
              onVoteCouncil={handleVoteCouncil}
              onCancelOrder={handleCancelOrder}
              onBuildWarhead={handleBuildWarhead}
              t={t}
              lang={lang}
            />

            {/* Bottom AoH3 Province Inspector Bar */}
            {selectedProvinceId && gameState.gameMode === 'player' && (
              <BottomProvinceBar
                state={gameState}
                selectedProvinceId={selectedProvinceId}
                marchTargetId={marchTargetId}
                marchMode={marchMode}
                hasLeftDrawerOpen={activeDrawer !== null}
                uiMode={uiMode}
                onSetMarchMode={setMarchMode}
                onOpenCityRecon={(cityId) => setSelectedCityId(cityId)}
                onClose={() => setSelectedProvinceId(null)}
                onBuild={handleBuild}
                onRecruit={handleRecruit}
                onAssimilate={handleAssimilate}
                onReconstructCity={handleReconstructCity}
                onIssueOrder={handleIssueOrder}
                onCancelOrder={handleCancelOrder}
                t={t}
                lang={lang}
              />
            )}

            {/* Speaking Voice Tactical AI Advisor */}
            <TacticalAdvisorWidget
              state={gameState}
              enabled={advisorEnabled}
              onToggle={handleToggleAdvisor}
              voiceEnabled={voiceEnabled}
              onToggleVoice={handleToggleVoice}
              muted={muted}
              lang={lang}
              t={t}
              effectiveTier={effectiveTier}
            />
          </div>

          <NotificationStack
            notifications={gameState.notifications}
            activeBattles={activeBattles}
            onDismiss={handleDismissNotification}
            pauseHint={t.pauseNotificationHint}
          />

          <TreasuryModal
            isOpen={treasuryOpen}
            onClose={() => setTreasuryOpen(false)}
            state={gameState}
            onSetTaxRate={handleSetTaxRate}
            onTakeLoan={handleTakeLoan}
            onRepayLoan={handleRepayLoan}
            t={t}
            effectiveTier={effectiveTier}
          />

          <TechTreeModal
            isOpen={techTreeOpen}
            onClose={() => setTechTreeOpen(false)}
            state={gameState}
            onResearchNode={handleResearchTechNode}
            onPlanPath={handlePlanTechPath}
            onClearQueue={handleClearTechQueue}
            t={t}
            lang={lang}
            effectiveTier={effectiveTier}
          />

          <SpaceOceanModal
            isOpen={spaceOceanOpen}
            onClose={() => setSpaceOceanOpen(false)}
            state={gameState}
            onFundColony={handleFundColony}
            t={t}
            lang={lang}
            effectiveTier={effectiveTier}
          />

          <GeopoliticsCouncilModal
            isOpen={councilOpen}
            onClose={() => setCouncilOpen(false)}
            state={gameState}
            onAppointMinister={handleAppointMinister}
            onChangeIdeology={handleChangeIdeology}
            onVoteCouncil={handleVoteCouncil}
            onTradeResource={handleTradeMarket}
            onBuildMegaproject={handleBuildMegaproject}
            t={t}
            lang={lang}
            effectiveTier={effectiveTier}
          />

          <RandomEventModal
            event={gameState.pendingEvent}
            effectiveTier={effectiveTier}
            onChoose={handleResolveEvent}
            t={t}
          />

          <GameOverModal
            state={gameState}
            t={t}
            lang={lang}
            effectiveTier={effectiveTier}
            onPlayAgain={() =>
              startCampaign(
                gameState.scenarioId,
                gameState.playerCountryId === '__SPECTATOR__' ? '616' : gameState.playerCountryId,
                gameState.difficulty,
                gameState.gameMode,
              )
            }
            onBackToMenu={() => setScreen('menu')}
          />

          <CityReconModal
            city={selectedCityId ? getCityById(selectedCityId) : null}
            onClose={() => setSelectedCityId(null)}
            lang={lang}
            t={t}
            effectiveTier={effectiveTier}
          />
        </div>
      )}

      {/* Shared Modals */}
      <ScenarioEditorModal
        isOpen={scenarioEditorOpen}
        onClose={() => setScenarioEditorOpen(false)}
        baseScenarioId={selectedScenario}
        onLaunchCustom={(cfg) =>
          startCampaign(cfg.baseScenarioId, selectedCountryId, selectedDifficulty, gameMode, cfg)
        }
        t={t}
        lang={lang}
        effectiveTier={effectiveTier}
      />

      <LeaderboardChronicleModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        state={screen === 'playing' ? gameState : null}
        initialTab={leaderboardInitialTab}
        effectiveTier={effectiveTier}
        lang={lang}
        t={t}
      />

      <AccountModal
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        account={account}
        onAccountChange={setAccount}
        t={t}
        lang={lang}
        effectiveTier={effectiveTier}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        lang={lang}
        onChangeLang={handleChangeLang}
        perfMode={perfMode}
        onChangePerfMode={handleChangePerfMode}
        fpsCap={fpsCap}
        onChangeFpsCap={handleChangeFpsCap}
        effectiveTier={effectiveTier}
        muted={muted}
        onToggleMute={handleToggleMute}
        advisorEnabled={advisorEnabled}
        onToggleAdvisor={handleToggleAdvisor}
        voiceEnabled={voiceEnabled}
        onToggleVoice={handleToggleVoice}
        uiMode={uiMode}
        onChangeUiMode={handleChangeUiMode}
        t={t}
      />

      <SaveLoadModal
        isOpen={saveLoadOpen}
        onClose={() => setSaveLoadOpen(false)}
        account={account}
        currentState={screen === 'playing' ? gameState : null}
        onLoadState={handleLoadSavedGame}
        t={t}
        effectiveTier={effectiveTier}
      />

      <TutorialModal
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        t={t}
        effectiveTier={effectiveTier}
      />
    </div>
  );
}
