import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SecurityScorecard from './components/SecurityScorecard';
import XAIExplainability from './components/XAIExplainability';
import SequenceVisualizer from './components/SequenceVisualizer';
import CryptoAuditGrid from './components/CryptoAuditGrid';
import BaselineDriftViewer from './components/BaselineDriftViewer';
import PrivacyFederatedSimulator from './components/PrivacyFederatedSimulator';
import ReportExportModal from './components/ReportExportModal';
import { Code, Terminal, Upload, AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSample, setSelectedSample] = useState('optimal');
  const [rawConfig, setRawConfig] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
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
    if (samplesData && samplesData[sampleKey]) {
      const scenario = samplesData[sampleKey];
      setRawConfig(scenario.raw_config);
      executeScan(scenario.raw_config, scenario.flow_type || 'none');
    }
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
          vpn_id: 'VPN-01'
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        onRunScan={() => executeScan()}
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
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{error}</span>
            </div>
            <button onClick={() => executeScan()} className="underline font-bold">Retry Scan</button>
          </div>
        )}

        {/* Live Config Input & Preset Selector Header */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Code className="w-4 h-4 text-cyan-400" />
              <span>Target IPsec Configuration / Flow Metadata Input</span>
            </div>
            <span className="text-[11px] text-slate-400">Supports strongSwan, Cisco ASA, pfSense, Fortinet, and OpenVPN/IPsec</span>
          </div>

          <textarea
            value={rawConfig}
            onChange={(e) => setRawConfig(e.target.value)}
            placeholder="Paste raw IPsec configuration text (swanctl.conf, ipsec.conf, Cisco crypto map)..."
            className="w-full h-28 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500/50 resize-none"
          />
        </div>

        {/* Tab Views */}
        {scanResult ? (
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
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-300">Initializing IPsec AI Protocol Engine...</p>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-400">
        <p>AI-Powered IPsec VPN Protocol Analyzer & Security Assessment Framework — Privacy-Preserving On-Premises Edition</p>
      </footer>

    </div>
  );
}
