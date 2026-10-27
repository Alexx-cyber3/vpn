import React from 'react';

export default function StatusBadge({ status = 'LOW', label, className = '' }) {
  const getBadgeStyle = (st) => {
    switch (String(st).toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-950 text-white border-red-500/60 shadow-sm';
      case 'HIGH':
      case 'ERROR':
        return 'bg-rose-950 text-white border-rose-500/50';
      case 'MEDIUM':
      case 'WARNING':
      case 'WARN':
        return 'bg-amber-950 text-amber-200 border-amber-500/50';
      case 'LOW':
      case 'PASS':
      case 'INFO':
      default:
        return 'bg-red-900/30 text-white border-red-500/30';
    }
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getBadgeStyle(status)} ${className}`}>
      {label || status}
    </span>
  );
}
