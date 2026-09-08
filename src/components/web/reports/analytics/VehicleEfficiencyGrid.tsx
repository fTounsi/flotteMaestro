import React, { useState } from 'react';
import { VehicleUtilizationMetric } from '../../../../utils/analyticsCalculator';
import {
  Car,
  Search,
  ArrowUpDown,
  Clock,
  Fuel,
  ShieldCheck,
  Building2,
  Sparkles,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface VehicleEfficiencyGridProps {
  vehicles: VehicleUtilizationMetric[];
}

export const VehicleEfficiencyGrid: React.FC<VehicleEfficiencyGridProps> = ({ vehicles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<
    'utilizationRate' | 'avgDailyMileageKm' | 'idleHours' | 'fuelConsumedLiters' | 'safetyScore' | 'plate'
  >('utilizationRate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredVehicles = vehicles
    .filter((v) => {
      const q = searchTerm.toLowerCase();
      return (
        v.plate.toLowerCase().includes(q) ||
        v.makeModel.toLowerCase().includes(q) ||
        v.driverName.toLowerCase().includes(q) ||
        v.fleetGroup.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (
    field: 'utilizationRate' | 'avgDailyMileageKm' | 'idleHours' | 'fuelConsumedLiters' | 'safetyScore' | 'plate'
  ) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-6 shadow-2xl space-y-4">
      {/* HEADER WITH SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Car className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-widest">
              Granular Fleet Telematics Ledger
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Vehicle Utilization & Efficiency Roster</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-700 text-zinc-400">
              {filteredVehicles.length} of {vehicles.length} Units
            </span>
          </h3>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vehicle or driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950 text-[10px] font-mono font-bold uppercase text-zinc-400 border-b border-zinc-800">
            <tr>
              <th
                onClick={() => toggleSort('plate')}
                className="py-3 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Vehicle / Spec</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">Fleet Group</th>
              <th className="py-3 px-3">Driver</th>
              <th
                onClick={() => toggleSort('utilizationRate')}
                className="py-3 px-3 cursor-pointer hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Utilization Rate</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('avgDailyMileageKm')}
                className="py-3 px-3 cursor-pointer hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Daily Mileage</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('idleHours')}
                className="py-3 px-3 cursor-pointer hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Idle Time / Cost</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('fuelConsumedLiters')}
                className="py-3 px-3 cursor-pointer hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Fuel Burned</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('safetyScore')}
                className="py-3 px-3 cursor-pointer hover:text-white text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Safety</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80 bg-zinc-950/40 text-[11px] font-mono">
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-zinc-500 font-sans">
                  No matching vehicles found for this query.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((v) => (
                <tr key={v.vehicleId} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-2.5 px-3">
                    <div>
                      <span className="font-bold text-white text-xs">{v.plate}</span>
                      <p className="text-[10px] text-zinc-400 font-sans">{v.makeModel}</p>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400 font-sans text-xs">
                    {v.fleetGroup}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300 font-sans text-xs">
                    {v.driverName}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="font-bold text-emerald-400">{v.utilizationRate}%</span>
                    <span className="text-[10px] text-zinc-500 block">
                      {v.drivingHours}h driving
                    </span>
                    <div className="w-20 bg-zinc-800 rounded-full h-1 ml-auto mt-1 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${v.utilizationRate}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-cyan-400">
                    {v.avgDailyMileageKm} km/d
                    <span className="text-[10px] text-zinc-500 block font-normal">
                      {v.totalDistanceKm.toLocaleString()} km tot
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-amber-400 font-bold">{v.idleHours} hrs</span>
                    <span className="text-[10px] text-zinc-500 block font-sans">
                      ${v.idleCostUsd} wasted
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-200">
                    <span className="font-bold">{v.fuelConsumedLiters} L</span>
                    <span className="text-[10px] text-zinc-500 block font-sans">
                      {v.wastedIdleFuelLiters}L idle
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        v.safetyScore >= 90
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : v.safetyScore >= 75
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {v.safetyScore}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        v.status === 'active' || v.status === 'in_trip'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          : v.status === 'idle'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                          : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                      }`}
                    >
                      {v.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
