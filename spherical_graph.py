"""
Spherical Geometry & Spatial Relationship Graph Engine - SIH26078
Computes great-circle (Haversine / Geodesic) distances on Earth's spherical surface,
generates spatial graph nodes and adjacency edges, and calculates forward propagation tracks.
"""

import math
import numpy as np
from typing import Dict, Any, List, Tuple

EARTH_RADIUS_KM = 6371.0

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates spherical great-circle distance between two points in kilometers."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_KM * c

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates initial bearing (direction of movement in degrees 0-360) from point 1 to 2."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dlambda = math.radians(lon2 - lon1)

    y = math.sin(dlambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(dlambda)
    bearing = (math.degrees(math.atan2(y, x)) + 360.0) % 360.0
    return round(bearing, 1)

def bearing_to_compass(bearing: float) -> str:
    """Converts degrees to 16-point cardinal compass direction."""
    points = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
              "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    idx = int((bearing + 11.25) / 22.5) % 16
    return points[idx]

def build_spherical_spatial_graph(nodes: List[Dict[str, Any]], max_edge_distance_km: float = 300.0) -> Dict[str, Any]:
    """Constructs explicit graph nodes and spherical connectivity edges.
    Node = Atmospheric location (latitude, longitude, intensity, lead)
    Edge = Spatial correlation relationship weighted by inverse spherical distance.
    """
    graph_nodes = []
    for i, n in enumerate(nodes):
        graph_nodes.append({
            "id": i,
            "latitude": n["latitude"],
            "longitude": n["longitude"],
            "intensity": n.get("intensity", 0.0),
            "lead_day": n.get("forecast_lead_day", 0)
        })

    edges = []
    n_count = len(graph_nodes)
    for i in range(n_count):
        for j in range(i + 1, n_count):
            d = haversine_distance(
                graph_nodes[i]["latitude"], graph_nodes[i]["longitude"],
                graph_nodes[j]["latitude"], graph_nodes[j]["longitude"]
            )
            if d <= max_edge_distance_km:
                edges.append({
                    "source": i,
                    "target": j,
                    "distance_km": round(d, 1),
                    "weight": round(1.0 / (1.0 + d / 100.0), 3)
                })

    return {
        "architecture": "Spherical-Spatial-Relationship-Graph",
        "description": "The system represents atmospheric locations and their spatial relationships while accounting for the Earth's global geometry.",
        "nodes_count": len(graph_nodes),
        "edges_count": len(edges),
        "nodes": graph_nodes,
        "edges": edges,
        "advanced_gnn_status": "RESEARCH_AND_INTEGRATION_STAGE"
    }
