import React from 'react';
import { Check, Copy, Download, Eye, Share } from 'lucide-react';
import { Button } from '../Button';

const OpenInAppPromptScreen = ({
  pendingWatchId,
  copiedGameId,
  onCopyGameId,
  onWatchInBrowser,
  onCancel,
  isInstalled,
  isIOS
}) => (
  <div className="screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
    <div className="max-w-md w-full space-y-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
          <Eye size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">Watch Game</h1>
        <p className="text-slate-500 mb-6">You've been invited to watch a live cricket match!</p>

        <div className="bg-slate-100 rounded-2xl p-4 mb-6">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Game ID</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-black tracking-widest text-slate-800">
              {pendingWatchId}
            </span>
            <button
              onClick={onCopyGameId}
              className={`p-2 rounded-lg transition-colors ${
                copiedGameId
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-white text-slate-500 hover:bg-slate-200'
              }`}
            >
              {copiedGameId ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        {isIOS && (
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 text-left text-sm">
            <p className="font-bold mb-2">Have the app installed?</p>
            <p>Open <strong>Friday Cricket</strong> from your home screen. The game ID will be ready to join!</p>
          </div>
        )}

        <Button
          size="xl"
          onClick={onWatchInBrowser}
          className="w-full mb-3"
        >
          <Eye size={20} /> Watch in Browser
        </Button>

        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 text-sm"
        >
          Cancel
        </button>
      </div>

      {!isInstalled && isIOS && (
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 text-left text-sm text-slate-600">
          <p className="font-bold text-slate-800 mb-2">Don't have the app?</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
              <Share size={18} />
            </div>
            <p>Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong></p>
          </div>
          <p className="text-slate-400 text-xs">The app works offline and gives the best experience!</p>
        </div>
      )}
    </div>
  </div>
);

export { OpenInAppPromptScreen };
