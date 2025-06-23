// Fabric.js Type Extensions and Utilities
import * as fabric from 'fabric';

// Extended fabric object types with proper typing
export interface FabricObject extends fabric.Object {
  id?: string;
  customType?: string;
  originalData?: Record<string, unknown>;
}

export interface FabricCanvas extends fabric.Canvas {
  history?: {
    state: unknown[];
    currentIndex: number;
  };
  backgroundImageUrl?: string;
  customData?: Record<string, unknown>;
}

// Event types
export interface FabricEvent<T = unknown> {
  e: MouseEvent | TouchEvent;
  target?: FabricObject;
  pointer?: fabric.Point;
  transform?: fabric.Transform;
  selected?: FabricObject[];
  deselected?: FabricObject[];
  data?: T;
}

// Shape creation options
export interface ShapeOptions {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
  selectable?: boolean;
  evented?: boolean;
  [key: string]: unknown;
}

// Text options
export interface TextOptions extends ShapeOptions {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  textAlign?: string;
  underline?: boolean;
  linethrough?: boolean;
  overline?: boolean;
}

// Canvas utilities
export interface CanvasUtils {
  getActiveObject(): FabricObject | null;
  getActiveObjects(): FabricObject[];
  getObjects(): FabricObject[];
  add(object: FabricObject): void;
  remove(object: FabricObject): void;
  clear(): void;
  renderAll(): void;
  toJSON(): Record<string, unknown>;
  loadFromJSON(json: string | Record<string, unknown>, callback?: () => void): void;
}

// Performance monitoring types
export interface PerformanceMetrics {
  timestamp: number;
  operation: string;
  duration: number;
  objectCount: number;
  memoryUsage?: number;
}

export interface OptimizationConfig {
  enableObjectCaching?: boolean;
  enableCanvasCaching?: boolean;
  maxHistorySize?: number;
  debounceTime?: number;
  enablePerformanceMonitoring?: boolean;
}

// Alignment guide types
export interface AlignmentGuideOptions {
  enabled?: boolean;
  lineColor?: string;
  lineWidth?: number;
  lineMargin?: number;
  snapDistance?: number;
}

// Keyboard shortcuts
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
}

// Export utilities
export type FabricObjectType = 
  | 'rect' 
  | 'circle' 
  | 'ellipse' 
  | 'polygon' 
  | 'polyline' 
  | 'line' 
  | 'triangle' 
  | 'text' 
  | 'i-text' 
  | 'textbox' 
  | 'image' 
  | 'group' 
  | 'path'
  | 'activeSelection';

export type CanvasEvent = 
  | 'object:added'
  | 'object:removed'
  | 'object:modified'
  | 'object:selected'
  | 'selection:created'
  | 'selection:updated'
  | 'selection:cleared'
  | 'path:created'
  | 'mouse:down'
  | 'mouse:up'
  | 'mouse:move'
  | 'mouse:wheel';
