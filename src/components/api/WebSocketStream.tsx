import React from 'react';
import { Radio, Trash2, Zap, Play, Pause, Activity } from 'lucide-react';
import { WebSocketMessage } from '../../types/fleet';
import { TranslationDictionary } from '../../translations/i18n';

interface WebSocketStreamProps {
  messages: WebSocketMessage[];
  onClear: () => void;
  isSimulating: boolean;
  onToggleSimulating: () => void;
  t: TranslationDictionary;
}

export const WebSocketStream: React.FC<WebSocketStreamProps> = ({
  messages,
  onClear,
  isSimulating,
  onToggleSimulating,
  t
}) => {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-[32px] p-6 shadow-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-base font-bold text-white">
              ws://stream.flottemaestro.internal/v1/telemetry
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
              CONNECTED
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Streaming real-time binary & JSON position packets from Traccar hardware gateway.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors border border-zinc-800"
          >
            Clear Stream
          </button>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-[24px] p-4 max-h-[500px] overflow-y-auto space-y-2 font-mono text-xs">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            Waiting for real-time telemetry frames...
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-850 flex items-start justify-between gap-3 hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 text-[11px] mb-1">
                  <span className="text-emerald-400 font-bold">{msg.event}</span>
                  <span className="text-zinc-500">[{msg.channel}]</span>
                </div>
                <pre className="text-zinc-300 text-[11px] whitespace-pre-wrap">
                  {JSON.stringify(msg.payload, null, 2)}
                </pre>
              </div>
              <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
