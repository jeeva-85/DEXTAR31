"""
Script: scripts/train_models.py
Executes real ML training on processed datasets with time-aware splitting.
Trains and compares XGBoost, LightGBM, and Random Forest models.
Saves model weights and evaluation metadata.
"""

import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_engine.anomaly.anomaly_detector import AnomalyDetectionEngine
from ml_engine.features.feature_builder import build_integrated_training_dataset

def main():
    processed_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "processed")
    dataset_path = os.path.join(processed_dir, "training_dataset.parquet")

    if not os.path.exists(dataset_path):
        print("[SETUP] Training dataset not found. Generating now...")
        build_integrated_training_dataset()

    print("\n" + "="*70)
    print("AI MODEL TRAINING CENTER - SIH26078")
    print("="*70)

    models_to_train = ["xgboost", "lightgbm", "random_forest"]
    results = {}

    for m_type in models_to_train:
        print(f"\n--- Training {m_type.upper()} Classifier ---")
        engine = AnomalyDetectionEngine(model_type=m_type)
        metrics = engine.train_and_evaluate(dataset_path)
        results[m_type] = metrics
        print(f"Results for {m_type.upper()}:")
        print(f"  * Precision: {metrics['precision']:.4f}")
        print(f"  * Recall:    {metrics['recall']:.4f}")
        print(f"  * F1-Score:  {metrics['f1_score']:.4f}")
        print(f"  * ROC-AUC:   {metrics['roc_auc']:.4f}")
        print(f"  * PR-AUC:    {metrics['pr_auc']:.4f}")
        print(f"  * Meteorological POD (Detection):    {metrics['meteorological_metrics']['POD']:.4f}")
        print(f"  * Meteorological FAR (False Alarm):  {metrics['meteorological_metrics']['FAR']:.4f}")
        print(f"  * Meteorological CSI (Threat Score): {metrics['meteorological_metrics']['CSI']:.4f}")

    print("\n" + "="*70)
    print("TRAINING WORKFLOW COMPLETED SUCCESSFULLY - ALL MODELS SAVED")
    print("="*70)

if __name__ == "__main__":
    main()
