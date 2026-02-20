import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertCircle,
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Menu,
  Pause,
  Play,
  Power,
  RotateCcw,
  Share,
  SkipForward,
  Timer,
  Undo2,
  X,
  XCircle
} from 'lucide-react';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { StatCard } from '../StatCard';
import { formatGameTime, useGameStore } from '../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';

const ActiveGameScreen = () => {
  const {
    config,
    isPaused,
    elapsedTime,
    innings,
    viewerCount,
    isViewer,
    permission,
    historyLength,
    showMenu,
    gameId,
    showShareModal,
    copiedGameId,
    isConnected,
    modalConfig,
    ballsHistory,
    wicketPending,
    overs,
    currentPair,
    totalWickets,
    actions
  } = useGameStore(useShallow((state) => ({
    config: state.config,
    isPaused: state.isPaused,
    elapsedTime: state.elapsedTime,
    innings: state.innings,
    viewerCount: state.viewerCount,
    isViewer: state.isViewer,
    permission: state.permission,
    historyLength: state.history.length,
    showMenu: state.showMenu,
    gameId: state.gameId,
    showShareModal: state.showShareModal,
    copiedGameId: state.copiedGameId,
    isConnected: state.isConnected,
    modalConfig: state.modalConfig,
    ballsHistory: state.ballsHistory,
    wicketPending: state.wicketPending,
    overs: state.overs,
    currentPair: state.currentPair,
    totalWickets: state.totalWickets,
    actions: state.actions
  })));

  const currentTotalOvers = innings === 1 ? config.team1TotalOvers : config.team2TotalOvers;
  const currentTotalPairs = innings === 1 ? config.team1Pairs : config.team2Pairs;
  const shareUrl = gameId ? `${window.location.origin}?watch=${gameId}` : "";

  const getBallColor = (type) => {
    switch (type) {
      case 'good': return 'bg-emerald-500 border-emerald-600';
      case 'bad': return 'bg-amber-400 border-amber-500';
      case 'wicket': return 'bg-rose-500 border-rose-600';
      default: return 'bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="game-container bg-slate-100 font-sans relative">
    <header className="bg-white px-4 py-3 flex justify-between items-center shadow-sm border-b border-slate-200 z-10">
      <div className={`flex items-center gap-2 font-bold text-sm tabular-nums ${isPaused ? 'text-amber-600' : 'text-slate-600'}`}>
        {isPaused ? <Pause size={16} /> : <Timer size={16} />}
        {formatGameTime(elapsedTime)}
      </div>

      <div className="text-sm uppercase font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">
        {innings === 1 ? '1st Innings' : '2nd Innings'}
      </div>

      <div className="flex items-center gap-1">
        {viewerCount > 0 && (
          <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs font-bold">
            <Eye size={14} />
            {viewerCount}
          </div>
        )}

        {gameId && !isViewer && (
          <button
            onClick={actions.onOpenShareModal}
            className="p-2 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
            title="Share game"
          >
            <Share size={18} />
          </button>
        )}

        {!isViewer && (
          <button
            onClick={() => {
                if (permission !== 'granted') {
                actions.requestPermission();
                }
            }}
            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
              permission === 'granted'
                ? 'text-emerald-500'
                : permission === 'denied'
                ? 'text-rose-400'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
            title={permission === 'granted' ? 'Notifications on' : 'Enable notifications'}
          >
            {permission === 'granted' ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
        )}

        {!isViewer && (
          <button
            onClick={actions.onUndo}
            disabled={historyLength === 0}
            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
              historyLength > 0
                ? 'text-slate-600 hover:bg-slate-100 active:bg-slate-200'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <Undo2 size={20} />
          </button>
        )}

        {!isViewer && (
          <button onClick={actions.onToggleMenu} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <Menu size={20} />
          </button>
        )}
      </div>
    </header>

    {showMenu && !isViewer && (
      <div className="absolute top-14 right-4 z-50 bg-white rounded-xl shadow-xl border border-slate-100 p-2 w-64 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
        {isPaused ? (
          <button onClick={actions.onResumeGame} className="w-full text-left px-4 py-3 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium flex items-center gap-2 mb-1">
            <Play size={16} /> Resume Game
          </button>
        ) : (
          <button onClick={actions.onPauseGame} className="w-full text-left px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium flex items-center gap-2 mb-1">
            <Pause size={16} /> Pause Game
          </button>
        )}

        {innings === 1 && (
          <button onClick={actions.onRequestEndInningsEarly} className="w-full text-left px-4 py-3 text-purple-600 hover:bg-purple-50 rounded-lg font-medium flex items-center gap-2 mb-1">
            <SkipForward size={16} /> End Innings Early
          </button>
        )}

        <button onClick={actions.onRequestEndGameEarly} className="w-full text-left px-4 py-3 text-amber-600 hover:bg-amber-50 rounded-lg font-medium flex items-center gap-2">
          <Power size={16} /> End Match Early
        </button>

        <button onClick={actions.onRequestResetGame} className="w-full text-left px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-lg font-medium flex items-center gap-2">
          <RotateCcw size={16} /> Reset Match
        </button>

        <div className="h-px bg-slate-100 my-1"></div>

        <button onClick={actions.onCloseMenu} className="w-full text-left px-4 py-3 text-slate-400 hover:bg-slate-50 rounded-lg font-medium">
          Close Menu
        </button>
      </div>
    )}

    <main className="game-main">
      <div className="flex gap-3">
        <StatCard
          label="Over"
          value={`${overs + 1}`}
          subLabel={`of ${currentTotalOvers}`}
          highlight
        />
        <StatCard
          label="Pair"
          value={currentPair}
          subLabel={`of ${currentTotalPairs}`}
        />
        <StatCard
          label="Wickets"
          value={totalWickets}
        />
      </div>

      <div className="ball-tracker bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-4">
        <div className="flex justify-center gap-2">
          {[...Array(6)].map((_, index) => {
            const type = ballsHistory[index];
            const isActive = index < ballsHistory.length;
            const colorClass = isActive ? getBallColor(type) : 'bg-slate-100 border-slate-200';

            return (
              <div
                key={index}
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${colorClass} ${isActive ? 'scale-110' : ''}`}
              >
                {isActive && type === 'good' && <CheckCircle2 size={16} className="text-white" />}
                {isActive && type === 'bad' && <span className="text-amber-900 font-bold text-xs">FH</span>}
                {isActive && type === 'wicket' && <X size={16} className="text-white" />}

                {index === ballsHistory.length && wicketPending && (
                  <div className="w-3 h-3 rounded-full bg-rose-200 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <div className="text-5xl font-black text-slate-800 tabular-nums">
            {ballsHistory.length}<span className="text-2xl text-slate-300">/6</span>
          </div>
          <div className="text-slate-400 font-medium uppercase tracking-wide text-xs">Balls Delivered</div>
          {wicketPending && (
            <div className="text-rose-500 font-bold text-xs mt-1 animate-pulse">
              Next ball = Wicket
            </div>
          )}
        </div>
      </div>

      {isViewer ? (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2 text-blue-600">
            <Eye size={32} />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">Watching Game</p>
            <p className="text-sm text-slate-500">Game ID: {gameId}</p>
          </div>
          <div className={`flex items-center gap-2 text-sm ${isConnected ? 'text-emerald-600' : 'text-amber-600'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
            {isConnected ? 'Live updates active' : 'Connecting...'}
          </div>

          <button
            onClick={() => {
                if (permission !== 'granted') {
                actions.requestPermission();
                }
            }}
            className={`mt-2 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors ${
              permission === 'granted'
                ? 'bg-emerald-100 text-emerald-700'
                : permission === 'denied'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-700 active:scale-95'
            }`}
          >
            {permission === 'granted' ? (
              <><Bell size={16} /> Notifications On</>
            ) : permission === 'denied' ? (
              <><BellOff size={16} /> Blocked</>
            ) : (
              <><Bell size={16} /> Enable Notifications</>
            )}
          </button>

          <button
            onClick={actions.leaveGame}
            className="mt-2 text-slate-400 hover:text-slate-600 text-sm underline"
          >
            Leave Game
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 grid-rows-[1fr_1.5fr] gap-2">
          <Button
            variant="warning"
            className="flex-col text-center border-b-4 border-amber-500 active:border-b-0 active:mt-1 py-3"
            onClick={actions.onBadBall}
          >
            <AlertCircle size={24} />
            <span className="text-sm">Bad Ball<br /><span className="text-xs font-normal opacity-90">Free Hit</span></span>
          </Button>

          <Button
            variant="danger"
            className="flex-col text-center border-b-4 border-rose-600 active:border-b-0 active:mt-1 py-3"
            onClick={actions.onWicket}
          >
            <XCircle size={24} />
            <span className="text-sm">Wicket<br /><span className="text-xs font-normal opacity-90">Change Ends</span></span>
          </Button>

          <Button
            variant="primary"
            className="col-span-2 text-xl flex-col border-b-4 border-emerald-700 active:border-b-0 active:mt-1 shadow-emerald-200 shadow-lg py-4"
            onClick={actions.onGoodBall}
          >
            <span className="text-2xl">Good Ball</span>
            <span className="text-xs font-normal opacity-90 bg-emerald-600 px-3 py-1 rounded-full mt-1">
              {wicketPending ? 'Confirm Wicket & Count' : 'Regular Delivery'}
            </span>
          </Button>
        </div>
      )}
    </main>

    <Modal
      isOpen={modalConfig.isOpen}
      title={modalConfig.title}
      onClose={actions.onCloseModal}
      actionButton={modalConfig.action}
    >
      {modalConfig.content}
    </Modal>

    <Modal
      isOpen={showShareModal}
      title="Share Game"
      onClose={actions.onCloseShareModal}
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <QRCodeSVG
              value={shareUrl}
              size={180}
              level="M"
              includeMargin={false}
            />
          </div>
        </div>

        <div className="text-center">
          <p className="text-slate-500 text-sm mb-2">Scan QR code or share Game ID:</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-black tracking-widest text-slate-800 bg-slate-100 px-4 py-2 rounded-xl">
              {gameId}
            </span>
            <button
              onClick={actions.onCopyGameId}
              className={`p-2 rounded-lg transition-colors ${
                copiedGameId
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              title="Copy game ID"
            >
              {copiedGameId ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        <div className="text-center text-slate-400 text-xs">
          {isConnected ? (
            <span className="flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Connected
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Connecting...
            </span>
          )}
        </div>
      </div>
    </Modal>
  </div>
  );
};

export { ActiveGameScreen };
