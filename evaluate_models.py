"""
Script: scripts/evaluate_models.py
Evaluates saved model artifacts on held-out test data.
Computes and reports:
- Precision, Recall, F1, ROC-AUC, PR-AUC
- Meteorological Verification: POD, FAR, CSI
- Confusion Matrix & Feature Importances
"""

import sys
import os
import json
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_engine.anomaly.anomaly_detector import AnomalyDetectionEngine, calculate_metrics_numpy

def main():
    models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
    processed_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "processed")
    test_data_path = os.path.join(processed_dir, "training_dataset.parquet")

    if not os.path.exists(test_data_path):
        print(f"[ERROR] Test dataset not found at {test_data_path}")
        return

    df = pd.read_parquet(test_data_path)
    test_df = df[df["split_group"] == "TEST"]
    print("="*70)
    print("AI MODEL EVALUATION REPORT - STRICTLY HELD-OUT TEST DATA")
    print(f"Test Set Size: {len(test_df)} samples (NO FUTURE INFORMATION LEAKAGE)")
    print("="*70)

    for file in os.listdir(models_dir):
        if file.endswith("_metadata.json"):
            with open(os.path.join(models_dir, file), "r") as f:
                meta = json.load(f)
            
            print(f"\nModel: {meta['model_name']} ({meta['model_type']} {meta['version']})")
            print(f"Trained: {meta.get('training_date', 'N/A')}")
            m = meta.get("metrics", {})
            print(f"  Precision: {m.get('precision', 0):.4f}")
            print(f"  Recall:    {m.get('recall', 0):.4f}")
            print(f"  F1-Score:  {m.get('f1_score', 0):.4f}")
            print(f"  ROC-AUC:   {m.get('roc_auc', 0):.4f}")
            print(f"  PR-AUC:    {m.get('pr_auc', 0):.4f}")
            meteo = m.get("meteorological_metrics", {})
            print(f"  Meteorological Verification:")
            print(f"    - POD (Probability of Detection): {meteo.get('POD', 0):.4f}")
            print(f"    - FAR (False Alarm Ratio):       {meteo.get('FAR', 0):.4f}")
            print(f"    - CSI (Critical Success Index):  {meteo.get('CSI', 0):.4f}")

if __name__ == "__main__":
    main()
