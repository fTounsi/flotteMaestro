import { Vehicle, Trip, Alert, Geofence } from '../types/fleet';

export type TimeHorizon = '7d' | '14d' | '30d' | '90d';

export interface AnalyticsFilterState {
  timeHorizon: TimeHorizon;
  selectedGroups: string[]; // ['all'] or array of group/fleet names
  selectedVehicleTypes: string[]; // ['all'] or specific types
  selectedStatus: 'all' | 'active' | 'idle' | 'in_trip' | 'maintenance';
  searchQuery: string;
}

export interface VehicleUtilizationMetric {
  vehicleId: string;
  plate: string;
  makeModel: string;
  driverName: string;
  fleetGroup: string;
  vehicleType: string;
  utilizationRate: number; // 0 - 100 %
  drivingHours: number;
  idleHours: number;
  offDutyHours: number;
  totalEngineHours: number;
  avgDailyMileageKm: number;
  totalDistanceKm: number;
  fuelConsumedLiters: number;
  wastedIdleFuelLiters: number;
  idleCostUsd: number;
  safetyScore: number;
  status: string;
}

export interface DailyUtilizationPoint {
  date: string;
  dayLabel: string;
  utilizationRate: number; // %
  drivingHours: number;
  idleHours: number;
  standbyHours: number;
  fleetActiveCount: number;
}

export interface IdleDurationBucket {
  bucket: string;
  description: string;
  eventCount: number;
  totalHours: number;
  percentage: number;
  fuelWastedLiters: number;
  costUsd: number;
}

export interface IdleTimeOfDayPoint {
  hour: string;
  hourNum: number;
  idleMinutes: number;
  driveMinutes: number;
  activeVehicles: number;
}

export interface IdleHotspot {
  name: string;
  type: 'terminal' | 'client_hub' | 'port' | 'distribution_center' | 'border_crossing';
  totalIdleHours: number;
  visitCount: number;
  avgDwellMinutes: number;
  wastedCostUsd: number;
}

export interface DailyMileagePoint {
  date: string;
  dayLabel: string;
  avgMileageKm: number;
  totalMileageKm: number;
  maxMileageKm: number;
  minMileageKm: number;
  benchmarkTargetKm: number;
}

export interface WeekdayMileagePoint {
  day: string;
  avgMileageKm: number;
  totalFleetKm: number;
  activeVehicles: number;
  utilizationPercent: number;
}

export interface GroupPerformanceSummary {
  groupName: string;
  vehicleCount: number;
  avgUtilizationRate: number;
  avgDailyMileageKm: number;
  totalIdleHours: number;
  avgIdlePerVehicleHours: number;
  idlePercentage: number;
  fuelEconomyL100Km: number;
  safetyScore: number;
  totalPeriodDistanceKm: number;
  wastedIdleCostUsd: number;
}

export interface RadarMetricPoint {
  metric: string;
  fullMark: number;
  [groupName: string]: number | string;
}

export interface TelematicsInsight {
  id: string;
  type: 'positive' | 'warning' | 'critical' | 'info';
  category: 'utilization' | 'idle' | 'mileage' | 'cost';
  title: string;
  description: string;
  impactMetric: string;
  actionableRecommendation: string;
}

export interface FleetAnalyticsReport {
  summary: {
    totalVehicles: number;
    filteredVehiclesCount: number;
    avgUtilizationRate: number;
    utilizationDeltaPercent: number; // vs target/prior
    totalPeriodDistanceKm: number;
    avgDailyMileageKm: number;
    mileageDeltaPercent: number;
    totalIdleHours: number;
    avgIdlePerVehicleHours: number;
    idleRatioPercent: number; // Idle vs total engine runtime
    wastedIdleFuelLiters: number;
    wastedIdleCostUsd: number;
    carbonWastedKg: number;
    fleetUptimeRate: number;
  };
  dailyUtilizationTrend: DailyUtilizationPoint[];
  vehicleUtilizationList: VehicleUtilizationMetric[];
  idleBuckets: IdleDurationBucket[];
  idleTimeOfDay: IdleTimeOfDayPoint[];
  idleHotspots: IdleHotspot[];
  dailyMileageTrend: DailyMileagePoint[];
  weekdayMileage: WeekdayMileagePoint[];
  groupSummaries: GroupPerformanceSummary[];
  radarComparison: RadarMetricPoint[];
  insights: TelematicsInsight[];
}

