"""
Regression and end-to-end inference verification tests.
"""

from pathlib import Path
import os
import pytest

from retina_ai.reports import generate_doctor_pdf, generate_patient_pdf


def test_pipeline_rejection_on_non_fundus(fixtures_dir: Path, pipeline):
    neg_path = fixtures_dir / "sample_negative.jpg"
    result = pipeline.predict(str(neg_path), patient_id="TEST-NEG")

    assert result["status"] == "rejected"
    assert result["stage"] == "fundus_gate"
    assert result["failed_check"] in ("geometric_prefilter", "learned_fundus_classifier")
    assert "scores" in result


def test_pipeline_inference_end_to_end(fixtures_dir: Path, pipeline):
    sample_path = fixtures_dir / "sample_amd.jpg"
    result = pipeline.predict(str(sample_path), patient_id="TEST-AMD")

    # Assert basic status
    assert result["status"] == "ok"
    assert "disease" in result
    assert result["disease"] in ("AMD", "Cataract", "Diabetic_Retinopathy", "Glaucoma", "Normal")
    assert "confidence" in result
    assert 0.0 <= result["confidence"] <= 100.0

    # Probabilities
    assert "all_probabilities" in result
    assert len(result["all_probabilities"]) == 5

    # Triage and Risk
    assert result["risk_tier"] in ("High", "Moderate", "Low")
    assert "referral" in result
    assert "referable" in result["referral"]
    assert "urgency" in result["referral"]

    # Severity
    assert "severity" in result

    # Narrative
    assert "narrative" in result
    assert "findings_text" in result["narrative"]
    assert "patient_text" in result["narrative"]
    assert len(result["narrative"]["caveats"]) > 0

    # Audit ID
    assert "audit_id" in result
    assert result["audit_id"].strip() != ""


def test_pdf_report_generation(fixtures_dir: Path, pipeline, tmp_path: Path):
    sample_path = fixtures_dir / "sample_amd.jpg"
    result = pipeline.predict(str(sample_path), patient_id="PDF-TEST")
    assert result["status"] == "ok"

    doc_pdf = tmp_path / "doctor_report.pdf"
    pat_pdf = tmp_path / "patient_report.pdf"

    generate_doctor_pdf(
        result=result,
        raw_img=result["_pil_image"],
        gradcam_overlay=result["_gradcam_overlay"],
        out_path=str(doc_pdf),
        patient_id="PDF-TEST"
    )
    assert doc_pdf.exists() and doc_pdf.stat().st_size > 1000

    generate_patient_pdf(
        result=result,
        raw_img=result["_pil_image"],
        gradcam_overlay=result["_gradcam_overlay"],
        out_path=str(pat_pdf),
        patient_name="John Doe",
        patient_id="PDF-TEST"
    )
    assert pat_pdf.exists() and pat_pdf.stat().st_size > 1000

