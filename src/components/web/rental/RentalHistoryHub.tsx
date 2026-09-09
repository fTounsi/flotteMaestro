import React, { useState } from 'react';
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Power,
  PowerOff,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Car,
  FileText,
  DollarSign,
  MapPin,
  Compass,
  User,
  Phone,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  Info,
  X,
  Printer,
  ChevronRight,
  TrendingUp,
  Gauge,
  Fuel,
  Lock,
  Unlock,
  AlertCircle,
  Receipt,
  Download,
  FileCheck,
  CheckSquare,
  Filter,
  RefreshCw,
  Sliders,
  Award,
  UserX,
  UserCheck,
  CreditCard,
  Building2,
  SendHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import {
  Vehicle,
  RentalContract,
  RelayCommandLog,
  RentalSecurityDepositRecord,
  RentalCustomerProfile,
  RentalTerritoryViolation
} from '../../../types/fleet';
import { TranslationDictionary, Language } from '../../../translations/i18n';

interface RentalHistoryHubProps {
  vehicles: Vehicle[];
  contracts: RentalContract[];
  relayLogs: RelayCommandLog[];
  onAddRelayLog: (log: RelayCommandLog) => void;
  securityDeposits: RentalSecurityDepositRecord[];
  onUpdateDeposit: (deposit: RentalSecurityDepositRecord) => void;
  customerProfiles: RentalCustomerProfile[];
  onUpdateCustomer: (customer: RentalCustomerProfile) => void;
  territoryViolations: RentalTerritoryViolation[];
  onToggleRelay: (vehicleId: string, cutOff: boolean) => void;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  t?: TranslationDictionary;
  currentLang?: Language;
}

type HistorySection =
  | 'relay_logs'
  | 'completed_contracts'
  | 'security_deposits'
  | 'customer_directory'
  | 'territory_violations';

