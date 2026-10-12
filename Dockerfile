# ==============================================================================
# RetinaVision AI — Production Dockerfile
# Target: Hugging Face Spaces (Docker SDK, port 8000, uid 1000)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build React/Vite SPA
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY retinavision-ai/frontend/package*.json ./
RUN npm ci --prefer-offline

COPY retinavision-ai/frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Python AI Inference Engine + Web Server (CPU-only PyTorch)
# ------------------------------------------------------------------------------
FROM python:3.12-slim

# System libs: OpenCV headless needs libglib; curl for health probe
RUN apt-get update && apt-get install -y --no-install-recommends \
        libglib2.0-0 \
        libgomp1 \
        curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Python dependencies ───────────────────────────────────────────────────────
# 1. CPU-only PyTorch wheels (~600 MB vs 2.5 GB CUDA build)
RUN pip install --no-cache-dir \
        torch==2.5.1+cpu \
        torchvision==0.20.1+cpu \
        --extra-index-url https://download.pytorch.org/whl/cpu

# 2. All other pinned requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Application source ────────────────────────────────────────────────────────
COPY retina_ai/ ./retina_ai/
COPY model_bundle_v2.1.0/ ./model_bundle_v2.1.0/
COPY pyproject.toml ./

# Install retina_ai package (editable but no deps — already installed above)
RUN pip install --no-cache-dir -e . --no-deps

# ── Compiled frontend from Stage 1 ────────────────────────────────────────────
COPY --from=frontend-builder /app/frontend/dist ./retinavision-ai/frontend/dist

# ── Runtime directories (writable by non-root user) ───────────────────────────
# HF Spaces runs containers as uid 1000 by default.
# These dirs store ephemeral uploads, SQLite DB, and generated PDF reports.
# NOTE: On Hugging Face Spaces all data in /app is EPHEMERAL — it is wiped
# on every restart. Use a Persistent Storage volume if you need durability.
RUN mkdir -p /app/data /app/uploads /app/reports && \
    useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

# ── Environment ───────────────────────────────────────────────────────────────
ENV RETINA_MODEL_BUNDLE=/app/model_bundle_v2.1.0 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    # Configurable upload retention (seconds). Default = 86400 = 24 h.
    UPLOAD_RETENTION_SECONDS=86400

EXPOSE 8000

# Health check (gives model 60 s to load before first probe)
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Launch single-worker server (1 worker = predictable VRAM/RAM usage)
CMD ["uvicorn", "retina_ai.api:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
