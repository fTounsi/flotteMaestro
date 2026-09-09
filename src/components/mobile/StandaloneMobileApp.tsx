import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpDown,
  ArrowDownWideNarrow,
  SlidersHorizontal,
  LayoutDashboard,
  Truck,
  Bell,
  User as UserIcon,
  Route,
  Search,
  Battery,
  Fuel,
  Gauge,
  Power,
  Phone,
  Shield,
  Fingerprint,
  LogOut,
  Sparkles,
  MapPin,
  Layers,
  ChevronRight,
  ChevronUp,
  X,
  Radio,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  RefreshCw,
  Monitor,
  ExternalLink,
  Info,
  Calendar,
  Clock,
  Compass,
  Zap,
  Snowflake,
  Flag,
  ChevronDown,
  Play,
  Activity,
  Copy,
  Check,
  CheckCheck,
  Navigation,
  Eye,
  Maximize2
} from 'lucide-react';
import { Vehicle, Geofence, Alert, FleetReport, Organization, User, Trip } from '../../types/fleet';
import { TranslationDictionary, Language } from '../../translations/i18n';
import { MobileLoginView } from './MobileLoginView';
import { ThemeToggle } from '../common/ThemeToggle';
import { buildLeafletVehicleMarkerHtml, VehicleMiniatureIcon } from '../common/VehicleMiniatureIcon';
import { getVehicleBrandLogo } from '../../services/vehicleCatalogService';
import { TripMiniMap } from './TripMiniMap';
import { TripDetailModal } from './TripDetailModal';
import { FullScreenTripReplayOverlay } from './FullScreenTripReplayOverlay';
import { getVehicleDailyTrip } from '../../utils/routeUtils';

const tripListContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05
    }
  }
};

