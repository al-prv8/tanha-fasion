import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/useAuthStore';

// Dynamically resolve local network IP address in development mode
const getDevApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000`;
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = __DEV__
  ? getDevApiUrl()
  : 'http://localhost:5000'; // Fallback / production API URL

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Outbound request interceptor to append authorization token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
