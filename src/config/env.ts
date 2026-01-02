export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7000/api',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;
