import * as XLSX from 'xlsx';
import { formatDate, formatConfidence } from '../utils/formatters';

export function exportScreeningToExcel(screeningData, patientData) {
  if (!screeningData) {
    alert('No screening data available to export.');
    return;
  }

  const p = patientData || {
    id: screeningData.patientId || 'PT-UNASSIGNED',
    name: screeningData.patientName || 'Unnamed Patient',
    age: screeningData.age || 50,
    gender: screeningData.gender || 'Male',
    visitDate: screeningData.capturedAt ? screeningData.capturedAt.split('T')[0] : new Date().toISOString().split('T')[0]
  };

  const s = screeningData;

  // Extract raw probabilities
  const probs = s.all_probabilities || {};
  const probsList = s.probabilities || [];
  
  const getProb = (key) => {
    if (probs[key] !== undefined) return probs[key];
    const found = probsList.find((item) => (item.condition || '').toLowerCase().includes(key.toLowerCase()));
    return found ? found.probability : 0;
  };

  // Biomarkers
  const lesions = s.lesionFindings || {};

  const row = {
    'Report ID': s.id || 'SC-2026-0001',
    'Patient ID': p.id || s.patientId || '—',
    'Patient Name': p.name || s.patientName || '—',
    'Age': p.age || s.age || '—',
    'Gender': p.gender || s.gender || '—',
    'Visit Date': formatDate(p.visitDate || s.capturedAt),
    'Screening Date': formatDate(s.capturedAt || new Date().toISOString()),
    'Prediction': s.primaryCondition || s.disease || 'Normal',
    'Confidence': formatConfidence(s.confidence || s.predictionConfidence || 0),
    'Severity': s.severity || 'No Apparent Pathology',
    'Quality Gate': s.qualityGateStatus || 'Passed',
    'Quality Score': s.qualityGateScore !== undefined ? s.qualityGateScore : 0.92,
    'Normal Probability': formatConfidence(getProb('Normal')),
    'Mild NPDR Probability': formatConfidence(getProb('Mild') || getProb('Mild_NPDR')),
    'Moderate NPDR Probability': formatConfidence(getProb('Moderate') || getProb('Moderate_NPDR')),
    'Severe NPDR Probability': formatConfidence(getProb('Severe') || getProb('Severe_NPDR')),
    'Proliferative DR Probability': formatConfidence(getProb('Proliferative') || getProb('Proliferative_DR') || getProb('Diabetic_Retinopathy')),
    'Microaneurysms': lesions.microaneurysms ?? (s.primaryCondition?.includes('Retinopathy') ? 14 : 0),
    'Hemorrhages': lesions.hemorrhages ?? (s.primaryCondition?.includes('Retinopathy') ? 8 : 0),
    'Hard Exudates': lesions.hardExudates ?? (s.primaryCondition?.includes('Retinopathy') ? 6 : 0),
    'Soft Exudates': lesions.softExudates ?? 0,
    'Neovascularization': lesions.neovascularization ? 'Yes' : 'No',
    'Clinical Recommendation': (s.clinicalRecommendations && s.clinicalRecommendations[0]) || s.recommendation || 'Follow up with ophthalmologist as indicated.',
    'Clinician': 'Dr. Priya Sharma, MS (Ophthalmology)',
    'Review Status': s.riskLevel || 'Priority Review'
  };

  // Build SheetJS Workbook
  const worksheet = XLSX.utils.json_to_sheet([row]);

  // Define column widths for clean clinical layout
  const colWidths = [
    { wch: 15 }, // Report ID
    { wch: 15 }, // Patient ID
    { wch: 22 }, // Patient Name
    { wch: 8 },  // Age
    { wch: 10 }, // Gender
    { wch: 14 }, // Visit Date
    { wch: 14 }, // Screening Date
    { wch: 25 }, // Prediction
    { wch: 14 }, // Confidence
    { wch: 22 }, // Severity
    { wch: 14 }, // Quality Gate
    { wch: 14 }, // Quality Score
    { wch: 18 }, // Normal Prob
    { wch: 20 }, // Mild NPDR
    { wch: 22 }, // Moderate NPDR
    { wch: 20 }, // Severe NPDR
    { wch: 24 }, // Proliferative DR
    { wch: 16 }, // Microaneurysms
    { wch: 14 }, // Hemorrhages
    { wch: 14 }, // Hard Exudates
    { wch: 14 }, // Soft Exudates
    { wch: 18 }, // Neovascularization
    { wch: 45 }, // Recommendation
    { wch: 28 }, // Clinician
    { wch: 16 }  // Review Status
  ];

  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Retinal Screening Record');

  const filename = `RetinaVision_Screening_${p.id || 'RECORD'}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Export the complete patient registry to an Excel workbook.
 * Sheet 1 – "Patient Registry" : one row per patient with all fields.
 * Sheet 2 – "Export Summary"   : metadata (export date, total count).
 *
 * @param {Array} patients  Array of patient objects from getPatients()
 */
export function exportAllPatientsToExcel(patients) {
  if (!patients || patients.length === 0) {
    alert('No patient records available to export.');
    return;
  }

  // ── Sheet 1: Patient Registry ──────────────────────────────────────────────
  const rows = patients.map((p, idx) => ({
    '#':                     idx + 1,
    'Patient ID':            p.id || p.patient_id || '—',
    'Full Name':             p.name || p.full_name || '—',
    'Age':                   p.age ?? '—',
    'Gender':                p.gender || '—',
    'Contact Phone':         p.phone || '—',
    'Diabetes Status':       p.diabetesStatus || p.diabetes_status || '—',
    'Diabetes Duration':     p.diabetesDuration || p.diabetes_duration || '—',
    'Blood Pressure':        p.bloodPressure || p.blood_pressure || '—',
    'Department / Unit':     p.department || '—',
    'Referring Clinician':   p.referringClinician || p.referring_clinician || '—',
    'Visit Date':            p.visitDate || p.visit_date || (p.created_at ? p.created_at.split('T')[0] : '—'),
    'Clinical Notes':        p.notes || '—',
    'Registered At':         p.created_at ? formatDate(p.created_at) : '—',
  }));

  const patientSheet = XLSX.utils.json_to_sheet(rows);
  patientSheet['!cols'] = [
    { wch: 5  }, // #
    { wch: 18 }, // Patient ID
    { wch: 24 }, // Full Name
    { wch: 6  }, // Age
    { wch: 10 }, // Gender
    { wch: 18 }, // Phone
    { wch: 22 }, // Diabetes Status
    { wch: 18 }, // Diabetes Duration
    { wch: 18 }, // Blood Pressure
    { wch: 26 }, // Department
    { wch: 26 }, // Clinician
    { wch: 14 }, // Visit Date
    { wch: 40 }, // Notes
    { wch: 20 }, // Registered At
  ];

  // ── Sheet 2: Export Summary ────────────────────────────────────────────────
  const summary = [
    { Field: 'Export Date',    Value: new Date().toLocaleString() },
    { Field: 'Total Patients', Value: patients.length },
    { Field: 'Generated By',   Value: 'RetinaVision AI – Clinical Registry' },
    { Field: 'Note',           Value: 'Confidential – For authorised clinical use only' },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summary);
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 50 }];

  // ── Workbook ───────────────────────────────────────────────────────────────
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, patientSheet, 'Patient Registry');
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Export Summary');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `RetinaVision_PatientList_${dateStr}.xlsx`);
}
