"""
Script: scripts/validate_data.py
Executes data integrity and physical meteorological bounds checks across discovered datasets.
"""

import sys
import os
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_engine.ingestion.validator import validate_dataframe

def main():
    raw_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw")
    print(f"Validating datasets in: {raw_dir}\n")

    tested = 0
    passed = 0
    for root, dirs, files in os.walk(raw_dir):
        for file in files:
            path = os.path.join(root, file)
            ext = os.path.splitext(file)[1].lower()
            if ext in [".csv", ".parquet"]:
                try:
                    df = pd.read_parquet(path) if ext == ".parquet" else pd.read_csv(path, nrows=5000)
                    res = validate_dataframe(df, file)
                    tested += 1
                    status = res["overall_status"]
                    if status == "PASS":
                        passed += 1
                    print(f"[{status}] {file} ({res['rows']} rows, {res['columns']} cols, {res['checks'][0]['count']} nulls)")
                    if res["warnings"]:
                        for w in res["warnings"][:2]:
                            print(f"    Warning: {w}")
                except Exception as e:
                    print(f"[ERROR] Could not validate {file}: {e}")

    print(f"\n[VALIDATION SUMMARY] Validated {tested} files: {passed} PASS, {tested - passed} WARNING/REVIEW.")

if __name__ == "__main__":
    main()
