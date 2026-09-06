export type SpeedUnit = 'kmh' | 'mph' | 'knots';
export type DistanceUnit = 'km' | 'mi' | 'nm';
export type VolumeUnit = 'liters' | 'gallons_us' | 'gallons_uk';
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type PressureUnit = 'bar' | 'psi' | 'kpa';
export type CoordinateFormat = 'decimal' | 'dms' | 'ddm';

export type MapProviderType = 'osm' | 'google' | 'mapbox' | 'carto' | 'custom';
export type GeocodingProviderType = 'nominatim' | 'google' | 'locationiq' | 'gisgraphy' | 'none';
export type SmsProviderType = 'http' | 'twilio' | 'infobip' | 'traccar_gateway';
export type TripStrategy = 'ignition' | 'speed' | 'hybrid';
export type OdometerMode = 'gps' | 'canbus' | 'virtual';

export interface ProtocolPortConfig {
  id: string;
  name: string;
  defaultPort: number;
  currentPort: number;
  enabled: boolean;
  transport: 'tcp' | 'udp' | 'both';
  activeConnections: number;
  totalPacketsReceived: number;
  lastPacketAt: string;
  description: string;
}

export interface ComputedAttributeConfig {
  id: string;
  name: string;
  description: string;
  attribute: string;
  expression: string;
  type: 'boolean' | 'number' | 'string';
  enabled: boolean;
  lastTestedValue?: string;
}

export interface SensorCalibrationProfile {
  id: string;
  name: string;
  sensorType: 'fuel_analog_voltage' | 'fuel_frequency_hz' | 'fuel_ultrasonic_mm' | 'temperature_pt100';
  formulaType: 'linear' | 'polynomial' | 'piecewise';
  multiplierA: number;
  multiplierB: number;
  constantC: number;
  unit: string;
  notes: string;
}

export interface SystemParametersConfig {
  server: {
    systemName: string;
    applicationTitle: string;
    baseUrl: string;
    logoUrl?: string;
    landingTab: string;
    allowRegistration: boolean;
    readOnly: boolean;
    deviceLimitPerOrg: number;
    heartbeatIntervalSec: number;
    deviceOfflineTimeoutSec: number;
  };
  units: {
    speedUnit: SpeedUnit;
    distanceUnit: DistanceUnit;
    volumeUnit: VolumeUnit;
    temperatureUnit: TemperatureUnit;
    pressureUnit: PressureUnit;
    coordinateFormat: CoordinateFormat;
    timezone: string;
    timeFormat24h: boolean;
    firstDayOfWeek: 'monday' | 'sunday';
  };
  protocols: ProtocolPortConfig[];
  filters: {
    filterInvalid: boolean;
    filterZeroCoordinates: boolean;
    filterDuplicate: boolean;
    filterFutureCoordinates: boolean;
    filterMaxSpeed: boolean;
    maxSpeedLimitKmh: number;
    minSatellites: number;
    maxAccuracyMeters: number;
    stationarySpeedThresholdKmh: number;
    distanceFilterMeters: number;
  };
  tripDetector: {
    strategy: TripStrategy;
    minTripDurationSec: number;
    minTripDistanceMeters: number;
    minSpeedKmh: number;
    minParkDurationSec: number;
    maxIdleMinutes: number;
    odometerMode: OdometerMode;
    speedFilterToleranceKmh: number;
  };
  maps: {
    activeProvider: MapProviderType;
    googleMapsApiKey?: string;
    mapboxAccessToken?: string;
    customTileUrl?: string;
    customSubdomains?: string;
    defaultLat: number;
    defaultLng: number;
    defaultZoom: number;
    maxZoom: number;
    minZoom: number;
    geocodingProvider: GeocodingProviderType;
    geocodingApiKey?: string;
    geocodingLanguage?: string;
    enableGeocodeCache: boolean;
    cacheTtlHours: number;
  };
  notificators: {
    smtp: {
      enabled: boolean;
      host: string;
      port: number;
      security: 'tls' | 'ssl' | 'none';
      username: string;
      password?: string;
      fromAddress: string;
      fromName: string;
    };
    sms: {
      enabled: boolean;
      provider: SmsProviderType;
      urlTemplate?: string;
      accountSid?: string;
      authToken?: string;
      senderId?: string;
    };
    telegram: {
      enabled: boolean;
      botToken?: string;
      defaultChatId?: string;
    };
    webhook: {
      enabled: boolean;
      endpointUrl?: string;
      secretKey?: string;
    };
    firebaseFcm: {
      enabled: boolean;
      serverKey?: string;
      projectId?: string;
    };
  };
  computedAttributes: ComputedAttributeConfig[];
  calibrationProfiles: SensorCalibrationProfile[];
  security: {
    minPasswordLength: number;
    requireComplexity: boolean;
    sessionTimeoutMinutes: number;
    enforce2faAdmins: boolean;
    maxLoginAttempts: number;
    historyRetentionDays: number;
    tripsRetentionDays: number;
    auditLogsRetentionDays: number;
    autoPurgeCronEnabled: boolean;
  };
}

export type SettingsPillarTab =
  | 'general_units'
  | 'protocols_ports'
  | 'filters_gps'
  | 'trip_detector'
  | 'maps_geocoding'
  | 'notification_gateways'
  | 'computed_attributes'
  | 'security_maintenance';
