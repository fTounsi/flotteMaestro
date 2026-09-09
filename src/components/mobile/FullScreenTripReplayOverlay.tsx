import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Clock,
  MapPin,
  Flag,
  Crosshair,
  Route,
  Layers,
  Fuel,
  Zap,
  Repeat
} from 'lucide-react';
import { Trip, Vehicle } from '../../types/fleet';
import { VehicleMiniatureIcon } from '../common/VehicleMiniatureIcon';

interface FullScreenTripReplayOverlayProps {
  trip: Trip;
  vehicle?: Vehicle;
  onClose: () => void;
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

export const FullScreenTripReplayOverlay: React.FC<FullScreenTripReplayOverlayProps> = ({
  trip,
  vehicle,
  onClose
}) => {
  const waypoints = trip.waypoints || [];
  const [isPlaying, setIsPlaying] = useState(true); // Instant Replay starts immediately!
  const [stepIndex, setStepIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(2);
  const [isLooping, setIsLooping] = useState(true);
  const [followAsset, setFollowAsset] = useState(true);
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'voyager'>('dark');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const completedPolylineRef = useRef<L.Polyline | null>(null);
  const plannedPolylineRef = useRef<L.Polyline | null>(null);
  const animIntervalRef = useRef<any>(null);

  const currentWp = waypoints[stepIndex] || waypoints[0];
  const progressPercent =
    waypoints.length > 1 ? Math.min(100, Math.round((stepIndex / (waypoints.length - 1)) * 100)) : 100;
  const currentDistanceKm = (trip.distanceKm * (progressPercent / 100)).toFixed(1);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || waypoints.length === 0) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        // ignore
      }
      mapInstanceRef.current = null;
    }

    const tileUrls = {
      dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    };

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([waypoints[0].lat, waypoints[0].lng], 13);

    const tileLayer = L.tileLayer(tileUrls[mapStyle], { maxZoom: 19 }).addTo(map);
    tileLayerRef.current = tileLayer;

    const allCoords: [number, number][] = waypoints.map((w) => [w.lat, w.lng]);

    // Planned path (subtle background line)
    const plannedLine = L.polyline(allCoords, {
      color: '#064e3b',
      weight: 5,
      opacity: 0.5,
      dashArray: '6, 8'
    }).addTo(map);
    plannedPolylineRef.current = plannedLine;

    // Traveled path (glow + vibrant emerald line)
    const completedLine = L.polyline([allCoords[0]], {
      color: '#10b981',
      weight: 6,
      opacity: 0.95
    }).addTo(map);
    completedPolylineRef.current = completedLine;

    // Start origin marker A
    const startHtml = `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:34px;height:34px;border-radius:9999px;background:rgba(16,185,129,0.3);animation:pulse 2s infinite;"></div>
        <div style="width:24px;height:24px;border-radius:9999px;background:#059669;border:2.5px solid #ffffff;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;font-family:monospace;box-shadow:0 4px 10px rgba(0,0,0,0.5);">A</div>
      </div>
    `;
    const startIcon = L.divIcon({
      className: 'replay-marker-start',
      html: startHtml,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker(allCoords[0], { icon: startIcon }).addTo(map);

    // Destination marker B
    const endHtml = `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="width:24px;height:24px;border-radius:9999px;background:#e11d48;border:2.5px solid #ffffff;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;font-family:monospace;box-shadow:0 4px 10px rgba(0,0,0,0.5);">B</div>
      </div>
    `;
    const endIcon = L.divIcon({
      className: 'replay-marker-end',
      html: endHtml,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker(allCoords[allCoords.length - 1], { icon: endIcon }).addTo(map);

    // Moving Vehicle Marker with bearing indicator
    const vehicleIcon = L.divIcon({
      className: 'replay-vehicle-marker',
      html: `
        <div id="replay-car-icon" style="position:relative;width:36px;height:36px;border-radius:9999px;background:#10b981;border:3px solid #ffffff;box-shadow:0 0 16px rgba(16,185,129,0.8), 0 4px 12px rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;transform:rotate(0deg);transition:transform 0.25s ease;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    const vehicleMarker = L.marker(allCoords[0], { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map);
    vehicleMarkerRef.current = vehicleMarker;

    map.fitBounds(plannedLine.getBounds(), { padding: [48, 48], maxZoom: 15 });
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
        map.fitBounds(plannedLine.getBounds(), { padding: [48, 48], maxZoom: 15 });
      } catch (e) {
        // ignore
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      try {
        map.remove();
      } catch (e) {
        // ignore
      }
      mapInstanceRef.current = null;
    };
  }, [trip, mapStyle]);

  // Handle Tile Style changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileUrls = {
      dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    };
    tileLayerRef.current.setUrl(tileUrls[mapStyle]);
  }, [mapStyle]);

  // Instant Replay Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      return;
    }

    const intervalMs = 600 / playbackSpeed;
    animIntervalRef.current = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= waypoints.length - 1) {
          if (isLooping) {
            return 0;
          }
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    };
  }, [isPlaying, playbackSpeed, isLooping, waypoints.length]);

  // Update vehicle position, heading & path on stepIndex change
  useEffect(() => {
    if (!waypoints[stepIndex]) return;
    const currentPoint = waypoints[stepIndex];
    const nextPoint = waypoints[stepIndex + 1] || currentPoint;

    // Update marker position
    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setLatLng([currentPoint.lat, currentPoint.lng]);

      // Calculate bearing angle to next point
      const bearing = calculateBearing(
        currentPoint.lat,
        currentPoint.lng,
        nextPoint.lat,
        nextPoint.lng
      );

      const el = document.getElementById('replay-car-icon');
      if (el) {
        el.style.transform = `rotate(${bearing}deg)`;
      }
    }

    // Update dynamic completed polyline
    if (completedPolylineRef.current) {
      const traveled = waypoints.slice(0, stepIndex + 1).map((w) => [w.lat, w.lng] as [number, number]);
      completedPolylineRef.current.setLatLngs(traveled);
    }

    // Smooth camera pan if follow asset is enabled
    if (mapInstanceRef.current && followAsset) {
      mapInstanceRef.current.panTo([currentPoint.lat, currentPoint.lng], {
        animate: true,
        duration: 0.35
      });
    }
  }, [stepIndex, waypoints, followAsset]);

  const toggleFollowAsset = () => {
    if (!followAsset && mapInstanceRef.current && currentWp) {
      mapInstanceRef.current.setView([currentWp.lat, currentWp.lng], 14, { animate: true });
    }
    setFollowAsset(!followAsset);
  };

  const handleFitEntireRoute = () => {
    setFollowAsset(false);
    if (mapInstanceRef.current && plannedPolylineRef.current) {
      mapInstanceRef.current.fitBounds(plannedPolylineRef.current.getBounds(), {
        padding: [50, 50],
        animate: true
      });
    }
  };

  const speedValue = currentWp?.speed || (stepIndex > 0 ? trip.avgSpeedKmH || 65 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed inset-0 z-[9999] flex flex-col bg-slate-950 text-white overflow-hidden select-none"
    >
      {/* Full-Screen Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0 bg-slate-950" />

      {/* Top Floating Glass HUD Bar */}
      <div className="relative z-20 p-3 sm:p-4 flex items-center justify-between gap-3 pointer-events-none">
        {/* Trip Asset Identity */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-xl border border-slate-700/80 px-3 py-2 rounded-2xl shadow-2xl">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-1 flex items-center justify-center">
            {vehicle ? (
              <VehicleMiniatureIcon
                vehicleType={vehicle.vehicleType}
                color={vehicle.color}
                make={vehicle.make}
                size={28}
              />
            ) : (
              <Route className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm text-white tracking-wide">
                {trip.vehiclePlate}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Instant Replay
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-medium truncate max-w-[170px] sm:max-w-xs">
              {trip.startAddress.split(',')[0]} → {trip.endAddress.split(',')[0]}
            </p>
          </div>
        </div>

        {/* Action Controls (Map Layer + Camera + Close) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Map Layer Toggle */}
          <button
            onClick={() =>
              setMapStyle((prev) => (prev === 'dark' ? 'voyager' : prev === 'voyager' ? 'light' : 'dark'))
            }
            title="Switch Map Theme"
            className="p-2.5 rounded-xl bg-slate-950/85 backdrop-blur-xl border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500 transition-all shadow-xl active:scale-95"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Camera Follow Toggle */}
          <button
            onClick={toggleFollowAsset}
            title={followAsset ? 'Camera Following Asset (Active)' : 'Camera Free Pan'}
            className={`p-2.5 rounded-xl backdrop-blur-xl border transition-all shadow-xl active:scale-95 flex items-center gap-1.5 text-xs font-mono font-bold ${
              followAsset
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-slate-950/85 text-slate-300 border-slate-700/80 hover:text-white'
            }`}
          >
            <Crosshair className={`w-4 h-4 ${followAsset ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{followAsset ? 'Following' : 'Free Cam'}</span>
          </button>

          {/* Exit Full Screen Button */}
          <button
            onClick={onClose}
            title="Exit Full-Screen Replay"
            className="p-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-400/50 transition-all shadow-xl active:scale-95 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            <span className="text-xs font-bold font-mono pr-1">Exit</span>
          </button>
        </div>
      </div>

      {/* Floating Speedometer & Real-Time Telemetry HUD */}
      <div className="relative z-20 px-3 sm:px-4 pointer-events-none">
        <div className="pointer-events-auto max-w-sm inline-flex flex-col gap-2 bg-slate-950/90 backdrop-blur-2xl border border-slate-800 p-3 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            {/* Speed Gauge */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black font-mono tracking-tight text-white">
                    {speedValue}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                    km/h
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-400">Live GPS Speed</span>
              </div>
            </div>

            {/* Time & Elevation/Progress */}
            <div className="text-right border-l border-slate-800 pl-4">
              <div className="text-xs font-mono font-bold text-slate-200">
                {currentWp.time || trip.startTime}
              </div>
              <div className="text-[10px] font-mono text-emerald-400 font-semibold mt-0.5">
                {currentDistanceKm} / {trip.distanceKm.toFixed(1)} km ({progressPercent}%)
              </div>
            </div>
          </div>

          {/* Current Waypoint Address / Landmark */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono pt-1 border-t border-slate-800/80">
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">
              {currentWp.address || (stepIndex === 0 ? trip.startAddress : trip.endAddress)}
            </span>
          </div>
        </div>
      </div>

      {/* Spacer to push controls to bottom */}
      <div className="flex-1 pointer-events-none" />

      {/* Bottom Floating Control Deck & Progress Scrubber */}
      <div className="relative z-20 p-3 sm:p-4 space-y-2 pointer-events-auto">
        <div className="bg-slate-950/95 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-3 sm:p-4 shadow-2xl space-y-3">
          {/* Progress Timeline Scrubber */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Clock className="w-3 h-3" />
                {currentWp.time || '00:00'}
              </span>
              <span className="text-slate-300 font-semibold">
                Waypoint {stepIndex + 1} of {waypoints.length}
              </span>
              <span>{trip.endTime}</span>
            </div>

            {/* Scrubber slider */}
            <div className="relative flex items-center group">
              <input
                type="range"
                min={0}
                max={waypoints.length - 1}
                value={stepIndex}
                onChange={(e) => setStepIndex(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Controls Deck Bar */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {/* Play/Pause & Reset */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setStepIndex(0);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
                title="Restart from beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`p-2 rounded-xl border transition-all active:scale-95 ${
                  isLooping
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-transparent hover:text-white'
                }`}
                title={isLooping ? 'Auto-Loop Enabled' : 'Auto-Loop Disabled'}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Playback Speed Selectors */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              {([1, 2, 4] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    playbackSpeed === spd
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Route Stats Pills */}
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-300">
              <button
                onClick={handleFitEntireRoute}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono transition-colors"
              >
                Fit Route
              </button>
              <span className="text-slate-500">|</span>
              <span>
                Avg: <strong className="text-emerald-400">{trip.avgSpeedKmH || 62} km/h</strong>
              </span>
              <span>
                Peak: <strong className="text-amber-400">{trip.maxSpeedKmH || 88} km/h</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
