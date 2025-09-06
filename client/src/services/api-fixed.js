import axios from 'axios';

// Set base URL for all API requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log(`🔐 Making ${config.method?.toUpperCase()} request to ${config.url} with token`);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log(`🚫 Making ${config.method?.toUpperCase()} request to ${config.url} without token`);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
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
      
      // Don't remove token or redirect automatically - let's debug first
      console.error('🚨 DASHBOARD AUTO-LOGOUT PREVENTED - Check the error above');
      console.log('📝 To manually clear token: localStorage.removeItem("token")');
      
      // Temporarily disable auto-redirect
      // localStorage.removeItem('token');
      // setTimeout(() => {
      //   window.location.href = '/login';
      // }, 3000);
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth endpoints
  auth: {
    login: (credentials) => axios.post('/api/auth/login', credentials),
    register: (userData) => axios.post('/api/auth/register', userData),
    verifyEmail: (token) => axios.get(`/api/auth/verify-email/${token}`),
    setup2FA: () => axios.post('/api/auth/setup-2fa'),
    verify2FA: (token) => axios.post('/api/auth/verify-2fa', { token }),
    disable2FA: () => axios.post('/api/auth/disable-2fa')
  },

  // Account endpoints
  account: {
    getProfile: () => axios.get('/api/account/me/profile'),
    getAccount: (id) => axios.get(`/api/account/${id}`),
    updateAccount: (id, data) => axios.put(`/api/account/${id}`, data),
    createAccount: (data, isUpgrade = false) => 
      axios.post(`/api/account${isUpgrade ? '?upgrade=true' : ''}`, data),
    deleteAccount: (id) => axios.delete(`/api/account/${id}`)
  },

  // Shipment endpoints
  shipments: {
    getAll: (params) => axios.get('/api/shipments', { params }),
    getCompleted: () => axios.get('/api/shipments/complete'),
    getCancelled: () => axios.get('/api/shipments/cancelled'),
    getById: (id) => axios.get(`/api/shipments/${id}`),
    getByCustomer: (customerId) => axios.get(`/api/shipments/customer/${customerId}`),
    create: (data) => axios.post('/api/shipments', data),
    update: (id, data) => axios.put(`/api/shipments/${id}`, data),
    delete: (id) => axios.delete(`/api/shipments/${id}`)
  },

  // Settings endpoints
  settings: {
    getCountries: (params) => axios.get('/api/settings/countries', { params }),
    getCountry: (id) => axios.get(`/api/settings/countries/${id}`),
    createCountry: (data) => axios.post('/api/settings/countries', data),
    updateCountry: (id, data) => axios.put(`/api/settings/countries/${id}`, data),
    deleteCountry: (id) => axios.delete(`/api/settings/countries/${id}`),
    getStatistics: (params) => axios.get('/api/settings/statistics', { params })
  }
};

export default api;
