# Migration Guide

This guide helps you migrate from other design tools or upgrade from previous versions of the FabricJS Design Tool.

## Table of Contents

- [From Fabric.js Vanilla](#from-fabricjs-vanilla)
- [From Konva.js](#from-konvajs)
- [From Paper.js](#from-paperjs)
- [Version Upgrades](#version-upgrades)
- [Breaking Changes](#breaking-changes)

## From Fabric.js Vanilla

If you're already using Fabric.js directly, migrating to this library is straightforward:

### Before (Vanilla Fabric.js)

```javascript
import { fabric } from 'fabric';

// Initialize canvas
const canvas = new fabric.Canvas('canvas-id');

// Create objects
const rect = new fabric.Rect({
  left: 100,
  top: 100,
  width: 200,
  height: 100,
  fill: 'red'
});

canvas.add(rect);
```

### After (FabricJS Design Tool)

```javascript
import { useCanvasManager, shapeFactory } from 'fabricjs-design-tool';

// Initialize canvas manager
const canvasManager = useCanvasManager();
canvasManager.initializeCanvas('canvas-id');

// Create objects using shape factory
const rect = shapeFactory.createRectangle({
  left: 100,
  top: 100,
  width: 200,
  height: 100,
  fill: 'red'
});

canvasManager.addObject(rect);
```

### Migration Benefits

- **Better TypeScript support** - Full type definitions
- **Built-in utilities** - Undo/redo, alignment guides, keyboard shortcuts
- **Performance optimizations** - Automatic optimizations for large canvases
- **React components** - Pre-built UI components if needed
- **Consistent API** - Standardized method names and patterns

### Step-by-Step Migration

1. **Install the library**:
   ```bash
   npm install fabricjs-design-tool
   ```

2. **Replace canvas initialization**:
   ```javascript
   // Old
   const canvas = new fabric.Canvas('canvas-id');
   
   // New
   const canvasManager = useCanvasManager();
   canvasManager.initializeCanvas('canvas-id');
   ```

3. **Update object creation**:
   ```javascript
   // Old
   const rect = new fabric.Rect(props);
   
   // New
   const rect = shapeFactory.createRectangle(props);
   ```

4. **Update method calls**:
   ```javascript
   // Old
   canvas.add(object);
   canvas.remove(object);
   canvas.clear();
   
   // New
   canvasManager.addObject(object);
   canvasManager.removeObject(object);
   canvasManager.clear();
   ```

5. **Enable new features**:
   ```javascript
   import { useAlignmentGuides, useCanvasKeyboardShortcuts, historyManager } from 'fabricjs-design-tool';
   
   // Add alignment guides
   useAlignmentGuides(canvasManager);
   
   // Add keyboard shortcuts
   useCanvasKeyboardShortcuts(canvasManager);
   
   // Add undo/redo
   historyManager.initialize(canvasManager);
   ```

## From Konva.js

Konva.js users will find familiar concepts with some API differences:

### Key Differences

| Concept | Konva.js | FabricJS Design Tool |
|---------|----------|---------------------|
| Stage | `new Konva.Stage()` | `useCanvasManager().initializeCanvas()` |
| Layer | `new Konva.Layer()` | Built-in canvas management |
| Shapes | `new Konva.Rect()` | `shapeFactory.createRectangle()` |
| Events | `shape.on('click', fn)` | `canvasManager.on('object:selected', fn)` |

### Migration Example

```javascript
// Konva.js
const stage = new Konva.Stage({
  container: 'container',
  width: 800,
  height: 600
});

const layer = new Konva.Layer();
const rect = new Konva.Rect({
  x: 100,
  y: 100,
  width: 200,
  height: 100,
  fill: 'red'
});

layer.add(rect);
stage.add(layer);

// FabricJS Design Tool
const canvasManager = useCanvasManager();
canvasManager.initializeCanvas('container', { width: 800, height: 600 });

const rect = shapeFactory.createRectangle({
  left: 100,
  top: 100,
  width: 200,
  height: 100,
  fill: 'red'
});

canvasManager.addObject(rect);
```

## From Paper.js

Paper.js users will need to adjust to the object-oriented approach:

### Key Differences

| Concept | Paper.js | FabricJS Design Tool |
|---------|----------|---------------------|
| View | `paper.view` | `canvasManager` |
| Path | `new paper.Path()` | Custom fabric objects |
| Tool | `new paper.Tool()` | Event handlers |
| Project | `paper.project` | Canvas state |

### Migration Example

```javascript
// Paper.js
paper.setup('canvas-id');
const rect = new paper.Rectangle(new paper.Point(100, 100), new paper.Size(200, 100));
const path = new paper.Path.Rectangle(rect);
path.fillColor = 'red';

// FabricJS Design Tool
const canvasManager = useCanvasManager();
canvasManager.initializeCanvas('canvas-id');

const rect = shapeFactory.createRectangle({
  left: 100,
  top: 100,
  width: 200,
  height: 100,
  fill: 'red'
});

canvasManager.addObject(rect);
```

## Version Upgrades

### From v1.x to v2.x

#### Breaking Changes

1. **API Standardization**:
   ```javascript
   // v1.x
   canvasManager.add(object);
   
   // v2.x
   canvasManager.addObject(object);
   ```

2. **Event Names**:
   ```javascript
   // v1.x
   canvasManager.on('object:added', handler);
   
   // v2.x
   canvasManager.on('object:created', handler);
   ```

3. **Import Changes**:
   ```javascript
   // v1.x
   import { CanvasManager } from 'fabricjs-design-tool';
   
   // v2.x
   import { useCanvasManager } from 'fabricjs-design-tool';
   ```

#### Migration Steps

1. **Update imports**:
   ```bash
   # Find and replace in your codebase
   find . -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's/CanvasManager/useCanvasManager/g'
   ```

2. **Update method calls**:
   ```javascript
   // Create a migration script
   const migrations = {
     'add(': 'addObject(',
     'remove(': 'removeObject(',
     'object:added': 'object:created',
     'object:removed': 'object:deleted'
   };
   
   // Apply migrations to your codebase
   ```

3. **Test thoroughly**:
   ```bash
   npm test
   ```

### From v2.x to v3.x

#### New Features

- **Enhanced TypeScript support**
- **Better tree-shaking**
- **Performance improvements**
- **New React hooks**

#### Migration Steps

1. **Update package.json**:
   ```json
   {
     "dependencies": {
       "fabricjs-design-tool": "^3.0.0"
     }
   }
   ```

2. **Use new hooks** (optional):
   ```javascript
   // New performance hook
   import { useOptimization } from 'fabricjs-design-tool';
   
   const optimization = useOptimization(canvasManager);
   optimization.enableAutoOptimization();
   ```

3. **Update TypeScript types** (if using TypeScript):
   ```typescript
   // Better type inference
   const rect = shapeFactory.createRectangle({
     // TypeScript will now provide better autocomplete
     left: 100,
     top: 100,
     width: 200,
     height: 100
   });
   ```

## Breaking Changes

### v2.0.0

- **Removed**: `CanvasManager` class constructor
- **Added**: `useCanvasManager()` hook
- **Changed**: Event names standardized
- **Changed**: Method names standardized

### v3.0.0

- **Removed**: Legacy compatibility layer
- **Added**: Enhanced TypeScript definitions
- **Changed**: Bundle structure for better tree-shaking
- **Changed**: React components now require React 18+

## Migration Tools

### Automated Migration Script

Create a migration script to help with bulk changes:

```javascript
// migrate.js
const fs = require('fs');
const path = require('path');

const migrations = {
  // v1 to v2 migrations
  'new CanvasManager()': 'useCanvasManager()',
  'canvasManager.add(': 'canvasManager.addObject(',
  'canvasManager.remove(': 'canvasManager.removeObject(',
  'object:added': 'object:created',
  'object:removed': 'object:deleted',
  
  // v2 to v3 migrations
  'import { CanvasManager }': 'import { useCanvasManager }',
  'CanvasManager': 'useCanvasManager'
};

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  Object.entries(migrations).forEach(([from, to]) => {
    content = content.replace(new RegExp(from, 'g'), to);
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`Migrated: ${filePath}`);
}

// Usage
const filesToMigrate = [
  './src/**/*.js',
  './src/**/*.ts',
  './src/**/*.jsx',
  './src/**/*.tsx'
];

// Run migration
filesToMigrate.forEach(pattern => {
  // Use glob or similar to find files matching pattern
  // migrateFile(file);
});
```

### Validation Script

Validate your migration:

```javascript
// validate-migration.js
const { execSync } = require('child_process');

try {
  // Run TypeScript compiler
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript validation passed');
  
  // Run tests
  execSync('npm test', { stdio: 'inherit' });
  console.log('✅ Tests passed');
  
  // Run linter
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting passed');
  
  console.log('🎉 Migration validation successful!');
} catch (error) {
  console.error('❌ Migration validation failed:', error.message);
  process.exit(1);
}
```

## Getting Help

If you encounter issues during migration:

1. **Check the changelog** for detailed breaking changes
2. **Review the examples** in the documentation
3. **Open an issue** on GitHub with your migration question
4. **Join the community discussions** for help from other users

## Post-Migration Checklist

- [ ] Update all imports
- [ ] Update method calls
- [ ] Update event handlers
- [ ] Run TypeScript compiler
- [ ] Run tests
- [ ] Update documentation
- [ ] Test in production environment
- [ ] Monitor for runtime errors
- [ ] Update CI/CD pipelines if needed

Remember to test thoroughly after migration and consider running both versions in parallel during a transition period if possible.
