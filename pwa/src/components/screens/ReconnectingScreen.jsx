import React from 'react';
import { RotateCcw } from 'lucide-react';

const ReconnectingScreen = () => (
  <div className="screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
    <div className="max-w-md w-full">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 animate-pulse">
          <RotateCcw size={32} className="animate-spin" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Reconnecting...</h1>
        <p className="text-slate-500">Loading your game</p>
      </div>
    </div>
  </div>
);

export { ReconnectingScreen };
