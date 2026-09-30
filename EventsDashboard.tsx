import React, { useState, useEffect } from 'react';
import { 
  CloudRain, Wind, Thermometer, AlertCircle, Compass, 
  MapPin, Calendar, Clock, ArrowRight, ShieldAlert, 
  RefreshCw, ChevronRight, Activity, Sliders
} from 'lucide-react';
import { CommandHeader } from './CommandHeader';
import { api } from '../services/api';

interface EventsDashboardProps {
  events: any[];
  onNavigate: (tab: string) => void;
}

export const EventsDashboard: React.FC<EventsDashboardProps> = ({ events: initialEvents, onNavigate }) => {
  const [events, setEvents] = useState<any[]>(initialEvents || []);
  const [selectedEventId, setSelectedEventId] = useState<string>("CYC-BOB-MR-01");
  const [eventDetail, setEventDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadEventDetail(selectedEventId);
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.listEvents();
      if (data && data.length > 0) {
        setEvents(data);
        if (!selectedEventId) {
          setSelectedEventId(data[0].event_id);
        }
      }
    } catch (err) {
      console.error("Failed to load events", err);
    } finally {
      setLoading(false);
    }
  };

  const loadEventDetail = async (id: string) => {
    try {
      const data = await api.getEventDetail(id);
      setEventDetail(data);
    } catch (err) {
      console.error("Failed to load event detail", err);
    }
  };

  const filteredEvents = events.filter(e => {
    if (filterType === "ALL") return true;
    return e.event_type === filterType;
  });

  const activeEvent = events.find(e => e.event_id === selectedEventId) || events[0] || {};
  const trajectory = eventDetail?.trajectory || [];

  return (
    <div className="space-y-6">
      <CommandHeader 
        title="04 • EXTREME WEATHER EVENTS CATALOG & TRAJECTORY ANALYSIS"
        eventName={activeEvent.event_name || "Bay of Bengal Severe Cyclone"}
        dataSource="NEPS-G (11 Ens) • IMDAA • NCUM"
        forecastHorizon="DAY 3 → DAY 10 (72h - 240h)"
        modelName="SPATIO-TEMPORAL EVENT RECOGNIZER"
        status={activeEvent.status || "ACTIVE TRACKING"}
        isTrained={true}
        onRefresh={loadEvents}
      />

      {/* Filter and Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase">Filter Hazard Type:</span>
          <div className="flex items-center gap-1.5">
            {['ALL', 'TROPICAL_CYCLONE', 'HEATWAVE', 'EXTREME_RAINFALL'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filterType === type 
                    ? 'bg-sky-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
          <span>Catalog Count: <strong className="text-slate-900">{filteredEvents.length} Active Events</strong></span>
          <button 
            onClick={loadEvents}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Events Grid + Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Event Cards List */}
        <div className="space-y-3 lg:col-span-1">
          <div className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider px-1">
            Active Identified Events
          </div>

          <div className="space-y-2.5">
            {filteredEvents.map(ev => {
              const isSelected = ev.event_id === selectedEventId;
              const isCyclone = ev.event_type?.includes('CYCLONE');
              const isHeatwave = ev.event_type?.includes('HEATWAVE');

              return (
                <div
                  key={ev.event_id}
                  onClick={() => setSelectedEventId(ev.event_id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50/60 border-sky-300 ring-2 ring-sky-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isCyclone ? 'bg-sky-100 text-sky-700' :
                        isHeatwave ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isCyclone ? <Wind className="w-4 h-4" /> :
                         isHeatwave ? <Thermometer className="w-4 h-4" /> : <CloudRain className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-mono text-[10px] font-bold text-slate-400">{ev.event_id}</div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">{ev.event_name}</h4>
                      </div>
                    </div>

                    <span className={
                      ev.severity_level >= 3 ? "badge-severe" : "badge-simulated"
                    }>
                      {ev.severity_level >= 3 ? "HIGH SEV" : "MODERATE"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 font-mono text-[11px]">
                    <div>
                      <div className="text-[10px] text-slate-400">Centroid</div>
                      <div className="font-semibold text-slate-800">{ev.current_lat}°N, {ev.current_lon}°E</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Heading</div>
                      <div className="font-semibold text-slate-800">{ev.movement_direction} @ {ev.mean_velocity_kmh} km/h</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Lead Horizon</div>
                      <div className="font-semibold text-sky-700">{ev.forecast_lead}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Event Intelligence & Trajectory Timeline */}
        <div className="lg:col-span-2 space-y-5">
          <div className="app-window p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-sky-600 uppercase">Event Intelligence Dossier</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">{activeEvent.event_name}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Centroid: {activeEvent.current_lat}°N, {activeEvent.current_lon}°E
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Compass className="w-3.5 h-3.5 text-slate-400" />
                    Tracking Vector: {activeEvent.movement_direction} ({activeEvent.mean_velocity_kmh} km/h)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('tracking')}
                  className="btn-secondary text-xs flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-sky-600" />
                  Full Track Map
                </button>
                <button
                  onClick={() => onNavigate('downscaling')}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Downscale Event
                </button>
              </div>
            </div>

            {/* Trajectory Points Timeline Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-700">
                  Forecast Lead Trajectory Points (Day 3 → Day 10)
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {trajectory.length} Waypoints Tracked
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Lead Day</th>
                      <th className="py-2.5 px-3">Valid Horizon</th>
                      <th className="py-2.5 px-3">Centroid (Lat/Lon)</th>
                      <th className="py-2.5 px-3">Intensity</th>
                      <th className="py-2.5 px-3">Uncertainty Radius</th>
                      <th className="py-2.5 px-3">Ensemble Spread</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trajectory.map((pt: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-sky-700">
                          Day {pt.forecast_lead_day}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">
                          {pt.valid_time}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800">
                          {pt.centroid?.latitude?.toFixed(2)}°N, {pt.centroid?.longitude?.toFixed(2)}°E
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {pt.intensity}
                        </td>
                        <td className="py-2.5 px-3 text-amber-700 font-semibold">
                          ±{pt.uncertainty_radius_km} km
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {pt.ensemble_members?.length || 11} Members
                        </td>
                      </tr>
                    ))}
                    {trajectory.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          Select an event or wait for trajectory synchronization...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-700">NEPS-G Ensemble Spread</div>
                  <div className="text-xs text-slate-500 mt-0.5">Analyze 11-member multi-lead dispersion</div>
                </div>
                <button
                  onClick={() => onNavigate('uncertainty')}
                  className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  View Uncertainty
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-700">MetPy Physics Verification</div>
                  <div className="text-xs text-slate-500 mt-0.5">Check thermodynamic physical constraints</div>
                </div>
                <button
                  onClick={() => onNavigate('physics')}
                  className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1"
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  Validate Physics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
