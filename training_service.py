"""
Training Service Layer - SIH26078
Manages model training jobs, background job tracking, model registration,
and database persistence of model versions and metrics.
"""

import os
import json
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.database.models import TrainingJobRecord, ModelRecord
from ml_engine.anomaly.anomaly_detector import AnomalyDetectionEngine
from ml_engine.features.feature_builder import build_integrated_training_dataset

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROCESSED_DIR = os.path.join(PROJECT_ROOT, "data", "processed")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")

class TrainingService:
    def __init__(self):
        pass

    def start_training_job(self, model_type: str, db: Session) -> dict:
        """Starts a training run, fits the requested model, updates metrics in DB."""
        job_id = f"JOB-{uuid.uuid4().hex[:8].upper()}"
        start_time = datetime.now(timezone.utc)

        job_record = TrainingJobRecord(
            job_id=job_id,
            model_type=model_type,
            status="RUNNING",
            start_time=start_time
        )
        db.add(job_record)
        db.commit()

        dataset_path = os.path.join(PROCESSED_DIR, "training_dataset.parquet")
        if not os.path.exists(dataset_path):
            build_integrated_training_dataset()

        try:
            engine = AnomalyDetectionEngine(model_type=model_type)
            metrics = engine.train_and_evaluate(dataset_path)

            end_time = datetime.now(timezone.utc)
            job_record.status = "COMPLETED"
            job_record.end_time = end_time
            job_record.metrics_json = json.dumps(metrics)
            db.commit()

            # Register model in DB
            model_id = f"{model_type}_{engine.version}"
            existing = db.query(ModelRecord).filter(ModelRecord.model_id == model_id).first()
            if not existing:
                model_record = ModelRecord(
                    model_id=model_id,
                    model_name=f"Anomaly Detector ({model_type.upper()})",
                    model_type=model_type.upper(),
                    version=engine.version,
                    precision=metrics.get("precision"),
                    recall=metrics.get("recall"),
                    f1_score=metrics.get("f1_score"),
                    roc_auc=metrics.get("roc_auc"),
                    pr_auc=metrics.get("pr_auc"),
                    pod=metrics.get("meteorological_metrics", {}).get("POD"),
                    far=metrics.get("meteorological_metrics", {}).get("FAR"),
                    csi=metrics.get("meteorological_metrics", {}).get("CSI"),
                    model_path=engine.model_path,
                    status="OPERATIONAL_PROTOTYPE",
                    created_at=end_time,
                    limitations="Trained on regional NWP forecasts, IMDAA reanalysis, and historical extremes. Uncertainty increases past Day 7 lead."
                )
                db.add(model_record)
            else:
                existing.f1_score = metrics.get("f1_score")
                existing.roc_auc = metrics.get("roc_auc")
                existing.pod = metrics.get("meteorological_metrics", {}).get("POD")
                existing.far = metrics.get("meteorological_metrics", {}).get("FAR")
                existing.csi = metrics.get("meteorological_metrics", {}).get("CSI")
            db.commit()

            return {
                "job_id": job_id,
                "model_type": model_type,
                "status": "COMPLETED",
                "start_time": start_time.isoformat(),
                "end_time": end_time.isoformat(),
                "metrics": metrics
            }

        except Exception as e:
            job_record.status = "FAILED"
            job_record.error_message = str(e)
            job_record.end_time = datetime.now(timezone.utc)
            db.commit()
            return {
                "job_id": job_id,
                "model_type": model_type,
                "status": "FAILED",
                "error": str(e)
            }

    def get_job_status(self, job_id: str, db: Session) -> dict:
        job = db.query(TrainingJobRecord).filter(TrainingJobRecord.job_id == job_id).first()
        if not job:
            return {"job_id": job_id, "status": "NOT_FOUND"}
        metrics = json.loads(job.metrics_json) if job.metrics_json else None
        return {
            "job_id": job.job_id,
            "model_type": job.model_type,
            "status": job.status,
            "start_time": job.start_time.isoformat() if job.start_time else None,
            "end_time": job.end_time.isoformat() if job.end_time else None,
            "metrics": metrics,
            "error_message": job.error_message
        }

    def list_models(self, db: Session) -> list:
        # Check if database has models, if not populate from models/ directory
        records = db.query(ModelRecord).all()
        if not records and os.path.exists(MODELS_DIR):
            for file in os.listdir(MODELS_DIR):
                if file.endswith("_metadata.json"):
                    with open(os.path.join(MODELS_DIR, file), "r") as f:
                        m = json.load(f)
                        rec = ModelRecord(
                            model_id=m.get("model_name", file),
                            model_name=m.get("model_name"),
                            model_type=m.get("model_type"),
                            version=m.get("version"),
                            precision=m.get("metrics", {}).get("precision"),
                            recall=m.get("metrics", {}).get("recall"),
                            f1_score=m.get("metrics", {}).get("f1_score"),
                            roc_auc=m.get("metrics", {}).get("roc_auc"),
                            pod=m.get("metrics", {}).get("meteorological_metrics", {}).get("POD"),
                            far=m.get("metrics", {}).get("meteorological_metrics", {}).get("FAR"),
                            csi=m.get("metrics", {}).get("meteorological_metrics", {}).get("CSI"),
                            model_path=m.get("model_path"),
                            status=m.get("status", "OPERATIONAL_PROTOTYPE"),
                            limitations=m.get("limitations")
                        )
                        db.add(rec)
            db.commit()
            records = db.query(ModelRecord).all()

        results = []
        for r in records:
            results.append({
                "model_id": r.model_id,
                "model_name": r.model_name,
                "model_type": r.model_type,
                "version": r.version,
                "precision": r.precision,
                "recall": r.recall,
                "f1_score": r.f1_score,
                "roc_auc": r.roc_auc,
                "pod": r.pod,
                "far": r.far,
                "csi": r.csi,
                "status": r.status,
                "limitations": r.limitations
            })
        return results

    def get_model_detail(self, model_id: str, db: Session) -> dict:
        r = db.query(ModelRecord).filter(ModelRecord.model_id.ilike(f"%{model_id}%")).first()
        if not r:
            return {"status": "error", "message": f"Model {model_id} not found."}
        return {
            "model_id": r.model_id,
            "model_name": r.model_name,
            "model_type": r.model_type,
            "version": r.version,
            "metrics": {
                "precision": r.precision,
                "recall": r.recall,
                "f1_score": r.f1_score,
                "roc_auc": r.roc_auc,
                "meteorological_metrics": {
                    "POD": r.pod,
                    "FAR": r.far,
                    "CSI": r.csi
                }
            },
            "status": r.status,
            "model_path": r.model_path,
            "limitations": r.limitations,
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
