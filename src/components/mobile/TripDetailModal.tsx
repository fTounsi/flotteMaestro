import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { motion } from 'motion/react';
import { X, Play, Pause, RotateCcw, Route, MapPin, Flag, Fuel, Gauge, Clock, Calendar, ChevronRight, Activity } from 'lucide-react';
import { Trip, Vehicle } from '../../types/fleet';

interface TripDetailModalProps {
  trip: Trip | null;
  vehicle?: Vehicle;
  onClose: () => void;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({ trip, vehicle, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const animIntervalRef = useRef<any>(null);

  const waypoints = trip?.waypoints || [];

  // Initialize interactive Leaflet Map
  useEffect(() => {
    if (!trip || waypoints.length === 0 || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        // ignore
      }
      mapInstanceRef.current = null;
    }

    const isDarkMode =
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark';

    const tileUrl = isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView([waypoints[0].lat, waypoints[0].lng], 12);

    L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

    const latLngs: [number, number][] = waypoints.map((w) => [w.lat, w.lng]);

    // Path Glow
    L.polyline(latLngs, {
      color: '#047857',
      weight: 7,
      opacity: 0.35
    }).addTo(map);

    // Primary Line
    const polyline = L.polyline(latLngs, {
      color: '#10b981',
      weight: 4,
      opacity: 0.95
    }).addTo(map);

    // Start marker
    const startIcon = L.divIcon({
      className: 'modal-marker-start',
      html: '<div style="width:22px;height:22px;border-radius:9999px;background:#059669;border:2px solid #ffffff;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;font-family:monospace;box-shadow:0 2px 5px rgba(0,0,0,0.4);">A</div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    L.marker(latLngs[0], { icon: startIcon }).addTo(map);

    // End marker
    const endIcon = L.divIcon({
      className: 'modal-marker-end',
      html: '<div style="width:22px;height:22px;border-radius:9999px;background:#e11d48;border:2px solid #ffffff;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;font-family:monospace;box-shadow:0 2px 5px rgba(0,0,0,0.4);">B</div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    L.marker(latLngs[latLngs.length - 1], { icon: endIcon }).addTo(map);

    // Active playback vehicle position marker
    const movingIcon = L.divIcon({
      className: 'playback-active-marker',
      html: `
        <div style="position:relative;width:30px;height:30px;border-radius:9999px;background:#10b981;border:3px solid #ffffff;box-shadow:0 0 12px #10b981;display:flex;align-items:center;justify-content:center;color:#000;font-weight:900;font-size:12px;">
          ▲
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    const currentMarker = L.marker(latLngs[0], { icon: movingIcon }).addTo(map);
    markerRef.current = currentMarker;

    map.fitBounds(polyline.getBounds(), { padding: [24, 24], maxZoom: 15 });
    mapInstanceRef.current = map;

    const t = setTimeout(() => {
      try {
        map.invalidateSize();
        map.fitBounds(polyline.getBounds(), { padding: [24, 24], maxZoom: 15 });
      } catch (e) {
        // ignore
      }
    }, 150);

    return () => {
      clearTimeout(t);
      try {
        map.remove();
      } catch (e) {
        // ignore
      }
      mapInstanceRef.current = null;
    };
  }, [trip]);

  // Handle step playback animation
  useEffect(() => {
    if (!isPlaying) {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      return;
    }

    const intervalTime = 1000 / playbackSpeed;
    animIntervalRef.current = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= waypoints.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    };
  }, [isPlaying, playbackSpeed, waypoints.length]);

  // Update map marker on step change
  useEffect(() => {
    if (!markerRef.current || !waypoints[stepIndex]) return;
    const pt = waypoints[stepIndex];
    markerRef.current.setLatLng([pt.lat, pt.lng]);
    if (mapInstanceRef.current && isPlaying) {
      mapInstanceRef.current.panTo([pt.lat, pt.lng], { animate: true, duration: 0.3 });
    }
  }, [stepIndex, waypoints, isPlaying]);

  if (!trip) return null;

  const currentWp = waypoints[stepIndex] || waypoints[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs"
    >
      <motion.div
        initial={{ y: '100%', opacity: 0.9, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: '100%', opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-md h-[90vh] sm:h-[85vh] bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Route className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                  {trip.vehiclePlate}
                </span>
                {vehicle && (
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    ({vehicle.make} {vehicle.model})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                {trip.startTime} → {trip.endTime}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Map View */}
        <div className="relative h-64 sm:h-72 w-full shrink-0 bg-slate-950 border-b border-slate-200 dark:border-zinc-800">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Current Waypoint HUD */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-30">
            <div className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5 shadow-md">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>Step {stepIndex + 1} of {waypoints.length}</span>
            </div>

            <div className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-[10px] font-mono text-white font-bold flex items-center gap-2 shadow-md">
              <span>{currentWp.speed || 0} km/h</span>
              <span className="text-slate-500">|</span>
              <span>{currentWp.time}</span>
            </div>
          </div>
        </div>

        {/* Playback Controls & Scrubber */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-200 dark:border-zinc-800 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setStepIndex(0);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800"
                title="Reset Replay"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Multiplier */}
            <div className="flex items-center gap-1 bg-slate-200 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-mono font-bold">
              {([1, 2, 4] as const).map((spd) => (
                <button
                  key={`spd-${spd}`}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded ${playbackSpeed === spd ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-zinc-400'}`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Slider */}
          <input
            type="range"
            min={0}
            max={Math.max(waypoints.length - 1, 1)}
            value={stepIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setStepIndex(Number(e.target.value));
            }}
            className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Scrollable Trip Details */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Origin and Destination */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                A
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Departure Point</p>
                <p className="font-semibold text-slate-800 dark:text-zinc-200">{trip.startAddress}</p>
                <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">{trip.startTime}</p>
              </div>
            </div>

            <div className="border-l-2 border-dashed border-slate-300 dark:border-zinc-700 ml-2.5 h-4 my-1" />

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                B
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Arrival Destination</p>
                <p className="font-semibold text-slate-800 dark:text-zinc-200">{trip.endAddress}</p>
                <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">{trip.endTime}</p>
              </div>
            </div>
          </div>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-zinc-300">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">
                <Route className="w-3.5 h-3.5 text-emerald-500" />
                <span>Distance</span>
              </div>
              <p className="text-base font-black text-slate-900 dark:text-white font-mono">
                {trip.distanceKm.toFixed(1)} km
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Duration</span>
              </div>
              <p className="text-base font-black text-slate-900 dark:text-white font-mono">
                {Math.floor(trip.durationMinutes / 60)}h {trip.durationMinutes % 60}m
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">
                <Gauge className="w-3.5 h-3.5 text-amber-500" />
                <span>Max Speed</span>
              </div>
              <p className="text-base font-black text-slate-900 dark:text-white font-mono">
                {trip.maxSpeedKmH} km/h
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">
                <Fuel className="w-3.5 h-3.5 text-rose-500" />
                <span>Fuel Consumed</span>
              </div>
              <p className="text-base font-black text-slate-900 dark:text-white font-mono">
                {trip.fuelConsumedLiters || 18.2} L
              </p>
            </div>
          </div>

          {/* Waypoints Trajectory Feed */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-zinc-500">
              GPS Sequence Points ({waypoints.length})
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {waypoints.map((wp, i) => (
                <div
                  key={`wp-row-${i}`}
                  onClick={() => setStepIndex(i)}
                  className={`p-2 rounded-lg border text-[11px] font-mono flex items-center justify-between cursor-pointer transition-colors ${
                    stepIndex === i
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800">
                      #{i + 1}
                    </span>
                    <span>{wp.time}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span>{wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{wp.speed || 0} km/h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
