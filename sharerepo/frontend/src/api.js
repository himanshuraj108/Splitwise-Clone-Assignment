import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh JWT on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
          localStorage.setItem('access_token', res.data.access);
          original.headers.Authorization = `Bearer ${res.data.access}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth Services
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  me: () => api.get('/auth/me/'),
};

// Groups & Memberships Services
export const groupsAPI = {
  list: () => api.get('/groups/'),
  create: (data) => api.post('/groups/', data),
  get: (id) => api.get(`/groups/${id}/`),
  delete: (id) => api.delete(`/groups/${id}/`),
  
  listMemberships: (groupId) => api.get(`/groups/${groupId}/memberships/`),
  addMembership: (groupId, data) => api.post(`/groups/${groupId}/memberships/`, data),
  updateMembership: (groupId, membershipId, data) => api.put(`/groups/${groupId}/memberships/${membershipId}/`, data),
  deleteMembership: (groupId, membershipId) => api.delete(`/groups/${groupId}/memberships/${membershipId}/`),
};

// Expenses Services
export const expensesAPI = {
  list: (params) => api.get('/expenses/', { params }),
  create: (data) => api.post('/expenses/', data),
  delete: (id) => api.delete(`/expenses/${id}/`),
};

// Payments Services
export const paymentsAPI = {
  list: (params) => api.get('/payments/', { params }),
  create: (data) => api.post('/payments/', data),
};

// Balances & Debt Simplification Services
export const balancesAPI = {
  groupBalances: (groupId) => api.get(`/groups/${groupId}/balances/`),
};

// CSV Ingest & Anomaly Services
export const importsAPI = {
  uploadCSV: (formData) => api.post('/imports/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  resolveAnomaly: (anomalyId, data) => api.post(`/imports/anomalies/${anomalyId}/resolve/`, data),
  getImportReport: (importId) => api.get(`/imports/${importId}/report/`),
};
