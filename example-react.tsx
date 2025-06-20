// Example: Basic React hook usage
import React, { useEffect, useRef } from 'react';
import { Canvas } from 'fabric';
import { ShapeFactory } from 'fabricjs-design-tool';

export default function MyDesignApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Initialize canvas
      const canvas = new Canvas(canvasRef.current);
      
      // Add a sample rectangle
      const rect = ShapeFactory.createRectangle({
        left: 50,
        top: 50,
        fill: 'red',
        width: 100,
        height: 100
      });
      
      canvas.add(rect);
    }
  }, []);

  return (
    <div>
      <h1>My Design Tool</h1>
      <canvas 
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid #ccc' }}
      />
    </div>
  );
}
