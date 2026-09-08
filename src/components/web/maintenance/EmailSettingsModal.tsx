import React, { useState } from 'react';
import {
  X,
  Sliders,
  Mail,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Trash2,
  Shield,
  BellRing
} from 'lucide-react';
import { MaintenanceEmailSettings } from '../../../types/fleet';

interface EmailSettingsModalProps {
  settings: MaintenanceEmailSettings;
  onClose: () => void;
  onSave: (newSettings: MaintenanceEmailSettings) => void;
}

export const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({
  settings,
  onClose,
  onSave
}) => {
  const [form, setForm] = useState<MaintenanceEmailSettings>({ ...settings });
  const [newEmail, setNewEmail] = useState('');

  const handleAddEmail = () => {
    if (newEmail && newEmail.includes('@') && !form.defaultRecipientEmails.includes(newEmail.trim())) {
      setForm({
        ...form,
        defaultRecipientEmails: [...form.defaultRecipientEmails, newEmail.trim()]
      });
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setForm({
      ...form,
      defaultRecipientEmails: form.defaultRecipientEmails.filter((e) => e !== email)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-900/60">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Automated Email Alert Rules
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure proactive service triggers and admin escalation
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
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-xl">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Proactive Telematics Email Dispatcher
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically email organization admins when odometer hits warning threshold
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.autoAlertEnabled}
                  onChange={(e) => setForm({ ...form, autoAlertEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>

            {/* Threshold Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mileage Warning Trigger Threshold
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={form.warningKmThreshold}
                    onChange={(e) => setForm({ ...form, warningKmThreshold: Number(e.target.value) })}
                    className="w-full pl-3 pr-10 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 text-xs">km</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">e.g. Alert 1,000 km before service is due</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Calendar Warning Trigger Threshold
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={form.warningDaysThreshold}
                    onChange={(e) => setForm({ ...form, warningDaysThreshold: Number(e.target.value) })}
                    className="w-full pl-3 pr-12 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 text-xs">days</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">e.g. Alert 14 days before due date</p>
              </div>
            </div>

            {/* Critical Escalation & Weekly Digest */}
            <div className="space-y-2.5 p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    High Priority Critical Overdue Escalation
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Send immediate high-priority red alert if odometer passes 0 km remaining
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.criticalEscalationEnabled}
                  onChange={(e) => setForm({ ...form, criticalEscalationEnabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Weekly Fleet Maintenance Digest
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Dispatch Monday morning summary of all upcoming & overdue services
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.weeklyDigestEnabled}
                  onChange={(e) => setForm({ ...form, weeklyDigestEnabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>

            {/* Recipient Management */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Admin Email Recipients
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  placeholder="admin.email@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {form.defaultRecipientEmails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] border border-indigo-200 dark:border-indigo-900/50"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* SMTP Sender Profile */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                SMTP Sender Configuration
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400">Sender Display Name:</span>
                  <input
                    type="text"
                    value={form.smtpSenderName}
                    onChange={(e) => setForm({ ...form, smtpSenderName: e.target.value })}
                    className="w-full px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Sender Email:</span>
                  <input
                    type="email"
                    value={form.smtpSenderEmail}
                    onChange={(e) => setForm({ ...form, smtpSenderEmail: e.target.value })}
                    className="w-full px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
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
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Automation Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
