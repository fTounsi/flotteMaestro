import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Calendar,
  DollarSign,
  Layers,
  Sparkles,
  Plus,
  RefreshCw,
  Search,
  Check,
  X
} from 'lucide-react';
import { Vehicle, MaintenanceInterval, DtcDiagnosticCode, WorkOrderRecord } from '../../types/fleet';
import {
  INITIAL_MAINTENANCE_INTERVALS,
  INITIAL_DTC_CODES,
  INITIAL_WORK_ORDERS
} from '../../data/modulesData';

interface MaintenanceViewProps {
  vehicles: Vehicle[];
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ vehicles }) => {
  const [intervals, setIntervals] = useState<MaintenanceInterval[]>(INITIAL_MAINTENANCE_INTERVALS);
  const [obdCodes, setObdCodes] = useState<DtcDiagnosticCode[]>(INITIAL_DTC_CODES);
  const [workOrders, setWorkOrders] = useState<WorkOrderRecord[]>(INITIAL_WORK_ORDERS);
  const [clearingDtcId, setClearingDtcId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'intervals' | 'obd' | 'work_orders'>('intervals');

  const totalMaintenanceSpentUsd = workOrders
    .reduce((acc, w) => acc + w.totalCostUsd, 0);
  const overdueCount = intervals.filter((i) => i.status === 'overdue').length;
  const dueSoonCount = intervals.filter((i) => i.status === 'due_soon').length;
  const activeDtcCount = obdCodes.filter((c) => c.status === 'active').length;

  const handleClearDtc = (codeId: string) => {
    setClearingDtcId(codeId);
    setTimeout(() => {
      setObdCodes(
        obdCodes.map((c) => (c.id === codeId ? { ...c, status: 'cleared' as const } : c))
      );
      setClearingDtcId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12" id="maintenance-container">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <Wrench className="w-4 h-4" />
            <span>Predictive Fleet Maintenance & OBD-II Diagnostics</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            OBD-II Engine Fault Scanner & Service Intervals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Prevent breakdowns with automated odometer service triggers, live CAN-bus DTC diagnostics, and repair expense logs.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Check Engine DTCs</span>
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {activeDtcCount > 0 ? (
              <span className="text-rose-600 dark:text-rose-400">{activeDtcCount} Faults Active</span>
            ) : (
              <span className="text-emerald-600">0 Faults</span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">Live OBD-II ECU telemetry</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overdue Services</span>
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">{overdueCount}</div>
          <div className="text-xs text-rose-500 font-medium mt-1">Immediate garage booking needed</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Upcoming Services (&lt;1000km)</span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{dueSoonCount}</div>
          <div className="text-xs text-slate-400 mt-1">Scheduled for next 14 days</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Maintenance Spend</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ${totalMaintenanceSpentUsd.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Parts & labor expenditure audited</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('intervals')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'intervals'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Service Health & Mileage Triggers ({intervals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('obd')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'obd'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>OBD-II DTC Diagnostic Codes ({obdCodes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('work_orders')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'work_orders'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Garage Work Orders & Invoices ({workOrders.length})</span>
        </button>
      </div>

      {/* TAB 1: Service Intervals */}
      {activeTab === 'intervals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {intervals.map((item) => {
            const currentEstimatedOdo = item.nextDueOdometer - item.remainingKm;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">{item.title}</h4>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">Plate: {item.vehiclePlate}</div>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      item.status === 'overdue'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse'
                        : item.status === 'due_soon'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress meter */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Current Odometer / Interval:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {currentEstimatedOdo.toLocaleString()} / {item.nextDueOdometer.toLocaleString()} km
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.remainingKm <= 0
                          ? 'bg-rose-500 w-full'
                          : item.remainingKm < 1000
                          ? 'bg-amber-500 w-4/5'
                          : 'bg-emerald-500 w-1/2'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Estimated Cost: <strong className="text-slate-900 dark:text-white">${item.estimatedCostUsd}</strong></span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {item.remainingKm <= 0 ? 'OVERDUE by ' + Math.abs(item.remainingKm) + ' km' : item.remainingKm + ' km remaining'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: OBD-II Fault Codes */}
      {activeTab === 'obd' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {obdCodes.map((code) => (
              <div
                key={code.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/60 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-mono font-bold text-sm">
                      {code.code}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{code.description}</h4>
                      <div className="text-[11px] text-slate-400 font-mono">Vehicle: {code.vehiclePlate}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      code.status === 'active'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    }`}
                  >
                    {code.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
                  <div className="text-slate-500 dark:text-slate-400">
                    <strong>Possible Causes:</strong> {code.possibleCauses.join(', ')}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    <strong>Recommended Action:</strong> {code.recommendedAction}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Logged: {new Date(code.detectedAt).toLocaleString()}
                  </span>

                  {code.status === 'active' ? (
                    <button
                      onClick={() => handleClearDtc(code.id)}
                      disabled={clearingDtcId === code.id}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${clearingDtcId === code.id ? 'animate-spin' : ''}`} />
                      <span>{clearingDtcId === code.id ? 'Clearing via CAN-bus...' : 'Clear DTC Code'}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Cleared Remotely
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Work Orders */}
      {activeTab === 'work_orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Fleet Repair Work Orders & Invoices</h3>
            <span className="text-xs text-slate-400">Certified garage network</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-semibold">
                <tr>
                  <th className="p-3">Work Order #</th>
                  <th className="p-3">Vehicle Plate</th>
                  <th className="p-3">Garage Workshop</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Parts Cost</th>
                  <th className="p-3">Labor Cost</th>
                  <th className="p-3">Total ($)</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{wo.invoiceNumber}</td>
                    <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{wo.vehiclePlate}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{wo.serviceCenter}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{wo.description}</td>
                    <td className="p-3 font-mono">${wo.costPartsUsd}</td>
                    <td className="p-3 font-mono">${wo.costLaborUsd}</td>
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">${wo.totalCostUsd}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold uppercase text-[10px]">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
