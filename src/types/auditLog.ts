export type AuditCategory = 'rbac' | 'commands' | 'security' | 'geofences' | 'system' | 'modules';

export type AuditSeverity = 'info' | 'warning' | 'danger';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  category: AuditCategory;
  severity: AuditSeverity;
  description: string;
  ipAddress: string;
  targetEntity?: string;
  metadata?: Record<string, any>;
}

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_01',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    userId: 'usr_admin',
    userName: 'Fouad Tounsi',
    userRole: 'super_admin',
    action: 'COMMAND_DISPATCHED',
    category: 'commands',
    severity: 'danger',
    description: 'Executed remote engine cut-off (setdigout 1,0) on Renault Master 33445-A-1.',
    ipAddress: '196.12.44.89',
    targetEntity: 'veh_01',
    metadata: { protocol: 'teltonika', command: 'engine_stop' }
  },
  {
    id: 'aud_02',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    userId: 'usr_01',
    userName: 'Karim Bennani',
    userRole: 'org_owner',
    action: 'RBAC_PERMISSION_OVERRIDE',
    category: 'rbac',
    severity: 'warning',
    description: 'Granted temporary "vehicles:commands" override to Mehdi Chraibi (Fleet Dispatcher).',
    ipAddress: '105.154.21.10',
    targetEntity: 'usr_03',
    metadata: { targetUser: 'Mehdi Chraibi', permission: 'vehicles:commands' }
  },
  {
    id: 'aud_03',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    userId: 'usr_admin',
    userName: 'Fouad Tounsi',
    userRole: 'super_admin',
    action: 'SYSTEM_SETTINGS_UPDATED',
    category: 'system',
    severity: 'info',
    description: 'Reconfigured Teltonika listener TCP port to 5027 and enabled reverse geocoding cache.',
    ipAddress: '196.12.44.89',
    targetEntity: 'traccar_config'
  },
  {
    id: 'aud_04',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    userId: 'usr_02',
    userName: 'Samira Idrissi',
    userRole: 'org_admin',
    action: 'USER_CREATED',
    category: 'rbac',
    severity: 'info',
    description: 'Created new user account for Hicham Tazi (Fleet Driver) with PIN 7890.',
    ipAddress: '197.230.12.4',
    targetEntity: 'usr_driver_02'
  },
  {
    id: 'aud_05',
    timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    userId: 'usr_03',
    userName: 'Mehdi Chraibi',
    userRole: 'fleet_manager',
    action: 'GEOFENCE_CREATED',
    category: 'geofences',
    severity: 'info',
    description: 'Defined circular geofence "Casablanca Ain Sebaa Logistic Hub" (radius 850m).',
    ipAddress: '105.158.90.112',
    targetEntity: 'geo_ain_sebaa'
  },
  {
    id: 'aud_06',
    timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    userId: 'usr_admin',
    userName: 'Fouad Tounsi',
    userRole: 'super_admin',
    action: 'LOGIN_2FA_SUCCESS',
    category: 'security',
    severity: 'info',
    description: 'Authenticated via TOTP Multi-Factor Authentication session token.',
    ipAddress: '196.12.44.89'
  }
];
