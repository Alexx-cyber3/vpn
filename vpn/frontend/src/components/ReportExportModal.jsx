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
      <div className="liquid-glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-400" />
            <span>Security Assessment Report Exporter</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">Dual-tier automated report generator (Executive vs Technical)</p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <div className="flex bg-red-950/80 p-1 rounded-xl border border-red-500/30 text-xs">
            <button
              onClick={() => fetchReport('technical')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all ${reportType === 'technical' ? 'bg-red-600/30 text-white border border-red-500/40 shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              Technical Report
            </button>
            <button
              onClick={() => fetchReport('executive')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all ${reportType === 'executive' ? 'bg-red-600/30 text-white border border-red-500/40 shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              Executive Report
            </button>
          </div>

          <button
            onClick={handleDownloadHtml}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-xs font-bold text-white border border-red-500/30 transition-all"
          >
            <Download className="w-4 h-4 text-red-400" />
            <span>Download HTML</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-xs font-bold text-white border border-red-500/30 transition-all"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export Raw JSON</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold border border-red-400/40 transition-all shadow-lg shadow-red-600/30 active:scale-95"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Live HTML Preview Box */}
      <div className="liquid-glass-panel p-4 rounded-2xl space-y-2">
        <div className="flex items-center justify-between px-2 text-xs text-slate-300 font-medium">
          <span>Live Document Preview ({reportType.toUpperCase()})</span>
          <span>Target Endpoint: {data.vpn_id}</span>
        </div>

        <div className="w-full h-[600px] rounded-xl bg-red-950/90 border border-red-500/30 overflow-hidden shadow-inner">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-white font-bold">
              Generating Report Template...
            </div>
          ) : (
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full border-none bg-white"
              title="Report Preview"
            />
          )}
        </div>
      </div>

    </div>
  );
}
