# RetinaVision AI — AI-Based Retinal Disease Detection

**RetinaVision AI** is a hospital-grade, full-stack ophthalmology clinical screening platform. It integrates deep learning decision support (EfficientNet-B3 multi-task classifier, REFUGE U-Net segmentation, Grad-CAM++ explainability) with an intuitive medical workstation interface.

---

## System Architecture

```
retinavision-ai/
├── frontend/                     # React.js + Vite Hospital Workstation
│   ├── src/
│   │   ├── components/           # Sidebar, Topbar, Watermark, ReportModal, ImageQualityChecklist, RiskBadge
│   │   ├── pages/                # Dashboard, PatientDetails, FundusUpload, AIAnalysis, ScreeningHistory, ModelInfo, Settings, HelpSupport
│   │   ├── services/             # API client, Excel (.xlsx) exporter
│   │   ├── styles/               # clinical.css (Hospital theme, A4 print layout)
│   │   ├── App.jsx               # React Router navigation
│   │   └── main.jsx
│   ├── public/demo/              # Calibrated sample fundus scans & Grad-CAM heatmaps
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js + Express REST API
│   ├── controllers/              # patientController, screeningController
│   ├── routes/                   # /api/patients, /api/screening
│   ├── uploads/                  # Uploaded color fundus photographs
│   ├── server.js                 # Port 5000 Express server
│   └── package.json
│
└── README.md
```

---

## Key Clinical Features

1. **Strict Workflow Separation**:
   - **Dashboard (Overview Only)**: Total Screenings, Pending Reviews, High Risk Cases, Normal Retinas, Priority Alerts, and Recent Screening Queue.
   - **Patient Intake**: 2-column clinical registration with medical and ophthalmic history.
   - **Fundus Upload**: 6-point Image Quality Gate (focus, macula centering, optic disc visibility, illumination, motion stability, artifact-free) and step-by-step pipeline animation.
   - **AI Analysis (Deep Diagnostic View)**: Side-by-side original vs Grad-CAM++ heatmap with blend slider, 5-class probability distribution, quantitative lesion biomarker tallies, and clinical management plan.
   - **Consultation Report**: A4 printable ophthalmologist consultation report with electronic sign-off.
   - **Excel Export**: SheetJS `.xlsx` download strictly distinguishing **Scan Prediction Confidence** (scan-specific certainty) from **Model Validation Accuracy** (multi-cohort held-out benchmark).
2. **Subtle Security Watermark**:
   - Fixed retinal eye outline with circuit vasculature and institutional branding (`RetinaVision AI | © 2026`) across all pages.
3. **Medical Safety Compliance**:
   - Software as a Medical Device (SaMD) assistive decision support disclosures on every report and screening view.

---

## Quick Start Guide

### 1. Start the Backend API (Node.js + Express)
```bash
cd retinavision-ai/backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)*

### 2. Start the Frontend (React + Vite)
```bash
cd retinavision-ai/frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status, engine version, and uptime |
| `GET` | `/api/screening/stats` | Aggregate dashboard screening counters |
| `GET` | `/api/screening/history` | Filterable list of all patient screenings |
| `GET` | `/api/screening/:id` | Detailed diagnosis, lesions, and heatmap for a scan |
| `POST` | `/api/screening/upload` | Upload new color fundus image (Multer) |
| `POST` | `/api/screening/analyze` | Run multi-task AI pipeline and synthesize diagnosis |
| `GET` | `/api/patients` | Retrieve registered patient list |
| `GET` | `/api/patients/:id` | Fetch specific patient clinical record |
| `POST` | `/api/patients` | Register new patient with ophthalmic history |

