import React, { useState } from 'react';
import { CompiledReportData, downloadReportCsv, downloadReportJson } from '../../../utils/reportGenerator';
import {
  FileText,
  Download,
  Printer,
  Search,
  ArrowUpDown,
  Car,
  Fuel,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  ExternalLink,
  Table,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Building2,
  FileSpreadsheet
} from 'lucide-react';

interface ReportLivePreviewProps {
  report: CompiledReportData;
  orgName: string;
  onClose?: () => void;
}

export const ReportLivePreview: React.FC<ReportLivePreviewProps> = ({
  report,
  orgName,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'vehicles' | 'events' | 'document'>('summary');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'totalDistanceKm' | 'fuelConsumedLiters' | 'safetyScore' | 'plate'>('totalDistanceKm');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredVehicles = report.vehicleRows
    .filter((v) => {
      const q = searchTerm.toLowerCase();
      return (
        v.plate.toLowerCase().includes(q) ||
        v.makeModel.toLowerCase().includes(q) ||
        v.driverName.toLowerCase().includes(q) ||
        v.fleetGroup.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (field: 'totalDistanceKm' | 'fuelConsumedLiters' | 'safetyScore' | 'plate') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Find peak day in daily trend
  const maxDailyDistance = Math.max(...report.dailyTrend.map((d) => d.distanceKm), 1);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-6 shadow-2xl space-y-6">
      {/* HEADER WITH CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-widest">
              Live Compiled Analytics
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-white">{report.title}</h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
            <span>
              <strong className="text-zinc-200">Scope:</strong> {report.scopeSummary}
            </span>
            <span>•</span>
            <span>
              <strong className="text-zinc-200">Period:</strong> {report.periodLabel}
            </span>
            <span>•</span>
            <span>
              <strong className="text-zinc-200">Generated:</strong>{' '}
              {new Date(report.generatedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={() => downloadReportCsv(report)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => downloadReportJson(report)}
            className="px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Distance</span>
            <Car className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-white font-mono">
              {report.summary.totalDistanceKm.toLocaleString()}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Kilometers logged</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Engine Hours</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-white font-mono">
              {report.summary.totalEngineHours.toLocaleString()}h
            </p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              Idle: {report.summary.totalIdleHours}h
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Fuel Burned</span>
            <Fuel className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-white font-mono">
              {report.summary.totalFuelLiters.toLocaleString()}L
            </p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              ${report.summary.totalFuelCostUsd.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Fleet Efficiency</span>
            <Fuel className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-white font-mono">
              {report.summary.avgFleetEfficiencyL100Km}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Liters / 100km</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Safety Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              {report.summary.fleetSafetyScore}%
            </p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Eco-Driving Grade</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Incidents</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-amber-400 font-mono">
              {report.summary.totalSafetyIncidents}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              {report.summary.totalGeofenceEvents} Geofence events
            </p>
          </div>
        </div>
      </div>

      {/* DAILY TREND VISUALIZER BAR CHART */}
      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            Daily Distance & Operational Activity Trend
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            {report.dailyTrend.length} Days Sampled
          </span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 pt-2 items-end h-24">
          {report.dailyTrend.map((day, idx) => {
            const heightPercent = Math.max(15, Math.round((day.distanceKm / maxDailyDistance) * 100));
            return (
              <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end group">
                <div className="text-[9px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {day.distanceKm}km
                </div>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full bg-emerald-500/80 group-hover:bg-emerald-400 rounded-md transition-all relative"
                  title={`${day.date}: ${day.distanceKm} km, ${day.fuelLiters}L fuel, ${day.incidents} incidents`}
                />
                <span className="text-[9px] text-zinc-500 font-mono truncate w-full text-center">
                  {day.date.split(' ')[1] || day.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* PREVIEW SUB-NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`py-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'summary'
                ? 'border-emerald-500 text-emerald-400 font-black'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Vehicle Breakdown ({report.vehicleRows.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`py-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'events'
                ? 'border-emerald-500 text-emerald-400 font-black'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Event & Incident Logs ({report.eventRows.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('document')}
            className={`py-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'document'
                ? 'border-emerald-500 text-emerald-400 font-black'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Printable Document Sheet</span>
          </button>
        </div>

        {activeTab === 'summary' && (
          <div className="relative w-48 mb-1">
            <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-2 py-1 text-[11px] text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>

      {/* TAB 1: VEHICLE BREAKDOWN TABLE */}
      {activeTab === 'summary' && (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-[10px] font-mono font-bold uppercase text-zinc-400 border-b border-zinc-800">
              <tr>
                <th
                  onClick={() => toggleSort('plate')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Vehicle / Model</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Fleet Group</th>
                <th className="py-3 px-3">Assigned Driver</th>
                <th
                  onClick={() => toggleSort('totalDistanceKm')}
                  className="py-3 px-3 cursor-pointer hover:text-white text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Distance (km)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Engine / Idle</th>
                <th
                  onClick={() => toggleSort('fuelConsumedLiters')}
                  className="py-3 px-3 cursor-pointer hover:text-white text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Fuel (L) & Cost</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Avg L/100km</th>
                <th
                  onClick={() => toggleSort('safetyScore')}
                  className="py-3 px-3 cursor-pointer hover:text-white text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Safety Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Incidents</th>
                <th className="py-3 px-3 text-center">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 bg-zinc-950/40 font-mono text-[11px]">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-zinc-500 font-sans">
                    No vehicle records matching search filter.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((row) => (
                  <tr key={row.vehicleId} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-2.5 px-3">
                      <div>
                        <span className="font-bold text-white text-xs">{row.plate}</span>
                        <p className="text-[10px] text-zinc-400 font-sans">{row.makeModel}</p>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 font-sans text-xs">
                      {row.fleetGroup}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-300 font-sans text-xs">
                      {row.driverName}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">
                      {row.totalDistanceKm.toLocaleString()} km
                    </td>
                    <td className="py-2.5 px-3 text-right text-zinc-400">
                      {row.engineHours}h / {row.idleMinutes}m
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-cyan-400 font-bold">{row.fuelConsumedLiters} L</span>
                      <span className="text-zinc-500 text-[10px] block font-sans">
                        ${row.fuelCostUsd}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-zinc-300">
                      {row.avgConsumptionL100Km}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          row.safetyScore >= 90
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : row.safetyScore >= 75
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {row.safetyScore}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      {row.overspeedIncidents + row.harshBrakeIncidents > 0 ? (
                        <span className="text-amber-400">
                          {row.overspeedIncidents + row.harshBrakeIncidents}
                        </span>
                      ) : (
                        <span className="text-zinc-600">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[9px] uppercase font-sans font-bold px-1.5 py-0.5 rounded ${
                          row.maintenanceStatus === 'good'
                            ? 'bg-emerald-950 text-emerald-400'
                            : row.maintenanceStatus === 'due_soon'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-rose-950 text-rose-400'
                        }`}
                      >
                        {row.maintenanceStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: GRANULAR EVENTS & TRIPS LOG */}
      {activeTab === 'events' && (
        <div className="space-y-2">
          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-[10px] font-mono font-bold uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Vehicle Plate</th>
                  <th className="py-3 px-3">Event Type</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3 text-right">Telemetry Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 bg-zinc-950/40 text-xs">
                {report.eventRows.map((evt) => (
                  <tr key={evt.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400">
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                      {evt.vehiclePlate}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-lg ${
                          evt.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : evt.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        }`}
                      >
                        {evt.eventType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-white font-medium">{evt.description}</td>
                    <td className="py-2.5 px-3 text-zinc-400">{evt.location}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-200">
                      {evt.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRINTABLE HIGH-FIDELITY DOCUMENT PREVIEW */}
      {activeTab === 'document' && (
        <div className="bg-white text-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-300 space-y-6 max-w-4xl mx-auto font-sans print:shadow-none print:border-none print:p-0">
          {/* Document Header */}
          <div className="flex justify-between items-start border-b border-zinc-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-black text-sm">
                  FL
                </div>
                <span className="text-xl font-black tracking-tight text-zinc-950">{orgName}</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Fleet Telematics & Operational Audit Office</p>
              <p className="text-xs text-zinc-500">Casablanca Logistics Command Hub</p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[10px] font-mono font-bold uppercase tracking-wider">
                Official Fleet Audit
              </span>
              <h2 className="text-lg font-black text-zinc-950 mt-1">{report.title}</h2>
              <p className="text-xs font-mono text-zinc-600">ID: {report.id}</p>
              <p className="text-xs text-zinc-500">Date: {new Date(report.generatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Scope and Date Summary Banner */}
          <div className="grid grid-cols-3 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Fleet Cohort Scope</span>
              <p className="font-bold text-zinc-900 mt-0.5">{report.scopeSummary}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Audit Horizon</span>
              <p className="font-bold text-zinc-900 mt-0.5">{report.periodLabel}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Active Vehicles Analyzed</span>
              <p className="font-bold text-zinc-900 mt-0.5">{report.vehicleRows.length} Vehicles</p>
            </div>
          </div>

          {/* Aggregated Totals Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200">
              <span className="text-[9px] uppercase font-bold text-zinc-600 block">Total Distance</span>
              <p className="text-lg font-black font-mono text-zinc-950">
                {report.summary.totalDistanceKm.toLocaleString()} km
              </p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200">
              <span className="text-[9px] uppercase font-bold text-zinc-600 block">Total Fuel</span>
              <p className="text-lg font-black font-mono text-zinc-950">
                {report.summary.totalFuelLiters.toLocaleString()} L
              </p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200">
              <span className="text-[9px] uppercase font-bold text-zinc-600 block">Fleet Safety Score</span>
              <p className="text-lg font-black font-mono text-emerald-700">
                {report.summary.fleetSafetyScore}%
              </p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200">
              <span className="text-[9px] uppercase font-bold text-zinc-600 block">Safety Incidents</span>
              <p className="text-lg font-black font-mono text-amber-700">
                {report.summary.totalSafetyIncidents}
              </p>
            </div>
          </div>

          {/* Summary Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800">
              Vehicle Operational Ledger
            </h4>
            <table className="w-full text-left text-xs border border-zinc-300 divide-y divide-zinc-200">
              <thead className="bg-zinc-100 text-[10px] font-bold uppercase text-zinc-700">
                <tr>
                  <th className="p-2">Plate</th>
                  <th className="p-2">Model</th>
                  <th className="p-2">Driver</th>
                  <th className="p-2 text-right">Distance</th>
                  <th className="p-2 text-right">Fuel (L)</th>
                  <th className="p-2 text-center">Safety Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono text-[11px]">
                {report.vehicleRows.map((r) => (
                  <tr key={r.vehicleId}>
                    <td className="p-2 font-bold text-zinc-950">{r.plate}</td>
                    <td className="p-2 font-sans text-zinc-700">{r.makeModel}</td>
                    <td className="p-2 font-sans text-zinc-700">{r.driverName}</td>
                    <td className="p-2 text-right">{r.totalDistanceKm} km</td>
                    <td className="p-2 text-right">{r.fuelConsumedLiters} L</td>
                    <td className="p-2 text-center font-bold">{r.safetyScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures & Certification Area */}
          <div className="pt-8 border-t border-zinc-200 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="font-bold text-zinc-900">Fleet Operations Officer</p>
              <div className="h-12 border-b border-dashed border-zinc-400 mt-2"></div>
              <p className="text-[10px] text-zinc-500 mt-1">Signature & Stamp</p>
            </div>
            <div>
              <p className="font-bold text-zinc-900">Compliance & Audit Manager</p>
              <div className="h-12 border-b border-dashed border-zinc-400 mt-2"></div>
              <p className="text-[10px] text-zinc-500 mt-1">Signature & Date</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
