# FabricJS Design Tool

> A comprehensive, modern design tool built with Fabric.js and React - ready for production use in any JavaScript framework.

[![npm version](https://badge.fury.io/js/%40rifrocket%2Ffabric-design-editor.svg)](https://badge.fury.io/js/%40rifrocket%2Ffabric-design-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## ✨ Features

- 🎨 **Rich Canvas Editing** - Complete design tool with shapes, text, images
- 🔧 **Framework Agnostic Core** - Use with React, Vue, Angular, or vanilla JS
- ⚛️ **React Components** - Pre-built UI components for React apps
- 📱 **Responsive Design** - Works on desktop and mobile
- � **TypeScript Support** - Full type definitions included
- 🚀 **Production Ready** - Optimized builds and tree-shaking
- 📦 **Modular Architecture** - Import only what you need

## 🚀 Quick Start

### Installation

```bash
npm install @rifrocket/fabric-design-editor
```

### Basic Usage (Any Framework)

```javascript
import { useCanvasManager, shapeFactory } from '@rifrocket/fabric-design-editor';

// Initialize canvas
const canvasManager = useCanvasManager();

// Create shapes
const rect = shapeFactory.createRectangle({
  left: 100,
  top: 100,
  fill: 'red',
  width: 100,
  height: 100
});

// Add to canvas
canvasManager.addObject(rect);
```

### React Components

```jsx
import React from 'react';
import { 
  CanvasWrapper, 
  Header, 
  LeftSidebar, 
  RightSidebar 
} from '@rifrocket/fabric-design-editor/ui';

function DesignApp() {
  return (
    <div className="design-app">
      <Header />
      <div className="design-layout">
        <LeftSidebar />
        <CanvasWrapper />
        <RightSidebar />
      </div>
    </div>
  );
}
```

## 📚 Documentation

- [📖 **Getting Started**](./docs/getting-started.md) - Installation, setup, and basic usage
- [🎨 **Core API Reference**](./docs/core-api.md) - Framework-agnostic API documentation
- [⚛️ **React Components**](./docs/react-components.md) - React UI components reference
- [� **Examples**](./docs/examples.md) - Practical usage examples and code snippets
- [🎨 **Customization Guide**](./docs/customization.md) - Theming, custom shapes, and plugins
- [� **Migration Guide**](./docs/migration.md) - Upgrading between versions
- [🔧 **Troubleshooting**](./docs/troubleshooting.md) - Common issues and solutions
- [🤝 **Contributing**](./CONTRIBUTING.md) - How to contribute to the project
- [📋 **Changelog**](./CHANGELOG.md) - Version history and changes

## 🎯 Architecture

This library provides two main packages from a single install:

### Core Library (`fabricjs-design-tool`)
Framework-agnostic functionality that works everywhere:
- Canvas management hooks
- Shape creation utilities
- Export/import functions
- Type definitions

### UI Components (`fabricjs-design-tool/ui`)
React-specific components for quick implementation:
- Complete design interface
- Customizable toolbar
- Property panels
- Drag-and-drop shapes

## 💡 Examples

### Vanilla JavaScript
```javascript
import { canvasUtils, shapeFactory } from '@rifrocket/fabric-design-editor';

const canvas = new fabric.Canvas('canvas');
const circle = shapeFactory.createCircle({ radius: 50 });
canvas.add(circle);
```

### Vue.js
```vue
<template>
  <canvas ref="canvasEl"></canvas>
</template>

<script>
import { useCanvasManager } from '@rifrocket/fabric-design-editor';

export default {
  setup() {
    const canvasManager = useCanvasManager();
    return { canvasManager };
  }
};
</script>
```

### React
```jsx
import { useCanvasManager, useShapeCreator } from '@rifrocket/fabric-design-editor';

function MyDesignTool() {
  const canvas = useCanvasManager();
  const shapeCreator = useShapeCreator(canvas);
  
  return (
    <div>
      <button onClick={() => shapeCreator.addRectangle()}>
        Add Rectangle
      </button>
      <canvas ref={canvas.canvasRef} />
    </div>
  );
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Development Guide](./docs/development.md) for details on:

- Setting up the development environment
- Code style and conventions
- Running tests
- Submitting pull requests

## 📄 License

MIT © [Your Name]

## 🔗 Links

- [📖 Documentation](https://rifrocket.github.io/fabricjs-design-tool/docs/)
- [🌐 Live Demo](https://rifrocket.github.io/fabricjs-design-tool/)
- [🐛 Report Issues](https://github.com/rifrocket/fabricjs-design-tool/issues)
- [💬 Discussions](https://github.com/rifrocket/fabricjs-design-tool/discussions)
- [📦 NPM Package](https://www.npmjs.com/package/@rifrocket/fabric-design-editor)

---

**Built with ❤️ using [Fabric.js](http://fabricjs.com/) and [React](https://reactjs.org/)**
