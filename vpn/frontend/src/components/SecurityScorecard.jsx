import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Info, Activity, Key, Lock, Cpu } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function SecurityScorecard({ data }) {
  if (!data) return null;

  const { scoring, posture, ai_analysis, sequence_validation } = data;
  const { overall_score, grade, rating_text, category_scores, risk_counts } = scoring;

  const getGradeBg = (g) => {
    if (g.startsWith('A')) return 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/40 glow-emerald';
    if (g.startsWith('B')) return 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/40 glow-cyan';
    if (g.startsWith('C')) return 'from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/40';
    return 'from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/40 glow-rose';
  };

  const chartData = [
    { name: 'Crypto Strength (25%)', score: category_scores.cryptographic_strength.score, fill: '#10b981' },
    { name: 'Protocol Compliance (20%)', score: category_scores.protocol_compliance.score, fill: '#06b6d4' },
    { name: 'Key Management (20%)', score: category_scores.key_management.score, fill: '#3b82f6' },
    { name: 'Config Security (15%)', score: category_scores.configuration_security.score, fill: '#8b5cf6' },
    { name: 'Protocol Behavior (10%)', score: category_scores.protocol_behavior.score, fill: '#f59e0b' },
    { name: 'Anomaly Detection (10%)', score: category_scores.anomaly_detection.score, fill: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Score + Grade + Risk Counts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overall Score Gauge & Grade */}
        <div className={`glass-panel p-6 rounded-2xl border bg-gradient-to-br flex flex-col justify-between ${getGradeBg(grade)}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">IPsec Security Posture</span>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-900/60 border border-slate-700">{rating_text}</span>
          </div>

          <div className="my-6 flex items-center justify-between">
            <div>
              <div className="text-5xl font-extrabold tracking-tight text-white flex items-baseline gap-2">
                <span>{overall_score}</span>
                <span className="text-lg font-medium text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Standardized IPsec Security Score</p>
            </div>
            
            <div className="w-24 h-24 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col items-center justify-center shadow-xl">
              <span className="text-xs text-slate-400 font-medium uppercase">Grade</span>
              <span className="text-4xl font-extrabold">{grade}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>Target Vendor: <strong>{posture.vendor_type}</strong></span>
            <span>AI Status: <strong>{ai_analysis.classification}</strong></span>
          </div>
        </div>

        {/* Severity Risk Distribution Cards */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-4">Risk Severity Matrix</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
              <div className="flex items-center justify-between text-rose-400 text-xs font-bold">
                <span>Critical Risk</span>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-3xl font-extrabold text-rose-400 mt-2">{risk_counts.critical}</div>
              <span className="text-[10px] text-slate-400">Immediate Remediation</span>
            </div>

            <div className="glass-card p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center justify-between text-amber-400 text-xs font-bold">
                <span>High Risk</span>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400 mt-2">{risk_counts.high}</div>
              <span className="text-[10px] text-slate-400">Priority Action Needed</span>
            </div>

            <div className="glass-card p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-center justify-between text-yellow-400 text-xs font-bold">
                <span>Medium Risk</span>
                <Info className="w-4 h-4" />
              </div>
              <div className="text-3xl font-extrabold text-yellow-400 mt-2">{risk_counts.medium}</div>
              <span className="text-[10px] text-slate-400">Configuration Drift</span>
            </div>

            <div className="glass-card p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
                <span>Low / Compliant</span>
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-2">{risk_counts.low}</div>
              <span className="text-[10px] text-slate-400">Passed Benchmark</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Evaluated Standard:</span>
            <span className="font-semibold text-slate-200">NIST SP 800-77 & NSA CNSA 2.0</span>
          </div>
        </div>

        {/* Core VPN Parameter Snapshots */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">Key Posture Highlights</h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Protocol Version:</span>
              </div>
              <span className={`font-bold ${posture.ike_version === 'IKEv2' ? 'text-emerald-400' : 'text-rose-400'}`}>{posture.ike_version}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Encryption Cipher:</span>
              </div>
              <span className="font-semibold text-slate-100">{posture.phase1_encryption}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <Key className="w-4 h-4 text-violet-400" />
                <span>Diffie-Hellman Group:</span>
              </div>
              <span className="font-semibold text-slate-100">{posture.dh_group}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>PFS Protection:</span>
              </div>
              <span className={`font-bold ${posture.pfs_enabled ? 'text-emerald-400' : 'text-rose-400'}`}>{posture.pfs_enabled ? 'Enabled' : 'Disabled'}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <Cpu className="w-4 h-4 text-rose-400" />
                <span>Behavioral Anomaly:</span>
              </div>
              <span className={`font-bold ${ai_analysis.is_behavioral_anomaly ? 'text-rose-400' : 'text-emerald-400'}`}>
                {ai_analysis.is_behavioral_anomaly ? `Detected (${ai_analysis.anomaly_confidence}%)` : 'Normal'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Weighted Category Breakdown Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Weighted Category Sub-Score Matrix</h3>
            <p className="text-xs text-slate-400">Breakdown across 6 standardized IPsec assessment dimensions</p>
          </div>
          <div className="text-xs text-slate-400 font-mono">Total Score = Sum(Sub-Score * Weight)</div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={140} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={18}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
