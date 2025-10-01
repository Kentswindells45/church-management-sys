import React, { useEffect, useRef } from 'react';

interface PerformanceWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PerformanceWrapper({ children, className }: PerformanceWrapperProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      // Optimize rendering
      elementRef.current.style.contentVisibility = 'auto';
      elementRef.current.style.containIntrinsicSize = '0 500px';
    }
  }, []);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}