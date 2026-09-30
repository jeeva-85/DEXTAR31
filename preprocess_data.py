"""
Script: scripts/preprocess_data.py
Executes unit normalization, coordinate alignment, and missing value cleaning.
"""

import sys
import os
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_engine.preprocessing.pipeline import normalize_units, clean_missing_and_duplicates

def main():
    raw_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw")
    print(f"Preprocessing datasets in: {raw_dir}\n")
    
    # Preprocess forecast and event datasets
    for sub in ["forecast", "events"]:
        sub_dir = os.path.join(raw_dir, sub)
        if os.path.exists(sub_dir):
            for file in os.listdir(sub_dir):
                path = os.path.join(sub_dir, file)
                ext = os.path.splitext(file)[1].lower()
                if ext in [".csv", ".parquet"]:
                    df = pd.read_parquet(path) if ext == ".parquet" else pd.read_csv(path)
                    before_rows = len(df)
                    df = normalize_units(df)
                    df = clean_missing_and_duplicates(df)
                    print(f"[PREPROCESSED] {file}: {before_rows} rows -> Normalized units: {[c for c in ['temperature_c', 'precipitation_mm', 'mslp_hpa', 'wind_speed_ms'] if c in df.columns]}")

    print("\n[COMPLETE] Preprocessing pipeline finished.")

if __name__ == "__main__":
    main()
