import { useEffect, useRef } from 'react';
import { Canvas } from 'fabric';

export default function useCanvasPan(canvas: Canvas | null) {
  const modifierPressed = useRef(false);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvas) return;


    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key.toLowerCase() === 'h') {
        e.preventDefault();
        e.stopPropagation();
        modifierPressed.current = true;
        
        // Disable canvas selection and set cursor
        canvas.selection = false;
        canvas.hoverCursor = 'grab';
        canvas.defaultCursor = 'grab';
        
        canvas.requestRenderAll();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key.toLowerCase() === 'h') {
        e.preventDefault();
        e.stopPropagation();
        modifierPressed.current = false;
        
        // Re-enable canvas selection and restore cursor
        canvas.selection = true;
        canvas.hoverCursor = 'move';
        canvas.defaultCursor = 'default';
        
        canvas.requestRenderAll();
      }
    };

    const handleMouseDown = (e: any) => {
      if (modifierPressed.current) {
        e.e?.preventDefault();
        e.e?.stopPropagation();
        
        isDragging.current = true;
        canvas.selection = false;
        canvas.hoverCursor = 'grabbing';
        canvas.defaultCursor = 'grabbing';
        
        lastPos.current = { x: e.e.clientX, y: e.e.clientY };
        
        return false;
      }
    };

    const handleMouseMove = (e: any) => {
      if (isDragging.current && modifierPressed.current) {
        e.e?.preventDefault();
        e.e?.stopPropagation();
        
        const vpt = canvas.viewportTransform;
        if (vpt) {
          const deltaX = e.e.clientX - lastPos.current.x;
          const deltaY = e.e.clientY - lastPos.current.y;
          
          vpt[4] += deltaX;
          vpt[5] += deltaY;
          
          canvas.setViewportTransform(vpt);
          canvas.requestRenderAll();
          
          lastPos.current = { x: e.e.clientX, y: e.e.clientY };
        }
        return false;
      }
    };

    const handleMouseUp = (e: any) => {
      if (isDragging.current) {
        e.e?.preventDefault();
        e.e?.stopPropagation();
        
        isDragging.current = false;
        
        if (modifierPressed.current) {
          canvas.hoverCursor = 'grab';
          canvas.defaultCursor = 'grab';
        } else {
          canvas.selection = true;
          canvas.hoverCursor = 'move';
          canvas.defaultCursor = 'default';
        }
        
        canvas.requestRenderAll();
        return false;
      }
    };

    const handleMouseWheel = (e: any) => {
      e.e?.preventDefault();
      e.e?.stopPropagation();
      
      const delta = e.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      
      const pointer = canvas.getPointer(e.e);
      canvas.zoomToPoint(pointer, zoom);
      
      return false;
    };

    // Attach keyboard events to document
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    
    // Attach mouse events to canvas
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('mouse:wheel', handleMouseWheel);


    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('mouse:wheel', handleMouseWheel);
    };
  }, [canvas]);
}
