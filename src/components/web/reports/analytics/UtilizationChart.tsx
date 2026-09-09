import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  BarChart
} from 'recharts';
import {
  DailyUtilizationPoint,
  VehicleUtilizationMetric
} from '../../../../utils/analyticsCalculator';
import {
  Gauge,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Car
} from 'lucide-react';

interface UtilizationChartProps {
  dailyData: DailyUtilizationPoint[];
  vehicleData: VehicleUtilizationMetric[];
  avgRate: number;
}

export const UtilizationChart: React.FC<UtilizationChartProps> = ({
  dailyData,
  vehicleData,
  avgRate
}) => {
  const [viewMode, setViewMode] = useState<'trend' | 'ranking'>('trend');

  // Sort top and bottom utilized vehicles
  const topUtilized = [...vehicleData].sort((a, b) => b.utilizationRate - a.utilizationRate).slice(0, 7);
  const leastUtilized = [...vehicleData].sort((a, b) => a.utilizationRate - b.utilizationRate).slice(0, 7);

  // Custom Recharts Tooltip for Trend
  const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DailyUtilizationPoint;
      return (
        <div className="bg-white/95 dark:bg-zinc-950/95 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3 shadow-xl backdrop-blur-md text-xs space-y-2">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-1.5">
            <span className="font-bold text-slate-900 dark:text-white font-mono">{label}</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              {data.utilizationRate}% Utilization
            </span>
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-4 text-emerald-700 dark:text-emerald-400">
              <span>Active Driving:</span>
              <span className="font-bold">{data.drivingHours} hrs</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-amber-700 dark:text-amber-400">
              <span>Idle Engine:</span>
              <span className="font-bold">{data.idleHours} hrs</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-slate-500 dark:text-zinc-400">
              <span>Standby / Off:</span>
              <span className="font-bold">{data.standbyHours} hrs</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-zinc-300 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
              <span>Active Assets:</span>
              <span className="font-bold text-slate-900 dark:text-white">{data.fleetActiveCount} units</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm dark:shadow-2xl space-y-5">
      {/* HEADER WITH CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <Gauge className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-widest">
              Asset Utilization Analytics
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Fleet Utilization & Operating Ratio</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 text-emerald-700 dark:text-emerald-400">
              Avg {avgRate}%
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Ratio of operational active driving hours relative to total available fleet working capacity.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-950 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('trend')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'trend'
                ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Chronological Trend
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ranking')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'ranking'
                ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Vehicle Ranking
          </button>
        </div>
      </div>

      {/* CHART CONTENT */}
      {viewMode === 'trend' ? (
        <div className="space-y-4">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="driveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="idleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
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
                  yAxisId="hours"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                  tickFormatter={(val) => `${val}h`}
                />
                <YAxis
                  yAxisId="percent"
                  orientation="right"
                  stroke="#10b981"
                  fontSize={11}
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                  tickFormatter={(val) => `${val}%`}
                />

                <Tooltip content={<CustomTrendTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />

                <ReferenceLine
                  yAxisId="percent"
                  y={75}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: '75% Fleet Target',
                    position: 'insideTopRight',
                    fill: '#10b981',
                    fontSize: 10,
                    fontWeight: 'bold'
                  }}
                />

                <Area
                  yAxisId="hours"
                  type="monotone"
                  dataKey="drivingHours"
                  name="Active Drive Time (Hours)"
                  fill="url(#driveGradient)"
                  stroke="#10b981"
                  strokeWidth={2}
                />
                <Bar
                  yAxisId="hours"
                  dataKey="idleHours"
                  name="Idle Engine Hours"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
                <Line
                  yAxisId="percent"
                  type="monotone"
                  dataKey="utilizationRate"
                  name="Utilization Rate (%)"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0284c7', stroke: '#38bdf8', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#38bdf8' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500">Benchmark Target</span>
                <p className="text-sm font-black text-white font-mono">75.0% Operational Capacity</p>
              </div>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">Current Fleet Average</span>
                <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">{avgRate}% Utilization</p>
              </div>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs">
                {avgRate >= 75 ? '+Optimal' : 'Actionable'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500">Standby Fleet Margin</span>
                <p className="text-sm font-black text-slate-700 dark:text-zinc-300 font-mono">{100 - avgRate}% Reserve</p>
              </div>
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
                <Layers className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* VEHICLE RANKING VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Utilized */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4" />
                Top High-Utilization Workhorses
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">&gt; 70% Target</span>
            </div>

            <div className="space-y-2.5">
              {topUtilized.map((v) => (
                <div key={v.vehicleId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{v.plate}</span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[120px]">
                        {v.makeModel}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                      {v.utilizationRate}% ({v.drivingHours}h)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${v.utilizationRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Least Utilized */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowDownRight className="w-4 h-4" />
                Under-Utilized Assets (Opportunity)
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">&lt; 50% Active</span>
            </div>

            <div className="space-y-2.5">
              {leastUtilized.map((v) => (
                <div key={v.vehicleId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{v.plate}</span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[120px]">
                        {v.driverName}
                      </span>
                    </div>
                    <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">
                      {v.utilizationRate}% ({v.drivingHours}h)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${v.utilizationRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
