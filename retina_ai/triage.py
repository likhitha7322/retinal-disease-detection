"""
Clinical referral recommendation and triage risk stratification module.
"""

from typing import Dict, Any, Optional


def get_risk_tier(disease: str, confidence: float) -> str:
    """Categorizes prediction into High, Moderate, or Low risk tier."""
    if disease == "Normal":
        return "Low"
    if confidence >= 85.0:
        return "High"
    elif confidence >= 60.0:
        return "Moderate"
    return "Low"


def get_referral_recommendation(
    disease: str,
    severity: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Maps disease prediction and severity to clinical referral recommendation.
    Returns:
        {
            "referable": bool,
            "urgency": str,
            "basis": str
        }
    """
    band = (severity or {}).get("band_label")

    if disease == "Diabetic_Retinopathy":
        grade = (severity or {}).get("grade")
        if grade is not None and grade >= 2:
            return {
                "referable": True,
                "urgency": "Priority (within 2-4 weeks)",
                "basis": f"ICDR grade {grade} ('{band}') meets referral threshold (>= Moderate NPDR).",
            }
        return {
            "referable": False,
            "urgency": "Routine annual screening",
            "basis": f"ICDR grade {grade} ('{band}') is below standard referral threshold.",
        }

    if disease == "Glaucoma":
        return {
            "referable": True,
            "urgency": "Routine ophthalmology evaluation",
            "basis": f"Optic disc/cup appearance ('{band}') warrants IOP and visual field confirmation.",
        }

    if disease == "AMD":
        if band in ("intermediate", "late"):
            return {
                "referable": True,
                "urgency": "Urgent/Priority (within 1-2 weeks)" if band == "late" else "Routine (within 4-6 weeks)",
                "basis": f"Estimated AMD stage '{band}' warrants retina specialist evaluation.",
            }
        return {
            "referable": False,
            "urgency": "Routine annual screening",
            "basis": f"Estimated AMD stage '{band}' does not exceed referral threshold.",
        }

    if disease == "Cataract":
        if band in ("moderate_obscuration", "severe_obscuration"):
            return {
                "referable": True,
                "urgency": "Routine (vision-impact assessment)",
                "basis": f"Media-clarity proxy stage '{band}' suggests visually significant lens opacity.",
            }
        return {
            "referable": False,
            "urgency": "Routine annual screening",
            "basis": f"Media-clarity proxy stage '{band}' - mild opacity, routine follow-up.",
        }

    # Normal / default
    return {
        "referable": False,
        "urgency": "Routine annual screening",
        "basis": "No active retinal disease detected on screening photograph.",
    }

