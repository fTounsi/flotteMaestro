import React, { useState } from 'react';
import { Shield, Plus, MapPin, Trash2, Edit2, AlertCircle, X, Check } from 'lucide-react';
import { Geofence } from '../../types/fleet';
import { TranslationDictionary } from '../../translations/i18n';

interface GeofencesViewProps {
  geofences: Geofence[];
  onAddGeofence: (geofence: Partial<Geofence>) => void;
  onDeleteGeofence: (id: string) => void;
  t: TranslationDictionary;
}

export const GeofencesView: React.FC<GeofencesViewProps> = ({
  geofences,
  onAddGeofence,
  onDeleteGeofence,
  t
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'circle' | 'polygon'>('circle');
  const [radiusMeters, setRadiusMeters] = useState(1500);
  const [color, setColor] = useState('#10b981');
  const [category, setCategory] = useState<'depot' | 'client_site' | 'restricted' | 'custom'>('depot');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onAddGeofence({
      name,
      type,
      category,
      color,
      radiusMeters: type === 'circle' ? radiusMeters : undefined,
      center: [33.5731 + (Math.random() - 0.5) * 0.05, -7.5898 + (Math.random() - 0.5) * 0.05],
      coordinates:
        type === 'polygon'
          ? [
              [33.57, -7.59],
              [33.59, -7.57],
              [33.58, -7.55],
              [33.56, -7.56]
            ]
          : undefined,
      active: true,
      alertOnEnter: true,
      alertOnExit: true
    });

    setIsAddModalOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-8 bg-zinc-900/40 rounded-[32px] p-6 border border-zinc-800 flex flex-col justify-between shadow-2xl">
          <div className="border-l-2 border-emerald-500 pl-4 py-1">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">
              Spatial Perimeter Boundaries
            </p>
            <h2 className="text-3xl font-black italic tracking-tight text-white">
              {t.nav.geofences}
            </h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-xl">
              Define virtual geofence zones, automated ingress/egress triggers, loading dock boundaries, and security perimeters.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-zinc-800 text-xs">
            <div>
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider block">Defined Zones</span>
              <span className="text-2xl font-black font-mono text-white">{geofences.length}</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider block">Active Triggers</span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {geofences.filter((g) => g.active).length}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider block">Total Area Covered</span>
              <span className="text-2xl font-black font-mono text-zinc-200">142 km²</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-4">
          <div
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white text-black rounded-[32px] p-6 flex flex-col justify-between hover:bg-emerald-400 transition-all cursor-pointer shadow-2xl flex-1 group"
          >
            <div className="flex justify-between items-start">
              <p className="text-[10px] uppercase tracking-widest font-black">Spatial Builder</p>
              <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
            </div>
            <div>
              <h4 className="text-xl font-black leading-tight tracking-tight">
                {t.actions.addGeofence}
              </h4>
              <p className="text-[11px] text-zinc-700 mt-1 font-medium">
                Circle Radius or Multi-Point Polygon
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Geofence Cards Grid */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-[32px] p-6 shadow-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {geofences.map((geo) => (
            <div
              key={geo.id}
              className="bg-zinc-950/60 border border-zinc-800/80 rounded-[28px] p-5 shadow-xl space-y-3 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 bottom-0 w-1.5"
                style={{ backgroundColor: geo.color || '#10b981' }}
              />

              <div className="flex justify-between items-start pl-2">
                <div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800 font-bold">
                    {geo.category}
                  </span>
                  <h4 className="text-base font-extrabold text-white mt-1.5">{geo.name}</h4>
                </div>
                <button
                  onClick={() => onDeleteGeofence(geo.id)}
                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-rose-950 text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pl-2 space-y-1 text-xs text-zinc-400 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-sans">Geometry:</span>
                  <span className="uppercase text-white">{geo.type} ({geo.radiusMeters ? `${geo.radiusMeters}m` : 'Polygon'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-sans">Ingress Alert:</span>
                  <span className="text-emerald-400 font-bold">ENABLED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-sans">Egress Alert:</span>
                  <span className="text-emerald-400 font-bold">ENABLED</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Geofence Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#080808] border border-zinc-800 rounded-[32px] w-full max-w-md shadow-2xl p-6 text-white space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="border-l-2 border-emerald-500 pl-3">
                <h3 className="text-lg font-black italic">{t.actions.addGeofence}</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Casablanca Logistics Hub North"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Geometry Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2 text-xs text-white"
                  >
                    <option value="circle">Circular Radius</option>
                    <option value="polygon">Polygon Boundary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2 text-xs text-white"
                  >
                    <option value="depot">Depot Hub</option>
                    <option value="client_site">Client Destination</option>
                    <option value="restricted">Restricted Zone</option>
                  </select>
                </div>
              </div>

              {type === 'circle' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Radius: {radiusMeters} Meters
                  </label>
                  <input
                    type="range"
                    min={200}
                    max={10000}
                    step={100}
                    value={radiusMeters}
                    onChange={(e) => setRadiusMeters(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>
              )}

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
                  Save Geofence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
