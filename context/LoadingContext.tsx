'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const loadingCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetLoading = useCallback(() => {
    loadingCountRef.current = 0;
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  }, []);

  const startLoading = useCallback(() => {
    loadingCountRef.current++;
    setIsLoading(true);
    
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Set a maximum timeout to prevent stuck loading state (10 seconds)
    if (!maxTimeoutRef.current) {
      maxTimeoutRef.current = setTimeout(() => {
        loadingCountRef.current = 0;
        setIsLoading(false);
        maxTimeoutRef.current = null;
      }, 10000);
    }
  }, []);

  const stopLoading = useCallback(() => {
    loadingCountRef.current = Math.max(0, loadingCountRef.current - 1);
    
    // Use a timeout to avoid flickering when requests are fast
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (loadingCountRef.current === 0) {
        setIsLoading(false);
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current);
          maxTimeoutRef.current = null;
        }
      }
    }, 300);
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
