import React from 'react';
import GlassCard from './GlassCard';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, className = '' }) {
  return (
    <GlassCard className={`p-5 space-y-2 text-center flex flex-col items-center justify-center ${className}`}>
      {Icon && (
        <div className="p-2.5 rounded-xl bg-red-600/20 text-white border border-red-500/40 mb-1">
          <Icon className="w-5 h-5 text-red-400" />
        </div>
      )}
      <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{title}</div>
      <div className="text-3xl font-extrabold text-white tracking-tight">{value}</div>
      {subtitle && <div className="text-[10px] text-slate-400 font-medium">{subtitle}</div>}
    </GlassCard>
  );
}
