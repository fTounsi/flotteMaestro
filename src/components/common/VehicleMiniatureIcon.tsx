import React from 'react';
import { getVehicleBrandLogo } from '../../services/vehicleCatalogService';

export interface VehicleMiniatureProps {
  vehicleType: 'truck' | 'van' | 'sedan' | 'suv' | 'bus' | 'motorcycle' | 'reefer' | string;
  color?: string;
  make?: string;
  heading?: number;
  size?: number; // pixel width/height
  showBrandBadge?: boolean;
  className?: string;
}

/**
 * High-fidelity top-down miniature vehicle SVG paths
 */
export const getMiniatureSvgPath = (type: string, color: string = '#0284c7'): string => {
  const normType = (type || 'van').toLowerCase();

  switch (normType) {
    case 'truck':
      // Heavy Semi-Trailer / Rig Top-Down Silhouette
      return `
        <svg viewBox="0 0 48 48" class="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Trailer body -->
          <rect x="14" y="16" width="20" height="28" rx="2.5" fill="${color}" stroke="#ffffff" stroke-width="1.2" />
          <line x1="14" y1="24" x2="34" y2="24" stroke="#ffffff" stroke-width="0.8" opacity="0.6"/>
          <line x1="14" y1="32" x2="34" y2="32" stroke="#ffffff" stroke-width="0.8" opacity="0.6"/>
          <!-- Cab unit -->
          <rect x="15" y="4" width="18" height="11" rx="2" fill="#1e293b" stroke="#ffffff" stroke-width="1.2" />
          <!-- Windshield -->
          <rect x="17" y="6" width="14" height="4" rx="1" fill="#38bdf8" />
          <!-- Mirrors -->
          <rect x="12" y="7" width="2" height="4" rx="0.5" fill="#e2e8f0" />
          <rect x="34" y="7" width="2" height="4" rx="0.5" fill="#e2e8f0" />
          <!-- Headlights -->
          <circle cx="17" cy="4.5" r="1" fill="#fef08a" />
          <circle cx="31" cy="4.5" r="1" fill="#fef08a" />
        </svg>
      `;

    case 'reefer':
      // Refrigerated Cold Chain Truck with snowflake indicator
      return `
        <svg viewBox="0 0 48 48" class="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Insulated White/Cyan Thermal Box -->
          <rect x="13" y="15" width="22" height="29" rx="2" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5" />
          <rect x="15" y="17" width="18" height="25" rx="1.5" fill="${color}" />
          <!-- Cooling unit (Reefer unit above cab) -->
          <rect x="17" y="12" width="14" height="4" rx="1" fill="#38bdf8" stroke="#ffffff" stroke-width="0.8" />
          <!-- Cab -->
          <rect x="15" y="4" width="18" height="10" rx="2" fill="#0f172a" stroke="#ffffff" stroke-width="1.2" />
          <rect x="17" y="6" width="14" height="3.5" rx="1" fill="#93c5fd" />
          <!-- Cold flake icon on roof -->
          <circle cx="24" cy="29" r="4" fill="#0284c7" opacity="0.8" />
          <path d="M24 26v6M21 29h6M22 27l4 4M22 31l4-4" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" />
        </svg>
      `;

    case 'van':
      // Commercial Cargo Van Top-Down Silhouette
      return `
        <svg viewBox="0 0 48 48" class="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Van Body -->
          <path d="M15 10C15 6 17 4 24 4C31 4 33 6 33 10V41C33 43 31 44 24 44C17 44 15 43 15 41V10Z" fill="${color}" stroke="#ffffff" stroke-width="1.2" />
          <!-- Windshield -->
          <path d="M17 11C17 8 19 7 24 7C29 7 31 8 31 11V14H17V11Z" fill="#38bdf8" />
          <!-- Side Windows -->
          <rect x="16" y="16" width="2" height="6" rx="0.5" fill="#1e293b" />
          <rect x="30" y="16" width="2" height="6" rx="0.5" fill="#1e293b" />
          <!-- Rear Cargo Doors seam -->
          <line x1="24" y1="28" x2="24" y2="43" stroke="#ffffff" stroke-width="1" stroke-dasharray="2 1" />
          <!-- Side mirrors -->
          <rect x="13" y="12" width="2" height="3" rx="0.5" fill="#cbd5e1" />
          <rect x="33" y="12" width="2" height="3" rx="0.5" fill="#cbd5e1" />
        </svg>
      `;

    case 'suv':
      // 4x4 SUV Top-Down Silhouette
      return `
        <svg viewBox="0 0 48 48" class="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Main SUV Body with wider fenders -->
          <path d="M14 11C14 7 17 5 24 5C31 5 34 7 34 11V39C34 42 31 43 24 43C17 43 14 42 14 39V11Z" fill="${color}" stroke="#ffffff" stroke-width="1.2" />
          <!-- Front Hood -->
          <path d="M16 11C16 8 19 7 24 7C29 7 32 8 32 11V13H16V11Z" fill="#0f172a" opacity="0.3" />
          <!-- Panoramic Windshield & Sunroof -->
          <rect x="17" y="13" width="14" height="6" rx="1.5" fill="#38bdf8" />
          <rect x="18" y="21" width="12" height="8" rx="1" fill="#1e293b" />
          <!-- Roof Rails -->
          <line x1="16" y1="16" x2="16" y2="34" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" />
          <line x1="32" y1="16" x2="32" y2="34" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" />
        </svg>
      `;

    case 'bus':
      // Transit Coach / Bus
      return `
        <svg viewBox="0 0 48 48" class="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="3" width="20" height="42" rx="3.5" fill="${color}" stroke="#ffffff" stroke-width="1.3" />
          <!-- Front Windshield -->
          <rect x="16" y="5" width="16" height="5" rx="1" fill="#38bdf8" />
          <!-- Passenger windows -->
          <rect x="15" y="13" width="18" height="2" rx="0.5" fill="#1e293b" />
          <rect x="15" y="18" width="18" height="2" rx="0.5" fill="#1e293b" />
          <rect x="15" y="23" width="18" height="2" rx="0.5" fill="#1e293b" />
          <rect x="15" y="28" width="18" height="2" rx="0.5" fill="#1e293b" />
          <rect x="15" y="33" width="18" height="2" rx="0.5" fill="#1e293b" />
          <!-- Rear Glass -->
          <rect x="16" y="41" width="16" height="2.5" rx="0.5" fill="#38bdf8" />
        </svg>
      `;

    case 'motorcycle':
      // Motorbike / Scooter Silhouette
      return `
        <svg viewBox="0 0 48 48" class="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Handlebars -->
          <line x1="16" y1="12" x2="32" y2="12" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
          <!-- Front Wheel -->
          <rect x="22" y="4" width="4" height="8" rx="1.5" fill="#0f172a" stroke="#ffffff" stroke-width="0.8" />
          <!-- Body Frame & Tank -->
          <ellipse cx="24" cy="22" rx="4.5" ry="9" fill="${color}" stroke="#ffffff" stroke-width="1.2" />
          <!-- Seat -->
          <rect x="22" y="24" width="4" height="7" rx="1" fill="#0f172a" />
          <!-- Rear Wheel & Cargo Box -->
          <rect x="20" y="33" width="8" height="9" rx="2" fill="#1e293b" stroke="#38bdf8" stroke-width="1" />
        </svg>
      `;

    case 'sedan':
    default:
      // Aerodynamic Passenger Sedan
      return `
        <svg viewBox="0 0 48 48" class="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Car Body -->
          <path d="M16 10C16 6 18 5 24 5C30 5 32 6 32 10V38C32 42 30 43 24 43C18 43 16 42 16 38V10Z" fill="${color}" stroke="#ffffff" stroke-width="1.2" />
          <!-- Front Hood Accent -->
          <path d="M18 10C18 8 20 7 24 7C28 7 30 8 30 10V12H18V10Z" fill="#0f172a" opacity="0.25" />
          <!-- Windshield -->
          <path d="M18 13C18 11 20 10 24 10C28 10 30 11 30 13V18H18V13Z" fill="#38bdf8" />
          <!-- Roof -->
          <rect x="19" y="19" width="10" height="9" rx="1" fill="#0f172a" opacity="0.2" />
          <!-- Rear Window -->
          <path d="M18 29H30V33C30 35 28 36 24 36C20 36 18 35 18 33V29Z" fill="#38bdf8" />
          <!-- Side mirrors -->
          <rect x="14" y="13" width="2" height="3" rx="0.5" fill="#e2e8f0" />
          <rect x="32" y="13" width="2" height="3" rx="0.5" fill="#e2e8f0" />
          <!-- Headlights -->
          <circle cx="18" cy="5.5" r="1.2" fill="#fef08a" />
          <circle cx="30" cy="5.5" r="1.2" fill="#fef08a" />
        </svg>
      `;
  }
};

