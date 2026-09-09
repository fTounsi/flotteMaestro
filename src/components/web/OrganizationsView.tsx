import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Shield,
  Check,
  Calendar,
  Users,
  Cpu,
  ArrowUpRight,
  Search,
  Filter,
  KeyRound,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  AlertTriangle,
  Tag,
  CheckCircle2,
  X,
  Layers,
  Fuel,
  Snowflake,
  Share2,
  Wrench,
  Globe,
  Mail,
  Phone,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Activity,
  Gauge,
  Eye,
  ExternalLink,
  Copy,
  Radio,
  FileText,
  TrendingUp,
  HardDrive,
  Navigation,
  CheckCircle
} from 'lucide-react';
import {
  Organization,
  SubscriptionPlanId,
  SubscriptionStatus,
  ModuleKey,
  EnabledModules,
  DEFAULT_ORGANIZATION_TYPES,
  User,
  NavigationTab
} from '../../types/fleet';
import { TranslationDictionary } from '../../translations/i18n';

interface OrganizationsViewProps {
  organizations: Organization[];
  onSelectOrg: (orgId: string) => void;
  selectedOrgId: string;
  currentUser?: User | null;
  onAddOrg?: (newOrg: Organization) => void;
  onUpdateOrg?: (updatedOrg: Organization) => void;
  onDeleteOrg?: (orgId: string) => void;
  onToggleModule?: (orgId: string, moduleKey: ModuleKey, enabled: boolean) => void;
  availableTypes?: string[];
  onAddType?: (newType: string) => void;
  onNavigateToTab?: (tab: NavigationTab) => void;
  t: TranslationDictionary;
}

