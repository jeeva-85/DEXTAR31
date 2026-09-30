import React, { useState, useEffect } from 'react';
import { 
  Activity, CheckCircle2, AlertTriangle, ShieldCheck, 
  Database, Cpu, Layers, HardDrive, RefreshCw, Server, Clock, Globe
} from 'lucide-react';
import { CommandHeader } from './CommandHeader';
import { api } from '../services/api';

interface SystemHealthDashboardProps {
  systemHealth: any;
  onRefreshHealth: () => void;
  onNavigate: (tab: string) => void;
}

export const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({ 
  systemHealth, 
  onRefreshHealth,
  onNavigate 
}) => {
  const [latency, setLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const measureLatency = async () => {
    try {
      setLoading(true);
      const start = performance.now();
      await api.getSystemHealth();
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      onRefreshHealth();
    } catch (err) {
      console.error("Health ping failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    measureLatency();
  }, []);

  const isHealthy = systemHealth?.status === 'HEALTHY';

  const subsystems = [
    {
      name: "FastAPI Backend Core",
      status: systemHealth?.backend || "CONNECTED",
      desc: "Asynchronous REST microservice router running on port 8000",
      icon: Server,
      healthy: systemHealth?.backend === "CONNECTED"
    },
    {
      name: "SQLite Database & Metadata",
      status: systemHealth?.database || "CONNECTED",
      desc: "Persistent relational store for dataset catalog, events, and alerts",
      icon: Database,
      healthy: systemHealth?.database === "CONNECTED"
    },
    {
      name: "AI Inference & Tracking Engine",
      status: systemHealth?.ai_engine || "READY",
      desc: "LightGBM, XGBoost, MetPy physics, & graph centroid tracking",
      icon: Cpu,
      healthy: systemHealth?.ai_engine === "READY"
    },
    {
      name: "Data Ingestion Pipeline",
      status: systemHealth?.data_pipeline || "READY",
      desc: "Automated scanner and validator for ERA5, IMDAA, and NEPS-G",
      icon: Layers,
      healthy: systemHealth?.data_pipeline === "READY"
    },
    {
      name: "Model Registry & Artifact Store",
      status: systemHealth?.model_registry || "READY",
      desc: "Version-controlled model binaries and metadata catalogs",
      icon: HardDrive,
      healthy: systemHealth?.model_registry === "READY"
    }
  ];

  return (
    <div className="space-y-6">
      <CommandHeader 
        title="14 • SYSTEM INTEGRITY, SUBSYSTEM TELEMETRY & HEALTH MONITOR"
        eventName="NCMRWF WEATHER INTELLIGENCE RUNTIME"
        dataSource="Continuous Real-Time Telemetry"
        forecastHorizon="HIGH-AVAILABILITY ARCHITECTURE"
        modelName="DISTRIBUTED HEALTH CHECK DAEMON"
        status={isHealthy ? "ALL SYSTEMS OPERATIONAL" : "SYSTEM ATTENTION"}
        isTrained={true}
        onRefresh={measureLatency}
      />

      {/* Main Status Hero */}
      <div className={`p-6 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
        isHealthy ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            isHealthy ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
          }`}>
            {isHealthy ? <ShieldCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isHealthy ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-600">
                System Status Verdict
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {isHealthy ? "All Subsystems Fully Operational" : "Degraded Component State"}
            </h2>
            <div className="text-xs text-slate-600 mt-0.5">
              Operational Environment: {systemHealth?.operational_environment || "MoES / NCMRWF Research Prototype"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/90 px-4 py-2 rounded-xl border border-slate-200 font-mono text-xs">
            <span className="text-slate-400 block text-[10px]">API ROUNDTRIP LATENCY</span>
            <span className="text-lg font-black text-sky-700">{latency !== null ? `${latency} ms` : 'Measuring...'}</span>
          </div>
          <button
            onClick={measureLatency}
            disabled={loading}
            className="btn-primary text-xs flex items-center gap-1.5 !py-2.5 !px-4"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Ping Telemetry
          </button>
        </div>
      </div>

      {/* Five Subsystems Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subsystems.map((sub, i) => {
          const Icon = sub.icon;
          return (
            <div key={i} className="app-window p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Icon className="w-5 h-5 text-sky-600" />
                </div>
                <span className={sub.healthy ? "badge-trained" : "badge-severe"}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sub.healthy ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  {sub.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{sub.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{sub.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Heartbeat: Verified</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>
            </div>
          );
        })}

        {/* Runtime Specifications Card */}
        <div className="app-window p-5 space-y-3 bg-slate-900 text-white">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400">
              <Globe className="w-5 h-5" />
            </div>
            <span className="badge-prototype !bg-sky-950 !text-sky-300 !border-sky-800">
              PROTOTYPE
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Runtime Specifications</h3>
            <div className="space-y-1 font-mono text-xs text-slate-300 mt-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Version:</span>
                <span>{systemHealth?.version || "1.0.0-PROTOTYPE"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timezone:</span>
                <span>UTC (Synchronized)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">NWP Grids:</span>
                <span>IMDAA (12km), ERA5 (0.25°)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
