"""
Unit tests for MLOps monitoring and operational audit analysis.
"""

from pathlib import Path
import json
import pytest

from retina_ai.monitoring import compute_audit_metrics


def test_monitoring_empty_log(tmp_path: Path):
    empty_log = tmp_path / "empty_log.jsonl"
    metrics = compute_audit_metrics(empty_log)
    assert metrics["total_requests"] == 0
    assert metrics["gate_rejection_rate_pct"] == 0.0


def test_monitoring_synthetic_log(tmp_path: Path):
    log_file = tmp_path / "synthetic_audit.jsonl"
    records = [
        {"audit_id": "1", "status": "ok", "disease": "Diabetic_Retinopathy", "risk_tier": "High", "referral_decision": {"referable": True}, "duration_ms": 250.0},
        {"audit_id": "2", "status": "ok", "disease": "Normal", "risk_tier": "Low", "referral_decision": {"referable": False}, "duration_ms": 180.0},
        {"audit_id": "3", "status": "rejected", "gate_failed_check": "learned_fundus_classifier", "duration_ms": 45.0},
    ]
    with open(log_file, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r) + "\n")

    metrics = compute_audit_metrics(log_file)
    assert metrics["total_requests"] == 3
    assert metrics["accepted_screenings"] == 2
    assert metrics["rejected_screenings"] == 1
    assert metrics["gate_rejection_rate_pct"] == 33.33
    assert metrics["disease_distribution"]["Diabetic_Retinopathy"] == 1
    assert metrics["disease_distribution"]["Normal"] == 1
    assert metrics["referral_rate_pct"] == 50.0
    assert metrics["latency_ms"]["mean"] > 0

