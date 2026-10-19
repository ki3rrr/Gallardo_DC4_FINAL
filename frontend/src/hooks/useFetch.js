import { useCallback, useEffect, useState } from 'react';
import { parseError } from '../services/api';

/**
 * Fetches data with loading + error state.
 *   const { data, meta, loading, error, reload } = useFetch(() => booksApi.list(params), [params]);
 * Works with Laravel resource collections ({ data, meta }) and single resources ({ data }).
 */
export default function useFetch(requestFn, deps = []) {
  const [state, setState] = useState({ data: null, meta: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    requestFn()
      .then((res) => {
        if (cancelled) return;
        setState({ data: res.data.data, meta: res.data.meta ?? null, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ data: null, meta: null, loading: false, error: parseError(err).message });
      });

    return () => {
      cancelled = true; // ignore stale responses when filters change quickly
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { ...state, reload };
}
