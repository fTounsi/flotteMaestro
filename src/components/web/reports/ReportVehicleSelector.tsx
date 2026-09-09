import React, { useState, useMemo } from 'react';
import { Vehicle } from '../../../types/fleet';
import {
  Car,
  Truck,
  Search,
  CheckSquare,
  Square,
  Users,
  Check,
  X,
  Layers,
  Sparkles,
  Shield,
  Thermometer,
  Zap
} from 'lucide-react';

interface ReportVehicleSelectorProps {
  vehicles: Vehicle[];
  vehicleScope: 'all' | 'selected' | 'fleet';
  selectedVehicleIds: string[];
  selectedFleetTag?: string;
  onScopeChange: (scope: 'all' | 'selected' | 'fleet') => void;
  onSelectVehicleIds: (ids: string[]) => void;
  onFleetTagChange: (tag: string) => void;
}

export const ReportVehicleSelector: React.FC<ReportVehicleSelectorProps> = ({
  vehicles,
  vehicleScope,
  selectedVehicleIds,
  selectedFleetTag,
  onScopeChange,
  onSelectVehicleIds,
  onFleetTagChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Extract unique fleet groups
  const fleetGroups = useMemo(() => {
    const groups = new Set<string>();
    vehicles.forEach((v) => {
      if (v.fleetName) groups.add(v.fleetName);
    });
    return Array.from(groups);
  }, [vehicles]);

  // Filtered vehicle items for multi-select list
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const plate = (v.licensePlate || v.id).toLowerCase();
      const makeModel = `${v.make} ${v.model}`.toLowerCase();
      const driver = (v.assignedDriver?.name || '').toLowerCase();
      const matchesSearch =
        plate.includes(searchTerm.toLowerCase()) ||
        makeModel.includes(searchTerm.toLowerCase()) ||
        driver.includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || v.vehicleType === filterType;
      return matchesSearch && matchesType;
    });
  }, [vehicles, searchTerm, filterType]);

  const toggleVehicle = (id: string) => {
    if (selectedVehicleIds.includes(id)) {
      onSelectVehicleIds(selectedVehicleIds.filter((vId) => vId !== id));
    } else {
      onSelectVehicleIds([...selectedVehicleIds, id]);
    }
  };

  const handleSelectAll = () => {
    onSelectVehicleIds(filteredVehicles.map((v) => v.id));
  };

  const handleClearAll = () => {
    onSelectVehicleIds([]);
  };

  const handleSelectActiveOnly = () => {
    const activeIds = vehicles.filter((v) => v.status === 'moving' || v.status === 'idle').map((v) => v.id);
    onSelectVehicleIds(activeIds);
  };

  const handleSelectByType = (type: string) => {
    const typeIds = vehicles.filter((v) => v.vehicleType === type).map((v) => v.id);
    onSelectVehicleIds(typeIds);
  };

  return (
    <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-5 shadow-sm dark:shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <Car className="w-4 h-4" />
            </span>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-zinc-300">
              1. Fleet & Vehicle Scope
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Audit entire fleet or isolate specific vehicles & operational divisions.
          </p>
        </div>

        {/* Selected Counter Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {vehicleScope === 'all'
              ? `All ${vehicles.length} Vehicles`
              : vehicleScope === 'selected'
              ? `${selectedVehicleIds.length} of ${vehicles.length} Chosen`
              : `Cohort: ${selectedFleetTag || 'Division'}`}
          </span>
        </div>
      </div>

      {/* Scope Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => onScopeChange('all')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            vehicleScope === 'all'
              ? 'bg-emerald-500 text-black shadow-md sm:shadow-lg shadow-emerald-500/20 font-black'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Fleet ({vehicles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => onScopeChange('selected')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            vehicleScope === 'selected'
              ? 'bg-emerald-500 text-black shadow-md sm:shadow-lg shadow-emerald-500/20 font-black'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Custom Selection</span>
        </button>

        <button
          type="button"
          onClick={() => onScopeChange('fleet')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            vehicleScope === 'fleet'
              ? 'bg-emerald-500 text-black shadow-md sm:shadow-lg shadow-emerald-500/20 font-black'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>By Fleet Group</span>
        </button>
      </div>

      {/* Scope Details: ALL FLEET VIEW */}
      {vehicleScope === 'all' && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 dark:text-zinc-300">
            <span className="font-bold text-slate-900 dark:text-white">Full Consolidated Fleet Scope:</span> Generating aggregated
            operational metrics across all {vehicles.length} active registered vehicles.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onScopeChange('selected');
                onSelectVehicleIds(vehicles.map((v) => v.id));
              }}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline"
            >
              Customize individual vehicles
            </button>
          </div>
        </div>
      )}

      {/* Scope Details: FLEET GROUP VIEW */}
      {vehicleScope === 'fleet' && (
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
          <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
            Select Fleet / Operational Division
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {fleetGroups.map((group) => {
              const count = vehicles.filter((v) => v.fleetName === group).length;
              const isSelected = selectedFleetTag === group;
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => onFleetTagChange(group)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-slate-900 dark:text-white shadow-md'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{group}</p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">{count} vehicles assigned</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Scope Details: SPECIFIC VEHICLES MULTI-PICKER */}
      {vehicleScope === 'selected' && (
        <div className="space-y-3 pt-1">
          {/* Quick Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search plate, model, driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto justify-end text-[10px]">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 font-bold"
              >
                Select All ({filteredVehicles.length})
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-zinc-800 font-bold"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSelectActiveOnly}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-zinc-800 font-bold"
              >
                Active Only
              </button>
            </div>
          </div>

          {/* Selected Chips Strip (if any) */}
          {selectedVehicleIds.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-h-20 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 mr-1">Selected:</span>
              {selectedVehicleIds.map((vId) => {
                const veh = vehicles.find((v) => v.id === vId);
                if (!veh) return null;
                const plate = veh.licensePlate || vId;
                return (
                  <span
                    key={vId}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-mono font-bold"
                  >
                    <span>{plate}</span>
                    <button
                      type="button"
                      onClick={() => toggleVehicle(vId)}
                      className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Scrollable Vehicle Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredVehicles.length === 0 ? (
              <div className="col-span-2 text-center py-6 text-slate-400 dark:text-zinc-500 text-xs">
                No vehicles match search criteria.
              </div>
            ) : (
              filteredVehicles.map((v) => {
                const isChecked = selectedVehicleIds.includes(v.id);
                const plate = v.licensePlate || v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => toggleVehicle(v.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 select-none ${
                      isChecked
                        ? 'bg-emerald-50 dark:bg-zinc-900 border-emerald-500/60 shadow-sm'
                        : 'bg-slate-50 dark:bg-zinc-950/70 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1 rounded ${isChecked ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-600'}`}>
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-slate-900 dark:text-white truncate">
                            {plate}
                          </span>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              v.status === 'moving'
                                ? 'bg-emerald-500'
                                : v.status === 'idle'
                                ? 'bg-amber-500'
                                : 'bg-slate-400 dark:bg-zinc-500'
                            }`}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                          {v.make} {v.model} • {v.assignedDriver?.name || 'No driver'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0">
                      {v.vehicleType}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
