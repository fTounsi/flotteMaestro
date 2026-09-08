export type Language = 'en' | 'fr' | 'ar';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    filter: string;
    search: string;
    all: string;
    export: string;
    download: string;
    close: string;
    view: string;
    confirm: string;
    success: string;
    error: string;
    yes: string;
    no: string;
    none: string;
    optional: string;
    required: string;
    date: string;
    time: string;
    location: string;
    statusLabel: string;
    actionsLabel: string;
    details: string;
    total: string;
    active: string;
    inactive: string;
    apply: string;
    reset: string;
    refresh: string;
    noData: string;
  };
  nav: {
    dashboard: string;
    liveMap: string;
    liveTracking: string;
    vehicles: string;
    trackers: string;
    trips: string;
    tripsHistory: string;
    geofences: string;
    alerts: string;
    reports: string;
    modulesHub: string;
    carRental: string;
    fuelIntelligence: string;
    coldChain: string;
    liveSharing: string;
    predictiveMaintenance: string;
    invoicing: string;
    organizations: string;
    usersRbac: string;
    apiExplorer: string;
    settings: string;
    coreGroup: string;
    modulesGroup: string;
    adminGroup: string;
  };
  auth: {
    signInTitle: string;
    signInSubtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    rememberWorkstation: string;
    forgotPassword: string;
    signInButton: string;
    authenticating: string;
    quickDemoAccounts: string;
    superAdminRole: string;
    orgOwnerRole: string;
    fleetManagerRole: string;
    driverRole: string;
    selectTenant: string;
    allTenantsAccess: string;
    orContinueWithSSO: string;
    biometricSignIn: string;
    biometricScanPrompt: string;
    biometricScanning: string;
    biometricSuccess: string;
    pinSignIn: string;
    enterDriverPin: string;
    pinPlaceholder: string;
    invalidCredentials: string;
    signOut: string;
    profile: string;
    securityBanner: string;
    switchUser: string;
    viewLoginPreview: string;
    backToDashboard: string;
  };
  modes: {
    webAdmin: string;
    mobileApp: string;
    apiDeveloper: string;
  };
  status: {
    moving: string;
    idle: string;
    stopped: string;
    offline: string;
    active: string;
    expiring: string;
    expired: string;
    suspended: string;
    available: string;
    rented: string;
    maintenance: string;
    returned: string;
    confirmed: string;
    pending: string;
    cancelled: string;
    resolved: string;
    investigating: string;
    critical: string;
    warning: string;
    info: string;
    in_service: string;
    overdue: string;
    online: string;
  };
  metrics: {
    totalVehicles: string;
    movingVehicles: string;
    idleVehicles: string;
    stoppedVehicles: string;
    offlineVehicles: string;
    activeTrackers: string;
    unreadAlerts: string;
    activeGeofences: string;
    speed: string;
    odometer: string;
    battery: string;
    voltage: string;
    satellites: string;
    ignition: string;
    lastSeen: string;
    driver: string;
    fleet: string;
    plan: string;
    fuelLevel: string;
    temperature: string;
    humidity: string;
    dtcCodes: string;
    engineLoad: string;
    coolantTemp: string;
    rpm: string;
    distanceToday: string;
    drivingTime: string;
    idleDuration: string;
  };
  actions: {
    addVehicle: string;
    addTracker: string;
    addGeofence: string;
    generateReport: string;
    searchVehicles: string;
    filterByStatus: string;
    followVehicle: string;
    viewHistory: string;
    playRoute: string;
    pauseRoute: string;
    exportPdf: string;
    exportExcel: string;
    liveSimulation: string;
    simulateTrip: string;
    triggerOverspeed: string;
    triggerGeofence: string;
    resetDemo: string;
    decodeVin: string;
    saveChanges: string;
    cancel: string;
    delete: string;
    edit: string;
    assignTracker: string;
    unassign: string;
    markAsRead: string;
    viewDetails: string;
    immobilize: string;
    restoreEngine: string;
    remoteCommand: string;
    unlockDoors: string;
    lockDoors: string;
    refresh: string;
    filter: string;
    search: string;
    download: string;
    share: string;
    close: string;
    save: string;
    submit: string;
    clearAll: string;
    simulateTheft: string;
    simulateTempSpike: string;
    simulateDtc: string;
  };
  geofence: {
    circle: string;
    polygon: string;
    radius: string;
    speedLimit: string;
    zoneName: string;
    enterAlert: string;
    exitAlert: string;
    color: string;
    description: string;
    createGeofence: string;
    activeZones: string;
    zoneType: string;
    drawInstructions: string;
    polygonPoints: string;
    saveZone: string;
  };
  mobile: {
    deviceFrame: string;
    iphone: string;
    pixel: string;
    fullScreen: string;
    overview: string;
    quickMap: string;
    recentAlerts: string;
    liveCompass: string;
    tapToFollow: string;
    myVehicle: string;
    driverLogs: string;
    remoteControls: string;
    tripsToday: string;
    emergencySos: string;
    vehicleLocked: string;
    vehicleUnlocked: string;
  };
  api: {
    swaggerTitle: string;
    tryItOut: string;
    execute: string;
    response: string;
    streamTitle: string;
    realtimePackets: string;
    traccarAdapterFlow: string;
    endpoints: string;
    authHeader: string;
    samplePayload: string;
    clearLog: string;
    liveWsStream: string;
    pauseStream: string;
    resumeStream: string;
  };
  modulesHub: {
    title: string;
    subtitle: string;
    allModules: string;
    unlockedOnly: string;
    lockedOnly: string;
    enableModule: string;
    disableModule: string;
    includedInPlan: string;
    monthlyCost: string;
    perVehicle: string;
    launchModule: string;
    moduleActive: string;
    moduleInactive: string;
    addOnsSummary: string;
    selectOrganization: string;
    estimatedAddonSpend: string;
    activeAddonsCount: string;
  };
  carRental: {
    title: string;
    subtitle: string;
    availableVehicles: string;
    reservations: string;
    contracts: string;
    returns: string;
    analytics: string;
    immobilizer: string;
    cutRelay: string;
    restoreRelay: string;
    digitalInspection: string;
    contractNumber: string;
    dailyRate: string;
    depositAmount: string;
    totalRevenue: string;
    activeContracts: string;
    fuelAtReturn: string;
    mileageAtReturn: string;
    damageChecklist: string;
    customerSignature: string;
    odometerStart: string;
    odometerEnd: string;
    newContract: string;
    viewContract: string;
    closeContract: string;
    customerName: string;
    customerPhone: string;
    rentalPeriod: string;
    relayStatus: string;
    engineCutConfirmed: string;
    engineResumedConfirmed: string;
    relayDisabledWarning: string;
    markDamage: string;
    inspectionReport: string;
  };
  fuelIntelligence: {
    title: string;
    subtitle: string;
    siphoningAlerts: string;
    refuelingLogs: string;
    ecoDrivingScores: string;
    totalLostLiters: string;
    estimatedLoss: string;
    activeSiphonAlarms: string;
    fuelDropEvent: string;
    tankLevel: string;
    antiTheftRadar: string;
    simulateSiphon: string;
    consumptionRate: string;
    fuelTheftDetected: string;
    investigate: string;
    confirmTheft: string;
    driverRanking: string;
    harshAcceleration: string;
    excessiveIdling: string;
    fuelGraphTitle: string;
    recentRefuels: string;
    siphonIncidentFeed: string;
  };
  coldChain: {
    title: string;
    subtitle: string;
    liveSensorFeed: string;
    haccpAudit: string;
    temperatureExcursions: string;
    cargoType: string;
    targetTempRange: string;
    currentTemp: string;
    doorStatus: string;
    defrostCycle: string;
    complianceRate: string;
    pharmaGrade: string;
    freshProduce: string;
    frozenMeat: string;
    reeferUnit: string;
    simulateExcursion: string;
    criticalSpike: string;
    generateHaccpReport: string;
    tempGraphTitle: string;
    excursionSummary: string;
  };
  liveSharing: {
    title: string;
    subtitle: string;
    activeLinks: string;
    generateLink: string;
    recipientName: string;
    destination: string;
    estimatedArrival: string;
    liveTrajectory: string;
    shareViaWhatsapp: string;
    copyLink: string;
    pinProtected: string;
    linkExpiresIn: string;
    deliveryCompleted: string;
    electronicPod: string;
    recipientSignature: string;
    proofOfDelivery: string;
    linkCopied: string;
    trackingUrl: string;
  };
  predictiveMaintenance: {
    title: string;
    subtitle: string;
    obdScanner: string;
    dtcTroubleCodes: string;
    serviceSchedule: string;
    oilLifeRemaining: string;
    brakePadWear: string;
    tireHealth: string;
    batteryHealth: string;
    diagnosticTerminal: string;
    clearCodes: string;
    scheduleService: string;
    criticalAlert: string;
    componentHealth: string;
    nextServiceAt: string;
    engineDiagnostics: string;
    faultCodeCleared: string;
  };
  organizations: {
    title: string;
    subtitle: string;
    allTenants: string;
    addTenant: string;
    tenantName: string;
    city: string;
    planName: string;
    maxVehicles: string;
    activeTrackers: string;
    billingCycle: string;
    storageUsed: string;
    apiCalls: string;
    switchTenant: string;
    tenantDetails: string;
    subscriptionLimits: string;
  };
  usersRbac: {
    title: string;
    subtitle: string;
    teamMembers: string;
    addUser: string;
    role: string;
    permissions: string;
    customPermissions: string;
    lastActive: string;
    simulateRole: string;
    superAdmin: string;
    orgOwner: string;
    fleetManager: string;
    driver: string;
    allTenantsAccess: string;
    editUser: string;
    deleteUser: string;
    permissionsMatrix: string;
  };
  settings: {
    title: string;
    subtitle: string;
    traccarGateways: string;
    activeProtocols: string;
    serverPort: string;
    gpsIngestionInterval: string;
    bufferCapacity: string;
    webhookEndpoints: string;
    geocoderApiKey: string;
    downlinkQueue: string;
    saveParameters: string;
    protocolConfig: string;
    systemHealth: string;
    parametersSaved: string;
  };
  reports: {
    title: string;
    subtitle: string;
    tripSummary: string;
    mileageLog: string;
    fuelAudit: string;
    driverBehavior: string;
    geofenceLog: string;
    dateRange: string;
    selectVehicles: string;
    generateReport: string;
    recentReports: string;
    downloadPdf: string;
    downloadExcel: string;
    reportFormat: string;
    generating: string;
  };
  trips: {
    title: string;
    subtitle: string;
    selectTrip: string;
    tripPlayback: string;
    playbackSpeed: string;
    distance: string;
    duration: string;
    avgSpeed: string;
    maxSpeed: string;
    startLocation: string;
    endLocation: string;
    stops: string;
    elevationProfile: string;
    timeline: string;
    scrubber: string;
    replayRoute: string;
  };
  trackers: {
    title: string;
    subtitle: string;
    registeredTrackers: string;
    registerTracker: string;
    imei: string;
    protocol: string;
    simCard: string;
    signalStrength: string;
    assignedVehicle: string;
    lastPing: string;
    firmware: string;
    downlinkCommands: string;
    sendDownlink: string;
    trackerStatus: string;
  };
  alertsView: {
    title: string;
    subtitle: string;
    allAlerts: string;
    unreadOnly: string;
    criticalOnly: string;
    markAllRead: string;
    severity: string;
    triggerReason: string;
    vehicle: string;
    time: string;
    location: string;
    resolveAlert: string;
    assignToDriver: string;
    alertDetails: string;
  };
  vehicleDetail: {
    title: string;
    specs: string;
    liveSensors: string;
    engineDiagnostics: string;
    remoteRelay: string;
    dtcCodes: string;
    odometer: string;
    voltage: string;
    battery: string;
    speed: string;
    rpm: string;
    coolant: string;
    fuelTank: string;
    lastPosition: string;
    driver: string;
    sendDownlink: string;
    replayTrip: string;
    engineCutoff: string;
    engineResume: string;
  };
  vehicleCatalog: {
    title: string;
    subtitle: string;
    vinDecoder: string;
    enterVin: string;
    decode: string;
    make: string;
    model: string;
    year: string;
    licensePlate: string;
    trackerSelect: string;
    fuelType: string;
    category: string;
    addVehicleBtn: string;
    decodingVin: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'FlotteMaestro',
    tagline: 'Multi-Tenant Fleet Synchronization & Telemetry Platform',
    common: {
      loading: 'Loading telemetry...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      filter: 'Filter',
      search: 'Search...',
      all: 'All',
      export: 'Export',
      download: 'Download',
      close: 'Close',
      view: 'View',
      confirm: 'Confirm',
      success: 'Operation Successful',
      error: 'Error Occurred',
      yes: 'Yes',
      no: 'No',
      none: 'None',
      optional: 'Optional',
      required: 'Required',
      date: 'Date',
      time: 'Time',
      location: 'Location',
      statusLabel: 'Status',
      actionsLabel: 'Actions',
      details: 'Details',
      total: 'Total',
      active: 'Active',
      inactive: 'Inactive',
      apply: 'Apply Filters',
      reset: 'Reset',
      refresh: 'Refresh Feed',
      noData: 'No records found'
    },
    nav: {
      dashboard: 'Dashboard',
      liveMap: 'Live GPS Map',
      liveTracking: 'Live GPS Map',
      vehicles: 'Vehicles & Fleet',
      trackers: 'Hardware Trackers',
      trips: 'Trips & Replay',
      tripsHistory: 'Trips & Replay',
      geofences: 'Geofences',
      alerts: 'Alerts & Events',
      reports: 'Reports Studio',
      modulesHub: 'Feature Modules',
      carRental: 'Car Rental & Relay',
      fuelIntelligence: 'Fuel Intelligence',
      coldChain: 'Cold-Chain & HACCP',
      liveSharing: 'Live ETA Sharing',
      predictiveMaintenance: 'Predictive Maintenance',
      invoicing: 'Invoicing & Billing',
      organizations: 'Organizations & Tenancy',
      usersRbac: 'Users & Permissions',
      apiExplorer: 'REST API & WebSockets',
      settings: 'System Parameters',
      coreGroup: 'Core Fleet Telemetry',
      modulesGroup: 'Specialized Add-On Modules',
      adminGroup: 'Tenancy & Governance'
    },
    auth: {
      signInTitle: 'Sign in to FlotteMaestro',
      signInSubtitle: 'Enterprise Fleet Telemetry & Multi-Tenant Synchronization Gateway',
      emailLabel: 'Work Email Address',
      emailPlaceholder: 'operator@flottemaestro.io',
      passwordLabel: 'Access Password',
      passwordPlaceholder: '••••••••••••',
      rememberWorkstation: 'Remember this secure workstation for 30 days',
      forgotPassword: 'Reset credentials?',
      signInButton: 'Authenticate & Enter Gateway',
      authenticating: 'Establishing Encrypted Telemetry Channel...',
      quickDemoAccounts: 'Fast-Track Role Selector (1-Click Demo Sign-in)',
      superAdminRole: 'Super Admin (Full Root)',
      orgOwnerRole: 'Organization Owner',
      fleetManagerRole: 'Fleet Ops Manager',
      driverRole: 'Field Driver (Mobile)',
      selectTenant: 'Target Organization Tenant',
      allTenantsAccess: 'All Tenants & Root Gateway Access',
      orContinueWithSSO: 'or authenticate with enterprise Single Sign-On (SSO)',
      biometricSignIn: 'Biometric Touch / Face ID',
      biometricScanPrompt: 'Touch fingerprint sensor or scan Face ID to login',
      biometricScanning: 'Verifying Secure Hardware Enclave...',
      biometricSuccess: 'Biometrics Authenticated Successfully',
      pinSignIn: 'Driver 4-Digit Quick PIN',
      enterDriverPin: 'Enter 4-Digit Truck Terminal PIN',
      pinPlaceholder: '••••',
      invalidCredentials: 'Authentication failed. Please check your credentials or PIN.',
      signOut: 'Sign Out',
      profile: 'User Profile & Security',
      securityBanner: 'SOC2 Type II Certified • 256-bit TLS 1.3 Ingestion Pipeline • Real-Time GPS Synchronization',
      switchUser: 'Switch Account',
      viewLoginPreview: 'Preview Login Screen',
      backToDashboard: 'Return to Live Fleet Dashboard'
    },
    modes: {
      webAdmin: 'Web Admin & Fleet Portal',
      mobileApp: 'Mobile App (Flutter)',
      apiDeveloper: 'REST API & Gateway'
    },
    status: {
      moving: 'Moving',
      idle: 'Idling',
      stopped: 'Stopped',
      offline: 'Offline',
      active: 'Active',
      expiring: 'Expiring Soon',
      expired: 'Expired',
      suspended: 'Suspended',
      available: 'Available for Rent',
      rented: 'On Active Rental',
      maintenance: 'In Maintenance',
      returned: 'Returned & Inspected',
      confirmed: 'Confirmed',
      pending: 'Pending Approval',
      cancelled: 'Cancelled',
      resolved: 'Resolved',
      investigating: 'Under Investigation',
      critical: 'Critical Alert',
      warning: 'Warning Notice',
      info: 'Informational',
      in_service: 'In Service',
      overdue: 'Overdue Action',
      online: 'Online Stream'
    },
    metrics: {
      totalVehicles: 'Total Fleet',
      movingVehicles: 'In Motion',
      idleVehicles: 'Idling (Engine ON)',
      stoppedVehicles: 'Stationary',
      offlineVehicles: 'No Signal',
      activeTrackers: 'Online Trackers',
      unreadAlerts: 'Active Alerts',
      activeGeofences: 'Spatial Zones',
      speed: 'Speed',
      odometer: 'Odometer',
      battery: 'Internal Battery',
      voltage: 'External Voltage',
      satellites: 'GNSS Satellites',
      ignition: 'Engine Ignition',
      lastSeen: 'Last Telemetry',
      driver: 'Assigned Driver',
      fleet: 'Sub-Fleet',
      plan: 'Subscription Plan',
      fuelLevel: 'Fuel Tank Level',
      temperature: 'Cargo Temperature',
      humidity: 'Reefer Humidity',
      dtcCodes: 'Active OBD Faults',
      engineLoad: 'Engine Calculated Load',
      coolantTemp: 'Coolant Temperature',
      rpm: 'Engine RPM',
      distanceToday: 'Distance Today',
      drivingTime: 'Driving Hours',
      idleDuration: 'Idle Duration'
    },
    actions: {
      addVehicle: 'Add Vehicle',
      addTracker: 'Register Tracker',
      addGeofence: 'New Geofence',
      generateReport: 'Generate Report',
      searchVehicles: 'Search by plate, make, model or driver...',
      filterByStatus: 'Filter status',
      followVehicle: 'Follow Vehicle',
      viewHistory: 'Route Playback',
      playRoute: 'Play Replay',
      pauseRoute: 'Pause',
      exportPdf: 'Export PDF',
      exportExcel: 'Export Excel (XLSX)',
      liveSimulation: 'Real-time GPS Feed',
      simulateTrip: 'Simulate Route Movement',
      triggerOverspeed: 'Trigger Overspeed Alert',
      triggerGeofence: 'Trigger Geofence Enter',
      resetDemo: 'Reset Fleet Telemetry',
      decodeVin: 'Decode VIN & Autocomplete',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      assignTracker: 'Assign Tracker',
      unassign: 'Unassign',
      markAsRead: 'Mark as read',
      viewDetails: 'Vehicle Inspector',
      immobilize: 'Immobilize Vehicle (Cut Relay)',
      restoreEngine: 'Restore Engine Ignition',
      remoteCommand: 'Send Downlink Command',
      unlockDoors: 'Unlock Vehicle Doors',
      lockDoors: 'Lock Vehicle Doors',
      refresh: 'Refresh Telemetry',
      filter: 'Apply Filters',
      search: 'Search Assets',
      download: 'Download File',
      share: 'Share Live Link',
      close: 'Close Window',
      save: 'Save Record',
      submit: 'Submit Form',
      clearAll: 'Clear All Feeds',
      simulateTheft: 'Simulate Siphon Theft Event',
      simulateTempSpike: 'Simulate Thermal Excursion',
      simulateDtc: 'Simulate OBD-II Error Code'
    },
    geofence: {
      circle: 'Circular Radial Zone',
      polygon: 'Polygon Boundary',
      radius: 'Radius (Meters)',
      speedLimit: 'Zone Speed Limit (km/h)',
      zoneName: 'Geofence Zone Name',
      enterAlert: 'Alert on Zone Entry',
      exitAlert: 'Alert on Zone Exit',
      color: 'Zone Display Color',
      description: 'Perimeter Description',
      createGeofence: 'Create Spatial Boundary',
      activeZones: 'Active Spatial Perimeters',
      zoneType: 'Boundary Geometry',
      drawInstructions: 'Click on the map to place vertices or center coordinate',
      polygonPoints: 'Coordinates Vertices',
      saveZone: 'Store Geofence Perimeter'
    },
    mobile: {
      deviceFrame: 'Device Preview',
      iphone: 'iPhone 16 Pro',
      pixel: 'Google Pixel 9',
      fullScreen: 'Responsive Canvas',
      overview: 'Fleet Overview',
      quickMap: 'Quick Radar Map',
      recentAlerts: 'Live Alerts Feed',
      liveCompass: 'Live Heading',
      tapToFollow: 'Tap vehicle to follow live trajectory',
      myVehicle: 'Assigned Truck',
      driverLogs: 'Driver Hours of Service',
      remoteControls: 'Terminal Controls',
      tripsToday: 'Today’s Dispatched Runs',
      emergencySos: 'Emergency SOS Broadcast',
      vehicleLocked: 'Doors Secured',
      vehicleUnlocked: 'Doors Unlocked'
    },
    api: {
      swaggerTitle: 'OpenAPI 3.0 Interactive Documentation',
      tryItOut: 'Test Endpoint',
      execute: 'Execute Live Request',
      response: 'Live JSON Response',
      streamTitle: 'WebSocket Telemetry & Protocol Pipeline',
      realtimePackets: 'Ingested GPS Stream (Traccar Adapter)',
      traccarAdapterFlow: 'Traccar GPS Decoders → Event Pipeline → Client WebSocket',
      endpoints: 'Available REST Endpoints',
      authHeader: 'Authorization Bearer Token',
      samplePayload: 'Sample Request Payload',
      clearLog: 'Clear Packet History',
      liveWsStream: 'Live WebSocket Socket Feed',
      pauseStream: 'Pause Ingestion Stream',
      resumeStream: 'Resume Ingestion Stream'
    },
    modulesHub: {
      title: 'Feature Modules & Specialized Add-Ons',
      subtitle: 'Unlock vertical solutions: Car Rental relay, Fuel intelligence, Cold-Chain HACCP, and Live Sharing',
      allModules: 'All Available Modules',
      unlockedOnly: 'Active / Unlocked',
      lockedOnly: 'Available to Unlock',
      enableModule: 'Activate Module',
      disableModule: 'Deactivate',
      includedInPlan: 'Included in Current Tier',
      monthlyCost: 'Monthly Subscription',
      perVehicle: '/ vehicle / month',
      launchModule: 'Launch Module Workspace',
      moduleActive: 'Operational',
      moduleInactive: 'Inactive',
      addOnsSummary: 'Add-Ons Expenditure',
      selectOrganization: 'Target Organization',
      estimatedAddonSpend: 'Estimated Add-On Cost',
      activeAddonsCount: 'Active Vertical Modules'
    },
    carRental: {
      title: 'Car Rental Operations & Remote Immobilizer',
      subtitle: 'Digital rental contracts, automated vehicle check-in/out, damage inspection, and anti-theft relay control',
      availableVehicles: 'Fleet Inventory & Status',
      reservations: 'Booking Pipeline',
      contracts: 'Active Contracts',
      returns: 'Check-In & Damage Inspection',
      analytics: 'Utilization & Revenue',
      immobilizer: 'Hardware Anti-Theft Immobilizer',
      cutRelay: 'Cut Starter Relay (Immobilize)',
      restoreRelay: 'Restore Starter Relay',
      digitalInspection: '360° Digital Damage Inspection',
      contractNumber: 'Contract #',
      dailyRate: 'Daily Rate ($)',
      depositAmount: 'Security Deposit ($)',
      totalRevenue: 'Total Rental Yield',
      activeContracts: 'Active Rentals on Road',
      fuelAtReturn: 'Fuel Level at Return (%)',
      mileageAtReturn: 'Odometer at Return (km)',
      damageChecklist: 'Damage Notation Points',
      customerSignature: 'Customer Digital Signature',
      odometerStart: 'Departure Odometer',
      odometerEnd: 'Return Odometer',
      newContract: 'Draft New Rental Agreement',
      viewContract: 'Inspect Agreement PDF',
      closeContract: 'Complete Return & Bill',
      customerName: 'Customer Name',
      customerPhone: 'Contact Number',
      rentalPeriod: 'Rental Duration',
      relayStatus: 'Starter Relay Status',
      engineCutConfirmed: 'Relay successfully cut. Vehicle starter is disabled.',
      engineResumedConfirmed: 'Relay successfully restored. Vehicle can now start.',
      relayDisabledWarning: 'Immobilization cuts starter circuit over secure downlink. Use with verified parked status.',
      markDamage: 'Click vehicle schematic to place damage tag',
      inspectionReport: 'Generate Return Inspection Certificate'
    },
    fuelIntelligence: {
      title: 'Fuel Intelligence & Siphon Theft Detection',
      subtitle: 'Real-time ultrasonic fuel sensor telemetry, sudden drop detection, anti-siphon alarms, and eco-driving audits',
      siphoningAlerts: 'Siphon & Theft Radar',
      refuelingLogs: 'Fuel Stations & Refuels',
      ecoDrivingScores: 'Eco-Driving & Driver Ranking',
      totalLostLiters: 'Estimated Stolen Fuel',
      estimatedLoss: 'Financial Loss',
      activeSiphonAlarms: 'Active Siphon Alarms',
      fuelDropEvent: 'Sudden Tank Level Drop (>15L)',
      tankLevel: 'Current Tank Level',
      antiTheftRadar: 'Anti-Theft Acoustic Algorithm',
      simulateSiphon: 'Simulate Tank Siphoning',
      consumptionRate: 'Average Consumption (L/100km)',
      fuelTheftDetected: 'FUEL THEFT ALARM DETECTED',
      investigate: 'Investigate Location',
      confirmTheft: 'File Incident & Notify Police',
      driverRanking: 'Fleet Driver Eco Scoreboard',
      harshAcceleration: 'Harsh Accelerations',
      excessiveIdling: 'Idling Fuel Burn',
      fuelGraphTitle: 'Continuous Tank Level Waveform (24H)',
      recentRefuels: 'Verified Refueling Transactions',
      siphonIncidentFeed: 'Suspected Siphoning Incidents'
    },
    coldChain: {
      title: 'Cold-Chain Integrity & HACCP Compliance',
      subtitle: 'Real-time BLE temperature & humidity probes, thermal excursions, door sensor tracking, and audit reports',
      liveSensorFeed: 'Live Reefer Telemetry',
      haccpAudit: 'HACCP Compliance Report',
      temperatureExcursions: 'Thermal Excursion Alerts',
      cargoType: 'Refrigerated Cargo Type',
      targetTempRange: 'Target Thermal Window',
      currentTemp: 'Probe Temperature',
      doorStatus: 'Reefer Door Status',
      defrostCycle: 'Active Defrost Cycle',
      complianceRate: 'HACCP Compliance Score',
      pharmaGrade: 'Pharma / Vaccines (+2°C to +8°C)',
      freshProduce: 'Fresh Produce (+4°C to +10°C)',
      frozenMeat: 'Deep Frozen Meat (-25°C to -18°C)',
      reeferUnit: 'ThermoKing / Carrier Unit',
      simulateExcursion: 'Simulate Thermal Breach',
      criticalSpike: 'CRITICAL TEMP SPIKE DETECTED',
      generateHaccpReport: 'Download HACCP Audit PDF',
      tempGraphTitle: 'Thermal Logging Curve & Defrost Windows',
      excursionSummary: 'Thermal Excursion History'
    },
    liveSharing: {
      title: 'Live ETA Sharing & Electronic Proof of Delivery (e-POD)',
      subtitle: 'Generate secure customer tracking links, real-time live trajectory, SMS/WhatsApp delivery updates, and digital signatures',
      activeLinks: 'Active Customer Tracking Links',
      generateLink: 'Generate Live Share Link',
      recipientName: 'Consignee / Client Name',
      destination: 'Drop-Off Destination',
      estimatedArrival: 'Estimated Time of Arrival (ETA)',
      liveTrajectory: 'Live Moving Route & Trajectory',
      shareViaWhatsapp: 'Dispatch via WhatsApp',
      copyLink: 'Copy Secure URL',
      pinProtected: 'Require 4-Digit Security PIN',
      linkExpiresIn: 'Link TTL Expiration',
      deliveryCompleted: 'Cargo Delivered & Signed',
      electronicPod: 'Electronic Proof of Delivery',
      recipientSignature: 'Client Signature Capture',
      proofOfDelivery: 'Download Signed e-POD PDF',
      linkCopied: 'Tracking link copied to clipboard!',
      trackingUrl: 'Public Tracking URL'
    },
    predictiveMaintenance: {
      title: 'Predictive Maintenance & OBD-II Diagnostics',
      subtitle: 'CAN-bus error codes (DTC), live sensor telematics, brake/oil wear predictions, and service scheduling',
      obdScanner: 'CAN-Bus / OBD-II Scanner',
      dtcTroubleCodes: 'Diagnostic Trouble Codes (DTC)',
      serviceSchedule: 'Preventive Service Schedule',
      oilLifeRemaining: 'Estimated Oil Degradation',
      brakePadWear: 'Brake Pad Thickness Index',
      tireHealth: 'Tire Pressure & Tread Wear',
      batteryHealth: 'Alternator & Battery SOH',
      diagnosticTerminal: 'OBD-II Command Terminal',
      clearCodes: 'Clear Fault Memory (MIL Reset)',
      scheduleService: 'Book Maintenance Slot',
      criticalAlert: 'Critical Engine Fault Detected',
      componentHealth: 'Component Longevity Matrix',
      nextServiceAt: 'Next Major Service',
      engineDiagnostics: 'Powertrain Live Diagnostics',
      faultCodeCleared: 'DTC fault codes cleared from ECU buffer'
    },
    organizations: {
      title: 'Organizations & Multi-Tenancy Governance',
      subtitle: 'Manage client tenants, subscription quotas, tracker licenses, and tenant data isolation',
      allTenants: 'All Registered Organizations',
      addTenant: 'Provision New Tenant',
      tenantName: 'Organization Name',
      city: 'Headquarters City',
      planName: 'Active Plan Tier',
      maxVehicles: 'Vehicle License Quota',
      activeTrackers: 'Bound Hardware Trackers',
      billingCycle: 'Billing Cycle',
      storageUsed: 'Telemetry Data Retention',
      apiCalls: 'Monthly API Calls',
      switchTenant: 'Switch to this Tenant',
      tenantDetails: 'Tenant Profile & Limits',
      subscriptionLimits: 'Fleet Quotas & Features'
    },
    usersRbac: {
      title: 'Users & Role-Based Access Control (RBAC)',
      subtitle: 'Granular permissions, role assignment, multi-tenant scopes, and real-time permission simulator',
      teamMembers: 'Active Team Members',
      addUser: 'Invite Team Member',
      role: 'Assigned Role',
      permissions: 'System Permissions',
      customPermissions: 'Custom Granular Overrides',
      lastActive: 'Last Security Session',
      simulateRole: 'Simulate Experience as Role',
      superAdmin: 'Super Admin (Root Gateway)',
      orgOwner: 'Organization Owner',
      fleetManager: 'Fleet Operations Manager',
      driver: 'Field Driver',
      allTenantsAccess: 'Full Multi-Tenant Access',
      editUser: 'Edit User Rights',
      deleteUser: 'Revoke Access',
      permissionsMatrix: 'RBAC Access Matrix'
    },
    settings: {
      title: 'Traccar System Parameters & Protocols Hub',
      subtitle: 'Hardware protocol listeners, server ports, GPS ingestion buffers, webhooks, and reverse geocoding API keys',
      traccarGateways: 'Traccar Decoders & Ports',
      activeProtocols: 'Supported Hardware Protocols',
      serverPort: 'Telemetry Ingestion Port',
      gpsIngestionInterval: 'Default Telemetry Heartbeat (sec)',
      bufferCapacity: 'Offline GPS Buffer Storage (packets)',
      webhookEndpoints: 'Event Notification Webhooks',
      geocoderApiKey: 'Reverse Geocoding Provider API Key',
      downlinkQueue: 'Downlink Command Queue Worker',
      saveParameters: 'Save System Parameters',
      protocolConfig: 'Protocol Adapter Settings',
      systemHealth: 'Traccar Gateway Cluster Status',
      parametersSaved: 'System parameters updated successfully.'
    },
    reports: {
      title: 'Reports Studio & Fleet Analytics',
      subtitle: 'Generate comprehensive PDF / Excel reports for trips, mileage, fuel, driver safety, and geofence audits',
      tripSummary: 'Trips & Daily Routes Summary',
      mileageLog: 'Odometer & Mileage Tax Log',
      fuelAudit: 'Fuel Consumption & Siphon Audit',
      driverBehavior: 'Driver Safety & Speeding Scorecard',
      geofenceLog: 'Geofence Entry & Exit Audit',
      dateRange: 'Select Reporting Date Range',
      selectVehicles: 'Select Target Vehicles',
      generateReport: 'Generate Intelligence Report',
      recentReports: 'Generated Reports Archive',
      downloadPdf: 'Download PDF Report',
      downloadExcel: 'Download Excel (.xlsx)',
      reportFormat: 'Report File Format',
      generating: 'Compiling Fleet Telemetry...'
    },
    trips: {
      title: 'Trips History & Route Playback',
      subtitle: 'Scrub through historical trips, replay trajectory with speed and ignition telemetry, and inspect stops',
      selectTrip: 'Select Historical Trip',
      tripPlayback: 'Route Playback Scrubber',
      playbackSpeed: 'Replay Speed Factor',
      distance: 'Total Trip Distance',
      duration: 'Trip Duration',
      avgSpeed: 'Average Velocity',
      maxSpeed: 'Peak Speed Reached',
      startLocation: 'Trip Origin Point',
      endLocation: 'Trip Destination',
      stops: 'Detected Stationary Stops',
      elevationProfile: 'Terrain Elevation Profile',
      timeline: 'Trip Telemetry Timeline',
      scrubber: 'Timeline Playhead',
      replayRoute: 'Start Playback'
    },
    trackers: {
      title: 'Hardware Trackers & Telematics Inventory',
      subtitle: 'Manage GPS balises (Teltonika, Queclink, Coban, Suntech), SIM cards, ICCID, and downlink commands',
      registeredTrackers: 'Hardware GPS Trackers',
      registerTracker: 'Register New GPS Balise',
      imei: 'Tracker IMEI Number',
      protocol: 'Hardware Protocol',
      simCard: 'M2M SIM Card MSISDN',
      signalStrength: 'Cellular GSM Signal',
      assignedVehicle: 'Paired Vehicle Asset',
      lastPing: 'Last Keep-Alive Ping',
      firmware: 'Firmware Revision',
      downlinkCommands: 'Downlink Telematics Console',
      sendDownlink: 'Send SMS / GPRS Command',
      trackerStatus: 'Hardware Connection Status'
    },
    alertsView: {
      title: 'Alerts & Safety Incident Feed',
      subtitle: 'Real-time telemetry event triage: Overspeed, Geofence breach, SOS panic button, Siphon theft, and DTC faults',
      allAlerts: 'All Event Incidents',
      unreadOnly: 'Unresolved Alerts',
      criticalOnly: 'Critical Severity Only',
      markAllRead: 'Acknowledge All Incidents',
      severity: 'Incident Severity',
      triggerReason: 'Event Trigger Reason',
      vehicle: 'Vehicle Asset',
      time: 'Timestamp',
      location: 'Event Coordinates',
      resolveAlert: 'Mark as Resolved',
      assignToDriver: 'Notify Assigned Driver',
      alertDetails: 'Incident Triage Information'
    },
    vehicleDetail: {
      title: 'Vehicle Inspector & CAN-Bus Telemetry',
      specs: 'Vehicle Specifications',
      liveSensors: 'Live Sensor Matrix',
      engineDiagnostics: 'ECU & Engine Telemetry',
      remoteRelay: 'Starter Cut Relay Control',
      dtcCodes: 'Diagnostic Fault Codes (DTC)',
      odometer: 'Odometer Reading',
      voltage: 'Battery Voltage',
      battery: 'Backup Battery',
      speed: 'Current Velocity',
      rpm: 'Engine RPM',
      coolant: 'Coolant Temperature',
      fuelTank: 'Fuel Tank Capacity',
      lastPosition: 'Last Known Position',
      driver: 'Assigned Driver',
      sendDownlink: 'Dispatch Downlink Command',
      replayTrip: 'Replay Recent Trips',
      engineCutoff: 'Cut Starter Relay (Immobilize)',
      engineResume: 'Restore Starter Ignition'
    },
    vehicleCatalog: {
      title: 'Add Vehicle & Hardware Pairing',
      subtitle: 'Automatic VIN decoding, vehicle specifications, license plate, and GPS tracker pairing',
      vinDecoder: 'VIN Automatic Decoder (NHTSA / EuroNCAP)',
      enterVin: 'Enter 17-Character VIN',
      decode: 'Decode VIN',
      make: 'Manufacturer Make',
      model: 'Vehicle Model',
      year: 'Manufacturing Year',
      licensePlate: 'Official License Plate',
      trackerSelect: 'Assign GPS Balise Tracker',
      fuelType: 'Fuel / Powertrain Type',
      category: 'Vehicle Fleet Category',
      addVehicleBtn: 'Register Vehicle to Fleet',
      decodingVin: 'Querying Global VIN Database...'
    }
  },
  fr: {
    appName: 'FlotteMaestro',
    tagline: 'Plateforme Multi-Tenants de Gestion et Synchronisation de Flotte',
    common: {
      loading: 'Chargement de la télémétrie...',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      filter: 'Filtrer',
      search: 'Rechercher...',
      all: 'Tous',
      export: 'Exporter',
      download: 'Télécharger',
      close: 'Fermer',
      view: 'Voir',
      confirm: 'Confirmer',
      success: 'Opération réussie',
      error: 'Une erreur est survenue',
      yes: 'Oui',
      no: 'Non',
      none: 'Aucun',
      optional: 'Optionnel',
      required: 'Requis',
      date: 'Date',
      time: 'Heure',
      location: 'Emplacement',
      statusLabel: 'État',
      actionsLabel: 'Actions',
      details: 'Détails',
      total: 'Total',
      active: 'Actif',
      inactive: 'Inactif',
      apply: 'Appliquer les filtres',
      reset: 'Réinitialiser',
      refresh: 'Actualiser le flux',
      noData: 'Aucune donnée trouvée'
    },
    nav: {
      dashboard: 'Tableau de bord',
      liveMap: 'Carte GPS en direct',
      liveTracking: 'Carte GPS en direct',
      vehicles: 'Véhicules & Flotte',
      trackers: 'Balises GPS Matérielles',
      trips: 'Trajets & Replay',
      tripsHistory: 'Trajets & Replay',
      geofences: 'Géozones',
      alerts: 'Alertes & Événements',
      reports: 'Générateur de Rapports',
      modulesHub: 'Modules de Fonctionnalités',
      carRental: 'Location de Voitures',
      fuelIntelligence: 'Intelligence Carburant',
      coldChain: 'Chaîne du Froid & HACCP',
      liveSharing: 'Partage Trajet & ETA',
      predictiveMaintenance: 'Maintenance Prédictive',
      invoicing: 'Facturation & Devis PDF',
      organizations: 'Organisations & Tenants',
      usersRbac: 'Utilisateurs & Droits',
      apiExplorer: 'API REST & WebSockets',
      settings: 'Paramètres Système',
      coreGroup: 'Télématique Principale',
      modulesGroup: 'Modules Métiers Spécialisés',
      adminGroup: 'Gouvernance & Multi-Tenancy'
    },
    auth: {
      signInTitle: 'Connexion à FlotteMaestro',
      signInSubtitle: 'Passerelle d’Entreprise et Synchronisation Télématique Multi-Tenants',
      emailLabel: 'Adresse Email Professionnelle',
      emailPlaceholder: 'operateur@flottemaestro.io',
      passwordLabel: 'Mot de Passe d’Accès',
      passwordPlaceholder: '••••••••••••',
      rememberWorkstation: 'Mémoriser ce poste sécurisé pendant 30 jours',
      forgotPassword: 'Mot de passe oublié ?',
      signInButton: 'S’authentifier & Accéder au Portail',
      authenticating: 'Établissement du canal sécurisé TLS 1.3...',
      quickDemoAccounts: 'Sélecteur de Rôle Démo (Connexion en 1 Clic)',
      superAdminRole: 'Super Administrateur (Root)',
      orgOwnerRole: 'Propriétaire d’Organisation',
      fleetManagerRole: 'Gestionnaire de Flotte',
      driverRole: 'Chauffeur Terrain (Mobile)',
      selectTenant: 'Organisation / Tenant Cible',
      allTenantsAccess: 'Accès Global et Supervision Multi-Tenants',
      orContinueWithSSO: 'ou connexion via Authentification Unique SSO',
      biometricSignIn: 'Biométrie Touch ID / Face ID',
      biometricScanPrompt: 'Touchez le capteur ou utilisez Face ID pour vous connecter',
      biometricScanning: 'Vérification de l’enclave sécurisée matérielle...',
      biometricSuccess: 'Authentification biométrique réussie',
      pinSignIn: 'Code PIN Chauffeur Rapide',
      enterDriverPin: 'Saisissez le PIN terminal du véhicule (4 chiffres)',
      pinPlaceholder: '••••',
      invalidCredentials: 'Échec de l’authentification. Veuillez vérifier vos identifiants ou votre code PIN.',
      signOut: 'Déconnexion',
      profile: 'Profil Utilisateur & Sécurité',
      securityBanner: 'Certifié SOC2 Type II • Ingestion TLS 1.3 256 bits • Synchronisation GPS Temps Réel',
      switchUser: 'Changer de compte',
      viewLoginPreview: 'Aperçu Page de Connexion',
      backToDashboard: 'Retour au Tableau de Bord'
    },
    modes: {
      webAdmin: 'Portail Web Admin & Flotte',
      mobileApp: 'Application Mobile (Flutter)',
      apiDeveloper: 'API REST & Passerelle'
    },
    status: {
      moving: 'En mouvement',
      idle: 'Ralenti (Moteur allumé)',
      stopped: 'À l’arrêt',
      offline: 'Hors ligne',
      active: 'Actif',
      expiring: 'Expire bientôt',
      expired: 'Expiré',
      suspended: 'Suspendu',
      available: 'Disponible à la location',
      rented: 'En cours de location',
      maintenance: 'En maintenance atelier',
      returned: 'Retourné & Inspecté',
      confirmed: 'Confirmé',
      pending: 'En attente de validation',
      cancelled: 'Annulé',
      resolved: 'Résolu',
      investigating: 'En cours d’enquête',
      critical: 'Alerte Critique',
      warning: 'Avertissement',
      info: 'Information',
      in_service: 'En service',
      overdue: 'En retard',
      online: 'Flux en direct'
    },
    metrics: {
      totalVehicles: 'Total Flotte',
      movingVehicles: 'En circulation',
      idleVehicles: 'Au ralenti',
      stoppedVehicles: 'Stationnés',
      offlineVehicles: 'Sans signal',
      activeTrackers: 'Balises en ligne',
      unreadAlerts: 'Alertes actives',
      activeGeofences: 'Zones définies',
      speed: 'Vitesse',
      odometer: 'Kilométrage',
      battery: 'Batterie interne',
      voltage: 'Tension véhicule',
      satellites: 'Satellites GNSS',
      ignition: 'Contact Moteur',
      lastSeen: 'Dernière émission',
      driver: 'Conducteur assigné',
      fleet: 'Sous-flotte',
      plan: 'Formule d’abonnement',
      fuelLevel: 'Niveau Réservoir',
      temperature: 'Température Frigo',
      humidity: 'Humidité Citerne',
      dtcCodes: 'Codes Défauts OBD',
      engineLoad: 'Charge Moteur Calculée',
      coolantTemp: 'Température Liquide Refroidissement',
      rpm: 'Régime Moteur (Tr/min)',
      distanceToday: 'Distance du Jour',
      drivingTime: 'Temps de Conduite',
      idleDuration: 'Temps de Ralenti'
    },
    actions: {
      addVehicle: 'Ajouter un véhicule',
      addTracker: 'Déclarer une balise',
      addGeofence: 'Nouvelle géozone',
      generateReport: 'Générer un rapport',
      searchVehicles: 'Rechercher par immatriculation, marque, modèle...',
      filterByStatus: 'Filtrer par état',
      followVehicle: 'Suivre le véhicule',
      viewHistory: 'Rejouer le trajet',
      playRoute: 'Démarrer le Replay',
      pauseRoute: 'Pause',
      exportPdf: 'Exporter PDF',
      exportExcel: 'Exporter Excel (XLSX)',
      liveSimulation: 'Flux GPS Temps Réel',
      simulateTrip: 'Simuler le déplacement',
      triggerOverspeed: 'Déclencher excès de vitesse',
      triggerGeofence: 'Déclencher entrée géozone',
      resetDemo: 'Réinitialiser la télémétrie',
      decodeVin: 'Décoder le VIN & Autocompléter',
      saveChanges: 'Enregistrer les modifications',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      assignTracker: 'Assigner la balise',
      unassign: 'Détacher',
      markAsRead: 'Marquer comme lu',
      viewDetails: 'Inspecteur Véhicule',
      immobilize: 'Immobiliser le véhicule (Coupure Relais)',
      restoreEngine: 'Rétablir le démarreur',
      remoteCommand: 'Envoyer commande descendante',
      unlockDoors: 'Déverrouiller les portes',
      lockDoors: 'Verrouiller les portes',
      refresh: 'Actualiser la télémétrie',
      filter: 'Appliquer les filtres',
      search: 'Rechercher des véhicules',
      download: 'Télécharger le fichier',
      share: 'Partager le lien public',
      close: 'Fermer la fenêtre',
      save: 'Enregistrer',
      submit: 'Valider le formulaire',
      clearAll: 'Vider le journal',
      simulateTheft: 'Simuler vol de carburant (Siphonnage)',
      simulateTempSpike: 'Simuler rupture thermique Frigo',
      simulateDtc: 'Simuler code défaut OBD-II'
    },
    geofence: {
      circle: 'Zone circulaire (Rayon)',
      polygon: 'Zone polygonale libre',
      radius: 'Rayon (Mètres)',
      speedLimit: 'Vitesse limite dans la zone (km/h)',
      zoneName: 'Nom de la géozone',
      enterAlert: 'Alerter à l’entrée de zone',
      exitAlert: 'Alerter à la sortie de zone',
      color: 'Couleur d’affichage',
      description: 'Description du périmètre',
      createGeofence: 'Créer un périmètre géographique',
      activeZones: 'Périmètres géographiques actifs',
      zoneType: 'Géométrie de la zone',
      drawInstructions: 'Cliquez sur la carte pour définir les sommets ou le rayon',
      polygonPoints: 'Coordonnées des sommets',
      saveZone: 'Enregistrer la géozone'
    },
    mobile: {
      deviceFrame: 'Aperçu Appareil',
      iphone: 'iPhone 16 Pro',
      pixel: 'Google Pixel 9',
      fullScreen: 'Plein écran fluide',
      overview: 'Aperçu de la flotte',
      quickMap: 'Radar en direct',
      recentAlerts: 'Flux d’alertes direct',
      liveCompass: 'Cap directionnel',
      tapToFollow: 'Touchez un véhicule pour suivre sa trajectoire',
      myVehicle: 'Mon Camion Assigné',
      driverLogs: 'Heures de Service Conducteur',
      remoteControls: 'Commandes Terminal',
      tripsToday: 'Missions du Jour',
      emergencySos: 'Signal de Détresse SOS',
      vehicleLocked: 'Portes Verrouillées',
      vehicleUnlocked: 'Portes Déverrouillées'
    },
    api: {
      swaggerTitle: 'Documentation Interactive OpenAPI 3.0',
      tryItOut: 'Tester l’endpoint',
      execute: 'Exécuter la requête',
      response: 'Réponse JSON en direct',
      streamTitle: 'Pipeline Télémétrie & Flux WebSocket',
      realtimePackets: 'Flux GPS normalisé (Adaptateur Traccar)',
      traccarAdapterFlow: 'Décodeurs Traccar → Pipeline d’événements → WebSocket Client',
      endpoints: 'Points de terminaison REST',
      authHeader: 'Jeton d’autorisation Bearer',
      samplePayload: 'Exemple de charge utile',
      clearLog: 'Effacer l’historique des paquets',
      liveWsStream: 'Flux WebSocket en direct',
      pauseStream: 'Mettre en pause le flux',
      resumeStream: 'Reprendre le flux'
    },
    modulesHub: {
      title: 'Modules de Fonctionnalités & Add-Ons Métiers',
      subtitle: 'Activez des solutions spécialisées : Location de voitures, Télémétrie Carburant, Chaîne du froid HACCP et Partage ETA',
      allModules: 'Tous les modules disponibles',
      unlockedOnly: 'Modules actifs',
      lockedOnly: 'Modules à débloquer',
      enableModule: 'Activer le module',
      disableModule: 'Désactiver',
      includedInPlan: 'Inclus dans votre formule',
      monthlyCost: 'Abonnement mensuel',
      perVehicle: '/ véhicule / mois',
      launchModule: 'Ouvrir l’espace du module',
      moduleActive: 'Opérationnel',
      moduleInactive: 'Inactif',
      addOnsSummary: 'Budget Add-Ons Métiers',
      selectOrganization: 'Organisation cible',
      estimatedAddonSpend: 'Coût estimé des modules',
      activeAddonsCount: 'Modules actifs'
    },
    carRental: {
      title: 'Gestion Location de Voitures & Anti-Démarrage',
      subtitle: 'Contrats dématérialisés, fiches d’inspection carrosserie, gestion des cautions et coupure moteur à distance',
      availableVehicles: 'Parc & Disponibilité',
      reservations: 'Réservations en attente',
      contracts: 'Contrats en cours',
      returns: 'Retours & Inspection dégâts',
      analytics: 'Revenus & Taux d’utilisation',
      immobilizer: 'Anti-Démarrage Relais à Distance',
      cutRelay: 'Couper le Relais Démarreur',
      restoreRelay: 'Rétablir le Démarreur',
      digitalInspection: 'Fiche Numérique Dégâts 360°',
      contractNumber: 'N° Contrat',
      dailyRate: 'Tarif journalier (DH / $)',
      depositAmount: 'Caution / Dépôt de garantie',
      totalRevenue: 'Revenus générés',
      activeContracts: 'Contrats actifs en circulation',
      fuelAtReturn: 'Niveau carburant au retour (%)',
      mileageAtReturn: 'Kilométrage au retour (km)',
      damageChecklist: 'Points de dommage relevés',
      customerSignature: 'Signature électronique client',
      odometerStart: 'Kilométrage départ',
      odometerEnd: 'Kilométrage retour',
      newContract: 'Établir un nouveau contrat',
      viewContract: 'Voir le contrat PDF',
      closeContract: 'Clôturer la restitution',
      customerName: 'Nom du locataire',
      customerPhone: 'Téléphone de contact',
      rentalPeriod: 'Période de location',
      relayStatus: 'État du relais démarreur',
      engineCutConfirmed: 'Relais coupé avec succès. Le démarreur est neutralisé.',
      engineResumedConfirmed: 'Relais rétabli avec succès. Le véhicule peut démarrer.',
      relayDisabledWarning: 'La coupure moteur s’effectue par liaison descendante sécurisée. À utiliser véhicule stationné.',
      markDamage: 'Cliquez sur le schéma pour placer un repère de rayure ou choc',
      inspectionReport: 'Générer le procès-verbal de restitution'
    },
    fuelIntelligence: {
      title: 'Intelligence Carburant & Détection de Siphonnage',
      subtitle: 'Capteurs ultrasons temps réel, algorithme anti-siphonnage, traçabilité des pleins et éco-conduite',
      siphoningAlerts: 'Radar Vols & Siphonnages',
      refuelingLogs: 'Historique des Pleins & Stations',
      ecoDrivingScores: 'Éco-Conduite & Classement Chauffeurs',
      totalLostLiters: 'Volume total dérobé estimé',
      estimatedLoss: 'Préjudice financier',
      activeSiphonAlarms: 'Alarmes Siphonnage Actives',
      fuelDropEvent: 'Chute anormale de niveau (>15L)',
      tankLevel: 'Niveau de jauge actuel',
      antiTheftRadar: 'Surveillance Acoustique & Pression',
      simulateSiphon: 'Simuler un siphonnage',
      consumptionRate: 'Consommation moyenne (L/100km)',
      fuelTheftDetected: 'ALERTE VOL DE CARBURANT DÉTECTÉE',
      investigate: 'Localiser l’incident',
      confirmTheft: 'Confirmer le vol & Alerter la direction',
      driverRanking: 'Tableau d’Honneur Éco-Conduite',
      harshAcceleration: 'Accélérations brusques',
      excessiveIdling: 'Gaspillage au ralenti',
      fuelGraphTitle: 'Courbe continue de niveau de carburant (24h)',
      recentRefuels: 'Transactions de ravitaillement vérifiées',
      siphonIncidentFeed: 'Incidents suspects de siphonnage'
    },
    coldChain: {
      title: 'Chaîne du Froid & Conformité HACCP',
      subtitle: 'Sondes de température sans fil BLE, ruptures thermiques, état d’ouverture des portes et rapports d’audit',
      liveSensorFeed: 'Télémétrie Groupe Frigo en direct',
      haccpAudit: 'Rapport de Conformité HACCP',
      temperatureExcursions: 'Alertes Rupture de Température',
      cargoType: 'Type de marchandise transportée',
      targetTempRange: 'Plage thermique requise',
      currentTemp: 'Température mesurée',
      doorStatus: 'État des portes du caisson',
      defrostCycle: 'Cycle de dégivrage actif',
      complianceRate: 'Taux de conformité HACCP',
      pharmaGrade: 'Produits Pharmaceutiques (+2°C à +8°C)',
      freshProduce: 'Fruits & Légumes frais (+4°C à +10°C)',
      frozenMeat: 'Surgelés & Viandes (-25°C à -18°C)',
      reeferUnit: 'Groupe ThermoKing / Carrier',
      simulateExcursion: 'Simuler rupture thermique',
      criticalSpike: 'PIC DE TEMPÉRATURE CRITIQUE DÉTECTÉ',
      generateHaccpReport: 'Télécharger Rapport HACCP PDF',
      tempGraphTitle: 'Courbe thermique & cycles de dégivrage',
      excursionSummary: 'Historique des dépassements de seuil'
    },
    liveSharing: {
      title: 'Partage de Trajet en Direct & Preuve de Livraison (e-POD)',
      subtitle: 'Générez des liens de suivi client sécurisés, trajectoire en direct, notifications WhatsApp et signature électronique',
      activeLinks: 'Liens de suivi client actifs',
      generateLink: 'Générer un lien de suivi en direct',
      recipientName: 'Nom du destinataire / Client',
      destination: 'Adresse de livraison',
      estimatedArrival: 'Heure estimée d’arrivée (ETA)',
      liveTrajectory: 'Trajectoire et position en temps réel',
      shareViaWhatsapp: 'Envoyer par WhatsApp',
      copyLink: 'Copier l’URL sécurisée',
      pinProtected: 'Protection par code PIN (4 chiffres)',
      linkExpiresIn: 'Expiration du lien de suivi',
      deliveryCompleted: 'Colis livré & validé',
      electronicPod: 'Preuve de Livraison Électronique (e-POD)',
      recipientSignature: 'Capture de la signature client',
      proofOfDelivery: 'Télécharger le bon de livraison émargé',
      linkCopied: 'Lien de suivi copié dans le presse-papiers !',
      trackingUrl: 'URL de suivi publique'
    },
    predictiveMaintenance: {
      title: 'Maintenance Prédictive & Diagnostics OBD-II',
      subtitle: 'Lecture des codes défauts CAN-bus (DTC), usure des plaquettes et de l’huile, et planification d’atelier',
      obdScanner: 'Scanner Télématique CAN-Bus / OBD-II',
      dtcTroubleCodes: 'Codes Défauts Moteur (DTC)',
      serviceSchedule: 'Planning d’Entretien Préventif',
      oilLifeRemaining: 'Durée de vie restante de l’huile',
      brakePadWear: 'Indice d’usure des plaquettes',
      tireHealth: 'Pression & Sculpture des pneus',
      batteryHealth: 'État de santé batterie & alternateur',
      diagnosticTerminal: 'Terminal de commandes OBD-II',
      clearCodes: 'Effacer la mémoire défauts (Reset Voyant)',
      scheduleService: 'Planifier un passage en atelier',
      criticalAlert: 'Défaut moteur critique détecté',
      componentHealth: 'Matrice de longévité des pièces',
      nextServiceAt: 'Prochaine révision majeure',
      engineDiagnostics: 'Diagnostics Powertrain en direct',
      faultCodeCleared: 'Codes défauts effacés de la mémoire ECU'
    },
    organizations: {
      title: 'Organisations & Gestion Multi-Tenants',
      subtitle: 'Administration des clients entreprises, quotas de véhicules, licences balises et étanchéité des données',
      allTenants: 'Toutes les organisations clientes',
      addTenant: 'Créer une nouvelle organisation',
      tenantName: 'Nom de l’entreprise',
      city: 'Ville du siège',
      planName: 'Formule d’abonnement',
      maxVehicles: 'Quota maximum de véhicules',
      activeTrackers: 'Balises matérielles associées',
      billingCycle: 'Cycle de facturation',
      storageUsed: 'Rétention des données GPS',
      apiCalls: 'Appels API mensuels',
      switchTenant: 'Basculer sur cette organisation',
      tenantDetails: 'Fiche Entreprise & Quotas',
      subscriptionLimits: 'Limites d’abonnement'
    },
    usersRbac: {
      title: 'Utilisateurs & Contrôle d’Accès (RBAC)',
      subtitle: 'Gestion des rôles, matrice de permissions granulaires et simulateur de profil en temps réel',
      teamMembers: 'Membres de l’équipe',
      addUser: 'Inviter un collaborateur',
      role: 'Rôle attribué',
      permissions: 'Permissions système',
      customPermissions: 'Droits personnalisés',
      lastActive: 'Dernière session active',
      simulateRole: 'Tester l’interface sous ce rôle',
      superAdmin: 'Super Administrateur (Root)',
      orgOwner: 'Propriétaire d’Organisation',
      fleetManager: 'Gestionnaire de Flotte',
      driver: 'Chauffeur Terrain',
      allTenantsAccess: 'Accès Multi-Tenants Global',
      editUser: 'Modifier les autorisations',
      deleteUser: 'Révoquer l’accès',
      permissionsMatrix: 'Matrice des privilèges'
    },
    settings: {
      title: 'Paramètres Système Traccar & Passerelles',
      subtitle: 'Configuration des décodeurs matériels, ports d’écoute, buffers GPS, webhooks et clés d’API de géocodage',
      traccarGateways: 'Décodeurs & Ports Traccar',
      activeProtocols: 'Protocoles GPS Pris en Charge',
      serverPort: 'Port d’ingestion télématique',
      gpsIngestionInterval: 'Fréquence d’émission standard (sec)',
      bufferCapacity: 'Mémoire tampon hors-ligne (paquets)',
      webhookEndpoints: 'Webhooks de notification',
      geocoderApiKey: 'Clé d’API du géocodeur inverse',
      downlinkQueue: 'Gestionnaire de commandes descendantes',
      saveParameters: 'Enregistrer les paramètres',
      protocolConfig: 'Configuration des adaptateurs',
      systemHealth: 'État du cluster de réception Traccar',
      parametersSaved: 'Paramètres système mis à jour avec succès.'
    },
    reports: {
      title: 'Studio de Rapports & Analyses de Flotte',
      subtitle: 'Générez des rapports PDF / Excel complets : trajets, kilométrages fiscaux, carburant et sécurité de conduite',
      tripSummary: 'Synthèse des trajets journaliers',
      mileageLog: 'Journal kilométrique & fiscal',
      fuelAudit: 'Audit carburant & siphonnage',
      driverBehavior: 'Sécurité routière & Éco-conduite',
      geofenceLog: 'Historique des entrées / sorties de géozones',
      dateRange: 'Période du rapport',
      selectVehicles: 'Sélection des véhicules',
      generateReport: 'Générer le rapport',
      recentReports: 'Archives des rapports générés',
      downloadPdf: 'Télécharger le rapport PDF',
      downloadExcel: 'Télécharger Excel (.xlsx)',
      reportFormat: 'Format du document',
      generating: 'Compilation des données de télémétrie...'
    },
    trips: {
      title: 'Historique des Trajets & Replay du Parcours',
      subtitle: 'Rejouez les parcours passés avec télémétrie de vitesse, arrêts moteur et profil altimétrique',
      selectTrip: 'Sélectionner un trajet',
      tripPlayback: 'Lecteur Replay du trajet',
      playbackSpeed: 'Vitesse de relecture',
      distance: 'Distance totale du parcours',
      duration: 'Durée du déplacement',
      avgSpeed: 'Vitesse moyenne',
      maxSpeed: 'Vitesse maximale atteinte',
      startLocation: 'Point de départ',
      endLocation: 'Point d’arrivée',
      stops: 'Arrêts et stationnements détectés',
      elevationProfile: 'Profil altimétrique',
      timeline: 'Ligne temporelle du trajet',
      scrubber: 'Curseur de position',
      replayRoute: 'Lancer l’animation'
    },
    trackers: {
      title: 'Balises GPS & Inventaire Matériel',
      subtitle: 'Gestion des boîtiers télématiques (Teltonika, Queclink, Coban, Suntech), cartes SIM M2M et commandes SMS/GPRS',
      registeredTrackers: 'Balises GPS enregistrées',
      registerTracker: 'Déclarer un nouveau boîtier GPS',
      imei: 'Numéro IMEI de la balise',
      protocol: 'Protocole de communication',
      simCard: 'Numéro SIM M2M (MSISDN)',
      signalStrength: 'Qualité du signal GSM',
      assignedVehicle: 'Véhicule associé',
      lastPing: 'Dernier signal reçu',
      firmware: 'Version du firmware',
      downlinkCommands: 'Console de commandes descendantes',
      sendDownlink: 'Envoyer commande GPRS / SMS',
      trackerStatus: 'État de connexion'
    },
    alertsView: {
      title: 'Flux d’Alertes & Incidents de Sécurité',
      subtitle: 'Traitement en temps réel : Excès de vitesse, sortie de zone, bouton SOS, siphonnage et défauts moteur OBD',
      allAlerts: 'Tous les événements',
      unreadOnly: 'Alertes non traitées',
      criticalOnly: 'Alertes critiques uniquement',
      markAllRead: 'Tout marquer comme acquitté',
      severity: 'Niveau de gravité',
      triggerReason: 'Motif du déclenchement',
      vehicle: 'Véhicule concerné',
      time: 'Date & Heure',
      location: 'Coordonnées de l’incident',
      resolveAlert: 'Marquer comme résolu',
      assignToDriver: 'Notifier le conducteur',
      alertDetails: 'Fiche d’incident détaillée'
    },
    vehicleDetail: {
      title: 'Inspecteur Véhicule & Télémétrie CAN-Bus',
      specs: 'Caractéristiques du véhicule',
      liveSensors: 'Matrice des capteurs en direct',
      engineDiagnostics: 'Télémétrie Moteur & Calculateur ECU',
      remoteRelay: 'Commande Anti-Démarrage Relais',
      dtcCodes: 'Codes défauts de diagnostic (DTC)',
      odometer: 'Compteur kilométrique',
      voltage: 'Tension batterie véhicule',
      battery: 'Batterie de secours balise',
      speed: 'Vitesse instantanée',
      rpm: 'Régime moteur',
      coolant: 'Température du moteur',
      fuelTank: 'Capacité réservoir carburant',
      lastPosition: 'Dernière position connue',
      driver: 'Conducteur assigné',
      sendDownlink: 'Envoyer commande descendante',
      replayTrip: 'Rejouer les trajets récents',
      engineCutoff: 'Couper le démarreur (Immobilisation)',
      engineResume: 'Rétablir le démarreur'
    },
    vehicleCatalog: {
      title: 'Ajout de Véhicule & Association Balise',
      subtitle: 'Décodage automatique du numéro VIN, spécifications techniques et appairage avec une balise GPS',
      vinDecoder: 'Décodeur automatique de numéro VIN',
      enterVin: 'Saisir le code VIN (17 caractères)',
      decode: 'Décoder le VIN',
      make: 'Marque constructeur',
      model: 'Modèle du véhicule',
      year: 'Année de mise en circulation',
      licensePlate: 'Immatriculation officielle',
      trackerSelect: 'Associer une balise GPS',
      fuelType: 'Motorisation / Carburant',
      category: 'Catégorie de véhicule',
      addVehicleBtn: 'Enregistrer le véhicule dans la flotte',
      decodingVin: 'Interrogation de la base mondiale VIN...'
    }
  },
  ar: {
    appName: 'فلوت مايسترو (FlotteMaestro)',
    tagline: 'المنصة الاحترافية المتكاملة لإدارة وتتبع أساطيل المركبات بالـ GPS',
    common: {
      loading: 'جاري تحميل بيانات التتبع...',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      filter: 'تصفية',
      search: 'بحث...',
      all: 'الكل',
      export: 'تصدير',
      download: 'تحميل',
      close: 'إغلاق',
      view: 'عرض',
      confirm: 'تأكيد',
      success: 'تمت العملية بنجاح',
      error: 'حدث خطأ في النظام',
      yes: 'نعم',
      no: 'لا',
      none: 'لا يوجد',
      optional: 'اختياري',
      required: 'إلزامي',
      date: 'التاريخ',
      time: 'الوقت',
      location: 'الموقع الجغرافي',
      statusLabel: 'الحالة',
      actionsLabel: 'الإجراءات',
      details: 'التفاصيل',
      total: 'الإجمالي',
      active: 'نشط',
      inactive: 'غير نشط',
      apply: 'تطبيق الفلاتر',
      reset: 'إعادة ضبط',
      refresh: 'تحديث البيانات',
      noData: 'لا توجد سجلات متطابقة'
    },
    nav: {
      dashboard: 'لوحة القيادة',
      liveMap: 'الخريطة الحية (GPS)',
      liveTracking: 'الخريطة والتتبع المباشر',
      vehicles: 'المركبات والأسطول',
      trackers: 'أجهزة التتبع (Balises)',
      trips: 'الرحلات وإعادة المسار',
      tripsHistory: 'الرحلات وإعادة المسار',
      geofences: 'المناطق الجغرافية',
      alerts: 'التنبيهات والأحداث',
      reports: 'استخراج التقارير',
      modulesHub: 'حزمة الوحدات والميزات',
      carRental: 'تأجير السيارات والتتابع',
      fuelIntelligence: 'إدارة ومراقبة الوقود',
      coldChain: 'سلسلة التبريد و HACCP',
      liveSharing: 'مشاركة الوصول الحي ETA',
      predictiveMaintenance: 'الصيانة التنبؤية',
      invoicing: 'الفواتير والمحاسبة PDF',
      organizations: 'المؤسسات والشركات',
      usersRbac: 'المستخدمون والصلاحيات',
      apiExplorer: 'واجهة البرمجة (REST API)',
      settings: 'إعدادات النظام',
      coreGroup: 'التتبع والتيلومتري الأساسي',
      modulesGroup: 'الوحدات الميدانية التخصصية',
      adminGroup: 'إدارة النظام والشركات'
    },
    auth: {
      signInTitle: 'تسجيل الدخول إلى فلوت مايسترو',
      signInSubtitle: 'بوابة تتبع الأساطيل ومزامنة التيلومتري متعددة الشركات للمؤسسات',
      emailLabel: 'البريد الإلكتروني المهني',
      emailPlaceholder: 'operator@flottemaestro.io',
      passwordLabel: 'كلمة المرور',
      passwordPlaceholder: '••••••••••••',
      rememberWorkstation: 'تذكر جهاز العمل هذا لمدة 30 يوماً',
      forgotPassword: 'نسيت كلمة المرور؟',
      signInButton: 'المصادقة والدخول إلى النظام',
      authenticating: 'جاري إنشاء قناة تواصل مشفرة TLS 1.3...',
      quickDemoAccounts: 'المصادقة السريعة لاختبار الأدوار (دخول بنقرة واحدة)',
      superAdminRole: 'المسؤول العام للنظام (Super Admin)',
      orgOwnerRole: 'مالك الشركة (Owner)',
      fleetManagerRole: 'مدير عمليات الأسطول',
      driverRole: 'سائق ميداني (تطبيق الهاتف)',
      selectTenant: 'المؤسسة / الشركة الهدف',
      allTenantsAccess: 'إشراف عام وصلاحية الدخول لكافة الشركات',
      orContinueWithSSO: 'أو تسجيل الدخول الموحد للمؤسسات (SSO)',
      biometricSignIn: 'المصادقة البيومترية (بصمة / Face ID)',
      biometricScanPrompt: 'المس مستشعر البصمة أو استخدم Face ID لتسجيل الدخول',
      biometricScanning: 'جاري التحقق من المعالج الآمن للجهاز...',
      biometricSuccess: 'تمت المصادقة البيومترية بنجاح',
      pinSignIn: 'رمز PIN السائق السريع',
      enterDriverPin: 'أدخل رمز PIN المكون من 4 أرقام للمركبة',
      pinPlaceholder: '••••',
      invalidCredentials: 'فشلت المصادقة. يرجى التحقق من بيانات الاعتماد أو رمز PIN.',
      signOut: 'تسجيل الخروج',
      profile: 'الملف الشخصي والأمان',
      securityBanner: 'معتمد وفق معايير SOC2 Type II • قناة استقبال مشفرة TLS 1.3 • مزامنة حية وفورية بالـ GPS',
      switchUser: 'تبديل الحساب',
      viewLoginPreview: 'معاينة صفحة تسجيل الدخول',
      backToDashboard: 'العودة إلى لوحة القيادة الحية'
    },
    modes: {
      webAdmin: 'بوابة الويب والإدارة',
      mobileApp: 'تطبيق الهاتف (Flutter)',
      apiDeveloper: 'بوابة المطورين و REST API'
    },
    status: {
      moving: 'في حركة',
      idle: 'محرك يعمل متوقف (Ralenti)',
      stopped: 'متوقفة',
      offline: 'غير متصلة',
      active: 'نشط',
      expiring: 'ينتهي قريباً',
      expired: 'منتهي',
      suspended: 'معلق',
      available: 'متاحة للإيجار',
      rented: 'قيد التأجير حالياً',
      maintenance: 'في الصيانة وورشة العمل',
      returned: 'تم إرجاعها وفحصها',
      confirmed: 'مؤكد',
      pending: 'قيد المراجعة والموافقة',
      cancelled: 'ملغي',
      resolved: 'تمت المعالجة',
      investigating: 'قيد التحقيق والتدقيق',
      critical: 'تنبيه حرج',
      warning: 'تحذير',
      info: 'معلومة',
      in_service: 'في الخدمة',
      overdue: 'متأخر عن الموعد',
      online: 'بث حي مباشر'
    },
    metrics: {
      totalVehicles: 'إجمالي الأسطول',
      movingVehicles: 'متحركة الآن',
      idleVehicles: 'في وضع الخمول',
      stoppedVehicles: 'متوقفة',
      offlineVehicles: 'بدون إشارة',
      activeTrackers: 'أجهزة متصلة',
      unreadAlerts: 'تنبيهات نشطة',
      activeGeofences: 'المناطق المحددة',
      speed: 'السرعة',
      odometer: 'العداد الكيلومتري',
      battery: 'البطارية الداخلية',
      voltage: 'جهد المركبة',
      satellites: 'أقمار GNSS',
      ignition: 'تشغيل المحرك',
      lastSeen: 'آخر بث حي',
      driver: 'السائق المعين',
      fleet: 'الأسطول الفرعي',
      plan: 'باقة الاشتراك',
      fuelLevel: 'مستوى خزان الوقود',
      temperature: 'حرارة الحاوية المبردة',
      humidity: 'رطوبة التبريد',
      dtcCodes: 'أعطال كمبيوتر OBD',
      engineLoad: 'الحمل المحسوب للمحرك',
      coolantTemp: 'حرارة سائل التبريد',
      rpm: 'دوران المحرك (د/د)',
      distanceToday: 'مسافة اليوم',
      drivingTime: 'ساعات القيادة',
      idleDuration: 'مدة تشغيل الخمول'
    },
    actions: {
      addVehicle: 'إضافة مركبة',
      addTracker: 'تسجيل جهاز تتبع',
      addGeofence: 'إضافة منطقة جغرافية',
      generateReport: 'استخراج تقرير',
      searchVehicles: 'بحث برقم اللوحة، النوع، السائق...',
      filterByStatus: 'تصفية حسب الحالة',
      followVehicle: 'متابعة حركة المركبة',
      viewHistory: 'إعادة عرض المسار',
      playRoute: 'تشغيل الإعادة',
      pauseRoute: 'إيقاف مؤقت',
      exportPdf: 'تصدير PDF',
      exportExcel: 'تصدير Excel (XLSX)',
      liveSimulation: 'بث GPS المباشر',
      simulateTrip: 'محاكاة حركة المسار',
      triggerOverspeed: 'محاكاة تجاوز السرعة',
      triggerGeofence: 'محاكاة دخول منطقة',
      resetDemo: 'إعادة ضبط التتبع',
      decodeVin: 'فك رمز VIN تلقائياً',
      saveChanges: 'حفظ التعديلات',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      assignTracker: 'ربط الجهاز بالمركبة',
      unassign: 'فصل الربط',
      markAsRead: 'تحديد كمقروء',
      viewDetails: 'فحص تفاصيل المركبة',
      immobilize: 'إيقاف المحرك عن بعد (قطع المرحل)',
      restoreEngine: 'إعادة تشغيل المحرك',
      remoteCommand: 'إرسال أمر تحكم مباشر',
      unlockDoors: 'فتح أقفال الأبواب',
      lockDoors: 'إغلاق أقفال الأبواب',
      refresh: 'تحديث بيانات التتبع',
      filter: 'تطبيق التصفية',
      search: 'بحث في الأسطول',
      download: 'تحميل الملف',
      share: 'مشاركة الرابط المباشر',
      close: 'إغلاق النافذة',
      save: 'حفظ البيانات',
      submit: 'إرسال النموذج',
      clearAll: 'مسح كافة السجلات',
      simulateTheft: 'محاكاة سرقة وقود (سحب مفاجئ)',
      simulateTempSpike: 'محاكاة ارتفاع حرارة التبريد',
      simulateDtc: 'محاكاة عطل محرك OBD-II'
    },
    geofence: {
      circle: 'منطقة دائرية (نصف قطر)',
      polygon: 'منطقة مضلعة حرة',
      radius: 'نصف القطر (أمتار)',
      speedLimit: 'السرعة المسموحة بالمنطقة (كم/س)',
      zoneName: 'اسم المنطقة الجغرافية',
      enterAlert: 'تنبيه عند الدخول',
      exitAlert: 'تنبيه عند الخروج',
      color: 'لون عرض المنطقة',
      description: 'وصف الحدود الجغرافية',
      createGeofence: 'إنشاء حدود جغرافية جديدة',
      activeZones: 'المناطق الجغرافية المفعلة',
      zoneType: 'نوع الشكل الهندسي',
      drawInstructions: 'انقر على الخريطة لتحديد النقاط أو مركز الدائرة',
      polygonPoints: 'إحداثيات نقاط المضلع',
      saveZone: 'حفظ المنطقة الجغرافية'
    },
    mobile: {
      deviceFrame: 'معاينة الهاتف',
      iphone: 'آيفون 16 برو',
      pixel: 'جوجل بكسل 9',
      fullScreen: 'ملء الشاشة التفاعلي',
      overview: 'نظرة عامة على الأسطول',
      quickMap: 'الرادار المباشر',
      recentAlerts: 'شريط التنبيهات الحية',
      liveCompass: 'اتجاه الحركة',
      tapToFollow: 'اضغط على المركبة لمتابعتها على الخريطة',
      myVehicle: 'الشاحنة المخصصة لي',
      driverLogs: 'سجل ساعات عمل السائق',
      remoteControls: 'لوحة التحكم عن بعد',
      tripsToday: 'مهام ورحلات اليوم',
      emergencySos: 'إرسال نداء استغاثة SOS',
      vehicleLocked: 'الأبواب مؤمنة',
      vehicleUnlocked: 'الأبواب مفتوحة'
    },
    api: {
      swaggerTitle: 'المواصفات التفاعلية OpenAPI 3.0',
      tryItOut: 'تجربة نقطة النهاية',
      execute: 'إرسال الطلب الفعلي',
      response: 'استجابة JSON المباشرة',
      streamTitle: 'قناة البث اللحظي عبر WebSocket',
      realtimePackets: 'حزم بيانات GPS المعيارية (محول Traccar)',
      traccarAdapterFlow: 'محلل بروتوكولات Traccar ← خط معالجة الأحداث ← بث الويب المباشر',
      endpoints: 'نقاط نهاية واجهة REST المتاحة',
      authHeader: 'رمز المصادقة Bearer Token',
      samplePayload: 'نموذج بيانات الطلب',
      clearLog: 'مسح سجل الحزم الواردة',
      liveWsStream: 'بث WebSocket اللحظي',
      pauseStream: 'إيقاف البث مؤقتاً',
      resumeStream: 'استئناف البث المباشر'
    },
    modulesHub: {
      title: 'حزمة الوحدات والميزات التخصصية',
      subtitle: 'تفعيل الحلول الميدانية: تأجير السيارات والتحكم بالمرحل، مراقبة الوقود، سلسلة التبريد، ومشاركة الوصول الحي',
      allModules: 'كافة الوحدات المتاحة',
      unlockedOnly: 'الوحدات المفعلة',
      lockedOnly: 'الوحدات المتاحة للتفعيل',
      enableModule: 'تفعيل الوحدة',
      disableModule: 'إلغاء التفعيل',
      includedInPlan: 'مشمول في باقة الاشتراك',
      monthlyCost: 'الاشتراك الشهري',
      perVehicle: '/ مركبة / شهرياً',
      launchModule: 'فتح مساحة عمل الوحدة',
      moduleActive: 'مفعل وجاهز',
      moduleInactive: 'غير مفعل',
      addOnsSummary: 'ميزانية الميزات التخصصية',
      selectOrganization: 'المؤسسة المستهدفة',
      estimatedAddonSpend: 'التكلفة الإضافية التقديرية',
      activeAddonsCount: 'الوحدات التخصصية النشطة'
    },
    carRental: {
      title: 'إدارة تأجير السيارات وقفل المحرك عن بعد',
      subtitle: 'عقود رقمية، فحص إلكتروني 360° للأضرار، إدارة الودائع، والتحكم في إيقاف المحرك لمنع السرقة',
      availableVehicles: 'حالة الأسطول والجاهزية',
      reservations: 'الحجوزات المؤكدة',
      contracts: 'العقود السارية',
      returns: 'استرجاع وفحص الأضرار',
      analytics: 'العوائد ومعدل التشغيل',
      immobilizer: 'نظام إيقاف المحرك عن بعد',
      cutRelay: 'قطع مرحل التشغيل (إيقاف المركبة)',
      restoreRelay: 'إعادة وصل مرحل التشغيل',
      digitalInspection: 'فحص رقمي شامل للأضرار 360°',
      contractNumber: 'رقم العقد',
      dailyRate: 'السعر اليومي (درهم / $)',
      depositAmount: 'مبلغ التأمين / الوديعة',
      totalRevenue: 'إجمالي الإيرادات المحققة',
      activeContracts: 'عقود نشطة قيد السير',
      fuelAtReturn: 'مستوى الوقود عند الإرجاع (%)',
      mileageAtReturn: 'عداد المسافة عند الإرجاع (كم)',
      damageChecklist: 'ملاحظات الأضرار والخدوش',
      customerSignature: 'التوقيع الإلكتروني للعميل',
      odometerStart: 'عداد البداية',
      odometerEnd: 'عداد النهاية',
      newContract: 'تحرير عقد إيجار جديد',
      viewContract: 'عرض العقد بصيغة PDF',
      closeContract: 'إتمام الإرجاع وإغلاق العقد',
      customerName: 'اسم المستأجر',
      customerPhone: 'رقم هاتف الاتصال',
      rentalPeriod: 'مدة التأجير',
      relayStatus: 'حالة مرحل المحرك',
      engineCutConfirmed: 'تم قطع مرحل المحرك بنجاح. المركبة معطلة عن التشغيل.',
      engineResumedConfirmed: 'تمت استعادة مرحل المحرك. يمكن تشغيل المركبة الآن.',
      relayDisabledWarning: 'يتم إرسال أمر القطع عبر قناة اتصال آمنة. يرجى التأكد من توقف المركبة.',
      markDamage: 'انقر على مخطط السيارة لتحديد موضع الخدش أو الضرر',
      inspectionReport: 'استخراج محضر الاسترجاع والفحص'
    },
    fuelIntelligence: {
      title: 'إدارة ومراقبة الوقود وكشف السرقات',
      subtitle: 'حساسات التراسونيك لحظية، كشف الانخفاض المفاجئ، إنذارات سحب الوقود، وتقييم القيادة الاقتصادية',
      siphoningAlerts: 'رادار كشف السرقات والسحب',
      refuelingLogs: 'سجل التزود بالوقود والمحطات',
      ecoDrivingScores: 'القيادة الاقتصادية وتقييم السائقين',
      totalLostLiters: 'إجمالي الوقود المسروق التقديري',
      estimatedLoss: 'الخسارة المالية التقديرية',
      activeSiphonAlarms: 'إنذارات سرقة وقود نشطة',
      fuelDropEvent: 'انخفاض مفاجئ في الخزان (>15 لتر)',
      tankLevel: 'مستوى الخزان الحالي',
      antiTheftRadar: 'خوارزمية المراقبة الصوتية والضغط',
      simulateSiphon: 'محاكاة عملية سرقة وسحب وقود',
      consumptionRate: 'معدل الاستهلاك (لتر/100كم)',
      fuelTheftDetected: 'تم رصد إنذار سرقة وقود فوري',
      investigate: 'تحديد موقع الحادثة',
      confirmTheft: 'تأكيد الحادثة وإبلاغ الإدارة',
      driverRanking: 'لوحة شرف القيادة الاقتصادية',
      harshAcceleration: 'التسارع المفاجئ الحاد',
      excessiveIdling: 'هدر الوقود أثناء التوقف',
      fuelGraphTitle: 'مخطط مستوى الوقود اللحظي المستمر (24 ساعة)',
      recentRefuels: 'عمليات التزود المعتمدة بالوقود',
      siphonIncidentFeed: 'سجل حوادث السحب المشبوهة'
    },
    coldChain: {
      title: 'سلسلة التبريد والامتثال لمعايير HACCP',
      subtitle: 'حساسات BLE لاسلكية، تنبيهات التغير الحراري، مراقبة فتح أبواب المبرد، واستخراج تقارير التدقيق',
      liveSensorFeed: 'بث حرارة وحدة التبريد المباشر',
      haccpAudit: 'تقرير الامتثال لمعايير HACCP',
      temperatureExcursions: 'تنبيهات تجاوز درجات الحرارة',
      cargoType: 'نوع البضاعة المنقولة',
      targetTempRange: 'النطاق الحراري المسموح',
      currentTemp: 'درجة الحرارة المقاسة',
      doorStatus: 'حالة أبواب الحاوية المبردة',
      defrostCycle: 'دورة إذابة الجليد (Defrost)',
      complianceRate: 'نسبة الامتثال لمعايير السلامة',
      pharmaGrade: 'أدوية ولقاحات طبية (+2°م إلى +8°م)',
      freshProduce: 'خضار وفواكه طازجة (+4°م إلى +10°م)',
      frozenMeat: 'لحوم ومجمدات عميقة (-25°م إلى -18°م)',
      reeferUnit: 'وحدة التبريد ThermoKing / Carrier',
      simulateExcursion: 'محاكاة اختراق حراري',
      criticalSpike: 'تم رصد ارتفاع حرج في درجة الحرارة',
      generateHaccpReport: 'تحميل تقرير تدقيق HACCP (PDF)',
      tempGraphTitle: 'منحنى التغير الحراري ودورات التبريد',
      excursionSummary: 'سجل تجاوز الحدود الحرارية'
    },
    liveSharing: {
      title: 'مشاركة الوصول الحي ETA والإثبات الإلكتروني للتسليم (e-POD)',
      subtitle: 'إنشاء روابط تتبع آمنة للعملاء، عرض المسار الحي، إشعارات واتساب، والتوقيع الرقمي عند الاستلام',
      activeLinks: 'روابط التتبع المباشرة النشطة',
      generateLink: 'إنشاء رابط تتبع مباشر جديد',
      recipientName: 'اسم العميل / المستلم',
      destination: 'عنوان وموقع التسليم',
      estimatedArrival: 'الوقت المقدر للوصول (ETA)',
      liveTrajectory: 'المسار وموقع المركبة المباشر',
      shareViaWhatsapp: 'إرسال عبر الواتساب',
      copyLink: 'نسخ الرابط الآمن',
      pinProtected: 'حماية برمز PIN (4 أرقام)',
      linkExpiresIn: 'مدة صلاحية الرابط',
      deliveryCompleted: 'تم تسليم الشحنة والتوقيع',
      electronicPod: 'إثبات التسليم الإلكتروني (e-POD)',
      recipientSignature: 'توقيع العميل الإلكتروني',
      proofOfDelivery: 'تحميل سند التسليم الموقع (PDF)',
      linkCopied: 'تم نسخ رابط التتبع إلى الحافظة بنجاح!',
      trackingUrl: 'رابط التتبع العام'
    },
    predictiveMaintenance: {
      title: 'الصيانة التنبؤية وفحص أعطال OBD-II',
      subtitle: 'قراءة أعطال كمبيوتر المحرك (DTC)، تقدير تآكل الزيوت والفرامل، وجدولة مواعيد الصيانة الوقائية',
      obdScanner: 'ماسح كمبيوتر المركبة CAN-Bus / OBD-II',
      dtcTroubleCodes: 'رموز أعطال المحرك (DTC)',
      serviceSchedule: 'جدول الصيانة الوقائية الدورية',
      oilLifeRemaining: 'العمر الافتراضي المتبقي للزيت',
      brakePadWear: 'مؤشر تآكل بطانات الفرامل',
      tireHealth: 'ضغط وحالة نقشة الإطارات',
      batteryHealth: 'صحة البطارية ومولد الكهرباء',
      diagnosticTerminal: 'طرفية أوامر تشخيص OBD-II',
      clearCodes: 'مسح رموز الأعطال (إطفاء لمبة Check Engine)',
      scheduleService: 'حجز موعد في ورشة الصيانة',
      criticalAlert: 'تم اكتشاف عطل محرك حرج',
      componentHealth: 'مصفوفة العمر التشغيلي للقطع',
      nextServiceAt: 'موعد الصيانة الشاملة القادمة',
      engineDiagnostics: 'تشخيص مباشر لمجموعة نقل الحركة',
      faultCodeCleared: 'تم مسح رموز الأعطال بنجاح من ذاكرة ECU'
    },
    organizations: {
      title: 'إدارة المؤسسات والشركات (Multi-Tenancy)',
      subtitle: 'إدارة حسابات الشركات المشتركة، حصص المركبات، تراخيص الأجهزة، وعزل البيانات بشكل آمن',
      allTenants: 'كافة الشركات والمؤسسات',
      addTenant: 'إضافة شركة ومؤسسة جديدة',
      tenantName: 'اسم المؤسسة / الشركة',
      city: 'المدينة والمقر الرئيسي',
      planName: 'باقة الاشتراك الحالية',
      maxVehicles: 'الحد الأقصى لعدد المركبات',
      activeTrackers: 'أجهزة التتبع المرتبطة',
      billingCycle: 'دورة الفوترة والاشتراك',
      storageUsed: 'مدة الاحتفاظ ببيانات التتبع',
      apiCalls: 'طلبات واجهة البرمجة الشهرية',
      switchTenant: 'التبديل إلى هذه الشركة',
      tenantDetails: 'بيانات الشركة والحدود المخصصة',
      subscriptionLimits: 'حدود وميزات باقة الاشتراك'
    },
    usersRbac: {
      title: 'المستخدمون ومصفوفة الصلاحيات (RBAC)',
      subtitle: 'توزيع الأدوار، تخصيص الصلاحيات الدقيقة، ومحاكي تجربة الاستخدام حسب الرتبة',
      teamMembers: 'فريق العمل والمستخدمون',
      addUser: 'دعوة مستخدم جديد',
      role: 'الدور المخصص',
      permissions: 'صلاحيات النظام',
      customPermissions: 'تخصيص صلاحيات استثنائية',
      lastActive: 'آخر جلسة نشاط أمني',
      simulateRole: 'تجربة النظام بهذا الدور',
      superAdmin: 'المسؤول العام للنظام (Super Admin)',
      orgOwner: 'مالك الشركة (Owner)',
      fleetManager: 'مدير عمليات الأسطول',
      driver: 'سائق ميداني',
      allTenantsAccess: 'إشراف كامل على كافة الشركات',
      editUser: 'تعديل بيانات وصلاحيات المستخدم',
      deleteUser: 'إلغاء وتجميد الحساب',
      permissionsMatrix: 'مصفوفة الصلاحيات والامتيازات'
    },
    settings: {
      title: 'إعدادات نظام Traccar وبوابات الاستقبال',
      subtitle: 'إعداد منافذ استقبال أجهزة GPS، تردد البث، الذاكرة المؤقتة، والربط البرمجي للخرائط Webhooks',
      traccarGateways: 'منافذ ومحللات بروتوكولات Traccar',
      activeProtocols: 'بروتوكولات الأجهزة المدعومة',
      serverPort: 'منفذ استقبال التيلومتري',
      gpsIngestionInterval: 'التردد الافتراضي للبث (ثواني)',
      bufferCapacity: 'سعة التخزين المؤقت دون اتصال (حزم)',
      webhookEndpoints: 'روابط إشعارات Webhooks',
      geocoderApiKey: 'مفتاح API لتحويل الإحداثيات لعناوين',
      downlinkQueue: 'معالج طابور الأوامر المرسلة',
      saveParameters: 'حفظ إعدادات النظام',
      protocolConfig: 'تكوين محولات البروتوكول',
      systemHealth: 'حالة مجمع خوادم Traccar',
      parametersSaved: 'تم تحديث معلمات النظام بنجاح.'
    },
    reports: {
      title: 'استخراج التقارير وتحليلات الأسطول',
      subtitle: 'إنشاء تقارير تفصيلية PDF / Excel للرحلات، الكيلومترات، استهلاك الوقود، والقيادة الآمنة',
      tripSummary: 'ملخص الرحلات اليومية والمسارات',
      mileageLog: 'سجل المسافات الكيلومترية والضريبية',
      fuelAudit: 'تدقيق الوقود وسجلات السحب',
      driverBehavior: 'تقييم السلامة والسرعة الزائدة للسائقين',
      geofenceLog: 'سجل دخول وخروج المناطق الجغرافية',
      dateRange: 'الفترة الزمنية للتقرير',
      selectVehicles: 'اختيار المركبات المحددة',
      generateReport: 'استخراج التقرير الذكي',
      recentReports: 'أرشيف التقارير السابقة',
      downloadPdf: 'تحميل التقرير كملف PDF',
      downloadExcel: 'تحميل التقرير كملف Excel (.xlsx)',
      reportFormat: 'صيغة الملف المطلوبة',
      generating: 'جاري معالجة وتجميع بيانات الأسطول...'
    },
    trips: {
      title: 'سجل الرحلات وإعادة عرض المسار (Replay)',
      subtitle: 'استعراض المسارات السابقة مع بيانات السرعة، نقاط التوقف، وتشغيل المحرك، والمنحنى التضاريسي',
      selectTrip: 'اختر الرحلة المسجلة',
      tripPlayback: 'لوحة التحكم بإعادة العرض',
      playbackSpeed: 'سرعة الإعادة',
      distance: 'المسافة الإجمالية للرحلة',
      duration: 'مدة الرحلة',
      avgSpeed: 'متوسط السرعة',
      maxSpeed: 'أعلى سرعة مسجلة',
      startLocation: 'نقطة الانطلاق',
      endLocation: 'نقطة الوصول',
      stops: 'محطات التوقف وركن المركبة',
      elevationProfile: 'منحنى الارتفاع التضاريسي',
      timeline: 'الخط الزمني للتيلومتري',
      scrubber: 'مؤشر التقديم والتأخير',
      replayRoute: 'بدء تشغيل الإعادة'
    },
    trackers: {
      title: 'أجهزة التتبع (Balises) والمخزون',
      subtitle: 'إدارة أجهزة التتبع (Teltonika, Queclink, Coban, Suntech)، شرائح M2M، وأوامر SMS/GPRS',
      registeredTrackers: 'أجهزة التتبع المسجلة',
      registerTracker: 'تسجيل جهاز تتبع جديد',
      imei: 'الرقم التسلسلي للجهاز (IMEI)',
      protocol: 'بروتوكول التواصل',
      simCard: 'رقم شريحة البيانات M2M',
      signalStrength: 'قوة إشارة الشبكة الخلوية',
      assignedVehicle: 'المركبة المرتبطة',
      lastPing: 'آخر نبضة اتصال واردة',
      firmware: 'إصدار البرنامج الثابت (Firmware)',
      downlinkCommands: 'وحدة إرسال الأوامر المباشرة',
      sendDownlink: 'إرسال أمر GPRS / SMS',
      trackerStatus: 'حالة اتصال الجهاز'
    },
    alertsView: {
      title: 'شريط التنبيهات وإدارة الحوادث الأمنية',
      subtitle: 'معالجة فورية للأحداث: تجاوز السرعة، اختراق المناطق، زر الطوارئ SOS، وسرقة الوقود، وأعطال OBD',
      allAlerts: 'كافة الأحداث الواردة',
      unreadOnly: 'تنبيهات غير معالجة',
      criticalOnly: 'تنبيهات بالغة الخطورة فقط',
      markAllRead: 'اعتماد كافة التنبيهات كمقروءة',
      severity: 'درجة الخطورة',
      triggerReason: 'سبب إطلاق التنبيه',
      vehicle: 'المركبة المعنية',
      time: 'التاريخ والوقت',
      location: 'إحداثيات موقع الحدث',
      resolveAlert: 'تحديد كتمت المعالجة',
      assignToDriver: 'إرسال إشعار للسائق المعين',
      alertDetails: 'تفاصيل ملف الحادثة'
    },
    vehicleDetail: {
      title: 'فحص تفاصيل المركبة وتيلومتري CAN-Bus',
      specs: 'المواصفات الفنية للمركبة',
      liveSensors: 'مصفوفة الحساسات الحية',
      engineDiagnostics: 'تيلومتري كمبيوتر المحرك ECU',
      remoteRelay: 'التحكم بقفل ومرحل المحرك',
      dtcCodes: 'رموز أعطال الفحص (DTC)',
      odometer: 'قراءة عداد الكيلومترات',
      voltage: 'جهد بطارية المركبة',
      battery: 'البطارية الاحتياطية للجهاز',
      speed: 'السرعة الحالية',
      rpm: 'دوران المحرك في الدقيقة',
      coolant: 'حرارة سائل التبريد',
      fuelTank: 'سعة خزان الوقود',
      lastPosition: 'آخر موقع جغرافي معروف',
      driver: 'السائق المعين',
      sendDownlink: 'إرسال أمر تحكم للمركبة',
      replayTrip: 'إعادة عرض الرحلات الأخيرة',
      engineCutoff: 'إيقاف مرحل المحرك (منع التشغيل)',
      engineResume: 'إعادة تشغيل مرحل المحرك'
    },
    vehicleCatalog: {
      title: 'إضافة مركبة وربط جهاز التتبع',
      subtitle: 'فك شفرة رقم الهيكل (VIN) تلقائياً، تسجيل المواصفات واللوحة وربطها بجهاز GPS',
      vinDecoder: 'محلل رقم الهيكل التلقائي (VIN)',
      enterVin: 'أدخل رمز VIN المكون من 17 حرفاً',
      decode: 'تحليل رمز VIN',
      make: 'الشركة الصانعة',
      model: 'طراز المركبة',
      year: 'سنة الصنع',
      licensePlate: 'رقم اللوحة الرسمية',
      trackerSelect: 'تخصيص جهاز تتبع GPS',
      fuelType: 'نوع المحرك والوقود',
      category: 'تصنيف وفئة المركبة',
      addVehicleBtn: 'تسجيل المركبة في الأسطول',
      decodingVin: 'جاري فحص قاعدة البيانات العالمية للـ VIN...'
    }
  }
};

export function getTranslation(lang: Language): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
