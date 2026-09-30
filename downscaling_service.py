"""
Downscaling Service Layer - SIH26078
Manages localized spatial downscaling from ~12km to ~5km resolution over the Threat Region.
"""

import numpy as np
from ml_engine.downscaling.downscaler import LocalizedDownscaler
from ml_engine.tracking.spatio_temporal_tracker import SpatioTemporalTracker

class DownscalingService:
    def __init__(self):
        self.downscaler = LocalizedDownscaler()
        self.tracker = SpatioTemporalTracker()

    def run_downscaling(self, event_id: str = "CYC-BOB-MR-01", variable: str = "temperature_c") -> dict:
        track = self.tracker.get_event_track(event_id)
        if not track:
            track = self.tracker.list_events()[0]

        # Use Day 5 forecast lead bounding box
        target_pt = track["trajectory"][2]
        bbox = target_pt["threat_bounding_box"]

        # Synthetic coarse grid representing NWP ~12 km atmospheric crop
        base_val = 28.5 if variable == "temperature_c" else 150.0
        coarse_grid = np.array([
            [base_val, base_val + 0.4, base_val + 0.7, base_val + 0.2],
            [base_val + 0.3, base_val - 0.2, base_val - 0.6, base_val - 0.1],
            [base_val + 0.5, base_val - 0.5, base_val - 1.1, base_val - 0.4],
            [base_val + 0.1, base_val - 0.1, base_val - 0.5, base_val + 0.2]
        ])

        return self.downscaler.downscale_threat_region(coarse_grid, bbox, variable=variable)
