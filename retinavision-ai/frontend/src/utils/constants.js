/**
 * RetinaVision AI — Clinical System Constants
 */

export const APP_NAME = 'RetinaVision AI';
export const APP_TAGLINE = 'AI-Based Retinal Disease Detection';
export const APP_COPYRIGHT = '© 2026';

export const CLINICAL_CLASSES = [
  'Normal',
  'Diabetic Retinopathy',
  'Glaucoma',
  'AMD',
  'Cataract'
];

export const DR_SEVERITY_LEVELS = [
  { grade: 0, label: 'No Apparent DR', risk: 'Low' },
  { grade: 1, label: 'Mild Non-Proliferative (NPDR)', risk: 'Low' },
  { grade: 2, label: 'Moderate NPDR', risk: 'Moderate' },
  { grade: 3, label: 'Severe NPDR', risk: 'High' },
  { grade: 4, label: 'Proliferative DR (PDR)', risk: 'Urgent' }
];

export const QUALITY_CHECKLIST_ITEMS = [
  { id: 'imageSelected', label: 'Image selected & format validated' },
  { id: 'resolutionCheck', label: 'Resolution check (min 512x512)' },
  { id: 'illuminationCheck', label: 'Illumination & contrast balance' },
  { id: 'focusCheck', label: 'Focus & retinal sharpness verification' },
  { id: 'fundusVisibility', label: 'Fundus anatomy visibility (Macula/Disc)' },
  { id: 'qualityGate', label: 'Physiological color spectrum Quality Gate' }
];

export const DEMO_PRESET_SCANS = [
  {
    label: 'Diabetic Retinopathy (OD)',
    path: '/demo/fundus_od_sample.jpg',
    gradcamPath: '/demo/fundus_od_gradcam.jpg',
    eye: 'OD (Right Eye)',
    category: 'Microaneurysms + Hemorrhages'
  },
  {
    label: 'Glaucoma Suspicion (OS)',
    path: '/demo/fundus_os_sample.jpg',
    gradcamPath: '/demo/fundus_os_gradcam.jpg',
    eye: 'OS (Left Eye)',
    category: 'Optic Cupping & Thinning'
  },
  {
    label: 'Normal Fundus (OD)',
    path: '/demo/fundus_normal_sample.jpg',
    gradcamPath: '/demo/fundus_normal_gradcam.jpg',
    eye: 'OD (Right Eye)',
    category: 'Healthy Macula & Vasculature'
  },
  {
    label: 'Macular Degeneration (OS)',
    path: '/demo/fundus_amd_sample.jpg',
    gradcamPath: '/demo/fundus_amd_gradcam.jpg',
    eye: 'OS (Left Eye)',
    category: 'Confluent Soft Drusen'
  }
];

export const DEFAULT_SETTINGS = {
  requireQualityGate: true,
  showGradcam: true,
  showSafetyDisclaimer: true,
  autoOpenReport: false,
  enableExcelExport: true,
  hospitalName: 'Apex Eye Institute & Retina Care Center',
  department: 'Vitreo-Retinal Diagnostic & Screening Department',
  doctorName: 'Dr. Priya Sharma, MBBS, MS (Ophthalmology)',
  doctorRegNo: 'KMC-729481'
};

