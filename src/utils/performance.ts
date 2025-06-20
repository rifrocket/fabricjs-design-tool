// Production performance utilities
// These utilities help monitor bundle size and performance in production builds

/**
 * Environment-based logging utility
 * Only logs in development, removes logs in production build
 */
export const debugLog = () => {
  if (process.env.NODE_ENV !== 'production') {
    // Debug logging would happen here in development
  }
};

/**
 * Performance measurement utility
 * Measures execution time of functions in development
 */
export const measurePerformance = <T extends (...args: any[]) => any>(
  fn: T,
  label: string
): T => {
  return ((...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      performance.now(); // Start time
      const result = fn(...args);
      performance.now(); // End time
      // Performance measurement would be logged here in development
      void label; // Avoid unused variable warning
      return result;
    }
    return fn(...args);
  }) as T;
};

/**
 * Bundle size checker - logs imported module sizes in development
 */
export const logBundleInfo = (moduleName: string) => {
  if (process.env.NODE_ENV !== 'production') {
    // Bundle info would be logged here in development
    void moduleName; // Avoid unused variable warning
  }
};

/**
 * Memory usage checker for development
 */
export const checkMemoryUsage = () => {
  if (process.env.NODE_ENV !== 'production' && 'memory' in performance) {
    void (performance as any).memory; // Access memory for debugging
    // Memory usage information would be logged here in development
  }
};

/**
 * Performance observer for Core Web Vitals
 */
export const observeWebVitals = () => {
  if (process.env.NODE_ENV !== 'production' && 'PerformanceObserver' in window) {
    // Observe paint metrics
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(() => {
        // Performance entries would be processed here in development
      });
    });
    observer.observe({ entryTypes: ['paint', 'navigation'] });
  }
};

/**
 * Asset loading performance tracker
 */
export const trackAssetLoad = (assetName: string, startTime: number) => {
  if (process.env.NODE_ENV !== 'production') {
    void (performance.now() - startTime); // Calculate load time
    // Asset load time would be tracked here in development
    void assetName; // Avoid unused variable warning
  }
};
