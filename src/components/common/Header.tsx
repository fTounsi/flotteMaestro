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
  Sliders,
  PanelLeftClose,
  PanelLeftOpen,
  Menu
} from 'lucide-react';
import { Language, TranslationDictionary } from '../../translations/i18n';
import { Organization, AppMode, NavigationTab, User } from '../../types/fleet';
import { userHasPermission } from '../../types/rbac';
import { ThemeToggle } from './ThemeToggle';

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
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
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
  isSidebarCollapsed = false,
  onToggleSidebar,
  t
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const activeOrg = organizations.find((o) => o.id === selectedOrgId) || organizations[0];

  return (
    <header className="bg-white/95 dark:bg-[#080808]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-zinc-900 sticky top-0 z-[100] text-slate-900 dark:text-white select-none transition-colors duration-200">
      {/* Top Banner Row */}
      <div className="w-full px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Artistic Brand Header & Sidebar Toggle */}
        <div className="flex items-center gap-3.5">
          {/* Vertical Navigation Toggle Button for Web Mode */}
          {appMode === 'web' && isAuthenticated && !isLoginPreview && onToggleSidebar && (
            <button
              id="header-sidebar-toggle-btn"
              onClick={onToggleSidebar}
              title={isSidebarCollapsed ? 'Expand Navigation Menu' : 'Collapse Navigation Menu'}
              className="flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs group"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-slate-500 dark:text-zinc-400 group-hover:scale-110 transition-transform" />
              )}
            </button>
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tighter leading-none italic uppercase text-slate-900 dark:text-white">
                FLOTTE<span className="text-slate-400 dark:text-zinc-600">MAESTRO</span>
              </h1>
              <div className="h-8 w-8 rounded-full border border-slate-200 dark:border-zinc-800 flex items-center justify-center bg-slate-100 dark:bg-zinc-900/80 shadow-inner">
                <div className="h-2 w-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981] animate-pulse" />
              </div>
            </div>
            <p className="text-[8px] tracking-[0.3em] uppercase text-slate-500 dark:text-zinc-500 mt-1 font-bold">
              The Architecture of Synchronization
            </p>
          </div>

          {/* Active Tenant / Organization Display (Super Admin Switcher vs Locked Assigned Org) */}
          {(() => {
            const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'support_admin';

            if (isSuperAdmin) {
              return (
                <div className="hidden lg:flex items-center gap-2 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 dark:bg-purple-950/20 dark:hover:bg-purple-950/40 dark:border-purple-500/40 rounded-2xl px-3 py-1.5 transition-colors ml-2 shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30">
                      Super Admin
                    </span>
                    <select
                      aria-label="Select Organization Tenant (Super Admin)"
                      value={selectedOrgId}
                      onChange={(e) => onOrgChange(e.target.value)}
                      className="bg-transparent text-purple-950 dark:text-purple-200 text-xs font-bold focus:outline-none cursor-pointer pr-1"
                    >
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id} className="bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-200">
                          {org.name} ({org.city})
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                    {activeOrg.subscription.planName}
                  </span>
                </div>
              );
            }

            // For non-super-admins: Organization is locked to their affected/assigned organization
            return (
              <div
                className="hidden lg:flex items-center gap-2 bg-slate-100 border border-slate-200 dark:bg-zinc-900/70 dark:border-zinc-800 rounded-2xl px-3 py-1.5 ml-2 shadow-xs"
                title={`Assigned Organization: ${activeOrg.name} (${activeOrg.city}). Limited to your assigned tenant permissions.`}
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-800 dark:text-zinc-200 text-xs font-bold truncate max-w-[170px]">
                    {activeOrg.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">({activeOrg.city})</span>
                </div>
                <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Assigned</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                  {activeOrg.subscription.planName}
                </span>
              </div>
            );
          })()}
        </div>

        {/* Mode Switcher Tabs (Web / Mobile / API) */}
        <div className="flex items-center bg-slate-100 dark:bg-zinc-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <button
            onClick={() => onModeChange('web')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              appMode === 'web'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.modes.webAdmin}</span>
          </button>
          <button
            onClick={() => onModeChange('mobile')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              appMode === 'mobile'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t.modes.mobileApp}</span>
          </button>
          <button
            onClick={() => onModeChange('api')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              appMode === 'api'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
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
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-300 dark:hover:text-white dark:hover:border-zinc-700'
            }`}
          >
            {isLoginPreview ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.auth.backToDashboard}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t.auth.viewLoginPreview}</span>
              </>
            )}
          </button>

          {/* Real-time Telemetry Stream Toggler */}
          <button
            onClick={onToggleSimulation}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-mono font-semibold transition-all ${
              isSimulating
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-zinc-900 dark:border-zinc-700 dark:text-emerald-400 shadow-xs'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${isSimulating ? 'bg-emerald-500 shadow-[0_0_6px_#10b981] animate-ping' : 'bg-slate-400 dark:bg-zinc-600'}`} />
            <span>{isSimulating ? 'GPS STREAM.ACTIVE' : 'STREAM.PAUSED'}</span>
          </button>

          {/* Alerts Bell */}
          <button
            onClick={() => onNavChange('alerts')}
            className="relative p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:text-white transition-colors"
            title="Alerts Incident Feed"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] font-black flex items-center justify-center shadow-lg">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Dark / Light Theme Mode Toggle Button */}
          <ThemeToggle />

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 mx-1.5" />
            <button
              onClick={() => onLangChange('en')}
              className={`px-2 py-0.5 rounded-xl font-bold transition-all ${
                currentLang === 'en' ? 'bg-white text-slate-900 shadow-xs dark:bg-white dark:text-black' : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLangChange('fr')}
              className={`px-2 py-0.5 rounded-xl font-bold transition-all ${
                currentLang === 'fr' ? 'bg-white text-slate-900 shadow-xs dark:bg-white dark:text-black' : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => onLangChange('ar')}
              className={`px-2 py-0.5 rounded-xl font-bold font-arabic transition-all ${
                currentLang === 'ar' ? 'bg-white text-slate-900 shadow-xs dark:bg-white dark:text-black' : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
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
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-200 transition-colors"
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full border border-emerald-500/80 object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 hidden md:inline max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 text-slate-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white shadow-2xl p-3 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200 dark:border-zinc-800/80">
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full border border-emerald-500/80 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono truncate">{currentUser.email}</p>
                      <span className="inline-block text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold mt-1">
                        {currentUser.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="px-3 py-1.5 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 dark:bg-zinc-900/40 dark:border-zinc-800/60">
                      <span className="text-slate-600 dark:text-zinc-400 font-bold">Theme:</span>
                      <ThemeToggle variant="pill" />
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onToggleLoginPreview();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-900 transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{t.auth.viewLoginPreview}</span>
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2"
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
              className="px-3.5 py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              {t.auth.signInButton.split(' ')[0]}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
