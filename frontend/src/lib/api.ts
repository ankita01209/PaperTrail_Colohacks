import axios from 'axios';
import { auth } from './firebase';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const user = auth.currentUser;
      if (user) {
        try {
          // Force refresh
          const token = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, sign out
          await auth.signOut();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
