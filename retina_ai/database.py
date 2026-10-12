"""
SQLite database configuration and SQLAlchemy models for RetinaVision AI.
Provides complete, permanent persistence for screening records, patient cases, and inference results.
"""

import os
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List, Dict, Any

from sqlalchemy import (
    create_engine, Column, String, Integer, Float, DateTime, Text, desc
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from retina_ai.config import CONFIG

DB_DIR = CONFIG["project_root"] / "data"
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = DB_DIR / "retinavision.db"
DATABASE_URL = f"sqlite:///{DB_PATH.as_posix()}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ScreeningRecord(Base):
    """Stores complete clinical screening and AI inference record."""
    __tablename__ = "screening_records"

    id = Column(String(64), primary_key=True, index=True)
    patient_id = Column(String(64), index=True, default="PT-2026-UNKNOWN")
    patient_name = Column(String(128), default="Anonymous Patient")
    age = Column(Integer, nullable=True)
    gender = Column(String(32), nullable=True)
    eye = Column(String(32), default="OD (Right Eye)")

    image_path = Column(String(256), nullable=False)
    gradcam_path = Column(String(256), nullable=True)

    disease = Column(String(64), index=True, nullable=False)
    confidence = Column(Float, nullable=False)
    risk_tier = Column(String(32), default="Low Risk")
    severity_label = Column(String(64), nullable=True)

    probabilities_json = Column(Text, nullable=False)
    lesion_findings_json = Column(Text, nullable=True)
    narrative_json = Column(Text, nullable=True)
    triage_json = Column(Text, nullable=True)

    inference_time_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self) -> Dict[str, Any]:
        """Converts database record to structured client-facing dictionary."""
        probs = json.loads(self.probabilities_json) if self.probabilities_json else {}
        lesions = json.loads(self.lesion_findings_json) if self.lesion_findings_json else {}
        narrative = json.loads(self.narrative_json) if self.narrative_json else {}
        triage = json.loads(self.triage_json) if self.triage_json else {}

        prob_list = [
            {"condition": c.replace("_", " "), "probability": p}
            for c, p in probs.items()
        ]

        return {
            "id": self.id,
            "patientId": self.patient_id,
            "patientName": self.patient_name,
            "age": self.age,
            "gender": self.gender,
            "eye": self.eye,
            "capturedAt": self.created_at.isoformat() if self.created_at else datetime.now(timezone.utc).isoformat(),
            "imageOriginal": self.image_path,
            "imageGradcam": self.gradcam_path,
            "disease": self.disease,
            "primaryCondition": self.disease.replace("_", " "),
            "confidence": self.confidence,
            "predictionConfidence": self.confidence,
            "modelValidationAccuracy": 81.78,
            "severity": self.severity_label or "No Apparent Pathology",
            "riskLevel": self.risk_tier,
            "probabilities": prob_list,
            "all_probabilities": probs,
            "lesionFindings": lesions,
            "clinicalNarrative": narrative,
            "triage": triage,
            "inferenceTimeMs": round(self.inference_time_ms, 2),
            "status": "Completed"
        }


import hashlib
import secrets

class Patient(Base):
    """Stores registered patient demographics and ophthalmic risk history."""
    __tablename__ = "patients"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(32), default="Male")
    phone = Column(String(64), nullable=True)
    email = Column(String(128), nullable=True)
    diabetic_history = Column(String(128), nullable=True)
    hypertension = Column(String(128), nullable=True)
    previous_eye_surgery = Column(String(128), nullable=True)
    family_glaucoma = Column(String(64), nullable=True)
    symptoms = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self) -> Dict[str, Any]:
        """Converts patient model to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "age": self.age,
            "gender": self.gender,
            "phone": self.phone,
            "email": self.email,
            "diabeticHistory": self.diabetic_history,
            "hypertension": self.hypertension,
            "previousEyeSurgery": self.previous_eye_surgery,
            "familyGlaucoma": self.family_glaucoma,
            "symptoms": self.symptoms,
            "createdAt": self.created_at.isoformat() if self.created_at else datetime.now(timezone.utc).isoformat()
        }


def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    """Generates PBKDF2 SHA256 password hash and salt."""
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return key, salt


def verify_password(password: str, password_hash: str, salt: str) -> bool:
    """Verifies candidate password against stored PBKDF2 hash."""
    key, _ = hash_password(password, salt)
    return secrets.compare_digest(key, password_hash)


class User(Base):
    """Stores registered clinicians, ophthalmologists, and workstation users."""
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    salt = Column(String(64), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(100), default="Ophthalmologist")
    department = Column(String(255), default="Vitreo-Retinal Diagnostic Unit")
    hospital_name = Column(String(255), default="Apex Eye Institute & Retina Care")
    license_no = Column(String(100), default="KMC-729481")
    auth_token = Column(String(255), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "email": self.email,
            "fullName": self.full_name,
            "role": self.role,
            "department": self.department,
            "hospitalName": self.hospital_name,
            "licenseNo": self.license_no,
            "createdAt": self.created_at.isoformat() if self.created_at else datetime.now(timezone.utc).isoformat()
        }


def init_db():
    """Initializes the database schema and seeds default doctor user."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == "doctor@retinavision.ai").first() is None:
            p_hash, salt = hash_password("password123")
            token = secrets.token_hex(32)
            default_doctor = User(
                id="USR-DR-PRIYA",
                email="doctor@retinavision.ai",
                password_hash=p_hash,
                salt=salt,
                full_name="Dr. Priya Sharma",
                role="Vitreo-Retinal Specialist",
                department="Ophthalmology / Vitreo-Retina",
                hospital_name="Apex Eye Institute",
                license_no="KMC-729481",
                auth_token=token
            )
            db.add(default_doctor)
            db.commit()
    except Exception as e:
        db.rollback()
    finally:
        db.close()


# Automatically create tables and seed default user if needed
init_db()


def get_db():
    """FastAPI database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


