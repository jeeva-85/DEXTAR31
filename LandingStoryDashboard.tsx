import React from 'react';
import { 
  Sparkles, CloudRain, ShieldCheck, Compass, Sliders, Activity, 
  Database, Cpu, ArrowRight, CheckCircle2, AlertTriangle, Layers, 
  BarChart3, Globe, Award, Target, Zap
} from 'lucide-react';
import { CommandHeader } from './CommandHeader';

interface LandingStoryDashboardProps {
  onNavigate: (tab: string) => void;
}

export const LandingStoryDashboard: React.FC<LandingStoryDashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 pb-12">
      <CommandHeader 
        title="PLATFORM OVERVIEW & TECHNICAL ARCHITECTURE"
        eventName="SIH26078 • MoES / NCMRWF MISSION BRIEF"
        dataSource="ERA5 (0.25°) • IMDAA (12km) • NEPS-G (11 Ens) • NCUM"
        forecastHorizon="DAY 3 → DAY 10 (72h - 240h)"
        modelName="AI-DRIVEN SPATIO-TEMPORAL ENSEMBLE ENGINE"
        status="OPERATIONAL RESEARCH"
        isTrained={true}
      />

      {/* Hero Showcase Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 border border-slate-800 text-white p-8 md:p-12 shadow-xl">
        <div className="absolute inset-0 bg-scientific-grid opacity-15 pointer-events-none"></div>
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-mono font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            MINISTRY OF EARTH SCIENCES • NCMRWF INNOVATION
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            AI-Driven Spatio-Temporal Tracking of <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Extreme Weather Anomalies</span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl">
            Bridging the predictability gap in medium-range forecasts (Day 3 to Day 10) across India. 
            Harnessing 11-member NEPS-G ensembles, high-resolution IMDAA reanalysis, MetPy thermodynamic physical consistency, 
            and graph-based centroid tracking to deliver actionable disaster-mitigation intelligence.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button 
              onClick={() => onNavigate('overview')}
              className="btn-primary !px-6 !py-3 text-sm flex items-center gap-2 shadow-lg shadow-sky-600/30"
            >
              Launch Operational Overview
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNavigate('tracking')}
              className="btn-secondary !bg-slate-800/80 !text-white !border-slate-700 hover:!bg-slate-700 text-sm flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-sky-400" />
              Spatio-Temporal Tracking
            </button>
            <button 
              onClick={() => onNavigate('downscaling')}
              className="btn-secondary !bg-slate-800/80 !text-white !border-slate-700 hover:!bg-slate-700 text-sm flex items-center gap-2"
            >
              <Sliders className="w-4 h-4 text-teal-400" />
              Threat-Focused Downscaler (~5km)
            </button>
          </div>
        </div>
      </div>

      {/* Six Core Pillars Grid */}
      <div>
        <div className="mb-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-600">Subsystem Architecture</span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Six Operational Subsystems</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div 
            onClick={() => onNavigate('data')}
            className="app-window p-5 cursor-pointer hover:border-sky-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 mb-3 group-hover:scale-105 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-slate-400">01 • DATA CENTER</div>
            <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-sky-600 transition-colors">
              Multi-Source Ingestion & Catalog
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Automated ingestion, validation, and climatological standardization of ERA5 (1970–2024), IMDAA 12km reanalysis, and NEPS-G multi-member forecasts.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-sky-600">
              Explore Data Catalog <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => onNavigate('training')}
            className="app-window p-5 cursor-pointer hover:border-sky-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 mb-3 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-slate-400">02 • MODEL TRAINING</div>
            <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">
              Leakage-Free Time-Aware AI Training
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Ensemble of LightGBM, XGBoost, and Random Forest trained strictly on chronological splits without future information leakage.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-600">
              View Training Pipeline <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => onNavigate('tracking')}
            className="app-window p-5 cursor-pointer hover:border-sky-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 mb-3 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-slate-400">03 • TRACKING ENGINE</div>
            <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-teal-600 transition-colors">
              Spherical Graph Centroid Tracker
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Haversine great-circle distance spatio-temporal tracking across forecast horizons Day 3 to Day 10, estimating propagation velocity and landfall timing.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-teal-600">
              Inspect Trajectories <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => onNavigate('downscaling')}
            className="app-window p-5 cursor-pointer hover:border-sky-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 mb-3 group-hover:scale-105 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-slate-400">04 • DOWNSCALING</div>
            <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors">
              Threat-Focused ~5km Downscaling
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Laplacian spatial sharpening and elevation-aware lapse rate correction targeting high-threat anomalous zones without wasteful uniform grid recomputation.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-600">
              Run Downscaler <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 5 */}
          <div 
            onClick={() => onNavigate('uncertainty')}
            className="app-window p-5 cursor-pointer hover:border-sky-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 mb-3 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-slate-400">05 • UNCERTAINTY</div>
            <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-amber-600 transition-colors">
              11-Member NEPS-G Ensemble Dispersion
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Multi-member parameter spread, spatial error ellipses, and consensus clustering preventing overconfident single-deterministic traps.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-600">
              Analyze Ensemble Spread <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 6 */}
          <div 
            onClick={() => onNavigate('physics')}
            className="app-window p-5 cursor-pointer hover:border-sky-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-slate-400">06 • METPY PHYSICS</div>
            <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-emerald-600 transition-colors">
              Thermodynamic Physical Consistency
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Rigorous sanity enforcement checking Clausius-Clapeyron saturation vapor pressures, hydrostatic equilibrium, and convective stability.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              Run Physics Checks <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Operational Problem Statement & Scientific Reality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="app-window p-6">
          <div className="flex items-center gap-2 text-amber-700 font-mono text-xs font-bold uppercase mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            The Operational Challenge (Day 3 to Day 10)
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-3">
            Why Medium-Range Extreme Forecasting is Hard in India
          </h3>
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
              <span><strong>Ensemble Chaos & Dispersion:</strong> Numerical weather prediction (NWP) model skills degrade rapidly beyond 72 hours due to tropical non-linear convection.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
              <span><strong>Monsoon Depressions & Cyclones:</strong> Rapid intensification in the Bay of Bengal and Arabian Sea often leads to sudden track divergence.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
              <span><strong>Alert Fatigue:</strong> High False Alarm Ratios (FAR) in raw models erode administrative trust during emergency civil defense mobilization.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
              <span><strong>Computational Bottlenecks:</strong> Running full ~5km regional atmospheric models across the entire continent at 10-day lead times is computationally prohibitive.</span>
            </li>
          </ul>
        </div>

        <div className="app-window p-6 bg-gradient-to-br from-white to-sky-50/50">
          <div className="flex items-center gap-2 text-sky-700 font-mono text-xs font-bold uppercase mb-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            SIH26078 Architectural Solutions
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-3">
            How This Platform Solves Each Bottleneck
          </h3>
          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Time-Aware ML Anomaly Detection:</strong> Machine learning trained on standardized climatological Z-scores isolates extreme signals out to Day 10.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Spatial Graph Centroid Tracking:</strong> Graph propagation connects contiguous anomalous blobs across time steps, computing continuous storm vectors.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Measured Meteorological Benchmarks:</strong> Calibrated against standard POD (&gt;0.75), FAR (&lt;0.25), and CSI (&gt;0.65) test splits.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Threat-Focused Adaptive Downscaling:</strong> Downscales ONLY the dynamic bounding boxes where anomalies are identified, saving 92% compute.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Navigation Footer */}
      <div className="app-window p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-white">Ready to inspect active operational intelligence?</h4>
          <p className="text-xs text-slate-400 mt-0.5">Explore active events, model evaluation metrics, and live hazard alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('events')}
            className="btn-secondary !bg-slate-800 !text-white !border-slate-700 hover:!bg-slate-700 text-xs"
          >
            Active Events Catalog
          </button>
          <button 
            onClick={() => onNavigate('analytics')}
            className="btn-primary text-xs"
          >
            Measured Test Analytics
          </button>
        </div>
      </div>
    </div>
  );
};
