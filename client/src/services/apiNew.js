import axios from 'axios';

console.log('🚀 NEW API Service: Starting to load...');

const baseURL = 'http://localhost:3001';
console.log('🌐 Base URL:', baseURL);

const apiClient = axios.create({
  baseURL: baseURL
});

console.log('✅ axios client created successfully');

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('📡 Making request to:', config.baseURL + config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Request with auth token');
    } else {
      console.log('🔓 Request without auth token');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

const api = {
  auth: {
    login: (credentials) => {
      console.log('🔑 Login attempt with:', credentials.email);
      return apiClient.post('/api/auth/login', credentials);
    },
    register: (userData) => apiClient.post('/api/auth/register', userData)
  },
  account: {
    getProfile: () => {
      console.log('👤 Getting profile...');
      return apiClient.get('/api/account/me/profile');
    },
    getAccount: (id) => apiClient.get(`/api/account/${id}`),
    updateAccount: (id, data) => apiClient.put(`/api/account/${id}`, data),
    createAccount: (data) => apiClient.post('/api/account', data),
    deleteAccount: (id) => apiClient.delete(`/api/account/${id}`)
  },
  shipments: {
    getAll: (params) => apiClient.get('/api/shipments', { params }),
    getCompleted: () => apiClient.get('/api/shipments/complete'),
    getCancelled: () => apiClient.get('/api/shipments/cancelled'),
    getById: (id) => apiClient.get(`/api/shipments/${id}`),
    create: (data) => apiClient.post('/api/shipments', data),
    update: (id, data) => apiClient.put(`/api/shipments/${id}`, data),
    delete: (id) => apiClient.delete(`/api/shipments/${id}`)
  },
  settings: {
    getCountries: (params) => apiClient.get('/api/settings/countries', { params }),
    getCountry: (id) => apiClient.get(`/api/settings/countries/${id}`),
    createCountry: (data) => apiClient.post('/api/settings/countries', data),
    updateCountry: (id, data) => apiClient.put(`/api/settings/countries/${id}`, data),
    deleteCountry: (id) => apiClient.delete(`/api/settings/countries/${id}`)
  }
};

console.log('🎯 API object created:', Object.keys(api));
console.log('🎯 API.auth.login exists:', typeof api.auth.login);
console.log('🎯 API.account.getProfile exists:', typeof api.account.getProfile);

export default api;
