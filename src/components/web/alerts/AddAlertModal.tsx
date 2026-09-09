import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Bell,
  AlertTriangle,
  Zap,
  Check,
  Gauge,
  Clock,
  Battery,
  Navigation,
  Volume2,
  Mail,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { AlertRule, AlertSeverity, AlertType, Vehicle, User } from '../../../types/fleet';
import { TranslationDictionary } from '../../../translations/i18n';

interface AddAlertModalProps {
  vehicles: Vehicle[];
  currentOrgName: string;
  currentUser?: User | null;
  onClose: () => void;
  onSave: (rule: AlertRule, triggerNow?: boolean) => void;
  t?: TranslationDictionary;
}

interface AlertPreset {
  name: string;
  type: AlertType;
  value: string | number;
  unit: string;
  severity: AlertSeverity;
  channels: ('sound' | 'notification' | 'email' | 'relay_cut')[];
  description: string;
}

const PRESETS: AlertPreset[] = [
  {
    name: 'Highway Overspeed Limit (90 km/h)',
    type: 'overspeed',
    value: 90,
    unit: 'km/h',
    severity: 'warning',
    channels: ['sound', 'notification', 'email'],
    description: 'Triggers automated overspeed warning when vehicle exceeds heavy commercial highway limit of 90 km/h.'
  },
  {
    name: 'Stationary Engine Idle Timeout (>15 min)',
    type: 'excessive_idle',
    value: 15,
    unit: 'min',
    severity: 'info',
    channels: ['notification'],
    description: 'Notifies dispatcher if engine is idling stationary for longer than 15 consecutive minutes.'
  },
  {
    name: 'Cold Chain Excursion (>4.0°C)',
    type: 'low_voltage',
    value: 4.0,
    unit: '°C',
    severity: 'critical',
    channels: ['sound', 'notification', 'email'],
    description: 'Traccar BLE temperature probe alert: fires when refrigeration compartment climbs above safe +4.0°C threshold.'
  },
  {
    name: 'Battery Voltage Low (<11.5V)',
    type: 'low_voltage',
    value: 11.5,
    unit: 'V',
    severity: 'critical',
    channels: ['sound', 'notification', 'email'],
    description: 'Detects main battery discharge or alternator cut when terminal voltage drops below 11.5 Volts.'
  },
  {
    name: 'Night Curfew Unauthorized Motion',
    type: 'unauthorized_movement',
    value: '22:00 - 06:00',
    unit: 'window',
    severity: 'critical',
    channels: ['sound', 'notification', 'email', 'relay_cut'],
    description: 'Traccar motion alarm: triggers if vehicle moves during forbidden nighttime curfew window.'
  },
  {
    name: 'Emergency SOS Panic Trigger',
    type: 'sos_button',
    value: 'Active',
    unit: 'state',
    severity: 'critical',
    channels: ['sound', 'notification', 'email'],
    description: 'Instant highest-priority alarm when driver depresses cockpit emergency panic button.'
  }
];

