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
      <div className="liquid-glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-red-600/20 text-white border border-red-500/40 shadow-sm shadow-red-500/20">
            <Sparkles className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Explainable AI (XAI) Risk Synthesis</h2>
            <p className="text-xs text-slate-300">Transparent point attribution solving the black-box AI mystery</p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-red-950/50 border border-red-500/40 border-l-4 border-l-red-500">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>{primary_risk_summary}</span>
          </div>
          <p className="text-xs text-slate-200 mt-2 leading-relaxed">{primary_risk_detail}</p>
        </div>
      </div>

      {/* Point Attribution List (+15 pts, -14 pts, etc.) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Why this Score? Point-by-Point Breakdown */}
        <div className="liquid-glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Score Impact Attribution Tree</h3>
            <span className="text-xs font-mono text-white font-bold bg-red-600/20 px-3 py-1 rounded-lg border border-red-500/40 shadow-sm">
              Overall Score: {scoring.overall_score}/100
            </span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {point_attributions.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-all ${
                  item.numeric_impact > 0
                    ? 'bg-red-950/20 border-red-500/30 text-white'
                    : 'bg-red-950/40 border-red-500/50 text-white'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {item.numeric_impact > 0 ? (
                    <PlusCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  ) : (
                    <MinusCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-white">{item.factor}</div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-950 text-white border border-red-500/30">
                      {item.badge}
                    </span>
                  )}
                  <span
                    className={`font-mono text-sm font-extrabold px-2.5 py-1 rounded-lg ${
                      item.numeric_impact > 0
                        ? 'bg-red-600/30 text-white border border-red-500/40 shadow-sm shadow-red-500/20'
                        : 'bg-red-950 text-red-400 border border-red-500/50'
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
        <div className="liquid-glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Cumulative Score Waterfall Chart</h3>
            <p className="text-xs text-slate-300">Visualization of score increments & deductions from 50 base points</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfall_chart_data} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
                <XAxis dataKey="name" stroke="#f87171" tick={{ fontSize: 10, fill: '#ffffff' }} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#f87171" tick={{ fontSize: 11, fill: '#ffffff' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#180509', borderColor: '#ef4444', borderRadius: '12px', color: '#ffffff', fontSize: '12px' }} />
                <ReferenceLine y={50} stroke="#ffffff" strokeDasharray="3 3" label={{ value: 'Base 50', fill: '#ffffff', fontSize: 10 }} />
                <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={24}>
                  {waterfall_chart_data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.val >= 0 ? '#ffffff' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-[11px] text-slate-300 flex items-center justify-between font-medium">
            <span>Base Protocol Starting Points: <strong className="text-white">50 pts</strong></span>
            <span>Final Score: <strong className="text-white">{scoring.overall_score} pts</strong></span>
          </div>
        </div>

      </div>

      {/* Priority Remediation Roadmap */}
      <div className="liquid-glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>Priority Remediation Roadmap</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {remediation_roadmap.map((item, idx) => (
            <div key={idx} className="liquid-glass-card p-4 rounded-xl border border-red-500/30 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Target Parameter</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-950 text-white border border-red-500/40">
                    {item.priority}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{item.issue}</h4>
              </div>

              <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/30 text-xs text-white font-medium flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span>{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