export const OrganizationsView: React.FC<OrganizationsViewProps> = ({
  organizations,
  onSelectOrg,
  selectedOrgId,
  currentUser,
  onAddOrg,
  onUpdateOrg,
  onDeleteOrg,
  onToggleModule,
  availableTypes = [...DEFAULT_ORGANIZATION_TYPES, 'Logistics & Freight', 'Taxi / VTC Fleet', 'Construction & Heavy Machinery'],
  onAddType,
  onNavigateToTab,
  t
}) => {
  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'support_admin';

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);
  const [showTypeManagerModal, setShowTypeManagerModal] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState('');
  const [selectedDetailOrg, setSelectedDetailOrg] = useState<Organization | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<'overview' | 'quotas' | 'modules' | 'telematics'>('overview');
  const [copiedOrgId, setCopiedOrgId] = useState(false);

  const handleCopyOrgId = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedOrgId(true);
      setTimeout(() => setCopiedOrgId(false), 2000);
    }
  };

  // Form State for Create / Edit
  const [formName, setFormName] = useState('');
  const [formLegalName, setFormLegalName] = useState('');
  const [formTypes, setFormTypes] = useState<string[]>(['Rental agency']);
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCountry, setFormCountry] = useState('Morocco');
  const [formCity, setFormCity] = useState('Casablanca');
  const [formPlanId, setFormPlanId] = useState<SubscriptionPlanId>('professional');
  const [formStatus, setFormStatus] = useState<'active' | 'suspended' | 'pending'>('active');
  const [formVehicleLimit, setFormVehicleLimit] = useState(50);
  const [formUserLimit, setFormUserLimit] = useState(10);
  const [formTrackerLimit, setFormTrackerLimit] = useState(50);
  const [formRetentionDays, setFormRetentionDays] = useState(365);
  const [formModules, setFormModules] = useState<EnabledModules>({
    car_rental: true,
    fuel_intelligence: true,
    cold_chain: false,
    live_sharing: true,
    predictive_maintenance: true
  });
  const [formCustomTypeInput, setFormCustomTypeInput] = useState('');

  // Collect all unique organization types dynamically from orgs + availableTypes
  const allDynamicTypes = Array.from(
    new Set([
      ...availableTypes,
      ...organizations.flatMap((o) => o.types || [])
    ])
  );

  // Visible organizations based on RBAC: Super Admin sees all, non-super-admin only sees assigned org
  const visibleOrganizations = isSuperAdmin
    ? organizations
    : organizations.filter((org) => org.id === currentUser?.organizationId || org.id === selectedOrgId);

  // Synchronized detail target organization
  const currentDetailOrg = selectedDetailOrg
    ? organizations.find((o) => o.id === selectedDetailOrg.id) || selectedDetailOrg
    : null;

  // Filter organizations
  const filteredOrganizations = visibleOrganizations.filter((org) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = org.name.toLowerCase().includes(q);
      const matchLegal = org.legalName.toLowerCase().includes(q);
      const matchCity = org.city.toLowerCase().includes(q);
      const matchEmail = org.email.toLowerCase().includes(q);
      const matchType = (org.types || []).some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchLegal && !matchCity && !matchEmail && !matchType) return false;
    }

    // Type filter
    if (selectedTypeFilter !== 'all') {
      const orgTypes = org.types || [];
      if (!orgTypes.includes(selectedTypeFilter)) return false;
    }

    // Plan filter
    if (selectedPlanFilter !== 'all' && org.planId !== selectedPlanFilter) {
      return false;
    }

    // Status filter
    if (selectedStatusFilter !== 'all' && org.status !== selectedStatusFilter) {
      return false;
    }

    return true;
  });

  // Open Create Modal with clean defaults
  const handleOpenCreateModal = () => {
    setFormName('');
    setFormLegalName('');
    setFormTypes(['Rental agency']);
    setFormEmail('');
    setFormPhone('+212 522 00 00 00');
    setFormCountry('Morocco');
    setFormCity('Casablanca');
    setFormPlanId('professional');
    setFormStatus('active');
    setFormVehicleLimit(50);
    setFormUserLimit(10);
    setFormTrackerLimit(50);
    setFormRetentionDays(365);
    setFormModules({
      car_rental: true,
      fuel_intelligence: true,
      cold_chain: false,
      live_sharing: true,
      predictive_maintenance: true
    });
    setFormCustomTypeInput('');
    setShowCreateModal(true);
  };

  // Open Edit Modal with existing org values
  const handleOpenEditModal = (org: Organization) => {
    setEditingOrg(org);
    setFormName(org.name);
    setFormLegalName(org.legalName);
    setFormTypes(org.types && org.types.length > 0 ? org.types : ['Transport company']);
    setFormEmail(org.email);
    setFormPhone(org.phone);
    setFormCountry(org.country);
    setFormCity(org.city);
    setFormPlanId(org.planId);
    setFormStatus(org.status);
    setFormVehicleLimit(org.subscription.vehicleLimit);
    setFormUserLimit(org.subscription.userLimit);
    setFormTrackerLimit(org.subscription.trackerLimit);
    setFormRetentionDays(org.subscription.historyRetentionDays);
    setFormModules(
      org.enabledModules || {
        car_rental: (org.types || []).includes('Rental agency'),
        fuel_intelligence: true,
        cold_chain: false,
        live_sharing: false,
        predictive_maintenance: false
      }
    );
    setFormCustomTypeInput('');
  };

  // Toggle type in form
  const handleToggleFormType = (type: string) => {
    setFormTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev; // Keep at least one type
        const next = prev.filter((t) => t !== type);
        // If 'Rental agency' was removed, lock car_rental module
        if (type === 'Rental agency') {
          setFormModules((m) => ({ ...m, car_rental: false }));
        }
        return next;
      } else {
        const next = [...prev, type];
        if (type === 'Rental agency') {
          setFormModules((m) => ({ ...m, car_rental: true }));
        }
        return next;
      }
    });
  };

  // Add custom type on the fly
  const handleAddCustomTypeToForm = () => {
    const trimmed = formCustomTypeInput.trim();
    if (!trimmed) return;
    if (!formTypes.includes(trimmed)) {
      setFormTypes((prev) => [...prev, trimmed]);
    }
    if (onAddType) {
      onAddType(trimmed);
    }
    setFormCustomTypeInput('');
  };

  // Submit Create Organization
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasRentalType = formTypes.includes('Rental agency');
    const newOrgId = `org_${formName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;

    const newOrg: Organization = {
      id: newOrgId,
      name: formName || 'New Organization',
      legalName: formLegalName || `${formName} SARL`,
      types: formTypes.length > 0 ? formTypes : ['Other'],
      email: formEmail || `contact@${formName.toLowerCase().replace(/\s+/g, '')}.ma`,
      phone: formPhone || '+212 522 00 00 00',
      country: formCountry || 'Morocco',
      city: formCity || 'Casablanca',
      timezone: 'Africa/Casablanca',
      locale: 'fr',
      status: formStatus,
      planId: formPlanId,
      subscription: {
        id: `sub_${Date.now()}`,
        planId: formPlanId,
        planName: formPlanId === 'enterprise' ? 'Enterprise Custom' : formPlanId === 'professional' ? 'Professional Fleet' : 'Basic Starter',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        daysRemaining: 365,
        vehicleLimit: Number(formVehicleLimit) || 50,
        userLimit: Number(formUserLimit) || 10,
        trackerLimit: Number(formTrackerLimit) || 50,
        fleetLimit: 5,
        historyRetentionDays: Number(formRetentionDays) || 365
      },
      stats: {
        totalVehicles: 0,
        activeVehicles: 0,
        totalTrackers: 0,
        totalUsers: 1,
        totalFleets: 1
      },
      enabledModules: {
        ...formModules,
        car_rental: hasRentalType ? formModules.car_rental : false
      },
      createdAt: new Date().toISOString()
    };

    if (onAddOrg) {
      onAddOrg(newOrg);
    }
    setShowCreateModal(false);
  };

  // Submit Edit Organization
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;

    const hasRentalType = formTypes.includes('Rental agency');

    const updated: Organization = {
      ...editingOrg,
      name: formName,
      legalName: formLegalName,
      types: formTypes.length > 0 ? formTypes : ['Other'],
      email: formEmail,
      phone: formPhone,
      country: formCountry,
      city: formCity,
      status: formStatus,
      planId: formPlanId,
      subscription: {
        ...editingOrg.subscription,
        planId: formPlanId,
        planName: formPlanId === 'enterprise' ? 'Enterprise Custom' : formPlanId === 'professional' ? 'Professional Fleet' : 'Basic Starter',
        vehicleLimit: Number(formVehicleLimit),
        userLimit: Number(formUserLimit),
        trackerLimit: Number(formTrackerLimit),
        historyRetentionDays: Number(formRetentionDays)
      },
      enabledModules: {
        ...formModules,
        car_rental: hasRentalType ? formModules.car_rental : false
      }
    };

    if (onUpdateOrg) {
      onUpdateOrg(updated);
    }
    setEditingOrg(null);
  };

  // Delete Organization
  const handleConfirmDelete = () => {
    if (!deletingOrg) return;
    if (onDeleteOrg) {
      onDeleteOrg(deletingOrg.id);
    }
    setDeletingOrg(null);
  };

  // Toggle Module directly from card
  const handleToggleModuleQuick = (org: Organization, moduleKey: ModuleKey) => {
    const isRental = moduleKey === 'car_rental';
    const orgTypes = org.types || [];
    const hasRentalType = orgTypes.includes('Rental agency');

    if (isRental && !hasRentalType) {
      alert("Rent-Vehicle Module cannot be unlocked: Organization must have the 'Rental agency' Type. Please edit the organization to add this type first.");
      return;
    }

    const current = org.enabledModules?.[moduleKey] || false;
    if (onToggleModule) {
      onToggleModule(org.id, moduleKey, !current);
    }
  };

  // Add new type to system
  const handleAddNewSystemType = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTypeInput.trim();
    if (!trimmed) return;
    if (onAddType) {
      onAddType(trimmed);
    }
    setNewTypeInput('');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12" id="organizations-crud-view">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900/60 rounded-[32px] p-6 lg:p-8 border border-slate-200 dark:border-zinc-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-sm dark:shadow-2xl backdrop-blur-md">
        <div className="border-l-4 border-emerald-500 pl-4 py-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border ${
              isSuperAdmin
                ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
            }`}>
              {isSuperAdmin ? 'Super Admin Control Plane' : 'Assigned Workspace Profile'}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold font-mono">
              {isSuperAdmin ? 'Multi-Tenant Governance & Licensing' : 'Single-Tenant Workspace Quotas'}
            </span>
          </div>
          <h1 className="text-3xl font-black italic tracking-tight text-slate-900 dark:text-white">
            {isSuperAdmin ? `${t.nav.organizations} & Tenant Governance` : 'My Organization & Subscription'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl">
            {isSuperAdmin
              ? 'Create, update, and manage all tenant organizations. Super Admin can switch workspaces freely, affect organizations to owners or limited profile users, and configure module licenses.'
              : `Your account is assigned to ${visibleOrganizations[0]?.name || 'your designated organization'}. View your subscription quotas, vehicle limits, and active modules.`}
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowTypeManagerModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-slate-700 hover:text-slate-900 dark:text-zinc-200 dark:hover:text-white font-semibold text-xs border border-slate-300 dark:border-zinc-700 transition-all shadow-xs"
            >
              <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Manage Types ({allDynamicTypes.length})</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>New Organization</span>
            </button>
          </div>
        )}
      </div>

      {/* Type Rule Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200/90">
        <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-800 dark:text-amber-300">Conditional Module Rule:</span> An organization can have one or more types (e.g.,{' '}
          <span className="font-mono bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-semibold">Rental agency</span>,{' '}
          <span className="font-mono bg-blue-500/20 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded font-semibold">Transport company</span>,{' '}
          <span className="font-mono bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 px-1.5 py-0.5 rounded font-semibold">Other</span>). Only organizations assigned the{' '}
          <strong className="text-slate-900 dark:text-white">Rental agency</strong> type are eligible to have the <strong className="text-slate-900 dark:text-white">Rent-Vehicle Module</strong> (reservations, anti-theft relay, rental fleet catalog) unlocked for their workspace.
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-zinc-950/80 rounded-2xl p-4 border border-slate-200 dark:border-zinc-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs dark:shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search organizations by name, legal entity, city, email, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white text-xs font-medium outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">All Types ({organizations.length})</option>
              {allDynamicTypes.map((t) => (
                <option key={t} value={t} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                  {t} ({organizations.filter((o) => (o.types || []).includes(t)).length})
                </option>
              ))}
            </select>
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
            <select
              value={selectedPlanFilter}
              onChange={(e) => setSelectedPlanFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white text-xs font-medium outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">All Subscription Plans</option>
              <option value="basic" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Basic Starter</option>
              <option value="professional" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Professional Fleet</option>
              <option value="enterprise" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Enterprise Custom</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white text-xs font-medium outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">All Statuses</option>
              <option value="active" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Active</option>
              <option value="suspended" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Suspended</option>
              <option value="pending" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizations.map((org) => {
          const isSelected = org.id === selectedOrgId;
          const orgTypes = org.types && org.types.length > 0 ? org.types : ['Transport company'];
          const hasRentalType = orgTypes.includes('Rental agency');
          const isRentalUnlocked = hasRentalType && !!org.enabledModules?.car_rental;

          return (
            <div
              key={org.id}
              onClick={() => {
                setSelectedDetailOrg(org);
                setDetailActiveTab('overview');
              }}
              className={`p-6 rounded-[28px] border transition-all flex flex-col justify-between shadow-xs dark:shadow-2xl relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:border-emerald-500/60 dark:hover:border-emerald-500/50 transform hover:-translate-y-1 duration-200 ${
                isSelected
                  ? 'bg-white dark:bg-zinc-900/90 border-emerald-500/60 ring-2 ring-emerald-500/20 text-slate-900 dark:text-white'
                  : 'bg-white dark:bg-zinc-950/70 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
              }`}
            >
              {/* Top Accent Stripe */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  hasRentalType
                    ? 'bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                }`}
              />

              <div>
                {/* Header Pills */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-zinc-700 font-bold">
                      {org.subscription.planName}
                    </span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                        org.status === 'active'
                          ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : org.status === 'suspended'
                          ? 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {org.status}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Check className="w-3 h-3" />
                      Active Scope
                    </span>
                  )}
                </div>

                {/* Org Title & Legal */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {org.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium truncate mt-0.5">{org.legalName}</p>
                  </div>
                  <span
                    className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-all shrink-0"
                    title="Click to view full details"
                  >
                    <Eye className="w-4 h-4" />
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-slate-400 dark:text-zinc-500 shrink-0" />
                  <span>{org.city}, {org.country}</span>
                </p>

                {/* Organization Types Tags */}
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-bold mr-1">Types:</span>
                  {orgTypes.map((type) => {
                    const isRental = type === 'Rental agency';
                    const isTransport = type === 'Transport company';
                    return (
                      <span
                        key={type}
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
                          isRental
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold'
                            : isTransport
                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30'
                            : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30'
                        }`}
                      >
                        {isRental && <KeyRound className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />}
                        {type}
                      </span>
                    );
                  })}
                </div>

                {/* Rent-Vehicle Module Interlock Status Card */}
                <div
                  className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    isRentalUnlocked
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                      : hasRentalType
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500/30 text-amber-800 dark:text-amber-200'
                      : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isRentalUnlocked
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : hasRentalType
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500'
                      }`}
                    >
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1">
                        <span>Rent-Vehicle Module</span>
                        {isRentalUnlocked ? (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/20 px-1.5 rounded">
                            Unlocked & Active
                          </span>
                        ) : hasRentalType ? (
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/20 px-1.5 rounded">
                            Locked (Eligible)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 bg-slate-200 dark:bg-zinc-800 px-1.5 rounded">
                            Locked (No Rental Type)
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] opacity-80 mt-0.5">
                        {hasRentalType
                          ? isRentalUnlocked
                            ? 'Reservations, catalog & anti-theft relay active'
                            : "Type allows unlock. Click switch to enable."
                          : "Requires 'Rental agency' type to unlock"}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Module Button (Super Admin) */}
                  {hasRentalType ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleModuleQuick(org, 'car_rental');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                        isRentalUnlocked
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-xs'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                    >
                      {isRentalUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{isRentalUnlocked ? 'Lock' : 'Unlock'}</span>
                    </button>
                  ) : (
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-zinc-800/80 px-2 py-1 rounded-md">
                      <Lock className="w-3 h-3" />
                      <span>Restricted</span>
                    </div>
                  )}
                </div>

                {/* Quotas & Telematics Limits */}
                <div className="my-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-zinc-400 font-sans flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                      <span>Vehicle Quota:</span>
                    </span>
                    <span className="text-slate-900 dark:text-white font-bold">
                      {org.stats.totalVehicles} / {org.subscription.vehicleLimit} Units
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-zinc-400 font-sans flex items-center gap-1.5">
                      <Cpu className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                      <span>Trackers Installed:</span>
                    </span>
                    <span className="text-slate-900 dark:text-white font-bold">
                      {org.stats.totalTrackers} / {org.subscription.trackerLimit} Devices
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-zinc-400 font-sans flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                      <span>License Remaining:</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {org.subscription.daysRemaining} Days
                    </span>
                  </div>
                </div>

                {/* Enabled Modules Badges */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/60 flex flex-wrap items-center gap-1 text-[10px]">
                  <span className="text-slate-400 dark:text-zinc-500 font-sans mr-1">Modules:</span>
                  {org.enabledModules?.car_rental && (
                    <span className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono">
                      Rental
                    </span>
                  )}
                  {org.enabledModules?.fuel_intelligence && (
                    <span className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 px-1.5 py-0.5 rounded font-mono">
                      Fuel
                    </span>
                  )}
                  {org.enabledModules?.cold_chain && (
                    <span className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono">
                      Reefer
                    </span>
                  )}
                  {org.enabledModules?.live_sharing && (
                    <span className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono">
                      ETA
                    </span>
                  )}
                  {org.enabledModules?.predictive_maintenance && (
                    <span className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono">
                      OBD-II
                    </span>
                  )}
                </div>

                {/* Clickable Card Affordance */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Click card to inspect full details & quotas</span>
                  </span>
                  <span className="flex items-center gap-0.5 font-bold">
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                {isSuperAdmin ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrg(org.id);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-md shadow-purple-500/20'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 hover:text-slate-900 dark:text-zinc-200 dark:hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Currently Monitored' : 'Switch Organization'}
                    </button>

                    {/* Edit Organization Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(org);
                      }}
                      title="Edit Organization Details, Types & Quotas"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white transition-colors border border-slate-200 dark:border-transparent"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Organization Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingOrg(org);
                      }}
                      title="Delete Organization"
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors border border-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Your Assigned Organization</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(org);
                      }}
                      title="Edit Company Contact Info"
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 hover:text-slate-900 dark:text-zinc-200 dark:hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-transparent"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Contact Info</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrganizations.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-zinc-900/30 rounded-3xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 shadow-xs">
          <Building2 className="w-12 h-12 text-slate-400 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No organizations match your filters</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">Try resetting the search query or organization type filters.</p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / EDIT ORGANIZATION (CRUD) */}
      {/* ========================================================================= */}
      {(showCreateModal || editingOrg) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 dark:bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-[96vw] xl:max-w-7xl h-[92vh] max-h-[95vh] shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header (Fixed) */}
            <div className="px-6 py-4.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-zinc-950/70">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {editingOrg ? `Edit Tenant: ${editingOrg.name}` : 'Create New Organization Tenant'}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        editingOrg
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                      }`}
                    >
                      {editingOrg ? 'Tenant Management' : 'New Tenant Onboarding'}
                    </span>
                    {editingOrg && (
                      <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        {editingOrg.id}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {editingOrg
                      ? 'Update corporate identity, telematics capacity quotas, subscription tier, and feature module permissions.'
                      : 'Define corporate profile, operational industry categories, telematics limits, and subscription module permissions.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingOrg(null);
                  }}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Form (Full Height Flex) */}
            <form onSubmit={editingOrg ? handleEditSubmit : handleCreateSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-7">
                {/* ------------------------------------------------------------- */}
                {/* 1. CORPORATE IDENTITY & CONTACT DETAILS */}
                {/* ------------------------------------------------------------- */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                        1. Company Identity & Contact Details
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">Legal entity & contact profile</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Organization Public Name *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Oasis Mobility & Logistics Morocco"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span>Legal Business Entity *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Oasis Car Hire & Mobility SARL"
                        value={formLegalName}
                        onChange={(e) => setFormLegalName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>Primary Dispatch & Billing Email *</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="contact@agency.ma"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Telephone Contact</span>
                      </label>
                      <input
                        type="text"
                        placeholder="+212 522 99 11 22"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>City / Fleet Hub Base</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Casablanca"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>Country</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Morocco"
                        value={formCountry}
                        onChange={(e) => setFormCountry(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 2. INDUSTRY CATEGORIES & OPERATIONAL ACTIVITIES */}
                {/* ------------------------------------------------------------- */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-indigo-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                        2. Industry Categories & Operational Activities
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      {formTypes.length} {formTypes.length === 1 ? 'Category' : 'Categories'} Selected
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-3.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-xs text-slate-600 dark:text-zinc-400">
                        Select all applicable operational sectors for this tenant. Choosing{' '}
                        <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          Rental agency
                        </span>{' '}
                        automatically enables eligibility for the Car Rental & Remote Relay Cut-Off module.
                      </p>
                    </div>

                    {/* Interactive Type Chips */}
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {allDynamicTypes.map((type) => {
                        const isSelected = formTypes.includes(type);
                        const isRental = type === 'Rental agency';
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleToggleFormType(type)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                              isSelected
                                ? isRental
                                  ? 'bg-amber-500 text-black border-amber-400 shadow-sm font-bold scale-[1.02]'
                                  : 'bg-emerald-500 text-black border-emerald-400 shadow-sm font-bold scale-[1.02]'
                                : 'bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            {isRental && <KeyRound className="w-3.5 h-3.5" />}
                            <span>{type}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Add Custom Type Inline */}
                    <div className="pt-3 flex items-center gap-2.5 border-t border-slate-200 dark:border-zinc-800/80">
                      <input
                        type="text"
                        placeholder="Add custom industry activity (e.g. Airport Shuttle, Peer-to-Peer Carsharing, Food Delivery Fleet)..."
                        value={formCustomTypeInput}
                        onChange={(e) => setFormCustomTypeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomTypeToForm();
                          }
                        }}
                        className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTypeToForm}
                        className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold border border-slate-300 dark:border-zinc-700 transition-colors shrink-0"
                      >
                        + Add Category
                      </button>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 3. SUBSCRIPTION PLAN, STATUS & RESOURCE QUOTAS */}
                {/* ------------------------------------------------------------- */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                        3. Subscription Tier, Status & Resource Quotas
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">Capacity & billing parameters</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left: Plan Tier & Tenant Status */}
                    <div className="lg:col-span-5 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                          Subscription Tier
                        </label>
                        <select
                          value={formPlanId}
                          onChange={(e) => setFormPlanId(e.target.value as SubscriptionPlanId)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-semibold transition-all"
                        >
                          <option value="basic">Basic Starter ($49/mo - up to 10 vehicles)</option>
                          <option value="professional">Professional Fleet ($189/mo - up to 100 vehicles)</option>
                          <option value="enterprise">Enterprise Custom ($499/mo - up to 500 vehicles)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                          Tenant Account Status
                        </label>
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-semibold transition-all"
                        >
                          <option value="active">Active (Full Live Telematics Access)</option>
                          <option value="suspended">Suspended (Billing / Regulatory Review)</option>
                          <option value="pending">Pending Onboarding</option>
                        </select>
                      </div>
                    </div>

                    {/* Right: Quota Allocations in Bento Grid */}
                    <div className="lg:col-span-7">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 h-full flex items-center">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                            Vehicle Limit
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={formVehicleLimit}
                            onChange={(e) => setFormVehicleLimit(Number(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 block">Vehicles in fleet</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                            User Seats
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={formUserLimit}
                            onChange={(e) => setFormUserLimit(Number(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 block">Dispatchers & users</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                            Tracker Limit
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={formTrackerLimit}
                            onChange={(e) => setFormTrackerLimit(Number(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 block">Hardware devices</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                            Retention (Days)
                          </label>
                          <input
                            type="number"
                            min={30}
                            value={formRetentionDays}
                            onChange={(e) => setFormRetentionDays(Number(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 block">Trip GPS archive</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 4. ADD-ON FEATURE MODULES & PERMISSIONS */}
                {/* ------------------------------------------------------------- */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                        4. Add-On Feature Modules & Permissions
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {Object.values(formModules).filter(Boolean).length} of 5 Modules Unlocked
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {/* Module 1: Car Rental & Relay */}
                    <div
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        formTypes.includes('Rental agency')
                          ? formModules.car_rental
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
                          : 'bg-slate-100 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800/40 opacity-70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                            <KeyRound className="w-4 h-4" />
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              formTypes.includes('Rental agency')
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'
                            }`}
                          >
                            {formTypes.includes('Rental agency') ? 'Eligible' : "Needs 'Rental agency'"}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">Car Rental & Relay Cut-Off</h5>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                          Contract lifecycle, digital check-in/out, damage marks, security deposit ledger, and GPRS remote starter cut-off (&lt; 20 km/h).
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {formModules.car_rental && formTypes.includes('Rental agency') ? 'Active for tenant' : 'Locked'}
                        </span>
                        <button
                          type="button"
                          disabled={!formTypes.includes('Rental agency')}
                          onClick={() => setFormModules((m) => ({ ...m, car_rental: !m.car_rental }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            formModules.car_rental && formTypes.includes('Rental agency')
                              ? 'bg-amber-500 text-black shadow-sm'
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {formModules.car_rental && formTypes.includes('Rental agency') ? 'Unlocked' : 'Locked'}
                        </button>
                      </div>
                    </div>

                    {/* Module 2: Fuel Intelligence */}
                    <div
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        formModules.fuel_intelligence
                          ? 'bg-rose-500/10 border-rose-500/30'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                            <Fuel className="w-4 h-4" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                            Anti-Theft
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">Fuel Theft & Refuel Radar</h5>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                          Ultrasonic & CAN-bus capacitive probe telemetry, real-time siphoning alarms, refuel verification, and consumption analytics.
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {formModules.fuel_intelligence ? 'Active for tenant' : 'Locked'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormModules((m) => ({ ...m, fuel_intelligence: !m.fuel_intelligence }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            formModules.fuel_intelligence
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {formModules.fuel_intelligence ? 'Unlocked' : 'Locked'}
                        </button>
                      </div>
                    </div>

                    {/* Module 3: Cold Chain */}
                    <div
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        formModules.cold_chain
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                            <Snowflake className="w-4 h-4" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
                            HACCP
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">Cold Chain & Temperature Probes</h5>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                          Dual-compartment (chilled & deep-freeze) sensors, HACCP compliance logs, temperature excursion alerts, and door status.
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {formModules.cold_chain ? 'Active for tenant' : 'Locked'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormModules((m) => ({ ...m, cold_chain: !m.cold_chain }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            formModules.cold_chain
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {formModules.cold_chain ? 'Unlocked' : 'Locked'}
                        </button>
                      </div>
                    </div>

                    {/* Module 4: Live Sharing */}
                    <div
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        formModules.live_sharing
                          ? 'bg-indigo-500/10 border-indigo-500/30'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                            <Share2 className="w-4 h-4" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                            Live ETA
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">Customer Live ETA & e-POD</h5>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                          Public customer tracking links, dynamic ETA recalculation, geofence arrival notifications, and electronic proof-of-delivery (e-POD).
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {formModules.live_sharing ? 'Active for tenant' : 'Locked'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormModules((m) => ({ ...m, live_sharing: !m.live_sharing }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            formModules.live_sharing
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {formModules.live_sharing ? 'Unlocked' : 'Locked'}
                        </button>
                      </div>
                    </div>

                    {/* Module 5: Predictive Maintenance */}
                    <div
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        formModules.predictive_maintenance
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            Workshop
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">Predictive Maintenance Hub</h5>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                          Telemetry-driven service intervals (engine oil, brakes, timing belts), workshop repair logs, and parts expense management.
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {formModules.predictive_maintenance ? 'Active for tenant' : 'Locked'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormModules((m) => ({ ...m, predictive_maintenance: !m.predictive_maintenance }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            formModules.predictive_maintenance
                              ? 'bg-emerald-500 text-black shadow-sm font-extrabold'
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {formModules.predictive_maintenance ? 'Unlocked' : 'Locked'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer with Live Summary (Fixed Bottom Bar) */}
              <div className="px-6 py-4 bg-slate-50/90 dark:bg-zinc-950/90 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formName.trim() ? formName : 'New Organization'}
                  </span>
                  <span className="text-slate-300 dark:text-zinc-700">•</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px]">
                    {formPlanId}
                  </span>
                  <span className="text-slate-300 dark:text-zinc-700">•</span>
                  <span className="text-slate-500 dark:text-zinc-400">
                    {formVehicleLimit} Vehicles • {formUserLimit} Seats • {formTrackerLimit} Trackers • {formRetentionDays}d Retention
                  </span>
                  <span className="text-slate-300 dark:text-zinc-700">•</span>
                  <span className="text-slate-500 dark:text-zinc-400">
                    {Object.values(formModules).filter(Boolean).length} of 5 modules active
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingOrg(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 hover:text-slate-900 dark:text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingOrg ? 'Save Organization Changes' : 'Create Organization Tenant'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MANAGE ORGANIZATION TYPES */}
      {/* ========================================================================= */}
      {showTypeManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Manage Organization Types</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Define industry categories and module eligibility rules
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTypeManagerModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Type Form */}
            <form onSubmit={handleAddNewSystemType} className="mb-5 space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Add New Organization Type
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Airport Shuttle, Peer-to-Peer Carsharing..."
                  value={newTypeInput}
                  onChange={(e) => setNewTypeInput(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  + Add Type
                </button>
              </div>
            </form>

            {/* Existing Types List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              <div className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Active Organization Types ({allDynamicTypes.length})
              </div>
              {allDynamicTypes.map((type) => {
                const orgCount = organizations.filter((o) => (o.types || []).includes(type)).length;
                const isRental = type === 'Rental agency';
                const isTransport = type === 'Transport company';

                return (
                  <div
                    key={type}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isRental
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            : isTransport
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                            : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                        }`}
                      >
                        {isRental ? <KeyRound className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{type}</span>
                          {isRental && (
                            <span className="text-[9px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 rounded">
                              Unlocks Rent-Vehicle Module
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-500">
                          {orgCount} {orgCount === 1 ? 'tenant organization' : 'tenant organizations'}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-2 py-1 rounded-md border border-slate-200 dark:border-transparent">
                      {orgCount} Orgs
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowTypeManagerModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 hover:text-slate-900 dark:text-white font-bold text-xs transition-colors"
              >
                Close Type Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE ORGANIZATION CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Tenant Organization?</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{deletingOrg.name}</strong> ({deletingOrg.legalName})? This will remove all associated fleet telemetry, vehicle reservations, and user permissions for this tenant scope.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300">
              This action cannot be undone. All active GPS trackers and reservations will be archived.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingOrg(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 hover:text-slate-900 dark:text-zinc-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all"
              >
                Confirm Delete Organization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: COMPREHENSIVE ORGANIZATION DETAILS MODAL */}
      {/* ========================================================================= */}
      {currentDetailOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 dark:bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-[96vw] xl:max-w-7xl h-[92vh] max-h-[95vh] shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white">
            {/* FIXED HEADER */}
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-zinc-950/70 shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0 shadow-xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                      {currentDetailOrg.name}
                    </h2>
                    <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-lg bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                      {currentDetailOrg.subscription.planName}
                    </span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                        currentDetailOrg.status === 'active'
                          ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : currentDetailOrg.status === 'suspended'
                          ? 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {currentDetailOrg.status}
                    </span>
                    {currentDetailOrg.id === selectedOrgId && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-white bg-emerald-500 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Check className="w-3 h-3" />
                        Active Scope
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    <span className="truncate">{currentDetailOrg.legalName}</span>
                    <span className="text-slate-300 dark:text-zinc-700">•</span>
                    <button
                      onClick={(e) => handleCopyOrgId(currentDetailOrg.id, e)}
                      className="flex items-center gap-1 text-[11px] font-mono hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      title="Click to copy organization ID"
                    >
                      <span>ID: {currentDetailOrg.id}</span>
                      {copiedOrgId ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {isSuperAdmin && currentDetailOrg.id !== selectedOrgId && (
                  <button
                    onClick={() => {
                      onSelectOrg(currentDetailOrg.id);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20 flex items-center gap-1.5"
                  >
                    <span>Switch Active Scope</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    handleOpenEditModal(currentDetailOrg);
                    setSelectedDetailOrg(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 hover:text-slate-900 dark:text-zinc-200 dark:hover:text-white font-bold text-xs transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-transparent"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isSuperAdmin ? 'Edit Organization' : 'Edit Contact Info'}</span>
                </button>

                <button
                  onClick={() => setSelectedDetailOrg(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                  title="Close details modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* STICKY TAB NAVIGATION BAR */}
            <div className="px-6 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] flex items-center gap-2 overflow-x-auto shrink-0">
              <button
                onClick={() => setDetailActiveTab('overview')}
                className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                  detailActiveTab === 'overview'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Overview & Profile</span>
              </button>

              <button
                onClick={() => setDetailActiveTab('quotas')}
                className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                  detailActiveTab === 'quotas'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Quotas & Licensing</span>
              </button>

              <button
                onClick={() => setDetailActiveTab('modules')}
                className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                  detailActiveTab === 'modules'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Add-On Feature Modules</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono">
                  {Object.values(currentDetailOrg.enabledModules || {}).filter(Boolean).length}/5
                </span>
              </button>

              <button
                onClick={() => setDetailActiveTab('telematics')}
                className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                  detailActiveTab === 'telematics'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Connected Fleet & Actions</span>
              </button>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* TAB 1: OVERVIEW & PROFILE */}
              {detailActiveTab === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Corporate & Identity Grid */}
                  <div className="bg-slate-50 dark:bg-zinc-900/40 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800">
                    <h3 className="text-xs uppercase font-mono tracking-wider text-slate-500 dark:text-zinc-400 font-bold mb-4 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-500" />
                      <span>Corporate & Operational Identity</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                      <div className="p-3 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1">Commercial Brand Name</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{currentDetailOrg.name}</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1">Legal Corporate Entity</span>
                        <span className="font-bold text-slate-900 dark:text-white">{currentDetailOrg.legalName}</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>Operations & Billing Email</span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white truncate block">{currentDetailOrg.email}</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>Dispatch Phone Number</span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{currentDetailOrg.phone}</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>Fleet Operations Hub</span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{currentDetailOrg.city}, {currentDetailOrg.country}</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Operating Timezone</span>
                        </span>
                        <span className="font-bold font-mono text-slate-900 dark:text-white">{currentDetailOrg.timezone || 'Africa/Casablanca'}</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>Default Platform Locale</span>
                        </span>
                        <span className="font-bold uppercase font-mono text-slate-900 dark:text-white">{currentDetailOrg.locale || 'en'}</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Account Onboarded</span>
                        </span>
                        <span className="font-bold font-mono text-slate-900 dark:text-white">
                          {new Date(currentDetailOrg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Industry Categories & Operational Scope */}
                  <div className="bg-slate-50 dark:bg-zinc-900/40 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs uppercase font-mono tracking-wider text-slate-500 dark:text-zinc-400 font-bold flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-500" />
                        <span>Industry Categories & Operational Capabilities</span>
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-zinc-400">
                        {(currentDetailOrg.types || []).length} assigned industry scope(s)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(currentDetailOrg.types || ['Transport company']).map((type) => {
                        const isRental = type === 'Rental agency';
                        const isTransport = type === 'Transport company';
                        const isLogistics = type === 'Logistics & Freight';

                        return (
                          <div
                            key={type}
                            className={`p-4 rounded-xl border flex flex-col justify-between gap-2 ${
                              isRental
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
                                : isTransport
                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-950 dark:text-blue-100'
                                : isLogistics
                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-950 dark:text-indigo-100'
                                : 'bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-sm flex items-center gap-2">
                                {isRental ? (
                                  <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                ) : isTransport ? (
                                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                )}
                                <span>{type}</span>
                              </span>
                              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-white/60 dark:bg-black/30 border border-current/20">
                                Active Type
                              </span>
                            </div>

                            <p className="text-xs opacity-85 leading-relaxed">
                              {isRental
                                ? 'Unlocks the Car Rental module, digital reservation lifecycle, vehicle damage audits, security deposits, and remote GPRS starter immobilizer cut-off.'
                                : isTransport
                                ? 'Enables long-haul logistics telematics, driver shift time tracking, highway fuel consumption baselines, and commercial vehicle maintenance schedules.'
                                : isLogistics
                                ? 'Supports route dispatch optimization, electronic Proof-of-Delivery (e-POD) sign-on-glass, and customer live ETA tracking.'
                                : 'Tailored fleet telematics parameters and operational permissions configured for this organization classification.'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Telematics Utilization Gauges */}
                  <div className="bg-slate-50 dark:bg-zinc-900/40 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800">
                    <h3 className="text-xs uppercase font-mono tracking-wider text-slate-500 dark:text-zinc-400 font-bold mb-4 flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-emerald-500" />
                      <span>Live Telematics Quota Utilization</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Vehicle Capacity */}
                      <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-200 dark:border-zinc-800/80">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
                          <span className="font-semibold flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Fleet Vehicles</span>
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {Math.round((currentDetailOrg.stats.totalVehicles / currentDetailOrg.subscription.vehicleLimit) * 100)}%
                          </span>
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          {currentDetailOrg.stats.totalVehicles}
                          <span className="text-xs font-normal text-slate-400 dark:text-zinc-500 ml-1">
                            / {currentDetailOrg.subscription.vehicleLimit} max
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (currentDetailOrg.stats.totalVehicles / currentDetailOrg.subscription.vehicleLimit) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 block font-medium">
                          {currentDetailOrg.stats.activeVehicles} vehicles currently moving on road
                        </span>
                      </div>

                      {/* GPS Trackers */}
                      <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-200 dark:border-zinc-800/80">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
                          <span className="font-semibold flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-blue-500" />
                            <span>GPS Hardware</span>
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {Math.round((currentDetailOrg.stats.totalTrackers / currentDetailOrg.subscription.trackerLimit) * 100)}%
                          </span>
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          {currentDetailOrg.stats.totalTrackers}
                          <span className="text-xs font-normal text-slate-400 dark:text-zinc-500 ml-1">
                            / {currentDetailOrg.subscription.trackerLimit} devices
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (currentDetailOrg.stats.totalTrackers / currentDetailOrg.subscription.trackerLimit) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 block font-medium">
                          Teltonika, Queclink & Concox active
                        </span>
                      </div>

                      {/* User Dispatcher Seats */}
                      <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-200 dark:border-zinc-800/80">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
                          <span className="font-semibold flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-purple-500" />
                            <span>User Seats (RBAC)</span>
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {Math.round((currentDetailOrg.stats.totalUsers / currentDetailOrg.subscription.userLimit) * 100)}%
                          </span>
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          {currentDetailOrg.stats.totalUsers}
                          <span className="text-xs font-normal text-slate-400 dark:text-zinc-500 ml-1">
                            / {currentDetailOrg.subscription.userLimit} seats
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (currentDetailOrg.stats.totalUsers / currentDetailOrg.subscription.userLimit) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 block font-medium">
                          Admins, Dispatchers & Operators
                        </span>
                      </div>

                      {/* Fleet Sub-Divisions */}
                      <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-200 dark:border-zinc-800/80">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
                          <span className="font-semibold flex items-center gap-1.5">
                            <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                            <span>Sub-Fleet Groups</span>
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {currentDetailOrg.stats.totalFleets} Groups
                          </span>
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          {currentDetailOrg.stats.totalFleets}
                          <span className="text-xs font-normal text-slate-400 dark:text-zinc-500 ml-1">
                            / {currentDetailOrg.subscription.fleetLimit} limit
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (currentDetailOrg.stats.totalFleets / currentDetailOrg.subscription.fleetLimit) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 block font-medium">
                          Departmental & regional sub-fleets
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: QUOTAS & LICENSING */}
              {detailActiveTab === 'quotas' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Plan Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-zinc-900 to-emerald-950 text-white border border-slate-800 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30 uppercase">
                            {currentDetailOrg.subscription.planId} Tier
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-200 text-xs font-mono">
                            Status: {currentDetailOrg.subscription.status}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">{currentDetailOrg.subscription.planName}</h3>
                        <p className="text-xs text-zinc-300 mt-1 max-w-xl leading-relaxed">
                          Enterprise telematics SLA with raw CAN-bus breadcrumb data ingestion, automated trip segmentation, and sub-second geofencing evaluations.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-right shrink-0">
                        <span className="text-[11px] text-zinc-400 uppercase tracking-wider block font-mono">License Validity</span>
                        <div className="text-2xl font-black text-emerald-400 mt-0.5">
                          {currentDetailOrg.subscription.daysRemaining} Days
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono mt-1 block">
                          {new Date(currentDetailOrg.subscription.startDate).toLocaleDateString()} → {new Date(currentDetailOrg.subscription.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quota Comparison Table */}
                  <div className="bg-slate-50 dark:bg-zinc-900/40 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800">
                    <h3 className="text-xs uppercase font-mono tracking-wider text-slate-500 dark:text-zinc-400 font-bold mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span>Subscribed Resource Allocations & Thresholds</span>
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-mono uppercase text-[10px]">
                            <th className="pb-3 font-bold">Resource / Feature</th>
                            <th className="pb-3 font-bold">Current Usage</th>
                            <th className="pb-3 font-bold">Plan Quota</th>
                            <th className="pb-3 font-bold">Available Headroom</th>
                            <th className="pb-3 font-bold">Utilization</th>
                            <th className="pb-3 font-bold text-right">Licensing Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
                          <tr>
                            <td className="py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>Registered Fleet Vehicles</span>
                            </td>
                            <td className="py-3 font-mono text-slate-900 dark:text-white font-bold">{currentDetailOrg.stats.totalVehicles} units</td>
                            <td className="py-3 font-mono text-slate-500 dark:text-zinc-400">{currentDetailOrg.subscription.vehicleLimit} units</td>
                            <td className="py-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              {currentDetailOrg.subscription.vehicleLimit - currentDetailOrg.stats.totalVehicles} units
                            </td>
                            <td className="py-3 w-40">
                              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full"
                                  style={{
                                    width: `${Math.min(100, (currentDetailOrg.stats.totalVehicles / currentDetailOrg.subscription.vehicleLimit) * 100)}%`
                                  }}
                                />
                              </div>
                            </td>
                            <td className="py-3 text-right">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                                In Quota
                              </span>
                            </td>
                          </tr>

                          <tr>
                            <td className="py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Cpu className="w-3.5 h-3.5 text-slate-400" />
                              <span>GPS Trackers & OBD Units</span>
                            </td>
                            <td className="py-3 font-mono text-slate-900 dark:text-white font-bold">{currentDetailOrg.stats.totalTrackers} devices</td>
                            <td className="py-3 font-mono text-slate-500 dark:text-zinc-400">{currentDetailOrg.subscription.trackerLimit} devices</td>
                            <td className="py-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              {currentDetailOrg.subscription.trackerLimit - currentDetailOrg.stats.totalTrackers} devices
                            </td>
                            <td className="py-3 w-40">
                              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-blue-500 h-full rounded-full"
                                  style={{
                                    width: `${Math.min(100, (currentDetailOrg.stats.totalTrackers / currentDetailOrg.subscription.trackerLimit) * 100)}%`
                                  }}
                                />
                              </div>
                            </td>
                            <td className="py-3 text-right">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                                In Quota
                              </span>
                            </td>
                          </tr>

                          <tr>
                            <td className="py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Shield className="w-3.5 h-3.5 text-slate-400" />
                              <span>User Accounts & Dispatcher Seats</span>
                            </td>
                            <td className="py-3 font-mono text-slate-900 dark:text-white font-bold">{currentDetailOrg.stats.totalUsers} seats</td>
                            <td className="py-3 font-mono text-slate-500 dark:text-zinc-400">{currentDetailOrg.subscription.userLimit} seats</td>
                            <td className="py-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              {currentDetailOrg.subscription.userLimit - currentDetailOrg.stats.totalUsers} seats
                            </td>
                            <td className="py-3 w-40">
                              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-purple-500 h-full rounded-full"
                                  style={{
                                    width: `${Math.min(100, (currentDetailOrg.stats.totalUsers / currentDetailOrg.subscription.userLimit) * 100)}%`
                                  }}
                                />
                              </div>
                            </td>
                            <td className="py-3 text-right">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                                In Quota
                              </span>
                            </td>
                          </tr>

                          <tr>
                            <td className="py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Raw Telematics & Sensor Retention</span>
                            </td>
                            <td className="py-3 font-mono text-slate-900 dark:text-white font-bold">
                              {currentDetailOrg.subscription.historyRetentionDays || 365} Days
                            </td>
                            <td className="py-3 font-mono text-slate-500 dark:text-zinc-400">
                              {currentDetailOrg.subscription.historyRetentionDays || 365} Days Max
                            </td>
                            <td className="py-3 font-mono text-slate-500 dark:text-zinc-400">Full 1-Sec Archive</td>
                            <td className="py-3 w-40">
                              <div className="w-full bg-emerald-500 h-2 rounded-full" />
                            </td>
                            <td className="py-3 text-right">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                                Active SLA
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Included Telematics Protocol Standards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-200 dark:border-zinc-800">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                        <Radio className="w-4 h-4 text-emerald-500" />
                        <span>Protocols & Protocols Ingest</span>
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                        Teltonika (FMB920, FMC130), Queclink (GL300, GV50), Concox/Jimi IoT, Ruptela, CalAmp TCP/UDP listeners enabled.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-200 dark:border-zinc-800">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                        <ShieldAlert className="w-4 h-4 text-blue-500" />
                        <span>Real-Time Alert Dispatch</span>
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                        Speeding thresholds, geofence breaches, battery disconnect alerts, tow detection, and crash G-sensor triggers.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-200 dark:border-zinc-800">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                        <FileText className="w-4 h-4 text-purple-500" />
                        <span>Automated Export & Compliance</span>
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                        PDF mileage summaries, XLSX driver work hour logs, HACCP cold chain temperature charts, and webhook feeds.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ADD-ON FEATURE MODULES */}
              {detailActiveTab === 'modules' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Modular Fleet Capabilities</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Manage active telematics extensions, customer links, and anti-theft immobilizers for {currentDetailOrg.name}.
                      </p>
                    </div>
                    {isSuperAdmin && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        Super Admin: Toggle extensions instantly below
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* MODULE 1: Car Rental & Relay Cut-Off */}
                    {(() => {
                      const hasRental = (currentDetailOrg.types || []).includes('Rental agency');
                      const isUnlocked = hasRental && !!currentDetailOrg.enabledModules?.car_rental;
                      return (
                        <div
                          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                            isUnlocked
                              ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30'
                              : 'bg-white dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                  <KeyRound className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Car Rental & Relay Cut-Off</h4>
                                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">Rental Agency Interlock</span>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                                  isUnlocked
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                    : hasRental
                                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500'
                                }`}
                              >
                                {isUnlocked ? 'Active' : hasRental ? 'Locked (Eligible)' : 'Restricted (Type)'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-2 leading-relaxed">
                              Complete rental business suite: digital check-in/out inspections with vehicle damage mapping, customer security deposit ledger, and hardware GPRS starter immobilizer relay cut-off (&lt; 20 km/h safe protocol).
                            </p>

                            <div className="mt-3 text-[11px] space-y-1 text-slate-500 dark:text-zinc-400">
                              <div className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-amber-500" />
                                <span>Reservation calendar & digital contract generation</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-amber-500" />
                                <span>Starter circuit immobilizer disarm & anti-theft relay</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                              {hasRental ? 'Type: Rental agency matched' : 'Requires "Rental agency" type'}
                            </span>
                            {isSuperAdmin && hasRental && (
                              <button
                                onClick={() => handleToggleModuleQuick(currentDetailOrg, 'car_rental')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  isUnlocked
                                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-xs'
                                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                                }`}
                              >
                                {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                <span>{isUnlocked ? 'Lock Module' : 'Unlock Module'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* MODULE 2: Fuel Intelligence & Theft Radar */}
                    {(() => {
                      const isUnlocked = !!currentDetailOrg.enabledModules?.fuel_intelligence;
                      return (
                        <div
                          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                            isUnlocked
                              ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30'
                              : 'bg-white dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
                                  <Fuel className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Fuel Intelligence & Anti-Theft</h4>
                                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">Ultrasonic & CAN-Bus Radar</span>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                                  isUnlocked
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500'
                                }`}
                              >
                                {isUnlocked ? 'Active' : 'Locked'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-2 leading-relaxed">
                              Real-time capacitive fuel sensor telemetry: detects fuel drops/theft spikes (&gt; 5 liters/minute), logs refuel station reconciliation, and computes normalized l/100km fleet consumption benchmarks.
                            </p>

                            <div className="mt-3 text-[11px] space-y-1 text-slate-500 dark:text-zinc-400">
                              <div className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-rose-500" />
                                <span>Instant SMS/Push notification on siphoning events</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-rose-500" />
                                <span>Refueling receipt audit & cost per kilometer analytics</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                              Hardware: Ultrasonic sensor compatible
                            </span>
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleToggleModuleQuick(currentDetailOrg, 'fuel_intelligence')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  isUnlocked
                                    ? 'bg-rose-500 hover:bg-rose-400 text-white'
                                    : 'bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white'
                                }`}
                              >
                                {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                <span>{isUnlocked ? 'Disable Module' : 'Enable Module'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* MODULE 3: Cold Chain & Temperature Probes */}
                    {(() => {
                      const isUnlocked = !!currentDetailOrg.enabledModules?.cold_chain;
                      return (
                        <div
                          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                            isUnlocked
                              ? 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/30'
                              : 'bg-white dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
                                  <Snowflake className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Cold Chain & HACCP Audit</h4>
                                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">BLE & Wired Temperature Probes</span>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                                  isUnlocked
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500'
                                }`}
                              >
                                {isUnlocked ? 'Active' : 'Locked'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-2 leading-relaxed">
                              Multi-compartment temperature monitoring (-30°C to +25°C) with reefer door magnetic sensors, automated excursion alarms, and regulatory PDF compliance log exports for pharmaceutical & food transit.
                            </p>

                            <div className="mt-3 text-[11px] space-y-1 text-slate-500 dark:text-zinc-400">
                              <div className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-blue-500" />
                                <span>Dual-zone probe telemetry & door opening logs</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-blue-500" />
                                <span>HACCP compliance certification report generation</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                              Hardware: 1-Wire & Bluetooth BLE
                            </span>
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleToggleModuleQuick(currentDetailOrg, 'cold_chain')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  isUnlocked
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                    : 'bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white'
                                }`}
                              >
                                {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                <span>{isUnlocked ? 'Disable Module' : 'Enable Module'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* MODULE 4: Customer Live ETA & e-POD */}
                    {(() => {
                      const isUnlocked = !!currentDetailOrg.enabledModules?.live_sharing;
                      return (
                        <div
                          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                            isUnlocked
                              ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/30'
                              : 'bg-white dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                                  <Share2 className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Customer Live ETA & e-POD</h4>
                                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">Expiring Links & Sign-on-Glass</span>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                                  isUnlocked
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500'
                                }`}
                              >
                                {isUnlocked ? 'Active' : 'Locked'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-2 leading-relaxed">
                              Send secure, temporary live GPS links to end-customers via WhatsApp/SMS with real-time ETA recalculation, geofenced automated arrival notices, and digital Proof-of-Delivery sign-on-glass.
                            </p>

                            <div className="mt-3 text-[11px] space-y-1 text-slate-500 dark:text-zinc-400">
                              <div className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-indigo-500" />
                                <span>No-login live tracking web link with auto-expiration</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Driver mobile sign-off & parcel photo capture</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                              Channels: SMS, WhatsApp, Email Webhooks
                            </span>
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleToggleModuleQuick(currentDetailOrg, 'live_sharing')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  isUnlocked
                                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                    : 'bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white'
                                }`}
                              >
                                {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                <span>{isUnlocked ? 'Disable Module' : 'Enable Module'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* MODULE 5: Predictive Maintenance & OBD-II */}
                    {(() => {
                      const isUnlocked = !!currentDetailOrg.enabledModules?.predictive_maintenance;
                      return (
                        <div
                          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                            isUnlocked
                              ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30'
                              : 'bg-white dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                  <Wrench className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Predictive Maintenance & OBD-II</h4>
                                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">DTC Engine Codes & Work Orders</span>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                                  isUnlocked
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500'
                                }`}
                              >
                                {isUnlocked ? 'Active' : 'Locked'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-2 leading-relaxed">
                              Odometer & engine hour-based automated service intervals (oil, brake pads, tires, timing belts), live OBD-II diagnostic trouble code (DTC) decoders, workshop repair orders, and spare parts expenditure tracking.
                            </p>

                            <div className="mt-3 text-[11px] space-y-1 text-slate-500 dark:text-zinc-400">
                              <div className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-amber-500" />
                                <span>Real-time MIL engine warning light telemetry alerts</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-amber-500" />
                                <span>Preventative maintenance scheduling by kilometers</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                              Hardware: OBD-II Dongle & CAN Interface
                            </span>
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleToggleModuleQuick(currentDetailOrg, 'predictive_maintenance')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  isUnlocked
                                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                    : 'bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white'
                                }`}
                              >
                                {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                <span>{isUnlocked ? 'Disable Module' : 'Enable Module'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* TAB 4: CONNECTED FLEET & DIRECT ACTIONS */}
              {detailActiveTab === 'telematics' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Telematics Fleet Status */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
                    <h3 className="text-xs uppercase font-mono tracking-wider text-slate-500 dark:text-zinc-400 font-bold mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span>Live Fleet Telemetry Summary</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="p-3 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                        <span className="text-2xl font-black text-slate-900 dark:text-white block">
                          {currentDetailOrg.stats.totalVehicles}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">Total Fleet Vehicles</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                          {currentDetailOrg.stats.activeVehicles}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">Moving on Road</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                        <span className="text-2xl font-black text-slate-700 dark:text-zinc-300 block">
                          {Math.max(0, currentDetailOrg.stats.totalVehicles - currentDetailOrg.stats.activeVehicles)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">Parked / Stationary</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">
                          {currentDetailOrg.stats.totalTrackers}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">Online GPS Trackers</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Telematics Shortcuts */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
                    <h3 className="text-xs uppercase font-mono tracking-wider text-slate-500 dark:text-zinc-400 font-bold mb-4 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-emerald-500" />
                      <span>One-Click Console Navigation for this Tenant</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <button
                        onClick={() => {
                          onSelectOrg(currentDetailOrg.id);
                          if (onNavigateToTab) onNavigateToTab('live_tracking');
                          setSelectedDetailOrg(null);
                        }}
                        className="p-4 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-left transition-all group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                            Live GPS Map
                          </span>
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Inspect real-time vehicle positions, heading & speed telemetry for {currentDetailOrg.name}.
                        </p>
                      </button>

                      <button
                        onClick={() => {
                          onSelectOrg(currentDetailOrg.id);
                          if (onNavigateToTab) onNavigateToTab('vehicles');
                          setSelectedDetailOrg(null);
                        }}
                        className="p-4 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-left transition-all group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                            Manage Vehicles & Trackers
                          </span>
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Register vehicles, pair Teltonika/Queclink IMEI sensors, and configure speed limits.
                        </p>
                      </button>

                      <button
                        onClick={() => {
                          onSelectOrg(currentDetailOrg.id);
                          if (onNavigateToTab) onNavigateToTab('car_rental');
                          setSelectedDetailOrg(null);
                        }}
                        className="p-4 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-left transition-all group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                            Car Rental & Relay Hub
                          </span>
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Access rental contracts, customer damage mapping, and anti-theft immobilizer cut-offs.
                        </p>
                      </button>

                      <button
                        onClick={() => {
                          onSelectOrg(currentDetailOrg.id);
                          if (onNavigateToTab) onNavigateToTab('reports');
                          setSelectedDetailOrg(null);
                        }}
                        className="p-4 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-left transition-all group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                            Telemetry & Sensor Reports
                          </span>
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Generate PDF mileage logs, fuel consumption charts, and geofence entry records.
                        </p>
                      </button>

                      <button
                        onClick={() => {
                          onSelectOrg(currentDetailOrg.id);
                          if (onNavigateToTab) onNavigateToTab('users');
                          setSelectedDetailOrg(null);
                        }}
                        className="p-4 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-left transition-all group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                            Team & RBAC Permissions
                          </span>
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Manage dispatchers, operators, role assignments, and driver logins for this organization.
                        </p>
                      </button>

                      <button
                        onClick={() => {
                          onSelectOrg(currentDetailOrg.id);
                          if (onNavigateToTab) onNavigateToTab('modules_hub');
                          setSelectedDetailOrg(null);
                        }}
                        className="p-4 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-left transition-all group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                            Add-Ons & Modules Store
                          </span>
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Explore enterprise add-on packages, cold chain HACCP, and customer live tracking.
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FIXED FOOTER */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-zinc-950/70 shrink-0">
              <div className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:block">
                <span>Tenant: <strong className="text-slate-900 dark:text-white">{currentDetailOrg.name}</strong></span>
                <span className="mx-2">•</span>
                <span>Quota: <strong className="text-emerald-600 dark:text-emerald-400">{currentDetailOrg.stats.totalVehicles} / {currentDetailOrg.subscription.vehicleLimit}</strong> Vehicles</span>
                <span className="mx-2">•</span>
                <span>Plan: <strong className="text-slate-900 dark:text-white">{currentDetailOrg.subscription.planName}</strong></span>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={() => setSelectedDetailOrg(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 hover:text-slate-900 dark:text-zinc-300 font-bold text-xs transition-colors"
                >
                  Close Details
                </button>

                {isSuperAdmin && currentDetailOrg.id !== selectedOrgId && (
                  <button
                    onClick={() => {
                      onSelectOrg(currentDetailOrg.id);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center gap-1.5"
                  >
                    <span>Switch to this Organization</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    handleOpenEditModal(currentDetailOrg);
                    setSelectedDetailOrg(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Organization</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
