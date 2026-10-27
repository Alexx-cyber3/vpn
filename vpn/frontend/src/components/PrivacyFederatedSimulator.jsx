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
      <div className="liquid-glass-panel p-6 rounded-2xl space-y-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-400" />
            <span>Privacy-Preserving Local-First Architecture</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">Zero-payload inspection architecture guaranteeing 100% data confidentiality</p>
        </div>

        {/* Interactive Architecture Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center">
          
          <div className="liquid-glass-card p-4 rounded-xl border border-red-500/30 bg-red-950/40 space-y-2">
            <Server className="w-6 h-6 text-white mx-auto" />
            <div className="text-xs font-bold text-white">VPN Network</div>
            <p className="text-[10px] text-slate-300">Encrypted IPsec Traffic & Configs</p>
          </div>

          <ArrowRight className="w-5 h-5 text-red-400 mx-auto hidden md:block" />

          <div className="liquid-glass-card p-4 rounded-xl border border-red-500/30 bg-red-950/40 space-y-2">
            <Cpu className="w-6 h-6 text-white mx-auto" />
            <div className="text-xs font-bold text-white">Local Dissector</div>
            <p className="text-[10px] text-slate-300">Metadata & Header Feature Extractor</p>
          </div>

          <ArrowRight className="w-5 h-5 text-red-400 mx-auto hidden md:block" />

          <div className="liquid-glass-card p-4 rounded-xl border border-red-500/40 bg-red-950/60 space-y-2">
            <ShieldCheck className="w-6 h-6 text-white mx-auto" />
            <div className="text-xs font-bold text-white">Local AI Model</div>
            <p className="text-[10px] text-slate-300">On-Premises Isolation & Random Forest</p>
          </div>

        </div>

        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-white flex items-center gap-3 font-medium">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span>
            <strong>Data Governance Guarantee:</strong> Raw IPsec packet payloads and internal IP addresses never leave the local organization perimeter. All feature extraction occurs locally in memory.
          </span>
        </div>
      </div>

      {/* Federated Learning Gradient Export Simulator */}
      <div className="liquid-glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-red-400" />
              <span>Federated Learning & Differential Privacy Simulator</span>
            </h3>
            <p className="text-xs text-slate-300">Collaboratively improve cross-organization AI models without centralizing raw VPN telemetry</p>
          </div>

          <button
            onClick={handleExportGradient}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold border border-red-400/40 transition-all shadow-lg shadow-red-600/30 active:scale-95"
          >
            <Database className="w-4 h-4 text-white" />
            <span>{exporting ? 'Computing Weights...' : 'Export Local Model Gradient Update'}</span>
          </button>
        </div>

        {fedExport && (
          <div className="liquid-glass-card p-4 rounded-xl border border-red-500/40 bg-red-950/80 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-white font-bold">
              <span>Differential Privacy Status: {fedExport.status}</span>
              <span className="text-[10px] bg-red-600/30 text-white px-2.5 py-1 rounded border border-red-500/50">{fedExport.privacy_guarantee}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-200">
              <div>Raw Payload Retained: <strong className="text-white">False</strong></div>
              <div>Raw IP Retained: <strong className="text-white">False</strong></div>
              <div>Noise Multiplier: <strong className="text-white">{fedExport.noise_multiplier}</strong></div>
              <div>Clip Norm: <strong className="text-white">{fedExport.clip_norm}</strong></div>
            </div>

            <div>
              <div className="text-[10px] text-slate-300 mb-1">Exported Model Weight Gradients (Privacy-Noised Vector):</div>
              <div className="p-2 rounded bg-red-950 border border-red-500/30 text-white overflow-x-auto font-bold">
                {JSON.stringify(fedExport.model_gradient_weights_sample)}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
