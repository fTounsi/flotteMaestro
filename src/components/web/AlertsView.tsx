import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Bell,
  Volume2,
  VolumeX,
  Filter,
  Search,
  Zap,
  Check,
  UserCheck,
  FileText,
  Clock,
  Download,
  X,
  MessageSquare,
  Plus,
  Sliders,
  Play,
  Trash2,
  Lock,
  Building2,
  Sparkles,
  Info,
  Radio,
  Power,
  MapPin,
  Map,
  Compass
} from 'lucide-react';
import { Alert, AlertRule, AlertSeverity, User, Vehicle } from '../../types/fleet';
import { alertSound } from '../../utils/audioAlert';
import { TranslationDictionary } from '../../translations/i18n';
import { userHasPermission } from '../../types/rbac';
import { AddAlertModal } from './alerts/AddAlertModal';
import { AlertMapModal } from './alerts/AlertMapModal';

interface AlertsViewProps {
  alerts: Alert[];
  alertRules?: AlertRule[];
  vehicles?: Vehicle[];
  users?: User[];
  currentUser?: User | null;
  currentOrgName?: string;
  onMarkAsRead: (alertId: string) => void;
  onUpdateAlert?: (alert: Alert) => void;
  onDeleteAlert?: (alertId: string) => void;
  onAddAlertRule?: (rule: AlertRule, triggerNow?: boolean) => void;
  onToggleAlertRule?: (ruleId: string, enabled: boolean) => void;
  onDeleteAlertRule?: (ruleId: string) => void;
  onTriggerAlertRule?: (rule: AlertRule) => void;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onOpenDownlinkTerminal?: (vehicle: Vehicle) => void;
  onClearAll: () => void;
  t: TranslationDictionary;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  alertRules = [],
  vehicles = [],
  users = [],
  currentUser,
  currentOrgName = 'Atlas Express Logistics',
  onMarkAsRead,
  onUpdateAlert,
  onDeleteAlert,
  onAddAlertRule,
  onToggleAlertRule,
  onDeleteAlertRule,
  onTriggerAlertRule,
  onSelectVehicle,
  onOpenDownlinkTerminal,
  onClearAll,
  t
}) => {
  // Navigation Tabs: 'events' (live stream) | 'rules' (configured Traccar alert rules)
  const [activeTab, setActiveTab] = useState<'events' | 'rules'>('events');

  // Filters for Events stream
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterTriage, setFilterTriage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(alertSound.getIsMuted());

  // Filter for Rules tab
  const [rulesSearchTerm, setRulesSearchTerm] = useState<string>('');

  // Modals state
  const [isAddAlertModalOpen, setIsAddAlertModalOpen] = useState<boolean>(false);
  const [selectedAlertForMap, setSelectedAlertForMap] = useState<Alert | null>(null);
  const [resolvingAlert, setResolvingAlert] = useState<Alert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [assignedDispatcher, setAssignedDispatcher] = useState<string>('');

  // Permission Checks
  const userRole = currentUser?.role;
  const canTriage = userHasPermission(currentUser, 'alerts:triage');
  const canAddAlerts =
    userRole === 'org_owner' ||
    userRole === 'fleet_manager' ||
    userRole === 'org_admin' ||
    userRole === 'super_admin' ||
    userHasPermission(currentUser, 'alerts:manage');

  const handleToggleAudio = () => {
    const muted = alertSound.toggleMute();
    setIsAudioMuted(muted);
    if (!muted) {
      alertSound.playInfoChime();
    }
  };

  const handleAcknowledge = (alt: Alert) => {
    if (!onUpdateAlert) {
      onMarkAsRead(alt.id);
      return;
    }
    const updated: Alert = {
      ...alt,
      isRead: true,
      triageStatus: 'acknowledged',
      acknowledgedBy: currentUser?.name || 'Dispatcher',
      acknowledgedAt: new Date().toISOString()
    };
    onUpdateAlert(updated);
  };

  const handleOpenResolveModal = (alt: Alert) => {
    setResolvingAlert(alt);
    setResolutionNotes(alt.resolutionNotes || '');
    setAssignedDispatcher(alt.assignedTo || currentUser?.name || '');
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingAlert || !onUpdateAlert) return;

    const updated: Alert = {
      ...resolvingAlert,
      isRead: true,
      triageStatus: 'resolved',
      assignedTo: assignedDispatcher,
      resolutionNotes: resolutionNotes.trim() || 'Verified and safely closed by dispatcher.',
      resolvedAt: new Date().toISOString()
    };

    onUpdateAlert(updated);
    setResolvingAlert(null);
    setResolutionNotes('');
  };

  // Export Alerts to CSV
  const handleExportCsv = () => {
    const headers = ['Timestamp,Plate,Title,Severity,TriageStatus,AcknowledgedBy,AssignedTo,Address'];
    const rows = filteredAlerts.map((a) =>
      `"${a.createdAt}","${a.vehiclePlate}","${a.title}","${a.severity}","${a.triageStatus || 'open'}","${a.acknowledgedBy || ''}","${a.assignedTo || ''}","${(a.address || '').replace(/"/g, '""')}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `incident_stream_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Events
  const filteredAlerts = alerts.filter((alt) => {
    const matchesSev = filterSeverity === 'all' || alt.severity === filterSeverity;
    const currentTriage = alt.triageStatus || 'open';
    const matchesTriage = filterTriage === 'all' || currentTriage === filterTriage;
    const matchesSearch =
      alt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alt.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alt.description && alt.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSev && matchesTriage && matchesSearch;
  });

  // Filtered Rules
  const filteredRules = alertRules.filter((r) => {
    return (
      r.name.toLowerCase().includes(rulesSearchTerm.toLowerCase()) ||
      (r.vehiclePlate && r.vehiclePlate.toLowerCase().includes(rulesSearchTerm.toLowerCase())) ||
      r.type.toLowerCase().includes(rulesSearchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(rulesSearchTerm.toLowerCase()))
    );
  });

  const activeRulesCount = alertRules.filter((r) => r.enabled).length;
  const criticalRulesCount = alertRules.filter((r) => r.severity === 'critical').length;
  const openIncidentsCount = alerts.filter((a) => (a.triageStatus || 'open') === 'open').length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Organization Context & Role Authorization */}
      <div className="bg-white dark:bg-zinc-900/40 rounded-[32px] p-6 border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm dark:shadow-2xl">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="flex items-center gap-1 text-[11px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
              <Building2 className="w-3.5 h-3.5" />
              <span>{currentOrgName}</span>
            </span>

            {/* Role Badge */}
            <span
              className={`text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-lg border ${
                canAddAlerts
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-500/30'
                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
              }`}
            >
              Profile: {currentUser?.role?.replace('_', ' ').toUpperCase() || 'ORG OWNER'}
            </span>

            {canAddAlerts ? (
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <Check className="w-3 h-3" />
                <span>Can Manage Alert Rules</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Viewer Access</span>
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-slate-900 dark:text-white">
            {t.nav.alerts}
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            Real-time telemetry event stream, overspeed thresholds, and Traccar automated alert rules scoped to {currentOrgName}.
          </p>
        </div>

        {/* Action Controls & Add Alert Button */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto justify-end">
          {/* Audio Chime Mute/Unmute */}
          <button
            type="button"
            onClick={handleToggleAudio}
            title={isAudioMuted ? 'Unmute Safety Chimes' : 'Mute Safety Chimes'}
            className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isAudioMuted
                ? 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                : 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isAudioMuted ? 'Chime Off' : 'Chime On'}</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Add Alert Rule (Enabled for ORG OWNER and Fleet Manager) */}
          {canAddAlerts ? (
            <button
              type="button"
              onClick={() => setIsAddAlertModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              title="Add a new automated alert rule with custom vehicle and threshold values"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Alert</span>
            </button>
          ) : (
            <div
              className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 font-semibold"
              title="Only ORG OWNER and Fleet Manager profiles can add or configure alert rules."
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Add Alert (Owner/Mgr only)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-950 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'events'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-black'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Incidents & Events Stream</span>
            {openIncidentsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500 text-white">
                {openIncidentsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-black'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-500" />
            <span>Configured Alert Rules</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              {alertRules.length}
            </span>
          </button>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
          <span>Active Rules: <strong className="text-emerald-600 dark:text-emerald-400">{activeRulesCount}</strong></span>
          <span>•</span>
          <span>Critical: <strong className="text-rose-600 dark:text-rose-400">{criticalRulesCount}</strong></span>
          <span>•</span>
          <span>Open Events: <strong className="text-amber-600 dark:text-amber-400">{openIncidentsCount}</strong></span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INCIDENTS & EVENTS STREAM                                         */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm dark:shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search event, vehicle plate, details..."
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Triage Status Filter */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-950 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'open', label: 'Open' },
                  { id: 'acknowledged', label: 'Ack' },
                  { id: 'resolved', label: 'Resolved' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setFilterTriage(st.id)}
                    className={`px-3 py-1 rounded-xl font-bold uppercase text-[10px] transition-colors cursor-pointer ${
                      filterTriage === st.id
                        ? 'bg-emerald-500 text-black shadow-sm'
                        : 'text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-950 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs">
                {['all', 'critical', 'warning', 'info'].map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-3 py-1 rounded-xl font-bold uppercase text-[10px] transition-colors cursor-pointer ${
                      filterSeverity === sev
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm'
                        : 'text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              {alerts.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[11px] font-bold border border-slate-200 dark:border-zinc-700 transition-colors"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* List of Alert Incidents */}
          <div className="space-y-3 pt-2">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-16 text-slate-500 dark:text-zinc-500 text-xs font-semibold space-y-2">
                <ShieldAlert className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto" />
                <p>No active telemetry incidents matching filter for {currentOrgName}.</p>
                {canAddAlerts && (
                  <button
                    type="button"
                    onClick={() => setIsAddAlertModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create an Alert Rule to Monitor Telemetry</span>
                  </button>
                )}
              </div>
            ) : (
              filteredAlerts.map((alt) => {
                const triage = alt.triageStatus || 'open';

                return (
                  <div
                    key={alt.id}
                    onClick={() => setSelectedAlertForMap(alt)}
                    className={`p-5 rounded-[24px] border transition-all flex flex-col sm:flex-row items-start justify-between gap-4 cursor-pointer hover:border-emerald-500/60 dark:hover:border-emerald-500/40 hover:shadow-md group ${
                      triage === 'resolved'
                        ? 'bg-slate-50/50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-900 text-slate-500 dark:text-zinc-400 opacity-75'
                        : triage === 'acknowledged'
                        ? 'bg-amber-500/5 dark:bg-zinc-950 border-amber-500/30 text-slate-900 dark:text-white shadow-sm dark:shadow-lg'
                        : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white shadow-sm dark:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div
                        className={`mt-1 p-2.5 rounded-2xl shrink-0 ${
                          alt.severity === 'critical'
                            ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 dark:border-rose-500/40'
                            : alt.severity === 'warning'
                            ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 dark:border-amber-500/40'
                            : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 dark:border-emerald-500/40'
                        }`}
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-xs bg-white dark:bg-zinc-900 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white">
                            {alt.vehiclePlate}
                          </span>

                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {alt.title}
                          </h4>

                          {/* Triage Badge */}
                          <span
                            className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-md border ${
                              triage === 'resolved'
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                : triage === 'acknowledged'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {triage}
                          </span>

                          {alt.alertName && (
                            <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded">
                              Rule: {alt.alertName}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{alt.description}</p>

                        {/* Location, Speed, & Threshold Meta */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] text-slate-500 dark:text-zinc-500 mt-2.5 font-mono">
                          <span>{new Date(alt.createdAt).toLocaleTimeString()} ({new Date(alt.createdAt).toLocaleDateString()})</span>
                          
                          {/* Exact Position / Address Badge */}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAlertForMap(alt);
                            }}
                            className="inline-flex items-center gap-1 text-slate-700 dark:text-zinc-300 bg-slate-200/70 dark:bg-zinc-900 px-2 py-0.5 rounded-lg border border-slate-300/80 dark:border-zinc-800 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                            title="Click to view exact GPS position on interactive map"
                          >
                            <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="truncate max-w-[220px]">{alt.address || `${alt.latitude.toFixed(4)}, ${alt.longitude.toFixed(4)}`}</span>
                          </span>

                          {alt.speed !== undefined && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              Speed: {alt.speed} km/h
                            </span>
                          )}
                          {alt.triggerValue !== undefined && alt.thresholdValue !== undefined && (
                            <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                              Value: {alt.triggerValue} (Limit: {alt.thresholdValue})
                            </span>
                          )}
                          {alt.acknowledgedBy && (
                            <span className="text-amber-600 dark:text-amber-400">
                              Ack by {alt.acknowledgedBy} at {new Date(alt.acknowledgedAt || '').toLocaleTimeString()}
                            </span>
                          )}
                          {alt.assignedTo && (
                            <span className="text-cyan-600 dark:text-cyan-400">Assigned: {alt.assignedTo}</span>
                          )}
                        </div>

                        {alt.resolutionNotes && (
                          <div className="mt-2 text-[11px] bg-slate-100 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                            <span className="text-slate-500 dark:text-zinc-500 font-bold">Resolution Note: </span>
                            <span>{alt.resolutionNotes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Explicit View on Map button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAlertForMap(alt);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-emerald-500 hover:text-black dark:hover:bg-emerald-500 dark:hover:text-black text-slate-700 dark:text-zinc-300 text-xs font-bold border border-slate-200 dark:border-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title={t.alertsView?.viewOnMap || 'View Position on Map'}
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 group-hover:text-black" />
                        <span>{t.alertsView?.viewOnMap || 'View on Map'}</span>
                      </button>

                      {canTriage && triage === 'open' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcknowledge(alt);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Acknowledge</span>
                        </button>
                      )}

                      {canTriage && triage !== 'resolved' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenResolveModal(alt);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      )}

                      {!alt.isRead && triage === 'resolved' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(alt.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs font-bold transition-colors border border-slate-200 dark:border-zinc-800 cursor-pointer"
                        >
                          Dismiss
                        </button>
                      )}

                      {onDeleteAlert && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAlert(alt.id);
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete event record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONFIGURABLE ALERT RULES (TRACCAR ALERTS)                         */}
      {/* ========================================================================= */}
      {activeTab === 'rules' && (
        <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm dark:shadow-2xl space-y-5">
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Traccar Telematics Alert Rules & Thresholds</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  {filteredRules.length} Configured
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Automated conditions and telematics thresholds monitored across {currentOrgName} fleet.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={rulesSearchTerm}
                  onChange={(e) => setRulesSearchTerm(e.target.value)}
                  placeholder="Filter alert rules..."
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {canAddAlerts && (
                <button
                  type="button"
                  onClick={() => setIsAddAlertModalOpen(true)}
                  className="px-3.5 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Rule</span>
                </button>
              )}
            </div>
          </div>

          {/* Rules List / Cards */}
          <div className="space-y-3">
            {filteredRules.length === 0 ? (
              <div className="text-center py-16 text-slate-500 dark:text-zinc-500 text-xs font-semibold space-y-3">
                <Sliders className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto" />
                <p>No alert rules configured for {currentOrgName}.</p>
                {canAddAlerts ? (
                  <button
                    type="button"
                    onClick={() => setIsAddAlertModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Alert Rule</span>
                  </button>
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-zinc-600">
                    Contact your ORG OWNER or Fleet Manager to configure new alert thresholds.
                  </p>
                )}
              </div>
            ) : (
              filteredRules.map((rule) => {
                return (
                  <div
                    key={rule.id}
                    className={`p-5 rounded-[24px] border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      rule.enabled
                        ? 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white'
                        : 'bg-slate-100/50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-900 text-slate-400 dark:text-zinc-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
                          rule.severity === 'critical'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : rule.severity === 'warning'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        <ShieldAlert className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                            {rule.name}
                          </h4>

                          <span
                            className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-md border ${
                              rule.severity === 'critical'
                                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                : rule.severity === 'warning'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {rule.severity}
                          </span>

                          <span className="text-[10px] font-mono font-bold bg-slate-200 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 px-2.5 py-0.5 rounded-md border border-slate-300 dark:border-zinc-800">
                            Vehicle: {rule.vehiclePlate || 'All Fleet'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                          {rule.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-zinc-500 pt-1">
                          <span className="font-bold text-slate-700 dark:text-zinc-300">
                            Threshold: <span className="text-emerald-600 dark:text-emerald-400 font-black">{rule.value} {rule.unit || ''}</span>
                          </span>
                          <span>•</span>
                          <span>Event: <strong className="text-slate-600 dark:text-zinc-300">{rule.type}</strong></span>
                          <span>•</span>
                          <span>Channels: {rule.channels.join(', ')}</span>
                          {rule.triggerCount !== undefined && (
                            <>
                              <span>•</span>
                              <span>Triggers: <strong className="text-slate-700 dark:text-zinc-300">{rule.triggerCount}</strong></span>
                            </>
                          )}
                          {rule.createdBy && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400 dark:text-zinc-500">By {rule.createdBy}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rule Controls */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {/* Simulate / Test Trigger Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onTriggerAlertRule) {
                            onTriggerAlertRule(rule);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold border border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Simulate / Trigger this alert rule now to test live event generation"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Test Trigger</span>
                      </button>

                      {/* Enable / Disable Toggle (Only for authorized profiles) */}
                      {canAddAlerts && onToggleAlertRule && (
                        <button
                          type="button"
                          onClick={() => onToggleAlertRule(rule.id, !rule.enabled)}
                          className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            rule.enabled
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-200 dark:bg-zinc-900 text-slate-500 border-slate-300 dark:border-zinc-800'
                          }`}
                          title={rule.enabled ? 'Pause this alert rule' : 'Enable this alert rule'}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{rule.enabled ? 'Active' : 'Disabled'}</span>
                        </button>
                      )}

                      {/* Delete Rule */}
                      {canAddAlerts && onDeleteAlertRule && (
                        <button
                          type="button"
                          onClick={() => onDeleteAlertRule(rule.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete alert rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD ALERT (TRACCAR ALERTS ENGINE)                                  */}
      {/* ========================================================================= */}
      {isAddAlertModalOpen && (
        <AddAlertModal
          vehicles={vehicles}
          currentOrgName={currentOrgName}
          currentUser={currentUser}
          onClose={() => setIsAddAlertModalOpen(false)}
          t={t}
          onSave={(newRule, triggerNow) => {
            if (onAddAlertRule) {
              onAddAlertRule(newRule, triggerNow);
            }
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESOLUTION & TRIAGE INCIDENT LOG                                  */}
      {/* ========================================================================= */}
      {resolvingAlert && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-[32px] w-full max-w-xl shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-white animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Resolve Safety Incident</h3>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Incident Protocol & Triage Log</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResolvingAlert(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">{resolvingAlert.title}</div>
              <div className="font-mono text-slate-600 dark:text-zinc-400">Plate: {resolvingAlert.vehiclePlate}</div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-500">{resolvingAlert.description}</div>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  Assigned Dispatcher / Officer
                </label>
                <select
                  value={assignedDispatcher}
                  onChange={(e) => setAssignedDispatcher(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-2xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={currentUser?.name || 'Dispatcher'}>
                    {currentUser?.name || 'Current User'} (Myself)
                  </option>
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  Investigation & Resolution Notes
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Spoke with driver; vehicle pulled over safely. Speed sensor recalibrated."
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-2xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 placeholder-slate-400 dark:placeholder-zinc-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResolvingAlert(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black shadow-sm cursor-pointer"
                >
                  Close & Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ALERT LOCATION & TELEMETRY POSITION MAP INSPECTOR                  */}
      {/* ========================================================================= */}
      {selectedAlertForMap && (
        <AlertMapModal
          alert={selectedAlertForMap}
          vehicles={vehicles}
          currentUser={currentUser}
          currentOrgName={currentOrgName}
          onClose={() => setSelectedAlertForMap(null)}
          onAcknowledge={(alt) => {
            handleAcknowledge(alt);
            setSelectedAlertForMap((prev) => (prev ? { ...prev, triageStatus: 'acknowledged', isRead: true } : null));
          }}
          onResolve={(alt, notes) => {
            if (onUpdateAlert) {
              const updated: Alert = {
                ...alt,
                isRead: true,
                triageStatus: 'resolved',
                assignedTo: currentUser?.name || 'Dispatcher',
                resolutionNotes: notes,
                resolvedAt: new Date().toISOString()
              };
              onUpdateAlert(updated);
            }
            setSelectedAlertForMap(null);
          }}
          onTrackLive={(veh) => {
            setSelectedAlertForMap(null);
            if (onSelectVehicle) {
              onSelectVehicle(veh);
            }
          }}
          onOpenDownlinkTerminal={onOpenDownlinkTerminal}
          t={t}
        />
      )}
    </div>
  );
};
