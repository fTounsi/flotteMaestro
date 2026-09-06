import {
  ModuleMetadata,
  RentalContract,
  FuelIncident,
  RefuelRecord,
  EcoDrivingScore,
  ColdChainExcursion,
  HaccpCertificate,
  ShareableLiveLink,
  DeliveryPod,
  MaintenanceInterval,
  DtcDiagnosticCode,
  WorkOrderRecord
} from '../types/fleet';

export const MODULE_METADATA_LIST: ModuleMetadata[] = [
  {
    id: 'car_rental',
    name: 'Car Rental & Anti-Theft Relay',
    shortDesc: 'Remote engine immobilizer, renter check-in/out studio, over-mileage calculator & 360° damage inspection.',
    fullDesc: 'Custom-built for car rental agencies (Location de Voitures) to secure assets, prevent theft, enforce daily mileage allowances, and digitize vehicle handovers.',
    iconName: 'KeyRound',
    badge: 'Rental Agency Focus',
    recommendedFor: 'Car rental companies, luxury car hires, peer-to-peer fleets',
    pricePerVehicleMonthUsd: 8,
    keyFeatures: [
      'Remote Immoblizer / Engine Kill Switch (Relay GPRS command under 20 km/h)',
      'Digital Check-In & Check-Out Inspection with 360° car body damage pinpointing',
      'Daily mileage limit tracker with automatic excess km surcharge calculator',
      'Unauthorized border & geofence curfew warning (Morocco perimeter alerts)',
      'Renter contract archive with deposit status & driver license verification'
    ]
  },
  {
    id: 'fuel_intelligence',
    name: 'AI Fuel Intelligence & Anti-Theft',
    shortDesc: 'Instant siphoning radar, CAN-bus consumption reconciliation, and driver eco-scorecards.',
    fullDesc: 'Solves the #1 operational cost for transport fleets by detecting sudden fuel tank drops within seconds, stopping fuel theft, and ranking driver fuel efficiency.',
    iconName: 'Fuel',
    badge: 'Highest Fleet ROI',
    recommendedFor: 'Long-haul freight, distribution trucks, construction machinery',
    pricePerVehicleMonthUsd: 12,
    keyFeatures: [
      'Real-time siphon & drain alarm when engine is OFF or idling',
      'Ultrasonic & CAN-bus float sensor reconciliation against GPS mileage',
      'Fuel fill-up audit logging with station receipt verification',
      'Eco-driving scorecards (Harsh acceleration, idling waste, braking penalties)',
      'CO2 emission tracking & fleet fuel consumption benchmarking'
    ]
  },
  {
    id: 'cold_chain',
    name: 'Cold-Chain & Reefer Telemetry',
    shortDesc: 'BLE multi-zone temperature probes, door sensor correlation, and HACCP compliance certificates.',
    fullDesc: 'Engineered for refrigerated transport, food logistics, and pharmaceutical distributors who must guarantee unbroken cold chain standards.',
    iconName: 'Snowflake',
    badge: 'Pharma & Food GDP',
    recommendedFor: 'Reefer fleets, pharmaceutical couriers, frozen food distributors',
    pricePerVehicleMonthUsd: 15,
    keyFeatures: [
      'Dual-zone live temperature monitoring (Compartment A: Chilled / Compartment B: Frozen)',
      'Instant temperature breach alarms with duration & severity tracking',
      'Cargo door opening sensor correlation with thermal loss triggers',
      '1-Click HACCP / GDP certified transit audit reports for health inspectors',
      'BLE wireless sensor telemetry with battery health tracking'
    ]
  },
  {
    id: 'live_sharing',
    name: 'Customer Live ETA & e-POD',
    shortDesc: 'Shareable Uber-style tracking links with PIN security and electronic Proof of Delivery.',
    fullDesc: 'Eliminates "Where is my delivery?" phone calls by providing end customers with a live tracking map and capturing digital delivery signatures.',
    iconName: 'Share2',
    badge: 'Customer Delight',
    recommendedFor: 'E-commerce logistics, express couriers, B2B wholesale deliveries',
    pricePerVehicleMonthUsd: 6,
    keyFeatures: [
      'Time-limited live tracking URLs with customizable expiration and PIN code',
      'Customer live map view with real-time ETA countdown & driver contact',
      'Electronic Proof of Delivery (e-POD) with touchscreen signature capture',
      'Photo proof of delivery for parcels, pallets, or consignments',
      'Automated arrival SMS/WhatsApp dispatch triggers'
    ]
  },
  {
    id: 'predictive_maintenance',
    name: 'Predictive Maintenance & OBD-II',
    shortDesc: 'Engine DTC diagnostic code reader, automated service interval counters, and work order ledger.',
    fullDesc: 'Prevents costly breakdowns by reading vehicle engine computers remotely, tracking component lifespans, and scheduling preventative maintenance.',
    iconName: 'Wrench',
    badge: 'Uptime Maximizer',
    recommendedFor: 'All vehicle types, fleet service centers, heavy duty trucks',
    pricePerVehicleMonthUsd: 9,
    keyFeatures: [
      'Remote OBD-II Check Engine DTC fault code reader with plain-text diagnosis',
      '1-Click DTC clearing and diagnostic log export for service mechanics',
      'Mileage & time-based service triggers (Oil, brake pads, tires, timing belt)',
      'Technical inspection (Contrôle Technique) and insurance expiry reminders',
      'Digital work orders, parts expense ledger & mechanic invoice management'
    ]
  }
];

