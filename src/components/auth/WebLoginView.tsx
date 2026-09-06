import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  Building2,
  Zap,
  Globe,
  Radio,
  ArrowRight,
  Fingerprint,
  KeyRound,
  Sparkles,
  Server,
  Layers,
  AlertCircle
} from 'lucide-react';
import { User, Organization } from '../../types/fleet';
import { TranslationDictionary, Language } from '../../translations/i18n';

interface WebLoginViewProps {
  organizations: Organization[];
  selectedOrgId: string;
  onSelectOrg: (orgId: string) => void;
  users: User[];
  onLogin: (user: User) => void;
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  t: TranslationDictionary;
}

export const WebLoginView: React.FC<WebLoginViewProps> = ({
  organizations,
  selectedOrgId,
  onSelectOrg,
  users,
  onLogin,
  currentLang,
  onLangChange,
  t
}) => {
  const [email, setEmail] = useState('fouad.tounsi@gmail.com');
  const [password, setPassword] = useState('FlotteMaestro#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [useTwoFactor, setUseTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const activeOrg = organizations.find((o) => o.id === selectedOrgId) || organizations[0];

  // Handle direct sign-in form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    setTimeout(() => {
      // Find matching user or fallback to standard user with this email
      const matchedUser = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (matchedUser) {
        setIsAuthenticating(false);
        onLogin(matchedUser);
      } else if (email.trim().length > 3) {
        // Fallback demo user
        const dynamicUser: User = {
          id: `usr_${Date.now()}`,
          organizationId: selectedOrgId,
          organizationName: activeOrg.name,
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          email: email.trim(),
          role: 'org_admin',
          status: 'active',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        setIsAuthenticating(false);
        onLogin(dynamicUser);
      } else {
        setIsAuthenticating(false);
        setAuthError(t.auth.invalidCredentials);
      }
    }, 450);
  };

  // Fast-track demo sign-in
  const handleQuickDemoLogin = (targetUser: User) => {
    setEmail(targetUser.email);
    setPassword('••••••••••••');
    setAuthError(null);
    setIsAuthenticating(true);

    // If user has a specific organization, align selectedOrg
    if (targetUser.organizationId) {
      onSelectOrg(targetUser.organizationId);
    }

    setTimeout(() => {
      setIsAuthenticating(false);
      onLogin(targetUser);
    }, 350);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-6 px-4 sm:px-6 relative">
      {/* Background Ambient Glow & Telemetry Grid Accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-zinc-900/60 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* LEFT COLUMN: Brand Hero & Telemetry Architecture */}
        <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-[32px] bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 border border-zinc-800 shadow-2xl relative overflow-hidden">
          {/* Subtle Left Accent Line */}
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 via-emerald-400 to-transparent" />

          <div>
            {/* Top Brand Tag */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
                  <div className="h-3 w-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">
                    FLOTTE<span className="text-zinc-600">MAESTRO</span>
                  </h1>
                  <span className="text-[9px] tracking-[0.25em] text-zinc-500 uppercase font-bold block mt-1">
                    Telemetry Gateway
                  </span>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 text-[11px]">
                <Globe className="w-3 h-3 text-zinc-500 mx-1" />
                {(['en', 'fr', 'ar'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => onLangChange(lang)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                      currentLang === lang ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Architecture Headline */}
            <div className="space-y-3 mt-6">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                {t.auth.signInSubtitle}
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Real-time sub-second GPS packet processing, automated geofence triggers, and multi-tenant telemetry for modern enterprise fleets.
              </p>
            </div>

            {/* Live Core Telemetry Network Pill */}
            <div className="mt-6 p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="font-mono text-zinc-300 text-[11px] font-bold">CORE PIPELINE STATUS</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  99.99% SLA
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                  <span className="text-zinc-500 text-[9px] block uppercase">Network Latency</span>
                  <span className="text-white font-bold">~12 ms (Optimal)</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                  <span className="text-zinc-500 text-[9px] block uppercase">Security Protocol</span>
                  <span className="text-emerald-400 font-bold">TLS 1.3 Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Credentials Note */}
          <div className="mt-8 pt-4 border-t border-zinc-900 flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
            <Shield className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>{t.auth.securityBanner}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Login Card */}
        <div className="lg:col-span-7 p-7 sm:p-9 rounded-[32px] bg-zinc-900/40 border border-zinc-800 shadow-2xl flex flex-col justify-between backdrop-blur-xl">
          <div>
            {/* Header / Title */}
            <div className="flex items-center justify-between pb-5 border-b border-zinc-800/80">
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {t.auth.signInTitle}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Authenticate your credentials to access the fleet command centre
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 font-mono">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Encrypted 256-bit</span>
              </div>
            </div>

            {/* Fast-Track 1-Click Role Accounts */}
            <div className="mt-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{t.auth.quickDemoAccounts}</span>
                </label>
                <span className="text-[10px] text-zinc-500">1-Click Auto Fill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {users.slice(0, 4).map((u) => {
                  const isSuper = u.role === 'super_admin';
                  const isOwner = u.role === 'org_owner';
                  const isManager = u.role === 'fleet_manager';

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(u)}
                      className="p-2.5 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between text-left transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full border border-zinc-700 object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                            {u.name}
                          </p>
                          <span className="text-[10px] text-zinc-500 font-mono block truncate">
                            {u.email}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          isSuper
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : isOwner
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : isManager
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <span className="relative bg-[#0b0b0b] px-3 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Or Sign In with Email
              </span>
            </div>

            {/* Error message banner */}
            {authError && (
              <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Main Interactive Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Target Tenant Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 flex items-center justify-between">
                  <span>{t.auth.selectTenant}</span>
                  <span className="text-zinc-500 font-mono text-[9px]">{activeOrg.subscription.planName} Plan</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedOrgId}
                    onChange={(e) => onSelectOrg(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-zinc-600 cursor-pointer"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id} className="bg-zinc-950 text-white">
                        {org.name} ({org.city}, {org.country})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  {t.auth.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.auth.emailPlaceholder}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                    {t.auth.passwordLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-[10px] text-zinc-400 hover:text-emerald-400 transition-colors font-medium"
                  >
                    {t.auth.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.auth.passwordPlaceholder}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500/80 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Security & 2FA Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-0 w-3.5 h-3.5 accent-emerald-500"
                  />
                  <span className="text-[11px]">{t.auth.rememberWorkstation}</span>
                </label>

                <button
                  type="button"
                  onClick={() => setUseTwoFactor(!useTwoFactor)}
                  className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                    useTwoFactor ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Hardware 2FA / YubiKey</span>
                </button>
              </div>

              {/* 2FA Additional Input (if enabled) */}
              {useTwoFactor && (
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 animate-in fade-in duration-200">
                  <label className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Authenticator 6-Digit TOTP Code</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-white/10 hover:shadow-white/20 transition-all disabled:opacity-60 cursor-pointer mt-2"
              >
                {isAuthenticating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>{t.auth.authenticating}</span>
                  </>
                ) : (
                  <>
                    <span>{t.auth.signInButton}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Enterprise SSO Options */}
            <div className="mt-5 pt-5 border-t border-zinc-800/80 space-y-2.5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block text-center">
                {t.auth.orContinueWithSSO}
              </span>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(users[0])}
                  className="py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="font-bold text-[11px]">Google SSO</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(users[1] || users[0])}
                  className="py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="font-bold text-[11px]">Azure AD</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(users[2] || users[0])}
                  className="py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="font-bold text-[11px]">Okta SAML</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal Helper */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Reset Telemetry Access Password</span>
              </h4>
              <button
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setResetEmailSent(false);
                }}
                className="text-zinc-500 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {resetEmailSent ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Password Reset Link Dispatched</span>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  A cryptographic reset token was sent to <strong>{email}</strong>. Please follow the instructions to securely renew your credentials.
                </p>
                <button
                  onClick={() => {
                    setShowForgotPasswordModal(false);
                    setResetEmailSent(false);
                  }}
                  className="mt-3 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400">
                  Enter your registered enterprise email address to receive an instant, time-limited reset link.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  placeholder="name@flottemaestro.io"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setResetEmailSent(true)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
