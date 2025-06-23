/**
 * Error handling utilities for the design tool
 */

export class DesignToolError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DesignToolError';
  }
}

export class CanvasError extends DesignToolError {
  constructor(message: string, details?: unknown) {
    super(message, 'CANVAS_ERROR', details);
    this.name = 'CanvasError';
  }
}

export class ShapeCreationError extends DesignToolError {
  constructor(message: string, details?: unknown) {
    super(message, 'SHAPE_CREATION_ERROR', details);
    this.name = 'ShapeCreationError';
  }
}

export class ExportError extends DesignToolError {
  constructor(message: string, details?: unknown) {
    super(message, 'EXPORT_ERROR', details);
    this.name = 'ExportError';
  }
}

/**
 * Safely execute an async operation with error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T,
  errorHandler?: (error: Error) => void
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    if (errorHandler) {
      errorHandler(err);
    } else if (process.env.NODE_ENV !== 'production') {
      console.error('Operation failed:', err);
    }
    
    return fallback;
  }
}

/**
 * Safely execute a synchronous operation with error handling
 */
export function safeSync<T>(
  operation: () => T,
  fallback?: T,
  errorHandler?: (error: Error) => void
): T | undefined {
  try {
    return operation();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    if (errorHandler) {
      errorHandler(err);
    } else if (process.env.NODE_ENV !== 'production') {
      console.error('Operation failed:', err);
    }
    
    return fallback;
  }
}

/**
 * Error boundary hook for React components
 */
export function createErrorHandler(context: string) {
  return (error: Error, fallback?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Error in ${context}:`, error);
    }
    return fallback;
  };
}
