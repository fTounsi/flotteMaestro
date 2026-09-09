import { UserRole } from './fleet';

export type PermissionKey =
  // Vehicles & Fleet Operations
  | 'vehicles:view'
  | 'vehicles:create'
  | 'vehicles:edit'
  | 'vehicles:delete'
  | 'vehicles:commands' // engine cut-off, reboot, ping
  // Trackers & Hardware
  | 'trackers:view'
  | 'trackers:manage'
  | 'trackers:apn_config'
  | 'trackers:raw_logs'
  // Trips & Geofences
  | 'trips:view'
  | 'trips:export'
  | 'geofences:view'
  | 'geofences:manage'
  // Alerts & Incidents
  | 'alerts:view'
  | 'alerts:triage'
  | 'alerts:manage'
  // Reports & Analytics
  | 'reports:view'
  | 'reports:create'
  | 'reports:export_raw'
  // Advanced Modules
  | 'modules:car_rental'
  | 'modules:fuel_intelligence'
  | 'modules:cold_chain'
  | 'modules:live_sharing'
  | 'modules:maintenance'
  | 'modules:billing'
  // Administration & Security
  | 'users:view'
  | 'users:manage'
  | 'rbac:matrix_edit'
  | 'system:settings'
  | 'audit:view';

export interface PermissionDefinition {
  key: PermissionKey;
  category: 'vehicles' | 'hardware' | 'trips_geofences' | 'alerts' | 'reports' | 'modules' | 'admin_security';
  label: string;
  description: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Vehicles
  { key: 'vehicles:view', category: 'vehicles', label: 'View Vehicles', description: 'Monitor vehicle locations, status, and telemetry gauges.' },
  { key: 'vehicles:create', category: 'vehicles', label: 'Register Vehicles', description: 'Add new vehicles and bind VIN, license plates, and specifications.' },
  { key: 'vehicles:edit', category: 'vehicles', label: 'Edit Vehicle Data', description: 'Update specifications, tank capacities, and assigned drivers.' },
  { key: 'vehicles:delete', category: 'vehicles', label: 'Decommission Vehicles', description: 'Permanently remove vehicles from active inventory.' },
  { key: 'vehicles:commands', category: 'vehicles', label: 'Downlink Commands & Relay', description: 'Execute remote engine cut-off, reboot tracker, and clear immobilizer.' },

  // Hardware
  { key: 'trackers:view', category: 'hardware', label: 'View Trackers', description: 'View GPS hardware units, IMEI inventory, and firmware versions.' },
  { key: 'trackers:manage', category: 'hardware', label: 'Provision Hardware', description: 'Add, bind, and replace GPS units on vehicles.' },
  { key: 'trackers:apn_config', category: 'hardware', label: 'APN & Server Config', description: 'Send over-the-air SMS/GPRS APN and IP parameter updates.' },
  { key: 'trackers:raw_logs', category: 'hardware', label: 'Raw Socket Logs', description: 'Access live hex telemetry packet streams and socket listeners.' },

  // Trips & Geofences
  { key: 'trips:view', category: 'trips_geofences', label: 'View Trip History', description: 'Access historical route paths, stops, and idle duration.' },
  { key: 'trips:export', category: 'trips_geofences', label: 'Export Route Files', description: 'Download trip traces in KML, GPX, or CSV formats.' },
  { key: 'geofences:view', category: 'trips_geofences', label: 'View Geofences', description: 'View perimeter boundaries, depots, and delivery zones.' },
  { key: 'geofences:manage', category: 'trips_geofences', label: 'Create & Edit Zones', description: 'Draw, edit, or delete circular and polygonal geofences.' },

  // Alerts
  { key: 'alerts:view', category: 'alerts', label: 'View Safety Alerts', description: 'Monitor real-time overspeeding, power cut, and SOS alerts.' },
  { key: 'alerts:triage', category: 'alerts', label: 'Triage & Resolve Alerts', description: 'Acknowledge alerts, assign to dispatchers, and log resolution notes.' },
  { key: 'alerts:manage', category: 'alerts', label: 'Configure Alert Rules', description: 'Define Traccar-style automated alert rules, vehicle bindings, thresholds, and notification channels.' },

  // Reports
  { key: 'reports:view', category: 'reports', label: 'View Reports', description: 'Review pre-computed mileage, fuel, and trip summary reports.' },
  { key: 'reports:create', category: 'reports', label: 'Generate Reports', description: 'Run custom date-range analytics and summary tables.' },
  { key: 'reports:export_raw', category: 'reports', label: 'Export Telemetry Data', description: 'Export raw sensor logs to XLSX or CSV for external auditing.' },

  // Modules
  { key: 'modules:car_rental', category: 'modules', label: 'Car Rental & Damage', description: 'Access rental agreements, damage checklists, and customer contracts.' },
  { key: 'modules:fuel_intelligence', category: 'modules', label: 'Fuel Intelligence', description: 'View capacitive probe fuel curves, theft alerts, and refuel events.' },
  { key: 'modules:cold_chain', category: 'modules', label: 'Cold Chain Monitoring', description: 'Monitor BLE temperature probes, door sensors, and HACCP compliance.' },
  { key: 'modules:live_sharing', category: 'modules', label: 'Temporary Live Share', description: 'Generate public expiring tracking links for shippers and customers.' },
  { key: 'modules:maintenance', category: 'modules', label: 'Preventive Maintenance', description: 'Manage odometer-based service intervals, work orders, and costs.' },
  { key: 'modules:billing', category: 'modules', label: 'Invoicing & Bills', description: 'Generate PDF invoices and manage client billing based on vehicle counts and service telemetry.' },

