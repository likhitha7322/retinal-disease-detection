---
title: RetinaVision AI
emoji: 👁️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 8000
tags:
  - medical-imaging
  - retinal-disease
  - deep-learning
  - pytorch
  - fastapi
short_description: AI-Based Retinal Disease Detection & Clinical Screening Platform
---

# RetinaVision AI: Clinical Retinal Disease Detection & Explainable Screening Platform

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](file:///c:/Users/Acer/retinal-disease-detection/models/config.json)
[![API](https://img.shields.io/badge/FastAPI-Production-009688.svg)](file:///c:/Users/Acer/retinal-disease-detection/retina_ai/api.py)
[![Frontend](https://img.shields.io/badge/React_18-Vite-61DAFB.svg)](file:///c:/Users/Acer/retinal-disease-detection/retinavision-ai/frontend)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.5.1_CUDA-EE4C2C.svg)](https://pytorch.org/)
[![Accuracy](https://img.shields.io/badge/Held--Out_Accuracy-81.78%25-green.svg)](file:///c:/Users/Acer/retinal-disease-detection/reports/classification_report.json)
[![ROC-AUC](https://img.shields.io/badge/Macro_AUC-0.941-success.svg)](file:///c:/Users/Acer/retinal-disease-detection/reports/roc_auc_scores.json)

**RetinaVision AI** is a production-grade clinical ophthalmology decision-support workstation application. It combines real **PyTorch CUDA deep neural networks** (`EfficientNet-B3`, `REFUGE LightUNet`, `LesionUNet`, and `Grad-CAM++`) with a hardened multi-tier fundus gate, an asynchronous **FastAPI** REST backend with **SQLite (SQLAlchemy)** persistence, and a modern **React 18 + Vite** frontend styled to match the official splash screen visual reference.

---

## Visual Reference & Splash Screen

The application visual design matches the official splash screen design system:
- **Background**: Soft white to pale sky-blue diagonal gradient (`#FFFFFF` &rarr; `#E2EDFA`).
- **Watermark**: Centered faint pencil-sketch of a human eye (~6.5% opacity, fixed, non-interactive).
- **Primary Brand Color**: Medical blue (`#1F4FBF` / `#2563EB`) and deep navy typography (`#16356B`).
- **Logo**: Circuit-style eye icon with neural network traces and "RetinaVision AI" wordmark.
- **Footer**: Centered on every page: `"RetinaVision AI | AI-Based Retinal Disease Detection | © 2026"`.
- **Cards**: Frosted glass (`backdrop-filter: blur(14px)`) with subtle blue shadow and 14px radius.

---

## Key Features & Architecture

1. **5-Class Multi-Task Disease Detection**:
   - Covers **Normal**, **Diabetic Retinopathy** (ICDR severity grades 0–4), **Glaucoma**, **Age-Related Macular Degeneration (AMD)**, and **Cataract**.
2. **Hardened 3-Tier Fundus Gate (Rejects Non-Fundus Photos)**:
   - *Tier 1 (Physiological Color & Geometry)*: Enforces red dominance, strict blue-light absorption check ($B_{ratio} \le 0.32$), $R/B \ge 1.10$, green vascular contrast, and retinal hue verification ($0^\circ - 35^\circ$ in HSV). Rejects selfies, screenshots, faces, random noise, and solid screens with HTTP 422.
   - *Tier 2 (Learned CNN)*: `FundusGateNet` trained to reject out-of-distribution natural photos.
   - *Tier 3 (Confidence & Entropy)*: Enforces minimum probability bounds and Shannon entropy limits ($\le 1.15$).
3. **Optic Cup/Disc Segmentation & Glaucoma CDR**:
   - `LightUNet` disc and cup segmentation computing vertical Cup-to-Disc Ratio (**CDR**), flagging glaucomatous cupping when $CDR > 0.65$.
4. **Explainable AI (Grad-CAM++ & Lesion Masks)**:
   - High-resolution saliency maps localized on retinal lesions with interactive opacity blend slider and lesion mask overlay toggle.
5. **Automated Clinical Diagnostic Narrative (§7.5)**:
   - Clinician Findings narrative, Patient-Friendly summary, and Clinical Caveats automatically generated and displayed in UI, PDF, and Excel.
6. **Permanent SQLite Database Persistence**:
   - All screening examinations, patient metadata, image paths, and probabilities are permanently stored in `data/retinavision.db`.

---

## Directory Structure

```
retinal-disease-detection/
├── data/                             # SQLite database directory (retinavision.db)
├── docs/
│   └── AUDIT.md                      # Step 0 comprehensive audit report
├── models/                           # Exported model weights & metadata
│   ├── best_model.pth                # EfficientNet-B3 model weights (43.3 MB)
│   ├── labels.json                   # Ordered class names
│   └── config.json                   # Hyperparameters, normalization & metrics
├── reports/                          # Verified test evaluation reports & plots
│   ├── classification_report.json    # Precision, recall, F1 per class
│   ├── confusion_matrix.png          # Test set confusion matrix
│   ├── roc_curve.png                 # Multi-class ROC curves (AUC 0.941)
│   └── reliability_diagram.png       # Calibration diagram (ECE 0.042)
├── retina_ai/                        # Core Python PyTorch & FastAPI package
│   ├── api.py                        # FastAPI endpoints (/health, /predict, /history, /report)
│   ├── database.py                   # SQLAlchemy SQLite models & session
│   ├── gate.py                       # Hardened 3-tier fundus gate
│   ├── pipeline.py                   # Canonical RetinaPipeline inference engine
│   ├── explain.py                    # Grad-CAM++ explainer
│   ├── reports.py                    # ReportLab PDF report generator
│   └── models/                       # Neural network architectures
├── retinavision-ai/
│   └── frontend/                     # React 18 + Vite Clinical Workstation
│       ├── src/
│       │   ├── components/           # SplashScreen, Header, Footer, EyeWatermark, CircuitEyeLogo
│       │   ├── pages/                # Dashboard, FundusUpload, AIAnalysis, ScreeningHistory, ModelInfo
│       │   ├── services/             # api.js (Strictly connected, ZERO mock data)
│       │   └── styles/clinical.css   # Medical blue design tokens
│       └── package.json
├── tests/                            # Automated pytest suite (18/18 passing)
├── requirements.txt                  # Python dependencies
├── run.bat / start_all.bat           # 1-Click universal launchers
└── README.md
```

---

## Quick Start (One Command)

### Option A: 1-Click Windows Launcher (Recommended)
Double-click or run from PowerShell:
```powershell
.\run.bat
```
*(Or `.\start_all.bat` or `npm start`)*

This launches:
1. **Python FastAPI Engine**: `http://127.0.0.1:8000` (PyTorch CUDA)
2. **React Clinical Workstation**: `http://127.0.0.1:5173`

---

### Option B: Manual Terminal Execution

**Terminal 1 — Python AI Inference Backend (Port 8000):**
```powershell
cd C:\Users\Acer\retinal-disease-detection
.\venv\Scripts\python.exe -m uvicorn retina_ai.api:app --host 127.0.0.1 --port 8000
```

**Terminal 2 — React Vite Frontend (Port 5173):**
```powershell
cd C:\Users\Acer\retinal-disease-detection\retinavision-ai\frontend
npm run dev
```

---

## API Documentation

Once the backend is running, explore interactive Swagger API docs at:
👉 **`http://127.0.0.1:8000/docs`**

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Model liveness probe, device (CUDA/CPU), bundle version |
| `POST` | `/api/predict` | Uploads fundus image; returns diagnosis, confidence, Grad-CAM base64 overlay, narrative |
| `GET` | `/api/history` | Paginated screening records from SQLite database with search & disease filter |
| `GET` | `/api/history/{id}` | Fetches complete clinical assessment of a specific screening |
| `DELETE`| `/api/history/{id}` | Deletes screening record from database and purges files from disk |
| `GET` | `/api/report/{id}` | Generates and streams downloadable ReportLab PDF consultation report |
| `GET` | `/api/model-info` | Real test accuracy (81.78%), AUC (0.941), QWK (0.88), confusion matrix URL |
| `GET` | `/api/screening/stats`| Live clinical KPI metrics and cohort disease breakdown |

---

## How to Retrain or Replace Model Weights

1. Open `model/notebooks/Retinal_Disease_Detection_v2_LargerDataset_XAI.ipynb`.
2. Follow training cells in Section 4 to train on your updated dataset.
3. Save the PyTorch `.pth` state dictionary.
4. Replace `models/best_model.pth` and `model_bundle_v2.1.0/classifier.pth`.
5. Update `models/labels.json` and `models/config.json` if class count or order changed.
6. Restart the FastAPI service: the `lifespan` handler automatically loads the updated weights into memory.

---

## VTU 2022 Scheme Mandatory Software Specifications & Guidelines

This software project strictly adheres to the **Visvesvaraya Technological University (VTU) Final Year Project Work Guidelines (2022 Scheme)** for Undergraduate B.E. / B.Tech Projects.

### 1. Computer Hardware & Software Environment Requirements

| Requirement Category | Minimum Specification | Recommended Specification |
|---|---|---|
| **Processor (CPU)** | Intel Core i5 / AMD Ryzen 5 (4 Cores, 2.4 GHz+) | Intel Core i7 / AMD Ryzen 7 (8 Cores+) |
| **System Memory (RAM)** | 8 GB DDR4 | 16 GB DDR4/DDR5 |
| **Graphics Processing (GPU)** | Integrated Graphics (CPU Fallback Mode) | NVIDIA GeForce RTX 3060/4060 (CUDA 12.4+ supported) |
| **Disk Storage** | 2 GB Available Solid State Drive (SSD) | 5 GB SSD Storage |
| **Operating System** | Windows 10/11 64-bit / Ubuntu 22.04 LTS / macOS 13+ | Windows 11 64-bit |
| **Python Runtime** | Python 3.12.x (64-bit) | Python 3.12.10 |
| **Node.js Environment** | Node.js v18.x or v20.x | Node.js v20.11.0 LTS & npm v10.x |
| **Database System** | SQLite 3 (SQLAlchemy ORM 2.0+) | SQLite 3 (Local file `data/retinavision.db`) |

---

### 2. Compilation & Execution Procedure

1. **Backend Environment Initialization:**
   ```powershell
   # Navigate to project root directory
   cd C:\Users\Acer\retinal-disease-detection

   # Activate virtual environment and install dependencies
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Backend API Compilation & Service Launch:**
   ```powershell
   # Start Uvicorn ASGI production server on port 8000
   python -m uvicorn retina_ai.api:app --host 127.0.0.1 --port 8000
   ```

3. **Frontend Bundle Compilation & Workstation Execution:**
   ```powershell
   # Navigate to frontend workspace
   cd retinavision-ai/frontend

   # Install Node packages & compile production distribution
   npm install
   npm run build

   # Start Vite local development workstation server on port 5173
   npm run dev
   ```

---

### 3. Key Variables & Data Structures Dictionary

| Variable / Property | Data Type | Description & Logical Bounds |
|---|---|---|
| `screening.id` | `String (UUID/Format)` | Unique examination record identifier (e.g. `SC-2026-0001`). |
| `screening.patientId` | `String` | Patient medical record number (e.g. `PT-2026-0841`). |
| `screening.primaryCondition` | `String` | Classified disease category (`Normal`, `Diabetic Retinopathy`, `Glaucoma`, `AMD`, `Cataract`). |
| `screening.confidence` | `Float` | Model classification confidence percentage ($0.00\% - 100.00\%$). |
| `screening.qualityGateStatus` | `String` | 3-tier fundus gate assessment (`Passed`, `Rejected`, `Degraded`). |
| `screening.lesionFindings` | `Object / JSON` | Dynamic lesion metrics (e.g. `microaneurysms`, `cupToDiscRatio`, `drusenArea`, `clarityIndex`). |
| `screening.probabilities` | `Array<Object>` | Probability distribution array across all 5 disease categories. |
| `screening.clinicalNarrative` | `Object / JSON` | Automated findings text, patient-friendly summary, and specialist caveats. |
| `screening.gradcam_overlay_b64` | `String (Base64)` | Base64-encoded Data-URL string of the Grad-CAM++ saliency overlay. |

---

### 4. Public Domain Software & Open-Source Library Attributions

As per VTU Software Project Guidelines (Page 21), the open-source third-party software libraries used in this project are acknowledged below:

| Module / Package Name | Download URL / Official Website | Version | License Type | Purpose in Project |
|---|---|---|---|---|
| **PyTorch** | https://pytorch.org | 2.5.1+cu124 | BSD 3-Clause | Deep learning inference framework & neural model execution |
| **FastAPI** | https://fastapi.tiangolo.com | 0.115.0 | MIT License | Asynchronous REST API web framework & endpoint routing |
| **OpenCV (cv2)** | https://opencv.org | 4.10.0 | Apache 2.0 | Image preprocessing, CLAHE enhancement, and HSV color space analysis |
| **ReportLab** | https://www.reportlab.com | 4.2.5 | BSD License | Automated A4 PDF clinical report generation engine |
| **React** | https://react.dev | 19.0.0 | MIT License | Component-based user interface library for clinical workstation |
| **Vite** | https://vitejs.dev | 6.4.3 | MIT License | Next-generation frontend build tool and development server |
| **SQLAlchemy** | https://www.sqlalchemy.org | 2.0.35 | MIT License | Object-Relational Mapping (ORM) for SQLite database persistence |
| **Lucide React** | https://lucide.dev | 0.460.0 | ISC License | Medical and clinical icon set for user interface elements |
| **SheetJS (xlsx)** | https://sheetjs.com | 0.18.5 | Apache 2.0 | Client-side Excel dataset export service for clinical audits |

---

## Medical Disclaimer

> [!IMPORTANT]
> **Safety Notice:** RetinaVision AI is designed as an investigative clinical decision-support screening aid (Software as a Medical Device — SaMD prototype) and is **not a substitute for professional clinical diagnosis** by a licensed ophthalmologist or optometrist. All findings must be clinically correlated with dilated slit-lamp biomicroscopy and optical coherence tomography (OCT).

