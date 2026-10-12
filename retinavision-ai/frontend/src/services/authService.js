import { api } from './api';

export async function loginUser({ email, password }) {
  const res = await api.post('/auth/login', { email, password });
  if (res.token) {
    localStorage.setItem('retinavision_token', res.token);
  }
  return res;
}

export async function registerUser(userData) {
  const res = await api.post('/auth/register', userData);
  if (res.token) {
    localStorage.setItem('retinavision_token', res.token);
  }
  return res;
}

export async function getCurrentUserProfile() {
  const token = localStorage.getItem('retinavision_token');
  if (!token) return null;
  try {
    const res = await api.get(`/auth/me?token=${token}`);
    return res.user || res.data || res;
  } catch (err) {
    return null;
  }
}

export async function logoutUser() {
  localStorage.removeItem('retinavision_token');
  try {
    await api.post('/auth/logout');
  } catch (err) {
    // Ignore offline errors on logout
  }
}

