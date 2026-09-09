import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  X,
  MapPin,
  Navigation,
  Clock,
  Gauge,
  User as UserIcon,
  Phone,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle,
  ExternalLink,
  Copy,
  Check,
  Radio,
  Layers,
  Crosshair,
  Sliders,
  Fuel,
  Battery,
  Building2,
  Terminal,
  Activity,
  ArrowRight
} from 'lucide-react';
import { Alert, Vehicle, User } from '../../../types/fleet';
import { TranslationDictionary } from '../../../translations/i18n';
import { userHasPermission } from '../../../types/rbac';

interface AlertMapModalProps {
  alert: Alert | null;
  vehicles?: Vehicle[];
  currentUser?: User | null;
  currentOrgName?: string;
  onClose: () => void;
  onAcknowledge?: (alert: Alert) => void;
  onResolve?: (alert: Alert, notes: string) => void;
  onTrackLive?: (vehicle: Vehicle) => void;
  onOpenDownlinkTerminal?: (vehicle: Vehicle) => void;
  t: TranslationDictionary;
}

export const AlertMapModal: React.FC<AlertMapModalProps> = ({
  alert,
  vehicles = [],
  currentUser,
  currentOrgName = 'Atlas Express Logistics',
  onClose,
  onAcknowledge,
  onResolve,
  onTrackLive,
  onOpenDownlinkTerminal,
  t
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  if (!alert) return null;

  // Find linked vehicle
  const matchedVehicle = vehicles.find(
    (v) => v.id === alert.vehicleId || v.licensePlate === alert.vehiclePlate
  );

  const canTriage = userHasPermission(currentUser, 'alerts:triage');
  const canSendCommands = userHasPermission(currentUser, 'vehicles:commands');
  const triage = alert.triageStatus || 'open';

  // Severity styling
  const severityColors = {
    critical: {
      bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
      badge: 'bg-rose-500 text-white',
      accent: '#f43f5e',
      border: 'border-rose-500/40',
      icon: ShieldAlert
    },
    warning: {
      bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
      badge: 'bg-amber-500 text-black',
      accent: '#f59e0b',
      border: 'border-amber-500/40',
      icon: AlertTriangle
    },
    info: {
      bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      badge: 'bg-emerald-500 text-black',
      accent: '#10b981',
      border: 'border-emerald-500/40',
      icon: Info
    }
  }[alert.severity || 'warning'];

  const SeverityIcon = severityColors.icon;

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        // ignore
      }
      mapInstanceRef.current = null;
    }

    const lat = alert.latitude;
    const lng = alert.longitude;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    // Tile Layer based on selection
    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    if (mapLayer === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapLayer === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }

    L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Pulse Circle Radius
    const circle = L.circle([lat, lng], {
      radius: 60,
      color: severityColors.accent,
      fillColor: severityColors.accent,
      fillOpacity: 0.18,
      weight: 2,
      dashArray: '4, 4'
    }).addTo(map);
    circleRef.current = circle;

    // Custom Radar Marker with Pinpoint Pulse HTML
    const markerHtml = `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: ${severityColors.accent}; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; inset: 4px; border-radius: 9999px; background-color: ${severityColors.accent}; opacity: 0.2;"></div>
        <div style="position: relative; width: 32px; height: 32px; border-radius: 9999px; background: #0f172a; border: 2.5px solid ${severityColors.accent}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.5); color: #ffffff;">
          <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="${severityColors.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html: markerHtml,
      className: 'alert-pulse-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22]
    });

    const marker = L.marker([lat, lng], { icon }).addTo(map);
    markerRef.current = marker;

    // Marker Popup
    const popupContent = `
      <div style="font-family: sans-serif; min-width: 180px; padding: 4px 0;">
        <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">${alert.title}</div>
        <div style="font-size: 11px; font-weight: bold; color: ${severityColors.accent}; text-transform: uppercase;">${alert.vehiclePlate}</div>
        <div style="font-size: 11px; color: #475569; margin-top: 4px;">${alert.address || 'GPS Fix: ' + lat.toFixed(4) + ', ' + lng.toFixed(4)}</div>
      </div>
    `;
    marker.bindPopup(popupContent).openPopup();

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, [alert.id, mapLayer, severityColors.accent]);

  // Handle Recenter
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([alert.latitude, alert.longitude], 16, { animate: true });
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  // Copy Coordinates to Clipboard
  const handleCopyCoordinates = () => {
    const coords = `${alert.latitude.toFixed(6)}, ${alert.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(coords);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  // External Google Maps Link
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${alert.latitude},${alert.longitude}`;

  // Time format
  const alertDate = new Date(alert.createdAt);
  const formattedTime = alertDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = alertDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div
      className="fixed inset-0 z-[1000] bg-slate-950/75 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-[32px] w-full max-w-6xl max-h-[92vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-zinc-800 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-zinc-900/50">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Organization context */}
              <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                <Building2 className="w-3.5 h-3.5" />
                <span>{currentOrgName}</span>
              </span>

              {/* Severity Pill */}
              <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${severityColors.bg}`}>
                <SeverityIcon className="w-3 h-3" />
                <span>{alert.severity}</span>
              </span>

              {/* Triage Status */}
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-lg border ${
                  triage === 'resolved'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                    : triage === 'acknowledged'
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 animate-pulse'
                }`}
              >
                {triage}
              </span>

              {alert.alertName && (
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 bg-slate-200/70 dark:bg-zinc-800 px-2 py-0.5 rounded">
                  Rule: {alert.alertName}
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black italic tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{alert.title}</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Triggered on <strong className="text-slate-800 dark:text-zinc-200">{formattedDate} at {formattedTime}</strong> by vehicle <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-200/80 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{alert.vehiclePlate}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Map + Details Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* LEFT: Leaflet Map (7 Cols) */}
          <div className="lg:col-span-7 relative flex flex-col bg-slate-100 dark:bg-zinc-900 min-h-[340px] sm:min-h-[420px] lg:min-h-full border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800">
            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full flex-1 h-full min-h-[340px] sm:min-h-[420px] z-0" />

            {/* Top-Left Map Controls: Layer Switcher & Recenter */}
            <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2 bg-white/95 dark:bg-zinc-900/95 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg backdrop-blur-md">
              <button
                type="button"
                onClick={handleRecenter}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                title={t.alertsView?.recenter || 'Recenter on Event'}
              >
                <Crosshair className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">{t.alertsView?.recenter || 'Recenter'}</span>
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-zinc-700 mx-0.5" />

              {/* Streets / Satellite / Dark Layer switch */}
              <button
                type="button"
                onClick={() => setMapLayer('streets')}
                className={`px-2 py-1 rounded-xl text-[10px] font-mono uppercase font-bold transition-colors ${
                  mapLayer === 'streets'
                    ? 'bg-emerald-500 text-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Street
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('satellite')}
                className={`px-2 py-1 rounded-xl text-[10px] font-mono uppercase font-bold transition-colors ${
                  mapLayer === 'satellite'
                    ? 'bg-emerald-500 text-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('dark')}
                className={`px-2 py-1 rounded-xl text-[10px] font-mono uppercase font-bold transition-colors ${
                  mapLayer === 'dark'
                    ? 'bg-emerald-500 text-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Night
              </button>
            </div>

            {/* Bottom Coordinates & External Map Floating Bar */}
            <div className="absolute bottom-4 left-4 right-16 z-[400] bg-white/95 dark:bg-zinc-900/95 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono font-bold text-slate-400 dark:text-zinc-500">
                    {t.alertsView?.exactCoordinates || 'Exact GPS Coordinates'}
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {alert.latitude.toFixed(6)}° N, {alert.longitude.toFixed(6)}° W
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCoordinates}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Copy GPS coordinates to clipboard"
                >
                  {copiedCoords ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                        {t.alertsView?.copied || 'Copied!'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[11px] font-bold">{t.alertsView?.copyCoordinates || 'Copy'}</span>
                    </>
                  )}
                </button>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors"
                  title={t.alertsView?.openInGoogleMaps || 'Open in External Maps'}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT: Incident Details & Vehicle Telemetry (5 Cols) */}
          <div className="lg:col-span-5 p-6 space-y-6 flex flex-col justify-between overflow-y-auto bg-white dark:bg-zinc-950">
            <div className="space-y-5">
              {/* Address Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-1">
                <div className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t.alertsView?.location || 'Incident Location / Road'}</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {alert.address || 'Casablanca Metropolitan Corridor'}
                </div>
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Speed at impact */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-emerald-500" />
                    <span>{t.alertsView?.speedAtImpact || 'Speed Recorded'}</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    {alert.speed !== undefined ? `${alert.speed} km/h` : '0 km/h'}
                  </div>
                  {alert.thresholdValue !== undefined && (
                    <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                      Limit: {alert.thresholdValue}
                    </div>
                  )}
                </div>

                {/* Event Type & Condition */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-indigo-500" />
                    <span>Trigger Type</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 capitalize truncate">
                    {alert.type.replace('_', ' ')}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                    {alert.triggerValue ? `Value: ${alert.triggerValue}` : 'Telemetry Event'}
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-1.5">
                <div className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-zinc-500">
                  Telemetry Incident Report
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-sans">
                  {alert.description}
                </p>
              </div>

              {/* Linked Vehicle & Driver Card */}
              {matchedVehicle && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-zinc-500 flex items-center justify-between">
                    <span>Target Fleet Asset</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                      {matchedVehicle.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={
                        matchedVehicle.imageUrl ||
                        'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={matchedVehicle.model}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-zinc-800 shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-900 text-white dark:bg-white dark:text-black px-2 py-0.5 rounded-md">
                          {matchedVehicle.licensePlate}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {matchedVehicle.make} {matchedVehicle.model}
                        </span>
                      </div>

                      {matchedVehicle.assignedDriver ? (
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 dark:text-zinc-400">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold truncate">{matchedVehicle.assignedDriver.name}</span>
                          <a
                            href={`tel:${matchedVehicle.assignedDriver.phone}`}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
                            title="Call Driver"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{matchedVehicle.assignedDriver.phone}</span>
                          </a>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                          No driver assigned
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hardware Telemetry quick pills */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-200 dark:border-zinc-800/80">
                    <span className="flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-emerald-500" />
                      <span>Fuel: {matchedVehicle.fuelLevelPercent ?? 85}%</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Battery className="w-3 h-3 text-indigo-500" />
                      <span>Batt: {matchedVehicle.latestPosition?.battery ?? 98}%</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Radio className="w-3 h-3 text-cyan-500" />
                      <span>{matchedVehicle.trackerProtocol?.toUpperCase() || 'TELTONIKA'}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Triage Info if Acknowledged / Resolved */}
              {(alert.acknowledgedBy || alert.resolutionNotes) && (
                <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-zinc-900/50 border border-amber-500/20 text-xs space-y-1">
                  {alert.acknowledgedBy && (
                    <div className="text-amber-700 dark:text-amber-400 font-mono text-[11px]">
                      ✓ Acknowledged by <strong>{alert.acknowledgedBy}</strong> at{' '}
                      {new Date(alert.acknowledgedAt || '').toLocaleTimeString()}
                    </div>
                  )}
                  {alert.resolutionNotes && (
                    <div className="text-slate-600 dark:text-zinc-300 text-[11px] mt-1">
                      <strong className="text-slate-700 dark:text-zinc-200">Resolution: </strong>
                      <span>{alert.resolutionNotes}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Inline Resolve Form */}
              {isResolving && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (onResolve) {
                      onResolve(alert, resolutionNotes.trim() || 'Verified on map and resolved by operator.');
                      setIsResolving(false);
                    }
                  }}
                  className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in fade-in duration-200"
                >
                  <label className="block text-xs font-bold text-slate-900 dark:text-white">
                    Resolution Protocol Notes
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="e.g., Driver confirmed overspeed due to passing truck. Verified safe in depot."
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsResolving(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black"
                    >
                      Confirm Resolve
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Operational Action Bar */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* Track Live on Fleet Radar */}
                {matchedVehicle && onTrackLive && (
                  <button
                    type="button"
                    onClick={() => {
                      onTrackLive(matchedVehicle);
                      onClose();
                    }}
                    className="flex-1 min-w-[160px] px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>{t.alertsView?.trackLive || 'Track Live on Fleet Radar'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Downlink Relay Cut option for critical alarms */}
                {matchedVehicle && canSendCommands && onOpenDownlinkTerminal && alert.severity === 'critical' && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenDownlinkTerminal(matchedVehicle);
                    }}
                    className="px-3.5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Send remote engine immobilizer command"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Downlink Terminal</span>
                  </button>
                )}
              </div>

              {/* Triage Actions */}
              <div className="flex items-center gap-2 pt-1">
                {canTriage && triage === 'open' && onAcknowledge && (
                  <button
                    type="button"
                    onClick={() => onAcknowledge(alert)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Acknowledge</span>
                  </button>
                )}

                {canTriage && triage !== 'resolved' && !isResolving && (
                  <button
                    type="button"
                    onClick={() => setIsResolving(true)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve Incident</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
