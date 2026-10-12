"""
Retina AI: Clinical Decision-Support Framework for Retinal Disease Detection.
"""

__version__ = "2.1.0"

from retina_ai.config import CONFIG
from retina_ai.pipeline import RetinaPipeline, get_pipeline

__all__ = ["RetinaPipeline", "get_pipeline", "CONFIG", "__version__"]

