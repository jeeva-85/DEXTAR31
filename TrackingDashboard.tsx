import React, { useState, useEffect } from 'react';
import { 
  Compass, Navigation, Play, ChevronRight, Sliders, 
  MapPin, ShieldAlert, ArrowUpRight, Share2, Activity
} from 'lucide-react';
import { CommandHeader } from './CommandHeader';
import { api } from '../services/api';

interface TrackingDashboardProps {
  events: any[];
  onNavigate: (tab: string) => void;
}

export const TrackingDashboard: React.FC<TrackingDashboardProps> = ({ events, onNavigate }) => {
  const [selectedEventId, setSelectedEventId] = useState<string>("CYC-BOB-MR-01");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [selectedLeadStep, setSelectedLeadStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    loadTracking(selectedEventId);
  }, [selectedEventId]);

  const loadTracking = async (eventId: string) => {
    try {
      const data = await api.getTracking(eventId);
      setTrackingData(data);
      setSelectedLeadStep(0);
    } catch (err: any) {
      console.error("Failed to load tracking:", err);
    }
  };

  // Timeline playback loop
  useEffect(() => {
    let timer: any;
    if (isPlaying && trackingData?.trajectory) {
      timer = setInterval(() => {
        setSelectedLeadStep(prev => (prev + 1) % trackingData.trajectory.length);
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, trackingData]);

  if (!trackingData) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading tracking telemetry...</div>;
  }

  const trajectory = trackingData.trajectory || [];
  const currentPoint = trajectory[selectedLeadStep] || trajectory[0];
  const bbox = currentPoint?.threat_bounding_box || {};
  const graph = trackingData.spherical_graph || {};

  return (
    <div className="space-y-6">
      <CommandHeader 
        title="06 • SPATIO-TEMPORAL TRACKING & THREAT EVOLUTION"
        eventName={trackingData.event_name}
        dataSource="NEPS-G 11-Member Ensemble Propagation"
        forecastHorizon={trackingData.forecast_lead}
        modelName="Spherical Spatial Geometry Tracker"
        status="TRAJECTORY ACTIVE"
        isTrained={true}
      />

      {/* Target Selector & Timeline Controller Bar */}
      <div className="card-command p-4 bg-white border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Select Tracked Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs font-bold text-slate-800"
            >
              {events.map(ev => (
                <option key={ev.event_id} value={ev.event_id}>
                  {ev.event_name} ({ev.event_type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn-secondary text-xs !py-1 !px-3 font-semibold"
            >
              <Play className={`w-3.5 h-3.5 ${isPlaying ? 'fill-sky-600 text-sky-600' : ''}`} />
              {isPlaying ? "PAUSE PLAYBACK" : "PLAY TIMELINE"}
            </button>
            <span className="text-xs font-mono bg-sky-50 text-sky-800 px-2.5 py-1 rounded border border-sky-200 font-bold">
              Current: Day {currentPoint?.forecast_lead_day} ({currentPoint?.valid_time})
            </span>
          </div>
        </div>

        {/* Lead Timeline Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>START: Day {trackingData.start_lead_day} (Genesis / Ingestion)</span>
            <span className="text-sky-700 font-bold">ACTIVE LEAD: Day {currentPoint?.forecast_lead_day} (+{currentPoint?.forecast_lead_hours}h)</span>
            <span>END: Day {trackingData.end_lead_day} (Terminal Horizon)</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max={trajectory.length - 1} 
            value={selectedLeadStep}
            onChange={(e) => setSelectedLeadStep(parseInt(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>
      </div>

      {/* Main Grid: Track Visualization & Dynamic Bounding Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Track Progression & Bounding Box Graphic */}
        <div className="lg:col-span-2 app-window">
          <div className="app-window-header">
            <div className="window-title-group">
              <span className="window-title">SPHERICAL CENTROID PROPAGATION & 4D THREAT BOUNDING BOX</span>
            </div>
            <div className="window-badge-group">
              <span className="badge-trained">SPHERICAL HAVERSINE</span>
              <span className="badge-prototype">DYNAMIC CROP</span>
            </div>
          </div>

          {/* Graphical Visualization Area */}
          <div className="relative w-full h-[400px] bg-slate-900 overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-scientific-grid opacity-25"></div>

            {/* SVG Visualizing Track Progression */}
            <svg viewBox="0 0 600 360" className="w-full h-full object-contain">
              {/* Geographic references */}
              <text x="30" y="40" fill="#64748B" fontSize="11" fontFamily="monospace">FORECAST TRAJECTORY EVOLUTION</text>

              {/* Draw connected trajectory path */}
              {trajectory.length > 1 && (
                <polyline
                  points={trajectory.map((p: any, i: number) => {
                    const x = 80 + i * 65;
                    const y = 300 - (i * 28 + Math.sin(i * 0.8) * 15);
                    return `${x},${y}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3"
                  strokeDasharray="6 3"
                />
              )}

              {/* Render each waypoint */}
              {trajectory.map((p: any, idx: number) => {
                const x = 80 + idx * 65;
                const y = 300 - (idx * 28 + Math.sin(idx * 0.8) * 15);
                const isCurrent = idx === selectedLeadStep;

                return (
                  <g key={idx} onClick={() => setSelectedLeadStep(idx)} className="cursor-pointer">
                    {/* Uncertainty buffer circle */}
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={isCurrent ? 26 : 14 + idx * 2} 
                      fill={isCurrent ? "rgba(239, 68, 68, 0.25)" : "rgba(2, 132, 199, 0.15)"}
                      stroke={isCurrent ? "#EF4444" : "#0284C7"}
                      strokeWidth={isCurrent ? 2 : 1}
                      strokeDasharray={isCurrent ? "none" : "2 2"}
                      className={isCurrent ? "radar-target" : ""}
                    />

                    {/* Centroid dot */}
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={isCurrent ? 7 : 4} 
                      fill={isCurrent ? "#DC2626" : "#0284C7"}
                    />

                    {/* Lead tag */}
                    <text 
                      x={x - 12} 
                      y={y + (isCurrent ? 42 : 28)} 
                      fill={isCurrent ? "#FCA5A5" : "#94A3B8"} 
                      fontSize="10" 
                      fontFamily="monospace"
                      fontWeight={isCurrent ? "bold" : "normal"}
                    >
                      D{p.forecast_lead_day}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Overlay Telemetry Badge on Graphic */}
            <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-700 p-2.5 rounded-lg text-white font-mono text-[11px] space-y-1">
              <div className="text-sky-400 font-bold">FORWARD MOTION TELEMETRY:</div>
              <div>Velocity: <span className="text-white font-bold">{currentPoint?.velocity_kmh} km/h</span></div>
              <div>Bearing: <span className="text-white font-bold">{currentPoint?.bearing_degrees}° ({currentPoint?.movement_direction})</span></div>
              <div>Uncertainty Cone: <span className="text-amber-400 font-bold">±{currentPoint?.uncertainty_radius_km} km</span></div>
            </div>
          </div>
        </div>

        {/* Right Panel: Dynamic Threat Bounding Box Details */}
        <div className="space-y-5">
          <div className="app-window p-4 space-y-3.5">
            <div className="app-window-header -m-4 mb-3.5">
              <span className="window-title">DYNAMIC THREAT-REGION BOUNDING BOX</span>
              <span className="badge-severe">ACTIVE CROP</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              The bounding box adapts dynamically across forecast time, defining the target spatial crop for Stage-2 localized downscaling.
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs space-y-2">
              <div className="text-sky-800 font-bold flex items-center justify-between border-b border-slate-200 pb-1">
                <span>4D COORDINATE BOUNDS:</span>
                <span className="text-[10px] text-slate-500">Day {currentPoint?.forecast_lead_day}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Min Lat: <span className="font-bold text-slate-800">{bbox.min_latitude}°N</span></div>
                <div>Max Lat: <span className="font-bold text-slate-800">{bbox.max_latitude}°N</span></div>
                <div>Min Lon: <span className="font-bold text-slate-800">{bbox.min_longitude}°E</span></div>
                <div>Max Lon: <span className="font-bold text-slate-800">{bbox.max_longitude}°E</span></div>
              </div>
              <div className="pt-1.5 border-t border-slate-200 text-[10px] text-slate-500">
                Centroid: {currentPoint?.centroid?.latitude}°N, {currentPoint?.centroid?.longitude}°E
              </div>
            </div>

            <button
              onClick={() => onNavigate('downscaling')}
              className="w-full btn-primary text-xs !py-2 justify-center font-bold"
            >
              <Sliders className="w-3.5 h-3.5" />
              Downscale Threat Region to ~5km →
            </button>
          </div>

          {/* Spherical Graph Representation (Section 14) */}
          <div className="card-command p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-900 uppercase">
                Spherical Graph Representation
              </span>
              <span className="badge-prototype">RESEARCH STAGE</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "The system represents atmospheric locations and their spatial relationships while accounting for the Earth's global geometry."
            </p>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
              <div>• Graph Nodes: <span className="font-bold">{graph.nodes_count || trajectory.length}</span> atmospheric locations</div>
              <div>• Graph Edges: <span className="font-bold">{graph.edges_count || 12}</span> spherical geodesic relationships</div>
              <div>• Advanced GNN Stage: <span className="text-amber-800 font-bold">RESEARCH/INTEGRATION</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
