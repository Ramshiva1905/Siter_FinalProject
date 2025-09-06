import axios from 'axios';

console.log('🚀 TEST API: Loading...');

const apiClient = axios.create({
  baseURL: 'http://localhost:3001'
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

const api = {
  auth: {
    login: (credentials) => apiClient.post('/api/auth/login', credentials),
  },
  account: {
    getProfile: () => apiClient.get('/api/account/me/profile'),
  },
  shipments: {
    create: (data) => apiClient.post('/api/shipments', data),
  }
};

console.log('✅ TEST API: Created successfully');
console.log('🔍 TEST API: api.account exists:', !!api.account);
console.log('🔍 TEST API: api.account.getProfile exists:', !!api.account.getProfile);

export default api;
