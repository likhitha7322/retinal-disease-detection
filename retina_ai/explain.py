"""
Explainable AI (XAI) module for Retina AI.
Provides Grad-CAM visualization, anatomical region description, CAM/lesion agreement metrics,
and AMD drusen-area proxy estimation.
"""

from typing import Dict, Any, Optional, Tuple
import numpy as np
import cv2
import torch
import torch.nn as nn
from PIL import Image
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

from retina_ai.config import CONFIG
from retina_ai.preprocessing import open_image, LESION_SEG_TRANSFORMS

FUNDUS_REGIONS_3X3 = [
    ["superonasal", "superior", "superotemporal"],
    ["nasal",       "macular / central", "temporal"],
    ["inferonasal", "inferior", "inferotemporal"],
]


class XAIExplainer:
    """Manages Grad-CAM computation and overlay generation for the classifier backbone."""
    def __init__(self, model: nn.Module, target_layer: Optional[nn.Module] = None):
        if target_layer is None:
            # EfficientNet-B3 conv_head
            if hasattr(model, "backbone") and hasattr(model.backbone, "conv_head"):
                target_layer = model.backbone.conv_head
            elif hasattr(model, "conv_head"):
                target_layer = model.conv_head
            else:
                target_layer = list(model.modules())[-3]

        self.gradcam = GradCAM(model=model, target_layers=[target_layer])

    def generate_cam(self, tensor: torch.Tensor) -> np.ndarray:
        """Generates 2D Grad-CAM heatmap float32 in [0, 1]."""
        cam = self.gradcam(input_tensor=tensor)[0]
        return cam

    def create_overlay(self, raw_resized: np.ndarray, cam: np.ndarray) -> np.ndarray:
        """Generates RGB overlay image uint8."""
        overlay = show_cam_on_image(raw_resized, cam, use_rgb=True)
        return overlay


def describe_cam_region(cam: np.ndarray, macula_frac: float = 0.30) -> Dict[str, Any]:
    """
    Maps Grad-CAM activation centroid to anatomical fundus region.
    Note: Coordinates are image-frame relative.
    """
    cam_arr = np.asarray(cam)
    h, w = cam_arr.shape
    thresh = cam_arr.max() * 0.7 if cam_arr.max() > 0 else 0
    ys, xs = np.where(cam_arr >= thresh)

    if len(xs) == 0:
        return {
            "region": "diffuse / indeterminate",
            "centroid_frac": (0.5, 0.5),
            "hot_area_frac": 0.0,
        }

    cy, cx = float(ys.mean() / h), float(xs.mean() / w)
    row = 1 if abs(cy - 0.5) <= macula_frac else (0 if cy < 0.5 else 2)
    col = 1 if abs(cx - 0.5) <= macula_frac else (0 if cx < 0.5 else 2)
    region = FUNDUS_REGIONS_3X3[row][col]
    hot_area_frac = float((cam_arr >= thresh).mean())

    return {
        "region": region,
        "centroid_frac": (round(cy, 3), round(cx, 3)),
        "hot_area_frac": round(hot_area_frac, 3),
    }


def cam_lesion_agreement(
    cam: np.ndarray,
    image_input: Any,
    lesion_model: nn.Module,
    device: torch.device,
    cam_thresh_pct: float = 70.0
) -> Optional[Dict[str, Any]]:
    """
    Computes Dice, IoU, and % lesion covered by CAM between Grad-CAM hot zone and segmented lesion masks.
    """
    pil_img = open_image(image_input)
    tensor = LESION_SEG_TRANSFORMS(pil_img).unsqueeze(0).to(device)

    with torch.no_grad():
        lesion_probs = torch.sigmoid(lesion_model(tensor))[0].cpu().numpy()

    cam_resized = cv2.resize(cam.astype(np.float32), (lesion_probs.shape[-1], lesion_probs.shape[-2]))
    cam_bin = cam_resized >= (cam_resized.max() * (cam_thresh_pct / 100.0)) if cam_resized.max() > 0 else cam_resized > 2

    results = {}
    for c, lesion_type in enumerate(CONFIG["lesion_types"]):
        lesion_bin = lesion_probs[c] > 0.5
        inter = np.logical_and(cam_bin, lesion_bin).sum()
        union = np.logical_or(cam_bin, lesion_bin).sum()
        lesion_area = lesion_bin.sum()

        if lesion_area == 0:
            continue

        dice = (2.0 * inter) / (cam_bin.sum() + lesion_bin.sum() + 1e-9)
        iou = inter / (union + 1e-9)
        pct_lesion_covered = inter / (lesion_area + 1e-9)

        results[lesion_type] = {
            "dice": round(float(dice), 3),
            "iou": round(float(iou), 3),
            "pct_lesion_covered_by_cam": round(float(pct_lesion_covered) * 100, 1),
        }

    return results if results else None


def compute_amd_lesion_proxy(cam: np.ndarray) -> Dict[str, float]:
    """
    Measures macular Grad-CAM activation area fraction & intensity as proxy for AMD drusen burden.
    """
    h, w = cam.shape
    cy0, cy1 = int(h * 0.3), int(h * 0.7)
    cx0, cx1 = int(w * 0.3), int(w * 0.7)
    region = cam[cy0:cy1, cx0:cx1]

    return {
        "macular_activation_area_frac": round(float((region > 0.5).mean()), 4),
        "macular_activation_intensity": round(float(region.mean()), 4),
    }


def bucket_amd_severity(proxy_metrics: Dict[str, float], thresholds: Optional[Dict[str, float]] = None) -> str:
    """Maps macular activation area to heuristic AMD stage."""
    if thresholds is None:
        thresholds = CONFIG.get("amd_thresholds", {
            "early_max": 0.15,
            "intermediate_max": 0.35,
        })
    area = proxy_metrics.get("macular_activation_area_frac", 0.0)
    if area < thresholds["early_max"]:
        return "early"
    elif area < thresholds["intermediate_max"]:
        return "intermediate"
    return "late"

