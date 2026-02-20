import React from 'react';
import { CheckCircle2, Download, Eye, Play, Plus, Share } from 'lucide-react';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { useGameStore } from '../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';

const WelcomeScreen = () => {
  const {
    isSyncConfigured,
    canInstall,
    isInstalled,
    isIOS,
    showIOSInstall,
    showWatchModal,
    watchGameIdInput,
    watchError,
    isJoining,
    actions,
    setShowIOSInstall
  } = useGameStore(useShallow((state) => ({
    isSyncConfigured: state.isSyncConfigured,
    canInstall: state.canInstall,
    isInstalled: state.isInstalled,
    isIOS: state.isIOS,
    showIOSInstall: state.showIOSInstall,
    showWatchModal: state.showWatchModal,
    watchGameIdInput: state.watchGameIdInput,
    watchError: state.watchError,
    isJoining: state.isJoining,
    actions: state.actions,
    setShowIOSInstall: state.setShowIOSInstall
  })));

  return (
    <div className="screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
    <div className="max-w-md w-full space-y-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
          <Play size={40} fill="currentColor" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Friday Cricket</h1>
        <p className="text-slate-500 mb-8">Official tracker for Cambridge Junior Cricket.</p>

        <Button size="xl" onClick={actions.onSetup} className="w-full shadow-emerald-300 shadow-lg">
          Set Up Match
        </Button>

        {isSyncConfigured && (
          <button
            onClick={actions.onOpenWatchModal}
            className="w-full mt-4 p-4 rounded-2xl font-bold flex items-center justify-center gap-3 bg-blue-50 text-blue-600 border-2 border-blue-200 active:scale-95 transition-all"
          >
            <Eye size={24} />
            Watch a Game
          </button>
        )}
      </div>

      {canInstall && !isInstalled && (
        <button
          onClick={actions.promptInstall}
          className="w-full bg-blue-500 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-200 active:scale-95 transition-all"
        >
          <Download size={24} />
          Install App for Offline Use
        </button>
      )}

      {isIOS && !isInstalled && !canInstall && (
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
          <button
            onClick={() => setShowIOSInstall(!showIOSInstall)}
            className="w-full flex items-center justify-center gap-2 text-blue-600 font-bold"
          >
            <Download size={20} />
            Install App for Offline Use
          </button>

          {showIOSInstall && (
            <div className="mt-4 pt-4 border-t border-slate-100 text-left text-sm text-slate-600 space-y-3">
              <p className="font-medium text-slate-800">To install on iOS:</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                  <Share size={18} />
                </div>
                <p>Tap the <strong>Share</strong> button in Safari</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                  <Plus size={18} />
                </div>
                <p>Tap <strong>"Add to Home Screen"</strong></p>
              </div>
            </div>
          )}
        </div>
      )}

      {isInstalled && (
        <div className="text-emerald-600 font-medium flex items-center justify-center gap-2">
          <CheckCircle2 size={18} />
          App installed - works offline!
        </div>
      )}
    </div>

    <Modal
      isOpen={showWatchModal}
      title="Watch a Game"
      onClose={actions.onCloseWatchModal}
    >
      <div className="space-y-4">
        <div className="bg-blue-50 text-blue-700 p-4 rounded-xl flex flex-col items-center gap-2">
          <Eye size={48} />
          <p className="font-bold text-lg">Enter Game ID</p>
        </div>

        <div>
          <input
            type="text"
            value={watchGameIdInput}
            onChange={(event) => actions.onWatchGameIdChange(event.target.value.toUpperCase())}
            placeholder="e.g. ABC123"
            maxLength={6}
            className="w-full text-center text-2xl font-black tracking-widest p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none uppercase"
            autoComplete="off"
            autoCapitalize="characters"
          />
          {watchError && (
            <p className="text-rose-500 text-sm mt-2 text-center">{watchError}</p>
          )}
        </div>

        <Button
          size="xl"
          onClick={actions.onJoinGame}
          disabled={isJoining || !watchGameIdInput.trim()}
          className="w-full"
        >
          {isJoining ? 'Joining...' : 'Join Game'}
        </Button>

        <p className="text-slate-400 text-xs text-center">
          Get the Game ID from the person running the match
        </p>
      </div>
    </Modal>
  </div>
  );
};

export { WelcomeScreen };
