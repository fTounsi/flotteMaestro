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
    <div className="fixed inset-0 z-[1200] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#09090b] border border-zinc-800 rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-zinc-900 text-emerald-400 border border-emerald-500/30">
                  {vehicle.licensePlate}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {vehicle.trackerProtocol || 'TELTONIKA'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  IMEI: {vehicle.trackerImei || '868120492817294'}
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-white mt-1">
                Downlink Telematics Command Terminal
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close terminal"
            className="p-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/40 px-6 pt-3 gap-6">
          <button
            onClick={() => setActiveTab('console')}
            className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'console'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Command Dispatcher
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'history'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Downlink Audit Log ({commandHistory.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {!canSendCommands && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
              <Lock className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="font-bold">Permission Denied (`vehicles:commands`)</p>
                <p className="text-[11px] text-red-400/80">
                  Your current role ({currentUser?.role || 'viewer'}) is not authorized to dispatch downlink GPRS or SMS commands to hardware trackers.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'console' ? (
            <>
              {/* Channel Selector */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block mb-2">
                  Transmission Channel
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setChannel('gprs_tcp')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      channel === 'gprs_tcp'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="font-bold">GPRS TCP Socket</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Direct socket port 5027</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('gprs_udp')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      channel === 'gprs_udp'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="font-bold">GPRS UDP Datagram</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Connectionless broadcast</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      channel === 'sms'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="font-bold">GSM SMS Gateway</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Offline fallback via SIM</div>
                  </button>
                </div>
              </div>

              {/* Command Presets */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block mb-2">
                  Command Selection
                </label>
                <div className="space-y-2">
                  {COMMAND_PRESETS.map((preset) => (
                    <div
                      key={preset.type}
                      onClick={() => {
                        setSelectedType(preset.type);
                        setCustomPayload('');
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        selectedType === preset.type
                          ? preset.isDangerous
                            ? 'bg-red-500/10 border-red-500/50 text-white'
                            : 'bg-zinc-900 border-emerald-500/50 text-white'
                          : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          preset.isDangerous
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-zinc-900 text-emerald-400 border border-zinc-800'
                        }`}
                      >
                        {preset.type === 'engine_stop' && <Power className="w-4 h-4" />}
                        {preset.type === 'engine_resume' && <Power className="w-4 h-4" />}
                        {preset.type === 'reboot' && <RotateCcw className="w-4 h-4" />}
                        {preset.type === 'get_location' && <Navigation className="w-4 h-4" />}
                        {preset.type === 'set_interval' && <Clock className="w-4 h-4" />}
                        {preset.type === 'custom_payload' && <Terminal className="w-4 h-4" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{preset.label}</span>
                          {preset.isDangerous && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
                              High Risk
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
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
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                    Hardware Payload String
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Syntax target: {vehicle.trackerProtocol || 'teltonika'}
                  </span>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 font-mono text-xs flex items-center gap-2 text-emerald-400">
                  <Terminal className="w-4 h-4 text-zinc-600 shrink-0" />
                  {selectedType === 'custom_payload' ? (
                    <input
                      type="text"
                      value={customPayload}
                      onChange={(e) => setCustomPayload(e.target.value)}
                      placeholder="e.g. setdigout 1,0 or cpureset"
                      className="w-full bg-transparent border-none text-emerald-400 focus:outline-none placeholder-zinc-700"
                    />
                  ) : (
                    <span className="font-bold">{activePayload}</span>
                  )}
                </div>
              </div>

              {/* Safety Confirmation for High-Risk Commands */}
              {activePreset.isDangerous && (
                <div className="p-4 rounded-2xl bg-red-950/30 border border-red-900/60 space-y-2">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    Safety Precaution Confirmation
                  </div>
                  <p className="text-[11px] text-red-300/80 leading-relaxed">
                    Executing remote engine cut-off while a vehicle is traveling at high speed may cause loss of power steering and vacuum brake assistance. Confirm that the vehicle is stopped or moving at safe velocity (&lt;10 km/h).
                  </p>
                  <label className="flex items-center gap-2 pt-1 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={safetyConfirmation}
                      onChange={(e) => setSafetyConfirmation(e.target.checked)}
                      className="rounded accent-red-500"
                    />
                    <span>I confirm standard safety verification has been performed.</span>
                  </label>
                </div>
              )}

              {/* Execution Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExecute}
                  disabled={!canSendCommands || isExecuting || (activePreset.isDangerous && !safetyConfirmation)}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all ${
                    !canSendCommands || (activePreset.isDangerous && !safetyConfirmation)
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : activePreset.isDangerous
                      ? 'bg-red-500 hover:bg-red-400 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black'
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
            </>
          ) : (
            /* Command History Tab */
            <div className="space-y-3">
              {commandHistory.map((cmd) => (
                <div
                  key={cmd.id}
                  className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
                        {cmd.channel.toUpperCase()}
                      </span>
                      <span className="font-bold text-white uppercase">{cmd.commandType}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(cmd.queuedAt).toLocaleTimeString()} ({cmd.executionLatencyMs}ms)
                    </span>
                  </div>

                  <div className="bg-black/50 p-2.5 rounded-xl font-mono text-[11px] text-zinc-300 border border-zinc-900 flex justify-between">
                    <span>&gt; {cmd.payload}</span>
                    <span className="text-emerald-400 font-bold">{cmd.status.toUpperCase()}</span>
                  </div>

                  {cmd.responsePayload && (
                    <div className="text-[11px] text-zinc-400 bg-zinc-900/40 p-2 rounded-lg border border-zinc-800/80">
                      <span className="text-zinc-500 font-mono">Device response: </span>
                      <span className="text-white">{cmd.responsePayload}</span>
                    </div>
                  )}

                  <div className="text-[10px] text-zinc-500 flex justify-between">
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
