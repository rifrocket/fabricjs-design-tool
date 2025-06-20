# Examples

This document provides practical examples of using the FabricJS Design Tool in various scenarios.

## Table of Contents

- [Basic Canvas Setup](#basic-canvas-setup)
- [Shape Creation](#shape-creation)
- [Event Handling](#event-handling)
- [Serialization](#serialization)
- [Advanced Features](#advanced-features)
- [Integration Examples](#integration-examples)

## Basic Canvas Setup

### Vanilla JavaScript

```javascript
import { useCanvasManager } from 'fabricjs-design-tool';

// Initialize canvas manager
const canvasManager = useCanvasManager();

// Setup canvas
const canvas = canvasManager.initializeCanvas('canvas-id', {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff'
});

// Enable interactions
canvasManager.enableInteractions();
```

### React

```jsx
import React from 'react';
import { CanvasWrapper } from 'fabricjs-design-tool/ui';

function MyDesignTool() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <CanvasWrapper
        width={800}
        height={600}
        backgroundColor="#ffffff"
        onCanvasReady={(canvas) => {
          console.log('Canvas ready:', canvas);
        }}
      />
    </div>
  );
}
```

## Shape Creation

### Creating Basic Shapes

```javascript
import { shapeFactory } from 'fabricjs-design-tool';

// Rectangle
const rect = shapeFactory.createRectangle({
  left: 100,
  top: 100,
  width: 200,
  height: 150,
  fill: '#ff6b6b',
  stroke: '#000000',
  strokeWidth: 2
});

// Circle
const circle = shapeFactory.createCircle({
  left: 300,
  top: 100,
  radius: 75,
  fill: '#4ecdc4',
  stroke: '#000000',
  strokeWidth: 2
});

// Text
const text = shapeFactory.createText('Hello World!', {
  left: 500,
  top: 100,
  fontSize: 24,
  fill: '#333333',
  fontFamily: 'Arial'
});

// Add to canvas
canvasManager.addObject(rect);
canvasManager.addObject(circle);
canvasManager.addObject(text);
```

### Creating Custom Shapes

```javascript
import { fabric } from 'fabric';

// Custom shape using Fabric.js primitives
const customShape = new fabric.Group([
  new fabric.Rect({
    width: 100,
    height: 100,
    fill: '#ff6b6b'
  }),
  new fabric.Circle({
    radius: 30,
    left: 35,
    top: 35,
    fill: '#ffffff'
  })
], {
  left: 200,
  top: 200
});

canvasManager.addObject(customShape);
```

## Event Handling

### Canvas Events

```javascript
// Object selection
canvasManager.on('selection:created', (event) => {
  console.log('Object selected:', event.selected);
});

// Object modification
canvasManager.on('object:modified', (event) => {
  console.log('Object modified:', event.target);
});

// Mouse events
canvasManager.on('mouse:down', (event) => {
  console.log('Mouse down at:', event.pointer);
});
```

### Keyboard Shortcuts

```javascript
import { useCanvasKeyboardShortcuts } from 'fabricjs-design-tool';

// Enable keyboard shortcuts
const shortcuts = useCanvasKeyboardShortcuts(canvasManager);

// Custom shortcuts
shortcuts.addShortcut('ctrl+d', () => {
  const activeObject = canvasManager.getActiveObject();
  if (activeObject) {
    canvasManager.duplicateObject(activeObject);
  }
});
```

## Serialization

### Save and Load Canvas

```javascript
// Save canvas state
const canvasData = canvasManager.toJSON();
localStorage.setItem('canvas-data', JSON.stringify(canvasData));

// Load canvas state
const savedData = localStorage.getItem('canvas-data');
if (savedData) {
  canvasManager.loadFromJSON(JSON.parse(savedData));
}
```

### Export as Image

```javascript
// Export as PNG
const pngData = canvasManager.toDataURL({
  format: 'png',
  quality: 1,
  multiplier: 2 // Higher resolution
});

// Export as SVG
const svgData = canvasManager.toSVG();

// Download image
const link = document.createElement('a');
link.download = 'design.png';
link.href = pngData;
link.click();
```

## Advanced Features

### Alignment Guides

```javascript
import { useAlignmentGuides } from 'fabricjs-design-tool';

// Enable alignment guides
const alignmentGuides = useAlignmentGuides(canvasManager);

// Configure guides
alignmentGuides.configure({
  enabled: true,
  snapTolerance: 10,
  lineColor: '#ff0000',
  lineWidth: 1
});
```

### Undo/Redo

```javascript
import { historyManager } from 'fabricjs-design-tool';

// Initialize history
historyManager.initialize(canvasManager);

// Undo/Redo
historyManager.undo();
historyManager.redo();

// Check state
console.log('Can undo:', historyManager.canUndo());
console.log('Can redo:', historyManager.canRedo());
```

### Performance Optimization

```javascript
import { useOptimization } from 'fabricjs-design-tool';

// Enable optimization
const optimization = useOptimization(canvasManager);

// Configure performance settings
optimization.configure({
  renderOnAddRemove: false,
  skipTargetFind: true,
  enableRetinaScaling: false
});
```

## Integration Examples

### Vue.js Integration

```vue
<template>
  <div>
    <canvas ref="canvasRef" width="800" height="600"></canvas>
    <button @click="addRectangle">Add Rectangle</button>
  </div>
</template>

<script>
import { useCanvasManager, shapeFactory } from 'fabricjs-design-tool';

export default {
  name: 'VueDesignTool',
  mounted() {
    this.canvasManager = useCanvasManager();
    this.canvasManager.initializeCanvas(this.$refs.canvasRef);
  },
  methods: {
    addRectangle() {
      const rect = shapeFactory.createRectangle({
        left: Math.random() * 600,
        top: Math.random() * 400,
        width: 100,
        height: 100,
        fill: '#ff6b6b'
      });
      this.canvasManager.addObject(rect);
    }
  }
};
</script>
```

### Angular Integration

```typescript
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { useCanvasManager, shapeFactory } from 'fabricjs-design-tool';

@Component({
  selector: 'app-design-tool',
  template: `
    <canvas #canvasElement width="800" height="600"></canvas>
    <button (click)="addCircle()">Add Circle</button>
  `
})
export class DesignToolComponent implements OnInit {
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  private canvasManager: any;

  ngOnInit() {
    this.canvasManager = useCanvasManager();
    this.canvasManager.initializeCanvas(this.canvasElement.nativeElement);
  }

  addCircle() {
    const circle = shapeFactory.createCircle({
      left: Math.random() * 600,
      top: Math.random() * 400,
      radius: 50,
      fill: '#4ecdc4'
    });
    this.canvasManager.addObject(circle);
  }
}
```

### Next.js Integration

```jsx
// pages/design-tool.js
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const DesignTool = dynamic(() => import('../components/DesignTool'), {
  ssr: false
});

export default function DesignToolPage() {
  return (
    <div>
      <h1>My Design Tool</h1>
      <DesignTool />
    </div>
  );
}
```

```jsx
// components/DesignTool.js
import React, { useEffect, useRef } from 'react';
import { useCanvasManager } from 'fabricjs-design-tool';

export default function DesignTool() {
  const canvasRef = useRef(null);
  const canvasManagerRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      canvasManagerRef.current = useCanvasManager();
      canvasManagerRef.current.initializeCanvas(canvasRef.current);
    }
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} />
    </div>
  );
}
```

## Best Practices

### Memory Management

```javascript
// Clean up when component unmounts
useEffect(() => {
  return () => {
    if (canvasManager) {
      canvasManager.dispose();
    }
  };
}, []);
```

### Error Handling

```javascript
try {
  const shape = shapeFactory.createRectangle(invalidProps);
  canvasManager.addObject(shape);
} catch (error) {
  console.error('Failed to create shape:', error);
  // Handle error appropriately
}
```

### Performance Tips

```javascript
// Batch operations
canvasManager.discardActiveObject();
canvasManager.renderOnAddRemove = false;

// Add multiple objects
objects.forEach(obj => canvasManager.add(obj));

// Re-enable rendering
canvasManager.renderOnAddRemove = true;
canvasManager.renderAll();
```

## Common Patterns

### Custom Tool Creation

```javascript
class CustomTool {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.isActive = false;
  }

  activate() {
    this.isActive = true;
    this.canvasManager.defaultCursor = 'crosshair';
    this.canvasManager.on('mouse:down', this.handleMouseDown);
  }

  deactivate() {
    this.isActive = false;
    this.canvasManager.defaultCursor = 'default';
    this.canvasManager.off('mouse:down', this.handleMouseDown);
  }

  handleMouseDown = (event) => {
    if (!this.isActive) return;
    
    // Custom tool logic here
    console.log('Custom tool clicked at:', event.pointer);
  }
}
```

### Plugin System

```javascript
// Create a plugin
const myPlugin = {
  name: 'MyPlugin',
  install(canvasManager) {
    canvasManager.myCustomMethod = function() {
      // Custom functionality
    };
  }
};

// Use plugin
canvasManager.use(myPlugin);
```

These examples should give you a solid foundation for using the FabricJS Design Tool in various scenarios and frameworks!
