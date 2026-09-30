"""
Script: scripts/scan_data.py
Executes automatic dataset scanning and schema detection.
"""

import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_engine.ingestion.scanner import run_scan

if __name__ == "__main__":
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw")
    print(f"Scanning raw data repository at: {data_dir}")
    catalog = run_scan(data_dir)
    print(f"Discovered {catalog['total_datasets_found']} datasets.")
    for d in catalog["datasets"]:
        print(f"[{d['category']}] {d['filename']} - {d['format']} ({d['rows']} rows, {d['columns']} cols) -> Status: {d['quality_status']}")
