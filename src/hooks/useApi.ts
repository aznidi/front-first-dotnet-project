import { useState, useCallback } from 'react';
import type { AxiosError } from 'axios';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
}

interface UseApiResult<T, P extends unknown[]> {
  data: T | null;
  loading: boolean;
  error: AxiosError | null;
  execute: (...args: P) => Promise<void>;
  reset: () => void;
}

export function useApi<T, P extends unknown[]>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T, P> {
  const { onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
        onSuccess?.(result);
      } catch (err) {
        const axiosError = err as AxiosError;
        setError(axiosError);
        onError?.(axiosError);
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
