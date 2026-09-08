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
    <div className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#080808] border border-zinc-800 rounded-[32px] w-full max-w-3xl shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Vehicle Image Banner */}
        <div className="relative h-44 sm:h-52 w-full bg-black overflow-hidden border-b border-zinc-800">
          <img
            src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80'}
            alt={vehicle.model}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent" />

          <button
            onClick={onClose}
            aria-label="Close vehicle details"
            className="absolute top-4 right-4 p-2 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-700"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-zinc-900 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                  {vehicle.licensePlate}
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-bold">
                  {vehicle.vehicleType}
                </span>
                <span className="text-xs text-zinc-400">{vehicle.fleetName}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter italic">
                {vehicle.make} <span className="not-italic text-zinc-400">{vehicle.model}</span> ({vehicle.modelYear})
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
                      ? 'bg-zinc-900/90 hover:bg-zinc-800 text-emerald-400 border-emerald-500/40 hover:border-emerald-400 shadow-md'
                      : 'bg-zinc-900/40 text-zinc-600 border-zinc-800 cursor-not-allowed'
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
                className="px-4 py-2 rounded-2xl bg-white hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-2 shadow-xl transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>{t.actions.viewHistory}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Real-time Telemetry Dashboard Gauges */}
          <div>
            <div className="border-l-2 border-emerald-500 pl-4 py-1 mb-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                OBD-II & Hardware Telemetry
              </p>
              <h4 className="text-lg font-bold text-white">Live Diagnostics</h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold block">
                  Speed (CAN-BUS)
                </span>
                <span className="text-2xl font-mono font-black text-emerald-400">
                  {pos.speed} <span className="text-xs text-zinc-500 font-normal">km/h</span>
                </span>
              </div>

              <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold block">
                  Battery Level
                </span>
                <span className="text-2xl font-mono font-black text-white">
                  {pos.battery}%
                </span>
              </div>

              <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold block">
                  Ignition State
                </span>
                <span
                  className={`text-lg font-mono font-bold ${
                    pos.ignition ? 'text-emerald-400' : 'text-zinc-500'
                  }`}
                >
                  {pos.ignition ? 'ACTIVE' : 'STANDBY'}
                </span>
              </div>

              <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold block">
                  Odometer Total
                </span>
                <span className="text-lg font-mono font-bold text-white">
                  {vehicle.odometer.toLocaleString()} km
                </span>
              </div>
            </div>
          </div>

          {/* Recharts 60-Minute Real-Time Telemetry Graph */}
          <VehicleTelemetryGraph vehicle={vehicle} />

          {/* Location & GPS Hardware Info */}
          <div className="bg-zinc-900/40 p-5 rounded-[24px] border border-zinc-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                Current GPS Location
              </span>
              <span className="font-mono text-zinc-400">
                {pos.latitude.toFixed(5)}, {pos.longitude.toFixed(5)}
              </span>
            </div>
            <p className="text-sm font-semibold text-white">
              {pos.address || 'Real-time telemetry coordinates streamed via Traccar adapter'}
            </p>
          </div>

          {/* Vehicle Metadata Specification */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">VIN</span>
              <span className="font-mono font-bold text-white">{vehicle.vin}</span>
            </div>
            <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Tracker Protocol</span>
              <span className="font-mono font-bold text-emerald-400 uppercase">
                {vehicle.trackerProtocol || 'TELTONIKA'}
              </span>
            </div>
            <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Tracker IMEI</span>
              <span className="font-mono font-bold text-white">{vehicle.trackerImei || '868120492817294'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
