import React, { useState } from 'react';
import { Shield, Plus, MapPin, Trash2, Edit2, AlertCircle, X, Check, Map, Compass } from 'lucide-react';
import { Geofence, User } from '../../types/fleet';
import { TranslationDictionary } from '../../translations/i18n';
import { userHasPermission } from '../../types/rbac';

interface GeofencesViewProps {
  geofences: Geofence[];
  currentUser?: User | null;
  onAddGeofence: (geofence: Partial<Geofence>) => void;
  onDeleteGeofence: (id: string) => void;
  t: TranslationDictionary;
}

export const GeofencesView: React.FC<GeofencesViewProps> = ({
  geofences,
  currentUser,
  onAddGeofence,
  onDeleteGeofence,
  t
}) => {
  const canManageGeofences = userHasPermission(currentUser, 'geofences:manage');
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
        <div className="md:col-span-8 bg-white dark:bg-zinc-900/40 rounded-[32px] p-6 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs dark:shadow-2xl">
          <div className="border-l-2 border-emerald-500 pl-4 py-1">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-1 font-bold">
              Spatial Perimeter Boundaries
            </p>
            <h2 className="text-3xl font-black italic tracking-tight text-slate-900 dark:text-white">
              {t.nav.geofences}
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 max-w-xl">
              Define virtual geofence zones, automated ingress/egress triggers, loading dock boundaries, and security perimeters.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 text-xs">
            <div>
              <span className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase tracking-wider block">Defined Zones</span>
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{geofences.length}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase tracking-wider block">Active Triggers</span>
              <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {geofences.filter((g) => g.active).length}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase tracking-wider block">Total Area Covered</span>
              <span className="text-2xl font-black font-mono text-slate-800 dark:text-zinc-200">142 km²</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-4">
          {canManageGeofences ? (
            <div
              onClick={() => setIsAddModalOpen(true)}
              className="bg-emerald-600 text-white dark:bg-white dark:text-black rounded-[32px] p-6 flex flex-col justify-between hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-all cursor-pointer shadow-xs dark:shadow-2xl flex-1 group"
            >
              <div className="flex justify-between items-start">
                <p className="text-[10px] uppercase tracking-widest font-black">Spatial Builder</p>
                <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
              </div>
              <div>
                <h4 className="text-xl font-black leading-tight tracking-tight">
                  {t.actions.addGeofence}
                </h4>
                <p className="text-[11px] text-emerald-100 dark:text-zinc-700 mt-1 font-medium">
                  Circle Radius or Multi-Point Polygon
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900/40 rounded-[32px] p-6 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs dark:shadow-2xl flex-1">
              <div className="flex justify-between items-start">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 font-bold">Spatial Perimeter</p>
                <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  Geofence Monitoring
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Automated entry & exit event triggers active
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Geofence Cards Grid */}
      <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-xs dark:shadow-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {geofences.map((geo) => (
            <div
              key={geo.id}
              className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 rounded-[28px] p-5 shadow-xs dark:shadow-xl space-y-3 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 bottom-0 w-1.5"
                style={{ backgroundColor: geo.color || '#10b981' }}
              />

              <div className="flex justify-between items-start pl-2">
                <div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 font-bold">
                    {geo.category}
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">{geo.name}</h4>
                </div>
                {canManageGeofences && (
                  <button
                    onClick={() => onDeleteGeofence(geo.id)}
                    className="p-1.5 rounded-xl bg-slate-200/80 hover:bg-rose-100 text-slate-600 hover:text-rose-600 dark:bg-zinc-900 dark:hover:bg-rose-950 dark:text-zinc-500 dark:hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="pl-2 space-y-1 text-xs text-slate-600 dark:text-zinc-400 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-500 font-sans">Geometry:</span>
                  <span className="uppercase text-slate-900 dark:text-white">{geo.type} ({geo.radiusMeters ? `${geo.radiusMeters}m` : 'Polygon'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-500 font-sans">Ingress Alert:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">ENABLED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-500 font-sans">Egress Alert:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">ENABLED</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Geofence Modal - Almost Full Screen Studio */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 dark:bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#080808] border border-slate-200 dark:border-zinc-800 rounded-[32px] w-full max-w-[95vw] xl:max-w-6xl h-[88vh] max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-4 sm:py-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-950/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-500">
                      Geofencing & Boundary Studio
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      GPS GEOFENCE ENGINE
                    </span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
                    {t.actions.addGeofence}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors border border-slate-200 dark:border-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreate} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Form Controls (6 cols) */}
                  <div className="lg:col-span-6 space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                        Zone Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Casablanca Logistics Hub North"
                        required
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                          Geometry Type
                        </label>
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value as any)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="circle">Circular Radius</option>
                          <option value="polygon">Polygon Boundary</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                          Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as any)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="depot">Depot Hub</option>
                          <option value="client_site">Client Destination</option>
                          <option value="restricted">Restricted Zone</option>
                          <option value="custom">Custom Boundary</option>
                        </select>
                      </div>
                    </div>

                    {type === 'circle' && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                            Zone Radius
                          </span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">
                            {radiusMeters.toLocaleString()} Meters ({(radiusMeters / 1000).toFixed(1)} km)
                          </span>
                        </div>
                        <input
                          type="range"
                          min={200}
                          max={10000}
                          step={100}
                          value={radiusMeters}
                          onChange={(e) => setRadiusMeters(Number(e.target.value))}
                          className="w-full accent-emerald-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-600 font-mono">
                          <span>200m (Strict Depot)</span>
                          <span>5,000m (City District)</span>
                          <span>10,000m (Regional)</span>
                        </div>
                      </div>
                    )}

                    {/* Zone Border Color */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                        Map Marker & Outline Accent Color
                      </label>
                      <div className="flex items-center gap-3">
                        {['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center ${
                              color === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-400 dark:ring-zinc-600' : 'hover:scale-105'
                            }`}
                            style={{ backgroundColor: c }}
                          >
                            {color === c && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Alert Rule Configuration */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 block">
                        Automated Trigger Rules
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded accent-emerald-500" />
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">Alert on Entry</span>
                        </label>
                        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded accent-emerald-500" />
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">Alert on Exit</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Visual Boundary Radar & Coordinate Geometry (6 cols) */}
                  <div className="lg:col-span-6 flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                        Boundary Geometry & Spatial Radar
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        COORDINATES: 33.5731° N, 7.5898° W
                      </span>
                    </div>

                    {/* Spatial Visualizer Canvas */}
                    <div className="flex-1 min-h-[320px] rounded-3xl bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />

                      {/* Radar Rings */}
                      <div className="relative flex items-center justify-center">
                        <div
                          className="rounded-full border border-dashed transition-all duration-300 flex items-center justify-center animate-pulse"
                          style={{
                            width: `${Math.min(260, Math.max(80, radiusMeters / 30))}px`,
                            height: `${Math.min(260, Math.max(80, radiusMeters / 30))}px`,
                            borderColor: color,
                            backgroundColor: `${color}15`
                          }}
                        >
                          <div
                            className="w-3 h-3 rounded-full shadow-lg"
                            style={{ backgroundColor: color }}
                          />
                        </div>

                        {/* Radar Crosshairs */}
                        <div className="absolute w-64 h-[1px] bg-slate-700/50 pointer-events-none" />
                        <div className="absolute h-64 w-[1px] bg-slate-700/50 pointer-events-none" />
                      </div>

                      {/* Spatial Badge Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-zinc-400 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800">
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">Zone Coverage Area</span>
                          <span className="font-bold text-white">
                            {(Math.PI * Math.pow(radiusMeters / 1000, 2)).toFixed(2)} km²
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-500 block text-[9px] uppercase">Spatial Projection</span>
                          <span className="font-bold text-emerald-400">WGS 84 / EPSG:4326</span>
                        </div>
                      </div>
                    </div>

                    {/* Geofence Rule Summary Strip */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-emerald-500" />
                        <span className="text-slate-600 dark:text-zinc-400">
                          Boundary anchor automatically locked to active fleet center
                        </span>
                      </div>
                      <span className="font-mono text-slate-900 dark:text-white font-bold">CASABLANCA REGION</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/80 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500 dark:text-zinc-500">
                  New geofence will immediately broadcast to all active telematics hardware units.
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-all flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Geofence</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
