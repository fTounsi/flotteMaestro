import { Vehicle, Trip, Alert, Geofence, FleetReport } from '../types/fleet';

export interface ReportConfig {
  reportType:
    | 'mileage'
    | 'trips'
    | 'safety'
    | 'fuel'
    | 'geofence'
    | 'coldchain'
    | 'maintenance'
    | 'executive_summary';
  vehicleScope: 'all' | 'selected' | 'fleet';
  selectedVehicleIds: string[];
  selectedFleetTag?: string;
  timePeriod: 'today' | 'yesterday' | 'last_7_days' | 'last_14_days' | 'this_month' | 'last_month' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  includeIdleAnalysis: boolean;
  includeFuelCosts: boolean;
  includeDriverDetails: boolean;
  fuelPricePerLiter: number;
  speedThresholdKmH: number;
}

export interface VehicleReportRow {
  vehicleId: string;
  plate: string;
  makeModel: string;
  fleetGroup: string;
  driverName: string;
  status: string;
  totalDistanceKm: number;
  engineHours: number;
  idleMinutes: number;
  tripsCount: number;
  fuelConsumedLiters: number;
  fuelCostUsd: number;
  avgConsumptionL100Km: number;
  maxSpeedKmH: number;
  avgSpeedKmH: number;
  overspeedIncidents: number;
  harshBrakeIncidents: number;
  geofenceVisits: number;
  safetyScore: number;
  maintenanceStatus: 'good' | 'due_soon' | 'overdue';
  avgTemperatureCelsius?: number;
}

export interface GranularEventRow {
  id: string;
  timestamp: string;
  vehiclePlate: string;
  eventType: 'trip_completed' | 'overspeed' | 'harsh_brake' | 'geofence_entry' | 'geofence_exit' | 'fuel_refuel' | 'temp_excursion';
  description: string;
  location: string;
  value: string;
  severity?: 'info' | 'warning' | 'critical';
}

export interface CompiledReportData {
  id: string;
  title: string;
  generatedAt: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  scopeSummary: string;
  selectedVehiclesCount: number;
  totalFleetCount: number;
  summary: {
    totalDistanceKm: number;
    totalEngineHours: number;
    totalIdleHours: number;
    totalTrips: number;
    totalFuelLiters: number;
    totalFuelCostUsd: number;
    avgFleetEfficiencyL100Km: number;
    fleetSafetyScore: number;
    totalSafetyIncidents: number;
    totalGeofenceEvents: number;
    activeVehiclesCount: number;
  };
  vehicleRows: VehicleReportRow[];
  eventRows: GranularEventRow[];
  dailyTrend: {
    date: string;
    distanceKm: number;
    fuelLiters: number;
    incidents: number;
    activeVehicles: number;
  }[];
}

