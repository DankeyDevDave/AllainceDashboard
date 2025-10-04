'use client';

import { useEffect, useState, useCallback } from 'react';

interface UseInfluxDataOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseInfluxDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdate: Date | null;
}

export function useInfluxData<T>(
  endpoint: string,
  options: UseInfluxDataOptions = {}
): UseInfluxDataReturn<T> {
  const {
    refreshInterval = 30000, // 30 seconds default
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      const response = await fetch(endpoint, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      setData(json);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchData();
    
    // Set up interval for auto-refresh
    const interval = setInterval(fetchData, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [fetchData, refreshInterval, enabled]);

  return { data, loading, error, refetch: fetchData, lastUpdate };
}
