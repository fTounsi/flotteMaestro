import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from 'recharts';
import {
  RadarMetricPoint,
  GroupPerformanceSummary
} from '../../../../utils/analyticsCalculator';
import {
  Building2,
  ShieldCheck,
  Fuel,
  Car,
  Clock,
  Gauge,
  TrendingUp,
  Layers
} from 'lucide-react';

interface GroupComparisonRadarProps {
  radarData: RadarMetricPoint[];
  groupSummaries: GroupPerformanceSummary[];
}

const RADAR_COLORS = ['#10b981', '#38bdf8', '#f59e0b', '#a855f7', '#ec4899'];

export const GroupComparisonRadar: React.FC<GroupComparisonRadarProps> = ({
  radarData,
  groupSummaries
}) => {
  const activeGroups = groupSummaries.slice(0, 4);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-6 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 tracking-widest">
              Cohort Benchmarking
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Vehicle Group Performance Matrix</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-700 text-indigo-400">
              {groupSummaries.length} Operational Groups
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Multi-dimensional comparative analysis across utilization, idle efficiency, daily mileage, and driver safety.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* RADAR CHART (5 COLS) */}
        <div className="lg:col-span-5 h-72 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#27272a" />
              <PolarAngleAxis dataKey="metric" stroke="#a1a1aa" fontSize={11} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#3f3f46" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  borderColor: '#27272a',
                  borderRadius: '16px',
                  fontSize: '11px',
                  color: '#fff'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
              {activeGroups.map((g, idx) => (
                <Radar
                  key={g.groupName}
                  name={g.groupName}
                  dataKey={g.groupName}
                  stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
                  fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
                  fillOpacity={0.25}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* GROUP PERFORMANCE SCORECARD (7 COLS) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-[10px] font-mono font-bold uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-3">Vehicle Group</th>
                  <th className="py-3 px-3 text-center">Units</th>
                  <th className="py-3 px-3 text-right">Avg Utilization</th>
                  <th className="py-3 px-3 text-right">Daily Km</th>
                  <th className="py-3 px-3 text-right">Idle Hours</th>
                  <th className="py-3 px-3 text-center">Safety Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 bg-zinc-950/40 text-xs font-mono">
                {groupSummaries.map((grp, idx) => (
                  <tr key={grp.groupName} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: RADAR_COLORS[idx % RADAR_COLORS.length] }}
                        />
                        <div>
                          <span className="font-bold text-white font-sans text-xs">
                            {grp.groupName}
                          </span>
                          <span className="text-[10px] text-zinc-500 block font-mono">
                            ${grp.wastedIdleCostUsd} idle loss
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-zinc-300">
                      {grp.vehicleCount}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-bold text-emerald-400">{grp.avgUtilizationRate}%</span>
                      <div className="w-16 bg-zinc-800 rounded-full h-1.5 ml-auto mt-1 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${grp.avgUtilizationRate}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-cyan-400">
                      {grp.avgDailyMileageKm} km
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-amber-400 font-bold">{grp.totalIdleHours}h</span>
                      <span className="text-zinc-500 text-[10px] block">
                        avg {grp.avgIdlePerVehicleHours}h/unit
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          grp.safetyScore >= 90
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {grp.safetyScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
