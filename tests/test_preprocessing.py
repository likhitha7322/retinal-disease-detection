"""
Unit tests for preprocessing and image quality metrics.
"""

from pathlib import Path
import numpy as np
import pytest
from PIL import Image

from retina_ai.preprocessing import (
    load_for_inference, compute_clarity_metrics, bucket_cataract_severity
)
from retina_ai.config import CONFIG


def test_load_for_inference_shapes(fixtures_dir: Path):
    sample = fixtures_dir / "sample_normal.jpg"
    raw_resized, tensor, pil_img = load_for_inference(sample)

    assert raw_resized.shape == (300, 300, 3)
    assert raw_resized.dtype == np.float32
    assert 0.0 <= raw_resized.min() and raw_resized.max() <= 1.0

    assert tensor.shape == (1, 3, 300, 300)
    assert isinstance(pil_img, Image.Image)


def test_clarity_metrics(fixtures_dir: Path):
    sample = fixtures_dir / "sample_cataract.jpg"
    metrics = compute_clarity_metrics(sample)

    assert "laplacian_variance" in metrics
    assert "vessel_edge_contrast" in metrics
    assert "contrast_std" in metrics

    assert metrics["laplacian_variance"] >= 0.0
    assert metrics["vessel_edge_contrast"] >= 0.0
    assert metrics["contrast_std"] >= 0.0


def test_bucket_cataract_severity():
    thresholds = {"laplacian_severe": 260.89, "laplacian_moderate": 468.59}

    assert bucket_cataract_severity({"laplacian_variance": 100.0}, thresholds) == "severe_obscuration"
    assert bucket_cataract_severity({"laplacian_variance": 350.0}, thresholds) == "moderate_obscuration"
    assert bucket_cataract_severity({"laplacian_variance": 600.0}, thresholds) == "mild_obscuration"

