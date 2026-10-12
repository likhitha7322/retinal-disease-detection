import { api } from './api';

const LOCAL_STORAGE_KEY = 'retinavision_registered_patients';

const DUMP_IDS = new Set(['PT-2026-0841', 'PT-2026-0842', 'PT-2026-0843']);
const DUMP_NAMES = new Set(['Rajesh Sharma', 'Meera Patel', 'Suresh Kumar']);

export function getLocalPatients() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p) => p && p.id && !DUMP_IDS.has(p.id) && !DUMP_NAMES.has(p.name));
  } catch (e) {
    return [];
  }
}

export function saveLocalPatient(patient) {
  try {
    const list = getLocalPatients();
    const existingIdx = list.findIndex((p) => p.id === patient.id || (p.name === patient.name && p.age === patient.age));
    let updatedList;
    if (existingIdx >= 0) {
      updatedList = [...list];
      updatedList[existingIdx] = { ...updatedList[existingIdx], ...patient };
    } else {
      updatedList = [patient, ...list];
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('[patientService] Could not save to localStorage:', e);
  }
}

export async function createPatient(patientData) {
  const newId = patientData.id || `PT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const res = await api.post('/patients', { ...patientData, id: newId });
  const created = res.data || res;
  return created;
}

export async function getPatients() {
  try {
    const res = await api.get('/patients');
    const rawApi = res.data || res || [];
    const apiPatients = Array.isArray(rawApi) ? rawApi : (rawApi.data || []);
    return apiPatients;
  } catch (err) {
    console.warn('[patientService] Could not load patients from backend:', err.message);
    return [];
  }
}

export async function getPatientById(id) {
  const patients = await getPatients();
  return patients.find((p) => p.id === id) || null;
}

export async function deletePatient(id) {
  try {
    const list = getLocalPatients().filter((p) => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}

  try {
    await api.delete(`/patients/${id}`);
  } catch (err) {
    console.warn('[patientService] Could not delete patient from backend:', err.message);
  }
}

export async function purgeAllPatients() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {}

  try {
    await api.delete('/patients');
  } catch (err) {
    console.warn('[patientService] Could not purge patients from backend:', err.message);
  }
}
