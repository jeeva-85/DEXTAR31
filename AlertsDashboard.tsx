import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2, 
  MapPin, Clock, PlusCircle, RefreshCw, Send, Radio, Compass, Filter
} from 'lucide-react';
import { CommandHeader } from './CommandHeader';
import { api } from '../services/api';

interface AlertsDashboardProps {
  alerts: any[];
  onNavigate: (tab: string) => void;
}

export const AlertsDashboard: React.FC<AlertsDashboardProps> = ({ alerts: initialAlerts, onNavigate }) => {
  const [alerts, setAlerts] = useState<any[]>(initialAlerts || []);
  const [loading, setLoading] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<number | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New alert form state
  const [newAlert, setNewAlert] = useState({
    event_id: 'CYC-BOB-MR-01',
    hazard_type: 'TROPICAL_CYCLONE',
    severity_level: 3,
    severity_category: 'Extreme / Emergency',
    forecast_lead: 'Day 5 Lead (120 hrs)',
    action_advisory: '',
    centroid_lat: 18.5,
    centroid_lon: 86.8,
    uncertainty_radius_km: 75.0
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.listAlerts();
      if (data) setAlerts(data);
    } catch (err) {
      console.error("Failed to load alerts", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.action_advisory.trim()) {
      alert("Please provide an action advisory message.");
      return;
    }
    try {
      setLoading(true);
      await api.createAlert(newAlert);
      setShowCreateModal(false);
      setNewAlert({
        event_id: 'CYC-BOB-MR-01',
        hazard_type: 'TROPICAL_CYCLONE',
        severity_level: 3,
        severity_category: 'Extreme / Emergency',
        forecast_lead: 'Day 5 Lead (120 hrs)',
        action_advisory: '',
        centroid_lat: 18.5,
        centroid_lon: 86.8,
        uncertainty_radius_km: 75.0
      });
      await loadAlerts();
    } catch (err: any) {
      alert("Failed to create alert: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (selectedSeverity === 'ALL') return true;
    return a.severity_level === selectedSeverity;
  });

  const redCount = alerts.filter(a => a.severity_level >= 3).length;
  const orangeCount = alerts.filter(a => a.severity_level === 2).length;
  const yellowCount = alerts.filter(a => a.severity_level <= 1).length;

  return (
    <div className="space-y-6">
      <CommandHeader 
        title="10 • OPERATIONAL HAZARD ADVISORIES & DISASTER RISK WARNINGS"
        eventName="NATIONAL DISASTER MANAGEMENT EARLY WARNING"
        dataSource="MoES • IMD • NCMRWF Telemetry"
        forecastHorizon="CALIBRATED ACTION PROTOCOLS"
        modelName="DECISION SUPPORT SYSTEM (DSS)"
        status="ACTIVE MONITORING"
        isTrained={true}
        onRefresh={loadAlerts}
      />

      {/* Severity Counters & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setSelectedSeverity('ALL')}
          className={`card-command p-4 cursor-pointer border-l-4 border-l-sky-500 transition-all ${
            selectedSeverity === 'ALL' ? 'ring-2 ring-sky-500/20 shadow-sm' : ''
          }`}
        >
          <div className="text-[11px] font-mono text-slate-500 uppercase">Total Active Advisories</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{alerts.length}</div>
          <div className="text-[11px] text-sky-700 font-medium mt-1">All Operational Sectors</div>
        </div>

        <div 
          onClick={() => setSelectedSeverity(3)}
          className={`card-command p-4 cursor-pointer border-l-4 border-l-red-500 transition-all ${
            selectedSeverity === 3 ? 'ring-2 ring-red-500/20 shadow-sm' : ''
          }`}
        >
          <div className="text-[11px] font-mono text-slate-500 uppercase">Red Alert (Emergency)</div>
          <div className="text-2xl font-black text-red-600 mt-1">{redCount}</div>
          <div className="text-[11px] text-red-700 font-medium mt-1">Immediate Defense Mobilization</div>
        </div>

        <div 
          onClick={() => setSelectedSeverity(2)}
          className={`card-command p-4 cursor-pointer border-l-4 border-l-amber-500 transition-all ${
            selectedSeverity === 2 ? 'ring-2 ring-amber-500/20 shadow-sm' : ''
          }`}
        >
          <div className="text-[11px] font-mono text-slate-500 uppercase">Orange Warning (Severe)</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{orangeCount}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Pre-positioning & Watch</div>
        </div>

        <div 
          onClick={() => setSelectedSeverity(1)}
          className={`card-command p-4 cursor-pointer border-l-4 border-l-slate-400 transition-all ${
            selectedSeverity === 1 ? 'ring-2 ring-slate-500/20 shadow-sm' : ''
          }`}
        >
          <div className="text-[11px] font-mono text-slate-500 uppercase">Yellow Advisory (Watch)</div>
          <div className="text-2xl font-black text-slate-700 mt-1">{yellowCount}</div>
          <div className="text-[11px] text-slate-600 font-medium mt-1">Medium-Range Vigilance</div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono font-bold text-slate-600 uppercase">Filter:</span>
          <div className="flex items-center gap-1.5">
            {[
              { label: 'All Severities', val: 'ALL' },
              { label: 'Red (Level 3)', val: 3 },
              { label: 'Orange (Level 2)', val: 2 },
              { label: 'Yellow (Level 1)', val: 1 }
            ].map(f => (
              <button
                key={String(f.val)}
                onClick={() => setSelectedSeverity(f.val as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  selectedSeverity === f.val 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Issue Operational Advisory
          </button>
          <button
            onClick={loadAlerts}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Active Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alt: any) => {
          const isRed = alt.severity_level >= 3;
          const isOrange = alt.severity_level === 2;

          return (
            <div 
              key={alt.alert_id}
              className={`p-5 rounded-xl border transition-all ${
                isRed 
                  ? 'bg-red-50/40 border-red-200 shadow-xs' 
                  : isOrange 
                  ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isRed ? 'bg-red-100 text-red-700' :
                    isOrange ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{alt.alert_id}</span>
                      <span className="font-mono text-xs font-semibold text-slate-600">[{alt.event_id}]</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      {alt.hazard_type.replace('_', ' ')} • {alt.severity_category}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={isRed ? 'badge-severe' : isOrange ? 'badge-simulated' : 'badge-prototype'}>
                    LEVEL {alt.severity_level}
                  </span>
                  <span className="font-mono text-xs text-sky-800 bg-sky-50 px-2.5 py-1 rounded border border-sky-200 font-semibold">
                    {alt.forecast_lead}
                  </span>
                </div>
              </div>

              {/* Action Advisory Text */}
              <p className="text-xs text-slate-700 mt-3 bg-white/80 p-3 rounded-lg border border-slate-200/80 leading-relaxed font-sans">
                <strong className="text-slate-900 font-semibold">Action Advisory: </strong>
                {alt.action_advisory}
              </p>

              {/* Footer Coordinates & Uncertainty Radius */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 text-xs font-mono text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Target Centroid: {alt.centroid_lat}°N, {alt.centroid_lon}°E
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-700 font-semibold">
                    <Compass className="w-3.5 h-3.5" />
                    Uncertainty Radius: ±{alt.uncertainty_radius_km} km
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  {alt.issued_at ? new Date(alt.issued_at).toLocaleString() : 'Active Now'}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 font-mono text-xs">
            No hazard advisories matching the selected filter.
          </div>
        )}
      </div>

      {/* Create Alert Modal / Drawer */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="app-window max-w-lg w-full p-6 bg-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                Draft Operational Hazard Advisory
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Event Target:</label>
                  <select
                    value={newAlert.event_id}
                    onChange={(e) => setNewAlert({ ...newAlert, event_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value="CYC-BOB-MR-01">CYC-BOB-MR-01 (Bay of Bengal)</option>
                    <option value="HW-NW-IND-01">HW-NW-IND-01 (NW India Heatwave)</option>
                    <option value="RAIN-KONKAN-01">RAIN-KONKAN-01 (Western Ghats)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Hazard Category:</label>
                  <select
                    value={newAlert.hazard_type}
                    onChange={(e) => setNewAlert({ ...newAlert, hazard_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value="TROPICAL_CYCLONE">TROPICAL_CYCLONE</option>
                    <option value="SEVERE_HEATWAVE">SEVERE_HEATWAVE</option>
                    <option value="EXTREME_RAINFALL">EXTREME_RAINFALL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Severity Level:</label>
                  <select
                    value={newAlert.severity_level}
                    onChange={(e) => {
                      const lvl = parseInt(e.target.value);
                      const cat = lvl === 3 ? 'Extreme / Emergency' : lvl === 2 ? 'Severe / Warning' : 'Moderate / Advisory';
                      setNewAlert({ ...newAlert, severity_level: lvl, severity_category: cat });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value="3">Level 3 (Red Emergency)</option>
                    <option value="2">Level 2 (Orange Warning)</option>
                    <option value="1">Level 1 (Yellow Advisory)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Forecast Lead:</label>
                  <input
                    type="text"
                    value={newAlert.forecast_lead}
                    onChange={(e) => setNewAlert({ ...newAlert, forecast_lead: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Lat (°N):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAlert.centroid_lat}
                    onChange={(e) => setNewAlert({ ...newAlert, centroid_lat: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Lon (°E):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAlert.centroid_lon}
                    onChange={(e) => setNewAlert({ ...newAlert, centroid_lon: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Radius (km):</label>
                  <input
                    type="number"
                    value={newAlert.uncertainty_radius_km}
                    onChange={(e) => setNewAlert({ ...newAlert, uncertainty_radius_km: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Action Advisory Directives:</label>
                <textarea
                  rows={3}
                  value={newAlert.action_advisory}
                  onChange={(e) => setNewAlert({ ...newAlert, action_advisory: e.target.value })}
                  placeholder="Specific actionable civil defense instructions, port warnings, evacuation guidelines..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary !py-2 !px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publish Advisory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
