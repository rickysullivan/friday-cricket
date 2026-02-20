import React from 'react';
import { Bell, BellOff, Minus, Plus } from 'lucide-react';
import { Button } from '../Button';
import { useGameStore } from '../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';

const SetupScreen = () => {
  const { permission, config, updateConfig, actions } = useGameStore(useShallow((state) => ({
    permission: state.permission,
    config: state.config,
    updateConfig: state.updateConfig,
    actions: state.actions
  })));

  return (
    <div className="screen bg-slate-100 flex flex-col items-center p-4 font-sans">
    <div className="w-full bg-white p-4 rounded-3xl shadow-xl border border-slate-100">
      <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">Match Setup</h2>

      {permission !== 'granted' && (
        <button
            onClick={async () => {
              console.log('Requesting notification permission...');
              const result = await actions.requestPermission();
              console.log('Permission result:', result);
            }}
          className={`w-full mb-6 p-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all ${
            permission === 'denied'
              ? 'bg-rose-100 text-rose-700 border border-rose-200'
              : 'bg-amber-100 text-amber-800 border border-amber-200 active:scale-95'
          }`}
        >
          {permission === 'denied' ? (
            <>
              <BellOff size={24} />
              <span>Notifications Blocked - Enable in Settings</span>
            </>
          ) : (
            <>
              <Bell size={24} />
              <span>Tap to Enable Notifications</span>
            </>
          )}
        </button>
      )}

      {permission === 'granted' && (
        <div className="w-full mb-6 p-4 rounded-xl flex items-center justify-center gap-3 font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
          <Bell size={24} />
          <span>Notifications Enabled</span>
        </div>
      )}

      <div className="mb-4">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Team 1 Players</label>
        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2 border border-slate-200">
          <Button size="icon" variant="neutral" onClick={() => updateConfig('team1Players', Math.max(4, config.team1Players - 1))}>
            <Minus size={18} />
          </Button>
          <div className="text-center">
            <div className="text-2xl font-black text-slate-800">{config.team1Players}</div>
            <div className="text-xs text-slate-500">{config.team1Pairs} pairs</div>
          </div>
          <Button size="icon" variant="neutral" onClick={() => updateConfig('team1Players', Math.min(16, config.team1Players + 1))}>
            <Plus size={18} />
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Team 2 Players</label>
        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2 border border-slate-200">
          <Button size="icon" variant="neutral" onClick={() => updateConfig('team2Players', Math.max(4, config.team2Players - 1))}>
            <Minus size={18} />
          </Button>
          <div className="text-center">
            <div className="text-2xl font-black text-slate-800">{config.team2Players}</div>
            <div className="text-xs text-slate-500">{config.team2Pairs} pairs</div>
          </div>
          <Button size="icon" variant="neutral" onClick={() => updateConfig('team2Players', Math.min(16, config.team2Players + 1))}>
            <Plus size={18} />
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Overs Per Pair</label>
        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2 border border-slate-200">
          <Button size="icon" variant="neutral" onClick={() => updateConfig('oversPerPair', Math.max(2, config.oversPerPair - 1))}>
            <Minus size={18} />
          </Button>
          <div className="text-center">
            <div className="text-2xl font-black text-slate-800">{config.oversPerPair}</div>
            <div className="text-xs text-slate-500">overs each</div>
          </div>
          <Button size="icon" variant="neutral" onClick={() => updateConfig('oversPerPair', Math.min(6, config.oversPerPair + 1))}>
            <Plus size={18} />
          </Button>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-8 text-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-emerald-800">1st Innings (Team 1)</span>
          <span className="font-bold text-emerald-700">{config.team1TotalOvers} Overs</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-emerald-800">2nd Innings (Team 2)</span>
          <span className="font-bold text-emerald-700">{config.team2TotalOvers} Overs</span>
        </div>
      </div>

      <Button size="xl" onClick={actions.onStartGame} className="w-full">
        Start Match
      </Button>
    </div>
  </div>
  );
};

export { SetupScreen };
