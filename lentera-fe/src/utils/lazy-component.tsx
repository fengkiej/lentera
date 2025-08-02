import React, { lazy, Suspense } from 'react';
import { LoadingIndicator } from '@/components/loading-indicator';

/**
 * Creates a lazy-loaded component with a loading indicator
 * 
 * @param importFn - The dynamic import function that loads the component
 * @param fallback - Optional custom fallback element to show while loading
 * @returns A component with Suspense boundary and loading state
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <LoadingIndicator />
) {
  const LazyComponent = lazy(importFn);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}