export const INITIAL_CAR_RENTAL_CONTRACTS: RentalContract[] = [
  {
    id: 'cnt_001',
    organizationId: 'org_oasis_car_rental',
    contractNumber: 'CTR-2026-0891',
    vehicleId: 'veh_clio_01',
    vehiclePlate: '45892-A-6',
    vehicleModel: 'Renault Clio 5 (2024)',
    renterName: 'Yassine El Fassi',
    renterPhone: '+212 661 23 45 67',
    renterEmail: 'yassine.elfassi@gmail.com',
    renterPassportOrCin: 'BK459021',
    driverLicenseNumber: '08/99412',
    startDate: '2026-09-02T10:00:00Z',
    endDate: '2026-09-07T18:00:00Z',
    createdAt: '2026-09-02T09:30:00Z',
    status: 'active',
    dailyRateUsd: 35,
    dailyMileageAllowanceKm: 200,
    startOdometer: 24150,
    currentOdometer: 24780,
    startFuelPercent: 100,
    currentFuelPercent: 68,
    depositAmountUsd: 500,
    depositStatus: 'held',
    excessMileageRatePerKmUsd: 0.15,
    authorizedZones: ['Casablanca Region', 'Rabat-Salé', 'Marrakech Expressway'],
    unauthorizedBorderWarning: false,
    damageMarks: [
      {
        id: 'dmg_01',
        xPercent: 22,
        yPercent: 48,
        view: 'front',
        type: 'scratch',
        description: 'Small 3cm scratch on front right bumper',
        severity: 'minor',
        createdAt: '2026-09-02T09:45:00Z'
      }
    ],
    notes: 'Renter requested child seat. Client informed about 200 km/day policy.'
  },
  {
    id: 'cnt_002',
    organizationId: 'org_oasis_car_rental',
    contractNumber: 'CTR-2026-0892',
    vehicleId: 'veh_duster_02',
    vehiclePlate: '12845-B-1',
    vehicleModel: 'Dacia Duster 4x4 (2023)',
    renterName: 'Thomas Laurent',
    renterPhone: '+33 6 12 34 56 78',
    renterEmail: 't.laurent@outlook.fr',
    renterPassportOrCin: '21FR98412',
    driverLicenseNumber: 'FR-94810239',
    startDate: '2026-09-01T08:00:00Z',
    endDate: '2026-09-05T20:00:00Z',
    createdAt: '2026-09-01T07:30:00Z',
    status: 'overdue',
    dailyRateUsd: 50,
    dailyMileageAllowanceKm: 250,
    startOdometer: 48200,
    currentOdometer: 49620,
    startFuelPercent: 100,
    currentFuelPercent: 24,
    depositAmountUsd: 800,
    depositStatus: 'held',
    excessMileageRatePerKmUsd: 0.20,
    authorizedZones: ['Morocco Nationwide (Paved Roads)'],
    unauthorizedBorderWarning: false,
    damageMarks: [
      {
        id: 'dmg_02',
        xPercent: 78,
        yPercent: 65,
        view: 'rear',
        type: 'dent',
        description: 'Minor dent on lower tailgate from luggage',
        severity: 'minor',
        createdAt: '2026-09-01T07:50:00Z'
      }
    ],
    notes: 'Tourist rental. Vehicle is currently 14 hours past scheduled return time in Marrakech.'
  },
  {
    id: 'cnt_003',
    organizationId: 'org_oasis_car_rental',
    contractNumber: 'CTR-2026-0893',
    vehicleId: 'veh_tucson_03',
    vehiclePlate: '90123-D-8',
    vehicleModel: 'Hyundai Tucson 1.6 CRDi (2024)',
    renterName: 'Nadia Bensouda',
    renterPhone: '+212 662 98 76 54',
    renterEmail: 'n.bensouda@finance.ma',
    renterPassportOrCin: 'C891234',
    driverLicenseNumber: '01/45892',
    startDate: '2026-09-03T14:00:00Z',
    endDate: '2026-09-10T14:00:00Z',
    createdAt: '2026-09-03T13:30:00Z',
    status: 'active',
    dailyRateUsd: 75,
    dailyMileageAllowanceKm: 300,
    startOdometer: 18400,
    currentOdometer: 18690,
    startFuelPercent: 100,
    currentFuelPercent: 82,
    depositAmountUsd: 1000,
    depositStatus: 'held',
    excessMileageRatePerKmUsd: 0.25,
    authorizedZones: ['Casablanca', 'Tangier Med', 'Rabat'],
    unauthorizedBorderWarning: false,
    damageMarks: [],
    notes: 'Corporate client on weekly business assignment.'
  },
  {
    id: 'cnt_004',
    organizationId: 'org_oasis_car_rental',
    contractNumber: 'CTR-2026-0888',
    vehicleId: 'veh_cclass_04',
    vehiclePlate: '77219-A-1',
    vehicleModel: 'Mercedes-Benz C220d AMG (2024)',
    renterName: 'Karim Al-Mansouri',
    renterPhone: '+971 50 123 4567',
    renterEmail: 'k.almansouri@dubai-invest.ae',
    renterPassportOrCin: 'UAE9823412',
    driverLicenseNumber: 'DXB-889120',
    startDate: '2026-08-25T11:00:00Z',
    endDate: '2026-08-31T11:00:00Z',
    actualReturnDate: '2026-08-31T10:45:00Z',
    createdAt: '2026-08-25T10:00:00Z',
    status: 'completed',
    dailyRateUsd: 140,
    dailyMileageAllowanceKm: 200,
    startOdometer: 12050,
    currentOdometer: 13150,
    startFuelPercent: 100,
    currentFuelPercent: 100,
    depositAmountUsd: 2000,
    depositStatus: 'refunded',
    excessMileageRatePerKmUsd: 0.40,
    authorizedZones: ['Morocco Premium Highways'],
    unauthorizedBorderWarning: false,
    damageMarks: [],
    notes: 'Returned in pristine condition. Full deposit refunded.'
  }
];

