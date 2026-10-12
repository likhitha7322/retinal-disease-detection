"""
API integration tests for FastAPI endpoints.
"""

from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from retina_ai.api import app

client = TestClient(app)


def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "model_version" in data


def test_api_model_info():
    res = client.get("/api/model-info")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["classes"]) == 5
    assert data["benchmarkMetrics"]["testAccuracy"] == 81.78


def test_api_predict_rejection(fixtures_dir: Path):
    neg_path = fixtures_dir / "sample_negative.jpg"
    with open(neg_path, "rb") as f:
        res = client.post(
            "/api/predict",
            files={"file": ("negative.jpg", f, "image/jpeg")},
            data={"patient_id": "TEST-NEG-API"}
        )
    assert res.status_code in (200, 422)
    data = res.json()
    assert data["status"] == "rejected" or data.get("rejected") is True
    assert "scores" in data


def test_api_predict_and_history_crud(fixtures_dir: Path):
    fundus_path = fixtures_dir / "sample_amd.jpg"
    with open(fundus_path, "rb") as f:
        res = client.post(
            "/api/predict",
            files={"file": ("amd.jpg", f, "image/jpeg")},
            data={
                "patient_id": "TEST-AMD-CRUD",
                "patient_name": "Test Patient",
                "eye": "OD (Right Eye)",
                "include_base64_overlay": "true"
            }
        )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    rec = data["data"]
    rec_id = rec["id"]
    assert rec["disease"] in ("AMD", "Diabetic_Retinopathy", "Glaucoma", "Normal", "Cataract")
    assert "gradcam_overlay_b64" in rec

    # Test GET history
    h_res = client.get("/api/history?limit=10")
    assert h_res.status_code == 200
    h_data = h_res.json()
    assert h_data["success"] is True
    assert any(r["id"] == rec_id for r in h_data["data"])

    # Test GET by ID
    d_res = client.get(f"/api/history/{rec_id}")
    assert d_res.status_code == 200
    assert d_res.json()["data"]["id"] == rec_id

    # Test Report Generation for this record
    rep_res = client.get(f"/api/report/{rec_id}")
    assert rep_res.status_code == 200
    assert rep_res.headers["content-type"] == "application/pdf"
    assert len(rep_res.content) > 1000

    # Test DELETE record
    del_res = client.delete(f"/api/history/{rec_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Verify deleted
    check_del = client.get(f"/api/history/{rec_id}")
    assert check_del.status_code == 404


def test_api_patient_crud():
    # Register a new patient
    new_patient = {
        "name": "Arjun Singhania",
        "age": 62,
        "gender": "Male",
        "phone": "+91 98765 43210",
        "email": "arjun.s@example.com",
        "diabeticHistory": "Type 2 Diabetes (7 yrs)",
        "hypertension": "Stage 1",
        "symptoms": "Floaters in left visual field"
    }
    post_res = client.post("/api/patients", json=new_patient)
    assert post_res.status_code == 200
    p_data = post_res.json()
    assert p_data["success"] is True
    assert p_data["data"]["name"] == "Arjun Singhania"
    assert p_data["data"]["id"].startswith("PT-2026-")

    # Fetch patients list
    get_res = client.get("/api/patients")
    assert get_res.status_code == 200
    list_data = get_res.json()
    assert list_data["success"] is True
    assert any(p["name"] == "Arjun Singhania" for p in list_data["data"])


def test_api_auth_register_and_login():
    import uuid
    test_email = f"dr.test_{uuid.uuid4().hex[:6]}@hospital.org"
    reg_payload = {
        "fullName": "Dr. Test Clinician",
        "email": test_email,
        "password": "securepassword123",
        "role": "Vitreo-Retinal Specialist",
        "department": "Retina Unit",
        "hospitalName": "Test Eye Hospital",
        "licenseNo": "REG-99128"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200
    r_data = reg_res.json()
    assert r_data["success"] is True
    assert "token" in r_data
    assert r_data["user"]["email"] == test_email
    assert r_data["user"]["fullName"] == "Dr. Test Clinician"

    # Test GET /api/auth/me with token
    me_res = client.get(f"/api/auth/me?token={r_data['token']}")
    assert me_res.status_code == 200
    m_data = me_res.json()
    assert m_data["user"]["email"] == test_email

    # Test login with registered credentials
    login_payload = {
        "email": test_email,
        "password": "securepassword123"
    }
    l_res = client.post("/api/auth/login", json=login_payload)
    assert l_res.status_code == 200
    l_data = l_res.json()
    assert l_data["success"] is True
    assert l_data["user"]["email"] == test_email

