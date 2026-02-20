import React, { useCallback, useEffect, useRef } from 'react';
import { AlertCircle, Power, RotateCcw, SkipForward, Trophy, Users, XCircle } from 'lucide-react';
import { Button } from './components/Button';
import { ActiveGameScreen } from './components/screens/ActiveGameScreen';
import { CompleteScreen } from './components/screens/CompleteScreen';
import { HalfTimeScreen } from './components/screens/HalfTimeScreen';
import { OpenInAppPromptScreen } from './components/screens/OpenInAppPromptScreen';
import { ReconnectingScreen } from './components/screens/ReconnectingScreen';
import { SetupScreen } from './components/screens/SetupScreen';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { useGameSync } from './hooks/useGameSync';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { useNotifications } from './hooks/useNotifications';
import { useGameStore } from './store/useGameStore';
import { useShallow } from 'zustand/react/shallow';

export default function FridayCricketTracker() {
  const { permission, requestPermission, notify, pendingAction, consumeAction } = useNotifications();
  const { canInstall, isInstalled, isIOS, promptInstall } = useInstallPrompt();
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
    subscribeToGame,
    leaveGame,
    clearError: clearSyncError
  } = useGameSync();

  const {
    config,
    gameState,
    innings,
    firstInningsStats,
    ballsHistory,
    overs,
    totalWickets,
    totalBadBalls,
    currentPair,
    wicketPending,
    history,
    gameStartTime,
    pausedDuration,
    isPaused,
    pauseStartTime,
    halfTimeStartTime,
    elapsedTime,
    watchGameIdInput,
    pendingWatchId,
    showOpenInAppPrompt,
    isReconnecting,
    applyGameState,
    setGameState,
    setInnings,
    setFirstInningsStats,
    setBallsHistory,
    setOvers,
    setTotalWickets,
    setTotalBadBalls,
    setCurrentPair,
    setWicketPending,
    setShowMenu,
    setModalConfig,
    setGameStartTime,
    setPausedDuration,
    setIsPaused,
    setPauseStartTime,
    setHalfTimeStartTime,
    setElapsedTime,
    setShowShareModal,
    setCopiedGameId,
    setShowWatchModal,
    setWatchGameIdInput,
    setWatchError,
    setIsJoining,
    setPendingWatchId,
    setShowOpenInAppPrompt,
    setIsReconnecting,
    setSyncInfo,
    setPwaInfo,
    setPermission,
    saveHistory,
    resetForMatchStart,
    goToWelcome,
    setActions
  } = useGameStore(useShallow((state) => ({
    config: state.config,
    gameState: state.gameState,
    innings: state.innings,
    firstInningsStats: state.firstInningsStats,
    ballsHistory: state.ballsHistory,
    overs: state.overs,
    totalWickets: state.totalWickets,
    totalBadBalls: state.totalBadBalls,
    currentPair: state.currentPair,
    wicketPending: state.wicketPending,
    history: state.history,
    gameStartTime: state.gameStartTime,
    pausedDuration: state.pausedDuration,
    isPaused: state.isPaused,
    pauseStartTime: state.pauseStartTime,
    halfTimeStartTime: state.halfTimeStartTime,
    elapsedTime: state.elapsedTime,
    watchGameIdInput: state.watchGameIdInput,
    pendingWatchId: state.pendingWatchId,
    showOpenInAppPrompt: state.showOpenInAppPrompt,
    isReconnecting: state.isReconnecting,
    applyGameState: state.applyGameState,
    setGameState: state.setGameState,
    setInnings: state.setInnings,
    setFirstInningsStats: state.setFirstInningsStats,
    setBallsHistory: state.setBallsHistory,
    setOvers: state.setOvers,
    setTotalWickets: state.setTotalWickets,
    setTotalBadBalls: state.setTotalBadBalls,
    setCurrentPair: state.setCurrentPair,
    setWicketPending: state.setWicketPending,
    setShowMenu: state.setShowMenu,
    setModalConfig: state.setModalConfig,
    setGameStartTime: state.setGameStartTime,
    setPausedDuration: state.setPausedDuration,
    setIsPaused: state.setIsPaused,
    setPauseStartTime: state.setPauseStartTime,
    setHalfTimeStartTime: state.setHalfTimeStartTime,
    setElapsedTime: state.setElapsedTime,
    setShowShareModal: state.setShowShareModal,
    setCopiedGameId: state.setCopiedGameId,
    setShowWatchModal: state.setShowWatchModal,
    setWatchGameIdInput: state.setWatchGameIdInput,
    setWatchError: state.setWatchError,
    setIsJoining: state.setIsJoining,
    setPendingWatchId: state.setPendingWatchId,
    setShowOpenInAppPrompt: state.setShowOpenInAppPrompt,
    setIsReconnecting: state.setIsReconnecting,
    setSyncInfo: state.setSyncInfo,
    setPwaInfo: state.setPwaInfo,
    setPermission: state.setPermission,
    saveHistory: state.saveHistory,
    resetForMatchStart: state.resetForMatchStart,
    goToWelcome: state.goToWelcome,
    setActions: state.setActions
  })));

  const BALLS_PER_OVER = 6;
  const currentTotalOvers = innings === 1 ? config.team1TotalOvers : config.team2TotalOvers;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
  const closeModal = useCallback(() => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  }, [setModalConfig]);
  const closeMenu = useCallback(() => {
    setShowMenu(false);
  }, [setShowMenu]);

  useEffect(() => {
    setPermission(permission);
  }, [permission, setPermission]);

  useEffect(() => {
    setPwaInfo({ canInstall, isInstalled, isIOS });
  }, [canInstall, isInstalled, isIOS, setPwaInfo]);

  useEffect(() => {
    setSyncInfo({ gameId, isViewer, isConnected, viewerCount, syncError, isSyncConfigured });
  }, [gameId, isViewer, isConnected, viewerCount, syncError, isSyncConfigured, setSyncInfo]);

  useEffect(() => {
    if (gameState !== 'active' || !gameStartTime || isPaused) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - gameStartTime - pausedDuration;
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, gameStartTime, isPaused, pausedDuration, setElapsedTime]);

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
  }, [
    gameId,
    isViewer,
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
    isPaused,
    syncState
  ]);

  useEffect(() => {
    if (gameId && gameState !== 'welcome') {
      localStorage.setItem('active_game_session', JSON.stringify({ gameId, isViewer, timestamp: Date.now() }));
    }
  }, [gameId, isViewer, gameState]);

  useEffect(() => {
    if (gameState === 'welcome' && !showOpenInAppPrompt) {
      localStorage.removeItem('active_game_session');
    }
  }, [gameState, showOpenInAppPrompt]);

  useEffect(() => {
    if (!isSyncConfigured) return;

    const savedSession = localStorage.getItem('active_game_session');
    if (!savedSession) return;

    try {
      const session = JSON.parse(savedSession);
      const maxAge = 4 * 60 * 60 * 1000;
      if (Date.now() - session.timestamp > maxAge) {
        localStorage.removeItem('active_game_session');
        return;
      }

      setIsReconnecting(true);

      const applyState = (state) => {
        applyGameState(state);
        if (state?.gameState === 'active') {
          setGameStartTime(Date.now() - (state.elapsedTime || 0));
          setPausedDuration(0);
        }
      };

      if (session.isViewer) {
        (async () => {
          try {
            const initialState = await joinGame(session.gameId);
            if (initialState) {
              applyState(initialState);
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
        (async () => {
          try {
            const state = await reconnectAsUmpire(session.gameId);
            if (state) {
              applyState(state);
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
  }, [
    isSyncConfigured,
    joinGame,
    reconnectAsUmpire,
    applyGameState,
    setGameStartTime,
    setPausedDuration,
    setIsReconnecting
  ]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const watchId = params.get('watch');
    if (!watchId) return;

    const upperWatchId = watchId.toUpperCase();
    setWatchGameIdInput(upperWatchId);

    if (!isStandalone) {
      localStorage.setItem('pending_watch_game', upperWatchId);
      setPendingWatchId(upperWatchId);
      setShowOpenInAppPrompt(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

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
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [
    isSyncConfigured,
    joinGame,
    isStandalone,
    applyGameState,
    setWatchGameIdInput,
    setPendingWatchId,
    setShowOpenInAppPrompt,
    setIsJoining
  ]);

  useEffect(() => {
    if (!isStandalone || !isSyncConfigured) return;
    const pendingGame = localStorage.getItem('pending_watch_game');
    if (pendingGame && gameState === 'welcome' && !isViewer) {
      localStorage.removeItem('pending_watch_game');
      setWatchGameIdInput(pendingGame);
      setShowWatchModal(true);
    }
  }, [isStandalone, isSyncConfigured, gameState, isViewer, setWatchGameIdInput, setShowWatchModal]);

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

  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  }, [notify]);

  useEffect(() => {
    if (!isViewer || !gameId) return;

    const unsubscribe = subscribeToGame((newState) => {
      const prev = prevStateRef.current;
      const notifyFn = notifyRef.current;
      const newOvers = newState.overs ?? prev.overs;
      const newWickets = newState.totalWickets ?? prev.totalWickets;
      const newBadBalls = newState.totalBadBalls ?? prev.totalBadBalls;
      const newPair = newState.currentPair ?? prev.currentPair;
      const newGameState = newState.gameState ?? prev.gameState;
      const newInnings = newState.innings ?? prev.innings;
      const newBallsLength = newState.ballsHistory?.length ?? prev.ballsLength;
      const totalOvers = newState.config?.team1TotalOvers || 16;

      if (prev.initialized) {
        if (newBallsLength > prev.ballsLength && newBallsLength < 6) {
          const lastBallType = newState.ballsHistory?.[newBallsLength - 1];
          let ballMessage = 'Good delivery';
          if (lastBallType === 'wicket') ballMessage = 'Wicket confirmed';
          else if (lastBallType === 'bad') ballMessage = 'Free hit taken';
          notifyFn(`Ball ${newBallsLength}/6`, {
            body: `Over ${newOvers + 1}/${totalOvers} • ${ballMessage}`,
            tag: 'ball',
            silent: true
          });
        }

        if (newWickets > prev.totalWickets) {
          notifyFn('WICKET!', {
            body: `Wicket #${newWickets} - Change ends`,
            tag: 'game-event',
            vibrate: [300, 100, 300, 100, 300]
          });
        }

        if (newBadBalls > prev.totalBadBalls) {
          notifyFn('Bad Ball - FREE HIT!', {
            body: `Over ${newOvers + 1}/${totalOvers}`,
            tag: 'ball',
            vibrate: [200, 100, 200]
          });
        }

        if (newPair > prev.currentPair) {
          notifyFn('NEW BATTING PAIR!', {
            body: `Pair ${newPair} coming in`,
            tag: 'game-event',
            vibrate: [200, 100, 200, 100, 200]
          });
        }

        if (newOvers > prev.overs && newBallsLength === 0) {
          notifyFn('Over Complete', {
            body: `Over ${newOvers}/${totalOvers} • Rotate fielders`,
            tag: 'game-event',
            vibrate: [150, 75, 150]
          });
        }

        if (newGameState === 'halfTime' && prev.gameState !== 'halfTime') {
          notifyFn('HALF TIME!', {
            body: '1st Innings complete',
            tag: 'game-phase',
            vibrate: [200, 100, 200, 100, 200, 100, 200]
          });
        }

        if (newInnings === 2 && prev.innings === 1 && newGameState === 'active') {
          notifyFn('2nd Innings Started!', {
            body: 'Game is back on',
            tag: 'game-phase'
          });
        }

        if (newGameState === 'complete' && prev.gameState !== 'complete') {
          notifyFn('MATCH COMPLETE!', {
            body: 'Great game!',
            tag: 'game-phase',
            vibrate: [500, 200, 500]
          });
        }
      }

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

      applyGameState(newState);
    });

    return unsubscribe;
  }, [isViewer, gameId, subscribeToGame, applyGameState]);

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
    if (previousState.config) {
      useGameStore.setState({ config: previousState.config });
    }
    useGameStore.setState((state) => ({
      history: state.history.slice(0, -1),
      modalConfig: { isOpen: false, type: null }
    }));
  };

  const checkEndOfOver = (newHistory) => {
    if (newHistory.length >= BALLS_PER_OVER) {
      endOver(newHistory);
    }
  };

  const goToSetup = () => {
    setGameState('setup');
  };

  const startGame = async () => {
    resetForMatchStart();

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

    if (halfTimeStartTime) {
      const halfTimeDuration = Date.now() - halfTimeStartTime;
      useGameStore.setState((state) => ({ pausedDuration: state.pausedDuration + halfTimeDuration }));
      setHalfTimeStartTime(null);
    }

    useGameStore.setState({
      gameState: 'active',
      innings: 2,
      ballsHistory: [],
      overs: 0,
      totalWickets: 0,
      totalBadBalls: 0,
      currentPair: 1,
      wicketPending: false
    });

    notify('2nd Innings Started!', {
      body: `${config.team2TotalOvers} overs to play`,
      tag: 'game-phase'
    });
  };

  const requestResetGame = () => {
    closeMenu();
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
          <p className="text-slate-600">Are you sure you want to erase all progress and return to the home screen?</p>
        </div>
      ),
      action: (
        <Button variant="danger" size="xl" onClick={goToWelcome}>
          Yes, Reset Match
        </Button>
      )
    });
  };

  const requestEndInningsEarly = () => {
    closeMenu();
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
          <p className="text-slate-600">Finish Team 1's innings now and go to the Half Time Report?</p>
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
              overs,
              balls: ballsHistory.length,
              duration: elapsedTime
            });
            setHalfTimeStartTime(Date.now());
            setGameState('halfTime');
            closeModal();
          }}
        >
          Yes, End Innings
        </Button>
      )
    });
  };

  const requestEndGameEarly = () => {
    closeMenu();
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
          <p className="text-slate-600">This will end the game immediately and show the final stats.</p>
        </div>
      ),
      action: (
        <Button
          variant="warning"
          size="xl"
          onClick={() => {
            saveHistory();
            setGameState('complete');
            closeModal();
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
            1. Place ball on the <strong>Hitting Tee</strong>.<br />
            2. Batter gets a free hit.<br />
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
            closeModal();
            setTotalBadBalls(totalBadBalls + 1);
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
          <p className="text-slate-600 font-medium">Batter does NOT leave the pitch.</p>
          <p className="text-lg font-bold text-slate-800">Change Ends Now</p>
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
            closeModal();

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

    let modalTitle = 'End of Over';
    let modalContent = (
      <div className="space-y-4">
        <div className="bg-emerald-100 text-emerald-700 p-4 rounded-xl flex flex-col items-center gap-2">
          <RotateCcw size={48} />
          <p className="font-bold text-lg">ROTATE FIELDERS</p>
        </div>
        <p className="text-slate-600">
          Everyone moves one position.<br />
          <strong>New Bowler</strong> from same end.
        </p>
      </div>
    );

    const isPairChange = nextOverNum % config.oversPerPair === 0 && nextOverNum < currentTotalOvers;

    if (isPairChange) {
      modalTitle = 'Change Batting Pair';
      modalContent = (
        <div className="space-y-4">
          <div className="bg-blue-100 text-blue-700 p-4 rounded-xl flex flex-col items-center gap-2">
            <Users size={48} />
            <p className="font-bold text-lg">NEW BATTING PAIR</p>
          </div>
          <p className="text-slate-600">
            Pair {currentPair} is finished.<br />
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
                Both innings complete.<br />
                Shake hands and pack up gear.
              </p>
            </div>
          ),
          action: (
            <Button
              variant="primary"
              size="xl"
              onClick={() => {
                closeModal();
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
                setCurrentPair(currentPair + 1);
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
              closeModal();
            }}
          >
            Start Next Over
          </Button>
        )
      });
    }
  };

  const pauseGame = () => {
    setIsPaused(true);
    setPauseStartTime(Date.now());
    closeMenu();
  };

  const resumeGame = () => {
    if (pauseStartTime) {
      const pauseDelta = Date.now() - pauseStartTime;
      useGameStore.setState((state) => ({ pausedDuration: state.pausedDuration + pauseDelta }));
    }
    setIsPaused(false);
    setPauseStartTime(null);
    closeMenu();
  };

  const handleJoinGame = useCallback(async (id = watchGameIdInput) => {
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
  }, [watchGameIdInput, clearSyncError, joinGame, applyGameState, setShowWatchModal, setWatchGameIdInput, setWatchError, setIsJoining]);

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
    handleJoinGame(pendingWatchId || '');
  };

  const handleCancelOpenInAppPrompt = () => {
    setShowOpenInAppPrompt(false);
    setPendingWatchId(null);
    localStorage.removeItem('pending_watch_game');
  };

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

  useEffect(() => {
    if (pendingAction?.type === 'undo') {
      handleUndo();
      consumeAction();
    }
  }, [pendingAction, consumeAction]);

  useEffect(() => {
    setActions({
      requestPermission,
      promptInstall,
      onSetup: goToSetup,
      onStartGame: startGame,
      onStartSecondInnings: startSecondInnings,
      onUndo: handleUndo,
      onToggleMenu: () => useGameStore.setState((state) => ({ showMenu: !state.showMenu })),
      onPauseGame: pauseGame,
      onResumeGame: resumeGame,
      onRequestEndInningsEarly: requestEndInningsEarly,
      onRequestEndGameEarly: requestEndGameEarly,
      onRequestResetGame: requestResetGame,
      onCloseMenu: closeMenu,
      onOpenShareModal: () => setShowShareModal(true),
      onCloseShareModal: () => setShowShareModal(false),
      onCloseModal: closeModal,
      onBadBall: handleBadBallTrigger,
      onWicket: handleWicketTrigger,
      onGoodBall: handleGoodBallClick,
      onOpenWatchModal: () => setShowWatchModal(true),
      onCloseWatchModal: () => {
        setShowWatchModal(false);
        setWatchError('');
        setWatchGameIdInput('');
      },
      onJoinGame: handleJoinGame,
      onWatchGameIdChange: (value) => {
        setWatchGameIdInput(value);
        setWatchError('');
      },
      onCopyGameId: copyGameId,
      onCopyPendingWatchId: handleCopyPendingWatchId,
      onWatchInBrowser: handleWatchInBrowser,
      onCancelOpenInAppPrompt: handleCancelOpenInAppPrompt,
      leaveGame: () => {
        leaveGame();
        setGameState('welcome');
      },
      onBackToHome: () => setGameState('welcome')
    });
  }, [
    setActions,
    startGame,
    startSecondInnings,
    handleJoinGame,
    gameId,
    pendingWatchId,
    leaveGame,
    setGameState,
    closeModal,
    closeMenu,
    setShowShareModal,
    setShowWatchModal,
    setWatchError,
    setWatchGameIdInput,
    setShowOpenInAppPrompt,
    setPendingWatchId
  ]);

  if (isReconnecting) {
    return <ReconnectingScreen />;
  }

  if (showOpenInAppPrompt && pendingWatchId) {
    return <OpenInAppPromptScreen />;
  }

  if (gameState === 'welcome') {
    return <WelcomeScreen />;
  }

  if (gameState === 'setup') {
    return <SetupScreen />;
  }

  if (gameState === 'halfTime') {
    return <HalfTimeScreen />;
  }

  if (gameState === 'complete') {
    return <CompleteScreen />;
  }

  return <ActiveGameScreen />;
}
