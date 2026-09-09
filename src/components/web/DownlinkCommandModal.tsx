import React, { useState } from 'react';
import {
  X,
  Radio,
  Zap,
  Power,
  RotateCcw,
  Navigation,
  Clock,
  Terminal,
  Send,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ShieldAlert,
  History,
  Lock
} from 'lucide-react';
import { Vehicle, User } from '../../types/fleet';
import {
  TelematicsCommand,
  CommandType,
  CommandChannel,
  COMMAND_PRESETS
} from '../../types/telematicsCommand';
import { userHasPermission } from '../../types/rbac';

interface DownlinkCommandModalProps {
  vehicle: Vehicle;
  currentUser: User | null;
  onClose: () => void;
  onCommandDispatched?: (cmd: TelematicsCommand) => void;
}

export const DownlinkCommandModal: React.FC<DownlinkCommandModalProps> = ({
  vehicle,
  currentUser,
  onClose,
  onCommandDispatched
}) => {
  const canSendCommands = userHasPermission(currentUser, 'vehicles:commands');
  const [selectedType, setSelectedType] = useState<CommandType>('engine_stop');
  const [channel, setChannel] = useState<CommandChannel>('gprs_tcp');
  const [customPayload, setCustomPayload] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [safetyConfirmation, setSafetyConfirmation] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'console' | 'history'>('console');

  // Local simulated command log
  const [commandHistory, setCommandHistory] = useState<TelematicsCommand[]>([
    {
      id: 'cmd_init_01',
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.licensePlate,
      trackerImei: vehicle.trackerImei || '868120492817294',
      trackerProtocol: vehicle.trackerProtocol || 'teltonika',
      commandType: 'get_location',
      channel: 'gprs_tcp',
      payload: 'getgps',
      status: 'acknowledged',
      sentBy: {
        userId: currentUser?.id || 'usr_admin',
        userName: currentUser?.name || 'Dispatcher',
        userEmail: currentUser?.email || 'ops@flottemaestro.ma'
      },
      queuedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      sentAt: new Date(Date.now() - 25 * 60 * 1000 + 40).toISOString(),
      acknowledgedAt: new Date(Date.now() - 25 * 60 * 1000 + 180).toISOString(),
      executionLatencyMs: 140,
      responsePayload: 'GPS: 33.5852,-7.5321 Speed:0 Alt:42m Sat:18'
    }
  ]);

  const activePreset = COMMAND_PRESETS.find((p) => p.type === selectedType) || COMMAND_PRESETS[0];
  const defaultPayload = activePreset.getDefaultPayload(vehicle.trackerProtocol || 'teltonika');
  const activePayload = selectedType === 'custom_payload' ? customPayload : (customPayload || defaultPayload);

  const handleExecute = () => {
    if (!canSendCommands || isExecuting) return;

    if (activePreset.isDangerous && !safetyConfirmation) {
      alert('Please check the safety confirmation checkbox to proceed with high-risk operations.');
      return;
    }

    setIsExecuting(true);

    const newCmd: TelematicsCommand = {
      id: `cmd_${Date.now().toString(36)}`,
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.licensePlate,
      trackerImei: vehicle.trackerImei || '868120492817294',
      trackerProtocol: vehicle.trackerProtocol || 'teltonika',
      commandType: selectedType,
      channel,
      payload: activePayload,
      status: 'queued',
      sentBy: {
        userId: currentUser?.id || 'usr_admin',
        userName: currentUser?.name || 'Dispatcher',
        userEmail: currentUser?.email || 'ops@flottemaestro.ma'
      },
      queuedAt: new Date().toISOString()
    };

    // Simulate real-time socket downlink transmission & ACK response
    setTimeout(() => {
      const latency = Math.floor(Math.random() * 80) + 95; // 95-175ms
      let mockResponse = 'OK';
      if (selectedType === 'engine_stop') {
        mockResponse = '[ACK] DO1 set to 1. Fuel relay tripped. Engine immobilized.';
      } else if (selectedType === 'engine_resume') {
        mockResponse = '[ACK] DO1 set to 0. Fuel relay cleared. Engine starter unlocked.';
      } else if (selectedType === 'reboot') {
        mockResponse = '[ACK] CPU soft reset initiated. Modem reconnecting in 8s...';
      } else if (selectedType === 'get_location') {
        mockResponse = `[ACK] Fix Lat:${vehicle.latestPosition.latitude.toFixed(5)} Lon:${vehicle.latestPosition.longitude.toFixed(5)} Sat:${vehicle.latestPosition.satellites}`;
      } else {
        mockResponse = `[ACK] Command "${activePayload}" applied successfully.`;
      }

      const completedCmd: TelematicsCommand = {
        ...newCmd,
        status: 'acknowledged',
        sentAt: new Date(Date.now() - latency).toISOString(),
        acknowledgedAt: new Date().toISOString(),
        executionLatencyMs: latency,
        responsePayload: mockResponse
      };

      setCommandHistory((prev) => [completedCmd, ...prev]);
      setIsExecuting(false);
      setSafetyConfirmation(false);

      if (onCommandDispatched) {
        onCommandDispatched(completedCmd);
      }
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-[32px] w-full max-w-[95vw] xl:max-w-6xl h-[88vh] max-h-[90vh] shadow-2xl overflow-hidden text-slate-900 dark:text-white flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-zinc-900 border border-emerald-200 dark:border-zinc-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-zinc-900 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                  {vehicle.licensePlate}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
                  {vehicle.trackerProtocol || 'TELTONIKA'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">
                  IMEI: {vehicle.trackerImei || '868120492817294'}
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1">
                Downlink Telematics Command Terminal
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close terminal"
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors border border-slate-200 dark:border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 px-6 pt-3 gap-6 shrink-0">
          <button
            onClick={() => setActiveTab('console')}
            className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'console'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Command Dispatcher & Live Console
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Downlink Audit Log ({commandHistory.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {!canSendCommands && (
            <div className="p-4 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-red-950/40 dark:border-red-800/60 dark:text-red-300 text-xs flex items-center gap-3">
              <Lock className="w-5 h-5 text-rose-600 dark:text-red-400 shrink-0" />
              <div>
                <p className="font-bold">Permission Denied (`vehicles:commands`)</p>
                <p className="text-[11px] text-rose-700 dark:text-red-400/80">
                  Your current role ({currentUser?.role || 'viewer'}) is not authorized to dispatch downlink GPRS or SMS commands to hardware trackers.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'console' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Dispatch Controls (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                {/* Channel Selector */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-zinc-400 font-bold block mb-2">
                    Transmission Channel
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setChannel('gprs_tcp')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        channel === 'gprs_tcp'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-500/10 dark:border-emerald-500/50 dark:text-emerald-300 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                      }`}
                    >
                      <div className="font-bold">GPRS TCP</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-500 mt-0.5">Port 5027 direct</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChannel('gprs_udp')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        channel === 'gprs_udp'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-500/10 dark:border-emerald-500/50 dark:text-emerald-300 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                      }`}
                    >
                      <div className="font-bold">GPRS UDP</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-500 mt-0.5">Broadcast packet</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChannel('sms')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        channel === 'sms'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-500/10 dark:border-emerald-500/50 dark:text-emerald-300 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                      }`}
                    >
                      <div className="font-bold">GSM SMS</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-500 mt-0.5">SIM fallback</div>
                    </button>
                  </div>
                </div>

                {/* Command Presets */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-zinc-400 font-bold block mb-2">
                    Command Selection
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {COMMAND_PRESETS.map((preset) => (
                      <div
                        key={preset.type}
                        onClick={() => {
                          setSelectedType(preset.type);
                          setCustomPayload('');
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          selectedType === preset.type
                            ? preset.isDangerous
                              ? 'bg-rose-50 border-rose-300 text-slate-900 dark:bg-red-500/10 dark:border-red-500/50 dark:text-white shadow-xs'
                              : 'bg-emerald-50/70 border-emerald-300 text-slate-900 dark:bg-zinc-900 dark:border-emerald-500/50 dark:text-white shadow-xs'
                            : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-zinc-950/60 dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            preset.isDangerous
                              ? 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-zinc-900 dark:text-emerald-400 dark:border-zinc-800'
                          }`}
                        >
                          {preset.type === 'engine_stop' && <Power className="w-3.5 h-3.5" />}
                          {preset.type === 'engine_resume' && <Power className="w-3.5 h-3.5" />}
                          {preset.type === 'reboot' && <RotateCcw className="w-3.5 h-3.5" />}
                          {preset.type === 'get_location' && <Navigation className="w-3.5 h-3.5" />}
                          {preset.type === 'set_interval' && <Clock className="w-3.5 h-3.5" />}
                          {preset.type === 'custom_payload' && <Terminal className="w-3.5 h-3.5" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{preset.label}</span>
                            {preset.isDangerous && (
                              <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-red-500/20 dark:text-red-400 shrink-0">
                                Risk
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                            {preset.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payload Preview / Editor */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-zinc-400 font-bold">
                      Hardware Payload String
                    </label>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">
                      Syntax target: {vehicle.trackerProtocol || 'teltonika'}
                    </span>
                  </div>
                  <div className="bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 font-mono text-xs flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Terminal className="w-4 h-4 text-slate-400 dark:text-zinc-600 shrink-0" />
                    {selectedType === 'custom_payload' ? (
                      <input
                        type="text"
                        value={customPayload}
                        onChange={(e) => setCustomPayload(e.target.value)}
                        placeholder="e.g. setdigout 1,0 or cpureset"
                        className="w-full bg-transparent border-none text-emerald-800 dark:text-emerald-400 focus:outline-none placeholder-slate-400 dark:placeholder-zinc-700 font-mono"
                      />
                    ) : (
                      <span className="font-bold">{activePayload}</span>
                    )}
                  </div>
                </div>

                {/* Safety Confirmation for High-Risk Commands */}
                {activePreset.isDangerous && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 dark:bg-red-950/30 dark:border-red-900/60 space-y-1.5">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-red-400 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      Safety Precaution Confirmation
                    </div>
                    <p className="text-[11px] text-rose-800/80 dark:text-red-300/80 leading-relaxed">
                      Executing remote engine cut-off while a vehicle is traveling at high speed may cause loss of power steering. Confirm speed is safe (&lt;10 km/h). Current speed: <span className="font-mono font-bold">{vehicle.latestPosition.speed} km/h</span>.
                    </p>
                    <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={safetyConfirmation}
                        onChange={(e) => setSafetyConfirmation(e.target.checked)}
                        className="rounded accent-red-600"
                      />
                      <span>I confirm standard safety verification has been performed.</span>
                    </label>
                  </div>
                )}

                {/* Execution Action Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleExecute}
                    disabled={!canSendCommands || isExecuting || (activePreset.isDangerous && !safetyConfirmation)}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all ${
                      !canSendCommands || (activePreset.isDangerous && !safetyConfirmation)
                        ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
                        : activePreset.isDangerous
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    }`}
                  >
                    {isExecuting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting GPRS Downlink Packet...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Dispatch {activePreset.label}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Live Terminal Stream & Diagnostic Inspector (6 cols) */}
              <div className="lg:col-span-6 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-zinc-400 font-bold">
                    Live Telematics Terminal Monitor
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">ONLINE SOCKET</span>
                  </div>
                </div>

                {/* Simulated Terminal Screen */}
                <div className="flex-1 min-h-[300px] bg-slate-950 text-zinc-300 p-4 rounded-3xl font-mono text-[11px] border border-slate-800 flex flex-col justify-between overflow-hidden shadow-inner">
                  <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
                    <div className="text-zinc-500">[SYSTEM] Initialized secure GPRS socket connection to device IMEI {vehicle.trackerImei || '868120492817294'}</div>
                    <div className="text-zinc-500">[SYSTEM] Protocol parsed: {vehicle.trackerProtocol?.toUpperCase() || 'TELTONIKA'} (Codec 8/8 Extended)</div>
                    <div className="text-emerald-400">[SOCKET] Handshake ACK received (LATENCY: 42ms)</div>
                    
                    {commandHistory.slice(0, 4).map((cmd) => (
                      <div key={cmd.id} className="pt-2 border-t border-zinc-800/60">
                        <div className="text-amber-400">&gt; DOWNLINK [{cmd.channel.toUpperCase()}]: {cmd.payload}</div>
                        <div className="text-zinc-400 pl-2">STATUS: {cmd.status.toUpperCase()} ({cmd.executionLatencyMs}ms)</div>
                        {cmd.responsePayload && (
                          <div className="text-emerald-400 pl-2">&lt; UPLINK RESP: {cmd.responsePayload}</div>
                        )}
                      </div>
                    ))}

                    {isExecuting && (
                      <div className="text-yellow-400 animate-pulse pt-2">
                        &gt; TRANSMITTING: {activePayload} ...
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>PORT: 5027 | TLS: AES-128 | CRC-16: OK</span>
                    <span className="text-zinc-400">READY FOR DISPATCH</span>
                  </div>
                </div>

                {/* Device Hardware Quick Status */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-500 block">Battery Voltage</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">12.6V (Normal)</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-500 block">Digital Out 1 (Relay)</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">CLOSED (ENG ON)</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-500 block">Current Velocity</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{vehicle.latestPosition.speed} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Command History Tab - Wide Audit Table */
            <div className="space-y-3">
              {commandHistory.map((cmd) => (
                <div
                  key={cmd.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white text-emerald-700 border border-emerald-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-emerald-400 font-bold">
                        {cmd.channel.toUpperCase()}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white uppercase">{cmd.commandType}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">
                      {new Date(cmd.queuedAt).toLocaleTimeString()} ({cmd.executionLatencyMs}ms)
                    </span>
                  </div>

                  <div className="bg-slate-100 dark:bg-black/50 p-2.5 rounded-xl font-mono text-[11px] text-slate-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-900 flex justify-between">
                    <span>&gt; {cmd.payload}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{cmd.status.toUpperCase()}</span>
                  </div>

                  {cmd.responsePayload && (
                    <div className="text-[11px] text-slate-700 dark:text-zinc-400 bg-white dark:bg-zinc-900/40 p-2 rounded-lg border border-slate-200 dark:border-zinc-800/80">
                      <span className="text-slate-500 dark:text-zinc-500 font-mono">Device response: </span>
                      <span className="text-slate-900 dark:text-white font-semibold">{cmd.responsePayload}</span>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 dark:text-zinc-500 flex justify-between">
                    <span>Dispatched by {cmd.sentBy.userName} ({cmd.sentBy.userEmail})</span>
                    <span>IMEI: {cmd.trackerImei}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
