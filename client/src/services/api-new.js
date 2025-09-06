import axios from 'axios';

console.log('🚀 API Service: Starting to load...');

// Create an axios instance with explicit base URL
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001'
});

console.log('🌐 API Client base URL set to:', apiClient.defaults.baseURL);

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const fullUrl = config.baseURL + config.url;
    if (token) {
      console.log(`🔐 Making ${config.method?.toUpperCase()} request to ${fullUrl} with token`);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log(`🚫 Making ${config.method?.toUpperCase()} request to ${fullUrl} without token`);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ 401 Authentication Error Details:', {
        status: error.response?.status,
        message: error.response?.data?.error || error.message,
        url: error.config?.url,
        method: error.config?.method,
        fullResponse: error.response?.data
      });
      
      // Show token info for debugging
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          console.error('🔍 Token Info:', {
            userId: payload.userId,
            issuedAt: new Date(payload.iat * 1000).toLocaleString(),
            expiresAt: new Date(payload.exp * 1000).toLocaleString(),
            isExpired: payload.exp < now,
            timeLeft: payload.exp < now ? 'EXPIRED' : Math.floor((payload.exp - now) / 3600) + ' hours'
          });
        } catch (e) {
          console.error('❌ Cannot decode token:', e.message);
        }
      }
      
      console.error('🚨 AUTHENTICATION ERROR - Check the error above');
    }
    return Promise.reject(error);
  }
);

console.log('🔍 API Service: Creating API object...');

export const api = {
  // Auth endpoints
  auth: {
    login: (credentials) => apiClient.post('/api/auth/login', credentials),
    register: (userData) => apiClient.post('/api/auth/register', userData),
    verifyEmail: (token) => apiClient.get(`/api/auth/verify-email/${token}`),
    setup2FA: () => apiClient.post('/api/auth/setup-2fa'),
    verify2FA: (token) => apiClient.post('/api/auth/verify-2fa', { token }),
    disable2FA: () => apiClient.post('/api/auth/disable-2fa')
  },

  // Account endpoints
  account: {
    getProfile: () => apiClient.get('/api/account/me/profile'),
    getAccount: (id) => apiClient.get(`/api/account/${id}`),
    updateAccount: (id, data) => apiClient.put(`/api/account/${id}`, data),
    createAccount: (data, isUpgrade = false) => 
      apiClient.post(`/api/account${isUpgrade ? '?upgrade=true' : ''}`, data),
    deleteAccount: (id) => apiClient.delete(`/api/account/${id}`)
  },

  // Shipment endpoints
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

  // Settings endpoints
  settings: {
    getCountries: (params) => apiClient.get('/api/settings/countries', { params }),
    getCountry: (id) => apiClient.get(`/api/settings/countries/${id}`),
    createCountry: (data) => apiClient.post('/api/settings/countries', data),
    updateCountry: (id, data) => apiClient.put(`/api/settings/countries/${id}`, data),
    deleteCountry: (id) => apiClient.delete(`/api/settings/countries/${id}`),
    getStatistics: (params) => apiClient.get('/api/settings/statistics', { params })
  }
};

console.log('✅ API Service: API object created successfully:', api);
console.log('🔍 API Service: API.account exists:', !!api.account);
console.log('🔍 API Service: API.account.getProfile exists:', !!api.account.getProfile);

export default api;
