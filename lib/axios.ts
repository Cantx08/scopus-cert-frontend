import axios, { AxiosError, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_FUNCTION_API_URL;
const FUNCTION_KEY = process.env.NEXT_PUBLIC_FUNCTION_KEY;

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  if (FUNCTION_KEY) {
    config.params = {
      ...(config.params || {}),
      code: FUNCTION_KEY,
    };
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ error?: string }>) => {
    const apiMessage = error?.response?.data?.error;
    const fallback = error.message || 'Error al conectar con la Function App.';
    return Promise.reject(new Error(apiMessage || fallback));
  }
);
