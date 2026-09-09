import React from 'react';
import {
  Filter,
  Calendar,
  Layers,
  Search,
  RotateCcw,
  SlidersHorizontal,
  Car,
  Truck,
  CheckSquare,
  Sparkles,
  Download,
  Building2
} from 'lucide-react';
import { AnalyticsFilterState, TimeHorizon } from '../../../../utils/analyticsCalculator';
import { Vehicle } from '../../../../types/fleet';

interface AnalyticsFilterBarProps {
  vehicles: Vehicle[];
  filter: AnalyticsFilterState;
  availableGroups: { name: string; count: number }[];
  onFilterChange: (newFilter: Partial<AnalyticsFilterState>) => void;
  onReset: () => void;
  onExportCsv?: () => void;
}

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
  vehicles,
  filter,
  availableGroups,
  onFilterChange,
  onReset,
  onExportCsv
}) => {
  const timeHorizons: { id: TimeHorizon; label: string }[] = [
    { id: '7d', label: 'Last 7 Days' },
    { id: '14d', label: 'Last 14 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Quarter (90d)' }
  ];

  const vehicleTypes = [
    { id: 'all', label: 'All Types' },
    { id: 'truck', label: 'Heavy Trucks' },
    { id: 'van', label: 'Delivery Vans' },
    { id: 'reefer', label: 'Cold-Chain Reefers' },
    { id: 'sedan', label: 'Sedans & SUVs' }
  ];

  const handleGroupToggle = (groupName: string) => {
    if (groupName === 'all') {
      onFilterChange({ selectedGroups: ['all'] });
      return;
    }

    let current = filter.selectedGroups.filter((g) => g !== 'all');
    if (current.includes(groupName)) {
      current = current.filter((g) => g !== groupName);
      if (current.length === 0) current = ['all'];
    } else {
      current.push(groupName);
    }
    onFilterChange({ selectedGroups: current });
  };

  const isAllGroupsSelected =
    filter.selectedGroups.length === 0 || filter.selectedGroups.includes('all');

  return (
    <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-5 shadow-sm dark:shadow-2xl space-y-4">
      {/* TOP ROW: GROUP SELECTOR PILLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mr-1">
            <Building2 className="w-3.5 h-3.5" />
            Vehicle Group:
          </span>

          <button
            type="button"
            onClick={() => handleGroupToggle('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isAllGroupsSelected
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black'
                : 'bg-slate-100 dark:bg-zinc-950 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
            }`}
          >
            <span>All Groups</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isAllGroupsSelected ? 'bg-black/20 text-black' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400'
              }`}
            >
              {vehicles.length}
            </span>
          </button>

          {availableGroups.map((grp) => {
            const isSelected = !isAllGroupsSelected && filter.selectedGroups.includes(grp.name);
            return (
              <button
                key={grp.name}
                type="button"
                onClick={() => handleGroupToggle(grp.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black'
                    : 'bg-slate-100 dark:bg-zinc-950 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
                }`}
              >
                <span>{grp.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400'
                  }`}
                >
                  {grp.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* TIME HORIZON SELECTOR */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-950 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 self-start lg:self-auto">
          {timeHorizons.map((th) => (
            <button
              key={th.id}
              type="button"
              onClick={() => onFilterChange({ timeHorizon: th.id })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter.timeHorizon === th.id
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow font-black border border-slate-200 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {th.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECONDARY ROW: TYPE FILTER, STATUS FILTER, SEARCH & RESET */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Vehicle Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs">
            {vehicleTypes.map((vt) => {
              const isSelected =
                (vt.id === 'all' &&
                  (filter.selectedVehicleTypes.length === 0 ||
                    filter.selectedVehicleTypes.includes('all'))) ||
                filter.selectedVehicleTypes.includes(vt.id);

              return (
                <button
                  key={vt.id}
                  type="button"
                  onClick={() => {
                    if (vt.id === 'all') {
                      onFilterChange({ selectedVehicleTypes: ['all'] });
                    } else {
                      onFilterChange({ selectedVehicleTypes: [vt.id] });
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-bold ${
                    isSelected
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700 font-black shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {vt.label}
                </button>
              );
            })}
          </div>

          {/* Vehicle Status Filter */}
          <select
            value={filter.selectedStatus}
            onChange={(e) => onFilterChange({ selectedStatus: e.target.value as any })}
            className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 text-xs rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Vehicle Statuses</option>
            <option value="active">Active & In-Service</option>
            <option value="in_trip">On Active Trip</option>
            <option value="idle">Parked / Idle</option>
            <option value="maintenance">In Maintenance</option>
          </select>
        </div>

        {/* SEARCH & ACTIONS */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="relative w-full md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter plate, model, driver..."
              value={filter.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-950 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              title="Export filtered dataset to CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-950 dark:hover:bg-zinc-800 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white border border-slate-200 dark:border-zinc-800 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
