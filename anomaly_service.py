"""
Anomaly Service Layer - SIH26078
Performs live model inference and climatological anomaly scoring.
"""

import uuid
from ml_engine.anomaly.anomaly_detector import AnomalyDetectionEngine

class AnomalyService:
    def __init__(self):
        self.engine = AnomalyDetectionEngine(model_type="lightgbm")
        self.engine.load_model()

    def run_inference(self, data: dict) -> dict:
        prediction = self.engine.predict_point(data)
        run_id = f"ANOM-{uuid.uuid4().hex[:8].upper()}"
        return {
            "run_id": run_id,
            "input_coordinates": {"latitude": data.get("latitude"), "longitude": data.get("longitude")},
            "forecast_lead_day": data.get("forecast_lead_day", 5),
            "is_extreme_event": prediction["is_extreme_event"],
            "anomaly_score": prediction["anomaly_score"],
            "event_probability": prediction["event_probability"],
            "severity_indicator": prediction["severity_indicator"],
            "severity_label": prediction["severity_label"],
            "event_type": prediction["event_type"],
            "model_type": prediction["model_type"],
            "model_version": prediction["model_version"],
            "evaluation_status": prediction["evaluation_status"]
        }
