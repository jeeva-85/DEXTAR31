"""
Alert Service Layer - SIH26078
Manages meteorological risk alerts, evacuation advisories, and database persistence.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.database.models import AlertRecord

class AlertService:
    def __init__(self):
        pass

    def seed_default_alerts_if_empty(self, db: Session):
        count = db.query(AlertRecord).count()
        if count == 0:
            defaults = [
                AlertRecord(
                    alert_id="ALT-CYC-01",
                    event_id="CYC-BOB-MR-01",
                    severity_level=3,
                    severity_category="Extreme / Emergency",
                    hazard_type="TROPICAL_CYCLONE",
                    forecast_lead="Day 5 Lead (120 hrs)",
                    action_advisory="Urgent coastal alert: Severe cyclonic circulation tracking north-northeast towards north Odisha & West Bengal coasts. Advise suspension of fishing and prepare coastal shelter activations.",
                    centroid_lat=17.5,
                    centroid_lon=88.5,
                    uncertainty_radius_km=78.5,
                    issued_at=datetime.now(timezone.utc)
                ),
                AlertRecord(
                    alert_id="ALT-HW-02",
                    event_id="HW-NW-IND-01",
                    severity_level=3,
                    severity_category="Extreme / Emergency",
                    hazard_type="SEVERE_HEATWAVE",
                    forecast_lead="Day 6 Lead (144 hrs)",
                    action_advisory="Red alert for severe heatwave across West Rajasthan, Haryana, and Delhi NCR. Temperatures projected to breach 47.5°C with severe heat stress index.",
                    centroid_lat=28.7,
                    centroid_lon=74.2,
                    uncertainty_radius_km=95.0,
                    issued_at=datetime.now(timezone.utc)
                ),
                AlertRecord(
                    alert_id="ALT-RAIN-03",
                    event_id="RAIN-KONKAN-01",
                    severity_level=2,
                    severity_category="Severe / Warning",
                    hazard_type="EXTREME_RAINFALL",
                    forecast_lead="Day 4 Lead (96 hrs)",
                    action_advisory="Orange warning for extremely heavy rainfall (>200mm/day) along Western Ghats ghat sections and Konkan belt. Flood vulnerability elevated.",
                    centroid_lat=18.2,
                    centroid_lon=73.2,
                    uncertainty_radius_km=55.0,
                    issued_at=datetime.now(timezone.utc)
                )
            ]
            db.add_all(defaults)
            db.commit()

    def list_alerts(self, db: Session) -> list:
        self.seed_default_alerts_if_empty(db)
        records = db.query(AlertRecord).order_by(AlertRecord.severity_level.desc()).all()
        return [{
            "alert_id": r.alert_id,
            "event_id": r.event_id,
            "severity_level": r.severity_level,
            "severity_category": r.severity_category,
            "hazard_type": r.hazard_type,
            "forecast_lead": r.forecast_lead,
            "action_advisory": r.action_advisory,
            "centroid_lat": r.centroid_lat,
            "centroid_lon": r.centroid_lon,
            "uncertainty_radius_km": r.uncertainty_radius_km,
            "issued_at": r.issued_at.isoformat() if r.issued_at else None
        } for r in records]

    def create_alert(self, data: dict, db: Session) -> dict:
        alert_id = f"ALT-{uuid.uuid4().hex[:6].upper()}"
        record = AlertRecord(
            alert_id=alert_id,
            event_id=data.get("event_id", "GENERAL-ANOMALY"),
            severity_level=data.get("severity_level", 2),
            severity_category=data.get("severity_category", "Severe / Warning"),
            hazard_type=data.get("hazard_type", "EXTREME_WEATHER"),
            forecast_lead=data.get("forecast_lead", "Day 5 Lead"),
            action_advisory=data.get("action_advisory", "Advisory issued."),
            centroid_lat=data.get("centroid_lat", 20.0),
            centroid_lon=data.get("centroid_lon", 80.0),
            uncertainty_radius_km=data.get("uncertainty_radius_km", 75.0),
            issued_at=datetime.now(timezone.utc)
        )
        db.add(record)
        db.commit()
        return {"status": "created", "alert_id": alert_id}
