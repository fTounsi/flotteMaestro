import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  DailyMileagePoint,
  WeekdayMileagePoint
} from '../../../../utils/analyticsCalculator';
import {
  Car,
  TrendingUp,
  Calendar,
  Compass,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';

interface MileageTrendChartProps {
  dailyMileage: DailyMileagePoint[];
  weekdayMileage: WeekdayMileagePoint[];
  avgDailyKm: number;
  totalDistanceKm: number;
}

export const MileageTrendChart: React.FC<MileageTrendChartProps> = ({
  dailyMileage,
  weekdayMileage,
  avgDailyKm,
  totalDistanceKm
}) => {
  const [mileageMode, setMileageMode] = useState<'daily' | 'weekday'>('daily');

  const CustomMileageTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DailyMileagePoint;
      return (
        <div className="bg-zinc-950/95 border border-zinc-700 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-2">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-1.5">
            <span className="font-bold text-white font-mono">{label}</span>
            <span className="text-cyan-400 font-bold font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              {data.avgMileageKm} km/veh
            </span>
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-4 text-cyan-400">
              <span>Fleet Average:</span>
              <span className="font-bold">{data.avgMileageKm} km</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-emerald-400">
              <span>Peak Vehicle Duty:</span>
              <span className="font-bold">{data.maxMileageKm} km</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-zinc-400">
              <span>Min Vehicle Duty:</span>
              <span className="font-bold">{data.minMileageKm} km</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-zinc-300 pt-1 border-t border-zinc-800/80">
              <span>Total Fleet Distance:</span>
              <span className="font-bold text-white">{data.totalMileageKm.toLocaleString()} km</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomWeekdayTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as WeekdayMileagePoint;
      return (
        <div className="bg-zinc-950/95 border border-zinc-700 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-1">
            <span className="font-bold text-white font-mono">{label} Daily Pattern</span>
            <span className="text-emerald-400 font-mono text-[10px] font-bold">
              {data.utilizationPercent}% Utilization
            </span>
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-4 text-cyan-400">
              <span>Avg Vehicle Run:</span>
              <span className="font-bold">{data.avgMileageKm} km</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-emerald-400">
              <span>Fleet Total Logged:</span>
              <span className="font-bold">{data.totalFleetKm.toLocaleString()} km</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-zinc-400">
              <span>Dispatched Assets:</span>
              <span className="font-bold text-white">{data.activeVehicles} units</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-6 shadow-2xl space-y-5">
      {/* HEADER WITH CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Car className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-widest">
              Distance & Route Dynamics
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Average Daily Mileage Trend</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-700 text-cyan-400">
              {avgDailyKm} km/day
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Track daily odometer accumulation, route cadence, and day-of-week demand variance across the fleet.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMileageMode('daily')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mileageMode === 'daily'
                ? 'bg-cyan-500 text-black font-black shadow-lg shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Chronological Trend
          </button>
          <button
            type="button"
            onClick={() => setMileageMode('weekday')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mileageMode === 'weekday'
                ? 'bg-cyan-500 text-black font-black shadow-lg shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Weekday Cadence
          </button>
        </div>
      </div>

      {/* CHART CONTENT */}
      {mileageMode === 'daily' ? (
        <div className="space-y-4">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyMileage} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="mileageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="date"
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
                  tickFormatter={(val) => `${val}km`}
                />

                <Tooltip content={<CustomMileageTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />

                <ReferenceLine
                  y={190}
                  stroke="#06b6d4"
                  strokeDasharray="4 4"
                  label={{
                    value: '190 km Benchmark',
                    position: 'insideTopRight',
                    fill: '#06b6d4',
                    fontSize: 10,
                    fontWeight: 'bold'
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="avgMileageKm"
                  name="Average Daily Mileage (km)"
                  stroke="#06b6d4"
                  fill="url(#mileageGrad)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0891b2', stroke: '#06b6d4', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500">Total Distance Logged</span>
                <p className="text-sm font-black text-white font-mono">{totalDistanceKm.toLocaleString()} km</p>
              </div>
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Target className="w-4 h-4" />
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500">Fleet Average Daily</span>
                <p className="text-sm font-black text-cyan-400 font-mono">{avgDailyKm} km/vehicle</p>
              </div>
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 font-mono font-bold text-xs">
                {avgDailyKm >= 190 ? '+Optimal' : 'Standard'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500">Fleet Duty Capacity</span>
                <p className="text-sm font-black text-emerald-400 font-mono">Normal Operational Band</p>
              </div>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Zap className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* WEEKDAY CADENCE VIEW */
        <div className="space-y-4">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayMileage} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="day"
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
                  tickFormatter={(val) => `${val}km`}
                />
                <Tooltip content={<CustomWeekdayTooltip />} />
                <Bar
                  dataKey="avgMileageKm"
                  name="Avg Distance per Vehicle (km)"
                  fill="#06b6d4"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-zinc-400 text-center font-sans">
            Peak delivery mileage occurs on <strong>Tuesday and Wednesday</strong>, with weekend dispatch dropping to 45% of peak volume.
          </p>
        </div>
      )}
    </div>
  );
};
