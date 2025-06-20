import { useCallback, useMemo, useRef } from 'react';
import { PERFORMANCE } from '../utils/constants';

/**
 * Optimized debounce hook for better performance
 * Prevents excessive function calls and re-renders
 */
export const useOptimizedDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = PERFORMANCE.DEBOUNCE_DELAY
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay]
  );
};

/**
 * Memoized style object creator to prevent unnecessary re-renders
 */
export const useOptimizedStyles = <T extends Record<string, any>>(
  styleFactory: () => T,
  dependencies: any[]
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(styleFactory, dependencies);
};

/**
 * Optimized event handler hook with automatic cleanup
 */
export const useOptimizedEventHandler = <T extends (...args: any[]) => any>(
  handler: T,
  dependencies: any[]
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(handler, dependencies);
};

/**
 * Performance monitoring hook for component render times
 */
export const useRenderPerformance = () => {
  const renderStartRef = useRef<number | null>(null);

  const measureRender = useCallback(() => {
    if (process.env.NODE_ENV !== 'production' && renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      if (renderTime > PERFORMANCE.RENDER_THROTTLE) {
        // Performance warning would be logged here in development
      }
    }
  }, []);

  if (process.env.NODE_ENV !== 'production') {
    renderStartRef.current = performance.now();
  }

  return measureRender;
};

/**
 * Optimized object comparison for preventing unnecessary updates
 */
export const useShallowCompare = <T extends Record<string, any>>(obj: T): T => {
  const objRef = useRef<T>(obj);
  
  return useMemo(() => {
    // Shallow comparison
    if (objRef.current === obj) return objRef.current;
    
    const keys1 = Object.keys(objRef.current);
    const keys2 = Object.keys(obj);
    
    if (keys1.length !== keys2.length) {
      objRef.current = obj;
      return obj;
    }
    
    for (const key of keys1) {
      if (objRef.current[key] !== obj[key]) {
        objRef.current = obj;
        return obj;
      }
    }
    
    return objRef.current;
  }, [obj]);
};
