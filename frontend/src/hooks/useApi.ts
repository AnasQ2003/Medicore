// Generic hook for fetching data from the MediCore API backend
// Usage: const { data, loading, error, refetch } = useApi(() => appointmentAPI.getAll())

import { useState, useEffect, useCallback } from 'react';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  deps: unknown[] = []
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then(res => {
        if (cancelled) return;
        if (res.success && res.data !== undefined) {
          setData(res.data);
        } else {
          setError(res.message || 'Failed to load data');
        }
      })
      .catch(err => {
        if (cancelled) return;
        console.error('API fetch error:', err);
        setError('Cannot connect to server. Please ensure the backend is running.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  return { data, loading, error, refetch };
}

export default useApi;
