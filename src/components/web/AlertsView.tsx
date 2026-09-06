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
  MessageSquare
} from 'lucide-react';
import { Alert, AlertSeverity, User } from '../../types/fleet';
import { alertSound } from '../../utils/audioAlert';
import { TranslationDictionary } from '../../translations/i18n';
import { userHasPermission } from '../../types/rbac';

interface AlertsViewProps {
  alerts: Alert[];
  users?: User[];
  currentUser?: User | null;
  onMarkAsRead: (alertId: string) => void;
  onUpdateAlert?: (alert: Alert) => void;
  onClearAll: () => void;
  t: TranslationDictionary;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  users = [],
  currentUser,
  onMarkAsRead,
  onUpdateAlert,
  onClearAll,
  t
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterTriage, setFilterTriage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(alertSound.getIsMuted());

  // Incident resolution modal state
  const [resolvingAlert, setResolvingAlert] = useState<Alert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [assignedDispatcher, setAssignedDispatcher] = useState<string>('');

  const canTriage = userHasPermission(currentUser, 'alerts:triage');

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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-zinc-900/40 rounded-[32px] p-6 border border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div className="border-l-2 border-emerald-500 pl-4 py-1">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">
            Real-Time Telemetry Incident Stream & Triage Engine
          </p>
          <h2 className="text-3xl font-black italic tracking-tight text-white">
            {t.nav.alerts}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time overspeeding, geofence breaches, emergency SOS, and diagnostic alerts with dispatcher incident resolution workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Audio Chime Mute/Unmute Toggle */}
          <button
            onClick={handleToggleAudio}
            title={isAudioMuted ? 'Unmute Safety Chimes' : 'Mute Safety Chimes'}
            className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
              isAudioMuted
                ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
            }`}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isAudioMuted ? 'Chime Off' : 'Chime On'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onClearAll}
            className="px-5 py-2.5 rounded-2xl bg-white hover:bg-emerald-400 text-black text-xs font-black transition-all shadow-xl"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Incident Stream Table Card */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-[32px] p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search alert, vehicle plate, details..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Triage Status Filter */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'open', label: 'Open' },
                { id: 'acknowledged', label: 'Ack' },
                { id: 'resolved', label: 'Resolved' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setFilterTriage(st.id)}
                  className={`px-3 py-1 rounded-xl font-bold uppercase text-[10px] transition-colors ${
                    filterTriage === st.id ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-xs">
              {['all', 'critical', 'warning', 'info'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1 rounded-xl font-bold uppercase text-[10px] transition-colors ${
                    filterSeverity === sev ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List of Alerts */}
        <div className="space-y-3 pt-2">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-xs font-semibold">
              No active safety incidents matching filter.
            </div>
          ) : (
            filteredAlerts.map((alt) => {
              const triage = alt.triageStatus || 'open';

              return (
                <div
                  key={alt.id}
                  className={`p-5 rounded-[24px] border transition-all flex flex-col sm:flex-row items-start justify-between gap-4 ${
                    triage === 'resolved'
                      ? 'bg-zinc-950/40 border-zinc-900 text-zinc-400 opacity-75'
                      : triage === 'acknowledged'
                      ? 'bg-zinc-950 border-amber-500/30 text-white shadow-lg'
                      : 'bg-zinc-950 border-zinc-800 text-white shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`mt-1 p-2.5 rounded-2xl shrink-0 ${
                        alt.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : alt.severity === 'warning'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs bg-zinc-900 px-2.5 py-0.5 rounded-lg border border-zinc-800 text-white">
                          {alt.vehiclePlate}
                        </span>

                        <h4 className="text-sm font-extrabold text-white">{alt.title}</h4>

                        {/* Triage Badge */}
                        <span
                          className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-md border ${
                            triage === 'resolved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : triage === 'acknowledged'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {triage}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed">{alt.description}</p>

                      {/* Location & Speed Meta */}
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-500 mt-2.5 font-mono">
                        <span>{new Date(alt.createdAt).toLocaleTimeString()}</span>
                        {alt.address && <span>📍 {alt.address}</span>}
                        {alt.speed !== undefined && (
                          <span className="text-emerald-400">{alt.speed} km/h</span>
                        )}
                        {alt.acknowledgedBy && (
                          <span className="text-amber-400">
                            Ack by {alt.acknowledgedBy} at {new Date(alt.acknowledgedAt || '').toLocaleTimeString()}
                          </span>
                        )}
                        {alt.assignedTo && (
                          <span className="text-cyan-400">Assigned: {alt.assignedTo}</span>
                        )}
                      </div>

                      {alt.resolutionNotes && (
                        <div className="mt-2 text-[11px] bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800 text-zinc-300">
                          <span className="text-zinc-500 font-bold">Resolution Note: </span>
                          <span>{alt.resolutionNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {canTriage && triage === 'open' && (
                      <button
                        onClick={() => handleAcknowledge(alt)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {canTriage && triage !== 'resolved' && (
                      <button
                        onClick={() => handleOpenResolveModal(alt)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-colors flex items-center gap-1.5 shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}

                    {!alt.isRead && triage === 'resolved' && (
                      <button
                        onClick={() => onMarkAsRead(alt.id)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold transition-colors border border-zinc-800"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RESOLUTION & TRIAGE MODAL */}
      {resolvingAlert && (
        <div className="fixed inset-0 z-[1200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-zinc-800 rounded-[32px] w-full max-w-md shadow-2xl p-6 text-white animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-black text-white">Resolve Safety Incident</h3>
              </div>
              <button
                onClick={() => setResolvingAlert(null)}
                className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-xs space-y-1">
              <div className="font-bold text-white">{resolvingAlert.title}</div>
              <div className="font-mono text-zinc-400">Plate: {resolvingAlert.vehiclePlate}</div>
              <div className="text-[11px] text-zinc-500">{resolvingAlert.description}</div>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase font-bold text-zinc-400 mb-1">
                  Assigned Dispatcher / Officer
                </label>
                <select
                  value={assignedDispatcher}
                  onChange={(e) => setAssignedDispatcher(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
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
                <label className="block text-[11px] uppercase font-bold text-zinc-400 mb-1">
                  Investigation & Resolution Notes
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Spoke with driver; vehicle pulled over safely. Speed sensor recalibrated."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-white focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResolvingAlert(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black shadow-lg"
                >
                  Close & Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
