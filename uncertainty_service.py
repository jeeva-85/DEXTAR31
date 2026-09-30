"""
Uncertainty Service Layer - SIH26078
Calculates multi-member dispersion and spatial uncertainty ellipses for NEPS-G forecasts.
"""

from ml_engine.uncertainty.ensemble_engine import EnsembleUncertaintyEngine
from ml_engine.tracking.spatio_temporal_tracker import SpatioTemporalTracker

class UncertaintyService:
    def __init__(self):
        self.unc_engine = EnsembleUncertaintyEngine()
        self.tracker = SpatioTemporalTracker()

    def get_event_uncertainty(self, event_id: str = "CYC-BOB-MR-01", lead_day: int = 5) -> dict:
        track = self.tracker.get_event_track(event_id)
        if not track:
            track = self.tracker.list_events()[0]

        # Match lead day in trajectory
        matched_pt = next((p for p in track["trajectory"] if p["forecast_lead_day"] == lead_day), track["trajectory"][2])
        members = matched_pt.get("ensemble_members", [])

        spread_metrics = self.unc_engine.calculate_ensemble_spread(members)
        spread_metrics["event_id"] = event_id
        spread_metrics["forecast_lead"] = f"Day {matched_pt['forecast_lead_day']} ({matched_pt['valid_time']})"
        spread_metrics["uncertainty_radius_km"] = matched_pt["uncertainty_radius_km"]
        return spread_metrics
