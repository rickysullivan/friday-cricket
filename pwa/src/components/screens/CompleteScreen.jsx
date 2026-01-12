import React from 'react';
import { Timer, Trophy, Undo2 } from 'lucide-react';
import { Button } from '../Button';

const CompleteScreen = ({
  firstInningsStats,
  elapsedTime,
  overs,
  ballsHistoryLength,
  totalWickets,
  totalBadBalls,
  formatGameTime,
  formatOvers,
  onUndo,
  historyLength,
  onBackToHome
}) => {
  const totalDuration = (firstInningsStats?.duration || 0) + elapsedTime;

  return (
    <div className="screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl">
        <Trophy size={64} className="mx-auto text-yellow-500 mb-6" />
        <h2 className="text-3xl font-black text-slate-800 mb-2">Match Finished!</h2>

        <div className="flex items-center justify-center gap-2 mb-6 text-slate-600">
          <Timer size={20} />
          <span className="text-2xl font-bold tabular-nums">{formatGameTime(totalDuration)}</span>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-3 border-b border-slate-200 pb-2 flex justify-between items-center">
              <span>1st Innings ({formatOvers(firstInningsStats?.overs, firstInningsStats?.balls)} overs)</span>
              <span className="text-slate-500 tabular-nums">{formatGameTime(firstInningsStats?.duration || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="text-center flex-1 border-r border-slate-200">
                <span className="block text-2xl font-black text-slate-800">{firstInningsStats?.wickets || 0}</span>
                <span className="text-slate-500 text-[10px] font-bold uppercase">Wickets</span>
              </div>
              <div className="text-center flex-1">
                <span className="block text-2xl font-black text-amber-600">{firstInningsStats?.badBalls || 0}</span>
                <span className="text-slate-500 text-[10px] font-bold uppercase">Bad Balls</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-3 border-b border-slate-200 pb-2 flex justify-between items-center">
              <span>2nd Innings ({formatOvers(overs, ballsHistoryLength)} overs)</span>
              <span className="text-slate-500 tabular-nums">{formatGameTime(elapsedTime)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="text-center flex-1 border-r border-slate-200">
                <span className="block text-2xl font-black text-slate-800">{totalWickets}</span>
                <span className="text-slate-500 text-[10px] font-bold uppercase">Wickets</span>
              </div>
              <div className="text-center flex-1">
                <span className="block text-2xl font-black text-amber-600">{totalBadBalls}</span>
                <span className="text-slate-500 text-[10px] font-bold uppercase">Bad Balls</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={onUndo} variant="neutral" className="w-full" disabled={historyLength === 0}>
            <Undo2 size={18} /> Undo Last Action
          </Button>
          <Button onClick={onBackToHome} variant="outline" className="w-full">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export { CompleteScreen };
