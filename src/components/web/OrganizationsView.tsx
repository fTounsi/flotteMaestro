import React, { useState } from 'react';
import { Building2, Plus, Shield, Check, Calendar, Users, Cpu, ArrowUpRight } from 'lucide-react';
import { Organization } from '../../types/fleet';
import { TranslationDictionary } from '../../translations/i18n';

interface OrganizationsViewProps {
  organizations: Organization[];
  onSelectOrg: (orgId: string) => void;
  selectedOrgId: string;
  t: TranslationDictionary;
}

export const OrganizationsView: React.FC<OrganizationsViewProps> = ({
  organizations,
  onSelectOrg,
  selectedOrgId,
  t
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/40 rounded-[32px] p-6 border border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div className="border-l-2 border-emerald-500 pl-4 py-1">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">
            Multi-Tenant Enterprise Architecture
          </p>
          <h2 className="text-3xl font-black italic tracking-tight text-white">
            {t.nav.organizations}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage organization tenants, subscription tier quotas, tracker license limits, and cloud billing cycles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {organizations.map((org) => {
          const isSelected = org.id === selectedOrgId;
          return (
            <div
              key={org.id}
              onClick={() => onSelectOrg(org.id)}
              className={`p-6 rounded-[32px] border cursor-pointer transition-all flex flex-col justify-between shadow-2xl ${
                isSelected
                  ? 'bg-zinc-900 border-zinc-500 text-white'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-xl bg-zinc-900 text-emerald-400 border border-zinc-700 font-bold">
                    {org.subscription.planName}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full">
                      Active Scope
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-white">{org.name}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{org.city}, {org.country}</p>
              </div>

              <div className="my-6 pt-4 border-t border-zinc-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-sans">Vehicle Quota:</span>
                  <span className="text-white font-bold">{org.subscription.vehicleLimit} Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-sans">User Accounts:</span>
                  <span className="text-white font-bold">{org.subscription.userLimit} Seats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-sans">Data Retention:</span>
                  <span className="text-white font-bold">{org.subscription.historyRetentionDays} Days</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectOrg(org.id);
                }}
                className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                  isSelected
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-zinc-300 hover:text-white'
                }`}
              >
                {isSelected ? 'Currently Monitored' : 'Switch Organization Scope'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
