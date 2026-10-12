"""
Unit tests for the multi-tier fundus gate.
"""

from pathlib import Path
import numpy as np
import pytest
from PIL import Image

from retina_ai.gate import geometric_prefilter, is_fundus_classifier, run_fundus_gate, load_fundus_gate_net


def test_geometric_prefilter_valid_fundus(fixtures_dir: Path):
    fundus_path = fixtures_dir / "sample_normal.jpg"
    passed, scores = geometric_prefilter(fundus_path)
    assert passed is True, f"Valid fundus failed geometric prefilter: {scores}"
    assert 0.60 <= scores["aspect_ratio"] <= 1.55
    assert scores["fov_ratio"] >= 0.20
    assert scores["r_to_b_ratio"] >= 1.10
    assert scores["blue_ratio"] <= 0.32


def test_geometric_prefilter_invalid_black_image():
    black_img = Image.new("RGB", (300, 300), color=(0, 0, 0))
    passed, scores = geometric_prefilter(black_img)
    assert passed is False


def test_geometric_prefilter_invalid_noise_and_colors():
    # Random noise
    rand_arr = np.random.randint(0, 255, (300, 300, 3), dtype=np.uint8)
    passed, _ = geometric_prefilter(rand_arr)
    assert passed is False, "Random noise must be rejected by geometric prefilter"

    # Solid white
    white_arr = np.full((300, 300, 3), 255, dtype=np.uint8)
    passed, _ = geometric_prefilter(white_arr)
    assert passed is False, "Solid white screen must be rejected"

    # Solid blue
    blue_arr = np.full((300, 300, 3), [20, 50, 220], dtype=np.uint8)
    passed, _ = geometric_prefilter(blue_arr)
    assert passed is False, "Blue image must be rejected"


def test_geometric_prefilter_extreme_aspect_ratio():
    banner_img = Image.new("RGB", (1000, 100), color=(180, 50, 40))
    passed, scores = geometric_prefilter(banner_img)
    assert passed is False
    assert scores["aspect_ratio"] == 10.0


def test_learned_gate_on_negative_sample(fixtures_dir: Path, pipeline):
    neg_path = fixtures_dir / "sample_negative.jpg"
    if neg_path.exists():
        gate_res = run_fundus_gate(neg_path, pipeline.gate_model)
        assert gate_res["passed"] is False, "Negative face/natural image must be rejected by fundus gate!"
        assert gate_res["failed_check"] in ("geometric_prefilter", "learned_fundus_classifier")


def test_fundus_gate_on_valid_fundus(fixtures_dir: Path, pipeline):
    fundus_path = fixtures_dir / "sample_normal.jpg"
    gate_res = run_fundus_gate(fundus_path, pipeline.gate_model)
    assert gate_res["passed"] is True
    assert gate_res["failed_check"] is None
