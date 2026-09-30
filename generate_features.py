"""
Script: scripts/generate_features.py
Generates climatological baseline departure anomalies and climate-context features.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_engine.features.feature_builder import build_integrated_training_dataset

if __name__ == "__main__":
    print("Generating meteorological features and climatological anomalies...")
    df, info = build_integrated_training_dataset()
    print(f"\nGenerated {len(info['features'])} features for {len(df)} samples.")
    print("Feature List:")
    for f in info["features"]:
        print(f"  * {f}")
