import React from 'react';
import { X } from 'lucide-react';
import GlassCard from './GlassCard';

export default function Modal({ isOpen, onClose, title, children, className = '' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <GlassCard className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl space-y-4 border border-red-500/40 shadow-2xl ${className}`}>
        <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
          <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-red-500/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </GlassCard>
    </div>
  );
}
