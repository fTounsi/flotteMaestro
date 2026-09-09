import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Trip, Vehicle } from '../../types/fleet';
import { Play, Pause, RotateCcw, FastForward, Gauge, Clock, MapPin, Fuel, Calendar, Download, FileCode } from 'lucide-react';
import { TranslationDictionary } from '../../translations/i18n';

interface TripsHistoryViewProps {
  trips: Trip[];
  vehicles: Vehicle[];
  activeVehicleId?: string;
  t: TranslationDictionary;
}

export const TripsHistoryView: React.FC<TripsHistoryViewProps> = ({
  trips,
  vehicles,
  activeVehicleId,
  t
}) => {
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || '');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Sync active vehicle's trip if navigated from vehicle detail modal
  useEffect(() => {
    if (activeVehicleId) {
      const match = trips.find((tr) => tr.vehicleId === activeVehicleId);
      if (match) {
        setSelectedTripId(match.id);
      }
    }
  }, [activeVehicleId, trips]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);
  const playbackMarkerRef = useRef<L.Marker | null>(null);
  const animationTimerRef = useRef<any>(null);

  const currentTrip = trips.find((tr) => tr.id === selectedTripId) || trips[0];
  const waypoints = currentTrip?.waypoints || [];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [33.5731, -7.5898],
      zoom: 9,
      zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abc',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Trip Polyline & Waypoint Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !currentTrip || waypoints.length === 0) return;

    if (polylineLayerRef.current) {
      polylineLayerRef.current.remove();
    }
    if (playbackMarkerRef.current) {
      playbackMarkerRef.current.remove();
    }

    const latLngs: [number, number][] = waypoints.map((w) => [w.lat, w.lng]);

    // Draw route line with glowing emerald style
    const polyline = L.polyline(latLngs, {
      color: '#10b981',
      weight: 4,
      opacity: 0.9,
      smoothFactor: 1
    }).addTo(map);
    polylineLayerRef.current = polyline;

    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    // Initial marker at step 0
    const startPos = waypoints[0];
    const markerIcon = L.divIcon({
      className: 'playback-marker',
      html: `
        <div class="w-8 h-8 rounded-full bg-white border-2 border-emerald-500 shadow-[0_0_12px_#10b981] flex items-center justify-center text-black font-black text-xs">
          ▲
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([startPos.lat, startPos.lng], { icon: markerIcon }).addTo(map);
    playbackMarkerRef.current = marker;
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [selectedTripId, currentTrip]);

  // Animation Loop for Route Playback Scrubber
  useEffect(() => {
    if (isPlaying && waypoints.length > 0) {
      animationTimerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const next = prev + 1;
          if (next >= waypoints.length) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    }

    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [isPlaying, playbackSpeed, waypoints.length]);

  // Update marker position as step changes
  useEffect(() => {
    const marker = playbackMarkerRef.current;
    if (marker && waypoints[currentStepIndex]) {
      const step = waypoints[currentStepIndex];
      marker.setLatLng([step.lat, step.lng]);
    }
  }, [currentStepIndex, waypoints]);

  const activeWaypoint = waypoints[currentStepIndex] || waypoints[0];

  const handleExportGPX = () => {
    if (!currentTrip || waypoints.length === 0) return;
    const gpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Atlas Fleet Logistics OS" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Trip ${currentTrip.id} - ${currentTrip.vehiclePlate || 'Vehicle'}</name>
    <desc>${currentTrip.startAddress} to ${currentTrip.endAddress}</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>Route ${currentTrip.id}</name>
    <trkseg>
${waypoints
  .map(
    (w) => `      <trkpt lat="${w.lat}" lon="${w.lng}">
        <speed>${w.speed || 0}</speed>
        <time>${w.time ? `${currentTrip.date}T${w.time}Z` : new Date().toISOString()}</time>
      </trkpt>`
  )
  .join('\n')}
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxData], { type: 'application/gpx+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trip_${currentTrip.vehiclePlate || 'route'}_${currentTrip.id}.gpx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportKML = () => {
    if (!currentTrip || waypoints.length === 0) return;
    const kmlData = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Trip ${currentTrip.id} - ${currentTrip.vehiclePlate || 'Vehicle'}</name>
    <description>${currentTrip.startAddress} to ${currentTrip.endAddress} (${currentTrip.distanceKm} km)</description>
    <Style id="routeStyle">
      <LineStyle>
        <color>ff10b981</color>
        <width>5</width>
      </LineStyle>
    </Style>
    <Placemark>
      <name>${currentTrip.vehiclePlate || 'Vehicle'} Trajectory</name>
      <styleUrl>#routeStyle</styleUrl>
      <LineString>
        <extrude>1</extrude>
        <tessellate>1</tessellate>
        <coordinates>
${waypoints.map((w) => `          ${w.lng},${w.lat},0`).join('\n')}
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;

    const blob = new Blob([kmlData], { type: 'application/vnd.google-earth.kml+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trip_${currentTrip.vehiclePlate || 'route'}_${currentTrip.id}.kml`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Trip Directory & Statistics (5 Cols) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Trip Selector Card */}
        <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm dark:shadow-2xl space-y-4">
          <div className="border-l-2 border-emerald-500 pl-4 py-0.5">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 font-bold">
              Historical Route Scrubber
            </p>
            <h3 className="text-xl font-black italic tracking-tight text-slate-900 dark:text-white">
              {t.nav.trips}
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {trips.map((tr) => (
              <div
                key={tr.id}
                onClick={() => setSelectedTripId(tr.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedTripId === tr.id
                    ? 'bg-slate-100 dark:bg-zinc-900 border-slate-400 dark:border-zinc-600 text-slate-900 dark:text-white shadow-sm dark:shadow-lg'
                    : 'bg-slate-50 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-900 hover:border-slate-300 dark:hover:border-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-lg text-xs border border-slate-200 dark:border-zinc-800">
                    {tr.vehiclePlate}
                  </span>
                  <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-xs">
                    {tr.distanceKm} km
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-800 dark:text-zinc-200 mb-1">
                  {tr.startAddress} → {tr.endAddress}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-500">
                  <span>Duration: {tr.durationMinutes} min</span>
                  <span>Max: {tr.maxSpeedKmH} km/h • Avg: {tr.avgSpeedKmH} km/h</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Trip Key Metrics */}
        {currentTrip && (
          <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm dark:shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="border-l-2 border-emerald-500 pl-4 py-0.5">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 font-bold">
                Telemetric Audit
              </p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Trip Statistics</h4>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase tracking-wider">Distance</span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  {currentTrip.distanceKm} km
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase tracking-wider">Duration</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {currentTrip.durationMinutes} min
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase tracking-wider">Max Speed</span>
                <span className="text-xl font-black text-amber-700 dark:text-amber-400 font-mono">
                  {currentTrip.maxSpeedKmH} km/h
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase tracking-wider">Fuel Burn</span>
                <span className="text-xl font-black text-slate-800 dark:text-zinc-200 font-mono">
                  {currentTrip.fuelConsumedLiters} L
                </span>
              </div>
            </div>

            {/* Current Step Telemetry HUD */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase tracking-wider block">
                  Scrubber Timestamp
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {activeWaypoint?.time || '00:00:00'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase tracking-wider block">
                  Speed at Waypoint
                </span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  {activeWaypoint?.speed || 0} km/h
                </span>
              </div>
            </div>

            {/* Route Export Action Bar */}
            <div className="pt-1">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-500 mb-2 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Geospatial Telemetry Export</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportGPX}
                  title="Export standard GPS Exchange Format for Garmin, Strava & Navigators"
                  className="px-3 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-800 transition-all shadow-xs"
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Export .GPX</span>
                </button>
                <button
                  onClick={handleExportKML}
                  title="Export Keyhole Markup Language for Google Earth & GIS layers"
                  className="px-3 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-800 transition-all shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>Export .KML</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Replay Map & Interactive Scrubber Player (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="relative flex-1 min-h-[440px] rounded-[32px] overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-2xl bg-slate-100 dark:bg-[#080808] isolate z-0">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Playback Controls & Progress Bar */}
        <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-5 shadow-sm dark:shadow-2xl text-slate-900 dark:text-white flex flex-col gap-3">
          {/* Scrubber slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 dark:text-zinc-500">00:00</span>
            <input
              type="range"
              min={0}
              max={Math.max(0, waypoints.length - 1)}
              value={currentStepIndex}
              onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
              className="flex-1 accent-emerald-500 h-2 bg-slate-200 dark:bg-zinc-950 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-500 dark:text-zinc-500">
              {waypoints[waypoints.length - 1]?.time || 'End'}
            </span>
          </div>

          {/* Buttons & Multipliers */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
                <span>{isPlaying ? t.actions.pauseRoute : t.actions.playRoute}</span>
              </button>

              <button
                onClick={() => setCurrentStepIndex(0)}
                title="Restart playback"
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors border border-slate-200 dark:border-zinc-800"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Multipliers */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-950 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs">
              {[1, 2, 5, 10].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2.5 py-1 rounded-xl font-mono font-bold transition-colors ${
                    playbackSpeed === spd
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm'
                      : 'text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
