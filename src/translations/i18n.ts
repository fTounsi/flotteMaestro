export type Language = 'en' | 'fr' | 'ar';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  nav: {
    dashboard: string;
    liveMap: string;
    vehicles: string;
    trackers: string;
    tripsHistory: string;
    geofences: string;
    alerts: string;
    reports: string;
    organizations: string;
    usersRbac: string;
    apiExplorer: string;
    settings: string;
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
  };
  geofence: {
    circle: string;
    polygon: string;
    radius: string;
    speedLimit: string;
    zoneName: string;
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
  };
  api: {
    swaggerTitle: string;
    tryItOut: string;
    execute: string;
    response: string;
    streamTitle: string;
    realtimePackets: string;
    traccarAdapterFlow: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'FlotteMaestro',
    tagline: 'Multi-Tenant Fleet Synchronization & Telemetry Platform',
    nav: {
      dashboard: 'Dashboard',
      liveMap: 'Live GPS Map',
      vehicles: 'Vehicles & Fleet',
      trackers: 'Hardware Trackers',
      tripsHistory: 'Trips & Playback',
      geofences: 'Geofences',
      alerts: 'Alerts & Events',
      reports: 'Reports Studio',
      organizations: 'Organizations & Tenancy',
      usersRbac: 'Users & Permissions',
      apiExplorer: 'REST API & WebSockets',
      settings: 'Settings'
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
      suspended: 'Suspended'
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
      plan: 'Subscription Plan'
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
      viewDetails: 'Vehicle Inspector'
    },
    geofence: {
      circle: 'Circular Radial Zone',
      polygon: 'Polygon Boundary',
      radius: 'Radius',
      speedLimit: 'Zone Speed Limit',
      zoneName: 'Geofence Zone Name'
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
      tapToFollow: 'Tap vehicle to follow live trajectory'
    },
    api: {
      swaggerTitle: 'OpenAPI 3.0 Interactive Documentation',
      tryItOut: 'Test Endpoint',
      execute: 'Execute Live Request',
      response: 'Live JSON Response',
      streamTitle: 'WebSocket Telemetry & Protocol Pipeline',
      realtimePackets: 'Ingested GPS Stream (Traccar Adapter)',
      traccarAdapterFlow: 'Traccar GPS Decoders → Event Pipeline → Client WebSocket'
    }
  },
  fr: {
    appName: 'FlotteMaestro',
    tagline: 'Plateforme Multi-Tenants de Gestion et Synchronisation de Flotte',
    nav: {
      dashboard: 'Tableau de bord',
      liveMap: 'Carte GPS en direct',
      vehicles: 'Véhicules & Flotte',
      trackers: 'Balises GPS Matérielles',
      tripsHistory: 'Trajets & Replay',
      geofences: 'Géozones',
      alerts: 'Alertes & Événements',
      reports: 'Générateur de Rapports',
      organizations: 'Organisations & Tenants',
      usersRbac: 'Utilisateurs & Droits',
      apiExplorer: 'API REST & WebSockets',
      settings: 'Paramètres'
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
      suspended: 'Suspendu'
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
      plan: 'Formule d’abonnement'
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
      saveChanges: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      assignTracker: 'Assigner la balise',
      unassign: 'Détacher',
      markAsRead: 'Marquer comme lu',
      viewDetails: 'Inspecteur Véhicule'
    },
    geofence: {
      circle: 'Zone circulaire (Rayon)',
      polygon: 'Zone polygonale libre',
      radius: 'Rayon',
      speedLimit: 'Vitesse limite dans la zone',
      zoneName: 'Nom de la géozone'
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
      tapToFollow: 'Touchez un véhicule pour suivre sa trajectoire'
    },
    api: {
      swaggerTitle: 'Documentation Interactive OpenAPI 3.0',
      tryItOut: 'Tester l’endpoint',
      execute: 'Exécuter la requête',
      response: 'Réponse JSON en direct',
      streamTitle: 'Pipeline Télémétrie & Flux WebSocket',
      realtimePackets: 'Flux GPS normalisé (Adaptateur Traccar)',
      traccarAdapterFlow: 'Décodeurs Traccar → Pipeline d’événements → WebSocket Client'
    }
  },
  ar: {
    appName: 'فلوت مايسترو (FlotteMaestro)',
    tagline: 'المنصة الاحترافية المتكاملة لإدارة وتتبع أساطيل المركبات بالـ GPS',
    nav: {
      dashboard: 'لوحة القيادة',
      liveMap: 'الخريطة الحية (GPS)',
      vehicles: 'المركبات والأسطول',
      trackers: 'أجهزة التتبع (Balises)',
      tripsHistory: 'الرحلات وإعادة المسار',
      geofences: 'المناطق الجغرافية',
      alerts: 'التنبيهات والأحداث',
      reports: 'استخراج التقارير',
      organizations: 'المؤسسات والشركات',
      usersRbac: 'المستخدمون والصلاحيات',
      apiExplorer: 'واجهة البرمجة (REST API)',
      settings: 'الإعدادات'
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
      suspended: 'معلق'
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
      plan: 'باقة الاشتراك'
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
      viewDetails: 'فحص تفاصيل المركبة'
    },
    geofence: {
      circle: 'منطقة دائرية (نصف قطر)',
      polygon: 'منطقة مضلعة حرة',
      radius: 'نصف القطر',
      speedLimit: 'السرعة المسموحة بالمنطقة',
      zoneName: 'اسم المنطقة'
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
      tapToFollow: 'اضغط على المركبة لمتابعتها على الخريطة'
    },
    api: {
      swaggerTitle: 'المواصفات التفاعلية OpenAPI 3.0',
      tryItOut: 'تجربة نقطة النهاية',
      execute: 'إرسال الطلب الفعلي',
      response: 'استجابة JSON المباشرة',
      streamTitle: 'قناة البث اللحظي عبر WebSocket',
      realtimePackets: 'حزم بيانات GPS المعيارية (محول Traccar)',
      traccarAdapterFlow: 'محلل بروتوكولات Traccar ← خط معالجة الأحداث ← بث الويب المباشر'
    }
  }
};
