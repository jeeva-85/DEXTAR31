"""
Physics Service Layer - SIH26078
Manages MetPy meteorological physical consistency and thermodynamic tests.
"""

from ml_engine.physics.metpy_validator import PhysicsValidator

class PhysicsService:
    def __init__(self):
        self.validator = PhysicsValidator()

    def run_checks(self, temp_c: float = 28.5, relative_humidity: float = 94.0,
                   pressure_hpa: float = 965.0, wind_speed_ms: float = 42.0,
                   precipitation_mm: float = 175.0) -> dict:
        return self.validator.validate_atmospheric_state(
            temp_c=temp_c,
            relative_humidity=relative_humidity,
            pressure_hpa=pressure_hpa,
            wind_speed_ms=wind_speed_ms,
            precipitation_mm=precipitation_mm
        )
