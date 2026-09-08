import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  LayoutDashboard,
  Truck,
  Bell,
  Settings,
  Battery,
  User as UserIcon,
  Shield,
  Fingerprint,
  LogOut,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Lock,
  Smartphone
} from 'lucide-react';
import { Vehicle, Geofence, Alert, FleetReport, Organization, User } from '../../types/fleet';
import { TranslationDictionary, Language } from '../../translations/i18n';
import { MobileLoginView } from './MobileLoginView';
import { ThemeToggle } from '../common/ThemeToggle';

interface MobileAppFrameProps {
  vehicles: Vehicle[];
  geofences: Geofence[];
  alerts: Alert[];
  reports: FleetReport[];
  organizations: Organization[];
  selectedOrgId: string;
  onSelectOrg: (orgId: string) => void;
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  onLogin: (user: User) => void;
  onLogout: () => void;
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  t: TranslationDictionary;
}

export const MobileAppFrame: React.FC<MobileAppFrameProps> = ({
  vehicles,
  geofences,
  alerts,
  reports,
  organizations,
  selectedOrgId,
  onSelectOrg,
  users,
  currentUser,
  isAuthenticated,
  onLogin,
  onLogout,
  currentLang,
  onLangChange,
  t
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vehicles' | 'alerts' | 'profile'>('dashboard');
  const [deviceModel, setDeviceModel] = useState<'iphone' | 'pixel' | 'responsive'>('iphone');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(vehicles[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [forceMobileLoginView, setForceMobileLoginView] = useState(false);

  const mobileMapContainerRef = useRef<HTMLDivElement>(null);
  const mobileMapInstanceRef = useRef<L.Map | null>(null);
  const mobileMarkersRef = useRef<Record<string, L.Marker>>({});

  const activeOrg = organizations.find((o) => o.id === selectedOrgId) || organizations[0];
  const loggedInUser = currentUser || users[0];
  const isCurrentlyAuthed = isAuthenticated && !forceMobileLoginView;

  // Initialize and update mobile radar map
  useEffect(() => {
    if (!isCurrentlyAuthed) return;
    if (activeTab !== 'dashboard') return;
    if (!mobileMapContainerRef.current) return;

    if (!mobileMapInstanceRef.current) {
      const map = L.map(mobileMapContainerRef.current, {
        center: [33.5731, -7.5898],
        zoom: 11,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abc',
        maxZoom: 19
      }).addTo(map);

      mobileMapInstanceRef.current = map;
    }

    const map = mobileMapInstanceRef.current;
    if (map) {
      vehicles.forEach((veh) => {
        const pos = veh.latestPosition;
        const icon = L.divIcon({
          className: 'mob-marker',
          html: `
            <div class="w-7 h-7 rounded-xl ${veh.status === 'moving' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-700'} border border-white flex items-center justify-center text-white text-[10px] font-bold">
              ▲
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        if (mobileMarkersRef.current[veh.id]) {
          mobileMarkersRef.current[veh.id].setLatLng([pos.latitude, pos.longitude]);
        } else {
          const marker = L.marker([pos.latitude, pos.longitude], { icon }).addTo(map);
          marker.on('click', () => setSelectedVehicle(veh));
          mobileMarkersRef.current[veh.id] = marker;
        }
      });
    }
  }, [activeTab, vehicles, isCurrentlyAuthed]);

  return (
    <div className="flex flex-col items-center justify-center py-4 space-y-6">
      {/* Top Device Bar & Quick Auth State Toggle */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Device Form Factor Switcher */}
        <div className="flex items-center gap-2 bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800 text-xs">
          <button
            onClick={() => setDeviceModel('iphone')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              deviceModel === 'iphone' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.mobile.iphone}
          </button>
          <button
            onClick={() => setDeviceModel('pixel')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              deviceModel === 'pixel' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.mobile.pixel}
          </button>
          <button
            onClick={() => setDeviceModel('responsive')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              deviceModel === 'responsive' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.mobile.fullScreen}
          </button>
        </div>

        {/* Quick Mobile Auth Preview Toggle */}
        <div className="flex items-center bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800 text-xs">
          <button
            onClick={() => {
              setForceMobileLoginView(false);
              if (!isAuthenticated) onLogin(loggedInUser);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              isCurrentlyAuthed ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mobile App</span>
          </button>
          <button
            onClick={() => setForceMobileLoginView(true)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              !isCurrentlyAuthed ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Mobile Login</span>
          </button>
        </div>

        {/* Theme Switcher Toggle */}
        <ThemeToggle variant="pill" />
      </div>

      {/* Device Chassis Frame */}
      <div
        className={`transition-all duration-300 ${
          deviceModel === 'iphone'
            ? 'w-[390px] h-[820px] rounded-[54px] border-[10px] border-zinc-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] relative overflow-hidden bg-[#080808] flex flex-col ring-1 ring-zinc-700/60'
            : deviceModel === 'pixel'
            ? 'w-[400px] h-[830px] rounded-[44px] border-[10px] border-zinc-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] relative overflow-hidden bg-[#080808] flex flex-col ring-1 ring-zinc-700/60'
            : 'w-full max-w-lg min-h-[750px] rounded-[32px] border border-zinc-800 shadow-2xl bg-[#080808] flex flex-col overflow-hidden'
        }`}
      >
        {/* Dynamic Island / Notch */}
        {deviceModel === 'iphone' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3 border border-zinc-800/80">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
          </div>
        )}

        {/* Mobile Status Bar */}
        <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-bold text-zinc-400 z-40 bg-[#080808]/90 backdrop-blur-md select-none">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-emerald-400 font-mono font-bold">5G</span>
            <Battery className="w-3.5 h-3.5 text-zinc-300" />
          </div>
        </div>

        {/* Mobile Brand Header */}
        <div className="px-5 py-3 border-b border-zinc-900 bg-[#080808] flex items-center justify-between">
          <div>
            <h4 className="text-base font-black italic tracking-tighter leading-none text-white">
              FLOTTE<span className="text-zinc-600">MAESTRO</span>
            </h4>
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold block mt-0.5">
              {activeOrg.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => onLangChange(currentLang === 'en' ? 'fr' : currentLang === 'fr' ? 'ar' : 'en')}
              className="px-2 py-0.5 rounded-lg bg-zinc-900 text-[10px] font-bold text-white border border-zinc-800"
            >
              {currentLang.toUpperCase()}
            </button>

            {/* Quick Mobile Auth Button */}
            {isCurrentlyAuthed ? (
              <button
                onClick={() => setForceMobileLoginView(true)}
                title="Lock / Sign Out"
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* CONDITION 1: MOBILE LOGIN VIEW */}
        {!isCurrentlyAuthed ? (
          <MobileLoginView
            organizations={organizations}
            selectedOrgId={selectedOrgId}
            onSelectOrg={onSelectOrg}
            users={users}
            onLogin={(user) => {
              setForceMobileLoginView(false);
              onLogin(user);
            }}
            currentLang={currentLang}
            onLangChange={onLangChange}
            t={t}
          />
        ) : (
          /* CONDITION 2: LOGGED-IN MOBILE FLEET PORTAL */
          <>
            {/* Mobile Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 text-zinc-100 space-y-4">
              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Fleet Metric Stats */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-zinc-900/40 p-3.5 rounded-[24px] border border-zinc-800 shadow-md">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold block">
                        Active Moving
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-emerald-400 font-mono">
                          {vehicles.filter((v) => v.status === 'moving').length}
                        </span>
                        <span className="text-[10px] text-zinc-500">/ {vehicles.length}</span>
                      </div>
                    </div>

                    <div className="bg-zinc-900/40 p-3.5 rounded-[24px] border border-zinc-800 shadow-md">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold block">
                        Stationary
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-white font-mono">
                          {vehicles.filter((v) => v.status === 'stopped' || v.status === 'idle').length}
                        </span>
                        <span className="text-[10px] text-zinc-500">units</span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Mini Live Map */}
                  <div className="h-48 rounded-[24px] overflow-hidden border border-zinc-800 relative shadow-xl bg-black isolate z-0">
                    <div ref={mobileMapContainerRef} className="w-full h-full" />
                  </div>

                  {/* Quick Vehicle List */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Live Unit Telemetry
                    </h5>
                    {vehicles.slice(0, 4).map((v) => (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicle(v)}
                        className="p-3 rounded-2xl bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-white bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                              {v.licensePlate}
                            </span>
                            <span className="text-xs font-semibold text-zinc-300">
                              {v.make} {v.model}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block mt-0.5 capitalize">
                            {v.status} • {v.latestPosition.battery}% Batt
                          </span>
                        </div>

                        <span className="font-mono font-bold text-xs text-emerald-400">
                          {v.latestPosition.speed} km/h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: VEHICLES */}
              {activeTab === 'vehicles' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search fleet units..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none"
                  />

                  <div className="space-y-2">
                    {vehicles
                      .filter((v) =>
                        v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        v.model.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((v) => (
                        <div
                          key={v.id}
                          className="p-3.5 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex justify-between items-center"
                        >
                          <div>
                            <span className="font-mono font-bold text-xs text-white">{v.licensePlate}</span>
                            <p className="text-xs text-zinc-400">{v.make} {v.model}</p>
                            <span className="text-[9px] text-zinc-500">{v.fleetName}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-emerald-400 font-bold text-xs">{v.latestPosition.speed} km/h</span>
                            <span className="text-[9px] text-zinc-500 block uppercase font-mono">{v.status}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ALERTS */}
              {activeTab === 'alerts' && (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Push Incidents
                  </h5>
                  {alerts.map((alt) => (
                    <div key={alt.id} className="p-3 rounded-2xl bg-zinc-900/30 border border-zinc-800 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-white">
                        <span>{alt.title}</span>
                        <span className="text-emerald-400 font-mono">{alt.vehiclePlate}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">{alt.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: PROFILE & SECURITY SETTINGS */}
              {activeTab === 'profile' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* User Profile Card */}
                  <div className="p-4 rounded-[24px] bg-zinc-900/50 border border-zinc-800 text-center space-y-2">
                    <img
                      src={loggedInUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                      alt={loggedInUser.name}
                      className="w-16 h-16 rounded-full border-2 border-emerald-500/80 mx-auto object-cover shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                    <h4 className="text-base font-bold text-white leading-tight">
                      {loggedInUser.name}
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono">
                      {loggedInUser.email}
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <span className="text-[9px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        {loggedInUser.role.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-bold">
                        {activeOrg.name}
                      </span>
                    </div>
                  </div>

                  {/* Security Settings & Biometrics */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Security & Device Settings
                    </h5>

                    <div className="p-3 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-emerald-400" />
                        <span>Biometric Quick Unlock</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">ACTIVE</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>Hardware Enclave SSL</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">TLS 1.3</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-300">App Theme</span>
                      <ThemeToggle variant="pill" />
                    </div>
                  </div>

                  {/* Sign Out Action Button */}
                  <button
                    onClick={() => setForceMobileLoginView(true)}
                    className="w-full py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.auth.signOut} (Mobile)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="border-t border-zinc-900 bg-[#080808] px-4 py-2.5 flex items-center justify-around z-40 select-none">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                  activeTab === 'dashboard' ? 'text-white' : 'text-zinc-600'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Radar</span>
              </button>
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                  activeTab === 'vehicles' ? 'text-white' : 'text-zinc-600'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Fleet</span>
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                  activeTab === 'alerts' ? 'text-white' : 'text-zinc-600'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Alerts</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                  activeTab === 'profile' ? 'text-white' : 'text-zinc-600'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
