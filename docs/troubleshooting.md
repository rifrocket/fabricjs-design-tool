# Troubleshooting Guide

This guide helps you resolve common issues when using the FabricJS Design Tool.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Canvas Problems](#canvas-problems)
- [Performance Issues](#performance-issues)
- [React Integration](#react-integration)
- [TypeScript Issues](#typescript-issues)
- [Build Problems](#build-problems)
- [Common Errors](#common-errors)

## Installation Issues

### npm install fails

**Problem**: Package installation fails with various errors.

**Solutions**:

1. **Clear npm cache**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use specific Node.js version**:
   ```bash
   # Use Node.js 16 LTS or later
   nvm use 16
   npm install
   ```

3. **Check peer dependencies**:
   ```bash
   npm ls --depth=0
   npm install --save-dev @types/react @types/react-dom
   ```

### Package not found error

**Problem**: `Module 'fabricjs-design-tool' not found`

**Solutions**:

1. **Verify installation**:
   ```bash
   npm list fabricjs-design-tool
   ```

2. **Reinstall package**:
   ```bash
   npm uninstall fabricjs-design-tool
   npm install fabricjs-design-tool
   ```

3. **Check import path**:
   ```javascript
   // Correct imports
   import { useCanvasManager } from 'fabricjs-design-tool';
   import { CanvasWrapper } from 'fabricjs-design-tool/ui';
   
   // Incorrect
   import { CanvasWrapper } from 'fabricjs-design-tool/react';
   ```

## Canvas Problems

### Canvas not rendering

**Problem**: Canvas element appears but nothing renders.

**Diagnosis**:
```javascript
console.log('Canvas manager:', canvasManager);
console.log('Canvas instance:', canvasManager.canvas);
console.log('Canvas size:', canvasManager.getWidth(), canvasManager.getHeight());
```

**Solutions**:

1. **Check canvas initialization**:
   ```javascript
   // Ensure canvas is properly initialized
   const canvasManager = useCanvasManager();
   
   useEffect(() => {
     if (canvasRef.current) {
       canvasManager.initializeCanvas(canvasRef.current, {
         width: 800,
         height: 600
       });
     }
   }, []);
   ```

2. **Verify canvas size**:
   ```javascript
   // Set explicit dimensions
   canvasManager.setDimensions({
     width: 800,
     height: 600
   });
   ```

3. **Check CSS styles**:
   ```css
   .canvas-container {
     width: 800px;
     height: 600px;
     border: 1px solid #ccc; /* Visual debugging */
   }
   
   .canvas-container canvas {
     display: block;
   }
   ```

### Objects not appearing

**Problem**: Objects are added but don't appear on canvas.

**Solutions**:

1. **Force render**:
   ```javascript
   canvasManager.addObject(object);
   canvasManager.renderAll(); // Force re-render
   ```

2. **Check object properties**:
   ```javascript
   console.log('Object properties:', object.toObject());
   console.log('Object visibility:', object.visible);
   console.log('Object position:', object.left, object.top);
   ```

3. **Verify object is within canvas bounds**:
   ```javascript
   const rect = shapeFactory.createRectangle({
     left: 100, // Ensure positive values
     top: 100,
     width: 100,
     height: 100,
     fill: '#ff0000' // Ensure visible fill
   });
   ```

### Selection not working

**Problem**: Objects cannot be selected or moved.

**Solutions**:

1. **Enable selection**:
   ```javascript
   canvasManager.selection = true;
   object.selectable = true;
   object.evented = true;
   ```

2. **Check object layers**:
   ```javascript
   // Bring object to front
   canvasManager.bringToFront(object);
   ```

3. **Verify event handlers**:
   ```javascript
   canvasManager.on('selection:created', (e) => {
     console.log('Selection created:', e.selected);
   });
   ```

## Performance Issues

### Slow rendering with many objects

**Problem**: Canvas becomes slow with many objects.

**Solutions**:

1. **Enable performance optimizations**:
   ```javascript
   import { useOptimization } from 'fabricjs-design-tool';
   
   const optimization = useOptimization(canvasManager);
   optimization.configure({
     renderOnAddRemove: false,
     skipTargetFind: true,
     enableRetinaScaling: false
   });
   ```

2. **Use object virtualization**:
   ```javascript
   // Only render visible objects
   const visibleObjects = objects.filter(obj => 
     obj.isOnScreen() && obj.visible
   );
   ```

3. **Batch operations**:
   ```javascript
   canvasManager.renderOnAddRemove = false;
   
   objects.forEach(obj => canvasManager.add(obj));
   
   canvasManager.renderOnAddRemove = true;
   canvasManager.renderAll();
   ```

### Memory leaks

**Problem**: Memory usage increases over time.

**Solutions**:

1. **Proper cleanup**:
   ```javascript
   useEffect(() => {
     return () => {
       canvasManager.dispose();
     };
   }, []);
   ```

2. **Remove event listeners**:
   ```javascript
   // Remove specific listeners
   canvasManager.off('object:added', handler);
   
   // Or remove all listeners
   canvasManager.off();
   ```

3. **Clear canvas properly**:
   ```javascript
   canvasManager.clear();
   canvasManager.renderAll();
   ```

## React Integration

### Hooks not working

**Problem**: React hooks don't work as expected.

**Solutions**:

1. **Check React version**:
   ```bash
   npm ls react
   # Ensure React 16.8+ for hooks
   ```

2. **Proper hook usage**:
   ```javascript
   // Correct
   function Component() {
     const canvasManager = useCanvasManager();
     
     useEffect(() => {
       // Setup code
     }, []);
   }
   
   // Incorrect - hooks in wrong place
   if (condition) {
     const canvasManager = useCanvasManager(); // ❌
   }
   ```

3. **Dependencies array**:
   ```javascript
   useEffect(() => {
     // Effect code
   }, [canvasManager]); // Include dependencies
   ```

### Component re-rendering issues

**Problem**: Component re-renders cause canvas to reset.

**Solutions**:

1. **Use useCallback**:
   ```javascript
   const handleCanvasReady = useCallback((canvas) => {
     // Handler code
   }, []);
   ```

2. **Memoize expensive operations**:
   ```javascript
   const canvasOptions = useMemo(() => ({
     width: 800,
     height: 600,
     backgroundColor: '#ffffff'
   }), []);
   ```

3. **Stable references**:
   ```javascript
   const canvasManagerRef = useRef();
   
   useEffect(() => {
     if (!canvasManagerRef.current) {
       canvasManagerRef.current = useCanvasManager();
     }
   }, []);
   ```

### SSR (Server-Side Rendering) issues

**Problem**: Canvas doesn't work with Next.js or SSR.

**Solutions**:

1. **Dynamic imports**:
   ```javascript
   import dynamic from 'next/dynamic';
   
   const CanvasWrapper = dynamic(
     () => import('fabricjs-design-tool/ui').then(mod => mod.CanvasWrapper),
     { ssr: false }
   );
   ```

2. **Check for browser environment**:
   ```javascript
   useEffect(() => {
     if (typeof window !== 'undefined') {
       // Canvas code here
     }
   }, []);
   ```

3. **Conditional rendering**:
   ```javascript
   const [isClient, setIsClient] = useState(false);
   
   useEffect(() => {
     setIsClient(true);
   }, []);
   
   if (!isClient) return null;
   
   return <CanvasWrapper />;
   ```

## TypeScript Issues

### Type errors

**Problem**: TypeScript compilation fails with type errors.

**Solutions**:

1. **Check type imports**:
   ```typescript
   import type { CanvasOptions, ShapeFactory } from 'fabricjs-design-tool';
   ```

2. **Explicit typing**:
   ```typescript
   const canvasManager: CanvasManager = useCanvasManager();
   const options: RectangleOptions = {
     width: 100,
     height: 100,
     fill: '#ff0000'
   };
   ```

3. **Type assertions when needed**:
   ```typescript
   const canvas = canvasManager.canvas as fabric.Canvas;
   ```

### Missing type definitions

**Problem**: TypeScript can't find type definitions.

**Solutions**:

1. **Install type definitions**:
   ```bash
   npm install --save-dev @types/fabric
   ```

2. **Create custom types**:
   ```typescript
   // types/fabricjs-design-tool.d.ts
   declare module 'fabricjs-design-tool' {
     export function useCanvasManager(): any;
     // Add other exports
   }
   ```

3. **Update tsconfig.json**:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true
     }
   }
   ```

## Build Problems

### Build fails

**Problem**: Build process fails with various errors.

**Solutions**:

1. **Clear build cache**:
   ```bash
   rm -rf dist lib .cache
   npm run build
   ```

2. **Check dependencies**:
   ```bash
   npm audit fix
   npm update
   ```

3. **Verify build configuration**:
   ```javascript
   // vite.config.ts
   export default defineConfig({
     build: {
       lib: {
         entry: 'src/index.ts',
         formats: ['es', 'cjs']
       },
       rollupOptions: {
         external: ['react', 'react-dom', 'fabric']
       }
     }
   });
   ```

### Bundle size issues

**Problem**: Bundle size is too large.

**Solutions**:

1. **Tree shaking**:
   ```javascript
   // Import only what you need
   import { useCanvasManager } from 'fabricjs-design-tool';
   
   // Instead of
   import * as FabricTool from 'fabricjs-design-tool';
   ```

2. **Code splitting**:
   ```javascript
   const CanvasWrapper = lazy(() => 
     import('fabricjs-design-tool/ui').then(mod => ({ 
       default: mod.CanvasWrapper 
     }))
   );
   ```

3. **Bundle analysis**:
   ```bash
   npm run build:analyze
   # or
   npx webpack-bundle-analyzer dist/main.js
   ```

## Common Errors

### "fabric is not defined"

**Error**: `ReferenceError: fabric is not defined`

**Solution**:
```javascript
// Ensure fabric.js is properly imported
import { fabric } from 'fabric';

// Or if using CDN, check script loading order
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
```

### "Cannot read property 'canvas' of undefined"

**Error**: Canvas manager is undefined when trying to access properties.

**Solution**:
```javascript
// Add null checks
if (canvasManager && canvasManager.canvas) {
  canvasManager.addObject(object);
}

// Or use optional chaining
canvasManager?.addObject(object);
```

### "Object is not a function"

**Error**: Shape factory methods are not functions.

**Solution**:
```javascript
// Check import
import { shapeFactory } from 'fabricjs-design-tool';

// Verify method exists
console.log(typeof shapeFactory.createRectangle); // Should be 'function'

// Correct usage
const rect = shapeFactory.createRectangle({
  width: 100,
  height: 100
});
```

### Canvas rendering outside container

**Error**: Canvas renders outside its container bounds.

**Solution**:
```css
.canvas-container {
  overflow: hidden;
  position: relative;
}

.canvas-container canvas {
  max-width: 100%;
  max-height: 100%;
}
```

### Events not firing

**Error**: Canvas events don't trigger handlers.

**Solution**:
```javascript
// Ensure event listeners are added after canvas initialization
useEffect(() => {
  if (canvasManager.canvas) {
    canvasManager.on('object:added', handleObjectAdded);
    
    return () => {
      canvasManager.off('object:added', handleObjectAdded);
    };
  }
}, [canvasManager.canvas]);
```

## Debug Mode

Enable debug mode for troubleshooting:

```javascript
// Enable debug logging
window.DEBUG_FABRIC_TOOL = true;

// Or programmatically
canvasManager.setDebug(true);

// Check console for detailed logs
```

## Getting Help

If you can't resolve an issue:

1. **Check existing issues** on GitHub
2. **Create a minimal reproduction** example
3. **Include environment details** (OS, browser, versions)
4. **Post in discussions** or create an issue

### Debugging Checklist

- [ ] Check browser console for errors
- [ ] Verify all dependencies are installed
- [ ] Confirm imports are correct
- [ ] Test with minimal example
- [ ] Check TypeScript compilation
- [ ] Verify React version compatibility
- [ ] Test in different browsers
- [ ] Check for version conflicts

### Environment Information Template

When reporting issues, include:

```
- OS: macOS 12.6
- Browser: Chrome 108.0.0.0
- Node.js: 16.18.0
- npm: 8.19.2
- fabricjs-design-tool: 2.1.0
- React: 18.2.0
- TypeScript: 4.8.4
```
