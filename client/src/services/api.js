import axios from 'axios';

const RENDER_API_URL = 'https://dr-shivalika-saraswat-dental-1.onrender.com/api';

// NOTE: Vite bakes VITE_API_URL at build time. Local .env files contain
// VITE_API_URL=/api (dev proxy). A production build made locally would
// otherwise bake "/api" in and call the static host's /api (which returns
// index.html) — so treat a bare "/api" as dev-only and fall back to Render.
const RAW_URL = (import.meta.env.VITE_API_URL || '').trim();
const API_BASE_URL =
  RAW_URL && RAW_URL !== '/api'
    ? RAW_URL
    : import.meta.env.PROD
      ? RENDER_API_URL
      : '/api';

// API origin (no trailing /api) — used to resolve relative media URLs
// (e.g. /uploads/testimonials/x.mp4) served by the backend.
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '') || RENDER_API_URL.replace(/\/api\/?$/, '');

export const mediaUrl = (u) => {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_ORIGIN}${u.startsWith('/') ? u : `/${u}`}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  // Render free tier cold-starts can take 30-60s on the first request after
  // idle. A short timeout turns that into a permanent-looking "nothing works"
  // state on the live site. Keep it generous for GETs (retried below).
  timeout: 60000,
});

// Attach JWT automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single-flight refresh — concurrent 401s share one refresh call
let refreshPromise = null;

const refreshAuth = async (failedRequest) => {
  const original = failedRequest;
  if (original._retry || !localStorage.getItem('refreshToken')) return null;
  original._retry = true;
  try {
    if (!refreshPromise) {
      refreshPromise = axios
        .post(`${API_BASE_URL}/auth/refresh`, { refreshToken: localStorage.getItem('refreshToken') })
        .finally(() => { refreshPromise = null; });
    }
    const { data } = await refreshPromise;
    localStorage.setItem('accessToken', data.data.accessToken);
    if (data.data.refreshToken) localStorage.setItem('refreshToken', data.data.refreshToken);
    original.headers.Authorization = `Bearer ${data.data.accessToken}`;
    return api(original);
  } catch {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

// Single response interceptor: cold-start retry for GETs + token refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};

    // 1) Retry idempotent GETs once on network failure / timeout / 5xx.
    // This is what makes the live site survive a Render cold start: the first
    // request wakes the server (~30-60s), the retry then succeeds instead of
    // leaving the page permanently empty.
    const isGet = (original.method || 'get').toLowerCase() === 'get';
    const retryable =
      isGet &&
      !original._getRetried &&
      (!error.response || error.response.status >= 500 || error.code === 'ECONNABORTED');
    if (retryable) {
      original._getRetried = true;
      // Small backoff so a waking server has time to come up
      await new Promise((r) => setTimeout(r, 1500));
      return api(original);
    }

    // 2) Refresh flow on 401 (handles server-side refresh-token rotation)
    if (error.response?.status === 401) {
      const retried = await refreshAuth(original);
      if (retried) return retried;
    }
    return Promise.reject(error);
  }
);

export default api;
