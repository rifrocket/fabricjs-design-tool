# React Components Reference

This document covers the pre-built React UI components available in `fabricjs-design-tool/ui`.

## 📦 Import

```jsx
import { 
  CanvasWrapper,
  Header,
  LeftSidebar,
  RightSidebar,
  BottomToolbar,
  QRCodeDialog,
  ShapeDialog,
  KeyboardShortcutsModal
} from 'fabricjs-design-tool/ui';
```

## 🖼️ Main Components

### `<CanvasWrapper />`

The main canvas component that wraps Fabric.js functionality.

#### Props
```typescript
interface CanvasWrapperProps {
  width?: number;           // Canvas width (default: 800)
  height?: number;          // Canvas height (default: 600)
  backgroundColor?: string; // Canvas background (default: '#ffffff')
  className?: string;       // CSS class
  style?: React.CSSProperties;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  onSelectionChange?: (selected: fabric.Object[]) => void;
  onObjectModified?: (object: fabric.Object) => void;
}
```

#### Example
```jsx
import React, { useState } from 'react';
import { CanvasWrapper } from 'fabricjs-design-tool/ui';

function MyApp() {
  const [canvas, setCanvas] = useState(null);
  
  return (
    <CanvasWrapper
      width={1000}
      height={700}
      backgroundColor="#f5f5f5"
      onCanvasReady={setCanvas}
      onSelectionChange={(objects) => {
        console.log('Selected:', objects);
      }}
      style={{ border: '1px solid #ddd' }}
    />
  );
}
```

### `<Header />`

Top toolbar with common actions and tools.

#### Props
```typescript
interface HeaderProps {
  canvas?: fabric.Canvas;
  onExport?: (format: ExportFormat) => void;
  onImport?: (file: File) => void;
  showLogo?: boolean;
  customActions?: ToolConfig[];
  className?: string;
}
```

#### Example
```jsx
import { Header } from 'fabricjs-design-tool/ui';

function App() {
  const handleExport = (format) => {
    console.log('Exporting as:', format);
  };
  
  const customActions = [
    {
      tool: 'custom',
      icon: MyIcon,
      onClick: () => console.log('Custom action'),
      title: 'Custom Tool'
    }
  ];
  
  return (
    <Header
      canvas={canvas}
      onExport={handleExport}
      showLogo={true}
      customActions={customActions}
    />
  );
}
```

### `<LeftSidebar />`

Left panel with shape tools and quick actions.

#### Props
```typescript
interface LeftSidebarProps {
  canvas?: fabric.Canvas;
  selectedTool?: string;
  onToolSelect?: (tool: string) => void;
  customTools?: ToolConfig[];
  showShapes?: boolean;
  showText?: boolean;
  showImages?: boolean;
  className?: string;
}
```

#### Example
```jsx
import { LeftSidebar } from 'fabricjs-design-tool/ui';

function App() {
  const [selectedTool, setSelectedTool] = useState('select');
  
  return (
    <div style={{ display: 'flex' }}>
      <LeftSidebar
        canvas={canvas}
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        showShapes={true}
        showText={true}
        showImages={false}
      />
      {/* Rest of your app */}
    </div>
  );
}
```

### `<RightSidebar />`

Right panel with object properties and settings.

#### Props
```typescript
interface RightSidebarProps {
  canvas?: fabric.Canvas;
  selectedObject?: fabric.Object;
  onPropertyChange?: (property: string, value: any) => void;
  showObjectProperties?: boolean;
  showCanvasProperties?: boolean;
  showLayerPanel?: boolean;
  className?: string;
}
```

#### Example
```jsx
import { RightSidebar } from 'fabricjs-design-tool/ui';

function App() {
  const [selectedObject, setSelectedObject] = useState(null);
  
  const handlePropertyChange = (property, value) => {
    if (selectedObject) {
      selectedObject.set(property, value);
      canvas.renderAll();
    }
  };
  
  return (
    <RightSidebar
      canvas={canvas}
      selectedObject={selectedObject}
      onPropertyChange={handlePropertyChange}
      showObjectProperties={true}
      showCanvasProperties={true}
      showLayerPanel={true}
    />
  );
}
```

### `<BottomToolbar />`

Bottom toolbar with zoom controls and status information.

