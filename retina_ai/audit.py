"""
Audit logging and data privacy compliance module for Retina AI.
Ensures transparent traceability, HIPAA-aligned record keeping, and privacy preservation.
"""

import os
import json
import uuid
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
import threading

from retina_ai.config import CONFIG

_LOG_LOCK = threading.Lock()


def anonymize_id(identifier: str) -> str:
    """Creates a 12-character one-way cryptographic hash of patient/client identifier."""
    if not identifier or identifier in ("N/A", "Patient", "Demo"):
        return f"ANON-{uuid.uuid4().hex[:8]}"
    return "ANON-" + hashlib.sha256(identifier.encode("utf-8")).hexdigest()[:8].upper()


class AuditLogger:
    """Thread-safe JSONL audit logger for model inferences and gate decisions."""
    def __init__(self, log_path: Optional[Path] = None):
        if log_path is None:
            log_path = Path(CONFIG["audit_log_path"])
        self.log_path = log_path
        self.log_path.parent.mkdir(parents=True, exist_ok=True)

    def log_prediction(
        self,
        result: Dict[str, Any],
        patient_id: str = "N/A",
        client_ip: Optional[str] = None,
        duration_ms: Optional[float] = None
    ) -> str:
        """
        Appends an audit record.
        Returns the unique audit trace ID.
        """
        audit_id = str(uuid.uuid4())
        anon_patient = anonymize_id(patient_id)

        record = {
            "audit_id": audit_id,
            "timestamp": datetime.now().isoformat(),
            "patient_hash": anon_patient,
            "status": result.get("status", "unknown"),
            "disease": result.get("disease"),
            "confidence": result.get("confidence"),
            "risk_tier": result.get("risk_tier"),
            "referral_decision": result.get("referral"),
            "gate_passed": result.get("status") == "ok",
            "gate_failed_check": result.get("reason") if result.get("status") != "ok" else None,
            "bundle_version": CONFIG["version"],
            "duration_ms": duration_ms,
        }

        with _LOG_LOCK:
            with open(self.log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(record) + "\n")

        return audit_id

