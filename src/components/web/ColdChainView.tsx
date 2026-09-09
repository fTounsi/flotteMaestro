import React, { useState } from 'react';
import {
  Snowflake,
  ShieldCheck,
  AlertTriangle,
  Thermometer,
  FileCheck,
  Download,
  CheckCircle2,
  Clock,
  MapPin,
  DoorOpen,
  DoorClosed,
  Zap,
  Layers,
  Sparkles,
  Eye,
  X
} from 'lucide-react';
import { Vehicle, ColdChainExcursion, HaccpCertificate } from '../../types/fleet';
import {
  INITIAL_COLD_CHAIN_EXCURSIONS,
  INITIAL_HACCP_CERTIFICATES
} from '../../data/modulesData';

interface ColdChainViewProps {
  vehicles: Vehicle[];
}

export const ColdChainView: React.FC<ColdChainViewProps> = ({ vehicles }) => {
  const [excursions, setExcursions] = useState<ColdChainExcursion[]>(INITIAL_COLD_CHAIN_EXCURSIONS);
  const [certificates, setCertificates] = useState<HaccpCertificate[]>(INITIAL_HACCP_CERTIFICATES);
  const [selectedCert, setSelectedCert] = useState<HaccpCertificate | null>(null);
  const [activeCompartmentFilter, setActiveCompartmentFilter] = useState<'all' | 'chilled' | 'frozen'>('all');

  const reeferVehicles = vehicles.filter(
    (v) => v.vehicleType === 'reefer' || v.temperatureCelsius !== undefined || v.organizationId === 'org_med_cargo'
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12" id="cold-chain-container">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <Snowflake className="w-4 h-4" />
            <span>Pharma GDP & Perishable Food Cold-Chain Studio</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            BLE Multi-Zone Temperature Telemetry & HACCP Audit
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Wireless BLE temperature probes, door sensor excursion alerts, and 1-click GDP/HACCP certified transit reports.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Reefer Cold Fleet</span>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Snowflake className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {reeferVehicles.length || 2} <span className="text-xs font-normal text-slate-400">active units</span>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
            100% Dual-Zone BLE Telemetry
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Deep Freeze Chamber</span>
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Thermometer className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-2 font-mono">
            -19.5 °C
          </div>
          <div className="text-xs text-slate-400 mt-1">Threshold: -22°C to -18°C (Compliant)</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Thermal Excursions</span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {excursions.length} <span className="text-xs font-normal text-slate-400">events</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">1 resolved door opening spike</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">GDP Audit Pass Rate</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">100%</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Certificates verified for health inspection
          </div>
        </div>
      </div>

      {/* Reefer Fleet Telemetry Cards */}
      <div className="space-y-3">
        <h2 className="font-bold text-slate-900 dark:text-white text-base">Live Refrigerated Vehicles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-900/60 p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Scania R 500 V8 ThermoKing</h3>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Plate: 33445-T-40 • Tanger Med to Casablanca Hub
                </div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold uppercase">
                Compliant
              </span>
            </div>

            {/* Dual Chamber Meters */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center">
                <div className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300">
                  Zone A: Chilled Biologics
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono mt-1">
                  +3.4 °C
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Target: +2°C to +8°C</div>
              </div>

              <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 text-center">
                <div className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300">
                  Zone B: Deep Freeze
                </div>
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-mono mt-1">
                  -19.5 °C
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Target: -22°C to -18°C</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <DoorClosed className="w-4 h-4" />
                <span>Cargo Doors: Sealed & Locked</span>
              </div>
              <div className="font-mono">BLE Signal: -62 dBm (Strong)</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Volvo FH ColdExpress Carrier</h3>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Plate: 23456-A-40 • Tangier Port Quarantine Bay
                </div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold uppercase">
                Compliant
              </span>
            </div>

            {/* Dual Chamber Meters */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center">
                <div className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300">
                  Zone A: Chilled Vaccines
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono mt-1">
                  +4.1 °C
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Target: +2°C to +8°C</div>
              </div>

              <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 text-center">
                <div className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300">
                  Zone B: Frozen Seafood
                </div>
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-mono mt-1">
                  -21.2 °C
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Target: -22°C to -18°C</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <DoorClosed className="w-4 h-4" />
                <span>Cargo Doors: Sealed & Locked</span>
              </div>
              <div className="font-mono">BLE Signal: -58 dBm (Strong)</div>
            </div>
          </div>
        </div>
      </div>

      {/* HACCP Compliance Certificates */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              <span>Certified HACCP & GDP Compliance Audit Reports</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Legally certified temperature audit trails generated for pharmaceutical and customs authorities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                    Certificate #{cert.id}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {cert.clientConsignee}
                  </h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{cert.cargoType}</div>
                </div>

                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold">
                  {cert.complianceStatus}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white dark:bg-slate-800 rounded">
                  <div className="text-[10px] text-slate-400">Min Temp</div>
                  <div className="font-mono font-bold text-blue-600 mt-0.5">{cert.minRecordedCelsius}°C</div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded">
                  <div className="text-[10px] text-slate-400">Avg Temp</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {cert.avgRecordedCelsius}°C
                  </div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded">
                  <div className="text-[10px] text-slate-400">Max Temp</div>
                  <div className="font-mono font-bold text-amber-600 mt-0.5">{cert.maxRecordedCelsius}°C</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>{cert.inspectorName}</span>
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Audit Proof</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#09090b] rounded-[32px] max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    Official HACCP/GDP Transit Certificate
                  </h3>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">
                    ID: {selectedCert.id} • WHO Cold Chain Standard
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 text-slate-400 hover:text-white border border-slate-200 dark:border-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3 text-xs border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Consignee:</span>
                <strong className="text-slate-900 dark:text-white">{selectedCert.clientConsignee}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cargo Type:</span>
                <strong className="text-slate-900 dark:text-white">{selectedCert.cargoType}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transport Plate:</span>
                <strong className="font-mono text-slate-900 dark:text-white">{selectedCert.vehiclePlate}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Compliance Audit Result:</span>
                <span className="font-bold text-emerald-600">{selectedCert.complianceStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Validation Timestamp:</span>
                <span className="text-slate-600 dark:text-slate-300 font-mono">
                  {new Date(selectedCert.generatedDate).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Audit Stamp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