// Generate realistic compiled report data from real fleet vehicles & mock models
export function compileFleetReport(
  config: ReportConfig,
  vehicles: Vehicle[],
  trips: Trip[],
  alerts: Alert[],
  geofences: Geofence[],
  orgName: string
): CompiledReportData {
  const reportId = `rep_${Date.now()}`;
  const now = new Date();

  // Filter Target Vehicles
  let targetVehicles: Vehicle[] = [];
  if (config.vehicleScope === 'all') {
    targetVehicles = [...vehicles];
  } else if (config.vehicleScope === 'selected') {
    targetVehicles = vehicles.filter((v) => config.selectedVehicleIds.includes(v.id));
    if (targetVehicles.length === 0) {
      targetVehicles = [...vehicles]; // Fallback if empty
    }
  } else if (config.vehicleScope === 'fleet' && config.selectedFleetTag) {
    targetVehicles = vehicles.filter((v) => v.fleetName === config.selectedFleetTag);
    if (targetVehicles.length === 0) {
      targetVehicles = [...vehicles];
    }
  }

  // Calculate Date bounds
  let startDate = new Date();
  let endDate = new Date();
  let periodLabel = 'Last 7 Days';
  let daysFactor = 7;

  switch (config.timePeriod) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      periodLabel = `Today (${now.toLocaleDateString()})`;
      daysFactor = 1;
      break;
    case 'yesterday':
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      periodLabel = 'Yesterday';
      daysFactor = 1;
      break;
    case 'last_7_days':
      startDate.setDate(startDate.getDate() - 7);
      periodLabel = 'Last 7 Days';
      daysFactor = 7;
      break;
    case 'last_14_days':
      startDate.setDate(startDate.getDate() - 14);
      periodLabel = 'Last 14 Days';
      daysFactor = 14;
      break;
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      periodLabel = `This Month (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})`;
      daysFactor = Math.max(1, now.getDate());
      break;
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      periodLabel = 'Last Month';
      daysFactor = 30;
      break;
    case 'custom':
      if (config.customStartDate && config.customEndDate) {
        startDate = new Date(config.customStartDate);
        endDate = new Date(config.customEndDate);
        const diffDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
        daysFactor = diffDays;
        periodLabel = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      }
      break;
  }

  // Build titles by Report Type
  const typeTitles: Record<string, string> = {
    mileage: 'Daily Mileage & Fleet Utilization Audit',
    trips: 'Trip Chronology & Waypoint Route Log',
    safety: 'Eco-Driving & Driver Safety Compliance Report',
    fuel: 'Fuel Consumption & Energy Efficiency Audit',
    geofence: 'Geofence Perimeter Entry/Exit Compliance',
    coldchain: 'Cold-Chain Temperature & HACCP Excursion Report',
    maintenance: 'Predictive Maintenance & OBD-II Diagnostic Health',
    executive_summary: 'Comprehensive Fleet 360° Executive Summary'
  };

  const title = `${typeTitles[config.reportType] || 'Fleet Operational Audit'} (${periodLabel})`;

  // Compile vehicle rows
  const vehicleRows: VehicleReportRow[] = targetVehicles.map((veh, idx) => {
    // Generate deterministic yet realistic metrics per vehicle based on ID and day count
    const seed = (idx + 1) * 17;
    const baseDailyKm = veh.vehicleType === 'truck' ? 180 : veh.vehicleType === 'reefer' ? 160 : veh.vehicleType === 'van' ? 120 : 95;
    const distanceKm = Math.round((baseDailyKm * daysFactor * (0.85 + (seed % 30) / 100)) * 10) / 10;
    const engineHours = Math.round((distanceKm / (veh.vehicleType === 'truck' ? 62 : 48) + (seed % 10)) * 10) / 10;
    const idleMinutes = Math.round(daysFactor * (25 + (seed % 35)));
    const tripsCount = Math.max(1, Math.round(daysFactor * (2.2 + (seed % 3))));
    
    const baseL100 = veh.vehicleType === 'truck' ? 28.5 : veh.vehicleType === 'reefer' ? 31.0 : veh.vehicleType === 'van' ? 9.8 : 7.2;
    const avgConsumptionL100Km = Math.round((baseL100 * (0.95 + (seed % 12) / 100)) * 10) / 10;
    const fuelConsumedLiters = Math.round((distanceKm * (avgConsumptionL100Km / 100)) * 10) / 10;
    const fuelCostUsd = Math.round((fuelConsumedLiters * config.fuelPricePerLiter) * 100) / 100;
    
    const maxSpeedKmH = Math.min(130, Math.round(92 + (seed % 28)));
    const avgSpeedKmH = Math.round((distanceKm / Math.max(1, engineHours)) * 10) / 10;
    
    const overspeedIncidents = Math.max(0, Math.round((seed % 6) * (daysFactor / 7)));
    const harshBrakeIncidents = Math.max(0, Math.round((seed % 4) * (daysFactor / 7)));
    const geofenceVisits = Math.max(1, Math.round(tripsCount * 1.8));
    
    const safetyDeduction = (overspeedIncidents * 4) + (harshBrakeIncidents * 3);
    const safetyScore = Math.max(65, Math.min(100, 98 - safetyDeduction));
    
    const maintenanceStatus = (seed % 5 === 0) ? 'due_soon' : (seed % 9 === 0) ? 'overdue' : 'good';
    const avgTemperatureCelsius = veh.vehicleType === 'reefer' ? -18.2 + (seed % 5) : 3.5;

    return {
      vehicleId: veh.id,
      plate: veh.licensePlate || `VEH-${idx + 1}`,
      makeModel: `${veh.make} ${veh.model} (${veh.modelYear})`,
      fleetGroup: veh.fleetName || 'General Fleet',
      driverName: veh.assignedDriver?.name || 'Unassigned Driver',
      status: veh.status || 'moving',
      totalDistanceKm: distanceKm,
      engineHours,
      idleMinutes,
      tripsCount,
      fuelConsumedLiters,
      fuelCostUsd,
      avgConsumptionL100Km,
      maxSpeedKmH,
      avgSpeedKmH,
      overspeedIncidents,
      harshBrakeIncidents,
      geofenceVisits,
      safetyScore,
      maintenanceStatus,
      avgTemperatureCelsius
    };
  });

  // Calculate Fleet Totals
  const totalDistanceKm = Math.round(vehicleRows.reduce((sum, r) => sum + r.totalDistanceKm, 0) * 10) / 10;
  const totalEngineHours = Math.round(vehicleRows.reduce((sum, r) => sum + r.engineHours, 0) * 10) / 10;
  const totalIdleMinutes = vehicleRows.reduce((sum, r) => sum + r.idleMinutes, 0);
  const totalIdleHours = Math.round((totalIdleMinutes / 60) * 10) / 10;
  const totalTrips = vehicleRows.reduce((sum, r) => sum + r.tripsCount, 0);
  const totalFuelLiters = Math.round(vehicleRows.reduce((sum, r) => sum + r.fuelConsumedLiters, 0) * 10) / 10;
  const totalFuelCostUsd = Math.round(vehicleRows.reduce((sum, r) => sum + r.fuelCostUsd, 0) * 100) / 100;
  const avgFleetEfficiencyL100Km = totalDistanceKm > 0
    ? Math.round(((totalFuelLiters / totalDistanceKm) * 100) * 10) / 10
    : 0;
  const fleetSafetyScore = vehicleRows.length > 0
    ? Math.round(vehicleRows.reduce((sum, r) => sum + r.safetyScore, 0) / vehicleRows.length)
    : 100;
  const totalSafetyIncidents = vehicleRows.reduce((sum, r) => sum + r.overspeedIncidents + r.harshBrakeIncidents, 0);
  const totalGeofenceEvents = vehicleRows.reduce((sum, r) => sum + r.geofenceVisits, 0);
  const activeVehiclesCount = vehicleRows.filter((r) => r.status !== 'offline').length;

  // Generate Granular Events Table
  const eventRows: GranularEventRow[] = [];
  targetVehicles.forEach((veh, vIdx) => {
    const plate = veh.licensePlate || `VEH-${vIdx + 1}`;
    
    // Add sample trips
    eventRows.push({
      id: `evt_trp_${vIdx}_1`,
      timestamp: new Date(Date.now() - 3600000 * (vIdx + 1)).toISOString(),
      vehiclePlate: plate,
      eventType: 'trip_completed',
      description: `Completed freight route to Central Depot`,
      location: 'Casablanca Logistics Hub',
      value: `${(45 + vIdx * 12).toFixed(1)} km (42 min)`,
      severity: 'info'
    });

    // Add overspeed if applicable
    if (vIdx % 2 === 0) {
      eventRows.push({
        id: `evt_spd_${vIdx}`,
        timestamp: new Date(Date.now() - 7200000 * (vIdx + 1)).toISOString(),
        vehiclePlate: plate,
        eventType: 'overspeed',
        description: `Exceeded zone speed limit (${config.speedThresholdKmH} km/h threshold)`,
        location: 'A1 Motorway Km 84',
        value: `${104 + (vIdx % 15)} km/h (Limit: 90 km/h)`,
        severity: 'warning'
      });
    }

    // Add geofence event
    eventRows.push({
      id: `evt_geo_${vIdx}`,
      timestamp: new Date(Date.now() - 10800000 * (vIdx + 1)).toISOString(),
      vehiclePlate: plate,
      eventType: 'geofence_entry',
      description: `Entered authorized terminal zone`,
      location: 'Port Terminal Gate 4',
      value: `Check-in verified`,
      severity: 'info'
    });

    if (veh.vehicleType === 'reefer') {
      eventRows.push({
        id: `evt_tmp_${vIdx}`,
        timestamp: new Date(Date.now() - 14400000 * (vIdx + 1)).toISOString(),
        vehiclePlate: plate,
        eventType: 'temp_excursion',
        description: `Deep Freeze compartment temperature alert`,
        location: 'Highway RN1 - Agadir Corridor',
        value: `-14.2°C (Set-point: -18.0°C)`,
        severity: 'critical'
      });
    }
  });

  // Generate Daily Trend Data
  const dailyTrend = [];
  const trendDays = Math.min(daysFactor, 14);
  for (let i = trendDays - 1; i >= 0; i--) {
    const dayDate = new Date();
    dayDate.setDate(dayDate.getDate() - i);
    const dateStr = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const daySeed = (i + 3) * 11;
    const dayDistance = Math.round((totalDistanceKm / trendDays) * (0.75 + (daySeed % 50) / 100));
    const dayFuel = Math.round(dayDistance * (avgFleetEfficiencyL100Km / 100));
    const dayIncidents = (daySeed % 4 === 0) ? 2 : (daySeed % 2 === 0) ? 1 : 0;

    dailyTrend.push({
      date: dateStr,
      distanceKm: dayDistance,
      fuelLiters: dayFuel,
      incidents: dayIncidents,
      activeVehicles: Math.max(1, targetVehicles.length - (i % 2))
    });
  }

  const scopeSummary = config.vehicleScope === 'all'
    ? `All Fleet Vehicles (${targetVehicles.length} total)`
    : config.vehicleScope === 'selected'
    ? `${targetVehicles.length} Selected Vehicle${targetVehicles.length > 1 ? 's' : ''}`
    : `Fleet Cohort: ${config.selectedFleetTag || 'Selected Group'} (${targetVehicles.length} vehicles)`;

  return {
    id: reportId,
    title,
    generatedAt: now.toISOString(),
    periodLabel,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    scopeSummary,
    selectedVehiclesCount: targetVehicles.length,
    totalFleetCount: vehicles.length,
    summary: {
      totalDistanceKm,
      totalEngineHours,
      totalIdleHours,
      totalTrips,
      totalFuelLiters,
      totalFuelCostUsd,
      avgFleetEfficiencyL100Km,
      fleetSafetyScore,
      totalSafetyIncidents,
      totalGeofenceEvents,
      activeVehiclesCount
    },
    vehicleRows,
    eventRows,
    dailyTrend
  };
}

