import React from 'react';
import { Shield, Eye, AlertCircle, XCircle, ArrowRight, UserCheck } from 'lucide-react';
import { UserRole } from '../../types/fleet';
import { ROLE_METADATA } from '../../types/rbac';

interface RoleImpersonationBannerProps {
  currentRole: UserRole;
  isSimulating: boolean;
  onSelectRole: (role: UserRole) => void;
  onExitSimulation: () => void;
}

export const RoleImpersonationBanner: React.FC<RoleImpersonationBannerProps> = ({
  currentRole,
  isSimulating,
  onSelectRole,
  onExitSimulation
}) => {
  if (!isSimulating) return null;

  const currentMeta = ROLE_METADATA[currentRole] || ROLE_METADATA.super_admin;

  return (
    <div className="w-full bg-gradient-to-r from-amber-950/80 via-zinc-950 to-amber-950/80 border-b border-amber-600/40 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-[90] shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
          <Eye className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold uppercase tracking-wider text-amber-400 text-[10px]">
            RBAC Simulation Sandbox Active:
          </span>
          <span className="text-zinc-300">You are previewing permissions as</span>
          <span className={`px-2.5 py-0.5 rounded-md font-bold font-mono text-[11px] border ${currentMeta.badgeColor}`}>
            {currentMeta.label}
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 hidden md:inline">
          ({currentMeta.description})
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-[10px] uppercase font-bold text-zinc-400 hidden sm:inline">
          Switch Preview Role:
        </label>
        <select
          value={currentRole}
          onChange={(e) => onSelectRole(e.target.value as UserRole)}
          aria-label="Switch Preview Role"
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
        >
          <option value="super_admin">Super Admin (Unrestricted)</option>
          <option value="support_admin">Support Admin (Diagnostic Read-only)</option>
          <option value="org_owner">Org Owner (Full Tenant)</option>
          <option value="org_admin">Org Admin (Fleet Ops)</option>
          <option value="fleet_manager">Fleet Dispatcher (Live + Alerts)</option>
          <option value="driver">Fleet Driver (Personal Telemetry)</option>
          <option value="viewer">Read-Only Viewer (No Edits)</option>
        </select>

        <button
          onClick={onExitSimulation}
          className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[11px] transition-all flex items-center gap-1.5 shadow-md"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Exit Sandbox</span>
        </button>
      </div>
    </div>
  );
};
