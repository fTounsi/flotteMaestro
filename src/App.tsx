import React, { useState, useEffect } from 'react';
import {
  AppMode,
  NavigationTab,
  Vehicle,
  Tracker,
  Geofence,
  Alert,
  FleetReport,
  Organization,
  User,
  UserRole,
  Trip,
  WebSocketMessage,
  ModuleKey
} from './types/fleet';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_VEHICLES,
  INITIAL_TRACKERS,
  INITIAL_GEOFENCES,
  INITIAL_ALERTS,
  INITIAL_REPORTS,
  INITIAL_USERS,
  INITIAL_TRIPS
} from './data/mockData';
import { TRANSLATIONS, Language } from './translations/i18n';
import { trackingEngineInstance } from './services/trackingEngine';
import { alertSound } from './utils/audioAlert';

// Common Components
import { Header } from './components/common/Header';

// Web Admin Components
import { LiveMap } from './components/web/LiveMap';
import { VehicleDetailModal } from './components/web/VehicleDetailModal';
import { VehicleCatalogModal } from './components/web/VehicleCatalogModal';
import { TripsHistoryView } from './components/web/TripsHistoryView';
import { TrackersView } from './components/web/TrackersView';
import { GeofencesView } from './components/web/GeofencesView';
import { AlertsView } from './components/web/AlertsView';
import { ReportsView } from './components/web/ReportsView';
import { OrganizationsView } from './components/web/OrganizationsView';
import { UsersRbacView } from './components/web/UsersRbacView';
import { DownlinkCommandModal } from './components/web/DownlinkCommandModal';
import { RoleImpersonationBanner } from './components/web/RoleImpersonationBanner';

// Enterprise Modular Add-Ons
import { ModulesHubView } from './components/web/ModulesHubView';
import { CarRentalView } from './components/web/CarRentalView';
import { FuelIntelligenceView } from './components/web/FuelIntelligenceView';
import { ColdChainView } from './components/web/ColdChainView';
import { LiveShareView } from './components/web/LiveShareView';
import { MaintenanceView } from './components/web/MaintenanceView';
import { SystemSettingsView } from './components/web/SystemSettingsView';
import { SystemParametersConfig } from './types/serverConfig';
import { INITIAL_SYSTEM_CONFIG } from './data/serverConfigData';

// API & Mobile Components
import { RestApiExplorer } from './components/api/RestApiExplorer';
import { MobileAppFrame } from './components/mobile/MobileAppFrame';
import { WebLoginView } from './components/auth/WebLoginView';

