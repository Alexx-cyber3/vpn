import React from 'react';
import GlassCard from './GlassCard';
import StatusBadge from './StatusBadge';

export default function RiskCard({ title, count = 0, severity = 'LOW', subtitle, icon: Icon, className = '' }) {
  return (
    <GlassCard className={`p-4 rounded-xl border space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs font-bold text-white">
        <span>{title}</span>
        {Icon && <Icon className="w-4 h-4 text-red-400" />}
      </div>
      <div className="text-3xl font-extrabold text-white mt-2">{count}</div>
      {subtitle && <span className="text-[10px] text-slate-300 block">{subtitle}</span>}
    </GlassCard>
  );
}