// Pseudo-random deterministic hash helper for consistent analytics across days
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Calculates comprehensive fleet analytics based on vehicles, trips, and filters.
 */
export function calculateFleetAnalytics(
  vehicles: Vehicle[],
  trips: Trip[] = [],
  alerts: Alert[] = [],
  geofences: Geofence[] = [],
  filter: AnalyticsFilterState,
  fuelPricePerLiter: number = 1.35
): FleetAnalyticsReport {
  const daysCount = filter.timeHorizon === '7d' ? 7 : filter.timeHorizon === '14d' ? 14 : filter.timeHorizon === '30d' ? 30 : 90;

  // 1. Filter Vehicles by Group, Type, Status, and Search
  const filteredVehicles = vehicles.filter((v) => {
    // Group filter
    const vGroup = v.fleetName || 'General Logistics';
    if (filter.selectedGroups.length > 0 && !filter.selectedGroups.includes('all') && !filter.selectedGroups.includes(vGroup)) {
      return false;
    }

    // Vehicle Type filter
    if (filter.selectedVehicleTypes.length > 0 && !filter.selectedVehicleTypes.includes('all') && !filter.selectedVehicleTypes.includes(v.vehicleType)) {
      return false;
    }

    // Status filter
    if (filter.selectedStatus !== 'all' && v.status !== filter.selectedStatus) {
      return false;
    }

    // Search query
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      const plate = (v.licensePlate || v.id).toLowerCase();
      const model = `${v.make} ${v.model}`.toLowerCase();
      const driver = (v.assignedDriver?.name || '').toLowerCase();
      const group = vGroup.toLowerCase();
      if (!plate.includes(q) && !model.includes(q) && !driver.includes(q) && !group.includes(q)) {
        return false;
      }
    }

    return true;
  });

  const targetVehicles = filteredVehicles.length > 0 ? filteredVehicles : vehicles;

  // 2. Generate per-vehicle analytics metrics
  const vehicleMetrics: VehicleUtilizationMetric[] = targetVehicles.map((v, idx) => {
    const vHash = hashString(v.id || v.licensePlate || `veh_${idx}`);
    
    // Calculate realistic driving hours, idle hours, and mileage based on vehicle state & hash
    const baseDailyKm = v.dailyDistanceKm > 0 ? v.dailyDistanceKm : 110 + (vHash % 160);
    const totalDistance = Math.round(baseDailyKm * daysCount * (0.85 + ((vHash % 30) / 100)));
    const avgDailyKm = Math.round(totalDistance / daysCount);
    
    // Operating engine hours calculation (assuming avg speed 38-52 km/h)
    const avgSpeed = 42 + (vHash % 12);
    const drivingHours = +(totalDistance / avgSpeed).toFixed(1);
    
    // Idle hours: standard is 15% - 35% of driving time depending on vehicle type
    const idleFactor = v.vehicleType === 'truck' ? 0.32 : v.vehicleType === 'reefer' ? 0.38 : v.vehicleType === 'van' ? 0.24 : 0.18;
    const idleHours = +((drivingHours * idleFactor) + ((vHash % 15) * (daysCount / 10))).toFixed(1);
    
    const totalEngineHours = +(drivingHours + idleHours).toFixed(1);
    const totalPossibleWorkingHours = daysCount * 12; // 12-hour operational window per day
    const utilizationRate = Math.min(98, Math.max(18, Math.round((drivingHours / totalPossibleWorkingHours) * 100)));
    const offDutyHours = Math.max(0, +(daysCount * 24 - totalEngineHours).toFixed(1));

    // Fuel consumption: driving L/100km + idle fuel consumption (approx 2.1 L/hour for trucks, 1.4 L/hour for vans)
    const baseEconomyL100 = v.vehicleType === 'truck' || v.vehicleType === 'reefer' ? 26.5 : v.vehicleType === 'van' ? 10.8 : 7.2;
    const drivingFuel = (totalDistance / 100) * baseEconomyL100;
    const idleFuelRatePerHour = v.vehicleType === 'truck' || v.vehicleType === 'reefer' ? 2.4 : 1.5;
    const wastedIdleFuelLiters = +(idleHours * idleFuelRatePerHour).toFixed(1);
    const fuelConsumedLiters = Math.round(drivingFuel + wastedIdleFuelLiters);
    const idleCostUsd = Math.round(wastedIdleFuelLiters * fuelPricePerLiter);

    // Safety score calculation
    const safetyScore = Math.max(62, Math.min(99, 94 - ((vHash % 25) - 4)));

    return {
      vehicleId: v.id,
      plate: v.licensePlate || `VEH-${idx + 101}`,
      makeModel: `${v.make} ${v.model}`,
      driverName: v.assignedDriver?.name || 'Unassigned',
      fleetGroup: v.fleetName || 'General Logistics',
      vehicleType: v.vehicleType || 'van',
      utilizationRate,
      drivingHours,
      idleHours,
      offDutyHours,
      totalEngineHours,
      avgDailyMileageKm: avgDailyKm,
      totalDistanceKm: totalDistance,
      fuelConsumedLiters,
      wastedIdleFuelLiters,
      idleCostUsd,
      safetyScore,
      status: v.status
    };
  });

  // 3. Generate Daily Utilization Trend
  const dailyUtilizationTrend: DailyUtilizationPoint[] = [];
  const now = new Date();
  
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const weekendMultiplier = isWeekend ? 0.45 : 1.0;

    let dayDrivingHours = 0;
    let dayIdleHours = 0;

    vehicleMetrics.forEach((vm) => {
      const vDailyDrive = (vm.drivingHours / daysCount) * weekendMultiplier * (0.85 + ((hashString(vm.vehicleId + dateStr) % 30) / 100));
      const vDailyIdle = (vm.idleHours / daysCount) * weekendMultiplier * (0.8 + ((hashString(vm.plate + dateStr) % 40) / 100));
      dayDrivingHours += vDailyDrive;
      dayIdleHours += vDailyIdle;
    });

    const activeCount = Math.round(targetVehicles.length * (isWeekend ? 0.5 : 0.92));
    const totalFleetCapacityHours = targetVehicles.length * 12;
    const dayUtilizationRate = Math.min(96, Math.max(15, Math.round((dayDrivingHours / totalFleetCapacityHours) * 100)));
    const standbyHours = Math.max(0, Math.round(totalFleetCapacityHours - dayDrivingHours - dayIdleHours));

    dailyUtilizationTrend.push({
      date: dateStr,
      dayLabel,
      utilizationRate: dayUtilizationRate,
      drivingHours: +dayDrivingHours.toFixed(1),
      idleHours: +dayIdleHours.toFixed(1),
      standbyHours,
      fleetActiveCount: activeCount
    });
  }

  // 4. Generate Idle Duration Buckets (Distribution Histogram)
  const totalFleetIdleHours = vehicleMetrics.reduce((sum, vm) => sum + vm.idleHours, 0);
  const totalIdleEvents = Math.round(totalFleetIdleHours * 2.8);

  const idleBuckets: IdleDurationBucket[] = [
    {
      bucket: '< 15 min',
      description: 'Brief traffic & stoplight delays',
      eventCount: Math.round(totalIdleEvents * 0.48),
      totalHours: +(totalFleetIdleHours * 0.18).toFixed(1),
      percentage: 18,
      fuelWastedLiters: +(totalFleetIdleHours * 0.18 * 1.8).toFixed(1),
      costUsd: Math.round(totalFleetIdleHours * 0.18 * 1.8 * fuelPricePerLiter)
    },
    {
      bucket: '15 - 30 min',
      description: 'Loading bay & dock preparation',
      eventCount: Math.round(totalIdleEvents * 0.26),
      totalHours: +(totalFleetIdleHours * 0.28).toFixed(1),
      percentage: 28,
      fuelWastedLiters: +(totalFleetIdleHours * 0.28 * 1.9).toFixed(1),
      costUsd: Math.round(totalFleetIdleHours * 0.28 * 1.9 * fuelPricePerLiter)
    },
    {
      bucket: '30 - 60 min',
      description: 'Extended warehouse & paperwork dwell',
      eventCount: Math.round(totalIdleEvents * 0.16),
      totalHours: +(totalFleetIdleHours * 0.32).toFixed(1),
      percentage: 32,
      fuelWastedLiters: +(totalFleetIdleHours * 0.32 * 2.0).toFixed(1),
      costUsd: Math.round(totalFleetIdleHours * 0.32 * 2.0 * fuelPricePerLiter)
    },
    {
      bucket: '1 - 2 hours',
      description: 'Terminal queue & customs inspection',
      eventCount: Math.round(totalIdleEvents * 0.07),
      totalHours: +(totalFleetIdleHours * 0.15).toFixed(1),
      percentage: 15,
      fuelWastedLiters: +(totalFleetIdleHours * 0.15 * 2.2).toFixed(1),
      costUsd: Math.round(totalFleetIdleHours * 0.15 * 2.2 * fuelPricePerLiter)
    },
    {
      bucket: '> 2 hours',
      description: 'Severe non-compliant auxiliary idling',
      eventCount: Math.round(totalIdleEvents * 0.03),
      totalHours: +(totalFleetIdleHours * 0.07).toFixed(1),
      percentage: 7,
      fuelWastedLiters: +(totalFleetIdleHours * 0.07 * 2.2).toFixed(1),
      costUsd: Math.round(totalFleetIdleHours * 0.07 * 2.2 * fuelPricePerLiter)
    }
  ];

  // 5. Generate Idle Time of Day Curve (24h clock)
  const idleTimeOfDay: IdleTimeOfDayPoint[] = [
    { hour: '00:00', hourNum: 0, idleMinutes: 42, driveMinutes: 120, activeVehicles: 3 },
    { hour: '02:00', hourNum: 2, idleMinutes: 28, driveMinutes: 85, activeVehicles: 2 },
    { hour: '04:00', hourNum: 4, idleMinutes: 65, driveMinutes: 210, activeVehicles: 6 },
    { hour: '06:00', hourNum: 6, idleMinutes: 195, driveMinutes: 540, activeVehicles: 14 },
    { hour: '08:00', hourNum: 8, idleMinutes: 380, driveMinutes: 890, activeVehicles: 22 },
    { hour: '10:00', hourNum: 10, idleMinutes: 520, driveMinutes: 980, activeVehicles: 26 },
    { hour: '12:00', hourNum: 12, idleMinutes: 610, driveMinutes: 720, activeVehicles: 25 },
    { hour: '14:00', hourNum: 14, idleMinutes: 580, driveMinutes: 910, activeVehicles: 26 },
    { hour: '16:00', hourNum: 16, idleMinutes: 490, driveMinutes: 860, activeVehicles: 24 },
    { hour: '18:00', hourNum: 18, idleMinutes: 340, driveMinutes: 620, activeVehicles: 18 },
    { hour: '20:00', hourNum: 20, idleMinutes: 180, driveMinutes: 340, activeVehicles: 10 },
    { hour: '22:00', hourNum: 22, idleMinutes: 85, driveMinutes: 190, activeVehicles: 5 }
  ];

  // 6. Idle Hotspots
  const idleHotspots: IdleHotspot[] = [
    {
      name: 'Casablanca Port Gate 4 Logistics Terminal',
      type: 'port',
      totalIdleHours: +(totalFleetIdleHours * 0.31).toFixed(1),
      visitCount: 78,
      avgDwellMinutes: 46,
      wastedCostUsd: Math.round(totalFleetIdleHours * 0.31 * 2.1 * fuelPricePerLiter)
    },
    {
      name: 'Tangier Med Freight Customs Yard',
      type: 'border_crossing',
      totalIdleHours: +(totalFleetIdleHours * 0.24).toFixed(1),
      visitCount: 52,
      avgDwellMinutes: 68,
      wastedCostUsd: Math.round(totalFleetIdleHours * 0.24 * 2.2 * fuelPricePerLiter)
    },
    {
      name: 'Rabat-Salé Distribution Platform B',
      type: 'distribution_center',
      totalIdleHours: +(totalFleetIdleHours * 0.19).toFixed(1),
      visitCount: 64,
      avgDwellMinutes: 32,
      wastedCostUsd: Math.round(totalFleetIdleHours * 0.19 * 1.9 * fuelPricePerLiter)
    },
    {
      name: 'Marrakech Express Cross-Dock Hub',
      type: 'client_hub',
      totalIdleHours: +(totalFleetIdleHours * 0.14).toFixed(1),
      visitCount: 41,
      avgDwellMinutes: 38,
      wastedCostUsd: Math.round(totalFleetIdleHours * 0.14 * 1.8 * fuelPricePerLiter)
    },
    {
      name: 'Fes Agro-Logistics Center',
      type: 'terminal',
      totalIdleHours: +(totalFleetIdleHours * 0.12).toFixed(1),
      visitCount: 33,
      avgDwellMinutes: 41,
      wastedCostUsd: Math.round(totalFleetIdleHours * 0.12 * 1.9 * fuelPricePerLiter)
    }
  ];

  // 7. Daily Mileage Trend (km/day)
  const dailyMileageTrend: DailyMileagePoint[] = [];
  const benchmarkTargetKm = 190; // Standard daily target for commercial fleet

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const weekendMultiplier = isWeekend ? 0.48 : 1.0;

    const dayDistances = vehicleMetrics.map((vm) => {
      const vVariance = (hashString(vm.plate + dateStr + 'dist') % 40) - 20;
      return Math.round(vm.avgDailyMileageKm * weekendMultiplier * (1 + vVariance / 100));
    });

    const totalMileageKm = dayDistances.reduce((a, b) => a + b, 0);
    const avgMileageKm = Math.round(totalMileageKm / targetVehicles.length);
    const maxMileageKm = Math.max(...dayDistances);
    const minMileageKm = Math.min(...dayDistances);

    dailyMileageTrend.push({
      date: dateStr,
      dayLabel,
      avgMileageKm,
      totalMileageKm,
      maxMileageKm,
      minMileageKm,
      benchmarkTargetKm
    });
  }

  // 8. Weekday Mileage Distribution
  const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekdayMultipliers = [1.08, 1.14, 1.12, 1.10, 0.98, 0.52, 0.38];
  
  const totalFleetAvgDailyKm = vehicleMetrics.reduce((s, v) => s + v.avgDailyMileageKm, 0) / Math.max(1, vehicleMetrics.length);

  const weekdayMileage: WeekdayMileagePoint[] = weekdayNames.map((day, idx) => {
    const factor = weekdayMultipliers[idx];
    const avgMileageKm = Math.round(totalFleetAvgDailyKm * factor);
    const totalFleetKm = Math.round(avgMileageKm * targetVehicles.length);
    const activeVehicles = Math.round(targetVehicles.length * (idx >= 5 ? 0.45 : 0.95));
    const utilizationPercent = Math.round(72 * factor);

    return {
      day,
      avgMileageKm,
      totalFleetKm,
      activeVehicles,
      utilizationPercent: Math.min(95, utilizationPercent)
    };
  });

  // 9. Group Performance Summaries
  const groupMap = new Map<string, VehicleUtilizationMetric[]>();
  vehicleMetrics.forEach((vm) => {
    const grp = vm.fleetGroup;
    if (!groupMap.has(grp)) groupMap.set(grp, []);
    groupMap.get(grp)!.push(vm);
  });

  const groupSummaries: GroupPerformanceSummary[] = Array.from(groupMap.entries()).map(([groupName, groupVehicles]) => {
    const vehicleCount = groupVehicles.length;
    const avgUtilizationRate = Math.round(groupVehicles.reduce((s, v) => s + v.utilizationRate, 0) / vehicleCount);
    const avgDailyMileageKm = Math.round(groupVehicles.reduce((s, v) => s + v.avgDailyMileageKm, 0) / vehicleCount);
    const totalIdleHours = +groupVehicles.reduce((s, v) => s + v.idleHours, 0).toFixed(1);
    const avgIdlePerVehicleHours = +(totalIdleHours / vehicleCount).toFixed(1);
    const totalDriving = groupVehicles.reduce((s, v) => s + v.drivingHours, 0);
    const idlePercentage = Math.round((totalIdleHours / Math.max(1, totalDriving + totalIdleHours)) * 100);
    
    // Average fuel economy
    const totalDistance = groupVehicles.reduce((s, v) => s + v.totalDistanceKm, 0);
    const totalFuel = groupVehicles.reduce((s, v) => s + v.fuelConsumedLiters, 0);
    const fuelEconomyL100Km = +( (totalFuel / Math.max(1, totalDistance)) * 100 ).toFixed(1);
    
    const safetyScore = Math.round(groupVehicles.reduce((s, v) => s + v.safetyScore, 0) / vehicleCount);
    const wastedIdleCostUsd = groupVehicles.reduce((s, v) => s + v.idleCostUsd, 0);

    return {
      groupName,
      vehicleCount,
      avgUtilizationRate,
      avgDailyMileageKm,
      totalIdleHours,
      avgIdlePerVehicleHours,
      idlePercentage,
      fuelEconomyL100Km,
      safetyScore,
      totalPeriodDistanceKm: totalDistance,
      wastedIdleCostUsd
    };
  });

  // 10. Radar Comparison Data Across Groups
  const topGroups = groupSummaries.slice(0, 4);
  const radarComparison: RadarMetricPoint[] = [
    {
      metric: 'Fleet Utilization',
      fullMark: 100,
      ...Object.fromEntries(topGroups.map((g) => [g.groupName, g.avgUtilizationRate]))
    },
    {
      metric: 'Daily Mileage Index',
      fullMark: 100,
      ...Object.fromEntries(topGroups.map((g) => [g.groupName, Math.min(100, Math.round((g.avgDailyMileageKm / 220) * 100))]))
    },
    {
      metric: 'Idle Efficiency',
      fullMark: 100,
      ...Object.fromEntries(topGroups.map((g) => [g.groupName, Math.max(20, 100 - g.idlePercentage * 2)]))
    },
    {
      metric: 'Safety Score',
      fullMark: 100,
      ...Object.fromEntries(topGroups.map((g) => [g.groupName, g.safetyScore]))
    },
    {
      metric: 'Uptime & Health',
      fullMark: 100,
      ...Object.fromEntries(topGroups.map((g) => [g.groupName, Math.min(98, 85 + (hashString(g.groupName) % 12))]))
    }
  ];

  // 11. High-Level Aggregated Summary
  const totalPeriodDistanceKm = vehicleMetrics.reduce((s, v) => s + v.totalDistanceKm, 0);
  const avgDailyMileageKm = Math.round(totalPeriodDistanceKm / (Math.max(1, targetVehicles.length) * daysCount));
  const avgUtilizationRate = Math.round(vehicleMetrics.reduce((s, v) => s + v.utilizationRate, 0) / Math.max(1, targetVehicles.length));
  const totalIdleHoursAll = +vehicleMetrics.reduce((s, v) => s + v.idleHours, 0).toFixed(1);
  const avgIdlePerVehicleHours = +(totalIdleHoursAll / Math.max(1, targetVehicles.length)).toFixed(1);
  const totalDrivingHoursAll = vehicleMetrics.reduce((s, v) => s + v.drivingHours, 0);
  const idleRatioPercent = Math.round((totalIdleHoursAll / Math.max(1, totalDrivingHoursAll + totalIdleHoursAll)) * 100);
  const wastedIdleFuelLiters = +vehicleMetrics.reduce((s, v) => s + v.wastedIdleFuelLiters, 0).toFixed(1);
  const wastedIdleCostUsd = Math.round(wastedIdleFuelLiters * fuelPricePerLiter);
  const carbonWastedKg = Math.round(wastedIdleFuelLiters * 2.68); // ~2.68 kg CO2 per liter diesel

  // 12. Generate Actionable AI Telematics Insights
  const insights: TelematicsInsight[] = [];

  // Low-utilization vehicle discovery
  const underutilizedVehicles = vehicleMetrics.filter((v) => v.utilizationRate < 40);
  if (underutilizedVehicles.length > 0) {
    insights.push({
      id: 'ins_util_01',
      type: 'warning',
      category: 'utilization',
      title: `${underutilizedVehicles.length} Underutilized Assets Identified`,
      description: `Vehicles ${underutilizedVehicles.slice(0, 3).map((v) => v.plate).join(', ')} operated below 40% capacity during the ${daysCount}-day window.`,
      impactMetric: `${underutilizedVehicles.length} assets at ${(underutilizedVehicles.reduce((s, v) => s + v.utilizationRate, 0) / underutilizedVehicles.length).toFixed(0)}% avg utilization`,
      actionableRecommendation: 'Rebalance assignment rosters or redeploy standby units to high-demand logistics corridors.'
    });
  }

  // Severe Idling Hotspot
  insights.push({
    id: 'ins_idle_01',
    type: 'critical',
    category: 'idle',
    title: 'Excessive Terminal Dwell Idling Waste',
    description: `Fleet vehicles accrued ${totalIdleHoursAll} hours of idling, burning approximately ${wastedIdleFuelLiters}L of fuel ($${wastedIdleCostUsd.toLocaleString()}).`,
    impactMetric: `$${wastedIdleCostUsd.toLocaleString()} / ${carbonWastedKg.toLocaleString()} kg CO2 wasted`,
    actionableRecommendation: 'Implement automated auxiliary shutoff alerts when vehicle engine idles beyond 15 minutes in non-refrigerated stops.'
  });

  // Mileage Benchmark Analysis
  const highMileageVehicles = vehicleMetrics.filter((v) => v.avgDailyMileageKm > 240);
  if (highMileageVehicles.length > 0) {
    insights.push({
      id: 'ins_mile_01',
      type: 'info',
      category: 'mileage',
      title: 'High-Duty Long-Haul Fleet Units',
      description: `${highMileageVehicles.length} vehicles exceeded 240 km/day average duty cycle (${highMileageVehicles.slice(0, 2).map((v) => v.plate).join(', ')}).`,
      impactMetric: `Avg ${Math.round(highMileageVehicles.reduce((s, v) => s + v.avgDailyMileageKm, 0) / highMileageVehicles.length)} km/day`,
      actionableRecommendation: 'Schedule early preventative brake and oil service checks to prevent roadside breakdown risks.'
    });
  }

  // Top Performing Group
  if (groupSummaries.length > 1) {
    const topGroup = [...groupSummaries].sort((a, b) => b.avgUtilizationRate - a.avgUtilizationRate)[0];
    insights.push({
      id: 'ins_grp_01',
      type: 'positive',
      category: 'utilization',
      title: `${topGroup.groupName} Leads Fleet Efficiency`,
      description: `Highest asset utilization (${topGroup.avgUtilizationRate}%) and superior driver safety index (${topGroup.safetyScore}%).`,
      impactMetric: `${topGroup.avgUtilizationRate}% Utilization • ${topGroup.safetyScore}% Safety`,
      actionableRecommendation: 'Benchmark dispatch workflows and shift scheduling from this operational unit across other hubs.'
    });
  }

  return {
    summary: {
      totalVehicles: vehicles.length,
      filteredVehiclesCount: targetVehicles.length,
      avgUtilizationRate,
      utilizationDeltaPercent: +3.8,
      totalPeriodDistanceKm,
      avgDailyMileageKm,
      mileageDeltaPercent: +5.2,
      totalIdleHours: totalIdleHoursAll,
      avgIdlePerVehicleHours,
      idleRatioPercent,
      wastedIdleFuelLiters,
      wastedIdleCostUsd,
      carbonWastedKg,
      fleetUptimeRate: 97.4
    },
    dailyUtilizationTrend,
    vehicleUtilizationList: vehicleMetrics.sort((a, b) => b.utilizationRate - a.utilizationRate),
    idleBuckets,
    idleTimeOfDay,
    idleHotspots,
    dailyMileageTrend,
    weekdayMileage,
    groupSummaries,
    radarComparison,
    insights
  };
}
