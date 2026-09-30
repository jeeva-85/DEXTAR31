import React, { useState } from 'react';
import { 
  CloudRain, Wind, Thermometer, AlertTriangle, ShieldCheck, 
  Play, Compass, ArrowUpRight, CheckCircle2, ChevronRight, Activity
} from 'lucide-react';
import { CommandHeader } from './CommandHeader';
import { api } from '../services/api';

interface OverviewDashboardProps {
  events: any[];
  models: any[];
  alerts: any[];
  onNavigate: (tab: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  events,
  models,
  alerts,
  onNavigate
}) => {
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>("CYC-BOB-MR-01");

  const runPipeline = async () => {
    try {
      setPipelineRunning(true);
      const res = await api.runPipeline(selectedEventId);
      setPipelineResult(res);
    } catch (err: any) {
      alert("Pipeline run failed: " + err.message);
    } finally {
      setPipelineRunning(false);
    }
  };

  const activeEvent = events.find(e => e.event_id === selectedEventId) || events[0] || {
    event_id: "CYC-BOB-MR-01",
    event_name: "Bay of Bengal Severe Tropical Cyclone",
    event_type: "TROPICAL_CYCLONE",
    current_lat: 13.2,
    current_lon: 88.4,
    intensity: 65.0,
    severity_level: 3,
    movement_direction: "NNE",
    forecast_lead: "Day 3 → Day 10"
  };

  return (
    <div className="space-y-6">
      <CommandHeader 
        title="01 • OPERATIONAL WEATHER INTELLIGENCE OVERVIEW"
        eventName={activeEvent.event_name}
        dataSource="NEPS-G (11 Mem) • IMDAA Reanalysis • NCUM"
        forecastHorizon="DAY 3 → DAY 10"
        modelName="XGBoost & LightGBM Anomaly Engine"
        status="OPERATIONAL TRACKING"
        isTrained={true}
      />

      {/* Top Telemetry Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <div className="card-command p-3.5 border-l-4 border-l-sky-500">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Active Anomalies</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{events.length || 3}</div>
          <div className="text-[11px] text-sky-700 font-medium flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Bay of Bengal & NW India
          </div>
        </div>

        <div className="card-command p-3.5 border-l-4 border-l-blue-600">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Tracked Events</div>
          <div className="text-2xl font-black text-slate-900 mt-1">100%</div>
          <div className="text-[11px] text-blue-700 font-medium mt-1">
            Centroid & Velocity Active
          </div>
        </div>

        <div className="card-command p-3.5 border-l-4 border-l-cyan-500">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Forecast Horizon</div>
          <div className="text-xl font-bold text-slate-900 mt-1.5">Day 3 → 10</div>
          <div className="text-[11px] text-cyan-700 font-medium mt-1">
            72h to 240h Medium Range
          </div>
        </div>

        <div className="card-command p-3.5 border-l-4 border-l-slate-400">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Input Resolution</div>
          <div className="text-xl font-bold text-slate-900 mt-1.5">~12 km</div>
          <div className="text-[11px] text-slate-600 font-medium mt-1">
            NCMRWF Global Grid
          </div>
        </div>

        <div className="card-command p-3.5 border-l-4 border-l-emerald-500">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Target Resolution</div>
          <div className="text-xl font-bold text-emerald-700 mt-1.5">~5 km Local</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Threat-Focused Downscale
          </div>
        </div>

        <div className="card-command p-3.5 border-l-4 border-l-amber-500">
          <div className="text-[11px] font-mono text-slate-500 uppercase">AI Model Status</div>
          <div className="text-xl font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            TRAINED
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-1">
            LightGBM & XGBoost Loaded
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Synoptic Tracking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Synoptic Map Canvas */}
        <div className="lg:col-span-2 app-window">
          <div className="app-window-header">
            <div className="window-title-group">
              <div className="app-window-dots">
                <div className="app-window-dot dot-red"></div>
                <div className="app-window-dot dot-yellow"></div>
                <div className="app-window-dot dot-green"></div>
              </div>
              <span className="window-title">
                SYNOPTIC SPATIO-TEMPORAL RADAR • INDIA & OCEANIC BASINS (60°E - 100°E, 5°N - 38°N)
              </span>
            </div>
            <div className="window-badge-group">
              <span className="badge-trained">AI TRACKING READY</span>
              <span className="badge-prototype">4D BOUNDING BOX</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Target Focus:</span>
              <select 
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {events.map(ev => (
                  <option key={ev.event_id} value={ev.event_id}>
                    {ev.event_name} ({ev.event_type})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Threat Centroid
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm border border-red-500 bg-red-100/50"></span> Dynamic Box
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Ensemble Members (N=11)
              </span>
            </div>
          </div>

          {/* SVG Map of India & Surrounding Oceans */}
          <div className="relative w-full h-[460px] bg-slate-900 overflow-hidden flex items-center justify-center">
            {/* Background Map Grid */}
            <div className="absolute inset-0 bg-scientific-grid opacity-25"></div>

            {/* Geographic Landmass Outline Illustration */}
            <svg viewBox="0 0 800 600" className="w-full h-full object-contain filter drop-shadow">
              {/* Latitude lines */}
              <line x1="0" y1="150" x2="800" y2="150" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.8" />
              <text x="20" y="145" fill="#64748B" fontSize="10" fontFamily="monospace">30°N</text>
              <line x1="0" y1="300" x2="800" y2="300" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.8" />
              <text x="20" y="295" fill="#64748B" fontSize="10" fontFamily="monospace">20°N</text>
              <line x1="0" y1="450" x2="800" y2="450" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.8" />
              <text x="20" y="445" fill="#64748B" fontSize="10" fontFamily="monospace">10°N</text>

              {/* Longitude lines */}
              <line x1="200" y1="0" x2="200" y2="600" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.8" />
              <text x="205" y="585" fill="#64748B" fontSize="10" fontFamily="monospace">70°E</text>
              <line x1="400" y1="0" x2="400" y2="600" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.8" />
              <text x="405" y="585" fill="#64748B" fontSize="10" fontFamily="monospace">80°E</text>
              <line x1="600" y1="0" x2="600" y2="600" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.8" />
              <text x="605" y="585" fill="#64748B" fontSize="10" fontFamily="monospace">90°E</text>

              {/* Stylized Indian Subcontinent Landmass */}
              <path 
                d="M 330 80 Q 360 90 390 100 Q 420 120 440 140 Q 470 170 470 200 Q 470 240 520 230 Q 560 220 580 240 Q 610 270 570 290 Q 530 280 500 290 Q 480 340 460 380 Q 440 430 420 460 Q 400 490 380 520 Q 360 490 340 430 Q 320 370 300 320 Q 280 270 250 250 Q 220 240 200 260 Q 180 280 160 290 Q 180 230 220 200 Q 260 170 300 130 Z" 
                fill="#1E293B" 
                stroke="#475569" 
                strokeWidth="1.5"
                opacity="0.85"
              />

              {/* Labels */}
              <text x="210" y="400" fill="#64748B" fontSize="13" fontWeight="bold" letterSpacing="2">ARABIAN SEA</text>
              <text x="520" y="420" fill="#64748B" fontSize="13" fontWeight="bold" letterSpacing="2">BAY OF BENGAL</text>
              <text x="350" y="270" fill="#94A3B8" fontSize="14" fontWeight="extrabold" letterSpacing="3">INDIA</text>
              <text x="350" y="560" fill="#475569" fontSize="11" letterSpacing="2">INDIAN OCEAN</text>

              {/* Trajectory 1: Cyclone Track in Bay of Bengal (Day 3 -> Day 10) */}
              <g id="track-cyclone">
                {/* Uncertainty cone */}
                <path d="M 520 460 L 580 260 L 630 270 L 540 470 Z" fill="rgba(239, 68, 68, 0.12)" stroke="rgba(239, 68, 68, 0.3)" strokeDasharray="3 3" />
                {/* Trajectory path */}
                <path d="M 530 465 Q 545 390 565 330 T 595 240" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="5 3" />
                {/* Forecast lead nodes */}
                <circle cx="530" cy="465" r="4.5" fill="#EF4444" />
                <circle cx="542" cy="405" r="4.5" fill="#EF4444" />
                <circle cx="555" cy="355" r="5" fill="#EF4444" />
                <circle cx="572" cy="300" r="5.5" fill="#EF4444" />
                <circle cx="595" cy="240" r="6" fill="#DC2626" />

                {/* Day 5 Current Centroid radar pulse */}
                <circle cx="555" cy="355" r="16" fill="none" stroke="#EF4444" strokeWidth="1.5" className="radar-target" />
                <rect x="520" y="320" width="70" height="70" fill="none" stroke="#EF4444" strokeWidth="1.2" strokeDasharray="2 2" />
                <text x="598" y="358" fill="#FCA5A5" fontSize="10" fontFamily="monospace" fontWeight="bold">Day 5 Threat (965 hPa)</text>
              </g>

              {/* Trajectory 2: NW India Severe Heatwave Zone */}
              <g id="track-heatwave">
                <circle cx="270" cy="180" r="38" fill="rgba(245, 158, 11, 0.22)" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="270" cy="180" r="4" fill="#D97706" />
                <text x="210" y="160" fill="#FCD34D" fontSize="10" fontFamily="monospace" fontWeight="bold">Heatwave Zone (47.8°C)</text>
              </g>

              {/* Trajectory 3: Western Ghats Extreme Rain Zone */}
              <g id="track-rain">
                <rect x="290" y="320" width="30" height="90" rx="6" fill="rgba(6, 182, 212, 0.25)" stroke="#06B6D4" strokeWidth="1.5" />
                <circle cx="305" cy="365" r="4" fill="#0284C7" />
                <text x="180" y="360" fill="#7DD3FC" fontSize="10" fontFamily="monospace" fontWeight="bold">Deluge (&gt;200mm)</text>
              </g>
            </svg>

            {/* Overlay Map Telemetry Card */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-2.5 rounded-lg text-white font-mono text-[11px] shadow-lg max-w-sm">
              <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5">
                <span className="text-sky-400 font-bold uppercase">{activeEvent.event_name}</span>
                <span className="text-emerald-400 font-semibold">{activeEvent.movement_direction} (25 km/h)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                <div>Centroid: <span className="text-white">{activeEvent.current_lat}°N, {activeEvent.current_lon}°E</span></div>
                <div>Intensity: <span className="text-amber-300 font-bold">{activeEvent.intensity} knots</span></div>
                <div>Lead Horizon: <span className="text-white">Day 3 → Day 10</span></div>
                <div>Dynamic Crop: <span className="text-cyan-300">Active (4D Box)</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Full Pipeline Controller & Real-Time Intelligence */}
        <div className="space-y-5">
          {/* Scientific Pipeline Executor Card */}
          <div className="app-window">
            <div className="app-window-header">
              <span className="window-title">OPERATIONAL PIPELINE CONTROLLER</span>
              <span className="badge-trained">END-TO-END</span>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Executes the complete scientific chain:
                <br />
                <span className="font-mono text-sky-700 font-semibold">
                  DATA → ANOMALY → DETECTION → TRACKING → THREAT REGION → DOWNSCALING → PHYSICS → UNCERTAINTY → ALERT
                </span>
              </p>

              <button
                onClick={runPipeline}
                disabled={pipelineRunning}
                className="w-full btn-primary !py-2.5 text-xs font-semibold justify-center shadow-md disabled:opacity-60"
              >
                {pipelineRunning ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Executing Multi-Stage AI Pipeline...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4 fill-white" />
                    RUN FULL PIPELINE API NOW
                  </span>
                )}
              </button>

              {pipelineResult && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px] text-emerald-800 font-bold">
                    <span>RUN ID: {pipelineResult.run_id}</span>
                    <span className="bg-emerald-200 px-1.5 py-0.5 rounded text-emerald-900">SUCCESS</span>
                  </div>
                  <div className="text-[11px] text-slate-700 space-y-1 font-mono">
                    <div>• Anomaly Score: <span className="font-bold text-slate-900">{pipelineResult.detection?.anomaly_score}</span></div>
                    <div>• Downscale Res: <span className="text-sky-700 font-bold">{pipelineResult.downscaling?.output_resolution}</span></div>
                    <div>• Physics Check: <span className="text-emerald-700 font-bold">{pipelineResult.physics_validation?.status} ({pipelineResult.physics_validation?.checks_passed}/{pipelineResult.physics_validation?.total_checks})</span></div>
                    <div>• Ensemble Spread: <span className="text-amber-800 font-bold">{pipelineResult.uncertainty?.spatial_spread_km} km</span></div>
                  </div>
                  <button
                    onClick={() => onNavigate('api_explorer')}
                    className="w-full text-[11px] text-sky-700 hover:text-sky-900 font-semibold text-center flex items-center justify-center gap-1 pt-1"
                  >
                    View raw telemetry in API Explorer <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Active Advisories Card */}
          <div className="card-command p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Active NCMRWF Hazard Advisories
              </span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {alerts.length} ALERTS
              </span>
            </div>

            <div className="space-y-2.5">
              {alerts.slice(0, 3).map((alt, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer hover:shadow-xs transition-shadow ${
                    alt.severity_level === 3 
                      ? 'bg-red-50/60 border-red-200' 
                      : 'bg-amber-50/60 border-amber-200'
                  }`}
                  onClick={() => onNavigate('alerts')}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] font-bold mb-1">
                    <span className={alt.severity_level === 3 ? "text-red-700" : "text-amber-800"}>
                      {alt.alert_id} • {alt.hazard_type}
                    </span>
                    <span className="text-slate-500">{alt.forecast_lead}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed">
                    {alt.action_advisory}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('alerts')}
              className="w-full text-center text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center justify-center gap-1 pt-1"
            >
              Open Hazard Risk Center <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tracked Events Summary Table */}
      <div className="card-command p-4">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Medium-Range Atmospheric Anomaly Targets</h3>
            <p className="text-xs text-slate-500">Continuous forward propagation tracking from Day 3 to Day 10</p>
          </div>
          <button 
            onClick={() => onNavigate('tracking')} 
            className="btn-secondary text-xs !py-1 !px-2.5"
          >
            Inspect Trajectories <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100/80 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">EVENT ID</th>
                <th className="py-2.5 px-3">HAZARD NAME</th>
                <th className="py-2.5 px-3">TYPE</th>
                <th className="py-2.5 px-3">COORDINATES</th>
                <th className="py-2.5 px-3">HORIZON</th>
                <th className="py-2.5 px-3">DIRECTION</th>
                <th className="py-2.5 px-3">SEVERITY</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((ev, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-sky-700">{ev.event_id}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{ev.event_name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{ev.event_type}</td>
                  <td className="py-2.5 px-3 text-slate-700">{ev.current_lat}°N, {ev.current_lon}°E</td>
                  <td className="py-2.5 px-3 text-slate-600">{ev.forecast_lead}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-semibold">{ev.movement_direction}</td>
                  <td className="py-2.5 px-3">
                    <span className={ev.severity_level === 3 ? "badge-severe" : "badge-simulated"}>
                      Level {ev.severity_level}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onNavigate('tracking')}
                      className="text-sky-600 hover:text-sky-800 font-semibold hover:underline"
                    >
                      Track →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
