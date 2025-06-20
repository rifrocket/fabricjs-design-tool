import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from 'fabric';

interface CanvasWrapperProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvas?: Canvas | null;
  zoom: number;
  canvasDimensions?: { width: number; height: number };
  onZoomChange?: (zoom: number) => void;
  onCanvasDimensionsChange?: (dimensions: { width: number; height: number }) => void;
}

const CanvasWrapper: React.FC<CanvasWrapperProps> = ({
  canvasRef,
  canvas,
  zoom,
  canvasDimensions = { width: 800, height: 600 },
  onZoomChange,
  onCanvasDimensionsChange
}) => {
  const [viewportPosition, setViewportPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const zoomMenuRef = useRef<HTMLDivElement>(null);

  // Handle viewport panning and zooming (like Adobe Illustrator)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're currently editing text
      const activeElement = document.activeElement;
      const isEditingInput = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).contentEditable === 'true'
      );
      
      // Check if Fabric.js text is being edited
      const activeObject = canvas?.getActiveObject();
      const isEditingFabricText = activeObject && 
        activeObject.type === 'text' && 
        (activeObject as any).isEditing === true;
      
      const isEditingText = isEditingInput || isEditingFabricText;

      // Only handle space/h keys if not editing text
      if ((e.code === 'Space' || e.key.toLowerCase() === 'h') && !isEditingText) {
        e.preventDefault();
        setIsSpacePressed(true);
        document.body.style.cursor = 'grab';
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Check if we're currently editing text
      const activeElement = document.activeElement;
      const isEditingInput = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).contentEditable === 'true'
      );
      
      // Check if Fabric.js text is being edited
      const activeObject = canvas?.getActiveObject();
      const isEditingFabricText = activeObject && 
        activeObject.type === 'text' && 
        (activeObject as any).isEditing === true;
      
      const isEditingText = isEditingInput || isEditingFabricText;

      // Only handle space/h keys if not editing text
      if ((e.code === 'Space' || e.key.toLowerCase() === 'h') && !isEditingText) {
        setIsSpacePressed(false);
        document.body.style.cursor = 'default';
        setIsPanning(false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isOnCanvas = target.closest('.canvas-viewport');
      const isOnResizeHandle = target.classList.contains('resize-handle');
      const isOnZoomMenu = target.closest('.zoom-menu');
      
      // Hide zoom menu if clicking outside of it
      if (!isOnZoomMenu && showZoomMenu) {
        setShowZoomMenu(false);
      }
      
      if (isOnResizeHandle) {
        e.preventDefault();
        setIsResizing(true);
        setResizeHandle(target.dataset.handle || '');
        setLastMousePos({ x: e.clientX, y: e.clientY });
        document.body.style.cursor = target.style.cursor;
        return;
      }
      
      if (isOnCanvas && (e.ctrlKey || e.metaKey || isSpacePressed)) {
        e.preventDefault();
        setIsPanning(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
        document.body.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && resizeHandle) {
        e.preventDefault();
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        
        let newWidth = canvasDimensions.width;
        let newHeight = canvasDimensions.height;
        
        // Handle different resize directions
        if (resizeHandle.includes('e')) newWidth += deltaX;
        if (resizeHandle.includes('w')) newWidth -= deltaX;
        if (resizeHandle.includes('s')) newHeight += deltaY;
        if (resizeHandle.includes('n')) newHeight -= deltaY;
        
        // Apply minimum constraints
        newWidth = Math.max(200, newWidth);
        newHeight = Math.max(150, newHeight);
        
        onCanvasDimensionsChange?.({ width: newWidth, height: newHeight });
        setLastMousePos({ x: e.clientX, y: e.clientY });
      } else if (isPanning) {
        e.preventDefault();
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        
        setViewportPosition(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      setIsResizing(false);
      setResizeHandle('');
      if (document.body.style.cursor === 'grabbing') {
        document.body.style.cursor = isSpacePressed ? 'grab' : 'default';
      } else if (isResizing) {
        document.body.style.cursor = 'default';
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement)?.closest('.canvas-viewport')) {
        e.preventDefault();
        const zoomSpeed = 0.1;
        const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
        const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
        onZoomChange?.(newZoom);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('wheel', handleWheel);
      document.body.style.cursor = 'default';
    };
  }, [isPanning, isResizing, resizeHandle, lastMousePos, zoom, isSpacePressed, canvasDimensions, onZoomChange, onCanvasDimensionsChange, showZoomMenu, canvas]);

  // Zoom controls
  const zoomIn = () => {
    const newZoom = Math.min(5, zoom + 0.25);
    onZoomChange?.(newZoom);
  };

  const zoomOut = () => {
    const newZoom = Math.max(0.1, zoom - 0.25);
    onZoomChange?.(newZoom);
  };

  const zoomToFit = () => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width - 100; // padding
    const containerHeight = containerRect.height - 100; // padding
    
    const scaleX = containerWidth / canvasDimensions.width;
    const scaleY = containerHeight / canvasDimensions.height;
    const newZoom = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
    
    onZoomChange?.(newZoom);
    // Center the artboard
    setViewportPosition({ x: 0, y: 0 });
  };

  const resetZoom = () => {
    onZoomChange?.(1);
    setViewportPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      className="canvas-viewport flex-1 bg-gray-100 relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle, #e5e5e5 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        backgroundPosition: `${viewportPosition.x % 20}px ${viewportPosition.y % 20}px`
      }}
    >
      {/* Artboard container */}
      <div 
        ref={artboardRef}
        className="artboard-container absolute"
        style={{
          transform: `translate(${viewportPosition.x}px, ${viewportPosition.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          left: '50%',
          top: '50%',
          marginLeft: `${-canvasDimensions.width / 2}px`,
          marginTop: `${-canvasDimensions.height / 2}px`
        }}
      >
        {/* Artboard shadow */}
        <div 
          className="artboard-shadow absolute bg-black opacity-20 rounded-lg"
          style={{
            width: `${canvasDimensions.width}px`,
            height: `${canvasDimensions.height}px`,
            transform: 'translate(4px, 4px)',
            zIndex: 1
          }}
        />
        
        {/* Main artboard */}
        <div 
          className="artboard bg-white relative rounded-lg overflow-hidden"
          style={{
            width: `${canvasDimensions.width}px`,
            height: `${canvasDimensions.height}px`,
            zIndex: 2,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            style={{
              display: 'block',
              width: '100%',
              height: '100%'
            }}
          />
          
          {/* Resize handles */}
          <div className="resize-handle resize-handle-n" data-handle="n" style={{
            position: 'absolute',
            top: '-4px',
            left: '50%',
            width: '8px',
            height: '8px',
            marginLeft: '-4px',
            backgroundColor: '#3b82f6',
            border: '1px solid white',
            borderRadius: '2px',
            cursor: 'n-resize',
            zIndex: 10
          }} />
          <div className="resize-handle resize-handle-s" data-handle="s" style={{
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            width: '8px',
            height: '8px',
            marginLeft: '-4px',
            backgroundColor: '#3b82f6',
            border: '1px solid white',
            borderRadius: '2px',
            cursor: 's-resize',
            zIndex: 10
          }} />
          <div className="resize-handle resize-handle-w" data-handle="w" style={{
            position: 'absolute',
            left: '-4px',
            top: '50%',
            width: '8px',
            height: '8px',
            marginTop: '-4px',
            backgroundColor: '#3b82f6',
            border: '1px solid white',
            borderRadius: '2px',
            cursor: 'w-resize',
            zIndex: 10
          }} />
          <div className="resize-handle resize-handle-e" data-handle="e" style={{
            position: 'absolute',
            right: '-4px',
            top: '50%',
            width: '8px',
            height: '8px',
            marginTop: '-4px',
            backgroundColor: '#3b82f6',
            border: '1px solid white',
            borderRadius: '2px',
            cursor: 'e-resize',
            zIndex: 10
          }} />
          <div className="resize-handle resize-handle-nw" data-handle="nw" style={{
            position: 'absolute',
            top: '-4px',
            left: '-4px',
            width: '8px',
            height: '8px',
            backgroundColor: '#3b82f6',
            border: '1px solid white',
            borderRadius: '2px',
            cursor: 'nw-resize',
            zIndex: 10
          }} />
          <div className="resize-handle resize-handle-ne" data-handle="ne" style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '8px',
            height: '8px',
            backgroundColor: '#3b82f6',
            border: '1px solid white',
            borderRadius: '2px',
            cursor: 'ne-resize',
            zIndex: 10
          }} />
          <div className="resize-handle resize-handle-sw" data-handle="sw" style={{
            position: 'absolute',
            bottom: '-4px',
            left: '-4px',
            width: '8px',
            height: '8px',
            backgroundColor: '#3b82f6',
            border: '1px solid white',
            borderRadius: '2px',
            cursor: 'sw-resize',
            zIndex: 10
          }} />
          <div className="resize-handle resize-handle-se" data-handle="se" style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            width: '8px',
            height: '8px',
            backgroundColor: '#3b82f6',
            border: '1px solid white',
            borderRadius: '2px',
            cursor: 'se-resize',
            zIndex: 10
          }} />
        </div>
      </div>

      {/* Zoom controls */}
      <div className="zoom-menu absolute top-4 right-4">
        {/* Zoom badge - always visible */}
        <div 
          onClick={() => setShowZoomMenu(!showZoomMenu)}
          className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          {Math.round(zoom * 100)}%
        </div>
        
        {/* Expandable menu - only visible when showZoomMenu is true */}
        {showZoomMenu && (
          <div 
            ref={zoomMenuRef}
            className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden min-w-32"
          >
            <div className="p-2 space-y-1">
              <button
                onClick={zoomIn}
                className="w-full px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
              >
                Zoom In (+)
              </button>
              <button
                onClick={zoomOut}
                className="w-full px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
              >
                Zoom Out (-)
              </button>
              <button
                onClick={zoomToFit}
                className="w-full px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
              >
                Fit to Screen
              </button>
              <button
                onClick={resetZoom}
                className="w-full px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
              >
                Reset (100%)
              </button>
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default CanvasWrapper;
