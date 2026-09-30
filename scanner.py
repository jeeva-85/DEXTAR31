"""
Data Scanner Module - SIH26078
Automatically inspects raw weather, NWP, reanalysis, extreme event, and climate datasets.
Detects schemas, variable types, coordinate systems, resolutions, missing values,
and performs semantic mapping of meteorological variables.
Outputs rich file metadata and feature_metadata.json.
"""

import os
import json
import numpy as np
import pandas as pd
import xarray as xr
from datetime import datetime
from typing import Dict, Any, List, Optional

# Semantic variable dictionary for automatic discovery
SEMANTIC_DICTIONARY = {
    "temperature": [
        "t2m", "temperature", "temp", "air_temperature", "t", "tmax", "tmin", 
        "t2m_celsius", "temperature_c", "temperature_k", "mean_temperature_k",
        "wb_cckp_tas", "wb_cckp_tasmax", "wb_cckp_tasmin"
    ],
    "rainfall": [
        "tp", "total_precipitation", "precipitation", "precip", "rain", "rainfall",
        "daily_rainfall_mm", "rainfall_accum_mm", "precipitation_mm", "mean_rainfall_mm",
        "wb_cckp_pr", "wb_cckp_rx1day", "wb_cckp_rx5day", "wb_cckp_r20mm", "wb_cckp_r50mm"
    ],
    "pressure": [
        "mslp", "pressure", "surface_pressure", "sp", "pres", "pressure_hpa", 
        "mslp_hpa", "mean_sea_level_pressure"
    ],
    "wind_u": ["u10", "u_wind", "wind_u", "u10_ms", "u_component_of_wind"],
    "wind_v": ["v10", "v_wind", "wind_v", "v10_ms", "v_component_of_wind"],
    "wind_speed": [
        "wind_speed", "wspd", "wind_speed_ms", "wind_speed_kmh", "wind_speed_knots",
        "wind_gust_kmh"
    ],
    "humidity": [
        "rh", "relative_humidity", "humidity", "r", "rh_percent", "wb_cckp_hurs",
        "relative_humidity_1430"
    ],
    "latitude": ["lat", "latitude", "y", "latitudes"],
    "longitude": ["lon", "long", "longitude", "x", "longitudes"],
    "time": ["time", "date", "datetime", "valid_time", "valid_date", "init_time", "year"],
    "forecast_lead": ["lead", "step", "forecast_lead", "forecast_lead_day", "forecast_lead_hours", "lead_time"],
    "ensemble_member": ["member", "number", "ensemble_member", "ens", "ens_member"],
    "climate_indices": [
        "wb_cckp_cdd", "wb_cckp_cdd65", "wb_cckp_csdi", "wb_cckp_cwd", "wb_cckp_fd",
        "wb_cckp_hd30", "wb_cckp_hd35", "wb_cckp_hd40", "wb_cckp_hd42", "wb_cckp_hd45",
        "wb_cckp_hd50", "wb_cckp_hdd65", "wb_cckp_hi35", "wb_cckp_hi37", "wb_cckp_hi39",
        "wb_cckp_hi41", "wb_cckp_id", "wb_cckp_r95ptot", "wb_cckp_sd", "wb_cckp_tnn",
        "wb_cckp_tr", "wb_cckp_tr23", "wb_cckp_tr26", "wb_cckp_tr29", "wb_cckp_tr32",
        "wb_cckp_tx84rr", "wb_cckp_txx", "wb_cckp_wsdi", "mean_temp_anomaly_c",
        "monsoon_rain_pct_departure", "vulnerability_score"
    ],
    "atmospheric_regime": [
        "regime_distribution", "climate_zone", "severity_category", "intensity",
        "stage", "rainfall_intensity", "hazard_class"
    ]
}

