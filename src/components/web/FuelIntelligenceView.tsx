import React, { useState } from 'react';
import {
  Fuel,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Zap,
  Clock,
  MapPin,
  Car,
  Activity,
  Award,
  Layers,
  Search,
  Download,
  Plus
} from 'lucide-react';
import { Vehicle, FuelIncident, RefuelRecord, EcoDrivingScore } from '../../types/fleet';
import {
  INITIAL_FUEL_INCIDENTS,
  INITIAL_REFUEL_RECORDS,
  INITIAL_ECO_SCORES
} from '../../data/modulesData';

interface FuelIntelligenceViewProps {
  vehicles: Vehicle[];
}

export const FuelIntelligenceView: React.FC<FuelIntelligenceViewProps> = ({ vehicles }) => {
  const [incidents, setIncidents] = useState<FuelIncident[]>(INITIAL_FUEL_INCIDENTS);
  const [refuels, setRefuels] = useState<RefuelRecord[]>(INITIAL_REFUEL_RECORDS);
  const [ecoScores, setEcoScores] = useState<EcoDrivingScore[]>(INITIAL_ECO_SCORES);
  const [activeTab, setActiveTab] = useState<'siphoning' | 'refuels' | 'eco_scores'>('siphoning');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string>('all');
  const [simulatingTheft, setSimulatingTheft] = useState(false);
  const [theftAlertBanner, setTheftAlertBanner] = useState<FuelIncident | null>(null);

  // Stats calculation
  const totalLitersLost = incidents.reduce((acc, inc) => acc + inc.volumeLiters, 0);
  const totalFinancialLossUsd = incidents.reduce((acc, inc) => acc + inc.estimatedCostUsd, 0);
  const activeSiphonAlarms = incidents.filter((i) => i.status === 'confirmed_theft' || i.status === 'under_investigation').length;

  const handleSimulateTheft = () => {
    setSimulatingTheft(true);
    setTimeout(() => {
      const targetVeh = vehicles[0] || {
        id: 'veh_01',
        organizationId: 'org_atlas_logistics',
        make: 'Volvo',
        model: 'FH16 540',
        licensePlate: '12345-A-1'
      };

      const newTheft: FuelIncident = {
        id: `fl_${Date.now()}`,
        organizationId: targetVeh.organizationId,
        vehicleId: targetVeh.id,
        vehiclePlate: targetVeh.licensePlate,
        type: 'siphon_theft',
        timestamp: new Date().toISOString(),
        locationName: 'Casablanca Port Gate 3 (Parking Sud)',
        latitude: 33.6052,
        longitude: -7.5912,
        volumeLiters: 35.0,
        estimatedCostUsd: 56.0,
        status: 'confirmed_theft',
        engineStatus: 'off',
        initialPercent: 82,
        finalPercent: 54,
        notes: 'Simulated Siphon Event: Fuel float sensor detected 35.0L loss in 3.5 minutes while engine OFF.'
      };

      setIncidents([newTheft, ...incidents]);
      setTheftAlertBanner(newTheft);
      setSimulatingTheft(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12" id="fuel-intelligence-container">
      {/* Live Theft Alert Banner */}
      {theftAlertBanner && (
        <div className="bg-rose-600 text-white p-4 rounded-xl shadow-lg border border-rose-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-slideDown">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse text-white" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>AI Siphon Theft Alert Triggered!</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono">
                  -{theftAlertBanner.volumeLiters} Liters
                </span>
              </div>
              <div className="text-xs text-rose-100 mt-0.5">
                {theftAlertBanner.vehiclePlate} • {theftAlertBanner.locationName}
              </div>
            </div>
          </div>

          <button
            onClick={() => setTheftAlertBanner(null)}
            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold"
          >
            Acknowledge Alarm
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
            <Fuel className="w-4 h-4" />
            <span>AI Fuel Intelligence & Anti-Theft Studio</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Fuel Siphoning Radar & CAN-Bus Telemetry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time ultrasonic fuel drop detection, refuel station reconciliation, and driver eco-scorecards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateTheft}
            disabled={simulatingTheft}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>{simulatingTheft ? 'Analyzing Telemetry...' : 'Simulate Fuel Siphon Alarm'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Fuel Thefts Detected</span>
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {incidents.length} <span className="text-xs font-normal text-slate-400">incidents</span>
          </div>
          <div className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
            {activeSiphonAlarms} active investigations
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Estimated Siphoned Volume</span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {totalLitersLost.toFixed(1)} <span className="text-xs font-normal text-slate-400">Liters</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">~${totalFinancialLossUsd.toFixed(2)} financial impact</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Fleet Consumption</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            8.9 <span className="text-xs font-normal text-slate-400">L / 100km</span>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            -4.2% vs. regional benchmark
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Top Eco-Driver Score</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">94 / 100</div>
          <div className="text-xs text-slate-400 mt-1">Mustapha Idrissi (Grade A+)</div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('siphoning')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'siphoning'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Siphon & Loss Incidents ({incidents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('refuels')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'refuels'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Fuel className="w-3.5 h-3.5" />
          <span>Refuel Station Log ({refuels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('eco_scores')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'eco_scores'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Driver Eco-Driving Scorecards ({ecoScores.length})</span>
        </button>
      </div>

      {/* TAB 1: Siphon Incidents Radar */}
      {activeTab === 'siphoning' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/60 p-5 shadow-sm space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                    <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">
                      {inc.vehiclePlate}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      inc.status === 'confirmed_theft'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        : inc.status === 'under_investigation'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    }`}
                  >
                    {inc.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold uppercase">
                      Detected Loss Volume
                    </div>
                    <div className="text-xl font-bold text-rose-700 dark:text-rose-300 font-mono">
                      -{inc.volumeLiters} Liters
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase">Estimated Value</div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
                      ${inc.estimatedCostUsd}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(inc.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{inc.locationName}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2">
                  {inc.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Refuel Logs */}
      {activeTab === 'refuels' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Verified Refueling Transactions
            </h3>
            <span className="text-xs text-slate-400">Audited via CAN-bus float sensor</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-semibold">
                <tr>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Station Name</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Liters Pumped</th>
                  <th className="p-3">Cost ($)</th>
                  <th className="p-3">Odometer</th>
                  <th className="p-3">Fuel % (Before &rarr; After)</th>
                  <th className="p-3">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {refuels.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold font-mono text-slate-900 dark:text-white">{ref.vehiclePlate}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{ref.stationName}</td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">
                      {new Date(ref.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      +{ref.litersAdded} L
                    </td>
                    <td className="p-3 font-mono font-bold">${ref.costUsd}</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                      {ref.odometer.toLocaleString()} km
                    </td>
                    <td className="p-3">
                      <span className="text-slate-400 font-mono">{ref.fuelPercentBefore}%</span> &rarr;{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                        {ref.fuelPercentAfter}%
                      </strong>
                    </td>
                    <td className="p-3 text-slate-400 font-mono">{ref.receiptNumber || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Eco-Driving Scorecards */}
      {activeTab === 'eco_scores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ecoScores.map((score) => (
            <div
              key={score.vehicleId}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{score.driverName}</h4>
                  <div className="text-xs text-slate-400 font-mono">Plate: {score.vehiclePlate}</div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Eco-Score</div>
                    <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{score.overallScore}/100</div>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                      score.grade.startsWith('A')
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : score.grade === 'B'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    {score.grade}
                  </div>
                </div>
              </div>

              {/* Behavior Breakdown Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="text-[10px] text-slate-400">Harsh Accel</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                    {score.harshAccelerationCount}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="text-[10px] text-slate-400">Harsh Brake</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                    {score.harshBrakingCount}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="text-[10px] text-slate-400">Sharp Turns</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                    {score.sharpCorneringCount}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="text-[10px] text-slate-400">Idle Waste</div>
                  <div className="font-bold text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                    {score.idleFuelWasteLiters} L
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Avg Mileage Consumption:</span>
                <strong className="text-slate-900 dark:text-white font-mono">{score.avgLitersPer100Km} L / 100km</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
