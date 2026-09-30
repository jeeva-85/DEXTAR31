"""
Script: scripts/build_training_dataset.py
Executes automatic feature engineering and builds processed/training_dataset.*
"""

import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_engine.features.feature_builder import build_integrated_training_dataset

if __name__ == "__main__":
    print("Building integrated ML training dataset...")
    df, info = build_integrated_training_dataset()
    print("\nDataset successfully built:")
    print(f"Total Rows: {info['total_samples']}")
    print(f"Train Rows: {info['train_samples']}")
    print(f"Val Rows:   {info['validation_samples']}")
    print(f"Test Rows:  {info['test_samples']}")
    print(f"Features:   {len(info['features'])}")
    print(f"Prevalence: {info['extreme_event_prevalence']:.1%}")
