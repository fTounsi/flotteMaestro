import React, { useState } from 'react';
import { Terminal, Send, CheckCircle2, Copy, Sparkles, Database, Layers, ArrowRight, Radio } from 'lucide-react';
import { API_ENDPOINTS_SPEC } from '../../data/mockData';
import { ApiEndpointSpec, WebSocketMessage } from '../../types/fleet';
import { apiServiceInstance } from '../../services/apiService';
import { WebSocketStream } from './WebSocketStream';
import { TranslationDictionary } from '../../translations/i18n';

interface RestApiExplorerProps {
  wsMessages: WebSocketMessage[];
  onClearWs: () => void;
  isSimulating: boolean;
  onToggleSimulating: () => void;
  t: TranslationDictionary;
}

export const RestApiExplorer: React.FC<RestApiExplorerProps> = ({
  wsMessages,
  onClearWs,
  isSimulating,
  onToggleSimulating,
  t
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointSpec>(API_ENDPOINTS_SPEC[1]);
  const [requestBodyText, setRequestBodyText] = useState<string>(
    JSON.stringify(selectedEndpoint.requestBodyExample || {}, null, 2)
  );
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'docs' | 'stream' | 'architecture'>('docs');

  const handleSelectEndpoint = (ep: ApiEndpointSpec) => {
    setSelectedEndpoint(ep);
    setRequestBodyText(JSON.stringify(ep.requestBodyExample || {}, null, 2));
    setResponseData(null);
    setResponseStatus(null);
  };

  const handleExecuteRequest = async () => {
    setIsLoading(true);
    let parsedBody = {};
    try {
      if (selectedEndpoint.requestBodyExample) {
        parsedBody = JSON.parse(requestBodyText);
      }
    } catch (e) {
      // ignore
    }

    try {
      const res = await apiServiceInstance.executeRequest(
        selectedEndpoint.method,
        selectedEndpoint.path,
        {},
        parsedBody
      );
      setResponseStatus(res.status);
      setResponseData(res.data);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseData({ error: 'Execution failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-zinc-900/40 rounded-[32px] p-6 border border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div className="border-l-2 border-emerald-500 pl-4 py-1">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">
            Developer API & Gateway Engine
          </p>
          <h2 className="text-3xl font-black italic tracking-tight text-white">
            {t.modes.apiDeveloper}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            OpenAPI 3.0 specification explorer with live endpoint execution and real-time WebSocket socket feeds.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'docs' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            REST API Sandbox
          </button>
          <button
            onClick={() => setActiveTab('stream')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'stream' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>WebSocket ({wsMessages.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Endpoint List (4 Cols) */}
          <div className="lg:col-span-4 bg-zinc-900/40 border border-zinc-800 rounded-[32px] p-5 shadow-2xl space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Available Endpoints
            </h4>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {API_ENDPOINTS_SPEC.map((ep) => {
                const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
                return (
                  <div
                    key={`${ep.method}-${ep.path}`}
                    onClick={() => handleSelectEndpoint(ep)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-zinc-900 border-zinc-500 text-white shadow-lg'
                        : 'bg-zinc-950/60 border-zinc-850 hover:border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-lg font-mono uppercase ${
                          ep.method === 'GET'
                            ? 'bg-emerald-500 text-black'
                            : ep.method === 'POST'
                            ? 'bg-blue-500 text-white'
                            : 'bg-amber-500 text-black'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs font-bold text-white truncate">
                        {ep.path}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{ep.summary}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Endpoint Execution Sandbox (8 Cols) */}
          <div className="lg:col-span-8 bg-zinc-900/40 border border-zinc-800 rounded-[32px] p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-lg font-mono uppercase ${
                      selectedEndpoint.method === 'GET'
                        ? 'bg-emerald-500 text-black'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <h3 className="font-mono text-base font-bold text-white">
                    {selectedEndpoint.path}
                  </h3>
                </div>
                <p className="text-xs text-zinc-400">{selectedEndpoint.summary}</p>
              </div>

              <button
                onClick={handleExecuteRequest}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-2xl bg-white hover:bg-emerald-400 text-black text-xs font-black transition-all shadow-xl flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5 fill-black" />
                <span>{isLoading ? 'Executing...' : 'Run Request'}</span>
              </button>
            </div>

            {/* Request Body (If POST) */}
            {selectedEndpoint.method === 'POST' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Request Payload (JSON)
                </label>
                <textarea
                  value={requestBodyText}
                  onChange={(e) => setRequestBodyText(e.target.value)}
                  rows={6}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 focus:outline-none"
                />
              </div>
            )}

            {/* Live Response Viewer */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Response Output
                </span>
                {responseStatus && (
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    HTTP {responseStatus} OK
                  </span>
                )}
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-[24px] p-4 max-h-[280px] overflow-y-auto">
                <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap">
                  {responseData
                    ? JSON.stringify(responseData, null, 2)
                    : '// Click "Run Request" to trigger endpoint execution and view live JSON output.'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stream' && (
        <WebSocketStream
          messages={wsMessages}
          onClear={onClearWs}
          isSimulating={isSimulating}
          onToggleSimulating={onToggleSimulating}
          t={t}
        />
      )}
    </div>
  );
};
