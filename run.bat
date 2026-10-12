@echo off
echo ========================================================
echo   RetinaVision AI - Universal Single-Command Launcher
echo ========================================================
echo.

set ROOT_DIR=%~dp0

echo [1/2] Launching Python PyTorch AI Engine (Port 8000)...
start "RetinaVision AI - Python AI Engine [Port 8000]" cmd /k "cd /d %ROOT_DIR% && .\venv\Scripts\python.exe -m uvicorn retina_ai.api:app --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/2] Launching React Vite Frontend Workstation (Port 5173)...
start "RetinaVision AI - React Frontend [Port 5173]" cmd /k "cd /d %ROOT_DIR%\retinavision-ai\frontend && npm run dev"

echo.
echo ========================================================
echo   RetinaVision AI Services Online!
echo   ----------------------------------------------------
echo   Web Application (React UI) : http://127.0.0.1:5173
echo   Inference API Engine       : http://127.0.0.1:8000
echo   API Interactive Docs       : http://127.0.0.1:8000/docs
echo ========================================================
echo.
pause