const tripCardVariants = {
  hidden: {
    opacity: 0,
    y: 22,
    scale: 0.97
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
      mass: 0.85
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -12,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

interface StandaloneMobileAppProps {
  vehicles: Vehicle[];
  geofences: Geofence[];
  alerts: Alert[];
  reports: FleetReport[];
  trips?: Trip[];
  organizations: Organization[];
  selectedOrgId: string;
  onSelectOrg: (orgId: string) => void;
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  onLogin: (user: User) => void;
  onLogout: () => void;
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  onSwitchToWebConsole: () => void;
  onToggleRelay?: (vehicleId: string, cutOff: boolean) => void;
  onUpdateAlert?: (alert: Alert) => void;
  onMarkAlertAsRead?: (alertId: string) => void;
  t: TranslationDictionary;
}

export const StandaloneMobileApp: React.FC<StandaloneMobileAppProps> = ({
  vehicles,
  geofences,
  alerts,
  reports,
  trips = [],
  organizations,
  selectedOrgId,
  onSelectOrg,
  users,
  currentUser,
  isAuthenticated,
  onLogin,
  onLogout,
  currentLang,
  onLangChange,
  onSwitchToWebConsole,
  onToggleRelay,
  onUpdateAlert,
  onMarkAlertAsRead,
  t
}) => {
  // Mobile Tabs: Radar Map, Fleet Assets, Incidents/Alerts, Trips, Profile
  const [activeTab, setActiveTab] = useState<'radar' | 'fleet' | 'alerts' | 'trips' | 'profile'>('radar');
  const [statusFilter, setStatusFilter] = useState<'all' | 'moving' | 'idle' | 'stopped' | 'offline'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    | 'default'
    | 'battery_asc'
    | 'battery_desc'
    | 'fuel_asc'
    | 'fuel_desc'
    | 'distance_desc'
    | 'last_seen_desc'
    | 'last_seen_asc'
    | 'speed_desc'
  >('default');
  const [searchTerm, setSearchTerm] = useState('');
  const [tripSearchTerm, setTripSearchTerm] = useState('');
  const [tripFilterCategory, setTripFilterCategory] = useState<'all' | 'long-haul' | 'urban' | 'moving'>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedTripForModal, setSelectedTripForModal] = useState<Trip | null>(null);
  const [activeAlertInspection, setActiveAlertInspection] = useState<Alert | null>(null);
  const [isAlertDetailSheetOpen, setIsAlertDetailSheetOpen] = useState(true);
  const [alertMapLayer, setAlertMapLayer] = useState<'carto' | 'satellite' | 'streets'>('carto');
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [instantReplayTrip, setInstantReplayTrip] = useState<{ trip: Trip; vehicle?: Vehicle } | null>(null);
  const [expandedTripIds, setExpandedTripIds] = useState<Record<string, boolean>>({});

  const toggleTripExpand = (tripId: string) => {
    setExpandedTripIds((prev) => ({
      ...prev,
      [tripId]: !prev[tripId]
    }));
  };
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [forceMobileLoginView, setForceMobileLoginView] = useState(false);
  const [relayDispatchedVehicles, setRelayDispatchedVehicles] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const incidentMarkerRef = useRef<L.Marker | null>(null);

  const activeOrg = organizations.find((o) => o.id === selectedOrgId) || organizations[0];
  const loggedInUser = currentUser || users[0];
  const isCurrentlyAuthed = isAuthenticated && !forceMobileLoginView;

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.assignedDriver?.name && v.assignedDriver.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || v.vehicleType === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sorted vehicles by selected criteria
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    switch (sortBy) {
      case 'battery_asc':
        return (a.latestPosition?.battery ?? 100) - (b.latestPosition?.battery ?? 100);
      case 'battery_desc':
        return (b.latestPosition?.battery ?? 0) - (a.latestPosition?.battery ?? 0);
      case 'fuel_asc':
        return (a.fuelLevelPercent ?? 100) - (b.fuelLevelPercent ?? 100);
      case 'fuel_desc':
        return (b.fuelLevelPercent ?? 0) - (a.fuelLevelPercent ?? 0);
      case 'distance_desc':
        return (b.dailyDistanceKm ?? 0) - (a.dailyDistanceKm ?? 0);
      case 'last_seen_desc':
        return new Date(b.latestPosition?.timestamp || 0).getTime() - new Date(a.latestPosition?.timestamp || 0).getTime();
      case 'last_seen_asc':
        return new Date(a.latestPosition?.timestamp || 0).getTime() - new Date(b.latestPosition?.timestamp || 0).getTime();
      case 'speed_desc':
        return (b.latestPosition?.speed ?? 0) - (a.latestPosition?.speed ?? 0);
      case 'default':
      default:
        return a.licensePlate.localeCompare(b.licensePlate);
    }
  });

  // Filtered trips list for Tab 4 with instant responsiveness & smooth animations
  const filteredTrips = useMemo(() => {
    return vehicles
      .map((v) => {
        const dailyTrip = getVehicleDailyTrip(v, trips);
        return { vehicle: v, trip: dailyTrip };
      })
      .filter(({ vehicle, trip }) => {
        const search = tripSearchTerm.trim().toLowerCase();
        const matchesSearch =
          !search ||
          vehicle.licensePlate.toLowerCase().includes(search) ||
          vehicle.make.toLowerCase().includes(search) ||
          vehicle.model.toLowerCase().includes(search) ||
          trip.startAddress.toLowerCase().includes(search) ||
          trip.endAddress.toLowerCase().includes(search);

        if (!matchesSearch) return false;

        if (tripFilterCategory === 'long-haul') {
          return trip.distanceKm >= 100;
        }
        if (tripFilterCategory === 'urban') {
          return trip.distanceKm < 100;
        }
        if (tripFilterCategory === 'moving') {
          return (vehicle.latestPosition?.speed || 0) > 2 || vehicle.status === 'moving';
        }
        return true;
      });
  }, [vehicles, trips, tripSearchTerm, tripFilterCategory]);

  // Pull to refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Remote Relay Immobilizer Toggle
  const handleImmobilizerToggle = (veh: Vehicle) => {
    const isCurrentlyCut = relayDispatchedVehicles[veh.id] ?? false;
    const nextState = !isCurrentlyCut;
    setRelayDispatchedVehicles((prev) => ({ ...prev, [veh.id]: nextState }));
    if (onToggleRelay) {
      onToggleRelay(veh.id, nextState);
    }
  };

  // Inspect Alert on Map Handler (Opens Map with Telemetry Detail Sheet)
  const handleInspectAlertOnMap = (alt: Alert) => {
    setActiveAlertInspection(alt);
    setIsAlertDetailSheetOpen(true);
    setIsDetailSheetOpen(false);
    setSelectedTripForModal(null);
    setInstantReplayTrip(null);
    setIsResolving(false);
    setResolutionNotes('');

    const targetVeh = vehicles.find((v) => v.id === alt.vehicleId || v.licensePlate === alt.vehiclePlate);
    if (targetVeh) {
      setSelectedVehicle(targetVeh);
    }

    if (onMarkAlertAsRead && !alt.isRead) {
      onMarkAlertAsRead(alt.id);
    }

    setActiveTab('radar');

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([alt.latitude, alt.longitude], 16, { animate: true });
    }
  };

  // Dismiss / Clear Active Alert Inspection
  const handleDismissAlertInspection = () => {
    setActiveAlertInspection(null);
    setIsAlertDetailSheetOpen(false);
    setIsResolving(false);
    if (incidentMarkerRef.current) {
      incidentMarkerRef.current.remove();
      incidentMarkerRef.current = null;
    }
  };

  // Acknowledge Alert Handler
  const handleAcknowledgeAlert = (alt: Alert) => {
    const updated: Alert = { ...alt, triageStatus: 'acknowledged', isRead: true };
    setActiveAlertInspection(updated);
    if (onUpdateAlert) {
      onUpdateAlert(updated);
    }
  };

  // Resolve Alert Handler
  const handleResolveAlert = (alt: Alert, notes?: string) => {
    const updated: Alert = {
      ...alt,
      triageStatus: 'resolved',
      isRead: true,
      assignedTo: currentUser?.name || 'Mobile Dispatcher',
      resolutionNotes: notes || resolutionNotes || 'Resolved from Mobile Telemetry Map',
      resolvedAt: new Date().toISOString()
    };
    setActiveAlertInspection(updated);
    setIsResolving(false);
    if (onUpdateAlert) {
      onUpdateAlert(updated);
    }
  };

  // Copy GPS Coordinates
  const handleCopyCoords = (lat: number, lng: number) => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Initialize and update Leaflet Map in Radar View
  useEffect(() => {
    if (!isCurrentlyAuthed || activeTab !== 'radar') return;
    if (!mapContainerRef.current) return;

    const tileUrls: Record<'carto' | 'satellite' | 'streets', string> = {
      carto: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    };

    if (!mapInstanceRef.current) {
      const initialLat = activeAlertInspection ? activeAlertInspection.latitude : 33.5731;
      const initialLng = activeAlertInspection ? activeAlertInspection.longitude : -7.5898;
      const initialZoom = activeAlertInspection ? 16 : 12;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([initialLat, initialLng], initialZoom);

      tileLayerRef.current = L.tileLayer(tileUrls[alertMapLayer], {
        maxZoom: 19,
        subdomains: alertMapLayer === 'carto' ? 'abcd' : 'abc'
      }).addTo(map);

      // Add zoom control top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      // Update tile layer if changed
      if (tileLayerRef.current) {
        tileLayerRef.current.setUrl(tileUrls[alertMapLayer]);
      }
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Invalidate size after layout mounts
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // Sync Vehicle Markers with Top-Down Miniature Visuals
    const currentMarkerIds = new Set<string>();

    vehicles.forEach((veh) => {
      const { latitude, longitude } = veh.latestPosition;
      currentMarkerIds.add(veh.id);

      const markerHtml = buildLeafletVehicleMarkerHtml(veh);

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-mobile-vehicle-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      if (markersRef.current[veh.id]) {
        markersRef.current[veh.id].setLatLng([latitude, longitude]);
        markersRef.current[veh.id].setIcon(customIcon);
      } else {
        const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedVehicle(veh);
          setIsDetailSheetOpen(true);
        });
        markersRef.current[veh.id] = marker;
      }
    });

    // Remove markers that are no longer present
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentMarkerIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Sync Incident Spotlight Marker if activeAlertInspection is active
    if (activeAlertInspection) {
      const isCritical = activeAlertInspection.severity === 'critical';
      const isWarning = activeAlertInspection.severity === 'warning';
      const incidentColor = isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#3b82f6';

      const incidentMarkerHtml = `
        <div class="relative flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
          <div class="absolute -inset-6 rounded-full opacity-70 animate-ping pointer-events-none" style="background-color: ${incidentColor}33;"></div>
          <div class="absolute -inset-3 rounded-full border-2 border-dashed animate-spin pointer-events-none" style="border-color: ${incidentColor}; animation-duration: 9s;"></div>
          <div class="relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white font-mono text-xs font-black shadow-2xl border-2 border-white/90" style="background-color: ${incidentColor};">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span>${activeAlertInspection.vehiclePlate}</span>
          </div>
          <div class="w-3 h-3 rotate-45 -mt-1.5 shadow-lg border-r-2 border-b-2 border-white/90" style="background-color: ${incidentColor};"></div>
        </div>
      `;

      const incidentIcon = L.divIcon({
        html: incidentMarkerHtml,
        className: 'custom-mobile-incident-spotlight',
        iconSize: [0, 0]
      });

      if (incidentMarkerRef.current) {
        incidentMarkerRef.current.setLatLng([activeAlertInspection.latitude, activeAlertInspection.longitude]);
        incidentMarkerRef.current.setIcon(incidentIcon);
      } else {
        const marker = L.marker([activeAlertInspection.latitude, activeAlertInspection.longitude], {
          icon: incidentIcon,
          zIndexOffset: 1200
        }).addTo(map);
        marker.on('click', () => {
          setIsAlertDetailSheetOpen(true);
        });
        incidentMarkerRef.current = marker;
      }
    } else {
      if (incidentMarkerRef.current) {
        incidentMarkerRef.current.remove();
        incidentMarkerRef.current = null;
      }
    }
  }, [activeTab, vehicles, isCurrentlyAuthed, activeAlertInspection, alertMapLayer]);

  // Center map on vehicle
  const handleCenterOnVehicle = (veh: Vehicle) => {
    setSelectedVehicle(veh);
    setActiveTab('radar');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([veh.latestPosition.latitude, veh.latestPosition.longitude], 15, {
        animate: true
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-100 dark:bg-[#09090b] text-slate-900 dark:text-white flex flex-col w-full h-[100dvh] overflow-hidden select-none font-sans">
      
      {/* 1. Mobile Native-Grade App Bar */}
      <header className="px-4 py-2.5 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800/80 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-black font-black text-sm shadow-md shadow-emerald-500/20 shrink-0">
            FM
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-black italic tracking-tight text-slate-900 dark:text-white leading-none truncate">
              FLOTTE<span className="text-slate-400 dark:text-zinc-500">MAESTRO</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider truncate">
                {activeOrg.name}
              </span>
            </div>
          </div>
        </div>

        {/* Top Actions: Theme, Lang, Switch to Web Console, Sign Out */}
        <div className="flex items-center gap-1.5">
          {/* Theme Toggle Button */}
          <ThemeToggle variant="icon" />

          {/* Switch to Web Admin Console */}
          <button
            onClick={onSwitchToWebConsole}
            title="Switch to Web Management Console"
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-900/90 hover:bg-slate-200 dark:hover:bg-zinc-800 text-[10px] font-bold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 flex items-center gap-1 transition-colors"
          >
            <Monitor className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Web Console</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => onLangChange(currentLang === 'en' ? 'fr' : currentLang === 'fr' ? 'ar' : 'en')}
            className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-zinc-900 text-[10px] font-mono font-bold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800"
          >
            {currentLang.toUpperCase()}
          </button>

          {/* Logout / Lock */}
          {isCurrentlyAuthed && (
            <button
              onClick={() => setForceMobileLoginView(true)}
              title="Lock / Sign Out"
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 border border-slate-200 dark:border-zinc-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN APP CONTENT OR LOGIN */}
      {!isCurrentlyAuthed ? (
        <div className="flex-1 overflow-y-auto">
          <MobileLoginView
            organizations={organizations}
            selectedOrgId={selectedOrgId}
            onSelectOrg={onSelectOrg}
            users={users}
            onLogin={(user) => {
              setForceMobileLoginView(false);
              onLogin(user);
            }}
            currentLang={currentLang}
            onLangChange={onLangChange}
            t={t}
          />
        </div>
      ) : (
        <main className="flex-1 relative overflow-hidden flex flex-col">
          
          {/* TAB 1: LIVE RADAR MAP */}
          {activeTab === 'radar' && (
            <div className="relative w-full h-full flex-1 flex flex-col">
              {/* Top Controls: Status Filter Pills or Incident Spotlight Header */}
              {!activeAlertInspection ? (
                <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-md ${
                      statusFilter === 'all'
                        ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                        : 'bg-white/90 text-slate-700 border border-slate-200 dark:bg-zinc-900/90 dark:text-zinc-300 dark:border-zinc-800 backdrop-blur-md'
                    }`}
                  >
                    All ({vehicles.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('moving')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-md flex items-center gap-1.5 ${
                      statusFilter === 'moving'
                        ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                        : 'bg-white/90 text-emerald-700 border border-slate-200 dark:bg-zinc-900/90 dark:text-emerald-400 dark:border-zinc-800 backdrop-blur-md'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Moving ({vehicles.filter((v) => v.status === 'moving').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('idle')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-md ${
                      statusFilter === 'idle'
                        ? 'bg-amber-500 text-black shadow-amber-500/30'
                        : 'bg-white/90 text-amber-700 border border-slate-200 dark:bg-zinc-900/90 dark:text-amber-400 dark:border-zinc-800 backdrop-blur-md'
                    }`}
                  >
                    Idle ({vehicles.filter((v) => v.status === 'idle').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('stopped')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-md ${
                      statusFilter === 'stopped'
                        ? 'bg-blue-600 text-white shadow-blue-500/30'
                        : 'bg-white/90 text-blue-700 border border-slate-200 dark:bg-zinc-900/90 dark:text-blue-400 dark:border-zinc-800 backdrop-blur-md'
                    }`}
                  >
                    Parked ({vehicles.filter((v) => v.status === 'stopped').length})
                  </button>
                </div>
              ) : (
                <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-rose-500/50 shadow-2xl animate-in slide-in-from-top-2 text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        activeAlertInspection.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40'
                          : activeAlertInspection.severity === 'warning'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/40'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-black uppercase text-rose-600 dark:text-rose-400">
                          Incident Spotlight
                        </span>
                        <span className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded font-bold text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800">
                          {activeAlertInspection.vehiclePlate}
                        </span>
                      </div>
                      <p className="text-xs font-bold truncate text-slate-900 dark:text-white leading-tight mt-0.5">
                        {activeAlertInspection.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.setView([activeAlertInspection.latitude, activeAlertInspection.longitude], 16, {
                            animate: true
                          });
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors border border-slate-200 dark:border-zinc-800"
                      title="Recenter Map on Incident"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAlertMapLayer((prev) => (prev === 'carto' ? 'satellite' : prev === 'satellite' ? 'streets' : 'carto'));
                      }}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors border border-slate-200 dark:border-zinc-800"
                      title="Toggle Map Style (Dark / Satellite / Street)"
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    </button>

                    <button
                      type="button"
                      onClick={handleDismissAlertInspection}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors"
                      title="Exit Incident Inspection"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Full Interactive Map Container */}
              <div ref={mapContainerRef} className="w-full h-full flex-1 bg-slate-100 dark:bg-black z-0" />

              {/* Bottom Strip: Quick Vehicle Strip or Minimized Alert Pill */}
              {!activeAlertInspection ? (
                <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-white/95 dark:bg-zinc-950/90 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 rounded-2xl p-2 shadow-2xl">
                  <div className="flex items-center justify-between px-2 pb-1.5 border-b border-slate-100 dark:border-zinc-900 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">
                    <span>Monitored Assets ({filteredVehicles.length})</span>
                    <button onClick={handleRefresh} className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                      <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
                    {filteredVehicles.slice(0, 6).map((v) => {
                      const isSelected = selectedVehicle?.id === v.id;
                      return (
                        <div
                          key={v.id}
                          onClick={() => {
                            setSelectedVehicle(v);
                            setIsDetailSheetOpen(true);
                            handleCenterOnVehicle(v);
                          }}
                          className={`p-2 rounded-xl flex items-center gap-2 shrink-0 cursor-pointer border transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500/50 text-slate-900 dark:bg-emerald-950/40 dark:border-emerald-500/50 dark:text-white shadow-md'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-0.5 flex items-center justify-center shrink-0">
                            <VehicleMiniatureIcon vehicleType={v.vehicleType} color={v.color} make={v.make} size={24} />
                          </div>
                          <div className="text-left">
                            <p className="font-mono font-bold text-xs leading-none text-slate-900 dark:text-white">{v.licensePlate}</p>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate max-w-[90px] mt-0.5">{v.make} {v.model}</p>
                          </div>
                          <span className="font-mono font-bold text-[11px] text-emerald-600 dark:text-emerald-400 ml-1">
                            {v.latestPosition.speed} <span className="text-[8px] font-normal text-slate-400 dark:text-zinc-500">km/h</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : !isAlertDetailSheetOpen ? (
                <button
                  type="button"
                  onClick={() => setIsAlertDetailSheetOpen(true)}
                  className="absolute bottom-3 left-3 right-3 z-[1000] p-3.5 rounded-2xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-rose-500/40 shadow-2xl flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white cursor-pointer hover:border-rose-500 transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="truncate">View Telemetry Disposition ({activeAlertInspection.vehiclePlate})</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] shrink-0">
                    <span>Details</span>
                    <ChevronUp className="w-4 h-4" />
                  </div>
                </button>
              ) : null}
            </div>
          )}

          {/* TAB 2: FLEET ASSETS DIRECTORY */}
          {activeTab === 'fleet' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {/* Search Bar & Sort Dropdown Row */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Plate, Make, Model, Driver..."
                    className="w-full bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>

                {/* Sort Control Dropdown Bar */}
                <div className="flex items-center justify-between gap-2 bg-white dark:bg-zinc-950 p-2 rounded-2xl border border-slate-200 dark:border-zinc-800/90 shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 pl-1">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">Sort By:</span>
                  </div>

                  <div className="relative flex-1 max-w-[210px]">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full appearance-none bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer pr-6"
                    >
                      <option value="default">Plate (A-Z)</option>
                      <option value="battery_asc">⚡ Battery Level (Lowest / Issues)</option>
                      <option value="battery_desc">⚡ Battery Level (Highest)</option>
                      <option value="fuel_asc">⛽ Fuel Level (Lowest / Refuel)</option>
                      <option value="fuel_desc">⛽ Fuel Level (Highest)</option>
                      <option value="distance_desc">📍 Distance Today (Highest)</option>
                      <option value="last_seen_desc">🕒 Last Seen (Most Recent)</option>
                      <option value="last_seen_asc">⚠️ Last Seen (Oldest / Inactive)</option>
                      <option value="speed_desc">🚀 Speed (Highest First)</option>
                    </select>
                    <ArrowDownWideNarrow className="w-3 h-3 text-slate-400 dark:text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {['all', 'van', 'truck', 'reefer', 'suv', 'sedan'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase transition-all shrink-0 ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-black shadow-xs'
                        : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Quick Summary Bar */}
              <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 dark:text-zinc-400 font-mono">
                <span>Showing {sortedVehicles.length} vehicles</span>
                {sortBy !== 'default' && (
                  <button
                    onClick={() => setSortBy('default')}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[10px]"
                  >
                    <span>Reset sort</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Vehicle Cards List */}
              <div className="space-y-3">
                {sortedVehicles.map((v) => {
                  const isLowBattery = (v.latestPosition?.battery ?? 100) < 25;
                  const isLowFuel = (v.fuelLevelPercent ?? 100) < 20;
                  const lastSeenDate = new Date(v.latestPosition?.timestamp || Date.now());

                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        setSelectedVehicle(v);
                        setIsDetailSheetOpen(true);
                      }}
                      className="p-4 rounded-2xl bg-white dark:bg-zinc-900/40 hover:bg-slate-50/80 dark:hover:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 flex flex-col gap-3 transition-all cursor-pointer shadow-xs dark:shadow-none"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                            <VehicleMiniatureIcon vehicleType={v.vehicleType} color={v.color} make={v.make} size={36} showBrandBadge />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-950 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                                {v.licensePlate}
                              </span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20">
                                {v.status}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 mt-1">
                              {v.make} {v.model} ({v.modelYear})
                            </h4>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">
                            {v.latestPosition.speed}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">km/h</span>
                        </div>
                      </div>

                      {/* Highlight Badges when issues detected */}
                      {(isLowBattery || isLowFuel) && (
                        <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold">
                          {isLowBattery && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                              Low Battery Warning ({v.latestPosition.battery}%)
                            </span>
                          )}
                          {isLowFuel && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                              <Fuel className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              Refuel Required ({v.fuelLevelPercent}%)
                            </span>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/60 text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                        <div className={`flex items-center gap-1 ${isLowBattery ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}`}>
                          <Battery className={`w-3.5 h-3.5 ${isLowBattery ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`} />
                          <span>{v.latestPosition.battery}%</span>
                        </div>
                        <div className={`flex items-center gap-1 ${isLowFuel ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}`}>
                          <Fuel className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>{v.fuelLevelPercent}%</span>
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <Gauge className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          <span>{v.odometer.toLocaleString()} km</span>
                        </div>
                      </div>

                      {/* Distance Today & Last Seen info row */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-zinc-500 pt-1 border-t border-slate-100 dark:border-zinc-900">
                        <span className="flex items-center gap-1">
                          <Route className="w-3 h-3 text-slate-400 dark:text-zinc-400" />
                          Today: <strong className="text-slate-700 dark:text-zinc-300">{(v.dailyDistanceKm || 0).toFixed(1)} km</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-zinc-400" />
                          Seen: <strong className="text-slate-700 dark:text-zinc-300">{lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}

                {sortedVehicles.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-500 bg-white dark:bg-zinc-900/20 border border-slate-200 dark:border-zinc-800/60 rounded-2xl shadow-xs">
                    No vehicles found matching search criteria.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ALERTS & SECURITY INCIDENTS */}
          {activeTab === 'alerts' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Telemetry Incident Stream ({alerts.length})
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Real-time</span>
              </div>

              {alerts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-500 bg-white dark:bg-zinc-900/20 border border-slate-200 dark:border-zinc-800/60 rounded-2xl shadow-xs">
                  No active incidents recorded.
                </div>
              ) : (
                alerts.map((alt) => {
                  const triage = alt.triageStatus || 'open';
                  const alertTimestamp = alt.createdAt || (alt as any).timestamp || new Date().toISOString();

                  return (
                    <div
                      key={alt.id}
                      onClick={() => handleInspectAlertOnMap(alt)}
                      className={`p-3.5 rounded-2xl border transition-all space-y-2.5 cursor-pointer shadow-xs active:scale-[0.99] group ${
                        triage === 'resolved'
                          ? 'bg-slate-50/60 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-900 text-slate-500 dark:text-zinc-400 opacity-80'
                          : triage === 'acknowledged'
                          ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30 text-slate-800 dark:text-zinc-200'
                          : 'bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:border-emerald-500/60 text-slate-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              alt.severity === 'critical'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : alt.severity === 'warning'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                              {alt.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800">
                                {alt.vehiclePlate}
                              </span>
                              <span
                                className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                                  triage === 'resolved'
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                    : triage === 'acknowledged'
                                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                }`}
                              >
                                {triage}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* View Map Action Icon */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectAlertOnMap(alt);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-500 hover:text-black transition-colors shrink-0"
                          title="Open Map Disposition"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                        {alt.description}
                      </p>

                      {/* Location & Speed Meta */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500 dark:text-zinc-500 pt-2 border-t border-slate-100 dark:border-zinc-900">
                        <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                          <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{alt.address || `${alt.latitude.toFixed(4)}, ${alt.longitude.toFixed(4)}`}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {alt.speed !== undefined && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {alt.speed} km/h
                            </span>
                          )}
                          <span>{new Date(alertTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: TRIPS & DAILY ROUTES */}
          {activeTab === 'trips' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col">
              {/* Header with Stats */}
              <div className="flex flex-col gap-1 border-b border-slate-200 dark:border-zinc-800 pb-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>Daily Route History & Logs</span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                    GPS Replays
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                  <span>Static polyline telemetry maps</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {filteredTrips.length} of {vehicles.length} Tracks
                  </span>
                </div>
              </div>

              {/* Search Bar for Trips */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter by plate, model, city, depot..."
                  value={tripSearchTerm}
                  onChange={(e) => setTripSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
                {tripSearchTerm && (
                  <button
                    onClick={() => setTripSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'long-haul', label: 'Long Haul (≥100km)' },
                    { id: 'urban', label: 'Regional (<100km)' },
                    { id: 'moving', label: 'In Transit' }
                  ] as const
                ).map((chip) => {
                  const isActive = tripFilterCategory === chip.id;
                  return (
                    <motion.button
                      key={chip.id}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setTripFilterCategory(chip.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {chip.label}
                    </motion.button>
                  );
                })}
              </div>

              {/* Animated Trips List with Framer Motion */}
              <motion.div
                variants={tripListContainerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredTrips.map(({ vehicle: v, trip: dailyTrip }) => {
                    const isExpanded = !!expandedTripIds[v.id];
                    return (
                      <motion.div
                        layout
                        key={`trip-${v.id}`}
                        variants={tripCardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover={{ y: -2, transition: { duration: 0.15 } }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => toggleTripExpand(v.id)}
                        className={`p-4 rounded-2xl bg-white dark:bg-zinc-900/40 border transition-all duration-200 cursor-pointer group select-none overflow-hidden space-y-3 shadow-xs ${
                          isExpanded
                            ? 'border-emerald-500/60 ring-2 ring-emerald-500/10 shadow-md'
                            : 'border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40'
                        }`}
                      >
                        {/* Vehicle & Status Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Route className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="font-mono font-bold text-xs text-slate-900 dark:text-white shrink-0">{v.licensePlate}</span>
                            <span className="text-xs text-slate-500 dark:text-zinc-400 truncate">({v.make} {v.model})</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Instant Replay Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInstantReplayTrip({ trip: dailyTrip, vehicle: v });
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-mono font-bold text-[11px] shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
                              title="Launch full-screen animated path replay on map overlay"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Instant Replay</span>
                            </button>

                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="p-1 rounded-full text-slate-400 group-hover:text-emerald-500 dark:text-zinc-500 dark:group-hover:text-emerald-400 transition-colors"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </motion.div>
                          </div>
                        </div>

                        {/* Mini-Map Component with Static Polyline Path */}
                        <TripMiniMap
                          id={`minimap-${v.id}`}
                          waypoints={dailyTrip.waypoints}
                          startAddress={dailyTrip.startAddress}
                          endAddress={dailyTrip.endAddress}
                          distanceKm={dailyTrip.distanceKm}
                          durationMinutes={dailyTrip.durationMinutes}
                          onExpand={() => setSelectedTripForModal(dailyTrip)}
                        />

                        {/* Route Origin & Destination */}
                        <div className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="truncate text-[11px] text-slate-600 dark:text-zinc-400">
                              {dailyTrip.startAddress}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Flag className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span className="truncate text-[11px] font-semibold text-slate-900 dark:text-white">
                              {dailyTrip.endAddress}
                            </span>
                          </div>
                        </div>

                        {/* Primary Route Metrics Row */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                          <span>Distance: <strong className="text-slate-900 dark:text-white">{dailyTrip.distanceKm.toFixed(1)} km</strong></span>
                          <span>Duration: <strong className="text-slate-900 dark:text-white">{Math.floor(dailyTrip.durationMinutes / 60)}h {dailyTrip.durationMinutes % 60}m</strong></span>
                          <span>Avg Speed: <strong className="text-emerald-600 dark:text-emerald-400">{dailyTrip.avgSpeedKmH || 62} km/h</strong></span>
                        </div>

                        {/* Expand / Collapse Indicator Bar */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-zinc-500 pt-0.5 border-t border-slate-100/70 dark:border-zinc-800/60">
                          <span>{isExpanded ? 'Tap card to collapse metrics' : 'Tap card to reveal speed & idle telemetry'}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <span>{isExpanded ? 'Collapse' : 'Expand Metrics'}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </span>
                        </div>

                        {/* Expandable Section with Additional Route Metrics */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              key={`expanded-metrics-${v.id}`}
                              layout
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] }}
                              className="overflow-hidden space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Additional Route Metrics Grid */}
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {/* Max Speed */}
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800/80 flex items-center gap-2.5">
                                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                                    <Gauge className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-zinc-500 font-semibold tracking-wider">
                                      Max Speed
                                    </span>
                                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate">
                                      {dailyTrip.maxSpeedKmH || 88} km/h
                                    </span>
                                  </div>
                                </div>

                                {/* Idle Time */}
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800/80 flex items-center gap-2.5">
                                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <Clock className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-zinc-500 font-semibold tracking-wider">
                                      Idle Time
                                    </span>
                                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate">
                                      {dailyTrip.idleDurationMinutes || 14} min
                                    </span>
                                  </div>
                                </div>

                                {/* Estimated Fuel Consumed */}
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800/80 flex items-center gap-2.5">
                                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <Fuel className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-zinc-500 font-semibold tracking-wider">
                                      Fuel Consumed
                                    </span>
                                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate">
                                      {(dailyTrip.fuelConsumedLiters || (dailyTrip.distanceKm * 0.084)).toFixed(1)} L
                                    </span>
                                  </div>
                                </div>

                                {/* Stops & Operating Window */}
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800/80 flex items-center gap-2.5">
                                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
                                    <Activity className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-zinc-500 font-semibold tracking-wider">
                                      Stops & Window
                                    </span>
                                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate">
                                      {dailyTrip.stopsCount || 2} stops • {dailyTrip.startTime} - {dailyTrip.endTime}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Eco Telemetry Rating */}
                              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-500/20 text-[11px] font-mono">
                                <span className="text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  Eco Telemetry Rating
                                </span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                  96 / 100 (Optimal)
                                </span>
                              </div>

                              {/* Full-Screen Instant Replay Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInstantReplayTrip({ trip: dailyTrip, vehicle: v });
                                }}
                                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Instant Replay (Full-Screen Animated Path)</span>
                                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                              </button>

                              {/* Detailed Telemetry Modal Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTripForModal(dailyTrip);
                                }}
                                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-slate-700 dark:text-zinc-200 text-[11px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200 dark:border-zinc-700/50"
                              >
                                <span>View Waypoint Breakdown & Logs</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Empty Search / Filter State */}
                {filteredTrips.length === 0 && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="p-8 text-center bg-white dark:bg-zinc-900/30 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3 shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800/80 flex items-center justify-center mx-auto text-slate-400 dark:text-zinc-500">
                      <Route className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">No matching trip tracks</p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        {tripSearchTerm
                          ? `No routes match "${tripSearchTerm}" in this category`
                          : 'No trip records match the current filter selection'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setTripSearchTerm('');
                        setTripFilterCategory('all');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}

          {/* TAB 5: PROFILE & DEVICE SECURITY */}
          {activeTab === 'profile' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* User Identity Card */}
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 text-center space-y-3 shadow-xs">
                <img
                  src={loggedInUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                  alt={loggedInUser.name}
                  className="w-16 h-16 rounded-full border-2 border-emerald-500 mx-auto object-cover shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{loggedInUser.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">{loggedInUser.email}</p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="text-[10px] uppercase font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                    {loggedInUser.role.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold border border-slate-200 dark:border-zinc-700">
                    {activeOrg.name}
                  </span>
                </div>
              </div>

              {/* Hardware & Security Info */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">
                  Device & App Environment
                </h4>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-slate-800 dark:text-zinc-200">Biometric Authentication</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">READY</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-slate-800 dark:text-zinc-200">Telematics Downlink TLS</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">v1.3 Encrypted</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs shadow-xs">
                  <span className="font-bold text-slate-700 dark:text-zinc-300">Theme Mode</span>
                  <ThemeToggle variant="pill" />
                </div>
              </div>

              {/* Sign Out CTA */}
              <button
                onClick={() => setForceMobileLoginView(true)}
                className="w-full py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.auth.signOut}</span>
              </button>
            </div>
          )}

          {/* 3. MOBILE BOTTOM SHEET: VEHICLE TELEMETRY INSPECT & IMMOBILIZER */}
          {isDetailSheetOpen && selectedVehicle && (
            <div className="fixed inset-0 z-[2000] bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
              <div className="bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 rounded-t-[32px] w-full max-w-lg p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 shadow-2xl text-slate-900 dark:text-white">
                {/* Drag handle & close */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-900 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-900 p-1 flex items-center justify-center border border-slate-200 dark:border-zinc-800">
                      <VehicleMiniatureIcon vehicleType={selectedVehicle.vehicleType} color={selectedVehicle.color} make={selectedVehicle.make} size={28} />
                    </div>
                    <div>
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">{selectedVehicle.licensePlate}</span>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{selectedVehicle.make} {selectedVehicle.model}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsDetailSheetOpen(false)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Telematics Fast Stats */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/80 text-center">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold block">Speed</span>
                    <span className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">{selectedVehicle.latestPosition.speed}</span>
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500 block">km/h</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/80 text-center">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold block">Battery</span>
                    <span className="font-mono font-black text-lg text-slate-900 dark:text-white">{selectedVehicle.latestPosition.battery}%</span>
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500 block">{selectedVehicle.latestPosition.externalVoltage}V</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/80 text-center">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold block">Fuel</span>
                    <span className="font-mono font-black text-lg text-amber-600 dark:text-amber-400">{selectedVehicle.fuelLevelPercent}%</span>
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500 block">Diesel</span>
                  </div>
                </div>

                {/* Remote Engine Relay Killswitch / Resume Button */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Power className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Remote Engine Immobilizer Relay
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400">Over-the-air circuit cut via GPS hardware</p>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      relayDispatchedVehicles[selectedVehicle.id]
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30'
                        : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                    }`}>
                      {relayDispatchedVehicles[selectedVehicle.id] ? 'ENGINE CUT' : 'RUNNING'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleImmobilizerToggle(selectedVehicle)}
                    className={`w-full py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                      relayDispatchedVehicles[selectedVehicle.id]
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    {relayDispatchedVehicles[selectedVehicle.id] ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        <span>Resume Engine Ignition</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Cut Engine Relay (Immobilize)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Driver Contact & Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setIsDetailSheetOpen(false);
                      handleCenterOnVehicle(selectedVehicle);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-xs font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Track on Radar</span>
                  </button>

                  {selectedVehicle.assignedDriver?.phone && (
                    <a
                      href={`tel:${selectedVehicle.assignedDriver.phone}`}
                      className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Driver</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Trip Replay & Inspection Modal */}
          <AnimatePresence>
            {selectedTripForModal && (
              <TripDetailModal
                trip={selectedTripForModal}
                vehicle={vehicles.find((veh) => veh.id === selectedTripForModal.vehicleId || veh.licensePlate === selectedTripForModal.vehiclePlate)}
                onClose={() => setSelectedTripForModal(null)}
              />
            )}
          </AnimatePresence>

          {/* Full-Screen Animated Trip Path Replay Map Overlay */}
          <AnimatePresence>
            {instantReplayTrip && (
              <FullScreenTripReplayOverlay
                trip={instantReplayTrip.trip}
                vehicle={instantReplayTrip.vehicle}
                onClose={() => setInstantReplayTrip(null)}
              />
            )}
          </AnimatePresence>

          {/* Detailed Alert Position & Telemetry Bottom Sheet (Direct Map Disposition) */}
          {activeAlertInspection && isAlertDetailSheetOpen && activeTab === 'radar' && (
            <div className="fixed inset-x-0 bottom-0 z-[2000] max-h-[85vh] bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-zinc-800 rounded-t-[32px] p-5 shadow-2xl flex flex-col space-y-4 overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-200 text-slate-900 dark:text-white pb-10">
              {/* Drag handle & Top Meta Bar */}
              <div className="flex flex-col items-center gap-2 -mt-1">
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700 shrink-0" />
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full border ${
                        activeAlertInspection.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          : activeAlertInspection.severity === 'warning'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {activeAlertInspection.severity} Priority
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-1 rounded-full border ${
                        activeAlertInspection.triageStatus === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          : activeAlertInspection.triageStatus === 'acknowledged'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {activeAlertInspection.triageStatus || 'open'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsAlertDetailSheetOpen(false)}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors"
                      title="Minimize to view map"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleDismissAlertInspection}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-rose-500 transition-colors"
                      title="Close Alert Inspection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Title & Description Banner */}
              <div className="space-y-1">
                <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-snug">
                  {activeAlertInspection.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {activeAlertInspection.description}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-semibold">
                    Category: {activeAlertInspection.type}
                  </span>
                  {activeAlertInspection.triggerValue && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold">
                      Trigger: {activeAlertInspection.triggerValue}
                    </span>
                  )}
                </div>
              </div>

              {/* Vehicle & Assigned Driver Disposition */}
              {(() => {
                const targetVeh = vehicles.find(
                  (v) => v.id === activeAlertInspection.vehicleId || v.licensePlate === activeAlertInspection.vehiclePlate
                );
                return (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                        <VehicleMiniatureIcon
                          vehicleType={targetVeh?.vehicleType || 'sedan'}
                          color={targetVeh?.color || 'silver'}
                          make={targetVeh?.make || ''}
                          size={32}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono font-black text-sm text-slate-900 dark:text-white leading-tight">
                          {activeAlertInspection.vehiclePlate}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                          {targetVeh ? `${targetVeh.make} ${targetVeh.model}` : 'Asset Telemetry Node'}
                        </p>
                        {targetVeh?.assignedDriver && (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate mt-0.5">
                            Driver: {targetVeh.assignedDriver.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {targetVeh?.assignedDriver?.phone && (
                      <a
                        href={`tel:${targetVeh.assignedDriver.phone}`}
                        className="p-2.5 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0 transition-transform active:scale-95"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="hidden sm:inline">Call Driver</span>
                      </a>
                    )}
                  </div>
                );
              })()}

              {/* Telemetry Metric Tri-Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/80">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Incident Speed</p>
                  <p className="font-mono font-black text-sm text-slate-900 dark:text-white mt-0.5">
                    {activeAlertInspection.speed !== undefined ? `${activeAlertInspection.speed} km/h` : 'N/A'}
                  </p>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/80">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Event Time</p>
                  <p className="font-mono font-bold text-xs text-slate-900 dark:text-white mt-1 truncate">
                    {new Date(activeAlertInspection.createdAt || (activeAlertInspection as any).timestamp || new Date()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/80">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Sensor Type</p>
                  <p className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 mt-1 uppercase truncate">
                    {activeAlertInspection.type}
                  </p>
                </div>
              </div>

              {/* Precise Location & Coordinates Card */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Exact Incident Location</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCoords(activeAlertInspection.latitude, activeAlertInspection.longitude)}
                    className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-emerald-500 transition-colors"
                  >
                    {copiedCoords ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy GPS</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-snug">
                  {activeAlertInspection.address || 'Geo-referenced road coordinate'}
                </p>
                <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                  {activeAlertInspection.latitude.toFixed(6)}, {activeAlertInspection.longitude.toFixed(6)}
                </p>
              </div>

              {/* Resolution Notes Box */}
              {(isResolving || activeAlertInspection.triageStatus === 'resolved') && (
                <div className="space-y-1.5 p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30">
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                    {activeAlertInspection.triageStatus === 'resolved' ? 'Resolution Log:' : 'Dispatcher Resolution Notes:'}
                  </p>
                  {activeAlertInspection.triageStatus === 'resolved' ? (
                    <p className="text-xs text-slate-700 dark:text-zinc-300 font-mono">
                      {activeAlertInspection.resolutionNotes || 'Resolved without notes'}
                    </p>
                  ) : (
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Enter security/dispatch resolution notes..."
                      className="w-full h-16 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  )}
                </div>
              )}

              {/* Action Disposition Buttons Footer */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  {activeAlertInspection.triageStatus !== 'acknowledged' && activeAlertInspection.triageStatus !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => handleAcknowledgeAlert(activeAlertInspection)}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  {activeAlertInspection.triageStatus !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isResolving) {
                          handleResolveAlert(activeAlertInspection, resolutionNotes);
                        } else {
                          setIsResolving(true);
                        }
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isResolving ? 'Confirm Resolution' : 'Resolve Incident'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {(() => {
                    const targetVeh = vehicles.find(
                      (v) => v.id === activeAlertInspection.vehicleId || v.licensePlate === activeAlertInspection.vehiclePlate
                    );
                    if (!targetVeh) return null;
                    const isImmobilized = relayDispatchedVehicles[targetVeh.id] ?? false;

                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            handleCenterOnVehicle(targetVeh);
                            handleDismissAlertInspection();
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Track Asset Live</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleImmobilizerToggle(targetVeh)}
                          className={`px-3 py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 ${
                            isImmobilized
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40'
                              : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          }`}
                          title="Remote Immobilizer Relay Cut"
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{isImmobilized ? 'Restore Engine' : 'Cut Relay'}</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

        </main>
      )}

      {/* 4. Native-Feeling Mobile Bottom Navigation Bar */}
      {isCurrentlyAuthed && (
        <nav className="border-t border-slate-200 dark:border-zinc-800/80 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl px-2 py-2 flex items-center justify-around z-40 shrink-0 pb-safe shadow-lg">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'radar' ? 'text-emerald-600 dark:text-emerald-400 scale-105' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'fleet' ? 'text-emerald-600 dark:text-emerald-400 scale-105' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
            }`}
          >
            <Truck className="w-5 h-5" />
            <span>Fleet</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition-all relative cursor-pointer ${
              activeTab === 'alerts' ? 'text-emerald-600 dark:text-emerald-400 scale-105' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-3" />
            <span>Alerts</span>
          </button>

          <button
            onClick={() => setActiveTab('trips')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'trips' ? 'text-emerald-600 dark:text-emerald-400 scale-105' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
            }`}
          >
            <Route className="w-5 h-5" />
            <span>Trips</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'profile' ? 'text-emerald-600 dark:text-emerald-400 scale-105' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span>Account</span>
          </button>
        </nav>
      )}
    </div>
  );
};
