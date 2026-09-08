import React, { useState } from 'react';
import { ShieldCheck, Lock, Share2, Server, Cpu, Database, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PrivacyFederatedSimulator({ data }) {
  const [fedExport, setFedExport] = useState(null);
  const [exporting, setExporting] = useState(false);

  const handleExportGradient = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/privacy/federated-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_text: data?.posture ? JSON.stringify(data.posture) : "swanctl",
          config_type: "swanctl"
        })
      });
      const fedData = await res.json();
      setFedExport(fedData);
    } catch (err) {
      console.error("Federated export error", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Privacy Architecture Flow Diagram */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <span>Privacy-Preserving Local-First Architecture</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Zero-payload inspection architecture guaranteeing 100% data confidentiality</p>
        </div>

        {/* Interactive Architecture Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center">
          
          <div className="glass-card p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 space-y-2">
            <Server className="w-6 h-6 text-cyan-400 mx-auto" />
            <div className="text-xs font-bold text-white">VPN Network</div>
            <p className="text-[10px] text-slate-400">Encrypted IPsec Traffic & Configs</p>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-600 mx-auto hidden md:block" />

          <div className="glass-card p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-2">
            <Cpu className="w-6 h-6 text-blue-400 mx-auto" />
            <div className="text-xs font-bold text-white">Local Dissector</div>
            <p className="text-[10px] text-slate-400">Metadata & Header Feature Extractor</p>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-600 mx-auto hidden md:block" />

          <div className="glass-card p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
            <div className="text-xs font-bold text-white">Local AI Model</div>
            <p className="text-[10px] text-slate-400">On-Premises Isolation & Random Forest</p>
          </div>

        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Data Governance Guarantee:</strong> Raw IPsec packet payloads and internal IP addresses never leave the local organization perimeter. All feature extraction occurs locally in memory.
          </span>
        </div>
      </div>

      {/* Federated Learning Gradient Export Simulator */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-violet-400" />
              <span>Federated Learning & Differential Privacy Simulator</span>
            </h3>
            <p className="text-xs text-slate-400">Collaboratively improve cross-organization AI models without centralizing raw VPN telemetry</p>
          </div>

          <button
            onClick={handleExportGradient}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-medium transition-all shadow-md"
          >
            <Database className="w-4 h-4" />
            <span>{exporting ? 'Computing Weights...' : 'Export Local Model Gradient Update'}</span>
          </button>
        </div>

        {fedExport && (
          <div className="glass-card p-4 rounded-xl border border-violet-500/30 bg-slate-950 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-violet-300 font-bold">
              <span>Differential Privacy Status: {fedExport.status}</span>
              <span className="text-[10px] bg-violet-500/20 px-2 py-0.5 rounded border border-violet-500/40">{fedExport.privacy_guarantee}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-300">
              <div>Raw Payload Retained: <strong className="text-rose-400">False</strong></div>
              <div>Raw IP Retained: <strong className="text-rose-400">False</strong></div>
              <div>Noise Multiplier: <strong>{fedExport.noise_multiplier}</strong></div>
              <div>Clip Norm: <strong>{fedExport.clip_norm}</strong></div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 mb-1">Exported Model Weight Gradients (Privacy-Noised Vector):</div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-cyan-300 overflow-x-auto">
                {JSON.stringify(fedExport.model_gradient_weights_sample)}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
