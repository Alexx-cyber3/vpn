import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

export default function DataChart({ data = [], layout = 'vertical', height = 260, xKey = 'name', yKey = 'score', referenceY, className = '' }) {
  return (
    <div className={`h-${height} w-full pt-2 ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout={layout} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
          <XAxis
            type={layout === 'vertical' ? 'number' : 'category'}
            dataKey={layout === 'vertical' ? undefined : xKey}
            stroke="#f87171"
            tick={{ fontSize: 11, fill: '#ffffff' }}
          />
          <YAxis
            type={layout === 'vertical' ? 'category' : 'number'}
            dataKey={layout === 'vertical' ? xKey : undefined}
            stroke="#f87171"
            tick={{ fontSize: 11, fill: '#ffffff' }}
            width={layout === 'vertical' ? 140 : 40}
          />
          <Tooltip contentStyle={{ backgroundColor: '#180509', borderColor: '#ef4444', borderRadius: '12px', color: '#ffffff', fontSize: '12px' }} />
          {referenceY && <ReferenceLine y={referenceY} stroke="#ffffff" strokeDasharray="3 3" />}
          <Bar dataKey={yKey} radius={[4, 4, 0, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || (entry.val && entry.val < 0 ? '#ef4444' : '#ffffff')} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
