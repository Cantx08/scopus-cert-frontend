import axios, { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_FUNCTION_API_URL?.trim();
const RAW_FUNCTION_KEY = process.env.NEXT_PUBLIC_FUNCTION_KEY?.trim();
const FUNCTION_KEY =
  RAW_FUNCTION_KEY && !['undefined', 'null'].includes(RAW_FUNCTION_KEY.toLowerCase())
    ? RAW_FUNCTION_KEY
    : '';

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

    const headers = AxiosHeaders.from(config.headers);
    headers.set('x-functions-key', FUNCTION_KEY);
    config.headers = headers;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ error?: string }>) => {
    if (error?.response?.status === 401) {
      return Promise.reject(
        new Error(
          'No autorizado (401). Verifica NEXT_PUBLIC_FUNCTION_KEY y que la Azure Function acepte esa key.'
        )
      );
    }

    const apiMessage = error?.response?.data?.error;
    const fallback = error.message || 'Error al conectar con la Function App.';
    return Promise.reject(new Error(apiMessage || fallback));
  }
);
