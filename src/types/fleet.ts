export type AppMode = 'web' | 'mobile' | 'api' | 'mobile_standalone';

export type ModuleKey =
  | 'car_rental'
  | 'fuel_intelligence'
  | 'cold_chain'
  | 'live_sharing'
  | 'predictive_maintenance'
  | 'billing';

export interface EnabledModules {
  car_rental: boolean;
  fuel_intelligence: boolean;
  cold_chain: boolean;
  live_sharing: boolean;
  predictive_maintenance: boolean;
  billing?: boolean;
}

export type NavigationTab =
  | 'live_tracking'
  | 'trips'
  | 'vehicles'
  | 'trackers'
  | 'geofences'
  | 'alerts'
  | 'reports'
  | 'modules_hub'
  | 'car_rental'
  | 'fuel_intelligence'
  | 'cold_chain'
  | 'live_sharing'
  | 'predictive_maintenance'
  | 'billing'
  | 'invoicing'
  | 'organizations'
  | 'users'
  | 'settings'
  | 'documentation';

export type VehicleStatus = 'moving' | 'idle' | 'stopped' | 'offline';

export type TrackerProtocol = 'teltonika' | 'coban' | 'concox' | 'queclink' | 'ruptela' | 'suntech' | 'obd2';

export type GeofenceType = 'circle' | 'polygon';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertType =
  | 'overspeed'
  | 'geofence_enter'
  | 'geofence_exit'
  | 'ignition_on'
  | 'ignition_off'
  | 'excessive_idle'
  | 'low_battery'
  | 'low_voltage'
  | 'unauthorized_movement'
  | 'tracker_disconnected'
  | 'sos_button';

export type UserRole = 'super_admin' | 'support_admin' | 'org_owner' | 'org_admin' | 'fleet_manager' | 'driver' | 'viewer';

export type SubscriptionPlanId = 'basic' | 'professional' | 'enterprise';

export type SubscriptionStatus = 'active' | 'expiring' | 'expired' | 'suspended' | 'pending';

export interface GpsPosition {
  id: string;
  trackerId: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed: number; // km/h
  heading: number; // 0-360 degrees
  accuracy: number; // meters
  ignition: boolean;
  motion: boolean;
  battery: number; // 0-100%
  externalVoltage: number; // volts (e.g. 12.4V or 24.2V)
  odometer: number; // km
  satellites: number;
  protocol: TrackerProtocol;
  address?: string;
  recordedAt: string; // ISO UTC
  receivedAt: string; // ISO UTC
  rawAttributes?: Record<string, any>;
}

