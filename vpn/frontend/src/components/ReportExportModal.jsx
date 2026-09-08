import React, { useState } from 'react';
import { FileText, Download, Printer, CheckCircle, ExternalLink } from 'lucide-react';

export default function ReportExportModal({ data }) {
  const [reportType, setReportType] = useState('technical');
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReport = async (type) => {
    setLoading(true);
    setReportType(type);
    try {
      const res = await fetch('/api/reports/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_data: data,
          report_type: type
        })
      });
      const html = await res.text();
      setPreviewHtml(html);
    } catch (err) {
      console.error("Report fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (content, fileName, contentType) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  const handleDownloadHtml = () => {
    downloadFile(previewHtml || "<html></html>", `IPsec_Security_Report_${reportType.toUpperCase()}_${data.vpn_id}.html`, "text/html");
  };

  const handleDownloadJson = () => {
    downloadFile(JSON.stringify(data, null, 2), `IPsec_Assessment_Data_${data.vpn_id}.json`, "application/json");
  };

  const handlePrintPdf = () => {
    const win = window.open("", "_blank");
    win.document.write(previewHtml);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  React.useEffect(() => {
    if (data) fetchReport('technical');
  }, [data]);

  return (
    <div className="space-y-6">
      
      {/* Controls Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Security Assessment Report Exporter</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Dual-tier automated report generator (Executive vs Technical)</p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => fetchReport('technical')}
              className={`px-3 py-1.5 font-medium rounded-lg transition-all ${reportType === 'technical' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Technical Report
            </button>
            <button
              onClick={() => fetchReport('executive')}
              className={`px-3 py-1.5 font-medium rounded-lg transition-all ${reportType === 'executive' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Executive Report
            </button>
          </div>

          <button
            onClick={handleDownloadHtml}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Download HTML</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Raw JSON</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-medium transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Live HTML Preview Box */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between px-2 text-xs text-slate-400">
          <span>Live Document Preview ({reportType.toUpperCase()})</span>
          <span>Target Endpoint: {data.vpn_id}</span>
        </div>

        <div className="w-full h-[600px] rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Generating Report Template...
            </div>
          ) : (
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full border-none"
              title="Report Preview"
            />
          )}
        </div>
      </div>

    </div>
  );
}
