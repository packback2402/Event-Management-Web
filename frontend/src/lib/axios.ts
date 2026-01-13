import axios from 'axios';

// Get API base URL from environment variable
// Note: This should NOT include /api prefix as endpoints already have it
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
// ⚠️ Không set cứng 'Content-Type' ở đây để tránh lỗi khi gửi FormData (upload file)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Nếu body là FormData thì để browser tự set 'multipart/form-data'
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    } else {
      // Với các request JSON thông thường, đảm bảo Content-Type là application/json
      if (config.headers && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