export const RentalHistoryHub: React.FC<RentalHistoryHubProps> = ({
  vehicles,
  contracts,
  relayLogs,
  onAddRelayLog,
  securityDeposits,
  onUpdateDeposit,
  customerProfiles,
  onUpdateCustomer,
  territoryViolations,
  onToggleRelay,
  onSelectVehicle,
  t,
  currentLang
}) => {
  // Navigation Section
  const [activeSection, setActiveSection] = useState<HistorySection>('relay_logs');

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [depositStatusFilter, setDepositStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');

  // Modals
  const [showRelayDispatchModal, setShowRelayDispatchModal] = useState(false);
  const [dispatchVehicleId, setDispatchVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [dispatchAction, setDispatchAction] = useState<'cut_off' | 'restore'>('cut_off');
  const [dispatchReason, setDispatchReason] = useState<RelayCommandLog['reason']>('overdue_nonpayment');
  const [dispatchNotes, setDispatchNotes] = useState('Remote telematics command dispatched via GPRS.');
  const [dispatchExecuting, setDispatchExecuting] = useState(false);

  const [selectedArchivedContract, setSelectedArchivedContract] = useState<RentalContract | null>(null);
  const [reconcileDepositModal, setReconcileDepositModal] = useState<RentalSecurityDepositRecord | null>(null);
  const [selectedCustomerModal, setSelectedCustomerModal] = useState<RentalCustomerProfile | null>(null);

  // Success Notification
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 5000);
  };

  // Completed / Archived Contracts list
  const completedContracts = contracts.filter(
    (c) => c.status === 'completed' || c.actualReturnDate !== undefined
  );

  // Key Metrics
  const totalRelayCommands = relayLogs.length;
  const totalCutOffs = relayLogs.filter((l) => l.action === 'cut_off').length;
  const totalRestores = relayLogs.filter((l) => l.action === 'restore').length;
  const totalCompletedContractsCount = completedContracts.length;
  const totalDepositsHeld = securityDeposits
    .filter((d) => d.status === 'held')
    .reduce((acc, curr) => acc + curr.depositAmountUsd, 0);
  const totalDepositsRefunded = securityDeposits
    .reduce((acc, curr) => acc + (curr.netRefundedUsd || 0), 0);
  const activeViolationsCount = territoryViolations.filter((v) => v.status === 'active_alert').length;

  // Filtered Relay Logs
  const filteredRelayLogs = relayLogs.filter((log) => {
    if (vehicleFilter !== 'all' && log.vehicleId !== vehicleFilter) return false;
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchPlate = log.vehiclePlate.toLowerCase().includes(q);
      const matchRenter = log.renterName?.toLowerCase().includes(q) || false;
      const matchReason = log.reason.toLowerCase().includes(q);
      const matchProtocol = log.protocolCommand.toLowerCase().includes(q);
      const matchLocation = log.locationName.toLowerCase().includes(q);
      if (!matchPlate && !matchRenter && !matchReason && !matchProtocol && !matchLocation) return false;
    }
    return true;
  });

  // Filtered Completed Contracts
  const filteredCompletedContracts = completedContracts.filter((c) => {
    if (vehicleFilter !== 'all' && c.vehicleId !== vehicleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = c.contractNumber.toLowerCase().includes(q);
      const matchRenter = c.renterName.toLowerCase().includes(q);
      const matchPlate = c.vehiclePlate.toLowerCase().includes(q);
      if (!matchNum && !matchRenter && !matchPlate) return false;
    }
    return true;
  });

  // Filtered Security Deposits
  const filteredDeposits = securityDeposits.filter((dep) => {
    if (depositStatusFilter !== 'all' && dep.status !== depositStatusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = dep.contractNumber.toLowerCase().includes(q);
      const matchRenter = dep.renterName.toLowerCase().includes(q);
      const matchPlate = dep.vehiclePlate.toLowerCase().includes(q);
      if (!matchNum && !matchRenter && !matchPlate) return false;
    }
    return true;
  });

  // Filtered Customers
  const filteredCustomers = customerProfiles.filter((cust) => {
    if (customerFilter !== 'all' && cust.statusTag !== customerFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = cust.fullName.toLowerCase().includes(q);
      const matchPhone = cust.phone.toLowerCase().includes(q);
      const matchEmail = cust.email.toLowerCase().includes(q);
      const matchCin = cust.cinOrPassport.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchCin) return false;
    }
    return true;
  });

  // Dispatch Direct Relay Command from History Console
  const handleExecuteDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVeh = vehicles.find((v) => v.id === dispatchVehicleId);
    if (!targetVeh) return;

    setDispatchExecuting(true);
    setTimeout(() => {
      onToggleRelay(targetVeh.id, dispatchAction === 'cut_off');

      const isCut = dispatchAction === 'cut_off';
      const commandString = isCut
        ? 'Teltonika GPRS: setdigout 1 0 (DOUT1 Relay Cut-Off Engaged)'
        : 'Teltonika GPRS: setdigout 0 0 (DOUT1 Normal Bypass Restored)';

      const newLog: RelayCommandLog = {
        id: `cmd_${Date.now()}`,
        vehicleId: targetVeh.id,
        vehiclePlate: targetVeh.licensePlate,
        vehicleModel: `${targetVeh.make} ${targetVeh.model} (${targetVeh.modelYear})`,
        contractNumber: targetVeh.rentalInfo?.contractNumber || 'DIRECT-DISPATCH',
        renterName: targetVeh.rentalInfo?.renterName || 'Fleet Operations',
        action: dispatchAction,
        status: 'executed',
        speedKmhAtExecution: targetVeh.speed || 0,
        safetyCheckPassed: (targetVeh.speed || 0) < 20,
        reason: dispatchReason,
        protocolCommand: commandString,
        operatorName: 'Dispatch Console Operator',
        operatorRole: 'Security Controller',
        timestamp: new Date().toISOString(),
        locationName: targetVeh.location?.address || 'Telematics GPS Fix',
        coordinates: [targetVeh.location?.latitude || 33.5731, targetVeh.location?.longitude || -7.5898],
        notes: dispatchNotes
      };

      onAddRelayLog(newLog);
      setDispatchExecuting(false);
      setShowRelayDispatchModal(false);
      showNotification(
        isCut
          ? `GPRS Relay Cut-Off command successfully sent to ${targetVeh.licensePlate}. Starter motor disabled.`
          : `GPRS Relay Restore command successfully sent to ${targetVeh.licensePlate}. Starter motor re-enabled.`
      );
    }, 1400);
  };

  // Export Relay CSV
  const handleExportRelayCsv = () => {
    const headers = ['Command ID', 'Timestamp', 'Plate', 'Vehicle', 'Action', 'Speed (km/h)', 'Safety Check', 'Reason', 'Protocol', 'Operator', 'Location'];
    const rows = filteredRelayLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.vehiclePlate}"`,
      `"${l.vehicleModel}"`,
      l.action,
      l.speedKmhAtExecution,
      l.safetyCheckPassed ? 'PASSED (<20km/h)' : 'OVER-SPEED',
      l.reason,
      `"${l.protocolCommand}"`,
      `"${l.operatorName}"`,
      `"${l.locationName}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relay_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Relay command audit log exported to CSV.');
  };

  // Export Completed Contracts CSV
  const handleExportContractsCsv = () => {
    const headers = ['Contract #', 'Renter', 'Plate', 'Start Date', 'Return Date', 'Start Odo', 'Return Odo', 'Excess Km', 'Deposit Status', 'Notes'];
    const rows = filteredCompletedContracts.map((c) => [
      c.contractNumber,
      `"${c.renterName}"`,
      `"${c.vehiclePlate}"`,
      c.startDate,
      c.actualReturnDate || c.endDate,
      c.startOdometer,
      c.currentOdometer,
      Math.max(0, c.currentOdometer - c.startOdometer - c.dailyMileageAllowanceKm),
      c.depositStatus,
      `"${c.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `completed_contracts_archive_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Completed rental contracts archive exported to CSV.');
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="rental-history-hub">
      {/* Toast Notification */}
      {bannerNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{bannerNotice}</span>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & KPI Ribbon */}
      <div className="bg-white dark:bg-gradient-to-r dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 rounded-[32px] p-6 lg:p-8 border border-slate-200 dark:border-zinc-800 shadow-md dark:shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="border-l-4 border-amber-500 pl-4 py-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t?.carRental?.history || 'History & Relay Audit Hub'}
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 font-semibold">
                Forensic Telematics & Financial Ledger
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black italic tracking-tight text-slate-900 dark:text-white">
              Rental Operations & Relay Audit Archive
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl">
              Chronological log of starter immobilizer commands, past closed contracts, security deposit settlements, customer trust profiles, and boundary/curfew breaches.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowRelayDispatchModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 transition-all hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4" />
              <span>Direct Relay Command</span>
            </button>

            <button
              onClick={activeSection === 'completed_contracts' ? handleExportContractsCsv : handleExportRelayCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs border border-slate-200 dark:border-zinc-700 transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Ribbon */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-zinc-950/60 dark:border-zinc-800/80">
            <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-bold">Relay Actions</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalRelayCommands} Sent</div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
              {totalCutOffs} cuts • {totalRestores} restores
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-500/20">
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold">Closed Contracts</div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{totalCompletedContractsCount} Archived</div>
            <div className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-mono">100% Reconciled</div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-500/20">
            <div className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold">Held Deposits</div>
            <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">${totalDepositsHeld}</div>
            <div className="text-[10px] text-amber-600/70 dark:text-amber-400/70 font-mono">Escrow Pre-Auths</div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-500/20">
            <div className="text-[10px] text-blue-700 dark:text-blue-400 uppercase font-bold">Refunded Deposits</div>
            <div className="text-xl font-black text-blue-700 dark:text-blue-400 mt-0.5">${totalDepositsRefunded.toFixed(0)}</div>
            <div className="text-[10px] text-blue-600/70 dark:text-blue-400/70 font-mono">Released to clients</div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 dark:bg-purple-950/30 dark:border-purple-500/20">
            <div className="text-[10px] text-purple-700 dark:text-purple-400 uppercase font-bold">Renter Profiles</div>
            <div className="text-xl font-black text-purple-700 dark:text-purple-400 mt-0.5">{customerProfiles.length} Profiles</div>
            <div className="text-[10px] text-purple-600/70 dark:text-purple-400/70 font-mono">With trust rating</div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-500/20">
            <div className="text-[10px] text-rose-700 dark:text-rose-400 uppercase font-bold">Active Violations</div>
            <div className="text-xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{activeViolationsCount} Alerts</div>
            <div className="text-[10px] text-rose-600/70 dark:text-rose-400/70 font-mono">Zone / Curfew</div>
          </div>
        </div>
      </div>

      {/* Sub-Section Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSection('relay_logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'relay_logs'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-zinc-900 dark:border-transparent dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{t?.carRental?.relayLogs || 'Relay & Immobilization Logs'} ({relayLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('completed_contracts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'completed_contracts'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-zinc-900 dark:border-transparent dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{t?.carRental?.completedContracts || 'Completed Contracts Archive'} ({completedContracts.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('security_deposits')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'security_deposits'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-zinc-900 dark:border-transparent dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{t?.carRental?.securityDeposits || 'Security Deposits Ledger'} ({securityDeposits.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('customer_directory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'customer_directory'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-zinc-900 dark:border-transparent dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t?.carRental?.customerDirectory || 'Renter Directory & Loyalty'} ({customerProfiles.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('territory_violations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'territory_violations'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-zinc-900 dark:border-transparent dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t?.carRental?.territoryAlerts || 'Curfew & Territory Alerts'} ({territoryViolations.length})</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records, plate, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: RELAY COMMAND AUDIT LOG */}
      {/* ========================================================================= */}
      {activeSection === 'relay_logs' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-950/80 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-500 dark:text-zinc-400 font-medium">Relay Action:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActionFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold ${
                    actionFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-zinc-200 dark:text-black'
                      : 'bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-400'
                  }`}
                >
                  All ({relayLogs.length})
                </button>
                <button
                  onClick={() => setActionFilter('cut_off')}
                  className={`px-3 py-1 rounded-lg font-bold ${
                    actionFilter === 'cut_off'
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-100 text-rose-600 dark:bg-zinc-900 dark:text-rose-400'
                  }`}
                >
                  Cut-Offs ({totalCutOffs})
                </button>
                <button
                  onClick={() => setActionFilter('restore')}
                  className={`px-3 py-1 rounded-lg font-bold ${
                    actionFilter === 'restore'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-slate-100 text-emerald-600 dark:bg-zinc-900 dark:text-emerald-400'
                  }`}
                >
                  Restores ({totalRestores})
                </button>
              </div>

              <span className="text-slate-500 dark:text-zinc-400 font-medium ml-2">Vehicle:</span>
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-zinc-200 outline-none"
              >
                <option value="all">All Fleet Assets</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.licensePlate} - {v.make} {v.model}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowRelayDispatchModal(true)}
              className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
            >
              <SendHorizontal className="w-3.5 h-3.5" />
              <span>Simulate GPRS Relay Test</span>
            </button>
          </div>

          {/* Table / List */}
          <div className="bg-white dark:bg-zinc-900/60 rounded-3xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-50 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Timestamp / Ref</th>
                    <th className="px-4 py-3">Vehicle & Plate</th>
                    <th className="px-4 py-3">Relay Action</th>
                    <th className="px-4 py-3">Safety Check & Speed</th>
                    <th className="px-4 py-3">Trigger Reason</th>
                    <th className="px-4 py-3">GPRS Protocol Downlink</th>
                    <th className="px-4 py-3">Operator</th>
                    <th className="px-4 py-3">GPS Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
                  {filteredRelayLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400 dark:text-zinc-500">
                        No relay command logs matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRelayLogs.map((log) => {
                      const isCut = log.action === 'cut_off';
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white block">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{log.id}</span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-mono font-black text-amber-600 dark:text-amber-400 block">
                              {log.vehiclePlate}
                            </span>
                            <span className="text-[11px] text-slate-600 dark:text-zinc-400">
                              {log.vehicleModel}
                            </span>
                            {log.renterName && (
                              <span className="text-[10px] text-slate-500 dark:text-zinc-500 block">
                                Renter: {log.renterName}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            {isCut ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                                <PowerOff className="w-3 h-3" />
                                Cut-Off (Immobilized)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                <Power className="w-3 h-3" />
                                Restored (Operational)
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {log.safetyCheckPassed ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  <ShieldCheck className="w-3 h-3" />
                                  Safe (&lt;20 km/h)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                  <AlertTriangle className="w-3 h-3" />
                                  Over-speed ({log.speedKmhAtExecution} km/h)
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                              Speed: {log.speedKmhAtExecution} km/h
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="capitalize text-slate-800 dark:text-zinc-200 font-semibold block">
                              {log.reason.replace(/_/g, ' ')}
                            </span>
                            {log.notes && (
                              <p className="text-[10px] text-slate-500 dark:text-zinc-400 max-w-xs truncate" title={log.notes}>
                                {log.notes}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] font-mono text-amber-700 dark:text-amber-400 border border-slate-200 dark:border-zinc-700 block max-w-xs truncate">
                              {log.protocolCommand}
                            </code>
                            <span className="text-[9px] text-emerald-600 font-mono block mt-0.5">
                              ACK Received (0.8s)
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                              {log.operatorName}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                              {log.operatorRole}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 max-w-xs">
                            <div className="flex items-start gap-1 text-[11px] text-slate-600 dark:text-zinc-400">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span className="truncate" title={log.locationName}>{log.locationName}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono block pl-4.5">
                              {log.coordinates[0].toFixed(4)}, {log.coordinates[1].toFixed(4)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: COMPLETED CONTRACTS ARCHIVE */}
      {/* ========================================================================= */}
      {activeSection === 'completed_contracts' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Grid / Table */}
          <div className="bg-white dark:bg-zinc-900/60 rounded-3xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Archived Historical Contracts & Handover Slips
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Full telematics record of completed journeys, mileage variances, fuel reconciliations, and deposit releases.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                {filteredCompletedContracts.length} Completed Contracts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-50 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Contract #</th>
                    <th className="px-4 py-3">Client & License</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Rental Dates</th>
                    <th className="px-4 py-3">Mileage & Excess</th>
                    <th className="px-4 py-3">Fuel (Start vs Return)</th>
                    <th className="px-4 py-3">Deposit Reconciled</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
                  {filteredCompletedContracts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400 dark:text-zinc-500">
                        No completed contracts recorded yet. Completed returns will appear here.
                      </td>
                    </tr>
                  ) : (
                    filteredCompletedContracts.map((c) => {
                      const totalKm = Math.max(0, c.currentOdometer - c.startOdometer);
                      const rentalDays = Math.max(
                        1,
                        Math.ceil((new Date(c.actualReturnDate || c.endDate).getTime() - new Date(c.startDate).getTime()) / (1000 * 3600 * 24))
                      );
                      const allowedKm = rentalDays * c.dailyMileageAllowanceKm;
                      const excessKm = Math.max(0, totalKm - allowedKm);

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="font-mono font-black text-slate-900 dark:text-white block">
                              {c.contractNumber}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold uppercase">Completed</span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {c.renterName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {c.renterPhone}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              Permis: {c.driverLicenseNumber}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 block">
                              {c.vehiclePlate}
                            </span>
                            <span className="text-[11px] text-slate-600 dark:text-zinc-400">
                              {c.vehicleModel}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="text-[11px] text-slate-900 dark:text-white block">
                              {new Date(c.startDate).toLocaleDateString()} &rarr; {new Date(c.actualReturnDate || c.endDate).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {rentalDays} days billed
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-mono font-bold text-slate-900 dark:text-white block">
                              {totalKm} km driven
                            </span>
                            {excessKm > 0 ? (
                              <span className="text-[10px] text-rose-600 font-semibold block">
                                +{excessKm} km excess (${(excessKm * c.excessMileageRatePerKmUsd).toFixed(0)})
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-semibold block">
                                Within limit ({allowedKm} km)
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <Fuel className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="font-mono text-xs">
                                {c.startFuelPercent}% &rarr; {c.currentFuelPercent}%
                              </span>
                            </div>
                            {c.currentFuelPercent < c.startFuelPercent && (
                              <span className="text-[10px] text-amber-600 font-semibold block">
                                Deficit: {c.startFuelPercent - c.currentFuelPercent}%
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.depositStatus === 'refunded'
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            }`}>
                              ${c.depositAmountUsd} ({c.depositStatus})
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => setSelectedArchivedContract(c)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-[11px] transition-colors"
                            >
                              View Voucher
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: SECURITY DEPOSITS LEDGER */}
      {/* ========================================================================= */}
      {activeSection === 'security_deposits' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Status Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-950/80 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 dark:text-zinc-400 font-medium">Deposit Status:</span>
              <button
                onClick={() => setDepositStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold ${
                  depositStatusFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-zinc-200 dark:text-black'
                    : 'bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-400'
                }`}
              >
                All Deposits
              </button>
              <button
                onClick={() => setDepositStatusFilter('held')}
                className={`px-3 py-1 rounded-lg font-bold ${
                  depositStatusFilter === 'held'
                    ? 'bg-amber-500 text-black'
                    : 'bg-slate-100 text-amber-600 dark:bg-zinc-900 dark:text-amber-400'
                }`}
              >
                Held in Escrow
              </button>
              <button
                onClick={() => setDepositStatusFilter('fully_refunded')}
                className={`px-3 py-1 rounded-lg font-bold ${
                  depositStatusFilter === 'fully_refunded'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-slate-100 text-emerald-600 dark:bg-zinc-900 dark:text-emerald-400'
                }`}
              >
                Fully Released
              </button>
              <button
                onClick={() => setDepositStatusFilter('partially_deducted')}
                className={`px-3 py-1 rounded-lg font-bold ${
                  depositStatusFilter === 'partially_deducted'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 text-rose-600 dark:bg-zinc-900 dark:text-rose-400'
                }`}
              >
                With Deductions
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeposits.map((dep) => {
              const isHeld = dep.status === 'held';
              const isRefunded = dep.status === 'fully_refunded';
              const isDeducted = dep.status === 'partially_deducted';
              const isForfeited = dep.status === 'forfeited';

              return (
                <div
                  key={dep.id}
                  className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-black text-slate-900 dark:text-white block">
                        {dep.contractNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Held on {new Date(dep.heldAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        isHeld
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          : isRefunded
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : isDeducted
                          ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/30'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {dep.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-zinc-400">Renter:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{dep.renterName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-zinc-400">Vehicle:</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {dep.vehiclePlate} ({dep.vehicleModel})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-zinc-400">Payment Instrument:</span>
                      <span className="capitalize font-semibold text-slate-700 dark:text-zinc-300">
                        {dep.paymentMethod.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-zinc-800">
                      <span className="text-slate-500 dark:text-zinc-400">Deposit Blocked:</span>
                      <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                        ${dep.depositAmountUsd} USD
                      </span>
                    </div>
                  </div>

                  {/* Deductions if any */}
                  {dep.deductions.length > 0 && (
                    <div className="space-y-1.5 p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-[11px]">
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase block">
                        Itemized Penalties Applied:
                      </span>
                      {dep.deductions.map((d, i) => (
                        <div key={i} className="flex justify-between text-slate-700 dark:text-zinc-300">
                          <span className="truncate max-w-[200px]">{d.reason}</span>
                          <span className="font-mono font-bold text-rose-600">-${d.amountUsd}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-1 border-t border-rose-200 dark:border-rose-900/40 font-bold text-slate-900 dark:text-white">
                        <span>Net Refunded to Client:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">${dep.netRefundedUsd}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Handled by: {dep.reconciledBy}</span>
                    {isHeld && (
                      <button
                        onClick={() => setReconcileDepositModal(dep)}
                        className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors shadow-xs"
                      >
                        Reconcile Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: CUSTOMER DIRECTORY & LOYALTY */}
      {/* ========================================================================= */}
      {activeSection === 'customer_directory' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-950/80 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 dark:text-zinc-400 font-medium">Customer Standing:</span>
              <button
                onClick={() => setCustomerFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold ${
                  customerFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-zinc-200 dark:text-black'
                    : 'bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-400'
                }`}
              >
                All Clients ({customerProfiles.length})
              </button>
              <button
                onClick={() => setCustomerFilter('vip')}
                className={`px-3 py-1 rounded-lg font-bold ${
                  customerFilter === 'vip'
                    ? 'bg-amber-500 text-black'
                    : 'bg-slate-100 text-amber-600 dark:bg-zinc-900 dark:text-amber-400'
                }`}
              >
                VIP Gold
              </button>
              <button
                onClick={() => setCustomerFilter('warning')}
                className={`px-3 py-1 rounded-lg font-bold ${
                  customerFilter === 'warning'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 text-orange-600 dark:bg-zinc-900 dark:text-orange-400'
                }`}
              >
                Caution Risk
              </button>
              <button
                onClick={() => setCustomerFilter('blacklisted')}
                className={`px-3 py-1 rounded-lg font-bold ${
                  customerFilter === 'blacklisted'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 text-rose-600 dark:bg-zinc-900 dark:text-rose-400'
                }`}
              >
                Blacklisted
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((cust) => {
              const isVip = cust.statusTag === 'vip';
              const isWarning = cust.statusTag === 'warning';
              const isBlacklisted = cust.statusTag === 'blacklisted';

              return (
                <div
                  key={cust.id}
                  className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm ${
                        isVip
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                          : isBlacklisted
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200'
                      }`}>
                        {cust.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cust.fullName}</h4>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">{cust.phone}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isVip
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          : isWarning
                          ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/30'
                          : isBlacklisted
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {cust.statusTag}
                    </span>
                  </div>

                  {/* Trust Score Gauge */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium">Reliability / Trust Score:</span>
                      <span className={`font-mono font-black ${
                        cust.ratingScore >= 90
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : cust.ratingScore >= 70
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {cust.ratingScore} / 100
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          cust.ratingScore >= 90
                            ? 'bg-emerald-500'
                            : cust.ratingScore >= 70
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${cust.ratingScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Rentals</span>
                      <span className="font-black text-slate-900 dark:text-white">{cust.totalRentalsCount} Trips</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Spend</span>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">${cust.totalSpentUsd}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                    <p className="line-clamp-2 italic">&ldquo;{cust.notes}&rdquo;</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center text-xs">
                    <span className="text-[10px] font-mono text-slate-400">CIN: {cust.cinOrPassport}</span>
                    <button
                      onClick={() => setSelectedCustomerModal(cust)}
                      className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                    >
                      Manage File &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: TERRITORY & CURFEW VIOLATIONS */}
      {/* ========================================================================= */}
      {activeSection === 'territory_violations' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recorded Geofence Boundary & Curfew Incidents
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Automated geofence telemetry alerts triggered by vehicles operating past contractual borders or during nighttime curfews.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {territoryViolations.map((viol) => {
                const isCritical = viol.severity === 'critical';
                const isImmobilized = viol.status === 'immobilized';

                return (
                  <div
                    key={viol.id}
                    className="p-5 rounded-3xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        isCritical
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {viol.violationType.replace(/_/g, ' ')}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(viol.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                          {viol.vehiclePlate}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {viol.speedKmh} km/h
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-zinc-400 block">{viol.vehicleModel}</span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-500 block">
                        Renter: {viol.renterName} ({viol.renterPhone})
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-zinc-300 font-medium">{viol.locationName}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800">
                      <span className={`text-[10px] font-bold uppercase ${
                        isImmobilized ? 'text-rose-600' : 'text-amber-600'
                      }`}>
                        Status: {viol.status.replace(/_/g, ' ')}
                      </span>

                      {!isImmobilized && (
                        <button
                          onClick={() => {
                            const target = vehicles.find((v) => v.licensePlate === viol.vehiclePlate);
                            if (target) {
                              setDispatchVehicleId(target.id);
                              setDispatchAction('cut_off');
                              setDispatchReason('unauthorized_zone_exit');
                              setDispatchNotes(`Automated safety cutoff initiated following ${viol.violationType} at ${viol.locationName}`);
                              setShowRelayDispatchModal(true);
                            }
                          }}
                          className="px-3 py-1 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-[10px] flex items-center gap-1 transition-colors"
                        >
                          <PowerOff className="w-3 h-3" />
                          <span>Emergency Cut-Off</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DIRECT RELAY DISPATCH CONSOLE */}
      {/* ========================================================================= */}
      {showRelayDispatchModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl text-slate-900 dark:text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                  dispatchAction === 'cut_off'
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    GPRS Starter Relay Dispatcher
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Send encrypted downlink to Teltonika / Queclink onboard terminal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRelayDispatchModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteDispatch} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                  Select Target Fleet Asset
                </label>
                <select
                  value={dispatchVehicleId}
                  onChange={(e) => setDispatchVehicleId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white font-medium outline-none"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} • {v.make} {v.model} (Speed: {v.speed || 0} km/h • Relay: {v.relayCutoffActive ? 'OPEN / Cut' : 'CLOSED / Normal'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDispatchAction('cut_off')}
                  className={`p-3 rounded-2xl border text-center font-extrabold transition-all ${
                    dispatchAction === 'cut_off'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20'
                      : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <PowerOff className="w-5 h-5 mx-auto mb-1" />
                  Cut-Off Starter (Immobilize)
                </button>

                <button
                  type="button"
                  onClick={() => setDispatchAction('restore')}
                  className={`p-3 rounded-2xl border text-center font-extrabold transition-all ${
                    dispatchAction === 'restore'
                      ? 'bg-emerald-500 text-black border-emerald-600 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <Power className="w-5 h-5 mx-auto mb-1" />
                  Restore Starter (Operate)
                </button>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                  Justification / Regulatory Cause
                </label>
                <select
                  value={dispatchReason}
                  onChange={(e) => setDispatchReason(e.target.value as RelayCommandLog['reason'])}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white font-medium outline-none"
                >
                  <option value="overdue_nonpayment">Overdue Rental &amp; Non-Payment Breach</option>
                  <option value="unauthorized_zone_exit">Unauthorized Zone Exit / Mountain Track</option>
                  <option value="theft_suspected">Suspected Asset Theft / Siphon Attempt</option>
                  <option value="curfew_violation">Contractual Curfew Breach (Nighttime)</option>
                  <option value="customer_emergency">Customer Emergency / Key Loss</option>
                  <option value="maintenance_test">Routine Workshop Diagnostics / Test</option>
                  <option value="manual_operator">Manual Supervisor Override</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                  Operator Dispatch Notes
                </label>
                <textarea
                  rows={2}
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-slate-800 dark:text-white text-xs outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Safety Interlock Active:</strong> Relay execution commands are queued securely. If the vehicle is in motion (&gt;20 km/h), the firmware waits until safe deceleration is reached before cutting ignition.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRelayDispatchModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatchExecuting}
                  className={`px-5 py-2 rounded-xl text-xs font-black shadow-md transition-all ${
                    dispatchAction === 'cut_off'
                      ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                  }`}
                >
                  {dispatchExecuting ? 'Transmitting via GPRS...' : `Confirm & Transmit ${dispatchAction === 'cut_off' ? 'Cut-Off' : 'Restore'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMPLETED CONTRACT HANDOVER VOUCHER */}
      {/* ========================================================================= */}
      {selectedArchivedContract && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 sm:p-8 max-w-2xl w-full shadow-2xl text-slate-900 dark:text-white space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Historical Handover &amp; Return Slip #{selectedArchivedContract.contractNumber}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Official Fleet Return Certificate &amp; Telematics Discharge
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedArchivedContract(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div>
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold">Renter Full Name</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedArchivedContract.renterName}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold">Driver License #</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">{selectedArchivedContract.driverLicenseNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div>
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold">Assigned Vehicle</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                    {selectedArchivedContract.vehicleModel} ({selectedArchivedContract.vehiclePlate})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold">Deposit Status</span>
                  <span className="capitalize font-bold text-emerald-600">
                    ${selectedArchivedContract.depositAmountUsd} ({selectedArchivedContract.depositStatus})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div>
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold">Odometer Telematics</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    Start: {selectedArchivedContract.startOdometer} km &rarr; End: {selectedArchivedContract.currentOdometer} km ({Math.max(0, selectedArchivedContract.currentOdometer - selectedArchivedContract.startOdometer)} km driven)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold">Fuel Telematics</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    Start: {selectedArchivedContract.startFuelPercent}% &rarr; Return: {selectedArchivedContract.currentFuelPercent}%
                  </span>
                </div>
              </div>

              {selectedArchivedContract.notes && (
                <div className="pt-1">
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold">Inspection Audit Log</span>
                  <p className="text-slate-700 dark:text-zinc-300 font-medium mt-1">{selectedArchivedContract.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => setSelectedArchivedContract(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-sm transition-all"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECONCILE SECURITY DEPOSIT */}
      {/* ========================================================================= */}
      {reconcileDepositModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl text-slate-900 dark:text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Reconcile Security Deposit
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Contract #{reconcileDepositModal.contractNumber} • {reconcileDepositModal.renterName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReconcileDepositModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Held Amount:</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">${reconcileDepositModal.depositAmountUsd} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-mono text-amber-600 font-bold">{reconcileDepositModal.vehiclePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Instrument:</span>
                <span className="capitalize">{reconcileDepositModal.paymentMethod.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  const updated: RentalSecurityDepositRecord = {
                    ...reconcileDepositModal,
                    status: 'fully_refunded',
                    releasedAt: new Date().toISOString(),
                    netRefundedUsd: reconcileDepositModal.depositAmountUsd,
                    reconciledBy: 'Operations Agent'
                  };
                  onUpdateDeposit(updated);
                  setReconcileDepositModal(null);
                  showNotification(`Deposit of $${reconcileDepositModal.depositAmountUsd} released in full.`);
                }}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Release Full Deposit ($0 Deductions)</span>
              </button>

              <button
                onClick={() => {
                  const updated: RentalSecurityDepositRecord = {
                    ...reconcileDepositModal,
                    status: 'partially_deducted',
                    releasedAt: new Date().toISOString(),
                    deductions: [
                      { reason: 'Standard inspection cleaning & minor fuel difference', amountUsd: 65 }
                    ],
                    netRefundedUsd: Math.max(0, reconcileDepositModal.depositAmountUsd - 65),
                    reconciledBy: 'Operations Agent'
                  };
                  onUpdateDeposit(updated);
                  setReconcileDepositModal(null);
                  showNotification(`Deposit reconciled with standard $65 penalty. Balance of $${updated.netRefundedUsd} refunded.`);
                }}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <DollarSign className="w-4 h-4" />
                <span>Apply Penalty ($65) &amp; Refund Remainder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CUSTOMER DETAIL FILE */}
      {/* ========================================================================= */}
      {selectedCustomerModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl text-slate-900 dark:text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 font-black">
                  {selectedCustomerModal.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedCustomerModal.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Client Telematics &amp; Rental Risk Profile
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedCustomerModal.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-900 dark:text-white">{selectedCustomerModal.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">National ID / CIN:</span>
                <span className="font-mono text-slate-900 dark:text-white">{selectedCustomerModal.cinOrPassport}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Driver License:</span>
                <span className="font-mono text-slate-900 dark:text-white">{selectedCustomerModal.driverLicenseNumber}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-zinc-800">
                <span className="text-slate-500">Total Spend:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">${selectedCustomerModal.totalSpentUsd} USD</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">
                Update Customer Standing:
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {(['vip', 'regular', 'warning', 'blacklisted'] as const).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const updated: RentalCustomerProfile = {
                        ...selectedCustomerModal,
                        statusTag: tag
                      };
                      onUpdateCustomer(updated);
                      setSelectedCustomerModal(updated);
                      showNotification(`Customer standing changed to ${tag.toUpperCase()}.`);
                    }}
                    className={`py-2 rounded-xl text-center font-extrabold uppercase text-[10px] border transition-all ${
                      selectedCustomerModal.statusTag === tag
                        ? 'bg-amber-500 text-black border-amber-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCustomerModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black font-extrabold text-xs transition-colors"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