#### Props
```typescript
interface BottomToolbarProps {
  canvas?: fabric.Canvas;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  showZoomControls?: boolean;
  showCoordinates?: boolean;
  showObjectCount?: boolean;
  className?: string;
}
```

#### Example
```jsx
import { BottomToolbar } from 'fabricjs-design-tool/ui';

function App() {
  const [zoom, setZoom] = useState(1);
  
  return (
    <BottomToolbar
      canvas={canvas}
      zoom={zoom}
      onZoomChange={setZoom}
      showZoomControls={true}
      showCoordinates={true}
      showObjectCount={true}
    />
  );
}
```

## 🔧 Dialog Components

### `<QRCodeDialog />`

Dialog for creating and customizing QR codes.

#### Props
```typescript
interface QRCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (qrCode: fabric.Object) => void;
  defaultData?: string;
  defaultOptions?: QRCodeOptions;
}
```

#### Example
```jsx
import { QRCodeDialog } from 'fabricjs-design-tool/ui';

function App() {
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  
  const handleQRGenerate = (qrCodeObject) => {
    canvas.add(qrCodeObject);
    canvas.renderAll();
    setQrDialogOpen(false);
  };
  
  return (
    <>
      <button onClick={() => setQrDialogOpen(true)}>
        Add QR Code
      </button>
      
      <QRCodeDialog
        isOpen={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        onGenerate={handleQRGenerate}
        defaultData="https://example.com"
      />
    </>
  );
}
```

### `<ShapeDialog />`

Dialog for creating custom shapes with advanced options.

#### Props
```typescript
interface ShapeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateShape: (shape: fabric.Object) => void;
  shapeType: ObjectType;
  defaultOptions?: ShapeConfig;
}
```

#### Example
```jsx
import { ShapeDialog } from 'fabricjs-design-tool/ui';

function App() {
  const [shapeDialogOpen, setShapeDialogOpen] = useState(false);
  const [shapeType, setShapeType] = useState('rect');
  
  return (
    <ShapeDialog
      isOpen={shapeDialogOpen}
      onClose={() => setShapeDialogOpen(false)}
      onCreateShape={(shape) => {
        canvas.add(shape);
        canvas.renderAll();
        setShapeDialogOpen(false);
      }}
      shapeType={shapeType}
      defaultOptions={{
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2
      }}
    />
  );
}
```

### `<KeyboardShortcutsModal />`

Modal displaying available keyboard shortcuts.

#### Props
```typescript
interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: KeyboardShortcut[];
  showCategories?: boolean;
}
```

#### Example
```jsx
import { KeyboardShortcutsModal } from 'fabricjs-design-tool/ui';

function App() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setShortcutsOpen(true)}>
        Show Shortcuts
      </button>
      
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        showCategories={true}
      />
    </>
  );
}
```

## 🎨 Complete Layout Example

Here's how to put it all together:

