# Getting Started

Welcome to FabricJS Design Tool! This guide will help you get up and running quickly.

## 📦 Installation

### NPM
```bash
npm install fabricjs-design-tool
```

### Yarn
```bash
yarn add fabricjs-design-tool
```

### PNPM
```bash
pnpm add fabricjs-design-tool
```

## 🚀 Quick Setup

### For Any Framework (Core Only)

If you're using Vue, Angular, Svelte, or vanilla JavaScript:

```javascript
import { useCanvasManager, shapeFactory } from 'fabricjs-design-tool';

// Initialize canvas
const canvasElement = document.getElementById('my-canvas');
const canvas = new fabric.Canvas(canvasElement);

// Use utilities
const rect = shapeFactory.createRectangle({
  left: 50,
  top: 50,
  width: 100,
  height: 100,
  fill: 'blue'
});

canvas.add(rect);
```

### For React Applications (Full UI)

If you're using React and want the complete interface:

```jsx
import React from 'react';
import { 
  CanvasWrapper, 
  Header, 
  LeftSidebar, 
  RightSidebar 
} from 'fabricjs-design-tool/ui';

function App() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex' }}>
        <LeftSidebar />
        <CanvasWrapper />
        <RightSidebar />
      </div>
    </div>
  );
}

export default App;
```

## 🎨 Basic Canvas Setup

### 1. HTML Structure
```html
<!DOCTYPE html>
<html>
<head>
  <title>My Design Tool</title>
</head>
<body>
  <div id="app">
    <canvas id="design-canvas" width="800" height="600"></canvas>
  </div>
</body>
</html>
```

### 2. JavaScript Setup
```javascript
import { Canvas } from 'fabric';
import { useCanvasManager, shapeFactory } from 'fabricjs-design-tool';

// Initialize Fabric.js canvas
const canvas = new Canvas('design-canvas');

// Use the canvas manager for enhanced functionality
const canvasManager = useCanvasManager(canvas);

// Add some shapes
const circle = shapeFactory.createCircle({
  left: 100,
  top: 100,
  radius: 50,
  fill: 'red'
});

const text = shapeFactory.createText('Hello World!', {
  left: 200,
  top: 100,
  fontSize: 24
});

canvas.add(circle, text);
```

## ⚛️ React Integration

### Basic React Component
```jsx
import React, { useRef, useEffect } from 'react';
import { Canvas } from 'fabric';
import { useCanvasManager, useShapeCreator } from 'fabricjs-design-tool';

function BasicDesignTool() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = React.useState(null);
  
  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new Canvas(canvasRef.current);
      setCanvas(fabricCanvas);
      
      return () => {
        fabricCanvas.dispose();
      };
    }
  }, []);
  
  const canvasManager = useCanvasManager(canvas);
  const shapeCreator = useShapeCreator(canvas);
  
  return (
    <div>
      <div>
        <button onClick={() => shapeCreator.addRectangle()}>
          Add Rectangle
        </button>
        <button onClick={() => shapeCreator.addCircle()}>
          Add Circle
        </button>
        <button onClick={() => shapeCreator.addText('Sample Text')}>
          Add Text
        </button>
      </div>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600}
        style={{ border: '1px solid #ccc' }}
      />
    </div>
  );
}
```

### Using Pre-built Components
```jsx
import React from 'react';
import { CanvasWrapper } from 'fabricjs-design-tool/ui';

function SimpleApp() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <CanvasWrapper 
        width={800}
        height={600}
        backgroundColor="#f5f5f5"
      />
    </div>
  );
}
```

## 🔧 Configuration Options

### Canvas Configuration
```javascript
import { useCanvasManager } from 'fabricjs-design-tool';

const canvasManager = useCanvasManager(canvas, {
  // Enable grid
  showGrid: true,
  gridSize: 20,
  
  // Enable alignment guides
  alignmentGuides: true,
  
  // Enable keyboard shortcuts
  keyboardShortcuts: true,
  
  // Canvas settings
  backgroundColor: '#ffffff',
  selection: true,
  preserveObjectStacking: true
});
```

### Shape Factory Options
```javascript
import { shapeFactory } from 'fabricjs-design-tool';

// Rectangle with custom options
const rect = shapeFactory.createRectangle({
  left: 100,
  top: 100,
  width: 200,
  height: 150,
  fill: 'blue',
  stroke: 'red',
  strokeWidth: 2,
  rx: 10, // rounded corners
  ry: 10
});

// Circle with gradient
const circle = shapeFactory.createCircle({
  left: 300,
  top: 100,
  radius: 75,
  fill: new fabric.Gradient({
    type: 'radial',
    coords: { x1: 0, y1: 0, x2: 0, y2: 0, r1: 0, r2: 75 },
    colorStops: [
      { offset: 0, color: '#ff0000' },
      { offset: 1, color: '#0000ff' }
    ]
  })
});
```

## 📱 Responsive Design

### Making Canvas Responsive
```javascript
import { canvasUtils } from 'fabricjs-design-tool';

function makeCanvasResponsive(canvas) {
  function resizeCanvas() {
    const container = canvas.getElement().parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    canvas.setDimensions({
      width: containerWidth,
      height: containerHeight
    });
    
    canvas.renderAll();
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas(); // Initial resize
}
```

### CSS for Responsive Layout
```css
.design-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.design-header {
  height: 60px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.design-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.design-sidebar {
  width: 250px;
  background: #fafafa;
  border-right: 1px solid #ddd;
}

.design-canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.design-canvas {
  position: absolute;
  top: 0;
  left: 0;
}
```

## 🎯 Next Steps

Now that you have the basics set up, explore these guides:

- [🎨 **Core API Reference**](./core-api.md) - All available functions and hooks
- [⚛️ **React Components**](./react-components.md) - Complete UI components
- [📋 **Examples**](./examples.md) - Real-world implementation examples
- [🔧 **Development Guide**](./development.md) - Customization and extension

## ❓ Common Issues

### Canvas Not Rendering
```javascript
// Make sure to call renderAll() after adding objects
canvas.add(object);
canvas.renderAll(); // ← Important!
```

### TypeScript Errors
```bash
# Install type definitions if needed
npm install --save-dev @types/fabric
```

### Module Not Found
```javascript
// Make sure you're importing from the correct path
import { useCanvasManager } from 'fabricjs-design-tool'; // ✅ Core
import { CanvasWrapper } from 'fabricjs-design-tool/ui';  // ✅ UI Components
```

Need help? Check our [Examples](./examples.md) or [open an issue](https://github.com/yourusername/fabricjs-design-tool/issues)!
