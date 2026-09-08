import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Info, Lock, Server } from 'lucide-react';

export default function CryptoAuditGrid({ data }) {
  if (!data || !data.rules) return null;

  const { rules, posture } = data;

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">🔴 Critical</span>;
      case 'HIGH':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">🟠 High</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">🟡 Medium</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🟢 Low</span>;
    }
  };

  const getStatusBadge = (st) => {
    if (st === 'PASS') return <span className="text-emerald-400 font-extrabold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> PASS</span>;
    if (st === 'WARNING') return <span className="text-amber-400 font-extrabold flex items-center gap-1"><Info className="w-3.5 h-3.5"/> WARN</span>;
    return <span className="text-rose-400 font-extrabold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5"/> FAIL</span>;
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            <span>Cryptographic & Configuration Benchmark Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Rule-based assessment against NIST SP 800-77 Rev 1 & NSA CNSA 2.0</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Vendor: {posture.vendor_type}</span>
        </div>
      </div>

      {/* Interactive Rules Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Rule ID</th>
                <th className="py-3.5 px-4">Parameter</th>
                <th className="py-3.5 px-4">Detected Value</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Assessment & Findings</th>
                <th className="py-3.5 px-4">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {rules.map((rule, idx) => (
                <tr key={idx} className="hover:bg-slate-850/50 transition-all">
                  <td className="py-3.5 px-4 font-mono text-cyan-400 font-semibold">{rule.id}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{rule.parameter}</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-100">{rule.detected}</td>
                  <td className="py-3.5 px-4">{getStatusBadge(rule.status)}</td>
                  <td className="py-3.5 px-4">{getSeverityBadge(rule.severity)}</td>
                  <td className="py-3.5 px-4 max-w-xs text-slate-300 leading-snug">{rule.assessment}</td>
                  <td className="py-3.5 px-4 max-w-xs text-cyan-300 font-medium leading-snug">{rule.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
