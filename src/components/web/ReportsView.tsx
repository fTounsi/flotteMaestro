import React, { useState, useEffect } from 'react';
import { Vehicle, Trip, Alert, Geofence, Organization, User } from '../../types/fleet';
import { TranslationDictionary } from '../../translations/i18n';
import { FleetAnalyticsDashboard } from './reports/analytics/FleetAnalyticsDashboard';
import { ReportVehicleSelector } from './reports/ReportVehicleSelector';
import { ReportConfigPanel } from './reports/ReportConfigPanel';
import { ReportLivePreview } from './reports/ReportLivePreview';
import { ReportArchiveList, ArchivedReportItem } from './reports/ReportArchiveList';
import {
  ReportConfig,
  CompiledReportData,
  compileFleetReport,
  downloadReportCsv,
  downloadReportJson
} from '../../utils/reportGenerator';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle,
  FileSpreadsheet,
  FileCode,
  Layers,
  Sparkles,
  BarChart3,
  Car,
  Clock,
  Printer,
  ShieldCheck,
  Fuel,
  Wrench,
  Gauge,
  TrendingUp,
  PieChart
} from 'lucide-react';

interface ReportsViewProps {
  vehicles: Vehicle[];
  trips?: Trip[];
  alerts?: Alert[];
  geofences?: Geofence[];
  currentOrg?: Organization;
  currentUser?: User | null;
  t: TranslationDictionary;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  vehicles,
  trips = [],
  alerts = [],
  geofences = [],
  currentOrg,
  currentUser,
  t
}) => {
  const orgName = currentOrg?.name || 'Atlas Express Logistics';

  // Primary Navigation Mode: Analytics Dashboard vs Custom Report Studio
  const [reportMode, setReportMode] = useState<'analytics' | 'studio'>('analytics');

  // Report Configuration State
  const [config, setConfig] = useState<ReportConfig>({
    reportType: 'mileage',
    vehicleScope: 'all',
    selectedVehicleIds: vehicles.map((v) => v.id),
    selectedFleetTag: vehicles[0]?.fleetName || '',
    timePeriod: 'last_7_days',
    includeIdleAnalysis: true,
    includeFuelCosts: true,
    includeDriverDetails: true,
    fuelPricePerLiter: 1.35,
    speedThresholdKmH: 90
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [compiledReport, setCompiledReport] = useState<CompiledReportData | null>(null);

  // Pre-seed some realistic archives
  const [archives, setArchives] = useState<ArchivedReportItem[]>(() => {
    // Generate an initial default compiled report for the archive list
    const initialCompiled = compileFleetReport(
      {
        reportType: 'mileage',
        vehicleScope: 'all',
        selectedVehicleIds: vehicles.map((v) => v.id),
        timePeriod: 'last_7_days',
        includeIdleAnalysis: true,
        includeFuelCosts: true,
        includeDriverDetails: true,
        fuelPricePerLiter: 1.35,
        speedThresholdKmH: 90
      },
      vehicles,
      trips,
      alerts,
      geofences,
      orgName
    );

    const safetyCompiled = compileFleetReport(
      {
        reportType: 'safety',
        vehicleScope: 'selected',
        selectedVehicleIds: vehicles.slice(0, 3).map((v) => v.id),
        timePeriod: 'last_14_days',
        includeIdleAnalysis: true,
        includeFuelCosts: true,
        includeDriverDetails: true,
        fuelPricePerLiter: 1.35,
        speedThresholdKmH: 90
      },
      vehicles,
      trips,
      alerts,
      geofences,
      orgName
    );

    return [
      {
        id: 'arch_01',
        title: 'Weekly Fleet Utilization & Mileage Audit',
        reportType: 'mileage',
        format: 'pdf',
        scopeSummary: `All Fleet Vehicles (${vehicles.length} total)`,
        periodLabel: 'Last 7 Days',
        generatedAt: new Date(Date.now() - 86400000).toISOString(),
        fileSize: '2.8 MB',
        recordsCount: vehicles.length * 14,
        data: initialCompiled
      },
      {
        id: 'arch_02',
        title: 'Eco-Driving & Speed Violations Audit',
        reportType: 'safety',
        format: 'xlsx',
        scopeSummary: '3 Selected Vehicles (12345-A-1, 98765-A-1...)',
        periodLabel: 'Last 14 Days',
        generatedAt: new Date(Date.now() - 172800000).toISOString(),
        fileSize: '1.4 MB',
        recordsCount: 42,
        data: safetyCompiled
      }
    ];
  });

  // Auto-compile default preview on first load so user immediately sees rich data
  useEffect(() => {
    if (!compiledReport) {
      const defaultReport = compileFleetReport(config, vehicles, trips, alerts, geofences, orgName);
      setCompiledReport(defaultReport);
    }
  }, []);

  const handleConfigChange = (newConfig: Partial<ReportConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      return updated;
    });
  };

  const handleGenerateReport = (format: 'pdf' | 'xlsx' | 'csv' | 'json' | 'preview' = 'preview') => {
    setIsGenerating(true);
    setTimeout(() => {
      const freshReport = compileFleetReport(config, vehicles, trips, alerts, geofences, orgName);
      setCompiledReport(freshReport);
      setIsGenerating(false);

      // Add to archive
      const newArchive: ArchivedReportItem = {
        id: `arch_${Date.now()}`,
        title: freshReport.title,
        reportType: config.reportType,
        format: format === 'preview' ? 'pdf' : format,
        scopeSummary: freshReport.scopeSummary,
        periodLabel: freshReport.periodLabel,
        generatedAt: freshReport.generatedAt,
        fileSize: `${(freshReport.vehicleRows.length * 0.35 + 0.8).toFixed(1)} MB`,
        recordsCount: freshReport.vehicleRows.length + freshReport.eventRows.length,
        data: freshReport
      };

      setArchives((prev) => [newArchive, ...prev]);

      // Direct file downloads if format specified
      if (format === 'csv' || format === 'xlsx') {
        downloadReportCsv(freshReport);
      } else if (format === 'json') {
        downloadReportJson(freshReport);
      }
    }, 600);
  };

  const handleDeleteArchive = (id: string) => {
    setArchives((prev) => prev.filter((a) => a.id !== id));
  };

  const handleViewArchivedReport = (reportData: CompiledReportData) => {
    setCompiledReport(reportData);
    // Smooth scroll to preview
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* HERO HEADER & NAVIGATION TABS */}
      <div className="bg-white dark:bg-zinc-900/40 rounded-[32px] p-6 border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm dark:shadow-2xl">
        <div className="border-l-2 border-emerald-500 pl-4 py-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 font-bold">
              Telematics Intelligence & Compliance
            </p>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
              {reportMode === 'analytics' ? 'Recharts Intelligence Hub' : 'Report Studio Pro'}
            </span>
          </div>
          <h2 className="text-3xl font-black italic tracking-tight text-slate-900 dark:text-white mt-1">
            {reportMode === 'analytics' ? 'Fleet Analytics Dashboard' : t.nav.reports}
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl">
            {reportMode === 'analytics'
              ? 'Visualize vehicle utilization rates, engine idle time distribution, and daily mileage across operational vehicle groups.'
              : 'Compile rich operational audits for all fleet vehicles or customized vehicle cohorts with multi-format exports.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-950 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800 self-stretch md:self-auto">
          <button
            type="button"
            onClick={() => setReportMode('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              reportMode === 'analytics'
                ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setReportMode('studio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              reportMode === 'studio'
                ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Report Studio & Exports</span>
          </button>
        </div>
      </div>

      {/* VIEW CONTENT */}
      {reportMode === 'analytics' ? (
        <FleetAnalyticsDashboard
          vehicles={vehicles}
          trips={trips}
          alerts={alerts}
          geofences={geofences}
          currentOrg={currentOrg}
          currentUser={currentUser}
          t={t}
        />
      ) : (
        <div className="space-y-6">
          {/* 1. VEHICLE SCOPE SELECTOR (ALL FLEET VS SPECIFIC VEHICLES) */}
          <ReportVehicleSelector
            vehicles={vehicles}
            vehicleScope={config.vehicleScope}
            selectedVehicleIds={config.selectedVehicleIds}
            selectedFleetTag={config.selectedFleetTag}
            onScopeChange={(scope) => handleConfigChange({ vehicleScope: scope })}
            onSelectVehicleIds={(ids) => handleConfigChange({ selectedVehicleIds: ids })}
            onFleetTagChange={(tag) => handleConfigChange({ selectedFleetTag: tag })}
          />

          {/* 2. REPORT TEMPLATE & TIMEFRAME CONFIGURATION PANEL */}
          <ReportConfigPanel
            config={config}
            isGenerating={isGenerating}
            onConfigChange={handleConfigChange}
            onGenerateReport={handleGenerateReport}
          />

          {/* 3. LIVE COMPILED REPORT PREVIEW & ANALYTICS VISUALIZER */}
          {compiledReport && (
            <ReportLivePreview
              report={compiledReport}
              orgName={orgName}
            />
          )}

          {/* 4. HISTORICAL ARCHIVES LIST */}
          <ReportArchiveList
            archives={archives}
            onViewReport={handleViewArchivedReport}
            onDeleteArchive={handleDeleteArchive}
          />
        </div>
      )}
    </div>
  );
};
