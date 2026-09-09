import React from 'react';
import {
  X,
  Truck,
  Gauge,
  Battery,
  MapPin,
  Calendar,
  User as UserIcon,
  Phone,
  Radio,
  Clock,
  ShieldCheck,
  Thermometer,
  FileText,
  Play,
  Terminal,
  Zap
} from 'lucide-react';
import { Vehicle, User } from '../../types/fleet';
import { TranslationDictionary } from '../../translations/i18n';
import { userHasPermission } from '../../types/rbac';
import { VehicleTelemetryGraph } from './VehicleTelemetryGraph';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  currentUser?: User | null;
  onClose: () => void;
  onOpenTripReplay: (vehicle: Vehicle) => void;
  onOpenTerminal?: (vehicle: Vehicle) => void;
  t: TranslationDictionary;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  currentUser,
  onClose,
  onOpenTripReplay,
  onOpenTerminal,
  t
}) => {
  if (!vehicle) return null;

  const canSendCommands = userHasPermission(currentUser, 'vehicles:commands');
  const pos = vehicle.latestPosition;

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 dark:bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#080808] border border-slate-200 dark:border-zinc-800 rounded-[32px] w-full max-w-[95vw] xl:max-w-7xl h-[90vh] max-h-[92vh] shadow-2xl overflow-hidden text-slate-900 dark:text-white flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Vehicle Image Banner */}
        <div className="relative h-40 sm:h-48 w-full bg-slate-100 dark:bg-black overflow-hidden border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <img
            src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80'}
            alt={vehicle.model}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60 dark:opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 dark:from-[#080808] dark:via-[#080808]/60 to-transparent" />

          <button
            onClick={onClose}
            aria-label="Close vehicle details"
            className="absolute top-4 right-4 p-2 rounded-2xl bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-zinc-700 shadow-sm z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-zinc-900 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-mono font-bold">
                  {vehicle.licensePlate}
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 font-bold border border-slate-200 dark:border-zinc-700">
                  {vehicle.vehicleType}
                </span>
                <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">{vehicle.fleetName}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                {vehicle.make} <span className="not-italic text-slate-500 dark:text-zinc-400">{vehicle.model}</span> ({vehicle.modelYear})
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {onOpenTerminal && (
                <button
                  onClick={() => {
                    onOpenTerminal(vehicle);
                  }}
                  title={canSendCommands ? 'Dispatch Downlink Telematics Commands' : 'Permission Required (vehicles:commands)'}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                    canSendCommands
                      ? 'bg-white hover:bg-slate-50 text-emerald-700 border-emerald-300 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 dark:text-emerald-400 dark:border-emerald-500/40 dark:hover:border-emerald-400 shadow-xs'
                      : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-zinc-900/40 dark:text-zinc-600 dark:border-zinc-800 cursor-not-allowed'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Downlink Terminal</span>
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onOpenTripReplay(vehicle);
                }}
                className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-white dark:hover:bg-emerald-400 dark:text-black font-black text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.actions.viewHistory}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body - Multi-column Workstation */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Diagnostics & Hardware Status (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="border-l-2 border-emerald-500 pl-4 py-1 mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 font-bold">
                    OBD-II & Hardware Telemetry
                  </p>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Live Diagnostics</h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                    <span className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-semibold block">
                      Speed (CAN-BUS)
                    </span>
                    <span className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                      {pos.speed} <span className="text-xs text-slate-500 dark:text-zinc-500 font-normal">km/h</span>
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                    <span className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-semibold block">
                      Battery Level
                    </span>
                    <span className="text-2xl font-mono font-black text-slate-900 dark:text-white">
                      {pos.battery}%
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                    <span className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-semibold block">
                      Ignition State
                    </span>
                    <span
                      className={`text-lg font-mono font-bold ${
                        pos.ignition ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-zinc-500'
                      }`}
                    >
                      {pos.ignition ? 'ACTIVE' : 'STANDBY'}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                    <span className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-semibold block">
                      Odometer Total
                    </span>
                    <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                      {vehicle.odometer.toLocaleString()} km
                    </span>
                  </div>
                </div>
              </div>

              {/* Location & GPS Hardware Info */}
              <div className="bg-slate-50 dark:bg-zinc-900/40 p-5 rounded-[24px] border border-slate-200 dark:border-zinc-800 space-y-3 shadow-xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                    Current GPS Location
                  </span>
                  <span className="font-mono text-slate-600 dark:text-zinc-400">
                    {pos.latitude.toFixed(5)}, {pos.longitude.toFixed(5)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {pos.address || 'Real-time telemetry coordinates streamed via Traccar adapter'}
                </p>
              </div>

              {/* Vehicle Metadata Specification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-zinc-900/40 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase tracking-wider">VIN</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white break-all">{vehicle.vin}</span>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-900/40 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase tracking-wider">Protocol</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    {vehicle.trackerProtocol || 'TELTONIKA'}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-900/40 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase tracking-wider">Tracker IMEI</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{vehicle.trackerImei || '868120492817294'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: 60-Minute Real-Time Telemetry Graph & Analytics (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="border-l-2 border-emerald-500 pl-4 py-1 mb-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 font-bold">
                  Telemetry Stream Dynamics
                </p>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">60-Minute Trend & Telematics Analysis</h4>
              </div>

              {/* Recharts 60-Minute Real-Time Telemetry Graph */}
              <div className="bg-slate-50 dark:bg-zinc-900/30 p-4 rounded-3xl border border-slate-200 dark:border-zinc-800">
                <VehicleTelemetryGraph vehicle={vehicle} />
              </div>

              {/* Additional Diagnostics Metrics */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase tracking-wider block mb-1">Satellite Lock</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-slate-900 dark:text-white font-mono">14 Sats (3D Fix)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase tracking-wider block mb-1">GPRS Signal</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">CSQ 28 (-57 dBm)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase tracking-wider block mb-1">Fuel Level (CAN)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{vehicle.fuelLevel || 68}% Full</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
