import { TrackerProtocol } from './fleet';

export type CommandType =
  | 'engine_stop'
  | 'engine_resume'
  | 'reboot'
  | 'get_location'
  | 'set_interval'
  | 'custom_payload';

export type CommandChannel = 'gprs_tcp' | 'gprs_udp' | 'sms';

export type CommandStatus = 'queued' | 'transmitted' | 'acknowledged' | 'failed' | 'timeout';

export interface TelematicsCommand {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  trackerImei: string;
  trackerProtocol: TrackerProtocol;
  commandType: CommandType;
  channel: CommandChannel;
  payload: string;
  status: CommandStatus;
  sentBy: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  queuedAt: string;
  sentAt?: string;
  acknowledgedAt?: string;
  responsePayload?: string;
  executionLatencyMs?: number;
}

export interface CommandPreset {
  type: CommandType;
  label: string;
  description: string;
  isDangerous: boolean;
  getDefaultPayload: (protocol: TrackerProtocol, params?: any) => string;
}

export const COMMAND_PRESETS: CommandPreset[] = [
  {
    type: 'engine_stop',
    label: 'Remote Engine Cut-off (Immobilizer Relay)',
    description: 'Activates digital output 1 (DO1) connected to the fuel pump relay. Prevents vehicle ignition.',
    isDangerous: true,
    getDefaultPayload: (protocol) => {
      switch (protocol) {
        case 'teltonika': return 'setdigout 1,0';
        case 'coban': return 'stop123456';
        case 'concox': return 'RELAY,1#';
        case 'queclink': return 'AT+GTCFG=gl300,1,0,,,1';
        case 'ruptela': return 'set_out 1 1';
        default: return 'OUTPUT1_ON';
      }
    }
  },
  {
    type: 'engine_resume',
    label: 'Restore Fuel & Ignition',
    description: 'Deactivates digital output 1 (DO1) to allow normal engine ignition restart.',
    isDangerous: false,
    getDefaultPayload: (protocol) => {
      switch (protocol) {
        case 'teltonika': return 'setdigout 0,0';
        case 'coban': return 'resume123456';
        case 'concox': return 'RELAY,0#';
        case 'queclink': return 'AT+GTCFG=gl300,1,0,,,0';
        case 'ruptela': return 'set_out 1 0';
        default: return 'OUTPUT1_OFF';
      }
    }
  },
  {
    type: 'reboot',
    label: 'Restart Tracker CPU',
    description: 'Forces an over-the-air software reboot of the tracking unit MCU.',
    isDangerous: false,
    getDefaultPayload: (protocol) => {
      switch (protocol) {
        case 'teltonika': return 'cpureset';
        case 'coban': return 'reset123456';
        case 'concox': return 'RESET#';
        case 'queclink': return 'AT+GTRTO=gl300,3';
        case 'ruptela': return 'reset';
        default: return 'REBOOT';
      }
    }
  },
  {
    type: 'get_location',
    label: 'Request Immediate GPS Fix',
    description: 'Instructs tracker to wake GPS receiver and send current satellite fix immediately.',
    isDangerous: false,
    getDefaultPayload: (protocol) => {
      switch (protocol) {
        case 'teltonika': return 'getgps';
        case 'coban': return 'check123456';
        case 'concox': return 'WHERE#';
        case 'queclink': return 'AT+GTRTO=gl300,1';
        default: return 'GET_POS';
      }
    }
  },
  {
    type: 'set_interval',
    label: 'Configure Tracking Interval (5s / 60s)',
    description: 'Sets reporting frequency to 5 seconds when moving and 60 seconds when stationary.',
    isDangerous: false,
    getDefaultPayload: (protocol) => {
      switch (protocol) {
        case 'teltonika': return 'setparam 10000:5;10001:60';
        case 'coban': return 'fix005s060m***n123456';
        case 'concox': return 'TIMER,5,60#';
        default: return 'INTERVAL_5_60';
      }
    }
  },
  {
    type: 'custom_payload',
    label: 'Custom Downlink Packet (Hex/ASCII)',
    description: 'Direct arbitrary command string sent directly to the device socket.',
    isDangerous: true,
    getDefaultPayload: () => '',
  }
];