export const INITIAL_FUEL_INCIDENTS: FuelIncident[] = [
  {
    id: 'fl_01',
    organizationId: 'org_atlas_logistics',
    vehicleId: 'veh_atlas_01',
    vehiclePlate: '67891-A-1',
    type: 'siphon_theft',
    timestamp: '2026-09-04T03:18:22Z',
    locationName: 'Berrechid Highway Rest Area (PK 34)',
    latitude: 33.2654,
    longitude: -7.5841,
    volumeLiters: 42.5,
    estimatedCostUsd: 68.0,
    status: 'confirmed_theft',
    engineStatus: 'off',
    initialPercent: 78,
    finalPercent: 44,
    notes: 'Sudden 42.5L drop detected in 4 minutes with engine ignition OFF. Siphon siren triggered.'
  },
  {
    id: 'fl_02',
    organizationId: 'org_atlas_logistics',
    vehicleId: 'veh_atlas_04',
    vehiclePlate: '34567-B-26',
    type: 'rapid_drain',
    timestamp: '2026-09-03T22:45:10Z',
    locationName: 'Sidi Maârouf Industrial Zone Parking',
    latitude: 33.5284,
    longitude: -7.6482,
    volumeLiters: 28.0,
    estimatedCostUsd: 44.8,
    status: 'under_investigation',
    engineStatus: 'off',
    initialPercent: 62,
    finalPercent: 40,
    notes: 'Fuel float sensor recorded 28L decrease overnight. Reviewing CCTV footage.'
  },
  {
    id: 'fl_03',
    organizationId: 'org_sahara_distribution',
    vehicleId: 'veh_sahara_02',
    vehiclePlate: '89012-A-8',
    type: 'abnormal_loss',
    timestamp: '2026-09-02T14:10:00Z',
    locationName: 'Route Nationale 1, Tiznit South',
    latitude: 29.6974,
    longitude: -9.7316,
    volumeLiters: 19.2,
    estimatedCostUsd: 30.7,
    status: 'resolved',
    engineStatus: 'on',
    initialPercent: 85,
    finalPercent: 68,
    notes: 'Mechanical issue: Fuel line leak resolved by mechanic at Tiznit station.'
  }
];

