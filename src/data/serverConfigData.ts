import { SystemParametersConfig } from '../types/serverConfig';

export const INITIAL_SYSTEM_CONFIG: SystemParametersConfig = {
  server: {
    systemName: 'FlotteMaestro Core Server',
    applicationTitle: 'FlotteMaestro Telematics OS',
    baseUrl: 'https://telematics.flottemaestro.cloud',
    logoUrl: '',
    landingTab: 'live_tracking',
    allowRegistration: false,
    readOnly: false,
    deviceLimitPerOrg: 250,
    heartbeatIntervalSec: 60,
    deviceOfflineTimeoutSec: 300
  },
  units: {
    speedUnit: 'kmh',
    distanceUnit: 'km',
    volumeUnit: 'liters',
    temperatureUnit: 'celsius',
    pressureUnit: 'bar',
    coordinateFormat: 'decimal',
    timezone: 'Europe/Paris',
    timeFormat24h: true,
    firstDayOfWeek: 'monday'
  },
  protocols: [
    {
      id: 'teltonika',
      name: 'Teltonika (FM, FMB, FMC, FMM)',
      defaultPort: 5027,
      currentPort: 5027,
      enabled: true,
      transport: 'both',
      activeConnections: 14,
      totalPacketsReceived: 428910,
      lastPacketAt: 'Just now (0.4s ago)',
      description: 'Supports Teltonika Codec 8, Codec 8 Extended, Codec 16, and CAN-bus FMS adapters.'
    },
    {
      id: 'coban',
      name: 'Coban / GPS103 / TK103 / TK102',
      defaultPort: 5001,
      currentPort: 5001,
      enabled: true,
      transport: 'tcp',
      activeConnections: 5,
      totalPacketsReceived: 182405,
      lastPacketAt: '1.2s ago',
      description: 'Supports standard GPRS ASCII text strings, ACC ignition trigger, and cut-off relays.'
    },
    {
      id: 'concox',
      name: 'Concox / Jimi IoT / GT06 / WeTrack',
      defaultPort: 5023,
      currentPort: 5023,
      enabled: true,
      transport: 'both',
      activeConnections: 8,
      totalPacketsReceived: 295130,
      lastPacketAt: '0.8s ago',
      description: 'Binary protocol with CRC-16, LBS multi-cell fallback, and digital input telemetry.'
    },
    {
      id: 'queclink',
      name: 'Queclink (GL200, GL300, GV55, GV300)',
      defaultPort: 5004,
      currentPort: 5004,
      enabled: true,
      transport: 'both',
      activeConnections: 4,
      totalPacketsReceived: 98410,
      lastPacketAt: '2.5s ago',
      description: 'ASCII text @RESP reports with harsh braking, crash detection, and backup battery state.'
    },
    {
      id: 'ruptela',
      name: 'Ruptela (HCV, LCV, Pro4, Eco4)',
      defaultPort: 5008,
      currentPort: 5008,
      enabled: true,
      transport: 'tcp',
      activeConnections: 3,
      totalPacketsReceived: 76520,
      lastPacketAt: '4.1s ago',
      description: 'Supports advanced eco-driving accelerometer, digital tachograph DDD download, and 1-Wire.'
    },
    {
      id: 'suntech',
      name: 'Suntech (ST300, ST310, ST340)',
      defaultPort: 5011,
      currentPort: 5011,
      enabled: false,
      transport: 'tcp',
      activeConnections: 0,
      totalPacketsReceived: 12400,
      lastPacketAt: '2 hours ago',
      description: 'Universal telemetry parser with analog voltage sensing and immobilizer command ack.'
    },
    {
      id: 'meitrack',
      name: 'Meitrack (MVT, T333, T366, MD511)',
      defaultPort: 5020,
      currentPort: 5020,
      enabled: true,
      transport: 'both',
      activeConnections: 2,
      totalPacketsReceived: 43100,
      lastPacketAt: '5.6s ago',
      description: 'Supports RFID driver key cards, dual fuel probes, and remote digital output triggers.'
    },
    {
      id: 'osmand',
      name: 'Traccar Client / OsmAnd Protocol',
      defaultPort: 5055,
      currentPort: 5055,
      enabled: true,
      transport: 'tcp',
      activeConnections: 11,
      totalPacketsReceived: 310890,
      lastPacketAt: 'Just now (0.2s ago)',
      description: 'HTTP REST endpoint receiving standard smartphone GPS tracker applications.'
    }
  ],
  filters: {
    filterInvalid: true,
    filterZeroCoordinates: true,
    filterDuplicate: true,
    filterFutureCoordinates: true,
    filterMaxSpeed: true,
    maxSpeedLimitKmh: 180,
    minSatellites: 4,
    maxAccuracyMeters: 45,
    stationarySpeedThresholdKmh: 2.5,
    distanceFilterMeters: 15
  },
  tripDetector: {
    strategy: 'hybrid',
    minTripDurationSec: 60,
    minTripDistanceMeters: 150,
    minSpeedKmh: 5.0,
    minParkDurationSec: 180,
    maxIdleMinutes: 15,
    odometerMode: 'canbus',
    speedFilterToleranceKmh: 3.0
  },
  maps: {
    activeProvider: 'osm',
    googleMapsApiKey: '',
    mapboxAccessToken: '',
    customTileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    customSubdomains: 'abc',
    defaultLat: 48.8566,
    defaultLng: 2.3522,
    defaultZoom: 12,
    maxZoom: 19,
    minZoom: 3,
    geocodingProvider: 'nominatim',
    geocodingApiKey: '',
    geocodingLanguage: 'en',
    enableGeocodeCache: true,
    cacheTtlHours: 72
  },
  notificators: {
    smtp: {
      enabled: true,
      host: 'smtp.sendgrid.net',
      port: 587,
      security: 'tls',
      username: 'apikey',
      password: 'SG.demo_secret_telematics_token_xyz99823',
      fromAddress: 'dispatch-alerts@flottemaestro.cloud',
      fromName: 'FlotteMaestro Telematics Dispatcher'
    },
    sms: {
      enabled: true,
      provider: 'twilio',
      urlTemplate: 'https://api.twilio.com/2010-04-01/Accounts/{accountSid}/Messages.json',
      accountSid: 'AC98f481a8b928374d789012a3456789b',
      authToken: '••••••••••••••••••••••••••••••••',
      senderId: 'FLOTTE_SMS'
    },
    telegram: {
      enabled: true,
      botToken: 'bot6192837419:AAH9fklm948234-DEMO_TOKEN_XYZ',
      defaultChatId: '-100847291039'
    },
    webhook: {
      enabled: true,
      endpointUrl: 'https://webhook.site/flottemaestro-fleet-dispatch-events',
      secretKey: 'whsec_99348102394819203948192039481920'
    },
    firebaseFcm: {
      enabled: true,
      serverKey: 'AAAA91823948:APA91bF...demo_fcm_key',
      projectId: 'flottemaestro-prod-mobile'
    }
  },
  computedAttributes: [
    {
      id: 'comp_ign',
      name: 'Ignition Status Evaluator',
      description: 'Infers engine state from CAN-bus ignition or backup alternator voltage above 13.2V.',
      attribute: 'ignition',
      expression: 'ignition || (power > 13.2 ? true : false)',
      type: 'boolean',
      enabled: true,
      lastTestedValue: 'true'
    },
    {
      id: 'comp_fuel_level',
      name: 'Fuel Volume Calibration',
      description: 'Converts raw analog input 1 (0-5V sensor) into percentage volume.',
      attribute: 'fuel_liters',
      expression: 'adc1 ? Math.round((adc1 / 5.0) * 80.0) : null',
      type: 'number',
      enabled: true,
      lastTestedValue: '58.4 L'
    },
    {
      id: 'comp_sos',
      name: 'Hardware Panic Button (Bitwise SOS)',
      description: 'Detects digital input 1 panic latch and triggers critical alarm.',
      attribute: 'alarm',
      expression: 'di1 == 1 ? "sos" : null',
      type: 'string',
      enabled: true,
      lastTestedValue: 'null'
    },
    {
      id: 'comp_cold_zone',
      name: 'Reefer Cargo Compartment Excursion Alert',
      description: 'Flags temperature warning if thermal probe 1 exceeds 8.0 degrees C.',
      attribute: 'temp_alarm',
      expression: 'temp1 != null && temp1 > 8.0 ? "cold_chain_warning" : null',
      type: 'string',
      enabled: true,
      lastTestedValue: 'null'
    }
  ],
  calibrationProfiles: [
    {
      id: 'calib_fuel_dut_e',
      name: 'DUT-E Analog Fuel Sensor (450L Tank)',
      sensorType: 'fuel_analog_voltage',
      formulaType: 'linear',
      multiplierA: 90.0,
      multiplierB: 0.0,
      constantC: 0.0,
      unit: 'Liters',
      notes: 'Calibration for Mercedes Actros 450L right-side diesel fuel tank.'
    },
    {
      id: 'calib_omnicomm_lls',
      name: 'Omnicomm LLS Digital Frequency Sensor',
      sensorType: 'fuel_frequency_hz',
      formulaType: 'linear',
      multiplierA: 0.35,
      multiplierB: 0.0,
      constantC: -105.0,
      unit: 'Liters',
      notes: 'Frequency range: 300Hz (Empty) to 1300Hz (Full).'
    },
    {
      id: 'calib_dallas_temp',
      name: 'Dallas DS18B20 1-Wire Reefer Offset',
      sensorType: 'temperature_pt100',
      formulaType: 'linear',
      multiplierA: 1.0,
      multiplierB: 0.0,
      constantC: -0.3,
      unit: '°C',
      notes: 'High-precision calibration offset against laboratory thermal reference probe.'
    }
  ],
  security: {
    minPasswordLength: 10,
    requireComplexity: true,
    sessionTimeoutMinutes: 60,
    enforce2faAdmins: true,
    maxLoginAttempts: 5,
    historyRetentionDays: 180,
    tripsRetentionDays: 365,
    auditLogsRetentionDays: 730,
    autoPurgeCronEnabled: true
  }
};
