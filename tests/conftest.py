"""
Pytest configuration and fixtures for Retina AI test suite.
"""

import pytest
from pathlib import Path
from retina_ai.pipeline import get_pipeline, RetinaPipeline

@pytest.fixture(scope="session")
def fixtures_dir() -> Path:
    return Path(__file__).resolve().parent / "fixtures"

@pytest.fixture(scope="session")
def pipeline() -> RetinaPipeline:
    return get_pipeline()

