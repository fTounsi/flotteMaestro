import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Wrench,
  DollarSign,
  Calendar,
  Building,
  UserCheck,
  FileText,
  Tag
} from 'lucide-react';
import { MaintenanceInterval, Vehicle, WorkOrderRecord } from '../../../types/fleet';

interface LogServiceModalProps {
  interval: MaintenanceInterval;
  vehicle?: Vehicle;
  onClose: () => void;
  onConfirmComplete: (
    updatedInterval: MaintenanceInterval,
    newWorkOrder: WorkOrderRecord
  ) => void;
}

export const LogServiceModal: React.FC<LogServiceModalProps> = ({
  interval,
  vehicle,
  onClose,
  onConfirmComplete
}) => {
  const currentVehicleOdo = vehicle?.odometer || interval.nextDueOdometer;

  const [completedOdometer, setCompletedOdometer] = useState<number>(currentVehicleOdo);
  const [completedDate, setCompletedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [serviceCenter, setServiceCenter] = useState<string>(
    interval.preferredWorkshop || 'Atlas Autocenter Casablanca'
  );
  const [technicianName, setTechnicianName] = useState<string>('Mehdi Benali (Master Tech)');
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [costPartsUsd, setCostPartsUsd] = useState<number>(
    Math.round(interval.estimatedCostUsd * 0.65)
  );
  const [costLaborUsd, setCostLaborUsd] = useState<number>(
    Math.round(interval.estimatedCostUsd * 0.35)
  );
  const [description, setDescription] = useState<string>(
    `Completed ${interval.title}. Inspected all related components and verified zero leaks.`
  );
  const [replacedPartsInput, setReplacedPartsInput] = useState<string>(
    'Oil Filter 8200768913, 5L 5W30 Synthetic Elf, Drain Plug Washer'
  );

  const totalCostUsd = costPartsUsd + costLaborUsd;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Calculate new nextDueOdometer and nextDueDate
    const newNextDueOdometer = completedOdometer + interval.intervalKm;
    const newNextDueDate = new Date(
      new Date(completedDate).getTime() + interval.intervalDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const newRemainingKm = newNextDueOdometer - (vehicle?.odometer || completedOdometer);
    const newRemainingDays = Math.ceil(
      (new Date(newNextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const updatedInterval: MaintenanceInterval = {
      ...interval,
      lastDoneOdometer: completedOdometer,
      lastDoneDate: new Date(completedDate).toISOString(),
      nextDueOdometer: newNextDueOdometer,
      nextDueDate: newNextDueDate,
      remainingKm: newRemainingKm,
      remainingDays: newRemainingDays,
      status: 'good'
    };

    // 2. Create work order
    const partsArray = replacedPartsInput
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const newWorkOrder: WorkOrderRecord = {
      id: `wo_${Date.now()}`,
      vehicleId: interval.vehicleId,
      vehiclePlate: interval.vehiclePlate,
      serviceCenter,
      technicianName,
      description,
      costPartsUsd,
      costLaborUsd,
      totalCostUsd,
      invoiceNumber,
      completedAt: new Date(completedDate).toISOString(),
      replacedParts: partsArray
    };

    onConfirmComplete(updatedInterval, newWorkOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900/60">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Log Completed Service & Reset Interval
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vehicle{' '}
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {interval.vehiclePlate}
                </span>{' '}
                — {interval.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Completed At Odometer (km)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={completedOdometer}
                  onChange={(e) => setCompletedOdometer(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Completion Date
                </label>
                <input
                  type="date"
                  required
                  value={completedDate}
                  onChange={(e) => setCompletedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Workshop / Garage Center
                </label>
                <input
                  type="text"
                  required
                  value={serviceCenter}
                  onChange={(e) => setServiceCenter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Certified Technician Name
                </label>
                <input
                  type="text"
                  required
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Parts Cost ($)
                </label>
                <input
                  type="number"
                  min={0}
                  value={costPartsUsd}
                  onChange={(e) => setCostPartsUsd(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Labor Cost ($)
                </label>
                <input
                  type="number"
                  min={0}
                  value={costLaborUsd}
                  onChange={(e) => setCostLaborUsd(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Total Bill ($)
                </label>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                  ${totalCostUsd}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Workshop Invoice / Order #
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Replaced Parts & Consumables (Comma-separated)
              </label>
              <input
                type="text"
                value={replacedPartsInput}
                onChange={(e) => setReplacedPartsInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Work Summary & Technician Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm Completion & Reset Counter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
