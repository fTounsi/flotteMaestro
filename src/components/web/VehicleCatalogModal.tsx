import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Truck,
  Car,
  Check,
  Globe,
  PenTool,
  Sparkles,
  Radio,
  Layers,
  Palette,
  Info,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Snowflake,
  Fuel,
  Compass,
  Battery,
  Zap,
  Cpu,
  Unlink,
  CheckCircle2,
  AlertCircle,
  Hash,
  Activity,
  Gauge
} from 'lucide-react';
import { Vehicle, Tracker } from '../../types/fleet';
import { TranslationDictionary } from '../../translations/i18n';
import {
  searchVehicleCatalog,
  getVehicleBrandLogo,
  VehicleCatalogItem,
  COMPREHENSIVE_GLOBAL_VEHICLES
} from '../../services/vehicleCatalogService';
import { VehicleMiniatureIcon } from '../common/VehicleMiniatureIcon';

interface VehicleCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (newVehicle: Partial<Vehicle>) => void;
  availableTrackers: Tracker[];
  t: TranslationDictionary;
}

// Preset vehicle colors for fast visual styling
const PRESET_VEHICLE_COLORS = [
  { name: 'Cobalt Blue', hex: '#0284c7' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Crimson Red', hex: '#e11d48' },
  { name: 'Graphite Dark', hex: '#1e293b' },
  { name: 'Amber Orange', hex: '#f59e0b' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Silver Gray', hex: '#94a3b8' },
  { name: 'Deep Purple', hex: '#7c3aed' }
];

// Quick fleet presets for 1-click auto-fill
const QUICK_PRESETS: VehicleCatalogItem[] = [
  { make: 'Renault', model: 'Master L3H2', vehicleType: 'van', bodyType: 'High Roof Cargo Van', fuelType: 'diesel', engineInfo: '2.3 dCi 150HP Euro 6D' },
  { make: 'Dacia', model: 'Dokker Van', vehicleType: 'van', bodyType: 'Compact Urban Van', fuelType: 'diesel', engineInfo: '1.5 dCi 90HP' },
  { make: 'Volvo', model: 'FH16 750', vehicleType: 'truck', bodyType: 'Heavy Tractor Unit', fuelType: 'diesel', engineInfo: '16.1L 750HP Euro 6e' },
  { make: 'Scania', model: 'R 500 Super', vehicleType: 'truck', bodyType: 'Long Haul Semi-Truck', fuelType: 'diesel', engineInfo: '13L 500HP Opticruise' },
  { make: 'Mercedes-Benz', model: 'Actros 1845 Reefer', vehicleType: 'reefer', bodyType: 'Cold Chain ThermoKing', fuelType: 'diesel', engineInfo: 'OM471 449HP -25°C Unit' },
  { make: 'Toyota', model: 'Hilux Double Cab 4x4', vehicleType: 'suv', bodyType: 'Field Inspection Pick-up', fuelType: 'diesel', engineInfo: '2.8 D-4D 204HP 4WD' },
  { make: 'Peugeot', model: 'Partner L1', vehicleType: 'van', bodyType: 'City Express Van', fuelType: 'diesel', engineInfo: '1.5 BlueHDi 100HP' },
  { make: 'BYD', model: 'Seal EV', vehicleType: 'sedan', bodyType: 'Executive Fleet EV', fuelType: 'electric', engineInfo: '82.5 kWh Dual Motor 530HP' }
];

export const VehicleCatalogModal: React.FC<VehicleCatalogModalProps> = ({
  isOpen,
  onClose,
  onAddVehicle,
  availableTrackers,
  t
}) => {
  if (!isOpen) return null;

  // Search & API State for Vehicles
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VehicleCatalogItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Form Fields (fully editable for manual write or API auto-fill)
  const [make, setMake] = useState('Renault');
  const [model, setModel] = useState('Master L3H2');
  const [modelYear, setModelYear] = useState(2024);
  const [vehicleType, setVehicleType] = useState<'truck' | 'van' | 'sedan' | 'suv' | 'bus' | 'motorcycle' | 'reefer'>('van');
  const [bodyType, setBodyType] = useState('High Roof Cargo Van');
  const [fuelType, setFuelType] = useState<'diesel' | 'gasoline' | 'electric' | 'hybrid'>('diesel');
  const [engineInfo, setEngineInfo] = useState('2.3L dCi 150HP Euro 6D');
  const [licensePlate, setLicensePlate] = useState('');
  const [vin, setVin] = useState('');
  const [color, setColor] = useState('#0284c7');
  const [customLogoUrl, setCustomLogoUrl] = useState('');

  // Tracker State - Filter ONLY unassigned / unbound physical trackers
  const unbindTrackers = availableTrackers.filter((trk) => {
    // A tracker is unbind if it doesn't have an assigned vehicleId or vehiclePlate, or status is unassigned
    const isBound = Boolean(trk.vehicleId || trk.vehiclePlate);
    return !isBound || trk.status === 'unassigned';
  });

  const [selectedTrackerId, setSelectedTrackerId] = useState<string>('');
  const [trackerSearchQuery, setTrackerSearchQuery] = useState('');
  const [isTrackerDropdownOpen, setIsTrackerDropdownOpen] = useState(false);
  const trackerDropdownRef = useRef<HTMLDivElement>(null);

  // Selected tracker instance
  const selectedTracker = unbindTrackers.find((t) => t.id === selectedTrackerId);

  // Filtered list of unassigned trackers based on search query
  const filteredUnbindTrackers = unbindTrackers.filter((trk) => {
    const q = trackerSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      trk.imei.toLowerCase().includes(q) ||
      trk.model.toLowerCase().includes(q) ||
      trk.manufacturer.toLowerCase().includes(q) ||
      trk.protocol.toLowerCase().includes(q) ||
      (trk.deviceIdentifier && trk.deviceIdentifier.toLowerCase().includes(q)) ||
      (trk.simPhoneNumber && trk.simPhoneNumber.toLowerCase().includes(q))
    );
  });

  // Close tracker dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (trackerDropdownRef.current && !trackerDropdownRef.current.contains(event.target as Node)) {
        setIsTrackerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Selected brand logo URL
  const brandLogo = customLogoUrl || getVehicleBrandLogo(make);

  // Search Debounce Effect with Free API & Global Catalog
  useEffect(() => {
    let isMounted = true;
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchVehicleCatalog(searchQuery);
        if (isMounted) {
          setSearchResults(results);
          setIsSearching(false);
        }
      } catch {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // When a catalog item is clicked from search suggestions or presets
  const handleSelectCatalogItem = (item: VehicleCatalogItem) => {
    setMake(item.make);
    setModel(item.model);
    setVehicleType(item.vehicleType);
    setBodyType(item.bodyType || `${item.make} ${item.model}`);
    setFuelType(item.fuelType || 'diesel');
    setEngineInfo(item.engineInfo || `${item.make} Euro 6 Profile`);
    setCustomLogoUrl(item.logoUrl || getVehicleBrandLogo(item.make));
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const getProtocolBadgeClass = (protocol: string) => {
    switch (protocol?.toLowerCase()) {
      case 'teltonika':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'coban':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30';
      case 'concox':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'obd2':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'queclink':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate.trim() || !make.trim() || !model.trim()) return;

    const matchedTracker = selectedTracker;

    onAddVehicle({
      make: make.trim(),
      model: model.trim(),
      modelYear,
      vehicleType,
      bodyType: bodyType.trim() || `${make} ${model}`,
      fuelType,
      engineInfo: engineInfo.trim() || 'Standard Fleet Profile',
      licensePlate: licensePlate.trim(),
      vin: vin.trim() || `VF1${make.slice(0, 2).toUpperCase()}${Date.now()}`,
      color,
      imageUrl: `https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&auto=format&fit=crop&q=80`,
      iconType: vehicleType,
      trackerId: selectedTrackerId || undefined,
      trackerImei: matchedTracker?.imei,
      trackerProtocol: matchedTracker?.protocol || 'teltonika'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 dark:bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Wide Full-Page Container */}
      <div className="bg-white dark:bg-[#080808] border border-slate-200 dark:border-zinc-800 rounded-[32px] w-full max-w-[96vw] xl:max-w-7xl max-h-[94vh] shadow-2xl overflow-hidden text-slate-900 dark:text-white flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-950/70 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="border-l-2 border-emerald-500 pl-3.5 py-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 font-bold">
                  Fleet Asset Provisioning
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  v2.4
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                {t.actions.addVehicle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-mono">
              <span className="flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-emerald-500" />
                {unbindTrackers.length} Unassigned Trackers
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body - Responsive 2-Column Wide Layout */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: Discovery, API Catalog Search, Visual Miniature Preview & Quick Presets */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* 1. Global Vehicle Catalog & Free API Search Bar */}
              <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-4 sm:p-5 space-y-3 relative shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Global Vehicle Catalog & Free API
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Type any make or model for instant specs & official brand logo
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search Input Box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setShowSearchResults(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(true);
                    }}
                    placeholder="Search e.g. Scania R500, Master, Dokker, Hilux, FH16, Tesla..."
                    className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                  {isSearching && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Autocomplete Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-h-64 overflow-y-auto z-50 p-2 space-y-1 divide-y divide-slate-100 dark:divide-zinc-900">
                      {searchResults.map((item, idx) => (
                        <div
                          key={`${item.make}-${item.model}-${idx}`}
                          onClick={() => handleSelectCatalogItem(item)}
                          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                              <img
                                src={item.logoUrl || getVehicleBrandLogo(item.make)}
                                alt={item.make}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{item.make}</span>
                                <span className="font-normal text-slate-600 dark:text-zinc-300">{item.model}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                                {item.bodyType || `${item.vehicleType} series`} • {item.fuelType}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20">
                              {item.vehicleType}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Live Miniature Vehicle & Map Tracker Preview Card */}
              <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Live Map Miniature Preview
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20">
                    {vehicleType}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Miniature Vehicle Icon with Brand Logo badge */}
                  <div className="p-3.5 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-md shrink-0">
                    <VehicleMiniatureIcon
                      vehicleType={vehicleType}
                      color={color}
                      make={make}
                      size={68}
                      showBrandBadge={true}
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <div className="w-5 h-5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-0.5 flex items-center justify-center shrink-0">
                        <img
                          src={brandLogo}
                          alt={make}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                        {make} {model}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
                      <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-bold text-slate-900 dark:text-white">
                        {licensePlate || 'NO-PLATE'}
                      </span>
                      <span>•</span>
                      <span>{modelYear}</span>
                      <span>•</span>
                      <span className="capitalize">{fuelType}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 truncate">
                      {bodyType || 'Standard Body'} • {engineInfo}
                    </p>
                  </div>
                </div>

                {/* Color Palette Selector */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-slate-400" />
                      Vehicle Color Theme
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{color}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_VEHICLE_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setColor(c.hex)}
                        title={c.name}
                        className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                          color === c.hex
                            ? 'border-emerald-500 scale-110 shadow-md ring-2 ring-emerald-500/30'
                            : 'border-slate-300 dark:border-zinc-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {color === c.hex && (
                          <Check className={`w-3.5 h-3.5 ${c.hex === '#ffffff' ? 'text-black' : 'text-white'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Quick Fleet Model Presets (1-Click Auto-Fill) */}
              <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-4 sm:p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Quick Fleet Templates (1-Click Preset)
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">Popular</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PRESETS.map((preset) => (
                    <button
                      key={`${preset.make}-${preset.model}`}
                      type="button"
                      onClick={() => handleSelectCatalogItem(preset)}
                      className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 text-left transition-all group flex items-center gap-2.5 shadow-2xs"
                    >
                      <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-zinc-900 p-0.5 flex items-center justify-center shrink-0">
                        <img
                          src={getVehicleBrandLogo(preset.make)}
                          alt={preset.make}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {preset.make}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                          {preset.model}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Fully Editable Fields, Write Mode, Hardware GPS Tracker Assignment */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Asset Technical Specifications Card */}
              <div className="bg-white dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 space-y-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Asset Specifications (Writable Fields)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-sans">
                    Manual write or auto-filled
                  </span>
                </div>

                {/* Make & Model Series */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Manufacturer Make *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={make}
                        onChange={(e) => {
                          setMake(e.target.value);
                          setCustomLogoUrl('');
                        }}
                        placeholder="e.g. Renault, Volvo, Scania, Dacia, Toyota..."
                        required
                        list="make-suggestions-full"
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-xs font-medium"
                      />
                      <div className="absolute left-3 w-5 h-5 rounded-md overflow-hidden flex items-center justify-center pointer-events-none">
                        <img
                          src={brandLogo}
                          alt={make}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                    <datalist id="make-suggestions-full">
                      <option value="Renault" />
                      <option value="Dacia" />
                      <option value="Peugeot" />
                      <option value="Citroën" />
                      <option value="Mercedes-Benz" />
                      <option value="Volvo" />
                      <option value="Scania" />
                      <option value="MAN" />
                      <option value="DAF" />
                      <option value="Iveco" />
                      <option value="Toyota" />
                      <option value="Hyundai" />
                      <option value="Kia" />
                      <option value="Ford" />
                      <option value="Isuzu" />
                      <option value="Fuso" />
                      <option value="Volkswagen" />
                      <option value="BYD" />
                      <option value="Tesla" />
                      <option value="Fiat" />
                      <option value="Nissan" />
                      <option value="Mitsubishi" />
                      <option value="Audi" />
                      <option value="BMW" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Model Series *
                    </label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. Master L3H2, FH16 540, Dokker, Hilux, 208..."
                      required
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-xs font-medium"
                    />
                  </div>
                </div>

                {/* Category, Year, License Plate */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select
                      aria-label="Vehicle Category"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
                    >
                      <option value="van">Van / Light Commercial</option>
                      <option value="truck">Semi-Trailer / Heavy Truck</option>
                      <option value="reefer">Reefer / Cold Storage</option>
                      <option value="suv">SUV 4x4 / Crossover</option>
                      <option value="sedan">Passenger Sedan / Hatchback</option>
                      <option value="bus">Transit Bus / Coach</option>
                      <option value="motorcycle">Motorcycle / Scooter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Model Year
                    </label>
                    <input
                      type="number"
                      value={modelYear}
                      onChange={(e) => setModelYear(Number(e.target.value))}
                      min={1990}
                      max={2030}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      License Plate *
                    </label>
                    <input
                      type="text"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      placeholder="e.g. 12345-A-1"
                      required
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-xs uppercase"
                    />
                  </div>
                </div>

                {/* Body Type & Fuel Type & Engine Spec */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Body Style / Chassis
                    </label>
                    <input
                      type="text"
                      value={bodyType}
                      onChange={(e) => setBodyType(e.target.value)}
                      placeholder="e.g. High Roof Cargo Van"
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Fuel / Powertrain
                    </label>
                    <select
                      aria-label="Fuel / Powertrain"
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
                    >
                      <option value="diesel">Diesel (Euro 6)</option>
                      <option value="gasoline">Gasoline / Unleaded</option>
                      <option value="electric">100% Electric EV</option>
                      <option value="hybrid">Hybrid Powertrain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      VIN / Chassis Serial
                    </label>
                    <input
                      type="text"
                      value={vin}
                      onChange={(e) => setVin(e.target.value.toUpperCase())}
                      placeholder="e.g. VF1MA00030192834"
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 uppercase shadow-xs"
                    />
                  </div>
                </div>

                {/* Engine Info */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Engine / Powertrain Rating
                  </label>
                  <input
                    type="text"
                    value={engineInfo}
                    onChange={(e) => setEngineInfo(e.target.value)}
                    placeholder="e.g. 2.3 dCi 150HP Euro 6D / 82 kWh Dual Motor"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-xs font-mono"
                  />
                </div>
              </div>

              {/* 4. Searchable Unbound Physical GPS Hardware Tracker Selector */}
              <div className="bg-white dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-500" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Assign Physical GPS Hardware Tracker
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Shows strictly unbound hardware units in inventory
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono">
                    {unbindTrackers.length} Unbound Units
                  </span>
                </div>

                <div ref={trackerDropdownRef} className="relative">
                  {/* Trigger Card / Selected Tracker Display */}
                  {selectedTracker ? (
                    <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-2 border-emerald-500/50 dark:border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
                          <Radio className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${getProtocolBadgeClass(selectedTracker.protocol)}`}>
                              {selectedTracker.protocol}
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {selectedTracker.model}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 font-mono mt-1">
                            <span>IMEI: <strong className="text-slate-800 dark:text-zinc-200">{selectedTracker.imei}</strong></span>
                            <span>•</span>
                            <span>{selectedTracker.manufacturer}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <Battery className="w-3.5 h-3.5" /> {selectedTracker.battery}% ({selectedTracker.externalVoltage}V)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            setIsTrackerDropdownOpen(!isTrackerDropdownOpen);
                            setTrackerSearchQuery('');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 transition-colors shadow-2xs"
                        >
                          Change Tracker
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTrackerId('')}
                          title="Remove tracker (Set to Virtual Standby)"
                          className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsTrackerDropdownOpen(!isTrackerDropdownOpen);
                        setTrackerSearchQuery('');
                      }}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl px-4 py-3.5 text-left flex items-center justify-between text-xs transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400">
                        <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                        <span className="font-medium">
                          {unbindTrackers.length > 0
                            ? 'Search & assign an unbound hardware tracker (e.g. Teltonika, Coban, Concox, OBD-II)...'
                            : 'No unbound hardware trackers available (Virtual Standby Mode)'}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isTrackerDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}

                  {/* Searchable Dropdown Popup */}
                  {isTrackerDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                      {/* Live Search Input inside Dropdown */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          autoFocus
                          value={trackerSearchQuery}
                          onChange={(e) => setTrackerSearchQuery(e.target.value)}
                          placeholder="Type IMEI (e.g. 867...), Model (FMB920), Protocol (Coban), or SIM..."
                          className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                        {trackerSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setTrackerSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Unassigned Options List */}
                      <div className="max-h-64 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100 dark:divide-zinc-900">
                        {/* Virtual Standby Option */}
                        <div
                          onClick={() => {
                            setSelectedTrackerId('');
                            setIsTrackerDropdownOpen(false);
                          }}
                          className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs ${
                            selectedTrackerId === ''
                              ? 'bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white font-bold'
                              : 'hover:bg-slate-50 dark:hover:bg-zinc-900/60 text-slate-600 dark:text-zinc-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                              <Unlink className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-semibold">No Hardware Tracker (Virtual Standby)</p>
                              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                                Asset will be created in virtual telemetry simulation mode
                              </p>
                            </div>
                          </div>
                          {selectedTrackerId === '' && <Check className="w-4 h-4 text-emerald-500" />}
                        </div>

                        {/* Filtered Trackers */}
                        {filteredUnbindTrackers.map((trk) => {
                          const isSelected = selectedTrackerId === trk.id;
                          return (
                            <div
                              key={trk.id}
                              onClick={() => {
                                setSelectedTrackerId(trk.id);
                                setIsTrackerDropdownOpen(false);
                              }}
                              className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs ${
                                isSelected
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-slate-900 dark:text-white'
                                  : 'hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-emerald-500 shrink-0 shadow-2xs">
                                  <Radio className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${getProtocolBadgeClass(trk.protocol)}`}>
                                      {trk.protocol}
                                    </span>
                                    <span className="font-bold truncate">{trk.model}</span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                                    <span>IMEI: <strong>{trk.imei}</strong></span>
                                    <span>•</span>
                                    <span>{trk.manufacturer}</span>
                                    <span>•</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{trk.battery}% ({trk.externalVoltage}V)</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                                  Unbound
                                </span>
                                {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                              </div>
                            </div>
                          );
                        })}

                        {filteredUnbindTrackers.length === 0 && (
                          <div className="p-4 text-center text-xs text-slate-400 dark:text-zinc-500">
                            No unbound trackers found matching "{trackerSearchQuery}".
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Modal Action Footer */}
          <div className="mt-8 pt-5 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Asset will be instantly registered and active on GPS tracking servers</span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 sm:px-6 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors border border-slate-200 dark:border-zinc-800"
              >
                {t.actions.cancel}
              </button>
              <button
                type="submit"
                className="px-7 sm:px-8 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{t.actions.addVehicle}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
