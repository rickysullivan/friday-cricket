import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, Power, RotateCcw, SkipForward, Trophy, Users, XCircle } from 'lucide-react';
import { Button } from './components/Button';
import { ActiveGameScreen } from './components/screens/ActiveGameScreen';
import { CompleteScreen } from './components/screens/CompleteScreen';
import { HalfTimeScreen } from './components/screens/HalfTimeScreen';
import { OpenInAppPromptScreen } from './components/screens/OpenInAppPromptScreen';
import { ReconnectingScreen } from './components/screens/ReconnectingScreen';
import { SetupScreen } from './components/screens/SetupScreen';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { useNotifications } from './hooks/useNotifications';
import { useGameSync } from './hooks/useGameSync';

// --- Main App Component ---

export default function FridayCricketTracker() {
  // Notifications
  const { permission, requestPermission, notify, pendingAction, consumeAction } = useNotifications();

  // PWA Install
  const { canInstall, isInstalled, isIOS, promptInstall } = useInstallPrompt();
  const [showIOSInstall, setShowIOSInstall] = useState(false);

  // Game Sync
  const {
    gameId,
    isViewer,
    isConnected,
    viewerCount,
    error: syncError,
    isConfigured: isSyncConfigured,
    createGame,
    joinGame,
    reconnectAsUmpire,
    syncState,
    endGame: endSyncGame,
    subscribeToGame,
    leaveGame,
    clearError: clearSyncError
  } = useGameSync();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedGameId, setCopiedGameId] = useState(false);
  const [showWatchModal, setShowWatchModal] = useState(false);
  const [watchGameIdInput, setWatchGameIdInput] = useState('');
  const [watchError, setWatchError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Game Configuration State
  const [config, setConfig] = useState({
    team1Players: 8,
    team2Players: 8,
    team1Pairs: 4,
    team2Pairs: 4,
    oversPerPair: 4,
    team1TotalOvers: 16,
    team2TotalOvers: 16
  });

  // Game State
  const [gameState, setGameState] = useState('welcome'); // welcome, setup, active, halfTime, complete
  const [innings, setInnings] = useState(1); // 1 or 2
  // Stores { wickets, badBalls, overs, balls, duration } for innings 1
  const [firstInningsStats, setFirstInningsStats] = useState(null); 
  
  const [ballsHistory, setBallsHistory] = useState([]); 
  const [overs, setOvers] = useState(0);
  const [totalWickets, setTotalWickets] = useState(0);
  const [totalBadBalls, setTotalBadBalls] = useState(0);
  const [currentPair, setCurrentPair] = useState(1);
  const [wicketPending, setWicketPending] = useState(false);
  const [history, setHistory] = useState([]); 
  const [showMenu, setShowMenu] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null });

  // Timer state
  const [gameStartTime, setGameStartTime] = useState(null);
  const [pausedDuration, setPausedDuration] = useState(0); // Total ms paused (including half time)
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [halfTimeStartTime, setHalfTimeStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0); // For display updates

  const BALLS_PER_OVER = 6;

  // Derived values for current state
  const currentTotalOvers = innings === 1 ? config.team1TotalOvers : config.team2TotalOvers;
  const currentTotalPairs = innings === 1 ? config.team1Pairs : config.team2Pairs;

  // Game timer - updates every second when game is active
  useEffect(() => {
    if (gameState !== 'active' || !gameStartTime || isPaused) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - gameStartTime - pausedDuration;
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, gameStartTime, isPaused, pausedDuration]);

  // Sync game state to Supabase when relevant state changes
  useEffect(() => {
    if (!gameId || isViewer) return;

    const stateToSync = {
      config,
      gameState,
      innings,
      firstInningsStats,
      ballsHistory,
      overs,
      totalWickets,
      totalBadBalls,
      currentPair,
      elapsedTime,
      isPaused
    };

    syncState(stateToSync);
  }, [gameId, isViewer, config, gameState, innings, firstInningsStats, ballsHistory, overs, totalWickets, totalBadBalls, currentPair, elapsedTime, isPaused, syncState]);

  // Check if running as installed PWA (standalone mode)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

  // State for QR code landing page (when opened in browser, not PWA)
  const [pendingWatchId, setPendingWatchId] = useState(null);
  const [showOpenInAppPrompt, setShowOpenInAppPrompt] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const applyGameState = useCallback((state) => {
    if (!state) return;
    if (state.config) setConfig(state.config);
    if (state.gameState) setGameState(state.gameState);
    if (state.innings !== undefined) setInnings(state.innings);
    if (state.firstInningsStats !== undefined) setFirstInningsStats(state.firstInningsStats);
    if (state.ballsHistory) setBallsHistory(state.ballsHistory);
    if (state.overs !== undefined) setOvers(state.overs);
    if (state.totalWickets !== undefined) setTotalWickets(state.totalWickets);
    if (state.totalBadBalls !== undefined) setTotalBadBalls(state.totalBadBalls);
    if (state.currentPair !== undefined) setCurrentPair(state.currentPair);
    if (state.elapsedTime !== undefined) setElapsedTime(state.elapsedTime);
    if (state.isPaused !== undefined) setIsPaused(state.isPaused);
  }, []);

  // Save game session to localStorage whenever gameId changes
  useEffect(() => {
    if (gameId && gameState !== 'welcome') {
      const session = {
        gameId,
        isViewer,
        timestamp: Date.now()
      };
      localStorage.setItem('active_game_session', JSON.stringify(session));
    }
  }, [gameId, isViewer, gameState]);

  // Clear session when game ends or returns to welcome
  useEffect(() => {
    if (gameState === 'welcome' && !showOpenInAppPrompt) {
      localStorage.removeItem('active_game_session');
    }
  }, [gameState, showOpenInAppPrompt]);

  // Reconnect to active game on page load/refresh
  useEffect(() => {
    if (!isSyncConfigured) return;

    const savedSession = localStorage.getItem('active_game_session');
    if (!savedSession) return;

    try {
      const session = JSON.parse(savedSession);
      // Only reconnect if session is less than 4 hours old
      const maxAge = 4 * 60 * 60 * 1000; // 4 hours
      if (Date.now() - session.timestamp > maxAge) {
        localStorage.removeItem('active_game_session');
        return;
      }

      // Try to reconnect
      setIsReconnecting(true);

      const applyState = (state) => {
        applyGameState(state);

        // Restore timer state for active games
        if (state?.gameState === 'active') {
          setGameStartTime(Date.now() - (state.elapsedTime || 0));
          setPausedDuration(0);
        }
      };

      if (session.isViewer) {
        // Viewer: rejoin the game
        (async () => {
          try {
            const initialState = await joinGame(session.gameId);
            if (initialState) {
              applyState(initialState);
              console.log('Reconnected as viewer to game:', session.gameId);
            } else {
              localStorage.removeItem('active_game_session');
            }
          } catch (err) {
            console.error('Failed to reconnect as viewer:', err);
            localStorage.removeItem('active_game_session');
          } finally {
            setIsReconnecting(false);
          }
        })();
      } else {
        // Umpire: reconnect using the hook
        (async () => {
          try {
            const state = await reconnectAsUmpire(session.gameId);
            if (state) {
              applyState(state);
              console.log('Reconnected as umpire to game:', session.gameId);
            } else {
              localStorage.removeItem('active_game_session');
            }
          } catch (err) {
            console.error('Failed to reconnect as umpire:', err);
            localStorage.removeItem('active_game_session');
          } finally {
            setIsReconnecting(false);
          }
        })();
      }
    } catch (err) {
      console.error('Failed to parse saved session:', err);
      localStorage.removeItem('active_game_session');
    }
  }, [isSyncConfigured, joinGame, reconnectAsUmpire, applyGameState]);

  // Check for ?watch=GAMEID URL parameter on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const watchId = params.get('watch');

    if (watchId) {
      const upperWatchId = watchId.toUpperCase();
      setWatchGameIdInput(upperWatchId);

      // If opened in browser (not PWA), show the "Open in App" prompt
      if (!isStandalone) {
        // Store in localStorage so PWA can pick it up
        localStorage.setItem('pending_watch_game', upperWatchId);
        setPendingWatchId(upperWatchId);
        setShowOpenInAppPrompt(true);
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // If in PWA, join directly
      if (isSyncConfigured) {
        (async () => {
          setIsJoining(true);
          try {
            const initialState = await joinGame(watchId);
            applyGameState(initialState);
          } finally {
            setIsJoining(false);
          }
        })();
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isSyncConfigured, joinGame, isStandalone, applyGameState]);

  // Check for pending watch game from localStorage (when PWA opens after QR scan)
  useEffect(() => {
    if (!isStandalone || !isSyncConfigured) return;

    const pendingGame = localStorage.getItem('pending_watch_game');
    if (pendingGame && gameState === 'welcome' && !isViewer) {
      // Clear it first to prevent loops
      localStorage.removeItem('pending_watch_game');
      // Set the input and show the modal
      setWatchGameIdInput(pendingGame);
      setShowWatchModal(true);
    }
  }, [isStandalone, isSyncConfigured, gameState, isViewer]);

  // Refs to track previous values for viewer notifications (avoids re-subscription loops)
  const prevStateRef = useRef({
    overs: 0,
    totalWickets: 0,
    totalBadBalls: 0,
    currentPair: 1,
    gameState: 'welcome',
    innings: 1,
    ballsLength: 0,
    initialized: false
  });

  // Ref for notify function to avoid re-subscription
  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  }, [notify]);

  // Subscribe to realtime updates when in viewer mode
  useEffect(() => {
    if (!isViewer || !gameId) return;

    const unsubscribe = subscribeToGame((newState) => {
      const prev = prevStateRef.current;
      const notifyFn = notifyRef.current;

      // Detect changes and send notifications
      const newOvers = newState.overs ?? prev.overs;
      const newWickets = newState.totalWickets ?? prev.totalWickets;
      const newBadBalls = newState.totalBadBalls ?? prev.totalBadBalls;
      const newPair = newState.currentPair ?? prev.currentPair;
      const newGameState = newState.gameState ?? prev.gameState;
      const newInnings = newState.innings ?? prev.innings;
      const newBallsLength = newState.ballsHistory?.length ?? prev.ballsLength;
      const totalOvers = newState.config?.team1TotalOvers || 16;

      // Only send notifications after initial state is received
      if (prev.initialized) {
        // Ball count notification (for all ball types)
        if (newBallsLength > prev.ballsLength && newBallsLength < 6) {
          const lastBallType = newState.ballsHistory?.[newBallsLength - 1];
          let ballMessage = 'Good delivery';
          if (lastBallType === 'wicket') {
            ballMessage = 'Wicket confirmed';
          } else if (lastBallType === 'bad') {
            ballMessage = 'Free hit taken';
          }
          notifyFn(`Ball ${newBallsLength}/6`, {
            body: `Over ${newOvers + 1}/${totalOvers} • ${ballMessage}`,
            tag: 'ball',
            silent: true
          });
        }

        // Wicket notification
        if (newWickets > prev.totalWickets) {
          notifyFn('WICKET!', {
            body: `Wicket #${newWickets} - Change ends`,
            tag: 'game-event',
            vibrate: [300, 100, 300, 100, 300]
          });
        }

        // Bad ball notification
        if (newBadBalls > prev.totalBadBalls) {
          notifyFn('Bad Ball - FREE HIT!', {
            body: `Over ${newOvers + 1}/${totalOvers}`,
            tag: 'ball',
            vibrate: [200, 100, 200]
          });
        }

        // New batting pair notification
        if (newPair > prev.currentPair) {
          notifyFn('NEW BATTING PAIR!', {
            body: `Pair ${newPair} coming in`,
            tag: 'game-event',
            vibrate: [200, 100, 200, 100, 200]
          });
        }

        // Over complete notification (when balls reset to 0 and overs increase)
        if (newOvers > prev.overs && newBallsLength === 0) {
          notifyFn('Over Complete', {
            body: `Over ${newOvers}/${totalOvers} • Rotate fielders`,
            tag: 'game-event',
            vibrate: [150, 75, 150]
          });
        }

        // Half time notification
        if (newGameState === 'halfTime' && prev.gameState !== 'halfTime') {
          notifyFn('HALF TIME!', {
            body: `1st Innings complete`,
            tag: 'game-phase',
            vibrate: [200, 100, 200, 100, 200, 100, 200]
          });
        }

        // Second innings notification
        if (newInnings === 2 && prev.innings === 1 && newGameState === 'active') {
          notifyFn('2nd Innings Started!', {
            body: 'Game is back on',
            tag: 'game-phase'
          });
        }

        // Match complete notification
        if (newGameState === 'complete' && prev.gameState !== 'complete') {
          notifyFn('MATCH COMPLETE!', {
            body: 'Great game!',
            tag: 'game-phase',
            vibrate: [500, 200, 500]
          });
        }
      }

      // Update previous values ref
      prevStateRef.current = {
        overs: newOvers,
        totalWickets: newWickets,
        totalBadBalls: newBadBalls,
        currentPair: newPair,
        gameState: newGameState,
        innings: newInnings,
        ballsLength: newBallsLength,
        initialized: true
      };

      // Apply the synced state to local state
      applyGameState(newState);
    });

    return unsubscribe;
  }, [isViewer, gameId, subscribeToGame, applyGameState]);

  // Handle joining a game as viewer
  const handleJoinGame = async (id = watchGameIdInput) => {
    if (!id.trim()) {
      setWatchError('Please enter a game ID');
      return;
    }

    setIsJoining(true);
    setWatchError('');
    clearSyncError();

    try {
      const initialState = await joinGame(id);
      if (initialState) {
        applyGameState(initialState);
        setShowWatchModal(false);
        setWatchGameIdInput('');
      } else {
        setWatchError('Game not found');
      }
    } catch (err) {
      setWatchError('Failed to join game');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyPendingWatchId = async () => {
    if (!pendingWatchId) return;
    try {
      await navigator.clipboard.writeText(pendingWatchId);
      setCopiedGameId(true);
      setTimeout(() => setCopiedGameId(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleWatchInBrowser = () => {
    setShowOpenInAppPrompt(false);
    setPendingWatchId(null);
    // Don't clear localStorage - keep it for PWA
    handleJoinGame(pendingWatchId);
  };

  const handleCancelOpenInAppPrompt = () => {
    setShowOpenInAppPrompt(false);
    setPendingWatchId(null);
    localStorage.removeItem('pending_watch_game');
  };

  // Copy game ID to clipboard
  const copyGameId = async () => {
    if (!gameId) return;
    try {
      await navigator.clipboard.writeText(gameId);
      setCopiedGameId(true);
      setTimeout(() => setCopiedGameId(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get the share URL for QR code
  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?watch=${gameId}`;
  };

  // Format elapsed time as MM:SS
  const formatGameTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Pause/Resume handlers
  const pauseGame = () => {
    setIsPaused(true);
    setPauseStartTime(Date.now());
    setShowMenu(false);
  };

  const resumeGame = () => {
    if (pauseStartTime) {
      const pauseDuration = Date.now() - pauseStartTime;
      setPausedDuration(prev => prev + pauseDuration);
    }
    setIsPaused(false);
    setPauseStartTime(null);
    setShowMenu(false);
  };

  // Handle undo action from notification
  useEffect(() => {
    if (pendingAction?.type === 'undo') {
      console.log('Undo triggered from notification');
      handleUndo();
      consumeAction();
    }
  }, [pendingAction]);

  // --- Configuration Logic ---
  
  const updateConfig = (key, value) => {
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value };
      
      // Recalculate based on which value changed
      if (key === 'team1Players') {
        newConfig.team1Pairs = Math.ceil(value / 2);
        newConfig.team1TotalOvers = newConfig.team1Pairs * newConfig.oversPerPair;
      }
      if (key === 'team2Players') {
        newConfig.team2Pairs = Math.ceil(value / 2);
        newConfig.team2TotalOvers = newConfig.team2Pairs * newConfig.oversPerPair;
      }
      if (key === 'oversPerPair') {
        newConfig.team1TotalOvers = newConfig.team1Pairs * value;
        newConfig.team2TotalOvers = newConfig.team2Pairs * value;
      }
      
      return newConfig;
    });
  };

  // --- Logic Helpers ---

  const saveHistory = () => {
    setHistory(prev => [...prev, {
      ballsHistory: [...ballsHistory],
      overs,
      totalWickets,
      totalBadBalls,
      currentPair,
      gameState,
      wicketPending,
      innings,
      firstInningsStats,
      config
    }]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    const previousState = history[history.length - 1];
    setBallsHistory(previousState.ballsHistory);
    setOvers(previousState.overs);
    setTotalWickets(previousState.totalWickets);
    setTotalBadBalls(previousState.totalBadBalls);
    setCurrentPair(previousState.currentPair);
    setGameState(previousState.gameState);
    setWicketPending(previousState.wicketPending);
    setInnings(previousState.innings);
    setFirstInningsStats(previousState.firstInningsStats);
    if(previousState.config) setConfig(previousState.config);
    
    setHistory(prev => prev.slice(0, -1));
    setModalConfig({ isOpen: false, type: null });
  };

  const checkEndOfOver = (newHistory) => {
    if (newHistory.length >= BALLS_PER_OVER) {
      endOver(newHistory);
    }
  };

  const formatOvers = (completedOvers, balls) => {
    if (!balls || balls === 0) return completedOvers;
    return `${completedOvers}.${balls}`;
  };

  // --- Event Handlers ---

  const goToSetup = () => {
    setGameState('setup');
  };

  const startGame = async () => {
    setGameState('active');
    setInnings(1);
    setFirstInningsStats(null);
    setBallsHistory([]);
    setOvers(0);
    setTotalWickets(0);
    setTotalBadBalls(0);
    setCurrentPair(1);
    setHistory([]);
    setWicketPending(false);

    // Initialize timer
    setGameStartTime(Date.now());
    setPausedDuration(0);
    setIsPaused(false);
    setPauseStartTime(null);
    setHalfTimeStartTime(null);
    setElapsedTime(0);

    // Create game in Supabase for syncing
    if (isSyncConfigured) {
      const initialState = {
        config,
        gameState: 'active',
        innings: 1,
        firstInningsStats: null,
        ballsHistory: [],
        overs: 0,
        totalWickets: 0,
        totalBadBalls: 0,
        currentPair: 1,
        elapsedTime: 0,
        isPaused: false
      };
      await createGame(initialState);
    }

    notify('Match Started!', {
      body: `1st Innings - ${config.team1TotalOvers} overs`,
      tag: 'game-phase'
    });
  };

  const startSecondInnings = () => {
    saveHistory();

    // Add half time duration to paused time
    if (halfTimeStartTime) {
      const halfTimeDuration = Date.now() - halfTimeStartTime;
      setPausedDuration(prev => prev + halfTimeDuration);
      setHalfTimeStartTime(null);
    }

    setGameState('active');
    setInnings(2);
    setBallsHistory([]);
    setOvers(0);
    setTotalWickets(0);
    setTotalBadBalls(0);
    setCurrentPair(1);
    setWicketPending(false);

    notify('2nd Innings Started!', {
      body: `${config.team2TotalOvers} overs to play`,
      tag: 'game-phase'
    });
  };

  const requestResetGame = () => {
    setShowMenu(false);
    setModalConfig({
      isOpen: true,
      type: 'confirmReset',
      title: 'Reset Match?',
      content: (
        <div className="space-y-4">
          <div className="bg-rose-100 text-rose-700 p-4 rounded-xl flex flex-col items-center gap-2">
            <RotateCcw size={48} />
            <p className="font-bold text-lg">Start Over</p>
          </div>
          <p className="text-slate-600">
            Are you sure you want to erase all progress and return to the home screen?
          </p>
        </div>
      ),
      action: (
        <Button 
          variant="danger" 
          size="xl" 
          onClick={() => {
            setGameState('welcome');
            setHistory([]);
            setModalConfig({ ...modalConfig, isOpen: false });
          }}
        >
          Yes, Reset Match
        </Button>
      )
    });
  };

  const requestEndInningsEarly = () => {
    setShowMenu(false);
    setModalConfig({
      isOpen: true,
      type: 'confirmEndInnings',
      title: 'End Innings Early?',
      content: (
        <div className="space-y-4">
          <div className="bg-purple-100 text-purple-700 p-4 rounded-xl flex flex-col items-center gap-2">
            <SkipForward size={48} />
            <p className="font-bold text-lg">Skip to Halftime</p>
          </div>
          <p className="text-slate-600">
            Finish Team 1's innings now and go to the Half Time Report?
          </p>
        </div>
      ),
      action: (
        <Button 
          variant="purple" 
          size="xl" 
          onClick={() => {
            saveHistory();
            setFirstInningsStats({
              wickets: totalWickets,
              badBalls: totalBadBalls,
              overs: overs,
              balls: ballsHistory.length,
              duration: elapsedTime
            });
            setHalfTimeStartTime(Date.now());
            setGameState('halfTime');
            setModalConfig({ ...modalConfig, isOpen: false });
          }}
        >
          Yes, End Innings
        </Button>
      )
    });
  };

  const requestEndGameEarly = () => {
     setShowMenu(false);
     setModalConfig({
      isOpen: true,
      type: 'confirmEnd',
      title: 'End Match Early?',
      content: (
        <div className="space-y-4">
          <div className="bg-amber-100 text-amber-700 p-4 rounded-xl flex flex-col items-center gap-2">
            <Power size={48} />
            <p className="font-bold text-lg">Finish Now</p>
          </div>
          <p className="text-slate-600">
            This will end the game immediately and show the final stats.
          </p>
        </div>
      ),
      action: (
        <Button 
          variant="warning" 
          size="xl" 
          onClick={() => {
            saveHistory();
            setGameState('complete');
            setModalConfig({ ...modalConfig, isOpen: false });
          }}
        >
          Yes, End Match
        </Button>
      )
    });
  };

  const handleGoodBallClick = () => {
    saveHistory();
    const type = wicketPending ? 'wicket' : 'good';
    const newHistory = [...ballsHistory, type];
    setBallsHistory(newHistory);
    setWicketPending(false);

    // Notify ball count (only if not end of over - that has its own notification)
    if (newHistory.length < BALLS_PER_OVER) {
      notify(`Ball ${newHistory.length}/6`, {
        body: `Over ${overs + 1}/${currentTotalOvers} • ${type === 'wicket' ? 'Wicket confirmed' : 'Good delivery'}`,
        tag: 'ball',
        silent: true
      });
    }

    checkEndOfOver(newHistory);
  };

  const handleBadBallTrigger = () => {
    setModalConfig({ 
      isOpen: true, 
      type: 'badBall',
      title: 'Bad Ball Detected',
      content: (
        <div className="space-y-4">
          <div className="bg-amber-100 text-amber-700 p-4 rounded-xl flex flex-col items-center gap-2">
            <AlertCircle size={48} />
            <p className="font-bold text-lg">FREE HIT!</p>
          </div>
          <p className="text-slate-600">
            1. Place ball on the <strong>Hitting Tee</strong>.<br/>
            2. Batter gets a free hit.<br/>
            3. This counts as the ball.
          </p>
        </div>
      ),
      action: (
        <Button
          variant="warning"
          size="xl"
          onClick={() => {
            saveHistory();
            setModalConfig({ ...modalConfig, isOpen: false });
            setTotalBadBalls(prev => prev + 1);
            const newHistory = [...ballsHistory, 'bad'];
            setBallsHistory(newHistory);
            setWicketPending(false);

            notify('Bad Ball - FREE HIT!', {
              body: `Over ${overs + 1}/${currentTotalOvers} • Ball ${newHistory.length}/6`,
              tag: 'ball',
              vibrate: [200, 100, 200]
            });

            checkEndOfOver(newHistory);
          }}
        >
          Hit Taken - Count Ball
        </Button>
      )
    });
  };

  const handleWicketTrigger = () => {
    setModalConfig({
      isOpen: true,
      type: 'wicket',
      title: 'Wicket!',
      content: (
        <div className="space-y-4">
          <div className="bg-rose-100 text-rose-700 p-4 rounded-xl flex flex-col items-center gap-2">
            <XCircle size={48} />
            <p className="font-bold text-lg">BATTER IS OUT</p>
          </div>
          <p className="text-slate-600 font-medium">
            Batter does NOT leave the pitch.
          </p>
          <p className="text-lg font-bold text-slate-800">
            Change Ends Now
          </p>
          <div className="bg-slate-50 p-2 rounded text-xs text-slate-500 mt-2">
            (Wicket recorded. If you haven't clicked "Good Ball" yet, do it next.)
          </div>
        </div>
      ),
      action: (
        <Button
          variant="danger"
          size="xl"
          onClick={() => {
            saveHistory();
            const newWicketCount = totalWickets + 1;
            setTotalWickets(newWicketCount);
            setModalConfig({ ...modalConfig, isOpen: false });

            notify('WICKET!', {
              body: `Over ${overs + 1}/${currentTotalOvers} • Wicket #${newWicketCount} - Change ends`,
              tag: 'game-event',
              vibrate: [300, 100, 300, 100, 300],
              requireInteraction: true,
              actions: [
                { action: 'undo', title: 'Undo', icon: '/icon-192.png' },
                { action: 'dismiss', title: 'OK' }
              ]
            });

            if (ballsHistory.length > 0 && ballsHistory[ballsHistory.length - 1] === 'good') {
              const newHistory = [...ballsHistory];
              newHistory[newHistory.length - 1] = 'wicket';
              setBallsHistory(newHistory);
              setWicketPending(false);
            } else {
              setWicketPending(true);
            }
          }}
        >
          Confirm Change of Ends
        </Button>
      )
    });
  };

  const endOver = (currentHistory) => {
    const nextOverNum = overs + 1;
    
    let modalTitle = "End of Over";
    let modalContent = (
      <div className="space-y-4">
         <div className="bg-emerald-100 text-emerald-700 p-4 rounded-xl flex flex-col items-center gap-2">
            <RotateCcw size={48} />
            <p className="font-bold text-lg">ROTATE FIELDERS</p>
          </div>
          <p className="text-slate-600">
            Everyone moves one position.<br/>
            <strong>New Bowler</strong> from same end.
          </p>
      </div>
    );

    const isPairChange = nextOverNum % config.oversPerPair === 0 && nextOverNum < currentTotalOvers;
    
    if (isPairChange) {
      modalTitle = "Change Batting Pair";
      modalContent = (
        <div className="space-y-4">
           <div className="bg-blue-100 text-blue-700 p-4 rounded-xl flex flex-col items-center gap-2">
              <Users size={48} />
              <p className="font-bold text-lg">NEW BATTING PAIR</p>
            </div>
            <p className="text-slate-600">
              Pair {currentPair} is finished.<br/>
              <strong>Send in Pair {currentPair + 1}!</strong>
            </p>
        </div>
      );
    }

    if (nextOverNum >= currentTotalOvers) {
      if (innings === 1) {
        setFirstInningsStats({
            wickets: totalWickets,
            badBalls: totalBadBalls,
            overs: nextOverNum,
            balls: 0,
            duration: elapsedTime
        });
        setHalfTimeStartTime(Date.now());
        setGameState('halfTime');

        notify('HALF TIME!', {
          body: `1st Innings complete - ${totalWickets} wickets`,
          tag: 'game-phase',
          vibrate: [200, 100, 200, 100, 200, 100, 200]
        });
      } else {
        setModalConfig({
          isOpen: true,
          type: 'endGame',
          title: 'Match Complete!',
          content: (
            <div className="space-y-4">
               <div className="bg-yellow-100 text-yellow-700 p-4 rounded-xl flex flex-col items-center gap-2">
                  <Trophy size={48} />
                  <p className="font-bold text-lg">GREAT GAME!</p>
                </div>
                <p className="text-slate-600">
                  Both innings complete.<br/>
                  Shake hands and pack up gear.
                </p>
            </div>
          ),
          action: (
            <Button
              variant="primary"
              size="xl"
              onClick={() => {
                setModalConfig({ ...modalConfig, isOpen: false });
                setGameState('complete');

                notify('MATCH COMPLETE!', {
                  body: 'Great game! Time to pack up.',
                  tag: 'game-phase',
                  vibrate: [500, 200, 500]
                });
              }}
            >
              Finish Match
            </Button>
          )
        });
      }
    } else {
      setModalConfig({
        isOpen: true,
        type: 'endOver',
        title: modalTitle,
        content: modalContent,
        action: (
          <Button
            variant="primary"
            size="xl"
            onClick={() => {
              setOvers(nextOverNum);
              setBallsHistory([]);
              setWicketPending(false);
              if (isPairChange) {
                setCurrentPair(prev => prev + 1);
                notify('NEW BATTING PAIR!', {
                  body: `Over ${nextOverNum}/${currentTotalOvers} • Pair ${currentPair + 1} coming in`,
                  tag: 'game-event',
                  vibrate: [200, 100, 200, 100, 200]
                });
              } else {
                notify('Over Complete', {
                  body: `Over ${nextOverNum}/${currentTotalOvers} • Rotate fielders`,
                  tag: 'game-event',
                  vibrate: [150, 75, 150]
                });
              }
              setModalConfig({ ...modalConfig, isOpen: false });
            }}
          >
            Start Next Over
          </Button>
        )
      });
    }
  };

  const getBallColor = (type) => {
    switch (type) {
      case 'good': return 'bg-emerald-500 border-emerald-600';
      case 'bad': return 'bg-amber-400 border-amber-500';
      case 'wicket': return 'bg-rose-500 border-rose-600';
      default: return 'bg-slate-100 border-slate-200';
    }
  };

  // --- Render Views ---

  // Show reconnecting screen
  if (isReconnecting) {
    return <ReconnectingScreen />;
  }

  // Show "Open in App" prompt when QR code opened in browser
  if (showOpenInAppPrompt && pendingWatchId) {
    return (
      <OpenInAppPromptScreen
        pendingWatchId={pendingWatchId}
        copiedGameId={copiedGameId}
        onCopyGameId={handleCopyPendingWatchId}
        onWatchInBrowser={handleWatchInBrowser}
        onCancel={handleCancelOpenInAppPrompt}
        isInstalled={isInstalled}
        isIOS={isIOS}
      />
    );
  }

  if (gameState === 'welcome') {
    return (
      <WelcomeScreen
        onSetup={goToSetup}
        isSyncConfigured={isSyncConfigured}
        canInstall={canInstall}
        isInstalled={isInstalled}
        isIOS={isIOS}
        showIOSInstall={showIOSInstall}
        onToggleIOSInstall={() => setShowIOSInstall((prev) => !prev)}
        promptInstall={promptInstall}
        showWatchModal={showWatchModal}
        onCloseWatchModal={() => {
          setShowWatchModal(false);
          setWatchError('');
          setWatchGameIdInput('');
        }}
        watchGameIdInput={watchGameIdInput}
        onWatchGameIdChange={(value) => {
          setWatchGameIdInput(value);
          setWatchError('');
        }}
        watchError={watchError}
        isJoining={isJoining}
        onJoinGame={handleJoinGame}
        onOpenWatchModal={() => setShowWatchModal(true)}
      />
    );
  }

  if (gameState === 'setup') {
    return (
      <SetupScreen
        permission={permission}
        requestPermission={requestPermission}
        config={config}
        updateConfig={updateConfig}
        onStartGame={startGame}
      />
    );
  }

  if (gameState === 'halfTime') {
    return (
      <HalfTimeScreen
        firstInningsStats={firstInningsStats}
        totalWickets={totalWickets}
        totalBadBalls={totalBadBalls}
        formatGameTime={formatGameTime}
        formatOvers={formatOvers}
        onStartSecondInnings={startSecondInnings}
        onUndo={handleUndo}
        historyLength={history.length}
      />
    );
  }

  if (gameState === 'complete') {
    return (
      <CompleteScreen
        firstInningsStats={firstInningsStats}
        elapsedTime={elapsedTime}
        overs={overs}
        ballsHistoryLength={ballsHistory.length}
        totalWickets={totalWickets}
        totalBadBalls={totalBadBalls}
        formatGameTime={formatGameTime}
        formatOvers={formatOvers}
        onUndo={handleUndo}
        historyLength={history.length}
        onBackToHome={() => setGameState('welcome')}
      />
    );
  }

  // Active Game View
  return (
    <ActiveGameScreen
      isPaused={isPaused}
      elapsedTime={elapsedTime}
      formatGameTime={formatGameTime}
      innings={innings}
      viewerCount={viewerCount}
      isViewer={isViewer}
      permission={permission}
      requestPermission={requestPermission}
      historyLength={history.length}
      showMenu={showMenu}
      onToggleMenu={() => setShowMenu((prev) => !prev)}
      onPauseGame={pauseGame}
      onResumeGame={resumeGame}
      onRequestEndInningsEarly={requestEndInningsEarly}
      onRequestEndGameEarly={requestEndGameEarly}
      onRequestResetGame={requestResetGame}
      onUndo={handleUndo}
      onCloseMenu={() => setShowMenu(false)}
      gameId={gameId}
      onOpenShareModal={() => setShowShareModal(true)}
      showShareModal={showShareModal}
      onCloseShareModal={() => setShowShareModal(false)}
      shareUrl={getShareUrl()}
      copiedGameId={copiedGameId}
      onCopyGameId={copyGameId}
      isConnected={isConnected}
      modalConfig={modalConfig}
      onCloseModal={() => setModalConfig({ ...modalConfig, isOpen: false })}
      ballsHistory={ballsHistory}
      wicketPending={wicketPending}
      overs={overs}
      currentPair={currentPair}
      currentTotalOvers={currentTotalOvers}
      currentTotalPairs={currentTotalPairs}
      totalWickets={totalWickets}
      getBallColor={getBallColor}
      onBadBall={handleBadBallTrigger}
      onWicket={handleWicketTrigger}
      onGoodBall={handleGoodBallClick}
      leaveGame={() => {
        leaveGame();
        setGameState('welcome');
      }}
    />
  );
}
