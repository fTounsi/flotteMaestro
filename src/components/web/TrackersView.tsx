import React, { useState } from 'react';
import { Radio, Plus, ShieldCheck, Battery, Zap, Link, Unlink, Search, Smartphone, Cpu, X } from 'lucide-react';
import { Tracker, Vehicle } from '../../types/fleet';
import { TranslationDictionary } from '../../translations/i18n';

interface TrackersViewProps {
  trackers: Tracker[];
  vehicles: Vehicle[];
  onAddTracker: (tracker: Partial<Tracker>) => void;
  onAssignTracker: (trackerId: string, vehicleId: string) => void;
  t: TranslationDictionary;
}

export const TrackersView: React.FC<TrackersViewProps> = ({
  trackers,
  vehicles,
  onAddTracker,
  onAssignTracker,
  t
}) => {
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
        <div className="md:col-span-8 bg-zinc-900/40 rounded-[32px] p-6 border border-zinc-800 flex flex-col justify-between shadow-2xl">
          <div className="border-l-2 border-emerald-500 pl-4 py-1">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">
              Traccar Hardware Gateway
            </p>
            <h2 className="text-3xl font-black italic tracking-tight text-white">
              {t.nav.trackers}
            </h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-xl">
              Manage physical GPS hardware telemetry units across Teltonika, Coban, Concox, and OBD-II CAN bus dongles.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-zinc-800 text-xs">
            <div>
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider block">Total Devices</span>
              <span className="text-2xl font-black font-mono text-white">{trackers.length}</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider block">Active Online</span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {trackers.filter((t) => t.status === 'active').length}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider block">Paired to Fleet</span>
              <span className="text-2xl font-black font-mono text-zinc-200">
                {trackers.filter((t) => !!t.vehicleId).length}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-4">
          <div
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white text-black rounded-[32px] p-6 flex flex-col justify-between hover:bg-emerald-400 transition-all cursor-pointer shadow-2xl flex-1 group"
          >
            <div className="flex justify-between items-start">
              <p className="text-[10px] uppercase tracking-widest font-black">Provisioning</p>
              <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
            </div>
            <div>
              <h4 className="text-xl font-black leading-tight tracking-tight">
                {t.actions.addTracker}
              </h4>
              <p className="text-[11px] text-zinc-700 mt-1 font-medium">
                Register Teltonika / Coban IMEI
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tracker Grid & Filters */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-[32px] p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by IMEI, model, plate..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-xs">
            {['all', 'teltonika', 'coban', 'concox', 'obd2'].map((prot) => (
              <button
                key={prot}
                onClick={() => setFilterProtocol(prot)}
                className={`px-3 py-1 rounded-xl font-bold uppercase text-[10px] transition-colors ${
                  filterProtocol === prot ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
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
              className="bg-zinc-950/60 border border-zinc-800/80 rounded-[28px] p-5 shadow-xl space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-zinc-900 text-emerald-400 border border-zinc-700 font-bold">
                    {trk.protocol}
                  </span>
                  <h4 className="text-sm font-extrabold text-white mt-1.5">{trk.model}</h4>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                    {trk.status}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-850 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span className="text-[10px] uppercase font-sans text-zinc-500">IMEI:</span>
                  <span className="text-white font-bold">{trk.imei}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span className="text-[10px] uppercase font-sans text-zinc-500">SIM:</span>
                  <span className="text-zinc-300">{trk.simPhoneNumber}</span>
                </div>
              </div>

              {/* Assignment Control */}
              <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs">
                {trk.vehiclePlate ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono font-bold text-emerald-400 bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-800">
                      Paired: {trk.vehiclePlate}
                    </span>
                    <button
                      onClick={() => onAssignTracker(trk.id, '')}
                      className="text-zinc-500 hover:text-rose-400 text-[10px] font-bold underline"
                    >
                      Unbind
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex items-center gap-2">
                    <select
                      aria-label="Pair Vehicle"
                      onChange={(e) => onAssignTracker(trk.id, e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1 text-xs text-zinc-300 focus:outline-none"
                    >
                      <option value="">-- Pair Vehicle --</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.licensePlate} ({v.make} {v.model})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Tracker Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#080808] border border-zinc-800 rounded-[32px] w-full max-w-md shadow-2xl p-6 text-white space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="border-l-2 border-emerald-500 pl-3">
                <h3 className="text-lg font-black italic">{t.actions.addTracker}</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTracker} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Hardware Protocol
                </label>
                <select
                  aria-label="Hardware Protocol"
                  value={newProtocol}
                  onChange={(e) => setNewProtocol(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2 text-xs text-white"
                >
                  <option value="teltonika">Teltonika (FMB920 / FMC130)</option>
                  <option value="coban">Coban (GPS103 / GPS303)</option>
                  <option value="concox">Concox (GT06N / WeTrack)</option>
                  <option value="obd2">OBD-II CAN Dongle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Device Model
                </label>
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  IMEI Serial
                </label>
                <input
                  type="text"
                  value={newImei}
                  onChange={(e) => setNewImei(e.target.value)}
                  placeholder="e.g. 868120392817294"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-2xl bg-zinc-900 text-xs font-bold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-white hover:bg-emerald-400 text-black text-xs font-black shadow-lg"
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
