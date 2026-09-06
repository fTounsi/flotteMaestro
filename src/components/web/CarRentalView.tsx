import React, { useState } from 'react';
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Power,
  PowerOff,
  Plus,
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
  Camera,
  PenTool
} from 'lucide-react';
import { Vehicle, RentalContract, RentalDamageMark } from '../../types/fleet';
import { INITIAL_CAR_RENTAL_CONTRACTS } from '../../data/modulesData';

interface CarRentalViewProps {
  vehicles: Vehicle[];
  onToggleRelay: (vehicleId: string, cutOff: boolean) => void;
  onSelectVehicle?: (vehicle: Vehicle) => void;
}

export const CarRentalView: React.FC<CarRentalViewProps> = ({
  vehicles,
  onToggleRelay,
  onSelectVehicle
}) => {
  const [contracts, setContracts] = useState<RentalContract[]>(INITIAL_CAR_RENTAL_CONTRACTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue' | 'completed'>('all');
  const [selectedContract, setSelectedContract] = useState<RentalContract | null>(contracts[0]);
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [showRelayConfirmModal, setShowRelayConfirmModal] = useState<{
    vehicle: Vehicle;
    action: 'cut_off' | 'restore';
  } | null>(null);
  const [relayExecuting, setRelayExecuting] = useState(false);
  const [relaySuccessMsg, setRelaySuccessMsg] = useState<string | null>(null);

  // New Contract Form State
  const [newRenterName, setNewRenterName] = useState('');
  const [newRenterPhone, setNewRenterPhone] = useState('');
  const [newRenterCin, setNewRenterCin] = useState('');
  const [newVehicleId, setNewVehicleId] = useState(vehicles[0]?.id || '');
  const [newDailyRate, setNewDailyRate] = useState(40);
  const [newDailyAllowance, setNewDailyAllowance] = useState(200);
  const [newDays, setNewDays] = useState(3);
  const [newDeposit, setNewDeposit] = useState(500);

  // Damage marker state
  const [activeDamageView, setActiveDamageView] = useState<'front' | 'rear' | 'left' | 'right'>('front');

  // Filtered contracts
  const filteredContracts = contracts.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (
      searchQuery &&
      !c.renterName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Calculate rental fleet stats
  const activeRentalsCount = contracts.filter((c) => c.status === 'active').length;
  const overdueRentalsCount = contracts.filter((c) => c.status === 'overdue').length;
  const immobilizedCount = vehicles.filter((v) => v.relayCutoffActive).length;

  const handleExecuteRelay = (vehicle: Vehicle, cutOff: boolean) => {
    setRelayExecuting(true);
    setTimeout(() => {
      onToggleRelay(vehicle.id, cutOff);
      setRelayExecuting(false);
      setShowRelayConfirmModal(null);
      setRelaySuccessMsg(
        cutOff
          ? `GPRS Safety Protocol Confirmed: Engine Cut-Off command sent to ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate}). Vehicle is now immobilized.`
          : `GPRS Safety Protocol Confirmed: Engine restored for ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate}). Starter circuit is active.`
      );
      setTimeout(() => setRelaySuccessMsg(null), 6000);
    }, 1200);
  };

  const handleAddDamageMark = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedContract) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newMark: RentalDamageMark = {
      id: `dmg_${Date.now()}`,
      xPercent: x,
      yPercent: y,
      view: activeDamageView,
      type: 'scratch',
      description: `New ${activeDamageView} surface inspection mark recorded by agent`,
      severity: 'minor',
      createdAt: new Date().toISOString()
    };

    const updated = {
      ...selectedContract,
      damageMarks: [...selectedContract.damageMarks, newMark]
    };
    setSelectedContract(updated);
    setContracts(contracts.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedVeh = vehicles.find((v) => v.id === newVehicleId) || vehicles[0];
    const created: RentalContract = {
      id: `cnt_${Date.now()}`,
      organizationId: selectedVeh.organizationId,
      contractNumber: `CTR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: selectedVeh.id,
      vehiclePlate: selectedVeh.licensePlate,
      vehicleModel: `${selectedVeh.make} ${selectedVeh.model}`,
      renterName: newRenterName || 'New Renter',
      renterPhone: newRenterPhone || '+212 600 00 00 00',
      renterEmail: 'client@example.com',
      renterPassportOrCin: newRenterCin || 'MA123456',
      driverLicenseNumber: 'DL-2026-991',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + newDays * 24 * 3600 * 1000).toISOString(),
      status: 'active',
      dailyRateUsd: newDailyRate,
      dailyMileageAllowanceKm: newDailyAllowance,
      startOdometer: selectedVeh.odometer,
      currentOdometer: selectedVeh.odometer,
      startFuelPercent: selectedVeh.fuelLevelPercent || 100,
      currentFuelPercent: selectedVeh.fuelLevelPercent || 100,
      depositAmountUsd: newDeposit,
      depositStatus: 'held',
      excessMileageRatePerKmUsd: 0.2,
      authorizedZones: ['Morocco Nationwide'],
      unauthorizedBorderWarning: false,
      damageMarks: [],
      notes: 'New check-in created via FlotteMaestro Car Rental Studio.',
      createdAt: new Date().toISOString()
    };

    setContracts([created, ...contracts]);
    setSelectedContract(created);
    setShowNewContractModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12" id="car-rental-module-container">
      {/* Top Banner Alert if any success message */}
      {relaySuccessMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl flex items-center justify-between shadow-sm animate-slideDown">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{relaySuccessMsg}</span>
          </div>
          <button
            onClick={() => setRelaySuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & KPI Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <KeyRound className="w-4 h-4" />
            <span>Car Rental Agency & Fleet Security Studio</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Location de Voitures & Anti-Theft Relay Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enforce daily mileage limits, track active renter contracts, inspect check-in/out body damage,
            and trigger remote engine immobilizers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewContractModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md shadow-amber-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>New Rental Agreement</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Rented Vehicles</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{activeRentalsCount}</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            {Math.round((activeRentalsCount / (vehicles.length || 1)) * 100)}% Fleet Utilization
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overdue Returns</span>
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">{overdueRentalsCount}</div>
          <div className="text-xs text-rose-500 font-medium mt-1">Requires immediate agent follow-up</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Anti-Theft Relay Status</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {immobilizedCount > 0 ? (
              <span className="text-rose-600 dark:text-rose-400">{immobilizedCount} Immobilized</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">All Active (0 Cut-Off)</span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">Remote GPRS kill switch ready</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Deposits Held</span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            $
            {contracts
              .filter((c) => c.depositStatus === 'held')
              .reduce((acc, c) => acc + c.depositAmountUsd, 0)
              .toLocaleString()}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
            Pre-authorized security deposits
          </div>
        </div>
      </div>

      {/* Main Grid: Contracts List + Detail Inspection Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Contracts Table & Search (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Rental Agreements</h2>
              <span className="text-xs text-slate-400">{filteredContracts.length} records</span>
            </div>

            {/* Search and status filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search renter, plate, contract..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium outline-none"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Contract Cards List */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredContracts.map((cnt) => {
                const isSelected = selectedContract?.id === cnt.id;
                const linkedVehicle = vehicles.find((v) => v.id === cnt.vehicleId);
                const totalAllowedKm =
                  cnt.dailyMileageAllowanceKm *
                  Math.max(
                    1,
                    Math.ceil(
                      (new Date(cnt.endDate).getTime() - new Date(cnt.startDate).getTime()) /
                        (1000 * 3600 * 24)
                    )
                  );
                const currentKmDriven = cnt.currentOdometer - cnt.startOdometer;
                const isOverMileage = currentKmDriven > totalAllowedKm;
                const excessKm = Math.max(0, currentKmDriven - totalAllowedKm);
                const excessFee = (excessKm * cnt.excessMileageRatePerKmUsd).toFixed(2);

                return (
                  <div
                    key={cnt.id}
                    onClick={() => setSelectedContract(cnt)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {cnt.renterName}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              cnt.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : cnt.status === 'overdue'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {cnt.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {cnt.vehicleModel} • <strong className="text-slate-700 dark:text-slate-300 font-mono">{cnt.vehiclePlate}</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                          ${cnt.dailyRateUsd}/day
                        </div>
                        <div className="text-[10px] text-slate-400">{cnt.contractNumber}</div>
                      </div>
                    </div>

                    {/* Mileage status meter */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {currentKmDriven} km / {totalAllowedKm} km allowed
                        </span>
                      </div>

                      {isOverMileage ? (
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                          +{excessKm} km (+${excessFee})
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {totalAllowedKm - currentKmDriven} km left
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Immoblizer Controls for All Rental Cars */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Remote Relay Anti-Theft Kill Switches</span>
              </h3>
              <span className="text-xs text-slate-400">Safety GPRS Interlock</span>
            </div>

            <div className="space-y-2">
              {vehicles
                .filter((v) => v.rentalInfo || v.make === 'Renault' || v.make === 'Dacia' || v.make === 'Hyundai' || v.make === 'Mercedes-Benz')
                .slice(0, 4)
                .map((veh) => {
                  const isImmobilized = veh.relayCutoffActive;
                  return (
                    <div
                      key={veh.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isImmobilized ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                          }`}
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {veh.make} {veh.model}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {veh.licensePlate} • {veh.latestPosition.speed} km/h
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setShowRelayConfirmModal({
                            vehicle: veh,
                            action: isImmobilized ? 'restore' : 'cut_off'
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isImmobilized
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                        }`}
                      >
                        {isImmobilized ? (
                          <>
                            <Power className="w-3.5 h-3.5" />
                            <span>Restore Engine</span>
                          </>
                        ) : (
                          <>
                            <PowerOff className="w-3.5 h-3.5" />
                            <span>Cut Engine</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Selected Contract & 360° Damage Studio (7 cols) */}
        {selectedContract ? (
          <div className="lg:col-span-7 space-y-4">
            {/* Contract Details Header Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedContract.contractNumber}
                    </h2>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        selectedContract.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : selectedContract.status === 'overdue'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {selectedContract.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedContract.vehicleModel} ({selectedContract.vehiclePlate})
                  </p>
                </div>

                {/* Overdue Alert banner if overdue */}
                {selectedContract.status === 'overdue' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Past Return Deadline (+14 Hrs)</span>
                  </div>
                )}
              </div>

              {/* Renter Information Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-slate-400 font-medium">Renter Client</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-1">
                    {selectedContract.renterName}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">{selectedContract.renterPhone}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-slate-400 font-medium">Passport / CIN</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-1 font-mono">
                    {selectedContract.renterPassportOrCin}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 font-mono">
                    Permis: {selectedContract.driverLicenseNumber}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-slate-400 font-medium">Rental Period</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-1">
                    {new Date(selectedContract.startDate).toLocaleDateString()}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    to {new Date(selectedContract.endDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-slate-400 font-medium">Security Deposit</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-1">
                    ${selectedContract.depositAmountUsd}
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase text-[10px]">
                    {selectedContract.depositStatus}
                  </div>
                </div>
              </div>

              {/* Mileage & Fuel Reconciliation Meter */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Mileage & Fuel Level Reconciliation</span>
                  <span className="text-amber-400 font-semibold">
                    Allowance: {selectedContract.dailyMileageAllowanceKm} km/day
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-800/80">
                    <div className="text-[10px] text-slate-400 uppercase">Check-In Km</div>
                    <div className="text-base font-bold font-mono mt-0.5">
                      {selectedContract.startOdometer.toLocaleString()} km
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80">
                    <div className="text-[10px] text-slate-400 uppercase">Current Live Km</div>
                    <div className="text-base font-bold font-mono mt-0.5 text-indigo-400">
                      {selectedContract.currentOdometer.toLocaleString()} km
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80">
                    <div className="text-[10px] text-slate-400 uppercase">Start Fuel %</div>
                    <div className="text-base font-bold font-mono mt-0.5 text-emerald-400">
                      {selectedContract.startFuelPercent}%
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80">
                    <div className="text-[10px] text-slate-400 uppercase">Live Fuel %</div>
                    <div className="text-base font-bold font-mono mt-0.5 text-amber-400">
                      {selectedContract.currentFuelPercent}%
                    </div>
                  </div>
                </div>

                {/* Over-mileage penalty calculation */}
                {selectedContract.currentOdometer - selectedContract.startOdometer >
                  selectedContract.dailyMileageAllowanceKm * 3 && (
                  <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>
                        Excess Mileage Penalty: Renter exceeded quota by{' '}
                        <strong>
                          {selectedContract.currentOdometer -
                            selectedContract.startOdometer -
                            selectedContract.dailyMileageAllowanceKm * 3}{' '}
                          km
                        </strong>
                      </span>
                    </div>
                    <span className="font-bold text-rose-400 font-mono text-sm">
                      +$
                      {(
                        (selectedContract.currentOdometer -
                          selectedContract.startOdometer -
                          selectedContract.dailyMileageAllowanceKm * 3) *
                        selectedContract.excessMileageRatePerKmUsd
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* 360° Car Body Damage Inspection Studio */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-500" />
                      <span>360° Body Damage Inspection & Check-Out Pinpoints</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Click directly on the vehicle blueprint below to log scratches, dents, or paint chips.
                    </p>
                  </div>

                  {/* Perspective View Switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {(['front', 'rear', 'left', 'right'] as const).map((view) => (
                      <button
                        key={view}
                        onClick={() => setActiveDamageView(view)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md uppercase transition-colors ${
                          activeDamageView === view
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Blueprint Canvas Simulation */}
                <div
                  onClick={handleAddDamageMark}
                  className="relative w-full h-56 bg-slate-950 rounded-xl border-2 border-dashed border-slate-700/80 flex items-center justify-center cursor-crosshair overflow-hidden group select-none"
                >
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Vehicle Wireframe Silhouette Placeholder */}
                  <div className="relative text-center pointer-events-none">
                    <Car className="w-24 h-24 text-slate-700 mx-auto opacity-50" />
                    <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {selectedContract.vehicleModel} — {activeDamageView.toUpperCase()} VIEW
                    </div>
                    <div className="text-[11px] text-amber-400/80 mt-0.5">
                      (Click anywhere on this canvas to place a damage marker)
                    </div>
                  </div>

                  {/* Render Existing Damage Marks for this view */}
                  {selectedContract.damageMarks
                    .filter((m) => m.view === activeDamageView)
                    .map((mark) => (
                      <div
                        key={mark.id}
                        style={{ left: `${mark.xPercent}%`, top: `${mark.yPercent}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-rose-600 border-2 border-white text-white flex items-center justify-center text-[10px] font-bold shadow-lg animate-bounce"
                        title={`${mark.type}: ${mark.description}`}
                      >
                        !
                      </div>
                    ))}
                </div>

                {/* Damage Marks Log List */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Logged Defects ({selectedContract.damageMarks.length}):
                  </div>
                  {selectedContract.damageMarks.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">
                      No defects recorded. Vehicle is in mint condition.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {selectedContract.damageMarks.map((mark) => (
                        <div
                          key={mark.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span className="font-bold uppercase text-[10px] text-amber-600 dark:text-amber-400">
                              [{mark.view}]
                            </span>
                            <span className="text-slate-800 dark:text-slate-200">{mark.description}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{mark.severity}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center text-slate-400 min-h-[400px]">
            <KeyRound className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
            <div className="font-semibold text-slate-600 dark:text-slate-300">No Rental Selected</div>
            <p className="text-xs max-w-sm mt-1">Select a rental contract from the left list to view contract terms, mileage tracking, and 360° damage marks.</p>
          </div>
        )}
      </div>

      {/* MODAL: New Rental Agreement */}
      {showNewContractModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Create Rental Agreement (Check-Out)
                </h3>
              </div>
              <button
                onClick={() => setShowNewContractModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Select Rental Vehicle
                </label>
                <select
                  value={newVehicleId}
                  onChange={(e) => setNewVehicleId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium outline-none"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.licensePlate}) — Odo: {v.odometer} km
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Renter Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mehdi Benmoussa"
                    value={newRenterName}
                    onChange={(e) => setNewRenterName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Passport / CIN Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BK891024"
                    value={newRenterCin}
                    onChange={(e) => setNewRenterCin(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+212 661 00 00 00"
                  value={newRenterPhone}
                  onChange={(e) => setNewRenterPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Daily Rate ($)
                  </label>
                  <input
                    type="number"
                    value={newDailyRate}
                    onChange={(e) => setNewDailyRate(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Daily Km Allowance
                  </label>
                  <input
                    type="number"
                    value={newDailyAllowance}
                    onChange={(e) => setNewDailyAllowance(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Deposit ($)
                  </label>
                  <input
                    type="number"
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewContractModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md"
                >
                  Generate Agreement & Check-Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Relay Cut-Off Confirmation with Safety Interlock */}
      {showRelayConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-md w-full p-6 border border-rose-600/40 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center font-bold">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {showRelayConfirmModal.action === 'cut_off'
                    ? 'Confirm Remote Engine Immobilization'
                    : 'Confirm Remote Engine Restoration'}
                </h3>
                <span className="text-xs text-rose-400">GPRS Safety Interlock Protocol</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {showRelayConfirmModal.action === 'cut_off' ? (
                <>
                  You are about to send an encrypted kill-switch command to{' '}
                  <strong className="text-white">
                    {showRelayConfirmModal.vehicle.make} {showRelayConfirmModal.vehicle.model} (
                    {showRelayConfirmModal.vehicle.licensePlate})
                  </strong>
                  . The starter relay will be disabled. To protect road safety, if the vehicle is moving &gt; 20 km/h, the
                  interlock will safely wait until the vehicle decelerates to a stop.
                </>
              ) : (
                <>
                  Restore starter ignition power to{' '}
                  <strong className="text-white">
                    {showRelayConfirmModal.vehicle.make} {showRelayConfirmModal.vehicle.model}
                  </strong>
                  .
                </>
              )}
            </p>

            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs space-y-1 font-mono">
              <div>Target Tracker: {showRelayConfirmModal.vehicle.trackerImei || 'Teltonika FMB920'}</div>
              <div>Live Speed: {showRelayConfirmModal.vehicle.latestPosition.speed} km/h</div>
              <div>Ignition: {showRelayConfirmModal.vehicle.latestPosition.ignition ? 'ON' : 'OFF'}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRelayConfirmModal(null)}
                disabled={relayExecuting}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleExecuteRelay(
                    showRelayConfirmModal.vehicle,
                    showRelayConfirmModal.action === 'cut_off'
                  )
                }
                disabled={relayExecuting}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  showRelayConfirmModal.action === 'cut_off'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30'
                }`}
              >
                {relayExecuting ? (
                  <span>Transmitting GPRS Payload...</span>
                ) : (
                  <span>
                    Confirm {showRelayConfirmModal.action === 'cut_off' ? 'Immobilization' : 'Restore'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
