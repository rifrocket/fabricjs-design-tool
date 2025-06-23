// Main library exports - Core functionality
// This file exports everything that external projects need

// Hooks
export * from './hooks/useCanvasManager';
export * from './hooks/useCanvasPan';
export * from './hooks/useCanvasKeyboardShortcuts';
export * from './hooks/useAlignmentGuides';
export * from './hooks/useOptimization';
export * from './hooks/useShapeCreator';

// Utilities
export * from './utils/canvasUtils';
export * from './utils/historyManager';
export * from './utils/shapeFactory';
export * from './utils/performance';
export * from './utils/helpers';
export * from './utils/smoothAlignmentGuides';
export * from './utils/advancedQRGenerator';
export * from './utils/fabricUndoRedo';
export * from './utils/errorHandling';

// Constants
export { EXPORT_FORMATS } from './utils/constants';

// Types
export type {
  CanvasState,
  CanvasObject,
  ObjectType,
  AlignmentGuidesConfig,
  HistoryState,
  CanvasDimensions,
  QRCodeOptions,
  QRCodeContent,
  AlignmentType,
  ShapeConfig,
  ExportOptions
} from './types/canvas';

export type {
  HeaderActions,
  ToolConfig,
  ExportFormat
} from './types/header';
