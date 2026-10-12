@echo off
echo ========================================================
echo   Starting RetinaVision AI - Clinical Screening Stack
echo ========================================================
echo.

echo [1/3] Launching Python PyTorch AI Engine (Port 8000)...
start "RetinaVision AI - Python AI Engine [Port 8000]" cmd /k "cd /d %~dp0\.. && .\venv\Scripts\python.exe -m uvicorn retina_ai.api:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/3] Launching Node.js Express REST Backend (Port 5000)...
start "RetinaVision AI - Express Backend [Port 5000]" cmd /k "cd /d %~dp0\backend && npm start"

timeout /t 2 /nobreak >nul

echo [3/3] Launching React Vite Frontend Workstation (Port 5173)...
start "RetinaVision AI - React Frontend [Port 5173]" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo ========================================================
echo   All 3 Services Launched Successfully!
echo   ----------------------------------------------------
echo   Clinical Frontend Workstation : http://localhost:5173
echo   Node.js Express REST API     : http://localhost:5000
echo   PyTorch CUDA AI Engine       : http://127.0.0.1:8000
echo ========================================================
echo.
pause

