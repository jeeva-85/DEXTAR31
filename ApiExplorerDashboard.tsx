import React, { useState } from 'react';
import { 
  Terminal, Play, Copy, Check, RefreshCw, 
  Send, Layers, Code, Globe, ShieldAlert
} from 'lucide-react';
import { CommandHeader } from './CommandHeader';

interface EndpointConfig {
  name: string;
  method: 'GET' | 'POST';
  path: string;
  defaultBody?: string;
  description: string;
}

const ENDPOINTS: EndpointConfig[] = [
  { name: 'System Health', method: 'GET', path: '/api/system/health', description: 'Real-time multi-subsystem heartbeat' },
  { name: 'Data Pipeline Status', method: 'GET', path: '/api/data/status', description: 'Dataset catalog and processing states' },
  { name: 'List Active Events', method: 'GET', path: '/api/events', description: 'Catalog of active tracked extreme weather anomalies' },
  { name: 'Event Tracking Trajectory', method: 'GET', path: '/api/tracking/CYC-BOB-MR-01', description: 'Trajectory and spherical centroid track' },
  { name: 'Model Registry Catalog', method: 'GET', path: '/api/models', description: 'Registered LightGBM, XGBoost, and Random Forest artifacts' },
  { name: 'Ensemble Uncertainty', method: 'GET', path: '/api/uncertainty/CYC-BOB-MR-01?lead_day=5', description: '11-member NEPS-G spatial dispersion and variance' },
  { name: 'MetPy Physics Validation', method: 'GET', path: '/api/physics/validate', description: 'Atmospheric state physical consistency audit' },
  { name: 'Custom Physics Check', method: 'POST', path: '/api/physics/validate', defaultBody: JSON.stringify({ temp_c: 28.5, relative_humidity: 94.0, pressure_hpa: 965.0, wind_speed_ms: 42.0, precipitation_mm: 175.0 }, null, 2), description: 'Verify custom thermodynamic atmospheric values' },
  { name: 'Threat-Focused Downscaling', method: 'POST', path: '/api/downscaling/run', defaultBody: JSON.stringify({ event_id: "CYC-BOB-MR-01", variable: "temperature_c" }, null, 2), description: 'Downscales ~12km to ~5km around threat bounding box' },
  { name: 'Operational Hazard Alerts', method: 'GET', path: '/api/alerts', description: 'List active emergency and warning advisories' },
  { name: 'Measured Evaluation Analytics', method: 'GET', path: '/api/analytics/summary', description: 'POD, FAR, CSI test split benchmarks' },
  { name: 'Climate Indicators & Trends', method: 'GET', path: '/api/climate/indicators', description: 'Decadal temperature trends and regional vulnerability index' },
  { name: 'Master Pipeline Execution', method: 'POST', path: '/api/pipeline/run', defaultBody: JSON.stringify({ event_id: "CYC-BOB-MR-01" }, null, 2), description: 'Executes end-to-end AI detection, tracking, downscaling, & alert' },
];

export const ApiExplorerDashboard: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(ENDPOINTS[0]);
  const [requestBody, setRequestBody] = useState<string>('');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<string>('');
  const [responseBody, setResponseBody] = useState<string>('Click "Send API Request" to execute.');
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectEndpoint = (ep: EndpointConfig) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.defaultBody || '');
    setResponseBody('Ready. Click "Send API Request" to inspect output.');
    setResponseStatus(null);
    setExecutionTime(null);
  };

  const executeRequest = async () => {
    try {
      setLoading(true);
      const start = performance.now();
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (selectedEndpoint.method === 'POST' && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(selectedEndpoint.path, options);
      const elapsed = Math.round(performance.now() - start);
      setExecutionTime(elapsed);
      setResponseStatus(res.status);

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        setResponseBody(JSON.stringify(json, null, 2));
      } else {
        const text = await res.text();
        setResponseBody(text);
      }
    } catch (err: any) {
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(responseBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <CommandHeader 
        title="13 • INTERACTIVE REST API EXPLORER & DEVELOPER WORKBENCH"
        eventName={selectedEndpoint.name}
        dataSource="FastAPI Core Microservices"
        forecastHorizon="PROGRAMMATIC ACCESS LAYER"
        modelName="RESTFUL JSON TELEMETRY"
        status="API ACTIVE"
        isTrained={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Endpoints Menu */}
        <div className="app-window p-4 lg:col-span-1 space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <span className="text-xs font-mono font-bold text-sky-600 uppercase">Available Routes</span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">Microservice Catalog</h3>
          </div>

          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {ENDPOINTS.map((ep, i) => {
              const isSelected = ep.path === selectedEndpoint.path && ep.method === selectedEndpoint.method;
              return (
                <div
                  key={i}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-500/10 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 truncate">{ep.name}</span>
                    <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${
                      ep.method === 'GET' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ep.method}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 truncate mt-1">{ep.path}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Console & Response Viewer */}
        <div className="lg:col-span-2 space-y-4">
          {/* Request Header Bar */}
          <div className="app-window p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded font-mono text-xs font-bold ${
                selectedEndpoint.method === 'GET' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {selectedEndpoint.method}
              </span>
              <input
                type="text"
                readOnly
                value={selectedEndpoint.path}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-800 focus:outline-none"
              />
              <button
                onClick={executeRequest}
                disabled={loading}
                className="btn-primary text-xs flex items-center gap-1.5 !py-2 !px-4"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? "Sending..." : "Send Request"}
              </button>
            </div>
            <div className="text-xs text-slate-500 font-sans">
              {selectedEndpoint.description}
            </div>

            {/* Request Body JSON (if POST) */}
            {selectedEndpoint.method === 'POST' && (
              <div className="mt-2 pt-2 border-t border-slate-100">
                <label className="text-[11px] font-mono font-bold text-slate-500 uppercase block mb-1">
                  Request Payload (JSON Body):
                </label>
                <textarea
                  rows={4}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-lg border border-slate-700 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Response Window */}
          <div className="app-window overflow-hidden">
            <div className="app-window-header">
              <div className="window-title-group">
                <div className="app-window-dots">
                  <span className="app-window-dot dot-red"></span>
                  <span className="app-window-dot dot-yellow"></span>
                  <span className="app-window-dot dot-green"></span>
                </div>
                <span className="window-title">HTTP JSON RESPONSE</span>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                {responseStatus !== null && (
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    responseStatus === 200 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    HTTP {responseStatus}
                  </span>
                )}
                {executionTime !== null && (
                  <span className="text-slate-500 font-semibold">{executionTime} ms</span>
                )}
                <button
                  onClick={copyToClipboard}
                  className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors flex items-center gap-1"
                  title="Copy JSON"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Response Output Body */}
            <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed select-text">
              {responseBody}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
