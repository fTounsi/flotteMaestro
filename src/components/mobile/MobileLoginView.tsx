import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Fingerprint,
  KeyRound,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Smartphone,
  Delete
} from 'lucide-react';
import { User, Organization } from '../../types/fleet';
import { TranslationDictionary, Language } from '../../translations/i18n';

interface MobileLoginViewProps {
  organizations: Organization[];
  selectedOrgId: string;
  onSelectOrg: (orgId: string) => void;
  users: User[];
  onLogin: (user: User) => void;
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  t: TranslationDictionary;
}

export const MobileLoginView: React.FC<MobileLoginViewProps> = ({
  organizations,
  selectedOrgId,
  onSelectOrg,
  users,
  onLogin,
  currentLang,
  onLangChange,
  t
}) => {
  const [authMode, setAuthMode] = useState<'password' | 'pin' | 'biometric'>('password');
  const [email, setEmail] = useState('r.amrani@flottemaestro.ma');
  const [password, setPassword] = useState('Driver#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [isScanningBiometric, setIsScanningBiometric] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeOrg = organizations.find((o) => o.id === selectedOrgId) || organizations[0];

  // Handle Standard Email & Password Submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const matched = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (matched) {
        setIsSubmitting(false);
        onLogin(matched);
      } else {
        setIsSubmitting(false);
        setAuthError(t.auth.invalidCredentials);
      }
    }, 400);
  };

  // Handle PIN Keypad Press
  const handlePinKeyPress = (digit: string) => {
    if (pinDigits.length >= 4) return;
    setAuthError(null);
    const newDigits = [...pinDigits, digit];
    setPinDigits(newDigits);

    if (newDigits.length === 4) {
      const fullPin = newDigits.join('');
      setIsSubmitting(true);

      setTimeout(() => {
        // Look for user matching this demo PIN
        const matched = users.find((u) => u.demoPin === fullPin) || users.find((u) => u.role === 'viewer') || users[0];
        if (matched) {
          setIsSubmitting(false);
          onLogin(matched);
        } else {
          setIsSubmitting(false);
          setPinDigits([]);
          setAuthError(t.auth.invalidCredentials);
        }
      }, 450);
    }
  };

  const handlePinBackspace = () => {
    setPinDigits((prev) => prev.slice(0, -1));
    setAuthError(null);
  };

  // Handle Biometric Touch ID / Face ID Simulation
  const handleBiometricScan = () => {
    setAuthError(null);
    setIsScanningBiometric(true);
    setBiometricSuccess(false);

    setTimeout(() => {
      setIsScanningBiometric(false);
      setBiometricSuccess(true);

      setTimeout(() => {
        // Default to mobile field driver or first user
        const targetUser = users.find((u) => u.role === 'viewer') || users[0];
        onLogin(targetUser);
      }, 400);
    }, 900);
  };

  // Fast-track demo account selection
  const handleSelectDemoUser = (user: User) => {
    setEmail(user.email);
    setPassword('••••••••••••');
    setAuthError(null);
    if (user.organizationId) {
      onSelectOrg(user.organizationId);
    }
    if (authMode === 'pin' && user.demoPin) {
      setPinDigits(user.demoPin.split(''));
      setTimeout(() => onLogin(user), 300);
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onLogin(user);
      }, 350);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 space-y-4 animate-in fade-in duration-200">
      {/* Top Mobile Brand Banner */}
      <div className="text-center pt-2 space-y-1">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner mb-1">
          <div className="h-4 w-4 bg-emerald-500 rounded-full shadow-[0_0_12px_#10b981] animate-pulse" />
        </div>
        <h3 className="text-lg font-black tracking-tight text-white italic uppercase">
          FLOTTE<span className="text-zinc-600">MAESTRO</span>
        </h3>
        <p className="text-[10px] text-zinc-400 font-medium">
          {t.auth.signInSubtitle}
        </p>
      </div>

      {/* Quick Role Fill Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-widest text-zinc-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
            <span>Fast Role Demo</span>
          </span>
          <span>1-Tap Fill</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {users.slice(0, 4).map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => handleSelectDemoUser(u)}
              className="p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 flex items-center gap-2 text-left transition-all"
            >
              <img
                src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                alt={u.name}
                className="w-6 h-6 rounded-full border border-zinc-700 object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-white block truncate leading-tight">
                  {u.name.split(' ')[0]}
                </span>
                <span className="text-[8px] uppercase font-mono text-emerald-400 block truncate">
                  {u.role === 'super_admin' ? 'Super Admin' : u.role === 'viewer' ? 'Driver' : u.role.replace('_', ' ')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Auth Method Switcher Tabs */}
      <div className="flex items-center bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-[11px] font-bold">
        <button
          type="button"
          onClick={() => {
            setAuthMode('password');
            setAuthError(null);
          }}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            authMode === 'password' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('pin');
            setAuthError(null);
          }}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            authMode === 'pin' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Driver PIN
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('biometric');
            setAuthError(null);
          }}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            authMode === 'biometric' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Face / Touch
        </button>
      </div>

      {/* Error Message */}
      {authError && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* MODE 1: EMAIL & PASSWORD */}
      {authMode === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          {/* Tenant Selector */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
              {t.auth.selectTenant}
            </label>
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedOrgId}
                onChange={(e) => onSelectOrg(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white cursor-pointer focus:outline-none"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id} className="bg-zinc-950 text-white">
                    {org.name} ({org.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
              {t.auth.emailLabel}
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@flottemaestro.ma"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
              {t.auth.passwordLabel}
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer mt-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In Mobile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* MODE 2: DRIVER 4-DIGIT PIN */}
      {authMode === 'pin' && (
        <div className="space-y-3">
          <div className="text-center space-y-1">
            <span className="text-[10px] text-zinc-400 font-bold block">
              {t.auth.enterDriverPin}
            </span>
            <span className="text-[9px] text-emerald-400 font-mono">Demo PIN: 1234</span>
          </div>

          {/* PIN Digits Display */}
          <div className="flex justify-center items-center gap-3 my-2">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pinDigits.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-base font-mono font-bold transition-all ${
                    isFilled
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-700'
                  }`}
                >
                  {isFilled ? '•' : ''}
                </div>
              );
            })}
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handlePinKeyPress(digit)}
                className="h-11 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-white font-mono font-black text-sm active:scale-95 transition-transform flex items-center justify-center shadow-sm cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <div />
            <button
              type="button"
              onClick={() => handlePinKeyPress('0')}
              className="h-11 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-white font-mono font-black text-sm active:scale-95 transition-transform flex items-center justify-center shadow-sm cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handlePinBackspace}
              className="h-11 rounded-2xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
              title="Backspace"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: BIOMETRIC LOGIN */}
      {authMode === 'biometric' && (
        <div className="space-y-4 text-center py-2">
          <div className="space-y-1">
            <span className="text-xs font-bold text-white block">
              {t.auth.biometricSignIn}
            </span>
            <p className="text-[10px] text-zinc-400">
              {t.auth.biometricScanPrompt}
            </p>
          </div>

          {/* Interactive Biometric Button */}
          <div className="flex justify-center my-3">
            <button
              type="button"
              onClick={handleBiometricScan}
              disabled={isScanningBiometric}
              className={`w-24 h-24 rounded-full border-2 flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
                biometricSuccess
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_24px_#10b981]'
                  : isScanningBiometric
                  ? 'bg-zinc-900 border-emerald-400 text-emerald-400 animate-pulse'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              {biometricSuccess ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
              ) : (
                <Fingerprint className="w-10 h-10 group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>

          <div className="text-[10px] font-mono text-zinc-500">
            {isScanningBiometric ? (
              <span className="text-emerald-400 font-bold">{t.auth.biometricScanning}</span>
            ) : biometricSuccess ? (
              <span className="text-emerald-400 font-bold">{t.auth.biometricSuccess}</span>
            ) : (
              <span>Tap sensor circle to authenticate</span>
            )}
          </div>
        </div>
      )}

      {/* Bottom Footer Note */}
      <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[9px] text-zinc-600 font-medium">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-zinc-500" />
          <span>Hardware Enclave SSL</span>
        </div>
        <span className="font-mono">V2.4 MOBILE</span>
      </div>
    </div>
  );
};
