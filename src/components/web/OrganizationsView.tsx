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
  ShieldAlert
} from 'lucide-react';
import {
  Organization,
  SubscriptionPlanId,
  SubscriptionStatus,
  ModuleKey,
  EnabledModules,
  DEFAULT_ORGANIZATION_TYPES,
  User
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
      <div className="bg-zinc-900/60 rounded-[32px] p-6 lg:p-8 border border-zinc-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-2xl backdrop-blur-md">
        <div className="border-l-4 border-emerald-500 pl-4 py-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border ${
              isSuperAdmin
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {isSuperAdmin ? 'Super Admin Control Plane' : 'Assigned Workspace Profile'}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold font-mono">
              {isSuperAdmin ? 'Multi-Tenant Governance & Licensing' : 'Single-Tenant Workspace Quotas'}
            </span>
          </div>
          <h1 className="text-3xl font-black italic tracking-tight text-white">
            {isSuperAdmin ? `${t.nav.organizations} & Tenant Governance` : 'My Organization & Subscription'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            {isSuperAdmin
              ? 'Create, update, and manage all tenant organizations. Super Admin can switch workspaces freely, affect organizations to owners or limited profile users, and configure module licenses.'
              : `Your account is assigned to ${visibleOrganizations[0]?.name || 'your designated organization'}. View your subscription quotas, vehicle limits, and active modules.`}
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowTypeManagerModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs border border-zinc-700 transition-all shadow-sm"
            >
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
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
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-200/90">
        <KeyRound className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300">Conditional Module Rule:</span> An organization can have one or more types (e.g.,{' '}
          <span className="font-mono bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">Rental agency</span>,{' '}
          <span className="font-mono bg-blue-400/20 text-blue-300 px-1.5 py-0.5 rounded">Transport company</span>,{' '}
          <span className="font-mono bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded">Other</span>). Only organizations assigned the{' '}
          <strong className="text-white">Rental agency</strong> type are eligible to have the <strong className="text-white">Rent-Vehicle Module</strong> (reservations, anti-theft relay, rental fleet catalog) unlocked for their workspace.
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-950/80 rounded-2xl p-4 border border-zinc-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search organizations by name, legal entity, city, email, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-900 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
            <Tag className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-transparent text-white text-xs font-medium outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-white">All Types ({organizations.length})</option>
              {allDynamicTypes.map((t) => (
                <option key={t} value={t} className="bg-zinc-900 text-white">
                  {t} ({organizations.filter((o) => (o.types || []).includes(t)).length})
                </option>
              ))}
            </select>
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedPlanFilter}
              onChange={(e) => setSelectedPlanFilter(e.target.value)}
              className="bg-transparent text-white text-xs font-medium outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-white">All Subscription Plans</option>
              <option value="basic" className="bg-zinc-900 text-white">Basic Starter</option>
              <option value="professional" className="bg-zinc-900 text-white">Professional Fleet</option>
              <option value="enterprise" className="bg-zinc-900 text-white">Enterprise Custom</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent text-white text-xs font-medium outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-white">All Statuses</option>
              <option value="active" className="bg-zinc-900 text-white">Active</option>
              <option value="suspended" className="bg-zinc-900 text-white">Suspended</option>
              <option value="pending" className="bg-zinc-900 text-white">Pending</option>
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
              className={`p-6 rounded-[28px] border transition-all flex flex-col justify-between shadow-2xl relative overflow-hidden group ${
                isSelected
                  ? 'bg-zinc-900/90 border-emerald-500/60 ring-1 ring-emerald-500/30 text-white'
                  : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-300'
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
                    <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-lg bg-zinc-900 text-emerald-400 border border-zinc-700 font-bold">
                      {org.subscription.planName}
                    </span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                        org.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : org.status === 'suspended'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {org.status}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Check className="w-3 h-3" />
                      Active Scope
                    </span>
                  )}
                </div>

                {/* Org Title & Legal */}
                <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-between">
                  <span>{org.name}</span>
                </h3>
                <p className="text-xs text-zinc-400 font-medium">{org.legalName}</p>
                <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-zinc-500 shrink-0" />
                  <span>{org.city}, {org.country}</span>
                </p>

                {/* Organization Types Tags */}
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mr-1">Types:</span>
                  {orgTypes.map((type) => {
                    const isRental = type === 'Rental agency';
                    const isTransport = type === 'Transport company';
                    return (
                      <span
                        key={type}
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
                          isRental
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 font-bold'
                            : isTransport
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                            : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        }`}
                      >
                        {isRental && <KeyRound className="w-2.5 h-2.5 text-amber-400" />}
                        {type}
                      </span>
                    );
                  })}
                </div>

                {/* Rent-Vehicle Module Interlock Status Card */}
                <div
                  className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    isRentalUnlocked
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                      : hasRentalType
                      ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isRentalUnlocked
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : hasRentalType
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1">
                        <span>Rent-Vehicle Module</span>
                        {isRentalUnlocked ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 rounded">
                            Unlocked & Active
                          </span>
                        ) : hasRentalType ? (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 rounded">
                            Locked (Eligible)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-1.5 rounded">
                            Locked (No Rental Type)
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] opacity-75 mt-0.5">
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
                      onClick={() => handleToggleModuleQuick(org, 'car_rental')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                        isRentalUnlocked
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-sm'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                    >
                      {isRentalUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{isRentalUnlocked ? 'Lock' : 'Unlock'}</span>
                    </button>
                  ) : (
                    <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 shrink-0 bg-zinc-800/80 px-2 py-1 rounded-md">
                      <Lock className="w-3 h-3" />
                      <span>Restricted</span>
                    </div>
                  )}
                </div>

                {/* Quotas & Telematics Limits */}
                <div className="my-4 pt-3 border-t border-zinc-800/80 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 font-sans flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-zinc-500" />
                      <span>Vehicle Quota:</span>
                    </span>
                    <span className="text-white font-bold">
                      {org.stats.totalVehicles} / {org.subscription.vehicleLimit} Units
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 font-sans flex items-center gap-1.5">
                      <Cpu className="w-3 h-3 text-zinc-500" />
                      <span>Trackers Installed:</span>
                    </span>
                    <span className="text-white font-bold">
                      {org.stats.totalTrackers} / {org.subscription.trackerLimit} Devices
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 font-sans flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span>License Remaining:</span>
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {org.subscription.daysRemaining} Days
                    </span>
                  </div>
                </div>

                {/* Enabled Modules Badges */}
                <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center gap-1 text-[10px]">
                  <span className="text-zinc-500 font-sans mr-1">Modules:</span>
                  {org.enabledModules?.car_rental && (
                    <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono">
                      Rental
                    </span>
                  )}
                  {org.enabledModules?.fuel_intelligence && (
                    <span className="bg-rose-500/10 text-rose-300 border border-rose-500/20 px-1.5 py-0.5 rounded font-mono">
                      Fuel
                    </span>
                  )}
                  {org.enabledModules?.cold_chain && (
                    <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono">
                      Reefer
                    </span>
                  )}
                  {org.enabledModules?.live_sharing && (
                    <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono">
                      ETA
                    </span>
                  )}
                  {org.enabledModules?.predictive_maintenance && (
                    <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono">
                      OBD-II
                    </span>
                  )}
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center gap-2">
                {isSuperAdmin ? (
                  <>
                    <button
                      onClick={() => onSelectOrg(org.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Currently Monitored' : 'Switch Organization'}
                    </button>

                    {/* Edit Organization Button */}
                    <button
                      onClick={() => handleOpenEditModal(org)}
                      title="Edit Organization Details, Types & Quotas"
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Organization Button */}
                    <button
                      onClick={() => setDeletingOrg(org)}
                      title="Delete Organization"
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Your Assigned Organization</span>
                    </div>

                    <button
                      onClick={() => handleOpenEditModal(org)}
                      title="Edit Company Contact Info"
                      className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
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
        <div className="p-12 text-center bg-zinc-900/30 rounded-3xl border border-zinc-800 text-zinc-400">
          <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No organizations match your filters</h3>
          <p className="text-xs text-zinc-500 mt-1">Try resetting the search query or organization type filters.</p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / EDIT ORGANIZATION (CRUD) */}
      {/* ========================================================================= */}
      {(showCreateModal || editingOrg) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingOrg ? `Edit Tenant: ${editingOrg.name}` : 'Create New Organization Tenant'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Define organization profile, industry types, and subscription modules
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingOrg(null);
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingOrg ? handleEditSubmit : handleCreateSubmit} className="space-y-5">
              {/* General Organization Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oasis Rent-a-Car Morocco"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Legal Business Entity *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oasis Car Hire & Mobility SARL"
                    value={formLegalName}
                    onChange={(e) => setFormLegalName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@agency.ma"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+212 522 99 11 22"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Casablanca"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="Morocco"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Organization Types Management (Multi-Select & Add Types) */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-white">
                      Organization Industry Types (1 or More) *
                    </label>
                    <p className="text-[11px] text-zinc-400">
                      Select all applicable activity categories. Selecting <span className="text-amber-400 font-bold">Rental agency</span> allows the Rent-Vehicle Module to be unlocked.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                    {formTypes.length} selected
                  </span>
                </div>

                {/* Interactive Type Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {allDynamicTypes.map((type) => {
                    const isSelected = formTypes.includes(type);
                    const isRental = type === 'Rental agency';
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleToggleFormType(type)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                          isSelected
                            ? isRental
                              ? 'bg-amber-500 text-black border-amber-400 shadow-md font-bold'
                              : 'bg-emerald-500 text-black border-emerald-400 shadow-md font-bold'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {isRental && <KeyRound className="w-3.5 h-3.5" />}
                        <span>{type}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Type Inline */}
                <div className="pt-2 flex items-center gap-2 border-t border-zinc-800/80">
                  <input
                    type="text"
                    placeholder="Add custom Type (e.g. Airport Shuttle, Taxi Fleet...)"
                    value={formCustomTypeInput}
                    onChange={(e) => setFormCustomTypeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTypeToForm();
                      }
                    }}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTypeToForm}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
                  >
                    + Add Type
                  </button>
                </div>
              </div>

              {/* Subscription Plan & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Subscription Tier
                  </label>
                  <select
                    value={formPlanId}
                    onChange={(e) => setFormPlanId(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="basic">Basic Starter ($49/mo - 10 vehicles)</option>
                    <option value="professional">Professional Fleet ($189/mo - 100 vehicles)</option>
                    <option value="enterprise">Enterprise Custom ($499/mo - 500 vehicles)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Tenant Account Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="suspended">Suspended (Billing/Compliance)</option>
                    <option value="pending">Pending Onboarding</option>
                  </select>
                </div>
              </div>

              {/* Quotas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Vehicle Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={formVehicleLimit}
                    onChange={(e) => setFormVehicleLimit(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">User Seats</label>
                  <input
                    type="number"
                    min={1}
                    value={formUserLimit}
                    onChange={(e) => setFormUserLimit(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Tracker Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={formTrackerLimit}
                    onChange={(e) => setFormTrackerLimit(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Retention (Days)</label>
                  <input
                    type="number"
                    min={30}
                    value={formRetentionDays}
                    onChange={(e) => setFormRetentionDays(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Feature Modules Locking / Unlocking */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-white">
                  Add-On Feature Modules (Lock / Unlock per Tenant)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Rent-Vehicle Module Toggle */}
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      formTypes.includes('Rental agency')
                        ? formModules.car_rental
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-zinc-950 border-zinc-800'
                        : 'bg-zinc-950/40 border-zinc-800/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Rent-Vehicle Module</div>
                        <div className="text-[10px] text-zinc-400">
                          {formTypes.includes('Rental agency')
                            ? 'Eligible (Rental agency)'
                            : "Requires 'Rental agency' type"}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!formTypes.includes('Rental agency')}
                      onClick={() =>
                        setFormModules((m) => ({ ...m, car_rental: !m.car_rental }))
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        formModules.car_rental && formTypes.includes('Rental agency')
                          ? 'bg-amber-500 text-black'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {formModules.car_rental && formTypes.includes('Rental agency')
                        ? 'Unlocked'
                        : 'Locked'}
                    </button>
                  </div>

                  {/* Fuel Intelligence Toggle */}
                  <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Fuel Theft Protection</div>
                        <div className="text-[10px] text-zinc-400">Siphoning radar</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormModules((m) => ({
                          ...m,
                          fuel_intelligence: !m.fuel_intelligence
                        }))
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        formModules.fuel_intelligence
                          ? 'bg-emerald-500 text-black'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {formModules.fuel_intelligence ? 'Unlocked' : 'Locked'}
                    </button>
                  </div>

                  {/* Cold Chain Toggle */}
                  <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Snowflake className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Cold Chain & HACCP</div>
                        <div className="text-[10px] text-zinc-400">Reefer temperature</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormModules((m) => ({ ...m, cold_chain: !m.cold_chain }))
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        formModules.cold_chain
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {formModules.cold_chain ? 'Unlocked' : 'Locked'}
                    </button>
                  </div>

                  {/* Live Sharing Toggle */}
                  <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Customer Live ETA</div>
                        <div className="text-[10px] text-zinc-400">e-POD signature</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormModules((m) => ({
                          ...m,
                          live_sharing: !m.live_sharing
                        }))
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        formModules.live_sharing
                          ? 'bg-indigo-500 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {formModules.live_sharing ? 'Unlocked' : 'Locked'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingOrg(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg transition-all"
                >
                  {editingOrg ? 'Save Organization Changes' : 'Create Organization Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MANAGE ORGANIZATION TYPES */}
      {/* ========================================================================= */}
      {showTypeManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Manage Organization Types</h3>
                  <p className="text-xs text-zinc-400">
                    Define industry categories and module eligibility rules
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTypeManagerModal(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Type Form */}
            <form onSubmit={handleAddNewSystemType} className="mb-5 space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Add New Organization Type
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Airport Shuttle, Peer-to-Peer Carsharing..."
                  value={newTypeInput}
                  onChange={(e) => setNewTypeInput(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 outline-none"
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
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Active Organization Types ({allDynamicTypes.length})
              </div>
              {allDynamicTypes.map((type) => {
                const orgCount = organizations.filter((o) => (o.types || []).includes(type)).length;
                const isRental = type === 'Rental agency';
                const isTransport = type === 'Transport company';

                return (
                  <div
                    key={type}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isRental
                            ? 'bg-amber-500/20 text-amber-400'
                            : isTransport
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {isRental ? <KeyRound className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{type}</span>
                          {isRental && (
                            <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1.5 rounded">
                              Unlocks Rent-Vehicle Module
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {orgCount} {orgCount === 1 ? 'tenant organization' : 'tenant organizations'}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 px-2 py-1 rounded-md">
                      {orgCount} Orgs
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowTypeManagerModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Delete Tenant Organization?</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-white">{deletingOrg.name}</strong> ({deletingOrg.legalName})? This will remove all associated fleet telemetry, vehicle reservations, and user permissions for this tenant scope.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300">
              This action cannot be undone. All active GPS trackers and reservations will be archived.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingOrg(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
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
    </div>
  );
};
