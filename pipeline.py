"""
Data Preprocessing Pipeline - SIH26078
Standardizes units, aligns spatial/temporal coordinate frames, handles missing values,
and prepares normalized tabular frames for feature engineering.
"""

import os
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

def normalize_units(df: pd.DataFrame) -> pd.DataFrame:
    """Normalizes all atmospheric variables to standard meteorological units:
    - Temperature: Celsius (Celsius = Kelvin - 273.15 if > 150)
    - Precipitation: mm (mm = meters * 1000 if values in meters)
    - Pressure: hPa (hPa = Pa / 100 if > 2000)
    - Wind: m/s (converts knots and km/h if present)
    """
    df = df.copy()

    # Temperature
    for col in df.columns:
        c_lower = col.lower()
        if "temp" in c_lower or "t2m" in c_lower or "tas" in c_lower:
            if pd.api.types.is_numeric_dtype(df[col]):
                # If Kelvin values (~300K)
                if df[col].median() > 180.0:
                    df["temperature_c"] = df[col] - 273.15
                else:
                    df["temperature_c"] = df[col]
                break

    # Rainfall / Precipitation
    for col in df.columns:
        c_lower = col.lower()
        if any(k in c_lower for k in ["precip", "rain", "tp"]):
            if pd.api.types.is_numeric_dtype(df[col]):
                # If in meters (e.g., ERA5 tp < 0.2 m)
                if df[col].max() < 1.0 and df[col].max() > 0.0:
                    df["precipitation_mm"] = df[col] * 1000.0
                else:
                    df["precipitation_mm"] = df[col]
                break

    # Pressure
    for col in df.columns:
        c_lower = col.lower()
        if "pressure" in c_lower or "mslp" in c_lower or "sp" == c_lower:
            if pd.api.types.is_numeric_dtype(df[col]):
                # If in Pascals (~101300 Pa)
                if df[col].median() > 20000.0:
                    df["mslp_hpa"] = df[col] / 100.0
                else:
                    df["mslp_hpa"] = df[col]
                break

    # Wind speed
    wind_found = False
    for col in df.columns:
        c_lower = col.lower()
        if "wind_speed" in c_lower or "wspd" in c_lower:
            if pd.api.types.is_numeric_dtype(df[col]):
                if "knots" in c_lower:
                    df["wind_speed_ms"] = df[col] * 0.514444
                elif "kmh" in c_lower:
                    df["wind_speed_ms"] = df[col] / 3.6
                else:
                    df["wind_speed_ms"] = df[col]
                wind_found = True
                break

    # If wind speed not explicit, derive from u10 & v10
    if not wind_found and "u10_ms" in df.columns and "v10_ms" in df.columns:
        df["wind_speed_ms"] = np.sqrt(df["u10_ms"]**2 + df["v10_ms"]**2)
    elif not wind_found and "u10" in df.columns and "v10" in df.columns:
        df["wind_speed_ms"] = np.sqrt(df["u10"]**2 + df["v10"]**2)

    # Relative humidity
    for col in df.columns:
        c_lower = col.lower()
        if "rh" in c_lower or "humidity" in c_lower or "hurs" in c_lower:
            if pd.api.types.is_numeric_dtype(df[col]):
                df["relative_humidity"] = np.clip(df[col], 0.0, 100.0)
                break

    return df

def clean_missing_and_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """Handles missing values and drops exact duplicates cleanly."""
    df = df.drop_duplicates()
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    # Forward fill then fill remaining with column median
    df[numeric_cols] = df[numeric_cols].ffill().bfill()
    for col in numeric_cols:
        if df[col].isna().any():
            df[col] = df[col].fillna(df[col].median())
    return df
