import React, { useState } from 'react';
import {
  Users,
  Shield,
  Plus,
  Mail,
  CheckCircle,
  Lock,
  Search,
  Filter,
  Key,
  Smartphone,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  UserCheck,
  UserX,
  Building2,
  Sliders,
  FileSpreadsheet,
  Download,
  Terminal,
  Clock,
  ShieldCheck,
  Sparkles,
  Eye,
  Info
} from 'lucide-react';
import { User, UserRole, Organization, Vehicle } from '../../types/fleet';
import {
  PermissionKey,
  ALL_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
  ROLE_METADATA,
  userHasPermission
} from '../../types/rbac';
import { AuditLogEntry, INITIAL_AUDIT_LOGS } from '../../types/auditLog';
import { TranslationDictionary } from '../../translations/i18n';

interface UsersRbacViewProps {
  users: User[];
  organizations: Organization[];
  vehicles: Vehicle[];
  currentUser: User | null;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onSimulateRole?: (role: UserRole) => void;
  t: TranslationDictionary;
}

export const UsersRbacView: React.FC<UsersRbacViewProps> = ({
  users,
  organizations,
  vehicles,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSimulateRole,
  t
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'matrix' | 'overrides' | 'audit'>('directory');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Role permissions state (allows editing the matrix)
  const [roleMatrix, setRoleMatrix] = useState<Record<UserRole, PermissionKey[]>>(ROLE_DEFAULT_PERMISSIONS);

  // Selected user for custom override editing
  const [selectedOverrideUserId, setSelectedOverrideUserId] = useState<string>(users[0]?.id || '');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [auditCategory, setAuditCategory] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState<string>('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [pinResetNotification, setPinResetNotification] = useState<{ userName: string; newPin: string } | null>(null);

  // New User Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    organizationId: string;
    department: string;
    demoPin: string;
    twoFactorEnabled: boolean;
  }>({
    name: '',
    email: '',
    phone: '',
    role: 'fleet_manager',
    organizationId: organizations[0]?.id || 'org_atlas_logistics',
    department: 'Fleet Dispatch',
    demoPin: Math.floor(1000 + Math.random() * 9000).toString(),
    twoFactorEnabled: false
  });

  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'support_admin';
  const canManageUsers = userHasPermission(currentUser, 'users:manage');
  const canEditRbac = userHasPermission(currentUser, 'rbac:matrix_edit');

  // Filtered Users: Non-super-admins strictly restricted to their own assigned organization
  const visibleBaseUsers = isSuperAdmin
    ? users
    : users.filter((u) => u.organizationId === currentUser?.organizationId);

  const filteredUsers = visibleBaseUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesOrg = filterOrg === 'all' || u.organizationId === filterOrg;
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesOrg && matchesStatus;
  });

  // Handle Create User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    // Super Admin can choose organization; non-super-admin is locked to own org
    const targetOrgId = isSuperAdmin ? formData.organizationId : (currentUser?.organizationId || formData.organizationId);
    const org = organizations.find((o) => o.id === targetOrgId);

    const newUser: User = {
      id: `usr_${Date.now().toString(36)}`,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || '+212 660 00 00 00',
      role: formData.role,
      organizationId: targetOrgId,
      organizationName: org ? org.name : (currentUser?.organizationName || 'Atlas Express Logistics'),
      department: formData.department,
      status: 'active',
      demoPin: formData.demoPin,
      twoFactorEnabled: formData.twoFactorEnabled,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formData.name)}`,
      lastLoginAt: 'Never',
      createdAt: new Date().toISOString()
    };

    onAddUser(newUser);

    // Add audit log entry
    const log: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'usr_admin',
      userName: currentUser?.name || 'Administrator',
      userRole: currentUser?.role || 'super_admin',
      action: 'USER_CREATED',
      category: 'rbac',
      severity: 'info',
      description: `Created new user account for ${newUser.name} (${newUser.email}) with role ${newUser.role} in organization "${newUser.organizationName}".`,
      ipAddress: '196.12.44.89',
      targetEntity: newUser.id
    };
    setAuditLogs((prev) => [log, ...prev]);

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'fleet_manager',
      organizationId: isSuperAdmin ? (organizations[0]?.id || 'org_atlas_logistics') : (currentUser?.organizationId || 'org_atlas_logistics'),
      department: 'Fleet Dispatch',
      demoPin: Math.floor(1000 + Math.random() * 9000).toString(),
      twoFactorEnabled: false
    });
  };

  // Handle Edit User Save
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // Resolve organization if updated by Super Admin
    const targetOrg = organizations.find((o) => o.id === editingUser.organizationId);
    const updatedUserWithOrg: User = {
      ...editingUser,
      organizationName: targetOrg ? targetOrg.name : editingUser.organizationName
    };

    onUpdateUser(updatedUserWithOrg);

    const log: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'usr_admin',
      userName: currentUser?.name || 'Administrator',
      userRole: currentUser?.role || 'super_admin',
      action: 'USER_UPDATED',
      category: 'rbac',
      severity: 'info',
      description: `Updated profile & assigned organization for user ${editingUser.name} (${updatedUserWithOrg.organizationName}).`,
      ipAddress: '196.12.44.89',
      targetEntity: editingUser.id
    };
    setAuditLogs((prev) => [log, ...prev]);

    setEditingUser(null);
  };

  // Handle Toggle Status (Active / Inactive)
  const handleToggleStatus = (targetUser: User) => {
    const updated: User = {
      ...targetUser,
      status: targetUser.status === 'active' ? 'inactive' : 'active'
    };
    onUpdateUser(updated);

    const log: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'usr_admin',
      userName: currentUser?.name || 'Administrator',
      userRole: currentUser?.role || 'super_admin',
      action: updated.status === 'active' ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      category: 'security',
      severity: updated.status === 'active' ? 'info' : 'warning',
      description: `${updated.status === 'active' ? 'Re-activated' : 'Suspended'} user access for ${targetUser.name}.`,
      ipAddress: '196.12.44.89',
      targetEntity: targetUser.id
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Handle Reset PIN
  const handleResetPin = (targetUser: User) => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    const updated: User = { ...targetUser, demoPin: newPin };
    onUpdateUser(updated);
    setPinResetNotification({ userName: targetUser.name, newPin });

    const log: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'usr_admin',
      userName: currentUser?.name || 'Administrator',
      userRole: currentUser?.role || 'super_admin',
      action: 'PIN_RESET',
      category: 'security',
      severity: 'warning',
      description: `Generated temporary security PIN for ${targetUser.name}.`,
      ipAddress: '196.12.44.89',
      targetEntity: targetUser.id
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Handle Delete Confirmation
  const confirmDelete = () => {
    if (!userToDelete) return;
    onDeleteUser(userToDelete.id);

    const log: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'usr_admin',
      userName: currentUser?.name || 'Administrator',
      userRole: currentUser?.role || 'super_admin',
      action: 'USER_DELETED',
      category: 'rbac',
      severity: 'danger',
      description: `Permanently removed user record for ${userToDelete.name} (${userToDelete.email}).`,
      ipAddress: '196.12.44.89',
      targetEntity: userToDelete.id
    };
    setAuditLogs((prev) => [log, ...prev]);

    setUserToDelete(null);
  };

  // Toggle Matrix Permission for a Role
  const handleToggleRolePermission = (role: UserRole, permKey: PermissionKey) => {
    if (!canEditRbac || role === 'super_admin') return; // Super admin always keeps all

    setRoleMatrix((prev) => {
      const currentPerms = prev[role] || [];
      const hasPerm = currentPerms.includes(permKey);
      const updated = hasPerm
        ? currentPerms.filter((k) => k !== permKey)
        : [...currentPerms, permKey];
      return { ...prev, [role]: updated };
    });
  };

  // Custom User Override Toggle
  const selectedOverrideUser = users.find((u) => u.id === selectedOverrideUserId) || users[0];

  const handleToggleUserOverride = (permKey: PermissionKey) => {
    if (!selectedOverrideUser || !canEditRbac) return;

    const currentOverrides = selectedOverrideUser.customPermissions
      ? [...selectedOverrideUser.customPermissions]
      : [...(roleMatrix[selectedOverrideUser.role] || [])];

    const hasPerm = currentOverrides.includes(permKey);
    const updated = hasPerm
      ? currentOverrides.filter((k) => k !== permKey)
      : [...currentOverrides, permKey];

    const updatedUser: User = {
      ...selectedOverrideUser,
      customPermissions: updated
    };

    onUpdateUser(updatedUser);
  };

  const handleResetUserOverride = () => {
    if (!selectedOverrideUser || !canEditRbac) return;
    const updatedUser: User = {
      ...selectedOverrideUser,
      customPermissions: undefined
    };
    onUpdateUser(updatedUser);
  };

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesCat = auditCategory === 'all' || log.category === auditCategory;
    const matchesSearch =
      log.description.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.userName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Export Audit CSV
  const handleExportAuditCsv = () => {
    const headers = ['Timestamp,User,Role,Action,Category,Severity,Description,IP Address'];
    const rows = filteredAuditLogs.map((l) =>
      `"${l.timestamp}","${l.userName}","${l.userRole}","${l.action}","${l.category}","${l.severity}","${l.description.replace(/"/g, '""')}","${l.ipAddress}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-zinc-900/40 rounded-[32px] p-6 border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm dark:shadow-2xl">
        <div className="border-l-2 border-emerald-500 pl-4 py-1">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-1 font-bold">
            Access Governance & Enterprise Identity (RBAC)
          </p>
          <h2 className="text-3xl font-black italic tracking-tight text-slate-900 dark:text-white">
            {t.nav.usersRbac}
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            Manage administrative privileges, granular capability matrices, multi-tenant accounts, and forensic audit trails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {canManageUsers && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Invite New User</span>
            </button>
          )}

          {onSimulateRole && (
            <button
              onClick={() => onSimulateRole('viewer')}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Test as Viewer</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900/40 p-5 rounded-[24px] border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Members</span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{users.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
            Across {organizations.length} active organizations
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/40 p-5 rounded-[24px] border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Active Accounts</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {users.filter((u) => u.status === 'active').length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">Ready for real-time dispatch</div>
        </div>

        <div className="bg-white dark:bg-zinc-900/40 p-5 rounded-[24px] border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">2FA Protected</span>
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {users.filter((u) => u.twoFactorEnabled).length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">MFA TOTP Authenticator active</div>
        </div>

        <div className="bg-white dark:bg-zinc-900/40 p-5 rounded-[24px] border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Audit Trail Records</span>
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400">{auditLogs.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">Cryptographically stamped events</div>
        </div>
      </div>

      {/* Main Tab Controller */}
      <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm dark:shadow-2xl">
        <div className="flex border-b border-slate-200 dark:border-zinc-800 px-6 pt-4 gap-6 bg-slate-50 dark:bg-zinc-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={`pb-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'directory'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            <Users className="w-4 h-4" />
            Team Directory ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            Granular RBAC Matrix ({ALL_PERMISSIONS.length} Capabilities)
          </button>

          <button
            onClick={() => setActiveTab('overrides')}
            className={`pb-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'overrides'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Custom User Overrides
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Forensic Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* 1. DIRECTORY TAB */}
        {activeTab === 'directory' && (
          <div className="p-6 space-y-5">
            {/* Filter and Search Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[240px] max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, phone..."
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 dark:focus:border-zinc-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Role Filter */}
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-emerald-500 dark:focus:border-zinc-700"
                >
                  <option value="all">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="support_admin">Support Admin</option>
                  <option value="org_owner">Org Owner</option>
                  <option value="org_admin">Org Admin</option>
                  <option value="fleet_manager">Fleet Dispatcher</option>
                  <option value="driver">Fleet Driver</option>
                  <option value="viewer">Read-Only Viewer</option>
                </select>

                {/* Organization Filter */}
                {isSuperAdmin ? (
                  <select
                    value={filterOrg}
                    onChange={(e) => setFilterOrg(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-emerald-500 dark:focus:border-zinc-700"
                  >
                    <option value="all">All Organizations ({organizations.length})</option>
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3 h-3" />
                    <span>{currentUser?.organizationName || 'My Organization'}</span>
                  </div>
                )}

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-emerald-500 dark:focus:border-zinc-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive / Suspended</option>
                </select>
              </div>
            </div>

            {/* Notification Banner for PIN Reset */}
            {pinResetNotification && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span>
                    New Demo Security PIN for <strong>{pinResetNotification.userName}</strong>:
                    <span className="font-mono font-black ml-2 px-2 py-0.5 rounded bg-black border border-emerald-500/40 text-emerald-400">
                      {pinResetNotification.newPin}
                    </span>
                  </span>
                </div>
                <button
                  onClick={() => setPinResetNotification(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Users Directory Cards / Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredUsers.length === 0 ? (
                <div className="col-span-full text-center py-16 text-zinc-500 text-xs">
                  No users found matching filter parameters.
                </div>
              ) : (
                filteredUsers.map((usr) => {
                  const meta = ROLE_METADATA[usr.role] || ROLE_METADATA.viewer;
                  const isCurrent = usr.id === currentUser?.id;
                  const hasCustomOverrides =
                    usr.customPermissions && usr.customPermissions.length > 0;

                  return (
                    <div
                      key={usr.id}
                      className={`p-5 rounded-[24px] border transition-all flex flex-col justify-between ${
                        usr.status === 'active'
                          ? 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-900 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                usr.avatarUrl ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(usr.name)}`
                              }
                              alt={usr.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-black text-slate-900 dark:text-white">{usr.name}</h4>
                                {isCurrent && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-zinc-400">{usr.email}</p>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-xl border ${meta.badgeColor}`}
                          >
                            {meta.label}
                          </span>
                        </div>

                        {/* Details Metadata */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 dark:text-zinc-500 text-[11px]">Organization:</span>
                            <span className="font-semibold text-slate-800 dark:text-zinc-300 text-right truncate max-w-[180px]">
                              {usr.organizationName}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 dark:text-zinc-500 text-[11px]">Contact Phone:</span>
                            <span className="font-mono text-slate-800 dark:text-zinc-300">{usr.phone || '—'}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 dark:text-zinc-500 text-[11px]">Security PIN:</span>
                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400">
                              {usr.demoPin || '1234'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 dark:text-zinc-500 text-[11px]">Two-Factor (2FA):</span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                usr.twoFactorEnabled
                                  ? 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-500 border border-slate-200 dark:border-zinc-800'
                              }`}
                            >
                              {usr.twoFactorEnabled ? 'TOTP Active' : 'Disabled'}
                            </span>
                          </div>

                          {hasCustomOverrides && (
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-amber-600 dark:text-amber-500 text-[11px] font-bold">Custom RBAC:</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
                                {usr.customPermissions?.length} Overrides
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Toolbar */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {canManageUsers && (
                            <button
                              onClick={() => setEditingUser(usr)}
                              title="Edit User Credentials"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white border border-slate-200 dark:border-zinc-800"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canManageUsers && (
                            <button
                              onClick={() => handleResetPin(usr)}
                              title="Generate New Security PIN"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400 border border-slate-200 dark:border-zinc-800"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canEditRbac && (
                            <button
                              onClick={() => {
                                setSelectedOverrideUserId(usr.id);
                                setActiveTab('overrides');
                              }}
                              title="Configure Granular Capability Overrides"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 border border-slate-200 dark:border-zinc-800"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {canManageUsers && !isCurrent && (
                            <button
                              onClick={() => handleToggleStatus(usr)}
                              title={usr.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                              className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                                usr.status === 'active'
                                  ? 'bg-slate-100 hover:bg-red-50 dark:bg-zinc-900 dark:hover:bg-red-500/10 border-slate-200 hover:border-red-300 dark:border-zinc-800 dark:hover:border-red-500/40 text-slate-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400'
                                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {usr.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          )}

                          {canManageUsers && !isCurrent && usr.role !== 'super_admin' && (
                            <button
                              onClick={() => setUserToDelete(usr)}
                              title="Permanently Delete User"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-zinc-900 dark:hover:bg-red-500/20 text-slate-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 border border-slate-200 dark:border-zinc-800"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 2. RBAC MATRIX TAB */}
        {activeTab === 'matrix' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Default Role Capabilities</h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  Toggle permissions for built-in system roles. Changes immediately affect all users assigned to that role without custom overrides.
                </p>
              </div>

              {canEditRbac && (
                <button
                  onClick={() => setRoleMatrix(ROLE_DEFAULT_PERMISSIONS)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white border border-slate-300 dark:border-zinc-700 text-xs font-bold shadow-xs"
                >
                  Reset Defaults
                </button>
              )}
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400">
                    <th className="p-4 font-bold uppercase tracking-wider text-[11px] min-w-[260px]">
                      Capability / Permission
                    </th>
                    <th className="p-3 font-bold text-center text-purple-700 dark:text-purple-400 min-w-[100px]">Super Admin</th>
                    <th className="p-3 font-bold text-center text-cyan-700 dark:text-cyan-400 min-w-[100px]">Support Admin</th>
                    <th className="p-3 font-bold text-center text-emerald-700 dark:text-emerald-400 min-w-[100px]">Org Owner</th>
                    <th className="p-3 font-bold text-center text-blue-700 dark:text-blue-400 min-w-[100px]">Org Admin</th>
                    <th className="p-3 font-bold text-center text-amber-700 dark:text-amber-400 min-w-[100px]">Dispatcher</th>
                    <th className="p-3 font-bold text-center text-teal-700 dark:text-teal-400 min-w-[100px]">Driver</th>
                    <th className="p-3 font-bold text-center text-slate-600 dark:text-zinc-400 min-w-[100px]">Viewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 bg-white dark:bg-zinc-950/40">
                  {ALL_PERMISSIONS.map((perm) => (
                    <tr key={perm.key} className="hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{perm.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-500 leading-tight mt-0.5">
                          {perm.description}
                        </div>
                        <span className="inline-block mt-1 font-mono text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
                          {perm.key}
                        </span>
                      </td>

                      {(
                        ['super_admin', 'support_admin', 'org_owner', 'org_admin', 'fleet_manager', 'driver', 'viewer'] as UserRole[]
                      ).map((role) => {
                        const isGranted =
                          role === 'super_admin' ? true : (roleMatrix[role] || []).includes(perm.key);

                        return (
                          <td key={role} className="p-3 text-center">
                            <button
                              type="button"
                              disabled={!canEditRbac || role === 'super_admin'}
                              onClick={() => handleToggleRolePermission(role, perm.key)}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                                isGranted
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/50'
                                  : 'bg-slate-100 dark:bg-zinc-900/80 text-slate-400 dark:text-zinc-600 border border-slate-200 dark:border-zinc-800'
                              } ${
                                !canEditRbac || role === 'super_admin' ? 'cursor-default' : 'hover:scale-110'
                              }`}
                            >
                              {isGranted ? <Check className="w-4 h-4 font-bold" /> : <X className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. USER OVERRIDES TAB */}
        {activeTab === 'overrides' && (
          <div className="p-6 space-y-6">
            <div className="bg-slate-50 dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-500 block mb-1.5">
                  Select User Account to Customize
                </label>
                <select
                  value={selectedOverrideUserId}
                  onChange={(e) => setSelectedOverrideUserId(e.target.value)}
                  className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500 min-w-[280px]"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {ROLE_METADATA[u.role]?.label || u.role} ({u.organizationName})
                    </option>
                  ))}
                </select>
              </div>

              {selectedOverrideUser && (
                <div className="flex items-center gap-3">
                  {selectedOverrideUser.customPermissions && (
                    <button
                      onClick={handleResetUserOverride}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white text-xs font-bold border border-slate-300 dark:border-zinc-700 shadow-xs"
                    >
                      Clear Overrides (Revert to Role)
                    </button>
                  )}
                  <span className="text-xs text-slate-600 dark:text-zinc-400">
                    Baseline Role:{' '}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {ROLE_METADATA[selectedOverrideUser.role]?.label}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Permissions Toggles for Selected User */}
            {selectedOverrideUser && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ALL_PERMISSIONS.map((perm) => {
                  const effectiveGranted = userHasPermission(selectedOverrideUser, perm.key);
                  const isRoleDefault = (roleMatrix[selectedOverrideUser.role] || []).includes(perm.key);
                  const isCustom =
                    selectedOverrideUser.customPermissions !== undefined &&
                    effectiveGranted !== isRoleDefault;

                  return (
                    <div
                      key={perm.key}
                      onClick={() => handleToggleUserOverride(perm.key)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        effectiveGranted
                          ? 'bg-white dark:bg-zinc-950 border-emerald-500/40 hover:border-emerald-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{perm.label}</span>
                          {isCustom && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40">
                              Override
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                          {perm.description}
                        </p>
                        <span className="font-mono text-[9px] text-slate-400 dark:text-zinc-500 block mt-2">
                          {perm.key}
                        </span>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                          effectiveGranted
                            ? 'bg-emerald-500 text-black border-emerald-400'
                            : 'bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600 border-slate-300 dark:border-zinc-800'
                        }`}
                      >
                        {effectiveGranted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. FORENSIC AUDIT TRAIL TAB */}
        {activeTab === 'audit' && (
          <div className="p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[240px] max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search audit actions, user, details..."
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 dark:focus:border-zinc-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={auditCategory}
                  onChange={(e) => setAuditCategory(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-emerald-500 dark:focus:border-zinc-700"
                >
                  <option value="all">All Categories</option>
                  <option value="rbac">RBAC & Permissions</option>
                  <option value="commands">Hardware Commands</option>
                  <option value="security">Security & Auth</option>
                  <option value="geofences">Geofences</option>
                  <option value="system">System Parameters</option>
                </select>

                <button
                  onClick={handleExportAuditCsv}
                  className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 hover:text-slate-900 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Audit Log Stream */}
            <div className="space-y-2.5">
              {filteredAuditLogs.length === 0 ? (
                <div className="text-center py-16 text-slate-500 dark:text-zinc-500 text-xs">
                  No forensic audit logs found.
                </div>
              ) : (
                filteredAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-[20px] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                          log.severity === 'danger'
                            ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400'
                            : log.severity === 'warning'
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-800">
                            {log.action}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">{log.userName}</span>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-500">({log.userRole})</span>
                        </div>
                        <p className="text-slate-600 dark:text-zinc-300 mt-1 leading-relaxed">{log.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end text-[11px] text-slate-500 dark:text-zinc-500 font-mono shrink-0">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-600">IP: {log.ipAddress}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD NEW USER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[1100] bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-[32px] w-full max-w-3xl shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-white animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Register New Fleet Member</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Provision new credentials and assign initial role privileges.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white border border-slate-200 dark:border-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Youssef El Mansouri"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="y.mansouri@flotte.ma"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+212 661 23 45 67"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    Assigned Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="support_admin">Support Admin</option>
                    <option value="org_owner">Organization Owner</option>
                    <option value="org_admin">Organization Admin</option>
                    <option value="fleet_manager">Fleet Dispatcher</option>
                    <option value="driver">Fleet Driver</option>
                    <option value="viewer">Read-Only Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Assigned Organization *</span>
                    {!isSuperAdmin && (
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}
                  </label>
                  {isSuperAdmin ? (
                    <select
                      value={formData.organizationId}
                      onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-purple-500/40 rounded-2xl px-4 py-2.5 text-purple-700 dark:text-purple-200 font-semibold focus:outline-none focus:border-purple-500"
                    >
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id} className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white">
                          {org.name} ({org.city})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-slate-700 dark:text-zinc-300 font-medium flex items-center justify-between">
                      <span className="truncate">{currentUser?.organizationName || 'Atlas Express Logistics'}</span>
                      <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    Initial Security PIN (4 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.demoPin}
                    onChange={(e) => setFormData({ ...formData, demoPin: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Logistics / Dispatch"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 pt-2 text-slate-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.twoFactorEnabled}
                  onChange={(e) => setFormData({ ...formData, twoFactorEnabled: e.target.checked })}
                  className="rounded accent-emerald-500"
                />
                <span>Enforce Two-Factor Authentication (TOTP Authenticator)</span>
              </label>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-[1100] bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-[32px] w-full max-w-3xl shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-white animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Edit User: {editingUser.name}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Update contact data, role, or authentication PIN.</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white border border-slate-200 dark:border-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value as UserRole })
                    }
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="support_admin">Support Admin</option>
                    <option value="org_owner">Organization Owner</option>
                    <option value="org_admin">Organization Admin</option>
                    <option value="fleet_manager">Fleet Dispatcher</option>
                    <option value="driver">Fleet Driver</option>
                    <option value="viewer">Read-Only Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Assigned Organization</span>
                    {!isSuperAdmin && (
                      <span className="text-[9px] text-slate-500 dark:text-zinc-500 font-mono flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Read-Only
                      </span>
                    )}
                  </label>
                  {isSuperAdmin ? (
                    <select
                      value={editingUser.organizationId}
                      onChange={(e) => {
                        const targetOrg = organizations.find((o) => o.id === e.target.value);
                        setEditingUser({
                          ...editingUser,
                          organizationId: e.target.value,
                          organizationName: targetOrg ? targetOrg.name : editingUser.organizationName
                        });
                      }}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-purple-500/40 rounded-2xl px-4 py-2.5 text-purple-700 dark:text-purple-200 font-semibold focus:outline-none focus:border-purple-500"
                    >
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id} className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white">
                          {org.name} ({org.city})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-slate-700 dark:text-zinc-300 font-medium flex items-center justify-between">
                      <span className="truncate">{editingUser.organizationName}</span>
                      <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    Demo Security PIN
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editingUser.demoPin || '1234'}
                    onChange={(e) => setEditingUser({ ...editingUser, demoPin: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editingUser.department || 'Operations'}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    placeholder="e.g. Operations / Logistics"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 pt-2 text-slate-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingUser.twoFactorEnabled || false}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, twoFactorEnabled: e.target.checked })
                  }
                  className="rounded accent-emerald-500"
                />
                <span>Two-Factor Authentication Active</span>
              </label>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {userToDelete && (
        <div className="fixed inset-0 z-[1100] bg-black/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#09090b] border border-red-200 dark:border-red-900/60 rounded-[32px] w-full max-w-md shadow-2xl p-6 text-slate-900 dark:text-white animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/40 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Delete User Account</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Are you sure you want to permanently remove <strong>{userToDelete.name}</strong> (
              {userToDelete.email})? This will immediately revoke their API credentials and session
              tokens.
            </p>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
