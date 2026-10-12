#!/usr/bin/env bash
# ==============================================================================
# RetinaVision AI - Production Deployment Launcher (Linux / macOS / Cloud VPS)
# ==============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "=============================================================================="
echo "          RetinaVision AI - Production Deployment Launcher"
echo "=============================================================================="

# 1. Check Python environment
if [ -d "venv" ]; then
    PYTHON_BIN="venv/bin/python"
    UVICORN_BIN="venv/bin/uvicorn"
elif command -v python3 &>/dev/null; then
    PYTHON_BIN="python3"
    UVICORN_BIN="uvicorn"
else
    echo "[ERROR] Python 3 not found. Please install Python 3.10+ or set up venv."
    exit 1
fi

# 2. Ensure directories exist
mkdir -p data uploads reports

# 3. Check frontend production bundle
if [ ! -f "retinavision-ai/frontend/dist/index.html" ]; then
    echo "[*] Compiling React frontend for production..."
    cd retinavision-ai/frontend
    npm install
    npm run build
    cd "$SCRIPT_DIR"
fi

echo "[+] Frontend build verified."
echo "[+] Starting RetinaVision AI on port 8000..."
echo "=============================================================================="
echo "  URL: http://0.0.0.0:8000"
echo "  API Docs: http://0.0.0.0:8000/docs"
echo "  Health Check: http://0.0.0.0:8000/health"
echo "=============================================================================="

exec $PYTHON_BIN -m uvicorn retina_ai.api:app --host 0.0.0.0 --port 8000 --workers 1
