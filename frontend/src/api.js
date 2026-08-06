import axios from 'axios';
import { getCurrentNic } from './identity';

// Spring Boot backend — see portmap.txt (8081/8082 are the DRP/DMT mock APIs).
const api = axios.create({
  baseURL: 'http://localhost:8085/api',
});

api.interceptors.request.use((config) => {
  // The roadside enforcement endpoints are gated by a 5-minute, single-stop
  // session token (the privacy lockout), not by the caller's identity.
  const sessionToken = localStorage.getItem('sessionToken');
  // Everything after /enforcement/search is scoped to that one stop, so it must
  // carry the session token rather than the caller's identity.
  const isEnforcementSessionCall =
    config.url.startsWith('/enforcement/details') ||
    config.url.startsWith('/enforcement/citation') ||
    config.url.startsWith('/enforcement/seizure');

  if (isEnforcementSessionCall && sessionToken) {
    config.headers.Authorization = `Bearer ${sessionToken}`;
  } else {
    // No login yet — the active persona is the identity. DevIdentityFilter on
    // the backend turns this header into a real Spring Security context.
    // HANDOVER NOTE: replace with `Bearer ${token}` when login lands.
    config.headers['X-User-Nic'] = getCurrentNic();
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // An expired enforcement session is expected — drop the stale token so the
    // officer can start a new stop. Never reload the page (there is no login
    // to return to, and reloading would wipe in-progress citation data).
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('sessionToken');
    }
    return Promise.reject(error);
  }
);

export default api;
