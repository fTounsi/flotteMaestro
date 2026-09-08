import React, { useState, useMemo } from 'react';
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
  X,
  Mail,
  Send,
  Bell,
  ShieldAlert,
  Gauge,
  Car,
  Truck,
  FileText,
  ChevronRight,
  Clock,
  Sliders,
  Filter,
  Eye,
  Trash2,
  Edit3,
  Building,
  CheckCircle
} from 'lucide-react';
import {
  Vehicle,
  MaintenanceInterval,
  MaintenanceServiceType,
  MaintenanceAlertLog,
  MaintenanceEmailSettings,
  DtcDiagnosticCode,
  WorkOrderRecord,
  Organization,
  User
} from '../../types/fleet';
import {
  INITIAL_MAINTENANCE_INTERVALS,
  INITIAL_MAINTENANCE_ALERT_LOGS,
  DEFAULT_MAINTENANCE_EMAIL_SETTINGS,
  INITIAL_DTC_CODES,
  INITIAL_WORK_ORDERS
} from '../../data/modulesData';
import { EmailAlertModal } from './maintenance/EmailAlertModal';
import { IntervalModal } from './maintenance/IntervalModal';
import { LogServiceModal } from './maintenance/LogServiceModal';
import { EmailSettingsModal } from './maintenance/EmailSettingsModal';

