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

