import React, { useState } from 'react';
import {
  Layers,
  Smartphone,
  Terminal,
  Radio,
  Bell,
  Globe,
  Building2,
  Navigation,
  Calendar,
  Cpu,
  Shield,
  FileText,
  Users,
  Sparkles,
  Zap,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Lock,
  CheckCircle2,
  Boxes,
  KeyRound,
  Fuel,
  Snowflake,
  Share2,
  Wrench,
  Sliders
} from 'lucide-react';
import { Language, TranslationDictionary } from '../../translations/i18n';
import { Organization, AppMode, NavigationTab, User } from '../../types/fleet';
import { userHasPermission } from '../../types/rbac';

interface HeaderProps {
  appMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  activeNav: NavigationTab;
  onNavChange: (nav: NavigationTab) => void;
  organizations: Organization[];
  selectedOrgId: string;
  onOrgChange: (orgId: string) => void;
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  unreadAlertsCount: number;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  currentUser: User | null;
  isAuthenticated: boolean;
  onLogin: (user: User) => void;
  onLogout: () => void;
  isLoginPreview: boolean;
  onToggleLoginPreview: () => void;
  t: TranslationDictionary;
}

export const Header: React.FC<HeaderProps> = ({
  appMode,
  onModeChange,
  activeNav,
  onNavChange,
  organizations,
  selectedOrgId,
  onOrgChange,
  currentLang,
  onLangChange,
  unreadAlertsCount,
  isSimulating,
  onToggleSimulation,
  currentUser,
  isAuthenticated,
  onLogin,
  onLogout,
  isLoginPreview,
  onToggleLoginPreview,
  t
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const activeOrg = organizations.find((o) => o.id === selectedOrgId) || organizations[0];
  const enabledModules = activeOrg.enabledModules || {
    car_rental: false,
    fuel_intelligence: true,
    cold_chain: false,
    live_sharing: false,
    predictive_maintenance: false
  };

  interface NavItem {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    isAddon?: boolean;
    badge?: string;
  }

  const baseNavItems: NavItem[] = [
    { id: 'live_tracking', label: t.nav.liveTracking, icon: <Navigation className="w-3.5 h-3.5" /> },
    { id: 'trips', label: t.nav.trips, icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'trackers', label: t.nav.trackers, icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'geofences', label: t.nav.geofences, icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'alerts', label: t.nav.alerts, icon: <Bell className="w-3.5 h-3.5" /> },
    { id: 'reports', label: t.nav.reports, icon: <FileText className="w-3.5 h-3.5" /> }
  ];

  // Dynamic modules unlocked for the active tenant
  const moduleNavItems: NavItem[] = [];

  if (enabledModules.car_rental) {
    moduleNavItems.push({
      id: 'car_rental',
      label: 'Car Rental & Relay',
      icon: <KeyRound className="w-3.5 h-3.5 text-amber-400" />,
      badge: 'Rental'
    });
  }
  if (enabledModules.fuel_intelligence) {
    moduleNavItems.push({
      id: 'fuel_intelligence',
      label: 'Fuel Intelligence',
      icon: <Fuel className="w-3.5 h-3.5 text-rose-400" />,
      badge: 'Fuel'
    });
  }
  if (enabledModules.cold_chain) {
    moduleNavItems.push({
      id: 'cold_chain',
      label: 'Cold-Chain & HACCP',
      icon: <Snowflake className="w-3.5 h-3.5 text-blue-400" />,
      badge: 'Cold'
    });
  }
  if (enabledModules.live_sharing) {
    moduleNavItems.push({
      id: 'live_sharing',
      label: 'Live ETA Sharing',
      icon: <Share2 className="w-3.5 h-3.5 text-indigo-400" />,
      badge: 'ETA'
    });
  }
  if (enabledModules.predictive_maintenance) {
    moduleNavItems.push({
      id: 'predictive_maintenance',
      label: 'Predictive Maintenance',
      icon: <Wrench className="w-3.5 h-3.5 text-amber-400" />,
      badge: 'OBD-II'
    });
  }

  const managementNavItems: NavItem[] = [];

  // Modules hub
  managementNavItems.push({ id: 'modules_hub', label: 'Feature Modules', icon: <Boxes className="w-3.5 h-3.5 text-indigo-400" /> });

  // Organizations (Only Super Admin, Support Admin, Org Owner)
  if (currentUser?.role === 'super_admin' || currentUser?.role === 'support_admin' || currentUser?.role === 'org_owner') {
    managementNavItems.push({ id: 'organizations', label: t.nav.organizations, icon: <Building2 className="w-3.5 h-3.5" /> });
  }

  // Users & RBAC
  if (userHasPermission(currentUser, 'users:view')) {
    managementNavItems.push({ id: 'users', label: t.nav.usersRbac, icon: <Users className="w-3.5 h-3.5" /> });
  }

  // Traccar System Settings
  if (userHasPermission(currentUser, 'system:settings')) {
    managementNavItems.push({ id: 'settings', label: 'System Parameters', icon: <Sliders className="w-3.5 h-3.5 text-cyan-400" />, badge: 'Traccar' });
  }

  const allNavItems: NavItem[] = [...baseNavItems, ...moduleNavItems, ...managementNavItems];

  return (
    <header className="bg-[#080808]/95 backdrop-blur-2xl border-b border-zinc-900 sticky top-0 z-50 text-white select-none">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-3 flex flex-wrap items-center justify-between gap-4">
        {/* Artistic Brand Header */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter leading-none italic uppercase">
                FLOTTE<span className="text-zinc-600">MAESTRO</span>
              </h1>
              <div className="h-9 w-9 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-900/80 shadow-inner">
                <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981] animate-pulse" />
              </div>
            </div>
            <p className="text-[9px] tracking-[0.35em] uppercase text-zinc-500 mt-1.5 font-bold">
              The Architecture of Synchronization
            </p>
          </div>

          {/* Active Tenant Dropdown */}
          <div className="hidden lg:flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-1.5 transition-colors">
            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
            <select
              aria-label="Select Organization Tenant"
              value={selectedOrgId}
              onChange={(e) => onOrgChange(e.target.value)}
              className="bg-transparent text-zinc-200 text-xs font-semibold focus:outline-none cursor-pointer pr-2"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id} className="bg-zinc-950 text-zinc-200">
                  {org.name} ({org.city})
                </option>
              ))}
            </select>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
              {activeOrg.subscription.planName}
            </span>
          </div>
        </div>

        {/* Mode Switcher Tabs (Web / Mobile / API) */}
        <div className="flex items-center bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800">
          <button
            onClick={() => onModeChange('web')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              appMode === 'web'
                ? 'bg-white text-black shadow-lg shadow-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.modes.webAdmin}</span>
          </button>
          <button
            onClick={() => onModeChange('mobile')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              appMode === 'mobile'
                ? 'bg-white text-black shadow-lg shadow-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t.modes.mobileApp}</span>
          </button>
          <button
            onClick={() => onModeChange('api')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              appMode === 'api'
                ? 'bg-white text-black shadow-lg shadow-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{t.modes.apiDeveloper}</span>
          </button>
        </div>

        {/* Top Right Utilities (Simulation node, Alerts, Language & User Auth) */}
        <div className="flex items-center gap-2.5">
          {/* Quick Login Screen View Toggle */}
          <button
            onClick={onToggleLoginPreview}
            title={isLoginPreview ? t.auth.backToDashboard : t.auth.viewLoginPreview}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-semibold transition-all ${
              isLoginPreview
                ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)] font-bold'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
            }`}
          >
            {isLoginPreview ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.auth.backToDashboard}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.auth.viewLoginPreview}</span>
              </>
            )}
          </button>

          {/* Real-time Telemetry Stream Toggler */}
          <button
            onClick={onToggleSimulation}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-mono font-semibold transition-all ${
              isSimulating
                ? 'bg-zinc-900 border-zinc-700 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${isSimulating ? 'bg-emerald-400 shadow-[0_0_6px_#10b981] animate-ping' : 'bg-zinc-600'}`} />
            <span>{isSimulating ? 'GPS STREAM.ACTIVE' : 'STREAM.PAUSED'}</span>
          </button>

          {/* Alerts Bell */}
          <button
            onClick={() => onNavChange('alerts')}
            className="relative p-2 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Alerts Incident Feed"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] font-black flex items-center justify-center shadow-lg">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-zinc-900/60 border border-zinc-800 rounded-2xl p-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-zinc-500 mx-1.5" />
            <button
              onClick={() => onLangChange('en')}
              className={`px-2 py-0.5 rounded-xl font-bold transition-all ${
                currentLang === 'en' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLangChange('fr')}
              className={`px-2 py-0.5 rounded-xl font-bold transition-all ${
                currentLang === 'fr' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => onLangChange('ar')}
              className={`px-2 py-0.5 rounded-xl font-bold font-arabic transition-all ${
                currentLang === 'ar' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              عربي
            </button>
          </div>

          {/* User Account / Auth Dropdown */}
          {isAuthenticated && currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full border border-emerald-500/80 object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-bold text-zinc-200 hidden md:inline max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-3 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-zinc-800/80">
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full border border-emerald-500/80 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono truncate">{currentUser.email}</p>
                      <span className="inline-block text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold mt-1">
                        {currentUser.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onToggleLoginPreview();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.auth.viewLoginPreview}</span>
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.auth.signOut}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onToggleLoginPreview}
              className="px-3.5 py-1.5 rounded-2xl bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
            >
              {t.auth.signInButton.split(' ')[0]}
            </button>
          )}
        </div>
      </div>

      {/* Secondary Navigation Ribbon for Web Admin Mode */}
      {appMode === 'web' && !isLoginPreview && (
        <div className="border-t border-zinc-900/80 bg-[#060606] px-4 sm:px-8 py-2 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max">
            {allNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeNav === item.id
                    ? 'bg-zinc-900 text-white border border-zinc-700 shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent'
                }`}
              >
                <span className={activeNav === item.id ? 'text-emerald-400' : 'text-zinc-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
                {item.id === 'alerts' && unreadAlertsCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#10b981]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
