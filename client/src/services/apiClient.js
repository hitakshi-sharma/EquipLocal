import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

let refreshPromise = null;

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to request header
api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh token on 401 error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.startsWith('/auth/') &&
      !originalRequest?.url?.startsWith('auth/')
    ) {
      originalRequest._retry = true;

      try {
        // Start single refresh request
        if (!refreshPromise) {
          refreshPromise = axios
            .post(
              `${BASE_URL}/auth/refresh-token`,
              {},
              { withCredentials: true }
            )
            .then((res) => {
              const newToken = res.data.data.accessToken;
              Cookies.set('accessToken', newToken, {
                expires: 1,
                secure:
                  typeof window !== 'undefined' &&
                  window.location.protocol === 'https:',
                sameSite: 'Strict',
              });
              return newToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        // Wait for new token and retry request
        const newToken = await refreshPromise;
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return api(originalRequest);
      } catch (refreshError) {
        try {
          await axios.post(
            `${BASE_URL}/auth/logout`,
            {},
            { withCredentials: true }
          );
        } catch {}

        Cookies.remove('accessToken');

        // Redirect to login only from protected pages
        const pathname =
          typeof window !== 'undefined' ? window.location.pathname : '';
        if (
          typeof window !== 'undefined' &&
          pathname !== '/' &&
          pathname !== '/user/equipment' &&
          !pathname.startsWith('/login')
        ) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Generic request helper
export async function request(endpoint, options = {}) {
  const response = await api.request({ url: endpoint, ...options });
  return response.data;
}

export default api;
