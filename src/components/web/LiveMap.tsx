import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Vehicle, Geofence, User as FleetUser } from '../../types/fleet';
import {
  Navigation,
  Zap,
  Battery,
  Fuel,
  User,
  Clock,
  Search,
  Plus,
  ArrowRight,
  Shield,
  Radio,
  Gauge,
  Layers,
  Maximize2,
  Minimize2,
  Sliders,
  Sparkles,
  Activity,
  Crosshair,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Compass,
  MapPin,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { TranslationDictionary } from '../../translations/i18n';
import { userHasPermission } from '../../types/rbac';

interface LiveMapProps {
  vehicles: Vehicle[];
  geofences: Geofence[];
  currentUser?: FleetUser | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onOpenCatalogModal?: () => void;
  t: TranslationDictionary;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  vehicles,
  geofences,
  currentUser,
  onSelectVehicle,
  onOpenCatalogModal,
  t
}) => {
  const canCreateVehicle = userHasPermission(currentUser, 'vehicles:create');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(vehicles[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'moving' | 'idle' | 'stopped' | 'offline'>('all');
  const [clusteringEnabled, setClusteringEnabled] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showDrawerInExpanded, setShowDrawerInExpanded] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const regularMarkerGroupRef = useRef<L.LayerGroup | null>(null);
  const geofenceLayersRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [33.5731, -7.5898],
      zoom: 10,
      zoomControl: false
    });

    // High resolution OpenStreetMap tile layer with no API key requirement
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abc',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create marker cluster group with custom dark Obsidian / Emerald styling
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
      disableClusteringAtZoom: 17,
      spiderfyDistanceMultiplier: 1.5,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = 44;
        let bgGradient = 'from-emerald-600 via-teal-700 to-emerald-900';
        let borderClass = 'border-emerald-400';
        let ringClass = 'ring-emerald-500/40';
        let pulseColor = 'bg-emerald-400';

        if (count >= 10 && count < 25) {
          size = 50;
          bgGradient = 'from-amber-500 via-orange-600 to-amber-900';
          borderClass = 'border-amber-400';
          ringClass = 'ring-amber-500/40';
          pulseColor = 'bg-amber-400';
        } else if (count >= 25) {
          size = 56;
          bgGradient = 'from-indigo-600 via-purple-700 to-indigo-950';
          borderClass = 'border-indigo-400';
          ringClass = 'ring-indigo-500/50';
          pulseColor = 'bg-indigo-400';
        }

        return L.divIcon({
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <div class="rounded-2xl bg-gradient-to-br ${bgGradient} border-2 ${borderClass} ring-4 ${ringClass} flex flex-col items-center justify-center text-white shadow-[0_0_25px_rgba(0,0,0,0.9)] transition-all duration-200 transform group-hover:scale-110" style="width: ${size}px; height: ${size}px;">
                <span class="text-xs font-black font-mono leading-none tracking-tight">${count}</span>
                <span class="text-[8px] uppercase tracking-wider font-extrabold text-white/90 leading-none mt-0.5">UNITS</span>
              </div>
              <div class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ${pulseColor} border-2 border-[#080808] animate-pulse"></div>
            </div>
          `,
          className: 'custom-fleet-cluster-icon',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2]
        });
      }
    });

    const regularGroup = L.layerGroup();
    geofenceLayersRef.current = L.layerGroup().addTo(map);

    markerClusterGroupRef.current = clusterGroup;
    regularMarkerGroupRef.current = regularGroup;

    // Attach cluster group to map by default
    map.addLayer(clusterGroup);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Invalidate Map Size on resize or expand
  useEffect(() => {
    const handleResize = () => {
      mapInstanceRef.current?.invalidateSize();
    };

    const timer1 = setTimeout(handleResize, 50);
    const timer2 = setTimeout(handleResize, 250);
    const timer3 = setTimeout(handleResize, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isExpanded, showDrawerInExpanded]);

  // ResizeObserver on Map container
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Keyboard shortcut: ESC to exit expanded mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Handle Clustering Mode Toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const clusterGroup = markerClusterGroupRef.current;
    const regularGroup = regularMarkerGroupRef.current;
    if (!map || !clusterGroup || !regularGroup) return;

    if (clusteringEnabled) {
      if (map.hasLayer(regularGroup)) {
        map.removeLayer(regularGroup);
      }
      if (!map.hasLayer(clusterGroup)) {
        map.addLayer(clusterGroup);
      }
    } else {
      if (map.hasLayer(clusterGroup)) {
        map.removeLayer(clusterGroup);
      }
      if (!map.hasLayer(regularGroup)) {
        map.addLayer(regularGroup);
      }
    }
  }, [clusteringEnabled]);

  // Update Geofence Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const geoGroup = geofenceLayersRef.current;
    if (!map || !geoGroup) return;

    geoGroup.clearLayers();

    geofences.forEach((geo) => {
      if (!geo.active) return;

      if (geo.type === 'circle' && geo.center && geo.radiusMeters) {
        const circle = L.circle(geo.center, {
          radius: geo.radiusMeters,
          color: geo.color || '#10b981',
          fillColor: geo.color || '#10b981',
          fillOpacity: 0.12,
          weight: 2,
          dashArray: '4, 6'
        });

        circle.bindTooltip(
          `<div class="text-xs font-bold text-zinc-900">${geo.name} (${geo.radiusMeters}m)</div>`,
          { permanent: false, direction: 'top' }
        );
        geoGroup.addLayer(circle);
      } else if (geo.type === 'polygon' && geo.coordinates && geo.coordinates.length > 2) {
        const polygon = L.polygon(geo.coordinates, {
          color: geo.color || '#3b82f6',
          fillColor: geo.color || '#3b82f6',
          fillOpacity: 0.12,
          weight: 2
        });

        polygon.bindTooltip(
          `<div class="text-xs font-bold text-zinc-900">${geo.name} [Zone]</div>`,
          { permanent: false, direction: 'top' }
        );
        geoGroup.addLayer(polygon);
      }
    });
  }, [geofences]);

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Update Vehicle Markers within Cluster Group or Regular Layer Group
  useEffect(() => {
    const map = mapInstanceRef.current;
    const clusterGroup = markerClusterGroupRef.current;
    const regularGroup = regularMarkerGroupRef.current;
    if (!map || !clusterGroup || !regularGroup) return;

    // Clear existing layers
    clusterGroup.clearLayers();
    regularGroup.clearLayers();
    markersRef.current = {};

    filteredVehicles.forEach((veh) => {
      const pos = veh.latestPosition;
      const isSelected = selectedVehicle?.id === veh.id;

      let statusBg = 'bg-emerald-500';
      let statusShadow = 'shadow-[0_0_12px_#10b981]';
      let pulseClass = 'marker-pulse-active';

      if (veh.status === 'idle') {
        statusBg = 'bg-amber-500';
        statusShadow = 'shadow-[0_0_12px_#f59e0b]';
        pulseClass = '';
      } else if (veh.status === 'stopped') {
        statusBg = 'bg-zinc-600';
        statusShadow = '';
        pulseClass = '';
      } else if (veh.status === 'offline') {
        statusBg = 'bg-rose-500';
        statusShadow = '';
        pulseClass = '';
      }

      const customIcon = L.divIcon({
        className: 'artistic-vehicle-marker',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer group transition-all ${isSelected ? 'scale-125 z-50' : 'scale-100'}">
            <div class="w-10 h-10 rounded-2xl ${statusBg} ${statusShadow} border border-white/80 flex items-center justify-center text-white ${pulseClass} relative">
              <svg style="transform: rotate(${pos.heading}deg)" class="w-5 h-5 text-white transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </div>
            <div class="mt-1 bg-black/95 border border-zinc-800 px-2.5 py-0.5 rounded-full shadow-2xl text-[10px] font-bold text-white whitespace-nowrap tracking-wider flex items-center gap-1.5 font-mono">
              <span>${veh.licensePlate}</span>
              ${pos.speed > 0 ? `<span class="text-emerald-400 font-black">${pos.speed}k</span>` : ''}
            </div>
          </div>
        `,
        iconSize: [48, 64],
        iconAnchor: [24, 32]
      });

      const marker = L.marker([pos.latitude, pos.longitude], { icon: customIcon });
      marker.on('click', () => {
        setSelectedVehicle(veh);
      });

      markersRef.current[veh.id] = marker;

      // Add to both container groups
      clusterGroup.addLayer(marker);
      regularGroup.addLayer(marker);
    });
  }, [filteredVehicles, selectedVehicle]);

  // Fly to selected vehicle
  const handleSelectVehicleItem = (veh: Vehicle) => {
    setSelectedVehicle(veh);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([veh.latestPosition.latitude, veh.latestPosition.longitude], 15, {
        duration: 0.8
      });
    }
  };

  // Fit bounds to entire active fleet
  const handleFitFleetBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || filteredVehicles.length === 0) return;

    const bounds = L.latLngBounds(
      filteredVehicles.map((v) => [v.latestPosition.latitude, v.latestPosition.longitude])
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  };

  const movingCount = vehicles.filter((v) => v.status === 'moving').length;
  const idleCount = vehicles.filter((v) => v.status === 'idle').length;
  const stoppedCount = vehicles.filter((v) => v.status === 'stopped').length;
  const offlineCount = vehicles.filter((v) => v.status === 'offline').length;

  return (
    <div className="space-y-6">
      {/* 1. Artistic Headline & Key Telemetry Counters (hidden in expanded mode) */}
      {!isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Fleet Capacity Hero Metric */}
          <div className="md:col-span-4 bg-white dark:bg-zinc-900/40 rounded-[32px] p-6 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs dark:shadow-2xl">
            <div>
              <div className="border-l-2 border-emerald-500 pl-4 py-1">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-1 font-bold">
                  Active Fleet Capacity
                </p>
                <h2 className="text-6xl sm:text-7xl font-black leading-none tracking-tighter text-slate-900 dark:text-white font-mono">
                  {vehicles.length}
                </h2>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  Synchronized telemetry assets streaming at sub-second intervals across regional corridors.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 font-semibold">
                  WebSocket Ingress
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">99.99%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 font-semibold">
                  Telemetry Latency
                </span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">12ms</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 font-semibold">
                  Active Moving Units
                </span>
                <span className="font-mono underline decoration-emerald-500 underline-offset-4 text-emerald-600 dark:text-emerald-400 font-bold">
                  {movingCount} Vehicles
                </span>
              </div>
            </div>
          </div>

          {/* Center: Live Synchronization Engine Status Banner */}
          <div className="md:col-span-5 bg-white dark:bg-zinc-900/40 rounded-[32px] p-6 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs dark:shadow-2xl relative overflow-hidden">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-zinc-500 mb-1.5 font-bold">
                Spatial Telemetry Pipeline
              </p>
              <h3 className="text-2xl font-light leading-tight italic text-slate-900 dark:text-white">
                Global Maestro <br />
                <span className="font-bold not-italic text-emerald-600 dark:text-emerald-400">Traccar Gateway Active</span>
              </h3>
            </div>

            {/* Equalizer Frequency Indicator */}
            <div className="flex gap-2 mt-6 items-end">
              <div className="w-2.5 bg-emerald-500/20 h-6 rounded-full animate-pulse" />
              <div className="w-2.5 bg-emerald-500/40 h-12 rounded-full animate-pulse" />
              <div className="w-2.5 bg-emerald-500/60 h-8 rounded-full animate-pulse" />
              <div className="w-2.5 bg-emerald-500 h-16 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse" />
              <div className="w-2.5 bg-emerald-500/70 h-10 rounded-full animate-pulse" />
              <div className="w-2.5 bg-emerald-500/30 h-7 rounded-full animate-pulse" />
              <div className="w-2.5 bg-emerald-500/10 h-4 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Right: High-Contrast Onboard Client CTA Card */}
          <div className="md:col-span-3 flex flex-col gap-4">
            {canCreateVehicle ? (
              <div
                onClick={onOpenCatalogModal}
                className="bg-emerald-600 text-white dark:bg-white dark:text-black rounded-[32px] p-6 flex flex-col justify-between hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-all cursor-pointer shadow-xs dark:shadow-2xl group flex-1"
              >
                <div className="flex justify-between items-start">
                  <p className="text-[10px] uppercase tracking-widest font-black">Fleet Expansion</p>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <h4 className="text-xl font-black leading-tight tracking-tight">
                    {t.actions.addVehicle}
                  </h4>
                  <p className="text-[11px] text-emerald-100 dark:text-zinc-700 mt-1 font-medium">
                    NHTSA VIN Decoder & Tracker Pair
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900/40 rounded-[32px] p-6 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs dark:shadow-2xl flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 font-bold">Fleet Telematics</p>
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    Asset Monitoring
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                    Active continuous location & sensor feed
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-900/40 rounded-[32px] p-4 border border-slate-200 dark:border-zinc-800 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-200">v2.4.0 Engine</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">100% Encrypted</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Interactive Live Map and Vehicle Directory Grid */}
      <div className={`${isExpanded ? 'fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex flex-col p-2 sm:p-4' : 'grid grid-cols-1 lg:grid-cols-12 gap-6'}`}>
        
        {/* Vehicles Directory (Left Panel in standard, or floating drawer in expanded) */}
        {(!isExpanded || (isExpanded && showDrawerInExpanded)) && (
          <div
            className={`${
              isExpanded
                ? 'absolute top-20 left-4 bottom-6 w-80 sm:w-96 z-30 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-2xl border border-slate-200 dark:border-zinc-800 rounded-[28px] p-4 shadow-2xl flex flex-col justify-between transition-all animate-in fade-in slide-in-from-left-4 duration-200'
                : 'lg:col-span-4 bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-5 shadow-xs dark:shadow-2xl space-y-4 flex flex-col justify-between'
            }`}
          >
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-400 uppercase tracking-widest">
                    Monitored Assets ({filteredVehicles.length})
                  </h4>
                </div>

                {isExpanded && (
                  <button
                    onClick={() => setShowDrawerInExpanded(false)}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                    title="Hide Assets List"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                )}

                {!isExpanded && (
                  <div className="flex gap-1 bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 text-[10px]">
                    {(['all', 'moving', 'idle'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2 py-0.5 rounded-lg font-bold capitalize transition-colors ${
                          statusFilter === st
                            ? 'bg-white text-slate-900 shadow-xs dark:bg-white dark:text-black'
                            : 'text-slate-500 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick status filters inside expanded drawer */}
              {isExpanded && (
                <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
                  {(['all', 'moving', 'idle', 'stopped', 'offline'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-xl font-bold capitalize whitespace-nowrap transition-all border ${
                        statusFilter === st
                          ? 'bg-emerald-600 text-white border-emerald-500 dark:bg-emerald-500 dark:text-black font-extrabold'
                          : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {st} ({vehicles.filter((v) => (st === 'all' ? true : v.status === st)).length})
                    </button>
                  ))}
                </div>
              )}

              {/* Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search plate, make, model..."
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              {/* Scrollable Vehicle List */}
              <div className={`space-y-2 overflow-y-auto pr-1 flex-1 ${isExpanded ? 'max-h-[calc(100vh-320px)]' : 'max-h-[460px]'}`}>
                {filteredVehicles.map((veh) => {
                  const isSelected = selectedVehicle?.id === veh.id;
                  return (
                    <div
                      key={veh.id}
                      onClick={() => handleSelectVehicleItem(veh)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-300 dark:bg-zinc-900 dark:border-zinc-600 shadow-sm text-slate-900 dark:text-white'
                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 dark:bg-zinc-950/60 dark:border-zinc-900 dark:hover:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-white dark:bg-zinc-900 text-slate-900 dark:text-white px-2 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                            {veh.licensePlate}
                          </span>
                          <span className="font-semibold text-xs text-slate-900 dark:text-white truncate max-w-[120px]">
                            {veh.make} {veh.model}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {veh.latestPosition.speed} km/h
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-zinc-500 pt-1">
                        <span className="truncate max-w-[150px]">{veh.fleetName}</span>
                        <span
                          className={`capitalize font-semibold text-[10px] px-1.5 py-0.5 rounded-md ${
                            veh.status === 'moving'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                              : veh.status === 'idle'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
                              : veh.status === 'stopped'
                              ? 'bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-400'
                          }`}
                        >
                          {veh.status}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredVehicles.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400 dark:text-zinc-500">
                    No vehicles found matching filter criteria.
                  </div>
                )}
              </div>
            </div>

            {/* Selected Vehicle Quick Action Button */}
            {selectedVehicle && (
              <button
                onClick={() => onSelectVehicle(selectedVehicle)}
                className="w-full mt-3 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Inspect Full Telemetry & Diagnostics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Large Map Stage Container (Standard or Full Screen Expanded) */}
        <div
          className={`${
            isExpanded
              ? 'relative w-full h-full rounded-[24px] sm:rounded-[32px] overflow-hidden border border-slate-700/80 dark:border-zinc-800 shadow-2xl bg-[#080808] flex-1'
              : 'lg:col-span-8 flex flex-col gap-4'
          }`}
        >
          <div
            className={`${
              isExpanded
                ? 'relative w-full h-full'
                : 'relative w-full h-[580px] rounded-[32px] overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-xs dark:shadow-2xl bg-[#080808] isolate z-0'
            }`}
          >
            {/* Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Top Toolbar: Map Controls, Expansion Toggle, Clustering, and Filters */}
            <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              {/* Left Controls Group */}
              <div className="flex flex-wrap items-center gap-2 bg-white/95 dark:bg-[#080808]/90 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 p-1.5 rounded-2xl shadow-xl pointer-events-auto">
                {/* Toggle Assets Drawer in Expanded Mode */}
                {isExpanded && !showDrawerInExpanded && (
                  <button
                    type="button"
                    onClick={() => setShowDrawerInExpanded(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 transition-all flex items-center gap-1.5 border border-slate-200 dark:border-zinc-800"
                    title="Show Monitored Assets Drawer"
                  >
                    <PanelLeftOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Assets ({filteredVehicles.length})</span>
                  </button>
                )}

                {/* Marker Clustering Toggle */}
                <button
                  type="button"
                  onClick={() => setClusteringEnabled(!clusteringEnabled)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    clusteringEnabled
                      ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black shadow-xs font-extrabold'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white dark:hover:bg-zinc-800'
                  }`}
                  title="Toggle marker clustering to group proximate vehicles"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Cluster: {clusteringEnabled ? 'ON' : 'OFF'}</span>
                </button>

                {/* Fit All Fleet Bounds */}
                <button
                  type="button"
                  onClick={handleFitFleetBounds}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 border border-slate-200 dark:border-zinc-800"
                  title="Zoom to fit all vehicles in active fleet"
                >
                  <Crosshair className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Fit Fleet</span>
                </button>

                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 px-2 hidden sm:inline-block">
                  {filteredVehicles.length} Units Active
                </span>
              </div>

              {/* Right Controls Group: Expand / Minimize Toggle */}
              <div className="flex items-center gap-2 bg-white/95 dark:bg-[#080808]/90 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 p-1.5 rounded-2xl shadow-xl pointer-events-auto">
                {isExpanded ? (
                  <>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 px-2 font-bold hidden md:inline">
                      Press ESC to exit
                    </span>
                    <button
                      type="button"
                      id="exit-expanded-map-btn"
                      onClick={() => setIsExpanded(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center gap-1.5 shadow-sm"
                      title="Exit Full-Screen Map Mode (Esc)"
                    >
                      <Minimize2 className="w-4 h-4" />
                      <span>Minimize Map</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    id="expand-map-btn"
                    onClick={() => {
                      setIsExpanded(true);
                      setShowDrawerInExpanded(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-sm hover:scale-105"
                    title="Expand Map to Full Screen View"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Expand Map</span>
                  </button>
                )}
              </div>
            </div>

            {/* Selected Vehicle Floating HUD Overlay */}
            {selectedVehicle && (
              <div
                className={`absolute bottom-5 z-20 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-2xl border border-slate-200 dark:border-zinc-800 rounded-[28px] p-5 shadow-2xl text-slate-800 dark:text-zinc-200 animate-in fade-in zoom-in-95 duration-150 ${
                  isExpanded
                    ? 'right-5 left-5 sm:left-auto sm:right-6 sm:w-[420px]'
                    : 'left-5 right-5 sm:left-auto sm:right-5 sm:w-[420px]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {selectedVehicle.make} {selectedVehicle.model}
                      </h4>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        {selectedVehicle.licensePlate}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate max-w-[240px]">
                      {selectedVehicle.latestPosition.address || 'GPS Telemetry Feed'}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono leading-none">
                      {selectedVehicle.latestPosition.speed}{' '}
                      <span className="text-xs text-slate-400 dark:text-zinc-500 font-normal">km/h</span>
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold ${
                        selectedVehicle.status === 'moving'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : selectedVehicle.status === 'idle'
                          ? 'text-amber-600 dark:text-amber-400'
                          : selectedVehicle.status === 'stopped'
                          ? 'text-slate-500 dark:text-zinc-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {selectedVehicle.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2.5 my-2 border-t border-b border-slate-200 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase tracking-wider">
                      Battery
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {selectedVehicle.latestPosition.battery}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase tracking-wider">
                      Ignition
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        selectedVehicle.latestPosition.ignition ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'
                      }`}
                    >
                      {selectedVehicle.latestPosition.ignition ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase tracking-wider">
                      Odometer
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {selectedVehicle.odometer.toLocaleString()} km
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectVehicle(selectedVehicle)}
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-emerald-400 text-xs font-bold transition-colors shadow-xs text-center"
                  >
                    {t.actions.viewDetails} →
                  </button>
                  <button
                    onClick={() => setSelectedVehicle(null)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                    title="Dismiss vehicle HUD"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
