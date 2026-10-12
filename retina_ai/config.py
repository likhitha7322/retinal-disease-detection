"""
Configuration module for Retina AI.
Provides portable paths, device selection, thresholds, and class definitions.
"""

import os
import json
import torch
from pathlib import Path

# Base Paths
PACKAGE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = PACKAGE_DIR.parent
DEFAULT_BUNDLE_DIR = PROJECT_ROOT / "model_bundle_v2.1.0"
BUNDLE_DIR = Path(os.environ.get("RETINA_MODEL_BUNDLE", DEFAULT_BUNDLE_DIR))

# Device Detection
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load Class Names
CLASSES_PATH = BUNDLE_DIR / "class_names.json"
if CLASSES_PATH.exists():
    with open(CLASSES_PATH, "r", encoding="utf-8") as f:
        CLASSES = json.load(f)
else:
    CLASSES = ["AMD", "Cataract", "Diabetic_Retinopathy", "Glaucoma", "Normal"]

# Load Gate Thresholds
GATE_THRESH_PATH = BUNDLE_DIR / "gate_thresholds.json"
if GATE_THRESH_PATH.exists():
    with open(GATE_THRESH_PATH, "r", encoding="utf-8") as f:
        GATE_THRESHOLDS = json.load(f)
else:
    GATE_THRESHOLDS = {
        "geometric": {
            "aspect_ratio_min": 0.60,
            "aspect_ratio_max": 1.50,
            "fov_ratio_min": 0.25,
            "fov_ratio_max": 1.00,
            "red_dominance_min": 0.15,
            "green_std_min": 3.0,
        },
        "learned_gate": {
            "fundus_prob_threshold": 0.50,
            "img_size": 128,
        },
        "confidence_entropy": {
            "conf_thresh": 0.4468,
            "entropy_thresh": 1.2589,
        }
    }

# Load Calibration Temperature
TEMP_PATH = BUNDLE_DIR / "calibration_temperature.json"
if TEMP_PATH.exists():
    with open(TEMP_PATH, "r", encoding="utf-8") as f:
        _temp_data = json.load(f)
        TEMPERATURE = float(_temp_data.get("temperature", 1.0))
else:
    TEMPERATURE = 1.6796

# Central CONFIG dictionary
CONFIG = {
    "version": "2.1.0",
    "device": DEVICE,
    "project_root": PROJECT_ROOT,
    "bundle_dir": BUNDLE_DIR,
    "classes": CLASSES,
    "num_classes": len(CLASSES),
    "img_size": 300,
    "seg_img_size": 256,
    "lesion_img_size": 512,
    "gate_img_size": 128,
    "temperature": TEMPERATURE,
    "gate": GATE_THRESHOLDS,
    "cataract_thresholds": {
        "laplacian_severe": 260.89,
        "laplacian_moderate": 468.59,
    },
    "amd_thresholds": {
        "early_max": 0.15,
        "intermediate_max": 0.35,
    },
    "glaucoma_cdr_thresholds": {
        "normal_max": 0.30,
        "mild_max": 0.50,
        "moderate_max": 0.70,
    },
    "dr_severity_bands": [
        "No DR",
        "Mild NPDR",
        "Moderate NPDR",
        "Severe NPDR",
        "PDR"
    ],
    "lesion_types": [
        "Microaneurysms",
        "Haemorrhages",
        "Hard Exudates",
        "Soft Exudates"
    ],
    "audit_log_path": PROJECT_ROOT / "model" / "reports" / "prediction_audit_log.jsonl",
    "report_dir": PROJECT_ROOT / "model" / "reports",
    # Glaucoma secondary clinical alert threshold
    "glaucoma_alert_threshold": 0.30,
    # CLAHE preprocessing toggle — set True to apply CLAHE at inference time.
    # Can also be overridden via RETINA_USE_CLAHE=true environment variable.
    "use_clahe": os.environ.get("RETINA_USE_CLAHE", "false").lower() == "true",
    # Test-Time Augmentation toggle — set True to average over 4 augmented views.
    # Can also be overridden via RETINA_USE_TTA=true environment variable.
    "use_tta": os.environ.get("RETINA_USE_TTA", "false").lower() == "true",
}


