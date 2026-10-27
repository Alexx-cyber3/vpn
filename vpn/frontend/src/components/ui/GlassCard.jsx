import React from 'react';

export default function GlassCard({ children, className = '', hover = true, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`liquid-glass-card p-6 rounded-2xl transition-all duration-300 ${
        hover ? 'hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
