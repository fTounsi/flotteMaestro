import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  LayoutDashboard,
  Truck,
  Bell,
  Settings,
  Battery,
  Fuel,
  Gauge,
  Clock,
  Route,
  AlertTriangle,
  User as UserIcon,
  Shield,
  Fingerprint,
  LogOut,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Lock,
  Smartphone,
  SlidersHorizontal,
  ArrowDownWideNarrow,
  MapPin,
  X,
  ChevronDown,
  ChevronUp,
  Phone,
  Copy,
  Check,
  Navigation,
  Power
} from 'lucide-react';
import { Vehicle, Geofence, Alert, FleetReport, Organization, User } from '../../types/fleet';
import { TranslationDictionary, Language } from '../../translations/i18n';
import { MobileLoginView } from './MobileLoginView';
import { ThemeToggle } from '../common/ThemeToggle';
import { buildLeafletVehicleMarkerHtml, VehicleMiniatureIcon } from '../common/VehicleMiniatureIcon';

interface MobileAppFrameProps {
  vehicles: Vehicle[];
  geofences: Geofence[];
  alerts: Alert[];
  reports: FleetReport[];
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
  onOpenStandalone?: () => void;
  onUpdateAlert?: (alert: Alert) => void;
  onMarkAlertAsRead?: (alertId: string) => void;
  t: TranslationDictionary;
}

