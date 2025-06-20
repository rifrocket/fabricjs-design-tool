// Canvas configuration constants
export const CANVAS_DEFAULTS = {
  WIDTH: 800,
  HEIGHT: 600,
  BACKGROUND_COLOR: '#ffffff',
  SELECTION_BORDER_COLOR: '#3b82f6',
  SELECTION_LINE_WIDTH: 2,
  SELECTION_DASH_ARRAY: [3, 3] as number[],
} as const;

// Shape defaults
export const SHAPE_DEFAULTS = {
  STROKE_WIDTH: 2,
  STROKE_COLOR: '#000000',
  SCALE: 0.5,
  TEXT_FONT_SIZE: 20,
  TEXT_FONT_FAMILY: 'Arial',
} as const;

// History management
export const HISTORY_LIMIT = 20;

// Timeout delays
export const TIMEOUTS = {
  UPDATE_OBJECTS: 50,
  SAVE_STATE: 100,
  INITIAL_SAMPLE: 500,
} as const;

// Performance constants
export const PERFORMANCE = {
  DEBOUNCE_DELAY: 300,
  RENDER_THROTTLE: 16, // 60fps
  LARGE_CANVAS_THRESHOLD: 2000,
  MAX_OBJECTS_WARNING: 100,
} as const;

// Bundle optimization constants
export const BUNDLE = {
  CHUNK_SIZE_WARNING: 1024 * 1024, // 1MB
  ICON_TREE_SHAKING: true,
  LAZY_LOAD_THRESHOLD: 3,
} as const;

// UI Constants
export const UI = {
  SIDEBAR_WIDTH: 256, // 16rem in px
  HEADER_HEIGHT: 56, // 3.5rem in px
  TOOLBAR_HEIGHT: 48, // 3rem in px
} as const;

// Export formats
export const EXPORT_FORMATS = ['png', 'jpeg', 'svg', 'json', 'pdf'] as const;
export type ExportFormat = typeof EXPORT_FORMATS[number];

// Canvas layers
export type CanvasLayer = 'front' | 'back';

// Tool types
export const TOOLS = {
  SELECT: 'select',
  TEXT: 'text',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  LINE: 'line',
  IMAGE: 'image',
} as const;

export type Tool = typeof TOOLS[keyof typeof TOOLS];
