import React from 'react';
import { ReportConfig } from '../../../utils/reportGenerator';
import {
  FileText,
  Calendar,
  Gauge,
  ShieldAlert,
  Fuel,
  MapPin,
  Thermometer,
  Wrench,
  BarChart3,
  Sliders,
  Download,
  FileSpreadsheet,
  FileCode,
  Eye,
  Sparkles,
  Printer
} from 'lucide-react';

interface ReportConfigPanelProps {
  config: ReportConfig;
  isGenerating: boolean;
  onConfigChange: (newConfig: Partial<ReportConfig>) => void;
  onGenerateReport: (format?: 'pdf' | 'xlsx' | 'csv' | 'json' | 'preview') => void;
}

const REPORT_TYPES = [
  {
    id: 'mileage',
    title: 'Daily Mileage & Utilization',
    desc: 'Odometer deltas, operating engine hours, idle runtime, and asset utilization rates.',
    icon: <Gauge className="w-4 h-4" />,
    color: 'emerald'
  },
  {
    id: 'trips',
    title: 'Trip Log & Route Chronology',
    desc: 'Detailed point-to-point journeys, departure/arrival timestamps, stops, and speeds.',
    icon: <FileText className="w-4 h-4" />,
    color: 'indigo'
  },
  {
    id: 'safety',
    title: 'Eco-Driving & Driver Safety',
    desc: 'Overspeeding violations, harsh braking, aggressive cornering, and safety scores.',
    icon: <ShieldAlert className="w-4 h-4" />,
    color: 'amber'
  },
  {
    id: 'fuel',
    title: 'Fuel Consumption & Costs',
    desc: 'Estimated fuel burn, L/100km fleet efficiency, refuel logs, and USD/MAD expenditure.',
    icon: <Fuel className="w-4 h-4" />,
    color: 'cyan'
  },
  {
    id: 'geofence',
    title: 'Geofence Entry & Exit Audit',
    desc: 'Spatial zone visits, terminal dwell durations, and perimeter boundary compliance.',
    icon: <MapPin className="w-4 h-4" />,
    color: 'purple'
  },
  {
    id: 'coldchain',
    title: 'Cold-Chain & HACCP Excursions',
    desc: 'Reefer temperature telemetry, threshold breach excursions, and compliance certificates.',
    icon: <Thermometer className="w-4 h-4" />,
    color: 'blue'
  },
  {
    id: 'maintenance',
    title: 'Predictive Maintenance & Health',
    desc: 'Upcoming service intervals, overdue maintenance, and active OBD-II diagnostic DTCs.',
    icon: <Wrench className="w-4 h-4" />,
    color: 'rose'
  },
  {
    id: 'executive_summary',
    title: 'Fleet 360° Executive Summary',
    desc: 'Consolidated executive-ready dashboard metrics, KPIs, and operational health.',
    icon: <BarChart3 className="w-4 h-4" />,
    color: 'yellow'
  }
];

export const ReportConfigPanel: React.FC<ReportConfigPanelProps> = ({
  config,
  isGenerating,
  onConfigChange,
  onGenerateReport
}) => {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-[28px] p-5 shadow-2xl space-y-5">
      {/* 2. REPORT TEMPLATE TYPE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-4 h-4" />
            </span>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300">
              2. Report Subject & Analytics Type
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {REPORT_TYPES.map((type) => {
            const isSelected = config.reportType === type.id;
            return (
              <div
                key={type.id}
                onClick={() => onConfigChange({ reportType: type.id as any })}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 select-none group ${
                  isSelected
                    ? 'bg-zinc-900 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500'
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`p-2 rounded-xl ${
                      isSelected
                        ? 'bg-emerald-500 text-black'
                        : 'bg-zinc-900 text-zinc-400 group-hover:text-white'
                    }`}
                  >
                    {type.icon}
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Active
                    </span>
                  )}
                </div>

                <div>
                  <h5 className="text-xs font-black text-white leading-snug">{type.title}</h5>
                  <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {type.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. TIMEFRAME & CUSTOM RANGE */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-4 h-4" />
            </span>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300">
              3. Time Period & Horizon
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'last_7_days', label: 'Last 7 Days' },
            { id: 'last_14_days', label: 'Last 14 Days' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
            { id: 'custom', label: 'Custom Range' }
          ].map((period) => {
            const isSelected = config.timePeriod === period.id;
            return (
              <button
                key={period.id}
                type="button"
                onClick={() => onConfigChange({ timePeriod: period.id as any })}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                  isSelected
                    ? 'bg-emerald-500 text-black font-black shadow-md'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                {period.label}
              </button>
            );
          })}
        </div>

        {/* Custom Range Inputs */}
        {config.timePeriod === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={config.customStartDate || ''}
                onChange={(e) => onConfigChange({ customStartDate: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                End Date
              </label>
              <input
                type="date"
                value={config.customEndDate || ''}
                onChange={(e) => onConfigChange({ customEndDate: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. ADVANCED TELEMETRY PARAMETERS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-4 h-4" />
            </span>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300">
              4. Calculation Parameters & Filters
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Idle Fuel Analysis</p>
              <p className="text-[10px] text-zinc-400">Compute engine idle waste</p>
            </div>
            <input
              type="checkbox"
              checked={config.includeIdleAnalysis}
              onChange={(e) => onConfigChange({ includeIdleAnalysis: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-white">Fuel Cost Unit ($/L)</label>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                ${config.fuelPricePerLiter.toFixed(2)}
              </span>
            </div>
            <input
              type="number"
              step="0.05"
              min="0.5"
              max="5.0"
              value={config.fuelPricePerLiter}
              onChange={(e) => onConfigChange({ fuelPricePerLiter: parseFloat(e.target.value) || 1.35 })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-white">Speed Limit Trigger</label>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                {config.speedThresholdKmH} km/h
              </span>
            </div>
            <input
              type="number"
              step="5"
              min="60"
              max="160"
              value={config.speedThresholdKmH}
              onChange={(e) => onConfigChange({ speedThresholdKmH: parseInt(e.target.value) || 90 })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 5. GENERATE & EXPORT CONTROLS */}
      <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onGenerateReport('preview')}
          disabled={isGenerating}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              <span>Compiling Fleet Telemetry...</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Generate & View Live Report</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <button
            type="button"
            onClick={() => onGenerateReport('pdf')}
            disabled={isGenerating}
            className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold border border-zinc-800 flex items-center justify-center gap-2 transition-colors"
            title="Download PDF format"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={() => onGenerateReport('xlsx')}
            disabled={isGenerating}
            className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold border border-zinc-800 flex items-center justify-center gap-2 transition-colors"
            title="Download Excel spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>XLSX / CSV</span>
          </button>

          <button
            type="button"
            onClick={() => onGenerateReport('json')}
            disabled={isGenerating}
            className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold border border-zinc-800 flex items-center justify-center gap-2 transition-colors"
            title="Download JSON Telemetry"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
