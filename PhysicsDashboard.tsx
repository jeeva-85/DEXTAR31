import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, 
  Thermometer, Wind, CloudRain, Activity, Layers, 
  HelpCircle, Sliders, Play, ShieldCheck
} from 'lucide-react';
import { CommandHeader } from './CommandHeader';
import { api } from '../services/api';

interface PhysicsDashboardProps {
  onNavigate: (tab: string) => void;
}

export const PhysicsDashboard: React.FC<PhysicsDashboardProps> = ({ onNavigate }) => {
  const [params, setParams] = useState({
    temp_c: 28.5,
    relative_humidity: 94.0,
    pressure_hpa: 965.0,
    wind_speed_ms: 42.0,
    precipitation_mm: 175.0,
  });

  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runValidation();
  }, []);

  const runValidation = async (customParams = params) => {
    try {
      setLoading(true);
      const res = await api.validatePhysicsCustom(customParams);
      setValidationResult(res);
    } catch (err) {
      console.error("Physics validation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (presetName: string) => {
    let p = { ...params };
    if (presetName === 'cyclone') {
      p = { temp_c: 27.8, relative_humidity: 96.0, pressure_hpa: 955.0, wind_speed_ms: 48.0, precipitation_mm: 220.0 };
    } else if (presetName === 'heatwave') {
      p = { temp_c: 47.5, relative_humidity: 18.0, pressure_hpa: 1002.0, wind_speed_ms: 9.0, precipitation_mm: 0.0 };
    } else if (presetName === 'monsoon') {
      p = { temp_c: 25.5, relative_humidity: 98.0, pressure_hpa: 994.0, wind_speed_ms: 18.0, precipitation_mm: 310.0 };
    } else if (presetName === 'unphysical') {
      p = { temp_c: 15.0, relative_humidity: 140.0, pressure_hpa: 820.0, wind_speed_ms: 130.0, precipitation_mm: -12.0 };
    }
    setParams(p);
    runValidation(p);
  };

  const status = validationResult?.overall_status || 'PASS';
  const checks = validationResult?.checks || [];
  const derived = validationResult?.derived_quantities || {};

  return (
    <div className="space-y-6">
      <CommandHeader 
        title="09 • METPY THERMODYNAMIC & PHYSICAL CONSISTENCY VALIDATOR"
        eventName="ATMOSPHERIC STATE CONSISTENCY ENGINE"
        dataSource="MetPy 1.6+ Meteorological Physics Standards"
        forecastHorizon="PHYSICAL INTEGRITY CHECK"
        modelName="CLAUSIUS-CLAPEYRON & HYDROSTATIC AUDITOR"
        status={status === 'PASS' ? "CONSISTENCY VERIFIED" : "WARNING AUDIT"}
        isTrained={true}
        onRefresh={() => runValidation()}
      />

      {/* Preset Selector Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase">Load Test Preset:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => applyPreset('cyclone')}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Bay of Bengal Cyclone
            </button>
            <button
              onClick={() => applyPreset('heatwave')}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              NW India Extreme Heatwave
            </button>
            <button
              onClick={() => applyPreset('monsoon')}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Western Ghats Extreme Monsoon
            </button>
            <button
              onClick={() => applyPreset('unphysical')}
              className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 transition-colors"
            >
              Unphysical Anomaly Stress Test
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge-trained">METPY PHYSICS ENGINE ACTIVE</span>
        </div>
      </div>

      {/* Main Grid: Interactive Parameters Controls + Validation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Atmospheric Controls */}
        <div className="app-window p-5 lg:col-span-1 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-mono font-bold text-sky-600 uppercase">Atmospheric Parameters</span>
            <h3 className="text-base font-bold text-slate-900">Input Meteorological State</h3>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Temperature */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-600 font-semibold flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  Temperature (°C)
                </label>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {params.temp_c}°C
                </span>
              </div>
              <input
                type="range"
                min={-10}
                max={55}
                step={0.5}
                value={params.temp_c}
                onChange={(e) => setParams({ ...params, temp_c: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Relative Humidity */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-600 font-semibold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  Relative Humidity (%)
                </label>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {params.relative_humidity}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={150}
                step={1}
                value={params.relative_humidity}
                onChange={(e) => setParams({ ...params, relative_humidity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Barometric Pressure */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-600 font-semibold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  Central MSLP (hPa)
                </label>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {params.pressure_hpa} hPa
                </span>
              </div>
              <input
                type="range"
                min={800}
                max={1080}
                step={1}
                value={params.pressure_hpa}
                onChange={(e) => setParams({ ...params, pressure_hpa: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Wind Speed */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-600 font-semibold flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-teal-600" />
                  Wind Speed (m/s)
                </label>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {params.wind_speed_ms} m/s ({Math.round(params.wind_speed_ms * 3.6)} km/h)
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={120}
                step={1}
                value={params.wind_speed_ms}
                onChange={(e) => setParams({ ...params, wind_speed_ms: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Precipitation */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-600 font-semibold flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                  Daily Precipitation (mm)
                </label>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {params.precipitation_mm} mm
                </span>
              </div>
              <input
                type="range"
                min={-20}
                max={500}
                step={5}
                value={params.precipitation_mm}
                onChange={(e) => setParams({ ...params, precipitation_mm: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            <button
              onClick={() => runValidation(params)}
              disabled={loading}
              className="btn-primary w-full !py-2.5 mt-2 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              {loading ? "Evaluating MetPy Checks..." : "Run Physics Consistency Audit"}
            </button>
          </div>
        </div>

        {/* Right Column: Physical Consistency Audit Report */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status Verdict Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            status === 'PASS' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : status === 'WARNING'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                status === 'PASS' ? 'bg-emerald-200 text-emerald-800' :
                status === 'WARNING' ? 'bg-amber-200 text-amber-800' : 'bg-red-200 text-red-800'
              }`}>
                {status === 'PASS' ? <CheckCircle2 className="w-6 h-6" /> :
                 status === 'WARNING' ? <AlertTriangle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wide">
                  Physical Consistency Verdict: {status}
                </div>
                <div className="text-sm font-bold mt-0.5">
                  {status === 'PASS' && "Atmospheric state satisfies all meteorological thermodynamic conservation laws."}
                  {status === 'WARNING' && "Atmospheric state exhibits edge-case or anomalous thermodynamic extremes."}
                  {status === 'REVIEW' && "Atmospheric state violates fundamental physical constraints (unphysical inputs)."}
                </div>
              </div>
            </div>

            <div className="font-mono text-xs font-semibold px-3 py-1 rounded bg-white/80 border">
              {checks.length} Tests Checked
            </div>
          </div>

          {/* Derived Thermodynamic Values Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="card-command p-3.5">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Calculated Dewpoint (Td)</div>
              <div className="text-lg font-black text-slate-900 mt-1 font-mono">
                {derived.dewpoint_celsius !== undefined ? `${derived.dewpoint_celsius}°C` : 'N/A'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Constraint: Td ≤ {params.temp_c}°C
              </div>
            </div>

            <div className="card-command p-3.5">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Saturation Vapor (es)</div>
              <div className="text-lg font-black text-slate-900 mt-1 font-mono">
                {derived.saturation_vapor_pressure_hpa !== undefined ? `${derived.saturation_vapor_pressure_hpa} hPa` : 'N/A'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Clausius-Clapeyron limit
              </div>
            </div>

            <div className="card-command p-3.5">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Actual Vapor (e)</div>
              <div className="text-lg font-black text-slate-900 mt-1 font-mono">
                {derived.vapor_pressure_hpa !== undefined ? `${derived.vapor_pressure_hpa} hPa` : 'N/A'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                e = es × (RH / 100)
              </div>
            </div>
          </div>

          {/* Check Breakdown Cards */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-600 px-1">
              Individual Constraint Verifications
            </h4>

            {checks.map((chk: any, i: number) => {
              const isPass = chk.status === 'PASS';
              const isWarning = chk.status === 'WARNING';

              return (
                <div 
                  key={i} 
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                    isPass ? 'bg-white border-slate-200' :
                    isWarning ? 'bg-amber-50/50 border-amber-300' : 'bg-red-50/50 border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isPass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-slate-900">{chk.name}</div>
                      {chk.value && <div className="text-[11px] text-slate-500 mt-0.5">Observed: {chk.value}</div>}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isPass ? 'bg-emerald-100 text-emerald-800' :
                    isWarning ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {chk.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
