import React, { useState, useMemo } from 'react';
import { Vehicle, Trip, Alert, Geofence, Organization, User } from '../../../../types/fleet';
import { TranslationDictionary } from '../../../../translations/i18n';
import {
  AnalyticsFilterState,
  calculateFleetAnalytics,
  FleetAnalyticsReport
} from '../../../../utils/analyticsCalculator';
import { AnalyticsFilterBar } from './AnalyticsFilterBar';
import { UtilizationChart } from './UtilizationChart';
import { IdleDistributionChart } from './IdleDistributionChart';
import { MileageTrendChart } from './MileageTrendChart';
import { GroupComparisonRadar } from './GroupComparisonRadar';
import { VehicleEfficiencyGrid } from './VehicleEfficiencyGrid';
import {
  Gauge,
  Clock,
  Car,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Leaf,
  Layers,
  CheckCircle,
  Building2,
  Download,
  Info
} from 'lucide-react';

interface FleetAnalyticsDashboardProps {
  vehicles: Vehicle[];
  trips?: Trip[];
  alerts?: Alert[];
  geofences?: Geofence[];
  currentOrg?: Organization;
  currentUser?: User | null;
  t: TranslationDictionary;
}

export const FleetAnalyticsDashboard: React.FC<FleetAnalyticsDashboardProps> = ({
  vehicles,
  trips = [],
  alerts = [],
  geofences = [],
  currentOrg,
  currentUser,
  t
}) => {
  // Extract distinct vehicle groups with counts
  const availableGroups = useMemo(() => {
    const groupCountMap = new Map<string, number>();
    vehicles.forEach((v) => {
      const gName = v.fleetName || 'General Logistics';
      groupCountMap.set(gName, (groupCountMap.get(gName) || 0) + 1);
    });

    return Array.from(groupCountMap.entries()).map(([name, count]) => ({
      name,
      count
    }));
  }, [vehicles]);

  // Analytics filter state
  const [filter, setFilter] = useState<AnalyticsFilterState>({
    timeHorizon: '14d',
    selectedGroups: ['all'],
    selectedVehicleTypes: ['all'],
    selectedStatus: 'all',
    searchQuery: ''
  });

  const handleFilterChange = (updates: Partial<AnalyticsFilterState>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilter = () => {
    setFilter({
      timeHorizon: '14d',
      selectedGroups: ['all'],
      selectedVehicleTypes: ['all'],
      selectedStatus: 'all',
      searchQuery: ''
    });
  };

  // Calculate comprehensive analytics report
  const analyticsData: FleetAnalyticsReport = useMemo(() => {
    return calculateFleetAnalytics(vehicles, trips, alerts, geofences, filter, 1.35);
  }, [vehicles, trips, alerts, geofences, filter]);

  // Export Analytics to CSV
  const handleExportCsv = () => {
    const rows = [
      [
        'Vehicle Plate',
        'Model',
        'Fleet Group',
        'Driver',
        'Status',
        'Utilization Rate (%)',
        'Avg Daily Mileage (km)',
        'Total Period Distance (km)',
        'Driving Hours',
        'Idle Hours',
        'Wasted Idle Fuel (L)',
        'Idle Cost (USD)',
        'Fuel Consumed (L)',
        'Safety Score (%)'
      ]
    ];

    analyticsData.vehicleUtilizationList.forEach((v) => {
      rows.push([
        `"${v.plate}"`,
        `"${v.makeModel}"`,
        `"${v.fleetGroup}"`,
        `"${v.driverName}"`,
        `"${v.status}"`,
        `${v.utilizationRate}`,
        `${v.avgDailyMileageKm}`,
        `${v.totalDistanceKm}`,
        `${v.drivingHours}`,
        `${v.idleHours}`,
        `${v.wastedIdleFuelLiters}`,
        `${v.idleCostUsd}`,
        `${v.fuelConsumedLiters}`,
        `${v.safetyScore}`
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Fleet_Analytics_${filter.selectedGroups.join('_')}_${filter.timeHorizon}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. FILTER BAR (VEHICLE GROUP, TIME HORIZON, TYPE, SEARCH) */}
      <AnalyticsFilterBar
        vehicles={vehicles}
        filter={filter}
        availableGroups={availableGroups}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilter}
        onExportCsv={handleExportCsv}
      />

      {/* 2. EXECUTIVE KPI TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Avg Utilization Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Utilization Rate</span>
            <Gauge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {analyticsData.summary.avgUtilizationRate}%
              </p>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                +{analyticsData.summary.utilizationDeltaPercent}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono mt-0.5">Fleet Capacity Used</p>
          </div>
        </div>

        {/* Metric 2: Avg Daily Mileage */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Daily Mileage</span>
            <Car className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-black text-cyan-700 dark:text-cyan-400 font-mono">
                {analyticsData.summary.avgDailyMileageKm}
              </p>
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">km/d</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono mt-0.5">
              {analyticsData.summary.totalPeriodDistanceKm.toLocaleString()} km total
            </p>
          </div>
        </div>

        {/* Metric 3: Idle Engine Hours */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Idle Engine Time</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">
                {analyticsData.summary.totalIdleHours}h
              </p>
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">
                ({analyticsData.summary.idleRatioPercent}%)
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono mt-0.5">
              Avg {analyticsData.summary.avgIdlePerVehicleHours}h / vehicle
            </p>
          </div>
        </div>

        {/* Metric 4: Wasted Idle Cost */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Idle Loss (USD)</span>
            <DollarSign className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">
              ${analyticsData.summary.wastedIdleCostUsd.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono mt-0.5">
              {analyticsData.summary.wastedIdleFuelLiters} L fuel burned
            </p>
          </div>
        </div>

        {/* Metric 5: Filtered Units */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Cohort</span>
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {analyticsData.summary.filteredVehiclesCount}
              </p>
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">
                / {analyticsData.summary.totalVehicles}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono mt-0.5">
              {filter.selectedGroups.includes('all')
                ? 'All Fleet Groups'
                : `${filter.selectedGroups.length} Groups selected`}
            </p>
          </div>
        </div>

        {/* Metric 6: CO2 Emissions Waste */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xs dark:shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Carbon Impact</span>
            <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
              {analyticsData.summary.carbonWastedKg.toLocaleString()} kg
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono mt-0.5">CO2 from excess idle</p>
          </div>
        </div>
      </div>

      {/* 3. ACTIONABLE AI TELEMATICS INSIGHTS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {analyticsData.insights.map((ins) => (
          <div
            key={ins.id}
            className={`p-4 rounded-2xl bg-white dark:bg-zinc-950 border transition-all flex flex-col justify-between gap-3 shadow-xs dark:shadow-none ${
              ins.type === 'critical'
                ? 'border-rose-200 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-500/60'
                : ins.type === 'warning'
                ? 'border-amber-200 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-500/60'
                : ins.type === 'positive'
                ? 'border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-500/60'
                : 'border-cyan-200 dark:border-cyan-500/30 hover:border-cyan-400 dark:hover:border-cyan-500/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider ${
                    ins.type === 'critical'
                      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                      : ins.type === 'warning'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                      : ins.type === 'positive'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20'
                  }`}
                >
                  {ins.category.toUpperCase()} ALERT
                </span>
                <Sparkles className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">{ins.title}</h4>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">{ins.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80">
              <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">
                Recommendation:
              </span>
              <p className="text-[10px] text-slate-700 dark:text-zinc-300 font-sans mt-0.5">
                {ins.actionableRecommendation}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. VISUALIZATION 1: VEHICLE UTILIZATION RATES (RECHARTS) */}
      <UtilizationChart
        dailyData={analyticsData.dailyUtilizationTrend}
        vehicleData={analyticsData.vehicleUtilizationList}
        avgRate={analyticsData.summary.avgUtilizationRate}
      />

      {/* 5. VISUALIZATION 2: IDLE TIME DISTRIBUTION (RECHARTS) */}
      <IdleDistributionChart
        buckets={analyticsData.idleBuckets}
        timeOfDay={analyticsData.idleTimeOfDay}
        hotspots={analyticsData.idleHotspots}
        totalIdleHours={analyticsData.summary.totalIdleHours}
        wastedFuelLiters={analyticsData.summary.wastedIdleFuelLiters}
        wastedCostUsd={analyticsData.summary.wastedIdleCostUsd}
        carbonWastedKg={analyticsData.summary.carbonWastedKg}
      />

      {/* 6. VISUALIZATION 3: AVERAGE DAILY MILEAGE (RECHARTS) */}
      <MileageTrendChart
        dailyMileage={analyticsData.dailyMileageTrend}
        weekdayMileage={analyticsData.weekdayMileage}
        avgDailyKm={analyticsData.summary.avgDailyMileageKm}
        totalDistanceKm={analyticsData.summary.totalPeriodDistanceKm}
      />

      {/* 7. VEHICLE GROUP COMPARISON MATRIX & RADAR */}
      <GroupComparisonRadar
        radarData={analyticsData.radarComparison}
        groupSummaries={analyticsData.groupSummaries}
      />

      {/* 8. GRANULAR VEHICLE EFFICIENCY GRID */}
      <VehicleEfficiencyGrid vehicles={analyticsData.vehicleUtilizationList} />
    </div>
  );
};