export const MobileAppFrame: React.FC<MobileAppFrameProps> = ({
  vehicles,
  geofences,
  alerts,
  reports,
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
  onOpenStandalone,
  onUpdateAlert,
  onMarkAlertAsRead,
  t
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vehicles' | 'alerts' | 'profile'>('dashboard');
  const [deviceModel, setDeviceModel] = useState<'iphone' | 'pixel' | 'responsive'>('iphone');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(vehicles[0] || null);
  const [activeAlertInspection, setActiveAlertInspection] = useState<Alert | null>(null);
  const [isAlertDetailSheetOpen, setIsAlertDetailSheetOpen] = useState(true);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
  const [forceMobileLoginView, setForceMobileLoginView] = useState(false);

  const mobileMapContainerRef = useRef<HTMLDivElement>(null);
  const mobileMapInstanceRef = useRef<L.Map | null>(null);
  const mobileMarkersRef = useRef<Record<string, L.Marker>>({});
  const incidentMarkerRef = useRef<L.Marker | null>(null);

  const activeOrg = organizations.find((o) => o.id === selectedOrgId) || organizations[0];
  const loggedInUser = currentUser || users[0];
  const isCurrentlyAuthed = isAuthenticated && !forceMobileLoginView;

  // Handle opening alert directly on map
  const handleInspectAlertOnMap = (alert: Alert) => {
    setActiveAlertInspection(alert);
    setIsAlertDetailSheetOpen(true);
    setIsResolving(false);
    setResolutionNotes('');
    setActiveTab('dashboard');

    if (onMarkAlertAsRead) {
      onMarkAlertAsRead(alert.id);
    }

    setTimeout(() => {
      if (mobileMapInstanceRef.current) {
        mobileMapInstanceRef.current.invalidateSize();
        mobileMapInstanceRef.current.setView([alert.latitude, alert.longitude], 16, {
          animate: true
        });
      }
    }, 100);
  };

  const handleDismissAlertInspection = () => {
    setActiveAlertInspection(null);
    setIsAlertDetailSheetOpen(false);
    setIsResolving(false);
    if (incidentMarkerRef.current && mobileMapInstanceRef.current) {
      mobileMapInstanceRef.current.removeLayer(incidentMarkerRef.current);
      incidentMarkerRef.current = null;
    }
  };

  const handleCopyCoords = (lat: number, lng: number) => {
    const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleAcknowledgeAlert = (alert: Alert) => {
    if (onUpdateAlert) {
      onUpdateAlert({ ...alert, triageStatus: 'acknowledged', isRead: true });
    }
    setActiveAlertInspection((prev) => (prev ? { ...prev, triageStatus: 'acknowledged', isRead: true } : null));
  };

  const handleResolveAlert = (alert: Alert, notes: string) => {
    if (onUpdateAlert) {
      onUpdateAlert({
        ...alert,
        isRead: true,
        triageStatus: 'resolved',
        assignedTo: currentUser?.name || 'Mobile Dispatcher',
        resolutionNotes: notes,
        resolvedAt: new Date().toISOString()
      });
    }
    setActiveAlertInspection(null);
    setIsAlertDetailSheetOpen(false);
  };

  // Initialize and update mobile radar map
  useEffect(() => {
    if (!isCurrentlyAuthed) return;
    if (activeTab !== 'dashboard') return;
    if (!mobileMapContainerRef.current) return;

    if (!mobileMapInstanceRef.current) {
      const map = L.map(mobileMapContainerRef.current, {
        center: [33.5731, -7.5898],
        zoom: 11,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abc',
        maxZoom: 19
      }).addTo(map);

      mobileMapInstanceRef.current = map;
    }

    const map = mobileMapInstanceRef.current;
    if (map) {
      vehicles.forEach((veh) => {
        const pos = veh.latestPosition;
        const markerHtml = buildLeafletVehicleMarkerHtml(
          {
            id: veh.id,
            make: veh.make,
            model: veh.model,
            vehicleType: veh.vehicleType,
            color: veh.color || '#0284c7',
            licensePlate: veh.licensePlate,
            status: veh.status,
            latestPosition: {
              speed: pos.speed,
              heading: pos.heading,
              ignition: pos.ignition
            }
          },
          false
        );

        const icon = L.divIcon({
          className: 'mob-marker',
          html: markerHtml,
          iconSize: [44, 58],
          iconAnchor: [22, 29]
        });

        if (mobileMarkersRef.current[veh.id]) {
          mobileMarkersRef.current[veh.id].setLatLng([pos.latitude, pos.longitude]);
          mobileMarkersRef.current[veh.id].setIcon(icon);
        } else {
          const marker = L.marker([pos.latitude, pos.longitude], { icon }).addTo(map);
          marker.on('click', () => setSelectedVehicle(veh));
          mobileMarkersRef.current[veh.id] = marker;
        }
      });

      // Handle Incident Spotlight Marker
      if (activeAlertInspection) {
        if (incidentMarkerRef.current) {
          map.removeLayer(incidentMarkerRef.current);
        }

        const isCritical = activeAlertInspection.severity === 'critical';
        const colorHex = isCritical ? '#f43f5e' : '#f59e0b';

        const incidentMarkerHtml = `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <div class="absolute w-12 h-12 rounded-full animate-ping opacity-75" style="background-color: ${colorHex};"></div>
            <div class="absolute w-8 h-8 rounded-full animate-pulse opacity-90" style="background-color: ${colorHex};"></div>
            <div class="relative w-7 h-7 rounded-full bg-black border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${colorHex}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
          </div>
        `;

        const incidentIcon = L.divIcon({
          className: 'incident-spotlight-marker',
          html: incidentMarkerHtml,
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        });

        const incMarker = L.marker([activeAlertInspection.latitude, activeAlertInspection.longitude], {
          icon: incidentIcon,
          zIndexOffset: 1000
        }).addTo(map);

        incidentMarkerRef.current = incMarker;
      } else if (incidentMarkerRef.current) {
        map.removeLayer(incidentMarkerRef.current);
        incidentMarkerRef.current = null;
      }
    }
  }, [activeTab, vehicles, isCurrentlyAuthed, activeAlertInspection]);

  return (
    <div className="flex flex-col items-center justify-center py-4 space-y-6">
      {/* Top Device Bar & Quick Auth State Toggle */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Device Form Factor Switcher */}
        <div className="flex items-center gap-2 bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800 text-xs">
          <button
            onClick={() => setDeviceModel('iphone')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              deviceModel === 'iphone' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.mobile.iphone}
          </button>
          <button
            onClick={() => setDeviceModel('pixel')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              deviceModel === 'pixel' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.mobile.pixel}
          </button>
          <button
            onClick={() => setDeviceModel('responsive')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              deviceModel === 'responsive' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.mobile.fullScreen}
          </button>
        </div>

        {/* Quick Mobile Auth Preview Toggle */}
        <div className="flex items-center bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800 text-xs">
          <button
            onClick={() => {
              setForceMobileLoginView(false);
              if (!isAuthenticated) onLogin(loggedInUser);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              isCurrentlyAuthed ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mobile App</span>
          </button>
          <button
            onClick={() => setForceMobileLoginView(true)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              !isCurrentlyAuthed ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Mobile Login</span>
          </button>
        </div>

        {/* Standalone Mobile App Launch Button */}
        {onOpenStandalone && (
          <button
            onClick={onOpenStandalone}
            className="px-3.5 py-1.5 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Dedicated Mobile App (Full Screen)</span>
          </button>
        )}

        {/* Theme Switcher Toggle */}
        <ThemeToggle variant="pill" />
      </div>

      {/* Device Chassis Frame */}
      <div
        className={`transition-all duration-300 ${
          deviceModel === 'iphone'
            ? 'w-[390px] h-[820px] rounded-[54px] border-[10px] border-zinc-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] relative overflow-hidden bg-[#080808] flex flex-col ring-1 ring-zinc-700/60'
            : deviceModel === 'pixel'
            ? 'w-[400px] h-[830px] rounded-[44px] border-[10px] border-zinc-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] relative overflow-hidden bg-[#080808] flex flex-col ring-1 ring-zinc-700/60'
            : 'w-full max-w-lg min-h-[750px] rounded-[32px] border border-zinc-800 shadow-2xl bg-[#080808] flex flex-col overflow-hidden'
        }`}
      >
        {/* Dynamic Island / Notch */}
        {deviceModel === 'iphone' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3 border border-zinc-800/80">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
          </div>
        )}

        {/* Mobile Status Bar */}
        <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-bold text-zinc-400 z-40 bg-[#080808]/90 backdrop-blur-md select-none">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-emerald-400 font-mono font-bold">5G</span>
            <Battery className="w-3.5 h-3.5 text-zinc-300" />
          </div>
        </div>

        {/* Mobile Brand Header */}
        <div className="px-5 py-3 border-b border-zinc-900 bg-[#080808] flex items-center justify-between">
          <div>
            <h4 className="text-base font-black italic tracking-tighter leading-none text-white">
              FLOTTE<span className="text-zinc-600">MAESTRO</span>
            </h4>
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold block mt-0.5">
              {activeOrg.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => onLangChange(currentLang === 'en' ? 'fr' : currentLang === 'fr' ? 'ar' : 'en')}
              className="px-2 py-0.5 rounded-lg bg-zinc-900 text-[10px] font-bold text-white border border-zinc-800"
            >
              {currentLang.toUpperCase()}
            </button>

            {/* Quick Mobile Auth Button */}
            {isCurrentlyAuthed ? (
              <button
                onClick={() => setForceMobileLoginView(true)}
                title="Lock / Sign Out"
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* CONDITION 1: MOBILE LOGIN VIEW */}
        {!isCurrentlyAuthed ? (
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
        ) : (
          /* CONDITION 2: LOGGED-IN MOBILE FLEET PORTAL */
          <>
            {/* Mobile Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 text-zinc-100 space-y-4">
              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Incident Spotlight Banner when Inspecting an Alert */}
                  {activeAlertInspection ? (
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-2 shadow-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4 animate-pulse" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                              {activeAlertInspection.severity} Alert
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {activeAlertInspection.vehiclePlate}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white truncate mt-0.5">
                            {activeAlertInspection.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!isAlertDetailSheetOpen && (
                          <button
                            type="button"
                            onClick={() => setIsAlertDetailSheetOpen(true)}
                            className="px-2.5 py-1 rounded-xl bg-white text-black font-bold text-[11px] shadow-sm hover:bg-zinc-200 transition-colors"
                          >
                            Details
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleDismissAlertInspection}
                          className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                          title="Exit Alert Map Mode"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Fleet Metric Stats when not inspecting alert */
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-zinc-900/40 p-3.5 rounded-[24px] border border-zinc-800 shadow-md">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block">
                          Active Moving
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-black text-emerald-400 font-mono">
                            {vehicles.filter((v) => v.status === 'moving').length}
                          </span>
                          <span className="text-[10px] text-zinc-500">/ {vehicles.length}</span>
                        </div>
                      </div>

                      <div className="bg-zinc-900/40 p-3.5 rounded-[24px] border border-zinc-800 shadow-md">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block">
                          Stationary
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-black text-white font-mono">
                            {vehicles.filter((v) => v.status === 'stopped' || v.status === 'idle').length}
                          </span>
                          <span className="text-[10px] text-zinc-500">units</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Live Map Container */}
                  <div
                    className={`rounded-[24px] overflow-hidden border border-zinc-800 relative shadow-xl bg-black isolate z-0 transition-all duration-300 ${
                      activeAlertInspection ? 'h-64' : 'h-48'
                    }`}
                  >
                    <div ref={mobileMapContainerRef} className="w-full h-full" />

                    {/* Minimized bottom alert pill on map when sheet is collapsed */}
                    {activeAlertInspection && !isAlertDetailSheetOpen && (
                      <div className="absolute bottom-3 inset-x-3 z-[1000] bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-2.5 flex items-center justify-between shadow-2xl">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-white truncate">
                              {activeAlertInspection.title}
                            </p>
                            <p className="text-[10px] font-mono text-zinc-400 truncate">
                              {activeAlertInspection.address || `${activeAlertInspection.latitude.toFixed(4)}, ${activeAlertInspection.longitude.toFixed(4)}`}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsAlertDetailSheetOpen(true)}
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 shrink-0"
                        >
                          <span>Expand</span>
                          <ChevronUp className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick Vehicle List when not inspecting alert */}
                  {!activeAlertInspection && (
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Live Unit Telemetry
                      </h5>
                      {vehicles.slice(0, 4).map((v) => (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVehicle(v)}
                          className="p-3 rounded-2xl bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs text-white bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                                {v.licensePlate}
                              </span>
                              <span className="text-xs font-semibold text-zinc-300">
                                {v.make} {v.model}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-500 block mt-0.5 capitalize">
                              {v.status} • {v.latestPosition.battery}% Batt
                            </span>
                          </div>

                          <span className="font-mono font-bold text-xs text-emerald-400">
                            {v.latestPosition.speed} km/h
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: VEHICLES */}
              {activeTab === 'vehicles' && (() => {
                const filtered = vehicles.filter((v) =>
                  v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  v.model.toLowerCase().includes(searchTerm.toLowerCase())
                );

                const sorted = [...filtered].sort((a, b) => {
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

                return (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search fleet units..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none"
                    />

                    {/* Sort Dropdown */}
                    <div className="flex items-center justify-between gap-2 bg-zinc-950 p-2 rounded-2xl border border-zinc-800">
                      <div className="flex items-center gap-1.5 text-zinc-400 pl-1">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Sort:</span>
                      </div>

                      <div className="relative flex-1 max-w-[190px]">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="w-full appearance-none bg-zinc-900 border border-zinc-700 text-white rounded-xl px-2 py-1 text-[11px] font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer pr-5"
                        >
                          <option value="default">Plate (A-Z)</option>
                          <option value="battery_asc">⚡ Battery Level (Issues first)</option>
                          <option value="battery_desc">⚡ Battery Level (Highest)</option>
                          <option value="fuel_asc">⛽ Fuel Level (Lowest first)</option>
                          <option value="fuel_desc">⛽ Fuel Level (Highest)</option>
                          <option value="distance_desc">📍 Distance Today (Highest)</option>
                          <option value="last_seen_desc">🕒 Last Seen (Most Recent)</option>
                          <option value="last_seen_asc">⚠️ Last Seen (Oldest)</option>
                          <option value="speed_desc">🚀 Speed (Highest First)</option>
                        </select>
                        <ArrowDownWideNarrow className="w-3 h-3 text-zinc-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {sorted.map((v) => {
                        const isLowBattery = (v.latestPosition?.battery ?? 100) < 25;
                        const isLowFuel = (v.fuelLevelPercent ?? 100) < 20;

                        return (
                          <div
                            key={v.id}
                            className="p-3.5 rounded-2xl bg-zinc-900/30 border border-zinc-800 space-y-2"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-mono font-bold text-xs text-white">{v.licensePlate}</span>
                                <p className="text-xs text-zinc-400">{v.make} {v.model}</p>
                                <span className="text-[9px] text-zinc-500">{v.fleetName}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-emerald-400 font-bold text-xs">{v.latestPosition.speed} km/h</span>
                                <span className="text-[9px] text-zinc-500 block uppercase font-mono">{v.status}</span>
                              </div>
                            </div>

                            {/* Telemetry bar with battery, fuel & distance */}
                            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-zinc-900 text-[10px] font-mono text-zinc-400">
                              <div className={`flex items-center gap-1 ${isLowBattery ? 'text-rose-400 font-bold' : ''}`}>
                                <Battery className="w-3 h-3 text-emerald-400" />
                                <span>{v.latestPosition.battery}%</span>
                              </div>
                              <div className={`flex items-center gap-1 ${isLowFuel ? 'text-amber-400 font-bold' : ''}`}>
                                <Fuel className="w-3 h-3 text-amber-400" />
                                <span>{v.fuelLevelPercent}%</span>
                              </div>
                              <div className="flex items-center gap-1 text-right justify-end">
                                <Route className="w-3 h-3 text-sky-400" />
                                <span>{(v.dailyDistanceKm || 0).toFixed(0)} km</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {sorted.length === 0 && (
                        <div className="p-6 text-center text-xs text-zinc-500">
                          No units found.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* TAB 3: ALERTS */}
              {activeTab === 'alerts' && (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1">
                    <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Push Incidents ({alerts.length})
                    </h5>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold">Real-time</span>
                  </div>

                  {alerts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500 rounded-2xl bg-zinc-900/30 border border-zinc-800">
                      No push incidents recorded.
                    </div>
                  ) : (
                    alerts.map((alt) => {
                      const triage = alt.triageStatus || 'open';
                      const alertTimestamp = alt.createdAt || (alt as any).timestamp || new Date().toISOString();

                      return (
                        <div
                          key={alt.id}
                          onClick={() => handleInspectAlertOnMap(alt)}
                          className={`p-3 rounded-2xl border text-xs space-y-2 cursor-pointer transition-all hover:border-emerald-500/60 active:scale-[0.99] group ${
                            triage === 'resolved'
                              ? 'bg-zinc-950/40 border-zinc-900 text-zinc-400 opacity-80'
                              : triage === 'acknowledged'
                              ? 'bg-amber-500/5 border-amber-500/30 text-zinc-200'
                              : 'bg-zinc-900/40 border-zinc-800 text-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                  alt.severity === 'critical'
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : alt.severity === 'warning'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate block">
                                  {alt.title}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInspectAlertOnMap(alt);
                              }}
                              className="p-1 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black transition-colors shrink-0"
                              title="Open Map Disposition"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-[11px] text-zinc-400">{alt.description}</p>

                          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-800/80">
                            <div className="flex items-center gap-1 truncate max-w-[170px]">
                              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{alt.address || `${alt.latitude.toFixed(4)}, ${alt.longitude.toFixed(4)}`}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-zinc-400 font-mono text-[10px]">{alt.vehiclePlate}</span>
                              <span className="text-emerald-400 font-semibold shrink-0">
                                {new Date(alertTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 4: PROFILE & SECURITY SETTINGS */}
              {activeTab === 'profile' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* User Profile Card */}
                  <div className="p-4 rounded-[24px] bg-zinc-900/50 border border-zinc-800 text-center space-y-2">
                    <img
                      src={loggedInUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                      alt={loggedInUser.name}
                      className="w-16 h-16 rounded-full border-2 border-emerald-500/80 mx-auto object-cover shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                    <h4 className="text-base font-bold text-white leading-tight">
                      {loggedInUser.name}
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono">
                      {loggedInUser.email}
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <span className="text-[9px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        {loggedInUser.role.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-bold">
                        {activeOrg.name}
                      </span>
                    </div>
                  </div>

                  {/* Security Settings & Biometrics */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Security & Device Settings
                    </h5>

                    <div className="p-3 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-emerald-400" />
                        <span>Biometric Quick Unlock</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">ACTIVE</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>Hardware Enclave SSL</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">TLS 1.3</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-300">App Theme</span>
                      <ThemeToggle variant="pill" />
                    </div>
                  </div>

                  {/* Sign Out Action Button */}
                  <button
                    onClick={() => setForceMobileLoginView(true)}
                    className="w-full py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.auth.signOut} (Mobile)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Detailed Alert Position & Telemetry Bottom Sheet (Direct Map Disposition) */}
            {activeAlertInspection && isAlertDetailSheetOpen && activeTab === 'dashboard' && (
              <div className="absolute inset-x-0 bottom-12 z-50 max-h-[75%] bg-[#09090b]/95 backdrop-blur-2xl border-t border-zinc-800 rounded-t-[28px] p-4 shadow-2xl flex flex-col space-y-3 overflow-y-auto text-white animate-in slide-in-from-bottom duration-200">
                {/* Drag handle & Top Header */}
                <div className="flex flex-col items-center gap-1.5 -mt-1">
                  <div className="w-10 h-1 rounded-full bg-zinc-700 shrink-0" />
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border ${
                          activeAlertInspection.severity === 'critical'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : activeAlertInspection.severity === 'warning'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {activeAlertInspection.severity}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                          activeAlertInspection.triageStatus === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : activeAlertInspection.triageStatus === 'acknowledged'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {activeAlertInspection.triageStatus || 'open'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsAlertDetailSheetOpen(false)}
                        className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-colors"
                        title="Minimize"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleDismissAlertInspection}
                        className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
                        title="Close Alert Inspection"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-white leading-tight">
                    {activeAlertInspection.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {activeAlertInspection.description}
                  </p>
                </div>

                {/* Vehicle & Driver Box */}
                {(() => {
                  const targetVeh = vehicles.find(
                    (v) => v.id === activeAlertInspection.vehicleId || v.licensePlate === activeAlertInspection.vehiclePlate
                  );
                  return (
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                          <VehicleMiniatureIcon
                            vehicleType={targetVeh?.vehicleType || 'sedan'}
                            color={targetVeh?.color || 'silver'}
                            make={targetVeh?.make || ''}
                            size={24}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono font-bold text-xs text-white leading-none">
                            {activeAlertInspection.vehiclePlate}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                            {targetVeh ? `${targetVeh.make} ${targetVeh.model}` : 'Fleet Telemetry Unit'}
                          </p>
                        </div>
                      </div>

                      {targetVeh?.assignedDriver?.phone && (
                        <a
                          href={`tel:${targetVeh.assignedDriver.phone}`}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-[11px] flex items-center gap-1 shrink-0"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      )}
                    </div>
                  );
                })()}

                {/* Telemetry Grid */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-800">
                    <p className="text-[9px] uppercase font-bold text-zinc-500">Speed</p>
                    <p className="font-mono font-black text-xs text-white mt-0.5">
                      {activeAlertInspection.speed !== undefined ? `${activeAlertInspection.speed} km/h` : 'N/A'}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-800">
                    <p className="text-[9px] uppercase font-bold text-zinc-500">Time</p>
                    <p className="font-mono text-[10px] text-zinc-300 mt-0.5 truncate">
                      {new Date(activeAlertInspection.createdAt || (activeAlertInspection as any).timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-800">
                    <p className="text-[9px] uppercase font-bold text-zinc-500">Event</p>
                    <p className="font-mono text-[10px] text-emerald-400 font-bold mt-0.5 uppercase truncate">
                      {activeAlertInspection.type}
                    </p>
                  </div>
                </div>

                {/* Coordinates & Pinpoint */}
                <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-300">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>GPS Incident Pinpoint</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCoords(activeAlertInspection.latitude, activeAlertInspection.longitude)}
                      className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-emerald-400 flex items-center gap-1"
                    >
                      {copiedCoords ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                      <span>{copiedCoords ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-snug">
                    {activeAlertInspection.address || 'Geo-referenced coordinate'}
                  </p>
                  <p className="text-[9px] font-mono text-zinc-500">
                    {activeAlertInspection.latitude.toFixed(6)}, {activeAlertInspection.longitude.toFixed(6)}
                  </p>
                </div>

                {/* Resolution Notes Input */}
                {(isResolving || activeAlertInspection.triageStatus === 'resolved') && (
                  <div className="space-y-1 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <p className="text-[10px] font-bold text-emerald-400">
                      {activeAlertInspection.triageStatus === 'resolved' ? 'Resolution Log:' : 'Resolution Notes:'}
                    </p>
                    {activeAlertInspection.triageStatus === 'resolved' ? (
                      <p className="text-[10px] text-zinc-300 font-mono">
                        {activeAlertInspection.resolutionNotes || 'Resolved without notes'}
                      </p>
                    ) : (
                      <textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Enter resolution notes..."
                        className="w-full h-12 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                    )}
                  </div>
                )}

                {/* Disposition Actions */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    {activeAlertInspection.triageStatus !== 'acknowledged' && activeAlertInspection.triageStatus !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => handleAcknowledgeAlert(activeAlertInspection)}
                        className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
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
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isResolving ? 'Confirm' : 'Resolve'}</span>
                      </button>
                    )}
                  </div>

                  {(() => {
                    const targetVeh = vehicles.find(
                      (v) => v.id === activeAlertInspection.vehicleId || v.licensePlate === activeAlertInspection.vehiclePlate
                    );
                    if (!targetVeh) return null;

                    return (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVehicle(targetVeh);
                          if (mobileMapInstanceRef.current) {
                            mobileMapInstanceRef.current.setView([targetVeh.latestPosition.latitude, targetVeh.latestPosition.longitude], 15, {
                              animate: true
                            });
                          }
                          handleDismissAlertInspection();
                        }}
                        className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Navigation className="w-3 h-3 text-emerald-400" />
                        <span>Track Asset Live</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Mobile Bottom Navigation Bar */}
            <div className="border-t border-zinc-900 bg-[#080808] px-4 py-2.5 flex items-center justify-around z-40 select-none">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                  activeTab === 'dashboard' ? 'text-white' : 'text-zinc-600'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Radar</span>
              </button>
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                  activeTab === 'vehicles' ? 'text-white' : 'text-zinc-600'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Fleet</span>
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                  activeTab === 'alerts' ? 'text-white' : 'text-zinc-600'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Alerts</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                  activeTab === 'profile' ? 'text-white' : 'text-zinc-600'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
