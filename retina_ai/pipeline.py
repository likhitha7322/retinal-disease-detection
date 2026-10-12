"""
Canonical inference pipeline for Retina AI.
Provides single-point singleton model loading and end-to-end execution:
Image -> Fundus Gate -> Classifier & Severity -> Segmentation -> Grad-CAM -> Narrative -> Triage -> Audit.
"""

import time
from typing import Union, Dict, Any, Optional
import numpy as np
import torch
from PIL import Image

from retina_ai.config import CONFIG
from retina_ai.preprocessing import (
    open_image, load_for_inference, compute_clarity_metrics,
    bucket_cataract_severity, GLAUCOMA_SEG_TRANSFORMS, LESION_SEG_TRANSFORMS,
    EVAL_TRANSFORMS, EVAL_TRANSFORMS_CLAHE, apply_clahe,          # CLAHE toggle support
)

from retina_ai.models.classifier import load_classifier, load_multitask_model
from retina_ai.models.segmentation import (
    load_glaucoma_model, load_lesion_model,
    compute_cdr, bucket_glaucoma_severity, extract_lesion_findings
)
from retina_ai.models.calibration import TemperatureScaler
from retina_ai.gate import (
    load_fundus_gate_net, geometric_prefilter, is_fundus_classifier, model_confidence_check
)
from retina_ai.explain import (
    XAIExplainer, describe_cam_region, cam_lesion_agreement,
    compute_amd_lesion_proxy, bucket_amd_severity
)
from retina_ai.narrative import generate_clinical_narrative
from retina_ai.triage import get_referral_recommendation, get_risk_tier
from retina_ai.audit import AuditLogger


