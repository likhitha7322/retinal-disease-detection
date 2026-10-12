"""
Monitoring and MLOps metrics module for Retina AI.
Analyzes operational audit logs, tracks data/prediction drift,
computes gate-rejection rates, disease distributions, and latency metrics.
"""

import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np

from retina_ai.config import CONFIG


def compute_audit_metrics(log_path: Optional[Path] = None) -> Dict[str, Any]:
    """
    Parses the prediction audit log (JSONL) and computes summary operational metrics.
    Returns:
        {
            "total_requests": int,
            "accepted_screenings": int,
            "rejected_screenings": int,
            "gate_rejection_rate_pct": float,
            "rejection_breakdown": Dict[str, int],
            "disease_distribution": Dict[str, int],
            "risk_tier_distribution": Dict[str, int],
            "referral_rate_pct": float,
            "latency_ms": {
                "mean": float,
                "p50": float,
                "p95": float
            },
            "drift_alerts": List[str]
        }
    """
    if log_path is None:
        log_path = Path(CONFIG["audit_log_path"])

    if not log_path.exists() or log_path.stat().st_size == 0:
        return {
            "total_requests": 0,
            "accepted_screenings": 0,
            "rejected_screenings": 0,
            "gate_rejection_rate_pct": 0.0,
            "rejection_breakdown": {},
            "disease_distribution": {},
            "risk_tier_distribution": {},
            "referral_rate_pct": 0.0,
            "latency_ms": {"mean": 0.0, "p50": 0.0, "p95": 0.0},
            "drift_alerts": ["No operational audit records logged yet."]
        }

    records = []
    with open(log_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    records.append(json.loads(line))
                except Exception:
                    continue

    if not records:
        return {
            "total_requests": 0,
            "accepted_screenings": 0,
            "rejected_screenings": 0,
            "gate_rejection_rate_pct": 0.0,
            "rejection_breakdown": {},
            "disease_distribution": {},
            "risk_tier_distribution": {},
            "referral_rate_pct": 0.0,
            "latency_ms": {"mean": 0.0, "p50": 0.0, "p95": 0.0},
            "drift_alerts": []
        }

    total_requests = len(records)
    accepted = [r for r in records if r.get("status") == "ok"]
    rejected = [r for r in records if r.get("status") != "ok"]

    rejection_rate = round((len(rejected) / total_requests) * 100, 2)

    # Rejection breakdown
    rejection_breakdown = {}
    for r in rejected:
        check = r.get("gate_failed_check") or "unknown_rejection"
        rejection_breakdown[check] = rejection_breakdown.get(check, 0) + 1

    # Disease distribution among accepted
    disease_dist = {}
    risk_dist = {}
    referred_count = 0

    for r in accepted:
        dis = r.get("disease") or "Unknown"
        disease_dist[dis] = disease_dist.get(dis, 0) + 1

        tier = r.get("risk_tier") or "Unknown"
        risk_dist[tier] = risk_dist.get(tier, 0) + 1

        ref = r.get("referral_decision") or {}
        if ref.get("referable"):
            referred_count += 1

    referral_rate = round((referred_count / max(len(accepted), 1)) * 100, 2)

    # Latencies
    latencies = [r.get("duration_ms") for r in records if isinstance(r.get("duration_ms"), (int, float))]
    if latencies:
        mean_lat = round(float(np.mean(latencies)), 1)
        p50_lat = round(float(np.median(latencies)), 1)
        p95_lat = round(float(np.percentile(latencies, 95)), 1)
    else:
        mean_lat, p50_lat, p95_lat = 0.0, 0.0, 0.0

    # Drift & Quality Alerts
    drift_alerts = []
    if total_requests >= 10 and rejection_rate > 30.0:
        drift_alerts.append(f"Elevated gate rejection rate ({rejection_rate}%): potential camera focal shift or atypical user uploads.")
    if len(accepted) >= 10 and (disease_dist.get("Diabetic_Retinopathy", 0) / len(accepted)) > 0.60:
        drift_alerts.append("Elevated Diabetic Retinopathy prevalence in recent cohort (>60%). Verify screening population demographics.")
    if latencies and p95_lat > 15000.0:
        drift_alerts.append(f"Inference latency spike detected (p95 = {p95_lat}ms). Consider hardware/GPU resource scaling.")

    return {
        "total_requests": total_requests,
        "accepted_screenings": len(accepted),
        "rejected_screenings": len(rejected),
        "gate_rejection_rate_pct": rejection_rate,
        "rejection_breakdown": rejection_breakdown,
        "disease_distribution": disease_dist,
        "risk_tier_distribution": risk_dist,
        "referral_rate_pct": referral_rate,
        "latency_ms": {
            "mean": mean_lat,
            "p50": p50_lat,
            "p95": p95_lat
        },
        "drift_alerts": drift_alerts
    }

