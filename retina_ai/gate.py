"""
Hardened Multi-Tier Fundus Gate for Out-of-Distribution & Non-Fundus Image Rejection.

Enforces 3 layers of screening:
1. Geometric & color prefilter (aspect ratio, circular field-of-view, red dominance, green contrast)
2. Dedicated learned binary CNN classifier (FundusGateNet) trained on fundus photos vs.
   natural images, faces, selfies, documents, and screenshots.
3. Softmax confidence and prediction entropy bounds.

Fails closed: if any layer fails, the image is rejected immediately.
"""

from pathlib import Path
from typing import Union, Tuple, Dict, Any, Optional
import numpy as np
import cv2
import torch
import torch.nn as nn
from PIL import Image
from scipy.stats import entropy as scipy_entropy

from retina_ai.config import CONFIG
from retina_ai.preprocessing import open_image, GATE_TRANSFORMS


class FundusGateNet(nn.Module):
    """Compact 4-stage convolutional neural network for binary fundus vs. non-fundus verification."""
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, 3, padding=1), nn.BatchNorm2d(16), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(16, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1), nn.BatchNorm2d(128), nn.ReLU(), nn.AdaptiveAvgPool2d(1),
        )
        self.fc = nn.Linear(128, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.fc(self.features(x).flatten(1))


def load_fundus_gate_net(
    weights_path: Optional[Path] = None,
    device: Optional[torch.device] = None
) -> FundusGateNet:
    """Loads trained FundusGateNet model."""
    if device is None:
        device = CONFIG["device"]

    model = FundusGateNet().to(device)

    if weights_path is None:
        bundle_ckpt = CONFIG["bundle_dir"] / "fundus_gate.pth"
        if bundle_ckpt.exists():
            weights_path = bundle_ckpt
        else:
            weights_path = CONFIG["project_root"] / "model" / "data" / "processed" / "fundus_gate_classifier.pth"

    if Path(weights_path).exists():
        state_dict = torch.load(weights_path, map_location=device, weights_only=True)
        model.load_state_dict(state_dict)
    else:
        raise FileNotFoundError(f"Fundus gate checkpoint not found at: {weights_path}")

    model.eval()
    return model


def geometric_prefilter(image_input: Union[str, bytes, Image.Image, Path]) -> Tuple[bool, Dict[str, Any]]:
    """
    Tier 1: Geometric and color distribution validation.
    Checks:
    - aspect ratio (w/h between 0.60 and 1.55)
    - circular FOV ratio (non-black pixel ratio between 0.20 and 1.00)
    - red-to-blue channel ratio (r_mean / (b_mean + 1e-6) >= 1.10, retinal tissue strongly absorbs blue light)
    - blue channel suppression (b_mean / (r_mean + g_mean + b_mean + 1e-6) <= 0.32)
    - green channel standard deviation (>= 3.5, fundus vessels produce green contrast; solid/flat screens fail)
    - retinal hue percentage (in HSV, non-dark pixels must exhibit retinal orange-red hue >= 8%)
    """
    try:
        pil_img = open_image(image_input)
        img = np.array(pil_img)
    except Exception as e:
        return False, {"reason": f"unreadable_image: {e}"}

    if img is None or img.size == 0:
        return False, {"reason": "empty_image"}

    h, w = img.shape[:2]

    # ── Minimum pixel dimension guard ────────────────────────────────────────
    # Hard reject images smaller than 100×100 px. Fundus photos are typically
    # 1500–3000 px; anything below 100px is either a thumbnail, a black test
    # image, or a corrupted artefact — none of which should proceed to inference.
    if w < 100 or h < 100:
        return False, {
            "reason": "image_too_small",
            "width": w,
            "height": h,
            "detail": f"Image dimensions {w}×{h}px are below the 100×100px minimum required for fundus screening.",
        }

    aspect_ratio = w / h

    rgb = img if len(img.shape) == 3 else cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
    r_mean = float(rgb[..., 0].mean())
    g_mean = float(rgb[..., 1].mean())
    b_mean = float(rgb[..., 2].mean())
    tot = r_mean + g_mean + b_mean + 1e-6
    b_ratio = b_mean / tot
    r_to_b = r_mean / (b_mean + 1e-6)
    green_std = float(rgb[..., 1].std())

    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    _, mask = cv2.threshold(gray, 15, 255, cv2.THRESH_BINARY)
    fov_ratio = float(cv2.countNonZero(mask)) / (h * w)

    # Retinal Hue Analysis in HSV space
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    v_channel = hsv[..., 2]
    val_pix = v_channel > 20
    if val_pix.sum() > 0:
        h_channel = hsv[..., 0][val_pix]
        retinal_hue_pct = float(np.mean((h_channel <= 35) | (h_channel >= 155)))
    else:
        retinal_hue_pct = 0.0

    scores = {
        "aspect_ratio": round(aspect_ratio, 3),
        "fov_ratio": round(fov_ratio, 3),
        "r_to_b_ratio": round(r_to_b, 3),
        "blue_ratio": round(b_ratio, 3),
        "green_std": round(green_std, 3),
        "retinal_hue_pct": round(retinal_hue_pct, 3),
    }

    passed = (
        0.60 <= aspect_ratio <= 1.55
        and 0.20 <= fov_ratio <= 1.00
        and r_to_b >= 1.10
        and b_ratio <= 0.32
        and green_std >= 3.5
        and retinal_hue_pct >= 0.08
    )
    return passed, scores


def is_fundus_classifier(
    image_input: Union[str, bytes, Image.Image],
    gate_model: FundusGateNet,
    threshold: Optional[float] = None,
    device: Optional[torch.device] = None
) -> Tuple[bool, Dict[str, float]]:
    """
    Tier 2: Learned binary classification (Fundus vs. Non-fundus negative images).
    """
    if threshold is None:
        threshold = CONFIG["gate"]["learned_gate"]["fundus_prob_threshold"]
    if device is None:
        device = CONFIG["device"]

    pil_img = open_image(image_input)
    tensor = GATE_TRANSFORMS(pil_img).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = gate_model(tensor)
        prob = float(torch.sigmoid(logits).item())

    passed = prob >= threshold
    return passed, {"fundus_prob": round(prob, 4)}


def model_confidence_check(
    probs: np.ndarray,
    conf_thresh: Optional[float] = None,
    entropy_thresh: Optional[float] = None
) -> Tuple[bool, Dict[str, float]]:
    """
    Tier 3: Prediction confidence and Shannon entropy bounds.
    Ensures that uniform/uncertain model predictions on atypical inputs are flagged.
    """
    if conf_thresh is None:
        conf_thresh = CONFIG["gate"]["confidence_entropy"]["conf_thresh"]
    if entropy_thresh is None:
        entropy_thresh = CONFIG["gate"]["confidence_entropy"]["entropy_thresh"]

    max_prob = float(np.max(probs))
    ent = float(scipy_entropy(probs))

    passed = (max_prob >= conf_thresh) and (ent <= entropy_thresh)
    return passed, {"max_prob": round(max_prob, 4), "entropy": round(ent, 4)}


def run_fundus_gate(
    image_input: Union[str, bytes, Image.Image],
    gate_model: FundusGateNet,
    disease_probs: Optional[np.ndarray] = None
) -> Dict[str, Any]:
    """
    Runs full multi-tier fundus gate.
    Returns:
        {
            "passed": bool,
            "failed_check": Optional[str],
            "scores": Dict[str, Any],
            "reason": Optional[str]
        }
    """
    # Tier 1: Geometric checks
    geo_pass, geo_scores = geometric_prefilter(image_input)
    if not geo_pass:
        return {
            "passed": False,
            "failed_check": "geometric_prefilter",
            "reason": "Image geometry, color spectrum, or field-of-view does not match standard fundus photography.",
            "scores": geo_scores,
        }

    # Tier 2: Learned binary classifier
    clf_pass, clf_scores = is_fundus_classifier(image_input, gate_model)
    if not clf_pass:
        return {
            "passed": False,
            "failed_check": "learned_fundus_classifier",
            "reason": "Image classified as non-fundus (e.g. face photo, screenshot, external object).",
            "scores": {**geo_scores, **clf_scores},
        }

    # Tier 3: Softmax confidence & entropy check (if disease_probs provided)
    if disease_probs is not None:
        conf_pass, conf_scores = model_confidence_check(disease_probs)
        if not conf_pass:
            return {
                "passed": False,
                "failed_check": "confidence_entropy_check",
                "reason": "Model uncertainty too high (prediction entropy exceeded acceptable threshold).",
                "scores": {**geo_scores, **clf_scores, **conf_scores},
            }
        return {
            "passed": True,
            "failed_check": None,
            "reason": None,
            "scores": {**geo_scores, **clf_scores, **conf_scores},
        }

    return {
        "passed": True,
        "failed_check": None,
        "reason": None,
        "scores": {**geo_scores, **clf_scores},
    }

