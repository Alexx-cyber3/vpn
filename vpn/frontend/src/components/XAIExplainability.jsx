import React from 'react';
import { Sparkles, AlertTriangle, PlusCircle, MinusCircle, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

export default function XAIExplainability({ data }) {
  if (!data || !data.xai) return null;

  const { xai, scoring } = data;
  const { point_attributions, primary_risk_summary, primary_risk_detail, remediation_roadmap, waterfall_chart_data } = xai;

  return (
    <div className="space-y-6">
      
      {/* Primary Risk & XAI Synthesis Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Explainable AI (XAI) Risk Synthesis</h2>
            <p className="text-xs text-slate-400">Transparent point attribution solving the black-box AI mystery</p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 border-l-4 border-l-cyan-400">
          <div className="text-sm font-bold text-cyan-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>{primary_risk_summary}</span>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">{primary_risk_detail}</p>
        </div>
      </div>

      {/* Point Attribution List (+15 pts, -14 pts, etc.) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Why this Score? Point-by-Point Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Score Impact Attribution Tree</h3>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
              Overall Score: {scoring.overall_score}/100
            </span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {point_attributions.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-all ${
                  item.numeric_impact > 0
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200'
                    : 'bg-rose-500/5 border-rose-500/20 text-slate-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {item.numeric_impact > 0 ? (
                    <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <MinusCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-100">{item.factor}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-900 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                  <span
                    className={`font-mono text-sm font-extrabold px-2.5 py-1 rounded-lg ${
                      item.numeric_impact > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {item.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Impact Waterfall Visualization */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Cumulative Score Waterfall Chart</h3>
            <p className="text-xs text-slate-400">Visualization of score increments & deductions from 50 base points</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfall_chart_data} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
                <ReferenceLine y={50} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Base 50', fill: '#3b82f6', fontSize: 10 }} />
                <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={24}>
                  {waterfall_chart_data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.val >= 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Base Protocol Starting Points: <strong>50 pts</strong></span>
            <span>Final Score: <strong>{scoring.overall_score} pts</strong></span>
          </div>
        </div>

      </div>

      {/* Priority Remediation Roadmap */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Priority Remediation Roadmap</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {remediation_roadmap.map((item, idx) => (
            <div key={idx} className="glass-card p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Target Parameter</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-900 text-amber-400 border border-slate-700">
                    {item.priority}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{item.issue}</h4>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300 flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
