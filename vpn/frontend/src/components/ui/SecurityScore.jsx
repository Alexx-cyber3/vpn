import React from 'react';

export default function SecurityScore({ score = 0, grade = 'F', rating = 'UNKNOWN', vendor = 'Generic' }) {
  const getGradeBg = (g) => {
    if (g.startsWith('A')) return 'from-red-900/60 via-rose-900/40 to-red-950/80 text-white border-red-500/50 glow-red';
    if (g.startsWith('B')) return 'from-rose-900/50 via-red-900/30 to-slate-950 text-white border-rose-500/40 glow-rose';
    if (g.startsWith('C')) return 'from-amber-900/50 via-red-950/40 to-slate-950 text-amber-200 border-amber-500/40';
    return 'from-red-950/90 via-rose-950/70 to-slate-950 text-red-200 border-red-500/60 glow-red';
  };

  return (
    <div className={`liquid-glass-panel p-6 rounded-2xl border bg-gradient-to-br flex flex-col justify-between ${getGradeBg(grade)}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-bold tracking-wider text-slate-300">IPsec Security Posture</span>
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-950/80 border border-red-500/40 text-white shadow-sm">{rating}</span>
      </div>

      <div className="my-6 flex items-center justify-between">
        <div>
          <div className="text-5xl font-extrabold tracking-tight text-white flex items-baseline gap-2">
            <span>{score}</span>
            <span className="text-lg font-medium text-slate-300">/ 100</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">Standardized IPsec Security Score</p>
        </div>
        
        <div className="w-24 h-24 rounded-2xl bg-red-950/80 border border-red-500/40 flex flex-col items-center justify-center shadow-xl shadow-red-950/50">
          <span className="text-xs text-slate-300 font-bold uppercase">Grade</span>
          <span className="text-4xl font-extrabold text-white drop-shadow-md">{grade}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-red-500/20 flex items-center justify-between text-xs text-slate-200">
        <span>Target Vendor: <strong className="text-white">{vendor}</strong></span>
      </div>
    </div>
  );
}
