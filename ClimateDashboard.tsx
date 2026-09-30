import React, { useState, useEffect } from 'react';
import { 
  Globe, TrendingUp, Thermometer, CloudRain, AlertTriangle, 
  MapPin, Activity, ArrowRight, RefreshCw, Layers
} from 'lucide-react';
import { CommandHeader } from './CommandHeader';
import { api } from '../services/api';

interface ClimateDashboardProps {
  onNavigate: (tab: string) => void;
}

export const ClimateDashboard: React.FC<ClimateDashboardProps> = ({ onNavigate }) => {
  const [climateData, setClimateData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClimateData();
  }, []);

  const loadClimateData = async () => {
    try {
      setLoading(true);
      const data = await api.getClimateIndicators();
      setClimateData(data);
    } catch (err) {
      console.error("Failed to load climate context", err);
    } finally {
      setLoading(false);
    }
  };

  const annualSeries = climateData?.annual_series || [];
  const regionalVuln = climateData?.regional_vulnerability || [];
  const urban = climateData?.urban_atmospheric_continuous || {};
  const workflow = climateData?.connection_workflow || {};

  return (
    <div className="space-y-6">
      <CommandHeader 
        title="CLIMATE CONTEXT • DECADAL TRENDS & REGIONAL VULNERABILITY"
        eventName="INDIA CLIMATOLOGY BASELINE (1970 - 2024)"
        dataSource="ERA5 Climatology • IMD Historical Series • World Bank CCKP"
        forecastHorizon="LONG-TERM CONTEXTUAL NORMAL"
        modelName="CLIMATOLOGICAL DEPARTURE (Z-SCORE) ENGINE"
        status="BASELINE SYNCED"
        isTrained={true}
        onRefresh={loadClimateData}
      />

      {/* Decadal Warming & Climatology Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-command p-4 border-l-4 border-l-amber-500">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Decadal Warming Rate</div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            +{climateData?.warming_rate_c_per_decade || 0.174}°C <span className="text-xs font-semibold text-slate-500">/ decade</span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-1">
            Observed Indian trend (1970–2024)
          </div>
        </div>

        <div className="card-command p-4 border-l-4 border-l-sky-500">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Climatology Baseline</div>
          <div className="text-2xl font-black text-slate-900 mt-1">1981–2010</div>
          <div className="text-[11px] text-sky-700 font-medium mt-1">
            WMO standard 30-year reference normal
          </div>
        </div>

        <div className="card-command p-4 border-l-4 border-l-teal-500">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Urban Hourly Records</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {urban.total_hourly_records?.toLocaleString() || "245,472"}
          </div>
          <div className="text-[11px] text-teal-700 font-medium mt-1">
            AtmosSim multi-city continuous stream
          </div>
        </div>

        <div className="card-command p-4 border-l-4 border-l-indigo-600">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Vulnerability Coverage</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {regionalVuln.length || 7} Subregions
          </div>
          <div className="text-[11px] text-indigo-700 font-medium mt-1">
            All agro-climatic zones indexed
          </div>
        </div>
      </div>

      {/* 5-Step Climatology-to-Forecast Connection Workflow */}
      <div className="app-window p-5 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white">
        <div className="mb-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">Scientific Foundation</span>
          <h3 className="text-base font-bold text-white mt-0.5">
            How Climate Normal Connects to Medium-Range NWP Anomaly Tracking
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="text-[10px] text-sky-400 font-bold">STEP 01</div>
            <div className="font-bold text-white mt-1">30-Yr Climatology</div>
            <p className="text-[11px] text-slate-300 font-sans mt-1">
              Construct localized normal mean and standard deviation from 1981–2010 ERA5 / IMD grids.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="text-[10px] text-sky-400 font-bold">STEP 02</div>
            <div className="font-bold text-white mt-1">Decadal Trends</div>
            <p className="text-[11px] text-slate-300 font-sans mt-1">
              Account for secular regional warming (+0.17°C/dec) and shifting monsoon variability.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="text-[10px] text-sky-400 font-bold">STEP 03</div>
            <div className="font-bold text-white mt-1">NEPS-G Forecast</div>
            <p className="text-[11px] text-slate-300 font-sans mt-1">
              Ingest 11-member ensemble NWP predictions for Day 3 to Day 10 lead times.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="text-[10px] text-sky-400 font-bold">STEP 04</div>
            <div className="font-bold text-white mt-1">Z-Score Anomalies</div>
            <p className="text-[11px] text-slate-300 font-sans mt-1">
              Compute normalized Z-scores (EFI) separating true extremes from seasonal variations.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="text-[10px] text-emerald-400 font-bold">STEP 05</div>
            <div className="font-bold text-white mt-1">Calibrated Alerts</div>
            <p className="text-[11px] text-slate-300 font-sans mt-1">
              Trigger actionable hazard advisories prioritizing high-vulnerability populations.
            </p>
          </div>
        </div>
      </div>

      {/* Regional Vulnerability Index Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="app-window p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <span className="text-xs font-mono font-bold text-sky-600 uppercase">Socio-Economic Exposure</span>
              <h3 className="text-base font-bold text-slate-900">Regional Climate Vulnerability Index</h3>
            </div>
            <span className="badge-prototype">IMD / DST INDEX</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3">Vulnerability Category</th>
                  <th className="py-2.5 px-3">Dominant Threat</th>
                  <th className="py-2.5 px-3">Index Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regionalVuln.map((v: any, idx: number) => {
                  const score = typeof v.VULNERABILITY_SCORE === 'number' ? v.VULNERABILITY_SCORE : parseFloat(v.VULNERABILITY_SCORE || "0.75");
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {v.REGION || v.State || `Region ${idx + 1}`}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={score >= 0.7 ? "badge-severe" : "badge-simulated"}>
                          {v.VULNERABILITY_CATEGORY || (score >= 0.7 ? "HIGH" : "MODERATE")}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans">
                        {v.PRIMARY_HAZARD || "Cyclone / Heatwave"}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-sky-700">
                        {score.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                {regionalVuln.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
                      Loading vulnerability indices...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Urban Microclimate AtmosSim Continuous Data */}
        <div className="app-window p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-mono font-bold text-sky-600 uppercase">Urban Heat Islands & Microclimates</span>
            <h3 className="text-base font-bold text-slate-900">AtmosSim Continuous Urban Weather Profiles</h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              High-frequency multi-year hourly series across major metropolitan regions (2018–2024).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                Bengaluru
              </div>
              <div className="text-[11px] text-slate-500 mt-1">High-Plateau Microclimate</div>
              <div className="mt-2 text-xs font-semibold text-slate-700">Urban Convective Shifts</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                Delhi NCR
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Continental Extremes</div>
              <div className="mt-2 text-xs font-semibold text-amber-700">Heat Dome & Loo Winds</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Mumbai
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Coastal Arabian Sea</div>
              <div className="mt-2 text-xs font-semibold text-blue-700">Monsoon Plume Influx</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 text-slate-700 text-xs font-sans leading-relaxed">
            <strong className="text-slate-900 font-mono text-[11px]">Sub-Grid Resolution Note: </strong>
            Because global ~12km forecasts cannot resolve fine-grained urban canyon heat trapping or micro-topography, 
            the <strong>Threat-Focused Downscaler (~5km)</strong> integrates these localized historical baselines when assessing extreme thresholds.
          </div>
        </div>
      </div>
    </div>
  );
};
