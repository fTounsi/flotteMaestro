import React from 'react';
import {
  Navigation,
  Calendar,
  Cpu,
  Shield,
  Bell,
  FileText,
  Boxes,
  Building2,
  Users,
  Sliders,
  KeyRound,
  Fuel,
  Snowflake,
  Share2,
  Wrench,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Radio,
  Layers,
  Receipt,
  BookOpen
} from 'lucide-react';
import { TranslationDictionary } from '../../translations/i18n';
import { Organization, NavigationTab, User } from '../../types/fleet';
import { userHasPermission } from '../../types/rbac';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  activeNav: NavigationTab;
  onNavChange: (nav: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  organizations: Organization[];
  selectedOrgId: string;
  onOrgChange: (orgId: string) => void;
  unreadAlertsCount: number;
  currentUser: User | null;
  t: TranslationDictionary;
}

interface NavGroupItem {
  id: NavigationTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  description?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNavChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  organizations,
  selectedOrgId,
  onOrgChange,
  unreadAlertsCount,
  currentUser,
  t
}) => {
  const activeOrg = organizations.find((o) => o.id === selectedOrgId) || organizations[0];
  const enabledModules = activeOrg?.enabledModules || {
    car_rental: false,
    fuel_intelligence: true,
    cold_chain: false,
    live_sharing: false,
    predictive_maintenance: false
  };

  // Group 1: Core Operations (Filtered by user capabilities)
  const coreNavItems: NavGroupItem[] = [];
  if (userHasPermission(currentUser, 'vehicles:view')) {
    coreNavItems.push({
      id: 'live_tracking',
      label: t?.nav?.liveTracking || t?.nav?.liveMap || 'Live GPS Map',
      icon: <Navigation className="w-4 h-4" />,
      description: 'Live Telemetry & Map'
    });
  }
  if (userHasPermission(currentUser, 'trips:view')) {
    coreNavItems.push({
      id: 'trips',
      label: t?.nav?.trips || t?.nav?.tripsHistory || 'Trips & Replay',
      icon: <Calendar className="w-4 h-4" />,
      description: 'Historical Scrubber'
    });
  }
  if (userHasPermission(currentUser, 'trackers:view')) {
    coreNavItems.push({
      id: 'trackers',
      label: t?.nav?.trackers || 'Hardware Trackers',
      icon: <Cpu className="w-4 h-4" />,
      description: 'Hardware & Protocols'
    });
  }
  if (userHasPermission(currentUser, 'geofences:view')) {
    coreNavItems.push({
      id: 'geofences',
      label: t?.nav?.geofences || 'Geofences',
      icon: <Shield className="w-4 h-4" />,
      description: 'Spatial Perimeter Zones'
    });
  }
  if (userHasPermission(currentUser, 'alerts:view')) {
    coreNavItems.push({
      id: 'alerts',
      label: t?.nav?.alerts || 'Alerts & Events',
      icon: <Bell className="w-4 h-4" />,
      description: 'Incident Feed & Triage'
    });
  }
  if (userHasPermission(currentUser, 'reports:view')) {
    coreNavItems.push({
      id: 'reports',
      label: t?.nav?.reports || 'Reports Studio',
      icon: <FileText className="w-4 h-4" />,
      description: 'PDF / CSV Intelligence'
    });
  }

  // Group 2: Dynamic Add-On Modules (Must be enabled for the active tenant AND user must have permission)
  const moduleNavItems: NavGroupItem[] = [];
  if (enabledModules.car_rental && userHasPermission(currentUser, 'modules:car_rental')) {
    moduleNavItems.push({
      id: 'car_rental',
      label: t?.nav?.carRental || 'Car Rental & Relay',
      icon: <KeyRound className="w-4 h-4 text-amber-400" />,
      badge: 'Rental'
    });
  }
  if (enabledModules.fuel_intelligence && userHasPermission(currentUser, 'modules:fuel_intelligence')) {
    moduleNavItems.push({
      id: 'fuel_intelligence',
      label: t?.nav?.fuelIntelligence || 'Fuel Intelligence',
      icon: <Fuel className="w-4 h-4 text-rose-400" />,
      badge: 'Fuel'
    });
  }
  if (enabledModules.cold_chain && userHasPermission(currentUser, 'modules:cold_chain')) {
    moduleNavItems.push({
      id: 'cold_chain',
      label: t?.nav?.coldChain || 'Cold-Chain & HACCP',
      icon: <Snowflake className="w-4 h-4 text-blue-400" />,
      badge: 'Cold'
    });
  }
  if (enabledModules.live_sharing && userHasPermission(currentUser, 'modules:live_sharing')) {
    moduleNavItems.push({
      id: 'live_sharing',
      label: t?.nav?.liveSharing || 'Live ETA Sharing',
      icon: <Share2 className="w-4 h-4 text-indigo-400" />,
      badge: 'ETA'
    });
  }
  if (enabledModules.predictive_maintenance && userHasPermission(currentUser, 'modules:maintenance')) {
    moduleNavItems.push({
      id: 'predictive_maintenance',
      label: t?.nav?.predictiveMaintenance || 'Predictive Maintenance',
      icon: <Wrench className="w-4 h-4 text-amber-400" />,
      badge: 'OBD-II'
    });
  }
  if (enabledModules.billing && userHasPermission(currentUser, 'modules:billing')) {
    moduleNavItems.push({
      id: 'invoicing',
      label: (t?.nav as any)?.invoicing || 'Invoicing & Billing',
      icon: <Receipt className="w-4 h-4 text-emerald-400" />,
      badge: 'PDF'
    });
  }

  // Group 3: Administration & Configuration (Restricted to Admins & privileged users)
  const adminNavItems: NavGroupItem[] = [];
  const canAccessModulesHub =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'support_admin' ||
    currentUser?.role === 'org_owner' ||
    currentUser?.role === 'org_admin' ||
    userHasPermission(currentUser, 'users:manage');

  if (canAccessModulesHub) {
    adminNavItems.push({
      id: 'modules_hub',
      label: t?.nav?.modulesHub || 'Feature Modules',
      icon: <Boxes className="w-4 h-4 text-indigo-400" />,
      badge: 'Hub'
    });
  }

  if (currentUser?.role === 'super_admin' || currentUser?.role === 'support_admin' || currentUser?.role === 'org_owner') {
    adminNavItems.push({
      id: 'organizations',
      label: t?.nav?.organizations || 'Organizations & Tenancy',
      icon: <Building2 className="w-4 h-4 text-emerald-400" />
    });
  }

  if (userHasPermission(currentUser, 'users:view') || userHasPermission(currentUser, 'users:manage')) {
    adminNavItems.push({
      id: 'users',
      label: t?.nav?.usersRbac || 'Users & Permissions',
      icon: <Users className="w-4 h-4 text-purple-400" />
    });
  }

  if (userHasPermission(currentUser, 'system:settings')) {
    adminNavItems.push({
      id: 'settings',
      label: t?.nav?.settings || 'System Parameters',
      icon: <Sliders className="w-4 h-4 text-cyan-400" />,
      badge: 'Traccar'
    });
  }

  // Group 4: Support & Documentation (Available to all users)
  const helpNavItems: NavGroupItem[] = [
    {
      id: 'documentation',
      label: t?.nav?.documentation || 'Documentation & Guides',
      icon: <BookOpen className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
      badge: 'FR'
    }
  ];

  const renderNavButton = (item: NavGroupItem) => {
    const isActive = activeNav === item.id;
    const isAlertsTab = item.id === 'alerts';

    return (
      <button
        key={item.id}
        id={`nav-btn-${item.id}`}
        onClick={() => {
          onNavChange(item.id);
          onCloseMobile();
        }}
        title={isCollapsed ? item.label : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
          isActive
            ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 shadow-xs dark:bg-zinc-900 dark:text-white dark:border-zinc-700/80 dark:shadow-lg dark:shadow-black/40'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/60 border border-transparent'
        }`}
      >
        {/* Active Left Indicator Bar */}
        {isActive && (
          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_8px_#10b981]" />
        )}

        {/* Icon */}
        <span
          className={`shrink-0 transition-transform duration-200 ${
            isActive
              ? 'text-emerald-600 dark:text-emerald-400 scale-110'
              : 'text-slate-500 group-hover:text-slate-800 dark:text-zinc-400 dark:group-hover:text-zinc-200'
          }`}
        >
          {item.icon}
        </span>

        {/* Text Label & Badges (when not collapsed) */}
        {!isCollapsed && (
          <div className="flex-1 flex items-center justify-between min-w-0 text-left">
            <span className="truncate">{item.label}</span>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30">
                  {item.badge}
                </span>
              )}
              {isAlertsTab && unreadAlertsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black shadow-sm">
                  {unreadAlertsCount}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Collapsed Unread Badge Indicator */}
        {isCollapsed && isAlertsTab && unreadAlertsCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
        )}

        {/* Collapsed Tooltip (Hover) */}
        {isCollapsed && (
          <div className="fixed left-20 ml-2 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white text-xs font-semibold shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                  {item.badge}
                </span>
              )}
            </div>
          </div>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Vertical Sidebar Container */}
      <aside
        id="app-vertical-sidebar"
        className={`bg-white dark:bg-[#09090b]/95 border-r border-slate-200 dark:border-zinc-900/90 text-slate-900 dark:text-white flex flex-col transition-all duration-300 z-40 ${
          // Desktop sizing & sticky positioning
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          // Mobile slide-over drawer behavior
          isMobileOpen
            ? 'fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50 flex'
            : 'hidden lg:flex'
        }`}
      >
        {/* Sidebar Header & Toggle Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-zinc-900/90 flex items-center justify-between gap-2">
          {!isCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-xl bg-slate-100 border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-center shrink-0">
                <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black tracking-wider uppercase text-slate-800 dark:text-zinc-200 truncate">
                  Navigation
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-500 truncate font-mono">
                  {activeOrg.name}
                </p>
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <button
            id="sidebar-toggle-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Menu (Ctrl+B)' : 'Collapse Menu'}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors mx-auto lg:mx-0 shrink-0"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            )}
          </button>
        </div>

        {/* Scrollable Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-800">
          {/* Section 1: Fleet Operations */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1.5">
                <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500 font-mono">
                  {t?.nav?.coreGroup || 'Fleet Operations'}
                </p>
              </div>
            )}
            {coreNavItems.map(renderNavButton)}
          </div>

          {/* Section 2: Dynamic Feature Modules (if any unlocked) */}
          {moduleNavItems.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-zinc-900/60">
              {!isCollapsed && (
                <div className="px-3 pb-1.5 flex items-center justify-between">
                  <p className="text-[10px] font-bold tracking-wider uppercase text-amber-600 dark:text-amber-500/80 font-mono">
                    {t?.nav?.modulesGroup || 'Add-On Modules'}
                  </p>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {moduleNavItems.length}
                  </span>
                </div>
              )}
              {moduleNavItems.map(renderNavButton)}
            </div>
          )}

          {/* Section 3: Governance & Administration */}
          {adminNavItems.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-zinc-900/60">
              {!isCollapsed && (
                <div className="px-3 pb-1.5">
                  <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500 font-mono">
                    {t?.nav?.adminGroup || 'Administration'}
                  </p>
                </div>
              )}
              {adminNavItems.map(renderNavButton)}
            </div>
          )}

          {/* Section 4: Support & Documentation (All Users) */}
          <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-zinc-900/60">
            {!isCollapsed && (
              <div className="px-3 pb-1.5">
                <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500 font-mono">
                  {t?.common?.help || 'Aide & Documentation'}
                </p>
              </div>
            )}
            {helpNavItems.map(renderNavButton)}
          </div>
        </div>

        {/* Sidebar Footer: Active Tenant Badge & Theme Switcher */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-900/90 bg-slate-50 dark:bg-[#060608] space-y-2">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">THEME & TENANT</span>
                <ThemeToggle variant="pill" />
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">{activeOrg.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-500 truncate">{activeOrg.city}, Morocco</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2" title={`${activeOrg.name} (${activeOrg.subscription.planName})`}>
              <ThemeToggle variant="icon-button" />
              <div className="h-8 w-8 rounded-xl bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-center shadow-xs">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
