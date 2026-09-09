import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Maximize2, MapPin, Flag, Navigation, Route, Compass } from 'lucide-react';

export interface TripWaypoint {
  lat: number;
  lng: number;
  speed?: number;
  time?: string;
  altitude?: number;
}

interface TripMiniMapProps {
  id: string;
  waypoints: TripWaypoint[];
  startAddress?: string;
  endAddress?: string;
  distanceKm?: number;
  durationMinutes?: number;
  heightClass?: string;
  onExpand?: () => void;
}

export const TripMiniMap: React.FC<TripMiniMapProps> = ({
  id,
  waypoints,
  startAddress,
  endAddress,
  distanceKm,
  durationMinutes,
  heightClass = 'h-36',
  onExpand
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Compute bounding box and SVG fallback path coordinates
  const svgPathData = useMemo(() => {
    if (!waypoints || waypoints.length < 2) return null;

    const lats = waypoints.map((w) => w.lat);
    const lngs = waypoints.map((w) => w.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latSpan = Math.max(maxLat - minLat, 0.005);
    const lngSpan = Math.max(maxLng - minLng, 0.005);

    // SVG coordinate space: 320 x 140 with 24px padding
    const width = 320;
    const height = 140;
    const paddingX = 32;
    const paddingY = 24;

    const innerW = width - paddingX * 2;
    const innerH = height - paddingY * 2;

    const points = waypoints.map((w) => {
      // Invert Y because latitude increases northward (upwards)
      const x = paddingX + ((w.lng - minLng) / lngSpan) * innerW;
      const y = height - paddingY - ((w.lat - minLat) / latSpan) * innerH;
      return { x, y };
    });

    const pathD = points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }, '');

    return {
      pathD,
      points,
      start: points[0],
      end: points[points.length - 1],
      minLat,
      maxLat,
      minLng,
      maxLng
    };
  }, [waypoints]);

  // Initialize static Leaflet Mini-Map
  useEffect(() => {
    const container = containerRef.current;
    if (!container || waypoints.length === 0) return;

    // Clean up any stale map instance
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        // ignore
      }
      mapInstanceRef.current = null;
    }

    try {
      const isDarkMode =
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark';

      const tileUrl = isDarkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      const map = L.map(container, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false
      });

      L.tileLayer(tileUrl, {
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      const latLngs: [number, number][] = waypoints.map((w) => [w.lat, w.lng]);

      // Route Glow Outline
      L.polyline(latLngs, {
        color: '#047857',
        weight: 6,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Primary Route Polyline
      const polyline = L.polyline(latLngs, {
        color: '#10b981',
        weight: 3.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Start Marker (Origin Point "A")
      const startPoint = latLngs[0];
      const startMarkerIcon = L.divIcon({
        className: 'custom-trip-mini-marker',
        html: `
          <div style="width: 20px; height: 20px; border-radius: 9999px; background-color: #059669; border: 2px solid #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 9px; font-weight: 900; font-family: ui-monospace, monospace;">
            A
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      L.marker(startPoint, { icon: startMarkerIcon }).addTo(map);

      // End Marker (Destination Point "B")
      const endPoint = latLngs[latLngs.length - 1];
      const endMarkerIcon = L.divIcon({
        className: 'custom-trip-mini-marker',
        html: `
          <div style="width: 20px; height: 20px; border-radius: 9999px; background-color: #e11d48; border: 2px solid #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 9px; font-weight: 900; font-family: ui-monospace, monospace;">
            B
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      L.marker(endPoint, { icon: endMarkerIcon }).addTo(map);

      // Fit bounds with generous padding so the polyline isn't cut off
      const bounds = polyline.getBounds();
      map.fitBounds(bounds, {
        padding: [18, 18],
        maxZoom: 15
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);

      const resizeTimer = setTimeout(() => {
        try {
          map.invalidateSize();
          map.fitBounds(bounds, { padding: [18, 18], maxZoom: 15 });
        } catch (e) {
          // ignore
        }
      }, 150);

      return () => {
        clearTimeout(resizeTimer);
        try {
          map.remove();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
      };
    } catch (err) {
      console.warn('Leaflet mini-map initialization fallback triggered:', err);
      setHasError(true);
    }
  }, [id, waypoints]);

  return (
    <div
      id={`trip-mini-map-card-${id}`}
      className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800/80 bg-slate-900 group shadow-inner select-none`}
    >
      {/* 1. Base Leaflet Container */}
      <div
        ref={containerRef}
        className={`w-full h-full transition-opacity duration-300 ${mapLoaded && !hasError ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* 2. SVG Vector Fallback & High-Definition Polyline Overlay */}
      {(!mapLoaded || hasError) && svgPathData && (
        <div className="absolute inset-0 flex items-center justify-center bg-radial from-slate-800 to-slate-950">
          {/* Subtle Geographic Grid Lines */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

          <svg
            className="w-full h-full"
            viewBox="0 0 320 140"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id={`polyGradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Polyline Path Shadow/Glow */}
            <path
              d={svgPathData.pathD}
              fill="none"
              stroke="#047857"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4"
            />

            {/* Polyline Path */}
            <path
              d={svgPathData.pathD}
              fill="none"
              stroke={`url(#polyGradient-${id})`}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#glow-${id})`}
            />

            {/* Waypoint Dots */}
            {svgPathData.points.map((pt, i) => (
              <circle
                key={`wpt-${i}`}
                cx={pt.x}
                cy={pt.y}
                r="2"
                fill="#ffffff"
                opacity="0.75"
              />
            ))}

            {/* Start Marker A */}
            <g transform={`translate(${svgPathData.start.x}, ${svgPathData.start.y})`}>
              <circle r="10" fill="#059669" stroke="#ffffff" strokeWidth="2" />
              <text textAnchor="middle" dy="3.5" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="monospace">
                A
              </text>
            </g>

            {/* End Marker B */}
            <g transform={`translate(${svgPathData.end.x}, ${svgPathData.end.y})`}>
              <circle r="10" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
              <text textAnchor="middle" dy="3.5" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="monospace">
                B
              </text>
            </g>
          </svg>
        </div>
      )}

      {/* 3. Static Route Polyline Overlay Badges */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 z-20 pointer-events-none">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[9px] font-mono text-emerald-400 font-bold shadow-sm">
          <Route className="w-2.5 h-2.5 text-emerald-400" />
          <span>{waypoints.length} GPS Waypoints</span>
        </span>

        {distanceKm && (
          <span className="px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[9px] font-mono text-white font-bold shadow-sm">
            {distanceKm.toFixed(1)} km
          </span>
        )}
      </div>

      {/* 4. Origin & Destination Micro Pills at the bottom */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-mono text-white/90 z-20 pointer-events-none">
        <div className="flex items-center gap-1 max-w-[48%] truncate bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700/60 shadow-xs">
          <span className="w-3 h-3 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[7px] font-black shrink-0">
            A
          </span>
          <span className="truncate">{startAddress || 'Depot'}</span>
        </div>

        <div className="flex items-center gap-1 max-w-[48%] truncate bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700/60 shadow-xs">
          <span className="w-3 h-3 rounded-full bg-rose-600 text-white flex items-center justify-center text-[7px] font-black shrink-0">
            B
          </span>
          <span className="truncate">{endAddress || 'Target Hub'}</span>
        </div>
      </div>

      {/* 5. Interactive Expand / Inspect Action (Optional Overlay Button) */}
      {onExpand && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          className="absolute top-2 right-2 z-20 p-1.5 rounded-lg bg-slate-950/80 hover:bg-emerald-600 active:scale-95 text-slate-300 hover:text-white backdrop-blur-md border border-slate-700/60 transition-all shadow-md cursor-pointer"
          title="Inspect Full Interactive Route Replay"
          aria-label="Inspect Full Route"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
