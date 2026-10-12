@echo off
setlocal enabledelayedexpansion

echo ==============================================================================
echo           RetinaVision AI - Production Deployment Launcher
echo           Deep Learning Retinal Disease Screening & CADx Platform
echo ==============================================================================
echo.

set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

:: 1. Check Python Virtual Environment
if not exist ".\venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found at .\venv\Scripts\python.exe
    echo Please create the virtual environment and install requirements first:
    echo   python -m venv venv
    echo   .\venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)

:: 2. Ensure data, upload, and report directories exist
if not exist "data" mkdir "data"
if not exist "uploads" mkdir "uploads"
if not exist "reports" mkdir "reports"

:: 3. Check if frontend production bundle exists
if not exist "retinavision-ai\frontend\dist\index.html" (
    echo [*] Frontend production bundle not found. Building with Vite...
    cd /d "%ROOT_DIR%\retinavision-ai\frontend"
    call npm install
    call npm run build
    cd /d "%ROOT_DIR%"
    if not exist "retinavision-ai\frontend\dist\index.html" (
        echo [ERROR] Failed to compile React frontend bundle.
        pause
        exit /b 1
    )
    echo [+] Frontend successfully compiled to retinavision-ai\frontend\dist!
) else (
    echo [+] Verified frontend production build exists in retinavision-ai\frontend\dist.
)

echo.
echo [*] Initializing Production Server on port 8000...
echo     Hosting UI, REST API, PyTorch Inference Engine & Database.
echo.
echo ==============================================================================
echo   RetinaVision AI is LIVE:
echo   ----------------------------------------------------------------------------
echo   Local Address     : http://127.0.0.1:8000
echo   Network / LAN     : http://0.0.0.0:8000
echo   Interactive API   : http://127.0.0.1:8000/docs
echo   Health Status     : http://127.0.0.1:8000/health
echo ==============================================================================
echo.
echo Opening browser in 3 seconds...
start "" "http://127.0.0.1:8000"

:: Launch Unified FastAPI Production Server
.\venv\Scripts\python.exe -m uvicorn retina_ai.api:app --host 0.0.0.0 --port 8000 --workers 1

pause