  // Admin & Security
  { key: 'users:view', category: 'admin_security', label: 'View Team Users', description: 'Inspect user accounts, contact info, and activity status.' },
  { key: 'users:manage', category: 'admin_security', label: 'Manage Team & Invites', description: 'Create, edit, suspend, and reset passwords for user accounts.' },
  { key: 'rbac:matrix_edit', category: 'admin_security', label: 'Configure RBAC Matrix', description: 'Customize role privileges and set per-user permission overrides.' },
  { key: 'system:settings', category: 'admin_security', label: 'Traccar System Parameters', description: 'Configure TCP listener ports, SMS/SMTP gateways, and map layers.' },
  { key: 'audit:view', category: 'admin_security', label: 'Inspect Audit Trail', description: 'View forensic audit logs of user actions, logins, and command dispatches.' },
];

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  super_admin: ALL_PERMISSIONS.map((p) => p.key),
  support_admin: [
    'vehicles:view',
    'trackers:view',
    'trackers:raw_logs',
    'trips:view',
    'geofences:view',
    'alerts:view',
    'reports:view',
    'modules:car_rental',
    'modules:fuel_intelligence',
    'modules:cold_chain',
    'modules:live_sharing',
    'modules:maintenance',
    'users:view',
    'system:settings',
    'audit:view',
  ],
  org_owner: [
    'vehicles:view',
    'vehicles:create',
    'vehicles:edit',
    'vehicles:delete',
    'vehicles:commands',
    'trackers:view',
    'trackers:manage',
    'trackers:apn_config',
    'trips:view',
    'trips:export',
    'geofences:view',
    'geofences:manage',
    'alerts:view',
    'alerts:triage',
    'alerts:manage',
    'reports:view',
    'reports:create',
    'reports:export_raw',
    'modules:car_rental',
    'modules:fuel_intelligence',
    'modules:cold_chain',
    'modules:live_sharing',
    'modules:maintenance',
    'users:view',
    'users:manage',
    'rbac:matrix_edit',
    'audit:view',
  ],
  org_admin: [
    'vehicles:view',
    'vehicles:create',
    'vehicles:edit',
    'vehicles:commands',
    'trackers:view',
    'trackers:manage',
    'trips:view',
    'trips:export',
    'geofences:view',
    'geofences:manage',
    'alerts:view',
    'alerts:triage',
    'alerts:manage',
    'reports:view',
    'reports:create',
    'modules:car_rental',
    'modules:fuel_intelligence',
    'modules:cold_chain',
    'modules:live_sharing',
    'modules:maintenance',
    'users:view',
    'users:manage',
    'audit:view',
  ],
  fleet_manager: [
    'vehicles:view',
    'vehicles:edit',
    'vehicles:commands',
    'trackers:view',
    'trips:view',
    'trips:export',
    'geofences:view',
    'geofences:manage',
    'alerts:view',
    'alerts:triage',
    'alerts:manage',
    'reports:view',
    'reports:create',
    'modules:car_rental',
    'modules:fuel_intelligence',
    'modules:cold_chain',
    'modules:live_sharing',
    'modules:maintenance',
  ],
  driver: [
    'vehicles:view',
    'trips:view',
    'alerts:view',
    'modules:maintenance',
  ],
  viewer: [
    'vehicles:view',
    'trips:view',
    'geofences:view',
    'alerts:view',
    'reports:view',
  ],
};

export interface RoleMetadata {
  role: UserRole;
  label: string;
  badgeColor: string;
  description: string;
}

export const ROLE_METADATA: Record<UserRole, RoleMetadata> = {
  super_admin: {
    role: 'super_admin',
    label: 'Super Admin',
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    description: 'Full global system administration, server parameters, hardware ports, and all organizations.',
  },
  support_admin: {
    role: 'support_admin',
    label: 'Support Admin',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    description: 'Read-only cross-tenant diagnostics, raw tracker socket inspection, and system logs.',
  },
  org_owner: {
    role: 'org_owner',
    label: 'Organization Owner',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    description: 'Full tenant-level authority, billing, user creation, custom RBAC, and fleet operations.',
  },
  org_admin: {
    role: 'org_admin',
    label: 'Organization Admin',
    badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    description: 'Day-to-day administration of vehicles, trackers, drivers, and incident dispatch.',
  },
  fleet_manager: {
    role: 'fleet_manager',
    label: 'Fleet Dispatcher',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    description: 'Operational dispatching, live tracking, trip analysis, geofences, and alert triage.',
  },
  driver: {
    role: 'driver',
    label: 'Fleet Driver',
    badgeColor: 'border-teal-500/40 text-teal-400 bg-teal-500/10',
    description: 'Assigned vehicle telemetry, personal routes, maintenance checks, and mobile portal.',
  },
  viewer: {
    role: 'viewer',
    label: 'Read-Only Viewer',
    badgeColor: 'border-zinc-500/40 text-zinc-400 bg-zinc-500/10',
    description: 'Observer access to live map, trip history, and generated reports without edit rights.',
  },
};

/**
 * Check if a user has a specific permission.
 * Evaluates custom user overrides first, then falls back to role default.
 */
export function userHasPermission(
  user: { role: UserRole; customPermissions?: PermissionKey[] } | null | undefined,
  permission: PermissionKey
): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true; // Super Admin has unrestricted access

  // Check custom user override if provided
  if (user.customPermissions && Array.isArray(user.customPermissions)) {
    return user.customPermissions.includes(permission);
  }

  // Fallback to role defaults
  const rolePerms = ROLE_DEFAULT_PERMISSIONS[user.role] || [];
  return rolePerms.includes(permission);
}
