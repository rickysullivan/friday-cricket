import React from 'react';
import { ArrowRightLeft, Coffee, Timer, Undo2 } from 'lucide-react';
import { Button } from '../Button';

const HalfTimeScreen = ({
  firstInningsStats,
  totalWickets,
  totalBadBalls,
  formatGameTime,
  formatOvers,
  onStartSecondInnings,
  onUndo,
  historyLength
}) => (
  <div className="screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
    <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-blue-100">
      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Coffee size={32} />
      </div>

      <h2 className="text-2xl font-black text-slate-800 mb-2">Half Time Report</h2>
      <p className="text-slate-500 mb-6">1st Innings Completed</p>

      <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
        <div className="flex items-center justify-center gap-2 mb-4 text-slate-600">
          <Timer size={18} />
          <span className="text-xl font-bold tabular-nums">{formatGameTime(firstInningsStats?.duration || 0)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <div className="text-center flex-1">
            <div className="text-2xl font-black text-slate-800">{firstInningsStats?.wickets || totalWickets}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Wickets</div>
          </div>
          <div className="w-px bg-slate-200"></div>
          <div className="text-center flex-1">
            <div className="text-2xl font-black text-amber-600">{firstInningsStats?.badBalls || totalBadBalls}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 mt-1 whitespace-nowrap">Bad Balls</div>
          </div>
          <div className="w-px bg-slate-200"></div>
          <div className="text-center flex-1">
            <div className="text-2xl font-black text-slate-800">
              {formatOvers(firstInningsStats?.overs || 0, firstInningsStats?.balls || 0)}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Overs</div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 text-amber-800 p-4 rounded-xl flex items-center gap-3 mb-8 text-left border border-amber-100">
        <ArrowRightLeft size={24} className="shrink-0" />
        <div className="text-sm font-medium">
          <strong>Swap Roles!</strong><br />
          Bowling team now bats.<br />
          Batting team now fields.
        </div>
      </div>

      <Button size="xl" onClick={onStartSecondInnings} className="w-full mb-3">
        Start 2nd Innings
      </Button>

      <Button
        variant="neutral"
        onClick={onUndo}
        className="w-full"
        disabled={historyLength === 0}
      >
        <Undo2 size={18} /> Oops, go back
      </Button>
    </div>
  </div>
);

export { HalfTimeScreen };