export const INITIAL_REFUEL_RECORDS: RefuelRecord[] = [
  {
    id: 'ref_01',
    vehicleId: 'veh_atlas_01',
    vehiclePlate: '67891-A-1',
    timestamp: '2026-09-03T16:40:00Z',
    locationName: 'Afriquia Oasis Station Casablanca',
    litersAdded: 85.0,
    costUsd: 136.0,
    odometer: 184920,
    fuelPercentBefore: 18,
    fuelPercentAfter: 95,
    stationName: 'Afriquia Oasis',
    receiptNumber: 'AFR-2026-8910'
  },
  {
    id: 'ref_02',
    vehicleId: 'veh_atlas_02',
    vehiclePlate: '12345-B-6',
    timestamp: '2026-09-03T11:15:00Z',
    locationName: 'TotalEnergies Mohammedia Port',
    litersAdded: 60.5,
    costUsd: 96.8,
    odometer: 142100,
    fuelPercentBefore: 30,
    fuelPercentAfter: 90,
    stationName: 'TotalEnergies Port',
    receiptNumber: 'TOT-88912'
  },
  {
    id: 'ref_03',
    vehicleId: 'veh_med_01',
    vehiclePlate: '23456-A-40',
    timestamp: '2026-09-04T07:20:00Z',
    locationName: 'Shell Tanger Med Gateway',
    litersAdded: 140.0,
    costUsd: 224.0,
    odometer: 298400,
    fuelPercentBefore: 15,
    fuelPercentAfter: 98,
    stationName: 'Shell Tanger Med Logistics',
    receiptNumber: 'SHL-99234'
  }
];

export const INITIAL_ECO_SCORES: EcoDrivingScore[] = [
  {
    vehicleId: 'veh_atlas_02',
    vehiclePlate: '12345-B-6',
    driverName: 'Mustapha Idrissi',
    overallScore: 94,
    harshAccelerationCount: 1,
    harshBrakingCount: 2,
    sharpCorneringCount: 0,
    speedingIncidents: 0,
    idleFuelWasteLiters: 1.4,
    avgLitersPer100Km: 7.8,
    grade: 'A+'
  },
  {
    vehicleId: 'veh_atlas_01',
    vehiclePlate: '67891-A-1',
    driverName: 'Rachid El Amrani',
    overallScore: 88,
    harshAccelerationCount: 4,
    harshBrakingCount: 3,
    sharpCorneringCount: 2,
    speedingIncidents: 1,
    idleFuelWasteLiters: 3.8,
    avgLitersPer100Km: 9.2,
    grade: 'A'
  },
  {
    vehicleId: 'veh_atlas_03',
    vehiclePlate: '78901-D-1',
    driverName: 'Mohamed Tazi',
    overallScore: 76,
    harshAccelerationCount: 8,
    harshBrakingCount: 9,
    sharpCorneringCount: 5,
    speedingIncidents: 3,
    idleFuelWasteLiters: 7.2,
    avgLitersPer100Km: 11.4,
    grade: 'C'
  },
  {
    vehicleId: 'veh_sahara_01',
    vehiclePlate: '45678-A-8',
    driverName: 'Tariq Belhaj',
    overallScore: 82,
    harshAccelerationCount: 5,
    harshBrakingCount: 4,
    sharpCorneringCount: 3,
    speedingIncidents: 2,
    idleFuelWasteLiters: 4.5,
    avgLitersPer100Km: 8.9,
    grade: 'B'
  }
];

