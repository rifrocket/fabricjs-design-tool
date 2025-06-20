# Customization Guide

Learn how to customize and extend the FabricJS Design Tool to fit your specific needs.

## Table of Contents

- [Theming](#theming)
- [Custom Shapes](#custom-shapes)
- [Custom Tools](#custom-tools)
- [Event System](#event-system)
- [Plugins](#plugins)
- [Styling](#styling)
- [Configuration](#configuration)

## Theming

### Basic Theme Configuration

```javascript
import { useCanvasManager } from 'fabricjs-design-tool';

const canvasManager = useCanvasManager();

// Configure theme
canvasManager.setTheme({
  canvas: {
    backgroundColor: '#f8f9fa',
    selectionColor: '#007bff',
    selectionLineWidth: 2,
    selectionDashArray: [5, 5]
  },
  controls: {
    cornerColor: '#007bff',
    cornerSize: 8,
    cornerStyle: 'circle',
    borderColor: '#007bff',
    borderOpacityWhenMoving: 0.5
  },
  grid: {
    enabled: true,
    size: 20,
    color: '#e9ecef',
    opacity: 0.5
  }
});
```

### Custom Color Palette

```javascript
const customTheme = {
  colors: {
    primary: '#6c5ce7',
    secondary: '#a29bfe',
    success: '#00b894',
    warning: '#fdcb6e',
    danger: '#e17055',
    info: '#74b9ff',
    light: '#ddd',
    dark: '#2d3436'
  },
  fonts: {
    primary: 'Inter, sans-serif',
    monospace: 'Fira Code, monospace'
  }
};

canvasManager.setTheme(customTheme);
```

### React Component Theming

```jsx
import { ThemeProvider } from 'fabricjs-design-tool/ui';

const customTheme = {
  colors: {
    primary: '#6c5ce7',
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#2d3436',
    textSecondary: '#636e72'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  }
};

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      <CanvasWrapper />
      <LeftSidebar />
      <RightSidebar />
    </ThemeProvider>
  );
}
```

## Custom Shapes

### Creating Custom Shape Classes

```javascript
import { fabric } from 'fabric';

// Custom arrow shape
class Arrow extends fabric.Group {
  constructor(options = {}) {
    const arrowHead = new fabric.Triangle({
      width: 20,
      height: 20,
      fill: options.fill || '#000',
      left: options.width - 10,
      top: (options.height - 20) / 2,
      angle: 90
    });

    const arrowBody = new fabric.Rect({
      width: options.width - 20,
      height: 8,
      fill: options.fill || '#000',
      left: 0,
      top: (options.height - 8) / 2
    });

    super([arrowBody, arrowHead], {
      left: options.left || 0,
      top: options.top || 0,
      ...options
    });

    this.type = 'arrow';
  }

  toObject() {
    return {
      ...super.toObject(),
      type: 'arrow'
    };
  }

  static fromObject(object, callback) {
    const arrow = new Arrow(object);
    callback && callback(arrow);
    return arrow;
  }
}

// Register custom shape
fabric.Arrow = Arrow;
fabric.Arrow.fromObject = Arrow.fromObject;
```

### Extending Shape Factory

```javascript
import { shapeFactory } from 'fabricjs-design-tool';

// Extend shape factory with custom shapes
shapeFactory.createArrow = function(options = {}) {
  return new Arrow({
    width: 100,
    height: 40,
    fill: '#000000',
    ...options
  });
};

shapeFactory.createStar = function(options = {}) {
  const { points = 5, innerRadius = 30, outerRadius = 60 } = options;
  
  const starPoints = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points;
    starPoints.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    });
  }

  return new fabric.Polygon(starPoints, {
    fill: '#ffff00',
    stroke: '#000000',
    strokeWidth: 2,
    left: 0,
    top: 0,
    ...options
  });
};
```

### Custom Shape with Controls

```javascript
class CustomShape extends fabric.Rect {
  constructor(options = {}) {
    super(options);
    this.type = 'customShape';
    this.customProperty = options.customProperty || 'default';
  }

  // Add custom controls
  _renderControls(ctx, styleOverride) {
    super._renderControls(ctx, styleOverride);
    
    // Custom control rendering
    if (this.isSelected()) {
      this._drawCustomControl(ctx);
    }
  }

  _drawCustomControl(ctx) {
    const wh = this._calculateCurrentDimensions();
    const width = wh.x;
    const height = wh.y;
    
    ctx.save();
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(width / 2 - 5, -15, 10, 10);
    ctx.restore();
  }

  // Custom serialization
  toObject() {
    return {
      ...super.toObject(),
      customProperty: this.customProperty
    };
  }

  static fromObject(object, callback) {
    const shape = new CustomShape(object);
    callback && callback(shape);
    return shape;
  }
}

// Register the custom shape
fabric.CustomShape = CustomShape;
fabric.CustomShape.fromObject = CustomShape.fromObject;
```

## Custom Tools

### Creating a Custom Drawing Tool

```javascript
class CustomDrawingTool {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.isDrawing = false;
    this.startPoint = null;
    this.currentShape = null;
  }

  activate() {
    this.canvasManager.selection = false;
    this.canvasManager.defaultCursor = 'crosshair';
    
    this.canvasManager.on('mouse:down', this.onMouseDown);
    this.canvasManager.on('mouse:move', this.onMouseMove);
    this.canvasManager.on('mouse:up', this.onMouseUp);
  }

  deactivate() {
    this.canvasManager.selection = true;
    this.canvasManager.defaultCursor = 'default';
    
    this.canvasManager.off('mouse:down', this.onMouseDown);
    this.canvasManager.off('mouse:move', this.onMouseMove);
    this.canvasManager.off('mouse:up', this.onMouseUp);
  }

  onMouseDown = (event) => {
    this.isDrawing = true;
    this.startPoint = event.pointer;
    
    // Create initial shape
    this.currentShape = new fabric.Rect({
      left: this.startPoint.x,
      top: this.startPoint.y,
      width: 0,
      height: 0,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
      selectable: false
    });
    
    this.canvasManager.add(this.currentShape);
  }

  onMouseMove = (event) => {
    if (!this.isDrawing || !this.currentShape) return;
    
    const pointer = event.pointer;
    const width = Math.abs(pointer.x - this.startPoint.x);
    const height = Math.abs(pointer.y - this.startPoint.y);
    
    this.currentShape.set({
      width: width,
      height: height,
      left: Math.min(this.startPoint.x, pointer.x),
      top: Math.min(this.startPoint.y, pointer.y)
    });
    
    this.canvasManager.renderAll();
  }

  onMouseUp = () => {
    if (!this.isDrawing || !this.currentShape) return;
    
    this.isDrawing = false;
    this.currentShape.selectable = true;
    this.currentShape = null;
    this.startPoint = null;
  }
}

// Usage
const customTool = new CustomDrawingTool(canvasManager);
customTool.activate();
```

### Tool Manager

```javascript
class ToolManager {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.tools = new Map();
    this.activeTool = null;
  }

  registerTool(name, tool) {
    this.tools.set(name, tool);
  }

  activateTool(name) {
    if (this.activeTool) {
      this.activeTool.deactivate();
    }
    
    const tool = this.tools.get(name);
    if (tool) {
      this.activeTool = tool;
      tool.activate();
    }
  }

  deactivateCurrentTool() {
    if (this.activeTool) {
      this.activeTool.deactivate();
      this.activeTool = null;
    }
  }
}

// Usage
const toolManager = new ToolManager(canvasManager);
toolManager.registerTool('rectangle', new RectangleTool(canvasManager));
toolManager.registerTool('circle', new CircleTool(canvasManager));
toolManager.registerTool('custom', new CustomDrawingTool(canvasManager));

toolManager.activateTool('rectangle');
```

## Event System

### Custom Event Handling

```javascript
class CustomEventHandler {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Canvas events
    this.canvasManager.on('object:added', this.onObjectAdded);
    this.canvasManager.on('object:removed', this.onObjectRemoved);
    this.canvasManager.on('object:modified', this.onObjectModified);
    
    // Selection events
    this.canvasManager.on('selection:created', this.onSelectionCreated);
    this.canvasManager.on('selection:updated', this.onSelectionUpdated);
    this.canvasManager.on('selection:cleared', this.onSelectionCleared);
    
    // Mouse events
    this.canvasManager.on('mouse:down', this.onMouseDown);
    this.canvasManager.on('mouse:move', this.onMouseMove);
    this.canvasManager.on('mouse:up', this.onMouseUp);
  }

  onObjectAdded = (event) => {
    console.log('Object added:', event.target);
    // Custom logic for object addition
    this.logAction('add', event.target);
  }

  onObjectRemoved = (event) => {
    console.log('Object removed:', event.target);
    // Custom logic for object removal
    this.logAction('remove', event.target);
  }

  onObjectModified = (event) => {
    console.log('Object modified:', event.target);
    // Custom logic for object modification
    this.logAction('modify', event.target);
  }

  onSelectionCreated = (event) => {
    console.log('Selection created:', event.selected);
    // Update UI to show selection properties
    this.updateSelectionPanel(event.selected);
  }

  logAction(action, object) {
    const logEntry = {
      timestamp: Date.now(),
      action: action,
      objectType: object.type,
      objectId: object.id || 'unknown'
    };
    
    // Send to analytics or logging service
    this.sendToAnalytics(logEntry);
  }

  updateSelectionPanel(selectedObjects) {
    // Update properties panel
    const properties = this.extractProperties(selectedObjects);
    this.renderPropertiesPanel(properties);
  }

  extractProperties(objects) {
    if (objects.length === 1) {
      const obj = objects[0];
      return {
        type: obj.type,
        left: obj.left,
        top: obj.top,
        width: obj.width,
        height: obj.height,
        fill: obj.fill,
        stroke: obj.stroke
      };
    }
    return { type: 'multiple', count: objects.length };
  }
}

// Usage
const eventHandler = new CustomEventHandler(canvasManager);
```

### Event Emitter Extension

```javascript
import { EventEmitter } from 'events';

class EnhancedCanvasManager extends EventEmitter {
  constructor(canvasManager) {
    super();
    this.canvasManager = canvasManager;
    this.setupProxyEvents();
  }

  setupProxyEvents() {
    // Proxy canvas events to our event emitter
    this.canvasManager.on('object:added', (event) => {
      this.emit('objectAdded', event.target);
    });

    this.canvasManager.on('object:removed', (event) => {
      this.emit('objectRemoved', event.target);
    });
  }

  // Add custom methods
  addObjectWithHistory(object) {
    this.canvasManager.add(object);
    this.emit('historyAction', {
      type: 'add',
      object: object
    });
  }

  removeObjectWithHistory(object) {
    this.canvasManager.remove(object);
    this.emit('historyAction', {
      type: 'remove',
      object: object
    });
  }
}

// Usage
const enhancedManager = new EnhancedCanvasManager(canvasManager);

enhancedManager.on('objectAdded', (object) => {
  console.log('Object added with enhanced handler:', object);
});

enhancedManager.on('historyAction', (action) => {
  console.log('History action:', action);
});
```

## Plugins

### Plugin Architecture

```javascript
class PluginManager {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.plugins = new Map();
  }

  registerPlugin(name, plugin) {
    if (this.plugins.has(name)) {
      throw new Error(`Plugin ${name} is already registered`);
    }

    this.plugins.set(name, plugin);
    
    // Initialize plugin
    if (plugin.install) {
      plugin.install(this.canvasManager);
    }
  }

  unregisterPlugin(name) {
    const plugin = this.plugins.get(name);
    if (plugin && plugin.uninstall) {
      plugin.uninstall(this.canvasManager);
    }
    this.plugins.delete(name);
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  hasPlugin(name) {
    return this.plugins.has(name);
  }
}
```

### Example Plugin: Grid System

```javascript
const GridPlugin = {
  name: 'grid',
  version: '1.0.0',
  
  install(canvasManager) {
    this.canvasManager = canvasManager;
    this.gridSize = 20;
    this.gridEnabled = false;
    
    // Add grid methods to canvas manager
    canvasManager.showGrid = this.showGrid.bind(this);
    canvasManager.hideGrid = this.hideGrid.bind(this);
    canvasManager.setGridSize = this.setGridSize.bind(this);
    canvasManager.snapToGrid = this.snapToGrid.bind(this);
    
    // Setup event listeners
    canvasManager.on('object:moving', this.onObjectMoving.bind(this));
  },

  uninstall(canvasManager) {
    // Clean up
    delete canvasManager.showGrid;
    delete canvasManager.hideGrid;
    delete canvasManager.setGridSize;
    delete canvasManager.snapToGrid;
    
    canvasManager.off('object:moving', this.onObjectMoving);
  },

  showGrid() {
    this.gridEnabled = true;
    this.drawGrid();
  },

  hideGrid() {
    this.gridEnabled = false;
    this.canvasManager.renderAll();
  },

  setGridSize(size) {
    this.gridSize = size;
    if (this.gridEnabled) {
      this.drawGrid();
    }
  },

  drawGrid() {
    const canvas = this.canvasManager;
    const ctx = canvas.getContext('2d');
    
    // Grid drawing logic
    ctx.save();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  },

  snapToGrid(value) {
    return Math.round(value / this.gridSize) * this.gridSize;
  },

  onObjectMoving(event) {
    if (!this.gridEnabled) return;
    
    const obj = event.target;
    obj.set({
      left: this.snapToGrid(obj.left),
      top: this.snapToGrid(obj.top)
    });
  }
};

// Usage
const pluginManager = new PluginManager(canvasManager);
pluginManager.registerPlugin('grid', GridPlugin);

// Use plugin features
canvasManager.showGrid();
canvasManager.setGridSize(25);
```

## Styling

### CSS Custom Properties

```css
/* Define custom properties for theming */
:root {
  --canvas-bg: #f8f9fa;
  --canvas-border: #dee2e6;
  --selection-color: #007bff;
  --control-color: #007bff;
  --toolbar-bg: #ffffff;
  --toolbar-border: #dee2e6;
  --button-hover: #e9ecef;
}

/* Apply to canvas wrapper */
.canvas-wrapper {
  background-color: var(--canvas-bg);
  border: 1px solid var(--canvas-border);
}

/* Toolbar styling */
.toolbar {
  background-color: var(--toolbar-bg);
  border: 1px solid var(--toolbar-border);
}

.toolbar-button:hover {
  background-color: var(--button-hover);
}
```

### Styled Components (React)

```jsx
import styled from 'styled-components';

const StyledCanvasWrapper = styled.div`
  background-color: ${props => props.theme.canvas.background};
  border: 1px solid ${props => props.theme.canvas.border};
  border-radius: ${props => props.theme.borderRadius.md};
  
  .canvas-container {
    position: relative;
    overflow: hidden;
  }
  
  .canvas-overlay {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 10;
  }
`;

const StyledToolbar = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

// Usage
function CustomCanvas({ theme }) {
  return (
    <ThemeProvider theme={theme}>
      <StyledCanvasWrapper>
        <StyledToolbar>
          {/* Toolbar content */}
        </StyledToolbar>
        <CanvasWrapper />
      </StyledCanvasWrapper>
    </ThemeProvider>
  );
}
```

## Configuration

### Advanced Configuration

```javascript
const advancedConfig = {
  // Canvas settings
  canvas: {
    enableRetinaScaling: true,
    allowTouchScrolling: false,
    selection: true,
    preserveObjectStacking: true,
    renderOnAddRemove: true,
    skipTargetFind: false,
    imageSmoothingEnabled: true,
    enablePointerEvents: true
  },
  
  // Performance settings
  performance: {
    maxObjects: 1000,
    enableVirtualization: true,
    throttleRendering: 16, // ms
    enableRequestAnimationFrame: true,
    skipOffscreen: true
  },
  
  // Interaction settings
  interaction: {
    hoverCursor: 'move',
    moveCursor: 'move',
    defaultCursor: 'default',
    freeDrawingCursor: 'crosshair',
    rotationCursor: 'crosshair',
    notAllowedCursor: 'not-allowed'
  },
  
  // Object defaults
  objectDefaults: {
    transparentCorners: false,
    cornerColor: '#178BCA',
    cornerStrokeColor: '#178BCA',
    cornerStyle: 'rect',
    cornerSize: 12,
    padding: 0,
    hasRotatingPoint: true,
    rotatingPointOffset: 40,
    snapAngle: 45,
    snapThreshold: 5
  },
  
  // Event settings
  events: {
    enableKeyboard: true,
    enableMouse: true,
    enableTouch: true,
    fireRightClick: true,
    fireMiddleClick: true,
    stopContextMenu: true
  }
};

// Apply configuration
canvasManager.configure(advancedConfig);
```

### Environment-Specific Configuration

```javascript
const getConfig = (environment) => {
  const baseConfig = {
    canvas: {
      enableRetinaScaling: true,
      selection: true
    }
  };

  switch (environment) {
    case 'development':
      return {
        ...baseConfig,
        debug: true,
        performance: {
          enableVirtualization: false,
          throttleRendering: 0
        }
      };
      
    case 'production':
      return {
        ...baseConfig,
        debug: false,
        performance: {
          enableVirtualization: true,
          throttleRendering: 16,
          maxObjects: 5000
        }
      };
      
    case 'mobile':
      return {
        ...baseConfig,
        canvas: {
          ...baseConfig.canvas,
          allowTouchScrolling: true,
          enableRetinaScaling: false
        },
        performance: {
          enableVirtualization: true,
          throttleRendering: 32,
          maxObjects: 500
        }
      };
      
    default:
      return baseConfig;
  }
};

// Usage
const config = getConfig(process.env.NODE_ENV);
canvasManager.configure(config);
```

This customization guide provides comprehensive examples for extending and customizing the FabricJS Design Tool to meet your specific requirements!
