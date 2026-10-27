import React from 'react';

export default function GlassTable({ headers = [], rows = [], renderRow, className = '' }) {
  return (
    <div className={`liquid-glass-panel rounded-2xl border border-red-500/30 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-red-950/80 text-white uppercase font-bold border-b border-red-500/30">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="py-3.5 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-red-500/20 text-white">
            {rows.map((row, idx) => (
              <React.Fragment key={idx}>
                {renderRow ? renderRow(row, idx) : (
                  <tr className="hover:bg-red-950/40 transition-all">
                    {Object.values(row).map((val, cellIdx) => (
                      <td key={cellIdx} className="py-3.5 px-4">{String(val)}</td>
                    ))}
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
