import React, { useState } from 'react';
import { History, TrendingDown, ShieldCheck, AlertTriangle, ArrowRight, Save, CheckCircle } from 'lucide-react';

export default function BaselineDriftViewer({ data, onSaveBaseline }) {
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!data || !data.baseline_drift) return null;

  const { baseline_drift, vpn_id, scoring } = data;
  const { baseline_score, current_score, score_delta, drift_detected, parameter_changes, drift_summary, baseline_saved_at } = baseline_drift;

  const handleSave = () => {
    onSaveBaseline(vpn_id, data);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">IPsec Security Baseline & Configuration Drift Engine</h2>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Endpoint: {vpn_id}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{drift_summary}</p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 font-medium text-xs border border-cyan-500/30 transition-all shadow-md"
        >
          {savedSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Snapshot Baseline Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Current as New Baseline</span>
            </>
          )}
        </button>
      </div>

      {/* Score Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-2">
          <div className="text-xs uppercase font-bold text-slate-400">Baseline Score</div>
          <div className="text-4xl font-extrabold text-slate-100">{baseline_score} / 100</div>
          <p className="text-[10px] text-slate-400">Snapshot saved: {baseline_saved_at}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-2">
          <div className="text-xs uppercase font-bold text-slate-400">Current Scan Score</div>
          <div className="text-4xl font-extrabold text-cyan-400">{current_score} / 100</div>
          <p className="text-[10px] text-slate-400">Latest scan result</p>
        </div>

        <div className={`glass-panel p-6 rounded-2xl border text-center space-y-2 ${
          score_delta < 0 ? 'border-rose-500/30 bg-rose-500/5 text-rose-400' : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
        }`}>
          <div className="text-xs uppercase font-bold text-slate-400">Configuration Drift Delta</div>
          <div className="text-4xl font-extrabold flex items-center justify-center gap-1">
            {score_delta < 0 ? <TrendingDown className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            <span>{score_delta > 0 ? `+${score_delta}` : score_delta} pts</span>
          </div>
          <p className="text-[10px] text-slate-400">{drift_detected ? '⚠️ Configuration Drift Detected' : '✅ Posture matches baseline'}</p>
        </div>

      </div>

      {/* Parameter Change Diff Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <span>Baseline Parameter Diff Log</span>
        </h3>

        {parameter_changes.length > 0 ? (
          <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 overflow-hidden">
            {parameter_changes.map((change, idx) => (
              <div key={idx} className="p-4 bg-slate-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-200">{change.parameter}</span>
                  <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {change.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-950 text-slate-400 border border-slate-800">
                    Baseline: <strong className="text-slate-200">{change.baseline_val}</strong>
                  </div>
                  <ArrowRight className="w-4 h-4 text-rose-400" />
                  <div className="px-3 py-1.5 rounded-lg bg-slate-950 text-rose-300 border border-rose-500/30">
                    Current: <strong className="text-rose-200">{change.current_val}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900/40 text-xs text-slate-400 text-center">
            No parameter modifications detected between baseline snapshot and current scan.
          </div>
        )}
      </div>

    </div>
  );
}