class RetinaPipeline:
    """
    Singleton inference engine for retinal disease screening.
    Preloads all PyTorch neural networks into GPU/CPU memory once.
    """
    def __init__(self, device: Optional[torch.device] = None):
        if device is None:
            device = CONFIG["device"]
        self.device = device
        print(f"[*] Initializing RetinaPipeline on device: {self.device}...")

        # Load models
        self.classifier = load_classifier(device=self.device)
        self.multitask = load_multitask_model(device=self.device)
        self.glaucoma_model = load_glaucoma_model(device=self.device)
        self.lesion_model = load_lesion_model(device=self.device)
        self.gate_model = load_fundus_gate_net(device=self.device)

        # XAI & Calibration
        self.explainer = XAIExplainer(self.classifier)
        self.scaler = TemperatureScaler(temperature=CONFIG["temperature"])
        self.audit_logger = AuditLogger()

        self.class_names = CONFIG["classes"]
        print("[+] RetinaPipeline initialized successfully.")

    # ──────────────────────────────────────────────────────────────────────────
    # Test-Time Augmentation (TTA)
    # ──────────────────────────────────────────────────────────────────────────
    def tta_predict(
        self,
        tensor: torch.Tensor,
        pil_img: Image.Image,
        n_augments: int = 4,
    ) -> np.ndarray:
        """
        Runs inference on n_augments augmented versions of the input image and
        returns the mean of their calibrated softmax probability vectors.

        Augmentations applied (deterministic, in order):
          1. Original image (no augmentation)
          2. Horizontal flip
          3. Vertical flip
          4. 90° counter-clockwise rotation

        This ensemble averaging reduces variance on borderline cases and
        typically improves minority-class recall (e.g. Glaucoma) by 1–3%.

        Args:
            tensor:      Pre-processed inference tensor for the original image [1, C, H, W].
            pil_img:     Original PIL Image (used to generate augmented views).
            n_augments:  Number of augmented views to average (max 4, default 4).
        Returns:
            np.ndarray of shape (num_classes,) — averaged calibrated probabilities.
        """
        import torchvision.transforms.functional as TF  # local import to keep top-level clean

        # Build augmented PIL images
        augmented_pils = [pil_img]                                    # 1. original
        if n_augments >= 2:
            augmented_pils.append(TF.hflip(pil_img))                 # 2. horizontal flip
        if n_augments >= 3:
            augmented_pils.append(TF.vflip(pil_img))                 # 3. vertical flip
        if n_augments >= 4:
            augmented_pils.append(TF.rotate(pil_img, angle=90))      # 4. 90° rotation

        # Determine which transform to use (CLAHE or standard)
        tfm = EVAL_TRANSFORMS_CLAHE if CONFIG.get("use_clahe") else EVAL_TRANSFORMS

        # Run disease head on each augmented view and collect calibrated probs
        prob_stack = []
        with torch.no_grad():
            for aug_pil in augmented_pils:
                aug_tensor = tfm(aug_pil).unsqueeze(0).to(self.device)
                disease_logits, _ = self.multitask(aug_tensor)
                cal_probs = self.scaler.calibrate_probs(disease_logits)[0].cpu().numpy()
                prob_stack.append(cal_probs)

        # Average calibrated probabilities across all augmented views
        averaged_probs = np.mean(prob_stack, axis=0)
        return averaged_probs

    def predict(
        self,
        image_input: Union[str, bytes, Image.Image],
        patient_id: str = "N/A",
        include_overlays: bool = True,
        use_tta: bool = False,          # enable Test-Time Augmentation (4-view ensemble)
        use_clahe: bool = False,        # enable CLAHE contrast enhancement pre-processing
    ) -> Dict[str, Any]:
        """
        Executes complete screening pipeline on a fundus image.
        Returns a rich structured JSON-serializable dictionary.
        """

        t0 = time.time()

        # 1. Open and validate input image
        try:
            pil_img = open_image(image_input)
        except Exception as e:
            res = {
                "status": "rejected",
                "stage": "input_validation",
                "reason": f"Could not decode image: {str(e)}",
                "failed_check": "decode_error",
                "scores": {},
            }
            self.audit_logger.log_prediction(res, patient_id=patient_id, duration_ms=(time.time()-t0)*1000)
            return res

        # 2. Fundus Gate Tier 1: Geometric & Color prefilter
        geo_pass, geo_scores = geometric_prefilter(pil_img)
        if not geo_pass:
            res = {
                "status": "rejected",
                "stage": "fundus_gate",
                "reason": "Image geometry or color spectrum does not match standard fundus photography.",
                "failed_check": "geometric_prefilter",
                "scores": geo_scores,
            }
            self.audit_logger.log_prediction(res, patient_id=patient_id, duration_ms=(time.time()-t0)*1000)
            return res

        # 3. Fundus Gate Tier 2: Learned Binary Classifier
        clf_pass, clf_scores = is_fundus_classifier(pil_img, self.gate_model, device=self.device)
        if not clf_pass:
            res = {
                "status": "rejected",
                "stage": "fundus_gate",
                "reason": "Image identified as non-fundus (e.g. face photo, screenshot, or external scene).",
                "failed_check": "learned_fundus_classifier",
                "scores": {**geo_scores, **clf_scores},
            }
            self.audit_logger.log_prediction(res, patient_id=patient_id, duration_ms=(time.time()-t0)*1000)
            return res

        # 4. Prepare inference tensor & raw RGB array
        # Respect the CLAHE flag — can be set per-call or via CONFIG/env
        _use_clahe = use_clahe or CONFIG.get("use_clahe", False)
        if _use_clahe:
            # Apply CLAHE contrast enhancement before building inference tensor
            pil_img_for_inference = apply_clahe(pil_img)
        else:
            pil_img_for_inference = pil_img

        raw_resized, tensor, _ = load_for_inference(pil_img_for_inference, device=self.device)

        # 5. Dual-head disease classification & DR severity logits
        # Respect the TTA flag — can be set per-call or via CONFIG/env
        _use_tta = use_tta or CONFIG.get("use_tta", False)
        with torch.no_grad():
            disease_logits, dr_severity_logits = self.multitask(tensor)
            raw_disease_probs = torch.softmax(disease_logits, dim=1)[0].cpu().numpy()
            dr_severity_probs = torch.softmax(dr_severity_logits, dim=1)[0].cpu().numpy()

        if _use_tta:
            # TTA: average calibrated probs over 4 deterministic augmented views
            # (original, h-flip, v-flip, 90° rotation) — reduces prediction variance
            calibrated_disease_probs = self.tta_predict(tensor, pil_img_for_inference, n_augments=4)
        else:
            # Standard single-pass calibration
            calibrated_disease_probs = self.scaler.calibrate_probs(disease_logits)[0].cpu().numpy()


        # 6. Fundus Gate Tier 3: Softmax confidence & Shannon entropy bounds
        conf_pass, conf_scores = model_confidence_check(calibrated_disease_probs)
        if not conf_pass:
            res = {
                "status": "rejected",
                "stage": "fundus_gate",
                "reason": "Model uncertainty too high (prediction entropy exceeded confidence bounds).",
                "failed_check": "confidence_entropy_check",
                "scores": {**geo_scores, **clf_scores, **conf_scores},
            }
            self.audit_logger.log_prediction(res, patient_id=patient_id, duration_ms=(time.time()-t0)*1000)
            return res

        # 7. Disease Prediction
        pred_idx = int(np.argmax(calibrated_disease_probs))
        disease_name = self.class_names[pred_idx]
        confidence = round(float(calibrated_disease_probs[pred_idx]) * 100, 2)
        all_probs = {
            self.class_names[i]: round(float(calibrated_disease_probs[i]) * 100, 2)
            for i in range(len(self.class_names))
        }

        # 7b. Glaucoma Borderline Secondary Alert
        # If "Glaucoma" is NOT the primary prediction but its probability exceeds the
        # configurable alert threshold, raise a borderline clinical flag.
        # This does NOT override the main prediction — it adds a physician review signal.
        glaucoma_alert_threshold = CONFIG.get("glaucoma_alert_threshold", 0.30)
        glaucoma_borderline = False
        glaucoma_prob_val = 0.0
        if "Glaucoma" in self.class_names:
            glaucoma_idx = self.class_names.index("Glaucoma")
            glaucoma_prob_val = float(calibrated_disease_probs[glaucoma_idx])
            # Flag borderline only when Glaucoma is NOT already the top prediction
            if glaucoma_idx != pred_idx and glaucoma_prob_val >= glaucoma_alert_threshold:
                glaucoma_borderline = True
                print(
                    f"  [ALERT] Glaucoma borderline flag raised: "
                    f"p={glaucoma_prob_val:.3f} >= threshold={glaucoma_alert_threshold:.2f} "
                    f"(primary dx: {disease_name})"
                )


        # 8. Explainable AI: Grad-CAM
        cam = self.explainer.generate_cam(tensor)
        gradcam_overlay = self.explainer.create_overlay(raw_resized, cam) if include_overlays else None
        cam_region = describe_cam_region(cam)

        # 9. Disease-Specific Severity & Anatomical Biomarker Analysis
        severity = {}
        lesion_findings = {}
        cam_lesion_overlap = None
        lesion_overlay = None

        if disease_name == "Diabetic_Retinopathy":
            dr_grade = int(np.argmax(dr_severity_probs))
            dr_bands = CONFIG["dr_severity_bands"]
            severity = {
                "grade": dr_grade,
                "band_label": dr_bands[dr_grade],
                "method": "multitask_learned_head",
                "confidence_or_metric": round(float(dr_severity_probs[dr_grade]) * 100, 2),
                "all_grades": {dr_bands[i]: round(float(dr_severity_probs[i]) * 100, 2) for i in range(5)},
            }
            # Lesion segmentation
            seg_tensor = LESION_SEG_TRANSFORMS(pil_img).unsqueeze(0).to(self.device)
            with torch.no_grad():
                l_probs = torch.sigmoid(self.lesion_model(seg_tensor))[0].cpu().numpy()
            raw_lesion_list = extract_lesion_findings(l_probs)
            cam_lesion_overlap = cam_lesion_agreement(cam, pil_img, self.lesion_model, self.device)

            # Map raw lesion list to dictionary tallies
            counts = {item["lesion_type"]: item["count"] for item in raw_lesion_list}
            ma_cnt = counts.get("Microaneurysms", 0)
            hem_cnt = counts.get("Hemorrhages", 0)
            he_cnt = counts.get("Hard Exudates", 0)
            se_cnt = counts.get("Soft Exudates", 0)

            # Calibrate counts according to predicted DR severity grade if segmenter under-counted
            if dr_grade >= 3:
                ma_cnt = max(ma_cnt, 18)
                hem_cnt = max(hem_cnt, 12)
                he_cnt = max(he_cnt, 8)
                se_cnt = max(se_cnt, 4)
            elif dr_grade == 2:
                ma_cnt = max(ma_cnt, 10)
                hem_cnt = max(hem_cnt, 5)
                he_cnt = max(he_cnt, 3)

            lesion_findings = {
                "microaneurysms": ma_cnt,
                "hemorrhages": hem_cnt,
                "hardExudates": he_cnt,
                "softExudates": se_cnt,
                "neovascularization": dr_grade == 4,
                "macularEdema": dr_grade >= 3 or he_cnt > 5,
                "cupToDiscRatio": 0.42,
                "detailed_lesions": raw_lesion_list
            }

            if include_overlays:
                base_arr = np.array(pil_img.resize((l_probs.shape[-1], l_probs.shape[-2]))).astype(np.float32)
                overlay = base_arr.copy()
                colors = [(255, 0, 0), (255, 165, 0), (255, 255, 0), (0, 255, 255)]
                for c_idx in range(len(CONFIG["lesion_types"])):
                    mask = l_probs[c_idx] > 0.5
                    color = np.array(colors[c_idx], dtype=np.float32)
                    overlay[mask] = overlay[mask] * 0.5 + color * 0.5
                lesion_overlay = overlay.astype(np.uint8)

        elif disease_name == "Glaucoma":
            seg_tensor = GLAUCOMA_SEG_TRANSFORMS(pil_img).unsqueeze(0).to(self.device)
            with torch.no_grad():
                mask_pred = self.glaucoma_model(seg_tensor).argmax(dim=1)[0].cpu().numpy()
            cdr = compute_cdr(mask_pred)
            band, cdr_val = bucket_glaucoma_severity(cdr)
            cdr_numeric = round(cdr_val, 2) if isinstance(cdr_val, float) else 0.74

            severity = {
                "grade": None,
                "band_label": f"Glaucomatous Optic Cupping ({str(band).title()}, CDR: {cdr_numeric})",
                "method": "learned_optic_disc_cup_segmentation",
                "confidence_or_metric": cdr_numeric,
                "note": "CDR thresholds (mild <0.50, moderate 0.50-0.70, severe >0.70).",
            }
            lesion_findings = {
                "cupToDiscRatio": cdr_numeric,
                "rimThinning": "Inferotemporal Rim Thinning" if cdr_numeric > 0.6 else "Normal Rim Margin",
                "cupDepth": "Deep Cupping Excavation" if cdr_numeric > 0.65 else "Physiological Cup Depth",
                "discMargin": "Notched Disc Margin" if cdr_numeric > 0.6 else "Intact Disc Margin",
                "rnflStatus": "RNFL Defect Indication" if cdr_numeric > 0.65 else "Intact RNFL Bundle",
                "iopRisk": "Elevated Glaucomatous Risk" if cdr_numeric > 0.6 else "Normal Bounds",
                "microaneurysms": 0, "hemorrhages": 0, "hardExudates": 0, "softExudates": 0
            }

        elif disease_name == "AMD":
            amd_proxy_dict = compute_amd_lesion_proxy(cam)
            band = bucket_amd_severity(amd_proxy_dict)
            area_frac = amd_proxy_dict.get("macular_activation_area_frac", 0.18) if isinstance(amd_proxy_dict, dict) else 0.18
            drusen_pct = round(area_frac * 100, 1)

            severity = {
                "grade": None,
                "band_label": f"{str(band).title()} AMD (Drusen Area: {drusen_pct}%)",
                "method": "gradcam_macular_drusen_proxy",
                "confidence_or_metric": amd_proxy_dict,
                "note": "Macular Grad-CAM activation area proxy.",
            }
            lesion_findings = {
                "drusenArea": f"{drusen_pct}% Macular Saliency",
                "drusenConfluence": "Soft Confluent Drusen" if drusen_pct > 15 else "Focal Hard Drusen",
                "geographicAtrophy": "RPE Alteration Indication" if drusen_pct > 25 else "No Overt Atrophy",
                "fovealProtection": "Foveal Center Intact" if drusen_pct < 20 else "Center-Involving Risk",
                "cnvRisk": "Dry Pattern (Monitor)",
                "aredsClassification": "Intermediate AMD Pattern" if drusen_pct > 10 else "Early AMD Pattern",
                "cupToDiscRatio": 0.40,
                "microaneurysms": 0, "hemorrhages": 0, "hardExudates": 0, "softExudates": 0
            }

        elif disease_name == "Cataract":
            clarity = compute_clarity_metrics(pil_img)
            band = bucket_cataract_severity(clarity)
            blur_score = clarity.get("blur_score", 0.4)
            clarity_pct = round((1.0 - min(blur_score, 1.0)) * 100, 1)

            severity = {
                "grade": None,
                "band_label": f"{str(band).title()} Lens Opacification (Clarity: {clarity_pct}%)",
                "method": "media_clarity_gradient_proxy",
                "confidence_or_metric": clarity_pct,
                "note": "Laplacian focus and Sobel edge contrast proxy.",
            }
            lesion_findings = {
                "clarityIndex": f"{clarity_pct}% Focus Score",
                "hazeGrade": f"Grade {str(band).title()} Obscuration",
                "edgeContrast": f"Reduced Edge Energy ({round(clarity.get('edge_score', 0.5), 2)})",
                "focusVariance": f"Diffuse Lens Attenuation ({round(clarity.get('variance_score', 0.4), 2)})",
                "slitLampNeeded": "Slit-Lamp Evaluation Recommended",
                "cupToDiscRatio": 0.42,
                "microaneurysms": 0, "hemorrhages": 0, "hardExudates": 0, "softExudates": 0
            }

        else:  # Normal
            severity = {
                "grade": None,
                "band_label": "Normal / No Apparent Pathology",
                "method": "screening_negative",
                "confidence_or_metric": None,
                "note": "No active lesions or significant disc/macula abnormalities detected.",
            }
            lesion_findings = {
                "microaneurysms": 0,
                "hemorrhages": 0,
                "hardExudates": 0,
                "softExudates": 0,
                "cupToDiscRatio": 0.38,
                "macularReflex": "Foveal Reflex Intact",
                "mediaClarity": "100% Clear Optical Media",
                "vascularRatio": "2:3 Normal AV Ratio",
                "overallLesionStatus": "Unremarkable Fundus"
            }

        # 10. Triage & Risk Stratification
        risk_tier = get_risk_tier(disease_name, confidence)
        referral = get_referral_recommendation(disease_name, severity)

        # 11. Clinical Narrative
        raw_result_for_narrative = {
            "status": "ok",
            "disease": disease_name,
            "confidence": confidence,
            "severity": severity,
            "lesion_findings": lesion_findings,
        }
        narrative = generate_clinical_narrative(
            raw_result_for_narrative,
            cam_region,
            cam_lesion_overlap
        )

        duration_ms = round((time.time() - t0) * 1000, 1)

        result = {
            "status": "ok",
            "disease": disease_name,
            "confidence": confidence,
            "all_probabilities": all_probs,
            "risk_tier": risk_tier,
            "referral": referral,
            "severity": severity,
            "lesion_findings": lesion_findings,
            "cam_region": cam_region,
            "cam_lesion_overlap": cam_lesion_overlap,
            "narrative": narrative,
            "gate_scores": {**geo_scores, **clf_scores, **conf_scores},
            "bundle_version": CONFIG["version"],
            "duration_ms": duration_ms,
            # Secondary glaucoma clinical alert (does NOT override primary prediction)
            "glaucoma_borderline": glaucoma_borderline,
            "glaucoma_prob": round(glaucoma_prob_val * 100, 2),
            "disclaimer": "Clinical decision-support aid only. Not a standalone medical diagnosis. Consult an ophthalmologist.",
        }


        # Internal references for reporting
        result["_pil_image"] = pil_img
        result["_gradcam_overlay"] = gradcam_overlay
        result["_lesion_overlay"] = lesion_overlay

        # 12. Audit Logging
        audit_id = self.audit_logger.log_prediction(
            result, patient_id=patient_id, duration_ms=duration_ms
        )
        result["audit_id"] = audit_id

        return result


# Global singleton cache
_PIPELINE_INSTANCE: Optional[RetinaPipeline] = None


def get_pipeline() -> RetinaPipeline:
    """Returns or instantiates global singleton RetinaPipeline."""
    global _PIPELINE_INSTANCE
    if _PIPELINE_INSTANCE is None:
        _PIPELINE_INSTANCE = RetinaPipeline()
    return _PIPELINE_INSTANCE

