import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Vehicle, Geofence } from '../../types/fleet';
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
  Gauge
} from 'lucide-react';
import { TranslationDictionary } from '../../translations/i18n';

interface LiveMapProps {
  vehicles: Vehicle[];
  geofences: Geofence[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onOpenCatalogModal?: () => void;
  t: TranslationDictionary;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  vehicles,
  geofences,
  onSelectVehicle,
  onOpenCatalogModal,
  t
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(vehicles[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'moving' | 'idle' | 'stopped' | 'offline'>('all');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const geofenceLayersRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [33.5731, -7.5898],
      zoom: 10,
      zoomControl: false
    });

    // High quality Voyager tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    geofenceLayersRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

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

  // Update Vehicle Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    vehicles.forEach((veh) => {
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

      if (markersRef.current[veh.id]) {
        markersRef.current[veh.id].setLatLng([pos.latitude, pos.longitude]);
        markersRef.current[veh.id].setIcon(customIcon);
      } else {
        const marker = L.marker([pos.latitude, pos.longitude], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedVehicle(veh);
        });
        markersRef.current[veh.id] = marker;
      }
    });

    // Cleanup
    Object.keys(markersRef.current).forEach((id) => {
      if (!vehicles.find((v) => v.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [vehicles, selectedVehicle]);

  // Fly to selected vehicle
  const handleSelectVehicleItem = (veh: Vehicle) => {
    setSelectedVehicle(veh);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([veh.latestPosition.latitude, veh.latestPosition.longitude], 13, {
        duration: 0.8
      });
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const movingCount = vehicles.filter((v) => v.status === 'moving').length;
  const idleCount = vehicles.filter((v) => v.status === 'idle').length;

  return (
    <div className="space-y-6">
      {/* 1. Artistic Headline & Key Telemetry Counters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Fleet Capacity Hero Metric */}
        <div className="md:col-span-4 bg-zinc-900/40 rounded-[32px] p-6 border border-zinc-800 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="border-l-2 border-emerald-500 pl-4 py-1">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">
                Active Fleet Capacity
              </p>
              <h2 className="text-6xl sm:text-7xl font-black leading-none tracking-tighter text-white font-mono">
                {vehicles.length}
              </h2>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Synchronized telemetry assets streaming at sub-second intervals across regional corridors.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-zinc-800/80">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                WebSocket Ingress
              </span>
              <span className="font-mono text-emerald-400 font-bold">99.99%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                Telemetry Latency
              </span>
              <span className="font-mono text-white font-bold">12ms</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                Active Moving Units
              </span>
              <span className="font-mono underline decoration-emerald-500 underline-offset-4 text-emerald-400 font-bold">
                {movingCount} Vehicles
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Synchronization Engine Status Banner */}
        <div className="md:col-span-5 bg-zinc-900/40 rounded-[32px] p-6 border border-zinc-800 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-1.5 font-bold">
              Spatial Telemetry Pipeline
            </p>
            <h3 className="text-2xl font-light leading-tight italic text-white">
              Global Maestro <br />
              <span className="font-bold not-italic text-emerald-400">Traccar Gateway Active</span>
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
          <div
            onClick={onOpenCatalogModal}
            className="bg-white text-black rounded-[32px] p-6 flex flex-col justify-between hover:bg-emerald-400 transition-all cursor-pointer shadow-2xl group flex-1"
          >
            <div className="flex justify-between items-start">
              <p className="text-[10px] uppercase tracking-widest font-black">Fleet Expansion</p>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h4 className="text-xl font-black leading-tight tracking-tight">
                {t.actions.addVehicle}
              </h4>
              <p className="text-[11px] text-zinc-700 mt-1 font-medium">
                NHTSA VIN Decoder & Tracker Pair
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/40 rounded-[32px] p-4 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-3 w-3 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
              <span className="text-xs font-mono font-bold text-zinc-200">v2.4.0 Engine</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">100% Encrypted</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Live Map and Vehicle Directory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vehicles Directory (4 Cols) */}
        <div className="lg:col-span-4 bg-zinc-900/40 border border-zinc-800 rounded-[32px] p-5 shadow-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Monitored Assets ({filteredVehicles.length})
              </h4>
              <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[10px]">
                {(['all', 'moving', 'idle'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-0.5 rounded-lg font-bold capitalize transition-colors ${
                      statusFilter === st ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search license plate, make, model..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-sans"
              />
            </div>

            {/* Scrollable Vehicle List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredVehicles.map((veh) => {
                const isSelected = selectedVehicle?.id === veh.id;
                return (
                  <div
                    key={veh.id}
                    onClick={() => handleSelectVehicleItem(veh)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-zinc-900 border-zinc-600 shadow-lg text-white'
                        : 'bg-zinc-950/60 border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-zinc-900 text-white px-2 py-0.5 rounded-lg border border-zinc-800">
                          {veh.licensePlate}
                        </span>
                        <span className="font-semibold text-xs text-white">
                          {veh.make} {veh.model}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {veh.latestPosition.speed} km/h
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-zinc-500 pt-1">
                      <span className="truncate max-w-[180px]">{veh.fleetName}</span>
                      <span className="capitalize font-semibold text-zinc-400">
                        {veh.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Vehicle Quick Actions */}
          {selectedVehicle && (
            <button
              onClick={() => onSelectVehicle(selectedVehicle)}
              className="w-full py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-zinc-700"
            >
              <span>Inspect Full Telemetry & Diagnostics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Large Map Stage (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative w-full h-[580px] rounded-[32px] overflow-hidden border border-zinc-800 shadow-2xl bg-[#080808]">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Selected Vehicle Floating HUD Overlay */}
            {selectedVehicle && (
              <div className="absolute bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:w-[420px] z-[400] bg-[#080808]/95 backdrop-blur-2xl border border-zinc-800 rounded-[28px] p-5 shadow-2xl text-zinc-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-white">
                        {selectedVehicle.make} {selectedVehicle.model}
                      </h4>
                      <span className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-700 font-mono text-emerald-400 font-bold text-xs">
                        {selectedVehicle.licensePlate}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[240px]">
                      {selectedVehicle.latestPosition.address || 'GPS Telemetry Feed'}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-400 font-mono leading-none">
                      {selectedVehicle.latestPosition.speed}{' '}
                      <span className="text-xs text-zinc-500 font-normal">km/h</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                      {selectedVehicle.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2.5 my-2 border-t border-b border-zinc-800 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">
                      Battery
                    </span>
                    <span className="font-mono font-bold text-white">
                      {selectedVehicle.latestPosition.battery}%
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">
                      Ignition
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        selectedVehicle.latestPosition.ignition ? 'text-emerald-400' : 'text-zinc-500'
                      }`}
                    >
                      {selectedVehicle.latestPosition.ignition ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">
                      Odometer
                    </span>
                    <span className="font-mono font-bold text-white">
                      {selectedVehicle.odometer.toLocaleString()} km
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectVehicle(selectedVehicle)}
                  className="w-full py-2 rounded-xl bg-white text-black hover:bg-emerald-400 text-xs font-bold transition-colors shadow-md text-center"
                >
                  {t.actions.viewDetails} →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
