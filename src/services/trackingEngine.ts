import { Vehicle, GpsPosition, Geofence, Alert, WebSocketMessage, TrackerProtocol } from '../types/fleet';

/**
 * Calculates distance between two coordinates in meters (Haversine formula)
 */
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Checks if a coordinate is inside a polygon using ray casting
 */
export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Checks if coordinate is inside a geofence (circle or polygon)
 */
export function isInsideGeofence(lat: number, lng: number, geofence: Geofence): boolean {
  if (geofence.type === 'circle' && geofence.center && geofence.radiusMeters) {
    const dist = calculateDistanceMeters(lat, lng, geofence.center[0], geofence.center[1]);
    return dist <= geofence.radiusMeters;
  }
  if (geofence.type === 'polygon' && geofence.coordinates && geofence.coordinates.length > 2) {
    return isPointInPolygon([lat, lng], geofence.coordinates);
  }
  return false;
}

/**
 * Traccar Protocol Adapter Simulator
 * Converts protocol-specific binary/text telemetry into normalized GpsPosition
 */
export function normalizeTrackerMessage(
  protocol: TrackerProtocol,
  rawPayload: Record<string, any>,
  vehicle: Vehicle
): GpsPosition {
  const now = new Date().toISOString();
  return {
    id: `pos_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    trackerId: vehicle.trackerId || 'trk_gen',
    vehicleId: vehicle.id,
    latitude: rawPayload.latitude ?? vehicle.latestPosition.latitude,
    longitude: rawPayload.longitude ?? vehicle.latestPosition.longitude,
    speed: rawPayload.speed ?? vehicle.latestPosition.speed,
    heading: rawPayload.heading ?? vehicle.latestPosition.heading,
    altitude: rawPayload.altitude ?? 30,
    accuracy: rawPayload.accuracy ?? 2.5,
    ignition: rawPayload.ignition ?? vehicle.latestPosition.ignition,
    motion: (rawPayload.speed ?? vehicle.latestPosition.speed) > 2,
    battery: rawPayload.battery ?? vehicle.latestPosition.battery,
    externalVoltage: rawPayload.externalVoltage ?? vehicle.latestPosition.externalVoltage,
    odometer: rawPayload.odometer ?? (vehicle.odometer + 0.1),
    satellites: rawPayload.satellites ?? 16,
    protocol: protocol,
    address: rawPayload.address ?? vehicle.latestPosition.address,
    recordedAt: now,
    receivedAt: now,
    rawAttributes: {
      protocolType: protocol,
      rawHexOrAscii: `[${protocol.toUpperCase()}_MSG:0x${Math.random().toString(16).substring(2, 10)}]`,
      eventCode: rawPayload.eventCode || 0,
      gsmSignalLevel: 4,
      internalTemp: 24.5,
      ...rawPayload
    }
  };
}

/**
 * Coordinates trajectory steps for vehicle movement simulation along major highways
 */
export const HIGHWAY_WAYPOINTS: Record<string, [number, number][]> = {
  veh_01: [
    [33.5731, -7.5898],
    [33.5850, -7.5520],
    [33.6120, -7.4910],
    [33.6540, -7.4210],
    [33.6980, -7.3820],
    [33.7420, -7.2650],
    [33.8210, -7.0540],
    [33.8820, -6.9320],
    [33.9716, -6.8498]
  ],
  veh_03: [
    [33.7025, -7.3752],
    [33.6500, -7.4100],
    [33.5800, -7.5200],
    [33.4200, -7.6000],
    [33.2650, -7.5850],
    [32.8500, -7.8200],
    [32.4200, -7.9500],
    [31.6295, -7.9811]
  ],
  veh_04: [
    [35.8856, -5.5034],
    [35.8500, -5.5300],
    [35.7800, -5.6100],
    [35.7595, -5.8340],
    [35.6800, -5.8900],
    [35.5700, -5.9200]
  ],
  veh_06: [
    [33.9716, -6.8498],
    [33.9850, -6.8320],
    [34.0120, -6.8150],
    [34.0450, -6.8290],
    [34.0210, -6.8650],
    [33.9716, -6.8498]
  ],
  veh_08: [
    [31.6295, -7.9811],
    [31.5900, -8.0200],
    [31.5200, -8.0800],
    [31.4500, -8.1500],
    [31.3800, -8.2500],
    [31.2500, -8.4500]
  ]
};

export class TrackingEngine {
  private stepIndexes: Record<string, number> = {};
  private vehicles: Vehicle[] = [];
  private geofences: Geofence[] = [];
  private isSimulationActive: boolean = true;
  private timer: any = null;
  private listeners: Array<(updatedVehicles: Vehicle[], newAlert?: Alert, wsMsg?: WebSocketMessage) => void> = [];

  constructor() {
    this.startEngine();
  }

  public setVehicles(vehicles: Vehicle[]) {
    this.vehicles = vehicles;
  }

  public setGeofences(geofences: Geofence[]) {
    this.geofences = geofences;
  }

  public setSimulationActive(active: boolean) {
    this.isSimulationActive = active;
  }

  public subscribe(listener: (updatedVehicles: Vehicle[], newAlert?: Alert, wsMsg?: WebSocketMessage) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private startEngine() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (!this.isSimulationActive || this.vehicles.length === 0) return;

      let latestAlert: Alert | undefined = undefined;
      let latestWsMsg: WebSocketMessage | undefined = undefined;

      const updated = this.vehicles.map((veh) => {
        if (veh.status !== 'moving') return veh;
        const result = this.advanceVehicle(veh, this.geofences);
        if (result.newAlert) latestAlert = result.newAlert;
        if (result.wsMessage) latestWsMsg = result.wsMessage;
        return result.updatedVehicle;
      });

      this.vehicles = updated;
      this.listeners.forEach((listener) => listener(updated, latestAlert, latestWsMsg));
    }, 2000);
  }

  public advanceVehicle(
    vehicle: Vehicle,
    geofences: Geofence[],
    onNewAlert?: (alert: Alert) => void,
    onWebSocketEvent?: (msg: WebSocketMessage) => void
  ): { updatedVehicle: Vehicle; newAlert?: Alert; wsMessage: WebSocketMessage } {
    const waypoints = HIGHWAY_WAYPOINTS[vehicle.id];
    let nextLat = vehicle.latestPosition.latitude;
    let nextLng = vehicle.latestPosition.longitude;
    let nextSpeed = vehicle.latestPosition.speed;
    let nextHeading = vehicle.latestPosition.heading;
    let status = vehicle.status;

    if (waypoints && waypoints.length > 1 && vehicle.status === 'moving') {
      const currentIdx = this.stepIndexes[vehicle.id] ?? 0;
      const nextIdx = (currentIdx + 1) % waypoints.length;
      this.stepIndexes[vehicle.id] = nextIdx;

      const p1 = waypoints[currentIdx];
      const p2 = waypoints[nextIdx];

      // Slight jitter along the vector for continuous realistic movement
      nextLat = p1[0] + (p2[0] - p1[0]) * 0.4 + (Math.random() - 0.5) * 0.0004;
      nextLng = p1[1] + (p2[1] - p1[1]) * 0.4 + (Math.random() - 0.5) * 0.0004;

      // Calculate heading angle
      const dLng = nextLng - p1[1];
      const dLat = nextLat - p1[0];
      const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
      nextHeading = Math.round((angle + 360) % 360);

      // Dynamic speed fluctuations (60 - 95 km/h)
      nextSpeed = Math.round(65 + Math.random() * 28);
    } else if (vehicle.status === 'idle') {
      nextSpeed = 0;
      nextHeading = vehicle.latestPosition.heading;
    }

    const protocol = vehicle.trackerProtocol || 'teltonika';
    const newOdometer = Math.round(vehicle.odometer + (nextSpeed > 0 ? 0.05 : 0));
    const newBattery = Math.max(10, vehicle.latestPosition.battery - (Math.random() < 0.05 ? 1 : 0));

    const updatedPosition: GpsPosition = {
      ...vehicle.latestPosition,
      id: `pos_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      latitude: nextLat,
      longitude: nextLng,
      speed: nextSpeed,
      heading: nextHeading,
      motion: nextSpeed > 2,
      battery: newBattery,
      odometer: newOdometer,
      recordedAt: new Date().toISOString(),
      receivedAt: new Date().toISOString()
    };

    const updatedVehicle: Vehicle = {
      ...vehicle,
      odometer: newOdometer,
      status: status,
      dailyDistanceKm: Number((vehicle.dailyDistanceKm + (nextSpeed > 0 ? 0.05 : 0)).toFixed(1)),
      latestPosition: updatedPosition,
      updatedAt: new Date().toISOString()
    };

    // Geofence evaluations
    let triggeredAlert: Alert | undefined = undefined;
    for (const geo of geofences) {
      if (!geo.active) continue;
      const inside = isInsideGeofence(nextLat, nextLng, geo);
      if (inside && Math.random() < 0.03) {
        triggeredAlert = {
          id: `alt_${Date.now()}`,
          organizationId: vehicle.organizationId,
          vehicleId: vehicle.id,
          vehiclePlate: vehicle.licensePlate,
          vehicleName: `${vehicle.make} ${vehicle.model}`,
          trackerId: vehicle.trackerId || 'trk_gen',
          type: 'geofence_enter',
          severity: 'info',
          title: `Geofence Zone Ingress: ${geo.name}`,
          description: `Vehicle entered ${geo.name} at ${nextSpeed} km/h`,
          latitude: nextLat,
          longitude: nextLng,
          address: vehicle.latestPosition.address,
          speed: nextSpeed,
          isRead: false,
          createdAt: new Date().toISOString()
        };
      }
    }

    // Overspeed check
    if (nextSpeed > 100 && Math.random() < 0.05 && !triggeredAlert) {
      triggeredAlert = {
        id: `alt_spd_${Date.now()}`,
        organizationId: vehicle.organizationId,
        vehicleId: vehicle.id,
        vehiclePlate: vehicle.licensePlate,
        vehicleName: `${vehicle.make} ${vehicle.model}`,
        trackerId: vehicle.trackerId || 'trk_gen',
        type: 'overspeed',
        severity: 'warning',
        title: `Overspeed Threshold Exceeded (${nextSpeed} km/h)`,
        description: `Vehicle registered speed of ${nextSpeed} km/h (speed limit 90 km/h)`,
        latitude: nextLat,
        longitude: nextLng,
        address: vehicle.latestPosition.address,
        speed: nextSpeed,
        isRead: false,
        createdAt: new Date().toISOString()
      };
    }

    const wsMessage: WebSocketMessage = {
      id: `ws_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      channel: `organization.${vehicle.organizationId}`,
      event: 'vehicle.position.updated',
      source: 'traccar_adapter',
      payload: {
        vehicleId: vehicle.id,
        licensePlate: vehicle.licensePlate,
        position: {
          latitude: nextLat,
          longitude: nextLng,
          speed: nextSpeed,
          heading: nextHeading,
          ignition: updatedPosition.ignition,
          battery: newBattery,
          odometer: newOdometer,
          recordedAt: updatedPosition.recordedAt
        }
      }
    };

    if (triggeredAlert && onNewAlert) {
      onNewAlert(triggeredAlert);
    }
    if (onWebSocketEvent) {
      onWebSocketEvent(wsMessage);
    }

    return { updatedVehicle, newAlert: triggeredAlert, wsMessage };
  }
}

export const trackingEngineInstance = new TrackingEngine();
