# FabricJS Design Tool

<div align="center">
  <img src="./docs/logo-large.svg" alt="FabricJS Design Tool" width="500"/>
</div>

> A comprehensive, modern design tool built with Fabric.js and React - ready for production use in any JavaScript framework.

[![npm version](https://badge.fury.io/js/%40rifrocket%2Ffabricjs-design-tool.svg)](https://badge.fury.io/js/%40rifrocket%2Ffabricjs-design-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## ✨ Features

- 🎨 **Rich Canvas Editing** - Complete design tool with shapes, text, images
- 🔧 **Framework Agnostic Core** - Use with React, Vue, Angular, or vanilla JS
- ⚛️ **React Components** - Pre-built UI components for React apps
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔒 **TypeScript Support** - Full type definitions included
- 🚀 **Production Ready** - Optimized builds and tree-shaking
- 📦 **Modular Architecture** - Import only what you need

## 🚀 Quick Start

### Installation

```bash
npm install @rifrocket/fabricjs-design-tool
```

### Basic Usage (Any Framework)

```javascript
import { useCanvasManager, shapeFactory } from '@rifrocket/fabricjs-design-tool';

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
} from '@rifrocket/fabricjs-design-tool/ui';

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

- [📖 **Getting Started**](https://rifrocket.github.io/fabricjs-design-tool/docs/getting-started.html) - Installation, setup, and basic usage
- [🎨 **Core API Reference**](https://rifrocket.github.io/fabricjs-design-tool/docs/core-api.html) - Framework-agnostic API documentation
- [⚛️ **React Components**](https://rifrocket.github.io/fabricjs-design-tool/docs/react-components.html) - React UI components reference
- [🎨 **Customization Guide**](https://rifrocket.github.io/fabricjs-design-tool/docs/customization.html) - Theming, custom shapes, and plugins
- [ **Troubleshooting**](https://rifrocket.github.io/fabricjs-design-tool/docs/troubleshooting.html) - Common issues and solutions
- [🤝 **Contributing**](https://rifrocket.github.io/fabricjs-design-tool/docs/contributing.html) - Complete setup guide and development workflow
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

## 🤝 Contributing

We welcome contributions! Please see our [**Contributing Guide**](https://rifrocket.github.io/fabricjs-design-tool/docs/contributing.html) for comprehensive details on:

### 🚀 Quick Setup
```bash
git clone https://github.com/YOUR_USERNAME/fabricjs-design-tool.git
cd fabricjs-design-tool
npm install
npm run dev
```

### 📋 Available Commands
- `npm run dev` - Start development server
- `npm run build:lib` - Build library for distribution
- `npm run lint` - Check code quality
- `npm run lint:fix` - Auto-fix linting issues
- `npm run clean` - Clean build artifacts

### 🚀 Automated Deployment
This project uses GitHub Actions for automated deployment:

- **GitHub Pages**: Auto-deploys documentation and demo on every push to `main`
- **NPM Publishing**: Auto-publishes to npm when `package.json` version changes
- **Releases**: Auto-creates GitHub releases with tags when version changes

To publish a new version:
1. Update the version in `package.json`
2. Push to `main` branch
3. GitHub Actions handles the rest automatically!

### 🏗️ Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

For detailed setup instructions, project structure, code style guidelines, and testing procedures, please read the [**Contributing Guide**](https://rifrocket.github.io/fabricjs-design-tool/docs/contributing.html).

## 📄 License

MIT © [Your Name]

## 🔗 Links

- [📖 Documentation](https://rifrocket.github.io/fabricjs-design-tool/docs/)
- [🌐 Live Demo](https://rifrocket.github.io/fabricjs-design-tool/)
- [🐛 Report Issues](https://github.com/rifrocket/fabricjs-design-tool/issues)
- [📦 NPM Package](https://www.npmjs.com/package/@rifrocket/fabricjs-design-tool)

---

**Built with ❤️ using [Fabric.js](http://fabricjs.com/) and [React](https://reactjs.org/)**
