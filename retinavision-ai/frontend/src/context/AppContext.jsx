import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_SETTINGS } from '../utils/constants';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  PATIENT: 'retinavision_current_patient',
  SCREENING: 'retinavision_current_screening',
  SETTINGS: 'retinavision_settings'
};

export function AppProvider({ children }) {
  // 1. Current active patient in the clinical intake workflow
  const [currentPatient, setCurrentPatientState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PATIENT);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed?.id === 'PT-2026-0841' || parsed?.name === 'Rajesh Sharma') return null;
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const setCurrentPatient = (patient) => {
    setCurrentPatientState(patient);
    if (patient) {
      localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(patient));
    } else {
      localStorage.removeItem(STORAGE_KEYS.PATIENT);
    }
  };

  // 2. Active image uploaded for screening
  const [uploadedImage, setUploadedImage] = useState('/demo/fundus_od_sample.jpg');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedEye, setSelectedEye] = useState('OD (Right Eye)');

  // 3. Current active screening analysis result
  const [analysisResult, setAnalysisResultState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCREENING);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const setAnalysisResult = (result) => {
    setAnalysisResultState(result);
    if (result) {
      localStorage.setItem(STORAGE_KEYS.SCREENING, JSON.stringify(result));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SCREENING);
    }
  };

  // 4. Clinical workstation settings
  const [settings, setSettingsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSettings = (newSettings) => {
    setSettingsState((prev) => {
      const merged = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
      return merged;
    });
  };

  // 5. Toast notification system
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((curr) => (curr && curr.id === curr.id ? null : curr));
    }, 3500);
  };

  const hideToast = () => setToast(null);

  // 6. Reset workflow for a new patient
  const startNewPatientWorkflow = () => {
    const newId = `PT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPatient = {
      id: newId,
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      diabetesStatus: 'None',
      diabetesDuration: '',
      bloodPressure: '',
      department: 'Ophthalmology / Vitreo-Retina',
      referringClinician: 'Dr. Priya Sharma',
      visitDate: new Date().toISOString().split('T')[0],
      notes: ''
    };
    setCurrentPatient(newPatient);
    setUploadedImage('/demo/fundus_od_sample.jpg');
    setUploadedFile(null);
    setAnalysisResult(null);
  };

  const value = {
    currentPatient,
    setCurrentPatient,
    uploadedImage,
    setUploadedImage,
    uploadedFile,
    setUploadedFile,
    selectedEye,
    setSelectedEye,
    analysisResult,
    setAnalysisResult,
    settings,
    updateSettings,
    toast,
    showToast,
    hideToast,
    startNewPatientWorkflow
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