```jsx
import React, { useState, useCallback } from 'react';
import {
  CanvasWrapper,
  Header,
  LeftSidebar,
  RightSidebar,
  BottomToolbar,
  QRCodeDialog,
  ShapeDialog,
  KeyboardShortcutsModal
} from 'fabricjs-design-tool/ui';

function DesignApp() {
  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [zoom, setZoom] = useState(1);
  
  // Dialog states
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [shapeDialogOpen, setShapeDialogOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  
  const handleCanvasReady = useCallback((fabricCanvas) => {
    setCanvas(fabricCanvas);
    
    // Listen for selection changes
    fabricCanvas.on('selection:created', (e) => {
      setSelectedObject(e.selected[0]);
    });
    
    fabricCanvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected[0]);
    });
    
    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });
  }, []);
  
  const handleExport = useCallback((format) => {
    if (!canvas) return;
    
    // Export logic here
    console.log('Exporting as:', format);
  }, [canvas]);
  
  return (
    <div className="design-app">
      {/* Header */}
      <Header
        canvas={canvas}
        onExport={handleExport}
        onShowShortcuts={() => setShortcutsOpen(true)}
      />
      
      {/* Main content */}
      <div className="design-body">
        {/* Left sidebar */}
        <LeftSidebar
          canvas={canvas}
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          onShowQRDialog={() => setQrDialogOpen(true)}
          onShowShapeDialog={() => setShapeDialogOpen(true)}
        />
        
        {/* Canvas area */}
        <div className="canvas-container">
          <CanvasWrapper
            width={800}
            height={600}
            onCanvasReady={handleCanvasReady}
            onSelectionChange={(objects) => {
              setSelectedObject(objects[0] || null);
            }}
          />
        </div>
        
        {/* Right sidebar */}
        <RightSidebar
          canvas={canvas}
          selectedObject={selectedObject}
          onPropertyChange={(property, value) => {
            if (selectedObject) {
              selectedObject.set(property, value);
              canvas.renderAll();
            }
          }}
        />
      </div>
      
      {/* Bottom toolbar */}
      <BottomToolbar
        canvas={canvas}
        zoom={zoom}
        onZoomChange={setZoom}
      />
      
      {/* Dialogs */}
      <QRCodeDialog
        isOpen={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        onGenerate={(qrCode) => {
          canvas.add(qrCode);
          canvas.renderAll();
          setQrDialogOpen(false);
        }}
      />
      
      <ShapeDialog
        isOpen={shapeDialogOpen}
        onClose={() => setShapeDialogOpen(false)}
        onCreateShape={(shape) => {
          canvas.add(shape);
          canvas.renderAll();
          setShapeDialogOpen(false);
        }}
        shapeType="rect"
      />
      
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}

export default DesignApp;
```

## 🎨 Styling

### CSS Classes

All components accept a `className` prop and use consistent CSS classes:

```css
/* Main components */
.canvas-wrapper { /* CanvasWrapper */ }
.design-header { /* Header */ }
.design-sidebar-left { /* LeftSidebar */ }
.design-sidebar-right { /* RightSidebar */ }
.design-toolbar-bottom { /* BottomToolbar */ }

/* Tool buttons */
.tool-button { /* Tool buttons */ }
.tool-button--active { /* Active tool */ }
.tool-button--disabled { /* Disabled tool */ }

/* Property panels */
.property-panel { /* Property sections */ }
.property-input { /* Property inputs */ }
.property-label { /* Property labels */ }

/* Dialogs */
.dialog-overlay { /* Dialog backdrop */ }
.dialog-content { /* Dialog content */ }
.dialog-header { /* Dialog header */ }
.dialog-body { /* Dialog body */ }
.dialog-footer { /* Dialog footer */ }
```

### Custom Styling Example

```css
/* Custom theme */
.design-app {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --background-color: #f8fafc;
  --border-color: #e2e8f0;
  --text-color: #1e293b;
}

.design-header {
  background: var(--background-color);
  border-bottom: 1px solid var(--border-color);
  padding: 12px 16px;
}

.tool-button {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.tool-button:hover {
  background: var(--primary-color);
  color: white;
}

.tool-button--active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
```

## 🔧 Customization

### Custom Tools

```jsx
const customTools = [
  {
    tool: 'stamp',
    icon: StampIcon,
    onClick: () => addStamp(),
    title: 'Add Stamp'
  },
  {
    tool: 'signature',
    icon: SignatureIcon,
    onClick: () => addSignature(),
    title: 'Add Signature'
  }
];

<LeftSidebar
  canvas={canvas}
  customTools={customTools}
  onToolSelect={handleToolSelect}
/>
```

### Custom Properties

```jsx
const CustomPropertyPanel = ({ selectedObject, onChange }) => {
  if (!selectedObject) return null;
  
  return (
    <div className="custom-properties">
      <h3>Custom Properties</h3>
      <label>
        Opacity:
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={selectedObject.opacity || 1}
          onChange={(e) => onChange('opacity', parseFloat(e.target.value))}
        />
      </label>
      <label>
        Shadow:
        <input
          type="checkbox"
          checked={!!selectedObject.shadow}
          onChange={(e) => {
            const shadow = e.target.checked 
              ? new fabric.Shadow({
                  color: 'rgba(0,0,0,0.3)',
                  blur: 10,
                  offsetX: 5,
                  offsetY: 5
                })
              : null;
            onChange('shadow', shadow);
          }}
        />
      </label>
    </div>
  );
};
```

For more advanced customization examples, see our [Development Guide](./development.md).
