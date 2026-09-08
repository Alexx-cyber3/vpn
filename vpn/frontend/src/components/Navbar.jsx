import React from 'react';
import { ShieldCheck, Lock, Play, Cpu, Sparkles, FileText } from 'lucide-react';

export default function Navbar({ onRunScan, loading, selectedSample, onSelectSample, activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">IPsec Protocol Analyzer</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">AI + XAI Framework</span>
            </div>
            <p className="text-xs text-slate-400">Privacy-Preserving Local Cryptographic & Anomaly Assessment</p>
          </div>
        </div>

        {/* Action Controls & Sample Scenarios */}
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
            <Lock className="w-3.5 h-3.5" />
            <span>100% Local Privacy Mode</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 px-2 font-medium">Preset Scenarios:</span>
            <button
              onClick={() => onSelectSample('optimal')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${selectedSample === 'optimal' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Optimal (A+)
            </button>
            <button
              onClick={() => onSelectSample('legacy')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${selectedSample === 'legacy' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Legacy (D)
            </button>
            <button
              onClick={() => onSelectSample('branch_misconfig')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${selectedSample === 'branch_misconfig' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Misconfig (C)
            </button>
            <button
              onClick={() => onSelectSample('sequence_anomaly')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${selectedSample === 'sequence_anomaly' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sequence Anomaly
            </button>
          </div>

          <button
            onClick={onRunScan}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>Running AI Audit...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Scan</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto flex items-center gap-1 mt-4 overflow-x-auto pt-2 border-t border-slate-800/60 text-xs">
        {[
          { id: 'overview', label: 'Security Scorecard' },
          { id: 'xai', label: 'Explainable AI & Risk' },
          { id: 'sequence', label: 'Protocol Sequence FSM' },
          { id: 'crypto', label: 'Cryptographic Audit' },
          { id: 'baseline', label: 'Baseline & Drift' },
          { id: 'privacy', label: 'Privacy & Federated' },
          { id: 'reports', label: 'Report Generator' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
