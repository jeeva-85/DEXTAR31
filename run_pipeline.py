"""
Script: scripts/run_pipeline.py
Executes full end-to-end scientific pipeline:
DATA -> ANOMALY -> DETECTION -> TRACKING -> THREAT REGION -> DOWNSCALING -> PHYSICS -> UNCERTAINTY -> ALERT
"""

import sys
import os
import json
import uuid
import numpy as np
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_engine.anomaly.anomaly_detector import AnomalyDetectionEngine
from ml_engine.tracking.spatio_temporal_tracker import SpatioTemporalTracker
from ml_engine.downscaling.downscaler import LocalizedDownscaler
from ml_engine.physics.metpy_validator import PhysicsValidator
from ml_engine.uncertainty.ensemble_engine import EnsembleUncertaintyEngine

def execute_pipeline(event_id: str = "CYC-BOB-MR-01") -> dict:
    run_id = f"RUN-{uuid.uuid4().hex[:8].upper()}"
    print(f"\n[PIPELINE START] Run ID: {run_id} | Event Target: {event_id}")

    # 1. Detection & Anomaly Model
    engine = AnomalyDetectionEngine(model_type="lightgbm")
    engine.load_model()

    # 2. Tracking
    tracker = SpatioTemporalTracker()
    track_info = tracker.get_event_track(event_id)
    if not track_info:
        track_info = tracker.list_events()[0]

    current_pt = track_info["trajectory"][2] # Day 5 forecast lead point
    centroid = current_pt["centroid"]
    bbox = current_pt["threat_bounding_box"]

    # 3. Detection prediction
    candidate_features = {
        "latitude": centroid["latitude"],
        "longitude": centroid["longitude"],
        "forecast_lead_day": current_pt["forecast_lead_day"],
        "ensemble_member": 1,
        "temperature_c": 28.5,
        "precipitation_mm": 175.0,
        "mslp_hpa": 965.0,
        "wind_speed_ms": current_pt["intensity"] * 0.514444, # knots to m/s
        "relative_humidity": 94.0,
        "temp_anomaly_c": -1.2,
        "std_temp_anomaly": -0.5,
        "rain_anomaly_mm": 150.0,
        "rain_ratio_to_clim": 12.0,
        "mslp_drop_hpa": 45.0,
        "extreme_forecast_index": 0.92,
        "warming_trend_c": 0.58,
        "monsoon_variability_pct": 8.0,
        "regional_vulnerability": 0.92
    }
    detection_res = engine.predict_point(candidate_features)

    # 4. Downscaling (~12km -> ~5km over threat bounding box)
    downscaler = LocalizedDownscaler()
    coarse_grid = np.array([
        [28.0, 28.2, 28.5, 28.1],
        [28.3, 27.9, 27.5, 27.8],
        [28.5, 27.4, 26.8, 27.2],
        [28.2, 27.8, 27.4, 27.9]
    ])
    downscale_res = downscaler.downscale_threat_region(coarse_grid, bbox, variable="temperature_c")

    # 5. Physics Validation
    validator = PhysicsValidator()
    phys_res = validator.validate_atmospheric_state(
        temp_c=candidate_features["temperature_c"],
        relative_humidity=candidate_features["relative_humidity"],
        pressure_hpa=candidate_features["mslp_hpa"],
        wind_speed_ms=candidate_features["wind_speed_ms"],
        precipitation_mm=candidate_features["precipitation_mm"]
    )

    # 6. Ensemble Uncertainty
    unc_engine = EnsembleUncertaintyEngine()
    unc_res = unc_engine.calculate_ensemble_spread(current_pt["ensemble_members"])

    # 7. Operational Alert Generation
    alert = {
        "alert_id": f"ALT-{uuid.uuid4().hex[:6].upper()}",
        "event_id": track_info["event_id"],
        "severity_level": detection_res["severity_indicator"],
        "severity_category": detection_res["severity_label"],
        "hazard_type": detection_res["event_type"],
        "threat_region": {
            "centroid": centroid,
            "bounding_box": bbox,
            "uncertainty_radius_km": current_pt["uncertainty_radius_km"]
        },
        "forecast_lead": f"Day {current_pt['forecast_lead_day']} ({current_pt['valid_time']})",
        "action_advisory": "Urgent coastal evacuation warning: Severe cyclonic track heading NNE towards Odisha/West Bengal coastal convergence.",
        "issued_at": datetime.utcnow().isoformat()
    }

    result = {
        "run_id": run_id,
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat(),
        "detection": detection_res,
        "tracking": {
            "event_id": track_info["event_id"],
            "event_name": track_info["event_name"],
            "forecast_lead": current_pt["forecast_lead_day"],
            "movement_direction": current_pt["movement_direction"],
            "bearing_degrees": current_pt["bearing_degrees"],
            "velocity_kmh": current_pt["velocity_kmh"],
            "threat_bounding_box": bbox,
            "uncertainty_radius_km": current_pt["uncertainty_radius_km"]
        },
        "downscaling": {
            "status": downscale_res["module_status"],
            "type": downscale_res["representation_type"],
            "input_resolution": f"{downscale_res['input_resolution_km']} km",
            "output_resolution": f"{downscale_res['output_resolution_km']} km",
            "grid_dimensions": f"{downscale_res['output_grid_shape'][0]}x{downscale_res['output_grid_shape'][1]}",
            "metrics": downscale_res["evaluation_metrics"]
        },
        "physics_validation": {
            "status": phys_res["overall_status"],
            "checks_passed": sum(1 for c in phys_res["checks"] if c["status"] == "PASS"),
            "total_checks": phys_res["checks_run"],
            "derived_dewpoint": phys_res["derived_quantities"]["dewpoint_celsius"],
            "warnings": phys_res["warnings"]
        },
        "uncertainty": {
            "members_evaluated": unc_res["members_count"],
            "spatial_spread_km": unc_res["spatial_spread_km"],
            "spread_parameters": unc_res["parameters_summary"]
        },
        "alert": alert
    }

    print(f"[PIPELINE COMPLETE] Status: {result['status']} | Alert: {alert['alert_id']} ({alert['severity_category']})")
    return result

if __name__ == "__main__":
    res = execute_pipeline()
    print(json.dumps(res, indent=2))
