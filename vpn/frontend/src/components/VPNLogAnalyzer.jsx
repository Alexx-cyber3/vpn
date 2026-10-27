import React, { useState, useEffect } from 'react';
import { FileText, Upload, AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight, Zap, RefreshCw, Activity, Filter, Search } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function VPNLogAnalyzer() {
  const [logText, setLogText] = useState('');
  const [logResult, setLogResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState(null);

  // Default sample log
  const sampleLogText = `Sep 26 10:14:02 gateway charon: 01[IKE] received IKE_SA_INIT request from 198.51.100.45
Sep 26 10:14:02 gateway charon: 01[IKE] sending IKE_SA_INIT response to 198.51.100.45
Sep 26 10:14:03 gateway charon: 02[IKE] received IKE_AUTH request from 198.51.100.45
Sep 26 10:14:03 gateway charon: 02[IKE] AUTHENTICATION FAILED for user 'admin' from 198.51.100.45
Sep 26 10:14:05 gateway charon: 03[IKE] received IKE_AUTH request from 198.51.100.45
Sep 26 10:14:05 gateway charon: 03[IKE] AUTHENTICATION FAILED for user 'admin' from 198.51.100.45
Sep 26 10:14:07 gateway charon: 04[IKE] received IKE_AUTH request from 198.51.100.45
Sep 26 10:14:07 gateway charon: 04[IKE] AUTHENTICATION FAILED for user 'admin' from 198.51.100.45
Sep 26 10:14:09 gateway charon: 05[IKE] SECURITY ALERT: BRUTE_FORCE_ATTACK detected from 198.51.100.45 (4 failed auth attempts)
Sep 26 10:15:20 gateway charon: 06[IKE] received IKE_SA_INIT request from 203.0.113.88
Sep 26 10:15:20 gateway charon: 06[IKE] NO_PROPOSAL_CHOSEN notify received from 203.0.113.88 - unsupported proposal aes128-sha1-modp1024
Sep 26 10:16:10 gateway charon: 07[IKE] DPD TIMEOUT on connection 'branch-office-01' to 198.51.100.90
Sep 26 10:16:40 gateway charon: 08[IKE] DPD TIMEOUT retransmission #2 for connection 'branch-office-01'
Sep 26 10:17:15 gateway charon: 09[IKE] connection 'branch-office-01' RECONNECTED to 198.51.100.90`;

  useEffect(() => {
    setLogText(sampleLogText);
    analyzeLogText(sampleLogText);
  }, []);

  const analyzeLogText = async (textToAnalyze = logText) => {
    if (!textToAnalyze.strip && !textToAnalyze.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/log/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_text: textToAnalyze })
      });
      const data = await res.json();
      setLogResult(data);
    } catch (err) {
      console.error("Log analysis error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setLogText(text);
      analyzeLogText(text);
    };
    reader.readAsText(file);
  };

  const filteredLogs = logResult?.parsed_log_entries?.filter(entry => {
    const matchesSeverity = filterSeverity === 'ALL' || entry.severity === filterSeverity;
    const matchesSearch = !searchQuery || entry.message.toLowerCase().includes(searchQuery.toLowerCase()) || entry.peer_ip.includes(searchQuery);
    return matchesSeverity && matchesSearch;
  }) || [];

  return (
    <div className="space-y-6">
      
      {/* Upload Log & Analysis Controls */}
      <div className="liquid-glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-white border border-red-500/40 shadow-sm shadow-red-500/20">
              <FileText className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">VPN Daemon & Syslog AI Analyzer</h2>
              <p className="text-xs text-slate-300">Parses strongSwan charon, Cisco ASA, OpenVPN & Fortinet logs to detect brute-force attacks and protocol errors</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setUploadedFileName(null);
                setLogText(sampleLogText);
                analyzeLogText(sampleLogText);
              }}
              className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-xs font-bold text-white border border-red-500/30 transition-all"
            >
              Load Sample Attack Log
            </button>

            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold border border-red-400/40 cursor-pointer transition-all shadow-lg shadow-red-600/30 active:scale-95">
              <Upload className="w-4 h-4 text-white" />
              <span>{uploadedFileName ? `Loaded: ${uploadedFileName}` : "Upload Log File"}</span>
              <input type="file" accept=".log,.txt,.syslog,.json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Textarea Input */}
        <div className="space-y-2">
          <textarea
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            placeholder="Paste raw VPN syslog text here (charon, openvpn, ASA syslog)..."
            className="w-full h-32 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-red-400/80 resize-none shadow-inner"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Supports charon, OpenVPN, Cisco ASA 713xxx, Fortigate & Libreswan daemons</span>
            <button
              onClick={() => analyzeLogText()}
              disabled={loading}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-white" />}
              <span>Run AI Log Audit</span>
            </button>
          </div>
        </div>
      </div>

      {logResult && (
        <>
          {/* Top Severity Summary Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="liquid-glass-panel p-5 rounded-2xl border border-red-500/40 bg-red-950/50 text-center space-y-1">
              <div className="text-[11px] font-bold text-slate-300 uppercase">Critical Threats</div>
              <div className="text-3xl font-extrabold text-white">{logResult.severity_counts.CRITICAL}</div>
              <div className="text-[10px] text-red-300">Security Alerts / Brute Force</div>
            </div>

            <div className="liquid-glass-panel p-5 rounded-2xl border border-red-500/30 bg-red-950/30 text-center space-y-1">
              <div className="text-[11px] font-bold text-slate-300 uppercase">Protocol Errors</div>
              <div className="text-3xl font-extrabold text-white">{logResult.severity_counts.ERROR}</div>
              <div className="text-[10px] text-slate-300">Proposal & Auth Mismatches</div>
            </div>

            <div className="liquid-glass-panel p-5 rounded-2xl border border-red-500/30 bg-red-950/30 text-center space-y-1">
              <div className="text-[11px] font-bold text-slate-300 uppercase">Warnings / Flapping</div>
              <div className="text-3xl font-extrabold text-white">{logResult.severity_counts.WARNING}</div>
              <div className="text-[10px] text-slate-300">DPD & Rekeying Timeouts</div>
            </div>

            <div className="liquid-glass-panel p-5 rounded-2xl border border-red-500/30 bg-red-950/30 text-center space-y-1">
              <div className="text-[11px] font-bold text-slate-300 uppercase">Total Log Lines</div>
              <div className="text-3xl font-extrabold text-white">{logResult.total_lines_parsed}</div>
              <div className="text-[10px] text-slate-300">Parsed Log Records</div>
            </div>
          </div>

          {/* AI Threat Alerts (Brute-Force & Proposal Mismatches) */}
          {logResult.threats_detected.length > 0 && (
            <div className="liquid-glass-panel p-6 rounded-2xl space-y-4 border border-red-500/50 bg-red-950/40">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span>AI Threat Detection & Intrusion Alerts</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {logResult.threats_detected.map((threat, idx) => (
                  <div key={idx} className="liquid-glass-card p-4 rounded-xl border border-red-500/40 bg-red-950/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-red-600/40 text-white border border-red-500/50">
                        {threat.type}
                      </span>
                      <span className="text-[10px] text-red-300 font-bold">Confidence: {threat.confidence}%</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{threat.title}</h4>
                    <p className="text-[11px] text-slate-200 leading-relaxed">{threat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Log Timeline Chart */}
          <div className="liquid-glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-400" />
                  <span>Visual Log Severity Timeline</span>
                </h3>
                <p className="text-xs text-slate-300">Distribution of log severity events across log line segments</p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={logResult.timeline_chart_data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <XAxis dataKey="segment" stroke="#f87171" tick={{ fontSize: 11, fill: '#ffffff' }} />
                  <YAxis stroke="#f87171" tick={{ fontSize: 11, fill: '#ffffff' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#180509', borderColor: '#ef4444', borderRadius: '12px', color: '#ffffff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#ffffff' }} />
                  <Bar dataKey="Critical" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Error" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Warning" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Info" fill="#ffffff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Plain-English Fix Recommendations */}
          <div className="liquid-glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>Plain-English Root-Cause Diagnostic & Remediation Roadmap</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {logResult.plain_english_recommendations.map((rec, idx) => (
                <div key={idx} className="liquid-glass-card p-4 rounded-xl border border-red-500/30 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-white border border-red-500/40">
                        {rec.priority}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1">{rec.issue}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      <strong>Root Cause:</strong> {rec.root_cause}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-[11px] text-white font-medium flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span>{rec.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filterable Parsed Log Explorer Table */}
          <div className="liquid-glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-sm font-bold text-white">Parsed Log Records Explorer</h3>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-red-950/80 p-1 rounded-xl border border-red-500/30 text-xs">
                  {['ALL', 'CRITICAL', 'ERROR', 'WARNING', 'INFO'].map(sev => (
                    <button
                      key={sev}
                      onClick={() => setFilterSeverity(sev)}
                      className={`px-3 py-1 font-bold rounded-lg transition-all ${filterSeverity === sev ? 'bg-red-600/40 text-white border border-red-500/50' : 'text-slate-300 hover:text-white'}`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs or IP..."
                    className="bg-red-950/60 border border-red-500/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-400 font-mono w-44"
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-red-500/20 rounded-xl border border-red-500/30 overflow-hidden font-mono text-xs">
              {filteredLogs.map((entry, idx) => (
                <div key={idx} className="p-3 bg-red-950/30 hover:bg-red-950/60 flex items-start justify-between gap-4 transition-all">
                  <div className="flex items-start gap-3">
                    <span className="text-slate-400 text-[10px] shrink-0 mt-0.5">#{entry.line_num}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded shrink-0 ${
                      entry.severity === 'CRITICAL' ? 'bg-red-600/40 text-white border border-red-500/50' :
                      entry.severity === 'ERROR' ? 'bg-rose-950 text-white border border-rose-500/40' :
                      entry.severity === 'WARNING' ? 'bg-amber-950 text-amber-200 border border-amber-500/40' :
                      'bg-slate-900 text-slate-300 border border-slate-700'
                    }`}>
                      {entry.severity}
                    </span>
                    <span className="text-white text-[11px] leading-relaxed break-all">{entry.message}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-[10px]">
                    <span className="text-slate-300 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30">{entry.daemon}</span>
                    {entry.peer_ip !== 'N/A' && (
                      <span className="text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-500/40 font-bold">{entry.peer_ip}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </>
      )}

    </div>
  );
}
