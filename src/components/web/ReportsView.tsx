import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, CheckCircle, FileSpreadsheet, FileCode } from 'lucide-react';
import { Vehicle } from '../../types/fleet';
import { TranslationDictionary } from '../../translations/i18n';

interface ReportsViewProps {
  vehicles: Vehicle[];
  t: TranslationDictionary;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ vehicles, t }) => {
  const [reportType, setReportType] = useState('mileage');
  const [dateRange, setDateRange] = useState('last_7_days');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);

  const handleGenerate = (format: 'pdf' | 'csv' | 'xlsx') => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedReport({
        id: `rep_${Date.now()}`,
        format,
        title: `${reportType.toUpperCase()} Audit Report - ${dateRange}`,
        generatedAt: new Date().toISOString(),
        rowsCount: vehicles.length * 14,
        fileSize: '2.4 MB'
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/40 rounded-[32px] p-6 border border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div className="border-l-2 border-emerald-500 pl-4 py-1">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">
            Data Extraction & Export
          </p>
          <h2 className="text-3xl font-black italic tracking-tight text-white">
            {t.nav.reports}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Generate formatted PDF, Excel XLSX, and CSV exports for fleet mileage, fuel consumption, and safety compliance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-zinc-900/40 border border-zinc-800 rounded-[32px] p-6 shadow-2xl space-y-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Configure Report</h4>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Report Subject
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-white"
            >
              <option value="mileage">Daily Mileage & Utilization</option>
              <option value="overspeed">Overspeed & Safety Incidents</option>
              <option value="geofence">Geofence Entry & Exit Audit</option>
              <option value="coldchain">Cold-Chain Temperature Logs</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Time Period
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-white"
            >
              <option value="today">Today (Real-Time)</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
            </select>
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => handleGenerate('pdf')}
              disabled={isGenerating}
              className="w-full py-3 rounded-2xl bg-white hover:bg-emerald-400 text-black text-xs font-black transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Compiling Dataset...' : 'Generate PDF Report'}</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleGenerate('xlsx')}
                className="py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold border border-zinc-800"
              >
                Export XLSX
              </button>
              <button
                onClick={() => handleGenerate('csv')}
                className="py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold border border-zinc-800"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-zinc-900/40 border border-zinc-800 rounded-[32px] p-6 shadow-2xl space-y-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Generated Document Archives
          </h4>

          {generatedReport ? (
            <div className="p-5 rounded-[28px] bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="text-sm font-extrabold text-white">{generatedReport.title}</h5>
                  <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                    {generatedReport.fileSize} • {generatedReport.rowsCount} records processed
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold uppercase">
                READY ({generatedReport.format})
              </span>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 text-xs font-semibold">
              Select report options on the left to export asynchronous fleet analytics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