export const INITIAL_COLD_CHAIN_EXCURSIONS: ColdChainExcursion[] = [
  {
    id: 'exc_01',
    organizationId: 'org_med_cargo',
    vehicleId: 'veh_med_01',
    vehiclePlate: '23456-A-40',
    compartment: 'Chilled (Compartment A)',
    recordedTempCelsius: 7.8,
    minAllowedCelsius: 2.0,
    maxAllowedCelsius: 5.0,
    durationMinutes: 18,
    timestamp: '2026-09-04T08:35:00Z',
    latitude: 35.7595,
    longitude: -5.8340,
    locationName: 'Tanger Free Zone Loading Bay #4',
    cargoDescription: 'Vaccines & Biologics Shipment (Pharma GDP)',
    severity: 'critical',
    doorWasOpen: true,
    acknowledgedBy: 'Mehdi Chraibi'
  },
  {
    id: 'exc_02',
    organizationId: 'org_med_cargo',
    vehicleId: 'veh_med_02',
    vehiclePlate: '89123-B-40',
    compartment: 'Deep Freeze (Compartment B)',
    recordedTempCelsius: -14.2,
    minAllowedCelsius: -22.0,
    maxAllowedCelsius: -18.0,
    durationMinutes: 12,
    timestamp: '2026-09-03T19:10:00Z',
    latitude: 35.8872,
    longitude: -5.5023,
    locationName: 'Tanger Med Port Customs Inspection',
    cargoDescription: 'Frozen Atlantic Seafood Export (HACCP)',
    severity: 'warning',
    doorWasOpen: false,
    acknowledgedBy: 'Dr. Hassan Alami'
  }
];

export const INITIAL_HACCP_CERTIFICATES: HaccpCertificate[] = [
  {
    id: 'haccp_2026_091',
    tripId: 'trip_med_01',
    vehiclePlate: '23456-A-40',
    clientConsignee: 'Sanofi Pasteur Maroc - Casablanca Hub',
    cargoType: 'Pharmaceutical Vaccines Class II (+2°C to +8°C)',
    minRecordedCelsius: 2.4,
    maxRecordedCelsius: 4.8,
    avgRecordedCelsius: 3.6,
    complianceStatus: '100% Compliant',
    generatedDate: '2026-09-04T09:00:00Z',
    inspectorName: 'Quality Lead: Amine Berrada',
    pdfDownloadUrl: '#'
  },
  {
    id: 'haccp_2026_090',
    tripId: 'trip_med_02',
    vehiclePlate: '89123-B-40',
    clientConsignee: 'Mercadona Logistics Algeciras (Spain)',
    cargoType: 'Frozen Atlantic Octopus & Calamari (-20°C)',
    minRecordedCelsius: -21.8,
    maxRecordedCelsius: -18.1,
    avgRecordedCelsius: -20.2,
    complianceStatus: '100% Compliant',
    generatedDate: '2026-09-03T23:30:00Z',
    inspectorName: 'Chief Inspector: Elena Morales',
    pdfDownloadUrl: '#'
  }
];

