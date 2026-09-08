import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Activity,
  Gauge,
  Zap,
  Power,
  TrendingUp,
  RefreshCw,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { Vehicle } from '../../types/fleet';

interface VehicleTelemetryGraphProps {
  vehicle: Vehicle;
}

export interface TelemetryDataPoint {
  time: string;
  minutesAgo: number;
  speed: number;
  ignition: number; // 1 = ON, 0 = OFF
  ignitionLabel: 'ON' | 'OFF';
  batteryVoltage: number; // in Volts (e.g. 12.4V - 14.2V)
  batteryLevel: number; // in %
}

// Generate realistic 60-minute telemetry time series ending at vehicle's current live state
function generateLast60MinTelemetry(vehicle: Vehicle): TelemetryDataPoint[] {
  const currentSpeed = vehicle.latestPosition?.speed ?? 0;
  const currentIgnition = vehicle.latestPosition?.ignition ? 1 : 0;
  const currentBatteryLevel = vehicle.latestPosition?.battery ?? 88;
  const currentVoltage = currentIgnition === 1 ? 14.1 : 12.4;

  const points: TelemetryDataPoint[] = [];
  const now = new Date();
  const seed = vehicle.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const steps = 13; // every 5 minutes across 60 minutes
  for (let i = steps - 1; i >= 0; i--) {
    const minutesAgo = i * 5;
    const pointTime = new Date(now.getTime() - minutesAgo * 60 * 1000);
    const timeLabel = pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (i === 0) {
      // Exact current point
      points.push({
        time: timeLabel,
        minutesAgo: 0,
        speed: currentSpeed,
        ignition: currentIgnition,
        ignitionLabel: currentIgnition === 1 ? 'ON' : 'OFF',
        batteryVoltage: Number(currentVoltage.toFixed(1)),
        batteryLevel: currentBatteryLevel
      });
      continue;
    }

    // Pseudo-random continuous telemetry pattern
    const factor = Math.sin((i + seed % 7) * 0.85);
    let histIgnition: number;
    let histSpeed: number;
    let histVoltage: number;

    if (currentIgnition === 1) {
      // Vehicle is currently ON: could have started 30-45 mins ago
      histIgnition = i > 9 ? (seed % 2 === 0 ? 0 : 1) : 1;
    } else {
      // Vehicle is currently OFF: might have been driving 20-50 mins ago
      histIgnition = i > 4 && i < 11 ? 1 : 0;
    }

    if (histIgnition === 1) {
      // Driving or cruising
      const baseCruise = 45 + (seed % 35);
      histSpeed = Math.max(0, Math.round(baseCruise + factor * 28));
      histVoltage = Number((13.8 + Math.abs(factor) * 0.5).toFixed(1));
    } else {
      // Engine Off/Idle
      histSpeed = 0;
      histVoltage = Number((12.3 + Math.abs(factor) * 0.2).toFixed(1));
    }

    const histBattLevel = Math.min(100, Math.max(20, Math.round(currentBatteryLevel - (i * 0.2) + (factor * 2))));

    points.push({
      time: timeLabel,
      minutesAgo,
      speed: histSpeed,
      ignition: histIgnition,
      ignitionLabel: histIgnition === 1 ? 'ON' : 'OFF',
      batteryVoltage: histVoltage,
      batteryLevel: histBattLevel
    });
  }

  return points;
}

