/**
 * RetinaVision AI — Screening & History API Service
 * Directly interfaces with the production FastAPI backend.
 * Gracefully returns empty results if the backend is unavailable.
 */

import { api } from './api';

/**
 * Converts a data: or blob: URL into a File object.
 */
async function urlToFile(url, filename = 'fundus_scan.jpg') {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

export async function submitFundusScreening(inputData) {
  let bodyFormData;

  if (inputData instanceof FormData) {
    bodyFormData = inputData;
  } else {
    bodyFormData = new FormData();
    const { file, imageUrl, patient, patientId, patientName, age, gender, eye } = inputData || {};

    if (file) {
      bodyFormData.append('file', file);
    } else if (imageUrl) {
      if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
        const convertedFile = await urlToFile(imageUrl, 'fundus_scan.jpg');
        bodyFormData.append('file', convertedFile);
      } else {
        bodyFormData.append('image_url', imageUrl);
      }
    }

    const pId = patient?.id || patientId || 'PT-2026-UNASSIGNED';
    const pName = patient?.name || patientName || 'Anonymous Patient';
    const pAge = patient?.age || age || '';
    const pGender = patient?.gender || gender || 'Male';
    const pEye = eye || 'OD (Right Eye)';

    bodyFormData.append('patient_id', pId);
    bodyFormData.append('patient_name', pName);
    if (pAge) bodyFormData.append('age', pAge.toString());
    bodyFormData.append('gender', pGender);
    bodyFormData.append('eye', pEye);
  }

  // This intentionally throws so the upload page can show the error to the user
  const res = await api.post('/predict', bodyFormData);
  const rawData = res.data !== undefined ? res.data : res;
  return rawData.data || rawData;
}

export const uploadFundusAndAnalyze = submitFundusScreening;

export async function getScreeningHistory(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/history?${query}` : '/history';
    const res = await api.get(endpoint);
    const rawApi = res.data !== undefined ? res.data : res;
    const apiRecords = Array.isArray(rawApi) ? rawApi : (rawApi.data || []);
    return apiRecords.sort(
      (a, b) => new Date(b.capturedAt || b.createdAt || b.created_at || 0) - new Date(a.capturedAt || a.createdAt || a.created_at || 0)
    );
  } catch (err) {
    console.warn('[screeningService] Could not load screening history:', err.message);
    return [];
  }
}

export async function getScreeningById(id) {
  try {
    const res = await api.get(`/history/${id}`);
    const rawData = res.data !== undefined ? res.data : res;
    const data = rawData.data || rawData;
    if (!data || !data.id) throw new Error(`Screening record ${id} not found.`);
    return data;
  } catch (err) {
    throw err;
  }
}

export async function deleteScreening(id) {
  try {
    return await api.delete(`/history/${id}`);
  } catch (err) {
    console.warn('[screeningService] Delete failed:', err.message);
  }
}

export async function updateScreeningPatientInfo(id, patientData) {
  try {
    const res = await api.put(`/history/${id}`, {
      name: patientData.name,
      patient_id: patientData.id,
      age: parseInt(patientData.age, 10) || null,
      gender: patientData.gender
    });
    return res.data || res;
  } catch (err) {
    console.warn('[screeningService] Update failed:', err.message);
    return null;
  }
}

export async function getDashboardStats() {
  try {
    const res = await api.get('/screening/stats');
    const rawApi = res.data !== undefined ? res.data : res;
    const apiData = rawApi.data || rawApi;
    const queue = apiData.recentQueue || [];
    return {
      totalScreenings: apiData.totalScreenings || queue.length,
      pendingReviews: apiData.pendingReviews || 0,
      highRiskCases: apiData.highRiskCases || queue.filter((r) => (r.riskLevel || '').includes('High')).length,
      normalRetinas: apiData.normalRetinas || queue.filter((r) => (r.primaryCondition || r.disease || '').includes('Normal')).length,
      diseaseDistribution: apiData.diseaseDistribution || {},
      recentQueue: queue
    };
  } catch (err) {
    console.warn('[screeningService] Could not load dashboard stats:', err.message);
    return { totalScreenings: 0, pendingReviews: 0, highRiskCases: 0, normalRetinas: 0, diseaseDistribution: {}, recentQueue: [] };
  }
}

export async function getModelSpecs() {
  try {
    return await api.get('/model-info');
  } catch (err) {
    return null;
  }
}
