import React from 'react';
import { ShieldCheck, Lock, Play, Cpu, Sparkles } from 'lucide-react';

export default function Navbar({ onRunScan, onScanHostDevice, loading, selectedSample, onSelectSample, activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-red-500/20 px-6 py-4 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-600/40 ring-1 ring-white/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl text-white tracking-tight drop-shadow-sm">IPsec Protocol Analyzer</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-500/15 text-white border border-red-500/30 shadow-sm shadow-red-500/20">AI + XAI Cyber Engine</span>
            </div>
            <p className="text-xs text-slate-300">Privacy-Preserving On-Premise Cryptographic & Anomaly Assessment</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-500/10 text-white text-xs font-medium border border-red-500/30 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span>100% Local Privacy Mode</span>
          </div>

          <button
            onClick={onScanHostDevice}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 border border-red-400/30 transition-all active:scale-95 disabled:opacity-50"
            title="Scan host system VPN connections, interfaces & configuration files"
          >
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
            <span>Scan Device</span>
          </button>

          <button
            onClick={onRunScan}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-900 to-red-950 hover:from-slate-800 hover:to-red-900 text-white font-bold text-xs shadow-lg shadow-red-950/40 border border-red-500/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-red-400" />
                <span>Running AI Audit...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-white" />
                <span>Execute Scan</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 mt-4 overflow-x-auto pt-2.5 border-t border-red-500/20 text-xs">
        {[
          { id: 'overview', label: 'Security Scorecard' },
          { id: 'xai', label: 'Explainable AI & Risk' },
          { id: 'sequence', label: 'Protocol Sequence FSM' },
          { id: 'crypto', label: 'Cryptographic Audit' },
          { id: 'baseline', label: 'Baseline & Drift' },
          { id: 'privacy', label: 'Privacy & Federated' },
          { id: 'reports', label: 'Report Generator' },
          { id: 'logs', label: 'VPN Log Analyzer' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-red-600/25 text-white border border-red-500/40 shadow-lg shadow-red-500/20 backdrop-blur-md' : 'text-slate-300 hover:text-white hover:bg-red-500/10'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
