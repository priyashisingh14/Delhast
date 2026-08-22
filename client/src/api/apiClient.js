import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Send HttpOnly refresh cookies automatically
  headers: {
    'Content-Type': 'application/json'
  }
});

let accessTokenInMemory = (() => {
  try {
    return localStorage.getItem('delhast_auth_token') || null;
  } catch {
    return null;
  }
})();

export const setAccessToken = (token) => {
  accessTokenInMemory = token;
  try {
    if (token) {
      localStorage.setItem('delhast_auth_token', token);
    } else {
      localStorage.removeItem('delhast_auth_token');
    }
  } catch {}
};

export const getAccessToken = () => {
  return accessTokenInMemory;
};

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config) => {
    if (accessTokenInMemory && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessTokenInMemory}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Seamless Token Refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints themselves (e.g. signin, refresh, signup)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/signin') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/email/') ||
      originalRequest.url?.includes('/auth/signup/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.accessToken;
        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
