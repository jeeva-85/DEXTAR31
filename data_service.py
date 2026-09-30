"""
Data Service Layer - SIH26078
Interacts with raw dataset repository, scanner, and database records.
"""

import os
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.database.models import DatasetRecord
from ml_engine.ingestion.scanner import run_scan
from ml_engine.ingestion.validator import validate_dataframe
import pandas as pd

class DataService:
    def __init__(self, data_root: str):
        self.data_root = data_root

    def scan_and_sync(self, db: Session) -> dict:
        """Scans filesystem and synchronizes dataset catalog with database."""
        result = run_scan(self.data_root)
        datasets = result.get("datasets", [])

        for d in datasets:
            existing = db.query(DatasetRecord).filter(DatasetRecord.filename == d["filename"]).first()
            if not existing:
                record = DatasetRecord(
                    filename=d["filename"],
                    format=d["format"],
                    category=d["category"],
                    file_size_bytes=d["file_size_bytes"],
                    rows=d["rows"],
                    columns=d["columns"],
                    quality_status=d["quality_status"],
                    scanned_at=datetime.now(timezone.utc),
                    meta_json=json.dumps(d)
                )
                db.add(record)
            else:
                existing.quality_status = d["quality_status"]
                existing.rows = d["rows"]
                existing.columns = d["columns"]
                existing.meta_json = json.dumps(d)
        db.commit()

        categories = {}
        for d in datasets:
            cat = d["category"]
            categories[cat] = categories.get(cat, 0) + 1

        return {
            "total_datasets": len(datasets),
            "catalog_timestamp": result.get("scan_timestamp", datetime.now(timezone.utc).isoformat()),
            "categories": categories,
            "datasets": datasets,
            "feature_metadata": result.get("feature_metadata", {})
        }

    def get_status(self, db: Session) -> dict:
        """Returns catalog status, scanning if database is empty."""
        count = db.query(DatasetRecord).count()
        if count == 0:
            return self.scan_and_sync(db)

        records = db.query(DatasetRecord).all()
        datasets = []
        categories = {}
        for r in records:
            cat = r.category
            categories[cat] = categories.get(cat, 0) + 1
            if r.meta_json:
                try:
                    datasets.append(json.loads(r.meta_json))
                except Exception:
                    datasets.append({"filename": r.filename, "format": r.format, "category": r.category})
            else:
                datasets.append({"filename": r.filename, "format": r.format, "category": r.category})

        # Load feature metadata
        processed_dir = os.path.join(os.path.dirname(self.data_root), "processed")
        meta_file = os.path.join(processed_dir, "feature_metadata.json")
        feat_meta = {}
        if os.path.exists(meta_file):
            with open(meta_file, "r") as f:
                feat_meta = json.load(f)

        return {
            "total_datasets": len(datasets),
            "catalog_timestamp": datetime.now(timezone.utc).isoformat(),
            "categories": categories,
            "datasets": datasets,
            "feature_metadata": feat_meta
        }
