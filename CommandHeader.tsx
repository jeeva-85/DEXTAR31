import React from 'react';
import { Compass, RefreshCw, Layers } from 'lucide-react';

interface CommandHeaderProps {
  title?: string;
  eventName?: string;
  dataSource?: string;
  forecastHorizon?: string;
  modelName?: string;
  status?: string;
  isTrained?: boolean;
  onRefresh?: () => void;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  title = "EXTREME WEATHER INTELLIGENCE",
  eventName = "CYC-BOB-MR-01 (Bay of Bengal)",
  dataSource = "NEPS-G (11 Ens) • IMDAA • ERA5",
  forecastHorizon = "DAY 3 → DAY 10",
  modelName = "SPATIO-TEMPORAL AI ENGINE",
  status = "TRACKING ACTIVE",
  isTrained = true,
  onRefresh
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Command Center Title & Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-extrabold tracking-wider text-slate-900 text-xs font-mono uppercase">
              {title}
            </span>
          </div>

          <span className={isTrained ? "badge-trained" : "badge-prototype"}>
            <span className={`w-1.5 h-1.5 rounded-full ${isTrained ? 'bg-emerald-600' : 'bg-blue-600'}`}></span>
            {isTrained ? "TRAINED INFERENCE ACTIVE" : "PROTOTYPE BASELINE"}
          </span>

          <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200">
            <Compass className="w-3 h-3 text-sky-600" />
            {status}
          </span>
        </div>

        {/* Center / Right: Meteorological Metadata tags */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <div className="bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            <span className="text-slate-400">EVENT: </span>
            <span className="text-slate-800 font-semibold">{eventName}</span>
          </div>

          <div className="bg-slate-50 px-2.5 py-1 rounded border border-slate-200 hidden sm:block">
            <span className="text-slate-400">SOURCE: </span>
            <span className="text-sky-700 font-semibold">{dataSource}</span>
          </div>

          <div className="bg-sky-50 text-sky-800 px-2.5 py-1 rounded border border-sky-200 font-semibold">
            <span>HORIZON: </span>
            <span>{forecastHorizon}</span>
          </div>

          <div className="bg-slate-50 px-2.5 py-1 rounded border border-slate-200 hidden xl:block">
            <span className="text-slate-400">MODEL: </span>
            <span className="text-slate-800 font-semibold">{modelName}</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
