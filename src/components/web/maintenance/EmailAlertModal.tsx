import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Gauge,
  Wrench,
  Building,
  ShieldAlert,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Check
} from 'lucide-react';
import { MaintenanceInterval, Vehicle, MaintenanceAlertLog, Organization, User } from '../../../types/fleet';

interface EmailAlertModalProps {
  interval: MaintenanceInterval;
  vehicle?: Vehicle;
  currentOrg?: Organization;
  users?: User[];
  currentOdometer: number;
  remainingKm: number;
  remainingDays: number;
  onClose: () => void;
  onSendAlert: (alertLog: MaintenanceAlertLog) => void;
}

export const EmailAlertModal: React.FC<EmailAlertModalProps> = ({
  interval,
  vehicle,
  currentOrg,
  users = [],
  currentOdometer,
  remainingKm,
  remainingDays,
  onClose,
  onSendAlert
}) => {
  const isOverdue = remainingKm <= 0 || remainingDays <= 0;

  // Determine admin emails from users list
  const defaultAdmins = users
    .filter((u) => u.role === 'org_admin' || u.role === 'org_owner' || u.role === 'super_admin' || u.role === 'fleet_manager')
    .map((u) => u.email);

  const initialRecipients = Array.from(
    new Set([
      'fouad.tounsi@gmail.com',
      ...(interval.alertRecipientEmails || []),
      ...(currentOrg?.email ? [currentOrg.email] : []),
      ...defaultAdmins
    ])
  );

  const [recipients, setRecipients] = useState<string[]>(initialRecipients);
  const [newRecipientInput, setNewRecipientInput] = useState('');
  const [subject, setSubject] = useState(
    isOverdue
      ? `[CRITICAL ESCALATION] Maintenance Overdue: ${interval.vehiclePlate} - ${interval.title}`
      : `[SERVICE ALERT] Service Due Soon for ${interval.vehiclePlate} (${remainingKm > 0 ? remainingKm + ' km remaining' : Math.abs(remainingDays) + ' days remaining'})`
  );
  const [customMessage, setCustomMessage] = useState(
    isOverdue
      ? `Attention Organization Administrator: Vehicle ${interval.vehiclePlate} (${vehicle?.make || ''} ${vehicle?.model || ''}) has exceeded its prescribed telematics service threshold. Immediate workshop scheduling is required to preserve vehicle warranty and road safety compliance.`
      : `Proactive Fleet Telematics Notification: Vehicle ${interval.vehiclePlate} is approaching its scheduled service threshold. Please review the service sheet below and confirm garage booking.`
  );
  const [activeView, setActiveView] = useState<'preview' | 'recipients'>('preview');
  const [isSending, setIsSending] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  const handleAddRecipient = () => {
    if (newRecipientInput && newRecipientInput.includes('@') && !recipients.includes(newRecipientInput.trim())) {
      setRecipients([...recipients, newRecipientInput.trim()]);
      setNewRecipientInput('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

  const handleDispatch = () => {
    setIsSending(true);
    setTimeout(() => {
      const newLog: MaintenanceAlertLog = {
        id: `alt_log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        vehicleId: interval.vehicleId,
        vehiclePlate: interval.vehiclePlate,
        vehicleModel: vehicle ? `${vehicle.make} ${vehicle.model}` : interval.vehicleModel,
        serviceIntervalId: interval.id,
        serviceTitle: interval.title,
        serviceType: interval.serviceType,
        alertType: isOverdue ? 'critical_overdue' : 'warning_due_soon',
        recipientEmails: recipients,
        subject,
        currentOdometer,
        nextDueOdometer: interval.nextDueOdometer,
        remainingKm,
        remainingDays,
        estimatedCostUsd: interval.estimatedCostUsd,
        status: 'delivered',
        organizationId: currentOrg?.id || interval.organizationId || 'org_default',
        organizationName: currentOrg?.name || 'Fleet Operations',
        notes: customMessage
      };

      onSendAlert(newLog);
      setIsSending(false);
      setIsSentSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isOverdue
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
              }`}
            >
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Automated Admin Service Alert Dispatcher
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Proactive email notification for vehicle{' '}
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                  {interval.vehiclePlate}
                </span>
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

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between px-6 pt-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeView === 'preview'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>HTML Email Preview</span>
            </button>
            <button
              onClick={() => setActiveView('recipients')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeView === 'recipients'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Admin Recipients ({recipients.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                isOverdue
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
              }`}
            >
              {isOverdue ? 'Critical Overdue Trigger' : '1,000 km Warning Trigger'}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {activeView === 'preview' ? (
            <div className="space-y-4">
              {/* Email Envelope Info */}
              <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">From:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Fleet Telematics Bot &lt;telematics-alerts@fleetengine.ma&gt;
                  </span>
                </div>
                <div className="flex items-start justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">To:</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-md">
                    {recipients.map((email) => (
                      <span
                        key={email}
                        className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-sans text-[11px]"
                      >
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-400">Subject:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-sans truncate max-w-md">
                    {subject}
                  </span>
                </div>
              </div>

              {/* Subject & Custom Message Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Custom Administrator Message / Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Rendered HTML Email Preview Card */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm font-sans">
                {/* Email Banner */}
                <div
                  className={`p-4 text-white ${
                    isOverdue
                      ? 'bg-gradient-to-r from-rose-600 to-red-700'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5" />
                      <span className="font-bold text-sm tracking-wide uppercase">
                        {currentOrg?.name || 'Fleet Telematics Systems'}
                      </span>
                    </div>
                    <span className="text-[11px] bg-black/20 px-2.5 py-0.5 rounded-full font-mono">
                      Service Interval Trigger
                    </span>
                  </div>
                  <h4 className="text-lg font-black mt-2">
                    {isOverdue ? '⚠️ IMMEDIATE ACTION REQUIRED: Service Overdue' : '⏰ PROACTIVE SERVICE REMINDER'}
                  </h4>
                  <p className="text-xs text-white/85 mt-0.5">{customMessage}</p>
                </div>

                {/* Email Body Specs */}
                <div className="p-5 space-y-4 text-xs">
                  {/* Vehicle Details Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">License Plate</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {interval.vehiclePlate}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Vehicle Model</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {vehicle ? `${vehicle.make} ${vehicle.model}` : interval.vehicleModel || 'Fleet Asset'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Live GPS Odometer</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {currentOdometer.toLocaleString()} km
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Status</div>
                      <div
                        className={`font-bold uppercase ${
                          isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isOverdue
                          ? `Overdue by ${Math.abs(remainingKm)} km`
                          : `${remainingKm} km remaining`}
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Service Sheet */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-amber-500" />
                        <strong className="text-slate-900 dark:text-white text-sm">{interval.title}</strong>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        Est. ${interval.estimatedCostUsd}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-400">Last Serviced:</span>{' '}
                        <strong>{interval.lastDoneOdometer.toLocaleString()} km</strong> (
                        {new Date(interval.lastDoneDate).toLocaleDateString()})
                      </div>
                      <div>
                        <span className="text-slate-400">Next Due Threshold:</span>{' '}
                        <strong className="font-mono text-amber-600 dark:text-amber-400">
                          {interval.nextDueOdometer.toLocaleString()} km
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Preferred Garage:</span>{' '}
                        <strong>{interval.preferredWorkshop || 'Certified Dealer Network'}</strong>
                      </div>
                    </div>

                    {interval.notes && (
                      <div className="text-[11px] text-slate-500 italic bg-amber-50/60 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-900/40">
                        <strong>Technician Note:</strong> {interval.notes}
                      </div>
                    )}
                  </div>

                  {/* Call to Action Buttons Mock in Email */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs shadow hover:bg-indigo-700 transition-colors pointer-events-none"
                    >
                      Book Certified Workshop Now →
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 pointer-events-none"
                    >
                      Log Service in Fleet Portal
                    </button>
                  </div>

                  {/* Email Footer */}
                  <div className="text-[10px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    This is an automated telematics notification generated by Fleet Engine Odometer Synchronization
                    Service. To configure notification thresholds or unsubscribe, log into your Fleet Administration
                    Dashboard.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 text-xs text-amber-800 dark:text-amber-300">
                <p className="font-semibold">Automated Recipient Discovery</p>
                <p className="text-[11px] mt-0.5">
                  The system automatically routes proactive alerts to Organization Admins, Fleet Managers, and the
                  master account. You can add ad-hoc email addresses below.
                </p>
              </div>

              {/* Add Recipient */}
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="e.g. maintenance.lead@company.com"
                  value={newRecipientInput}
                  onChange={(e) => setNewRecipientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRecipient();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddRecipient}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Recipient</span>
                </button>
              </div>

              {/* Recipient List */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Alert Recipients ({recipients.length})
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  {recipients.map((email) => {
                    const isMaster = email === 'fouad.tounsi@gmail.com';
                    return (
                      <div
                        key={email}
                        className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                            {email}
                          </span>
                          {isMaster && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 text-[10px] font-bold">
                              Master Admin
                            </span>
                          )}
                        </div>

                        {!isMaster && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipient(email)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {isSentSuccess ? (
              <div className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm animate-fadeIn">
                <Check className="w-4 h-4" />
                <span>Alert Email Dispatched Successfully!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDispatch}
                disabled={isSending || recipients.length === 0}
                className={`px-5 py-2.5 rounded-lg text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
                  isOverdue
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                } ${isSending ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Telematics SMTP Gateway...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Automated Alert to Admins ({recipients.length})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
