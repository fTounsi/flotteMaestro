import React, { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  Calendar,
  Gauge,
  DollarSign,
  Plus,
  Building,
  Mail,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { MaintenanceInterval, MaintenanceServiceType, Vehicle, Organization } from '../../../types/fleet';

interface IntervalModalProps {
  interval?: MaintenanceInterval | null;
  vehicles: Vehicle[];
  currentOrg?: Organization;
  onClose: () => void;
  onSave: (intervalData: Partial<MaintenanceInterval>) => void;
}

const SERVICE_PRESETS: {
  type: MaintenanceServiceType;
  label: string;
  defaultTitle: string;
  defaultKm: number;
  defaultDays: number;
  defaultCost: number;
  iconHint: string;
}[] = [
  {
    type: 'engine_oil',
    label: 'Synthetic Engine Oil & Filter Change',
    defaultTitle: 'Synthetic 5W30 Engine Oil & High-Flow Filter Change',
    defaultKm: 15000,
    defaultDays: 180,
    defaultCost: 95,
    iconHint: 'Essential lubrication every 10k-15k km'
  },
  {
    type: 'brake_pads',
    label: 'Ceramic Brake Pads & Rotors',
    defaultTitle: 'Front & Rear Ceramic Brake Pads + Disc Thickness Inspection',
    defaultKm: 35000,
    defaultDays: 365,
    defaultCost: 160,
    iconHint: 'Safety friction component inspection'
  },
  {
    type: 'tires',
    label: 'Tires Rotation, Balancing & Alignment',
    defaultTitle: 'Tire Rotation, Laser Wheel Alignment & Depth Audit',
    defaultKm: 20000,
    defaultDays: 180,
    defaultCost: 75,
    iconHint: 'Even tread wear & fuel economy'
  },
  {
    type: 'timing_belt',
    label: 'Timing Belt / Chain & Water Pump',
    defaultTitle: 'Timing Belt Kit, Idler Pulley & Coolant Water Pump',
    defaultKm: 100000,
    defaultDays: 1460,
    defaultCost: 450,
    iconHint: 'Critical engine timing component'
  },
  {
    type: 'air_filter',
    label: 'Air Filter & Cabin Pollen Filter',
    defaultTitle: 'Intake Air Filter & Cabin HEPA Anti-Allergen Filter',
    defaultKm: 20000,
    defaultDays: 365,
    defaultCost: 55,
    iconHint: 'Clean combustion & interior air'
  },
  {
    type: 'technical_inspection',
    label: 'Regulatory Technical Inspection (Contrôle Technique)',
    defaultTitle: 'Annual Regulatory Safety Inspection & Emissions Audit',
    defaultKm: 50000,
    defaultDays: 365,
    defaultCost: 50,
    iconHint: 'Mandatory ministry certificate'
  },
  {
    type: 'spark_plugs',
    label: 'Spark Plugs / Glow Plugs & Ignition',
    defaultTitle: 'Iridium Spark Plugs / Glow Plugs & Coil Resistance Test',
    defaultKm: 40000,
    defaultDays: 730,
    defaultCost: 110,
    iconHint: 'Smooth ignition & fuel burn'
  },
  {
    type: 'transmission_fluid',
    label: 'Transmission / Gearbox Fluid Flush',
    defaultTitle: 'Automatic / Manual Gearbox Transmission Fluid Service',
    defaultKm: 60000,
    defaultDays: 730,
    defaultCost: 190,
    iconHint: 'Smooth shifting & gearbox protection'
  },
  {
    type: 'battery_coolant',
    label: 'Cooling System Flush & 12V/24V Battery Test',
    defaultTitle: 'Antifreeze Coolant Fluid Flush & Battery Cold-Crank Test',
    defaultKm: 40000,
    defaultDays: 730,
    defaultCost: 80,
    iconHint: 'Overheating & electrical breakdown prevention'
  },
  {
    type: 'general_overhaul',
    label: 'Major Annual Fleet Safety Overhaul',
    defaultTitle: '120-Point Complete Fleet Health Overhaul & Suspension Check',
    defaultKm: 50000,
    defaultDays: 365,
    defaultCost: 280,
    iconHint: 'Comprehensive multi-point inspection'
  },
  {
    type: 'other',
    label: 'Custom Fleet Service Interval',
    defaultTitle: 'Custom Scheduled Workshop Operation',
    defaultKm: 25000,
    defaultDays: 365,
    defaultCost: 100,
    iconHint: 'Bespoke fleet maintenance'
  }
];

export const IntervalModal: React.FC<IntervalModalProps> = ({
  interval,
  vehicles,
  currentOrg,
  onClose,
  onSave
}) => {
  const isEditing = !!interval;

  const defaultVehicle = vehicles[0] || null;
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    interval?.vehicleId || defaultVehicle?.id || ''
  );

  const activeVehicle = vehicles.find((v) => v.id === selectedVehicleId) || defaultVehicle;
  const currentOdometer = activeVehicle?.odometer || 0;

  const [serviceType, setServiceType] = useState<MaintenanceServiceType>(
    interval?.serviceType || 'engine_oil'
  );
  const [title, setTitle] = useState(
    interval?.title || 'Synthetic 5W30 Engine Oil & High-Flow Filter Change'
  );
  const [intervalKm, setIntervalKm] = useState<number>(interval?.intervalKm || 15000);
  const [intervalDays, setIntervalDays] = useState<number>(interval?.intervalDays || 180);
  const [lastDoneOdometer, setLastDoneOdometer] = useState<number>(
    interval?.lastDoneOdometer !== undefined ? interval.lastDoneOdometer : Math.max(0, currentOdometer - 8000)
  );
  const [lastDoneDate, setLastDoneDate] = useState<string>(
    interval?.lastDoneDate
      ? interval.lastDoneDate.split('T')[0]
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [estimatedCostUsd, setEstimatedCostUsd] = useState<number>(
    interval?.estimatedCostUsd || 95
  );
  const [preferredWorkshop, setPreferredWorkshop] = useState(
    interval?.preferredWorkshop || 'Certified Dealer Network'
  );
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(
    interval?.emailAlertsEnabled !== undefined ? interval.emailAlertsEnabled : true
  );
  const [alertThresholdKm, setAlertThresholdKm] = useState<number>(
    interval?.alertThresholdKm || 1000
  );
  const [alertThresholdDays, setAlertThresholdDays] = useState<number>(
    interval?.alertThresholdDays || 14
  );
  const [notes, setNotes] = useState(interval?.notes || '');

  // Computed next due odometer & date
  const nextDueOdometer = lastDoneOdometer + intervalKm;
  const computedNextDueDate = new Date(
    new Date(lastDoneDate).getTime() + intervalDays * 24 * 60 * 60 * 1000
  ).toISOString();

  const remainingKm = nextDueOdometer - currentOdometer;
  const remainingDays = Math.ceil(
    (new Date(computedNextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handleServiceTypeChange = (type: MaintenanceServiceType) => {
    setServiceType(type);
    const preset = SERVICE_PRESETS.find((p) => p.type === type);
    if (preset && !isEditing) {
      setTitle(preset.defaultTitle);
      setIntervalKm(preset.defaultKm);
      setIntervalDays(preset.defaultDays);
      setEstimatedCostUsd(preset.defaultCost);
    }
  };

  const handleApplyVehicle = (vId: string) => {
    setSelectedVehicleId(vId);
    const veh = vehicles.find((v) => v.id === vId);
    if (veh && !isEditing) {
      setLastDoneOdometer(Math.max(0, veh.odometer - Math.floor(intervalKm * 0.6)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicle) return;

    const computedStatus: 'good' | 'due_soon' | 'overdue' =
      remainingKm <= 0 || remainingDays <= 0
        ? 'overdue'
        : remainingKm <= alertThresholdKm || remainingDays <= alertThresholdDays
        ? 'due_soon'
        : 'good';

    onSave({
      id: interval?.id || `mnt_${Date.now()}`,
      vehicleId: activeVehicle.id,
      vehiclePlate: activeVehicle.licensePlate,
      vehicleModel: `${activeVehicle.make} ${activeVehicle.model}`,
      organizationId: currentOrg?.id || activeVehicle.organizationId,
      serviceType,
      title,
      intervalKm,
      intervalDays,
      lastDoneOdometer,
      lastDoneDate: new Date(lastDoneDate).toISOString(),
      nextDueOdometer,
      nextDueDate: computedNextDueDate,
      remainingKm,
      remainingDays,
      status: computedStatus,
      estimatedCostUsd,
      preferredWorkshop,
      emailAlertsEnabled,
      alertThresholdKm,
      alertThresholdDays,
      alertRecipientEmails: ['fouad.tounsi@gmail.com'],
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900/60">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isEditing ? 'Configure Service Interval Schedule' : 'Create Proactive Service Interval'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated odometer calculation and email alert thresholds
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Vehicle Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Vehicle (Odometer Synchronized)
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => handleApplyVehicle(e.target.value)}
                disabled={isEditing}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.licensePlate} — {v.make} {v.model} ({v.odometer.toLocaleString()} km)
                  </option>
                ))}
              </select>

              {activeVehicle && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1 px-1">
                  <span>
                    Current Live Odometer:{' '}
                    <strong className="font-mono text-amber-600 dark:text-amber-400">
                      {activeVehicle.odometer.toLocaleString()} km
                    </strong>
                  </span>
                  <span>
                    Status:{' '}
                    <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                      {activeVehicle.status}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Service Type Preset */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Service Operation Preset
              </label>
              <select
                value={serviceType}
                onChange={(e) => handleServiceTypeChange(e.target.value as MaintenanceServiceType)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {SERVICE_PRESETS.map((p) => (
                  <option key={p.type} value={p.type}>
                    {p.label} (Standard ~{p.defaultKm.toLocaleString()} km / {p.defaultDays} days)
                  </option>
                ))}
              </select>
            </div>

            {/* Service Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Service Title / Operation Name
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Interval Configuration Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Interval Mileage (Kilometers)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={500}
                    step={500}
                    required
                    value={intervalKm}
                    onChange={(e) => setIntervalKm(Number(e.target.value))}
                    className="w-full pl-3 pr-10 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <span className="absolute right-3 top-1.5 text-xs text-slate-400">km</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Interval Duration (Days)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={15}
                    step={15}
                    required
                    value={intervalDays}
                    onChange={(e) => setIntervalDays(Number(e.target.value))}
                    className="w-full pl-3 pr-12 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <span className="absolute right-3 top-1.5 text-xs text-slate-400">days</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Last Completed Odometer
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    required
                    value={lastDoneOdometer}
                    onChange={(e) => setLastDoneOdometer(Number(e.target.value))}
                    className="w-full pl-3 pr-10 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <span className="absolute right-3 top-1.5 text-xs text-slate-400">km</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Last Completed Date
                </label>
                <input
                  type="date"
                  required
                  value={lastDoneDate}
                  onChange={(e) => setLastDoneDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Next Due Calculation Preview Banner */}
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-amber-900 dark:text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Calculated Next Due Targets:</span>
                </span>
                <span className="font-mono">
                  Due at <strong>{nextDueOdometer.toLocaleString()} km</strong> or{' '}
                  <strong>{new Date(computedNextDueDate).toLocaleDateString()}</strong>
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                <span>Remaining to Service:</span>
                <span
                  className={`font-bold font-mono ${
                    remainingKm <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {remainingKm <= 0 ? `OVERDUE by ${Math.abs(remainingKm)} km` : `${remainingKm.toLocaleString()} km`} (
                  {remainingDays <= 0 ? `Overdue by ${Math.abs(remainingDays)} days` : `${remainingDays} days left`})
                </span>
              </div>
            </div>

            {/* Cost & Preferred Workshop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Service Cost ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    min={0}
                    value={estimatedCostUsd}
                    onChange={(e) => setEstimatedCostUsd(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Workshop / Certified Garage
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midas Casablanca, Renault Dacia Service"
                  value={preferredWorkshop}
                  onChange={(e) => setPreferredWorkshop(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Email Alert Threshold Settings */}
            <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Automated Email Alert Triggers
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlertsEnabled}
                    onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-600" />
                </label>
              </div>

              {emailAlertsEnabled && (
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Send Warning Alert at:</span>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        min={100}
                        step={100}
                        value={alertThresholdKm}
                        onChange={(e) => setAlertThresholdKm(Number(e.target.value))}
                        className="w-full pl-3 pr-10 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                      <span className="absolute right-3 top-1.5 text-slate-400 text-[11px]">km before</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Or calendar advance:</span>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        min={1}
                        value={alertThresholdDays}
                        onChange={(e) => setAlertThresholdDays(Number(e.target.value))}
                        className="w-full pl-3 pr-12 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                      <span className="absolute right-3 top-1.5 text-slate-400 text-[11px]">days before</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Internal Service Notes / Special Instructions
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Check brake fluid reservoir and rotor thickness during service"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Save Changes' : 'Create Service Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
