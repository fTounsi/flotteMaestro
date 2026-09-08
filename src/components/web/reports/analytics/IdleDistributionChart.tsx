import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import {
  IdleDurationBucket,
  IdleTimeOfDayPoint,
  IdleHotspot
} from '../../../../utils/analyticsCalculator';
import {
  Clock,
  Fuel,
  AlertTriangle,
  Flame,
  MapPin,
  TrendingDown,
  DollarSign,
  Leaf
} from 'lucide-react';

interface IdleDistributionChartProps {
  buckets: IdleDurationBucket[];
  timeOfDay: IdleTimeOfDayPoint[];
  hotspots: IdleHotspot[];
  totalIdleHours: number;
  wastedFuelLiters: number;
  wastedCostUsd: number;
  carbonWastedKg: number;
}

const BUCKET_COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#f97316', '#ef4444'];

export const IdleDistributionChart: React.FC<IdleDistributionChartProps> = ({
  buckets,
  timeOfDay,
  hotspots,
  totalIdleHours,
  wastedFuelLiters,
  wastedCostUsd,
  carbonWastedKg
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'buckets' | 'timeOfDay' | 'hotspots'>('buckets');

  const CustomBucketTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as IdleDurationBucket;
      return (
        <div className="bg-zinc-950/95 border border-zinc-700 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-2">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-1.5">
            <span className="font-bold text-white">{label}</span>
            <span className="text-amber-400 font-bold font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              {data.percentage}% of Idle
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 font-sans">{data.description}</p>
          <div className="space-y-1 font-mono text-[11px] pt-1">
            <div className="flex items-center justify-between gap-4 text-zinc-300">
              <span>Event Count:</span>
              <span className="font-bold text-white">{data.eventCount} occurrences</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-amber-400">
              <span>Total Duration:</span>
              <span className="font-bold">{data.totalHours} hrs</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-cyan-400">
              <span>Fuel Burned:</span>
              <span className="font-bold">{data.fuelWastedLiters} Liters</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-rose-400 border-t border-zinc-800/80 pt-1">
              <span>Estimated Cost:</span>
              <span className="font-bold">${data.costUsd} USD</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTimeOfDayTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as IdleTimeOfDayPoint;
      return (
        <div className="bg-zinc-950/95 border border-zinc-700 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-1">
            <span className="font-bold text-white font-mono">{label} Window</span>
            <span className="text-zinc-400 font-mono text-[10px]">{data.activeVehicles} active units</span>
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-4 text-amber-400">
              <span>Idle Engine:</span>
              <span className="font-bold">{(data.idleMinutes / 60).toFixed(1)} hrs ({data.idleMinutes}m)</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-emerald-400">
              <span>Drive Time:</span>
              <span className="font-bold">{(data.driveMinutes / 60).toFixed(1)} hrs</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-6 shadow-2xl space-y-5">
      {/* HEADER & IMPACT PILLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-widest">
              Idle Duration & Loss Analytics
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Engine Idle Time Distribution</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-700 text-amber-400">
              {totalIdleHours} Total Hours
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Identify excessive auxiliary engine running, warehouse dwell time, and non-productive fuel loss.
          </p>
        </div>

        {/* Sub-view switcher */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('buckets')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'buckets'
                ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Duration Buckets
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('timeOfDay')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'timeOfDay'
                ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            24h Day Curve
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('hotspots')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'hotspots'
                ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Idle Hotspots
          </button>
        </div>
      </div>

      {/* TOP IMPACT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Idle</span>
            <p className="text-lg font-black font-mono text-amber-400">{totalIdleHours} hrs</p>
          </div>
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-4 h-4" />
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Wasted Fuel</span>
            <p className="text-lg font-black font-mono text-cyan-400">{wastedFuelLiters} L</p>
          </div>
          <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Fuel className="w-4 h-4" />
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Financial Waste</span>
            <p className="text-lg font-black font-mono text-rose-400">${wastedCostUsd.toLocaleString()}</p>
          </div>
          <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <DollarSign className="w-4 h-4" />
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">CO2 Emissions</span>
            <p className="text-lg font-black font-mono text-emerald-400">{carbonWastedKg.toLocaleString()} kg</p>
          </div>
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Leaf className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* CHART SECTIONS */}
      {activeSubTab === 'buckets' && (
        <div className="space-y-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buckets} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="bucket"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                  tickFormatter={(val) => `${val}h`}
                />
                <Tooltip content={<CustomBucketTooltip />} />
                <Bar dataKey="totalHours" name="Idle Hours" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {buckets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BUCKET_COLORS[index % BUCKET_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bucket Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
            {buckets.map((b, idx) => (
              <div
                key={b.bucket}
                className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: BUCKET_COLORS[idx] }}
                  />
                  <span className="text-[10px] font-mono font-bold text-zinc-400">
                    {b.percentage}%
                  </span>
                </div>
                <p className="text-xs font-bold text-white font-mono">{b.bucket}</p>
                <p className="text-[10px] text-zinc-500 font-mono">
                  {b.totalHours}h • ${b.costUsd}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'timeOfDay' && (
        <div className="space-y-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeOfDay} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="idleDayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="driveDayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="hour"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                  tickFormatter={(val) => `${Math.round(val / 60)}h`}
                />
                <Tooltip content={<CustomTimeOfDayTooltip />} />
                <Area
                  type="monotone"
                  dataKey="driveMinutes"
                  name="Drive Time (Minutes)"
                  stroke="#10b981"
                  fill="url(#driveDayGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="idleMinutes"
                  name="Idle Time (Minutes)"
                  stroke="#f59e0b"
                  fill="url(#idleDayGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-zinc-400 text-center font-sans">
            Peak idle volume concentrates between <strong>10:00 - 14:00</strong> during client receiving dock turnaround and driver meal breaks.
          </p>
        </div>
      )}

      {activeSubTab === 'hotspots' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-[10px] font-mono font-bold uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Terminal / Hub Location</th>
                  <th className="py-2.5 px-3">Location Category</th>
                  <th className="py-2.5 px-3 text-right">Visits</th>
                  <th className="py-2.5 px-3 text-right">Avg Dwell</th>
                  <th className="py-2.5 px-3 text-right">Total Idle</th>
                  <th className="py-2.5 px-3 text-right">Estimated Waste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 bg-zinc-950/40 text-xs">
                {hotspots.map((h, i) => (
                  <tr key={i} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{h.name}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {h.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{h.visitCount}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-400 font-bold">
                      {h.avgDwellMinutes} mins
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-white font-bold">
                      {h.totalIdleHours} hrs
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-400 font-bold">
                      ${h.wastedCostUsd}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
