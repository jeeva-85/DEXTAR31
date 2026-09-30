"""
Script: scripts/register_models.py
Catalogs trained models into models/registry.json with versions, metrics, and limitations.
"""

import sys
import os
import json
from datetime import datetime

def main():
    models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
    registry_file = os.path.join(models_dir, "registry.json")

    registry = []
    if os.path.exists(models_dir):
        for file in os.listdir(models_dir):
            if file.endswith("_metadata.json"):
                with open(os.path.join(models_dir, file), "r") as f:
                    meta = json.load(f)
                    registry.append(meta)

    with open(registry_file, "w") as f:
        json.dump({
            "updated_at": datetime.utcnow().isoformat(),
            "total_models": len(registry),
            "models": registry
        }, f, indent=2)

    print(f"[REGISTRY] Registered {len(registry)} models in {registry_file}:")
    for m in registry:
        f1 = m.get("metrics", {}).get("f1_score", "N/A")
        print(f"  * {m['model_name']} | Type: {m['model_type']} | Status: {m['status']} | F1: {f1}")

if __name__ == "__main__":
    main()
