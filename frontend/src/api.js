import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // For enforcement details, we use the sessionToken if available
  const sessionToken = localStorage.getItem('sessionToken');
  
  if (config.url.startsWith('/enforcement/details') || config.url.startsWith('/enforcement/citation')) {
      if (sessionToken) {
          config.headers.Authorization = `Bearer ${sessionToken}`;
      }
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to auto-clear expired or invalid tokens (401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('role');
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
