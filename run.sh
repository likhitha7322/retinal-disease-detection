#!/usr/bin/env bash
echo "========================================================"
echo "  RetinaVision AI - Universal Single-Command Launcher"
echo "========================================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start Python FastAPI in background
echo "[1/2] Launching Python PyTorch AI Engine (Port 8000)..."
python -m uvicorn retina_ai.api:app --host 127.0.0.1 --port 8000 &
PID_PY=$!

sleep 3

# Start React Frontend
echo "[2/2] Launching React Vite Frontend Workstation (Port 5173)..."
cd "$SCRIPT_DIR/retinavision-ai/frontend" && npm run dev &
PID_FRONT=$!

echo ""
echo "========================================================"
echo "  RetinaVision AI Services Online!"
echo "  Web Application (React UI) : http://127.0.0.1:5173"
echo "  Inference API Engine       : http://127.0.0.1:8000"
echo "  API Interactive Docs       : http://127.0.0.1:8000/docs"
echo "========================================================"
echo "Press Ctrl+C to terminate services."

trap "kill $PID_PY $PID_FRONT" EXIT
wait

