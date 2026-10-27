import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import GlassCard from './GlassCard';

export default function Timeline({ steps = [], className = '' }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className={`pt-4 pb-2 px-2 overflow-x-auto ${className}`}>
      <div className="flex items-center gap-3 min-w-[700px]">
        {steps.map((step, idx) => {
          const isAnomaly = step.status !== 'OK' && step.status !== 'OK (Rekey)';
          return (
            <React.Fragment key={idx}>
              <GlassCard className={`p-4 rounded-xl flex-1 ${
                isAnomaly ? 'border-red-500/60 bg-red-950/60' : 'border-red-500/25'
              }`}>
                <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono mb-2">
                  <span>Step #{step.packet_num}</span>
                  <span>{step.timestamp_ms} ms</span>
                </div>

                <div className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Zap className={`w-3.5 h-3.5 ${isAnomaly ? 'text-red-400 animate-pulse' : 'text-white'}`} />
                  <span>{step.exchange_type}</span>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="text-[10px] text-slate-300">
                    Direction: <strong className="text-white">{step.initiator ? 'Initiator ➔ Responder' : 'Responder ➔ Initiator'}</strong>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    Message ID: <span className="font-mono text-white">{step.msg_id}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {step.payloads && step.payloads.map((p, pIdx) => (
                    <span key={pIdx} className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-red-950/80 text-white border border-red-500/30 font-medium">
                      {p}
                    </span>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-red-500/20 flex items-center justify-between">
                  <span className={`text-[10px] font-bold ${isAnomaly ? 'text-red-400' : 'text-white'}`}>
                    {step.status}
                  </span>
                </div>
              </GlassCard>

              {idx < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-red-400 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