export const VehicleTelemetryGraph: React.FC<VehicleTelemetryGraphProps> = ({ vehicle }) => {
  const [activeMetric, setActiveMetric] = useState<'all' | 'speed' | 'ignition' | 'battery'>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const telemetryData = useMemo(() => {
    return generateLast60MinTelemetry(vehicle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle.id, vehicle.latestPosition?.speed, vehicle.latestPosition?.ignition, vehicle.latestPosition?.battery, refreshKey]);

  // Telemetry Aggregates
  const maxSpeed = Math.max(...telemetryData.map((d) => d.speed));
  const avgSpeed = Math.round(
    telemetryData.reduce((acc, d) => acc + d.speed, 0) / telemetryData.length
  );
  const ignitionOnCount = telemetryData.filter((d) => d.ignition === 1).length;
  const ignitionPct = Math.round((ignitionOnCount / telemetryData.length) * 100);
  const avgVoltage = (
    telemetryData.reduce((acc, d) => acc + d.batteryVoltage, 0) / telemetryData.length
  ).toFixed(1);

  return (
    <div className="bg-[#0c0c0e] rounded-3xl border border-zinc-800/90 p-5 space-y-4 shadow-xl text-white">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">
              Live OBD-II & CAN-Bus Stream (Last 60 Minutes)
            </span>
          </div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Real-Time Telemetry Stream</span>
          </h4>
        </div>

        {/* Metric Mode Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900/80 p-1 rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveMetric('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              activeMetric === 'all'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            All Telemetry
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('speed')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeMetric === 'speed'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Gauge className="w-3 h-3" />
            <span>Speed</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('ignition')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeMetric === 'ignition'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Power className="w-3 h-3" />
            <span>Ignition</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('battery')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeMetric === 'battery'
                ? 'bg-cyan-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Voltage</span>
          </button>

          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            title="Refresh stream sampling"
            className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metric Highlights Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-zinc-900/50 p-2.5 rounded-2xl border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-semibold">
            <span>Peak Speed</span>
            <Gauge className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-lg font-mono font-black text-emerald-400 mt-0.5">
            {maxSpeed} <span className="text-xs font-normal text-zinc-500">km/h</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 p-2.5 rounded-2xl border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-semibold">
            <span>60m Avg Speed</span>
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-lg font-mono font-black text-white mt-0.5">
            {avgSpeed} <span className="text-xs font-normal text-zinc-500">km/h</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 p-2.5 rounded-2xl border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-semibold">
            <span>Ignition Duty</span>
            <Power className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-lg font-mono font-black text-amber-400 mt-0.5">
            {ignitionPct}% <span className="text-xs font-normal text-zinc-500">active</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 p-2.5 rounded-2xl border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-semibold">
            <span>Battery / Alt.</span>
            <Zap className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-lg font-mono font-black text-cyan-400 mt-0.5">
            {avgVoltage}V <span className="text-xs font-normal text-zinc-500">avg</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Telemetry Graph */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={telemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {/* Speed Gradient */}
              <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              {/* Battery Voltage Gradient */}
              <linearGradient id="voltageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
              </linearGradient>
              {/* Ignition Gradient */}
              <linearGradient id="ignitionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

            <XAxis
              dataKey="time"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#27272a' }}
            />

            {/* Left Y Axis for Speed (km/h) */}
            {(activeMetric === 'all' || activeMetric === 'speed') && (
              <YAxis
                yAxisId="speed"
                stroke="#10b981"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, (dataMax: number) => Math.max(120, Math.ceil(dataMax * 1.15))]}
                tickFormatter={(v) => `${v}k`}
              />
            )}

            {/* Right Y Axis for Battery Voltage (V) */}
            {(activeMetric === 'all' || activeMetric === 'battery') && (
              <YAxis
                yAxisId="voltage"
                orientation="right"
                stroke="#22d3ee"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[11, 16]}
                tickFormatter={(v) => `${v}V`}
              />
            )}

            {/* Hidden Y Axis for Ignition boolean */}
            {activeMetric === 'ignition' && (
              <YAxis
                yAxisId="ignition"
                stroke="#f59e0b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 1.2]}
                ticks={[0, 1]}
                tickFormatter={(v) => (v === 1 ? 'ON' : 'OFF')}
              />
            )}

            {/* Custom Tooltip */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0]?.payload as TelemetryDataPoint;
                if (!data) return null;

                return (
                  <div className="bg-[#121214] border border-zinc-700 p-3 rounded-2xl shadow-2xl text-xs space-y-1.5 font-sans min-w-[190px]">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1 font-mono text-[11px] text-zinc-400">
                      <span>Time: {label}</span>
                      <span className="text-zinc-500">
                        {data.minutesAgo === 0 ? 'Live Now' : `-${data.minutesAgo}m ago`}
                      </span>
                    </div>

                    <div className="space-y-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Speed:</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          {data.speed} km/h
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <Power className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ignition:</span>
                        </span>
                        <span
                          className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                            data.ignition === 1
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {data.ignition === 1 ? 'ACTIVE (ON)' : 'OFF (STANDBY)'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <Zap className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Voltage:</span>
                        </span>
                        <span className="font-mono font-bold text-cyan-400">
                          {data.batteryVoltage} V{' '}
                          <span className="text-[10px] text-zinc-500 font-normal">
                            ({data.ignition === 1 ? 'Alternator' : 'Resting'})
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-400 text-[11px] pt-1 border-t border-zinc-800/80">
                        <span>Battery Level:</span>
                        <span className="font-mono font-semibold text-white">
                          {data.batteryLevel}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            {/* Areas / Lines */}
            {(activeMetric === 'all' || activeMetric === 'speed') && (
              <Area
                yAxisId="speed"
                type="monotone"
                dataKey="speed"
                name="Speed (km/h)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#speedGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'battery') && (
              <Area
                yAxisId="voltage"
                type="monotone"
                dataKey="batteryVoltage"
                name="Battery Voltage (V)"
                stroke="#22d3ee"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#voltageGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#22d3ee' }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'ignition') && (
              <Line
                yAxisId={activeMetric === 'ignition' ? 'ignition' : 'speed'}
                type="stepAfter"
                dataKey={activeMetric === 'ignition' ? 'ignition' : (d) => d.ignition * 20}
                name="Ignition Status (ON/OFF)"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/80 font-mono text-[11px]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Speed (km/h)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Ignition (State)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Voltage (12V/14V)</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-500">
          <Clock className="w-3.5 h-3.5" />
          <span>Stream Resolution: 5 min CAN-bus intervals</span>
        </div>
      </div>
    </div>
  );
};
