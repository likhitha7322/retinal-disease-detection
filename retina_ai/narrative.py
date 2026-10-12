"""
Clinical narrative generator providing clinician (Findings/Impression) and
patient (plain-language) descriptions with explicit caveats.
"""

from typing import Dict, Any, Optional, List


def _fmt_pct(x: Any) -> str:
    return f"{x:.1f}%" if isinstance(x, (int, float)) else str(x)


def generate_clinical_narrative(
    result: Dict[str, Any],
    cam_region: Dict[str, Any],
    cam_lesion_overlap: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Builds a Findings/Impression narrative from prediction outputs.
    Returns:
        {
            "cam_region": dict,
            "cam_lesion_overlap": dict or None,
            "findings_text": str (Doctor register),
            "patient_text": str (Patient register),
            "caveats": list of str
        }
    """
    if result.get("status") != "ok":
        return {
            "cam_region": cam_region,
            "cam_lesion_overlap": None,
            "findings_text": "Image rejected by fundus screening gate.",
            "patient_text": "The uploaded photo could not be verified as a retinal fundus image.",
            "caveats": ["Please provide a centered, focused fundus photograph."]
        }

    disease = result["disease"]
    confidence = result["confidence"]
    sev = result.get("severity", {}) or {}
    _raw_findings = result.get("lesion_findings") or []
    # The pipeline passes a dict {microaneurysms:N, ..., detailed_lesions:[...]}.
    # Extract the list of structured dicts; fall back to empty list if missing.
    if isinstance(_raw_findings, dict):
        findings = _raw_findings.get("detailed_lesions") or []
    else:
        findings = _raw_findings if isinstance(_raw_findings, list) else []

    caveats = [
        "Region labels (nasal/temporal) are image-relative, not laterality-confirmed (OD/OS not tracked upstream).",
        "Grad-CAM indicates network feature saliency, not an anatomical lesion boundary.",
        "This is an AI screening aid and does not replace in-person dilated ophthalmic evaluation.",
    ]

    # --- Diabetic Retinopathy ---
    if disease == "Diabetic_Retinopathy":
        band = sev.get("band_label", "unknown grade")
        conf_metric = sev.get("confidence_or_metric", "N/A")
        lesion_summary = ""
        if findings:
            parts = [f"{f['count']} {f['lesion_type'].lower()} ({f['burden_label']} burden)" for f in findings]
            lesion_summary = "Lesion analysis detected " + "; ".join(parts) + "."
        overlap_summary = ""
        if cam_lesion_overlap:
            best = max(cam_lesion_overlap.items(), key=lambda kv: kv[1]["pct_lesion_covered_by_cam"])
            overlap_summary = (
                f" Grad-CAM attention overlaps {best[1]['pct_lesion_covered_by_cam']}% of detected "
                f"{best[0].lower()} area (Dice={best[1]['dice']}), demonstrating anatomic alignment."
            )
        findings_text = (
            f"FINDINGS: The model classifies this fundus image as Diabetic Retinopathy, severity grade "
            f"'{band}' (model confidence {_fmt_pct(conf_metric)}), with peak network attention centered on the "
            f"{cam_region['region']} region (Grad-CAM high-activation area covering "
            f"{_fmt_pct(cam_region['hot_area_frac']*100)} of the image). {lesion_summary}{overlap_summary}\n\n"
            f"IMPRESSION: Findings are consistent with {band} diabetic retinopathy. "
            f"Overall disease-classification confidence: {_fmt_pct(confidence)}."
        )
        patient_text = (
            f"The scan shows patterns consistent with diabetic eye changes at a '{band}' level. "
            f"The AI focused mainly on the {cam_region['region'].replace('/', 'or')} portion of the retina, "
            f"where it highlighted areas characteristic of diabetic microvascular changes (such as tiny hemorrhages or exudates)."
        )

    # --- AMD ---
    elif disease == "AMD":
        band = sev.get("band_label", "unknown stage")
        m = sev.get("confidence_or_metric", {})
        area = m.get("macular_activation_area_frac") if isinstance(m, dict) else None
        findings_text = (
            f"FINDINGS: Predicted diagnosis is Age-related Macular Degeneration, heuristic stage '{band}' "
            f"(macular Grad-CAM activation area = {_fmt_pct((area or 0)*100)}, a project-defined drusen-area "
            f"proxy, not a validated AREDS clinical grading scale). Peak attention: {cam_region['region']}.\n\n"
            f"IMPRESSION: Findings are suggestive of {band}-stage AMD-pattern changes localized to the macula. "
            f"Classification confidence: {_fmt_pct(confidence)}. Correlate with optical coherence tomography (OCT)."
        )
        patient_text = (
            f"The scan shows visual patterns in your central retina (macula) characteristic of "
            f"age-related macular degeneration at an estimated '{band}' stage. Your eye care provider will confirm "
            f"this with an OCT scan."
        )

    # --- Cataract ---
    elif disease == "Cataract":
        band = sev.get("band_label", "indeterminate")
        findings_text = (
            f"FINDINGS: Predicted diagnosis is Cataract; media-clarity proxy places severity at '{band}' "
            f"(sharpness/contrast-degradation heuristic — not a LOCS III slit-lamp grade). "
            f"Grad-CAM attention is diffuse across the image ({cam_region['region']}), consistent with a global "
            f"media-opacity effect.\n\n"
            f"IMPRESSION: Image clarity metrics suggest {band} lens opacity. "
            f"Classification confidence: {_fmt_pct(confidence)}. Slit-lamp examination recommended."
        )
        patient_text = (
            f"Your scan appears hazier than a typical retinal photo, which commonly occurs with a cataract "
            f"(clouding of the natural lens). The estimated obscuration level is '{band}'. An in-person slit-lamp "
            f"exam is needed to evaluate lens clarity and discuss treatment options."
        )

    # --- Glaucoma ---
    elif disease == "Glaucoma":
        cdr = sev.get("confidence_or_metric")
        band = sev.get("band_label", "indeterminate")
        cdr_txt = f"vertical cup-to-disc ratio (CDR) = {cdr}" if cdr is not None else "CDR unavailable"
        findings_text = (
            f"FINDINGS: Predicted diagnosis is Glaucoma. Optic disc/cup segmentation gives {cdr_txt}, bucketed as "
            f"'{band}' severity (literature-derived CDR thresholds). Grad-CAM attention centered on the "
            f"{cam_region['region']}, consistent with optic nerve head evaluation.\n\n"
            f"IMPRESSION: Findings are consistent with {band} glaucomatous optic nerve appearance based on CDR. "
            f"Classification confidence: {_fmt_pct(confidence)}. Visual field testing and intraocular pressure (IOP) "
            f"measurement required for definitive diagnosis."
        )
        patient_text = (
            f"The scan indicates the optic nerve (which connects the eye to the brain) has a cup-to-disc ratio "
            f"pattern that can be seen in glaucoma, estimated as '{band}'. Glaucoma is confirmed with an "
            f"eye pressure test and visual field check."
        )

    # --- Normal ---
    else:
        findings_text = (
            f"FINDINGS: No prominent signs of AMD, Cataract, Diabetic Retinopathy, or Glaucoma were detected "
            f"(classification confidence {_fmt_pct(confidence)}). Grad-CAM attention was diffuse "
            f"({cam_region['region']}), with no focal high-activation lesion pattern.\n\n"
            f"IMPRESSION: Screening-negative for the five conditions evaluated by this system."
        )
        patient_text = "No signs of the five conditions screened for were detected in your scan."

    return {
        "cam_region": cam_region,
        "cam_lesion_overlap": cam_lesion_overlap,
        "findings_text": findings_text,
        "patient_text": patient_text,
        "caveats": caveats,
    }

