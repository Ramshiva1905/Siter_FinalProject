import axios from 'axios';

console.log('🚀 API Service: Starting to load...');

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001'
});

console.log('🌐 API Client base URL set to:', apiClient.defaults.baseURL);

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ 401 Authentication Error');
    }
    return Promise.reject(error);
  }
);

console.log('🔍 API Service: Creating API object...');

// Create API object
const api = {
  auth: {
    login: (credentials) => apiClient.post('/api/auth/login', credentials),
    register: (userData) => apiClient.post('/api/auth/register', userData),
    verifyEmail: (token) => apiClient.get(`/api/auth/verify-email/${token}`),
    setup2FA: () => apiClient.post('/api/auth/setup-2fa'),
    verify2FA: (token) => apiClient.post('/api/auth/verify-2fa', { token }),
    disable2FA: () => apiClient.post('/api/auth/disable-2fa')
  },
  account: {
    getProfile: () => apiClient.get('/api/account/me/profile'),
    getAccount: (id) => apiClient.get(`/api/account/${id}`),
    updateAccount: (id, data) => apiClient.put(`/api/account/${id}`, data),
    createAccount: (data, isUpgrade = false) => 
      apiClient.post(`/api/account${isUpgrade ? '?upgrade=true' : ''}`, data),
    deleteAccount: (id) => apiClient.delete(`/api/account/${id}`)
  },
  shipments: {
    getAll: (params) => apiClient.get('/api/shipments', { params }),
    getCompleted: () => apiClient.get('/api/shipments/complete'),
    getCancelled: () => apiClient.get('/api/shipments/cancelled'),
    getById: (id) => apiClient.get(`/api/shipments/${id}`),
    getByCustomer: (customerId) => apiClient.get(`/api/shipments/customer/${customerId}`),
    create: (data) => apiClient.post('/api/shipments', data),
    update: (id, data) => apiClient.put(`/api/shipments/${id}`, data),
    delete: (id) => apiClient.delete(`/api/shipments/${id}`)
  },
  settings: {
    getCountries: (params) => apiClient.get('/api/settings/countries', { params }),
    getCountry: (id) => apiClient.get(`/api/settings/countries/${id}`),
    createCountry: (data) => apiClient.post('/api/settings/countries', data),
    updateCountry: (id, data) => apiClient.put(`/api/settings/countries/${id}`, data),
    deleteCountry: (id) => apiClient.delete(`/api/settings/countries/${id}`),
    getStatistics: (params) => apiClient.get('/api/settings/statistics', { params })
  }
};

console.log('✅ API Service: API object created successfully');
console.log('🔍 API Service: api type:', typeof api);
console.log('🔍 API Service: api keys:', Object.keys(api));
console.log('🔍 API Service: api.account exists:', !!api.account);
console.log('🔍 API Service: api.account type:', typeof api.account);
console.log('🔍 API Service: api.account keys:', api.account ? Object.keys(api.account) : 'undefined');
console.log('🔍 API Service: api.account.getProfile exists:', !!api.account?.getProfile);

export default api;
