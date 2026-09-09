import React from 'react';
import { CompiledReportData, downloadReportCsv, downloadReportJson } from '../../../utils/reportGenerator';
import {
  FileText,
  Download,
  Calendar,
  Trash2,
  Eye,
  CheckCircle,
  FileSpreadsheet,
  FileCode,
  Clock,
  Car,
  Layers,
  Sparkles
} from 'lucide-react';

export interface ArchivedReportItem {
  id: string;
  title: string;
  reportType: string;
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  scopeSummary: string;
  periodLabel: string;
  generatedAt: string;
  fileSize: string;
  recordsCount: number;
  data: CompiledReportData;
}

interface ReportArchiveListProps {
  archives: ArchivedReportItem[];
  onViewReport: (report: CompiledReportData) => void;
  onDeleteArchive: (id: string) => void;
}

export const ReportArchiveList: React.FC<ReportArchiveListProps> = ({
  archives,
  onViewReport,
  onDeleteArchive
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-5 shadow-sm dark:shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <FileText className="w-4 h-4" />
            </span>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-zinc-300">
              Generated Reports Archive
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Access, download, and review previously compiled fleet audits and analytical exports.
          </p>
        </div>

        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
          {archives.length} Archives
        </span>
      </div>

      {archives.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 space-y-2">
          <FileText className="w-8 h-8 text-slate-400 dark:text-zinc-600 mx-auto" />
          <p className="text-xs font-bold text-slate-700 dark:text-zinc-400">No reports generated yet</p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-500 max-w-sm mx-auto">
            Select your fleet scope and configure analytics options above to compile instant audits.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {archives.map((item) => {
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between gap-3 shadow-sm dark:shadow-md group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-2 rounded-xl text-xs ${
                          item.format === 'pdf'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : item.format === 'xlsx' || item.format === 'csv'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {item.format === 'pdf' ? (
                          <FileText className="w-4 h-4" />
                        ) : item.format === 'xlsx' || item.format === 'csv' ? (
                          <FileSpreadsheet className="w-4 h-4" />
                        ) : (
                          <FileCode className="w-4 h-4" />
                        )}
                      </span>
                      <div>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          {item.format.toUpperCase()} EXPORT
                        </span>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white leading-snug line-clamp-1">
                          {item.title}
                        </h5>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteArchive(item.id)}
                      className="text-slate-400 dark:text-zinc-600 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition-colors"
                      title="Delete archive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-1 text-[11px] text-slate-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Car className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                      <span className="truncate">{item.scopeSummary}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                      <span>{item.periodLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-500">
                  <span>
                    {item.fileSize} • {item.recordsCount} records
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewReport(item.data)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 font-bold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>View</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (item.format === 'csv' || item.format === 'xlsx') {
                          downloadReportCsv(item.data);
                        } else {
                          downloadReportJson(item.data);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-400 hover:text-black border border-emerald-500/30 font-bold flex items-center gap-1 transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