export function App() {
  // Application Top-level State
  const [appMode, setAppMode] = useState<AppMode>('web');
  const [activeNav, setActiveNav] = useState<NavigationTab>('live_tracking');
  const [currentLang, setCurrentLang] = useState<Language>('en');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoginPreview, setIsLoginPreview] = useState<boolean>(false);

  // Multi-tenant & Domain Entities
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [selectedOrgId, setSelectedOrgId] = useState<string>(INITIAL_ORGANIZATIONS[0].id);

  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [trackers, setTrackers] = useState<Tracker[]>(INITIAL_TRACKERS);
  const [geofences, setGeofences] = useState<Geofence[]>(INITIAL_GEOFENCES);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [reports, setReports] = useState<FleetReport[]>(INITIAL_REPORTS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [systemConfig, setSystemConfig] = useState<SystemParametersConfig>(INITIAL_SYSTEM_CONFIG);

  // WebSocket Live Stream Log for API Explorer
  const [wsMessages, setWsMessages] = useState<WebSocketMessage[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // RBAC Simulation Sandbox State
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);

  // Modals
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);
  const [vehicleForCommand, setVehicleForCommand] = useState<Vehicle | null>(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState<boolean>(false);

  // Effective user for RBAC enforcement (respects simulation preview)
  const effectiveUser: User | null = currentUser
    ? simulatedRole
      ? {
          ...currentUser,
          role: simulatedRole,
          customPermissions: undefined
        }
      : currentUser
    : null;

  const t = TRANSLATIONS[currentLang];
  const activeOrg = organizations.find((o) => o.id === selectedOrgId) || organizations[0];

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setSimulatedRole(null);
    setIsAuthenticated(true);
    setIsLoginPreview(false);
    if (user.organizationId) {
      setSelectedOrgId(user.organizationId);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSimulatedRole(null);
    setIsLoginPreview(true);
  };

  const handleToggleLoginPreview = () => {
    setIsLoginPreview((prev) => !prev);
  };

  // Initialize and run real-time tracking simulation
  useEffect(() => {
    trackingEngineInstance.setVehicles(vehicles);
    trackingEngineInstance.setGeofences(geofences);

    const unsubscribe = trackingEngineInstance.subscribe((updatedVehicles, newAlert, wsMsg) => {
      setVehicles(updatedVehicles);

      if (newAlert) {
        setAlerts((prev) => [newAlert, ...prev]);
        if (newAlert.severity === 'critical') {
          alertSound.playCriticalChime();
        } else {
          alertSound.playInfoChime();
        }
      }

      if (wsMsg) {
        setWsMessages((prev) => [wsMsg, ...prev.slice(0, 49)]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [geofences]);

  // Handle Simulation Toggle
  const handleToggleSimulation = () => {
    const newState = !isSimulating;
    setIsSimulating(newState);
    trackingEngineInstance.setSimulationActive(newState);
  };

  // Add Vehicle
  const handleAddVehicle = (newVehData: Partial<Vehicle>) => {
    const newVeh: Vehicle = {
      id: `veh_${Date.now()}`,
      organizationId: selectedOrgId,
      fleetId: 'fleet_casa_express',
      fleetName: 'Casablanca Express Fleet',
      make: newVehData.make || 'Renault',
      model: newVehData.model || 'Master',
      modelYear: newVehData.modelYear || 2024,
      vehicleType: newVehData.vehicleType || 'van',
      bodyType: newVehData.bodyType || 'Standard Van Body',
      licensePlate: newVehData.licensePlate || '12345-A-1',
      vin: newVehData.vin || 'VF1MA00030192834',
      color: newVehData.color || '#0284c7',
      status: 'stopped',
      odometer: 0,
      dailyDistanceKm: 0,
      fuelType: 'diesel',
      engineInfo: 'Euro 6 Eco Fleet',
      fuelLevelPercent: 100,
      trackerId: newVehData.trackerId,
      trackerImei: newVehData.trackerImei,
      trackerProtocol: newVehData.trackerProtocol || 'teltonika',
      latestPosition: {
        id: `pos_${Date.now()}`,
        trackerId: newVehData.trackerId || 'trk_gen',
        vehicleId: '',
        latitude: 33.5731 + (Math.random() - 0.5) * 0.05,
        longitude: -7.5898 + (Math.random() - 0.5) * 0.05,
        altitude: 20,
        speed: 0,
        heading: Math.floor(Math.random() * 360),
        accuracy: 3.5,
        ignition: false,
        motion: false,
        battery: 100,
        externalVoltage: 12.6,
        odometer: 0,
        satellites: 14,
        protocol: newVehData.trackerProtocol || 'teltonika',
        address: 'Casablanca Hub Loading Bay',
        recordedAt: new Date().toISOString(),
        receivedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newVeh, ...vehicles];
    setVehicles(updated);
    trackingEngineInstance.setVehicles(updated);

    // If tracker assigned, mark tracker as assigned
    if (newVehData.trackerId) {
      setTrackers((prev) =>
        prev.map((trk) =>
          trk.id === newVehData.trackerId
            ? { ...trk, vehicleId: newVeh.id, vehiclePlate: newVeh.licensePlate }
            : trk
        )
      );
    }
  };

  // Assign Tracker
  const handleAssignTracker = (trackerId: string, vehicleId: string) => {
    const targetVeh = vehicles.find((v) => v.id === vehicleId);

    setTrackers((prev) =>
      prev.map((trk) =>
        trk.id === trackerId
          ? {
              ...trk,
              vehicleId: vehicleId || undefined,
              vehiclePlate: targetVeh?.licensePlate || undefined
            }
          : trk
      )
    );

    if (targetVeh) {
      const targetTrk = trackers.find((t) => t.id === trackerId);
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === vehicleId
            ? {
                ...v,
                trackerId: trackerId,
                trackerImei: targetTrk?.imei,
                trackerProtocol: targetTrk?.protocol || 'teltonika'
              }
            : v
        )
      );
    }
  };

  // Add Tracker
  const handleAddTracker = (trkData: Partial<Tracker>) => {
    const imei = trkData.imei || `86${Math.floor(1000000000000 + Math.random() * 8999999999999)}`;
    const newTrk: Tracker = {
      id: `trk_${Date.now()}`,
      organizationId: selectedOrgId,
      deviceIdentifier: imei,
      imei: imei,
      protocol: trkData.protocol || 'teltonika',
      model: trkData.model || 'Teltonika FMB920',
      manufacturer: trkData.manufacturer || 'Teltonika',
      simPhoneNumber: trkData.simPhoneNumber || '+212 600 00 00 00',
      firmwareVersion: '03.29.00.Rev.01',
      status: 'active',
      battery: 100,
      externalVoltage: 12.6,
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      configuration: {
        reportIntervalSec: 10,
        overspeedThresholdKmH: 100,
        idleThresholdMinutes: 15
      }
    };
    setTrackers((prev) => [newTrk, ...prev]);
  };

  // Add Geofence
  const handleAddGeofence = (geoData: Partial<Geofence>) => {
    const newGeo: Geofence = {
      id: `geo_${Date.now()}`,
      organizationId: selectedOrgId,
      name: geoData.name || 'New Logistics Hub',
      type: geoData.type || 'circle',
      color: geoData.color || '#10b981',
      description: geoData.description || 'Monitored perimeter',
      active: true,
      center: geoData.center || [33.5731, -7.5898],
      radiusMeters: geoData.radiusMeters || 1000,
      coordinates: geoData.coordinates,
      speedLimitKmH: geoData.speedLimitKmH || 40,
      createdAt: new Date().toISOString()
    };
    const updated = [newGeo, ...geofences];
    setGeofences(updated);
    trackingEngineInstance.setGeofences(updated);
  };

  // Delete Geofence
  const handleDeleteGeofence = (id: string) => {
    const updated = geofences.filter((g) => g.id !== id);
    setGeofences(updated);
    trackingEngineInstance.setGeofences(updated);
  };

  // Mark Alert as Read
  const handleMarkAlertAsRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  };

  // Mark All Alerts Read
  const handleMarkAllAlertsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  // Generate Report
  const handleGenerateReport = (repData: Partial<FleetReport>) => {
    const newRep: FleetReport = {
      id: `rep_${Date.now()}`,
      organizationId: selectedOrgId,
      title: repData.title || 'Fleet Report',
      type: repData.type || 'mileage',
      format: repData.format || 'pdf',
      dateRange: repData.dateRange || {
        start: '2026-08-01T00:00:00Z',
        end: '2026-08-31T23:59:59Z'
      },
      vehicleIds: repData.vehicleIds || vehicles.map((v) => v.id),
      status: 'ready',
      generatedAt: new Date().toISOString(),
      fileSizeMb: repData.fileSizeMb || 1.8,
      recordCount: repData.recordCount || 65,
      summary: repData.summary || {
        totalDistanceKm: 5420,
        totalDurationHours: 110,
        totalAlerts: 12
      }
    };
    setReports((prev) => [newRep, ...prev]);
  };

  // Add Organization
  const handleAddOrganization = (orgData: Partial<Organization>) => {
    const newOrg: Organization = {
      id: `org_${Date.now()}`,
      name: orgData.name || 'New Organization',
      legalName: orgData.legalName || 'New Organization SARL',
      email: orgData.email || 'contact@org.ma',
      phone: orgData.phone || '+212 522 00 00 00',
      country: 'Morocco',
      city: orgData.city || 'Casablanca',
      timezone: 'Africa/Casablanca',
      locale: 'fr',
      status: 'active',
      planId: orgData.planId || 'professional',
      createdAt: new Date().toISOString(),
      subscription: orgData.subscription || {
        id: `sub_${Date.now()}`,
        planId: 'professional',
        planName: 'Professional Fleet',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        daysRemaining: 365,
        vehicleLimit: 100,
        userLimit: 25,
        trackerLimit: 100,
        fleetLimit: 10,
        historyRetentionDays: 365
      },
      stats: {
        totalVehicles: 0,
        activeVehicles: 0,
        totalTrackers: 0,
        totalUsers: 1,
        totalFleets: 1
      }
    };
    setOrganizations((prev) => [newOrg, ...prev]);
  };

  // Renew Subscription
  const handleRenewSubscription = (orgId: string, daysToAdd: number) => {
    setOrganizations((prev) =>
      prev.map((org) => {
        if (org.id === orgId) {
          const currentEnd = new Date(org.subscription.endDate).getTime();
          const newEnd = new Date(currentEnd + daysToAdd * 24 * 3600 * 1000).toISOString();
          return {
            ...org,
            subscription: {
              ...org.subscription,
              endDate: newEnd,
              daysRemaining: org.subscription.daysRemaining + daysToAdd,
              status: 'active'
            }
          };
        }
        return org;
      })
    );
  };

  // User Management Handlers (RBAC)
  const handleAddUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Toggle Module Add-On for an Organization
  const handleToggleModule = (orgId: string, moduleKey: ModuleKey, enabled: boolean) => {
    setOrganizations((prev) =>
      prev.map((org) => {
        if (org.id === orgId) {
          const currentModules = org.enabledModules || {
            car_rental: false,
            fuel_intelligence: true,
            cold_chain: false,
            live_sharing: false,
            predictive_maintenance: false
          };
          return {
            ...org,
            enabledModules: {
              ...currentModules,
              [moduleKey]: enabled
            }
          };
        }
        return org;
      })
    );
  };

  // Remote Relay Anti-Theft Cut-Off Toggle
  const handleToggleRelay = (vehicleId: string, cutOff: boolean) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            relayCutoffActive: cutOff,
            status: cutOff ? 'stopped' : v.status
          };
        }
        return v;
      })
    );
  };

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div
      dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans"
    >
      {/* Top Application Header with Mode Switcher, Tenant Dropdown & User Auth Controls */}
      <Header
        appMode={appMode}
        onModeChange={setAppMode}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        organizations={organizations}
        selectedOrgId={selectedOrgId}
        onOrgChange={setSelectedOrgId}
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        unreadAlertsCount={unreadAlertsCount}
        isSimulating={isSimulating}
        onToggleSimulation={handleToggleSimulation}
        currentUser={effectiveUser}
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoginPreview={isLoginPreview}
        onToggleLoginPreview={handleToggleLoginPreview}
        t={t}
      />

      {/* RBAC Role Impersonation Simulation Banner */}
      <RoleImpersonationBanner
        currentRole={effectiveUser?.role || 'super_admin'}
        isSimulating={simulatedRole !== null}
        onSelectRole={(r) => setSimulatedRole(r)}
        onExitSimulation={() => setSimulatedRole(null)}
      />

      {/* Main Mode View Routing */}
      <main className="flex-1 p-3 sm:p-5 max-w-7xl w-full mx-auto">
        {/* 1. WEB ADMIN PORTAL */}
        {appMode === 'web' && (
          <div>
            {/* Condition: If unauthenticated or previewing login page */}
            {(!isAuthenticated || isLoginPreview) ? (
              <WebLoginView
                organizations={organizations}
                selectedOrgId={selectedOrgId}
                onSelectOrg={setSelectedOrgId}
                users={users}
                onLogin={handleLogin}
                currentLang={currentLang}
                onLangChange={setCurrentLang}
                t={t}
              />
            ) : (
              <div>
                {/* Live GPS Tracking Radar Map */}
                {activeNav === 'live_tracking' && (
                  <LiveMap
                    vehicles={vehicles}
                    geofences={geofences}
                    onSelectVehicle={setSelectedVehicleForDetail}
                    onOpenCatalogModal={() => setIsCatalogModalOpen(true)}
                    t={t}
                  />
                )}

                {/* Historical Trips Replay Scrubber */}
                {activeNav === 'trips' && (
                  <TripsHistoryView
                    trips={trips}
                    vehicles={vehicles}
                    activeVehicleId={selectedVehicleForDetail?.id}
                    t={t}
                  />
                )}

                {/* Hardware GPS Trackers & Traccar Gateway */}
                {activeNav === 'trackers' && (
                  <TrackersView
                    trackers={trackers}
                    vehicles={vehicles}
                    onAddTracker={handleAddTracker}
                    onAssignTracker={handleAssignTracker}
                    t={t}
                  />
                )}

                {/* Spatial Geofences Manager */}
                {activeNav === 'geofences' && (
                  <GeofencesView
                    geofences={geofences}
                    onAddGeofence={handleAddGeofence}
                    onDeleteGeofence={handleDeleteGeofence}
                    t={t}
                  />
                )}

                {/* Real-time Alerts & Safety Center */}
                {activeNav === 'alerts' && (
                  <AlertsView
                    alerts={alerts}
                    users={users}
                    currentUser={effectiveUser}
                    onMarkAsRead={handleMarkAlertAsRead}
                    onUpdateAlert={(updatedAlert) =>
                      setAlerts((prev) => prev.map((a) => (a.id === updatedAlert.id ? updatedAlert : a)))
                    }
                    onClearAll={handleMarkAllAlertsRead}
                    t={t}
                  />
                )}

                {/* Asynchronous Reports Studio */}
                {activeNav === 'reports' && (
                  <ReportsView
                    vehicles={vehicles}
                    t={t}
                  />
                )}

                {/* Modular Add-Ons Hub */}
                {activeNav === 'modules_hub' && (
                  <ModulesHubView
                    currentOrg={activeOrg}
                    organizations={organizations}
                    onToggleModule={handleToggleModule}
                    onNavigateToTab={setActiveNav}
                  />
                )}

                {/* Car Rental & Remote Immobilizer */}
                {activeNav === 'car_rental' && (
                  <CarRentalView
                    vehicles={vehicles}
                    onToggleRelay={handleToggleRelay}
                    onSelectVehicle={setSelectedVehicleForDetail}
                  />
                )}

                {/* Fuel Intelligence & Theft Detection */}
                {activeNav === 'fuel_intelligence' && (
                  <FuelIntelligenceView
                    vehicles={vehicles}
                  />
                )}

                {/* Cold Chain & HACCP Audit */}
                {activeNav === 'cold_chain' && (
                  <ColdChainView
                    vehicles={vehicles}
                  />
                )}

                {/* Live Delivery Link & e-POD */}
                {activeNav === 'live_sharing' && (
                  <LiveShareView
                    vehicles={vehicles}
                  />
                )}

                {/* Predictive Maintenance & OBD-II Scanner */}
                {activeNav === 'predictive_maintenance' && (
                  <MaintenanceView
                    vehicles={vehicles}
                  />
                )}

                {/* Multi-Tenant Organizations & Subscriptions */}
                {activeNav === 'organizations' && (
                  <OrganizationsView
                    organizations={organizations}
                    onSelectOrg={setSelectedOrgId}
                    selectedOrgId={selectedOrgId}
                    t={t}
                  />
                )}

                {/* Team RBAC & Permissions */}
                {activeNav === 'users' && (
                  <UsersRbacView
                    users={users}
                    organizations={organizations}
                    vehicles={vehicles}
                    currentUser={effectiveUser}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                    onDeleteUser={handleDeleteUser}
                    onSimulateRole={(role) => setSimulatedRole(role)}
                    t={t}
                  />
                )}

                {/* Traccar-Grade Admin System Parameters & Protocol Listener Hub */}
                {activeNav === 'settings' && (
                  <SystemSettingsView
                    initialConfig={systemConfig}
                    onSaveConfig={(newConfig) => setSystemConfig(newConfig)}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. REST API & WEBSOCKET STREAM EXPLORER */}
        {appMode === 'api' && (
          <RestApiExplorer
            wsMessages={wsMessages}
            onClearWs={() => setWsMessages([])}
            isSimulating={isSimulating}
            onToggleSimulating={handleToggleSimulation}
            t={t}
          />
        )}

        {/* 3. FLUTTER MOBILE APP SIMULATOR */}
        {appMode === 'mobile' && (
          <MobileAppFrame
            vehicles={vehicles}
            geofences={geofences}
            alerts={alerts}
            reports={reports}
            organizations={organizations}
            selectedOrgId={selectedOrgId}
            onSelectOrg={setSelectedOrgId}
            users={users}
            currentUser={currentUser}
            isAuthenticated={isAuthenticated}
            onLogin={handleLogin}
            onLogout={handleLogout}
            currentLang={currentLang}
            onLangChange={setCurrentLang}
            t={t}
          />
        )}
      </main>

      {/* Footer Banner */}
      <footer className="mt-8 pt-6 pb-8 border-t border-zinc-900 flex flex-wrap justify-between items-center gap-4 text-zinc-500 max-w-7xl w-full mx-auto px-4 sm:px-6">
        <div className="text-[10px] tracking-widest text-zinc-600 uppercase flex flex-wrap items-center gap-6 font-semibold">
          <span>© 2024 FlotteMaestro Enterprise</span>
          <span>Latency: ~12ms (Optimal)</span>
          <span>End-to-End Encrypted Telemetry</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-bold">
            SYNC CORE V2.4.0
          </span>
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
        </div>
      </footer>

      {/* Vehicle Telemetry & OBD Detail Modal */}
      {selectedVehicleForDetail && (
        <VehicleDetailModal
          vehicle={selectedVehicleForDetail}
          currentUser={effectiveUser}
          onClose={() => setSelectedVehicleForDetail(null)}
          onOpenTripReplay={() => {
            setSelectedVehicleForDetail(null);
            setActiveNav('trip_replay');
          }}
          onOpenTerminal={(veh) => {
            setVehicleForCommand(veh);
          }}
          t={t}
        />
      )}

      {/* Hardware Downlink Telematics Command Terminal */}
      {vehicleForCommand && (
        <DownlinkCommandModal
          vehicle={vehicleForCommand}
          currentUser={effectiveUser}
          onClose={() => setVehicleForCommand(null)}
          onCommandDispatched={(cmd) => {
            if (cmd.type === 'engine_stop') {
              handleToggleRelay(cmd.vehicleId, true);
            } else if (cmd.type === 'engine_resume') {
              handleToggleRelay(cmd.vehicleId, false);
            }
          }}
        />
      )}

      {/* Add Vehicle Catalog Modal with VIN Decoder */}
      {isCatalogModalOpen && (
        <VehicleCatalogModal
          isOpen={isCatalogModalOpen}
          onClose={() => setIsCatalogModalOpen(false)}
          onAddVehicle={handleAddVehicle}
          availableTrackers={trackers}
          t={t}
        />
      )}
    </div>
  );
}

export default App;
