"""
Data Validation Module - SIH26078
Performs automated meteorological sanity checks, physical boundary validation,
null value analysis, and data integrity verification.
"""

import os
import pandas as pd
import numpy as np
from typing import Dict, Any, List

PHYSICAL_LIMITS = {
    "temperature_c": {"min": -60.0, "max": 65.0, "unit": "Celsius"},
    "temperature_k": {"min": 213.15, "max": 338.15, "unit": "Kelvin"},
    "rainfall_mm": {"min": 0.0, "max": 1500.0, "unit": "mm/day"},
    "mslp_hpa": {"min": 870.0, "max": 1085.0, "unit": "hPa"},
    "wind_speed_ms": {"min": 0.0, "max": 120.0, "unit": "m/s"},
    "relative_humidity": {"min": 0.0, "max": 100.0, "unit": "%"}
}

def validate_dataframe(df: pd.DataFrame, dataset_name: str) -> Dict[str, Any]:
    """Validates dataframe columns against meteorological physics and integrity rules."""
    total_rows = len(df)
    total_cols = len(df.columns)
    missing_count = int(df.isna().sum().sum())
    dup_count = int(df.duplicated().sum())

    checks: List[Dict[str, Any]] = []
    warnings: List[str] = []
    errors: List[str] = []

    # Null value check
    null_ratio = missing_count / max(1, total_rows * total_cols)
    if null_ratio > 0.3:
        warnings.append(f"High missing value ratio: {null_ratio:.1%}")
        null_status = "WARNING"
    else:
        null_status = "PASS"
    checks.append({"check": "Missing Values", "status": null_status, "count": missing_count, "ratio": round(null_ratio, 4)})

    # Duplicate records check
    if dup_count > 0:
        warnings.append(f"Found {dup_count} duplicate rows.")
        dup_status = "WARNING"
    else:
        dup_status = "PASS"
    checks.append({"check": "Duplicate Records", "status": dup_status, "count": dup_count})

    # Physical limits check
    cols_lower = {c.lower(): c for c in df.columns}
    for var, limits in PHYSICAL_LIMITS.items():
        matched_col = None
        for col in df.columns:
            if var in col.lower() or col.lower() in var:
                matched_col = col
                break
        
        if matched_col and pd.api.types.is_numeric_dtype(df[matched_col]):
            series = df[matched_col].dropna()
            if len(series) > 0:
                s_min = float(series.min())
                s_max = float(series.max())
                viol_low = int((series < limits["min"]).sum())
                viol_high = int((series > limits["max"]).sum())
                
                status = "PASS"
                if viol_low > 0 or viol_high > 0:
                    status = "WARNING"
                    warnings.append(f"{matched_col} has values outside bounds [{limits['min']}, {limits['max']}]: min={s_min:.2f}, max={s_max:.2f}")

                checks.append({
                    "check": f"Physics Bound: {matched_col}",
                    "variable": var,
                    "status": status,
                    "observed_min": s_min,
                    "observed_max": s_max,
                    "expected_min": limits["min"],
                    "expected_max": limits["max"],
                    "violations": viol_low + viol_high
                })

    overall_status = "FAIL" if errors else ("WARNING" if warnings else "PASS")
    return {
        "dataset_name": dataset_name,
        "overall_status": overall_status,
        "rows": total_rows,
        "columns": total_cols,
        "checks": checks,
        "warnings": warnings,
        "errors": errors
    }
