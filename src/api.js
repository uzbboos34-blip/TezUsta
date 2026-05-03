import axios from 'axios';

const API_URL = 'https://tezusta-backend.onrender.com';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/'; // Go to start/login
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  report: (id, reason) => api.post(`/users/${id}/report`, { reason }),
  topupRequest: (data) => api.post('/users/topup-request', data),
  getPayments: (page) => api.get('/users/my/payments', { params: { page } }),
  getHistory: (page, limit) => api.get('/users/my/history', { params: { page, limit } }),
  getWheelSettings: () => api.get('/users/wheel-settings'),
  spinWheel: () => api.post('/users/spin-wheel'),
  getCategories: () => api.get('/users/categories'),
};

export const jobsApi = {
  getAll: (cat, mine) => api.get('/jobs', { params: { cat, mine } }),
  getOne: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  apply: (id) => api.post(`/jobs/${id}/apply`),
  acceptWorker: (id, workerId) => api.post(`/jobs/${id}/accept/${workerId}`),
  remove: (id) => api.delete(`/jobs/${id}`),
  update: (id, data) => api.patch(`/jobs/${id}`, data),
  requestFinish: (id, finalPrice) => api.post(`/jobs/${id}/request-finish`, { finalPrice }),
  confirmDone: (id) => api.post(`/jobs/${id}/confirm-done`),
  timeoutAction: (id, data) => api.post(`/jobs/${id}/timeout-action`, data),
};

export const chatsApi = {
  getAll: () => api.get('/chats'),
  getOne: (id) => api.get(`/chats/${id}`),
  sendMessage: (id, text) => api.post(`/chats/${id}/messages`, { text }),
  create: (data) => api.post('/chats', data),
};

export const adminApi = {
  getLogs: (page) => api.get('/admin/logs', { params: { page } }),
  getUsers: (page) => api.get('/admin/users', { params: { page } }),
  getJobs: (page) => api.get('/admin/jobs', { params: { page } }),
  getUserJobs: (id, page) => api.get(`/admin/users/${id}/jobs`, { params: { page } }),
  getTransactions: (page) => api.get('/admin/transactions', { params: { page } }),
  blockUser: (id, reason, days) => api.post(`/admin/users/${id}/block`, { reason, days }),
  unblockUser: (id) => api.post(`/admin/users/${id}/unblock`),
  restoreUser: (id) => api.post(`/admin/users/${id}/restore`),
  deleteUser: (id) => api.post(`/admin/users/${id}/delete`),
  createAdmin: (data) => api.post('/admin/users/admins', data),
  getPayments: (page) => api.get('/admin/payments', { params: { page } }),
  approvePayment: (id) => api.post(`/admin/payments/${id}/approve`),
  rejectPayment: (id) => api.post(`/admin/payments/${id}/reject`),
  getCategories: () => api.get('/users/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.patch(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  approveCategory: (id) => api.post(`/admin/categories/${id}/approve`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.patch('/admin/settings', data),
  getReport: () => api.get('/admin/report'),
  getWheelSettings: () => api.get('/admin/wheel-settings'),
  updateWheelSettings: (data) => api.patch('/admin/wheel-settings', data),
};

export default api;
