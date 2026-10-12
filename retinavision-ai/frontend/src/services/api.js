/**
 * RetinaVision AI — Centralized REST API Client
 * Seamlessly interfaces with Node.js Express Backend or FastAPI AI Inference Engine.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = { ...options.headers };
  const token = localStorage.getItem('retinavision_token');
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body !== 'string') {
    body = JSON.stringify(body);
  }

  // Don't set Content-Type for FormData (browser sets boundary)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
    body
  };

  try {
    const response = await fetch(url, config);

    // Special handling for HTTP 422 ONLY IF it is a Fundus Quality Gate Rejection
    if (response.status === 422) {
      const rejectionData = await response.json().catch(() => ({}));
      if (rejectionData.failedCheck || rejectionData.failed_check || rejectionData.scores) {
        return {
          rejected: true,
          status: 'rejected',
          reason: rejectionData.reason || 'Image rejected by physiological fundus screening gate.',
          failedCheck: rejectionData.failedCheck || rejectionData.failed_check || 'quality_gate_prefilter',
          scores: rejectionData.scores || {},
          disclaimer: rejectionData.disclaimer || 'Uploaded photograph does not meet anatomic criteria for retinal screening.'
        };
      }
      let msg = 'Unprocessable request parameters.';
      if (Array.isArray(rejectionData.detail)) {
        msg = rejectionData.detail.map(d => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}`).join(', ');
      } else if (typeof rejectionData.detail === 'string') {
        msg = rejectionData.detail;
      }
      const valErr = new Error(msg);
      valErr.status = 422;
      valErr.data = rejectionData;
      throw valErr;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let message = errorData.detail || errorData.message || `Request failed with HTTP ${response.status}`;
      if (Array.isArray(errorData.detail)) {
        message = errorData.detail.map(d => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}`).join(', ');
      }
      const error = new Error(message);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Handle binary / blob downloads (PDF report)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) {
      return await response.blob();
    }

    return await response.json();
  } catch (err) {
    if (err.status) throw err;
    // Network or server offline error
    console.warn(`[API] Connection failure to ${url}:`, err.message);
    const connErr = new Error(`Unable to reach the screening service. Please verify that the backend is running.`);
    connErr.isNetworkError = true;
    throw connErr;
  }
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
  getBaseUrl: () => API_BASE_URL,
  // Convenience health check method
  getHealth: () => request('/health', { method: 'GET' }),
  // Convenience method for the Model Information page
  getModelInfo: () => request('/model-info', { method: 'GET' }),
};

