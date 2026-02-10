'use client';

import { useEffect } from 'react';
import { useLoading } from '@/context/LoadingContext';

export function useFetchInterceptor() {
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const originalFetch = window.fetch;

    const defer = (fn: () => void) => {
      if (typeof queueMicrotask === 'function') {
        queueMicrotask(fn);
      } else {
        Promise.resolve().then(fn);
      }
    };

    const wrappedFetch: typeof fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      defer(startLoading);

      return originalFetch(input, init)
        .then((response) => {
          defer(stopLoading);
          return response;
        })
        .catch((error) => {
          defer(stopLoading);
          throw error;
        });
    };

    window.fetch = wrappedFetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, [startLoading, stopLoading]);
}
