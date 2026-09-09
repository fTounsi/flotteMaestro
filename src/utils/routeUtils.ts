import { Vehicle, Trip } from '../types/fleet';

/**
 * Retrieves the associated trip for a vehicle from the trips list or synthesizes
 * a deterministic, realistic GPS trajectory path for that day's route.
 */
export function getVehicleDailyTrip(vehicle: Vehicle, existingTrips: Trip[] = []): Trip {
  // 1. Direct match by vehicleId or licensePlate
  const match = existingTrips.find(
    (tr) => tr.vehicleId === vehicle.id || tr.vehiclePlate === vehicle.licensePlate
  );
  if (match) {
    return match;
  }

  // 2. Synthesize realistic trajectory based on vehicle location
  const currentPos = vehicle.latestPosition || {
    latitude: 33.5731,
    longitude: -7.5898,
    address: 'Boulevard Mohamed V, Casablanca',
    speed: 52
  };

  const currentLat = currentPos.latitude;
  const currentLng = currentPos.longitude;

  // Determine realistic regional starting hub
  let startAddress = 'Casablanca Logistics Central Depot';
  let startLat = 33.6085;
  let startLng = -7.6050;

  if (currentLat > 35.0) {
    // Northern Morocco / Tanger
    startAddress = 'Tanger Med Logistics Free Zone';
    startLat = 35.8850;
    startLng = -5.5020;
  } else if (currentLat < 32.5 && currentLat > 31.0) {
    // Central South / Marrakech
    startAddress = 'Plateforme Fret Berrechid Hub';
    startLat = 33.2650;
    startLng = -7.5850;
  } else if (currentLat <= 31.0) {
    // Souss / Agadir
    startAddress = 'Agadir Haliopole Agro Logistics';
    startLat = 30.3850;
    startLng = -9.5320;
  } else if (currentLng > -6.0) {
    // East / Fez - Meknes
    startAddress = 'Rabat Agdal Fleet Hub';
    startLat = 33.9980;
    startLng = -6.8520;
  }

  // Interpolate 10 realistic waypoints along the route path
  const numSteps = 10;
  const waypoints: Trip['waypoints'] = [];
  const baseTime = new Date();
  baseTime.setHours(7, 30, 0, 0);

  for (let i = 0; i <= numSteps; i++) {
    const fraction = i / numSteps;
    // Add subtle curvature to mimic highway geometry
    const curveOffset = Math.sin(fraction * Math.PI) * 0.015 * (i % 2 === 0 ? 1 : -1);

    const lat = Number((startLat + (currentLat - startLat) * fraction + curveOffset).toFixed(5));
    const lng = Number((startLng + (currentLng - startLng) * fraction - curveOffset * 0.8).toFixed(5));

    const stepTime = new Date(baseTime.getTime() + fraction * 140 * 60 * 1000);
    const timeStr = stepTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Speed fluctuates realistically between 30 (urban) and 95 (highway)
    const isStartOrEnd = i === 0 || i === numSteps;
    const speed = isStartOrEnd ? (i === numSteps ? currentPos.speed || 0 : 0) : Math.round(55 + Math.sin(i * 1.5) * 35);

    waypoints.push({
      lat,
      lng,
      speed,
      time: timeStr,
      altitude: Math.round(20 + fraction * 180 + Math.sin(i) * 30)
    });
  }

  const distanceKm = vehicle.dailyDistanceKm || 128.4;
  const durationMinutes = Math.round((distanceKm / 55) * 60);

  return {
    id: `trip_gen_${vehicle.id}`,
    vehicleId: vehicle.id,
    vehiclePlate: vehicle.licensePlate,
    startTime: waypoints[0].time,
    endTime: waypoints[waypoints.length - 1].time,
    durationMinutes,
    distanceKm,
    maxSpeedKmH: Math.max(...waypoints.map((w) => w.speed), 88),
    avgSpeedKmH: Math.round(distanceKm / (durationMinutes / 60) || 58),
    startAddress,
    endAddress: currentPos.address || `${vehicle.make} ${vehicle.model} Current Location`,
    startCoords: [startLat, startLng],
    endCoords: [currentLat, currentLng],
    waypoints,
    stopsCount: 2,
    idleDurationMinutes: 14,
    fuelConsumedLiters: Number(((distanceKm / 100) * 8.4).toFixed(1))
  };
}