export const AddAlertModal: React.FC<AddAlertModalProps> = ({
  vehicles,
  currentOrgName,
  currentUser,
  onClose,
  onSave,
  t
}) => {
  const [alertName, setAlertName] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [alertType, setAlertType] = useState<AlertType>('overspeed');
  const [thresholdValue, setThresholdValue] = useState<string>('90');
  const [unit, setUnit] = useState<string>('km/h');
  const [severity, setSeverity] = useState<AlertSeverity>('warning');
  const [channels, setChannels] = useState<('sound' | 'notification' | 'email' | 'relay_cut')[]>([
    'sound',
    'notification'
  ]);
  const [description, setDescription] = useState<string>('');
  const [isTriggeringNow, setIsTriggeringNow] = useState<boolean>(false);

  // Apply a Preset
  const handleApplyPreset = (preset: AlertPreset) => {
    setAlertName(preset.name);
    setAlertType(preset.type);
    setThresholdValue(String(preset.value));
    setUnit(preset.unit);
    setSeverity(preset.severity);
    setChannels(preset.channels);
    setDescription(preset.description);
  };

  // Adjust unit and defaults when type changes
  const handleTypeChange = (type: AlertType) => {
    setAlertType(type);
    switch (type) {
      case 'overspeed':
        setUnit('km/h');
        if (!thresholdValue || isNaN(Number(thresholdValue))) setThresholdValue('90');
        if (!alertName) setAlertName('Highway Overspeed Warning');
        break;
      case 'excessive_idle':
        setUnit('min');
        if (!thresholdValue || isNaN(Number(thresholdValue))) setThresholdValue('15');
        if (!alertName) setAlertName('Excessive Idling Detection');
        break;
      case 'low_voltage':
        setUnit('V');
        if (!thresholdValue || isNaN(Number(thresholdValue))) setThresholdValue('11.5');
        if (!alertName) setAlertName('Low Battery Voltage Drop');
        break;
      case 'low_battery':
        setUnit('%');
        if (!thresholdValue || isNaN(Number(thresholdValue))) setThresholdValue('20');
        if (!alertName) setAlertName('Tracker Internal Battery Low');
        break;
      case 'unauthorized_movement':
        setUnit('window');
        setThresholdValue('22:00 - 06:00');
        if (!alertName) setAlertName('Curfew Unauthorized Movement');
        break;
      case 'geofence_exit':
      case 'geofence_enter':
        setUnit('zone');
        setThresholdValue('Authorized Depot Zone');
        if (!alertName) setAlertName(type === 'geofence_exit' ? 'Depot Exit Boundary Breach' : 'Depot Entry Detection');
        break;
      case 'sos_button':
        setUnit('trigger');
        setThresholdValue('Immediate');
        setSeverity('critical');
        if (!alertName) setAlertName('Cockpit SOS Panic Alarm');
        break;
      case 'ignition_on':
      case 'ignition_off':
        setUnit('state');
        setThresholdValue(type === 'ignition_on' ? 'ON' : 'OFF');
        if (!alertName) setAlertName(type === 'ignition_on' ? 'Engine Ignition ON Event' : 'Engine Ignition OFF Event');
        break;
      case 'tracker_disconnected':
        setUnit('status');
        setThresholdValue('Offline > 10m');
        setSeverity('critical');
        if (!alertName) setAlertName('Tracker Disconnect & Signal Loss');
        break;
      default:
        setUnit('');
    }
  };

  const toggleChannel = (chan: 'sound' | 'notification' | 'email' | 'relay_cut') => {
    if (channels.includes(chan)) {
      setChannels(channels.filter((c) => c !== chan));
    } else {
      setChannels([...channels, chan]);
    }
  };

  const handleSubmit = (triggerImmediate: boolean) => {
    if (!alertName.trim()) return;

    const chosenVehicle =
      selectedVehicleId === 'all' ? null : vehicles.find((v) => v.id === selectedVehicleId);

    const newRule: AlertRule = {
      id: `rule_${Date.now()}`,
      organizationId: chosenVehicle?.organizationId || vehicles[0]?.organizationId || 'org_atlas_logistics',
      name: alertName.trim(),
      vehicleId: selectedVehicleId,
      vehiclePlate: chosenVehicle ? chosenVehicle.licensePlate : (t?.alertsView.allVehiclesOption || 'All Fleet Vehicles'),
      vehicleName: chosenVehicle ? `${chosenVehicle.make} ${chosenVehicle.model}` : (t?.alertsView.allVehiclesOption || 'All Assigned Fleet'),
      type: alertType,
      value: isNaN(Number(thresholdValue)) ? thresholdValue : Number(thresholdValue),
      unit,
      severity,
      channels,
      description: description.trim() || `Automated alert configured for ${chosenVehicle ? chosenVehicle.licensePlate : 'all organization vehicles'}.`,
      enabled: true,
      createdBy: currentUser ? `${currentUser.name} (${currentUser.role.toUpperCase()})` : 'ORG OWNER',
      createdByRole: currentUser?.role || 'org_owner',
      createdAt: new Date().toISOString(),
      triggerCount: triggerImmediate ? 1 : 0,
      lastTriggeredAt: triggerImmediate ? new Date().toISOString() : undefined
    };

    onSave(newRule, triggerImmediate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1300] bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-[32px] w-full max-w-2xl shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-white animate-in zoom-in-95 duration-150 my-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-zinc-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {t?.alertsView.addAlertRuleTitle || 'Add New Alert Rule'}
                </h3>
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Traccar Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {t?.alertsView.addAlertRuleSubtitle || 'Configure telematics alarms, thresholds, and vehicle bindings for'} <span className="font-semibold text-slate-700 dark:text-zinc-300">{currentOrgName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets Carousel */}
        <div className="mb-5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t?.alertsView.traccarPresets || 'Quick Traccar Presets'}</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/30 text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{p.name.split('(')[0].trim()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(isTriggeringNow);
          }}
          className="space-y-4 text-xs"
        >
          {/* Row 1: Alert Name */}
          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
              {t?.alertsView.alertName || 'Alert Name'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={alertName}
              onChange={(e) => setAlertName(e.target.value)}
              placeholder={t?.alertsView.alertNamePlaceholder || 'e.g. Highway Speed Limit 90 km/h, Depot Idle Warning...'}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Row 2: Choose Vehicle & Alert Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                {t?.alertsView.chooseVehicle || 'Choose Vehicle'} <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-2xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="all">
                  🌐 {t?.alertsView.allVehiclesOption || 'All Vehicles in Organization'} ({vehicles.length} units)
                </option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.licensePlate} - {v.make} {v.model} {v.assignedDriver ? `(${v.assignedDriver.name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                {t?.alertsView.alertType || 'Alert / Event Type'} <span className="text-rose-500">*</span>
              </label>
              <select
                value={alertType}
                onChange={(e) => handleTypeChange(e.target.value as AlertType)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-2xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="overspeed">⚡ {t?.alertsView.speedingPreset || 'Overspeeding Limit'} (deviceOverspeed)</option>
                <option value="excessive_idle">⏱️ {t?.alertsView.idlePreset || 'Excessive Idling'} (deviceIdle)</option>
                <option value="geofence_exit">📍 Geofence Perimeter Exit</option>
                <option value="geofence_enter">📍 Geofence Perimeter Entry</option>
                <option value="low_voltage">🔋 {t?.alertsView.batteryPreset || 'Battery Voltage Drop / Cut'}</option>
                <option value="low_battery">🪫 Tracker Internal Battery Low</option>
                <option value="unauthorized_movement">🌙 {t?.alertsView.curfewPreset || 'Night Curfew / Motion Alert'}</option>
                <option value="sos_button">🆘 {t?.alertsView.sosPreset || 'Cockpit Panic / SOS Button'}</option>
                <option value="ignition_on">🔑 Engine Ignition ON</option>
                <option value="ignition_off">🔑 Engine Ignition OFF</option>
                <option value="tracker_disconnected">📡 Tracker Disconnect / Offline</option>
              </select>
            </div>
          </div>

          {/* Row 3: Threshold Value & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                {t?.alertsView.triggerValue || 'Trigger Value / Threshold'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(e.target.value)}
                  placeholder="e.g. 90, 15, 11.5, Zone A..."
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-2xl pl-3.5 pr-14 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
                {unit && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                    {unit}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                {t?.alertsView.severityLevel || 'Severity Level'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'warning', label: t?.status.warning || 'Warning', color: 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300' },
                  { id: 'critical', label: t?.status.critical || 'Critical', color: 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300' },
                  { id: 'info', label: 'Info', color: 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSeverity(s.id as AlertSeverity)}
                    className={`py-2 rounded-xl text-center font-bold border transition-all text-[11px] cursor-pointer ${
                      severity === s.id
                        ? `${s.color} font-black shadow-xs`
                        : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:border-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Notification Channels */}
          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
              {t?.alertsView.notificationChannels || 'Notification & Control Channels'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'sound', label: t?.alertsView.audioChime || 'Audio Chime', icon: <Volume2 className="w-3.5 h-3.5" /> },
                { id: 'notification', label: t?.alertsView.inAppAlert || 'In-App Alert', icon: <Bell className="w-3.5 h-3.5" /> },
                { id: 'email', label: t?.alertsView.emailDispatch || 'Email Dispatch', icon: <Mail className="w-3.5 h-3.5" /> },
                { id: 'relay_cut', label: t?.alertsView.relayCut || 'Engine Cut Relay', icon: <Zap className="w-3.5 h-3.5" /> }
              ].map((ch) => {
                const active = channels.includes(ch.id as any);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChannel(ch.id as any)}
                    className={`p-2.5 rounded-xl border text-left font-semibold text-[11px] flex items-center gap-2 transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold'
                        : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:border-slate-300'
                    }`}
                  >
                    <span className={active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                      {ch.icon}
                    </span>
                    <span className="truncate">{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 5: Operational Guidelines / Notes */}
          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
              {t?.alertsView.operationalGuidelines || 'Operational Protocol & Guidelines'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions for dispatchers when this alert triggers (e.g. Contact driver immediately, check GPS route...)"
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-2xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 placeholder-slate-400 dark:placeholder-zinc-600"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
              <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                {t?.alertsView.onlyOwnerManagerNotice || 'Configured alerts will be visible to all users affected to'} <strong className="text-slate-800 dark:text-zinc-200">{currentOrgName}</strong>.
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all"
              >
                {t?.common.cancel || 'Cancel'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTriggeringNow(true);
                  handleSubmit(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
                title="Create this alert rule AND immediately fire a test event in the incident stream"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{t?.alertsView.testTrigger || 'Save & Test Trigger'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTriggeringNow(false);
                  handleSubmit(false);
                }}
                className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{t?.alertsView.saveAlertRule || 'Create Alert Rule'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
