// Example: Basic usage with vanilla JavaScript
import { useCanvasManager, shapeFactory } from 'fabricjs-design-tool';

// Initialize canvas
const canvas = new fabric.Canvas('my-canvas');

// Create a rectangle
const rectangle = shapeFactory.createRectangle({
  left: 100,
  top: 100,
  fill: '#ff0000',
  width: 200,
  height: 150
});

// Add to canvas
canvas.add(rectangle);

// Export as image
const dataURL = canvas.toDataURL('image/png');
console.log('Exported image:', dataURL);
