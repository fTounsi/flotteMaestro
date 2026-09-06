import {
  INITIAL_ORGANIZATIONS,
  INITIAL_VEHICLES,
  INITIAL_TRACKERS,
  INITIAL_GEOFENCES,
  INITIAL_ALERTS,
  INITIAL_TRIPS,
  INITIAL_REPORTS
} from '../data/mockData';
import { Vehicle, Tracker, Geofence, Alert, Organization, FleetReport } from '../types/fleet';

/**
 * In-memory REST API service implementing PRD /api/v1/ endpoints
 */
export class ApiService {
  private organizations = [...INITIAL_ORGANIZATIONS];
  private vehicles = [...INITIAL_VEHICLES];
  private trackers = [...INITIAL_TRACKERS];
  private geofences = [...INITIAL_GEOFENCES];
  private alerts = [...INITIAL_ALERTS];
  private trips = [...INITIAL_TRIPS];
  private reports = [...INITIAL_REPORTS];

  public async executeRequest(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    params: Record<string, any> = {},
    body: any = {}
  ): Promise<{ status: number; data: any; headers?: Record<string, string> }> {
    // Artificial latency for realistic REST API experience (80 - 200ms)
    await new Promise((r) => setTimeout(r, 120));

    // Normalize path
    const cleanPath = path.split('?')[0];

    // Auth
    if (cleanPath === '/api/v1/auth/login' && method === 'POST') {
      return {
        status: 200,
        data: {
          accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ userId: 'usr_01', org: 'org_atlas_logistics' }))}.signature_token`,
          refreshToken: `rft_${Math.random().toString(36).substring(2, 18)}`,
          expiresIn: 3600,
          user: {
            id: 'usr_01',
            name: 'Karim Bennani',
            email: body.email || 'k.bennani@atlas-logistics.ma',
            role: 'org_owner',
            organizationId: 'org_atlas_logistics',
            permissions: ['vehicle.*', 'tracker.*', 'geofence.*', 'report.*', 'subscription.view']
          }
        }
      };
    }

    // Vehicles
    if (cleanPath === '/api/v1/vehicles' && method === 'GET') {
      let filtered = [...this.vehicles];
      if (params.status) {
        filtered = filtered.filter((v) => v.status === params.status);
      }
      if (params.fleet_id) {
        filtered = filtered.filter((v) => v.fleetId === params.fleet_id);
      }
      if (params.search) {
        const q = String(params.search).toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.licensePlate.toLowerCase().includes(q) ||
            v.make.toLowerCase().includes(q) ||
            v.model.toLowerCase().includes(q)
        );
      }
      return {
        status: 200,
        data: {
          data: filtered,
          meta: {
            page: Number(params.page || 1),
            perPage: Number(params.per_page || 25),
            total: filtered.length,
            lastPage: 1
          }
        }
      };
    }

    if (cleanPath === '/api/v1/vehicles' && method === 'POST') {
      const newVeh: Vehicle = {
        id: `veh_${Date.now().toString(36)}`,
        organizationId: 'org_atlas_logistics',
        fleetId: body.fleetId || 'flt_casa_heavy',
        fleetName: 'Casablanca Express Fleet',
        make: body.make || 'Renault',
        model: body.model || 'Master',
        modelYear: body.modelYear || 2024,
        vehicleType: body.vehicleType || 'van',
        bodyType: body.bodyType || 'Standard Van',
        fuelType: body.fuelType || 'diesel',
        engineInfo: body.engineInfo || '2.0 dCi 130HP',
        color: body.color || '#3b82f6',
        licensePlate: body.licensePlate || `${Math.floor(10000 + Math.random() * 89999)}-A-1`,
        vin: body.vin || `VF1MA0003${Math.floor(10000000 + Math.random() * 89999999)}`,
        odometer: body.odometer || 0,
        status: 'stopped',
        imageUrl: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=600&auto=format&fit=crop&q=80',
        iconType: body.vehicleType || 'van',
        dailyDistanceKm: 0,
        latestPosition: {
          id: `pos_${Date.now()}`,
          trackerId: body.trackerId || 'trk_gen',
          vehicleId: `veh_${Date.now().toString(36)}`,
          latitude: 33.5731,
          longitude: -7.5898,
          speed: 0,
          heading: 0,
          accuracy: 2.0,
          ignition: false,
          motion: false,
          battery: 100,
          externalVoltage: 12.6,
          odometer: 0,
          satellites: 16,
          protocol: 'teltonika',
          address: 'Main Terminal, Casablanca',
          recordedAt: new Date().toISOString(),
          receivedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.vehicles.unshift(newVeh);
      return { status: 201, data: { data: newVeh } };
    }

    // Vehicle latest position
    if (cleanPath.startsWith('/api/v1/vehicles/') && cleanPath.endsWith('/latest-position') && method === 'GET') {
      const parts = cleanPath.split('/');
      const vehicleId = parts[4];
      const vehicle = this.vehicles.find((v) => v.id === vehicleId) || this.vehicles[0];
      return { status: 200, data: { data: vehicle.latestPosition } };
    }

    // Trackers
    if (cleanPath === '/api/v1/trackers' && method === 'GET') {
      return {
        status: 200,
        data: {
          data: this.trackers,
          meta: { total: this.trackers.length, active: this.trackers.filter((t) => t.status === 'active').length }
        }
      };
    }

    // Geofences
    if (cleanPath === '/api/v1/geofences' && method === 'GET') {
      return { status: 200, data: { data: this.geofences } };
    }

    // Alerts
    if (cleanPath === '/api/v1/alerts' && method === 'GET') {
      return { status: 200, data: { data: this.alerts } };
    }

    // Reports POST
    if (cleanPath === '/api/v1/reports/trips' && method === 'POST') {
      const newRep: FleetReport = {
        id: `rep_${Date.now().toString(36)}`,
        organizationId: 'org_atlas_logistics',
        title: body.title || 'On-Demand Fleet Trip Report',
        type: 'trips',
        format: body.format || 'pdf',
        dateRange: {
          start: body.startDate || '2026-09-01T00:00:00Z',
          end: body.endDate || '2026-09-04T23:59:59Z'
        },
        vehicleIds: body.vehicleIds || ['veh_01', 'veh_02'],
        status: 'ready',
        fileSizeMb: 1.8,
        generatedAt: new Date().toISOString(),
        recordCount: 42,
        summary: {
          totalDistanceKm: 1840.5,
          totalDurationHours: 32.4,
          totalAlerts: 4,
          avgFuelConsumption: 26.2
        }
      };
      this.reports.unshift(newRep);
      return { status: 202, data: { data: newRep, message: 'Report generated successfully via async worker.' } };
    }

    // VIN Decoder
    if (cleanPath === '/api/v1/vehicle-catalog/vin/decode' && method === 'POST') {
      const vin = (body.vin || '').toUpperCase();
      let make = 'Volvo';
      let model = 'FH16';
      let type: any = 'truck';

      if (vin.startsWith('VF1')) {
        make = 'Renault';
        model = 'Master F3500';
        type = 'van';
      } else if (vin.startsWith('UU1')) {
        make = 'Dacia';
        model = 'Dokker Express';
        type = 'van';
      } else if (vin.startsWith('WDB')) {
        make = 'Mercedes-Benz';
        model = 'Actros 1845';
        type = 'truck';
      } else if (vin.startsWith('JTM')) {
        make = 'Toyota';
        model = 'RAV4 Hybrid';
        type = 'suv';
      }

      return {
        status: 200,
        data: {
          data: {
            vin: vin,
            make,
            model,
            modelYear: 2024,
            vehicleType: type,
            fuelType: 'diesel',
            bodyType: 'Commercial Carrier',
            engineInfo: 'Euro 6 High-Efficiency Fleet Spec',
            source: 'NHTSA_vPIC_Adapter_Cache'
          }
        }
      };
    }

    // Organizations
    if (cleanPath === '/api/v1/organizations' && method === 'GET') {
      return { status: 200, data: { data: this.organizations } };
    }

    // Default fallback
    return {
      status: 200,
      data: {
        message: 'Endpoint processed successfully',
        path: cleanPath,
        method,
        timestamp: new Date().toISOString()
      }
    };
  }
}

export const apiServiceInstance = new ApiService();
