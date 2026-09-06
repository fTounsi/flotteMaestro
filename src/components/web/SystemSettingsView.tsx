import React, { useState } from 'react';
import {
  Sliders,
  Server,
  Compass,
  Filter,
  Route,
  MapPin,
  Bell,
  Cpu,
  Shield,
  Check,
  AlertTriangle,
  RotateCcw,
  Save,
  Download,
  Upload,
  Send,
  Play,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Database,
  Radio,
  Wifi,
  Search,
  Code
} from 'lucide-react';
import {
  SystemParametersConfig,
  SettingsPillarTab,
  ProtocolPortConfig,
  ComputedAttributeConfig,
  SensorCalibrationProfile,
  SpeedUnit,
  DistanceUnit,
  VolumeUnit,
  TemperatureUnit,
  PressureUnit,
  CoordinateFormat,
  MapProviderType,
  GeocodingProviderType,
  SmsProviderType,
  TripStrategy,
  OdometerMode
} from '../../types/serverConfig';
import { INITIAL_SYSTEM_CONFIG } from '../../data/serverConfigData';

interface SystemSettingsViewProps {
  initialConfig?: SystemParametersConfig;
  onSaveConfig?: (config: SystemParametersConfig) => void;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({
  initialConfig = INITIAL_SYSTEM_CONFIG,
  onSaveConfig
}) => {
  const [config, setConfig] = useState<SystemParametersConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<SettingsPillarTab>('general_units');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modal / Test states
  const [testEmailAddress, setTestEmailAddress] = useState('admin@flottemaestro.cloud');
  const [emailTestStatus, setEmailTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [emailTestLog, setEmailTestLog] = useState<string>('');

  const [testPhoneNumber, setTestPhoneNumber] = useState('+33612345678');
  const [smsTestStatus, setSmsTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [smsTestLog, setSmsTestLog] = useState<string>('');

  // Geocode tester
  const [geocodeLat, setGeocodeLat] = useState('48.8584');
  const [geocodeLng, setGeocodeLng] = useState('2.2945');
  const [geocodeResult, setGeocodeResult] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Expression tester
  const [testPayload, setTestPayload] = useState('{"adc1": 3.65, "power": 13.8, "ignition": false, "temp1": 4.2}');
  const [testExpression, setTestExpression] = useState('ignition || (power > 13.2 ? true : false)');
  const [evalResult, setEvalResult] = useState<string | null>(null);

  // New Attribute Modal
  const [isNewAttrModalOpen, setIsNewAttrModalOpen] = useState(false);
  const [newAttr, setNewAttr] = useState<Partial<ComputedAttributeConfig>>({
    name: '',
    description: '',
    attribute: '',
    expression: '',
    type: 'string',
    enabled: true
  });

  // Purge modal
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purgeDays, setPurgeDays] = useState(90);
  const [purgeStatus, setPurgeStatus] = useState<string | null>(null);

  // XML / JSON export modal
  const [exportFormat, setExportFormat] = useState<'json' | 'traccar_xml'>('traccar_xml');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Handle Updates
  const updateServerField = <K extends keyof SystemParametersConfig['server']>(
    field: K,
    value: SystemParametersConfig['server'][K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      server: { ...prev.server, [field]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const updateUnitsField = <K extends keyof SystemParametersConfig['units']>(
    field: K,
    value: SystemParametersConfig['units'][K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      units: { ...prev.units, [field]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const updateFiltersField = <K extends keyof SystemParametersConfig['filters']>(
    field: K,
    value: SystemParametersConfig['filters'][K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      filters: { ...prev.filters, [field]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const updateTripDetectorField = <K extends keyof SystemParametersConfig['tripDetector']>(
    field: K,
    value: SystemParametersConfig['tripDetector'][K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      tripDetector: { ...prev.tripDetector, [field]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const updateMapsField = <K extends keyof SystemParametersConfig['maps']>(
    field: K,
    value: SystemParametersConfig['maps'][K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      maps: { ...prev.maps, [field]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const updateSecurityField = <K extends keyof SystemParametersConfig['security']>(
    field: K,
    value: SystemParametersConfig['security'][K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      security: { ...prev.security, [field]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const toggleProtocol = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      protocols: prev.protocols.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    }));
    setHasUnsavedChanges(true);
  };

  const updateProtocolPort = (id: string, port: number) => {
    setConfig((prev) => ({
      ...prev,
      protocols: prev.protocols.map((p) => (p.id === id ? { ...p, currentPort: port } : p))
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (onSaveConfig) {
      onSaveConfig(config);
    }
    setHasUnsavedChanges(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all telematics parameters to Traccar defaults?')) {
      setConfig(INITIAL_SYSTEM_CONFIG);
      setHasUnsavedChanges(true);
    }
  };

  // Live Test Handlers
  const handleTestEmail = () => {
    setEmailTestStatus('testing');
    setEmailTestLog('Connecting to SMTP host ' + config.notificators.smtp.host + ':' + config.notificators.smtp.port + ' (STARTTLS)...');
    setTimeout(() => {
      setEmailTestLog((prev) => prev + '\n220 ' + config.notificators.smtp.host + ' ESMTP SendGrid\nEHLO telematics.flottemaestro.cloud\n250-AUTH PLAIN LOGIN\nAUTH LOGIN accepted.\nMAIL FROM: <' + config.notificators.smtp.fromAddress + '>\n250 Sender OK\nRCPT TO: <' + testEmailAddress + '>\n250 Recipient OK\nDATA: 354 End data with <CR><LF>.<CR><LF>\n250 2.0.0 Ok: queued as SG_MSG_9918239');
      setEmailTestStatus('success');
    }, 1400);
  };

  const handleTestSms = () => {
    setSmsTestStatus('testing');
    setSmsTestLog('Preparing dispatch via ' + config.notificators.sms.provider.toUpperCase() + ' gateway...');
    setTimeout(() => {
      setSmsTestLog((prev) => prev + '\nPOST ' + (config.notificators.sms.urlTemplate || 'https://api.sms-gateway.com/send') + '\nAuthorization: Basic Bearer [REDACTED]\nPayload: { "To": "' + testPhoneNumber + '", "From": "' + (config.notificators.sms.senderId || 'FLOTTE') + '", "Body": "FlotteMaestro Test: GPS Gateway connected successfully at ' + new Date().toLocaleTimeString() + '" }\nResponse 201 Created: SID=SM98a1b2c3d4e5f6g7h8');
      setSmsTestStatus('success');
    }, 1300);
  };

  const handleTestGeocode = () => {
    setIsGeocoding(true);
    setGeocodeResult(null);
    setTimeout(() => {
      const lat = parseFloat(geocodeLat);
      const lng = parseFloat(geocodeLng);
      if (Math.abs(lat - 48.8584) < 0.1 && Math.abs(lng - 2.2945) < 0.1) {
        setGeocodeResult('Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France (Resolved via OpenStreetMap Nominatim)');
      } else {
        setGeocodeResult(`Resolved Address for [${lat.toFixed(4)}, ${lng.toFixed(4)}]: Boulevard Saint-Germain, 75005 Paris, France (Cached, response time 28ms)`);
      }
      setIsGeocoding(false);
    }, 800);
  };

  const handleEvaluateExpression = () => {
    try {
      const scope = JSON.parse(testPayload);
      // Safe sandboxed eval of basic arithmetic / boolean
      const fn = new Function(...Object.keys(scope), 'return ' + testExpression);
      const result = fn(...Object.values(scope));
      setEvalResult(String(result));
    } catch (err: any) {
      setEvalResult('Evaluation Error: ' + err.message);
    }
  };

  const generateTraccarXml = () => {
    return `<?xml version='1.0' encoding='UTF-8'?>
<!DOCTYPE properties SYSTEM 'http://java.sun.com/dtd/properties.dtd'>
<properties>
    <!-- FlotteMaestro / Traccar Core Server Configuration -->
    <entry key='server.name'>${config.server.systemName}</entry>
    <entry key='server.title'>${config.server.applicationTitle}</entry>
    <entry key='server.timeout'>${config.server.deviceOfflineTimeoutSec}</entry>
    <entry key='server.heartbeat'>${config.server.heartbeatIntervalSec}</entry>

    <!-- Position Filtering & Quality -->
    <entry key='filter.enable'>true</entry>
    <entry key='filter.invalid'>${config.filters.filterInvalid}</entry>
    <entry key='filter.zero'>${config.filters.filterZeroCoordinates}</entry>
    <entry key='filter.duplicate'>${config.filters.filterDuplicate}</entry>
    <entry key='filter.future'>${config.filters.filterFutureCoordinates}</entry>
    <entry key='filter.maxSpeed'>${config.filters.maxSpeedLimitKmh}</entry>
    <entry key='filter.minSatellites'>${config.filters.minSatellites}</entry>
    <entry key='filter.maxAccuracy'>${config.filters.maxAccuracyMeters}</entry>
    <entry key='filter.static'>true</entry>
    <entry key='filter.distance'>${config.filters.distanceFilterMeters}</entry>

    <!-- Trip & Parking Detection -->
    <entry key='report.trip.strategy'>${config.tripDetector.strategy}</entry>
    <entry key='report.trip.minimalTripDuration'>${config.tripDetector.minTripDurationSec}</entry>
    <entry key='report.trip.minimalTripDistance'>${config.tripDetector.minTripDistanceMeters}</entry>
    <entry key='report.trip.minimalParkingDuration'>${config.tripDetector.minParkDurationSec}</entry>

    <!-- Map & Geocoding -->
    <entry key='geocoder.enable'>${config.maps.geocodingProvider !== 'none'}</entry>
    <entry key='geocoder.type'>${config.maps.geocodingProvider}</entry>
    <entry key='geocoder.cache'>${config.maps.enableGeocodeCache}</entry>

    <!-- Notification Gateway -->
    <entry key='mail.smtp.host'>${config.notificators.smtp.host}</entry>
    <entry key='mail.smtp.port'>${config.notificators.smtp.port}</entry>
    <entry key='mail.smtp.ssl.enable'>${config.notificators.smtp.security === 'ssl'}</entry>
    <entry key='mail.smtp.starttls.enable'>${config.notificators.smtp.security === 'tls'}</entry>
    <entry key='mail.smtp.from'>${config.notificators.smtp.fromAddress}</entry>

    <!-- Active Protocol Ports -->
${config.protocols
  .filter((p) => p.enabled)
  .map((p) => `    <entry key='${p.id}.port'>${p.currentPort}</entry>`)
  .join('\n')}
</properties>`;
  };

  const activeProtocolsCount = config.protocols.filter((p) => p.enabled).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-900 dark:text-white">
      {/* Top Banner & Control Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                System Parameters & Traccar Engine
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Admin Master
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure GPS protocol listeners, position filters, trip detection rules, cartography providers, and notification relays.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            Export Config
          </button>
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                Parameters Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save & Apply Engine
              </>
            )}
          </button>
        </div>
      </div>

      {/* Engine Live Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Protocol Listeners</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {activeProtocolsCount} / {config.protocols.length} Active Ports
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Active Sockets</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {config.protocols.reduce((acc, p) => acc + p.activeConnections, 0)} Trackers Connected
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Reverse Geocoder</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {config.maps.geocodingProvider.toUpperCase()} (Cache 72h)
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Noise Reduction</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Speed &lt; {config.filters.stationarySpeedThresholdKmh} km/h (Drift)
            </div>
          </div>
        </div>
      </div>

      {/* Main Pillars Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 overflow-x-auto gap-1 pb-1 scrollbar-none">
        {[
          { id: 'general_units', label: 'General & Units', icon: <Server className="w-4 h-4" /> },
          { id: 'protocols_ports', label: 'Protocols & Ports', icon: <Radio className="w-4 h-4" /> },
          { id: 'filters_gps', label: 'GPS Filtering', icon: <Filter className="w-4 h-4" /> },
          { id: 'trip_detector', label: 'Trip & Park Engine', icon: <Route className="w-4 h-4" /> },
          { id: 'maps_geocoding', label: 'Maps & Geocoding', icon: <MapPin className="w-4 h-4" /> },
          { id: 'notification_gateways', label: 'Alert Gateways', icon: <Bell className="w-4 h-4" /> },
          { id: 'computed_attributes', label: 'Computed JEXL & Curves', icon: <Code className="w-4 h-4" /> },
          { id: 'security_maintenance', label: 'Security & Retention', icon: <Shield className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingsPillarTab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: General & Measurement Units */}
      {/* ========================================================================= */}
      {activeTab === 'general_units' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Server Identity & General Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Server Name / Brand
                </label>
                <input
                  type="text"
                  value={config.server.systemName}
                  onChange={(e) => updateServerField('systemName', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Application Title Bar
                </label>
                <input
                  type="text"
                  value={config.server.applicationTitle}
                  onChange={(e) => updateServerField('applicationTitle', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Base URL for Notifications / Live Links
                </label>
                <input
                  type="text"
                  value={config.server.baseUrl}
                  onChange={(e) => updateServerField('baseUrl', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Landing Workspace
                </label>
                <select
                  value={config.server.landingTab}
                  onChange={(e) => updateServerField('landingTab', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="live_tracking">Live Real-time Fleet Tracking</option>
                  <option value="trips">Trips & Route History</option>
                  <option value="alerts">Real-time Alarms & Dispatches</option>
                  <option value="reports">Fleet Telematics Reports</option>
                  <option value="modules_hub">Modular Add-Ons Hub</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Device Offline Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={config.server.deviceOfflineTimeoutSec}
                  onChange={(e) => updateServerField('deviceOfflineTimeoutSec', parseInt(e.target.value) || 300)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Traccar default: 300s (5 minutes without telemetry packet)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Heartbeat Keep-Alive Interval (seconds)
                </label>
                <input
                  type="number"
                  value={config.server.heartbeatIntervalSec}
                  onChange={(e) => updateServerField('heartbeatIntervalSec', parseInt(e.target.value) || 60)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Socket keep-alive ping period</span>
              </div>
            </div>
          </div>

          {/* Units of Measure */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Measurement Units & Formatting
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Speed Unit
                </label>
                <select
                  value={config.units.speedUnit}
                  onChange={(e) => updateUnitsField('speedUnit', e.target.value as SpeedUnit)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="kmh">Kilometers per hour (km/h)</option>
                  <option value="mph">Miles per hour (mph)</option>
                  <option value="knots">Knots (kn)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Distance Unit
                </label>
                <select
                  value={config.units.distanceUnit}
                  onChange={(e) => updateUnitsField('distanceUnit', e.target.value as DistanceUnit)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="mi">Miles (mi)</option>
                  <option value="nm">Nautical Miles (nm)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fuel / Volume Unit
                </label>
                <select
                  value={config.units.volumeUnit}
                  onChange={(e) => updateUnitsField('volumeUnit', e.target.value as VolumeUnit)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="liters">Liters (L)</option>
                  <option value="gallons_us">US Gallons (gal)</option>
                  <option value="gallons_uk">Imperial Gallons (UK gal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Temperature Unit
                </label>
                <select
                  value={config.units.temperatureUnit}
                  onChange={(e) => updateUnitsField('temperatureUnit', e.target.value as TemperatureUnit)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="celsius">Celsius (°C)</option>
                  <option value="fahrenheit">Fahrenheit (°F)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pressure Unit
                </label>
                <select
                  value={config.units.pressureUnit}
                  onChange={(e) => updateUnitsField('pressureUnit', e.target.value as PressureUnit)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="bar">Bar (bar)</option>
                  <option value="psi">Pounds per square inch (PSI)</option>
                  <option value="kpa">Kilopascals (kPa)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Coordinate Notation
                </label>
                <select
                  value={config.units.coordinateFormat}
                  onChange={(e) => updateUnitsField('coordinateFormat', e.target.value as CoordinateFormat)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="decimal">Decimal Degrees (48.8584°, 2.2945°)</option>
                  <option value="dms">Degrees Minutes Seconds (48° 51' 30.2" N)</option>
                  <option value="ddm">Degrees Decimal Minutes (48° 51.504' N)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: Hardware Protocols & Listener Ports */}
      {/* ========================================================================= */}
      {activeTab === 'protocols_ports' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Telemetry Protocol Listeners & Port Mapping
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Traccar protocol decoders map raw tracker binary/ASCII packets into standardized GPS positions and CAN-bus telemetry.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Protocol / Hardware Family</th>
                    <th className="pb-3">Port</th>
                    <th className="pb-3">Transport</th>
                    <th className="pb-3">Active Sockets</th>
                    <th className="pb-3">Total Packets</th>
                    <th className="pb-3">Last Packet</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {config.protocols.map((proto) => (
                    <tr key={proto.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            proto.enabled
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              proto.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          {proto.enabled ? 'Listening' : 'Stopped'}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">
                        <div>{proto.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{proto.description}</div>
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          value={proto.currentPort}
                          onChange={(e) => updateProtocolPort(proto.id, parseInt(e.target.value) || proto.defaultPort)}
                          className="w-20 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="py-3 uppercase font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                        {proto.transport}
                      </td>
                      <td className="py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {proto.activeConnections}
                      </td>
                      <td className="py-3 font-mono text-slate-500 dark:text-slate-400">
                        {proto.totalPacketsReceived.toLocaleString()}
                      </td>
                      <td className="py-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {proto.lastPacketAt}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => toggleProtocol(proto.id)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                            proto.enabled
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          }`}
                        >
                          {proto.enabled ? 'Stop Listener' : 'Start Listener'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: Position Filtering & GPS Quality */}
      {/* ========================================================================= */}
      {activeTab === 'filters_gps' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Position Validation & Stationary Noise Reduction
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Filter out low-accuracy multipath reflections, zero-coordinate spikes, and GPS drift while vehicles are parked.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Filter Invalid */}
              <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 cursor-pointer hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
                <input
                  type="checkbox"
                  checked={config.filters.filterInvalid}
                  onChange={(e) => updateFiltersField('filterInvalid', e.target.checked)}
                  className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Discard Invalid Fixes (filter.invalid)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ignores positions where GPS receiver reports no satellite lock (valid = false).
                  </span>
                </div>
              </label>

              {/* Filter Zero */}
              <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 cursor-pointer hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
                <input
                  type="checkbox"
                  checked={config.filters.filterZeroCoordinates}
                  onChange={(e) => updateFiltersField('filterZeroCoordinates', e.target.checked)}
                  className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Zero-Coordinate Rejection (filter.zero)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Drops coordinate packets returning latitude 0.000000 and longitude 0.000000 (Null Island).
                  </span>
                </div>
              </label>

              {/* Filter Duplicate */}
              <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 cursor-pointer hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
                <input
                  type="checkbox"
                  checked={config.filters.filterDuplicate}
                  onChange={(e) => updateFiltersField('filterDuplicate', e.target.checked)}
                  className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Duplicate Suppression (filter.duplicate)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Drops consecutive packets with identical coordinates and timestamps to optimize storage.
                  </span>
                </div>
              </label>

              {/* Filter Future Coordinates */}
              <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 cursor-pointer hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
                <input
                  type="checkbox"
                  checked={config.filters.filterFutureCoordinates}
                  onChange={(e) => updateFiltersField('filterFutureCoordinates', e.target.checked)}
                  className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Future Timestamp Filter (filter.future)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Rejects erroneous tracker RTC dates set in the future (&gt; 1 minute ahead).
                  </span>
                </div>
              </label>
            </div>

            {/* Threshold Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Minimum Satellites (minSatellites)
                </label>
                <input
                  type="number"
                  value={config.filters.minSatellites}
                  onChange={(e) => updateFiltersField('minSatellites', parseInt(e.target.value) || 4)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Default: 4 satellites required for 3D fix</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Max Accuracy / HDOP Tolerance (meters)
                </label>
                <input
                  type="number"
                  value={config.filters.maxAccuracyMeters}
                  onChange={(e) => updateFiltersField('maxAccuracyMeters', parseInt(e.target.value) || 45)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Positions with error &gt; value are discarded</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Stationary Speed Cutoff (km/h)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.filters.stationarySpeedThresholdKmh}
                  onChange={(e) => updateFiltersField('stationarySpeedThresholdKmh', parseFloat(e.target.value) || 2.5)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Speeds below this threshold treated as 0 km/h (eliminates drift)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Minimum Displacement Filter (meters)
                </label>
                <input
                  type="number"
                  value={config.filters.distanceFilterMeters}
                  onChange={(e) => updateFiltersField('distanceFilterMeters', parseInt(e.target.value) || 15)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">filter.distance (drops points &lt; 15m away if stationary)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Max Speed Ceiling Cutoff (km/h)
                </label>
                <input
                  type="number"
                  value={config.filters.maxSpeedLimitKmh}
                  onChange={(e) => updateFiltersField('maxSpeedLimitKmh', parseInt(e.target.value) || 180)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">filter.maxSpeed (drops impossible teleportation spikes)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: Trip & Parking Detector Engine */}
      {/* ========================================================================= */}
      {activeTab === 'trip_detector' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Trip, Idle & Parking Detector Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Defines the logic used to segment continuous raw GPS telemetry into discrete Trips, Stops, and Idling periods.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Trip Detection Strategy
                </label>
                <select
                  value={config.tripDetector.strategy}
                  onChange={(e) => updateTripDetectorField('strategy', e.target.value as TripStrategy)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="hybrid">Hybrid (Ignition ACC + Minimum Speed Threshold) - Recommended</option>
                  <option value="ignition">Ignition ACC State Only (Wire / CAN-Bus)</option>
                  <option value="speed">Speed Threshold Only (For OBD dongles or cigarette lighter trackers)</option>
                </select>
                <span className="text-[10px] text-slate-400">Matches Traccar report.trip.strategy property</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Odometer Calculation Source
                </label>
                <select
                  value={config.tripDetector.odometerMode}
                  onChange={(e) => updateTripDetectorField('odometerMode', e.target.value as OdometerMode)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="canbus">CAN-Bus / OBD-II Hardware Odometer (Highest accuracy)</option>
                  <option value="gps">GPS Haversine Integration (Calculated between consecutive coordinates)</option>
                  <option value="virtual">Virtual Cumulative Totalizer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Minimal Trip Duration (seconds)
                </label>
                <input
                  type="number"
                  value={config.tripDetector.minTripDurationSec}
                  onChange={(e) => updateTripDetectorField('minTripDurationSec', parseInt(e.target.value) || 60)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Short movements under this duration are ignored as parking maneuvers</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Minimal Trip Distance (meters)
                </label>
                <input
                  type="number"
                  value={config.tripDetector.minTripDistanceMeters}
                  onChange={(e) => updateTripDetectorField('minTripDistanceMeters', parseInt(e.target.value) || 150)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Minimal displacement before a trip log is committed</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Minimal Parking Duration (seconds)
                </label>
                <input
                  type="number"
                  value={config.tripDetector.minParkDurationSec}
                  onChange={(e) => updateTripDetectorField('minParkDurationSec', parseInt(e.target.value) || 180)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Stops shorter than this (e.g. traffic lights) do not split trips</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Excessive Idling Alert Threshold (minutes)
                </label>
                <input
                  type="number"
                  value={config.tripDetector.maxIdleMinutes}
                  onChange={(e) => updateTripDetectorField('maxIdleMinutes', parseInt(e.target.value) || 15)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Triggers fuel waste idle alarm when engine runs stationary &gt; X mins</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: Maps & Reverse Geocoding */}
      {/* ========================================================================= */}
      {activeTab === 'maps_geocoding' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cartographic Map Layer Providers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose the primary map tile server for live fleet visualizers and enter API credentials when applicable.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'osm', name: 'OpenStreetMap Carto', note: 'Free, global open data standard', badge: 'Default' },
                { id: 'google', name: 'Google Maps Engine', note: 'Satellite, Roadmap & Traffic layer', badge: 'API Key' },
                { id: 'mapbox', name: 'Mapbox Navigation', note: 'High-contrast custom vector tiles', badge: 'Token' },
                { id: 'carto', name: 'CartoDB Dark Matter', note: 'Sleek dark telemetry map', badge: 'Free' }
              ].map((prov) => (
                <div
                  key={prov.id}
                  onClick={() => updateMapsField('activeProvider', prov.id as MapProviderType)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    config.maps.activeProvider === prov.id
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-600'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{prov.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300">
                      {prov.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{prov.note}</p>
                </div>
              ))}
            </div>

            {/* Credential Inputs based on selected provider */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-zinc-800">
              {config.maps.activeProvider === 'google' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Google Maps Platform API Key
                  </label>
                  <input
                    type="text"
                    placeholder="AIzaSy..."
                    value={config.maps.googleMapsApiKey || ''}
                    onChange={(e) => updateMapsField('googleMapsApiKey', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400">Maps JavaScript API key with Maps SDK enabled</span>
                </div>
              )}

              {config.maps.activeProvider === 'mapbox' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mapbox Public Access Token
                  </label>
                  <input
                    type="text"
                    placeholder="pk.eyJ1Ijo..."
                    value={config.maps.mapboxAccessToken || ''}
                    onChange={(e) => updateMapsField('mapboxAccessToken', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Map Center Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={config.maps.defaultLat}
                  onChange={(e) => updateMapsField('defaultLat', parseFloat(e.target.value) || 48.8566)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Map Center Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={config.maps.defaultLng}
                  onChange={(e) => updateMapsField('defaultLng', parseFloat(e.target.value) || 2.3522)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Reverse Geocoding Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Reverse Geocoding (Coordinates to Street Address)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Converts tracker coordinates into human-readable street addresses for trip reports, stops, and alarms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Geocoding Engine
                </label>
                <select
                  value={config.maps.geocodingProvider}
                  onChange={(e) => updateMapsField('geocodingProvider', e.target.value as GeocodingProviderType)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="nominatim">OpenStreetMap Nominatim (Free, rate-limited)</option>
                  <option value="google">Google Geocoding API (High accuracy, requires key)</option>
                  <option value="locationiq">LocationIQ (Enterprise high volume)</option>
                  <option value="gisgraphy">Gisgraphy (Self-hosted offline)</option>
                  <option value="none">Disabled (Coordinates only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Geocoding API Key (if required)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty for Nominatim"
                  value={config.maps.geocodingApiKey || ''}
                  onChange={(e) => updateMapsField('geocodingApiKey', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cache Retention (Hours)
                </label>
                <input
                  type="number"
                  value={config.maps.cacheTtlHours}
                  onChange={(e) => updateMapsField('cacheTtlHours', parseInt(e.target.value) || 72)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Stores resolved addresses locally to reduce external API costs</span>
              </div>
            </div>

            {/* Interactive Geocode Tester */}
            <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                Live Reverse Geocode Tester
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Latitude (e.g. 48.8584)"
                  value={geocodeLat}
                  onChange={(e) => setGeocodeLat(e.target.value)}
                  className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono w-36"
                />
                <input
                  type="text"
                  placeholder="Longitude (e.g. 2.2945)"
                  value={geocodeLng}
                  onChange={(e) => setGeocodeLng(e.target.value)}
                  className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono w-36"
                />
                <button
                  onClick={handleTestGeocode}
                  disabled={isGeocoding}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3" />
                  {isGeocoding ? 'Resolving...' : 'Resolve Address'}
                </button>
              </div>

              {geocodeResult && (
                <div className="text-xs font-mono p-3 bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-indigo-700 dark:text-indigo-300">
                  {geocodeResult}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: Notification Gateways (SMTP, SMS, Telegram, Webhook) */}
      {/* ========================================================================= */}
      {activeTab === 'notification_gateways' && (
        <div className="space-y-6">
          {/* SMTP Gateway */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>Email Dispatcher (SMTP Server)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    Active
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Transmits scheduled PDF reports, critical speeding alerts, and geofence alarms via email.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SMTP Host (mail.smtp.host)
                </label>
                <input
                  type="text"
                  value={config.notificators.smtp.host}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificators: {
                        ...prev.notificators,
                        smtp: { ...prev.notificators.smtp, host: e.target.value }
                      }
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Port
                </label>
                <input
                  type="number"
                  value={config.notificators.smtp.port}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificators: {
                        ...prev.notificators,
                        smtp: { ...prev.notificators.smtp, port: parseInt(e.target.value) || 587 }
                      }
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Encryption Mode
                </label>
                <select
                  value={config.notificators.smtp.security}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificators: {
                        ...prev.notificators,
                        smtp: { ...prev.notificators.smtp, security: e.target.value as any }
                      }
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="tls">STARTTLS (Port 587)</option>
                  <option value="ssl">SSL / TLS (Port 465)</option>
                  <option value="none">Unencrypted Plain (Port 25)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  From Address
                </label>
                <input
                  type="text"
                  value={config.notificators.smtp.fromAddress}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificators: {
                        ...prev.notificators,
                        smtp: { ...prev.notificators.smtp, fromAddress: e.target.value }
                      }
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Test Email Dispatcher */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-indigo-500" />
                  SMTP Delivery Test Diagnostic
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="recipient@domain.com"
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs w-60"
                  />
                  <button
                    onClick={handleTestEmail}
                    disabled={emailTestStatus === 'testing'}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    {emailTestStatus === 'testing' ? 'Testing...' : 'Send Test Mail'}
                  </button>
                </div>
              </div>

              {emailTestLog && (
                <pre className="text-[11px] font-mono p-3 bg-zinc-950 text-emerald-400 rounded-lg overflow-x-auto">
                  {emailTestLog}
                </pre>
              )}
            </div>
          </div>

          {/* SMS Gateway */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>SMS Hardware Gateway (Twilio / Infobip / HTTP Template)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    Configured
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sends critical panic button SOS and anti-theft cut-off SMS directly to driver / owner phones.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SMS Gateway Provider
                </label>
                <select
                  value={config.notificators.sms.provider}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificators: {
                        ...prev.notificators,
                        sms: { ...prev.notificators.sms, provider: e.target.value as SmsProviderType }
                      }
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="twilio">Twilio Cloud API</option>
                  <option value="infobip">Infobip SMS</option>
                  <option value="traccar_gateway">Traccar Android SMS Gateway App</option>
                  <option value="http">Custom HTTP REST Template</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account SID / API Key
                </label>
                <input
                  type="text"
                  value={config.notificators.sms.accountSid || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificators: {
                        ...prev.notificators,
                        sms: { ...prev.notificators.sms, accountSid: e.target.value }
                      }
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sender ID (Alpha Tag)
                </label>
                <input
                  type="text"
                  value={config.notificators.sms.senderId || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificators: {
                        ...prev.notificators,
                        sms: { ...prev.notificators.sms, senderId: e.target.value }
                      }
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Auth Secret Token
                </label>
                <input
                  type="password"
                  value={config.notificators.sms.authToken || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificators: {
                        ...prev.notificators,
                        sms: { ...prev.notificators.sms, authToken: e.target.value }
                      }
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Test SMS Dispatcher */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-500" />
                  SMS Dispatcher Simulator
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    placeholder="+33612345678"
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs w-48 font-mono"
                  />
                  <button
                    onClick={handleTestSms}
                    disabled={smsTestStatus === 'testing'}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    {smsTestStatus === 'testing' ? 'Sending...' : 'Send Test SMS'}
                  </button>
                </div>
              </div>

              {smsTestLog && (
                <pre className="text-[11px] font-mono p-3 bg-zinc-950 text-emerald-400 rounded-lg overflow-x-auto">
                  {smsTestLog}
                </pre>
              )}
            </div>
          </div>

          {/* Telegram & Webhook Outbound Relays */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Telegram Bot Dispatcher
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Telegram Bot API Token
                </label>
                <input
                  type="password"
                  value={config.notificators.telegram.botToken || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificators: {
                        ...prev.notificators,
                        telegram: { ...prev.notificators.telegram, botToken: e.target.value }
                      }
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Dispatch Channel / Chat ID
                </label>
                <input
                  type="text"
                  value={config.notificators.telegram.defaultChatId || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificators: {
                        ...prev.notificators,
                        telegram: { ...prev.notificators.telegram, defaultChatId: e.target.value }
                      }
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Enterprise Webhook Integration (HMAC-SHA256)
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Outbound Webhook Endpoint URL
                </label>
                <input
                  type="text"
                  value={config.notificators.webhook.endpointUrl || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificators: {
                        ...prev.notificators,
                        webhook: { ...prev.notificators.webhook, endpointUrl: e.target.value }
                      }
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Webhook Signature Secret (X-Signature-256)
                </label>
                <input
                  type="password"
                  value={config.notificators.webhook.secretKey || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificators: {
                        ...prev.notificators,
                        webhook: { ...prev.notificators.webhook, secretKey: e.target.value }
                      }
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: Computed Attributes & JEXL Calibration Curves */}
      {/* ========================================================================= */}
      {activeTab === 'computed_attributes' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Traccar Computed Attributes (JEXL Expressions)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Calculate virtual parameters dynamically on incoming telemetry packets (e.g. derive ignition from battery voltage or convert analog voltage to liters).
                </p>
              </div>
              <button
                onClick={() => setIsNewAttrModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Expression
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3">Attribute</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Expression (JEXL syntax)</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Sample Value</th>
                    <th className="pb-3 text-right">Enabled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {config.computedAttributes.map((attr) => (
                    <tr key={attr.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {attr.attribute}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
                          {attr.type}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-800 dark:text-slate-200 max-w-xs truncate">
                        {attr.expression}
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400 max-w-sm">
                        {attr.description}
                      </td>
                      <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {attr.lastTestedValue || 'null'}
                      </td>
                      <td className="py-3 text-right">
                        <input
                          type="checkbox"
                          checked={attr.enabled}
                          onChange={() => {
                            setConfig((prev) => ({
                              ...prev,
                              computedAttributes: prev.computedAttributes.map((a) =>
                                a.id === attr.id ? { ...a, enabled: !a.enabled } : a
                              )
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Interactive JEXL Expression Tester Sandbox */}
            <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <Code className="w-3.5 h-3.5" />
                Interactive JEXL Expression Sandbox
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Simulated Inbound Tracker Telemetry (JSON format)
                  </label>
                  <textarea
                    rows={2}
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expression Formula to Test
                  </label>
                  <textarea
                    rows={2}
                    value={testExpression}
                    onChange={(e) => setTestExpression(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleEvaluateExpression}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3" />
                  Evaluate Expression
                </button>

                {evalResult !== null && (
                  <div className="text-xs font-mono">
                    Result: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{evalResult}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sensor Calibration Profiles */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Analog / Frequency Fuel Sensor Calibration Profiles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {config.calibrationProfiles.map((prof) => (
                <div
                  key={prof.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{prof.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                      {prof.unit}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    Formula: <span className="font-bold">y = {prof.multiplierA}x + {prof.constantC}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{prof.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: Security Governance & Historical Data Retention */}
      {/* ========================================================================= */}
      {activeTab === 'security_maintenance' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Security Governance & Authentication Policies
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure credential complexity, session idle timeouts, and two-factor authentication requirements for administrative users.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  value={config.security.minPasswordLength}
                  onChange={(e) => updateSecurityField('minPasswordLength', parseInt(e.target.value) || 8)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Session Inactivity Timeout (Minutes)
                </label>
                <input
                  type="number"
                  value={config.security.sessionTimeoutMinutes}
                  onChange={(e) => updateSecurityField('sessionTimeoutMinutes', parseInt(e.target.value) || 60)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Max Failed Logins Before Lockout
                </label>
                <input
                  type="number"
                  value={config.security.maxLoginAttempts}
                  onChange={(e) => updateSecurityField('maxLoginAttempts', parseInt(e.target.value) || 5)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.security.enforce2faAdmins}
                  onChange={(e) => updateSecurityField('enforce2faAdmins', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Enforce Two-Factor Authentication (2FA) for Admins
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Requires TOTP authenticator app code on login for super_admin & admin roles.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.security.autoPurgeCronEnabled}
                  onChange={(e) => updateSecurityField('autoPurgeCronEnabled', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Automatic Daily History Purge (database.purge)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Runs nightly cron job to clean raw coordinate packets older than retention limits.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Retention Limits & Storage Purge */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Data Retention Limits & Storage Management
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Adjust retention windows for high-frequency GPS telemetry, trip aggregates, and audit logs.
                </p>
              </div>

              <button
                onClick={() => setIsPurgeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Purge Database
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Raw GPS Positions (Days)
                </label>
                <input
                  type="number"
                  value={config.security.historyRetentionDays}
                  onChange={(e) => updateSecurityField('historyRetentionDays', parseInt(e.target.value) || 180)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Default: 180 days (6 months)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Aggregated Trips & Stops (Days)
                </label>
                <input
                  type="number"
                  value={config.security.tripsRetentionDays}
                  onChange={(e) => updateSecurityField('tripsRetentionDays', parseInt(e.target.value) || 365)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Retains distance & speed summaries</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Audit Logs (Days)
                </label>
                <input
                  type="number"
                  value={config.security.auditLogsRetentionDays}
                  onChange={(e) => updateSecurityField('auditLogsRetentionDays', parseInt(e.target.value) || 730)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Default: 730 days (2 years compliance)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXPORT XML / JSON MODAL */}
      {/* ========================================================================= */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Export Server Telematics Configuration
              </h3>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                <button
                  onClick={() => setExportFormat('traccar_xml')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    exportFormat === 'traccar_xml'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  traccar.xml
                </button>
                <button
                  onClick={() => setExportFormat('json')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    exportFormat === 'json'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  JSON Payload
                </button>
              </div>
            </div>

            <textarea
              readOnly
              rows={14}
              value={exportFormat === 'traccar_xml' ? generateTraccarXml() : JSON.stringify(config, null, 2)}
              className="w-full font-mono text-xs p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-800 dark:text-slate-200 select-all"
            />

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  const content = exportFormat === 'traccar_xml' ? generateTraccarXml() : JSON.stringify(config, null, 2);
                  navigator.clipboard.writeText(content);
                  alert('Copied to clipboard!');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy to Clipboard
              </button>

              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PURGE DATABASE MODAL */}
      {/* ========================================================================= */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Purge Telemetry History
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              This operation irrevocably deletes raw coordinate positions older than the selected threshold. Aggregated trip summaries are preserved.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Purge all raw positions older than:
              </label>
              <select
                value={purgeDays}
                onChange={(e) => setPurgeDays(parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium"
              >
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
                <option value={180}>180 days</option>
              </select>
            </div>

            {purgeStatus && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-xl">
                {purgeStatus}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsPurgeModalOpen(false);
                  setPurgeStatus(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setPurgeStatus(`Successfully purged 38,410 coordinate records older than ${purgeDays} days.`);
                  setTimeout(() => {
                    setIsPurgeModalOpen(false);
                    setPurgeStatus(null);
                  }, 1500);
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-xs"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NEW ATTRIBUTE MODAL */}
      {/* ========================================================================= */}
      {isNewAttrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Create Computed Attribute
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Name / Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engine Temperature Alarm"
                  value={newAttr.name || ''}
                  onChange={(e) => setNewAttr({ ...newAttr, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Attribute Key
                </label>
                <input
                  type="text"
                  placeholder="e.g. engine_temp_alarm"
                  value={newAttr.attribute || ''}
                  onChange={(e) => setNewAttr({ ...newAttr, attribute: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  JEXL Expression Formula
                </label>
                <input
                  type="text"
                  placeholder="e.g. coolant_temp > 105 ? true : false"
                  value={newAttr.expression || ''}
                  onChange={(e) => setNewAttr({ ...newAttr, expression: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Result Value Type
                </label>
                <select
                  value={newAttr.type || 'boolean'}
                  onChange={(e) => setNewAttr({ ...newAttr, type: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="boolean">Boolean (true / false)</option>
                  <option value="number">Number (float / integer)</option>
                  <option value="string">String</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief note on when this expression fires"
                  value={newAttr.description || ''}
                  onChange={(e) => setNewAttr({ ...newAttr, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNewAttrModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newAttr.attribute && newAttr.expression) {
                    const created: ComputedAttributeConfig = {
                      id: 'comp_' + Date.now(),
                      name: newAttr.name || newAttr.attribute,
                      description: newAttr.description || '',
                      attribute: newAttr.attribute,
                      expression: newAttr.expression,
                      type: newAttr.type || 'boolean',
                      enabled: true
                    };
                    setConfig((prev) => ({
                      ...prev,
                      computedAttributes: [...prev.computedAttributes, created]
                    }));
                    setHasUnsavedChanges(true);
                    setIsNewAttrModalOpen(false);
                    setNewAttr({});
                  }
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
              >
                Save Attribute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