/**
 * Generate a complete Leaflet-ready HTML string for the vehicle marker on the Live GPS Map
 */
export const buildLeafletVehicleMarkerHtml = (
  veh: {
    id: string;
    make: string;
    model: string;
    vehicleType: string;
    color: string;
    licensePlate: string;
    status: string;
    logoUrl?: string;
    latestPosition: {
      speed: number;
      heading: number;
      ignition: boolean;
    };
  },
  isSelected: boolean = false
): string => {
  const { vehicleType, color = '#0284c7', make, licensePlate, status, latestPosition } = veh;
  const heading = latestPosition?.heading || 0;
  const speed = latestPosition?.speed || 0;
  const isMoving = status === 'moving' && speed > 0;

  const brandLogo = veh.logoUrl || getVehicleBrandLogo(make);

  let statusRing = 'border-emerald-400 ring-emerald-500/40';
  let statusBadgeBg = 'bg-emerald-500 text-black';
  let pulseDot = '<span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span><span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400"></span>';

  if (status === 'idle') {
    statusRing = 'border-amber-400 ring-amber-500/40';
    statusBadgeBg = 'bg-amber-500 text-black';
    pulseDot = '<span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400"></span>';
  } else if (status === 'stopped') {
    statusRing = 'border-zinc-500 ring-zinc-700/30';
    statusBadgeBg = 'bg-zinc-700 text-white';
    pulseDot = '';
  } else if (status === 'offline') {
    statusRing = 'border-rose-500 ring-rose-500/40';
    statusBadgeBg = 'bg-rose-500 text-white';
    pulseDot = '';
  }

  const svgContent = getMiniatureSvgPath(vehicleType, color);

  return `
    <div class="relative flex flex-col items-center cursor-pointer group transition-all duration-200 ${isSelected ? 'scale-125 z-50' : 'scale-100'}">
      <!-- Main Marker Miniature Container -->
      <div class="relative flex items-center justify-center">
        <!-- Directional Halo & Miniature Vehicle Card -->
        <div class="marker-card w-11 h-11 rounded-2xl bg-zinc-950/95 border-2 ${statusRing} shadow-[0_0_15px_rgba(0,0,0,0.8)] flex items-center justify-center p-1.5 relative overflow-visible backdrop-blur-md">
          <!-- Top-down Rotating Miniature Car SVG -->
          <div style="transform: rotate(${heading}deg)" class="w-full h-full transition-transform duration-300 flex items-center justify-center">
            ${svgContent}
          </div>

          <!-- Brand Logo Miniature Stamp on Top-Left -->
          <div class="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-white border border-zinc-700 shadow-md flex items-center justify-center p-0.5 overflow-hidden z-10">
            <img src="${brandLogo}" alt="${make}" class="w-full h-full object-contain" onerror="this.style.display='none'" />
          </div>

          <!-- Live Status Pulse Indicator on Top-Right -->
          ${pulseDot}
        </div>

        <!-- Heading Arrow Pointer (small needle on exterior) -->
        ${isMoving ? `
          <div style="transform: rotate(${heading}deg); transform-origin: center center;" class="absolute inset-0 pointer-events-none flex items-start justify-center -top-2">
            <div class="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-emerald-400"></div>
          </div>
        ` : ''}
      </div>

      <!-- License Plate & Speed Tag -->
      <div class="marker-tag mt-1 bg-zinc-950/95 border border-zinc-800 px-2 py-0.5 rounded-full shadow-2xl text-[9px] font-bold text-white whitespace-nowrap tracking-wider flex items-center gap-1 font-mono">
        <span>${licensePlate}</span>
        ${speed > 0 ? `<span class="px-1 rounded-full ${statusBadgeBg} text-[8px] font-black">${speed}k</span>` : ''}
      </div>
    </div>
  `;
};

/**
 * React Component for Rendering Vehicle Miniature Icon with Brand Logo
 */
export const VehicleMiniatureIcon: React.FC<VehicleMiniatureProps> = ({
  vehicleType,
  color = '#0284c7',
  make = 'Renault',
  heading = 0,
  size = 48,
  showBrandBadge = true,
  className = ''
}) => {
  const brandLogo = getVehicleBrandLogo(make);
  const svgHtml = getMiniatureSvgPath(vehicleType, color);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ transform: `rotate(${heading}deg)` }}
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />

      {showBrandBadge && (
        <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-white border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center p-0.5 overflow-hidden z-10">
          <img
            src={brandLogo}
            alt={make}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};
