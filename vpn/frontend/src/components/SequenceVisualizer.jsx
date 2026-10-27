import React from 'react';
import { GitCommit, AlertOctagon, CheckCircle2, Clock, Zap, ArrowRight, ShieldAlert } from 'lucide-react';

export default function SequenceVisualizer({ data }) {
  if (!data || !data.sequence_validation || !data.flow_metadata) return null;

  const { sequence_validation, flow_metadata } = data;
  const { exchange_sequence, avg_interpacket_delay_ms, timing_jitter_ms, retransmission_count } = flow_metadata;
  const { valid, confidence_score, anomalies_detected, state_summary } = sequence_validation;

  return (
    <div className="space-y-6">
      
      {/* Header Banner: State Machine Status */}
      <div className="liquid-glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">IKE Protocol Sequence Validation (FSM)</h2>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${valid ? 'bg-red-600/30 text-white border-red-500/40 shadow-sm shadow-red-500/20' : 'bg-red-950 text-red-400 border-red-500/50'}`}>
              {valid ? 'SEQUENCE VALID' : 'PROTOCOL ANOMALY'}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">{state_summary}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="liquid-glass-card px-4 py-2 rounded-xl border border-red-500/30 text-right">
            <div className="text-[10px] text-slate-300 uppercase font-bold">FSM Confidence</div>
            <div className="text-xl font-extrabold text-white">{confidence_score}%</div>
          </div>

          <div className="liquid-glass-card px-4 py-2 rounded-xl border border-red-500/30 text-right">
            <div className="text-[10px] text-slate-300 uppercase font-bold">Retransmissions</div>
            <div className={`text-xl font-extrabold ${retransmission_count > 0 ? 'text-red-400' : 'text-white'}`}>
              {retransmission_count}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Handshake Sequence Flow diagram */}
      <div className="liquid-glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-red-400" />
            <span>Observed IKE Exchange Sequence Timeline</span>
          </h3>
          <span className="text-xs font-mono text-slate-300">Avg Interpacket Delay: {avg_interpacket_delay_ms} ms | Jitter: {timing_jitter_ms} ms</span>
        </div>

        {/* Step Nodes Flow Diagram */}
        <div className="pt-4 pb-2 px-2 overflow-x-auto">
          <div className="flex items-center gap-3 min-w-[700px]">
            {exchange_sequence.map((step, idx) => {
              const isAnomaly = step.status !== 'OK' && step.status !== 'OK (Rekey)';
              return (
                <React.Fragment key={idx}>
                  <div className={`liquid-glass-card p-4 rounded-xl border flex-1 transition-all ${
                    isAnomaly ? 'border-red-500/60 bg-red-950/60' : 'border-red-500/25 hover:border-red-500/50'
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
                      {step.payloads.map((p, pIdx) => (
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
                  </div>

                  {idx < exchange_sequence.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Protocol Anomaly Diagnostics & Root Cause Determination */}
      {anomalies_detected.length > 0 ? (
        <div className="liquid-glass-panel p-6 rounded-2xl border border-red-500/50 bg-red-950/40 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>Detected Sequence Anomalies & AI Root-Cause Analysis</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies_detected.map((anom, idx) => (
              <div key={idx} className="liquid-glass-card p-4 rounded-xl border border-red-500/40 bg-red-950/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-950 text-white border border-red-500/40">
                    {anom.type}
                  </span>
                  <span className="text-[10px] text-slate-300">Step {anom.step}</span>
                </div>
                <p className="text-xs text-white leading-relaxed">{anom.description}</p>
                <div className="pt-2 border-t border-red-500/20 text-xs text-red-200">
                  Likely Cause: <strong className="text-white">{anom.likely_cause}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="liquid-glass-panel p-4 rounded-xl border border-red-500/30 bg-red-950/20 flex items-center gap-3 text-xs text-white">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span>Strict state machine validation passed. Observed negotiation follows standard RFC 7296 IKEv2 sequence.</span>
        </div>
      )}

    </div>
  );
}