UNIT_MAPPING = {
    "temperature": "Kelvin / Celsius",
    "rainfall": "mm / m (normalized to mm)",
    "pressure": "hPa / Pa (normalized to hPa)",
    "wind_u": "m/s",
    "wind_v": "m/s",
    "wind_speed": "m/s (or km/h converted)",
    "humidity": "%",
    "latitude": "degrees_north",
    "longitude": "degrees_east",
    "forecast_lead": "days / hours",
    "ensemble_member": "integer ID"
}

class DatasetScanner:
    def __init__(self, data_root: str):
        self.data_root = data_root
        self.scanned_datasets: List[Dict[str, Any]] = []
        self.feature_metadata: Dict[str, Any] = {}

    def scan_all(self) -> Dict[str, Any]:
        """Scans all files under data_root and returns comprehensive catalog."""
        self.scanned_datasets = []
        if not os.path.exists(self.data_root):
            return {"status": "error", "message": f"Path not found: {self.data_root}"}

        for root, dirs, files in os.walk(self.data_root):
            for file in files:
                filepath = os.path.join(root, file)
                ext = os.path.splitext(file)[1].lower()
                if ext in [".nc", ".parquet", ".csv", ".json", ".grib", ".grib2", ".zip"]:
                    info = self.inspect_file(filepath)
                    if info:
                        self.scanned_datasets.append(info)

        self._build_feature_metadata()
        return {
            "status": "success",
            "scan_timestamp": datetime.utcnow().isoformat(),
            "total_datasets_found": len(self.scanned_datasets),
            "datasets": self.scanned_datasets,
            "feature_metadata": self.feature_metadata
        }

    def inspect_file(self, filepath: str) -> Optional[Dict[str, Any]]:
        """Deep inspection of a single data file."""
        filename = os.path.basename(filepath)
        filesize = os.path.getsize(filepath)
        ext = os.path.splitext(filename)[1].lower()
        rel_path = os.path.relpath(filepath, self.data_root)

        meta = {
            "filename": filename,
            "relative_path": rel_path.replace("\\", "/"),
            "absolute_path": os.path.abspath(filepath),
            "format": ext.replace(".", "").upper(),
            "file_size_bytes": filesize,
            "file_size_formatted": f"{filesize / 1024:.1f} KB" if filesize < 1024*1024 else f"{filesize / (1024*1024):.2f} MB",
            "category": self._classify_category(filepath),
            "rows": 0,
            "columns": 0,
            "dimensions": {},
            "variables": [],
            "data_types": {},
            "missing_values": 0,
            "duplicate_records": 0,
            "semantic_mappings": {},
            "spatial_coverage": {"has_spatial": False},
            "temporal_coverage": {"has_temporal": False},
            "has_ensemble": False,
            "has_lead_time": False,
            "possible_target_variables": [],
            "possible_labels": [],
            "quality_status": "VALID",
            "notes": ""
        }

        try:
            if ext == ".nc":
                self._inspect_netcdf(filepath, meta)
            elif ext == ".parquet":
                self._inspect_parquet(filepath, meta)
            elif ext == ".csv":
                self._inspect_csv(filepath, meta)
            elif ext == ".json":
                self._inspect_json(filepath, meta)
            elif ext in [".grib", ".grib2"]:
                meta["quality_status"] = "GRIB_CONTAINER"
                meta["notes"] = "GRIB file identified. Standard NWP grid format."
            elif ext == ".zip":
                meta["quality_status"] = "ARCHIVE"
                meta["notes"] = "Compressed archive. Extraction required."
        except Exception as e:
            meta["quality_status"] = "CORRUPTED / ERROR"
            meta["notes"] = str(e)

        # Match semantic variables
        self._detect_semantics(meta)
        return meta

    def _classify_category(self, filepath: str) -> str:
        lower = filepath.lower()
        if "reanalysis" in lower or "era5" in lower or "imdaa" in lower:
            return "CLIMATOLOGICAL_REANALYSIS"
        elif "forecast" in lower or "neps" in lower or "ncum" in lower:
            return "NWP_FORECAST"
        elif "event" in lower or "cyclone" in lower or "heatwave" in lower or "monsoon" in lower:
            return "HISTORICAL_EXTREME_EVENT"
        elif "climate" in lower or "trend" in lower or "vulnerability" in lower or "atmossim" in lower or "cckp" in lower:
            return "CLIMATE_CHANGE_CONTEXT"
        return "GENERAL_METEOROLOGICAL"

    def _inspect_netcdf(self, filepath: str, meta: Dict[str, Any]):
        ds = xr.open_dataset(filepath, engine="h5netcdf")
        meta["dimensions"] = {k: int(v) for k, v in ds.sizes.items()}
        meta["variables"] = list(ds.data_vars.keys()) + list(ds.coords.keys())
        total_cells = 1
        for dim_size in ds.sizes.values():
            total_cells *= int(dim_size)
        meta["rows"] = total_cells
        meta["columns"] = len(ds.data_vars)

        for var in ds.data_vars:
            meta["data_types"][var] = str(ds[var].dtype)
            
        # Coordinates
        if "latitude" in ds.coords or "lat" in ds.coords:
            lat_coord = "latitude" if "latitude" in ds.coords else "lat"
            lats = ds[lat_coord].values
            meta["spatial_coverage"] = {
                "has_spatial": True,
                "lat_min": float(np.min(lats)),
                "lat_max": float(np.max(lats)),
                "spatial_resolution": f"{abs(lats[1] - lats[0]):.2f} deg" if len(lats) > 1 else "Unknown"
            }
        if "longitude" in ds.coords or "lon" in ds.coords:
            lon_coord = "longitude" if "longitude" in ds.coords else "lon"
            lons = ds[lon_coord].values
            if "spatial_coverage" in meta and meta["spatial_coverage"]["has_spatial"]:
                meta["spatial_coverage"]["lon_min"] = float(np.min(lons))
                meta["spatial_coverage"]["lon_max"] = float(np.max(lons))

        if "time" in ds.coords:
            times = pd.to_datetime(ds["time"].values)
            meta["temporal_coverage"] = {
                "has_temporal": True,
                "start_time": str(times.min()),
                "end_time": str(times.max()),
                "total_timesteps": len(times),
                "temporal_resolution": "Daily" if (times[1] - times[0]).days == 1 else "Sub-daily" if len(times) > 1 else "Single"
            }
        ds.close()

    def _inspect_parquet(self, filepath: str, meta: Dict[str, Any]):
        df = pd.read_parquet(filepath)
        meta["rows"] = int(len(df))
        meta["columns"] = int(len(df.columns))
        meta["variables"] = list(df.columns)
        meta["missing_values"] = int(df.isna().sum().sum())
        meta["duplicate_records"] = int(df.duplicated().sum())

        for col in df.columns:
            meta["data_types"][col] = str(df[col].dtype)

        self._inspect_df_coordinates(df, meta)

    def _inspect_csv(self, filepath: str, meta: Dict[str, Any]):
        df = pd.read_csv(filepath, nrows=5000)
        meta["rows"] = int(len(df))
        meta["columns"] = int(len(df.columns))
        meta["variables"] = list(df.columns)
        meta["missing_values"] = int(df.isna().sum().sum())
        meta["duplicate_records"] = int(df.duplicated().sum())

        for col in df.columns:
            meta["data_types"][col] = str(df[col].dtype)

        self._inspect_df_coordinates(df, meta)

    def _inspect_df_coordinates(self, df: pd.DataFrame, meta: Dict[str, Any]):
        cols_lower = {c.lower(): c for c in df.columns}
        
        # Lat/Lon
        lat_col = next((cols_lower[c] for c in ["latitude", "lat", "latitudes"] if c in cols_lower), None)
        lon_col = next((cols_lower[c] for c in ["longitude", "lon", "longitudes"] if c in cols_lower), None)
        if lat_col and lon_col:
            meta["spatial_coverage"] = {
                "has_spatial": True,
                "lat_min": float(df[lat_col].min()),
                "lat_max": float(df[lat_col].max()),
                "lon_min": float(df[lon_col].min()),
                "lon_max": float(df[lon_col].max()),
                "spatial_resolution": "Grid / Station Points"
            }

        # Time
        time_col = next((cols_lower[c] for c in ["time", "datetime", "date", "valid_time", "valid_date", "year"] if c in cols_lower), None)
        if time_col:
            meta["temporal_coverage"] = {
                "has_temporal": True,
                "time_column": time_col,
                "start_time": str(df[time_col].min()),
                "end_time": str(df[time_col].max()),
                "total_timesteps": int(df[time_col].nunique())
            }

        # Ensemble
        ens_col = next((cols_lower[c] for c in ["ensemble_member", "member", "number"] if c in cols_lower), None)
        if ens_col:
            meta["has_ensemble"] = True
            meta["ensemble_members_count"] = int(df[ens_col].nunique())

        # Forecast Lead
        lead_col = next((cols_lower[c] for c in ["forecast_lead_day", "forecast_lead_hours", "lead", "step"] if c in cols_lower), None)
        if lead_col:
            meta["has_lead_time"] = True
            meta["lead_range"] = f"Min {df[lead_col].min()} to Max {df[lead_col].max()}"

    def _inspect_json(self, filepath: str, meta: Dict[str, Any]):
        with open(filepath, "r") as f:
            data = json.load(f)

        meta["data_types"]["json_type"] = type(data).__name__
        if isinstance(data, dict):
            meta["variables"] = list(data.keys())
            meta["columns"] = len(data.keys())
            
            # Check if this is an AtmosSim city profile or multi-city dataset
            if "dataset_name" in data and "total_hourly_records" in data:
                meta["rows"] = int(data.get("total_hourly_records", 0))
                meta["notes"] = f"AtmosSim continuous simulation ({data.get('city', 'MultiCity')}, {data.get('start_year')}-{data.get('end_year')})"
                meta["quality_status"] = "VALID_CONTINUOUS_SERIES"
                if "city_profiles" in data:
                    meta["spatial_coverage"] = {
                        "has_spatial": True,
                        "cities": list(data["city_profiles"].keys()),
                        "type": "Multi-Urban High-Resolution Network"
                    }
                elif "city" in data and data.get("city") == "Delhi":
                    meta["spatial_coverage"] = {"has_spatial": True, "lat_min": 28.61, "lat_max": 28.61, "lon_min": 77.20, "lon_max": 77.20}
                elif "city" in data and data.get("city") == "Mumbai":
                    meta["spatial_coverage"] = {"has_spatial": True, "lat_min": 19.07, "lat_max": 19.07, "lon_min": 72.87, "lon_max": 72.87}
                elif "city" in data and data.get("city") == "Bengaluru":
                    meta["spatial_coverage"] = {"has_spatial": True, "lat_min": 12.97, "lat_max": 12.97, "lon_min": 77.59, "lon_max": 77.59}
                meta["temporal_coverage"] = {
                    "has_temporal": True,
                    "start_time": f"{data.get('start_year')}-01-01",
                    "end_time": f"{data.get('end_year')}-12-31",
                    "total_timesteps": data.get("total_hourly_records", 0),
                    "temporal_resolution": "Hourly Continuous"
                }
            elif "annual_series" in data and isinstance(data["annual_series"], list):
                meta["rows"] = len(data["annual_series"])
                meta["notes"] = "Annual climate indicator time series"
                if len(data["annual_series"]) > 0:
                    meta["variables"] = list(data["annual_series"][0].keys())
                    years = [r["year"] for r in data["annual_series"] if "year" in r]
                    if years:
                        meta["temporal_coverage"] = {
                            "has_temporal": True,
                            "start_time": str(min(years)),
                            "end_time": str(max(years)),
                            "total_timesteps": len(years),
                            "temporal_resolution": "Annual"
                        }
        elif isinstance(data, list):
            meta["rows"] = len(data)
            if len(data) > 0 and isinstance(data[0], dict):
                meta["columns"] = len(data[0].keys())
                meta["variables"] = list(data[0].keys())

    def _detect_semantics(self, meta: Dict[str, Any]):
        """Maps discovered columns to semantic weather variables without hardcoding."""
        available_vars = [str(v).lower() for v in meta["variables"]]
        detected = {}

        for canonical_name, aliases in SEMANTIC_DICTIONARY.items():
            matched_col = None
            for alias in aliases:
                for v in meta["variables"]:
                    if alias.lower() == str(v).lower() or alias.lower() in str(v).lower():
                        matched_col = str(v)
                        break
                if matched_col:
                    break

            if matched_col:
                detected[canonical_name] = {
                    "source_column": matched_col,
                    "unit": UNIT_MAPPING.get(canonical_name, "standard"),
                    "available": True
                }
            else:
                detected[canonical_name] = "NOT AVAILABLE"

        meta["semantic_mappings"] = detected

        # Determine potential targets and labels
        targets = []
        if detected.get("rainfall") != "NOT AVAILABLE":
            targets.append("extreme_rainfall (>100mm/day)")
        if detected.get("temperature") != "NOT AVAILABLE":
            targets.append("heat_anomaly / heatwave (>42°C)")
        if detected.get("wind_speed") != "NOT AVAILABLE" or (detected.get("wind_u") != "NOT AVAILABLE" and detected.get("wind_v") != "NOT AVAILABLE"):
            targets.append("cyclonic_high_wind (>50 knots)")
        if detected.get("pressure") != "NOT AVAILABLE":
            targets.append("deep_cyclonic_depression (mslp drop)")
        if "wb_cckp_wsdi" in [v.lower() for v in meta["variables"]]:
            targets.append("warm_spell_duration_index")
        if "wb_cckp_r95ptot" in [v.lower() for v in meta["variables"]]:
            targets.append("extreme_precip_95th_percentile")

        meta["possible_target_variables"] = targets

    def _build_feature_metadata(self):
        """Constructs global feature_metadata.json cross-referencing all scanned files."""
        features = {}
        for canonical_name in SEMANTIC_DICTIONARY.keys():
            providers = []
            for ds in self.scanned_datasets:
                mapping = ds.get("semantic_mappings", {}).get(canonical_name)
                if isinstance(mapping, dict) and mapping.get("available"):
                    providers.append({
                        "file": ds["filename"],
                        "category": ds["category"],
                        "source_column": mapping["source_column"],
                        "unit": mapping["unit"]
                    })
            if providers:
                features[canonical_name] = {
                    "available": True,
                    "standard_unit": UNIT_MAPPING.get(canonical_name, "standard"),
                    "providers_count": len(providers),
                    "sources": providers
                }
            else:
                features[canonical_name] = "NOT AVAILABLE"

        self.feature_metadata = features

        # Save feature_metadata.json in data/processed
        processed_dir = os.path.join(os.path.dirname(self.data_root), "processed")
        os.makedirs(processed_dir, exist_ok=True)
        meta_path = os.path.join(processed_dir, "feature_metadata.json")
        with open(meta_path, "w") as f:
            json.dump(self.feature_metadata, f, indent=2)
        print(f"[METADATA] Saved global feature metadata to {meta_path}")

def run_scan(data_root: Optional[str] = None) -> Dict[str, Any]:
    if data_root is None:
        data_root = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "raw")
    scanner = DatasetScanner(data_root)
    result = scanner.scan_all()
    return result

if __name__ == "__main__":
    res = run_scan()
    print(f"\n[SCAN COMPLETE] Discovered {res['total_datasets_found']} datasets.")
    for d in res["datasets"]:
        print(f" -> {d['filename']} ({d['format']}, {d['rows']} rows, {d['category']})")
