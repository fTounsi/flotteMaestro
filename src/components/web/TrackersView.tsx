import React, { useState } from 'react';
import { Radio, Plus, ShieldCheck, Battery, Zap, Link, Unlink, Search, Smartphone, Cpu, X, Lock, Activity } from 'lucide-react';
import { Tracker, Vehicle, User } from '../../types/fleet';
import { TranslationDictionary } from '../../translations/i18n';
import { userHasPermission } from '../../types/rbac';

interface TrackersViewProps {
  trackers: Tracker[];
  vehicles: Vehicle[];
  currentUser?: User | null;
  onAddTracker: (tracker: Partial<Tracker>) => void;
  onAssignTracker: (trackerId: string, vehicleId: string) => void;
  t: TranslationDictionary;
}

export const TrackersView: React.FC<TrackersViewProps> = ({
  trackers,
  vehicles,
  currentUser,
  onAddTracker,
  onAssignTracker,
  t
}) => {
  const canManageTrackers = userHasPermission(currentUser, 'trackers:manage');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProtocol, setFilterProtocol] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Tracker Form State
  const [newModel, setNewModel] = useState('Teltonika FMB920');
  const [newProtocol, setNewProtocol] = useState<'teltonika' | 'coban' | 'concox' | 'obd2'>('teltonika');
  const [newImei, setNewImei] = useState('');
  const [newSim, setNewSim] = useState('+212 650 00 11 22');

  const filteredTrackers = trackers.filter((trk) => {
    const matchesSearch =
      trk.imei.includes(searchTerm) ||
      trk.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trk.vehiclePlate && trk.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesProtocol = filterProtocol === 'all' || trk.protocol === filterProtocol;
    return matchesSearch && matchesProtocol;
  });

  const handleCreateTracker = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTracker({
      model: newModel,
      protocol: newProtocol,
      imei: newImei || `86${Math.floor(1000000000000 + Math.random() * 8999999999999)}`,
      simPhoneNumber: newSim,
      manufacturer: newProtocol === 'teltonika' ? 'Teltonika Telematics' : 'Coban Electronics',
      firmwareVersion: '03.29.00.Rev.01',
      status: 'active',
      battery: 100,
      externalVoltage: 12.6,
      configuration: {
        reportIntervalSec: 10,
        overspeedThresholdKmH: 100,
        idleThresholdMinutes: 15
      }
    });
    setIsAddModalOpen(false);
    setNewImei('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-8 bg-white dark:bg-zinc-900/40 rounded-[32px] p-6 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm dark:shadow-2xl">
          <div className="border-l-2 border-emerald-500 pl-4 py-1">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-1 font-bold">
              Traccar Hardware Gateway
            </p>
            <h2 className="text-3xl font-black italic tracking-tight text-slate-900 dark:text-white">
              {t.nav.trackers}
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 max-w-xl">
              Manage physical GPS hardware telemetry units across Teltonika, Coban, Concox, and OBD-II CAN bus dongles.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 text-xs">
            <div>
              <span className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase tracking-wider block">Total Devices</span>
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{trackers.length}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase tracking-wider block">Active Online</span>
              <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {trackers.filter((t) => t.status === 'active').length}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase tracking-wider block">Paired to Fleet</span>
              <span className="text-2xl font-black font-mono text-slate-800 dark:text-zinc-200">
                {trackers.filter((t) => !!t.vehicleId).length}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-4">
          {canManageTrackers ? (
            <div
              onClick={() => setIsAddModalOpen(true)}
              className="bg-slate-900 text-white dark:bg-white dark:text-black rounded-[32px] p-6 flex flex-col justify-between hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white dark:hover:text-black transition-all cursor-pointer shadow-sm dark:shadow-2xl flex-1 group"
            >
              <div className="flex justify-between items-start">
                <p className="text-[10px] uppercase tracking-widest font-black">Provisioning</p>
                <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
              </div>
              <div>
                <h4 className="text-xl font-black leading-tight tracking-tight">
                  {t.actions.addTracker}
                </h4>
                <p className="text-[11px] text-slate-300 dark:text-zinc-700 mt-1 font-medium">
                  Register Teltonika / Coban IMEI
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900/40 rounded-[32px] p-6 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm dark:shadow-2xl flex-1">
              <div className="flex justify-between items-start">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 font-bold">Hardware Status</p>
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  Telemetry Gateway
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                  100% Signal Integrity across all active gateways
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tracker Grid & Filters */}
      <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm dark:shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by IMEI, model, plate..."
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-950 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs">
            {['all', 'teltonika', 'coban', 'concox', 'obd2'].map((prot) => (
              <button
                key={prot}
                onClick={() => setFilterProtocol(prot)}
                className={`px-3 py-1 rounded-xl font-bold uppercase text-[10px] transition-colors ${
                  filterProtocol === prot
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm'
                    : 'text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {prot}
              </button>
            ))}
          </div>
        </div>

        {/* Devices Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredTrackers.map((trk) => (
            <div
              key={trk.id}
              className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 rounded-[28px] p-5 shadow-sm dark:shadow-xl space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                    {trk.protocol}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">{trk.model}</h4>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  <span className="text-[10px] uppercase tracking-wider text-slate-600 dark:text-zinc-400 font-bold">
                    {trk.status}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900/40 p-3 rounded-2xl border border-slate-200 dark:border-zinc-850 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span className="text-[10px] uppercase font-sans text-slate-500 dark:text-zinc-500">IMEI:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{trk.imei}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span className="text-[10px] uppercase font-sans text-slate-500 dark:text-zinc-500">SIM:</span>
                  <span className="text-slate-800 dark:text-zinc-300">{trk.simPhoneNumber}</span>
                </div>
              </div>

              {/* Assignment Control */}
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-900 flex items-center justify-between text-xs">
                {trk.vehiclePlate ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-zinc-900 px-2 py-0.5 rounded-lg border border-emerald-500/20 dark:border-zinc-800">
                      Paired: {trk.vehiclePlate}
                    </span>
                    {canManageTrackers && (
                      <button
                        onClick={() => onAssignTracker(trk.id, '')}
                        className="text-slate-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 text-[10px] font-bold underline"
                      >
                        Unbind
                      </button>
                    )}
                  </div>
                ) : canManageTrackers ? (
                  <div className="w-full flex items-center gap-2">
                    <select
                      aria-label="Pair Vehicle"
                      onChange={(e) => onAssignTracker(trk.id, e.target.value)}
                      className="flex-1 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl px-2 py-1 text-xs text-slate-800 dark:text-zinc-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Pair Vehicle --</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.licensePlate} ({v.make} {v.model})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono italic">Unassigned hardware unit</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Tracker Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#080808] border border-slate-200 dark:border-zinc-800 rounded-[32px] w-full max-w-2xl shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-white space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div className="border-l-2 border-emerald-500 pl-4 py-0.5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.actions.addTracker}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Pair GPS hardware via IMEI & configure cellular telemetry protocol.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 text-slate-400 hover:text-white border border-slate-200 dark:border-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTracker} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Hardware Protocol
                </label>
                <select
                  aria-label="Hardware Protocol"
                  value={newProtocol}
                  onChange={(e) => setNewProtocol(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="teltonika">Teltonika (FMB920 / FMC130)</option>
                  <option value="coban">Coban (GPS103 / GPS303)</option>
                  <option value="concox">Concox (GT06N / WeTrack)</option>
                  <option value="obd2">OBD-II CAN Dongle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Device Model
                </label>
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  IMEI Serial
                </label>
                <input
                  type="text"
                  value={newImei}
                  onChange={(e) => setNewImei(e.target.value)}
                  placeholder="e.g. 868120392817294"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-900 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-sm"
                >
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
