import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SecurityScorecard from './components/SecurityScorecard';
import XAIExplainability from './components/XAIExplainability';
import SequenceVisualizer from './components/SequenceVisualizer';
import CryptoAuditGrid from './components/CryptoAuditGrid';
import BaselineDriftViewer from './components/BaselineDriftViewer';
import PrivacyFederatedSimulator from './components/PrivacyFederatedSimulator';
import ReportExportModal from './components/ReportExportModal';
import VPNLogAnalyzer from './components/VPNLogAnalyzer';
import { Code, Upload, AlertTriangle, RefreshCw, Sparkles, Monitor, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSample, setSelectedSample] = useState('optimal');
  const [rawConfig, setRawConfig] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanningHost, setScanningHost] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [error, setError] = useState(null);
  const [samplesData, setSamplesData] = useState(null);

  // Fetch samples on load
  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const res = await fetch('/api/samples');
      const data = await res.json();
      setSamplesData(data.scenarios);
      if (data.scenarios && data.scenarios['optimal']) {
        setRawConfig(data.scenarios['optimal'].raw_config);
        executeScan(data.scenarios['optimal'].raw_config, 'none');
      }
    } catch (err) {
      console.error("Failed to load samples", err);
    }
  };

  const handleSelectSample = (sampleKey) => {
    setSelectedSample(sampleKey);
    setUploadedFileName(null);
    if (samplesData && samplesData[sampleKey]) {
      const scenario = samplesData[sampleKey];
      setRawConfig(scenario.raw_config);
      executeScan(scenario.raw_config, scenario.flow_type || 'none');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setRawConfig(text);
      setSelectedSample('custom');
      executeScan(text, 'none');
    };
    reader.readAsText(file);
  };

  const executeScan = async (configStr = rawConfig, flowType = 'none') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_text: configStr || rawConfig,
          config_type: 'auto',
          flow_type: flowType,
          vpn_id: uploadedFileName ? `FILE-${uploadedFileName}` : 'VPN-01'
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      setError(err.message || 'Error executing scan');
    } finally {
      setLoading(false);
    }
  };

  const executeHostDeviceScan = async () => {
    setLoading(true);
    setScanningHost(true);
    setError(null);
    setSelectedSample('host_device');
    try {
      const res = await fetch('/api/scan/device');
      if (!res.ok) {
        throw new Error(`Host scanner returned status ${res.status}`);
      }
      const data = await res.json();
      setScanResult(data);
      if (data.posture && data.posture.raw_config) {
        setRawConfig(data.posture.raw_config);
      }
      setUploadedFileName(null);
    } catch (err) {
      setError(err.message || 'Error scanning host device VPN');
    } finally {
      setLoading(false);
      setScanningHost(false);
    }
  };

  const handleSaveBaseline = async (vpnId, assessmentData) => {
    try {
      await fetch('/api/baselines/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vpn_id: vpnId,
          assessment_data: assessmentData
        })
      });
    } catch (err) {
      console.error("Error saving baseline", err);
    }
  };

  return (
    <div className="min-h-screen cyber-bg-container text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        onRunScan={() => executeScan()}
        onScanHostDevice={executeHostDeviceScan}
        loading={loading}
        selectedSample={selectedSample}
        onSelectSample={handleSelectSample}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center justify-between backdrop-blur-md shadow-lg shadow-red-500/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>{error}</span>
            </div>
            <button onClick={() => executeScan()} className="underline font-bold text-white hover:text-red-300">Retry Scan</button>
          </div>
        )}

        {/* Primary Liquid Glass Scanner Control Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Upload Config VPN File */}
          <div className="liquid-glass-panel p-6 rounded-2xl space-y-4 relative overflow-hidden group hover:border-red-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-bold text-white">
                <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 shadow-sm shadow-red-500/20">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-base tracking-tight">Upload VPN Config File</span>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/30 text-white font-medium">.conf, .cfg, .ovpn</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">Upload raw IPsec configuration text or JSON flow telemetry from your local machine for real-time AI security audit.</p>

            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-red-500/30 hover:border-red-500/80 rounded-xl bg-red-950/30 cursor-pointer transition-all hover:bg-red-500/10 group">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <FileText className="w-4 h-4 text-red-400" />
                <span>{uploadedFileName ? `Loaded: ${uploadedFileName}` : "Click / Drag & Drop Config File"}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">strongSwan, Cisco ASA, Fortinet & pfSense</span>
              <input type="file" accept=".conf,.cfg,.txt,.json,.xml,.ovpn" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Card 2: Auto-Detect Host Device VPN */}
          <div className="liquid-glass-panel p-6 rounded-2xl space-y-4 relative overflow-hidden group hover:border-red-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-bold text-white">
                <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 shadow-sm shadow-red-500/20">
                  <Monitor className="w-5 h-5" />
                </div>
                <span className="text-base tracking-tight">Auto-Detect Host Device VPN</span>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-red-600/20 border border-red-500/40 text-white font-semibold shadow-sm shadow-red-500/20">Live OS Scanner</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">Inspects local Windows PowerShell/WMI VPN connections, strongSwan configs, system adapters, and tunnel states automatically.</p>

            <button
              onClick={executeHostDeviceScan}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 border border-red-400/40 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              {scanningHost ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Scanning Host Device VPN...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  <span>Scan Local Host Device VPN Now</span>
                </>
              )}
            </button>
          </div>

          {/* Card 3: VPN Log Analyzer & AI Threat Detector */}
          <div className="liquid-glass-panel p-6 rounded-2xl space-y-4 relative overflow-hidden group hover:border-red-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-bold text-white">
                <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 shadow-sm shadow-red-500/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="text-base tracking-tight">VPN Log Analyzer & AI Threats</span>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/30 text-white font-medium">.log, .syslog</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">Parses strongSwan charon, Cisco ASA, OpenVPN & Fortinet logs to detect password brute-force attacks and protocol errors.</p>

            <button
              onClick={() => setActiveTab('logs')}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 hover:from-slate-800 hover:to-red-900 text-white font-bold text-xs shadow-lg border border-red-500/40 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <FileText className="w-4 h-4 text-red-400" />
              <span>Open VPN Log Analyzer Tool</span>
            </button>
          </div>

        </div>

        {/* Host Device Scan Metadata Banner (If active) */}
        {scanResult && scanResult.host_device_metadata && (
          <div className="liquid-glass-panel p-4 rounded-2xl border border-red-500/40 bg-red-950/30 flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-red-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-600/30 border border-red-500/50 text-white shadow-sm shadow-red-500/30">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2 tracking-wide">
                  <span>Host Device VPN Audit Active</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/25 text-white border border-red-500/30 font-mono font-semibold">
                    {scanResult.host_device_metadata.source_type}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Host: <strong className="text-white font-semibold">{scanResult.host_device_metadata.hostname}</strong> | OS: <strong className="text-white font-semibold">{scanResult.host_device_metadata.os}</strong>
                </p>
              </div>
            </div>

            {scanResult.host_device_metadata.detected_connections.length > 0 && (
              <div className="text-xs text-white font-bold bg-red-600/20 border border-red-500/30 px-3 py-1 rounded-xl">
                Detected Connections: {scanResult.host_device_metadata.detected_connections.map(c => c.Name).join(", ")}
              </div>
            )}
          </div>
        )}

        {/* Live Config Text View / Edit Area */}
        <div className="liquid-glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white tracking-wide">
              <Code className="w-4 h-4 text-red-400" />
              <span>Target IPsec Configuration Payload</span>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={selectedSample}
                onChange={(e) => handleSelectSample(e.target.value)}
                className="bg-red-950/80 border border-red-500/40 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-red-400 font-medium"
              >
                <option value="custom" disabled>Load Sample Template (Optional)...</option>
                <option value="optimal">Sample: Modern Zero-Trust (Grade A+)</option>
                <option value="legacy">Sample: Legacy Enterprise (Grade D)</option>
                <option value="branch_misconfig">Sample: Branch Misconfig (Grade C)</option>
                <option value="sequence_anomaly">Sample: Sequence Anomaly (Grade C-)</option>
              </select>
              <span className="text-[11px] text-slate-300 font-medium hidden sm:inline">Parsed by IPsec Multi-Vendor Tokenizer</span>
            </div>
          </div>

          <textarea
            value={rawConfig}
            onChange={(e) => setRawConfig(e.target.value)}
            placeholder="Paste raw IPsec configuration text (swanctl.conf, ipsec.conf, Cisco crypto map)..."
            className="w-full h-28 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-red-400/80 resize-none shadow-inner"
          />
        </div>

        {/* Tab Views */}
        {activeTab === 'logs' ? (
          <VPNLogAnalyzer />
        ) : scanResult ? (
          <div>
            {activeTab === 'overview' && <SecurityScorecard data={scanResult} />}
            {activeTab === 'xai' && <XAIExplainability data={scanResult} />}
            {activeTab === 'sequence' && <SequenceVisualizer data={scanResult} />}
            {activeTab === 'crypto' && <CryptoAuditGrid data={scanResult} />}
            {activeTab === 'baseline' && <BaselineDriftViewer data={scanResult} onSaveBaseline={handleSaveBaseline} />}
            {activeTab === 'privacy' && <PrivacyFederatedSimulator data={scanResult} />}
            {activeTab === 'reports' && <ReportExportModal data={scanResult} />}
          </div>
        ) : (
          <div className="liquid-glass-panel p-12 rounded-2xl text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-red-400 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-white">Initializing IPsec AI Protocol Engine...</p>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-red-500/20 py-4 px-6 text-center text-xs text-slate-300 backdrop-blur-md">
        <p>AI-Powered IPsec VPN Protocol Analyzer & Security Assessment Framework — Privacy-Preserving On-Premise Cyber Edition</p>
      </footer>

    </div>
  );
}
