# Core API Reference

This document covers the framework-agnostic core functionality that works with any JavaScript framework.

## 📦 Import

```javascript
import { 
  useCanvasManager,
  useShapeCreator,
  useCanvasPan,
  useCanvasKeyboardShortcuts,
  useAlignmentGuides,
  shapeFactory,
  canvasUtils,
  historyManager,
  EXPORT_FORMATS
} from 'fabricjs-design-tool';
```

## 🎨 Canvas Management

### `useCanvasManager(canvas, options?)`

Main hook for managing canvas state and operations.

#### Parameters
- `canvas: fabric.Canvas` - Fabric.js canvas instance
- `options?: CanvasManagerOptions` - Configuration options

#### Returns
```typescript
{
  canvas: fabric.Canvas | null;
  selectedObject: fabric.Object | null;
  zoom: number;
  isDarkMode: boolean;
  alignmentGuides: AlignmentGuidesConfig;
  
  // Methods
  selectObject: (object: fabric.Object) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  setZoom: (zoom: number) => void;
  resetZoom: () => void;
  fitToScreen: () => void;
  toggleDarkMode: () => void;
}
```

#### Example
```javascript
import { Canvas } from 'fabric';
import { useCanvasManager } from 'fabricjs-design-tool';

const canvas = new Canvas('my-canvas');
const canvasManager = useCanvasManager(canvas, {
  showGrid: true,
  gridSize: 20,
  alignmentGuides: true
});

// Select an object
canvasManager.selectObject(someObject);

// Zoom controls
canvasManager.setZoom(1.5);
canvasManager.fitToScreen();
```

### `useCanvasPan(canvas)`

Enables pan functionality with mouse/touch.

#### Example
```javascript
const panControls = useCanvasPan(canvas);

// Pan is automatically enabled
// Hold Shift + drag to pan (configurable)
```

### `useCanvasKeyboardShortcuts(canvas)`

Adds keyboard shortcuts to canvas.

#### Default Shortcuts
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Y` - Redo
- `Delete` / `Backspace` - Delete selected
- `Ctrl+C` / `Cmd+C` - Copy
- `Ctrl+V` / `Cmd+V` - Paste
- `Ctrl+A` / `Cmd+A` - Select all
- `Escape` - Deselect all

#### Example
```javascript
const shortcuts = useCanvasKeyboardShortcuts(canvas);

// Add custom shortcut
shortcuts.addShortcut({
  key: 'r',
  ctrlKey: true,
  action: () => {
    // Rotate selected object 90 degrees
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.rotate(activeObject.angle + 90);
      canvas.renderAll();
    }
  },
  description: 'Rotate 90 degrees'
});
```

## 🔷 Shape Creation

### `useShapeCreator(canvas)`

Hook for creating and adding shapes to canvas.

#### Methods
```typescript
{
  addRectangle: (options?: RectangleOptions) => void;
  addCircle: (options?: CircleOptions) => void;
  addTriangle: (options?: TriangleOptions) => void;
  addText: (text: string, options?: TextOptions) => void;
  addImage: (url: string, options?: ImageOptions) => void;
  addLine: (points: number[], options?: LineOptions) => void;
  addPolygon: (points: Point[], options?: PolygonOptions) => void;
  addQRCode: (data: string, options?: QRCodeOptions) => void;
}
```

#### Example
```javascript
const shapeCreator = useShapeCreator(canvas);

// Add shapes with default settings
shapeCreator.addRectangle();
shapeCreator.addCircle();
shapeCreator.addText('Hello World!');

// Add shapes with custom options
shapeCreator.addRectangle({
  left: 100,
  top: 100,
  width: 200,
  height: 150,
  fill: 'blue',
  stroke: 'red',
  strokeWidth: 2
});

shapeCreator.addCircle({
  left: 300,
  top: 100,
  radius: 75,
  fill: 'green'
});
```

### `shapeFactory`

Static factory methods for creating shape objects.

#### Methods
```typescript
{
  createRectangle: (options: RectangleOptions) => fabric.Rect;
  createCircle: (options: CircleOptions) => fabric.Circle;
  createTriangle: (options: TriangleOptions) => fabric.Triangle;
  createText: (text: string, options: TextOptions) => fabric.Text;
  createLine: (points: number[], options: LineOptions) => fabric.Line;
  createPolygon: (points: Point[], options: PolygonOptions) => fabric.Polygon;
  createEllipse: (options: EllipseOptions) => fabric.Ellipse;
  createArrow: (options: ArrowOptions) => fabric.Group;
  createStar: (options: StarOptions) => fabric.Polygon;
  createHeart: (options: HeartOptions) => fabric.Path;
}
```

#### Example
```javascript
import { shapeFactory } from 'fabricjs-design-tool';

// Create shapes without adding to canvas
const rect = shapeFactory.createRectangle({
  width: 100,
  height: 100,
  fill: 'red'
});

const circle = shapeFactory.createCircle({
  radius: 50,
  fill: 'blue'
});

// Add to canvas manually
canvas.add(rect, circle);
canvas.renderAll();
```

## 🎯 Alignment & Guides

### `useAlignmentGuides(canvas)`

Provides smart alignment guides and snapping.

#### Example
```javascript
const alignmentGuides = useAlignmentGuides(canvas, {
  enabled: true,
  lineColor: '#ff0000',
  lineWidth: 1,
  lineMargin: 4,
  showCenterGuides: true,
  snapToObjects: true,
  snapToCanvas: true
});

