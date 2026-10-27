import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Info, Lock, Server } from 'lucide-react';

export default function CryptoAuditGrid({ data }) {
  if (!data || !data.rules) return null;

  const { rules, posture } = data;

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-red-950 text-white border border-red-500/60 shadow-sm">🔴 Critical</span>;
      case 'HIGH':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-rose-950 text-white border border-rose-500/50">🟠 High</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-950 text-amber-200 border border-amber-500/50">🟡 Medium</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-red-900/30 text-white border border-red-500/30">🟢 Low</span>;
    }
  };

  const getStatusBadge = (st) => {
    if (st === 'PASS') return <span className="text-white font-extrabold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-white"/> PASS</span>;
    if (st === 'WARNING') return <span className="text-amber-300 font-extrabold flex items-center gap-1"><Info className="w-3.5 h-3.5 text-amber-400"/> WARN</span>;
    return <span className="text-red-400 font-extrabold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-red-500"/> FAIL</span>;
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="liquid-glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-400" />
            <span>Cryptographic & Configuration Benchmark Matrix</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">Rule-based assessment against NIST SP 800-77 Rev 1 & NSA CNSA 2.0</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-red-950/60 px-3 py-1.5 rounded-xl border border-red-500/30 text-white font-bold">
          <Server className="w-4 h-4 text-red-400" />
          <span>Vendor: {posture.vendor_type}</span>
        </div>
      </div>

      {/* Interactive Rules Table */}
      <div className="liquid-glass-panel rounded-2xl border border-red-500/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-red-950/80 text-white uppercase font-bold border-b border-red-500/30">
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
            <tbody className="divide-y divide-red-500/20 text-white">
              {rules.map((rule, idx) => (
                <tr key={idx} className="hover:bg-red-950/40 transition-all">
                  <td className="py-3.5 px-4 font-mono text-red-400 font-bold">{rule.id}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{rule.parameter}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{rule.detected}</td>
                  <td className="py-3.5 px-4">{getStatusBadge(rule.status)}</td>
                  <td className="py-3.5 px-4">{getSeverityBadge(rule.severity)}</td>
                  <td className="py-3.5 px-4 max-w-xs text-slate-200 leading-snug">{rule.assessment}</td>
                  <td className="py-3.5 px-4 max-w-xs text-white font-bold leading-snug">{rule.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
