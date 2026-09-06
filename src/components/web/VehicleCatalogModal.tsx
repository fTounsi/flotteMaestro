import React, { useState } from 'react';
import { X, Search, Sparkles, Truck, Check, AlertCircle } from 'lucide-react';
import { VEHICLE_MAKE_CATALOG } from '../../data/mockData';
import { Vehicle, Tracker } from '../../types/fleet';
import { TranslationDictionary } from '../../translations/i18n';

interface VehicleCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (newVehicle: Partial<Vehicle>) => void;
  availableTrackers: Tracker[];
  t: TranslationDictionary;
}

export const VehicleCatalogModal: React.FC<VehicleCatalogModalProps> = ({
  isOpen,
  onClose,
  onAddVehicle,
  availableTrackers,
  t
}) => {
  if (!isOpen) return null;

  const [vinInput, setVinInput] = useState('');
  const [selectedMake, setSelectedMake] = useState('Renault');
  const [selectedModel, setSelectedModel] = useState('Master');
  const [modelYear, setModelYear] = useState(2024);
  const [vehicleType, setVehicleType] = useState<'truck' | 'van' | 'sedan' | 'suv' | 'bus' | 'motorcycle' | 'reefer'>('van');
  const [licensePlate, setLicensePlate] = useState('');
  const [color, setColor] = useState('#0284c7');
  const [selectedTrackerId, setSelectedTrackerId] = useState(availableTrackers[0]?.id || '');
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodeSuccess, setDecodeSuccess] = useState(false);

  const currentMakeObj = VEHICLE_MAKE_CATALOG.find((m) => m.make === selectedMake);
  const availableModels = currentMakeObj?.models || ['Standard Model'];

  const handleVinDecode = () => {
    if (!vinInput || vinInput.length < 5) return;
    setIsDecoding(true);
    setDecodeSuccess(false);

    setTimeout(() => {
      setIsDecoding(false);
      setDecodeSuccess(true);
      const cleanVin = vinInput.toUpperCase();
      if (cleanVin.startsWith('VF1')) {
        setSelectedMake('Renault');
        setSelectedModel('Master');
        setVehicleType('van');
      } else if (cleanVin.startsWith('YV2')) {
        setSelectedMake('Volvo');
        setSelectedModel('FH16 540');
        setVehicleType('truck');
      } else if (cleanVin.startsWith('YS2')) {
        setSelectedMake('Scania');
        setSelectedModel('R 500 V8');
        setVehicleType('reefer');
      } else if (cleanVin.startsWith('WDB')) {
        setSelectedMake('Mercedes-Benz');
        setSelectedModel('Actros 1845');
        setVehicleType('truck');
      } else {
        setSelectedMake('Renault');
        setSelectedModel('Master');
        setVehicleType('van');
      }
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate) return;

    const matchedTracker = availableTrackers.find((t) => t.id === selectedTrackerId);

    onAddVehicle({
      make: selectedMake,
      model: selectedModel,
      modelYear,
      vehicleType,
      licensePlate,
      vin: vinInput || `VF1MA${Date.now()}`,
      color,
      trackerId: selectedTrackerId || undefined,
      trackerImei: matchedTracker?.imei,
      trackerProtocol: matchedTracker?.protocol || 'teltonika'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#080808] border border-zinc-800 rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="border-l-2 border-emerald-500 pl-4 py-0.5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
              Fleet Onboarding
            </p>
            <h3 className="text-xl font-black italic tracking-tight text-white">
              {t.actions.addVehicle}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* VIN Decoder Fast Auto-Fill */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-[24px] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>NHTSA VIN Assistant</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">17 Characters</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={vinInput}
                onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                placeholder="Enter VIN (e.g. VF1MA00030192834)"
                maxLength={17}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 uppercase"
              />
              <button
                type="button"
                onClick={handleVinDecode}
                disabled={isDecoding || vinInput.length < 5}
                className="px-4 py-2 rounded-2xl bg-white hover:bg-emerald-400 text-black text-xs font-black transition-colors disabled:opacity-40"
              >
                {isDecoding ? 'Decoding...' : 'Auto-Fill'}
              </button>
            </div>

            {decodeSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pt-1">
                <Check className="w-3.5 h-3.5" />
                <span>VIN successfully parsed: {selectedMake} {selectedModel}</span>
              </div>
            )}
          </div>

          {/* Make & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Manufacturer
              </label>
              <select
                aria-label="Select Manufacturer"
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                  const m = VEHICLE_MAKE_CATALOG.find((cat) => cat.make === e.target.value);
                  if (m && m.models.length > 0) setSelectedModel(m.models[0]);
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-600"
              >
                {VEHICLE_MAKE_CATALOG.map((cat) => (
                  <option key={cat.make} value={cat.make} className="bg-zinc-950 text-white">
                    {cat.make}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Model Series
              </label>
              <select
                aria-label="Select Model Series"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-600"
              >
                {availableModels.map((mdl) => (
                  <option key={mdl} value={mdl} className="bg-zinc-950 text-white">
                    {mdl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category, Year, License Plate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                aria-label="Vehicle Category"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-600"
              >
                <option value="van">Van / Light Commercial</option>
                <option value="truck">Semi-Trailer / Heavy Truck</option>
                <option value="reefer">Reefer / Cold Storage</option>
                <option value="suv">SUV 4x4</option>
                <option value="sedan">Passenger Sedan</option>
                <option value="bus">Transit Bus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Year
              </label>
              <input
                type="number"
                value={modelYear}
                onChange={(e) => setModelYear(Number(e.target.value))}
                min={2010}
                max={2026}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                License Plate *
              </label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                placeholder="e.g. 54321-B-6"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          {/* Tracker Binding */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Assign Hardware GPS Tracker
            </label>
            <select
              aria-label="Assign Hardware GPS Tracker"
              value={selectedTrackerId}
              onChange={(e) => setSelectedTrackerId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-zinc-600"
            >
              <option value="">-- No Tracker Assigned (Standby) --</option>
              {availableTrackers.map((trk) => (
                <option key={trk.id} value={trk.id} className="bg-zinc-950 text-white">
                  [{trk.protocol.toUpperCase()}] {trk.model} — IMEI: {trk.imei} ({trk.status})
                </option>
              ))}
            </select>
          </div>

          {/* Footer CTA */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-colors border border-zinc-800"
            >
              {t.actions.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-white hover:bg-emerald-400 text-black text-xs font-black transition-all shadow-xl"
            >
              {t.actions.addVehicle}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
