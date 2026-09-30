"""
Climatological Baseline Engine - SIH26078
Provides baseline reference statistics (ERA5 / IMDAA) for anomaly quantification.
Calculates standardized anomalies (Z-scores), percentile departures, and EFI proxies.
"""

import os
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

class ClimatologyEngine:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.imdaa_baseline = None
        self._load_baseline()

    def _load_baseline(self):
        imdaa_path = os.path.join(self.data_dir, "reanalysis", "imdaa_reanalysis_baseline.parquet")
        if os.path.exists(imdaa_path):
            self.imdaa_baseline = pd.read_parquet(imdaa_path)
            print(f"[CLIMATOLOGY] Loaded IMDAA baseline ({len(self.imdaa_baseline)} grid points)")

    def get_expected_conditions(self, lat: float, lon: float, month: int = 5) -> Dict[str, float]:
        """Looks up or interpolates climatological normal for given coordinate & month."""
        if self.imdaa_baseline is not None and len(self.imdaa_baseline) > 0:
            # Spatial distance to nearest grid point
            dists = np.sqrt((self.imdaa_baseline["latitude"] - lat)**2 + (self.imdaa_baseline["longitude"] - lon)**2)
            nearest_idx = dists.idxmin()
            row = self.imdaa_baseline.iloc[nearest_idx]
            
            mean_t_c = float(row.get("mean_temperature_k", 303.15)) - 273.15
            std_t = float(row.get("std_temperature_k", 2.2))
            mean_rain = float(row.get("mean_rainfall_mm", 8.5))
            p90_rain = float(row.get("p90_rainfall_mm", 24.0))
            p99_rain = float(row.get("p99_rainfall_mm", 65.0))
            
            return {
                "mean_temp_c": mean_t_c,
                "std_temp_c": std_t,
                "mean_rain_mm": mean_rain,
                "p90_rain_mm": p90_rain,
                "p99_rain_mm": p99_rain,
                "baseline_mslp_hpa": 1010.0,
                "source": "IMDAA-Regional-Reanalysis"
            }
        else:
            # Theoretical tropical/subtropical atmospheric baseline
            is_north = lat > 23.0
            mean_t_c = 34.0 if is_north and month in [5, 6] else 29.0
            return {
                "mean_temp_c": mean_t_c,
                "std_temp_c": 2.5,
                "mean_rain_mm": 10.0,
                "p90_rain_mm": 28.0,
                "p99_rain_mm": 70.0,
                "baseline_mslp_hpa": 1010.0,
                "source": "Standard-Atmospheric-Reference"
            }

    def compute_anomalies(self, temp_c: float, rain_mm: float, mslp_hpa: float, wind_ms: float,
                          lat: float, lon: float, month: int = 5) -> Dict[str, float]:
        """Computes standardized meteorological anomalies and severity departures."""
        clim = self.get_expected_conditions(lat, lon, month)
        
        temp_anomaly = temp_c - clim["mean_temp_c"]
        std_temp_anomaly = temp_anomaly / max(0.5, clim["std_temp_c"])
        
        rain_anomaly = max(0.0, rain_mm - clim["mean_rain_mm"])
        rain_ratio = rain_mm / max(1.0, clim["mean_rain_mm"])
        
        pressure_drop = max(0.0, clim["baseline_mslp_hpa"] - mslp_hpa)
        wind_anomaly = max(0.0, wind_ms - 10.0) # normal breeze ~10m/s

        # Extreme Forecast Index (EFI) proxy: normalized integrated departure [-1, 1]
        efi_proxy = np.tanh(
            0.35 * std_temp_anomaly + 
            0.45 * (rain_anomaly / max(5.0, clim["p90_rain_mm"])) +
            0.30 * (pressure_drop / 12.0) +
            0.30 * (wind_anomaly / 15.0)
        )

        return {
            "clim_mean_temp_c": round(clim["mean_temp_c"], 2),
            "clim_mean_rain_mm": round(clim["mean_rain_mm"], 2),
            "temp_anomaly_c": round(temp_anomaly, 2),
            "std_temp_anomaly": round(std_temp_anomaly, 2),
            "rain_anomaly_mm": round(rain_anomaly, 2),
            "rain_ratio_to_clim": round(rain_ratio, 2),
            "mslp_drop_hpa": round(pressure_drop, 2),
            "wind_anomaly_ms": round(wind_anomaly, 2),
            "extreme_forecast_index": round(float(efi_proxy), 3)
        }
