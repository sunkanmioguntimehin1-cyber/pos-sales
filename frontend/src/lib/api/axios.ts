import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://pos-server-hmxz.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.error || 'An error occurred';

      switch (status) {
        case 401:
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
          }
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          toast.error('Access denied.');
          break;
        case 404:
          toast.error(message);
          break;
        case 422:
          toast.error(message);
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(message);
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('Something went wrong.');
    }

    return Promise.reject(error);
  }
);

export default api;

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