export interface Vehicle {
  id: string;
  organizationId: string;
  fleetId: string;
  fleetName: string;
  make: string;
  model: string;
  modelYear: number;
  vehicleType: 'truck' | 'van' | 'sedan' | 'suv' | 'bus' | 'motorcycle' | 'reefer';
  bodyType: string;
  fuelType: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
  engineInfo: string;
  color: string;
  licensePlate: string;
  vin: string;
  odometer: number;
  fuelLevelPercent?: number;
  assignedDriver?: {
    id: string;
    name: string;
    phone: string;
    avatarUrl?: string;
  };
  trackerId?: string;
  trackerImei?: string;
  trackerProtocol?: TrackerProtocol;
  status: VehicleStatus;
  imageUrl?: string;
  iconType?: string;
  latestPosition: GpsPosition;
  dailyDistanceKm: number;
  temperatureCelsius?: number; // for reefer trucks
  temperatureZones?: {
    zoneA: number; // e.g. Chilled
    zoneB: number; // e.g. Frozen
    humidityPercent?: number;
    doorOpen?: boolean;
  };
  relayCutoffActive?: boolean; // Remote Immoblizer engine cut-off state
  fuelTankCapacityLiters?: number;
  rentalInfo?: {
    isRented: boolean;
    rentalStatus?: RentalAvailabilityStatus;
    renterName?: string;
    renterPhone?: string;
    contractNumber?: string;
    reservationNumber?: string;
    dailyRateUsd?: number;
    dailyRateMad?: number;
    dailyMileageLimitKm?: number;
    returnDate?: string;
    category?: 'Economy Sedan' | 'Compact Hatchback' | 'SUV & Crossover' | 'Commercial Van' | 'Luxury & Executive';
    transmission?: 'Manual' | 'Automatic';
    cleaningStatus?: 'Clean' | 'Needs Cleaning';
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tracker {
  id: string;
  organizationId: string;
  vehicleId?: string;
  vehiclePlate?: string;
  protocol: TrackerProtocol;
  deviceIdentifier: string; // IMEI or ID
  imei: string;
  simPhoneNumber: string;
  model: string;
  manufacturer: string;
  firmwareVersion: string;
  status: 'active' | 'offline' | 'unassigned' | 'deactivated';
  lastSeenAt: string;
  lastPosition?: {
    latitude: number;
    longitude: number;
    speed: number;
    recordedAt: string;
  };
  battery: number;
  externalVoltage: number;
  installedAt?: string;
  notes?: string;
  configuration: {
    reportIntervalSec: number;
    overspeedThresholdKmH: number;
    idleThresholdMinutes: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Geofence {
  id: string;
  organizationId: string;
  name: string;
  type: GeofenceType;
  color: string;
  description: string;
  active: boolean;
  // For circle:
  center?: [number, number]; // [lat, lng]
  radiusMeters?: number;
  // For polygon:
  coordinates?: [number, number][]; // [[lat, lng], ...]
  speedLimitKmH?: number;
  createdAt: string;
}

export interface Alert {
  id: string;
  organizationId: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleName: string;
  trackerId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  speed?: number;
  isRead: boolean;
  triageStatus?: 'open' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  assignedTo?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  ruleId?: string;
  alertName?: string;
  triggerValue?: string | number;
  thresholdValue?: string | number;
  createdAt: string;
}

export interface AlertRule {
  id: string;
  organizationId: string;
  name: string;
  vehicleId: string; // 'all' or specific vehicleId
  vehiclePlate?: string;
  vehicleName?: string;
  type: AlertType;
  value: string | number;
  unit?: string;
  severity: AlertSeverity;
  channels: ('sound' | 'notification' | 'email' | 'relay_cut')[];
  description?: string;
  enabled: boolean;
  createdBy?: string;
  createdByRole?: string;
  createdAt: string;
  updatedAt?: string;
  lastTriggeredAt?: string;
  triggerCount?: number;
}

export interface Trip {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  distanceKm: number;
  maxSpeedKmH: number;
  avgSpeedKmH: number;
  startAddress: string;
  endAddress: string;
  startCoords: [number, number];
  endCoords: [number, number];
  waypoints: {
    lat: number;
    lng: number;
    speed: number;
    time: string;
    altitude?: number;
  }[];
  stopsCount: number;
  idleDurationMinutes: number;
  fuelConsumedLiters: number;
}

export interface FleetStop {
  id: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  latitude: number;
  longitude: number;
  address: string;
  isIdle: boolean; // engine on but stopped
}

export const DEFAULT_ORGANIZATION_TYPES = [
  'Rental agency',
  'Transport company',
  'Other'
] as const;

export type StandardOrganizationType = (typeof DEFAULT_ORGANIZATION_TYPES)[number];

export interface Organization {
  id: string;
  name: string;
  legalName: string;
  types: string[]; // One or more: 'Rental agency', 'Transport company', 'Other', or custom types
  email: string;
  phone: string;
  country: string;
  city: string;
  timezone: string;
  locale: 'en' | 'fr' | 'ar';
  logoUrl?: string;
  status: 'active' | 'suspended' | 'pending';
  planId: SubscriptionPlanId;
  subscription: {
    id: string;
    planId: SubscriptionPlanId;
    planName: string;
    status: SubscriptionStatus;
    startDate: string;
    endDate: string;
    daysRemaining: number;
    vehicleLimit: number;
    userLimit: number;
    trackerLimit: number;
    fleetLimit: number;
    historyRetentionDays: number;
  };
  stats: {
    totalVehicles: number;
    activeVehicles: number;
    totalTrackers: number;
    totalUsers: number;
    totalFleets: number;
  };
  enabledModules?: EnabledModules;
  createdAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  organizationName: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  avatarUrl?: string;
  demoPin?: string;
  department?: string;
  twoFactorEnabled?: boolean;
  assignedVehicleIds?: string[];
  customPermissions?: string[];
  lastLoginAt: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  description: string;
  pricePerMonthUsd: number;
  vehicleLimit: number;
  userLimit: number;
  trackerLimit: number;
  fleetLimit: number;
  historyRetentionDays: number;
  features: string[];
}

export interface FleetReport {
  id: string;
  organizationId: string;
  title: string;
  type: 'trips' | 'mileage' | 'alerts' | 'geofence' | 'fuel_efficiency';
  format: 'pdf' | 'xlsx' | 'csv';
  dateRange: {
    start: string;
    end: string;
  };
  vehicleIds: string[];
  status: 'ready' | 'generating' | 'failed';
  fileSizeMb?: number;
  generatedAt: string;
  recordCount: number;
  summary: {
    totalDistanceKm?: number;
    totalDurationHours?: number;
    totalAlerts?: number;
    avgFuelConsumption?: number;
  };
}

export interface WebSocketMessage {
  id: string;
  timestamp: string;
  channel: string;
  event: string;
  payload: any;
  source: 'traccar_adapter' | 'event_pipeline' | 'alert_engine' | 'system';
}

export interface ApiEndpointSpec {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  category: 'Auth' | 'Organizations' | 'Vehicles' | 'Trackers' | 'Positions' | 'Trips' | 'Geofences' | 'Alerts' | 'Reports' | 'Catalog';
  summary: string;
  description: string;
  parameters?: {
    name: string;
    in: 'query' | 'path' | 'header' | 'body';
    required: boolean;
    type: string;
    description: string;
    example?: any;
  }[];
  requestBodyExample?: any;
  responseExample: any;
}

// -------------------------------------------------------------
// MODULE 1: CAR RENTAL & IMMOBILIZER SECURITY
// -------------------------------------------------------------
export interface RentalDamageMark {
  id: string;
  xPercent: number;
  yPercent: number;
  view: 'front' | 'rear' | 'left' | 'right' | 'roof';
  type: 'scratch' | 'dent' | 'broken_glass' | 'paint_chip' | 'wheel_scuff';
  description: string;
  severity: 'minor' | 'moderate' | 'major';
  createdAt: string;
}

export interface RentalContract {
  id: string;
  organizationId: string;
  contractNumber: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  renterName: string;
  renterPhone: string;
  renterEmail: string;
  renterPassportOrCin: string;
  driverLicenseNumber: string;
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  status: 'active' | 'completed' | 'overdue' | 'reserved' | 'cancelled';
  dailyRateUsd: number;
  dailyMileageAllowanceKm: number;
  startOdometer: number;
  currentOdometer: number;
  startFuelPercent: number;
  currentFuelPercent: number;
  depositAmountUsd: number;
  depositStatus: 'held' | 'refunded' | 'partially_retained';
  excessMileageRatePerKmUsd: number;
  authorizedZones: string[];
  unauthorizedBorderWarning: boolean;
  damageMarks: RentalDamageMark[];
  digitalSignatureUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface RentalReservation {
  id: string;
  organizationId: string;
  reservationNumber: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  category: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCinOrPassport: string;
  driverLicenseNumber: string;
  pickupDate: string;
  returnDate: string;
  daysCount: number;
  dailyRateUsd: number;
  totalEstimatedUsd: number;
  depositAmountUsd: number;
  paymentStatus: 'pending' | 'deposit_paid' | 'fully_paid';
  status: 'confirmed' | 'pending' | 'converted' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export type RentalAvailabilityStatus = 'available' | 'rented' | 'reserved' | 'maintenance' | 'immobilized';

export interface RentalVehicleConfig {
  dailyRateMad: number;
  dailyRateUsd: number;
  dailyMileageLimitKm: number;
  excessKmRateUsd: number;
  requiredDepositUsd: number;
  category: 'Economy Sedan' | 'Compact Hatchback' | 'SUV & Crossover' | 'Commercial Van' | 'Luxury & Executive';
  transmission: 'Manual' | 'Automatic';
  seats: number;
  features: string[];
}

export interface RelayCommandLog {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  contractNumber?: string;
  renterName?: string;
  action: 'cut_off' | 'restore';
  status: 'executed' | 'pending_ack' | 'failed' | 'cancelled';
  speedKmhAtExecution: number;
  safetyCheckPassed: boolean;
  reason: 'theft_suspected' | 'overdue_nonpayment' | 'unauthorized_zone_exit' | 'curfew_violation' | 'customer_emergency' | 'maintenance_test' | 'manual_operator';
  protocolCommand: string;
  operatorName: string;
  operatorRole: string;
  timestamp: string;
  locationName: string;
  coordinates: [number, number];
  notes?: string;
}

export interface RentalSecurityDepositRecord {
  id: string;
  contractNumber: string;
  renterName: string;
  renterPhone: string;
  vehiclePlate: string;
  vehicleModel: string;
  depositAmountUsd: number;
  paymentMethod: 'credit_card_preauth' | 'cash' | 'check' | 'bank_transfer';
  heldAt: string;
  releasedAt?: string;
  status: 'held' | 'fully_refunded' | 'partially_deducted' | 'forfeited';
  deductions: {
    reason: string;
    amountUsd: number;
  }[];
  netRefundedUsd: number;
  reconciledBy: string;
}

export interface RentalCustomerProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  cinOrPassport: string;
  driverLicenseNumber: string;
  licenseIssueDate?: string;
  ratingScore: number;
  totalRentalsCount: number;
  totalSpentUsd: number;
  statusTag: 'vip' | 'regular' | 'warning' | 'blacklisted';
  lastRentalDate: string;
  notes: string;
  incidentHistoryCount: number;
}

export interface RentalTerritoryViolation {
  id: string;
  contractNumber: string;
  vehiclePlate: string;
  vehicleModel: string;
  renterName: string;
  renterPhone: string;
  violationType: 'border_crossing' | 'restricted_zone' | 'curfew_night_driving' | 'excessive_speed';
  timestamp: string;
  speedKmh: number;
  locationName: string;
  coordinates: [number, number];
  severity: 'critical' | 'warning';
  relayCutoffRecommended: boolean;
  status: 'active_alert' | 'contacted_renter' | 'immobilized' | 'resolved';
}


// -------------------------------------------------------------
// MODULE 2: AI FUEL INTELLIGENCE & ANTI-THEFT
// -------------------------------------------------------------
export interface FuelIncident {
  id: string;
  organizationId: string;
  vehicleId: string;
  vehiclePlate: string;
  type: 'siphon_theft' | 'abnormal_loss' | 'rapid_drain' | 'unauthorized_refuel';
  timestamp: string;
  locationName: string;
  latitude: number;
  longitude: number;
  volumeLiters: number;
  estimatedCostUsd: number;
  status: 'confirmed_theft' | 'under_investigation' | 'false_positive' | 'resolved';
  engineStatus: 'off' | 'idle' | 'on';
  initialPercent: number;
  finalPercent: number;
  notes?: string;
}

export interface RefuelRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  timestamp: string;
  locationName: string;
  litersAdded: number;
  costUsd: number;
  odometer: number;
  fuelPercentBefore: number;
  fuelPercentAfter: number;
  stationName: string;
  receiptNumber?: string;
}

export interface EcoDrivingScore {
  vehicleId: string;
  vehiclePlate: string;
  driverName: string;
  overallScore: number; // 0-100
  harshAccelerationCount: number;
  harshBrakingCount: number;
  sharpCorneringCount: number;
  speedingIncidents: number;
  idleFuelWasteLiters: number;
  avgLitersPer100Km: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
}

// -------------------------------------------------------------
// MODULE 3: COLD-CHAIN & REEFER TEMPERATURE TELEMETRY
// -------------------------------------------------------------
export interface ColdChainExcursion {
  id: string;
  organizationId: string;
  vehicleId: string;
  vehiclePlate: string;
  compartment: 'Chilled (Compartment A)' | 'Deep Freeze (Compartment B)';
  recordedTempCelsius: number;
  minAllowedCelsius: number;
  maxAllowedCelsius: number;
  durationMinutes: number;
  timestamp: string;
  latitude: number;
  longitude: number;
  locationName: string;
  cargoDescription: string;
  severity: 'warning' | 'critical';
  doorWasOpen: boolean;
  acknowledgedBy?: string;
}

export interface HaccpCertificate {
  id: string;
  tripId: string;
  vehiclePlate: string;
  clientConsignee: string;
  cargoType: string;
  minRecordedCelsius: number;
  maxRecordedCelsius: number;
  avgRecordedCelsius: number;
  complianceStatus: '100% Compliant' | 'Minor Excursion' | 'Breached';
  generatedDate: string;
  inspectorName: string;
  pdfDownloadUrl?: string;
}

// -------------------------------------------------------------
// MODULE 4: CLIENT LIVE TRACKING & E-POD
// -------------------------------------------------------------
export interface ShareableLiveLink {
  id: string;
  organizationId: string;
  vehicleId: string;
  vehiclePlate: string;
  recipientName: string;
  recipientPhone: string;
  destinationAddress: string;
  destinationCoords: [number, number];
  uniqueToken: string;
  liveUrl: string;
  pinCode?: string;
  expiresAt: string;
  status: 'active' | 'delivered' | 'expired';
  etaMinutes: number;
  remainingDistanceKm: number;
  orderReference: string;
  createdAt: string;
}

export interface DeliveryPod {
  id: string;
  orderNumber: string;
  clientName: string;
  deliveryAddress: string;
  status: 'delivered' | 'partially_delivered' | 'refused' | 'pending';
  deliveredAt?: string;
  recipientSignatureName?: string;
  signatureDataUrl?: string;
  photoProofUrl?: string;
  driverNotes?: string;
  geoVerifiedCoords?: [number, number];
}

// -------------------------------------------------------------
// MODULE 5: PREDICTIVE MAINTENANCE & OBD-II DIAGNOSTICS
// -------------------------------------------------------------
export type MaintenanceServiceType =
  | 'engine_oil'
  | 'brake_pads'
  | 'tires'
  | 'timing_belt'
  | 'air_filter'
  | 'technical_inspection'
  | 'spark_plugs'
  | 'transmission_fluid'
  | 'battery_coolant'
  | 'general_overhaul'
  | 'other';

export interface MaintenanceInterval {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel?: string;
  organizationId?: string;
  serviceType: MaintenanceServiceType;
  title: string;
  intervalKm: number;
  intervalDays: number;
  lastDoneOdometer: number;
  lastDoneDate: string;
  nextDueOdometer: number;
  nextDueDate: string;
  remainingKm: number;
  remainingDays: number;
  status: 'good' | 'due_soon' | 'overdue';
  estimatedCostUsd: number;
  preferredWorkshop?: string;
  emailAlertsEnabled?: boolean;
  alertThresholdKm?: number;
  alertThresholdDays?: number;
  lastAlertSentAt?: string;
  alertRecipientEmails?: string[];
  notes?: string;
}

export interface MaintenanceAlertLog {
  id: string;
  timestamp: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel?: string;
  serviceIntervalId: string;
  serviceTitle: string;
  serviceType: MaintenanceServiceType;
  alertType: 'warning_due_soon' | 'critical_overdue' | 'weekly_digest' | 'manual_dispatch';
  recipientEmails: string[];
  subject: string;
  currentOdometer: number;
  nextDueOdometer: number;
  remainingKm: number;
  remainingDays: number;
  estimatedCostUsd: number;
  status: 'sent' | 'delivered' | 'opened';
  organizationId: string;
  organizationName: string;
  notes?: string;
}

export interface MaintenanceEmailSettings {
  autoAlertEnabled: boolean;
  warningKmThreshold: number; // e.g. 1000 km
  warningDaysThreshold: number; // e.g. 14 days
  criticalEscalationEnabled: boolean;
  weeklyDigestEnabled: boolean;
  weeklyDigestDay: 'Monday' | 'Friday';
  defaultRecipientEmails: string[];
  includeCostEstimate: boolean;
  includeCertifiedGarages: boolean;
  smtpSenderName: string;
  smtpSenderEmail: string;
}

export interface DtcDiagnosticCode {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  code: string; // e.g. P0420
  system: 'Powertrain' | 'Braking' | 'Emission' | 'Transmission' | 'Body';
  severity: 'minor' | 'moderate' | 'critical';
  description: string;
  possibleCauses: string[];
  recommendedAction: string;
  detectedAt: string;
  status: 'active' | 'cleared';
}

export interface WorkOrderRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  serviceCenter: string;
  technicianName: string;
  description: string;
  costPartsUsd: number;
  costLaborUsd: number;
  totalCostUsd: number;
  invoiceNumber: string;
  completedAt: string;
  replacedParts: string[];
}

export interface ModuleMetadata {
  id: ModuleKey;
  name: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  badge: string;
  recommendedFor: string;
  pricePerVehicleMonthUsd: number;
  keyFeatures: string[];
}

// -------------------------------------------------------------
// MODULE 6: FLEET INVOICING & SERVICE BILLING
// -------------------------------------------------------------
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export type InvoiceLineItemType =
  | 'vehicle_base'
  | 'sim_cellular_data'
  | 'high_freq_telemetry'
  | 'relay_immobilizer'
  | 'fuel_intelligence'
  | 'cold_chain'
  | 'live_sharing'
  | 'predictive_maintenance'
  | 'api_gateway'
  | 'hardware_installation'
  | 'custom';

export interface InvoiceLineItem {
  id: string;
  type: InvoiceLineItemType;
  description: string;
  vehicleCount?: number;
  usageMetric?: string; // e.g. "12 vehicles x 30 days", "18.4 GB cellular payload", "24,000 API requests"
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-0089"
  organizationId: string;
  organizationName: string;
  clientId: string;
  clientName: string;
  clientLegalName: string;
  clientAddress: string;
  clientCity: string;
  clientCountry: string;
  clientIceOrTaxId: string; // ICE / Tax ID / VAT
  clientEmail: string;
  clientPhone: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: InvoiceStatus;
  currency: 'USD' | 'MAD' | 'EUR';
  vehicleCount: number;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRatePercent: number; // e.g. 20% standard VAT
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod?: string;
  bankDetails?: {
    bankName: string;
    ribOrIban: string;
    swiftBic: string;
  };
  notes?: string;
  termsAndConditions?: string;
  createdAt: string;
}

export interface BillingClientProfile {
  id: string;
  organizationId: string;
  name: string;
  legalName: string;
  iceOrTaxId: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  contractedVehicles: number;
  activeVehicles: number;
  billingPlan: string;
  defaultCurrency: 'USD' | 'MAD' | 'EUR';
  baseRatePerVehicle: number;
  activeAddonIds: string[];
  lastInvoicedDate?: string;
  totalInvoicedToDate: number;
}


