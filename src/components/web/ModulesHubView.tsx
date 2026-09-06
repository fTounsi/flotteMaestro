import React, { useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  Lock,
  Sparkles,
  ShieldCheck,
  Fuel,
  Snowflake,
  Share2,
  Wrench,
  KeyRound,
  Zap,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Organization, ModuleKey, EnabledModules } from '../../types/fleet';
import { MODULE_METADATA_LIST } from '../../data/modulesData';

interface ModulesHubViewProps {
  currentOrg: Organization;
  organizations: Organization[];
  onToggleModule: (orgId: string, moduleKey: ModuleKey, enabled: boolean) => void;
  onNavigateToTab: (tab: any) => void;
}

const MODULE_ICONS: Record<ModuleKey, React.ComponentType<{ className?: string }>> = {
  car_rental: KeyRound,
  fuel_intelligence: Fuel,
  cold_chain: Snowflake,
  live_sharing: Share2,
  predictive_maintenance: Wrench
};

export const ModulesHubView: React.FC<ModulesHubViewProps> = ({
  currentOrg,
  organizations,
  onToggleModule,
  onNavigateToTab
}) => {
  const [selectedOrgId, setSelectedOrgId] = useState(currentOrg.id);
  const [filterCategory, setFilterCategory] = useState<'all' | 'unlocked' | 'locked'>('all');

  const targetOrg = organizations.find((o) => o.id === selectedOrgId) || currentOrg;
  const enabledModules: EnabledModules = targetOrg.enabledModules || {
    car_rental: false,
    fuel_intelligence: true,
    cold_chain: false,
    live_sharing: false,
    predictive_maintenance: false
  };

  const unlockedCount = Object.values(enabledModules).filter(Boolean).length;
  const totalMonthlyAddonCost = MODULE_METADATA_LIST.reduce((acc, mod) => {
    if (enabledModules[mod.id]) {
      return acc + mod.pricePerVehicleMonthUsd * (targetOrg.stats.totalVehicles || 1);
    }
    return acc;
  }, 0);

  const filteredModules = MODULE_METADATA_LIST.filter((mod) => {
    const isUnlocked = enabledModules[mod.id];
    if (filterCategory === 'unlocked') return isUnlocked;
    if (filterCategory === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12" id="modules-hub-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 lg:p-8 border border-indigo-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Boxes className="w-3.5 h-3.5" />
              <span>FlotteMaestro Modular Architecture</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Enterprise Feature Modules & Client Add-Ons
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Enable high-value telematics capabilities per organization. Unlock tailored modules for
              car rental agencies, fuel theft protection, cold chains, live delivery sharing, and predictive maintenance.
            </p>
          </div>

          {/* Org Selector & Stats Badge */}
          <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 flex flex-col gap-3 min-w-[260px]">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Target Organization</label>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Active Modules: <strong className="text-indigo-400 font-bold">{unlockedCount} / {MODULE_METADATA_LIST.length}</strong>
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Car Rental Security</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {enabledModules.car_rental ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Unlocked & Active
                </span>
              ) : (
                <span className="text-slate-400 text-sm font-normal">Available (Locked)</span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Remote Relay Engine Cut-Off</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fuel Theft Protection</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {enabledModules.fuel_intelligence ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Unlocked & Active
                </span>
              ) : (
                <span className="text-slate-400 text-sm font-normal">Available (Locked)</span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Instant Siphoning Radar</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Snowflake className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cold Chain Telemetry</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {enabledModules.cold_chain ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Unlocked & Active
                </span>
              ) : (
                <span className="text-slate-400 text-sm font-normal">Available (Locked)</span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">HACCP / GDP Certified</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monthly Add-on Value</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              ${totalMonthlyAddonCost} <span className="text-xs font-normal text-slate-400">/ month</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{targetOrg.stats.totalVehicles || 4} vehicles managed</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Modules ({MODULE_METADATA_LIST.length})
          </button>
          <button
            onClick={() => setFilterCategory('unlocked')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterCategory === 'unlocked'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Unlocked for {targetOrg.name.split(' ')[0]} ({unlockedCount})
          </button>
          <button
            onClick={() => setFilterCategory('locked')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterCategory === 'locked'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Available to Unlock ({MODULE_METADATA_LIST.length - unlockedCount})
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Toggle modules anytime to customize the navigation & feature set for this client</span>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredModules.map((mod) => {
          const isUnlocked = Boolean(enabledModules[mod.id]);
          const Icon = MODULE_ICONS[mod.id] || Boxes;

          return (
            <div
              key={mod.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-800/80 shadow-md ring-1 ring-indigo-500/20'
                  : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-90'
              }`}
            >
              <div className="p-6 space-y-4">
                {/* Card Top: Icon, Title, Badge & Toggle Switch */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isUnlocked
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{mod.name}</h3>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            mod.id === 'car_rental'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/40'
                              : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300/40'
                          }`}
                        >
                          {mod.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{mod.recommendedFor}</p>
                    </div>
                  </div>

                  {/* Unlock Toggle Button */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleModule(targetOrg.id, mod.id, !isUnlocked)}
                      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                        isUnlocked ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      aria-label={`Toggle ${mod.name}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          isUnlocked ? 'translate-x-7' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span
                      className={`text-[11px] font-semibold ${
                        isUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {isUnlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{mod.fullDesc}</p>

                {/* Key Features List */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                    Included Capabilities:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {mod.keyFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isUnlocked ? 'text-emerald-500' : 'text-slate-400'
                          }`}
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer: Pricing & Action Button */}
              <div className="p-4 bg-slate-100/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    ${mod.pricePerVehicleMonthUsd}
                  </span>{' '}
                  / vehicle / mo
                </div>

                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <button
                      onClick={() => onNavigateToTab(mod.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <span>Open {mod.name.split(' ')[0]} Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onToggleModule(targetOrg.id, mod.id, true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-medium transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock for {targetOrg.name.split(' ')[0]}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
