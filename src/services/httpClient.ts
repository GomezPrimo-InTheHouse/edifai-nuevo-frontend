

import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from '../app/store/auth.store';
import { env } from '../app/config/env';

// ── Función para renovar el token ────────────────────────────
const callRefreshToken = async (): Promise<string> => {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) throw new Error('No hay refreshToken');

  const { data } = await axios.post(
    `${env.authApiUrl}/auth/refresh-token`,
    { refreshToken }
  );
  return data.accessToken;
};

const forceLogout = () => {
  useAuthStore.getState().logout();
  window.location.href = '/login';
};

// ── Interceptores compartidos ────────────────────────────────
const attachInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config) => {
      const accessToken = useAuthStore.getState().accessToken;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      const isAuthEndpoint =
        originalRequest.url?.includes('/auth/refresh-token') ||
        originalRequest.url?.includes('/auth/login');

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !isAuthEndpoint
      ) {
        originalRequest._retry = true;
        try {
          const newToken = await callRefreshToken();
          useAuthStore.getState().setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch {
          forceLogout();
          return Promise.reject(error);
        }
      }

      if (
        error.response?.status === 403 &&
        originalRequest.url?.includes('/auth/refresh-token')
      ) {
        forceLogout();
        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
  );
};

// ── Instancia única sin baseURL ───────────────────────────────
// Todos los servicios usan URLs absolutas (env.xxxApiUrl + path)
const httpClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
  // ← sin baseURL
});

attachInterceptors(httpClient);

// Exportar también como httpClientAbsolute para no romper imports existentes
export const httpClientAbsolute = httpClient;
export default httpClient;