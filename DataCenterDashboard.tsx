import React, { useState } from 'react';
import { 
  Database, RefreshCw, CheckCircle2, AlertTriangle, Layers, 
  FileText, Cpu, Filter, Download, ArrowRight, ShieldCheck
} from 'lucide-react';
import { CommandHeader } from './CommandHeader';
import { api } from '../services/api';

interface DataCenterDashboardProps {
  dataStatus: any;
  onRefresh: () => void;
  onNavigate: (tab: string) => void;
}

export const DataCenterDashboard: React.FC<DataCenterDashboardProps> = ({
  dataStatus,
  onRefresh,
  onNavigate
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [scanning, setScanning] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [preprocessing, setPreprocessing] = useState<boolean>(false);
  const [buildingFeatures, setBuildingFeatures] = useState<boolean>(false);
  const [operationLog, setOperationLog] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<any>(null);

  const addLog = (msg: string) => {
    setOperationLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const handleScan = async () => {
    try {
      setScanning(true);
      addLog("Initiating deep filesystem discovery scan...");
      const res = await api.triggerDataScan();
      addLog(`Discovery scan completed: ${res.total_datasets} datasets synchronized.`);
      onRefresh();
    } catch (err: any) {
      addLog(`Scan error: ${err.message}`);
    } finally {
      setScanning(false);
    }
  };

  const handleValidate = async () => {
    try {
      setValidating(true);
      addLog("Validating meteorological physical boundaries and null limits...");
      const res = await api.validateData();
      addLog(`Validation complete: ${res.passed_count} PASS, ${res.warning_count} WARNING.`);
    } catch (err: any) {
      addLog(`Validation error: ${err.message}`);
    } finally {
      setValidating(false);
    }
  };

  const handlePreprocess = async () => {
    try {
      setPreprocessing(true);
      addLog("Executing unit normalization (K->C, Pa->hPa, m->mm) & cleaning...");
      const res = await api.preprocessData();
      addLog(`Preprocessing complete: ${res.processed_datasets.length} files normalized.`);
    } catch (err: any) {
      addLog(`Preprocessing error: ${err.message}`);
    } finally {
      setPreprocessing(false);
    }
  };

  const handleBuildDataset = async () => {
    try {
      setBuildingFeatures(true);
      addLog("Computing climatological anomalies (Z-scores) & building training dataset...");
      const res = await api.generateFeatures();
      addLog(`Dataset ready: ${res.total_samples} samples (${res.train_samples} train / ${res.validation_samples} val / ${res.test_samples} test).`);
    } catch (err: any) {
      addLog(`Feature build error: ${err.message}`);
    } finally {
      setBuildingFeatures(false);
    }
  };

  const datasets = dataStatus?.datasets || [];
  const filteredDatasets = activeCategory === "ALL" 
    ? datasets 
    : datasets.filter((d: any) => d.category === activeCategory);

  const featureMetadata = dataStatus?.feature_metadata || {};

  return (
    <div className="space-y-6">
      <CommandHeader 
        title="02 • METEOROLOGICAL DATA CENTER & REPOSITORY"
        eventName="Repository Schema Detection & Ingestion"
        dataSource="Multi-Format (NC, Parquet, CSV, JSON)"
        forecastHorizon="Medium-Range + Historical Baseline"
        modelName="Schema Discovery Scanner"
        status="REPOSITORY SYNCHRONIZED"
        isTrained={true}
        onRefresh={onRefresh}
      />

      {/* Control Action Toolbar */}
      <div className="card-command p-4 flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Data Engineering Pipeline Actions</h2>
          <p className="text-xs text-slate-500">Autonomous discovery, physics verification, and training dataset construction</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleScan}
            disabled={scanning}
            className="btn-secondary text-xs !py-1.5 !px-3"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? "Scanning..." : "SCAN DATA"}
          </button>

          <button 
            onClick={handleValidate}
            disabled={validating}
            className="btn-secondary text-xs !py-1.5 !px-3"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 text-emerald-600 ${validating ? 'animate-spin' : ''}`} />
            {validating ? "Validating..." : "VALIDATE"}
          </button>

          <button 
            onClick={handlePreprocess}
            disabled={preprocessing}
            className="btn-secondary text-xs !py-1.5 !px-3"
          >
            <Filter className={`w-3.5 h-3.5 text-cyan-600 ${preprocessing ? 'animate-spin' : ''}`} />
            {preprocessing ? "Processing..." : "PREPROCESS"}
          </button>

          <button 
            onClick={handleBuildDataset}
            disabled={buildingFeatures}
            className="btn-primary text-xs !py-1.5 !px-3.5 font-bold"
          >
            <Cpu className={`w-3.5 h-3.5 ${buildingFeatures ? 'animate-spin' : ''}`} />
            {buildingFeatures ? "Building..." : "BUILD TRAINING DATASET"}
          </button>
        </div>
      </div>

      {/* Operation Log Bar if actions taken */}
      {operationLog.length > 0 && (
        <div className="bg-slate-900 text-slate-300 font-mono text-[11px] p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="text-sky-400 font-bold mb-1">DATA PIPELINE EXECUTION TELEMETRY:</div>
          {operationLog.map((log, idx) => (
            <div key={idx} className="text-slate-200">• {log}</div>
          ))}
        </div>
      )}

      {/* Dataset Filter Tabs & Metrics Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          {["ALL", "CLIMATOLOGICAL_REANALYSIS", "NWP_FORECAST", "HISTORICAL_EXTREME_EVENT", "CLIMATE_CHANGE_CONTEXT"].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-sky-50 border-sky-300 text-sky-800 font-bold"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-500">
          Showing <span className="font-bold text-slate-900">{filteredDatasets.length}</span> of {datasets.length} files
        </div>
      </div>

      {/* Main Dataset Inventory Table */}
      <div className="app-window">
        <div className="app-window-header">
          <span className="window-title">DISCOVERED DATASET CATALOG & INSPECTION DETAILS</span>
          <span className="badge-trained">SCHEMA DETECTED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100/80 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">DATASET / FILENAME</th>
                <th className="py-2.5 px-3">FORMAT</th>
                <th className="py-2.5 px-3">CATEGORY</th>
                <th className="py-2.5 px-3">SIZE</th>
                <th className="py-2.5 px-3">ROWS / DIMS</th>
                <th className="py-2.5 px-3">SPATIAL COVERAGE</th>
                <th className="py-2.5 px-3">TIME COVERAGE</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDatasets.map((ds: any, idx: number) => {
                const sp = ds.spatial_coverage || {};
                const tp = ds.temporal_coverage || {};
                const isSelected = selectedDataset?.filename === ds.filename;

                return (
                  <tr 
                    key={idx} 
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-sky-50/70 border-l-4 border-l-sky-500' : ''
                    }`}
                    onClick={() => setSelectedDataset(ds)}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5 font-mono">
                        <FileText className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        {ds.filename}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 text-[10px]">
                        {ds.format}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600 font-sans">
                      {ds.category?.replace(/_/g, " ")}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{ds.file_size_formatted}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-bold">
                      {ds.rows ? ds.rows.toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      {sp.lat_min ? `${sp.lat_min}°N - ${sp.lat_max}°N` : sp.cities ? 'Multi-Urban Network' : 'Global / Regional'}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      {tp.start_time ? `${tp.start_time.slice(0, 10)} to ${tp.end_time?.slice(0, 10)}` : 'Continuous / Lead'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={ds.quality_status === "VALID" || ds.quality_status?.includes("VALID") ? "badge-trained" : "badge-simulated"}>
                        {ds.quality_status || "SCANNED"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button 
                        onClick={() => setSelectedDataset(ds)} 
                        className="text-sky-600 hover:text-sky-800 font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Dataset Detail Inspection Card */}
      {selectedDataset && (
        <div className="app-window p-4 border-2 border-sky-300">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                SCHEMA INSPECTION: {selectedDataset.filename}
              </h3>
              <p className="text-xs text-slate-500 font-sans">{selectedDataset.notes || "Complete schema analysis and semantic mapping"}</p>
            </div>
            <button 
              onClick={() => setSelectedDataset(null)} 
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            {/* Variables and Data types */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="text-slate-500 font-bold block mb-1.5 uppercase">Columns / Variables ({selectedDataset.columns}):</span>
              <div className="max-h-48 overflow-y-auto space-y-1 text-[11px]">
                {selectedDataset.variables?.map((v: string) => (
                  <div key={v} className="flex justify-between border-b border-slate-100 pb-0.5">
                    <span className="text-slate-800 font-medium">{v}</span>
                    <span className="text-slate-400">{selectedDataset.data_types?.[v] || 'numeric'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Semantic Meteorological Mappings */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="text-slate-500 font-bold block mb-1.5 uppercase">Semantic Weather Mapping:</span>
              <div className="max-h-48 overflow-y-auto space-y-1 text-[11px]">
                {Object.entries(selectedDataset.semantic_mappings || {}).map(([canon, match]: [string, any]) => (
                  <div key={canon} className="flex justify-between border-b border-slate-100 pb-0.5">
                    <span className="text-slate-600">{canon}:</span>
                    {typeof match === 'object' && match.available ? (
                      <span className="text-emerald-700 font-bold">{match.source_column}</span>
                    ) : (
                      <span className="text-slate-400 italic">NOT AVAILABLE</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Potential Targets & Data Quality */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
              <span className="text-slate-500 font-bold block uppercase">Potential Target Variables:</span>
              <div className="space-y-1 text-[11px]">
                {selectedDataset.possible_target_variables?.map((t: string) => (
                  <div key={t} className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    🎯 {t}
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                <div>Missing Values: <span className="font-bold text-slate-800">{selectedDataset.missing_values || 0}</span></div>
                <div>Duplicate Rows: <span className="font-bold text-slate-800">{selectedDataset.duplicate_records || 0}</span></div>
                <div>Ensemble: <span className="font-bold text-slate-800">{selectedDataset.has_ensemble ? 'Yes (NEPS-G Members)' : 'Deterministic / Single'}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Feature Metadata Section (Requirement Section 3) */}
      <div className="card-command p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              GLOBAL FEATURE METADATA (feature_metadata.json)
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Autonomous semantic cross-referencing across all 14 ingested datasets. Does not depend on hardcoded column names.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('training')} 
            className="btn-primary text-xs !py-1 !px-2.5 font-bold"
          >
            Go to Model Training Center <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 text-xs font-mono">
          {Object.entries(featureMetadata).map(([feat, info]: [string, any]) => {
            const isAvailable = typeof info === 'object' && info.available;
            return (
              <div 
                key={feat} 
                className={`p-2.5 rounded-lg border ${
                  isAvailable 
                    ? 'bg-sky-50/50 border-sky-200 text-slate-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="font-bold text-[11px] truncate uppercase mb-1">{feat}</div>
                {isAvailable ? (
                  <div className="text-[10px] text-sky-700">
                    <span className="font-bold text-emerald-700">● AVAILABLE</span>
                    <div className="truncate text-slate-500">{info.providers_count} sources ({info.standard_unit})</div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 italic">NOT AVAILABLE</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
