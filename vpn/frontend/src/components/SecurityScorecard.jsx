import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Info, Activity, Key, Lock, Cpu } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function SecurityScorecard({ data }) {
  if (!data) return null;

  const { scoring, posture, ai_analysis, sequence_validation } = data;
  const { overall_score, grade, rating_text, category_scores, risk_counts } = scoring;

  const getGradeBg = (g) => {
    if (g.startsWith('A')) return 'from-red-900/60 via-rose-900/40 to-red-950/80 text-white border-red-500/50 glow-red';
    if (g.startsWith('B')) return 'from-rose-900/50 via-red-900/30 to-slate-950 text-white border-rose-500/40 glow-rose';
    if (g.startsWith('C')) return 'from-amber-900/50 via-red-950/40 to-slate-950 text-amber-200 border-amber-500/40';
    return 'from-red-950/90 via-rose-950/70 to-slate-950 text-red-200 border-red-500/60 glow-red';
  };

  const chartData = [
    { name: 'Crypto Strength (25%)', score: category_scores.cryptographic_strength.score, fill: '#ef4444' },
    { name: 'Protocol Compliance (20%)', score: category_scores.protocol_compliance.score, fill: '#f43f5e' },
    { name: 'Key Management (20%)', score: category_scores.key_management.score, fill: '#e11d48' },
    { name: 'Config Security (15%)', score: category_scores.configuration_security.score, fill: '#ffffff' },
    { name: 'Protocol Behavior (10%)', score: category_scores.protocol_behavior.score, fill: '#fbbf24' },
    { name: 'Anomaly Detection (10%)', score: category_scores.anomaly_detection.score, fill: '#f87171' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Score + Grade + Risk Counts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overall Score Gauge & Grade */}
        <div className={`liquid-glass-panel p-6 rounded-2xl border bg-gradient-to-br flex flex-col justify-between ${getGradeBg(grade)}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-300">IPsec Security Posture</span>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-950/80 border border-red-500/40 text-white shadow-sm">{rating_text}</span>
          </div>

          <div className="my-6 flex items-center justify-between">
            <div>
              <div className="text-5xl font-extrabold tracking-tight text-white flex items-baseline gap-2">
                <span>{overall_score}</span>
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
            <span>Target Vendor: <strong className="text-white">{posture.vendor_type}</strong></span>
            <span>AI Status: <strong className="text-white">{ai_analysis.classification}</strong></span>
          </div>
        </div>

        {/* Severity Risk Distribution Cards */}
        <div className="liquid-glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-4">Risk Severity Matrix</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="liquid-glass-card p-4 rounded-xl border border-red-500/40 bg-red-950/40">
              <div className="flex items-center justify-between text-red-400 text-xs font-bold">
                <span>Critical Risk</span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-3xl font-extrabold text-white mt-2">{risk_counts.critical}</div>
              <span className="text-[10px] text-slate-300">Immediate Remediation</span>
            </div>

            <div className="liquid-glass-card p-4 rounded-xl border border-rose-500/40 bg-rose-950/30">
              <div className="flex items-center justify-between text-rose-300 text-xs font-bold">
                <span>High Risk</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mt-2">{risk_counts.high}</div>
              <span className="text-[10px] text-slate-300">Priority Action Needed</span>
            </div>

            <div className="liquid-glass-card p-4 rounded-xl border border-amber-500/40 bg-amber-950/30">
              <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
                <span>Medium Risk</span>
                <Info className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mt-2">{risk_counts.medium}</div>
              <span className="text-[10px] text-slate-300">Configuration Drift</span>
            </div>

            <div className="liquid-glass-card p-4 rounded-xl border border-slate-700 bg-red-950/20">
              <div className="flex items-center justify-between text-white text-xs font-bold">
                <span>Low / Compliant</span>
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div className="text-3xl font-extrabold text-white mt-2">{risk_counts.low}</div>
              <span className="text-[10px] text-slate-300">Passed Benchmark</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-red-500/20 text-xs text-slate-300 flex items-center justify-between">
            <span>Evaluated Standard:</span>
            <span className="font-bold text-white">NIST SP 800-77 & NSA CNSA 2.0</span>
          </div>
        </div>

        {/* Core VPN Parameter Snapshots */}
        <div className="liquid-glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300">Key Posture Highlights</h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-950/40 border border-red-500/20">
              <div className="flex items-center gap-2 text-slate-200">
                <Lock className="w-4 h-4 text-red-400" />
                <span>Protocol Version:</span>
              </div>
              <span className={`font-bold ${posture.ike_version === 'IKEv2' ? 'text-white' : 'text-red-400'}`}>{posture.ike_version}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-950/40 border border-red-500/20">
              <div className="flex items-center gap-2 text-slate-200">
                <Shield className="w-4 h-4 text-rose-400" />
                <span>Encryption Cipher:</span>
              </div>
              <span className="font-bold text-white">{posture.phase1_encryption}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-950/40 border border-red-500/20">
              <div className="flex items-center gap-2 text-slate-200">
                <Key className="w-4 h-4 text-white" />
                <span>Diffie-Hellman Group:</span>
              </div>
              <span className="font-bold text-white">{posture.dh_group}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-950/40 border border-red-500/20">
              <div className="flex items-center gap-2 text-slate-200">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>PFS Protection:</span>
              </div>
              <span className={`font-bold ${posture.pfs_enabled ? 'text-white' : 'text-red-400'}`}>{posture.pfs_enabled ? 'Enabled' : 'Disabled'}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-950/40 border border-red-500/20">
              <div className="flex items-center gap-2 text-slate-200">
                <Cpu className="w-4 h-4 text-red-400" />
                <span>Behavioral Anomaly:</span>
              </div>
              <span className={`font-bold ${ai_analysis.is_behavioral_anomaly ? 'text-red-400' : 'text-white'}`}>
                {ai_analysis.is_behavioral_anomaly ? `Detected (${ai_analysis.anomaly_confidence}%)` : 'Normal'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Weighted Category Breakdown Chart */}
      <div className="liquid-glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Weighted Category Sub-Score Matrix</h3>
            <p className="text-xs text-slate-300">Breakdown across 6 standardized IPsec assessment dimensions</p>
          </div>
          <div className="text-xs text-slate-300 font-mono">Total Score = Sum(Sub-Score * Weight)</div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} stroke="#f87171" tick={{ fontSize: 12, fill: '#ffffff' }} />
              <YAxis dataKey="name" type="category" stroke="#f87171" tick={{ fontSize: 11, fill: '#ffffff' }} width={140} />
              <Tooltip contentStyle={{ backgroundColor: '#180509', borderColor: '#ef4444', borderRadius: '12px', color: '#ffffff', fontSize: '12px' }} />
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