// Client-side RFC 4180 CSV export generator
export function downloadReportCsv(report: CompiledReportData) {
  const headers = [
    'Vehicle Plate',
    'Make & Model',
    'Fleet Group',
    'Assigned Driver',
    'Status',
    'Total Distance (km)',
    'Engine Hours (h)',
    'Idle Time (min)',
    'Trips Count',
    'Fuel Consumed (L)',
    'Avg L/100km',
    'Fuel Cost ($)',
    'Max Speed (km/h)',
    'Avg Speed (km/h)',
    'Overspeed Count',
    'Harsh Braking Count',
    'Safety Score (%)',
    'Maintenance Health'
  ];

  const rows = report.vehicleRows.map((r) => [
    `"${r.plate}"`,
    `"${r.makeModel}"`,
    `"${r.fleetGroup}"`,
    `"${r.driverName}"`,
    `"${r.status}"`,
    r.totalDistanceKm,
    r.engineHours,
    r.idleMinutes,
    r.tripsCount,
    r.fuelConsumedLiters,
    r.avgConsumptionL100Km,
    r.fuelCostUsd,
    r.maxSpeedKmH,
    r.avgSpeedKmH,
    r.overspeedIncidents,
    r.harshBrakeIncidents,
    r.safetyScore,
    `"${r.maintenanceStatus}"`
  ]);

  const csvContent = [
    `# Report Title: ${report.title}`,
    `# Scope: ${report.scopeSummary}`,
    `# Period: ${report.periodLabel}`,
    `# Generated At: ${new Date(report.generatedAt).toLocaleString()}`,
    `# Summary: Total Distance = ${report.summary.totalDistanceKm} km | Total Fuel = ${report.summary.totalFuelLiters} L | Safety Score = ${report.summary.fleetSafetyScore}%`,
    '',
    headers.join(','),
    ...rows.map((row) => row.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Client-side JSON payload export generator
export function downloadReportJson(report: CompiledReportData) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(report, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
