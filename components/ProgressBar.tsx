'use client';

import { useLoading } from '@/context/LoadingContext';
import { useEffect, useState } from 'react';

export default function ProgressBar() {
  const { isLoading } = useLoading();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(10);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) {
            return prev + Math.random() * 30;
          }
          return prev;
        });
      }, 200);

      // Safety timeout: if still loading after 8 seconds, force close
      const safetyTimeout = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 500);
      }, 8000);

      return () => {
        clearInterval(interval);
        clearTimeout(safetyTimeout);
      };
    } else {
      setProgress(100);
      const timeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);
  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500 shadow-lg transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow:
            progress < 100
              ? '0 0 10px rgba(168, 85, 247, 0.8)'
              : 'none'
        }}
      />
    </div>
  );
}
