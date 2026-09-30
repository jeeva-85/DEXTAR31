"""
Tracking Service Layer - SIH26078
Manages spatio-temporal tracking, trajectories, dynamic bounding boxes, and database events.
"""

import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.database.models import EventRecord
from ml_engine.tracking.spatio_temporal_tracker import SpatioTemporalTracker

class TrackingService:
    def __init__(self):
        self.tracker = SpatioTemporalTracker()

    def sync_events_to_db(self, db: Session):
        """Syncs active tracking events to SQLite database."""
        events = self.tracker.list_events()
        for ev in events:
            existing = db.query(EventRecord).filter(EventRecord.event_id == ev["event_id"]).first()
            first_pt = ev["trajectory"][0]
            if not existing:
                record = EventRecord(
                    event_id=ev["event_id"],
                    event_name=ev["event_name"],
                    event_type=ev["event_type"],
                    status=ev["status"],
                    current_lat=first_pt["centroid"]["latitude"],
                    current_lon=first_pt["centroid"]["longitude"],
                    intensity=first_pt["intensity"],
                    severity_level=3 if "CYCLONE" in ev["event_type"] else 2,
                    forecast_lead=ev["forecast_lead"],
                    movement_direction=ev["movement_direction"],
                    mean_velocity_kmh=ev["mean_velocity_kmh"],
                    created_at=datetime.now(timezone.utc),
                    trajectory_json=json.dumps(ev["trajectory"])
                )
                db.add(record)
            else:
                existing.status = ev["status"]
                existing.current_lat = first_pt["centroid"]["latitude"]
                existing.current_lon = first_pt["centroid"]["longitude"]
                existing.intensity = first_pt["intensity"]
                existing.trajectory_json = json.dumps(ev["trajectory"])
        db.commit()

    def list_events(self, db: Session) -> list:
        self.sync_events_to_db(db)
        records = db.query(EventRecord).all()
        return [{
            "event_id": r.event_id,
            "event_name": r.event_name,
            "event_type": r.event_type,
            "status": r.status,
            "current_lat": r.current_lat,
            "current_lon": r.current_lon,
            "intensity": r.intensity,
            "severity_level": r.severity_level,
            "forecast_lead": r.forecast_lead,
            "movement_direction": r.movement_direction,
            "mean_velocity_kmh": r.mean_velocity_kmh
        } for r in records]

    def get_event(self, event_id: str, db: Session) -> dict:
        self.sync_events_to_db(db)
        track = self.tracker.get_event_track(event_id)
        if track:
            return track
        r = db.query(EventRecord).filter(EventRecord.event_id == event_id).first()
        if not r:
            return {"status": "error", "message": f"Event {event_id} not found."}
        return {
            "event_id": r.event_id,
            "event_name": r.event_name,
            "event_type": r.event_type,
            "status": r.status,
            "trajectory": json.loads(r.trajectory_json) if r.trajectory_json else []
        }

    def get_tracking(self, event_id: str) -> dict:
        track = self.tracker.get_event_track(event_id)
        if not track:
            track = self.tracker.list_events()[0]
        return track