interface MaintenanceViewProps {
  vehicles: Vehicle[];
  currentOrg?: Organization;
  organizations?: Organization[];
  currentUser?: User;
  users?: User[];
  t?: any;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  vehicles,
  currentOrg,
  organizations = [],
  currentUser,
  users = [],
  t
}) => {
  // Main State
  const [intervals, setIntervals] = useState<MaintenanceInterval[]>(INITIAL_MAINTENANCE_INTERVALS);
  const [alertLogs, setAlertLogs] = useState<MaintenanceAlertLog[]>(INITIAL_MAINTENANCE_ALERT_LOGS);
  const [emailSettings, setEmailSettings] = useState<MaintenanceEmailSettings>(
    DEFAULT_MAINTENANCE_EMAIL_SETTINGS
  );
  const [obdCodes, setObdCodes] = useState<DtcDiagnosticCode[]>(INITIAL_DTC_CODES);
  const [workOrders, setWorkOrders] = useState<WorkOrderRecord[]>(INITIAL_WORK_ORDERS);

  // Simulated vehicle live odometers mapping
  const [simulatedOdoIncrements, setSimulatedOdoIncrements] = useState<Record<string, number>>({});

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<'intervals' | 'alert_logs' | 'obd' | 'work_orders'>('intervals');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'due_soon' | 'good'>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');

  // Modals state
  const [emailModalInterval, setEmailModalInterval] = useState<MaintenanceInterval | null>(null);
  const [editingInterval, setEditingInterval] = useState<MaintenanceInterval | null | undefined>(undefined); // null for new, undefined for closed
  const [loggingInterval, setLoggingInterval] = useState<MaintenanceInterval | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [viewingAlertLog, setViewingAlertLog] = useState<MaintenanceAlertLog | null>(null);

  // UI status feedback
  const [clearingDtcId, setClearingDtcId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanToastMessage, setScanToastMessage] = useState<string | null>(null);

  // Helper to get effective live vehicle odometer (base vehicle odometer + simulation offset)
  const getVehicleOdometer = (vehicleId: string, vehiclePlate: string, fallbackLastDone: number = 0): number => {
    const veh = vehicles.find((v) => v.id === vehicleId || v.licensePlate === vehiclePlate);
    const baseOdo = veh ? veh.odometer : fallbackLastDone + 5000;
    const increment = simulatedOdoIncrements[vehicleId] || simulatedOdoIncrements[vehiclePlate] || 0;
    return baseOdo + increment;
  };

  // Compute live dynamic intervals based on current vehicle telemetry
  const computedIntervals = useMemo(() => {
    return intervals.map((item) => {
      const currentOdo = getVehicleOdometer(item.vehicleId, item.vehiclePlate, item.lastDoneOdometer);
      const remainingKm = item.nextDueOdometer - currentOdo;
      const remainingDays = Math.ceil(
        (new Date(item.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      const warnKm = item.alertThresholdKm || emailSettings.warningKmThreshold;
      const warnDays = item.alertThresholdDays || emailSettings.warningDaysThreshold;

      let status: 'good' | 'due_soon' | 'overdue' = 'good';
      if (remainingKm <= 0 || remainingDays <= 0) {
        status = 'overdue';
      } else if (remainingKm <= warnKm || remainingDays <= warnDays) {
        status = 'due_soon';
      }

      return {
        ...item,
        remainingKm,
        remainingDays,
        status
      };
    });
  }, [intervals, vehicles, simulatedOdoIncrements, emailSettings]);

  // Filtered intervals list
  const filteredIntervals = useMemo(() => {
    return computedIntervals.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      // Vehicle filter
      if (vehicleFilter !== 'all' && item.vehicleId !== vehicleFilter && item.vehiclePlate !== vehicleFilter) {
        return false;
      }
      // Service type filter
      if (serviceTypeFilter !== 'all' && item.serviceType !== serviceTypeFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchPlate = item.vehiclePlate.toLowerCase().includes(q);
        const matchModel = item.vehicleModel?.toLowerCase().includes(q) || false;
        const matchWorkshop = item.preferredWorkshop?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchPlate && !matchModel && !matchWorkshop) {
          return false;
        }
      }
      return true;
    });
  }, [computedIntervals, statusFilter, vehicleFilter, serviceTypeFilter, searchQuery]);

  // Key Counts
  const overdueCount = computedIntervals.filter((i) => i.status === 'overdue').length;
  const dueSoonCount = computedIntervals.filter((i) => i.status === 'due_soon').length;
  const optimalCount = computedIntervals.filter((i) => i.status === 'good').length;
  const activeDtcCount = obdCodes.filter((c) => c.status === 'active').length;
  const totalMaintenanceSpentUsd = workOrders.reduce((acc, w) => acc + w.totalCostUsd, 0);

  // Advance vehicle simulated odometer by delta km
  const handleSimulateMileage = (deltaKm: number) => {
    const updated = { ...simulatedOdoIncrements };
    vehicles.forEach((v) => {
      updated[v.id] = (updated[v.id] || 0) + deltaKm;
      updated[v.licensePlate] = (updated[v.licensePlate] || 0) + deltaKm;
    });
    setSimulatedOdoIncrements(updated);

    setScanToastMessage(`Telematics Simulation: Added +${deltaKm} km to active fleet odometers.`);
    setTimeout(() => setScanToastMessage(null), 4000);
  };

  // Reset simulated odometer
  const handleResetSimulation = () => {
    setSimulatedOdoIncrements({});
    setScanToastMessage('Telematics odometers reset to live hardware GPS values.');
    setTimeout(() => setScanToastMessage(null), 3000);
  };

  // Clear DTC CAN-Bus
  const handleClearDtc = (codeId: string) => {
    setClearingDtcId(codeId);
    setTimeout(() => {
      setObdCodes(
        obdCodes.map((c) => (c.id === codeId ? { ...c, status: 'cleared' as const } : c))
      );
      setClearingDtcId(null);
    }, 1200);
  };

  // Automated Scanning Engine: scan all intervals against email thresholds and dispatch alerts
  const handleRunAutomatedScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const urgentItems = computedIntervals.filter(
        (i) => i.status === 'overdue' || i.status === 'due_soon'
      );

      const newlyCreatedLogs: MaintenanceAlertLog[] = [];

      urgentItems.forEach((item) => {
        const veh = vehicles.find((v) => v.id === item.vehicleId || v.licensePlate === item.vehiclePlate);
        const currentOdo = getVehicleOdometer(item.vehicleId, item.vehiclePlate, item.lastDoneOdometer);
        const isOverdue = item.status === 'overdue';

        const recipients = Array.from(
          new Set([
            'fouad.tounsi@gmail.com',
            ...(item.alertRecipientEmails || []),
            ...(currentOrg?.email ? [currentOrg.email] : []),
            ...emailSettings.defaultRecipientEmails
          ])
        );

        const newLog: MaintenanceAlertLog = {
          id: `alt_log_auto_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          vehicleId: item.vehicleId,
          vehiclePlate: item.vehiclePlate,
          vehicleModel: veh ? `${veh.make} ${veh.model}` : item.vehicleModel,
          serviceIntervalId: item.id,
          serviceTitle: item.title,
          serviceType: item.serviceType,
          alertType: isOverdue ? 'critical_overdue' : 'warning_due_soon',
          recipientEmails: recipients,
          subject: isOverdue
            ? `[AUTOMATED ESCALATION] Maintenance Overdue for ${item.vehiclePlate} (${item.title})`
            : `[PROACTIVE ALERT] Service Due Soon for ${item.vehiclePlate} (${item.remainingKm} km left)`,
          currentOdometer: currentOdo,
          nextDueOdometer: item.nextDueOdometer,
          remainingKm: item.remainingKm,
          remainingDays: item.remainingDays,
          estimatedCostUsd: item.estimatedCostUsd,
          status: 'delivered',
          organizationId: currentOrg?.id || item.organizationId || 'org_default',
          organizationName: currentOrg?.name || 'Fleet Operations',
          notes: `Proactive trigger fired by automated odometer telematics engine (Threshold: ${
            isOverdue ? 'Overdue <= 0 km' : `${emailSettings.warningKmThreshold} km warning`
          }).`
        };

        newlyCreatedLogs.push(newLog);
      });

      if (newlyCreatedLogs.length > 0) {
        setAlertLogs((prev) => [...newlyCreatedLogs, ...prev]);
        setScanToastMessage(
          `Automated Scan Complete: Dispatched ${newlyCreatedLogs.length} proactive email alert(s) to organization admins (fouad.tounsi@gmail.com, etc.).`
        );
      } else {
        setScanToastMessage('Automated Scan Complete: All fleet intervals are within healthy parameters.');
      }

      setIsScanning(false);
      setTimeout(() => setScanToastMessage(null), 5000);
    }, 1200);
  };

  // Dispatch weekly digest summary
  const handleDispatchWeeklyDigest = () => {
    setIsScanning(true);
    setTimeout(() => {
      const digestLog: MaintenanceAlertLog = {
        id: `alt_log_digest_${Date.now()}`,
        timestamp: new Date().toISOString(),
        vehicleId: 'fleet_summary',
        vehiclePlate: 'ALL FLEET',
        vehicleModel: `${vehicles.length} Monitored Vehicles`,
        serviceIntervalId: 'digest_weekly',
        serviceTitle: 'Weekly Fleet Service Health & Maintenance Summary',
        serviceType: 'general_overhaul',
        alertType: 'weekly_digest',
        recipientEmails: ['fouad.tounsi@gmail.com', ...emailSettings.defaultRecipientEmails],
        subject: `[WEEKLY DIGEST] Fleet Maintenance Report: ${overdueCount} Overdue, ${dueSoonCount} Due Soon`,
        currentOdometer: 0,
        nextDueOdometer: 0,
        remainingKm: 0,
        remainingDays: 0,
        estimatedCostUsd: computedIntervals
          .filter((i) => i.status !== 'good')
          .reduce((sum, i) => sum + i.estimatedCostUsd, 0),
        status: 'opened',
        organizationId: currentOrg?.id || 'org_default',
        organizationName: currentOrg?.name || 'Fleet Operations',
        notes: `Weekly maintenance digest dispatched to organization leadership. ${computedIntervals.length} total interval schedules monitored.`
      };

      setAlertLogs((prev) => [digestLog, ...prev]);
      setIsScanning(false);
      setScanToastMessage('Weekly Maintenance Digest email dispatched to all organization administrators.');
      setTimeout(() => setScanToastMessage(null), 4000);
    }, 1000);
  };

  // Save/Create Interval
  const handleSaveInterval = (intervalData: Partial<MaintenanceInterval>) => {
    if (editingInterval && editingInterval.id) {
      // Update existing
      setIntervals(
        intervals.map((i) => (i.id === editingInterval.id ? ({ ...i, ...intervalData } as MaintenanceInterval) : i))
      );
      setScanToastMessage(`Service schedule for ${intervalData.vehiclePlate} updated successfully.`);
    } else {
      // Add new
      const newInterval = intervalData as MaintenanceInterval;
      setIntervals([newInterval, ...intervals]);
      setScanToastMessage(`New proactive service schedule for ${newInterval.vehiclePlate} created.`);
    }
    setEditingInterval(undefined);
    setTimeout(() => setScanToastMessage(null), 3500);
  };

  // Delete Interval
  const handleDeleteInterval = (id: string, plate: string) => {
    if (window.confirm(`Are you sure you want to delete this service interval schedule for ${plate}?`)) {
      setIntervals(intervals.filter((i) => i.id !== id));
      setScanToastMessage(`Service interval removed for ${plate}.`);
      setTimeout(() => setScanToastMessage(null), 3000);
    }
  };

  // Handle Completed Service confirmation
  const handleConfirmCompleteService = (
    updatedInterval: MaintenanceInterval,
    newWorkOrder: WorkOrderRecord
  ) => {
    setIntervals(intervals.map((i) => (i.id === updatedInterval.id ? updatedInterval : i)));
    setWorkOrders([newWorkOrder, ...workOrders]);
    setLoggingInterval(null);
    setScanToastMessage(
      `Service recorded as completed! Interval counter reset to ${updatedInterval.lastDoneOdometer.toLocaleString()} km. Work order ${newWorkOrder.invoiceNumber} logged.`
    );
    setTimeout(() => setScanToastMessage(null), 4000);
  };

  // Handle Manual Dispatch from EmailAlertModal
  const handleSendAlertFromModal = (alertLog: MaintenanceAlertLog) => {
    setAlertLogs([alertLog, ...alertLogs]);
    setIntervals(
      intervals.map((i) => (i.id === alertLog.serviceIntervalId ? { ...i, lastAlertSentAt: alertLog.timestamp } : i))
    );
    setScanToastMessage(`Proactive alert email sent to ${alertLog.recipientEmails.length} admin(s).`);
    setTimeout(() => setScanToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16" id="maintenance-container">
      {/* Toast Notification */}
      {scanToastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs animate-slideUp">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{scanToastMessage}</span>
          <button onClick={() => setScanToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <Wrench className="w-4 h-4" />
            <span>Predictive Fleet Maintenance & OBD-II Diagnostics</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Proactive Service Interval Tracker & Email Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Automated remaining mileage & days calculation based on live GPS odometers, with instant email alert dispatch to organization admins.
          </p>
        </div>

        {/* Action Controls in Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setEditingInterval(null)}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service Schedule</span>
          </button>

          <button
            onClick={handleRunAutomatedScan}
            disabled={isScanning}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Telematics...' : 'Run Auto Email Scanner'}</span>
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Configure Alert Rules & SMTP"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overdue Services */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overdue Services</span>
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">{overdueCount}</div>
          <div className="text-xs text-rose-500 font-medium mt-1">
            {overdueCount > 0 ? 'Critical alerts sent to admin' : 'All vehicles compliant'}
          </div>
        </div>

        {/* Due Soon (< 1,000 km / 14 days) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Upcoming Services (&lt;1,000 km)</span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{dueSoonCount}</div>
          <div className="text-xs text-slate-400 mt-1">Auto-warning thresholds active</div>
        </div>

        {/* Admin Alerts Dispatched */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Admin Email Dispatches</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {alertLogs.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Sent to fouad.tounsi@gmail.com</div>
        </div>

        {/* Active DTC Codes & Spent */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Garage Spend</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ${totalMaintenanceSpentUsd.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">{workOrders.length} audited garage invoices</div>
        </div>
      </div>

      {/* Interactive Telematics Simulation Ribbon */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Live GPS Odometer Synchronization Engine</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Feed
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulate fleet vehicle mileage advancement to test real-time proactive interval threshold alerts:
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => handleSimulateMileage(500)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold border border-indigo-400/30 transition-all"
          >
            +500 km Trip
          </button>
          <button
            onClick={() => handleSimulateMileage(2500)}
            className="px-3 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-semibold border border-amber-400/30 transition-all"
          >
            +2,500 km Drive
          </button>
          {Object.keys(simulatedOdoIncrements).length > 0 && (
            <button
              onClick={handleResetSimulation}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              Reset GPS Sync
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('intervals')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'intervals'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Service Health & Mileage Triggers ({computedIntervals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('alert_logs')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'alert_logs'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Automated Admin Email Alerts ({alertLogs.length})</span>
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
          <span>OBD-II DTC Diagnostics ({obdCodes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('work_orders')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'work_orders'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Work Orders & Invoices ({workOrders.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SERVICE INTERVALS TRACKER */}
      {/* ========================================================================= */}
      {activeTab === 'intervals' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by plate (e.g. 12845-B-1), model, service operation, or garage..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Statuses ({computedIntervals.length})</option>
                <option value="overdue">🚨 Overdue ({overdueCount})</option>
                <option value="due_soon">⚠️ Due Soon ({dueSoonCount})</option>
                <option value="good">✅ Optimal ({optimalCount})</option>
              </select>

              {/* Vehicle Filter */}
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 max-w-[180px] truncate"
              >
                <option value="all">All Vehicles</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.licensePlate} ({v.make})
                  </option>
                ))}
              </select>

              {/* Service Type Filter */}
              <select
                value={serviceTypeFilter}
                onChange={(e) => setServiceTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Service Types</option>
                <option value="engine_oil">Engine Oil & Filter</option>
                <option value="brake_pads">Brake Pads & Rotors</option>
                <option value="tires">Tires & Alignment</option>
                <option value="timing_belt">Timing Belt</option>
                <option value="air_filter">Air & Cabin Filter</option>
                <option value="technical_inspection">Contrôle Technique</option>
              </select>
            </div>
          </div>

          {/* Service Intervals Grid */}
          {filteredIntervals.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                No matching service intervals found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Adjust your filters or add a new proactive service schedule for your fleet vehicles.
              </p>
              <button
                onClick={() => setEditingInterval(null)}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Service Schedule</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredIntervals.map((item) => {
                const currentOdo = getVehicleOdometer(
                  item.vehicleId,
                  item.vehiclePlate,
                  item.lastDoneOdometer
                );
                const isOverdue = item.status === 'overdue';
                const isDueSoon = item.status === 'due_soon';
                const veh = vehicles.find(
                  (v) => v.id === item.vehicleId || v.licensePlate === item.vehiclePlate
                );

                // Progress percentage of interval consumed
                const totalSpan = item.nextDueOdometer - item.lastDoneOdometer;
                const progressKm = Math.max(0, currentOdo - item.lastDoneOdometer);
                const percentConsumed = totalSpan > 0 ? Math.min(100, Math.round((progressKm / totalSpan) * 100)) : 100;

                return (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm space-y-3 transition-all ${
                      isOverdue
                        ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/20 dark:bg-rose-950/10'
                        : isDueSoon
                        ? 'border-amber-300 dark:border-amber-900/80 bg-amber-50/20 dark:bg-amber-950/10'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Header: Title, Plate & Urgency Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isOverdue
                                ? 'bg-rose-500 animate-ping'
                                : isDueSoon
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                            {item.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900/60">
                            {item.vehiclePlate}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span>{veh ? `${veh.make} ${veh.model}` : item.vehicleModel || 'Fleet Asset'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse'
                              : isDueSoon
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                        {item.emailAlertsEnabled && (
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-mono">
                            <Mail className="w-3 h-3" /> Auto-Alerts Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Gauge: Odometer & Calendar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          <span>Live Odometer vs Due Threshold:</span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">
                          {currentOdo.toLocaleString()} / {item.nextDueOdometer.toLocaleString()} km
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percentConsumed}%` }}
                          className={`h-full rounded-full transition-all ${
                            isOverdue
                              ? 'bg-rose-500'
                              : isDueSoon
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] pt-0.5">
                        <span className="text-slate-400 font-mono">
                          Last serviced: {item.lastDoneOdometer.toLocaleString()} km ({new Date(item.lastDoneDate).toLocaleDateString()})
                        </span>
                        <span
                          className={`font-bold font-mono ${
                            isOverdue
                              ? 'text-rose-600 dark:text-rose-400'
                              : isDueSoon
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {item.remainingKm <= 0
                            ? `OVERDUE by ${Math.abs(item.remainingKm).toLocaleString()} km`
                            : `${item.remainingKm.toLocaleString()} km remaining`}
                        </span>
                      </div>
                    </div>

                    {/* Meta info row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div>
                        <span className="text-slate-400 text-[11px]">Due Date:</span>{' '}
                        <strong className="block font-medium">
                          {new Date(item.nextDueDate).toLocaleDateString()} (
                          {item.remainingDays <= 0
                            ? `${Math.abs(item.remainingDays)}d overdue`
                            : `${item.remainingDays}d left`}
                          )
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Est. Cost:</span>{' '}
                        <strong className="block font-medium text-slate-900 dark:text-white">
                          ${item.estimatedCostUsd} USD
                        </strong>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-slate-400 text-[11px]">Preferred Garage:</span>{' '}
                        <span className="block font-medium truncate" title={item.preferredWorkshop}>
                          {item.preferredWorkshop || 'Authorized Center'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        {/* Dispatch Admin Email Alert */}
                        <button
                          type="button"
                          onClick={() => setEmailModalInterval(item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            isOverdue
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                              : isDueSoon
                              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch Email Alert</span>
                        </button>

                        {/* Log Service Completed */}
                        <button
                          type="button"
                          onClick={() => setLoggingInterval(item)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Log Service Done</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Edit Schedule */}
                        <button
                          type="button"
                          onClick={() => setEditingInterval(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Schedule & Thresholds"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteInterval(item.id, item.vehiclePlate)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Service Schedule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AUTOMATED ADMIN EMAIL ALERTS & DISPATCH HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'alert_logs' && (
        <div className="space-y-4">
          {/* Action Ribbon */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Automated Organization Admin Email Dispatch Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audited telemetry alerts transmitted to organization administrators & fleet directors.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDispatchWeeklyDigest}
                disabled={isScanning}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Dispatch Weekly Fleet Digest</span>
              </button>

              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Alert Rules</span>
              </button>
            </div>
          </div>

          {/* Email Logs Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Vehicle Plate</th>
                    <th className="p-3">Alert Reason / Subject</th>
                    <th className="p-3">Admin Recipients</th>
                    <th className="p-3">Telemetry Mileage</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {alertLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {log.vehiclePlate}
                      </td>
                      <td className="p-3 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                        <div className="truncate font-semibold">{log.subject}</div>
                        <div className="text-[11px] text-slate-400 truncate">{log.serviceTitle}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {log.recipientEmails.map((email) => (
                            <span
                              key={email}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono"
                            >
                              {email}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {log.currentOdometer > 0 ? `${log.currentOdometer.toLocaleString()} km` : 'Fleet Summary'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            log.status === 'opened'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : log.status === 'delivered'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setViewingAlertLog(log)}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Payload</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: OBD-II FAULT CODES */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* TAB 4: WORK ORDERS & INVOICES */}
      {/* ========================================================================= */}
      {activeTab === 'work_orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Fleet Repair Work Orders & Garage Invoices
              </h3>
              <p className="text-xs text-slate-400">Audited parts & labor expenditure logs</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-mono">
              Total: ${totalMaintenanceSpentUsd.toLocaleString()} USD
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-semibold">
                <tr>
                  <th className="p-3">Work Order #</th>
                  <th className="p-3">Vehicle Plate</th>
                  <th className="p-3">Garage Workshop</th>
                  <th className="p-3">Technician</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Parts ($)</th>
                  <th className="p-3">Labor ($)</th>
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
                    <td className="p-3 text-slate-600 dark:text-slate-400">{wo.technicianName}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{wo.description}</td>
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

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. Email Alert Dispatcher Modal */}
      {emailModalInterval && (
        <EmailAlertModal
          interval={emailModalInterval}
          vehicle={vehicles.find((v) => v.id === emailModalInterval.vehicleId || v.licensePlate === emailModalInterval.vehiclePlate)}
          currentOrg={currentOrg}
          users={users}
          currentOdometer={getVehicleOdometer(emailModalInterval.vehicleId, emailModalInterval.vehiclePlate, emailModalInterval.lastDoneOdometer)}
          remainingKm={emailModalInterval.remainingKm}
          remainingDays={emailModalInterval.remainingDays}
          onClose={() => setEmailModalInterval(null)}
          onSendAlert={handleSendAlertFromModal}
        />
      )}

      {/* 2. Configure Service Interval Modal */}
      {editingInterval !== undefined && (
        <IntervalModal
          interval={editingInterval}
          vehicles={vehicles}
          currentOrg={currentOrg}
          onClose={() => setEditingInterval(undefined)}
          onSave={handleSaveInterval}
        />
      )}

      {/* 3. Log Service Completed Modal */}
      {loggingInterval && (
        <LogServiceModal
          interval={loggingInterval}
          vehicle={vehicles.find((v) => v.id === loggingInterval.vehicleId || v.licensePlate === loggingInterval.vehiclePlate)}
          onClose={() => setLoggingInterval(null)}
          onConfirmComplete={handleConfirmCompleteService}
        />
      )}

      {/* 4. Alert Rules & Settings Modal */}
      {isSettingsModalOpen && (
        <EmailSettingsModal
          settings={emailSettings}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={(newSettings) => {
            setEmailSettings(newSettings);
            setScanToastMessage('Email automation rules updated successfully.');
            setTimeout(() => setScanToastMessage(null), 3000);
          }}
        />
      )}

      {/* 5. View Alert Log Details Modal */}
      {viewingAlertLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Email Dispatch Audit Record
                </h3>
              </div>
              <button
                onClick={() => setViewingAlertLog(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1.5 font-mono">
                <div>
                  <span className="text-slate-400">Subject:</span>{' '}
                  <strong className="text-slate-900 dark:text-white">{viewingAlertLog.subject}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Timestamp:</span>{' '}
                  <span>{new Date(viewingAlertLog.timestamp).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400">Vehicle:</span>{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">{viewingAlertLog.vehiclePlate}</strong> ({viewingAlertLog.vehicleModel})
                </div>
                <div>
                  <span className="text-slate-400">Trigger Type:</span>{' '}
                  <span className="uppercase font-bold text-amber-600">{viewingAlertLog.alertType}</span>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>{' '}
                  <span className="uppercase font-bold text-emerald-600">{viewingAlertLog.status}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Recipient Addresses:
                </span>
                <div className="flex flex-wrap gap-1">
                  {viewingAlertLog.recipientEmails.map((e) => (
                    <span
                      key={e}
                      className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[11px]"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              {viewingAlertLog.notes && (
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Telemetry Dispatch Notes:
                  </span>
                  <p className="p-2.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 italic">
                    {viewingAlertLog.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex justify-end">
              <button
                onClick={() => setViewingAlertLog(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
