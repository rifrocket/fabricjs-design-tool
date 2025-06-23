import { FabricObject } from 'fabric';

// Helper functions for file downloads
export const downloadDataURL = (dataURL: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadText = (text: string, filename: string, mimeType: string): void => {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generate unique ID
export const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Get object bounds for alignment
export const getObjectsBounds = (objects: FabricObject[]) => {
  return {
    left: Math.min(...objects.map(obj => obj.left || 0)),
    top: Math.min(...objects.map(obj => obj.top || 0)),
    right: Math.max(...objects.map(obj => (obj.left || 0) + (obj.width || 0))),
    bottom: Math.max(...objects.map(obj => (obj.top || 0) + (obj.height || 0)))
  };
};

// Format object name based on type and index
export const formatObjectName = (type: string, index: number): string => {
  const typeNames: Record<string, string> = {
    text: 'Text',
    rect: 'Rectangle',
    circle: 'Circle',
    line: 'Line',
    image: 'Image',
    triangle: 'Triangle',
    pentagon: 'Pentagon',
    hexagon: 'Hexagon',
    star: 'Star',
    qrcode: 'QR Code',
    ellipse: 'Ellipse',
    arrow: 'Arrow',
    'rounded-rectangle': 'Rounded Rectangle',
    diamond: 'Diamond',
    heart: 'Heart',
    cloud: 'Cloud',
    lightning: 'Lightning',
    'speech-bubble': 'Speech Bubble',
    cross: 'Cross',
    parallelogram: 'Parallelogram',
    trapezoid: 'Trapezoid',
    octagon: 'Octagon',
  };
  
  return `${typeNames[type] || 'Object'} ${index + 1}`;
};
