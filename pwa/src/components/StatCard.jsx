import React from 'react';

const StatCard = ({ label, value, subLabel, highlight = false }) => (
  <div className={`bg-white p-3 rounded-xl shadow-sm border ${highlight ? 'border-emerald-400 bg-emerald-50' : 'border-slate-100'} text-center flex-1`}>
    <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold">{label}</div>
    <div className={`text-2xl font-black ${highlight ? 'text-emerald-700' : 'text-slate-800'}`}>{value}</div>
    {subLabel && <div className="text-xs text-slate-400">{subLabel}</div>}
  </div>
);

export { StatCard };
