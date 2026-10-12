"""
Preprocessing and image analysis utilities for Retina AI.
"""

import io
from pathlib import Path
from typing import Union, Tuple, Dict, Any
import numpy as np
import cv2
import torch
from PIL import Image
from torchvision import transforms

from retina_ai.config import CONFIG

# Standard evaluation transform matching training
EVAL_TRANSFORMS = transforms.Compose([
    transforms.Resize((CONFIG["img_size"], CONFIG["img_size"])),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def apply_clahe(pil_img: Image.Image) -> Image.Image:
    """
    Applies Contrast-Limited Adaptive Histogram Equalization (CLAHE) to a PIL RGB image.

    CLAHE operates on the L (lightness) channel in LAB color space, so hue and
    saturation are preserved while local contrast is enhanced.  This improves
    visibility of:
      - optic disc pallor and cup boundaries (Glaucoma)
      - microaneurysms and hemorrhages in dark fundus images (DR)
      - drusen deposits (AMD)

    Args:
        pil_img: Input PIL Image in RGB mode.
    Returns:
        PIL Image with CLAHE-enhanced local contrast, still in RGB mode.
    """
    # Convert RGB → BGR for OpenCV processing
    rgb_array = np.array(pil_img)
    bgr = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2BGR)

    # Convert BGR → LAB color space; CLAHE is only applied to L (luminance)
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    # Create and apply CLAHE on the L channel only
    # clipLimit=2.0  → suppresses over-amplification of noise in uniform regions
    # tileGridSize=(8,8) → divides image into 8×8 local tiles for adaptive equalization
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l_channel)

    # Merge enhanced L back with original A and B channels
    lab_enhanced = cv2.merge([l_enhanced, a_channel, b_channel])

    # Convert LAB → BGR → RGB and return as PIL Image
    bgr_enhanced = cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)
    rgb_enhanced = cv2.cvtColor(bgr_enhanced, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb_enhanced)


# CLAHE-augmented evaluation pipeline.
# Applied before the standard Resize → ToTensor → Normalize chain.
# Toggle via CONFIG["use_clahe"] or RETINA_USE_CLAHE env var.
# The original EVAL_TRANSFORMS is preserved and used when CLAHE is disabled.
EVAL_TRANSFORMS_CLAHE = transforms.Compose([
    transforms.Lambda(apply_clahe),                                      # CLAHE local contrast enhancement
    transforms.Resize((CONFIG["img_size"], CONFIG["img_size"])),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])



GATE_TRANSFORMS = transforms.Compose([
    transforms.Resize((CONFIG["gate_img_size"], CONFIG["gate_img_size"])),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

GLAUCOMA_SEG_TRANSFORMS = transforms.Compose([
    transforms.Resize((CONFIG["seg_img_size"], CONFIG["seg_img_size"])),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

LESION_SEG_TRANSFORMS = transforms.Compose([
    transforms.Resize((CONFIG["lesion_img_size"], CONFIG["lesion_img_size"])),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def open_image(image_input: Union[str, bytes, Image.Image, Path]) -> Image.Image:
    """Safely opens an image from file path, Path object, bytes, or returns existing PIL Image."""
    if isinstance(image_input, Image.Image):
        return image_input.convert("RGB")
    elif isinstance(image_input, bytes):
        return Image.open(io.BytesIO(image_input)).convert("RGB")
    elif isinstance(image_input, (str, Path)):
        return Image.open(str(image_input)).convert("RGB")
    elif isinstance(image_input, np.ndarray):
        return Image.fromarray(image_input).convert("RGB")
    else:
        raise ValueError(f"Unsupported image input type: {type(image_input)}")


def load_for_inference(
    image_input: Union[str, bytes, Image.Image],
    device: torch.device = None
) -> Tuple[np.ndarray, torch.Tensor, Image.Image]:
    """
    Prepares an image for inference and XAI Grad-CAM.
    Returns:
        raw_resized: np.ndarray [H, W, 3] float32 in [0, 1] RGB
        tensor: torch.Tensor [1, 3, H, W] normalized on target device
        pil_img: PIL Image in RGB format
    """
    if device is None:
        device = CONFIG["device"]

    pil_img = open_image(image_input)
    np_img = np.array(pil_img)

    # Resize raw RGB for Grad-CAM overlay
    raw_resized = cv2.resize(np_img, (CONFIG["img_size"], CONFIG["img_size"])).astype(np.float32) / 255.0

    # Tensor for model inference
    tensor = EVAL_TRANSFORMS(pil_img).unsqueeze(0).to(device)

    return raw_resized, tensor, pil_img


def compute_clarity_metrics(image_input: Union[str, bytes, Image.Image, np.ndarray]) -> Dict[str, float]:
    """
    Computes image clarity metrics used as a media-clarity proxy for Cataract staging:
    - Laplacian variance (focus/sharpness)
    - Vessel-edge contrast (Sobel gradient magnitude)
    - Intensity standard deviation
    """
    if isinstance(image_input, np.ndarray):
        img_np = image_input
        if len(img_np.shape) == 3:
            gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_np
    else:
        pil_img = open_image(image_input)
        img_np = np.array(pil_img)
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)

    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    sx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    edge_mag = np.sqrt(sx**2 + sy**2)

    return {
        "laplacian_variance": round(laplacian_var, 2),
        "vessel_edge_contrast": round(float(edge_mag.mean()), 2),
        "contrast_std": round(float(gray.std()), 2)
    }


def bucket_cataract_severity(metrics: Dict[str, float], thresholds: Dict[str, float] = None) -> str:
    """Maps media clarity metrics to cataract severity bands."""
    if thresholds is None:
        thresholds = CONFIG.get("cataract_thresholds", {
            "laplacian_severe": 260.89,
            "laplacian_moderate": 468.59,
        })
    lv = metrics["laplacian_variance"]
    if lv < thresholds["laplacian_severe"]:
        return "severe_obscuration"
    elif lv < thresholds["laplacian_moderate"]:
        return "moderate_obscuration"
    return "mild_obscuration"