export const INITIAL_SHAREABLE_LINKS: ShareableLiveLink[] = [
  {
    id: 'link_001',
    organizationId: 'org_atlas_logistics',
    vehicleId: 'veh_atlas_01',
    vehiclePlate: '67891-A-1',
    recipientName: 'Marjane Supermarché Sidi Maârouf',
    recipientPhone: '+212 522 78 90 00',
    destinationAddress: 'Marjane Market, Boulevard Al Qods, Casablanca',
    destinationCoords: [33.5350, -7.6350],
    uniqueToken: 'trk_cas_8819a',
    liveUrl: 'https://track.flottemaestro.io/live/trk_cas_8819a',
    pinCode: '4821',
    expiresAt: '2026-09-04T18:00:00Z',
    status: 'active',
    etaMinutes: 14,
    remainingDistanceKm: 6.8,
    orderReference: 'ORD-2026-9812',
    createdAt: '2026-09-04T09:15:00Z'
  },
  {
    id: 'link_002',
    organizationId: 'org_atlas_logistics',
    vehicleId: 'veh_atlas_02',
    vehiclePlate: '12345-B-6',
    recipientName: 'Electroplanet Rabat Agdal',
    recipientPhone: '+212 537 67 88 11',
    destinationAddress: 'Avenue Fal Ould Oumeir, Agdal, Rabat',
    destinationCoords: [33.9980, -6.8480],
    uniqueToken: 'trk_rab_9921b',
    liveUrl: 'https://track.flottemaestro.io/live/trk_rab_9921b',
    pinCode: '1190',
    expiresAt: '2026-09-04T16:30:00Z',
    status: 'active',
    etaMinutes: 38,
    remainingDistanceKm: 42.1,
    orderReference: 'ORD-2026-9815',
    createdAt: '2026-09-04T08:00:00Z'
  }
];

export const INITIAL_DELIVERY_PODS: DeliveryPod[] = [
  {
    id: 'pod_001',
    orderNumber: 'ORD-2026-9800',
    clientName: 'Carrefour Market Anfa',
    deliveryAddress: 'Boulevard d\'Anfa, Casablanca',
    status: 'delivered',
    deliveredAt: '2026-09-04T08:45:00Z',
    recipientSignatureName: 'Samir Mansour (Store Mgr)',
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 50 10 90 40 T 170 30" fill="none" stroke="%232563eb" stroke-width="3"/></svg>',
    photoProofUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80',
    driverNotes: '12 pallets unloaded at dock #2. Temperature inspected and validated.'
  },
  {
    id: 'pod_002',
    orderNumber: 'ORD-2026-9795',
    clientName: 'Decathlon Casablanca Ain Diab',
    deliveryAddress: 'Ain Diab Corniche, Casablanca',
    status: 'delivered',
    deliveredAt: '2026-09-03T17:15:00Z',
    recipientSignatureName: 'Kenza Alaoui (Logistics)',
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M20 30 C 60 50 100 10 160 40" fill="none" stroke="%23059669" stroke-width="3"/></svg>',
    photoProofUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&q=80',
    driverNotes: 'Delivered in full. No parcel damages.'
  }
];

export const INITIAL_MAINTENANCE_INTERVALS: MaintenanceInterval[] = [
  {
    id: 'mnt_01',
    vehicleId: 'veh_atlas_01',
    vehiclePlate: '67891-A-1',
    serviceType: 'engine_oil',
    title: 'Synthetic Engine Oil & Filter Change (15,000 km)',
    intervalKm: 15000,
    intervalDays: 180,
    lastDoneOdometer: 172000,
    lastDoneDate: '2026-04-10T00:00:00Z',
    nextDueOdometer: 187000,
    nextDueDate: '2026-10-10T00:00:00Z',
    remainingKm: 2080,
    remainingDays: 36,
    status: 'due_soon',
    estimatedCostUsd: 120
  },
  {
    id: 'mnt_02',
    vehicleId: 'veh_atlas_01',
    vehiclePlate: '67891-A-1',
    serviceType: 'brake_pads',
    title: 'Front Ceramic Brake Pads Replacement',
    intervalKm: 40000,
    intervalDays: 365,
    lastDoneOdometer: 150000,
    lastDoneDate: '2025-11-05T00:00:00Z',
    nextDueOdometer: 190000,
    nextDueDate: '2026-11-05T00:00:00Z',
    remainingKm: 5080,
    remainingDays: 62,
    status: 'good',
    estimatedCostUsd: 180
  },
  {
    id: 'mnt_03',
    vehicleId: 'veh_atlas_03',
    vehiclePlate: '78901-D-1',
    serviceType: 'technical_inspection',
    title: 'Annual Regulatory Technical Inspection (Contrôle Technique)',
    intervalKm: 50000,
    intervalDays: 365,
    lastDoneOdometer: 62000,
    lastDoneDate: '2025-09-01T00:00:00Z',
    nextDueOdometer: 112000,
    nextDueDate: '2026-09-01T00:00:00Z',
    remainingKm: 24800,
    remainingDays: -3,
    status: 'overdue',
    estimatedCostUsd: 45
  },
  {
    id: 'mnt_04',
    vehicleId: 'veh_clio_01',
    vehiclePlate: '45892-A-6',
    serviceType: 'engine_oil',
    title: 'Renault Scheduled Service A (Oil + Air Filter)',
    intervalKm: 20000,
    intervalDays: 365,
    lastDoneOdometer: 10000,
    lastDoneDate: '2026-01-15T00:00:00Z',
    nextDueOdometer: 30000,
    nextDueDate: '2027-01-15T00:00:00Z',
    remainingKm: 5220,
    remainingDays: 133,
    status: 'good',
    estimatedCostUsd: 85
  }
];

