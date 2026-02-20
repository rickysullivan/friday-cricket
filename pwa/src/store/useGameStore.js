import { create } from "zustand";

const initialConfig = {
  team1Players: 8,
  team2Players: 8,
  team1Pairs: 4,
  team2Pairs: 4,
  oversPerPair: 4,
  team1TotalOvers: 16,
  team2TotalOvers: 16
};

const noopAsync = async () => null;
const noop = () => {};

export const formatGameTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const formatOvers = (completedOvers, balls) => {
  if (!balls || balls === 0) return completedOvers;
  return `${completedOvers}.${balls}`;
};

export const useGameStore = create((set) => ({
  config: initialConfig,
  gameState: "welcome",
  innings: 1,
  firstInningsStats: null,
  ballsHistory: [],
  overs: 0,
  totalWickets: 0,
  totalBadBalls: 0,
  currentPair: 1,
  wicketPending: false,
  history: [],
  showMenu: false,
  modalConfig: { isOpen: false, type: null },

  gameStartTime: null,
  pausedDuration: 0,
  isPaused: false,
  pauseStartTime: null,
  halfTimeStartTime: null,
  elapsedTime: 0,

  showShareModal: false,
  copiedGameId: false,
  showWatchModal: false,
  watchGameIdInput: "",
  watchError: "",
  isJoining: false,
  showIOSInstall: false,
  pendingWatchId: null,
  showOpenInAppPrompt: false,
  isReconnecting: false,

  gameId: null,
  isViewer: false,
  isConnected: false,
  viewerCount: 0,
  syncError: null,
  isSyncConfigured: false,

  permission: "default",
  canInstall: false,
  isInstalled: false,
  isIOS: false,

  actions: {
    requestPermission: noopAsync,
    promptInstall: noop,
    onSetup: noop,
    onStartGame: noop,
    onStartSecondInnings: noop,
    onUndo: noop,
    onToggleMenu: noop,
    onPauseGame: noop,
    onResumeGame: noop,
    onRequestEndInningsEarly: noop,
    onRequestEndGameEarly: noop,
    onRequestResetGame: noop,
    onCloseMenu: noop,
    onOpenShareModal: noop,
    onCloseShareModal: noop,
    onCloseModal: noop,
    onBadBall: noop,
    onWicket: noop,
    onGoodBall: noop,
    onOpenWatchModal: noop,
    onCloseWatchModal: noop,
    onJoinGame: noopAsync,
    onWatchGameIdChange: noop,
    onCopyGameId: noopAsync,
    onCopyPendingWatchId: noopAsync,
    onWatchInBrowser: noop,
    onCancelOpenInAppPrompt: noop,
    onBackToHome: noop
  },

  setActions: (nextActions) => {
    set((state) => ({ actions: { ...state.actions, ...nextActions } }));
  },

  setConfig: (config) => set({ config }),
  setGameState: (gameState) => set({ gameState }),
  setInnings: (innings) => set({ innings }),
  setFirstInningsStats: (firstInningsStats) => set({ firstInningsStats }),
  setBallsHistory: (ballsHistory) => set({ ballsHistory }),
  setOvers: (overs) => set({ overs }),
  setTotalWickets: (totalWickets) => set({ totalWickets }),
  setTotalBadBalls: (totalBadBalls) => set({ totalBadBalls }),
  setCurrentPair: (currentPair) => set({ currentPair }),
  setWicketPending: (wicketPending) => set({ wicketPending }),
  setShowMenu: (showMenu) => set({ showMenu }),
  setModalConfig: (modalConfigOrUpdater) => {
    set((state) => ({
      modalConfig: typeof modalConfigOrUpdater === "function"
        ? modalConfigOrUpdater(state.modalConfig)
        : modalConfigOrUpdater
    }));
  },
  setGameStartTime: (gameStartTime) => set({ gameStartTime }),
  setPausedDuration: (pausedDuration) => set({ pausedDuration }),
  setIsPaused: (isPaused) => set({ isPaused }),
  setPauseStartTime: (pauseStartTime) => set({ pauseStartTime }),
  setHalfTimeStartTime: (halfTimeStartTime) => set({ halfTimeStartTime }),
  setElapsedTime: (elapsedTime) => set({ elapsedTime }),
  setShowShareModal: (showShareModal) => set({ showShareModal }),
  setCopiedGameId: (copiedGameId) => set({ copiedGameId }),
  setShowWatchModal: (showWatchModal) => set({ showWatchModal }),
  setWatchGameIdInput: (watchGameIdInput) => set({ watchGameIdInput }),
  setWatchError: (watchError) => set({ watchError }),
  setIsJoining: (isJoining) => set({ isJoining }),
  setShowIOSInstall: (showIOSInstall) => set({ showIOSInstall }),
  setPendingWatchId: (pendingWatchId) => set({ pendingWatchId }),
  setShowOpenInAppPrompt: (showOpenInAppPrompt) => set({ showOpenInAppPrompt }),
  setIsReconnecting: (isReconnecting) => set({ isReconnecting }),
  setSyncInfo: (syncInfo) => set(syncInfo),
  setPwaInfo: (pwaInfo) => set(pwaInfo),
  setPermission: (permission) => set({ permission }),

  updateConfig: (key, value) => {
    set((state) => {
      const newConfig = { ...state.config, [key]: value };

      if (key === "team1Players") {
        newConfig.team1Pairs = Math.ceil(value / 2);
        newConfig.team1TotalOvers = newConfig.team1Pairs * newConfig.oversPerPair;
      }
      if (key === "team2Players") {
        newConfig.team2Pairs = Math.ceil(value / 2);
        newConfig.team2TotalOvers = newConfig.team2Pairs * newConfig.oversPerPair;
      }
      if (key === "oversPerPair") {
        newConfig.team1TotalOvers = newConfig.team1Pairs * value;
        newConfig.team2TotalOvers = newConfig.team2Pairs * value;
      }

      return { config: newConfig };
    });
  },

  saveHistory: () => {
    set((state) => ({
      history: [
        ...state.history,
        {
          ballsHistory: [...state.ballsHistory],
          overs: state.overs,
          totalWickets: state.totalWickets,
          totalBadBalls: state.totalBadBalls,
          currentPair: state.currentPair,
          gameState: state.gameState,
          wicketPending: state.wicketPending,
          innings: state.innings,
          firstInningsStats: state.firstInningsStats,
          config: state.config
        }
      ]
    }));
  },

  resetForMatchStart: () => {
    set({
      gameState: "active",
      innings: 1,
      firstInningsStats: null,
      ballsHistory: [],
      overs: 0,
      totalWickets: 0,
      totalBadBalls: 0,
      currentPair: 1,
      history: [],
      wicketPending: false,
      gameStartTime: Date.now(),
      pausedDuration: 0,
      isPaused: false,
      pauseStartTime: null,
      halfTimeStartTime: null,
      elapsedTime: 0
    });
  },

  goToWelcome: () => {
    set({
      gameState: "welcome",
      history: [],
      modalConfig: { isOpen: false, type: null }
    });
  },

  applyGameState: (nextState) => {
    if (!nextState) return;
    set((state) => ({
      config: nextState.config ?? state.config,
      gameState: nextState.gameState ?? state.gameState,
      innings: nextState.innings ?? state.innings,
      firstInningsStats: nextState.firstInningsStats ?? state.firstInningsStats,
      ballsHistory: nextState.ballsHistory ?? state.ballsHistory,
      overs: nextState.overs ?? state.overs,
      totalWickets: nextState.totalWickets ?? state.totalWickets,
      totalBadBalls: nextState.totalBadBalls ?? state.totalBadBalls,
      currentPair: nextState.currentPair ?? state.currentPair,
      elapsedTime: nextState.elapsedTime ?? state.elapsedTime,
      isPaused: nextState.isPaused ?? state.isPaused
    }));
  }
}));