// Guides automatically appear when moving objects
```

### Alignment Utilities
```javascript
import { canvasUtils } from 'fabricjs-design-tool';

// Align selected objects
canvasUtils.alignObjects(canvas, 'left');     // left, center, right
canvasUtils.alignObjects(canvas, 'top');      // top, middle, bottom

// Distribute objects
canvasUtils.distributeObjects(canvas, 'horizontal');
canvasUtils.distributeObjects(canvas, 'vertical');

// Group/ungroup
canvasUtils.groupObjects(canvas);
canvasUtils.ungroupObjects(canvas);
```

## 💾 History Management

### `historyManager`

Undo/redo functionality for canvas operations.

#### Methods
```typescript
{
  initialize: (canvas: fabric.Canvas) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveState: () => void;
  clearHistory: () => void;
}
```

#### Example
```javascript
import { historyManager } from 'fabricjs-design-tool';

// Initialize with canvas
historyManager.initialize(canvas);

// Use undo/redo
if (historyManager.canUndo()) {
  historyManager.undo();
}

if (historyManager.canRedo()) {
  historyManager.redo();
}

// Save state manually (auto-saved on object changes)
historyManager.saveState();
```

## 📤 Export & Import

### Export Options
```javascript
import { canvasUtils, EXPORT_FORMATS } from 'fabricjs-design-tool';

// Export as image
const pngDataURL = canvasUtils.exportAs(canvas, EXPORT_FORMATS.PNG, {
  quality: 0.8,
  multiplier: 2 // Higher resolution
});

const jpegDataURL = canvasUtils.exportAs(canvas, EXPORT_FORMATS.JPEG, {
  quality: 0.9
});

// Export as SVG
const svgString = canvasUtils.exportAs(canvas, EXPORT_FORMATS.SVG);

// Export as PDF
const pdfBlob = await canvasUtils.exportAs(canvas, EXPORT_FORMATS.PDF, {
  format: 'A4',
  orientation: 'landscape'
});

// Export as JSON (for saving/loading)
const jsonData = canvasUtils.exportAs(canvas, EXPORT_FORMATS.JSON);
```

### Import Options
```javascript
// Load from JSON
canvasUtils.loadFromJSON(canvas, jsonData);

// Load image to canvas
canvasUtils.loadImage(canvas, imageUrl, {
  left: 100,
  top: 100,
  scaleX: 0.5,
  scaleY: 0.5
});
```

## 🎨 Utilities

### `canvasUtils`

Collection of canvas utility functions.

```typescript
{
  // Object manipulation
  centerObject: (canvas: Canvas, object: fabric.Object) => void;
  bringToFront: (canvas: Canvas, object?: fabric.Object) => void;
  sendToBack: (canvas: Canvas, object?: fabric.Object) => void;
  
  // Canvas operations
  clearCanvas: (canvas: Canvas) => void;
  resizeCanvas: (canvas: Canvas, width: number, height: number) => void;
  setCanvasBackground: (canvas: Canvas, color: string) => void;
  
  // Object queries
  getObjectById: (canvas: Canvas, id: string) => fabric.Object | null;
  getObjectsByType: (canvas: Canvas, type: string) => fabric.Object[];
  getAllObjects: (canvas: Canvas) => fabric.Object[];
  
  // Measurements
  getObjectBounds: (object: fabric.Object) => BoundingBox;
  getCanvasBounds: (canvas: Canvas) => BoundingBox;
  getDistance: (point1: Point, point2: Point) => number;
}
```

## 🔧 Performance

### `useOptimization()`

Performance optimization utilities.

```javascript
import { useOptimization } from 'fabricjs-design-tool';

const {
  useDebounce,
  useThrottle,
  useRenderPerformance,
  useOptimizedStyles
} = useOptimization();

// Debounce function calls
const debouncedSearch = useDebounce((query) => {
  // Search logic
}, 300);

// Throttle expensive operations
const throttledResize = useThrottle(() => {
  // Resize logic
}, 100);

// Monitor render performance
const logRenderTime = useRenderPerformance();
// Call logRenderTime() after render
```

## 📋 Type Definitions

### Core Types
```typescript
interface CanvasState {
  canvas: fabric.Canvas | null;
  selectedObject: fabric.Object | null;
  zoom: number;
  isDarkMode: boolean;
  alignmentGuides?: AlignmentGuidesConfig;
}

interface Point {
  x: number;
  y: number;
}

interface BoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

type ObjectType = 
  | 'text' 
  | 'rect' 
  | 'circle' 
  | 'triangle' 
  | 'line' 
  | 'image' 
  | 'polygon'
  | 'ellipse'
  | 'arrow'
  | 'star'
  | 'heart';

interface ShapeConfig {
  left?: number;
  top?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  selectable?: boolean;
  evented?: boolean;
}
```

## 🔌 Events

### Canvas Events
```javascript
// Listen to canvas events
canvas.on('selection:created', (e) => {
  console.log('Object selected:', e.selected);
});

canvas.on('object:modified', (e) => {
  console.log('Object modified:', e.target);
  historyManager.saveState(); // Save to history
});

canvas.on('path:created', (e) => {
  console.log('Path created:', e.path);
});
```

### Custom Events
```javascript
import { EventEmitter } from 'events';

const canvasEvents = new EventEmitter();

// Listen for custom events
canvasEvents.on('shape:added', (shape) => {
  console.log('Shape added:', shape);
});

// Emit custom events
canvasEvents.emit('shape:added', newShape);
```

For more examples and advanced usage, see our [Examples Documentation](./examples.md).