export const INITIAL_DTC_CODES: DtcDiagnosticCode[] = [
  {
    id: 'dtc_01',
    vehicleId: 'veh_atlas_03',
    vehiclePlate: '78901-D-1',
    code: 'P0420',
    system: 'Emission',
    severity: 'moderate',
    description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
    possibleCauses: [
      'Faulty catalytic converter substrate degradation',
      'Defective downstream O2 oxygen sensor #2',
      'Exhaust manifold pinhole leak before sensor'
    ],
    recommendedAction: 'Perform live O2 sensor voltage waveform test and inspect catalytic converter temperature delta.',
    detectedAt: '2026-09-03T14:22:00Z',
    status: 'active'
  },
  {
    id: 'dtc_02',
    vehicleId: 'veh_sahara_02',
    vehiclePlate: '89012-A-8',
    code: 'P0301',
    system: 'Powertrain',
    severity: 'critical',
    description: 'Cylinder 1 Misfire Detected',
    possibleCauses: [
      'Fouled spark plug / glow plug on cylinder 1',
      'Defective ignition coil pack or fuel injector clogging',
      'Low cylinder 1 compression pressure'
    ],
    recommendedAction: 'Immediate injector cleaning and ignition coil swap test to prevent unburned fuel from damaging catalyst.',
    detectedAt: '2026-09-04T06:10:00Z',
    status: 'active'
  },
  {
    id: 'dtc_03',
    vehicleId: 'veh_atlas_02',
    vehiclePlate: '12345-B-6',
    code: 'P0113',
    system: 'Powertrain',
    severity: 'minor',
    description: 'Intake Air Temperature Sensor 1 Circuit High Input',
    possibleCauses: [
      'IAT sensor harness disconnected or loose terminal pin',
      'Failed intake air temperature thermistor'
    ],
    recommendedAction: 'Check intake sensor connector for corrosion or 5V reference wire open circuit.',
    detectedAt: '2026-09-01T09:40:00Z',
    status: 'cleared'
  }
];

export const INITIAL_WORK_ORDERS: WorkOrderRecord[] = [
  {
    id: 'wo_01',
    vehicleId: 'veh_atlas_01',
    vehiclePlate: '67891-A-1',
    serviceCenter: 'AutoHall Casablanca Route de Rabat',
    technicianName: 'Omar Benjelloun',
    description: '160,000 km Major Service + Front Suspension Bushings Replacement',
    costPartsUsd: 340,
    costLaborUsd: 160,
    totalCostUsd: 500,
    invoiceNumber: 'INV-AH-2026-4412',
    completedAt: '2026-08-18T16:00:00Z',
    replacedParts: ['Engine Oil 5W30 (8L)', 'Oil Filter OEM', 'Air Filter', 'Fuel Filter', 'Front Wishbone Bushings (x2)']
  },
  {
    id: 'wo_02',
    vehicleId: 'veh_atlas_02',
    vehiclePlate: '12345-B-6',
    serviceCenter: 'Pneumatiques du Sud Mohammedia',
    technicianName: 'Said Touzani',
    description: '4x Continental VanContact 215/65R16C Tire Replacement & Laser Alignment',
    costPartsUsd: 480,
    costLaborUsd: 50,
    totalCostUsd: 530,
    invoiceNumber: 'INV-PNS-8891',
    completedAt: '2026-07-22T11:30:00Z',
    replacedParts: ['4x Continental VanContact 106T', '4x Metal Valve Stems', 'Wheel Balancing Weights']
  }
];
