"""
Script: scripts/run_inference.py
Loads a trained model from models/ and runs live inference on candidate atmospheric forecast fields.
"""

import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_engine.anomaly.anomaly_detector import AnomalyDetectionEngine

def main():
    print("="*70)
    print("AI MODEL INFERENCE RUNNER - SIH26078")
    print("="*70)

    # Instantiate engine with best performing trained model (LightGBM)
    engine = AnomalyDetectionEngine(model_type="lightgbm")
    engine.load_model()

    # Test cases:
    # 1. Bay of Bengal Severe Tropical Cyclone point
    cyclone_sample = {
        "latitude": 19.5, "longitude": 87.8, "forecast_lead_day": 5, "ensemble_member": 1,
        "temperature_c": 28.2, "precipitation_mm": 185.0, "mslp_hpa": 962.0, "wind_speed_ms": 42.0,
        "relative_humidity": 95.0, "temp_anomaly_c": -1.5, "std_temp_anomaly": -0.68,
        "rain_anomaly_mm": 172.0, "rain_ratio_to_clim": 14.2, "mslp_drop_hpa": 48.0,
        "extreme_forecast_index": 0.94, "warming_trend_c": 0.58, "monsoon_variability_pct": 8.0,
        "regional_vulnerability": 0.92
    }

    # 2. Northwest India Extreme Heatwave point
    heatwave_sample = {
        "latitude": 28.6, "longitude": 75.0, "forecast_lead_day": 6, "ensemble_member": 1,
        "temperature_c": 47.8, "precipitation_mm": 0.0, "mslp_hpa": 1003.0, "wind_speed_ms": 6.5,
        "relative_humidity": 12.0, "temp_anomaly_c": 6.8, "std_temp_anomaly": 3.09,
        "rain_anomaly_mm": 0.0, "rain_ratio_to_clim": 0.0, "mslp_drop_hpa": 7.0,
        "extreme_forecast_index": 0.88, "warming_trend_c": 0.58, "monsoon_variability_pct": -4.0,
        "regional_vulnerability": 0.79
    }

    # 3. Normal pre-monsoon baseline point
    normal_sample = {
        "latitude": 13.0, "longitude": 80.2, "forecast_lead_day": 4, "ensemble_member": 1,
        "temperature_c": 32.0, "precipitation_mm": 4.5, "mslp_hpa": 1009.5, "wind_speed_ms": 7.0,
        "relative_humidity": 68.0, "temp_anomaly_c": 0.5, "std_temp_anomaly": 0.22,
        "rain_anomaly_mm": 0.0, "rain_ratio_to_clim": 0.6, "mslp_drop_hpa": 0.5,
        "extreme_forecast_index": 0.08, "warming_trend_c": 0.58, "monsoon_variability_pct": 1.0,
        "regional_vulnerability": 0.50
    }

    test_cases = [
        ("Candidate Tropical Cyclone (Day 5 Lead)", cyclone_sample),
        ("Candidate Severe Heatwave (Day 6 Lead)", heatwave_sample),
        ("Normal Meteorological Baseline (Day 4 Lead)", normal_sample)
    ]

    for name, sample in test_cases:
        res = engine.predict_point(sample)
        print(f"\n[INFERENCE] {name}:")
        print(f"  * Extreme Detected:   {bool(res['is_extreme_event'])}")
        print(f"  * Event Type:         {res['event_type']}")
        print(f"  * Event Probability:  {res['event_probability']:.1%}")
        print(f"  * Severity Indicator: Level {res['severity_indicator']} ({res['severity_label']})")
        print(f"  * Anomaly Score:      {res['anomaly_score']}")
        print(f"  * Verification State: {res['evaluation_status']}")

if __name__ == "__main__":
    main()
